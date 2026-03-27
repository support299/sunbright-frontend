import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Star,
  Target,
  Timer,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import StatCard from "../../../components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { TOOLTIP_STYLE } from "../../../lib/chartTheme";
import { formatDateShort } from "../../../lib/formatters";
import { useDateFilter } from "../../../contexts/DateFilterContext";
import { useGetCustomerExperienceQuery } from "../api/dashboardApi";

const STAGE_COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6"];

function fmt(v, decimals = 1) {
  if (v == null || Number.isNaN(Number(v))) return "-";
  return Number(v).toFixed(decimals);
}

export default function CustomerExperiencePage() {
  const { filterParams } = useDateFilter();
  const { data: res, isLoading } = useGetCustomerExperienceQuery(filterParams);

  const bundle = res?.data || {};
  const overview = bundle.overview || {};
  const byInstaller = bundle.byInstaller || [];
  const statusBreakdown = bundle.statusBreakdown || [];
  const timelineByInstaller = bundle.timelineByInstaller || [];
  const reviewTiming = bundle.reviewTiming || {};
  const reviewStages = bundle.reviewStages || [];
  const reviewDetails = bundle.reviewDetails || [];

  const [installerFilter, setInstallerFilter] = useState("all");

  const filteredProjects = useMemo(() => {
    const list = bundle.projectList || [];
    if (installerFilter === "all") return list;
    return list.filter((p) => p.installer === installerFilter);
  }, [bundle.projectList, installerFilter]);

  const reviewGoalPct = Number(overview.reviewCaptureRate) || 0;
  const totalInstalls = Number(overview.totalInstalls) || 0;
  const reviewsCaptured = Number(overview.reviewsCaptured) || 0;
  const reviewsNeeded = Math.max(0, Math.ceil(totalInstalls * 0.5 - reviewsCaptured));

  const statusBarData = statusBreakdown
    .map((s) => ({
      status: s.job_status || "Unknown",
      shortStatus:
        (s.job_status || "Unknown").length > 22
          ? `${(s.job_status || "Unknown").slice(0, 22)}...`
          : s.job_status || "Unknown",
      count: Number(s.count) || 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const timelineCompData = timelineByInstaller.map((t) => ({
    installer: t.installer,
    "Install to Inspection": Number(t.avgInstallToInspection) || 0,
    "Install to PTO Submit": Number(t.avgInstallToPtoSubmitted) || 0,
    "Install to PTO Approved": Number(t.avgInstallToPtoApproved) || 0,
  }));

  const stageData = reviewStages
    .map((s) => ({ name: s.stage, value: Number(s.count) || 0 }))
    .filter((s) => s.value > 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customer Experience</h1>
          <p className="mt-1 text-muted-foreground">Loading post-installation metrics...</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Customer Experience</h1>
        <p className="mt-1 text-muted-foreground">
          Post-installation performance tracking - reviews, inspections, and PTO timelines
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Installations"
          value={totalInstalls}
          subtitle={`${Number(overview.inspectionPassedCount) || 0} inspections passed`}
          icon={CheckCircle2}
        />
        <StatCard
          title="Review Capture Rate"
          value={`${fmt(overview.reviewCaptureRate)}%`}
          subtitle={`${reviewsCaptured} of ${totalInstalls} - Goal: 50%`}
          icon={Star}
        />
        <StatCard
          title="Avg. Days to Review"
          value={reviewTiming.avgDaysToReview != null ? `${fmt(reviewTiming.avgDaysToReview)} days` : "-"}
          subtitle={`Range: ${reviewTiming.minDaysToReview ?? "-"}-${reviewTiming.maxDaysToReview ?? "-"} days`}
          icon={Timer}
        />
        <StatCard
          title="Avg. Install to PTO Approved"
          value={overview.avgInstallToPtoApproved != null ? `${fmt(overview.avgInstallToPtoApproved)} days` : "-"}
          subtitle={`PTO submitted avg: ${fmt(overview.avgInstallToPtoSubmitted)} days`}
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="gap-0 border-border bg-card py-0">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Target className="h-4 w-4 text-primary" />
              50% Review Capture Goal
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Progress toward capturing positive Google reviews on 50% of installations
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="h-44 w-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Current", value: Math.max(0, Math.min(100, reviewGoalPct)) },
                        { name: "Remaining", value: Math.max(0, 100 - Math.max(0, Math.min(100, reviewGoalPct))) },
                      ]}
                      cx="50%"
                      cy="60%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={55}
                      outerRadius={78}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill={reviewGoalPct >= 50 ? "#10b981" : reviewGoalPct >= 30 ? "#f59e0b" : "#ef4444"} />
                      <Cell fill="oklch(0.25 0.01 260)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-4xl font-bold text-foreground">{reviewGoalPct.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">of 50% target</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reviews captured</span>
                    <span className="font-medium text-foreground">{reviewsCaptured}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Still needed for 50%</span>
                    <span className="font-medium text-foreground">{reviewsNeeded}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Testimonial potential</span>
                    <span className="font-medium text-foreground">{Number(overview.testimonialPotentials) || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Testimonials done</span>
                    <span className="font-medium text-foreground">{Number(overview.testimonialsCompleted) || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 border-border bg-card py-0">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              When Do Reviews Arrive?
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Distribution of review capture timing relative to installation date
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Timing Distribution</p>
                {[
                  { label: "Within 1 day", value: Number(reviewTiming.reviewsWithin1Day) || 0, color: "bg-green-500" },
                  { label: "Within 3 days", value: Number(reviewTiming.reviewsWithin3Days) || 0, color: "bg-amber-500" },
                  { label: "Within 7 days", value: Number(reviewTiming.reviewsWithin7Days) || 0, color: "bg-blue-500" },
                ].map((item) => {
                  const total = Number(reviewTiming.totalReviews) || 0;
                  const pct = total ? (item.value / total) * 100 : 0;
                  return (
                    <div key={item.label}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium text-foreground">
                          {item.value} / {total}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${Math.min(100, pct)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">At What Stage?</p>
                {stageData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={170}>
                    <PieChart>
                      <Pie data={stageData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                        {stageData.map((_, i) => (
                          <Cell key={i} fill={STAGE_COLORS[i % STAGE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">No review stage data</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="gap-0 border-amber-500/30 bg-amber-500/10 py-0">
        <CardContent className="flex items-start gap-3 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-foreground">Key Insight: Reviews arrive within the first week</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {Number(reviewTiming.totalReviews) || 0} captured reviews arrived within {reviewTiming.maxDaysToReview ?? "-"} days of
              installation (average {fmt(reviewTiming.avgDaysToReview)} days). Current capture rate is {reviewGoalPct.toFixed(1)}% vs
              50% goal, so {reviewsNeeded} more reviews are needed from the current install base.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="timeline">Post-Install Timeline</TabsTrigger>
          <TabsTrigger value="installer">Installer Comparison</TabsTrigger>
          <TabsTrigger value="reviews">Review Details</TabsTrigger>
          <TabsTrigger value="projects">All Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="gap-0 border-border bg-card py-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-foreground">Overall Post-Install Averages</CardTitle>
                <p className="text-sm text-muted-foreground">Average days from installation to each milestone</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Install to Inspection Passed", value: overview.avgInstallToInspection, color: "bg-amber-500" },
                    { label: "Install to PTO Submitted", value: overview.avgInstallToPtoSubmitted, color: "bg-blue-500" },
                    { label: "Install to PTO Approved", value: overview.avgInstallToPtoApproved, color: "bg-green-500" },
                    { label: "Install to Review Captured", value: overview.avgInstallToReview, color: "bg-purple-500" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-1.5 flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-semibold text-foreground">{item.value != null ? `${fmt(item.value)} days` : "-"}</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: `${Math.min(100, (Number(item.value || 0) / 30) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="gap-0 border-border bg-card py-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-foreground">Timeline by Installer</CardTitle>
                <p className="text-sm text-muted-foreground">Average days per milestone - side by side comparison</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={timelineCompData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
                    <XAxis
                      type="number"
                      stroke="oklch(0.6 0.015 260)"
                      tick={{ fontSize: 11 }}
                      label={{ value: "Days", position: "insideBottom", offset: -5, fill: "oklch(0.6 0.015 260)" }}
                    />
                    <YAxis type="category" dataKey="installer" width={100} stroke="oklch(0.6 0.015 260)" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="Install to Inspection" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Install to PTO Submit" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Install to PTO Approved" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="gap-0 border-border bg-card py-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-foreground">Project Status Distribution</CardTitle>
              <p className="text-sm text-muted-foreground">Current stage of all post-installation projects</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusBarData} margin={{ left: 10, right: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
                  <XAxis
                    dataKey="shortStatus"
                    stroke="oklch(0.6 0.015 260)"
                    tick={{ fontSize: 10 }}
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis stroke="oklch(0.6 0.015 260)" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    labelFormatter={(_, p) => p?.[0]?.payload?.status || ""}
                    formatter={(v) => [Number(v), "Count"]}
                  />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="installer" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {byInstaller.map((inst, idx) => (
              <Card key={`${inst.installer}-${idx}`} className="gap-0 border-border bg-card py-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-foreground">{inst.installer || "Unknown"}</CardTitle>
                  <p className="text-sm text-muted-foreground">{Number(inst.totalInstalls) || 0} installations</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Review Capture</p>
                      <p className="text-lg font-bold text-foreground">{fmt(inst.reviewCaptureRate)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Install to Inspection</p>
                      <p className="text-lg font-bold text-foreground">{inst.avgInstallToInspection != null ? `${fmt(inst.avgInstallToInspection)}d` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Install to PTO Submit</p>
                      <p className="text-lg font-bold text-foreground">{inst.avgInstallToPtoSubmitted != null ? `${fmt(inst.avgInstallToPtoSubmitted)}d` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Install to PTO Approved</p>
                      <p className="text-lg font-bold text-foreground">{inst.avgInstallToPtoApproved != null ? `${fmt(inst.avgInstallToPtoApproved)}d` : "-"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card className="gap-0 border-border bg-card py-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-foreground">Review Capture Details</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[520px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b border-border/50">
                      <th className="px-3 py-3 text-left font-medium text-muted-foreground">Customer</th>
                      <th className="px-3 py-3 text-left font-medium text-muted-foreground">Installer</th>
                      <th className="px-3 py-3 text-right font-medium text-muted-foreground">Install Date</th>
                      <th className="px-3 py-3 text-right font-medium text-muted-foreground">Review Date</th>
                      <th className="px-3 py-3 text-right font-medium text-muted-foreground">Days</th>
                      <th className="px-3 py-3 text-left font-medium text-muted-foreground">Stage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewDetails.map((r, i) => (
                      <tr key={`${r.id || i}`} className="border-b border-border/50 transition-colors hover:bg-accent/20">
                        <td className="px-3 py-2.5 font-medium text-foreground">{r.firstName} {r.lastName?.[0] || ""}</td>
                        <td className="px-3 py-2.5 text-foreground">{r.installer || "-"}</td>
                        <td className="px-3 py-2.5 text-right text-muted-foreground">{formatDateShort(r.installDate)}</td>
                        <td className="px-3 py-2.5 text-right text-muted-foreground">{formatDateShort(r.reviewCapturedDate)}</td>
                        <td className="px-3 py-2.5 text-right font-semibold text-foreground">{r.daysInstallToReview ?? "-"}</td>
                        <td className="px-3 py-2.5">
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {r.reviewStage || "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card className="gap-0 border-border bg-card py-0">
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">All Post-Installation Projects</CardTitle>
                  <p className="text-sm text-muted-foreground">{filteredProjects.length} projects</p>
                </div>
                <select
                  value={installerFilter}
                  onChange={(e) => setInstallerFilter(e.target.value)}
                  className="rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-foreground"
                >
                  <option value="all">All Installers</option>
                  {byInstaller.map((inst, i) => (
                    <option key={`${inst.installer}-${i}`} value={inst.installer}>
                      {inst.installer}
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[560px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b border-border/50">
                      <th className="px-2 py-3 text-left font-medium text-muted-foreground">Customer</th>
                      <th className="px-2 py-3 text-left font-medium text-muted-foreground">Status</th>
                      <th className="px-2 py-3 text-left font-medium text-muted-foreground">Installer</th>
                      <th className="px-2 py-3 text-right font-medium text-muted-foreground">Install</th>
                      <th className="px-2 py-3 text-right font-medium text-muted-foreground">Insp. Passed</th>
                      <th className="px-2 py-3 text-right font-medium text-muted-foreground">PTO Sub</th>
                      <th className="px-2 py-3 text-right font-medium text-muted-foreground">PTO App</th>
                      <th className="px-2 py-3 text-center font-medium text-muted-foreground">Review</th>
                      <th className="px-2 py-3 text-right font-medium text-muted-foreground">Days to Insp</th>
                      <th className="px-2 py-3 text-right font-medium text-muted-foreground">Days to PTO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((p) => (
                      <tr key={p.id} className="border-b border-border/50 transition-colors hover:bg-accent/20">
                        <td className="whitespace-nowrap px-2 py-2 font-medium text-foreground">{p.firstName} {p.lastName?.[0] || ""}</td>
                        <td className="px-2 py-2 text-xs text-foreground">{p.jobStatus || "-"}</td>
                        <td className="px-2 py-2 text-foreground">{p.installer || "-"}</td>
                        <td className="px-2 py-2 text-right text-xs text-muted-foreground">{formatDateShort(p.installDate)}</td>
                        <td className="px-2 py-2 text-right text-xs text-muted-foreground">{formatDateShort(p.inspectionPassed)}</td>
                        <td className="px-2 py-2 text-right text-xs text-muted-foreground">{formatDateShort(p.ptoSubmitted)}</td>
                        <td className="px-2 py-2 text-right text-xs text-muted-foreground">{formatDateShort(p.ptoApproved)}</td>
                        <td className="px-2 py-2 text-center">
                          {p.hasReview ? <Star className="inline-block h-4 w-4 fill-amber-500 text-amber-500" /> : "-"}
                        </td>
                        <td className="px-2 py-2 text-right font-medium text-foreground">{p.daysInstallToInspectionPassed ?? "-"}</td>
                        <td className="px-2 py-2 text-right font-medium text-foreground">{p.daysInstallToPtoApproved ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
