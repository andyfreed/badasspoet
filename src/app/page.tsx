"use client";

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRef as useDomRef } from 'react';

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

  // Section refs for elevator navigation
  const sectionRefs = [useDomRef<HTMLDivElement>(null), useDomRef<HTMLDivElement>(null), useDomRef<HTMLDivElement>(null)];
  const [currentSection, setCurrentSection] = useState(0);

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

  // Scroll to section
  const scrollToSection = (idx: number) => {
    sectionRefs[idx].current?.scrollIntoView({ behavior: 'smooth' });
    setCurrentSection(idx);
  };

  // Listen for scroll to update display
  useEffect(() => {
    const onScroll = () => {
      const offsets = sectionRefs.map(ref => ref.current?.getBoundingClientRect().top ?? 0);
      const idx = offsets.findIndex(top => top > -window.innerHeight / 2);
      setCurrentSection(idx === -1 ? 2 : idx);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Elevator display labels
  const sectionLabels = ['L', 'B1', 'B2'];

  return (
    <div style={{
      height: '100vh',
      overflowY: 'scroll',
      scrollSnapType: 'y mandatory',
      scrollBehavior: 'smooth',
      position: 'relative',
    }}>
      {/* Elevator Controls */}
      <div style={{
        position: 'fixed',
        top: '50%',
        right: 32,
        transform: 'translateY(-50%)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        userSelect: 'none',
      }}>
        {/* Up Button */}
        <button
          onClick={() => scrollToSection(Math.max(0, currentSection - 1))}
          disabled={currentSection === 0}
          style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            background: currentSection === 0 ? '#222' : 'radial-gradient(circle, #e0e0e0 60%, #888 100%)',
            border: '3px solid #444',
            boxShadow: '0 2px 12px #0008, 0 0 0 4px #fff2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
            cursor: currentSection === 0 ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
          aria-label="Up"
        >
          <svg width="28" height="28" viewBox="0 0 24 24"><polygon points="12,5 19,17 5,17" fill="#a21caf" stroke="#fff" strokeWidth="2"/></svg>
        </button>
        {/* Digital Display */}
        <div style={{
          width: 54,
          height: 38,
          background: 'linear-gradient(180deg, #222 80%, #444 100%)',
          border: '2.5px solid #a21caf',
          borderRadius: 8,
          boxShadow: '0 2px 12px #0008, 0 0 0 4px #fff2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: digitalFont,
          fontSize: 28,
          color: '#e879f9',
          letterSpacing: 2,
          textShadow: '0 0 8px #e879f9, 0 0 16px #a21caf',
          marginBottom: 8,
        }}>
          {sectionLabels[currentSection]}
        </div>
        {/* Down Button */}
        <button
          onClick={() => scrollToSection(Math.min(2, currentSection + 1))}
          disabled={currentSection === 2}
          style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            background: currentSection === 2 ? '#222' : 'radial-gradient(circle, #e0e0e0 60%, #888 100%)',
            border: '3px solid #444',
            boxShadow: '0 2px 12px #0008, 0 0 0 4px #fff2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: currentSection === 2 ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
          aria-label="Down"
        >
          <svg width="28" height="28" viewBox="0 0 24 24"><polygon points="12,19 5,7 19,7" fill="#a21caf" stroke="#fff" strokeWidth="2"/></svg>
        </button>
      </div>
      {/* Section 1 - Original Background (clean, no overlay) */}
      <section ref={sectionRefs[0]} style={{
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
      <section ref={sectionRefs[1]} style={{
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
      <section ref={sectionRefs[2]} style={{
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
          {/* Progress Bar & Controls */}
          <div style={{ width: 420, marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Progress Bar */}
            <div
              style={{
                width: '100%',
                height: 36,
                background: 'rgba(30, 20, 40, 0.7)',
                borderRadius: 10,
                boxShadow: '0 4px 32px 0 #a21caf55, 0 1.5px 0 #fff2',
                position: 'relative',
                marginBottom: 8,
                overflow: 'visible',
                display: 'flex',
                alignItems: 'center',
                border: '1.5px solid #a21caf55',
                backdropFilter: 'blur(2px)',
                cursor: duration > 0 ? 'pointer' : 'default',
              }}
              onClick={duration > 0 ? handleSeek : undefined}
            >
              {/* Neon Bar */}
              <div
                style={{
                  position: 'absolute',
                  left: 48,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: duration > 0 ? `calc(${(currentTime / duration) * 100}% - 48px)` : 0,
                  height: 8,
                  background: 'linear-gradient(90deg, #e879f9 0%, #a21caf 100%)',
                  boxShadow: '0 0 12px 2px #e879f9, 0 0 32px 8px #a21caf55',
                  borderRadius: 4,
                  zIndex: 2,
                  transition: 'width 0.2s',
                }}
              />
              {/* Bar background */}
              <div
                style={{
                  position: 'absolute',
                  left: 48,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 'calc(100% - 120px)',
                  height: 8,
                  background: 'linear-gradient(90deg, #3b0764 0%, #27272a 100%)',
                  borderRadius: 4,
                  zIndex: 1,
                }}
              />
              {/* Knob */}
              {duration > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    left: `calc(48px + ${(currentTime / duration) * (420 - 120)}px - 14px)` ,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 28,
                    height: 28,
                    background: 'radial-gradient(circle, #e879f9 60%, #a21caf 100%)',
                    border: '3px solid #fff',
                    boxShadow: '0 0 16px 4px #e879f9, 0 0 32px 8px #a21caf55',
                    borderRadius: '50%',
                    zIndex: 3,
                    pointerEvents: 'none',
                  }}
                />
              )}
              {/* Play/Stop Button */}
              <button
                onClick={handlePlayPause}
                style={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'radial-gradient(circle, #e879f9 60%, #a21caf 100%)',
                  border: '2px solid #fff',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 12px 2px #e879f9, 0 0 32px 8px #a21caf55',
                  cursor: duration > 0 ? 'pointer' : 'not-allowed',
                  zIndex: 4,
                  transition: 'background 0.2s',
                  outline: 'none',
                }}
                disabled={duration === 0}
                aria-label={isPlaying ? 'Stop' : 'Play'}
              >
                {isPlaying ? (
                  // Stop icon
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="6" y="6" width="12" height="12" rx="3" fill="#fff"/></svg>
                ) : (
                  // Play icon
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polygon points="7,5 21,12 7,19" fill="#fff"/></svg>
                )}
              </button>
              {/* Time Display */}
              <span
                style={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#e879f9',
                  fontFamily: digitalFont,
                  fontSize: 28,
                  letterSpacing: 2,
                  textShadow: '0 0 8px #e879f9, 0 0 16px #a21caf',
                  zIndex: 5,
                  userSelect: 'none',
                }}
              >
                {formatTime(currentTime)}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
