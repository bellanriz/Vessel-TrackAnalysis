import { useState } from "react";
import {
  Info,
  FileText,
  AlertTriangle,
  Radio,
  ChevronDown,
  ChevronRight,
  Clock,
  MapPin,
  Fuel,
  Navigation,
  Sparkles,
  ExternalLink,
  Shield,
  Waves,
  Skull,
  CloudLightning,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RightPanelProps {
  collapsed?: boolean;
}

export function RightPanel({ collapsed = false }: RightPanelProps) {
  return (
    <aside
      className={cn(
        "bg-sidebar border-l border-border/50 flex flex-col h-full transition-all duration-300",
        collapsed ? "w-0 overflow-hidden" : "w-80"
      )}
    >
      <Tabs defaultValue="overview" className="flex flex-col h-full">
        <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-transparent h-auto p-0">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3"
          >
            <Info className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="regulations"
            className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3"
          >
            <FileText className="w-4 h-4 mr-2" />
            Regs
          </TabsTrigger>
          <TabsTrigger
            value="hazards"
            className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Hazards
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="overview" className="m-0 p-4 space-y-4">
            <VoyageOverview />
          </TabsContent>

          <TabsContent value="regulations" className="m-0 p-4 space-y-4">
            <RegulationsPanel />
          </TabsContent>

          <TabsContent value="hazards" className="m-0 p-4 space-y-4">
            <HazardsPanel />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </aside>
  );
}

function VoyageOverview() {
  return (
    <>
      {/* Route Summary */}
      <div className="panel-maritime p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Route Summary</h3>
          <Badge variant="outline" className="text-status-safe border-status-safe/30 bg-status-safe/10">
            Optimal
          </Badge>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-status-safe" />
            <span>Tampa Bay</span>
          </div>
          <Navigation className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-status-danger" />
            <span>Cozumel</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-secondary/50 rounded-lg p-2">
            <p className="text-xs text-muted-foreground">Distance</p>
            <p className="font-mono font-semibold text-primary">847 NM</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-2">
            <p className="text-xs text-muted-foreground">ETA</p>
            <p className="font-mono font-semibold">58h 12m</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-2">
            <p className="text-xs text-muted-foreground">Fuel Est.</p>
            <p className="font-mono font-semibold">142 MT</p>
          </div>
        </div>
      </div>

      {/* Waypoints */}
      <div className="panel-maritime">
        <div className="panel-header">
          <h3 className="text-sm font-medium">Waypoints</h3>
          <span className="text-xs text-muted-foreground">5 points</span>
        </div>
        <div className="p-3 space-y-2">
          <WaypointItem index={1} name="Tampa Bay (USTPA)" eta="Departure" status="safe" />
          <WaypointItem index={2} name="Gulf Passage WP1" eta="16h 30m" status="safe" />
          <WaypointItem index={3} name="ECA Exit Point" eta="28h 45m" status="caution" />
          <WaypointItem index={4} name="Yucatan Approach" eta="52h 00m" status="safe" />
          <WaypointItem index={5} name="Cozumel (MXCZM)" eta="58h 12m" status="safe" />
        </div>
      </div>

      {/* Required Charts */}
      <div className="panel-maritime">
        <div className="panel-header">
          <h3 className="text-sm font-medium">Required Charts</h3>
          <Badge variant="secondary">UKHO</Badge>
        </div>
        <div className="p-3 space-y-2 text-sm">
          <ChartItem number="US4FL20" name="Tampa Bay Approach" />
          <ChartItem number="US1GC01" name="Gulf of Mexico" />
          <ChartItem number="MX3YU01" name="Yucatan Channel" />
          <ChartItem number="MX4YU15" name="Cozumel Harbor" />
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="panel-maritime border-primary/30 bg-primary/5">
        <div className="panel-header border-primary/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-primary">AI Recommendations</h3>
          </div>
        </div>
        <div className="p-3 space-y-2 text-sm">
          <p className="text-muted-foreground">
            Based on current weather patterns, consider routing 15 NM east of waypoint 3 to avoid
            predicted crosswind conditions.
          </p>
          <Button size="sm" variant="outline" className="w-full gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Generate Alternative Route
          </Button>
        </div>
      </div>
    </>
  );
}

function RegulationsPanel() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Voyage Regulations</h3>
        <Button size="sm" variant="ghost" className="gap-1 text-xs">
          <Sparkles className="w-3 h-3" />
          Ask AI
        </Button>
      </div>

      <RegulationCard
        icon={Shield}
        title="SOx Limit 0.10%"
        status="danger"
        zone="ECA Zone"
        description="Fuel sulfur content must not exceed 0.10% m/m within Emission Control Areas."
      />

      <RegulationCard
        icon={Waves}
        title="Bilge Water"
        status="caution"
        zone="US Waters"
        description="Discharge prohibited within 12 NM. Oil content must be <15 ppm with ODMS."
      />

      <RegulationCard
        icon={Shield}
        title="Sewage Discharge"
        status="safe"
        zone="International"
        description="Permitted beyond 12 NM from nearest land with approved treatment system."
      />

      <div className="panel-maritime p-3">
        <h4 className="text-sm font-medium mb-2">Admiralty Radio Signals</h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tampa VTS</span>
            <span className="font-mono">VHF Ch. 12</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cozumel Port Control</span>
            <span className="font-mono">VHF Ch. 16</span>
          </div>
        </div>
      </div>
    </>
  );
}

function HazardsPanel() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Situational Awareness</h3>
        <Badge variant="secondary" className="text-xs">Live</Badge>
      </div>

      <HazardCard
        icon={Skull}
        title="Piracy Alert"
        severity="low"
        location="Caribbean Basin"
        description="No significant piracy activity reported in planned route area. Last incident: 45 days ago, 200 NM south of route."
        time="Updated 2h ago"
      />

      <HazardCard
        icon={CloudLightning}
        title="Weather System"
        severity="medium"
        location="Gulf of Mexico"
        description="Tropical disturbance developing. 40% chance of strengthening. Monitor NHC updates."
        time="Updated 30m ago"
      />

      <HazardCard
        icon={AlertTriangle}
        title="Notice to Mariners"
        severity="low"
        location="Tampa Bay"
        description="Temporary buoy relocation at channel marker 14. Effective until Dec 15."
        time="NTM 48/2024"
      />

      <div className="panel-maritime p-3 border-status-info/30 bg-status-info/5">
        <div className="flex items-center gap-2 mb-2">
          <Radio className="w-4 h-4 text-status-info" />
          <h4 className="text-sm font-medium text-status-info">NAVAREA IV</h4>
        </div>
        <p className="text-xs text-muted-foreground">
          No active warnings affecting planned route. Next broadcast: 0000 UTC
        </p>
      </div>
    </>
  );
}

function WaypointItem({
  index,
  name,
  eta,
  status,
}: {
  index: number;
  name: string;
  eta: string;
  status: "safe" | "caution" | "danger";
}) {
  const statusColors = {
    safe: "bg-status-safe",
    caution: "bg-status-caution",
    danger: "bg-status-danger",
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium", statusColors[status])}>
        {index}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{name}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {eta}
        </p>
      </div>
    </div>
  );
}

function ChartItem({ number, name }: { number: string; name: string }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors">
      <div>
        <p className="font-mono text-primary">{number}</p>
        <p className="text-xs text-muted-foreground">{name}</p>
      </div>
      <ExternalLink className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}

function RegulationCard({
  icon: Icon,
  title,
  status,
  zone,
  description,
}: {
  icon: any;
  title: string;
  status: "safe" | "caution" | "danger";
  zone: string;
  description: string;
}) {
  const statusStyles = {
    safe: "border-status-safe/30 bg-status-safe/5",
    caution: "border-status-caution/30 bg-status-caution/5",
    danger: "border-status-danger/30 bg-status-danger/5",
  };

  const iconStyles = {
    safe: "text-status-safe",
    caution: "text-status-caution",
    danger: "text-status-danger",
  };

  return (
    <div className={cn("panel-maritime p-3", statusStyles[status])}>
      <div className="flex items-start gap-3">
        <Icon className={cn("w-5 h-5 mt-0.5", iconStyles[status])} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">{title}</h4>
            <Badge variant="outline" className="text-xs">{zone}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}

function HazardCard({
  icon: Icon,
  title,
  severity,
  location,
  description,
  time,
}: {
  icon: any;
  title: string;
  severity: "low" | "medium" | "high";
  location: string;
  description: string;
  time: string;
}) {
  const severityStyles = {
    low: "border-status-safe/30",
    medium: "border-status-caution/30",
    high: "border-status-danger/30",
  };

  const severityBadge = {
    low: "status-safe",
    medium: "status-caution",
    high: "status-danger",
  };

  return (
    <div className={cn("panel-maritime p-3", severityStyles[severity])}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-muted-foreground mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">{title}</h4>
            <Badge className={severityBadge[severity]} variant="outline">
              {severity}
            </Badge>
          </div>
          <p className="text-xs text-primary mb-1">{location}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
          <p className="text-xs text-muted-foreground/60 mt-2">{time}</p>
        </div>
      </div>
    </div>
  );
}
