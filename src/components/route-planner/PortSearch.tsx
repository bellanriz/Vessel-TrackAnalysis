import { useState, useEffect, useRef, useMemo } from "react";
import { Search, Plus, List, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Waypoint } from "@/pages/RoutePlanner";
import mapboxgl from "mapbox-gl";

interface PortSearchProps {
  onSelectPort: (waypoint: Waypoint) => void;
  map: mapboxgl.Map | null;
}

// Comprehensive ports database - sorted alphabetically by name
const globalPorts = [
  { name: "Abidjan", country: "Ivory Coast", coordinates: [-4.0267, 5.3167] as [number, number], unlocode: "CIABJ", portType: "commercial" },
  { name: "Abu Dhabi", country: "United Arab Emirates", coordinates: [54.3773, 24.4539] as [number, number], unlocode: "AEAUH", portType: "commercial" },
  { name: "Adelaide", country: "Australia", coordinates: [138.6007, -34.9285] as [number, number], unlocode: "AUADL", portType: "commercial" },
  { name: "Alexandria", country: "Egypt", coordinates: [29.9187, 31.2001] as [number, number], unlocode: "EGALY", portType: "commercial" },
  { name: "Algeciras", country: "Spain", coordinates: [-5.4531, 36.1263] as [number, number], unlocode: "ESALG", portType: "commercial" },
  { name: "Amsterdam", country: "Netherlands", coordinates: [4.9041, 52.3676] as [number, number], unlocode: "NLAMS", portType: "commercial" },
  { name: "Antwerp", country: "Belgium", coordinates: [4.4025, 51.2194] as [number, number], unlocode: "BEANR", portType: "commercial" },
  { name: "Auckland", country: "New Zealand", coordinates: [174.7633, -36.8485] as [number, number], unlocode: "NZAKL", portType: "commercial" },
  { name: "Baltimore", country: "United States", coordinates: [-76.6122, 39.2904] as [number, number], unlocode: "USBAL", portType: "commercial" },
  { name: "Bangkok", country: "Thailand", coordinates: [100.5018, 13.7563] as [number, number], unlocode: "THBKK", portType: "commercial" },
  { name: "Barcelona", country: "Spain", coordinates: [2.1734, 41.3851] as [number, number], unlocode: "ESBCN", portType: "commercial" },
  { name: "Barcelona", country: "Venezuela", coordinates: [-64.6867, 10.1364] as [number, number], unlocode: "VEBCN", portType: "commercial" },
  { name: "Bari", country: "Italy", coordinates: [16.8719, 41.1177] as [number, number], unlocode: "ITBRI", portType: "commercial" },
  { name: "Belfast", country: "United Kingdom", coordinates: [-5.9301, 54.5973] as [number, number], unlocode: "GBBEL", portType: "commercial" },
  { name: "Bilbao", country: "Spain", coordinates: [-2.9342, 43.2627] as [number, number], unlocode: "ESBIO", portType: "commercial" },
  { name: "Bombay", country: "India", coordinates: [72.8777, 19.0760] as [number, number], unlocode: "INBOM", portType: "commercial" },
  { name: "Boston", country: "United States", coordinates: [-71.0589, 42.3601] as [number, number], unlocode: "USBOS", portType: "commercial" },
  { name: "Bremen", country: "Germany", coordinates: [8.8017, 53.0793] as [number, number], unlocode: "DEBRE", portType: "commercial" },
  { name: "Brisbane", country: "Australia", coordinates: [153.0251, -27.4698] as [number, number], unlocode: "AUBNE", portType: "commercial" },
  { name: "Buenos Aires", country: "Argentina", coordinates: [-58.3816, -34.6037] as [number, number], unlocode: "ARBUE", portType: "commercial" },
  { name: "Cairo", country: "Egypt", coordinates: [31.2357, 30.0444] as [number, number], unlocode: "EGCAI", portType: "terminal" },
  { name: "Cape Town", country: "South Africa", coordinates: [18.4241, -33.9249] as [number, number], unlocode: "ZACPT", portType: "commercial" },
  { name: "Casablanca", country: "Morocco", coordinates: [-7.6114, 33.5731] as [number, number], unlocode: "MACAS", portType: "commercial" },
  { name: "Charleston", country: "United States", coordinates: [-79.9311, 32.7765] as [number, number], unlocode: "USCHS", portType: "commercial" },
  { name: "Chennai", country: "India", coordinates: [80.2707, 13.0827] as [number, number], unlocode: "INMAA", portType: "commercial" },
  { name: "Chicago", country: "United States", coordinates: [-87.6298, 41.8781] as [number, number], unlocode: "USCHI", portType: "commercial" },
  { name: "Colombo", country: "Sri Lanka", coordinates: [79.8612, 6.9271] as [number, number], unlocode: "LKCMB", portType: "commercial" },
  { name: "Copenhagen", country: "Denmark", coordinates: [12.5683, 55.6761] as [number, number], unlocode: "DKCPH", portType: "commercial" },
  { name: "Covenas", country: "Colombia", coordinates: [-75.6797, 9.4019] as [number, number], unlocode: "COCVE", portType: "commercial" },
  { name: "Cozumel", country: "Mexico", coordinates: [-86.949, 20.508] as [number, number], unlocode: "MXCZM", portType: "terminal" },
  { name: "Dakar", country: "Senegal", coordinates: [-17.4677, 14.7167] as [number, number], unlocode: "SNDKR", portType: "commercial" },
  { name: "Dalian", country: "China", coordinates: [121.6147, 38.9140] as [number, number], unlocode: "CNDLC", portType: "commercial" },
  { name: "Dammam", country: "Saudi Arabia", coordinates: [50.1972, 26.4207] as [number, number], unlocode: "SADMM", portType: "commercial" },
  { name: "Dar es Salaam", country: "Tanzania", coordinates: [39.2083, -6.7924] as [number, number], unlocode: "TZDAR", portType: "commercial" },
  { name: "Doha", country: "Qatar", coordinates: [51.5310, 25.2854] as [number, number], unlocode: "QADOH", portType: "commercial" },
  { name: "Dubai", country: "United Arab Emirates", coordinates: [55.2708, 25.2048] as [number, number], unlocode: "AEDXB", portType: "commercial" },
  { name: "Dublin", country: "Ireland", coordinates: [-6.2603, 53.3498] as [number, number], unlocode: "IEDUB", portType: "commercial" },
  { name: "Durban", country: "South Africa", coordinates: [31.0292, -29.8587] as [number, number], unlocode: "ZADUR", portType: "commercial" },
  { name: "Felixstowe", country: "United Kingdom", coordinates: [1.3512, 51.9617] as [number, number], unlocode: "GBFEL", portType: "commercial" },
  { name: "Fos-sur-Mer", country: "France", coordinates: [4.9447, 43.4380] as [number, number], unlocode: "FRFOS", portType: "commercial" },
  { name: "Fremantle", country: "Australia", coordinates: [115.7471, -32.0567] as [number, number], unlocode: "AUFRE", portType: "commercial" },
  { name: "Genoa", country: "Italy", coordinates: [8.9463, 44.4056] as [number, number], unlocode: "ITGOA", portType: "commercial" },
  { name: "Gothenburg", country: "Sweden", coordinates: [11.9746, 57.7089] as [number, number], unlocode: "SEGOT", portType: "commercial" },
  { name: "Guangzhou", country: "China", coordinates: [113.2644, 23.1291] as [number, number], unlocode: "CNCAN", portType: "commercial" },
  { name: "Hamburg", country: "Germany", coordinates: [9.9937, 53.5511] as [number, number], unlocode: "DEHAM", portType: "commercial" },
  { name: "Havana", country: "Cuba", coordinates: [-82.3666, 23.1136] as [number, number], unlocode: "CUHAV", portType: "commercial" },
  { name: "Helsinki", country: "Finland", coordinates: [24.9384, 60.1699] as [number, number], unlocode: "FIHEL", portType: "commercial" },
  { name: "Ho Chi Minh City", country: "Vietnam", coordinates: [106.6297, 10.8231] as [number, number], unlocode: "VNSGN", portType: "commercial" },
  { name: "Hong Kong", country: "China", coordinates: [114.1694, 22.3193] as [number, number], unlocode: "CNHKG", portType: "commercial" },
  { name: "Houston", country: "United States", coordinates: [-95.3698, 29.7604] as [number, number], unlocode: "USHOU", portType: "commercial" },
  { name: "Istanbul", country: "Turkey", coordinates: [28.9784, 41.0082] as [number, number], unlocode: "TRIST", portType: "commercial" },
  { name: "Jakarta", country: "Indonesia", coordinates: [106.8451, -6.2088] as [number, number], unlocode: "IDJKT", portType: "commercial" },
  { name: "Jeddah", country: "Saudi Arabia", coordinates: [39.1826, 21.4858] as [number, number], unlocode: "SAJED", portType: "commercial" },
  { name: "Karachi", country: "Pakistan", coordinates: [67.0011, 24.8607] as [number, number], unlocode: "PKKHI", portType: "commercial" },
  { name: "Kobe", country: "Japan", coordinates: [135.1830, 34.6901] as [number, number], unlocode: "JPUKB", portType: "commercial" },
  { name: "Kolkata", country: "India", coordinates: [88.3639, 22.5726] as [number, number], unlocode: "INCCU", portType: "commercial" },
  { name: "Kuwait", country: "Kuwait", coordinates: [48.0848, 29.3759] as [number, number], unlocode: "KWKWI", portType: "commercial" },
  { name: "Lagos", country: "Nigeria", coordinates: [3.3792, 6.5244] as [number, number], unlocode: "NGLOS", portType: "commercial" },
  { name: "Le Havre", country: "France", coordinates: [0.1077, 49.4912] as [number, number], unlocode: "FRLEH", portType: "commercial" },
  { name: "Lima", country: "Peru", coordinates: [-77.0428, -12.0464] as [number, number], unlocode: "PELIM", portType: "commercial" },
  { name: "Lisbon", country: "Portugal", coordinates: [-9.1393, 38.7223] as [number, number], unlocode: "PTLIS", portType: "commercial" },
  { name: "Liverpool", country: "United Kingdom", coordinates: [-2.9916, 53.4084] as [number, number], unlocode: "GBLIV", portType: "commercial" },
  { name: "London", country: "United Kingdom", coordinates: [-0.1276, 51.5074] as [number, number], unlocode: "GBLON", portType: "commercial" },
  { name: "Long Beach", country: "United States", coordinates: [-118.1937, 33.7701] as [number, number], unlocode: "USLGB", portType: "commercial" },
  { name: "Los Angeles", country: "United States", coordinates: [-118.2437, 34.0522] as [number, number], unlocode: "USLAX", portType: "commercial" },
  { name: "Manila", country: "Philippines", coordinates: [120.9842, 14.5995] as [number, number], unlocode: "PHMNL", portType: "commercial" },
  { name: "Marseille", country: "France", coordinates: [5.3698, 43.2965] as [number, number], unlocode: "FRMRS", portType: "commercial" },
  { name: "Melbourne", country: "Australia", coordinates: [144.9631, -37.8136] as [number, number], unlocode: "AUMEL", portType: "commercial" },
  { name: "Miami", country: "United States", coordinates: [-80.1918, 25.7617] as [number, number], unlocode: "USMIA", portType: "commercial" },
  { name: "Mombasa", country: "Kenya", coordinates: [39.6682, -4.0435] as [number, number], unlocode: "KEMOM", portType: "commercial" },
  { name: "Montreal", country: "Canada", coordinates: [-73.5673, 45.5017] as [number, number], unlocode: "CAMTR", portType: "commercial" },
  { name: "Mumbai", country: "India", coordinates: [72.8777, 19.0760] as [number, number], unlocode: "INBOM", portType: "commercial" },
  { name: "Naples", country: "Italy", coordinates: [14.2681, 40.8518] as [number, number], unlocode: "ITNAP", portType: "commercial" },
  { name: "New Orleans", country: "United States", coordinates: [-90.0715, 29.9511] as [number, number], unlocode: "USMSY", portType: "commercial" },
  { name: "New York", country: "United States", coordinates: [-74.006, 40.7128] as [number, number], unlocode: "USNYC", portType: "commercial" },
  { name: "Newark", country: "United States", coordinates: [-74.1724, 40.7357] as [number, number], unlocode: "USEWR", portType: "commercial" },
  { name: "Norfolk", country: "United States", coordinates: [-76.2859, 36.8468] as [number, number], unlocode: "USORF", portType: "commercial" },
  { name: "Osaka", country: "Japan", coordinates: [135.5023, 34.6937] as [number, number], unlocode: "JPOSA", portType: "commercial" },
  { name: "Oslo", country: "Norway", coordinates: [10.7522, 59.9139] as [number, number], unlocode: "NOOSL", portType: "commercial" },
  { name: "Panama City", country: "Panama", coordinates: [-79.5199, 8.9824] as [number, number], unlocode: "PAPTY", portType: "commercial" },
  { name: "Perth", country: "Australia", coordinates: [115.8605, -31.9505] as [number, number], unlocode: "AUFRE", portType: "commercial" },
  { name: "Philadelphia", country: "United States", coordinates: [-75.1652, 39.9526] as [number, number], unlocode: "USPHL", portType: "commercial" },
  { name: "Piraeus", country: "Greece", coordinates: [23.6444, 37.9425] as [number, number], unlocode: "GRPIR", portType: "commercial" },
  { name: "Port Neches", country: "United States", coordinates: [-93.9586, 29.9921] as [number, number], unlocode: "USPNC", portType: "terminal" },
  { name: "Port Said", country: "Egypt", coordinates: [32.2849, 31.2653] as [number, number], unlocode: "EGPSD", portType: "commercial" },
  { name: "Portland", country: "United States", coordinates: [-122.6765, 45.5152] as [number, number], unlocode: "USPDX", portType: "commercial" },
  { name: "Qingdao", country: "China", coordinates: [120.3826, 36.0671] as [number, number], unlocode: "CNTAO", portType: "commercial" },
  { name: "Rio de Janeiro", country: "Brazil", coordinates: [-43.1729, -22.9068] as [number, number], unlocode: "BRRIO", portType: "commercial" },
  { name: "Rotterdam", country: "Netherlands", coordinates: [4.4777, 51.9225] as [number, number], unlocode: "NLRTM", portType: "commercial" },
  { name: "Salvador", country: "Brazil", coordinates: [-38.5108, -12.9714] as [number, number], unlocode: "BRSSA", portType: "commercial" },
  { name: "San Francisco", country: "United States", coordinates: [-122.4194, 37.7749] as [number, number], unlocode: "USSFO", portType: "commercial" },
  { name: "Santos", country: "Brazil", coordinates: [-46.3096, -23.9608] as [number, number], unlocode: "BRSTS", portType: "commercial" },
  { name: "Seattle", country: "United States", coordinates: [-122.3321, 47.6062] as [number, number], unlocode: "USSEA", portType: "commercial" },
  { name: "Shanghai", country: "China", coordinates: [121.4737, 31.2304] as [number, number], unlocode: "CNSHA", portType: "commercial" },
  { name: "Singapore", country: "Singapore", coordinates: [103.8198, 1.3521] as [number, number], unlocode: "SGSIN", portType: "commercial" },
  { name: "Southampton", country: "United Kingdom", coordinates: [-1.4044, 50.9097] as [number, number], unlocode: "GBSOU", portType: "commercial" },
  { name: "Stockholm", country: "Sweden", coordinates: [18.0686, 59.3293] as [number, number], unlocode: "SESTO", portType: "commercial" },
  { name: "Suez", country: "Egypt", coordinates: [32.5498, 29.9668] as [number, number], unlocode: "EGSUZ", portType: "terminal" },
  { name: "Sydney", country: "Australia", coordinates: [151.2093, -33.8688] as [number, number], unlocode: "AUSYD", portType: "commercial" },
  { name: "Tampa Bay", country: "United States", coordinates: [-82.458, 27.606] as [number, number], unlocode: "USTPA", portType: "commercial" },
  { name: "Tianjin", country: "China", coordinates: [117.2008, 39.0842] as [number, number], unlocode: "CNTSN", portType: "commercial" },
  { name: "Tokyo", country: "Japan", coordinates: [139.6917, 35.6762] as [number, number], unlocode: "JPTYO", portType: "commercial" },
  { name: "Toronto", country: "Canada", coordinates: [-79.3832, 43.6532] as [number, number], unlocode: "CATOR", portType: "commercial" },
  { name: "Valencia", country: "Spain", coordinates: [-0.3758, 39.4699] as [number, number], unlocode: "ESVLC", portType: "commercial" },
  { name: "Valparaiso", country: "Chile", coordinates: [-71.6127, -33.0472] as [number, number], unlocode: "CLVAP", portType: "commercial" },
  { name: "Vancouver", country: "Canada", coordinates: [-123.1216, 49.2827] as [number, number], unlocode: "CAVAN", portType: "commercial" },
  { name: "Venice", country: "Italy", coordinates: [12.3155, 45.4408] as [number, number], unlocode: "ITVCE", portType: "commercial" },
  { name: "Yokohama", country: "Japan", coordinates: [139.6380, 35.4437] as [number, number], unlocode: "JPYOK", portType: "commercial" },
  { name: "Zeebrugge", country: "Belgium", coordinates: [3.2044, 51.3314] as [number, number], unlocode: "BEZEE", portType: "commercial" },
].sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name

const portTypeIcons: Record<string, string> = {
  commercial: "🏭",
  terminal: "⚓",
  anchorage: "🔵",
};

export function PortSearch({ onSelectPort, map }: PortSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllPorts, setShowAllPorts] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hoveredPort, setHoveredPort] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Filter and sort ports based on search query
  const filteredPorts = useMemo(() => {
    if (searchQuery.trim() === "") {
      return showAllPorts ? globalPorts : [];
    }

    const query = searchQuery.toLowerCase();
    return globalPorts.filter(
      (port) =>
        port.name.toLowerCase().includes(query) ||
        port.country.toLowerCase().includes(query) ||
        port.unlocode?.toLowerCase().includes(query)
    );
  }, [searchQuery, showAllPorts]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [filteredPorts]);

  const handleSelectPort = (port: typeof globalPorts[0]) => {
    const waypoint: Waypoint = {
      id: `${Date.now()}-${Math.random()}`,
      name: port.name,
      country: port.country,
      coordinates: port.coordinates,
      unlocode: port.unlocode,
      portType: port.portType,
    };

    onSelectPort(waypoint);
    setSearchQuery("");
    setShowAllPorts(false);

    // Zoom map to port
    if (map) {
      map.flyTo({
        center: port.coordinates,
        zoom: 10,
        duration: 1500,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredPorts.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0 && filteredPorts[selectedIndex]) {
      e.preventDefault();
      handleSelectPort(filteredPorts[selectedIndex]);
    } else if (e.key === "Escape") {
      setSearchQuery("");
      setShowAllPorts(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-foreground">Global Port Search</h3>
          {!searchQuery && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setShowAllPorts(!showAllPorts)}
            >
              {showAllPorts ? (
                <>
                  <X className="w-3 h-3 mr-1" />
                  Hide
                </>
              ) : (
                <>
                  <List className="w-3 h-3 mr-1" />
                  Browse All
                </>
              )}
            </Button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={searchRef}
            type="text"
            placeholder="Search by port name, country, or UN/LOCODE..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim() !== "") {
                setShowAllPorts(true);
              }
            }}
            onKeyDown={handleKeyDown}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <p className="text-xs text-muted-foreground mt-1">
            {filteredPorts.length} port{filteredPorts.length !== 1 ? "s" : ""} found
          </p>
        )}
      </div>

      {/* Port List - Show all ports or search results */}
      {filteredPorts.length > 0 && (
        <Card className="max-h-[400px] overflow-y-auto">
          <div className="p-2 space-y-1">
            {filteredPorts.map((port, index) => (
              <div
                key={`${port.name}-${port.coordinates[0]}-${port.country}`}
                className={`
                  group p-3 rounded-lg cursor-pointer transition-colors border
                  ${index === selectedIndex ? "bg-primary/20 border-primary/50" : "border-transparent hover:bg-muted hover:border-border"}
                  ${hoveredPort === `${port.name}-${port.country}` ? "bg-muted" : ""}
                `}
                onMouseEnter={() => setHoveredPort(`${port.name}-${port.country}`)}
                onMouseLeave={() => setHoveredPort(null)}
                onClick={() => handleSelectPort(port)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{portTypeIcons[port.portType || "commercial"] || "⚓"}</span>
                      <span className="font-medium text-foreground truncate">{port.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{port.country}</span>
                      {port.unlocode && (
                        <>
                          <span>•</span>
                          <span className="font-mono">{port.unlocode}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPort(port);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {searchQuery && filteredPorts.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground">No ports found matching "{searchQuery}"</p>
          <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
        </Card>
      )}

      {/* Initial State - Show browse button hint */}
      {!searchQuery && !showAllPorts && (
        <Card className="p-4 text-center bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Click "Browse All" to view all ports sorted A-Z, or start typing to search
          </p>
        </Card>
      )}

      {/* Manual Coordinate Entry */}
      {searchQuery.includes(",") && searchQuery.split(",").length === 2 && filteredPorts.length === 0 && (
        <Card className="p-3 bg-muted/50">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Tip: Enter coordinates as "longitude, latitude" (e.g., "103.8198, 1.3521")
            </p>
            {(() => {
              const parts = searchQuery.split(",").map((s) => s.trim());
              const lon = parseFloat(parts[0]);
              const lat = parseFloat(parts[1]);
              if (!isNaN(lon) && !isNaN(lat) && lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90) {
                return (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const waypoint: Waypoint = {
                        id: `${Date.now()}-${Math.random()}`,
                        name: `Custom Point (${lon.toFixed(4)}, ${lat.toFixed(4)})`,
                        country: "Custom Location",
                        coordinates: [lon, lat],
                      };
                      onSelectPort(waypoint);
                      setSearchQuery("");
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Custom Location
                  </Button>
                );
              }
              return null;
            })()}
          </div>
        </Card>
      )}
    </div>
  );
}

