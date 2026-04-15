import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Plus, Minus, Compass, Maximize2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapViewProps {
  onWaypointSelect?: (waypoint: any) => void;
}

// Demo waypoints for the Tampa Bay to Cozumel route
const voyageRoute = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      properties: { name: "Tampa Bay (USTPA)", index: 1 },
      geometry: { type: "Point" as const, coordinates: [-82.458, 27.606] },
    },
    {
      type: "Feature" as const,
      properties: { name: "Gulf Passage WP1", index: 2 },
      geometry: { type: "Point" as const, coordinates: [-84.5, 25.5] },
    },
    {
      type: "Feature" as const,
      properties: { name: "ECA Exit Point", index: 3 },
      geometry: { type: "Point" as const, coordinates: [-86.0, 24.0] },
    },
    {
      type: "Feature" as const,
      properties: { name: "Yucatan Approach", index: 4 },
      geometry: { type: "Point" as const, coordinates: [-86.8, 21.5] },
    },
    {
      type: "Feature" as const,
      properties: { name: "Cozumel (MXCZM)", index: 5 },
      geometry: { type: "Point" as const, coordinates: [-86.949, 20.508] },
    },
  ],
};

const routeLine = {
  type: "Feature" as const,
  properties: {},
  geometry: {
    type: "LineString" as const,
    coordinates: voyageRoute.features.map((f) => f.geometry.coordinates),
  },
};

// ECA Zone approximation (simplified)
const ecaZone = {
  type: "Feature" as const,
  properties: { name: "ECA Zone" },
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

const INITIAL_CENTER: [number, number] = [-85, 24];
const INITIAL_ZOOM = 5;

export function MapView({ onWaypointSelect }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [center, setCenter] = useState<[number, number]>(INITIAL_CENTER);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Mapbox access token
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    
    if (!mapboxToken) {
      setApiKeyMissing(true);
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/navigation-night-v1",
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      pitch: 20,
    });

    // Listen for map move events to update center and zoom
    map.current.on("move", () => {
      if (!map.current) return;
      const mapCenter = map.current.getCenter();
      const mapZoom = map.current.getZoom();
      setCenter([mapCenter.lng, mapCenter.lat]);
      setZoom(mapZoom);
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
          "fill-color": "#f59e0b",
          "fill-opacity": 0.15,
        },
      });

      map.current.addLayer({
        id: "eca-zone-line",
        type: "line",
        source: "eca-zone",
        paint: {
          "line-color": "#f59e0b",
          "line-width": 2,
          "line-dasharray": [3, 2],
        },
      });

      // Add route line
      map.current.addSource("route", {
        type: "geojson",
        data: routeLine as any,
      });

      map.current.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: {
          "line-color": "#22d3ee",
          "line-width": 3,
          "line-opacity": 0.8,
        },
      });

      // Add animated dashed line on top
      map.current.addLayer({
        id: "route-line-dashed",
        type: "line",
        source: "route",
        paint: {
          "line-color": "#ffffff",
          "line-width": 1.5,
          "line-dasharray": [2, 4],
          "line-opacity": 0.5,
        },
      });

      // Add waypoints
      map.current.addSource("waypoints", {
        type: "geojson",
        data: voyageRoute as any,
      });

      map.current.addLayer({
        id: "waypoint-circles",
        type: "circle",
        source: "waypoints",
        paint: {
          "circle-radius": 10,
          "circle-color": "#22d3ee",
          "circle-stroke-width": 3,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.current.addLayer({
        id: "waypoint-labels",
        type: "symbol",
        source: "waypoints",
        layout: {
          "text-field": ["get", "index"],
          "text-size": 11,
          "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
        },
        paint: {
          "text-color": "#0f172a",
        },
      });

      // Click handler for waypoints
      map.current.on("click", "waypoint-circles", (e) => {
        if (e.features && e.features[0]) {
          const feature = e.features[0];
          onWaypointSelect?.(feature.properties);
          
          new mapboxgl.Popup()
            .setLngLat((feature.geometry as any).coordinates)
            .setHTML(`
              <div style="color: #0f172a; padding: 4px;">
                <strong>${feature.properties?.name}</strong>
              </div>
            `)
            .addTo(map.current!);
        }
      });

      map.current.on("mouseenter", "waypoint-circles", () => {
        if (map.current) map.current.getCanvas().style.cursor = "pointer";
      });

      map.current.on("mouseleave", "waypoint-circles", () => {
        if (map.current) map.current.getCanvas().style.cursor = "";
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [onWaypointSelect]);

  const handleZoomIn = () => map.current?.zoomIn();
  const handleZoomOut = () => map.current?.zoomOut();
  const handleResetBearing = () => map.current?.resetNorth();
  const handleFitRoute = () => {
    if (!map.current) return;
    const bounds = new mapboxgl.LngLatBounds();
    voyageRoute.features.forEach((f) => {
      bounds.extend(f.geometry.coordinates as [number, number]);
    });
    map.current.fitBounds(bounds, { padding: 50 });
  };
  const handleReset = () => {
    map.current?.flyTo({
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      duration: 1500,
    });
  };

  if (apiKeyMissing) {
    return (
      <div className="relative flex-1 bg-maritime-deep flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
            <Layers className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Mapbox API Key Required</h3>
          <p className="text-sm text-muted-foreground mb-4">
            To view the interactive nautical chart, add your Mapbox public token as{" "}
            <code className="px-1.5 py-0.5 bg-secondary rounded text-primary font-mono text-xs">
              VITE_MAPBOX_TOKEN
            </code>{" "}
            to your environment variables.
          </p>
          <div className="bg-card rounded-lg p-4 border border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Demo route preview:</p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-status-safe">Tampa Bay</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-status-caution">Gulf of Mexico</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-primary">Cozumel</span>
            </div>
          </div>
        </div>
        
        {/* Static background pattern */}
        <div className="absolute inset-0 -z-10 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 bg-maritime-deep">
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Coordinates Display (from tutorial) */}
      <div className="absolute top-4 left-4 z-10 bg-card/90 backdrop-blur-sm px-3 py-2 rounded-md border border-border/50">
        <div className="text-xs font-mono text-muted-foreground">
          Longitude: {center[0].toFixed(5)} | Latitude: {center[1].toFixed(5)} | Zoom: {zoom.toFixed(2)}
        </div>
      </div>

      {/* Reset Button (from tutorial) */}
      <div className="absolute top-16 left-4 z-10">
        <Button
          variant="default"
          size="sm"
          onClick={handleReset}
          className="bg-card/90 backdrop-blur-sm hover:bg-card"
        >
          Reset View
        </Button>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
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
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleFitRoute}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Scale Bar */}
      <div className="absolute bottom-4 left-4 map-control px-3 py-1.5 text-xs font-mono">
        <span className="text-muted-foreground">Scale: </span>
        <span>50 nm</span>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 map-control p-3 space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-primary" />
          <span>Planned Route</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-status-caution/30 border border-status-caution" />
          <span>ECA Zone</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary border-2 border-foreground" />
          <span>Waypoint</span>
        </div>
      </div>
    </div>
  );
}
