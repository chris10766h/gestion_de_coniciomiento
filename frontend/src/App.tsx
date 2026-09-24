import { useState, useEffect } from 'react';
import { HostDashboard } from './components/HostDashboard';
import { PlayerView } from './components/PlayerView';
import { PodiumView } from './components/PodiumView';
import { quizEngine } from './services/quizEngine';
import { Crown, Gamepad2, Trophy, Lock, Key, HelpCircle, LogOut } from 'lucide-react';
import './App.css';

const PRESENTER_PIN = '1234'; // Clave por defecto para los expositores

export default function App() {
  const [activeTab, setActiveTab] = useState<'player' | 'host' | 'podium'>('player');
  const [isHostAuthenticated, setIsHostAuthenticated] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const unsubscribe = quizEngine.subscribe((state) => {
      // Auto switch to podium if host triggers podium
      if (state.status === 'PODIUM' && activeTab !== 'podium' && activeTab !== 'host') {
        setActiveTab('podium');
      }
    });
    return () => unsubscribe();
  }, [activeTab]);

  const handleSelectHostTab = () => {
    if (isHostAuthenticated) {
      setActiveTab('host');
    } else {
      setShowPinModal(true);
      setPinError(false);
      setEnteredPin('');
    }
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin.trim() === PRESENTER_PIN) {
      setIsHostAuthenticated(true);
      setShowPinModal(false);
      setActiveTab('host');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleHostLogout = () => {
    setIsHostAuthenticated(false);
    setActiveTab('player');
  };

  return (
    <div className="app-main-container">
      {/* Top Header Navigation */}
      <header className="app-nav-header">
        <div className="brand-logo-area">
          <div className="brand-badge-icon">🧠</div>
          <div className="brand-titles">
            <h1>GESTIÓN DEL CONOCIMIENTO</h1>
            <p>Juego Dinámico Interactivo</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button 
            className={`nav-tab-btn ${activeTab === 'player' ? 'active' : ''}`}
            onClick={() => setActiveTab('player')}
          >
            <Gamepad2 size={18} /> Modo Jugador
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'host' ? 'active' : ''}`}
            onClick={handleSelectHostTab}
          >
            <Crown size={18} /> Panel Presentador {!isHostAuthenticated && <Lock size={14} style={{ marginLeft: 4 }} />}
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'podium' ? 'active' : ''}`}
            onClick={() => setActiveTab('podium')}
          >
            <Trophy size={18} /> Podio
          </button>
        </nav>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isHostAuthenticated && (
            <button className="btn-host-logout" onClick={handleHostLogout} title="Cerrar sesión de Presentador">
              <LogOut size={16} /> Salir Modo Presentador
            </button>
          )}

          <button className="btn-help-guide" onClick={() => setShowGuide(!showGuide)}>
            <HelpCircle size={18} /> Ayuda
          </button>
        </div>
      </header>

      {/* PIN Authentication Modal */}
      {showPinModal && (
        <div className="modal-overlay">
          <div className="pin-modal-card glass-card">
            <div className="pin-modal-header">
              <Lock size={28} className="glow-text-purple" />
              <h3>Acceso Exclusivo del Presentador</h3>
              <p>Ingresa la clave secreta para acceder al control del juego:</p>
            </div>

            <form onSubmit={handleVerifyPin} className="pin-form">
              <div className="input-group">
                <Key className="input-icon" size={20} />
                <input 
                  type="password"
                  className={`join-input ${pinError ? 'input-error' : ''}`}
                  placeholder="Clave (por defecto: 1234)"
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value);
                    setPinError(false);
                  }}
                  autoFocus
                />
              </div>

              {pinError && (
                <div className="pin-error-text">
                  ⚠️ Clave incorrecta. Intenta de nuevo (Clave: <strong>1234</strong>).
                </div>
              )}

              <div className="pin-modal-actions">
                <button type="button" className="btn-cancel-modal" onClick={() => setShowPinModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit-modal">
                  Ingresar como Presentador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guide Banner */}
      {showGuide && (
        <div className="guide-banner-card glass-card">
          <div className="guide-header">
            <h3>📌 ¿Cómo funciona el juego?</h3>
            <button className="btn-close-guide" onClick={() => setShowGuide(false)}>✕</button>
          </div>
          <div className="guide-body">
            <div className="guide-step">
              <strong>1. Para Estudiantes / Participantes:</strong> Ingresan a <em>"Modo Jugador"</em>, escriben únicamente su <strong>Nombre</strong> y esperan el inicio del juego.
            </div>
            <div className="guide-step">
              <strong>2. Para los Expositores:</strong> Hacen clic en <em>"Panel Presentador"</em> e ingresan la clave secreta (<strong>1234</strong>) para controlar las preguntas, ver respuestas y lanzar el podio.
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="main-content-view">
        {activeTab === 'player' && (
          <PlayerView 
            onGoToPodium={() => setActiveTab('podium')} 
          />
        )}

        {activeTab === 'host' && isHostAuthenticated && (
          <HostDashboard 
            onGoToPodium={() => setActiveTab('podium')} 
          />
        )}

        {activeTab === 'podium' && (
          <PodiumView 
            onReturnToSlides={() => setActiveTab('player')} 
            onNewGame={() => {
              quizEngine.resetGame();
              setActiveTab('host');
            }} 
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Juego Dinámico de Gestión del Conocimiento • Cristian Acosta, Allyson Farfan y Juan Camilo Godoy</p>
      </footer>
    </div>
  );
}
