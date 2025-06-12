"use client";

import { useState, useEffect } from 'react';

interface UnlockedContent {
  type: 'poem' | 'audio';
  title: string;
  content?: string;
  audioUrl?: string;
  author: string;
}

const GAME_WORDS = [
  { word: 'POETRY', clue: 'Art of rhythmic writing' },
  { word: 'VERSE', clue: 'A line of poetry' },
  { word: 'RHYME', clue: 'Words that sound alike' },
  { word: 'METAPHOR', clue: 'Comparison without like/as' },
  { word: 'STANZA', clue: 'Group of lines in a poem' }
];

const UNLOCKABLE_CONTENT: UnlockedContent[] = [
  {
    type: 'poem',
    title: 'Digital Dreams',
    content: `In pixels and code we find our way,
Through screens that glow both night and day.
The cursor blinks, a heartbeat's pace,
In this electric, endless space.

Words flow like rivers through the wire,
Connecting souls, lifting us higher.
In binary beats and silicon dreams,
Nothing is quite what it seems.`,
    author: 'BadAssPoet'
  },
  {
    type: 'poem',
    title: 'Coffee Shop Confessions',
    content: `Steam rises from my morning cup,
Like secrets I've been keeping up.
The barista knows my usual order,
But not the chaos at my border.

Between the foam and bitter brew,
I write the words I wish were true.
In caffeine dreams and paper trails,
Every story someone tells.`,
    author: 'BadAssPoet'
  },
  {
    type: 'audio',
    title: 'Midnight Musings',
    audioUrl: '/audio/midnight-musings.mp3',
    author: 'BadAssPoet'
  }
];

export default function PoetryGame() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [unlockedContent, setUnlockedContent] = useState<UnlockedContent | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  const currentWord = GAME_WORDS[currentWordIndex];
  const wordLetters = currentWord.word.split('');
  const isWordComplete = wordLetters.every(letter => guessedLetters.includes(letter));

  useEffect(() => {
    if (isWordComplete && !gameWon) {
      if (currentWordIndex < GAME_WORDS.length - 1) {
        setTimeout(() => {
          setCurrentWordIndex(prev => prev + 1);
          setGuessedLetters([]);
        }, 1500);
      } else {
        setGameWon(true);
        setTimeout(() => {
          const randomContent = UNLOCKABLE_CONTENT[Math.floor(Math.random() * UNLOCKABLE_CONTENT.length)];
          setUnlockedContent(randomContent);
          setShowUnlock(true);
        }, 2000);
      }
    }
  }, [isWordComplete, currentWordIndex, gameWon]);

  const handleLetterGuess = (letter: string) => {
    if (!guessedLetters.includes(letter)) {
      setGuessedLetters(prev => [...prev, letter]);
    }
  };

  const resetGame = () => {
    setCurrentWordIndex(0);
    setGuessedLetters([]);
    setGameWon(false);
    setShowUnlock(false);
    setUnlockedContent(null);
    setGameStarted(false);
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  if (!gameStarted) {
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        padding: '3rem',
        textAlign: 'center',
        maxWidth: '400px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)'
      }}>
        <h2 style={{
          color: '#fff',
          fontSize: '2rem',
          marginBottom: '1rem',
          fontFamily: 'Georgia, serif'
        }}>
          🎯 Poetry Puzzle
        </h2>
        <p style={{
          color: 'rgba(255, 255, 255, 0.8)',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          Solve word puzzles to unlock exclusive poems and audio content!
        </p>
        <button
          onClick={() => setGameStarted(true)}
          style={{
            background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
            border: 'none',
            borderRadius: '25px',
            padding: '15px 30px',
            color: 'white',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Start Game
        </button>
      </div>
    );
  }

  if (showUnlock && unlockedContent) {
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(20px)',
        border: '2px solid gold',
        borderRadius: '20px',
        padding: '3rem',
        textAlign: 'center',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(255, 215, 0, 0.3)',
        animation: 'unlock 0.8s ease-out'
      }}>
        <style jsx>{`
          @keyframes unlock {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          }
        `}</style>
        
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem'
        }}>
          🏆✨
        </div>
        
        <h2 style={{
          color: 'gold',
          fontSize: '2rem',
          marginBottom: '1rem',
          fontFamily: 'Georgia, serif'
        }}>
          Content Unlocked!
        </h2>
        
        <h3 style={{
          color: '#fff',
          fontSize: '1.5rem',
          marginBottom: '1rem'
        }}>
          {unlockedContent.title}
        </h3>
        
        {unlockedContent.type === 'poem' && unlockedContent.content && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            padding: '2rem',
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <pre style={{
              color: '#f0f0f0',
              fontSize: '1.1rem',
              lineHeight: '1.8',
              fontFamily: 'Georgia, serif',
              whiteSpace: 'pre-wrap',
              margin: 0
            }}>
              {unlockedContent.content}
            </pre>
            <div style={{
              textAlign: 'right',
              marginTop: '1rem',
              color: 'rgba(255, 255, 255, 0.6)',
              fontStyle: 'italic'
            }}>
              — {unlockedContent.author}
            </div>
          </div>
        )}
        
        {unlockedContent.type === 'audio' && unlockedContent.audioUrl && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <audio controls style={{ width: '100%', marginBottom: '1rem' }}>
              <source src={unlockedContent.audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Audio recording by {unlockedContent.author}
            </p>
          </div>
        )}
        
        <button
          onClick={resetGame}
          style={{
            background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
            border: 'none',
            borderRadius: '25px',
            padding: '15px 30px',
            color: 'white',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '20px',
      padding: '3rem',
      textAlign: 'center',
      maxWidth: '500px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)'
    }}>
      <div style={{
        color: '#fff',
        marginBottom: '2rem'
      }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          Word {currentWordIndex + 1} of {GAME_WORDS.length}
        </h3>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          {currentWord.clue}
        </p>
      </div>

      {/* Word Display */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        {wordLetters.map((letter, index) => (
          <div
            key={index}
            style={{
              width: '40px',
              height: '40px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#fff',
              background: guessedLetters.includes(letter) 
                ? 'rgba(76, 175, 80, 0.3)' 
                : 'rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease'
            }}
          >
            {guessedLetters.includes(letter) ? letter : ''}
          </div>
        ))}
      </div>

      {/* Alphabet */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '8px',
        marginBottom: '2rem'
      }}>
        {alphabet.map(letter => (
          <button
            key={letter}
            onClick={() => handleLetterGuess(letter)}
            disabled={guessedLetters.includes(letter)}
            style={{
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              background: guessedLetters.includes(letter)
                ? (currentWord.word.includes(letter) 
                  ? 'rgba(76, 175, 80, 0.5)' 
                  : 'rgba(244, 67, 54, 0.5)')
                : 'rgba(255, 255, 255, 0.2)',
              color: '#fff',
              cursor: guessedLetters.includes(letter) ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              transition: 'all 0.2s ease',
              opacity: guessedLetters.includes(letter) ? 0.5 : 1
            }}
          >
            {letter}
          </button>
        ))}
      </div>

      {isWordComplete && (
        <div style={{
          color: '#4caf50',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          ✅ Word Complete!
          {currentWordIndex < GAME_WORDS.length - 1 ? ' Next word loading...' : ' 🎉 Game Complete!'}
        </div>
      )}

      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        padding: '1rem',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '0.9rem'
      }}>
        Progress: {currentWordIndex + (isWordComplete ? 1 : 0)} / {GAME_WORDS.length} words
      </div>
    </div>
  );
} 