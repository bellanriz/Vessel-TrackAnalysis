import { Navigation, Clock, FileText, AlertTriangle, Cloud } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Waypoint } from "@/pages/RoutePlanner";

interface RouteSummaryProps {
  waypoints: Waypoint[];
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
  const R = 3440; // Earth radius in nautical miles
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function RouteSummary({ waypoints }: RouteSummaryProps) {
  // Calculate total distance
  let totalDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDistance += calculateDistance(waypoints[i].coordinates, waypoints[i + 1].coordinates);
  }

  // Estimate voyage time (assuming average speed of 15 knots)
  const averageSpeed = 15; // knots
  const estimatedHours = totalDistance / averageSpeed;
  const estimatedDays = Math.ceil(estimatedHours / 24);

  // Mock data for charts and notices
  const suggestedCharts = [
    "UKHO 1234",
    "UKHO 5678",
    "UKHO 9012",
  ];

  const noticesToMariners = [
    "NTM 2026-001: Route updates",
    "NTM 2026-015: Weather warnings",
  ];

  const piracyZones = [
    "Gulf of Aden",
    "West Africa",
  ];

  const weatherZones = [
    "Tropical Storm Zone",
    "High Wind Area",
  ];

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Navigation className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Route Summary</h3>
      </div>

      {/* Distance & Time */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">Total Distance</p>
          <p className="text-lg font-semibold text-foreground">{totalDistance.toFixed(0)} nm</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">Est. Duration</p>
          <p className="text-lg font-semibold text-foreground flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {estimatedDays} days
          </p>
        </div>
      </div>

      {/* Suggested Charts */}
      <div>
        <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" />
          Suggested UKHO Charts
        </p>
        <div className="flex flex-wrap gap-1">
          {suggestedCharts.map((chart, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {chart}
            </Badge>
          ))}
        </div>
      </div>

      {/* Notices to Mariners */}
      {noticesToMariners.length > 0 && (
        <div>
          <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-status-caution" />
            Notices to Mariners
          </p>
          <div className="space-y-1">
            {noticesToMariners.map((notice, idx) => (
              <p key={idx} className="text-xs text-muted-foreground">{notice}</p>
            ))}
          </div>
        </div>
      )}

      {/* Piracy Zones */}
      {piracyZones.length > 0 && (
        <div>
          <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-status-danger" />
            Known Piracy Zones
          </p>
          <div className="flex flex-wrap gap-1">
            {piracyZones.map((zone, idx) => (
              <Badge key={idx} variant="danger" className="text-xs">
                {zone}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Weather Zones */}
      {weatherZones.length > 0 && (
        <div>
          <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1">
            <Cloud className="w-3.5 h-3.5 text-status-info" />
            Weather Zones
          </p>
          <div className="flex flex-wrap gap-1">
            {weatherZones.map((zone, idx) => (
              <Badge key={idx} variant="info" className="text-xs">
                {zone}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-border/50">
        <p className="text-xs text-muted-foreground italic">
          * Summary will be updated with AI analysis after route confirmation
        </p>
      </div>
    </Card>
  );
}

