import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TimelineViewProps {
  className?: string;
}

const timelineData = {
  hours: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`),
  groups: [
    {
      name: "Group 1",
      items: [
        { label: "SOx limit", bars: [{ start: 0, end: 8, status: "danger" }, { start: 8, end: 24, status: "safe" }] },
        { label: "Open-loop EGCS", bars: [{ start: 0, end: 6, status: "danger", time: "16:41" }] },
        { label: "EGCS Washwater", bars: [{ start: 0, end: 6.5, status: "danger", time: "16:47" }] },
        { label: "Incinerator", bars: [{ start: 0, end: 6.5, status: "danger", time: "16:47" }] },
        { label: "Visible Smoke", bars: [{ start: 0, end: 7.5, status: "caution", time: "17:49" }] },
        { label: "NOx", bars: [{ start: 0, end: 24, status: "safe" }] },
      ],
    },
    {
      name: "Group 2",
      items: [
        { label: "Bilge water", bars: [{ start: 0, end: 8, status: "danger" }, { start: 8, end: 24, status: "safe" }] },
        { label: "Sewage (MSD Type 2)", bars: [{ start: 0, end: 8, status: "danger" }, { start: 8, end: 24, status: "safe" }] },
        { label: "Sewage (AWWTS)", bars: [{ start: 0, end: 7.5, status: "danger" }, { start: 7.5, end: 24, status: "safe" }] },
        { label: "Grey Water", bars: [{ start: 0, end: 7, status: "danger" }, { start: 7, end: 24, status: "safe" }] },
        { label: "Food - Comminuted", bars: [{ start: 0, end: 7, status: "danger" }, { start: 7, end: 24, status: "caution" }] },
        { label: "RWF", bars: [{ start: 0, end: 7, status: "danger" }, { start: 7, end: 24, status: "safe" }] },
      ],
    },
  ],
  zones: [
    { label: "Inside 0 NM", start: 0, end: 4, status: "danger" },
    { label: "0 - 4 NM", start: 4, end: 5, status: "danger" },
    { label: "4 - 12 NM", start: 5, end: 8, status: "caution" },
    { label: "12 - 25 NM", start: 8, end: 12, status: "safe" },
    { label: "25 - 50 NM", start: 12, end: 16, status: "safe" },
    { label: "50 - 200 NM", start: 16, end: 24, status: "safe" },
  ],
  areas: [
    { label: "ECA", start: 0, end: 8, status: "caution" },
    { label: "Port", start: 0, end: 4, status: "danger" },
  ],
};

export function TimelineView({ className }: TimelineViewProps) {
  const hourWidth = 60; // pixels per hour
  const totalWidth = 24 * hourWidth;

  return (
    <div className={cn("bg-card border-t border-border/50", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Regulation Timeline</span>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-status-safe" />
              Permitted
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-status-caution" />
              Conditional
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-status-danger" />
              Prohibited
            </span>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">2h 49m ahead of plan</span>
      </div>

      <ScrollArea className="w-full">
        <div className="flex min-w-max">
          {/* Labels Column */}
          <div className="w-48 shrink-0 border-r border-border/50 bg-maritime-navy">
            {/* Time header placeholder */}
            <div className="h-8 border-b border-border/50" />
            
            {/* Events & Ports */}
            <div className="h-8 px-4 flex items-center text-xs text-muted-foreground border-b border-border/30">
              Events & Ports
            </div>
            
            {/* Zones */}
            <div className="h-8 px-4 flex items-center text-xs text-muted-foreground border-b border-border/30">
              Zones
            </div>
            
            {/* Areas */}
            <div className="h-8 px-4 flex items-center text-xs text-muted-foreground border-b border-border/30">
              Areas
            </div>

            {/* Groups */}
            {timelineData.groups.map((group, gi) => (
              <div key={gi}>
                <div className="h-6 px-4 flex items-center text-xs text-muted-foreground bg-secondary/30">
                  {group.name}
                </div>
                {group.items.map((item, ii) => (
                  <div
                    key={ii}
                    className="h-6 px-4 flex items-center text-xs truncate border-b border-border/20"
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Timeline Grid */}
          <div className="relative" style={{ width: totalWidth }}>
            {/* Hour Headers */}
            <div className="h-8 flex border-b border-border/50 bg-maritime-navy">
              {timelineData.hours.map((hour, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center text-xs text-muted-foreground border-r border-border/20"
                  style={{ width: hourWidth }}
                >
                  {hour}
                </div>
              ))}
            </div>

            {/* Current Time Indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
              style={{ left: 7.5 * hourWidth }}
            />

            {/* Events & Ports Row */}
            <div className="h-8 relative border-b border-border/30">
              <TimelineBar start={0} end={4} status="danger" label="Port" hourWidth={hourWidth} />
            </div>

            {/* Zones Row */}
            <div className="h-8 relative border-b border-border/30 flex">
              {timelineData.zones.map((zone, i) => (
                <TimelineBar
                  key={i}
                  start={zone.start}
                  end={zone.end}
                  status={zone.status as any}
                  label={zone.label}
                  hourWidth={hourWidth}
                  showLabel
                />
              ))}
            </div>

            {/* Areas Row */}
            <div className="h-8 relative border-b border-border/30">
              {timelineData.areas.map((area, i) => (
                <TimelineBar
                  key={i}
                  start={area.start}
                  end={area.end}
                  status={area.status as any}
                  label={area.label}
                  hourWidth={hourWidth}
                  showLabel
                />
              ))}
            </div>

            {/* Groups */}
            {timelineData.groups.map((group, gi) => (
              <div key={gi}>
                <div className="h-6 bg-secondary/30" />
                {group.items.map((item, ii) => (
                  <div key={ii} className="h-6 relative border-b border-border/20 flex">
                    {item.bars.map((bar, bi) => (
                      <TimelineBar
                        key={bi}
                        start={bar.start}
                        end={bar.end}
                        status={bar.status as any}
                        label={bar.time}
                        hourWidth={hourWidth}
                        showLabel={!!bar.time}
                        small
                      />
                    ))}
                  </div>
                ))}
              </div>
            ))}

            {/* Grid Lines */}
            <div className="absolute inset-0 pointer-events-none">
              {timelineData.hours.map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-l border-border/10"
                  style={{ left: i * hourWidth }}
                />
              ))}
            </div>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

function TimelineBar({
  start,
  end,
  status,
  label,
  hourWidth,
  showLabel = false,
  small = false,
}: {
  start: number;
  end: number;
  status: "safe" | "caution" | "danger";
  label?: string;
  hourWidth: number;
  showLabel?: boolean;
  small?: boolean;
}) {
  const statusColors = {
    safe: "bg-status-safe",
    caution: "bg-status-caution",
    danger: "bg-status-danger",
  };

  const width = (end - start) * hourWidth;
  const left = start * hourWidth;

  return (
    <div
      className={cn(
        "absolute flex items-center justify-end px-2",
        statusColors[status],
        small ? "h-5 top-0.5 rounded-sm" : "h-6 top-1 rounded"
      )}
      style={{ left, width }}
    >
      {showLabel && label && (
        <span className={cn("text-xs font-mono", status === "safe" ? "text-maritime-deep" : "text-foreground")}>
          {label}
        </span>
      )}
    </div>
  );
}
