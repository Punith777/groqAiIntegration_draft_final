import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Award, Loader2, Download, CheckCircle2, XCircle } from "lucide-react";
import { evaluateShortAnswer } from "@/lib/groq";
import { generateAssessmentPDF } from "@/lib/pdfUtils";
import ReactMarkdown from "react-markdown";

interface MCQ {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface ShortAnswer {
  question: string;
  answer: string;
}

interface VideoAssessmentProps {
  data: { mcqs: MCQ[]; shortQuestions: ShortAnswer[] } | null;
  subtitles: string;
}

const VideoAssessment = ({ data, subtitles }: VideoAssessmentProps) => {
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, number>>({});
  const [shortAnswers, setShortAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [score, setScore] = useState<{
    mcq: number;
    short: number;
    total: number;
  } | null>(null);
  const [shortFeedback, setShortFeedback] = useState<Record<number, { score: number; feedback: string }>>({});

  useEffect(() => {
    setMcqAnswers({});
    setShortAnswers({});
    setSubmitted(false);
    setScore(null);
    setShortFeedback({});
  }, [data]);

  if (!data) {
    return (
      <Card className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Generating assessment...</p>
        </div>
      </Card>
    );
  }

  const { mcqs, shortQuestions } = data;

  const handleSubmit = async () => {
    setEvaluating(true);

    // Calculate MCQ score
    let mcqScore = 0;
    mcqs.forEach((mcq, index) => {
      if (mcqAnswers[index] === mcq.correct) {
        mcqScore++;
      }
    });

    // Evaluate short answers
    let shortScore = 0;
    const feedback: Record<number, { score: number; feedback: string }> = {};
    
    for (let i = 0; i < data.shortQuestions.length; i++) {
      const answer = shortAnswers[i] || "";
      try {
        const result = await evaluateShortAnswer(
          data.shortQuestions[i].question,
          data.shortQuestions[i].answer,
          answer
        );
        shortScore += result.score;
        feedback[i] = result;
      } catch (error) {
        console.error("Error evaluating answer:", error);
        feedback[i] = {
          score: 0,
          feedback: "Error evaluating your answer. Please try again."
        };
      }
    }
    
    setShortFeedback(feedback);

    setScore({
      mcq: mcqScore,
      short: Math.round(shortScore * 10) / 10,
      total: mcqScore + Math.round(shortScore * 10) / 10,
    });
    setSubmitted(true);
    setEvaluating(false);
  };

  const handleReset = () => {
    setMcqAnswers({});
    setShortAnswers({});
    setSubmitted(false);
    setScore(null);
    setShortFeedback({});
  };

  if (submitted && score) {
    return (
      <Card className="p-8 shadow-elegant hover:shadow-glow transition-all duration-300 border-2 border-transparent hover:border-primary/20">
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div className="text-center flex-1 space-y-4">
              <Award className="h-16 w-16 text-primary mx-auto" />
              <div>
                <h3 className="text-2xl font-bold mb-2">Assessment Complete!</h3>
                <p className="text-4xl font-bold gradient-primary text-transparent bg-clip-text mb-4">{score.total} / 11</p>
                <div className="space-y-2 text-muted-foreground">
                  <p>Multiple Choice: {score.mcq} / 5</p>
                  <p>Short Answer: {score.short} / 6</p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => generateAssessmentPDF(data.mcqs, data.shortQuestions, mcqAnswers, shortAnswers, (score.total / 11) * 100, submitted)}
              className="gap-2 border-primary/30 hover:bg-accent self-start"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Multiple Choice Questions</h3>
              {data.mcqs.map((mcq, idx) => {
                const userAnswer = mcqAnswers[idx];
                const isCorrect = userAnswer === mcq.correct;
                
                return (
                  <Card key={idx} className={`p-6 shadow-soft ${isCorrect ? "border-green-500 bg-green-50/50 dark:bg-green-950/20" : "border-red-500 bg-red-50/50 dark:bg-red-950/20"} border-2`}>
                    <div className="flex items-start gap-3 mb-4">
                      {isCorrect ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <h5 className="font-semibold mb-2">Question {idx + 1}</h5>
                        <p className="mb-4 text-foreground">{mcq.question}</p>
                        <div className="space-y-2">
                          {mcq.options.map((option, optIdx) => {
                            const isUserAnswer = userAnswer === optIdx;
                            const isCorrectAnswer = mcq.correct === optIdx;
                            return (
                              <div
                                key={optIdx}
                                className={`p-3 rounded-lg transition-all ${
                                  isCorrectAnswer
                                    ? "bg-green-100 dark:bg-green-900/40 border-2 border-green-500"
                                    : isUserAnswer
                                    ? "bg-red-100 dark:bg-red-900/40 border-2 border-red-500"
                                    : "bg-muted/50"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isCorrectAnswer && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                  {isUserAnswer && !isCorrectAnswer && <XCircle className="h-4 w-4 text-red-500" />}
                                  <span className={isCorrectAnswer || isUserAnswer ? "font-medium" : ""}>
                                    {String.fromCharCode(65 + optIdx)}. {option}
                                    {isUserAnswer && " (Your answer)"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {mcq.explanation && (
                          <div className="mt-4 p-4 gradient-accent rounded-lg border-l-4 border-primary shadow-soft">
                            <p className="text-sm font-semibold text-primary mb-2">💡 Explanation:</p>
                            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed">
                              <ReactMarkdown>{mcq.explanation}</ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Short Answer Questions</h3>
              {data.shortQuestions.map((q, idx) => (
                <Card key={idx} className="p-6 shadow-soft border-2 border-border hover:border-primary/30 transition-all">
                  <h5 className="font-semibold mb-2">Question {idx + 1}</h5>
                  <p className="mb-4 text-foreground">{q.question}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        Your Answer:
                      </p>
                      <div className="p-4 gradient-accent rounded-lg border-l-4 border-primary/50">
                        <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed">
                          <ReactMarkdown>{shortAnswers[idx] || "No answer provided"}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-secondary"></span>
                        Model Answer:
                      </p>
                      <div className="p-4 gradient-accent rounded-lg border-l-4 border-secondary">
                        <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed">
                          <ReactMarkdown>{q.answer}</ReactMarkdown>
                        </div>
                      </div>
                    </div>

                    {shortFeedback[idx] && (
                      <div className="p-4 gradient-accent rounded-lg border-l-4 border-primary shadow-soft">
                        <p className="font-semibold gradient-primary text-transparent bg-clip-text mb-2 text-lg">
                          Score: {shortFeedback[idx].score} / 2
                        </p>
                        <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed">
                          <ReactMarkdown>{shortFeedback[idx].feedback}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Button onClick={handleReset} className="w-full border-primary/30 hover:bg-accent shadow-soft" variant="outline" size="lg">
            Retake Assessment
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="p-8 shadow-elegant hover:shadow-glow transition-all duration-300 border-2 border-transparent hover:border-primary/20">
        <h3 className="text-xl font-semibold mb-6 gradient-primary text-transparent bg-clip-text">Multiple Choice Questions (1 mark each)</h3>
        <div className="space-y-6">
          {mcqs.map((mcq, index) => (
            <Card key={index} className="p-6 shadow-soft border-2 border-border hover:border-primary/30 transition-all">
              <h5 className="font-semibold mb-3 text-primary">Question {index + 1}</h5>
              <p className="font-medium mb-4 text-foreground leading-relaxed">{mcq.question}</p>
              <RadioGroup
                value={mcqAnswers[index]?.toString()}
                onValueChange={(value) =>
                  setMcqAnswers(prev => ({ ...prev, [index]: parseInt(value) }))
                }
              >
                {mcq.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center space-x-2 p-3 hover:gradient-accent rounded-lg transition-all border border-transparent hover:border-primary/20">
                    <RadioGroupItem value={optIndex.toString()} id={`q${index}-${optIndex}`} />
                    <Label htmlFor={`q${index}-${optIndex}`} className="cursor-pointer flex-1">
                      {String.fromCharCode(65 + optIndex)}. {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </Card>
          ))}
        </div>
      </Card>

      <Card className="p-8 shadow-elegant hover:shadow-glow transition-all duration-300 border-2 border-transparent hover:border-primary/20">
        <h3 className="text-xl font-semibold mb-6 gradient-primary text-transparent bg-clip-text">Short Answer Questions (2 marks each)</h3>
        <div className="space-y-6">
          {shortQuestions.map((q, index) => (
            <Card key={index} className="p-6 shadow-soft border-2 border-border hover:border-primary/30 transition-all">
              <h5 className="font-semibold mb-3 text-primary">Question {index + 1}</h5>
              <p className="font-medium mb-4 text-foreground leading-relaxed">{q.question}</p>
              <Textarea
                placeholder="Type your answer here..."
                value={shortAnswers[index] || ""}
                onChange={(e) =>
                  setShortAnswers(prev => ({ ...prev, [index]: e.target.value }))
                }
                rows={4}
                className="border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all min-h-[120px]"
              />
            </Card>
          ))}
        </div>
      </Card>

      <Button onClick={handleSubmit} className="w-full gradient-primary text-white shadow-elegant hover:opacity-90 transition-all hover:shadow-glow" size="lg" disabled={evaluating}>
        {evaluating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Evaluating your answers...
          </>
        ) : (
          "Submit Assessment"
        )}
      </Button>
    </div>
  );
};

export default VideoAssessment;
