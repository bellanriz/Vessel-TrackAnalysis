import { useState, useEffect } from "react";
import { Search, User, Settings, FileText, LogOut, Anchor, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateNewVoyageWidget } from "@/components/dashboard/CreateNewVoyageWidget";
import { VoyageCard } from "@/components/dashboard/VoyageCard";
import { CommunicationPlansWidget } from "@/components/dashboard/CommunicationPlansWidget";
import { AlertFeedWidget } from "@/components/dashboard/AlertFeedWidget";

// Mock data for past voyages
const mockVoyages = [
  {
    id: "1",
    routeName: "Singapore → Tokyo",
    vesselName: "MV Ocean Star",
    lastUpdated: "12 Jan 2026",
    status: "completed",
    distance: 2847,
    duration: "18 days",
    charts: ["UKHO 1234", "UKHO 5678"],
    regulationSummary: "SOLAS updates may apply",
    route: {
      start: [103.8198, 1.3521],
      end: [139.6917, 35.6762],
      waypoints: [
        [103.8198, 1.3521],
        [120.0, 15.0],
        [130.0, 25.0],
        [139.6917, 35.6762],
      ],
    },
  },
  {
    id: "2",
    routeName: "Rotterdam → New York",
    vesselName: "MV Atlantic Voyager",
    lastUpdated: "8 Jan 2026",
    status: "in_progress",
    distance: 3456,
    duration: "22 days",
    charts: ["UKHO 9012", "UKHO 3456"],
    regulationSummary: "All regulations compliant",
    route: {
      start: [4.4777, 51.9225],
      end: [-74.006, 40.7128],
      waypoints: [
        [4.4777, 51.9225],
        [-20.0, 50.0],
        [-50.0, 40.0],
        [-74.006, 40.7128],
      ],
    },
  },
  {
    id: "3",
    routeName: "Hamburg → Shanghai",
    vesselName: "MV Pacific Express",
    lastUpdated: "5 Jan 2026",
    status: "draft",
    distance: 11234,
    duration: "45 days",
    charts: ["UKHO 7890", "UKHO 1234", "UKHO 5678"],
    regulationSummary: "Pending compliance review",
    route: {
      start: [9.9937, 53.5511],
      end: [121.4737, 31.2304],
      waypoints: [
        [9.9937, 53.5511],
        [20.0, 55.0],
        [100.0, 30.0],
        [121.4737, 31.2304],
      ],
    },
  },
  {
    id: "4",
    routeName: "Los Angeles → Sydney",
    vesselName: "MV Southern Cross",
    lastUpdated: "2 Jan 2026",
    status: "completed",
    distance: 6789,
    duration: "28 days",
    charts: ["UKHO 2468", "UKHO 1357"],
    regulationSummary: "All clear",
    route: {
      start: [-118.2437, 34.0522],
      end: [151.2093, -33.8688],
      waypoints: [
        [-118.2437, 34.0522],
        [-150.0, 20.0],
        [-170.0, -10.0],
        [151.2093, -33.8688],
      ],
    },
  },
];

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [voyages, setVoyages] = useState(mockVoyages);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load saved routes from localStorage
  useEffect(() => {
    const savedRoutes = localStorage.getItem("savedRoutes");
    if (savedRoutes) {
      try {
        const parsed = JSON.parse(savedRoutes);
        // Merge saved routes with mock voyages, prioritizing saved routes
        // Remove waypoints property before merging (it's not in the VoyageCard interface)
        const cleanedSavedRoutes = parsed.map((route: any) => {
          const { waypoints, ...rest } = route;
          return rest;
        });
        setVoyages([...cleanedSavedRoutes, ...mockVoyages]);
      } catch (error) {
        console.error("Error loading saved routes:", error);
      }
    }
  }, []);

  // Scroll to communications widget if requested
  useEffect(() => {
    const scrollTo = searchParams.get("scrollTo");
    if (scrollTo === "communications") {
      setTimeout(() => {
        const element = document.getElementById("communications-widget");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          // Remove query param after scrolling
          navigate("/dashboard", { replace: true });
        }
      }, 300);
    }
  }, [searchParams, navigate]);

  const filteredVoyages = voyages.filter(
    (voyage) =>
      voyage.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voyage.vesselName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateVoyage = () => {
    navigate("/route-planner");
  };

  const handleOpenVoyage = (voyageId: string) => {
    // Find the voyage to check its status
    const voyage = mockVoyages.find((v) => v.id === voyageId);
    
    // If voyage is in progress, navigate to Index page (Voyage Planner)
    if (voyage?.status === "in_progress") {
      navigate("/");
    } else {
      navigate(`/voyage/${voyageId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            {mounted && (
              <img
                src="/sailor-logo.png"
                alt="Sailor Logo"
                className="h-8 w-auto object-contain"
                style={{
                  filter: theme === "dark" 
                    ? "invert(1) brightness(1.2)" // White logo on dark background
                    : "invert(0) brightness(0)", // Black logo on light background
                }}
              />
            )}
            {!mounted && (
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Anchor className="w-5 h-5 text-primary" />
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search voyages by vessel, date range, or route name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/")}>
                <Anchor className="mr-2 h-4 w-4" />
                <span>Voyage Planner</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                <span>Documentation</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Create New Voyage Widget */}
            <CreateNewVoyageWidget onClick={handleCreateVoyage} />

            {/* Past Voyages Grid */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-foreground">Past Voyages</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredVoyages.map((voyage) => (
                  <VoyageCard
                    key={voyage.id}
                    voyage={voyage}
                    onOpen={() => handleOpenVoyage(voyage.id)}
                    onDuplicate={() => console.log("Duplicate", voyage.id)}
                    onExport={() => console.log("Export", voyage.id)}
                    onDelete={() => console.log("Delete", voyage.id)}
                  />
                ))}
              </div>
              {filteredVoyages.length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No voyages found matching your search.</p>
                </Card>
              )}
            </div>
          </div>

          {/* Right Column - Widgets */}
          <div className="lg:col-span-1 space-y-6">
            <CommunicationPlansWidget />
            <AlertFeedWidget />
          </div>
        </div>
      </main>
    </div>
  );
}

