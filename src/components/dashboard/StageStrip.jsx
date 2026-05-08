import { STAGE_COLORS } from "../../lib/chartTheme";
import FunnelMetricCard from "./FunnelMetricCard";

/**
 * Horizontal funnel strip used by Pipeline → Funnel tab and by other
 * places that want to render a fixed sequence of stage counts.
 *
 * Props:
 *   stages — array of objects { label, count, pctOfPrev?, muted? }.
 *
 * Each stage gets one tile. Empty arrays render nothing so it is safe to
 * call with an unsynced or filter-restricted dataset.
 */
function pickAccent(index, muted) {
  if (muted) return "bg-muted";
  const palette = ["bg-amber-500", "bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-cyan-500", "bg-pink-500", "bg-rose-500"];
  return palette[index % palette.length];
}

export default function StageStrip({ stages }) {
  if (!Array.isArray(stages) || stages.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {stages.map((stage, index) => (
        <FunnelMetricCard
          key={`${stage.label}-${index}`}
          label={stage.label}
          count={stage.count}
          pctOfPrev={stage.pctOfPrev}
          muted={Boolean(stage.muted)}
          accent={pickAccent(index, stage.muted)}
        />
      ))}
    </div>
  );
}

export { STAGE_COLORS };
