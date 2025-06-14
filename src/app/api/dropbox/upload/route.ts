import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const accessToken = process.env.DROPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: 'Dropbox access token not configured' }, { status: 500 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Upload to Dropbox
    const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({
          path: `/${file.name}`,
          mode: 'add',
          autorename: true
        })
      },
      body: buffer
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Dropbox upload error:', error);
      return NextResponse.json({ error: 'Failed to upload to Dropbox' }, { status: 500 });
    }

    const result = await response.json();
    
    return NextResponse.json({
      id: result.id,
      name: result.name,
      size: result.size,
      path: result.path_lower,
      uploadDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
} 