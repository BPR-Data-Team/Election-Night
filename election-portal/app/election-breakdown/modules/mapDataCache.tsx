import React, { useRef } from 'react';

let stateGeoJSONCache: Map<string, any> = new Map();
let cityGeoJSONCache: Map<string, any> = new Map();
// TODO: set to empty string in both cases when switching domains
const prodSlug =
  process.env.NODE_ENV === 'development' ? '' : '/Election-Night';

const GeoJsonCache = () => {
  // Fetch a single state's GeoJSON data and store it in the cache
  const fetchStateGeoJSON = async (stateName: string, year: string) => {
    let stripped_year = year.trim();
    // we don't have geoJSONS for 2012
    if (stripped_year === '2012') {
      stripped_year = '2022';
    }
    const nameYearKey = stateName + '_' + stripped_year;
    if (!stateGeoJSONCache.has(nameYearKey)) {
      console.log(
        `${prodSlug}/GeoJSON/County/${stripped_year}/${stateName}_${stripped_year}.geojson`
      );
      const response = await fetch(
        `${prodSlug}/GeoJSON/County/${stripped_year}/${stateName}_${stripped_year}.geojson`
      );
      const geoJSON = await response.json();
      stateGeoJSONCache.set(nameYearKey, geoJSON);
    }
    console.log(stateGeoJSONCache);
    return stateGeoJSONCache.get(nameYearKey);
  };

  const fetchCityGeoJSON = async (stateName: string) => {
    if (!cityGeoJSONCache.has(stateName)) {
      console.log(`${prodSlug}/GeoJSON/City/${stateName}.json`);
      const response = await fetch(
        `${prodSlug}/GeoJSON/City/${stateName}.json`
      );
      const geoJSON = await response.json();
      cityGeoJSONCache.set(stateName, geoJSON);
    }
    console.log(cityGeoJSONCache);
    return cityGeoJSONCache.get(stateName);
  };

  return { fetchStateGeoJSON, fetchCityGeoJSON };
};

export default GeoJsonCache;

// Preload all state-level GeoJSON data and store it in the map (like the national map data one)
// export const preloadAllStateGeoJSON = async () => {

//     // I made ChatGPT make this list, hopefully it's correct
//     const stateNames: string[] = [
//     "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida",
//     "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine",
//     "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska",
//     "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
//     "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
//     "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
//     "District of Columbia"
//     ];

//     if (stateGeoJSONCache.size === 0) {
//         const stateGeoJSONPromises = stateNames.map(async (stateName) => {
//         return await fetchStateGeoJSON(stateName);
//         });

//         await Promise.all(stateGeoJSONPromises);
//         console.log("All state GeoJSON files have been preloaded");
//     }
// };
