export interface MarkerData {
  lat: number;
  lon: number;
  label: string;
}

export const markers: MarkerData[] = [
  { lat: 40.7128, lon: -74.006, label: "New York" },
  { lat: 51.5074, lon: -0.1278, label: "London" },
  { lat: 35.6762, lon: 139.6503, label: "Tokyo" },
  { lat: -33.8688, lon: 151.2093, label: "Sydney" },
  { lat: 48.8566, lon: 2.3522, label: "Paris" },
  { lat: 55.7558, lon: 37.6173, label: "Moscow" },
  { lat: -22.9068, lon: -43.1729, label: "Rio de Janeiro" },
  { lat: 1.3521, lon: 103.8198, label: "Singapore" },
  { lat: 25.2048, lon: 55.2708, label: "Dubai" },
  { lat: 37.5665, lon: 126.978, label: "Seoul" },
];
