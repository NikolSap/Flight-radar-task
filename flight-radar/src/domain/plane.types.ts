export interface GeoLocation {
  lat: number;
  lon: number;
}

export interface Plane {
  id: number;
  name: string;
  country: string;
  geoLocation: GeoLocation;
}
