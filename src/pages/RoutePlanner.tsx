import { useState, useEffect, useRef } from "react";
import { Save, ArrowRight, X, GripVertical, MapPin, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/navigation/PageHeader";
import { useToast } from "@/hooks/use-toast";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { PortSearch } from "@/components/route-planner/PortSearch";
import { WaypointList } from "@/components/route-planner/WaypointList";
import { RouteSummary } from "@/components/route-planner/RouteSummary";
import { LayerTogglePanel } from "@/components/route-planner/LayerTogglePanel";
import { WeatherAssessmentPanel } from "@/components/route-planner/WeatherAssessmentPanel";
import { FuelEstimator } from "@/components/route-planner/FuelEstimator";
import { VoyageReport } from "@/components/route-planner/VoyageReport";
import searoute from "searoute-js";
import { assessRouteWeather, assessRouteSegments, WeatherAssessmentResult } from "@/utils/maritimeWeather";
import { estimateFuelAndCarbon, FuelEstimate } from "@/utils/routeAnalysis";
import { cn } from "@/lib/utils";

export interface Waypoint {
  id: string;
  name: string;
  country: string;
  coordinates: [number, number];
  unlocode?: string;
  portType?: string;
}

// Demo voyage waypoints
const demoWaypoints: Waypoint[] = [
  {
    id: "demo-1",
    name: "Le Havre",
    country: "France",
    coordinates: [0.10770356922373026, 49.491166512940964],
    unlocode: "FRLEH",
    portType: "commercial",
  },
  {
    id: "demo-2",
    name: "Covenas",
    country: "Colombia",
    coordinates: [-75.67971528736547, 9.401854301621412],
    unlocode: "COCVE",
    portType: "commercial",
  },
  {
    id: "demo-3",
    name: "Port Neches",
    country: "United States",
    coordinates: [-93.95855918629691, 29.992127822360914],
    unlocode: "USPNC",
    portType: "terminal",
  },
];

export default function RoutePlanner() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[]>(demoWaypoints);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [layersVisible, setLayersVisible] = useState({
    weather: false,
    piracy: false,
    hazards: false,
    traffic: false,
    charts: false,
  });
  const [weatherAssessment, setWeatherAssessment] = useState<WeatherAssessmentResult | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [fuelEstimate, setFuelEstimate] = useState<FuelEstimate | null>(null);
  const [fuelLoading, setFuelLoading] = useState(false);
  const currentRouteCoords = useRef<[number, number][]>([]);
  const weatherMarkers = useRef<mapboxgl.Marker[]>([]);
  const hoverPopup = useRef<mapboxgl.Popup | null>(null);
  const routeTotalNm = useRef<number>(0);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/navigation-night-v1",
      center: [-30, 25], // Center between waypoints
      zoom: 3,
      pitch: 0,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
      // Fit bounds to show all demo waypoints
      if (demoWaypoints.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        demoWaypoints.forEach((wp) => bounds.extend(wp.coordinates));
        map.current?.fitBounds(bounds, { padding: 100, duration: 0 });
      }
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update route visualization when waypoints change
  useEffect(() => {
    if (!map.current || !mapLoaded || waypoints.length < 2) {
      // Remove existing route if less than 2 waypoints
      if (map.current?.getSource("route")) {
        map.current.removeLayer("route-line");
        map.current.removeSource("route");
      }
      return;
    }

    // Generate real maritime route using searoute-js (avoids land properly)
    const waypointCoords = waypoints.map((wp) => wp.coordinates);
    let maritimeRoute: [number, number][] = [];

    for (let i = 0; i < waypointCoords.length - 1; i++) {
      const origin = {
        type: "Feature" as const,
        properties: {},
        geometry: { type: "Point" as const, coordinates: waypointCoords[i] },
      };
      const destination = {
        type: "Feature" as const,
        properties: {},
        geometry: { type: "Point" as const, coordinates: waypointCoords[i + 1] },
      };
      const result = searoute(origin, destination, "nauticalmiles");
      if (result?.geometry?.coordinates) {
        const coords = result.geometry.coordinates as [number, number][];
        maritimeRoute = i === 0 ? coords : [...maritimeRoute, ...coords.slice(1)];
      }
    }

    // Remove existing route layers/source
    if (map.current.getSource("route")) {
      if (map.current.getLayer("route-line")) map.current.removeLayer("route-line");
      if (map.current.getLayer("route-segments-line")) map.current.removeLayer("route-segments-line");
      map.current.removeSource("route");
    }

    // Draw grey loading route first
    map.current.addSource("route", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          properties: { color: "#94a3b8" },
          geometry: { type: "LineString", coordinates: maritimeRoute },
        }],
      },
    });

    map.current.addLayer({
      id: "route-segments-line",
      type: "line",
      source: "route",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": ["get", "color"],
        "line-width": 4,
        "line-opacity": 0.9,
      },
    });

    // Fit bounds
    if (waypointCoords.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      waypointCoords.forEach((coord) => bounds.extend(coord));
      map.current.fitBounds(bounds, { padding: 100 });
    }

    if (maritimeRoute.length > 0) {
      currentRouteCoords.current = maritimeRoute;
      // Pre-compute cumulative distances for hover ETA calculation
      let cumNm = 0;
      const cumDistArr: number[] = [0];
      for (let i = 1; i < maritimeRoute.length; i++) {
        const dx = maritimeRoute[i][0] - maritimeRoute[i - 1][0];
        const dy = maritimeRoute[i][1] - maritimeRoute[i - 1][1];
        const dLat = dy * Math.PI / 180;
        const dLng = dx * Math.PI / 180;
        const a = Math.sin(dLat/2)**2 + Math.cos(maritimeRoute[i-1][1]*Math.PI/180) * Math.cos(maritimeRoute[i][1]*Math.PI/180) * Math.sin(dLng/2)**2;
        cumNm += 3440 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        cumDistArr.push(cumNm);
      }
      routeTotalNm.current = cumNm;
      const routeName = `${waypoints[0].name} → ${waypoints[waypoints.length - 1].name}`;
      const mapRef = map.current;

      // Fetch segment colors + AI assessment in parallel
      setWeatherLoading(true);
      setWeatherAssessment(null);

      const riskColors = { SAFE: "#22c55e", CAUTION: "#f59e0b", DANGEROUS: "#ef4444" };

      Promise.all([
        assessRouteSegments(maritimeRoute, 5),
        assessRouteWeather(maritimeRoute, routeName),
      ])
        .then(([segments, assessment]) => {
          // Recolor route with weather segments
          if (mapRef.getSource("route")) {
            (mapRef.getSource("route") as mapboxgl.GeoJSONSource).setData({
              type: "FeatureCollection",
              features: segments.map((seg) => ({
                type: "Feature" as const,
                properties: { color: riskColors[seg.risk] },
                geometry: { type: "LineString" as const, coordinates: seg.coords },
              })),
            });
          }
          setWeatherAssessment(assessment);

          // Trigger fuel estimate now that we have weather risk
          const totalNm = assessment.totalDistanceNm;
          const routeLabel = `${waypoints[0].name} → ${waypoints[waypoints.length - 1].name}`;
          setFuelLoading(true);
          setFuelEstimate(null);
          estimateFuelAndCarbon(totalNm, assessment.riskLevel, routeLabel)
            .then(setFuelEstimate)
            .catch((err) => console.error("Fuel estimate failed:", err))
            .finally(() => setFuelLoading(false));
        })
        .catch((err) => console.error("Weather assessment failed:", err))
        .finally(() => setWeatherLoading(false));
    }
  }, [waypoints, mapLoaded]);

  // Update waypoint markers on map
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing markers
    const existingMarkers = document.querySelectorAll(".waypoint-marker");
    existingMarkers.forEach((marker) => marker.remove());

    // Add new markers
    waypoints.forEach((waypoint, index) => {
      const el = document.createElement("div");
      el.className = "waypoint-marker";
      el.innerHTML = `
        <div style="
          width: 32px;
          height: 32px;
          background: #22d3ee;
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">${index + 1}</div>
      `;

      new mapboxgl.Marker(el)
        .setLngLat(waypoint.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="color: #0f172a; padding: 8px;">
              <strong>${waypoint.name}</strong><br/>
              <span style="font-size: 12px; color: #64748b;">${waypoint.country}</span>
            </div>
          `)
        )
        .addTo(map.current!);
    });
  }, [waypoints, mapLoaded]);

  // Route hover — show ETA popup on mousemove
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const mapRef = map.current;

    // Init popup
    hoverPopup.current = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 15,
    });

    const onMouseMove = (e: mapboxgl.MapLayerMouseEvent) => {
      if (!e.features?.length || currentRouteCoords.current.length < 2) return;

      const hoveredLng = e.lngLat.lng;
      const hoveredLat = e.lngLat.lat;

      // Find nearest point index on route
      const coords = currentRouteCoords.current;
      let nearestIdx = 0;
      let minDist = Infinity;
      for (let i = 0; i < coords.length; i++) {
        const dx = coords[i][0] - hoveredLng;
        const dy = coords[i][1] - hoveredLat;
        const d = dx * dx + dy * dy;
        if (d < minDist) { minDist = d; nearestIdx = i; }
      }

      // Calculate cumulative distance to that point
      let cumNm = 0;
      for (let i = 1; i <= nearestIdx; i++) {
        const dLat = (coords[i][1] - coords[i-1][1]) * Math.PI / 180;
        const dLng = (coords[i][0] - coords[i-1][0]) * Math.PI / 180;
        const a = Math.sin(dLat/2)**2 + Math.cos(coords[i-1][1]*Math.PI/180) * Math.cos(coords[i][1]*Math.PI/180) * Math.sin(dLng/2)**2;
        cumNm += 3440 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      }

      const etaHours = cumNm / 15;
      const etaDate = new Date(Date.now() + etaHours * 3600 * 1000);
      const etaStr = etaDate.toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
      const etaDays = (etaHours / 24).toFixed(1);
      const progressPct = routeTotalNm.current > 0
        ? ((cumNm / routeTotalNm.current) * 100).toFixed(0)
        : "0";

      mapRef.getCanvas().style.cursor = "crosshair";

      hoverPopup.current!
        .setLngLat(e.lngLat)
        .setHTML(`
          <div style="color:#0f172a; padding:8px; min-width:180px; font-family:sans-serif;">
            <div style="font-size:11px; color:#64748b; margin-bottom:4px;">Route Position</div>
            <div style="font-size:12px; font-weight:600; margin-bottom:6px;">
              📍 ${hoveredLat.toFixed(2)}°N, ${hoveredLng.toFixed(2)}°E
            </div>
            <hr style="border-color:#e2e8f0; margin:4px 0"/>
            <div style="font-size:11px; margin-bottom:2px;">
              ⏱ <strong>ETA:</strong> ${etaStr}
            </div>
            <div style="font-size:11px; margin-bottom:2px;">
              🚢 <strong>Day:</strong> ${etaDays} of voyage
            </div>
            <div style="font-size:11px; color:#64748b;">
              📏 ${cumNm.toFixed(0)} nm from departure (${progressPct}%)
            </div>
          </div>
        `)
        .addTo(mapRef);
    };

    const onMouseLeave = () => {
      mapRef.getCanvas().style.cursor = "";
      hoverPopup.current?.remove();
    };

    mapRef.on("mousemove", "route-segments-line", onMouseMove);
    mapRef.on("mouseleave", "route-segments-line", onMouseLeave);

    return () => {
      mapRef.off("mousemove", "route-segments-line", onMouseMove);
      mapRef.off("mouseleave", "route-segments-line", onMouseLeave);
      hoverPopup.current?.remove();
    };
  }, [mapLoaded]);

  // Add color-coded weather markers on the map when assessment loads
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove old weather markers
    weatherMarkers.current.forEach((m) => m.remove());
    weatherMarkers.current = [];

    if (!weatherAssessment) return;

    const riskColors = {
      SAFE: "#22c55e",
      CAUTION: "#f59e0b",
      DANGEROUS: "#ef4444",
    };

    weatherAssessment.weatherData.forEach((d, i) => {
      const color = riskColors[d.pointRisk];
      const el = document.createElement("div");
      el.innerHTML = `
        <div style="
          width: 28px;
          height: 28px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: bold;
          color: white;
          box-shadow: 0 0 10px ${color}99;
          cursor: pointer;
        ">W${i + 1}</div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([d.lng, d.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 20 }).setHTML(`
            <div style="color:#0f172a; padding:8px; min-width:160px;">
              <strong>Weather Point ${i + 1}</strong><br/>
              <span style="color:${color}; font-weight:bold;">${d.pointRisk}</span><br/>
              <span style="font-size:11px; color:#64748b;">ETA: ${d.arrival_datetime}</span><br/>
              <hr style="margin:4px 0; border-color:#e2e8f0"/>
              <span style="font-size:11px;">🌊 Wave: ${d.wave_height_max.toFixed(1)}m</span><br/>
              <span style="font-size:11px;">💨 Wind: ${d.wind_speed_max.toFixed(0)} kn</span><br/>
              <span style="font-size:11px;">🌀 Swell: ${d.swell_wave_height_max.toFixed(1)}m</span>
            </div>
          `)
        )
        .addTo(map.current!);

      weatherMarkers.current.push(marker);
    });
  }, [weatherAssessment, mapLoaded]);

  const handleAddWaypoint = (waypoint: Waypoint) => {
    setWaypoints([...waypoints, waypoint]);
    // Zoom to new waypoint
    if (map.current) {
      map.current.flyTo({
        center: waypoint.coordinates,
        zoom: 8,
        duration: 1500,
      });
    }
  };

  const handleRemoveWaypoint = (id: string) => {
    setWaypoints(waypoints.filter((wp) => wp.id !== id));
  };

  const handleReorderWaypoints = (newOrder: Waypoint[]) => {
    setWaypoints(newOrder);
  };

  const handleFocusWaypoint = (waypoint: Waypoint) => {
    if (map.current) {
      map.current.flyTo({
        center: waypoint.coordinates,
        zoom: 8,
        duration: 1500,
      });
    }
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all waypoints?")) {
      setWaypoints([]);
    }
  };

  // Calculate distance between two coordinates (Haversine formula)
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

  const handleSaveDraft = () => {
    if (waypoints.length < 2) {
      toast({
        title: "Cannot Save Route",
        description: "Please add at least 2 waypoints to create a route.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Calculate total distance
      let totalDistance = 0;
      for (let i = 0; i < waypoints.length - 1; i++) {
        totalDistance += calculateDistance(waypoints[i].coordinates, waypoints[i + 1].coordinates);
      }

      // Estimate voyage time (assuming average speed of 15 knots)
      const averageSpeed = 15; // knots
      const estimatedHours = totalDistance / averageSpeed;
      const estimatedDays = Math.ceil(estimatedHours / 24);

      // Generate route name from first and last waypoint
      const routeName = waypoints.length > 0
        ? `${waypoints[0].name} → ${waypoints[waypoints.length - 1].name}`
        : "Unnamed Route";

      // Create voyage object matching Dashboard format
      const voyage = {
        id: `draft-${Date.now()}`,
        routeName,
        vesselName: "MV Pacific Star", // Default vessel name, could be from user settings
        lastUpdated: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        status: "draft" as const,
        distance: Math.round(totalDistance),
        duration: `${estimatedDays} days`,
        charts: ["UKHO 1234", "UKHO 5678"], // Default charts, could be calculated based on route
        regulationSummary: "Pending compliance review",
        route: {
          start: waypoints[0].coordinates,
          end: waypoints[waypoints.length - 1].coordinates,
          waypoints: waypoints.map((wp) => wp.coordinates),
        },
        waypoints: waypoints, // Store full waypoint data for editing
      };

      // Get existing saved routes from localStorage
      const savedRoutes = JSON.parse(localStorage.getItem("savedRoutes") || "[]");
      
      // Add new route
      savedRoutes.push(voyage);
      
      // Save to localStorage
      localStorage.setItem("savedRoutes", JSON.stringify(savedRoutes));

      toast({
        title: "Route Saved",
        description: `Draft route "${routeName}" has been saved successfully.`,
      });

      // Navigate to dashboard after a short delay to show the saved route
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      toast({
        title: "Error Saving Route",
        description: "Failed to save the route. Please try again.",
        variant: "destructive",
      });
      console.error("Error saving route:", error);
    }
  };

  const handleNext = () => {
    if (waypoints.length < 2) {
      alert("Please add at least 2 waypoints to create a route.");
      return;
    }
    
    // Store current route waypoints for route comparison
    const currentRoute = {
      waypoints: waypoints,
      coordinates: waypoints.map((wp) => wp.coordinates),
      routeName: waypoints.length > 0
        ? `${waypoints[0].name} → ${waypoints[waypoints.length - 1].name}`
        : "Unnamed Route",
    };
    
    localStorage.setItem("currentRoute", JSON.stringify(currentRoute));
    
    // Navigate to loading page
    navigate("/loading");
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Bar */}
      <PageHeader
        title="Plan New Voyage"
        description="Search ports, add stops, and build your route."
        backTo="/dashboard"
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[28%] min-w-[320px] bg-card border-r border-border/50 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Port Search */}
            <PortSearch onSelectPort={handleAddWaypoint} map={map.current} />

            {/* Waypoints List */}
            <WaypointList
              waypoints={waypoints}
              onRemove={handleRemoveWaypoint}
              onReorder={handleReorderWaypoints}
              onFocus={handleFocusWaypoint}
              onClearAll={handleClearAll}
            />

            {/* Route Summary */}
            {waypoints.length >= 2 && (
              <RouteSummary waypoints={waypoints} />
            )}

            {/* AI Weather Assessment */}
            {waypoints.length >= 2 && (
              <WeatherAssessmentPanel
                assessment={weatherAssessment}
                loading={weatherLoading}
                onRefresh={() => {
                  if (currentRouteCoords.current.length > 0) {
                    const routeName = `${waypoints[0].name} → ${waypoints[waypoints.length - 1].name}`;
                    setWeatherLoading(true);
                    setWeatherAssessment(null);
                    assessRouteWeather(currentRouteCoords.current, routeName)
                      .then(setWeatherAssessment)
                      .catch((err) => console.error("Weather assessment failed:", err))
                      .finally(() => setWeatherLoading(false));
                  }
                }}
              />
            )}

            {/* Fuel & Carbon Estimator */}
            {waypoints.length >= 2 && (
              <FuelEstimator estimate={fuelEstimate} loading={fuelLoading} />
            )}
          </div>

          {/* Action Buttons Footer */}
          <div className="p-4 border-t border-border/50 space-y-2 bg-card">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSaveDraft}
              disabled={waypoints.length < 2}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft Route
            </Button>
            <VoyageReport
              startPort={waypoints[0]?.name ?? ""}
              endPort={waypoints[waypoints.length - 1]?.name ?? ""}
              distanceNm={weatherAssessment?.totalDistanceNm ?? 0}
              estimatedDays={weatherAssessment?.estimatedDays ?? 0}
              weatherAssessment={weatherAssessment}
              fuelEstimate={fuelEstimate}
              disabled={waypoints.length < 2 || !weatherAssessment}
            />
            <Button
              className="w-full"
              onClick={handleNext}
              disabled={waypoints.length < 2}
            >
              Next → Generate AI Analysis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          <div ref={mapContainer} className="absolute inset-0" />
          
          {/* Layer Toggle Panel */}
          <LayerTogglePanel
            layersVisible={layersVisible}
            onToggleLayer={(layer) =>
              setLayersVisible((prev) => ({
                ...prev,
                [layer]: !prev[layer],
              }))
            }
          />
        </div>
      </div>
    </div>
  );
}

