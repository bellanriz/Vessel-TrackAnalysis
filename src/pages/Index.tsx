import { useState } from "react";
import { TopNavbar } from "@/components/navigation/TopNavbar";
import { LeftSidebar } from "@/components/sidebar/LeftSidebar";
import { RightPanel } from "@/components/panels/RightPanel";
import { MapView } from "@/components/map/MapView";
import { TimelineView } from "@/components/timeline/TimelineView";
import { CommunicationsPanel } from "@/components/communications/CommunicationsPanel";
import { PanelLeftClose, PanelRightClose, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Index = () => {
  const [activeModule, setActiveModule] = useState("voyage");
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [timelineExpanded, setTimelineExpanded] = useState(true);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <TopNavbar activeModule={activeModule} onModuleChange={setActiveModule} />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-2 z-20 bg-card/80 backdrop-blur-sm"
          onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
        >
          <PanelLeftClose
            className={cn("w-4 h-4 transition-transform", leftSidebarCollapsed && "rotate-180")}
          />
        </Button>

        {/* Left Sidebar */}
        <div
          className={cn(
            "transition-all duration-300 overflow-hidden",
            leftSidebarCollapsed ? "w-0" : "w-72"
          )}
        >
          <LeftSidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Map / Communications View */}
          <div className="flex-1 flex overflow-hidden">
            {activeModule === "voyage" && (
              <MapView />
            )}

            {activeModule === "communications" && (
              <CommunicationsPanel className="flex-1" />
            )}

            {activeModule === "regulations" && (
              <div className="flex-1 flex items-center justify-center bg-maritime-deep">
                <div className="text-center p-8">
                  <h2 className="text-xl font-semibold mb-2">Regulations Browser</h2>
                  <p className="text-muted-foreground">Search and browse maritime regulations</p>
                </div>
              </div>
            )}

            {activeModule === "certificates" && (
              <div className="flex-1 flex items-center justify-center bg-maritime-deep">
                <div className="text-center p-8">
                  <h2 className="text-xl font-semibold mb-2">Certificate Manager</h2>
                  <p className="text-muted-foreground">Manage vessel certificates and documents</p>
                </div>
              </div>
            )}
          </div>

          {/* Timeline (Voyage Module Only) */}
          {activeModule === "voyage" && (
            <div className={cn("transition-all duration-300", timelineExpanded ? "h-72" : "h-10")}>
              <Button
                variant="ghost"
                size="sm"
                className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 bg-card/80 backdrop-blur-sm gap-1"
                onClick={() => setTimelineExpanded(!timelineExpanded)}
              >
                {timelineExpanded ? (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Hide Timeline
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show Timeline
                  </>
                )}
              </Button>
              {timelineExpanded && <TimelineView className="h-full" />}
            </div>
          )}
        </div>

        {/* Right Panel Toggle */}
        {activeModule === "voyage" && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-20 bg-card/80 backdrop-blur-sm"
            onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
          >
            <PanelRightClose
              className={cn("w-4 h-4 transition-transform", rightPanelCollapsed && "rotate-180")}
            />
          </Button>
        )}

        {/* Right Panel */}
        {activeModule === "voyage" && (
          <RightPanel collapsed={rightPanelCollapsed} />
        )}
      </div>
    </div>
  );
};

export default Index;
