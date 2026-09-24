import React, { useEffect, useState } from 'react';
import { quizEngine, type GameState } from '../services/quizEngine';
import { QUIZ_QUESTIONS } from '../data/presentationData';
import { 
  Crown, Play, SkipForward, Eye, RefreshCw, 
  UserPlus, Users, Trophy, CheckCircle2, XCircle, Clock
} from 'lucide-react';

interface HostDashboardProps {
  onGoToPodium: () => void;
}

export const HostDashboard: React.FC<HostDashboardProps> = ({ onGoToPodium }) => {
  const [gameState, setGameState] = useState<GameState>(quizEngine.getState());

  useEffect(() => {
    const unsubscribe = quizEngine.subscribe(setGameState);
    return () => unsubscribe();
  }, []);

  const currentQ = QUIZ_QUESTIONS[gameState.currentQuestionIndex];
  const answeredCount = gameState.players.filter(p => p.hasAnsweredCurrentQuestion).length;
  const totalPlayers = gameState.players.length;

  const handleStartGame = () => {
    quizEngine.startQuiz();
  };

  const handleNextQuestion = () => {
    quizEngine.nextQuestion();
  };

  const handleRevealAnswer = () => {
    quizEngine.revealAnswers();
  };

  const handleShowPodium = () => {
    quizEngine.showPodium();
    onGoToPodium();
  };

  const handleResetGame = () => {
    if (confirm('¿Estás seguro de reiniciar el juego y crear una nueva sala?')) {
      quizEngine.resetGame();
    }
  };

  const handleAddBots = () => {
    quizEngine.addBotPlayers(5);
  };

  // Option answer stats
  const optionStats = [0, 0, 0, 0];
  gameState.players.forEach(p => {
    if (p.lastAnswerIndex !== null && p.lastAnswerIndex >= 0 && p.lastAnswerIndex < 4) {
      optionStats[p.lastAnswerIndex]++;
    }
  });

  return (
    <div className="host-dashboard glass-card">
      {/* Top Host Header */}
      <div className="host-header">
        <div className="host-title-area">
          <div className="host-badge">
            <Crown size={20} className="glow-text-purple" />
            <span>PANEL DE CONTROL DEL PRESENTADOR</span>
          </div>
          <h2>Gestión del Conocimiento - Control en Vivo</h2>
        </div>

        <div className="host-pin-card">
          <span className="pin-label">CÓDIGO DE SALA:</span>
          <span className="pin-code glow-text-cyan">{gameState.pin}</span>
        </div>
      </div>

      {/* Main Grid: Control Panel + Live Participants */}
      <div className="host-grid">
        
        {/* Left Column: Live Game Control */}
        <div className="host-controls-column">
          
          {/* LOBBY STATE */}
          {gameState.status === 'LOBBY' && (
            <div className="host-card lobby-host-card">
              <h3><Users size={22} /> Sala de Espera Activa</h3>
              <p>Comparte el Código de Sala <strong>{gameState.pin}</strong> con los estudiantes o asistentes para que ingresen su nombre.</p>
              
              <div className="host-action-buttons">
                <button 
                  className="btn-host-primary" 
                  onClick={handleStartGame}
                  disabled={totalPlayers === 0}
                >
                  <Play size={20} fill="currentColor" /> Iniciar Juego con {totalPlayers} Participante(s)
                </button>

                <button className="btn-host-secondary" onClick={handleAddBots}>
                  <UserPlus size={18} /> + Agregar 5 Jugadores de Prueba (Bots)
                </button>
              </div>
            </div>
          )}

          {/* QUESTION or REVEAL STATE */}
          {(gameState.status === 'QUESTION' || gameState.status === 'REVEAL') && currentQ && (
            <div className="host-card active-question-card">
              <div className="question-counter">
                <span>Pregunta {gameState.currentQuestionIndex + 1} de {QUIZ_QUESTIONS.length}</span>
                <span className="time-indicator">
                  <Clock size={16} /> Respuestas: {answeredCount} / {totalPlayers}
                </span>
              </div>

              <h3 className="host-question-title">{currentQ.question}</h3>

              {/* Options Grid */}
              <div className="host-options-grid">
                {currentQ.options.map((optionText, idx) => {
                  const isCorrect = idx === currentQ.correctIndex;
                  const count = optionStats[idx];
                  const percent = totalPlayers > 0 ? Math.round((count / totalPlayers) * 100) : 0;

                  return (
                    <div 
                      key={idx} 
                      className={`host-option-item ${gameState.status === 'REVEAL' ? (isCorrect ? 'correct-option' : 'wrong-option') : ''}`}
                    >
                      <div className="option-label-badge">
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <div className="option-text-content">
                        <span>{optionText}</span>
                        {gameState.status === 'REVEAL' && isCorrect && (
                          <span className="correct-tag"><CheckCircle2 size={16} /> Correcta</span>
                        )}
                      </div>
                      <div className="option-stat-badge">
                        {count} ({percent}%)
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation in REVEAL Mode */}
              {gameState.status === 'REVEAL' && (
                <div className="explanation-box">
                  <h4>💡 Explicación del Tema:</h4>
                  <p>{currentQ.explanation}</p>
                </div>
              )}

              {/* Host Action Buttons */}
              <div className="host-action-bar">
                {gameState.status === 'QUESTION' && (
                  <button className="btn-host-action reveal-btn" onClick={handleRevealAnswer}>
                    <Eye size={18} /> Revelar Respuesta y Explicación
                  </button>
                )}

                {gameState.status === 'REVEAL' && (
                  <button className="btn-host-action next-btn" onClick={handleNextQuestion}>
                    <SkipForward size={18} /> 
                    {gameState.currentQuestionIndex < QUIZ_QUESTIONS.length - 1 ? 'Siguiente Pregunta' : 'Ver Podio Final'}
                  </button>
                )}

                <button className="btn-host-action podium-btn" onClick={handleShowPodium}>
                  <Trophy size={18} /> Ir al Podio
                </button>
              </div>
            </div>
          )}

          {/* PODIUM STATE */}
          {gameState.status === 'PODIUM' && (
            <div className="host-card podium-host-card">
              <h3><Trophy size={24} className="glow-text-purple" /> ¡El Juego ha Finalizado!</h3>
              <p>Haz clic a continuación para ver el podio de ganadores y el ranking completo de los participantes.</p>
              <button className="btn-host-primary" onClick={onGoToPodium}>
                <Trophy size={20} /> Ver Podio de Ganadores
              </button>
            </div>
          )}

          {/* Global Reset Button */}
          <div className="host-footer-actions">
            <button className="btn-reset-room" onClick={handleResetGame}>
              <RefreshCw size={16} /> Reiniciar Sala / Nuevo Juego
            </button>
          </div>

        </div>

        {/* Right Column: Real-Time Leaderboard & Player Status */}
        <div className="host-players-column">
          <div className="players-list-card glass-card">
            <div className="players-card-header">
              <h3><Users size={18} /> Participantes ({totalPlayers})</h3>
              <span className="live-tag">EN VIVO</span>
            </div>

            {totalPlayers === 0 ? (
              <div className="empty-players-msg">
                <p>Esperando que los estudiantes se conecten...</p>
                <button className="btn-add-quick-bots" onClick={handleAddBots}>
                  + Añadir Bots de Prueba
                </button>
              </div>
            ) : (
              <div className="players-scroll-list">
                {[...gameState.players]
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <div key={player.id} className="player-row">
                      <div className="player-rank">#{index + 1}</div>
                      <div className="player-info">
                        <span className="player-name">{player.name} {player.isBot ? '🤖' : ''}</span>
                        <span className="player-points">{player.score} pts</span>
                      </div>

                      <div className="player-status-badge">
                        {gameState.status === 'QUESTION' && (
                          player.hasAnsweredCurrentQuestion ? (
                            <span className="status-answered"><CheckCircle2 size={16} /> Respondió</span>
                          ) : (
                            <span className="status-waiting"><Clock size={16} /> Pensando</span>
                          )
                        )}

                        {gameState.status === 'REVEAL' && (
                          player.isCorrect ? (
                            <span className="status-correct"><CheckCircle2 size={16} /> +Puntos</span>
                          ) : (
                            <span className="status-wrong"><XCircle size={16} /> 0 pts</span>
                          )
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
