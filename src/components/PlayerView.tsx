import React, { useState, useEffect } from 'react';
import { quizEngine, type GameState, type Player } from '../services/quizEngine';
import { QUIZ_QUESTIONS, type Question } from '../data/presentationData';
import { 
  User, Sparkles, Flame, CheckCircle2, 
  XCircle, Clock, Award 
} from 'lucide-react';

interface PlayerViewProps {
  onGoToPodium: () => void;
}

export const PlayerView: React.FC<PlayerViewProps> = ({ onGoToPodium }) => {
  const [gameState, setGameState] = useState<GameState>(quizEngine.getState());
  const [playerName, setPlayerName] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [lastFeedback, setLastFeedback] = useState<{ isCorrect: boolean; points: number } | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  // Restore saved player session if available
  useEffect(() => {
    const savedId = sessionStorage.getItem('gc_quiz_player_id');
    if (savedId) {
      const state = quizEngine.getState();
      const found = state.players.find(p => p.id === savedId);
      if (found) {
        setCurrentPlayer(found);
      }
    }
  }, []);

  // Listen for global game state updates
  useEffect(() => {
    const unsubscribe = quizEngine.subscribe((newState) => {
      setGameState(newState);
      if (currentPlayer) {
        const updated = newState.players.find(p => p.id === currentPlayer.id);
        if (updated) {
          setCurrentPlayer(updated);
        }
      }
      if (newState.status === 'PODIUM') {
        onGoToPodium();
      }
    });
    return () => unsubscribe();
  }, [currentPlayer, onGoToPodium]);

  // Reset selected option when moving to a new question
  useEffect(() => {
    if (gameState.status === 'QUESTION') {
      setSelectedOption(null);
      setLastFeedback(null);
    }
  }, [gameState.currentQuestionIndex, gameState.status]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || isJoining) return;
    setIsJoining(true);
    try {
      const player = await quizEngine.joinGame(playerName.trim());
      setCurrentPlayer(player);
      sessionStorage.setItem('gc_quiz_player_id', player.id);
    } catch (err) {
      console.error('Error al unirse:', err);
    } finally {
      setIsJoining(false);
    }
  };

  const handleAnswer = async (optionIdx: number) => {
    if (!currentPlayer || selectedOption !== null || gameState.status !== 'QUESTION') return;

    setSelectedOption(optionIdx);
    try {
      const result = await quizEngine.submitAnswer(currentPlayer.id, optionIdx);
      setLastFeedback({ isCorrect: result.isCorrect, points: result.pointsEarned });
    } catch (err) {
      console.error('Error al enviar respuesta:', err);
    }
  };

  // 1. JOIN SCREEN (Sin contraseña, solo nombre)
  if (!currentPlayer) {
    return (
      <div className="player-join-card glass-card">
        <div className="join-badge">
          <Sparkles size={24} className="glow-text-cyan" />
          <span>UNIRSE AL JUEGO</span>
        </div>
        
        <h2>Gestión del Conocimiento</h2>
        <p className="join-subtitle">Ingresa tu nombre para identificarte en el podio de ganadores.</p>

        <form onSubmit={handleJoin} className="join-form">
          <div className="input-group">
            <User className="input-icon" size={20} />
            <input 
              type="text" 
              className="join-input"
              placeholder="Tu Nombre o Apodo (ej: Carlos)" 
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={25}
              required
              autoFocus
            />
          </div>

          <button type="submit" className="btn-join-submit" disabled={isJoining}>
            {isJoining ? 'Entrando...' : '¡Entrar a la Sala!'}
          </button>
        </form>
      </div>
    );
  }

  const currentQ: Question = QUIZ_QUESTIONS[gameState.currentQuestionIndex];
  const playerRank = [...gameState.players]
    .sort((a, b) => b.score - a.score)
    .findIndex(p => p.id === currentPlayer.id) + 1;

  // Option colors Kahoot style
  const optionColors = [
    { bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', letter: 'A' },
    { bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', letter: 'B' },
    { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', letter: 'C' },
    { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', letter: 'D' }
  ];

  return (
    <div className="player-view-container glass-card">
      
      {/* Player Header Info */}
      <div className="player-status-header">
        <div className="player-profile">
          <div className="player-avatar">👨‍🎓</div>
          <div>
            <h3>{currentPlayer.name}</h3>
            <span className="player-rank-badge">Posición #{playerRank}</span>
          </div>
        </div>

        <div className="player-score-box">
          {currentPlayer.streak > 1 && (
            <div className="streak-badge">
              <Flame size={16} fill="currentColor" /> Racha x{currentPlayer.streak}
            </div>
          )}
          <div className="score-total">
            <Award size={18} /> {currentPlayer.score} pts
          </div>
        </div>
      </div>

      {/* LOBBY WAITING SCREEN */}
      {gameState.status === 'LOBBY' && (
        <div className="player-state-card lobby-waiting">
          <Clock size={48} className="glow-text-cyan spin-pulse" />
          <h3>¡Estás en la Sala de Espera!</h3>
          <p>Mira la pantalla del presentador. El juego comenzará en breve...</p>
          <div className="room-pin-display">
            SALA: <strong>{gameState.pin}</strong>
          </div>
        </div>
      )}

      {/* QUESTION SCREEN */}
      {gameState.status === 'QUESTION' && currentQ && (
        <div className="player-state-card question-active">
          <div className="question-header">
            <span>Pregunta {gameState.currentQuestionIndex + 1} de {QUIZ_QUESTIONS.length}</span>
            {selectedOption !== null && (
              <span className="answered-tag"><CheckCircle2 size={16} /> Respuesta enviada</span>
            )}
          </div>

          <h3 className="player-question-text">{currentQ.question}</h3>

          {/* Option Buttons */}
          <div className="player-options-grid">
            {currentQ.options.map((optionText, idx) => {
              const isSelected = selectedOption === idx;
              const colorObj = optionColors[idx % 4];

              return (
                <button
                  key={idx}
                  className={`player-option-btn ${isSelected ? 'selected' : ''}`}
                  style={{ background: colorObj.bg }}
                  onClick={() => handleAnswer(idx)}
                  disabled={selectedOption !== null}
                >
                  <span className="player-option-letter">{colorObj.letter}</span>
                  <span className="player-option-text">{optionText}</span>
                </button>
              );
            })}
          </div>

          {selectedOption !== null && (
            <div className="answer-confirmation-card">
              <CheckCircle2 size={24} className="glow-text-cyan" />
              <div>
                <strong>¡Respuesta registrada!</strong>
                <p>Esperando que los demás respondan y el presentador revele los resultados.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REVEAL SCREEN */}
      {gameState.status === 'REVEAL' && currentQ && (
        <div className="player-state-card answer-reveal">
          {currentPlayer.isCorrect ? (
            <div className="result-banner correct">
              <CheckCircle2 size={48} />
              <h2>¡Respuesta Correcta!</h2>
              <p>+ {lastFeedback?.points || 500} puntos conseguidos por tu velocidad.</p>
            </div>
          ) : (
            <div className="result-banner wrong">
              <XCircle size={48} />
              <h2>Respuesta Incorrecta</h2>
              <p>No te preocupes, ¡aún queda juego para remontar en la tabla!</p>
            </div>
          )}

          <div className="correct-answer-reminder">
            <h4>La respuesta correcta era:</h4>
            <div className="correct-option-box">
              {currentQ.options[currentQ.correctIndex]}
            </div>
            <p className="explanation-text">{currentQ.explanation}</p>
          </div>
        </div>
      )}

    </div>
  );
};
