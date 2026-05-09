import type { Plane } from "../domain/plane.types";

export const mockPlanes: Plane[] = [
  {
    id: 1,
    name: "Falcon 101",
    country: "Israel",
    geoLocation: {
      lat: 32.0853,
      lon: 34.7818,
    },
  },
  {
    id: 2,
    name: "Eagle 22",
    country: "Iran",
    geoLocation: {
      lat: 34.2,
      lon: 39.8,
    },
  },
  {
    id: 3,
    name: "SkyJet 7",
    country: "France",
    geoLocation: {
      lat: 30.9,
      lon: 37.4,
    },
  },
  {
    id: 4,
    name: "Cedar 44",
    country: "Lebanon",
    geoLocation: {
      lat: 35.2,
      lon: 35.7,
    },
  },
  {
    id: 5,
    name: "Desert Hawk",
    country: "Syria",
    geoLocation: {
      lat: 31.4,
      lon: 41.2,
    },
  },
];