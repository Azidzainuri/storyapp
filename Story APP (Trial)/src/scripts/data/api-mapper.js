import Map from '../utils/map';
 
export async function storiesMapper(stories) {
  return {
    ...stories,
    location: {
      ...stories.lat,
      ...stories.lon,
      placeName: await Map.getPlaceNameByCoordinate(stories.lat, stories.lon),
    },
  };
}