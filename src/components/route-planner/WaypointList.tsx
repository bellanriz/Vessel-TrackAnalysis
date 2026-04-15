import { useState } from "react";
import { GripVertical, X, MapPin, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Waypoint } from "@/pages/RoutePlanner";
import { cn } from "@/lib/utils";

interface WaypointListProps {
  waypoints: Waypoint[];
  onRemove: (id: string) => void;
  onReorder: (newOrder: Waypoint[]) => void;
  onFocus: (waypoint: Waypoint) => void;
  onClearAll: () => void;
}

export function WaypointList({
  waypoints,
  onRemove,
  onReorder,
  onFocus,
  onClearAll,
}: WaypointListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newWaypoints = [...waypoints];
    const [removed] = newWaypoints.splice(draggedIndex, 1);
    newWaypoints.splice(dropIndex, 0, removed);

    onReorder(newWaypoints);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (waypoints.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Selected Route</h3>
        </div>
        <Card className="p-6 text-center">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No waypoints added yet</p>
          <p className="text-xs text-muted-foreground mt-1">Search and add ports to build your route</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Selected Route ({waypoints.length} stops)</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={onClearAll}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear All
          </Button>
        </div>
      </div>

      <Card className="divide-y divide-border/50">
        {waypoints.map((waypoint, index) => (
          <div
            key={waypoint.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "p-3 flex items-center gap-3 cursor-move transition-colors",
              "hover:bg-muted/50",
              draggedIndex === index && "opacity-50",
              dragOverIndex === index && "bg-primary/10 border-t-2 border-primary"
            )}
          >
            {/* Drag Handle */}
            <div className="text-muted-foreground cursor-grab active:cursor-grabbing">
              <GripVertical className="w-4 h-4" />
            </div>

            {/* Stop Number */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">{index + 1}</span>
            </div>

            {/* Waypoint Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{waypoint.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{waypoint.country}</span>
                {waypoint.unlocode && (
                  <>
                    <span>•</span>
                    <span className="font-mono">{waypoint.unlocode}</span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onFocus(waypoint)}
                title="View on map"
              >
                <MapPin className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onRemove(waypoint.id)}
                title="Remove waypoint"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </Card>

      {/* Add Waypoint Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => {
          // Focus search input - this would be handled by parent
          document.querySelector<HTMLInputElement>('input[placeholder*="Search by port"]')?.focus();
        }}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Waypoint
      </Button>
    </div>
  );
}

