import { useState } from "react";
import {
  Navigation,
  Route,
  MapPin,
  Layers,
  AlertTriangle,
  Anchor,
  FileText,
  Radio,
  ChevronDown,
  ChevronRight,
  Compass,
  Wind,
  Ship,
  Plus,
  Undo2,
  Redo2,
  Download,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface LeftSidebarProps {
  collapsed?: boolean;
}

export function LeftSidebar({ collapsed = false }: LeftSidebarProps) {
  const [openSections, setOpenSections] = useState<string[]>(["route", "layers", "vessel"]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  return (
    <aside
      className={cn(
        "bg-sidebar border-r border-border/50 flex flex-col h-full transition-all duration-300",
        collapsed ? "w-16" : "w-72"
      )}
    >
      {/* Route Tools */}
      <Collapsible open={openSections.includes("route")} onOpenChange={() => toggleSection("route")}>
        <CollapsibleTrigger className="w-full panel-header hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-2">
            <Route className="w-4 h-4 text-primary" />
            {!collapsed && <span className="text-sm font-medium">Route Tools</span>}
          </div>
          {!collapsed && (
            openSections.includes("route") ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" size="sm" className="w-full justify-start gap-2">
                <MapPin className="w-3.5 h-3.5" />
                Add Point
              </Button>
              <Button variant="secondary" size="sm" className="w-full justify-start gap-2">
                <Navigation className="w-3.5 h-3.5" />
                Auto Route
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Redo2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Upload className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Layers */}
      <Collapsible open={openSections.includes("layers")} onOpenChange={() => toggleSection("layers")}>
        <CollapsibleTrigger className="w-full panel-header hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            {!collapsed && <span className="text-sm font-medium">Layers</span>}
          </div>
          {!collapsed && (
            openSections.includes("layers") ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-3 space-y-2">
            <LayerToggle icon={FileText} label="UKHO Charts" active />
            <LayerToggle icon={AlertTriangle} label="ECA Zones" active />
            <LayerToggle icon={Anchor} label="Port Areas" active />
            <LayerToggle icon={Radio} label="Pirate Reports" />
            <LayerToggle icon={Wind} label="Weather" />
            <LayerToggle icon={FileText} label="NAVAREA Warnings" />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Vessel Info */}
      <Collapsible open={openSections.includes("vessel")} onOpenChange={() => toggleSection("vessel")}>
        <CollapsibleTrigger className="w-full panel-header hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-2">
            <Ship className="w-4 h-4 text-primary" />
            {!collapsed && <span className="text-sm font-medium">Vessel</span>}
          </div>
          {!collapsed && (
            openSections.includes("vessel") ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-3 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Ship className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">MV Pacific Star</p>
                <p className="text-xs text-muted-foreground">IMO: 9876543</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-secondary/50 rounded-lg p-2">
                <p className="text-muted-foreground">Speed</p>
                <p className="font-mono font-medium">14.5 kn</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-2">
                <p className="text-muted-foreground">Course</p>
                <p className="font-mono font-medium">285.0°</p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Compass className="w-16 h-16 text-primary/60" />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Saved Routes */}
      <div className="mt-auto p-3 border-t border-border/50">
        <Button variant="outline" size="sm" className="w-full justify-start gap-2">
          <Plus className="w-4 h-4" />
          New Voyage
        </Button>
      </div>
    </aside>
  );
}

function LayerToggle({ icon: Icon, label, active = false }: { icon: any; label: string; active?: boolean }) {
  const [isActive, setIsActive] = useState(active);

  return (
    <button
      onClick={() => setIsActive(!isActive)}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
        isActive
          ? "bg-primary/20 text-primary border border-primary/30"
          : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
