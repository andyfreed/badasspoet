import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const accessToken = process.env.DROPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: 'Dropbox access token not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: '',
        recursive: false
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Dropbox list error:', error);
      return NextResponse.json({ error: 'Failed to list files from Dropbox' }, { status: 500 });
    }

    const result = await response.json();
    
    // Filter only files (not folders) and format the response
    const files = result.entries
      .filter((entry: any) => entry['.tag'] === 'file')
      .map((entry: any) => ({
        id: entry.id,
        name: entry.name,
        size: entry.size,
        path: entry.path_lower,
        uploadDate: entry.server_modified || entry.client_modified
      }));

    return NextResponse.json({ files });

  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
} 