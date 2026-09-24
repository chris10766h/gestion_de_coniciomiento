import React, { useState } from 'react';
import { SLIDES, type Slide } from '../data/presentationData';
import { ChevronLeft, ChevronRight, Play, BookOpen, Users, Sparkles } from 'lucide-react';

interface PresentationSlidesProps {
  onStartGame: () => void;
}

export const PresentationSlides: React.FC<PresentationSlidesProps> = ({ onStartGame }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slide: Slide = SLIDES[currentSlideIndex];

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentSlideIndex < SLIDES.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  return (
    <div className="slides-container glass-card">
      {/* Slide Navigation Header */}
      <div className="slide-top-bar">
        <div className="slide-badge">
          <BookOpen size={16} />
          <span>Diapositiva {currentSlideIndex + 1} de {SLIDES.length}</span>
          <span className="slide-category-tag">{slide.category}</span>
        </div>

        <div className="slide-controls-top">
          <button 
            className="btn-slide-nav" 
            onClick={handlePrev} 
            disabled={currentSlideIndex === 0}
            title="Diapositiva Anterior"
          >
            <ChevronLeft size={20} /> Anterior
          </button>

          <button 
            className="btn-slide-nav" 
            onClick={handleNext} 
            disabled={currentSlideIndex === SLIDES.length - 1}
            title="Siguiente Diapositiva"
          >
            Siguiente <ChevronRight size={20} />
          </button>

          <button className="btn-start-game-cta" onClick={onStartGame}>
            <Play size={18} fill="currentColor" /> Ir al Juego Dinámico
          </button>
        </div>
      </div>

      {/* Main Slide Card Area */}
      <div className="slide-content-wrapper">
        
        {/* Title Section */}
        <div className="slide-header">
          <h2 className="slide-main-title glow-text-cyan">{slide.title}</h2>
          {slide.subtitle && <p className="slide-subtitle">{slide.subtitle}</p>}
        </div>

        {/* Slide 1 Special Layout: Presenters */}
        {slide.presenters && (
          <div className="presenters-box">
            <h4 className="presenters-label">
              <Users size={18} /> Presentado por:
            </h4>
            <div className="presenters-grid">
              {slide.presenters.map((name, idx) => (
                <div key={idx} className="presenter-card">
                  <div className="presenter-avatar">👨‍🎓</div>
                  <div className="presenter-name">{name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bullets List */}
        {slide.bullets && (
          <div className="slide-bullets-list">
            {slide.bullets.map((bullet, idx) => (
              <div key={idx} className="bullet-item">
                <span className="bullet-icon">✦</span>
                <span className="bullet-text">{bullet}</span>
              </div>
            ))}
          </div>
        )}

        {/* Highlights Grid */}
        {slide.highlights && (
          <div className="slide-highlights-grid">
            {slide.highlights.map((h, idx) => (
              <div key={idx} className="highlight-card glass-card">
                <div className="highlight-icon">{h.icon}</div>
                <div className="highlight-title">{h.title}</div>
                <div className="highlight-desc">{h.desc}</div>
              </div>
            ))}
          </div>
        )}

        {/* Pyramid of Value (Slide 3) */}
        {slide.pyramidLevels && (
          <div className="pyramid-wrapper">
            <h4 className="pyramid-title">Pirámide del Valor (Niveles de Madurez)</h4>
            <div className="pyramid-container">
              {slide.pyramidLevels.map((lvl, idx) => (
                <div 
                  key={idx} 
                  className="pyramid-level" 
                  style={{
                    backgroundColor: lvl.color + '22',
                    borderColor: lvl.color,
                    width: `${100 - idx * 18}%`
                  }}
                >
                  <div className="pyramid-level-header" style={{ color: lvl.color }}>
                    <span className="pyramid-step-badge">Nivel {4 - idx}</span>
                    <strong>{lvl.level}</strong>
                  </div>
                  <div className="pyramid-level-desc">{lvl.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cycle Steps (Slide 5) */}
        {slide.cycleSteps && (
          <div className="cycle-container">
            <div className="cycle-grid">
              {slide.cycleSteps.map((s, idx) => (
                <div key={idx} className="cycle-card">
                  <div className="cycle-number">{idx + 1}</div>
                  <div className="cycle-icon">{s.icon}</div>
                  <div className="cycle-name">{s.step}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table Comparison (Slide 4 & Slide 8) */}
        {slide.table && (
          <div className="slide-table-wrapper">
            <table className="slide-custom-table">
              <thead>
                <tr>
                  {slide.table.headers.map((h, idx) => (
                    <th key={idx}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slide.table.rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Last slide call to action */}
        {currentSlideIndex === SLIDES.length - 1 && (
          <div className="quiz-start-banner">
            <Sparkles size={32} className="glow-text-purple" />
            <h3>¡Todo listo para la evaluación interactiva!</h3>
            <p>Presiona el botón a continuación para abrir la sala y controlar el juego.</p>
            <button className="btn-giant-cta" onClick={onStartGame}>
              <Play size={24} fill="currentColor" /> Iniciar Juego Dinámico
            </button>
          </div>
        )}

      </div>

      {/* Slide Thumbnails Selector */}
      <div className="slide-thumbnails-bar">
        {SLIDES.map((s, idx) => (
          <button 
            key={s.id} 
            className={`slide-thumb-btn ${idx === currentSlideIndex ? 'active' : ''}`}
            onClick={() => setCurrentSlideIndex(idx)}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
};
