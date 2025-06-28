import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
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

    // Step 2: Delete file
    const deleteResponse = await fetch(`${synologyUrl}/webapi/entry.cgi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        api: 'SYNO.FileStation.Delete',
        version: '2',
        method: 'delete',
        path: path,
        recursive: 'false',
        _sid: sid
      })
    });

    const deleteData = await deleteResponse.json();

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

    if (!deleteData.success) {
      return NextResponse.json({ error: 'Failed to delete file from Synology' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
} 