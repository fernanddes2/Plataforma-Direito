export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  QUESTION_BANK = 'QUESTION_BANK',
  LEARNING = 'LEARNING',
  EXAMS = 'EXAMS',
  AI_TUTOR = 'AI_TUTOR',
  STATS = 'STATS',
  QUIZ_ACTIVE = 'QUIZ_ACTIVE'
}

export interface Question {
  id: string;
  topic: string;
  // Novo campo para diferenciar o tipo de interação
  type: 'objective' | 'discursive'; 
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  text: string; // Enunciado ou Caso Prático
  
  // Campos para Objetivas
  options?: string[]; 
  correctAnswerIndex?: number; 
  
  // Campos para Discursivas/Peças
  referenceAnswer?: string; // Espelho de correção (O que a banca espera)
  
  explanation?: string; // Comentário geral / Fundamentação
}

export interface QuizState {
  questions: Question[];
  currentIndex: number;
  score: number;
  answers: Record<string, any>;
  isFinished: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

export interface UserStats {
  questionsSolved: number;
  accuracy: number;
  streakDays: number;
  topicPerformance: {
    topic: string;
    score: number;
  }[];
}

export interface Exam {
  id: string;
  university: string;
  subject: string;
  year: number;
  period: string;
  url: string; 
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
}