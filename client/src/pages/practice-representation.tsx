import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdaptiveMathLab } from "@/components/math/AdaptiveMathLab";
import { LogOut, Star, Trophy, Target, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface RepresentationConfig {
  twentyFrame: boolean;
  numberLine: boolean;
  counters: boolean;
  fingers: boolean;
  symbolic: boolean;
}

interface TaskData {
  number1?: number | null;
  number2?: number | null;
  operation?: '+' | '-' | null;
  correctAnswer?: number | null;
  numberRange: number;
  representationConfig: RepresentationConfig;
  placeholderInSymbolic: 'number1' | 'operator' | 'number2' | 'result' | 'none';
  missingSymbolic: boolean;
  requiresOperatorInput: boolean;
}

export default function PracticeRepresentation() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      window.location.href = '/login';
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentTask, setCurrentTask] = useState<TaskData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  
  const [totalTasks, setTotalTasks] = useState(0);
  const [correctTasks, setCorrectTasks] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [stars, setStars] = useState(0);
  
  const [repConfig, setRepConfig] = useState<RepresentationConfig | null>(null);
  const [activeCount, setActiveCount] = useState(5);
  const [stage, setStage] = useState(1);
  const [stageDescription, setStageDescription] = useState("");

  useEffect(() => {
    createSession();
    loadRepresentationConfig();
  }, []);
  
  const createSession = async () => {
    try {
      const response = await apiRequest('POST', '/api/sessions', {
        sessionType: 'practice',
        numberRange: 20
      });
      const data = await response.json();
      setSessionId(data.id);
      loadTask();
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };
  
  const loadRepresentationConfig = async () => {
    try {
      const response = await apiRequest('GET', '/api/representation/config', {});
      const data = await response.json();
      setRepConfig(data.config);
      setActiveCount(data.activeCount);
      setStage(data.progression.stage);
      setStageDescription(data.stageDescription);
    } catch (error) {
      console.error("Failed to load representation config:", error);
    }
  };
  
  const loadTask = async () => {
    try {
      const response = await apiRequest('POST', '/api/representation/generate-task', {
        numberRange: 20
      });
      const data = await response.json();
      
      setCurrentTask(data.task);
      setRepConfig(data.config);
      setActiveCount(data.activeCount);
      setStage(data.stage);
      setStageDescription(data.stageDescription);
      setStartTime(Date.now());
    } catch (error) {
      console.error("Failed to load task:", error);
    }
  };
  
  const handleSolutionComplete = async (userAnswer: any) => {
    if (!currentTask || !sessionId) return;
    
    setIsSubmitting(true);
    const timeTaken = (Date.now() - startTime) / 1000;
    
    let isCorrect = false;
    
    if (currentTask.placeholderInSymbolic === 'result') {
      isCorrect = userAnswer.result === currentTask.correctAnswer;
    } else if (currentTask.placeholderInSymbolic === 'number1') {
      isCorrect = userAnswer.number1 === currentTask.number1;
    } else if (currentTask.placeholderInSymbolic === 'number2') {
      isCorrect = userAnswer.number2 === currentTask.number2;
    } else if (currentTask.placeholderInSymbolic === 'operator') {
      isCorrect = userAnswer.operator === currentTask.operation;
    }
    
    try {
      const submitResponse = await apiRequest('POST', '/api/representation/submit-task', {
        sessionId,
        isCorrect,
        timeTaken,
        userAnswer,
        activeRepresentations: currentTask.representationConfig
      });
      
      const submitData = await submitResponse.json();
      
      setTotalTasks(prev => prev + 1);
      if (isCorrect) {
        setCorrectTasks(prev => prev + 1);
        setCurrentStreak(prev => prev + 1);
        setStars(prev => prev + 1);
        
        toast({
          title: "Richtig! ✨",
          description: `${currentStreak + 1} in Folge! ${submitData.message || ''}`,
        });
      } else {
        setCurrentStreak(0);
        toast({
          title: "Noch nicht ganz",
          description: "Versuche es nochmal!",
          variant: "destructive"
        });
      }
      
      if (submitData.evaluation?.shouldAdjust) {
        toast({
          title: submitData.evaluation.direction === 'reduce' ? "Level Up! 🎯" : "Mehr Unterstützung 💡",
          description: submitData.message,
        });
      }
      
      setTimeout(() => {
        loadTask();
        setIsSubmitting(false);
      }, 1500);
      
    } catch (error) {
      console.error("Failed to submit:", error);
      setIsSubmitting(false);
    }
  };

  const successRate = totalTasks > 0 ? (correctTasks / totalTasks) * 100 : 0;

  return (
    <div className="h-screen w-full flex flex-col bg-background" data-testid="practice-representation-page">
      <div className="h-[20%] border-b bg-card/50 flex items-center px-6">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-2xl font-bold">
                Hallo, {user?.firstName || user?.username}!
              </h1>
              <p className="text-sm text-muted-foreground">
                {stageDescription}
              </p>
            </div>
            
            <Badge variant="outline" className="h-9 px-3 gap-2">
              <Eye className="h-4 w-4" />
              {activeCount}/5 Darstellungen
            </Badge>
            
            <Badge variant="outline" className="h-9 px-3 gap-2">
              <Target className="h-4 w-4" />
              Stufe {stage}
            </Badge>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-muted-foreground">
            {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-xl font-bold">{stars}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold">{currentStreak}</span>
            </div>
            
            <Badge variant={successRate >= 80 ? "default" : "secondary"} className="h-9 px-3">
              {Math.round(successRate)}% Richtig
            </Badge>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 flex items-center justify-center">
        <Card className="w-full max-w-6xl h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-center">
              {currentTask?.missingSymbolic 
                ? "Finde die passende Rechnung!" 
                : "Löse die Aufgabe!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-4rem)]">
            {currentTask && repConfig && (
              <AdaptiveMathLab
                taskNumber1={currentTask.number1}
                taskNumber2={currentTask.number2}
                taskOperation={currentTask.operation}
                taskResult={currentTask.correctAnswer}
                numberRange={currentTask.numberRange}
                representationConfig={repConfig}
                placeholderInSymbolic={currentTask.placeholderInSymbolic}
                onSolutionComplete={handleSolutionComplete}
                className="h-full"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="h-16 border-t bg-card/50 flex items-center justify-center px-6">
        <div className="w-full max-w-6xl">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground min-w-24">
              Fortschritt:
            </span>
            <Progress value={(correctTasks / Math.max(1, totalTasks)) * 100} className="flex-1" />
            <span className="text-sm font-medium min-w-24 text-right">
              {correctTasks}/{totalTasks} Aufgaben
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
