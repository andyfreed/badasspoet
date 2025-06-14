import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();
    
    if (!path) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }

    const accessToken = process.env.DROPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: 'Dropbox access token not configured' }, { status: 500 });
    }

    // Get temporary download link
    const response = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: path
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Dropbox download error:', error);
      return NextResponse.json({ error: 'Failed to get download link from Dropbox' }, { status: 500 });
    }

    const result = await response.json();
    
    return NextResponse.json({
      downloadUrl: result.link
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Failed to get download link' }, { status: 500 });
  }
} 