import { AlertCircle, Cloud, Shield, FileText, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock data for alerts
const mockAlerts = [
  {
    id: "1",
    type: "weather",
    title: "Tropical Storm Warning",
    source: "NOAA",
    timestamp: "2 hours ago",
    severity: "high",
    description: "Tropical storm forming in South China Sea",
  },
  {
    id: "2",
    type: "piracy",
    title: "Piracy Alert - Gulf of Aden",
    source: "IMB Piracy Reporting Centre",
    timestamp: "5 hours ago",
    severity: "high",
    description: "Increased pirate activity reported",
  },
  {
    id: "3",
    type: "navigation",
    title: "Navigational Hazard",
    source: "UKHO",
    timestamp: "1 day ago",
    severity: "medium",
    description: "Uncharted wreck reported at coordinates 12.345°N, 123.456°E",
  },
  {
    id: "4",
    type: "port",
    title: "Port Notice - Singapore",
    source: "Port Authority",
    timestamp: "2 days ago",
    severity: "low",
    description: "New berthing procedures effective Jan 15",
  },
];

const alertIcons = {
  weather: Cloud,
  piracy: Shield,
  navigation: AlertCircle,
  port: FileText,
};

const severityColors = {
  high: "bg-status-danger/20 text-status-danger border-status-danger/30",
  medium: "bg-status-caution/20 text-status-caution border-status-caution/30",
  low: "bg-status-info/20 text-status-info border-status-info/30",
};

export function AlertFeedWidget() {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Recent Alert Feed</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {mockAlerts.map((alert) => {
          const Icon = alertIcons[alert.type as keyof typeof alertIcons];
          const severityColor = severityColors[alert.severity as keyof typeof severityColors];

          return (
            <div
              key={alert.id}
              className="p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg", severityColor)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-medium text-foreground">{alert.title}</h4>
                    <Badge className={cn("text-xs", severityColor)}>{alert.severity}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{alert.source}</span>
                    <span className="text-muted-foreground">{alert.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {mockAlerts.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">No recent alerts</p>
      )}
    </Card>
  );
}

