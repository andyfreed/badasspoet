"use client";

import { useEffect, useState } from 'react';

export default function Home() {
  // Audio player state for photographology section
  interface AudioFile {
    id: string;
    name: string;
    path: string;
  }
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [audioUrls, setAudioUrls] = useState<{ [id: string]: string }>({});
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);

  // Helper to check if a file is audio
  const isAudioFile = (name: string) => /\.(mp3|wav|ogg)$/i.test(name);

  useEffect(() => {
    // Only fetch on mount
    fetch('/api/synology/list')
      .then(res => res.json())
      .then(data => {
        if (data.files) {
          setAudioFiles(data.files.filter((f: any) => isAudioFile(f.name)));
        }
      });
  }, []);

  const fetchAudioUrl = async (file: AudioFile) => {
    setLoadingAudioId(file.id);
    try {
      const response = await fetch('/api/synology/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: file.path })
      });
      if (response.ok) {
        // For Synology, we expect a blob, so create an object URL
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setAudioUrls((prev) => ({ ...prev, [file.id]: url }));
      }
    } finally {
      setLoadingAudioId(null);
    }
  };

  return (
    <div style={{
      height: '100vh',
      overflowY: 'scroll',
      scrollSnapType: 'y mandatory',
      scrollBehavior: 'smooth'
    }}>
      {/* Section 1 - Original Background (clean, no overlay) */}
      <section style={{
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        scrollSnapAlign: 'start',
        position: 'relative',
        overflow: 'hidden'
      }}>
      </section>

      {/* Section 2 - French Connection with Poem */}
      <section style={{
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        backgroundImage: 'url(/french-connection.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        scrollSnapAlign: 'start',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Poem Overlay */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '3rem',
          maxWidth: '500px',
          textAlign: 'left',
          fontFamily: 'Georgia, serif',
          lineHeight: '1.8',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
        }}>
          <h2 style={{
            color: '#fff',
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '2rem',
            textAlign: 'center',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            paddingBottom: '1rem'
          }}>
            Eating Asshole
          </h2>
          
          <div style={{
            color: '#f0f0f0',
            fontSize: '1.1rem',
            whiteSpace: 'pre-line',
            fontStyle: 'italic'
          }}>
            {`In real life
Girls never bend over
With a clean asshole
And let you
Fuck it with
Her best friend's tongue

Instead
They always have to pee
While you're watching
The French Connection.

And it spoils the flow
Of that awesome car chase,

Later,
You have a nightmare
About snakes.`}
          </div>
          
          <div style={{
            marginTop: '2rem',
            textAlign: 'right',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.9rem',
            fontStyle: 'normal'
          }}>
            — BadAssPoet
          </div>
        </div>
      </section>

      {/* Section 3 - Photographology (clean, no game) */}
      <section style={{
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        backgroundImage: 'url(/photographology.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        scrollSnapAlign: 'start',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.5)',
          borderRadius: '20px',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%',
          color: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Audio Files</h2>
          {audioFiles.length === 0 && <div style={{ color: 'rgba(255,255,255,0.7)' }}>No audio files found in Synology.</div>}
          {audioFiles.map(file => (
            <div key={file.id} style={{ marginBottom: '2rem' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{file.name}</div>
              {audioUrls[file.id] ? (
                <audio controls src={audioUrls[file.id]} style={{ width: '100%' }} />
              ) : (
                <button
                  onClick={() => fetchAudioUrl(file)}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.5rem 1.5rem',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    marginTop: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                  disabled={loadingAudioId === file.id}
                >
                  {loadingAudioId === file.id ? 'Loading...' : 'Play'}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
