import { Brain, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useGenerateInsightsMutation } from "../api/dashboardApi";

export default function AIInsightsPage() {
  const [generateInsights, { isLoading }] = useGenerateInsightsMutation();
  const [insight, setInsight] = useState(null);

  const handleGenerate = async () => {
    const response = await generateInsights({}).unwrap();
    setInsight(response?.data || null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Insights</h1>
          <p className="mt-1 text-muted-foreground">Summaries and recommendations powered by your connected models</p>
        </div>
        <Button type="button" onClick={handleGenerate} disabled={isLoading} className="gap-2">
          <Sparkles className="h-4 w-4" />
          {isLoading ? "Generating..." : "Generate insights"}
        </Button>
      </div>

      <Card className="gap-0 border-border bg-card py-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Brain className="h-5 w-5 text-primary" />
            Executive summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {insight?.executiveSummary ||
              "Run a generation to produce an executive summary, or connect an LLM provider in the backend to replace the placeholder response."}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="gap-0 border-border bg-card py-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Key metrics highlights</CardTitle>
          </CardHeader>
          <CardContent>
            {(insight?.keyMetrics?.length ? insight.keyMetrics : ["No metric highlights yet."]).map((m, i) => (
              <p key={i} className="border-b border-border/50 py-2 text-sm text-foreground last:border-0">
                {typeof m === "string" ? m : JSON.stringify(m)}
              </p>
            ))}
          </CardContent>
        </Card>
        <Card className="gap-0 border-border bg-card py-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Action items</CardTitle>
          </CardHeader>
          <CardContent>
            {(insight?.actionItems?.length ? insight.actionItems : ["No action items yet."]).map((m, i) => (
              <p key={i} className="border-b border-border/50 py-2 text-sm text-foreground last:border-0">
                {typeof m === "string" ? m : JSON.stringify(m)}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
