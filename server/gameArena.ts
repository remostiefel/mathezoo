import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";

interface GameSession {
  id: string;
  players: string[];
  currentTask: {
    operation: "+" | "-";
    number1: number;
    number2: number;
    correctAnswer: number;
  };
  playerStates: Map<string, {
    socketId: string;
    answer: number | null;
    solutionSteps: any[];
    completedAt: number | null;
  }>;
}

export class GameArena {
  private wss: WebSocketServer;
  private sessions: Map<string, GameSession> = new Map();
  private playerSockets: Map<string, WebSocket> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/game-arena',
    });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New game arena connection');

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });
    });
  }

  private handleMessage(ws: WebSocket, data: any) {
    const { type, payload } = data;

    switch (type) {
      case 'join':
        this.handleJoin(ws, payload);
        break;
      case 'submit_step':
        this.handleSubmitStep(ws, payload);
        break;
      case 'submit_answer':
        this.handleSubmitAnswer(ws, payload);
        break;
      case 'ready_next':
        this.handleReadyNext(ws, payload);
        break;
    }
  }

  private handleJoin(ws: WebSocket, payload: { userId: string; sessionId: string }) {
    const { userId, sessionId } = payload;
    
    this.playerSockets.set(userId, ws);

    // Find or create session
    let session = this.sessions.get(sessionId);
    
    if (!session) {
      // Create new session
      session = {
        id: sessionId,
        players: [userId],
        currentTask: this.generateTask(),
        playerStates: new Map(),
      };
      this.sessions.set(sessionId, session);
      
      session.playerStates.set(userId, {
        socketId: userId,
        answer: null,
        solutionSteps: [],
        completedAt: null,
      });

      // Send waiting for opponent
      this.sendToPlayer(userId, {
        type: 'waiting',
        message: 'Warte auf zweiten Spieler...',
      });
    } else {
      // Join existing session
      if (session.players.length < 2 && !session.players.includes(userId)) {
        session.players.push(userId);
        session.playerStates.set(userId, {
          socketId: userId,
          answer: null,
          solutionSteps: [],
          completedAt: null,
        });

        // Both players ready - start game
        this.startGame(sessionId);
      } else {
        this.sendToPlayer(userId, {
          type: 'error',
          message: 'Session ist voll oder du bist bereits beigetreten',
        });
      }
    }
  }

  private startGame(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Send task to both players
    session.players.forEach(playerId => {
      this.sendToPlayer(playerId, {
        type: 'game_start',
        task: session.currentTask,
        opponent: session.players.find(p => p !== playerId),
      });
    });
  }

  private handleSubmitStep(ws: WebSocket, payload: { userId: string; sessionId: string; step: any }) {
    const { userId, sessionId, step } = payload;
    const session = this.sessions.get(sessionId);
    
    if (!session) return;

    const playerState = session.playerStates.get(userId);
    if (!playerState) return;

    playerState.solutionSteps.push(step);

    // Broadcast step to opponent
    const opponentId = session.players.find(p => p !== userId);
    if (opponentId) {
      this.sendToPlayer(opponentId, {
        type: 'opponent_step',
        step,
        playerId: userId,
      });
    }
  }

  private handleSubmitAnswer(ws: WebSocket, payload: { userId: string; sessionId: string; answer: number }) {
    const { userId, sessionId, answer } = payload;
    const session = this.sessions.get(sessionId);
    
    if (!session) return;

    const playerState = session.playerStates.get(userId);
    if (!playerState) return;

    playerState.answer = answer;
    playerState.completedAt = Date.now();

    const isCorrect = answer === session.currentTask.correctAnswer;

    // Send result to player
    this.sendToPlayer(userId, {
      type: 'answer_result',
      isCorrect,
      correctAnswer: session.currentTask.correctAnswer,
    });

    // Check if both players have answered
    const allAnswered = Array.from(session.playerStates.values()).every(
      state => state.answer !== null
    );

    if (allAnswered) {
      this.showComparison(sessionId);
    } else {
      // Notify opponent that this player finished
      const opponentId = session.players.find(p => p !== userId);
      if (opponentId) {
        this.sendToPlayer(opponentId, {
          type: 'opponent_finished',
          playerId: userId,
        });
      }
    }
  }

  private showComparison(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const comparison = {
      task: session.currentTask,
      players: session.players.map(playerId => {
        const state = session.playerStates.get(playerId)!;
        return {
          playerId,
          answer: state.answer,
          isCorrect: state.answer === session.currentTask.correctAnswer,
          solutionSteps: state.solutionSteps,
          timeTaken: state.completedAt ? state.completedAt : 0,
        };
      }),
    };

    // Send comparison to both players
    session.players.forEach(playerId => {
      this.sendToPlayer(playerId, {
        type: 'comparison',
        data: comparison,
      });
    });
  }

  private handleReadyNext(ws: WebSocket, payload: { userId: string; sessionId: string }) {
    const { userId, sessionId } = payload;
    const session = this.sessions.get(sessionId);
    
    if (!session) return;

    // Reset player states
    session.playerStates.forEach(state => {
      state.answer = null;
      state.solutionSteps = [];
      state.completedAt = null;
    });

    // Generate new task
    session.currentTask = this.generateTask();

    // Start new round
    this.startGame(sessionId);
  }

  private handleDisconnect(ws: WebSocket) {
    // Find player by socket
    let disconnectedPlayerId: string | null = null;
    
    this.playerSockets.forEach((socket, playerId) => {
      if (socket === ws) {
        disconnectedPlayerId = playerId;
      }
    });

    if (disconnectedPlayerId) {
      this.playerSockets.delete(disconnectedPlayerId);

      // Notify opponent
      this.sessions.forEach((session, sessionId) => {
        if (session.players.includes(disconnectedPlayerId!)) {
          const opponentId = session.players.find(p => p !== disconnectedPlayerId);
          if (opponentId) {
            this.sendToPlayer(opponentId, {
              type: 'opponent_disconnected',
              message: 'Dein Partner hat das Spiel verlassen',
            });
          }

          // Remove session
          this.sessions.delete(sessionId);
        }
      });
    }
  }

  private sendToPlayer(userId: string, message: any) {
    const socket = this.playerSockets.get(userId);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }

  private generateTask() {
    const operation = Math.random() > 0.5 ? '+' : '-';
    let number1: number, number2: number, correctAnswer: number;

    if (operation === '+') {
      number1 = Math.floor(Math.random() * 15) + 1;
      number2 = Math.floor(Math.random() * (20 - number1)) + 1;
      correctAnswer = number1 + number2;
    } else {
      number1 = Math.floor(Math.random() * 15) + 5;
      number2 = Math.floor(Math.random() * number1) + 1;
      correctAnswer = number1 - number2;
    }

    return { operation, number1, number2, correctAnswer };
  }
}
