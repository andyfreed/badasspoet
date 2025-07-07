import { NextResponse } from 'next/server';

export async function GET() {
  try {
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

    const loginText = await loginResponse.text();
    let loginData;
    try {
      loginData = JSON.parse(loginText);
    } catch (error) {
      console.error('Login response is not JSON:', loginText.substring(0, 200));
      return NextResponse.json({ error: 'Failed to authenticate with Synology - invalid response' }, { status: 500 });
    }
    
    if (!loginData.success) {
      return NextResponse.json({ error: 'Failed to authenticate with Synology' }, { status: 500 });
    }

    const sid = loginData.data.sid;

    // Step 2: List files
    const listResponse = await fetch(`${synologyUrl}/webapi/entry.cgi?` + new URLSearchParams({
      api: 'SYNO.FileStation.List',
      version: '2',
      method: 'list',
      folder_path: '/FREEDSHARED/dent-dump',
      additional: 'time,size',
      _sid: sid
    }));

    const listData = await listResponse.json();

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

    if (!listData.success) {
      // If folder doesn't exist, return empty array
      if (listData.error && listData.error.code === 408) {
        return NextResponse.json({ files: [] });
      }
      return NextResponse.json({ error: 'Failed to list files from Synology' }, { status: 500 });
    }

    // Filter only files (not folders) and format the response
    const files = listData.data.files
      .filter((entry: any) => !entry.isdir)
      .map((entry: any) => {
        console.log('Synology file entry:', JSON.stringify(entry, null, 2)); // DEBUG LOG
        return {
          id: entry.name,
          name: entry.name,
          size: entry.additional?.size || entry.size || 0,
          path: entry.path,
          uploadDate: entry.additional?.time?.mtime 
            ? new Date(entry.additional.time.mtime * 1000).toISOString()
            : entry.time?.mtime
            ? new Date(entry.time.mtime * 1000).toISOString()
            : new Date().toISOString()
        };
      });

    return NextResponse.json({ files });

  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
} 