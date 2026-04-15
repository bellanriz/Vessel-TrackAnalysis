import { Copy, Download, Trash2, MapPin, Navigation, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VoyageCardProps {
  voyage: {
    id: string;
    routeName: string;
    vesselName: string;
    lastUpdated: string;
    status: "completed" | "in_progress" | "draft";
    distance: number;
    duration: string;
    charts: string[];
    regulationSummary: string;
    route: {
      start: [number, number];
      end: [number, number];
      waypoints: [number, number][];
    };
  };
  onOpen: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onDelete: () => void;
}

export function VoyageCard({ voyage, onOpen, onDuplicate, onExport, onDelete }: VoyageCardProps) {
  const statusColors = {
    completed: "bg-status-safe/20 text-status-safe border-status-safe/30",
    in_progress: "bg-status-info/20 text-status-info border-status-info/30",
    draft: "bg-status-caution/20 text-status-caution border-status-caution/30",
  };

  const statusLabels = {
    completed: "Completed",
    in_progress: "In Progress",
    draft: "Draft",
  };

  // Generate Mapbox static map URL
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  const coordinates = voyage.route.waypoints.map(([lng, lat]) => `${lng},${lat}`).join(";");
  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/navigation-night-v1/static/path-3+22d3ee-0.8(${coordinates})/auto/300x150?access_token=${mapboxToken}`;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:scale-[1.02]",
        "group cursor-pointer"
      )}
      onClick={onOpen}
    >
      {/* Card Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">{voyage.routeName}</h3>
            <p className="text-sm text-muted-foreground">{voyage.vesselName}</p>
          </div>
          <Badge className={cn("text-xs", statusColors[voyage.status])}>
            {statusLabels[voyage.status]}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Last updated {voyage.lastUpdated}
        </p>
      </div>

      {/* Map Preview */}
      <div className="relative h-32 bg-maritime-deep overflow-hidden">
        <img
          src={mapUrl}
          alt={`Route map for ${voyage.routeName}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback if map fails to load
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
      </div>

      {/* Card Body Info */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Distance:</span>
            <span className="ml-1 font-medium text-foreground">{voyage.distance} nm</span>
          </div>
          <div>
            <span className="text-muted-foreground">Duration:</span>
            <span className="ml-1 font-medium text-foreground">{voyage.duration}</span>
          </div>
        </div>

        <div>
          <span className="text-xs text-muted-foreground">Charts:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {voyage.charts.map((chart, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {chart}
              </Badge>
            ))}
          </div>
        </div>

        <div className="text-xs">
          <span className="text-muted-foreground">Regulation:</span>
          <p className="text-foreground mt-1">{voyage.regulationSummary}</p>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 border-t border-border/50 flex items-center justify-between gap-2 bg-muted/30">
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          className="flex-1"
        >
          Open Voyage
        </Button>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            title="Duplicate Route"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onExport();
            }}
            title="Export Docs"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

