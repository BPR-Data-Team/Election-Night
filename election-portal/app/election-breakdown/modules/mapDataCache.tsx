let stateGeoJSONCache: Map<string, any> = new Map();

// Fetch a single state's GeoJSON data and store it in the cache
export const fetchStateGeoJSON = async (stateName: string, year: string) => {
    if (!stateGeoJSONCache.has(stateName)) { 
      const stripped_year =  year.trim();
      console.log(`/GeoJSON/County/${stripped_year}/${stateName}_${stripped_year}.geojson`);
      const response = await fetch(`/GeoJSON/County/${stripped_year}/${stateName}_${stripped_year}.geojson`);
      const geoJSON = await response.json();
      stateGeoJSONCache.set(stateName, geoJSON); 
    }
    console.log(stateGeoJSONCache);
    return stateGeoJSONCache.get(stateName); 
  };
  
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