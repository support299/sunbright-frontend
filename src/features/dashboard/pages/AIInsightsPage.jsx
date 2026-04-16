import { AlertCircle, Brain, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useDateFilter } from "../../../contexts/DateFilterContext";
import { extractApiErrors } from "../../../utils/extractApiErrors";
import { useGenerateInsightsMutation } from "../api/dashboardApi";

function formatMetricLine(m) {
  if (typeof m === "string") return m;
  if (m && typeof m === "object" && "metric" in m) {
    const status = m.status ? ` (${m.status})` : "";
    return `${m.metric}: ${m.value}${status}${m.insight ? ` — ${m.insight}` : ""}`;
  }
  return JSON.stringify(m);
}

function formatActionLine(a) {
  if (typeof a === "string") return a;
  if (a && typeof a === "object" && "action" in a) {
    return `${a.action}${a.owner ? ` · Owner: ${a.owner}` : ""}${a.priority ? ` · ${a.priority}` : ""}${
      a.expectedImpact ? ` — ${a.expectedImpact}` : ""
    }`;
  }
  return JSON.stringify(a);
}

export default function AIInsightsPage() {
  const { filterParams, hasFilter } = useDateFilter();
  const [generateInsights, { isLoading }] = useGenerateInsightsMutation();
  const [insight, setInsight] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setError(null);
    try {
      const body = {};
      if (filterParams?.dateFrom) body.dateFrom = filterParams.dateFrom;
      if (filterParams?.dateTo) body.dateTo = filterParams.dateTo;
      const response = await generateInsights(body).unwrap();
      setInsight(response?.data || null);
    } catch (err) {
      const { generalErrors, fieldErrors } = extractApiErrors(err);
      const msg =
        generalErrors[0] ||
        fieldErrors.llm?.[0] ||
        err?.message ||
        "Could not generate insights.";
      setError(String(msg));
      setInsight(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Insights</h1>
          <p className="mt-1 text-muted-foreground">
            Summaries and recommendations from dashboard metrics
            {hasFilter ? " (respects the header date filter)." : " (all time unless you set a date range in the header)."}{" "}
            With <code className="rounded bg-muted px-1 py-0.5 text-xs">BUILT_IN_FORGE_API_KEY</code> set on the server,
            generation uses the same LLM path as sunbright-dashboard; otherwise results are rule-based from your data.
          </p>
        </div>
        <Button type="button" onClick={handleGenerate} disabled={isLoading} className="gap-2">
          <Sparkles className="h-4 w-4" />
          {isLoading ? "Generating..." : "Generate insights"}
        </Button>
      </div>

      {error ? (
        <div
          className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      ) : null}

      {insight?.insightSource === "heuristic" ? (
        <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground" role="status">
          Showing <span className="font-medium text-foreground">rule-based insights</span> (no LLM API key). Add{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">BUILT_IN_FORGE_API_KEY</code> for full AI analysis.
        </p>
      ) : null}

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
              "Run a generation to produce an executive summary from your current metrics (LLM optional)."}
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
                {formatMetricLine(m)}
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
                {formatActionLine(m)}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>

      {(insight?.repInsights?.length ||
        insight?.teamInsights?.length ||
        insight?.retentionInsights?.length ||
        insight?.cxInsights?.length) ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {insight?.repInsights?.length ? (
            <Card className="gap-0 border-border bg-card py-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Rep insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insight.repInsights.map((r, i) => (
                  <div key={i} className="rounded-lg border border-border/50 bg-muted/10 p-3 text-sm">
                    <p className="font-medium text-foreground">{r.repName}</p>
                    <p className="mt-1 text-muted-foreground">
                      <span className="text-green-600 dark:text-green-400">Strength: </span>
                      {r.strength}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      <span className="text-amber-600 dark:text-amber-400">Improve: </span>
                      {r.improvement}
                    </p>
                    <p className="mt-1 text-primary">{r.recommendation}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
          {insight?.teamInsights?.length ? (
            <Card className="gap-0 border-border bg-card py-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Team insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insight.teamInsights.map((t, i) => (
                  <div key={i} className="rounded-lg border border-border/50 bg-muted/10 p-3 text-sm">
                    <p className="font-medium text-foreground">{t.teamName}</p>
                    <p className="mt-1 text-muted-foreground">{t.strength}</p>
                    <p className="mt-1 text-muted-foreground">{t.improvement}</p>
                    <p className="mt-1 text-primary">{t.recommendation}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
          {insight?.retentionInsights?.length ? (
            <Card className="gap-0 border-border bg-card py-0 lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Retention & pipeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {insight.retentionInsights.map((r, i) => (
                  <div key={i} className="flex flex-wrap gap-2 rounded-lg border border-border/50 bg-muted/10 p-3 text-sm">
                    <span className="rounded bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">{r.priority}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{r.area}</p>
                      <p className="text-muted-foreground">{r.finding}</p>
                      <p className="mt-1 text-primary">{r.recommendation}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
          {insight?.cxInsights?.length ? (
            <Card className="gap-0 border-border bg-card py-0 lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Customer experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {insight.cxInsights.map((c, i) => (
                  <div key={i} className="flex flex-wrap gap-2 rounded-lg border border-border/50 bg-muted/10 p-3 text-sm">
                    <span className="rounded bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">{c.priority}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{c.area}</p>
                      <p className="text-muted-foreground">{c.finding}</p>
                      <p className="mt-1 text-primary">{c.recommendation}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
