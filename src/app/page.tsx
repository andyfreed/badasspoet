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

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const onPlay = () => {
      setIsPlaying(true);
      console.log('🎵 Audio started playing');
    };
    const onPause = () => {
      setIsPlaying(false);
      console.log('🎵 Audio paused');
    };
    const onEnded = () => {
      setIsPlaying(false);
      console.log('🎵 Audio ended');
    };
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [audioUrl]);

  // Simple tape play/stop toggle
  const toggleTape = async () => {
    const audio = audioRef.current;
    
    // If already playing, just stop
    if (isPlaying && audio) {
      audio.pause();
      return;
    }
    
    // If paused but audio loaded, resume
    if (audio && audioUrl && !isPlaying) {
      audio.play();
      return;
    }
    
    // Load and play for first time
    if (!audioUrl && !loading) {
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
          setError('Failed to load audio.');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      }
      setLoading(false);
    }
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

      {/* Section 3 - Photographology with background lyrics */}
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
        {/* All lyrics burned into background like old wood */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '90%',
          height: '80%',
          zIndex: 1,
          pointerEvents: 'none',
          overflow: 'hidden'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'normal',
            color: 'rgba(139, 69, 19, 0.15)', // Dark brown like burned wood
            fontFamily: 'Courier New, monospace',
            lineHeight: '1.6',
            letterSpacing: '1px',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3), inset 1px 1px 1px rgba(0, 0, 0, 0.2)',
            userSelect: 'none',
            transform: 'rotate(-2deg)',
            whiteSpace: 'pre-line',
            filter: 'contrast(1.2) brightness(0.8)'
          }}>
            {`You've got the rhino
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
Ba-ba-ba-ba-ba-ba baleen!`}
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 10
        }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: loading ? 'not-allowed' : 'pointer',
              filter: loading ? 'grayscale(0.7)' : isPlaying ? 'brightness(1.2)' : 'none',
              transition: 'all 0.3s',
              transform: isPlaying ? 'scale(1.05)' : 'scale(1)',
            }}
            onClick={() => { if (!loading) toggleTape(); }}
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
          
          {/* Simple status indicator */}
          {isPlaying && (
            <div style={{
              marginTop: 20,
              color: '#00ff00',
              fontFamily: 'monospace',
              fontSize: '14px',
              animation: 'blink 1s infinite'
            }}>
              ● PLAYING
            </div>
          )}
          
          <style>{`
            @keyframes blink {
              0%, 50% { opacity: 1; }
              51%, 100% { opacity: 0.3; }
            }
          `}</style>

        </div>
      </section>
    </div>
  );
}
