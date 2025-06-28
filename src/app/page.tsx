"use client";

import { useEffect, useState, useRef } from 'react';

export default function Home() {
  // Audio player state for photographology section
  interface AudioFile {
    id: string;
    name: string;
    path: string;
  }
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

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

  // Fetch audio when selection changes
  useEffect(() => {
    if (!selectedId) {
      setAudioUrl(null);
      return;
    }
    const file = audioFiles.find(f => f.id === selectedId);
    if (!file) return;
    setLoading(true);
    fetch('/api/synology/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: file.path })
    })
      .then(res => res.blob())
      .then(blob => {
        setAudioUrl(window.URL.createObjectURL(blob));
        setLoading(false);
      });
  }, [selectedId]);

  // Reel animation control
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onPause);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onPause);
    };
  }, [audioUrl]);

  // Reel SVG
  const Reel = ({ spinning }: { spinning: boolean }) => (
    <svg width="60" height="60" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r="28" fill="#bbb" stroke="#888" strokeWidth="2" />
      <circle cx="30" cy="30" r="10" fill="#eee" stroke="#888" strokeWidth="2" />
      <g style={{ transformOrigin: '30px 30px', animation: spinning ? 'spin 1s linear infinite' : undefined }}>
        <rect x="28" y="2" width="4" height="15" fill="#888" />
        <rect x="28" y="43" width="4" height="15" fill="#888" />
        <rect x="43" y="28" width="15" height="4" fill="#888" />
        <rect x="2" y="28" width="15" height="4" fill="#888" />
      </g>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </svg>
  );

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
          background: 'rgba(0,0,0,0.7)',
          borderRadius: '20px',
          padding: '2.5rem 2rem',
          maxWidth: '480px',
          width: '100%',
          color: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Reel-to-Reel Audio</h2>
          {audioFiles.length === 0 && <div style={{ color: 'rgba(255,255,255,0.7)' }}>No audio files found in Synology.</div>}
          {audioFiles.length > 0 && (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="audio-select" style={{ fontWeight: 'bold', marginRight: 8 }}>Select Tape:</label>
                <select
                  id="audio-select"
                  value={selectedId || ''}
                  onChange={e => setSelectedId(e.target.value)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #888',
                    fontSize: '1rem',
                    background: '#222',
                    color: 'white',
                    outline: 'none',
                    marginLeft: 4
                  }}
                >
                  <option value="" disabled>Select a file...</option>
                  {audioFiles.map(file => (
                    <option key={file.id} value={file.id}>{file.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 24 }}>
                <Reel spinning={!!audioUrl && isPlaying} />
                <div style={{ width: 60, height: 8, background: '#888', borderRadius: 4, margin: '0 8px' }} />
                <Reel spinning={!!audioUrl && isPlaying} />
              </div>
              <div style={{ marginBottom: 16 }}>
                {!loading && audioUrl && (
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    controls
                    style={{ width: '100%', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  />
                )}
              </div>
              {loading && <div style={{ color: '#4ade80', fontWeight: 'bold' }}>Loading tape...</div>}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
