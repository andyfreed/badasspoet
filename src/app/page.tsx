"use client";

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

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
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Lyrics for Big Big Mammals
  const bigBigMammalsLyrics = `You've got the rhino
And the ellyphant
You've got Mr. Hippo
He's fat and ellygant
You've got the dugong
And that manatee
Mighty gorilla
And Travis the chimpanzee
Although the last does not seem so great
But he ate a lady's face

Big, Big Mammals
These are some of my favorite animals
Big, Big Mammals
But not the biggest or my favorite animal
That would be the whale.

Big, big Mammals
Close to my favorite animals
Big, big mammals
But not my favorite animals
That would be the whale
The big big blue blue whale
Ba-ba-ba-ba-ba-ba baleen
Ba-ba-ba-ba-ba-ba baleen!`;

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
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onPause);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [audioUrl]);

  // Play the big-big-mammals audio file from Synology on click
  const playBigBigMammals = async () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setLoading(true);
    setError(null);
    const filePath = '/FREEDSHARED/dent-dump/big-big-mammals-v2.mp3';
    try {
      const response = await fetch('/api/synology/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath })
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setAudioUrl(url);
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play();
          }
        }, 100);
      } else {
        let errMsg = 'Failed to load audio.';
        try {
          const errJson = await response.json();
          errMsg = errJson.error || errMsg;
        } catch {}
        setError(errMsg);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

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

  // Play/pause toggle handler
  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  // Seek handler
  const handleSeek = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const seekTime = percent * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  // Format time helper
  const formatTime = (t: number) => {
    if (isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Add digital font fallback
  const digitalFont = `'Orbitron', 'Share Tech Mono', 'VT323', 'monospace'`;

  return (
    <div style={{
      height: '100vh',
      overflowY: 'scroll',
      scrollSnapType: 'y mandatory',
      scrollBehavior: 'smooth',
      position: 'relative',
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: loading ? 'not-allowed' : 'pointer',
              filter: loading ? 'grayscale(0.7)' : 'none',
              transition: 'filter 0.3s',
            }}
            onClick={() => { if (!loading) playBigBigMammals(); }}
          >
            <Image
              src="/big-big-mammals-tape.png"
              alt="Big Big Mammals Tape"
              width={340}
              height={340}
              style={{ borderRadius: 16, width: '100%', height: 'auto', maxWidth: 340 }}
              priority
            />
          </div>
          {loading && <div style={{ color: '#4ade80', fontWeight: 'bold', marginTop: 16 }}>Loading tape...</div>}
          {error && <div style={{ color: '#f87171', fontWeight: 'bold', marginTop: 16 }}>{error}</div>}
          <audio ref={audioRef} src={audioUrl || undefined} style={{ display: 'none' }} />
          {/* Minimal Retro Audio Player */}
          <div style={{ 
            width: 280, 
            marginTop: 32, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: '#1a1a1a',
            border: '2px solid #333',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.5), inset -2px -2px 5px rgba(255,255,255,0.1)'
          }}>
            {/* Track Title */}
            <div style={{
              color: '#00ff00',
              fontSize: '12px',
              fontFamily: 'monospace',
              marginBottom: '12px',
              textAlign: 'center',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              BIG BIG MAMMALS
            </div>

            {/* Simple Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '4px',
                background: '#333',
                border: '1px inset #666',
                marginBottom: '16px',
                cursor: duration > 0 ? 'pointer' : 'default',
                position: 'relative'
              }}
              onClick={duration > 0 ? handleSeek : undefined}
            >
              <div
                style={{
                  width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                  height: '100%',
                  background: '#00ff00',
                  transition: 'width 0.1s linear'
                }}
              />
            </div>

            {/* Simple Controls */}
            <div style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              fontFamily: 'monospace',
              color: '#999'
            }}>
              <span>{formatTime(currentTime)}</span>
              
              <button
                onClick={handlePlayPause}
                style={{
                  background: '#333',
                  border: '2px outset #666',
                  width: '40px',
                  height: '40px',
                  cursor: duration > 0 ? 'pointer' : 'not-allowed',
                  outline: 'none',
                  fontSize: '16px',
                  color: '#00ff00',
                  fontFamily: 'monospace',
                  opacity: duration > 0 ? 1 : 0.5,
                }}
                disabled={duration === 0}
                onMouseDown={(e) => {
                  if (duration > 0) e.currentTarget.style.border = '2px inset #666';
                }}
                onMouseUp={(e) => {
                  if (duration > 0) e.currentTarget.style.border = '2px outset #666';
                }}
                onMouseLeave={(e) => {
                  if (duration > 0) e.currentTarget.style.border = '2px outset #666';
                }}
              >
                {isPlaying ? '❚❚' : '▶'}
              </button>

              <span>{formatTime(duration)}</span>
            </div>

            {/* CSS Animations */}
            <style>{`
              @keyframes scrollLyrics {
                0% { transform: translateX(100vw); }
                100% { transform: translateX(-100%); }
              }
            `}</style>
          </div>

          {/* Scrolling Lyrics Display */}
          {isPlaying && audioUrl && (
            <div style={{
              position: 'fixed',
              bottom: '120px',
              left: '0',
              width: '100vw',
              height: '80px',
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderLeft: 'none',
              borderRight: 'none',
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
              zIndex: 1000,
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)'
            }}>
              <div style={{
                whiteSpace: 'nowrap',
                color: '#fff',
                fontSize: '24px',
                fontWeight: 'bold',
                fontFamily: 'Arial, sans-serif',
                animation: 'scrollLyrics 45s linear infinite',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                letterSpacing: '1px',
                background: 'linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #ff6b6b)',
                backgroundSize: '400% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))',
                animationName: 'scrollLyrics, gradientShift',
                animationDuration: '45s, 3s',
                animationTimingFunction: 'linear, ease-in-out',
                animationIterationCount: 'infinite, infinite'
              }}>
                🎵 {bigBigMammalsLyrics.replace(/\n/g, ' • ')} 🎵
              </div>
              <style>{`
                @keyframes gradientShift {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
              `}</style>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
