import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Loader2, Clock, Send, Download } from "lucide-react";
import { useState } from "react";
import { answerQuestion } from "@/lib/groq";
import { generateSummaryPDF } from "@/lib/pdfUtils";
import ReactMarkdown from "react-markdown";

interface VideoSummaryProps {
  data: { summary: string; minuteByMinute: string[]; keyPoints: string[] } | null;
  subtitles: string;
}

const VideoSummary = ({ data, subtitles }: VideoSummaryProps) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await answerQuestion(subtitles, question);
      setAnswer(response);
    } catch (error) {
      setAnswer("Sorry, I couldn't process your question. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  if (!data) {
    return (
      <Card className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading summary...</p>
        </div>
      </Card>
    );
  }

  const { summary, minuteByMinute, keyPoints } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="p-8 shadow-elegant hover:shadow-glow transition-all duration-300 border-2 border-transparent hover:border-primary/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-accent">
              <FileText className="h-5 w-5 text-accent-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Video Summary</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateSummaryPDF(summary, keyPoints, minuteByMinute)}
            className="gap-2 border-primary/30 hover:bg-accent"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
        
        <div className="space-y-6">
          {/* Overall Summary */}
          <div>
            <h4 className="text-base font-semibold mb-3 flex items-center gap-2">
              <span className="text-xl">📝</span>
              Overall Summary
            </h4>
            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-p:text-muted-foreground">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </div>

          {/* Minute by Minute Summary */}
          {minuteByMinute && minuteByMinute.length > 0 && (
            <div>
              <h4 className="text-base font-semibold mb-3 flex items-center gap-2">
                <span className="text-xl">⏱️</span>
                Minute-by-Minute Breakdown
              </h4>
              <ul className="space-y-3">
                {minuteByMinute.map((minute, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-lg gradient-accent hover:shadow-soft transition-all duration-200">
                    <span className="text-primary font-bold text-sm mt-0.5 min-w-[20px]">•</span>
                    <span className="text-foreground leading-relaxed text-sm">{minute}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-8 shadow-elegant hover:shadow-glow transition-all duration-300 border-2 border-transparent hover:border-primary/20">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <span className="text-2xl">📌</span>
          Key Points
        </h3>
        <ul className="space-y-4">
          {keyPoints.map((point, index) => (
            <li key={index} className="flex items-start gap-3 p-4 rounded-lg gradient-accent hover:shadow-soft transition-all duration-200">
              <span className="text-black dark:text-white font-bold text-lg mt-0.5 min-w-[24px]">{index + 1}.</span>
              <span className="text-foreground leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-8 shadow-elegant hover:shadow-glow transition-all duration-300 border-2 border-transparent hover:border-primary/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg gradient-accent">
            <Clock className="h-5 w-5 text-accent-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Ask About Specific Moments</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6 gradient-accent p-4 rounded-lg border-l-4 border-primary shadow-soft">
          💡 <strong>Tip:</strong> Try asking "What did they say about [topic] at minute [X]?"
        </p>
        <div className="flex gap-2 mb-6">
          <Input
            placeholder="e.g., What did they discuss at minute 5?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAskQuestion()}
            className="border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <Button 
            onClick={handleAskQuestion} 
            disabled={isLoading || !question.trim()}
            className="gradient-primary text-white hover:opacity-90 transition-opacity shadow-elegant"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        {answer && (
          <div className="gradient-accent p-6 rounded-lg border-l-4 border-primary animate-fade-in shadow-soft">
            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-p:my-2 prose-headings:text-foreground prose-headings:font-bold prose-headings:my-3 prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-strong:text-foreground prose-strong:font-bold prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
              <ReactMarkdown>{answer}</ReactMarkdown>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default VideoSummary;
