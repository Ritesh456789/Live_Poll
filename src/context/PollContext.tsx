import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import {
  Poll,
  Answer,
  Student,
  PollState,
  PollResult,
  ChatMessage,
} from "@/types/poll";
import { useToast } from "@/components/ui/use-toast";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface PollContextType {
  state: PollState;
  createPoll: (question: string, options: string[], duration?: number) => void;
  submitAnswer: (
    studentId: string,
    studentName: string,
    optionIndex: number,
  ) => void;
  registerStudent: (name: string) => string;
  getStudentById: (id: string) => Student | undefined;
  canCreateNewPoll: () => boolean;
  getTimeRemaining: () => number;
  kickStudent: (studentId: string) => void;
  sendChatMessage: (
    message: string,
    senderType: "teacher" | "student",
    senderName: string,
  ) => void;
  refreshState: () => void;
  isConnected: boolean;
}

type PollAction =
  | { type: "SET_POLL"; payload: Poll | null }
  | { type: "UPDATE_POLL"; payload: Poll }
  | { type: "SET_RESULTS"; payload: PollResult } // Derived from poll logic
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "REGISTER_STUDENT"; payload: Student }
  | { type: "KICK_STUDENT"; payload: string }
  | { type: "SET_HISTORY"; payload: Poll[] }
  | { type: "LOAD_STATE"; payload: PollState };

const initialState: PollState = {
  currentPoll: null,
  polls: [],
  answers: [],
  students: [],
  results: null,
  chatMessages: [],
  kickedStudents: [],
};

// Simplified reducer for local UI state that isn't fully managed by server (like chat, local student identity)
function pollReducer(state: PollState, action: PollAction): PollState {
  switch (action.type) {
    case "SET_POLL":
      return { ...state, currentPoll: action.payload };
    case "UPDATE_POLL":
      // When poll updates, we also derive results
      const poll = action.payload;
      const votes = new Array(poll.options.length).fill(0);
      const studentAnswers: Answer[] = [];
      
      if (poll.votes) {
          poll.votes.forEach((v: any) => {
             if (v.optionIndex >= 0 && v.optionIndex < votes.length) {
                 votes[v.optionIndex]++;
             }
             studentAnswers.push({
                 studentId: v.studentId,
                 studentName: v.studentName,
                 pollId: poll.id,
                 optionIndex: v.optionIndex,
                 answeredAt: new Date(v.answeredAt).getTime()
             });
          });
      }

      const results: PollResult = {
          pollId: poll.id,
          question: poll.question,
          options: poll.options,
          votes,
          totalVotes: studentAnswers.length,
          studentAnswers
      };

      return { 
          ...state, 
          currentPoll: poll, 
          results: results,
          answers: studentAnswers 
      };
      
    case "ADD_MESSAGE":
      return { ...state, chatMessages: [...state.chatMessages, action.payload] };
      
    case "REGISTER_STUDENT":
       return { ...state, students: [...state.students, action.payload] };

    case "KICK_STUDENT":
        return { ...state, kickedStudents: [...state.kickedStudents, action.payload] };

    case "SET_HISTORY":
        return { ...state, polls: action.payload };
        
    default:
      return state;
  }
}

const PollContext = createContext<PollContextType | undefined>(undefined);

export function PollProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(pollReducer, initialState);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // Initialize Socket
  useEffect(() => {
    const socketInstance = io(SOCKET_URL);
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to websocket");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      toast({
          title: "Disconnected",
          description: "Lost connection to server. Trying to reconnect...",
          variant: "destructive"
      });
    });

    socketInstance.on("poll_update", (poll: any) => {
        // Transform Mongo _id to id if needed, or ensure backend sends id
        const formattedPoll = { ...poll, id: poll._id || poll.id };
        
        // Handle expiration
        if (Date.now() > formattedPoll.expiresAt) {
             formattedPoll.isActive = false;
        }

        dispatch({ type: "UPDATE_POLL", payload: formattedPoll });
    });

    socketInstance.on("poll_ended", () => {
        dispatch({ type: "SET_POLL", payload: null });
    });

    socketInstance.on("receive_message", (message: ChatMessage) => {
        dispatch({ type: "ADD_MESSAGE", payload: message });
    });
    
    socketInstance.on("poll_history", (history: Poll[]) => {
        dispatch({ type: "SET_HISTORY", payload: history });
    });

    socketInstance.on("error", (err: { message: string }) => {
        toast({
            title: "Error",
            description: err.message,
            variant: "destructive"
        });
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const createPoll = (question: string, options: string[], duration: number = 60) => {
    if (socket) {
        socket.emit("create_poll", { question, options, duration });
    }
  };

  const submitAnswer = (
    studentId: string,
    studentName: string,
    optionIndex: number,
  ) => {
    if (socket && state.currentPoll) {
        socket.emit("submit_vote", { 
            pollId: state.currentPoll.id, // Ensure this matches backend expected ID
            studentId, 
            studentName, 
            optionIndex 
        });
    }
  };

  const registerStudent = (name: string): string => {
    // Check if ID exists in session
    let studentId = sessionStorage.getItem("studentId");
    if (!studentId) {
        studentId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem("studentId", studentId);
    }
    sessionStorage.setItem("studentName", name);

    const student: Student = {
      id: studentId,
      name,
      joinedAt: Date.now(),
      isKicked: false,
    };
    dispatch({ type: "REGISTER_STUDENT", payload: student });
    return studentId;
  };

  const getStudentById = (id: string): Student | undefined => {
    // In a real app we might fetch from server, but for now local identity is fine
    // Or we could sync student list via socket
    return state.students.find((student) => student.id === id);
  };

  const canCreateNewPoll = (): boolean => {
    // Simple check: active poll exists?
    return !state.currentPoll || !state.currentPoll.isActive;
  };

  const getTimeRemaining = (): number => {
    if (!state.currentPoll || !state.currentPoll.isActive) return 0;
    // Calculate based on server time (expiresAt)
    const remaining = Math.max(0, new Date(state.currentPoll.expiresAt).getTime() - Date.now());
    return Math.ceil(remaining / 1000);
  };

  const kickStudent = (studentId: string) => {
     // Admin only feature - client side for now unless we add socket event
     dispatch({ type: "KICK_STUDENT", payload: studentId });
  };

  const sendChatMessage = (
    message: string,
    senderType: "teacher" | "student",
    senderName: string,
  ) => {
      if (socket) {
          socket.emit("send_message", {
              id: Date.now().toString(),
              message,
              senderType,
              senderName,
              timestamp: Date.now()
          });
      }
  };

  const refreshState = () => {
     // No-op or fetch history
     if(socket) socket.emit("get_history");
  };

  return (
    <PollContext.Provider
      value={{
        state,
        createPoll,
        submitAnswer,
        registerStudent,
        getStudentById,
        canCreateNewPoll,
        getTimeRemaining,
        kickStudent,
        sendChatMessage,
        refreshState,
        isConnected
      }}
    >
      {children}
    </PollContext.Provider>
  );
}

export function usePoll() {
  const context = useContext(PollContext);
  if (context === undefined) {
    throw new Error("usePoll must be used within a PollProvider");
  }
  return context;
}
