export interface VisitorGeo {
  lat: number;
  lon: number;
  city: string;
  country: string;
}

export interface VisitorLocation extends VisitorGeo {
  count: number;
}
