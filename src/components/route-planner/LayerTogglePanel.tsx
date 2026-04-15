import { Cloud, Shield, AlertTriangle, Ship, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LayerTogglePanelProps {
  layersVisible: {
    weather: boolean;
    piracy: boolean;
    hazards: boolean;
    traffic: boolean;
    charts: boolean;
  };
  onToggleLayer: (layer: keyof LayerTogglePanelProps["layersVisible"]) => void;
}

const layerConfig = [
  {
    key: "weather" as const,
    label: "Weather",
    icon: Cloud,
    color: "text-status-info",
  },
  {
    key: "piracy" as const,
    label: "Piracy",
    icon: Shield,
    color: "text-status-danger",
  },
  {
    key: "hazards" as const,
    label: "Hazards",
    icon: AlertTriangle,
    color: "text-status-caution",
  },
  {
    key: "traffic" as const,
    label: "Traffic",
    icon: Ship,
    color: "text-status-info",
  },
  {
    key: "charts" as const,
    label: "Charts",
    icon: FileText,
    color: "text-muted-foreground",
  },
];

export function LayerTogglePanel({ layersVisible, onToggleLayer }: LayerTogglePanelProps) {
  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
      <div className="bg-card/95 backdrop-blur-md border border-border/50 rounded-lg p-2 shadow-lg">
        <div className="flex flex-col gap-1">
          {layerConfig.map((layer) => {
            const Icon = layer.icon;
            const isVisible = layersVisible[layer.key];

            return (
              <Button
                key={layer.key}
                variant={isVisible ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "justify-start gap-2 h-9",
                  isVisible && "bg-primary/20 hover:bg-primary/30"
                )}
                onClick={() => onToggleLayer(layer.key)}
                title={layer.label}
              >
                <Icon className={cn("w-4 h-4", isVisible ? layer.color : "text-muted-foreground")} />
                <span className="text-xs">{layer.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

