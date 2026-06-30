/**
 * Convert longitude and latitude to PostGIS geography format
 * @param longitude - The longitude value
 * @param latitude - The latitude value
 * @returns PostGIS POINT format string
 */
export const convertToGeography = (
  longitude: number,
  latitude: number
): string => {
  if (longitude < -180 || longitude > 180) {
    throw new Error("Longitude must be between -180 and 180");
  }
  if (latitude < -90 || latitude > 90) {
    throw new Error("Latitude must be between -90 and 90");
  }
  return `POINT(${longitude} ${latitude})`;
};

/**
 * Convert PostGIS geography to GeoJSON format
 * @param longitude - The longitude value
 * @param latitude - The latitude value
 * @returns GeoJSON Point object
 */
export const convertToGeoJSON = (longitude: number, latitude: number) => {
  return {
    type: "Point",
    coordinates: [longitude, latitude],
  };
};

/**
 * Parse geography string to coordinates
 * @param geography - PostGIS geography string (e.g., "POINT(72.8777 19.0760)")
 * @returns Object with longitude and latitude
 */
export const parseGeography = (
  geography: string
): { longitude: number; latitude: number } => {
  const match = geography.match(/POINT\(([^ ]+) ([^ ]+)\)/);
  if (!match) {
    throw new Error("Invalid geography format");
  }
  return {
    longitude: parseFloat(match[1]),
    latitude: parseFloat(match[2]),
  };
};
