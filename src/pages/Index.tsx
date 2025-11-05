import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoSummary from "@/components/VideoSummary";
import VideoQA from "@/components/VideoQA";
import VideoAssessment from "@/components/VideoAssessment";
import { Video, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateSummary, generateAssessment } from "@/lib/groq";

const Index = () => {
  const [subtitles, setSubtitles] = useState("");
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<{ summary: string; minuteByMinute: string[]; keyPoints: string[] } | null>(null);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!subtitles.trim()) {
      toast({
        title: "Error",
        description: "Please enter video subtitles",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const [summary, assessment] = await Promise.all([
        generateSummary(subtitles),
        generateAssessment(subtitles)
      ]);
      
      setSummaryData(summary);
      setAssessmentData(assessment);
      setIsAnalyzed(true);
      
      toast({
        title: "Analysis Complete",
        description: "Video content has been analyzed successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze content. Please try again.",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-elegant">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-primary">
              <Video className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-primary">
              Video Insight Generator
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="p-8 mb-8 shadow-elegant hover:shadow-glow transition-shadow duration-300 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-accent">
              <FileText className="h-5 w-5 text-accent-foreground" />
            </div>
            <h2 className="text-xl font-semibold">Enter Video Subtitles</h2>
          </div>
          <Textarea
            placeholder="Paste your video subtitles or podcast transcript here..."
            value={subtitles}
            onChange={(e) => setSubtitles(e.target.value)}
            className="min-h-[200px] mb-6 border-2 focus:border-primary transition-colors"
          />
          <Button 
            onClick={handleAnalyze} 
            disabled={loading || !subtitles.trim()} 
            className="w-full gradient-primary text-white hover:opacity-90 transition-opacity h-12 text-base font-semibold shadow-elegant"
          >
            {loading ? "Analyzing..." : "Analyze Content"}
          </Button>
        </Card>

        {isAnalyzed && (
          <Tabs defaultValue="summary" className="w-full animate-fade-in">
            <TabsList className="grid w-full grid-cols-3 h-12 bg-card shadow-elegant">
              <TabsTrigger value="summary" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
                Summary
              </TabsTrigger>
              <TabsTrigger value="qa" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
                Q&A
              </TabsTrigger>
              <TabsTrigger value="assessment" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
                Assessment
              </TabsTrigger>
            </TabsList>
            <TabsContent value="summary">
              <VideoSummary data={summaryData} subtitles={subtitles} />
            </TabsContent>
            <TabsContent value="qa">
              <VideoQA subtitles={subtitles} />
            </TabsContent>
            <TabsContent value="assessment">
              <VideoAssessment data={assessmentData} subtitles={subtitles} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Index;
