import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Volume2, VolumeX, Trophy, Star, 
  Zap, Heart, Check, X, ArrowRight, RotateCcw,
  Lightbulb, PartyPopper, Target, ArrowLeft
} from 'lucide-react';
import './LessonPlayer.css';

const LessonPlayer = ({ lessonId, studentId, onComplete, onBack }) => {
  const [sessionId, setSessionId] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [finished, setFinished] = useState(false);
  const [totalSteps, setTotalSteps] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const inputRef = useRef(null);
  const speechSynthRef = useRef(window.speechSynthesis);

  // Sonidos (usando Web Audio API y síntesis)
  const playSound = (type) => {
    if (!soundEnabled) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch(type) {
      case 'correct':
        oscillator.frequency.value = 523.25; // C5
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        
        // Segundo tono
        setTimeout(() => {
          const osc2 = audioContext.createOscillator();
          const gain2 = audioContext.createGain();
          osc2.connect(gain2);
          gain2.connect(audioContext.destination);
          osc2.frequency.value = 659.25; // E5
          osc2.type = 'sine';
          gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          osc2.start();
          osc2.stop(audioContext.currentTime + 0.3);
        }, 100);
        break;

      case 'wrong':
        oscillator.frequency.value = 200;
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;

      case 'complete':
        // Melodía de victoria
        const notes = [523.25, 587.33, 659.25, 783.99]; // C, D, E, G
        notes.forEach((freq, i) => {
          setTimeout(() => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.value = freq;
            osc.type = 'square';
            gain.gain.setValueAtTime(0.2, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            osc.start();
            osc.stop(audioContext.currentTime + 0.2);
          }, i * 150);
        });
        break;

      case 'hint':
        oscillator.frequency.value = 440; // A4
        oscillator.type = 'triangle';
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
        break;
    }
  };

  // Narración por voz
  const speak = (text, priority = false) => {
    if (!soundEnabled) return;

    if (priority) {
      speechSynthRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    speechSynthRef.current.speak(utterance);
  };

  // Iniciar sesión
  useEffect(() => {
    startSession();
    return () => {
      speechSynthRef.current.cancel();
    };
  }, []);

  const startSession = async () => {
    try {
      setLoading(true);
      
      // Crear sesión
      const sessionResponse = await fetch('http://localhost:5003/api/student/start-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentId,
          lesson_id: lessonId
        })
      });
      const sessionData = await sessionResponse.json();
      
      if (sessionData.session_id) {
        setSessionId(sessionData.session_id);
        loadPrompt(sessionData.session_id);
      }
    } catch (error) {
      console.error('Error starting session:', error);
      speak('Error al iniciar la lección. Por favor, intenta de nuevo.', true);
    }
  };

  const loadPrompt = async (sid) => {
    try {
      const response = await fetch(`http://localhost:5003/api/session_prompt/${sid || sessionId}`);
      const data = await response.json();

      if (data.finished) {
        setFinished(true);
        setScore(data.score || 0);
        playSound('complete');
        speak(`¡Felicidades! Has completado la lección con ${data.score || 0} puntos. ¡Excelente trabajo!`, true);
        setTimeout(() => {
          if (onComplete) onComplete(data.score);
        }, 3000);
      } else {
        setCurrentPrompt(data);
        setCurrentStep(data.step_index);
        setTotalSteps(data.total_steps || 10);
        setScore(data.score || 0);
        setLives(data.max_attempts - data.attempts);
        setAnswer('');
        setFeedback(null);
        setShowHint(false);
        setLoading(false);
        
        // Narrar la pregunta
        speak(`Paso ${data.step_index + 1}. ${data.prompt}`, true);
        
        // Focus en el input
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error loading prompt:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!answer.trim() || isAnimating) return;

    setIsAnimating(true);

    try {
      const response = await fetch(`http://localhost:5003/api/submit/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: answer.trim() })
      });

      const result = await response.json();

      if (result.correct) {
        // ¡CORRECTO!
        setFeedback('correct');
        setStreak(streak + 1);
        playSound('correct');
        
        const encouragements = [
          '¡Excelente!',
          '¡Muy bien!',
          '¡Perfecto!',
          '¡Increíble!',
          '¡Fantástico!',
          '¡Lo lograste!'
        ];
        speak(encouragements[Math.floor(Math.random() * encouragements.length)], true);

        setTimeout(() => {
          setFeedback(null);
          setIsAnimating(false);
          if (result.finished) {
            setFinished(true);
            playSound('complete');
            speak('¡Felicidades! Has completado toda la lección. ¡Eres increíble!', true);
          } else {
            loadPrompt(sessionId);
          }
        }, 1500);

      } else {
        // INCORRECTO
        setFeedback('wrong');
        setLives(lives - 1);
        playSound('wrong');

        if (lives - 1 <= 0 || result.attempts >= currentPrompt.max_attempts) {
          speak(`Incorrecto. ${result.hint || 'Intenta de nuevo'}`, true);
          setShowHint(true);
          playSound('hint');
          
          setTimeout(() => {
            setFeedback(null);
            setIsAnimating(false);
            loadPrompt(sessionId);
          }, 3000);
        } else {
          const attempts_left = currentPrompt.max_attempts - result.attempts;
          speak(`No es correcto. Te quedan ${attempts_left} ${attempts_left === 1 ? 'intento' : 'intentos'}`, true);
          
          setTimeout(() => {
            setFeedback(null);
            setIsAnimating(false);
            setAnswer('');
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }, 1500);
        }

        setStreak(0);
      }

    } catch (error) {
      console.error('Error submitting answer:', error);
      setIsAnimating(false);
    }
  };

  const handleSkip = async () => {
    if (!confirm('¿Estás seguro de saltar este paso?')) return;

    try {
      await fetch(`http://localhost:5003/api/skip/${sessionId}`, {
        method: 'POST'
      });
      
      speak('Paso saltado. Continuemos con el siguiente.', true);
      loadPrompt(sessionId);
    } catch (error) {
      console.error('Error skipping:', error);
    }
  };

  const handleHintRequest = () => {
    if (currentPrompt?.hint) {
      setShowHint(true);
      playSound('hint');
      speak(currentPrompt.hint, true);
    }
  };

  if (loading) {
    return (
      <div className="lesson-player">
        <div className="loading-container">
          <div className="loading-spinner-large"></div>
          <p className="loading-text">Cargando lección...</p>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="lesson-player">
        <div className="completion-screen">
          <div className="confetti"></div>
          <div className="trophy-container">
            <Trophy size={120} className="trophy-icon" />
            <PartyPopper size={60} className="party-icon party-left" />
            <PartyPopper size={60} className="party-icon party-right" />
          </div>
          <h1 className="completion-title">¡Lección Completada!</h1>
          <div className="final-score">
            <Star className="star-icon" />
            <span className="score-number">{score}</span>
            <span className="score-label">puntos</span>
          </div>
          <p className="completion-message">
            ¡Excelente trabajo! Has demostrado gran dedicación y esfuerzo.
          </p>
          <button className="btn-continue" onClick={() => onComplete && onComplete(score)}>
            <ArrowRight size={20} />
            Continuar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-player">
      {/* Header con estadísticas */}
      <div className="player-header">
        <button 
          className="back-button"
          onClick={() => {
            if (window.confirm('¿Estás seguro de salir? Perderás el progreso de esta sesión.')) {
              if (onBack) onBack();
              else if (onComplete) onComplete(0);
            }
          }}
          aria-label="Volver a lecciones"
        >
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>

        <div className="stats-container">
          <div className="stat-item">
            <Heart className="stat-icon heart-icon" />
            <span className="stat-value">{lives}</span>
          </div>
          
          <div className="stat-item">
            <Star className="stat-icon star-icon" />
            <span className="stat-value">{score}</span>
          </div>

          {streak > 1 && (
            <div className="stat-item streak-item">
              <Zap className="stat-icon zap-icon" />
              <span className="stat-value">{streak}x</span>
            </div>
          )}
        </div>

        <button 
          className="sound-toggle"
          onClick={() => {
            setSoundEnabled(!soundEnabled);
            if (!soundEnabled) {
              speak('Sonido activado', true);
            }
          }}
          aria-label={soundEnabled ? 'Desactivar sonido' : 'Activar sonido'}
        >
          {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
      </div>

      {/* Barra de progreso */}
      <div className="progress-container">
        <div 
          className="progress-bar"
          style={{ width: `${totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0}%` }}
        >
          <div className="progress-glow"></div>
        </div>
        <span className="progress-text">{currentStep + 1} / {totalSteps}</span>
      </div>

      {/* Área de ejercicio */}
      <div className={`exercise-container ${feedback ? `feedback-${feedback}` : ''} ${isAnimating ? 'animating' : ''}`}>
        
        {/* Icono del paso */}
        <div className="step-icon-container">
          <div className="step-icon">
            <Target size={40} />
          </div>
          <span className="step-number">Paso {currentStep}</span>
        </div>

        {/* Pregunta */}
        <div className="prompt-container">
          <button 
            className="speak-button"
            onClick={() => currentPrompt && speak(currentPrompt.prompt, true)}
            aria-label="Repetir pregunta"
          >
            <Volume2 size={20} />
          </button>
          <h2 className="prompt-text">{currentPrompt?.prompt}</h2>
        </div>

        {/* Feedback visual */}
        {feedback === 'correct' && (
          <div className="feedback-animation correct-animation">
            <Check size={80} />
            <p>¡Correcto!</p>
          </div>
        )}

        {feedback === 'wrong' && (
          <div className="feedback-animation wrong-animation">
            <X size={80} />
            <p>Inténtalo de nuevo</p>
          </div>
        )}

        {/* Pista */}
        {showHint && currentPrompt?.hint && (
          <div className="hint-container">
            <Lightbulb className="hint-icon" />
            <p className="hint-text">{currentPrompt.hint}</p>
          </div>
        )}

        {/* Formulario de respuesta */}
        <form onSubmit={handleSubmit} className="answer-form">
          <div className="input-container">
            <input
              ref={inputRef}
              type="text"
              className="answer-input"
              value={answer}
              onChange={(e) => setAnswer(e.target.value.toUpperCase())}
              placeholder="Escribe tu respuesta aquí..."
              disabled={isAnimating}
              autoComplete="off"
              aria-label="Respuesta"
            />
          </div>

          <div className="action-buttons">
            <button
              type="button"
              className="btn-hint"
              onClick={handleHintRequest}
              disabled={isAnimating || showHint}
            >
              <Lightbulb size={18} />
              Pista
            </button>

            <button
              type="submit"
              className="btn-submit"
              disabled={!answer.trim() || isAnimating}
            >
              <Check size={20} />
              Verificar
            </button>

            <button
              type="button"
              className="btn-skip"
              onClick={handleSkip}
              disabled={isAnimating}
            >
              <ArrowRight size={18} />
              Saltar
            </button>
          </div>
        </form>

        {/* Intentos restantes */}
        <div className="attempts-indicator">
          {[...Array(currentPrompt?.max_attempts || 3)].map((_, i) => (
            <div 
              key={i} 
              className={`attempt-dot ${i < lives ? 'active' : 'inactive'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LessonPlayer;
