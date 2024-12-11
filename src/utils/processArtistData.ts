import { Artist, ProcessedLocation } from '@/types/artist';

// Define coordinates for major locations
const locationCoordinates: { [key: string]: { latitude: number; longitude: number } } = {
  'Nigeria': { latitude: 9.0820, longitude: 8.6753 },
  'Senegal': { latitude: 14.4974, longitude: -14.4524 },
  'Mali': { latitude: 17.5707, longitude: -3.9962 },
  'South Africa': { latitude: -30.5595, longitude: 22.9375 },
  'Ghana': { latitude: 7.9465, longitude: -1.0232 },
  'Kenya': { latitude: -0.0236, longitude: 37.9062 },
  'Tanzania': { latitude: -6.3690, longitude: 34.8888 },
  'Ethiopia': { latitude: 9.1450, longitude: 40.4897 },
  'Zimbabwe': { latitude: -19.0154, longitude: 29.1549 },
  'Angola': { latitude: -11.2027, longitude: 17.8739 },
  'Cameroon': { latitude: 7.3697, longitude: 12.3547 },
  'Benin': { latitude: 9.3077, longitude: 2.3158 },
  'Burkina Faso': { latitude: 12.2383, longitude: -1.5616 },
  'Congo': { latitude: -0.2280, longitude: 15.8277 },
  'Democratic Republic of the Congo': { latitude: -4.0383, longitude: 21.7587 },
  'Côte d\'Ivoire': { latitude: 7.5400, longitude: -5.5471 },
  'Egypt': { latitude: 26.8206, longitude: 30.8025 },
  'Morocco': { latitude: 31.7917, longitude: -7.0926 },
  'Algeria': { latitude: 28.0339, longitude: 1.6596 },
  'Tunisia': { latitude: 33.8869, longitude: 9.5375 },
  'Uganda': { latitude: 1.3733, longitude: 32.2903 },
  'Rwanda': { latitude: -1.9403, longitude: 29.8739 },
  'Mozambique': { latitude: -18.6657, longitude: 35.5296 },
  'Zambia': { latitude: -13.1339, longitude: 27.8493 },
  'Madagascar': { latitude: -18.7669, longitude: 46.8691 },
  'Sudan': { latitude: 12.8628, longitude: 30.2176 },
  'Somalia': { latitude: 5.1521, longitude: 46.1996 },
  'Guinea': { latitude: 9.9456, longitude: -9.6966 },
  'Sierra Leone': { latitude: 8.4606, longitude: -11.7799 },
  'Liberia': { latitude: 6.4281, longitude: -9.4295 },
  'Togo': { latitude: 8.6195, longitude: 0.8248 },
  'Cape Verde': { latitude: 16.5388, longitude: -23.0418 },
  'Gambia': { latitude: 13.4432, longitude: -15.3101 },
  'Mauritania': { latitude: 21.0079, longitude: -10.9408 },
  'Niger': { latitude: 17.6078, longitude: 8.0817 }
};

function normalizeLocation(location: string): string {
  // Handle common variations and clean up location strings
  const locationMap: { [key: string]: string } = {
    'Democratic Republic of Congo': 'Democratic Republic of the Congo',
    'DRC': 'Democratic Republic of the Congo',
    'DR Congo': 'Democratic Republic of the Congo',
    'Ivory Coast': 'Côte d\'Ivoire',
    'Republic of Congo': 'Congo',
    'The Gambia': 'Gambia',
    'Republic of South Africa': 'South Africa',
    'RSA': 'South Africa'
  };

  // Remove any trailing/leading whitespace and handle slashes
  const cleanLocation = location.trim().split('/')[0].trim();
  
  // Return the normalized location if it exists in the map, otherwise return the cleaned location
  return locationMap[cleanLocation] || cleanLocation;
}

export function processArtistData(artists: any[]): ProcessedLocation[] {
  const locationMap = new Map<string, ProcessedLocation>();
  let processedCount = 0;

  artists.forEach((artist) => {
    if (artist.location && artist.location !== 'UNKNOWN') {
      const normalizedLocation = normalizeLocation(artist.location);
      
      if (locationCoordinates[normalizedLocation]) {
        const locationKey = normalizedLocation;
        processedCount++;
        
        if (!locationMap.has(locationKey)) {
          locationMap.set(locationKey, {
            name: locationKey,
            coordinates: locationCoordinates[locationKey],
            artists: []
          });
        }

        locationMap.get(locationKey)?.artists.push({
          name: artist.name,
          id: artist.name.toLowerCase().replace(/\s+/g, '-')
        });
      } else {
        console.log(`No coordinates found for location: ${normalizedLocation} (original: ${artist.location})`);
      }
    }
  });

  const processedLocations = Array.from(locationMap.values());
  console.log(`Processed ${processedCount} artists with valid locations`);
  console.log(`Created ${processedLocations.length} unique location entries`);
  
  return processedLocations;
}
