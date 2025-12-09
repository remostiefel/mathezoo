
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FeedbackOption {
  value: string;
  label: string;
  emoji: string;
}

interface FeedbackQuestion {
  id: string;
  category: string;
  questionText: string;
  options: FeedbackOption[];
}

interface QuickFeedbackModalProps {
  open: boolean;
  onClose: () => void;
  question: FeedbackQuestion;
  userId: string;
  context?: Record<string, any>;
}

export function QuickFeedbackModal({
  open,
  onClose,
  question,
  userId,
  context = {}
}: QuickFeedbackModalProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!selectedAnswer) return;

    setIsSubmitting(true);
    try {
      await apiRequest('POST', '/api/feedback', {
        userId,
        questionId: question.id,
        answer: selectedAnswer,
        context
      });

      // Belohnung: +10 Münzen für Feedback
      toast({
        title: "Danke für dein Feedback! 🎉",
        description: "+10 Münzen verdient!",
        className: "bg-green-50 border-green-200"
      });

      onClose();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast({
        title: "Fehler",
        description: "Feedback konnte nicht gespeichert werden",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <Card className="border-4 border-blue-300">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-100">
            <CardTitle className="text-2xl text-center">
              {question.questionText}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {/* Multiple Choice Options */}
            <div className="grid grid-cols-1 gap-3">
              {question.options.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedAnswer === option.value ? "default" : "outline"}
                  size="lg"
                  onClick={() => setSelectedAnswer(option.value)}
                  className="h-20 text-xl justify-start px-6 border-2 hover:scale-105 transition-transform"
                >
                  <span className="text-3xl mr-4">{option.emoji}</span>
                  <span>{option.label}</span>
                </Button>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Überspringen
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedAnswer || isSubmitting}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
              >
                {isSubmitting ? "Speichern..." : "Absenden 🎁"}
              </Button>
            </div>

            {/* Incentive */}
            <p className="text-center text-sm text-gray-600">
              💰 Für jede Antwort bekommst du 10 Münzen!
            </p>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
