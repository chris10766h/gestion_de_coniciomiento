import { QUIZ_QUESTIONS, type Question } from '../data/presentationData';

export type GameStatus = 'LOBBY' | 'QUESTION' | 'REVEAL' | 'PODIUM';

export interface Player {
  id: string;
  name: string;
  score: number;
  streak: number;
  lastAnswerIndex: number | null;
  lastAnswerTimeMs: number | null;
  isCorrect: boolean | null;
  hasAnsweredCurrentQuestion: boolean;
  isBot?: boolean;
}

export interface GameState {
  pin: string;
  status: GameStatus;
  currentQuestionIndex: number;
  questionStartTime: number | null;
  players: Player[];
  lastUpdate: number;
}

const STORAGE_KEY = 'gc_quiz_state_v1';
const CHANNEL_NAME = 'gc_quiz_broadcast_channel';

// Default initial game state
const initialGameState: GameState = {
  pin: 'GC-2026',
  status: 'LOBBY',
  currentQuestionIndex: 0,
  questionStartTime: null,
  players: [],
  lastUpdate: Date.now()
};

class QuizEngine {
  private state: GameState = initialGameState;
  private channel: BroadcastChannel | null = null;
  private listeners: ((state: GameState) => void)[] = [];
  private botTimers: number[] = [];

  constructor() {
    // Initialize BroadcastChannel if supported
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event) => {
        if (event.data && event.data.type === 'STATE_UPDATE') {
          this.state = event.data.state;
          this.notifyListeners();
        }
      };
    }

    // Fallback or secondary sync via localStorage
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            this.state = parsed;
            this.notifyListeners();
          } catch (err) {
            console.error('Error parsing stored state:', err);
          }
        }
      });

      // Load initial stored state if available
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          this.state = JSON.parse(saved);
        } catch (e) {
          this.state = initialGameState;
        }
      }
    }
  }

  public getState(): GameState {
    return this.state;
  }

  public subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => l(this.state));
  }

  private saveAndBroadcast(newState: GameState) {
    this.state = { ...newState, lastUpdate: Date.now() };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    }
    if (this.channel) {
      this.channel.postMessage({ type: 'STATE_UPDATE', state: this.state });
    }
    this.notifyListeners();
  }

  // --- HOST ACTIONS ---

  public resetGame() {
    this.clearBotTimers();
    const newState: GameState = {
      ...initialGameState,
      pin: Math.floor(100000 + Math.random() * 900000).toString(),
      players: []
    };
    this.saveAndBroadcast(newState);
  }

  public startQuiz() {
    this.clearBotTimers();
    const newState: GameState = {
      ...this.state,
      status: 'QUESTION',
      currentQuestionIndex: 0,
      questionStartTime: Date.now(),
      players: this.state.players.map(p => ({
        ...p,
        hasAnsweredCurrentQuestion: false,
        lastAnswerIndex: null,
        isCorrect: null
      }))
    };
    this.saveAndBroadcast(newState);
    this.scheduleBotsAnswer();
  }

  public nextQuestion() {
    this.clearBotTimers();
    const nextIdx = this.state.currentQuestionIndex + 1;
    if (nextIdx >= QUIZ_QUESTIONS.length) {
      this.showPodium();
      return;
    }

    const newState: GameState = {
      ...this.state,
      status: 'QUESTION',
      currentQuestionIndex: nextIdx,
      questionStartTime: Date.now(),
      players: this.state.players.map(p => ({
        ...p,
        hasAnsweredCurrentQuestion: false,
        lastAnswerIndex: null,
        isCorrect: null
      }))
    };
    this.saveAndBroadcast(newState);
    this.scheduleBotsAnswer();
  }

  public revealAnswers() {
    this.clearBotTimers();
    const newState: GameState = {
      ...this.state,
      status: 'REVEAL'
    };
    this.saveAndBroadcast(newState);
  }

  public showPodium() {
    this.clearBotTimers();
    const newState: GameState = {
      ...this.state,
      status: 'PODIUM'
    };
    this.saveAndBroadcast(newState);
  }

  public addBotPlayers(count = 5) {
    const botNames = [
      'María Paula (Bot)',
      'Carlos Andrés (Bot)',
      'Valentina (Bot)',
      'Santiago (Bot)',
      'Camila (Bot)',
      'Mateo (Bot)'
    ];

    const currentNames = new Set(this.state.players.map(p => p.name));
    const newPlayers = [...this.state.players];

    for (let i = 0; i < count; i++) {
      const availableName = botNames.find(n => !currentNames.has(n)) || `Participante_${Math.floor(Math.random() * 900)}`;
      currentNames.add(availableName);
      newPlayers.push({
        id: 'bot_' + Math.random().toString(36).substring(2, 9),
        name: availableName,
        score: 0,
        streak: 0,
        lastAnswerIndex: null,
        lastAnswerTimeMs: null,
        isCorrect: null,
        hasAnsweredCurrentQuestion: false,
        isBot: true
      });
    }

    const newState = {
      ...this.state,
      players: newPlayers
    };
    this.saveAndBroadcast(newState);
  }

  public removePlayer(id: string) {
    const newState = {
      ...this.state,
      players: this.state.players.filter(p => p.id !== id)
    };
    this.saveAndBroadcast(newState);
  }

  // --- PLAYER ACTIONS ---

  public joinGame(name: string): Player {
    const cleanName = name.trim();
    const existing = this.state.players.find(p => p.name.toLowerCase() === cleanName.toLowerCase());
    if (existing) {
      return existing;
    }

    const newPlayer: Player = {
      id: 'player_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: cleanName,
      score: 0,
      streak: 0,
      lastAnswerIndex: null,
      lastAnswerTimeMs: null,
      isCorrect: null,
      hasAnsweredCurrentQuestion: false
    };

    const newState = {
      ...this.state,
      players: [...this.state.players, newPlayer]
    };
    this.saveAndBroadcast(newState);
    return newPlayer;
  }

  public submitAnswer(playerId: string, optionIndex: number): { isCorrect: boolean; pointsEarned: number } {
    if (this.state.status !== 'QUESTION') {
      return { isCorrect: false, pointsEarned: 0 };
    }

    const currentQ: Question = QUIZ_QUESTIONS[this.state.currentQuestionIndex];
    const isCorrect = optionIndex === currentQ.correctIndex;
    const timeTakenMs = this.state.questionStartTime ? Date.now() - this.state.questionStartTime : 5000;
    
    // Scoring logic: Max 1000 points based on speed (within time limit) + streak bonus
    let pointsEarned = 0;
    let newStreak = 0;

    const targetPlayer = this.state.players.find(p => p.id === playerId);
    if (!targetPlayer || targetPlayer.hasAnsweredCurrentQuestion) {
      return { isCorrect: false, pointsEarned: 0 };
    }

    if (isCorrect) {
      const timeLimitMs = (currentQ.timeLimit || 20) * 1000;
      const speedFactor = Math.max(0, 1 - (timeTakenMs / timeLimitMs));
      const basePoints = Math.round(500 + (speedFactor * 500));
      newStreak = (targetPlayer.streak || 0) + 1;
      const streakBonus = Math.min(newStreak * 100, 500);
      pointsEarned = basePoints + streakBonus;
    } else {
      newStreak = 0;
    }

    const updatedPlayers = this.state.players.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          score: p.score + pointsEarned,
          streak: newStreak,
          lastAnswerIndex: optionIndex,
          lastAnswerTimeMs: timeTakenMs,
          isCorrect: isCorrect,
          hasAnsweredCurrentQuestion: true
        };
      }
      return p;
    });

    const newState = {
      ...this.state,
      players: updatedPlayers
    };

    this.saveAndBroadcast(newState);
    return { isCorrect, pointsEarned };
  }

  // --- BOT SIMULATION ---

  private clearBotTimers() {
    this.botTimers.forEach(t => clearTimeout(t));
    this.botTimers = [];
  }

  private scheduleBotsAnswer() {
    if (this.state.status !== 'QUESTION') return;
    const currentQ = QUIZ_QUESTIONS[this.state.currentQuestionIndex];
    if (!currentQ) return;

    const botPlayers = this.state.players.filter(p => p.isBot && !p.hasAnsweredCurrentQuestion);
    botPlayers.forEach(bot => {
      // Delay response between 1.5s and 8.5s
      const delay = Math.floor(1500 + Math.random() * 7000);
      const timer = window.setTimeout(() => {
        // 75% chance of picking correct answer for bots
        const isSmartChoice = Math.random() < 0.75;
        let choice = currentQ.correctIndex;
        if (!isSmartChoice) {
          const wrongOptions = [0, 1, 2, 3].filter(idx => idx !== currentQ.correctIndex);
          choice = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        }
        this.submitAnswer(bot.id, choice);
      }, delay);

      this.botTimers.push(timer);
    });
  }
}

export const quizEngine = new QuizEngine();
