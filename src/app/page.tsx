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
  const [currentLyric, setCurrentLyric] = useState("");
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  // All lyrics for Big Big Mammals
  const allLyrics = [
    "You've got the rhino",
    "And the ellyphant", 
    "You've got Mr. Hippo",
    "He's fat and ellygant",
    "You've got the dugong",
    "And that manatee",
    "Mighty gorilla", 
    "And Travis the chimpanzee",
    "Although the last does not seem so great",
    "But he ate a lady's face",
    "Big, Big Mammals",
    "These are some of my favorite animals",
    "Big, Big Mammals", 
    "But not the biggest or my favorite animal",
    "That would be the whale.",
    "Big, big Mammals",
    "Close to my favorite animals",
    "Big, big mammals",
    "But not my favorite animals", 
    "That would be the whale",
    "The big big blue blue whale",
    "Ba-ba-ba-ba-ba-ba baleen",
    "Ba-ba-ba-ba-ba-ba baleen!"
  ];

  // AI-powered lyric sync using audio analysis
  const setupAudioAnalysis = () => {
    if (!audioRef.current || audioContext) return;
    
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 256;
    
    const source = ctx.createMediaElementSource(audioRef.current);
    source.connect(analyserNode);
    analyserNode.connect(ctx.destination);
    
    setAudioContext(ctx);
    setAnalyser(analyserNode);
    
    // Start analyzing audio for lyric timing
    analyzeAudioForLyrics(analyserNode);
  };

  // Insane AI audio analysis for lyric sync
  const analyzeAudioForLyrics = (analyserNode: AnalyserNode) => {
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let lyricIndex = 0;
    let lastBeatTime = 0;
    let energyThreshold = 0;
    let silenceCount = 0;
    
    const analyze = () => {
      if (!isPlaying) {
        requestAnimationFrame(analyze);
        return;
      }
      
      analyserNode.getByteFrequencyData(dataArray);
      
      // Calculate audio energy and spectral features
      const totalEnergy = dataArray.reduce((sum, val) => sum + val * val, 0);
      const avgEnergy = totalEnergy / bufferLength;
      const bassEnergy = dataArray.slice(0, 8).reduce((sum, val) => sum + val, 0) / 8;
      const midEnergy = dataArray.slice(8, 32).reduce((sum, val) => sum + val, 0) / 24;
      const highEnergy = dataArray.slice(32, 64).reduce((sum, val) => sum + val, 0) / 32;
      
      // Adaptive threshold based on song dynamics
      if (energyThreshold === 0) energyThreshold = avgEnergy * 1.5;
      energyThreshold = energyThreshold * 0.99 + avgEnergy * 0.01;
      
      // Detect vocal segments vs instrumental breaks
      const vocalLikelyhood = (midEnergy + highEnergy) / (bassEnergy + 1);
      const isVocalSegment = vocalLikelyhood > 1.2 && avgEnergy > energyThreshold * 0.7;
      
      // Beat detection using onset detection
      const currentTime = audioRef.current?.currentTime || 0;
      const timeSinceLastBeat = currentTime - lastBeatTime;
      const beatDetected = avgEnergy > energyThreshold * 1.3 && timeSinceLastBeat > 0.3;
      
      if (beatDetected) {
        lastBeatTime = currentTime;
      }
      
      // Silence detection for line breaks
      if (avgEnergy < energyThreshold * 0.3) {
        silenceCount++;
      } else {
        silenceCount = 0;
      }
      
      // Advanced lyric timing using multiple audio features
      const shouldAdvanceLyric = (
        (beatDetected && isVocalSegment && timeSinceLastBeat > 1.5) ||
        (silenceCount > 10 && lyricIndex < allLyrics.length - 1) ||
        (currentTime > 3 + lyricIndex * 3.2) // Fallback timing
      );
      
      if (shouldAdvanceLyric && lyricIndex < allLyrics.length) {
        setCurrentLyric(allLyrics[lyricIndex]);
        lyricIndex++;
      }
      
      // Clear lyric during instrumental breaks
      if (silenceCount > 20 || !isVocalSegment) {
        if (Math.random() < 0.1) { // Occasionally clear for natural feel
          setCurrentLyric("");
        }
      }
      
      requestAnimationFrame(analyze);
    };
    
    analyze();
  };

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
      setupAudioAnalysis();
    };
    const onPause = () => {
      setIsPlaying(false);
      setCurrentLyric("");
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentLyric("");
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

          {/* AI-Synced Lyrics Display */}
          {isPlaying && audioUrl && currentLyric && (
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
              justifyContent: 'center',
              zIndex: 1000,
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)'
            }}>
              <div style={{
                color: '#fff',
                fontSize: '28px',
                fontWeight: 'bold',
                fontFamily: 'Arial, sans-serif',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                letterSpacing: '1px',
                background: 'linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #ff6b6b)',
                backgroundSize: '400% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))',
                animation: 'gradientShift 3s ease-in-out infinite, fadeIn 0.5s ease-in',
                textAlign: 'center',
                maxWidth: '90vw',
                padding: '0 20px'
              }}>
                🎵 {currentLyric} 🎵
              </div>
              <style>{`
                @keyframes gradientShift {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
                @keyframes fadeIn {
                  0% { opacity: 0; transform: scale(0.9); }
                  100% { opacity: 1; transform: scale(1); }
                }
              `}</style>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
