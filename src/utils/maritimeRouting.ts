/**
 * Maritime Routing Utilities
 * Implements great circle sailing with land avoidance
 */

export interface Coordinate {
  lng: number;
  lat: number;
}

/**
 * Calculate great circle intermediate waypoints between two points
 * Uses the great circle formula to find points along the shortest path
 */
export function calculateGreatCircleWaypoints(
  start: [number, number],
  end: [number, number],
  numPoints: number = 20
): [number, number][] {
  const [lng1, lat1] = start;
  const [lng2, lat2] = end;

  // Convert to radians
  const φ1 = (lat1 * Math.PI) / 180;
  const λ1 = (lng1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const λ2 = (lng2 * Math.PI) / 180;

  const waypoints: [number, number][] = [start];

  // Calculate great circle distance
  const Δλ = λ2 - λ1;
  const a =
    Math.sin(φ1) * Math.sin(φ2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const σ = Math.acos(Math.max(-1, Math.min(1, a))); // Great circle distance in radians

  // Generate intermediate points
  for (let i = 1; i < numPoints; i++) {
    const f = i / numPoints;
    const A = Math.sin((1 - f) * σ) / Math.sin(σ);
    const B = Math.sin(f * σ) / Math.sin(σ);

    const x =
      A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y =
      A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);

    const φ = Math.atan2(z, Math.sqrt(x * x + y * y));
    const λ = Math.atan2(y, x);

    waypoints.push([(λ * 180) / Math.PI, (φ * 180) / Math.PI]);
  }

  waypoints.push(end);
  return waypoints;
}

/**
 * Check if a coordinate is likely over land
 * Uses a simplified land detection based on known land masses
 * In production, this would use a proper land/sea mask or API
 */
function isOverLand(lng: number, lat: number): boolean {
  // Major land masses to avoid (simplified bounding boxes)
  // Using tighter bounds to allow coastal navigation
  const landMasses = [
    // North America (interior, not coastal)
    { minLng: -130, maxLng: -65, minLat: 25, maxLat: 50 },
    // South America (interior)
    { minLng: -80, maxLng: -35, minLat: -35, maxLat: 12 },
    // Europe (interior, allow English Channel and North Sea)
    { minLng: -10, maxLng: 40, minLat: 40, maxLat: 60 },
    // Africa (interior)
    { minLng: -20, maxLng: 50, minLat: -35, maxLat: 35 },
    // Asia (interior)
    { minLng: 30, maxLng: 140, minLat: 5, maxLat: 50 },
    // Australia
    { minLng: 113, maxLng: 154, minLat: -44, maxLat: -10 },
    // Greenland
    { minLng: -75, maxLng: -10, minLat: 60, maxLat: 85 },
    // Iceland
    { minLng: -25, maxLng: -13, minLat: 63, maxLat: 67 },
    // UK & Ireland (interior)
    { minLng: -8, maxLng: 2, minLat: 50, maxLat: 59 },
    // Japan (interior)
    { minLng: 128, maxLng: 146, minLat: 30, maxLat: 46 },
    // Major Caribbean islands (avoid interior)
    { minLng: -85, maxLng: -60, minLat: 15, maxLat: 25 },
    // Cuba
    { minLng: -85, maxLng: -74, minLat: 19, maxLat: 23 },
    // Hispaniola
    { minLng: -75, maxLng: -68, minLat: 17, maxLat: 20 },
  ];

  // Check if point is in any land mass bounding box
  for (const land of landMasses) {
    if (
      lng >= land.minLng &&
      lng <= land.maxLng &&
      lat >= land.minLat &&
      lat <= land.maxLat
    ) {
      // For major continents, check if we're in the interior
      // Allow coastal navigation (within 50nm of coast)
      const isCoastal = 
        (land.minLng === -130 && land.maxLng === -65 && (lng < -120 || lng > -70 || lat < 30 || lat > 45)) ||
        (land.minLng === -10 && land.maxLng === 40 && (lng < 0 || lng > 25 || lat < 45 || lat > 55));
      
      if (!isCoastal) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Adjust waypoint to avoid land by moving it slightly
 */
function adjustWaypointToAvoidLand(
  lng: number,
  lat: number,
  previousPoint: [number, number]
): [number, number] {
  if (!isOverLand(lng, lat)) {
    return [lng, lat];
  }

  // Try moving perpendicular to the route
  const [prevLng, prevLat] = previousPoint;
  const bearing = Math.atan2(lng - prevLng, lat - prevLat);

  // Try multiple offsets to find a water point
  const offsets = [
    [0.5, 0],
    [-0.5, 0],
    [0, 0.5],
    [0, -0.5],
    [0.5, 0.5],
    [-0.5, -0.5],
    [1.0, 0],
    [-1.0, 0],
  ];

  for (const [dlng, dlat] of offsets) {
    const newLng = lng + dlng;
    const newLat = lat + dlat;
    if (!isOverLand(newLng, newLat)) {
      return [newLng, newLat];
    }
  }

  // If all offsets fail, return original (will be handled by smoothing)
  return [lng, lat];
}

/**
 * Generate a maritime route with great circle sailing and land avoidance
 */
export function generateMaritimeRoute(
  waypoints: [number, number][]
): [number, number][] {
  if (waypoints.length < 2) {
    return waypoints;
  }

  const route: [number, number][] = [waypoints[0]];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i + 1];

    // Calculate distance to determine number of intermediate points
    const distance = calculateDistance(start, end);
    const numPoints = Math.max(20, Math.min(50, Math.floor(distance / 50))); // More points for longer routes

    // Calculate great circle intermediate points
    const greatCirclePoints = calculateGreatCircleWaypoints(start, end, numPoints);

    // Process each point to avoid land
    let previousPoint = start;
    let lastAddedPoint = start;
    
    for (let j = 1; j < greatCirclePoints.length - 1; j++) {
      const point = greatCirclePoints[j];
      const adjustedPoint = adjustWaypointToAvoidLand(
        point[0],
        point[1],
        previousPoint
      );

      // Only add point if it's significantly different from previous
      const distanceFromLast = calculateDistance(lastAddedPoint, adjustedPoint);
      if (distanceFromLast > 20) {
        // Only add points that are at least 20nm apart (creates realistic passage plan)
        route.push(adjustedPoint);
        lastAddedPoint = adjustedPoint;
      }
      previousPoint = adjustedPoint;
    }

    // Always add the end waypoint
    route.push(end);
  }

  // Smooth the route to create realistic passage planning curves
  return smoothRoute(route);
}

/**
 * Calculate distance between two points in nautical miles
 */
function calculateDistance(
  point1: [number, number],
  point2: [number, number]
): number {
  const [lng1, lat1] = point1;
  const [lng2, lat2] = point2;

  const R = 3440; // Earth radius in nautical miles
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Smooth the route to create more realistic passage planning
 * Uses a simple moving average to reduce sharp turns
 */
function smoothRoute(route: [number, number][]): [number, number][] {
  if (route.length <= 2) {
    return route;
  }

  const smoothed: [number, number][] = [route[0]];

  for (let i = 1; i < route.length - 1; i++) {
    const prev = route[i - 1];
    const curr = route[i];
    const next = route[i + 1];

    // Weighted average to smooth the curve
    const smoothedLng = prev[0] * 0.25 + curr[0] * 0.5 + next[0] * 0.25;
    const smoothedLat = prev[1] * 0.25 + curr[1] * 0.5 + next[1] * 0.25;

    smoothed.push([smoothedLng, smoothedLat]);
  }

  smoothed.push(route[route.length - 1]);
  return smoothed;
}

/**
 * Add passage plan waypoints that follow shipping lanes
 * Adds intermediate waypoints at strategic locations
 */
export function addPassagePlanWaypoints(
  route: [number, number][]
): [number, number][] {
  const passagePlan: [number, number][] = [route[0]];

  for (let i = 0; i < route.length - 1; i++) {
    const start = route[i];
    const end = route[i + 1];

    // Calculate distance
    const distance = calculateDistance(start, end);

    // For long passages, add strategic waypoints
    if (distance > 500) {
      // Add waypoint at 1/3 and 2/3 of the distance
      const waypoints = calculateGreatCircleWaypoints(start, end, 4);
      passagePlan.push(...waypoints.slice(1, -1));
    } else {
      // For shorter passages, use the direct route
      passagePlan.push(end);
    }
  }

  return passagePlan;
}

