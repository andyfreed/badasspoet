import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const synologyUrl = process.env.SYNOLOGY_URL || 'http://10.0.0.217:5000';
    const synologyUser = process.env.SYNOLOGY_USER;
    const synologyPass = process.env.SYNOLOGY_PASS;

    if (!synologyUser || !synologyPass) {
      return NextResponse.json({ error: 'Synology credentials not configured' }, { status: 500 });
    }

    // Step 1: Login to get session ID
    const loginResponse = await fetch(`${synologyUrl}/webapi/auth.cgi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        api: 'SYNO.API.Auth',
        version: '3',
        method: 'login',
        account: synologyUser,
        passwd: synologyPass,
        session: 'FileStation',
        format: 'sid'
      })
    });

    const loginData = await loginResponse.json();
    if (!loginData.success) {
      return NextResponse.json({ error: 'Failed to authenticate with Synology' }, { status: 500 });
    }

    const sid = loginData.data.sid;

    // Step 2: Upload file
    const uploadFormData = new FormData();
    uploadFormData.append('api', 'SYNO.FileStation.Upload');
    uploadFormData.append('version', '2');
    uploadFormData.append('method', 'upload');
    uploadFormData.append('path', '/FREEDSHARED/dent-dump');
    uploadFormData.append('create_parents', 'true');
    uploadFormData.append('overwrite', 'true');
    uploadFormData.append('_sid', sid);
    uploadFormData.append('file', file);

    const uploadResponse = await fetch(`${synologyUrl}/webapi/entry.cgi`, {
      method: 'POST',
      body: uploadFormData
    });

    const uploadData = await uploadResponse.json();

    // Step 3: Logout
    await fetch(`${synologyUrl}/webapi/auth.cgi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        api: 'SYNO.API.Auth',
        version: '3',
        method: 'logout',
        session: 'FileStation',
        _sid: sid
      })
    });

    if (!uploadData.success) {
      return NextResponse.json({ error: 'Failed to upload to Synology' }, { status: 500 });
    }

    return NextResponse.json({
      id: file.name,
      name: file.name,
      size: file.size,
      path: `/FREEDSHARED/dent-dump/${file.name}`,
      uploadDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
} 