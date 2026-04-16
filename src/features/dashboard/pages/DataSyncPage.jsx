import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Database,
  FileText,
  Loader2,
  RefreshCw,
  Shield,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { normalizeAuthUser } from "../../../store/authSlice";
import { useGetSyncStatusQuery, useTriggerSyncMutation } from "../api/dashboardApi";

function Pill({ children, tone = "default" }) {
  const toneClass =
    tone === "primary"
      ? "border-primary/30 bg-primary/10 text-primary"
      : "border-border bg-muted/50 text-foreground";
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${toneClass}`}>{children}</span>;
}

export default function DataSyncPage() {
  const user = useSelector((s) => s.auth.user);
  const normalized = normalizeAuthUser(user);
  const isAdmin = normalized?.role === "admin" || Boolean(normalized?.isStaff);

  const { data: statusRes, refetch } = useGetSyncStatusQuery(undefined, { skip: !isAdmin });
  const [confirmSync, setConfirmSync] = useState(false);
  const [triggerSync, { isLoading: syncing }] = useTriggerSyncMutation();

  const last = statusRes?.data?.lastResult;

  const onSync = async () => {
    if (!confirmSync) {
      setConfirmSync(true);
      setTimeout(() => setConfirmSync(false), 5000);
      return;
    }
    setConfirmSync(false);
    await triggerSync().unwrap();
    refetch();
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Data Sync</h1>
          <p className="mt-1 text-muted-foreground">Sunbase CRM integration</p>
        </div>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-4 pt-6">
            <Shield className="h-8 w-8 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">Access Restricted</p>
              <p className="text-sm text-muted-foreground">
                Only administrators can access data sync controls.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Data Sync</h1>
        <p className="mt-1 text-muted-foreground">Pull latest data from Sunbase CRM into the dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="gap-0 border-border bg-card py-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <RefreshCw className="h-5 w-5 text-primary" />
              Manual Sync
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Pull fresh data from all Sunbase reports. This replaces current dashboard data.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div className="text-sm">
                <p className="font-medium text-amber-500">Full data refresh</p>
                <p className="mt-0.5 text-muted-foreground">
                  This clears and reloads all project, CX, doors, and appointment records.
                </p>
              </div>
            </div>
            <Button
              onClick={onSync}
              disabled={syncing}
              variant={confirmSync ? "destructive" : "default"}
              className="w-full"
              size="lg"
            >
              {syncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing from Sunbase...
                </>
              ) : confirmSync ? (
                <>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Click again to confirm sync
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="gap-0 border-border bg-card py-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <Clock className="h-5 w-5 text-primary" />
              Sync Configuration
            </CardTitle>
            <p className="text-sm text-muted-foreground">Current source and schedule settings</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Daily Sync</span>
              </div>
              <Pill tone="primary">10:00 AM EST</Pill>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Data Source</span>
              </div>
              <Pill>Sunbase CRM</Pill>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Reports</span>
              </div>
              <Pill>Job + CX + Doors + Appts</Pill>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="gap-0 border-border bg-card py-0">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Last Sync Result</CardTitle>
        </CardHeader>
        <CardContent>
          {!last ? (
            <p className="text-sm text-muted-foreground">No sync has completed yet in this environment.</p>
          ) : (
            <div className="space-y-4">
              <div
                className={`flex items-center gap-3 rounded-lg border p-4 ${
                  last.success ? "border-green-500/20 bg-green-500/10" : "border-destructive/20 bg-destructive/10"
                }`}
              >
                {last.success ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-destructive" />
                )}
                <div>
                  <p className={`font-semibold ${last.success ? "text-green-500" : "text-destructive"}`}>
                    {last.success ? "Sync Completed Successfully" : "Sync Failed"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {last.success
                      ? `Completed in ${((last.duration_ms || last.duration || 0) / 1000).toFixed(1)} seconds`
                      : last.error || "Unknown error"}
                  </p>
                </div>
              </div>

              {last.success ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Job List</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">projects</span>
                    </div>
                    <div className="text-sm text-foreground">
                      {(last.jobList?.inserted || 0).toLocaleString()} records imported
                    </div>
                  </div>
                  <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">CX Experience</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">cx_projects</span>
                    </div>
                    <div className="text-sm text-foreground">
                      {(last.cxExperience?.inserted || 0).toLocaleString()} records imported
                    </div>
                  </div>
                </div>
              ) : null}

              <pre className="max-h-[340px] overflow-auto rounded-lg border border-border bg-muted/30 p-4 text-xs text-foreground">
                {JSON.stringify(last, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
