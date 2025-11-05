import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageCircle, Send, Clock, Download } from "lucide-react";
import { answerQuestion } from "@/lib/groq";
import { generateQAPDF } from "@/lib/pdfUtils";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface VideoQAProps {
  subtitles: string;
}

const VideoQA = ({ subtitles }: VideoQAProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    const question = input;
    setInput("");
    setLoading(true);

    try {
      const response = await answerQuestion(subtitles, question);
      const assistantMessage: Message = { role: "assistant", content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = { 
        role: "assistant", 
        content: "Sorry, I encountered an error. Please try again." 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 shadow-elegant hover:shadow-glow transition-all duration-300 border-2 border-transparent hover:border-primary/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Ask Questions</h3>
        </div>
        {messages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateQAPDF(messages)}
            className="gap-2 border-primary/30 hover:bg-accent"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        )}
      </div>
      
      <div className="mb-4 p-4 gradient-accent rounded-lg flex items-start gap-2 text-sm border-l-4 border-primary shadow-soft">
        <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
        <p className="text-muted-foreground">
          <strong className="text-foreground">Tip:</strong> Ask timestamp-based questions like "What did they say about AI at minute 5?" or "Summarize what happens at 10:30"
        </p>
      </div>

      <div className="space-y-4 mb-4 min-h-[300px] max-h-[500px] overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            Ask questions about the video content...
          </p>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`rounded-lg px-4 py-3 max-w-[80%] shadow-soft ${
                message.role === "user"
                  ? "gradient-primary text-primary-foreground"
                  : "gradient-accent text-foreground border border-border"
              }`}
            >
              {message.role === "assistant" ? (
                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-headings:text-foreground prose-strong:text-foreground">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                <span>{message.content}</span>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="gradient-accent rounded-lg px-4 py-3 border border-border shadow-soft">
              <span className="animate-pulse text-primary">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Ask about the video content..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          className="border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
        <Button onClick={handleSend} disabled={loading || !input.trim()} className="gradient-primary shadow-elegant hover:opacity-90">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default VideoQA;
