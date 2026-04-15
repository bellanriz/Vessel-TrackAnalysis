import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Plus, Minus, Compass, Maximize2, CheckCircle2, AlertTriangle, Skull, Zap, Cloud, FileText, Download, MessageSquare, ChevronRight, ChevronDown, X, Info } from "lucide-react";
import { PageHeader } from "@/components/navigation/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { generateMaritimeRoute, calculateGreatCircleWaypoints } from "@/utils/maritimeRouting";
import { Waypoint } from "@/pages/RoutePlanner";

// Helper function to calculate distance between two coordinates
const calculateDistance = (coord1: [number, number], coord2: [number, number]): number => {
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
};

// Generate route variations based on waypoints
const generateRouteVariations = (waypoints: [number, number][]) => {
  if (waypoints.length < 2) {
    return null;
  }

  const start = waypoints[0];
  const end = waypoints[waypoints.length - 1];
  
  // Calculate total distance
  let totalDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDistance += calculateDistance(waypoints[i], waypoints[i + 1]);
  }

  // Route A: Direct route (slightly offset to the east)
  const routeACoords = generateMaritimeRoute(waypoints);
  const routeADistance = totalDistance;
  const routeAETA = Math.round((routeADistance / 15) * 10) / 10; // Assuming 15 knots average

  // Route B: Slightly longer but safer (offset to the west)
  const routeBCoords: [number, number][] = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const [lng1, lat1] = waypoints[i];
    const [lng2, lat2] = waypoints[i + 1];
    // Offset waypoints slightly west
    const offset = 0.3;
    const adjustedStart: [number, number] = [lng1 - offset, lat1];
    const adjustedEnd: [number, number] = [lng2 - offset, lat2];
    const segment = generateMaritimeRoute([adjustedStart, adjustedEnd]);
    if (i === 0) {
      routeBCoords.push(...segment);
    } else {
      routeBCoords.push(...segment.slice(1));
    }
  }
  const routeBDistance = Math.round(totalDistance * 1.05);
  const routeBETA = Math.round((routeBDistance / 15) * 10) / 10;

  // Route C: Alternative route (offset to the east)
  const routeCCoords: [number, number][] = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const [lng1, lat1] = waypoints[i];
    const [lng2, lat2] = waypoints[i + 1];
    // Offset waypoints slightly east
    const offset = 0.3;
    const adjustedStart: [number, number] = [lng1 + offset, lat1];
    const adjustedEnd: [number, number] = [lng2 + offset, lat2];
    const segment = generateMaritimeRoute([adjustedStart, adjustedEnd]);
    if (i === 0) {
      routeCCoords.push(...segment);
    } else {
      routeCCoords.push(...segment.slice(1));
    }
  }
  const routeCDistance = Math.round(totalDistance * 1.08);
  const routeCETA = Math.round((routeCDistance / 15) * 10) / 10;

  return {
    routeA: {
      name: "Route A",
      color: "#3b82f6",
      coordinates: routeACoords,
      distance: routeADistance,
      eta: routeAETA,
      zones: 4,
      threats: 2,
      score: 68,
    },
    routeB: {
      name: "Route B",
      color: "#22c55e",
      coordinates: routeBCoords,
      distance: routeBDistance,
      eta: routeBETA,
      zones: 2,
      threats: 0,
      score: 92,
    },
    routeC: {
      name: "Route C",
      color: "#a855f7",
      coordinates: routeCCoords,
      distance: routeCDistance,
      eta: routeCETA,
      zones: 3,
      threats: 1,
      score: 71,
    },
  };
};

// ECA Zone
const ecaZone = {
  type: "Feature" as const,
  properties: { name: "Emission Control Area (ECA)", type: "Environmental", description: "SOx/NOx emission controls required" },
  geometry: {
    type: "Polygon" as const,
    coordinates: [
      [
        [-82.0, 30.0],
        [-82.0, 24.5],
        [-84.0, 24.0],
        [-88.0, 24.0],
        [-88.0, 30.0],
        [-82.0, 30.0],
      ],
    ],
  },
};

// Threat markers
const threats = [
  { type: "piracy", coordinates: [-85.5, 24.0], severity: "high", date: "14 Jan 2026", description: "Pirate activity reported in Gulf of Mexico", source: "IMB" },
  { type: "storm", coordinates: [-84.0, 25.5], severity: "high", date: "15 Jan 2026", description: "Tropical Storm Cyclone Kavin - NOAA warning", source: "NOAA" },
  { type: "conflict", coordinates: [-87.0, 22.5], severity: "medium", date: "13 Jan 2026", description: "Warship presence in Yucatan Passage", source: "JWC" },
];

export default function RouteComparison() {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const selectedRouteRef = useRef<string | null>(null);
  const [layersVisible, setLayersVisible] = useState({
    routeA: true,
    routeB: true,
    routeC: true,
    regulationZones: true,
    threatMarkers: true,
    weather: false,
  });
  const [activeTab, setActiveTab] = useState("ai-recommendation");
  const [showEcaInfo, setShowEcaInfo] = useState(false);
  const [ecaInfoPosition, setEcaInfoPosition] = useState<{ x: number; y: number } | null>(null);
  const [ecaSectionsExpanded, setEcaSectionsExpanded] = useState<Record<string, boolean>>({});
  const ecaPopupRef = useRef<HTMLDivElement>(null);
  const [popupPlacement, setPopupPlacement] = useState<{ x: number; y: number; transform: string } | null>(null);

  // Load route from RoutePlanner
  const currentRoute = useMemo(() => {
    try {
      const stored = localStorage.getItem("currentRoute");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed;
      }
    } catch (error) {
      console.error("Error loading current route:", error);
    }
    return null;
  }, []);

  // Generate route variations based on loaded waypoints
  const routes = useMemo(() => {
    if (!currentRoute || !currentRoute.coordinates || currentRoute.coordinates.length < 2) {
      // Fallback to demo routes if no route is loaded
      return {
        routeA: {
          name: "Route A",
          color: "#3b82f6",
          coordinates: [
            [-82.458, 27.606],
            [-84.5, 25.5],
            [-86.0, 24.0],
            [-86.8, 21.5],
            [-86.949, 20.508],
          ],
          distance: 1873,
          eta: 6.4,
          zones: 4,
          threats: 2,
          score: 68,
        },
        routeB: {
          name: "Route B",
          color: "#22c55e",
          coordinates: [
            [-82.458, 27.606],
            [-83.5, 26.0],
            [-85.5, 24.5],
            [-87.0, 22.0],
            [-86.949, 20.508],
          ],
          distance: 1910,
          eta: 6.6,
          zones: 2,
          threats: 0,
          score: 92,
        },
        routeC: {
          name: "Route C",
          color: "#a855f7",
          coordinates: [
            [-82.458, 27.606],
            [-85.0, 25.0],
            [-87.5, 23.0],
            [-88.0, 21.0],
            [-86.949, 20.508],
          ],
          distance: 1950,
          eta: 6.8,
          zones: 3,
          threats: 1,
          score: 71,
        },
      };
    }

    const variations = generateRouteVariations(currentRoute.coordinates);
    return variations || {
      routeA: {
        name: "Route A",
        color: "#3b82f6",
        coordinates: currentRoute.coordinates,
        distance: 0,
        eta: 0,
        zones: 4,
        threats: 2,
        score: 68,
      },
      routeB: {
        name: "Route B",
        color: "#22c55e",
        coordinates: currentRoute.coordinates,
        distance: 0,
        eta: 0,
        zones: 2,
        threats: 0,
        score: 92,
      },
      routeC: {
        name: "Route C",
        color: "#a855f7",
        coordinates: currentRoute.coordinates,
        distance: 0,
        eta: 0,
        zones: 3,
        threats: 1,
        score: 71,
      },
    };
  }, [currentRoute]);

  // Keep ref in sync with state
  useEffect(() => {
    selectedRouteRef.current = selectedRoute;
  }, [selectedRoute]);

  useEffect(() => {
    if (!mapContainer.current || !routes) return;

    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    mapboxgl.accessToken = mapboxToken;

    // Calculate center from routes
    const allCoords = [
      ...routes.routeA.coordinates,
      ...routes.routeB.coordinates,
      ...routes.routeC.coordinates,
    ];
    const centerLng = allCoords.reduce((sum, coord) => sum + coord[0], 0) / allCoords.length;
    const centerLat = allCoords.reduce((sum, coord) => sum + coord[1], 0) / allCoords.length;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/navigation-night-v1",
      center: [centerLng, centerLat],
      zoom: 5,
      pitch: 20,
    });

    map.current.on("load", () => {
      if (!map.current) return;
      setMapLoaded(true);

      // Add ECA Zone
      map.current.addSource("eca-zone", {
        type: "geojson",
        data: ecaZone as any,
      });

      map.current.addLayer({
        id: "eca-zone-fill",
        type: "fill",
        source: "eca-zone",
        paint: {
          "fill-color": "#FF8C42",
          "fill-opacity": 0.25,
        },
      });

      map.current.addLayer({
        id: "eca-zone-line",
        type: "line",
        source: "eca-zone",
        paint: {
          "line-color": "#FF8C42",
          "line-width": 2,
          "line-dasharray": [3, 2],
        },
      });

      // ECA Zone hover handlers (visual feedback only, no popup)
      map.current.on("mouseenter", "eca-zone-fill", () => {
        if (map.current) map.current.getCanvas().style.cursor = "pointer";
        map.current?.setPaintProperty("eca-zone-fill", "fill-opacity", 0.4);
        map.current?.setPaintProperty("eca-zone-line", "line-width", 3);
      });

      map.current.on("mouseleave", "eca-zone-fill", () => {
        if (map.current) map.current.getCanvas().style.cursor = "";
        map.current?.setPaintProperty("eca-zone-fill", "fill-opacity", 0.25);
        map.current?.setPaintProperty("eca-zone-line", "line-width", 2);
      });

      // ECA Zone click handler (toggle popup)
      map.current.on("click", "eca-zone-fill", (e) => {
        if (e.originalEvent && mapContainer.current) {
          const rect = mapContainer.current.getBoundingClientRect();
          const clickPosition = { 
            x: (e.originalEvent as MouseEvent).clientX - rect.left, 
            y: (e.originalEvent as MouseEvent).clientY - rect.top 
          };
          
          // Toggle popup: if already showing, close it; otherwise show it
          if (showEcaInfo) {
            // Close if clicking the zone again
            setShowEcaInfo(false);
            setEcaInfoPosition(null);
          } else {
            // Show popup
            setEcaInfoPosition(clickPosition);
            setShowEcaInfo(true);
          }
        }
      });

      // Add Route A
      map.current.addSource("route-a", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: { name: "Route A" },
          geometry: { type: "LineString", coordinates: routes.routeA.coordinates },
        } as any,
      });

      map.current.addLayer({
        id: "route-a-line",
        type: "line",
        source: "route-a",
        paint: {
          "line-color": routes.routeA.color,
          "line-width": 4,
          "line-opacity": 0.8,
        },
      });

      // Add Route B
      map.current.addSource("route-b", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: { name: "Route B" },
          geometry: { type: "LineString", coordinates: routes.routeB.coordinates },
        } as any,
      });

      map.current.addLayer({
        id: "route-b-line",
        type: "line",
        source: "route-b",
        paint: {
          "line-color": routes.routeB.color,
          "line-width": 4,
          "line-opacity": 0.8,
        },
      });

      // Add Route C
      map.current.addSource("route-c", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: { name: "Route C" },
          geometry: { type: "LineString", coordinates: routes.routeC.coordinates },
        } as any,
      });

      map.current.addLayer({
        id: "route-c-line",
        type: "line",
        source: "route-c",
        paint: {
          "line-color": routes.routeC.color,
          "line-width": 4,
          "line-opacity": 0.8,
        },
      });

      // Add threat markers
      threats.forEach((threat, index) => {
        const el = document.createElement("div");
        el.className = "threat-marker";
        let icon = Skull;
        let bgColor = "#ef4444";
        
        if (threat.type === "storm") {
          bgColor = "#3b82f6";
        } else if (threat.type === "conflict") {
          bgColor = "#f59e0b";
        }

        el.innerHTML = `
          <div style="
            width: 32px;
            height: 32px;
            background: ${bgColor};
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
            cursor: pointer;
          ">
            ${threat.type === "piracy" ? "☠" : threat.type === "storm" ? "⛈" : "⚠"}
          </div>
        `;

        const marker = new mapboxgl.Marker(el)
          .setLngLat(threat.coordinates as [number, number])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div style="color: #0f172a; padding: 8px; min-width: 200px;">
                <strong>${threat.type === "piracy" ? "Pirate Activity" : threat.type === "storm" ? "Storm Warning" : "Conflict Zone"}</strong><br/>
                <span style="font-size: 12px; color: #64748b;">${threat.date}</span><br/>
                <p style="font-size: 12px; margin-top: 4px;">${threat.description}</p>
                <span style="font-size: 11px; color: #64748b;">Source: ${threat.source}</span>
              </div>
            `)
          )
          .addTo(map.current!);
      });

      // Click handlers for routes
      map.current.on("click", "route-a-line", () => {
        setSelectedRoute("A");
      });

      map.current.on("click", "route-b-line", () => {
        setSelectedRoute("B");
      });

      map.current.on("click", "route-c-line", () => {
        setSelectedRoute("C");
      });

      // Hover effects
      ["route-a-line", "route-b-line", "route-c-line"].forEach((layerId) => {
        map.current?.on("mouseenter", layerId, () => {
          if (map.current) map.current.getCanvas().style.cursor = "pointer";
          const routeLetter = layerId.split("-")[1].toUpperCase();
          // Only increase width if not already selected (selected routes are already at width 6)
          if (selectedRouteRef.current !== routeLetter) {
            map.current?.setPaintProperty(layerId, "line-width", 6);
          }
        });

        map.current?.on("mouseleave", layerId, () => {
          if (map.current) map.current.getCanvas().style.cursor = "";
          const routeLetter = layerId.split("-")[1].toUpperCase();
          // Only reset width if route is not selected
          if (selectedRouteRef.current !== routeLetter) {
            map.current?.setPaintProperty(layerId, "line-width", 4);
          }
        });
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [routes]);

  const updateRouteHighlight = (route: string | null) => {
    if (!map.current || !mapLoaded) return;
    const routes = ["A", "B", "C"];
    routes.forEach((r) => {
      if (route && r === route) {
        // Highlight selected route
        map.current?.setPaintProperty(`route-${r.toLowerCase()}-line`, "line-opacity", 1);
        map.current?.setPaintProperty(`route-${r.toLowerCase()}-line`, "line-width", 6);
      } else {
        // Dim other routes
        map.current?.setPaintProperty(`route-${r.toLowerCase()}-line`, "line-opacity", 0.3);
        map.current?.setPaintProperty(`route-${r.toLowerCase()}-line`, "line-width", 4);
      }
    });
  };

  // Update highlighting when route selection changes
  useEffect(() => {
    if (mapLoaded) {
      updateRouteHighlight(selectedRoute);
    }
  }, [selectedRoute, mapLoaded]);

  // Calculate popup position to stay within viewport
  useEffect(() => {
    if (!showEcaInfo || !ecaInfoPosition || !mapContainer.current) {
      setPopupPlacement(null);
      return;
    }

    const calculatePlacement = () => {
      if (!mapContainer.current) return;

      const containerRect = mapContainer.current.getBoundingClientRect();
      const padding = 10;
      
      // Use actual popup dimensions if available, otherwise estimate
      // Account for responsive width
      const maxPopupWidth = Math.min(672, containerRect.width - 20); // max-w-2xl = 672px, with padding
      let popupWidth = maxPopupWidth;
      let popupHeight = Math.min(600, window.innerHeight * 0.8);
      
      // Try to get actual dimensions after render
      if (ecaPopupRef.current) {
        const rect = ecaPopupRef.current.getBoundingClientRect();
        if (rect.width > 0) popupWidth = rect.width;
        if (rect.height > 0) popupHeight = rect.height;
      }
      
      let x = ecaInfoPosition.x;
      let y = ecaInfoPosition.y;
      let transformX = "-50%";
      let transformY = "-100%";
      let offsetY = -10;
      
      // Check horizontal boundaries
      const halfWidth = popupWidth / 2;
      if (x + halfWidth > containerRect.width - padding) {
        // Too far right, align to right edge
        x = containerRect.width - halfWidth - padding;
      } else if (x - halfWidth < padding) {
        // Too far left, align to left edge
        x = halfWidth + padding;
      }
      
      // Check vertical boundaries
      const spaceAbove = y;
      const spaceBelow = containerRect.height - y;
      
      if (spaceAbove < popupHeight + padding && spaceBelow > spaceAbove) {
        // Not enough space above, position below cursor
        transformY = "10px";
        offsetY = 10;
        // Ensure it doesn't go below viewport
        if (y + popupHeight + offsetY > containerRect.height - padding) {
          y = Math.max(padding, containerRect.height - popupHeight - offsetY - padding);
        }
      } else {
        // Position above cursor (default)
        transformY = "-100%";
        offsetY = -10;
        // Ensure it doesn't go above viewport
        if (y - popupHeight - Math.abs(offsetY) < padding) {
          y = popupHeight + Math.abs(offsetY) + padding;
        }
        // Ensure it doesn't go below viewport
        if (y > containerRect.height - padding) {
          y = Math.max(padding, containerRect.height - padding);
        }
      }
      
      setPopupPlacement({
        x,
        y: y + offsetY,
        transform: `translate(${transformX}, ${transformY})`,
      });
    };

    // Use requestAnimationFrame to ensure DOM is updated
    const rafId = requestAnimationFrame(() => {
      calculatePlacement();
      // Also recalculate after a short delay to get accurate dimensions
      setTimeout(calculatePlacement, 10);
    });

    // Recalculate on window resize
    const handleResize = () => {
      calculatePlacement();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, [showEcaInfo, ecaInfoPosition, mapLoaded]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Update route sources when routes change
    if (map.current.getSource("route-a")) {
      (map.current.getSource("route-a") as mapboxgl.GeoJSONSource).setData({
        type: "Feature",
        properties: { name: "Route A" },
        geometry: { type: "LineString", coordinates: routes.routeA.coordinates },
      } as any);
    }
    if (map.current.getSource("route-b")) {
      (map.current.getSource("route-b") as mapboxgl.GeoJSONSource).setData({
        type: "Feature",
        properties: { name: "Route B" },
        geometry: { type: "LineString", coordinates: routes.routeB.coordinates },
      } as any);
    }
    if (map.current.getSource("route-c")) {
      (map.current.getSource("route-c") as mapboxgl.GeoJSONSource).setData({
        type: "Feature",
        properties: { name: "Route C" },
        geometry: { type: "LineString", coordinates: routes.routeC.coordinates },
      } as any);
    }

    // Update layer visibility
    map.current.setLayoutProperty("route-a-line", "visibility", layersVisible.routeA ? "visible" : "none");
    map.current.setLayoutProperty("route-b-line", "visibility", layersVisible.routeB ? "visible" : "none");
    map.current.setLayoutProperty("route-c-line", "visibility", layersVisible.routeC ? "visible" : "none");
    map.current.setLayoutProperty("eca-zone-fill", "visibility", layersVisible.regulationZones ? "visible" : "none");
    map.current.setLayoutProperty("eca-zone-line", "visibility", layersVisible.regulationZones ? "visible" : "none");
  }, [layersVisible, mapLoaded, routes]);

  const handleZoomIn = () => map.current?.zoomIn();
  const handleZoomOut = () => map.current?.zoomOut();
  const handleResetBearing = () => map.current?.resetNorth();
  const handleFitRoutes = () => {
    if (!map.current) return;
    const bounds = new mapboxgl.LngLatBounds();
    [...routes.routeA.coordinates, ...routes.routeB.coordinates, ...routes.routeC.coordinates].forEach((coord) => {
      bounds.extend(coord as [number, number]);
    });
    map.current.fitBounds(bounds, { padding: 50 });
  };

  const getRouteData = (route: string) => {
    if (route === "A") return routes.routeA;
    if (route === "B") return routes.routeB;
    return routes.routeC;
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Bar */}
      <PageHeader
        title="Multi-Route Comparison"
        description="AI-enhanced route evaluation and analysis"
        backTo="/route-planner"
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map Section - 70% */}
        <div className="flex-[0.7] relative bg-maritime-deep">
          <div ref={mapContainer} className="absolute inset-0" />

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <div className="map-control flex flex-col gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
                <Plus className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
                <Minus className="w-4 h-4" />
              </Button>
            </div>
            <div className="map-control">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleResetBearing}>
                <Compass className="w-4 h-4" />
              </Button>
            </div>
            <div className="map-control">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleFitRoutes}>
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Layer Toggles */}
          <div className="absolute top-4 left-4 z-10 bg-card/95 backdrop-blur-md border border-border/50 rounded-lg p-3 shadow-lg space-y-2 min-w-[200px]">
            <div className="text-xs font-semibold text-foreground mb-2">Toggle Layers</div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="route-a"
                  checked={layersVisible.routeA}
                  onCheckedChange={(checked) =>
                    setLayersVisible((prev) => ({ ...prev, routeA: checked as boolean }))
                  }
                />
                <label htmlFor="route-a" className="text-xs text-foreground cursor-pointer flex items-center gap-2">
                  <div className="w-3 h-0.5" style={{ backgroundColor: routes.routeA.color }} />
                  Route A
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="route-b"
                  checked={layersVisible.routeB}
                  onCheckedChange={(checked) =>
                    setLayersVisible((prev) => ({ ...prev, routeB: checked as boolean }))
                  }
                />
                <label htmlFor="route-b" className="text-xs text-foreground cursor-pointer flex items-center gap-2">
                  <div className="w-3 h-0.5" style={{ backgroundColor: routes.routeB.color }} />
                  Route B
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="route-c"
                  checked={layersVisible.routeC}
                  onCheckedChange={(checked) =>
                    setLayersVisible((prev) => ({ ...prev, routeC: checked as boolean }))
                  }
                />
                <label htmlFor="route-c" className="text-xs text-foreground cursor-pointer flex items-center gap-2">
                  <div className="w-3 h-0.5" style={{ backgroundColor: routes.routeC.color }} />
                  Route C
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="regulation-zones"
                  checked={layersVisible.regulationZones}
                  onCheckedChange={(checked) =>
                    setLayersVisible((prev) => ({ ...prev, regulationZones: checked as boolean }))
                  }
                />
                <label htmlFor="regulation-zones" className="text-xs text-foreground cursor-pointer">
                  Regulation Zones
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="threat-markers"
                  checked={layersVisible.threatMarkers}
                  onCheckedChange={(checked) =>
                    setLayersVisible((prev) => ({ ...prev, threatMarkers: checked as boolean }))
                  }
                />
                <label htmlFor="threat-markers" className="text-xs text-foreground cursor-pointer">
                  Threat/Alert Markers
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="weather"
                  checked={layersVisible.weather}
                  onCheckedChange={(checked) =>
                    setLayersVisible((prev) => ({ ...prev, weather: checked as boolean }))
                  }
                />
                <label htmlFor="weather" className="text-xs text-foreground cursor-pointer">
                  Weather Layer
                </label>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 z-10 bg-card/95 backdrop-blur-md border border-border/50 rounded-lg p-3 shadow-lg space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5" style={{ backgroundColor: routes.routeA.color }} />
              <span>Route A</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5" style={{ backgroundColor: routes.routeB.color }} />
              <span>Route B</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5" style={{ backgroundColor: routes.routeC.color }} />
              <span>Route C</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-status-caution/30 border border-status-caution" />
              <span>ECA Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive border-2 border-foreground" />
              <span>Threat Marker</span>
            </div>
          </div>

          {/* ECA Info Popup */}
          {showEcaInfo && ecaInfoPosition && popupPlacement && (
            <div
              ref={ecaPopupRef}
              className="absolute z-50 bg-card border border-border/50 rounded-lg shadow-2xl w-[calc(100vw-1rem)] sm:w-[90vw] md:max-w-2xl max-h-[80vh] overflow-hidden"
              style={{
                left: `${popupPlacement.x}px`,
                top: `${popupPlacement.y}px`,
                transform: popupPlacement.transform,
                maxWidth: "min(672px, calc(100vw - 1rem))",
              }}
            >
              <div className="bg-card border-b border-border/50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Emission Control Area (ECA)</h3>
                  <Badge variant="caution">MARPOL Annex VI</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowEcaInfo(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4 space-y-4">
                <div className="text-sm text-muted-foreground">
                  Emission Control Areas (ECAs)—including SECAs (Sulfur Emission Control Areas) and NECAs (Nitrogen Emission Control Areas)—are designated sea regions where stricter limits apply to air emissions from ships. These limits are defined under MARPOL Annex VI, which came into force in 2005 to reduce pollution from shipping.
                </div>

                <Collapsible
                  open={ecaSectionsExpanded.sox}
                  onOpenChange={(open) => setEcaSectionsExpanded((prev) => ({ ...prev, sox: open }))}
                >
                  <CollapsibleTrigger className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <span className="font-semibold">1. SOx and Fuel Sulfur Limits</span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform", ecaSectionsExpanded.sox && "rotate-180")} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <div>
                      <div className="font-medium mb-2 text-primary">SECA (Stricter Zones)</div>
                      <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                        <li>• Before 2010: 1.50%</li>
                        <li>• 2010–2015: 1.00%</li>
                        <li>• After 2015: 0.10%</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-medium mb-2 text-primary">Global Limits</div>
                      <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                        <li>• Before 2012: 4.50%</li>
                        <li>• 2012–2020: 3.50%</li>
                        <li>• After 2020: 0.50%</li>
                      </ul>
                    </div>
                    <div className="text-xs text-muted-foreground italic">
                      Ships may alternatively use approved exhaust gas cleaning systems (scrubbers).
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible
                  open={ecaSectionsExpanded.nox}
                  onOpenChange={(open) => setEcaSectionsExpanded((prev) => ({ ...prev, nox: open }))}
                >
                  <CollapsibleTrigger className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <span className="font-semibold">2. NOx Emission Limits (Tiered System)</span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform", ecaSectionsExpanded.nox && "rotate-180")} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-2">
                    <div className="text-sm text-muted-foreground mb-2">
                      Applies to diesel engines &gt;130 kW:
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                      <li>
                        <strong className="text-foreground">Tier I</strong> (ships built ≥ 2000): Moderate limits (17–9.8 g/kWh depending on rpm)
                      </li>
                      <li>
                        <strong className="text-foreground">Tier II</strong> (ships built ≥ 2011): Stricter (14.4–7.7 g/kWh)
                      </li>
                      <li>
                        <strong className="text-foreground">Tier III</strong> (ships built ≥ 2016 in NECAs only): Very strict (3.4–2.0 g/kWh)
                      </li>
                    </ul>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible
                  open={ecaSectionsExpanded.regions}
                  onOpenChange={(open) => setEcaSectionsExpanded((prev) => ({ ...prev, regions: open }))}
                >
                  <CollapsibleTrigger className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <span className="font-semibold">3. Existing & New ECA Regions</span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform", ecaSectionsExpanded.regions && "rotate-180")} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <div>
                      <div className="font-medium mb-2 text-status-safe">Current ECAs:</div>
                      <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                        <li>• Baltic Sea</li>
                        <li>• North Sea</li>
                        <li>• North American coast (U.S. & Canada)</li>
                        <li>• U.S. Caribbean (Puerto Rico, U.S. Virgin Islands)</li>
                        <li>• Mediterranean Sea (effective May 1, 2025)</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-medium mb-2 text-status-caution">Proposed ECAs:</div>
                      <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                        <li>• Norwegian Sea</li>
                        <li>• Canadian Arctic</li>
                        <li>• Parts of the North Atlantic</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-medium mb-2 text-primary">Special extra-tight regulation zones:</div>
                      <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                        <li>• Norwegian heritage fjords (require 100% emission-free cruises by 2026)</li>
                      </ul>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible
                  open={ecaSectionsExpanded.provisions}
                  onOpenChange={(open) => setEcaSectionsExpanded((prev) => ({ ...prev, provisions: open }))}
                >
                  <CollapsibleTrigger className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <span className="font-semibold">4. Additional Annex VI Provisions</span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform", ecaSectionsExpanded.provisions && "rotate-180")} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-2 text-sm text-muted-foreground">
                    <p>Certain materials (e.g., sludge oil, PCBs, garbage with heavy metals) cannot be incinerated on board.</p>
                    <p>Ships must control greenhouse gases (CO₂, methane, etc.) and report emissions.</p>
                    <p className="mt-2">
                      Since 2013, ships ≥400 GT must comply with:
                    </p>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• EEDI (Energy Efficiency Design Index)</li>
                      <li>• SEEMP (Ship Energy Efficiency Management Plan)</li>
                    </ul>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible
                  open={ecaSectionsExpanded.future}
                  onOpenChange={(open) => setEcaSectionsExpanded((prev) => ({ ...prev, future: open }))}
                >
                  <CollapsibleTrigger className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <span className="font-semibold">5. Future Outlook</span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform", ecaSectionsExpanded.future && "rotate-180")} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-2 text-sm text-muted-foreground">
                    <ul className="space-y-1 ml-4">
                      <li>• Increased adoption of scrubbers, LNG fuel, hybrid or battery-electric propulsion</li>
                      <li>• Expansion of ECAs and stricter regional rules</li>
                      <li>• Growth in emission-free zones for sensitive environments</li>
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - 30% */}
        <div className="flex-[0.3] bg-card border-l border-border/50 flex flex-col overflow-hidden min-w-[400px]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-card px-4">
              <TabsTrigger value="ai-recommendation" className="text-xs">AI Recommendation</TabsTrigger>
              <TabsTrigger value="regulation-details" className="text-xs">Regulation Details</TabsTrigger>
              <TabsTrigger value="threats-alerts" className="text-xs">Threats & Alerts</TabsTrigger>
              <TabsTrigger value="route-breakdown" className="text-xs">Route Breakdown</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              {/* AI Recommendation Tab */}
              <TabsContent value="ai-recommendation" className="p-4 space-y-4 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Best Route: Route B</CardTitle>
                    <CardDescription>
                      Route B avoids the piracy-prone area near Malacca Strait and passes through only 2 regulatory compliance zones.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <div className="space-y-3">
                  <Card
                    className={cn(
                      "cursor-pointer transition-all hover:bg-muted/50",
                      selectedRoute === "A" && "ring-2 ring-primary bg-primary/5"
                    )}
                    onClick={() => {
                      setSelectedRoute("A");
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-0.5" style={{ backgroundColor: routes.routeA.color }} />
                          <span className="font-semibold">Route A</span>
                          {selectedRoute === "A" && (
                            <Badge variant="default" className="ml-2">Selected</Badge>
                          )}
                        </div>
                        <Badge variant="caution">Score: {routes.routeA.score}/100</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>Distance: {routes.routeA.distance} nm</div>
                        <div>ETA: {routes.routeA.eta} days</div>
                        <div>Compliance zones: {routes.routeA.zones}</div>
                        <div className="text-status-danger">Risks: High piracy activity, storm forecast</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={cn(
                      "cursor-pointer transition-all hover:bg-muted/50 ring-2",
                      selectedRoute === "B" ? "ring-primary bg-primary/5" : "ring-status-safe/30"
                    )}
                    onClick={() => {
                      setSelectedRoute("B");
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-0.5" style={{ backgroundColor: routes.routeB.color }} />
                          <span className="font-semibold">Route B</span>
                          <Badge variant="safe">Recommended</Badge>
                          {selectedRoute === "B" && (
                            <Badge variant="default" className="ml-2">Selected</Badge>
                          )}
                        </div>
                        <Badge variant="safe">Score: {routes.routeB.score}/100</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>Distance: {routes.routeB.distance} nm (slightly longer but safer)</div>
                        <div>ETA: {routes.routeB.eta} days</div>
                        <div>Compliance zones: {routes.routeB.zones}</div>
                        <div className="text-status-safe">Risks: Minimal</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={cn(
                      "cursor-pointer transition-all hover:bg-muted/50",
                      selectedRoute === "C" && "ring-2 ring-primary bg-primary/5"
                    )}
                    onClick={() => {
                      setSelectedRoute("C");
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-0.5" style={{ backgroundColor: routes.routeC.color }} />
                          <span className="font-semibold">Route C</span>
                          {selectedRoute === "C" && (
                            <Badge variant="default" className="ml-2">Selected</Badge>
                          )}
                        </div>
                        <Badge variant="caution">Score: {routes.routeC.score}/100</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>Distance: {routes.routeC.distance} nm</div>
                        <div>ETA: {routes.routeC.eta} days</div>
                        <div>Compliance zones: {routes.routeC.zones}</div>
                        <div className="text-status-caution">Risks: Conflict warnings in Yucatan Passage</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-medium mb-1">AI Helper</div>
                        <p className="text-xs text-muted-foreground">
                          Explain why Route B is safer in more detail.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Regulation Details Tab */}
              <TabsContent value="regulation-details" className="p-4 space-y-3 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Emission Control Area (ECA)</CardTitle>
                    <CardDescription>Environmental (SOx/NOx)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Region:</span> Gulf of Mexico
                      </div>
                      <div>
                        <span className="font-medium">Requirement:</span> Use fuel &lt; 0.1% sulfur
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                          if (map.current) {
                            map.current.flyTo({
                              center: [-85, 27],
                              zoom: 6,
                              duration: 1500,
                            });
                          }
                        }}
                      >
                        Zoom to Zone <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Threats & Alerts Tab */}
              <TabsContent value="threats-alerts" className="p-4 space-y-3 mt-0">
                {threats.map((threat, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {threat.type === "piracy" && <Skull className="w-5 h-5 text-destructive mt-0.5" />}
                        {threat.type === "storm" && <Cloud className="w-5 h-5 text-status-info mt-0.5" />}
                        {threat.type === "conflict" && <AlertTriangle className="w-5 h-5 text-status-caution mt-0.5" />}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm">
                              {threat.type === "piracy" ? "Pirate Sighting" : threat.type === "storm" ? "Tropical Storm" : "Conflict Zone"}
                            </span>
                            <Badge variant={threat.severity === "high" ? "danger" : "caution"} className="text-xs">
                              {threat.severity}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">{threat.date}</div>
                          <p className="text-xs text-muted-foreground mb-2">{threat.description}</p>
                          <div className="text-xs text-muted-foreground">Source: {threat.source}</div>
                          <div className="text-xs text-status-danger mt-2">Recommendation: Avoid if possible.</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Route Breakdown Tab */}
              <TabsContent value="route-breakdown" className="p-4 space-y-3 mt-0">
                {selectedRoute ? (
                  (() => {
                    const route = getRouteData(selectedRoute);
                    return (
                      <div className="space-y-3">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Route {selectedRoute} Details</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Total Distance:</span> {route.distance} nm
                            </div>
                            <div>
                              <span className="font-medium">ETA:</span> {route.eta} days
                            </div>
                            <div>
                              <span className="font-medium">Fuel Estimate:</span> ~{Math.round(route.distance * 0.15)} tons
                            </div>
                            <div>
                              <span className="font-medium">Charts Required:</span> Gulf of Mexico, Caribbean Sea
                            </div>
                            <div>
                              <span className="font-medium">Regulations:</span> {route.zones} compliance zones
                            </div>
                            <div>
                              <span className="font-medium">Weather Window:</span> 7-day forecast available
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })()
                ) : (
                  <Card>
                    <CardContent className="p-4 text-center text-sm text-muted-foreground">
                      Select a route on the map to view detailed breakdown
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="h-16 bg-card border-t border-border/50 flex items-center justify-end gap-2 px-4 shrink-0">
        <Button variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-2" />
          View Communication Plan
        </Button>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Route as PDF
        </Button>
        <Button variant="outline" size="sm">
          Generate Passage Plan
        </Button>
        <Button
          size="sm"
          onClick={() => {
            const routeToSelect = selectedRoute || "B";
            setSelectedRoute(routeToSelect);
            // Store selected route in localStorage
            localStorage.setItem("selectedRoute", routeToSelect);
            navigate("/communications-plan");
          }}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Select {selectedRoute ? `Route ${selectedRoute}` : "Recommended Route"}
        </Button>
      </div>
    </div>
  );
}

