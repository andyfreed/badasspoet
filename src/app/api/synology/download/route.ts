import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();
    
    if (!path) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
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

    // Step 2: Download the file directly and stream it
    const downloadResponse = await fetch(`${synologyUrl}/webapi/entry.cgi?` + new URLSearchParams({
      api: 'SYNO.FileStation.Download',
      version: '2',
      method: 'download',
      path: path,
      mode: 'download',
      _sid: sid
    }));

    if (!downloadResponse.ok) {
      return NextResponse.json({ error: 'Failed to download file from Synology' }, { status: 500 });
    }

    // Get the filename from the path
    const filename = path.split('/').pop() || 'download';
    
    // Stream the file back to the client
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Content-Type', downloadResponse.headers.get('Content-Type') || 'application/octet-stream');
    
    return new NextResponse(downloadResponse.body, {
      status: 200,
      headers: headers
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Failed to get download link' }, { status: 500 });
  }
} 