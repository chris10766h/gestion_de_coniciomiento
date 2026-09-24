import React, { useEffect, useState } from 'react';
import { quizEngine, type GameState, type Player } from '../services/quizEngine';
import { Trophy, Sparkles, RefreshCw, BookOpen } from 'lucide-react';

interface PodiumViewProps {
  onReturnToSlides: () => void;
  onNewGame: () => void;
}

export const PodiumView: React.FC<PodiumViewProps> = ({ onReturnToSlides, onNewGame }) => {
  const [gameState, setGameState] = useState<GameState>(quizEngine.getState());

  useEffect(() => {
    const unsubscribe = quizEngine.subscribe(setGameState);
    return () => unsubscribe();
  }, []);

  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);

  const top1: Player | undefined = sortedPlayers[0];
  const top2: Player | undefined = sortedPlayers[1];
  const top3: Player | undefined = sortedPlayers[2];

  return (
    <div className="podium-container glass-card">
      
      {/* Title */}
      <div className="podium-header">
        <Sparkles size={32} className="glow-text-purple" />
        <h2 className="podium-title">PODIO FINAL DE GANADORES</h2>
        <p className="podium-subtitle">Gestión del Conocimiento - Evaluación Interactiva</p>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="podium-stage">
        
        {/* 2ND PLACE */}
        <div className="podium-place place-2">
          {top2 ? (
            <>
              <div className="podium-badge silver">🥈 2° Lugar</div>
              <div className="podium-avatar">🥈</div>
              <div className="podium-player-name">{top2.name}</div>
              <div className="podium-score">{top2.score} pts</div>
              <div className="podium-bar bar-silver">2</div>
            </>
          ) : (
            <div className="podium-empty">Sin participantes</div>
          )}
        </div>

        {/* 1ST PLACE */}
        <div className="podium-place place-1">
          {top1 ? (
            <>
              <div className="podium-badge gold">👑 1° Lugar</div>
              <div className="podium-avatar crown-glow">🥇</div>
              <div className="podium-player-name">{top1.name}</div>
              <div className="podium-score gold-score">{top1.score} pts</div>
              <div className="podium-bar bar-gold">1</div>
            </>
          ) : (
            <div className="podium-empty">Sin participantes</div>
          )}
        </div>

        {/* 3RD PLACE */}
        <div className="podium-place place-3">
          {top3 ? (
            <>
              <div className="podium-badge bronze">🥉 3° Lugar</div>
              <div className="podium-avatar">🥉</div>
              <div className="podium-player-name">{top3.name}</div>
              <div className="podium-score">{top3.score} pts</div>
              <div className="podium-bar bar-bronze">3</div>
            </>
          ) : (
            <div className="podium-empty">Sin participantes</div>
          )}
        </div>

      </div>

      {/* Full Rankings Table */}
      <div className="full-ranking-card">
        <h3><Trophy size={20} /> Tabla Posiciones Completa</h3>
        
        {sortedPlayers.length === 0 ? (
          <p className="no-players-msg">No hay participantes registrados en este juego.</p>
        ) : (
          <div className="ranking-table-wrapper">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>Posición</th>
                  <th>Participante</th>
                  <th>Racha Máx.</th>
                  <th>Puntaje Total</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((player, idx) => (
                  <tr key={player.id} className={idx < 3 ? `top-${idx + 1}` : ''}>
                    <td className="rank-cell">
                      {idx === 0 && '🥇'}
                      {idx === 1 && '🥈'}
                      {idx === 2 && '🥉'}
                      {idx > 2 && `#${idx + 1}`}
                    </td>
                    <td className="name-cell">
                      <strong>{player.name}</strong> {player.isBot ? '(Bot)' : ''}
                    </td>
                    <td>🔥 x{player.streak}</td>
                    <td className="score-cell">{player.score} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="podium-footer-actions">
        <button className="btn-podium-action" onClick={onReturnToSlides}>
          <BookOpen size={18} /> Volver a las Diapositivas
        </button>

        <button className="btn-podium-action primary" onClick={onNewGame}>
          <RefreshCw size={18} /> Iniciar Nueva Dinámica
        </button>
      </div>

    </div>
  );
};
