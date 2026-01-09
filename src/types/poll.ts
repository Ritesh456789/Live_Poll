export interface Poll {
  id: string;
  question: string;
  options: string[];
  createdAt: number;
  expiresAt: number;
  isActive: boolean;
  votes?: any[]; // Added for incoming server data
}

export interface Answer {
  studentId: string;
  studentName: string;
  pollId: string;
  optionIndex: number;
  answeredAt: number;
}

export interface PollResult {
  pollId: string;
  question: string;
  options: string[];
  votes: number[];
  totalVotes: number;
  studentAnswers: Answer[];
}

export interface Student {
  id: string;
  name: string;
  joinedAt: number;
  isKicked: boolean;
}

export interface ChatMessage {
  id: string;
  message: string;
  senderType: "teacher" | "student";
  senderName: string;
  timestamp: number;
}

export interface PollState {
  currentPoll: Poll | null;
  polls: Poll[];
  answers: Answer[];
  students: Student[];
  results: PollResult | null;
  chatMessages: ChatMessage[];
  kickedStudents: string[];
}
