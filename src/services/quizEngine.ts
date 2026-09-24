import { QUIZ_QUESTIONS, type Question } from '../data/presentationData';
import { db } from './firebase';
import { ref, onValue, set, get } from 'firebase/database';

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

const GAME_REF = 'quiz_game';

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
  private listeners: ((state: GameState) => void)[] = [];
  private botTimers: number[] = [];

  constructor() {
    this.initFirebaseListener();
  }

  private initFirebaseListener() {
    const gameRef = ref(db, GAME_REF);

    // Cargar estado inicial y suscribirse a cambios en tiempo real
    onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convertir objeto de players de Firebase (objeto) a array
        const rawPlayers = data.players;
        const playersArray: Player[] = rawPlayers
          ? (Array.isArray(rawPlayers)
              ? rawPlayers.filter(Boolean)
              : Object.values(rawPlayers))
          : [];

        this.state = {
          ...data,
          players: playersArray
        };
      } else {
        // Primera vez: inicializar en Firebase
        set(gameRef, initialGameState);
        this.state = initialGameState;
      }
      this.notifyListeners();
    });

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

  private async saveToFirebase(newState: GameState) {
    this.state = { ...newState, lastUpdate: Date.now() };
    try {
      await set(ref(db, GAME_REF), this.state);
    } catch (err) {
      console.error('Error guardando en Firebase:', err);
    }
  }

  // --- HOST ACTIONS ---

  public resetGame() {
    this.clearBotTimers();
    const newState: GameState = {
      ...initialGameState,
      pin: Math.floor(100000 + Math.random() * 900000).toString(),
      players: [],
      lastUpdate: Date.now()
    };
    this.saveToFirebase(newState);
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
    this.saveToFirebase(newState);
    setTimeout(() => this.scheduleBotsAnswer(), 200);
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
    this.saveToFirebase(newState);
    setTimeout(() => this.scheduleBotsAnswer(), 200);
  }

  public revealAnswers() {
    this.clearBotTimers();
    const newState: GameState = {
      ...this.state,
      status: 'REVEAL'
    };
    this.saveToFirebase(newState);
  }

  public showPodium() {
    this.clearBotTimers();
    const newState: GameState = {
      ...this.state,
      status: 'PODIUM'
    };
    this.saveToFirebase(newState);
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

    const newState = { ...this.state, players: newPlayers };
    this.saveToFirebase(newState);
  }

  public removePlayer(id: string) {
    const newState = {
      ...this.state,
      players: this.state.players.filter(p => p.id !== id)
    };
    this.saveToFirebase(newState);
  }

  // --- PLAYER ACTIONS ---

  public async joinGame(name: string): Promise<Player> {
    const cleanName = name.trim();

    // Leer estado fresco de Firebase antes de unirse
    const snapshot = await get(ref(db, GAME_REF));
    const freshData = snapshot.val();
    const rawPlayers = freshData?.players;
    const freshPlayers: Player[] = rawPlayers
      ? (Array.isArray(rawPlayers)
          ? rawPlayers.filter(Boolean)
          : Object.values(rawPlayers))
      : [];

    const existing = freshPlayers.find(
      p => p.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (existing) return existing;

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

    const updatedState = {
      ...freshData,
      players: [...freshPlayers, newPlayer],
      lastUpdate: Date.now()
    };

    await set(ref(db, GAME_REF), updatedState);
    return newPlayer;
  }

  public async submitAnswer(
    playerId: string,
    optionIndex: number
  ): Promise<{ isCorrect: boolean; pointsEarned: number }> {
    // Leer estado fresco para evitar condiciones de carrera
    const snapshot = await get(ref(db, GAME_REF));
    const freshData = snapshot.val();
    if (!freshData || freshData.status !== 'QUESTION') {
      return { isCorrect: false, pointsEarned: 0 };
    }

    const rawPlayers = freshData.players;
    const freshPlayers: Player[] = rawPlayers
      ? (Array.isArray(rawPlayers)
          ? rawPlayers.filter(Boolean)
          : Object.values(rawPlayers))
      : [];

    const targetPlayer = freshPlayers.find(p => p.id === playerId);
    if (!targetPlayer || targetPlayer.hasAnsweredCurrentQuestion) {
      return { isCorrect: false, pointsEarned: 0 };
    }

    const currentQ: Question = QUIZ_QUESTIONS[freshData.currentQuestionIndex];
    const isCorrect = optionIndex === currentQ.correctIndex;
    const timeTakenMs = freshData.questionStartTime
      ? Date.now() - freshData.questionStartTime
      : 5000;

    let pointsEarned = 0;
    let newStreak = 0;

    if (isCorrect) {
      const timeLimitMs = (currentQ.timeLimit || 20) * 1000;
      const speedFactor = Math.max(0, 1 - timeTakenMs / timeLimitMs);
      const basePoints = Math.round(500 + speedFactor * 500);
      newStreak = (targetPlayer.streak || 0) + 1;
      const streakBonus = Math.min(newStreak * 100, 500);
      pointsEarned = basePoints + streakBonus;
    } else {
      newStreak = 0;
    }

    const updatedPlayers = freshPlayers.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          score: p.score + pointsEarned,
          streak: newStreak,
          lastAnswerIndex: optionIndex,
          lastAnswerTimeMs: timeTakenMs,
          isCorrect,
          hasAnsweredCurrentQuestion: true
        };
      }
      return p;
    });

    await set(ref(db, GAME_REF), {
      ...freshData,
      players: updatedPlayers,
      lastUpdate: Date.now()
    });

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

    const botPlayers = this.state.players.filter(
      p => p.isBot && !p.hasAnsweredCurrentQuestion
    );
    botPlayers.forEach(bot => {
      const delay = Math.floor(1500 + Math.random() * 7000);
      const timer = window.setTimeout(() => {
        const isSmartChoice = Math.random() < 0.75;
        let choice = currentQ.correctIndex;
        if (!isSmartChoice) {
          const wrongOptions = [0, 1, 2, 3].filter(
            idx => idx !== currentQ.correctIndex
          );
          choice = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        }
        this.submitAnswer(bot.id, choice);
      }, delay);
      this.botTimers.push(timer);
    });
  }
}

export const quizEngine = new QuizEngine();
