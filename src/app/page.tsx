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
          {/* Modern Audio Player */}
          <div style={{ 
            width: 450, 
            marginTop: 32, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '24px 32px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            {/* Track Title */}
            <div style={{
              color: '#fff',
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '20px',
              textAlign: 'center',
              letterSpacing: '0.5px',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
            }}>
              Big Big Mammals
            </div>

            {/* Progress Bar Container */}
            <div
              style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50px',
                position: 'relative',
                marginBottom: '20px',
                cursor: duration > 0 ? 'pointer' : 'default',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                overflow: 'hidden'
              }}
              onClick={duration > 0 ? handleSeek : undefined}
            >
              {/* Progress Fill with Gradient */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3)',
                  borderRadius: '50px',
                  transition: 'width 0.3s ease',
                  boxShadow: '0 0 20px rgba(255, 107, 107, 0.5)',
                }}
              />
              
              {/* Animated Progress Glow */}
              {isPlaying && (
                <div
                  style={{
                    position: 'absolute',
                    left: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                    top: '-2px',
                    width: '12px',
                    height: '12px',
                    background: 'radial-gradient(circle, #fff 0%, #ff6b6b 100%)',
                    borderRadius: '50%',
                    transform: 'translateX(-50%)',
                    boxShadow: '0 0 15px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 107, 107, 0.6)',
                    animation: 'pulse 2s infinite',
                  }}
                />
              )}
            </div>

            {/* Controls Row */}
            <div style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              {/* Time Display Left */}
              <span style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontFamily: digitalFont,
                fontSize: '14px',
                letterSpacing: '1px',
                minWidth: '45px'
              }}>
                {formatTime(currentTime)}
              </span>

              {/* Play/Pause Button */}
              <button
                onClick={handlePlayPause}
                style={{
                  background: isPlaying 
                    ? 'linear-gradient(145deg, #ff6b6b, #ff5252)' 
                    : 'linear-gradient(145deg, #48dbfb, #0abde3)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '56px',
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: duration > 0 ? 'pointer' : 'not-allowed',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: isPlaying 
                    ? '0 8px 25px rgba(255, 107, 107, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                    : '0 8px 25px rgba(72, 219, 251, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  opacity: duration > 0 ? 1 : 0.5,
                  transform: 'scale(1)',
                }}
                disabled={duration === 0}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.95)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {isPlaying ? (
                  // Pause icon
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="7" y="5" width="3" height="14" rx="1" fill="#fff"/>
                    <rect x="14" y="5" width="3" height="14" rx="1" fill="#fff"/>
                  </svg>
                ) : (
                  // Play icon
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginLeft: '2px' }}>
                    <polygon points="8,5 19,12 8,19" fill="#fff"/>
                  </svg>
                )}
              </button>

              {/* Duration Display Right */}
              <span style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontFamily: digitalFont,
                fontSize: '14px',
                letterSpacing: '1px',
                minWidth: '45px',
                textAlign: 'right'
              }}>
                {formatTime(duration)}
              </span>
            </div>

            {/* Visualizer Bars (decorative) */}
            {isPlaying && (
              <div style={{
                width: '100%',
                height: '30px',
                display: 'flex',
                alignItems: 'end',
                justifyContent: 'center',
                gap: '2px',
                marginTop: '16px',
                opacity: 0.6
              }}>
                {Array.from({ length: 20 }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '3px',
                      height: `${Math.random() * 20 + 5}px`,
                      background: `hsl(${(i * 18) % 360}, 70%, 60%)`,
                      borderRadius: '2px',
                      animation: `visualizer 0.${Math.floor(Math.random() * 5) + 5}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            )}

            {/* CSS Animations */}
            <style>{`
              @keyframes pulse {
                0%, 100% { transform: translateX(-50%) scale(1); opacity: 1; }
                50% { transform: translateX(-50%) scale(1.2); opacity: 0.8; }
              }
              @keyframes visualizer {
                from { height: 5px; }
                to { height: ${Math.random() * 25 + 10}px; }
              }
            `}</style>
          </div>
        </div>
      </section>
    </div>
  );
}
