import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RaceType } from '@/types/RaceType';
import { Year } from '@/types/Year';
import Highcharts, { color } from 'highcharts';
import HighchartsMap from 'highcharts/modules/map';
import highchartsAccessibility from 'highcharts/modules/accessibility';
import './rtcmap.css';
import Circle from './ElectoralVoteButton';
import StatusBar from './StatusBar';
import electoralVotesPerState from './utils/electoralVotesPerState';
import { parse } from 'papaparse';
import { RTCPresData } from '@/types/data';

const prodSlug =
  process.env.NODE_ENV === 'development' ? '' : '/Election-Night';

const colorMapping = { 0: 'N', 1: 'D', 2: 'R' };

if (typeof window !== 'undefined') {
  highchartsAccessibility(Highcharts);
}
if (typeof Highcharts === 'object') {
  HighchartsMap(Highcharts);
}

interface RTCMapProps {
  raceType: RaceType;
  year: Year;
}
//mock data
const presData = [
  { 'hc-key': 'us-al', Called: 'R', electoral_votes: 9 },
  { 'hc-key': 'us-ak', Called: 'D', electoral_votes: 3 },
  { 'hc-key': 'us-az', Called: 'D', electoral_votes: 11 },
  { 'hc-key': 'us-ar', Called: 'D', electoral_votes: 6 },
  { 'hc-key': 'us-ca', Called: 'D', electoral_votes: 55 },
  { 'hc-key': 'us-co', Called: 'R', electoral_votes: 9 },
  { 'hc-key': 'us-ct', Called: 'R', electoral_votes: 7 },
  { 'hc-key': 'us-de', Called: 'D', electoral_votes: 3 },
  { 'hc-key': 'us-dc', Called: 'R', electoral_votes: 3 },
  { 'hc-key': 'us-fl', Called: 'R', electoral_votes: 29 },
  { 'hc-key': 'us-ga', Called: 'D', electoral_votes: 16 },
  { 'hc-key': 'us-hi', Called: 'D', electoral_votes: 4 },
  { 'hc-key': 'us-id', Called: 'R', electoral_votes: 4 },
  { 'hc-key': 'us-il', Called: 'R', electoral_votes: 20 },
  { 'hc-key': 'us-in', Called: 'R', electoral_votes: 11 },
  { 'hc-key': 'us-ia', Called: 'D', electoral_votes: 6 },
  { 'hc-key': 'us-ks', Called: 'D', electoral_votes: 6 },
  { 'hc-key': 'us-ky', Called: 'R', electoral_votes: 8 },
  { 'hc-key': 'us-la', Called: 'R', electoral_votes: 8 },
  { 'hc-key': 'us-me', Called: 'D', electoral_votes: 4 },
  { 'hc-key': 'us-md', Called: 'R', electoral_votes: 10 },
  { 'hc-key': 'us-ma', Called: 'D', electoral_votes: 11 },
  { 'hc-key': 'us-mi', Called: 'R', electoral_votes: 16 },
  { 'hc-key': 'us-mn', Called: 'R', electoral_votes: 10 },
  { 'hc-key': 'us-ms', Called: 'D', electoral_votes: 6 },
  { 'hc-key': 'us-mo', Called: 'R', electoral_votes: 10 },
  { 'hc-key': 'us-mt', Called: 'D', electoral_votes: 3 },
  { 'hc-key': 'us-ne', Called: 'R', electoral_votes: 5 },
  { 'hc-key': 'us-nv', Called: 'D', electoral_votes: 6 },
  { 'hc-key': 'us-nh', Called: 'R', electoral_votes: 4 },
  { 'hc-key': 'us-nj', Called: 'D', electoral_votes: 14 },
  { 'hc-key': 'us-nm', Called: 'R', electoral_votes: 5 },
  { 'hc-key': 'us-ny', Called: 'D', electoral_votes: 29 },
  { 'hc-key': 'us-nc', Called: 'R', electoral_votes: 15 },
  { 'hc-key': 'us-nd', Called: 'R', electoral_votes: 3 },
  { 'hc-key': 'us-oh', Called: 'D', electoral_votes: 18 },
  { 'hc-key': 'us-ok', Called: 'D', electoral_votes: 7 },
  { 'hc-key': 'us-or', Called: 'N', electoral_votes: 7 },
  { 'hc-key': 'us-pa', Called: 'N', electoral_votes: 20 },
  { 'hc-key': 'us-ri', Called: 'R', electoral_votes: 4 },
  { 'hc-key': 'us-sc', Called: 'D', electoral_votes: 9 },
  { 'hc-key': 'us-sd', Called: 'R', electoral_votes: 3 },
  { 'hc-key': 'us-tn', Called: 'D', electoral_votes: 11 },
  { 'hc-key': 'us-tx', Called: 'D', electoral_votes: 38 },
  { 'hc-key': 'us-ut', Called: 'R', electoral_votes: 6 },
  { 'hc-key': 'us-vt', Called: 'R', electoral_votes: 3 },
  { 'hc-key': 'us-va', Called: 'D', electoral_votes: 13 },
  { 'hc-key': 'us-wa', Called: 'N', electoral_votes: 12 },
  { 'hc-key': 'us-wv', Called: 'N', electoral_votes: 5 },
  { 'hc-key': 'us-wi', Called: 'N', electoral_votes: 10 },
  { 'hc-key': 'us-wy', Called: 'N', electoral_votes: 3 },
];
//mock data
const mockData = presData.map((item) => ({
  ...item,
  Called: 'N',
  district: 0,
}));

const RTCMap: React.FC<RTCMapProps> = ({ raceType, year }) => {
  const chartRef = useRef<Highcharts.Chart | null>(null);
  const originalMap = useRef<{
    mapData: any[];
    circleValues: any[];
    collective: any[];
  }>({ mapData: [], circleValues: [], collective: [] });
  const originalElectoralCounts = useRef<any[]>([]);
  const [mapData, setMapData] = useState(mockData); // Default to presData
  const [circleValues, setCircleValues] = useState({
    NE1: 0,
    NE2: 0,
    NE3: 0,
    ME1: 0,
    ME2: 0,
  });
  const [leftCount, setLeftCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);
  const [sixteenPresData, setSixteenPresData] = useState<RTCPresData[] | null>(
    null
  );
  const [twentyPresData, setTwentyPresData] = useState<RTCPresData[] | null>(
    null
  );
  const [twentyFourPresData, setTwentyFourPresData] = useState<
    RTCPresData[] | null
  >(null);

  const fetchMapDataAndInitializeMap = async () => {
    const geoResponse = await fetch(
      'https://code.highcharts.com/mapdata/countries/us/us-all.geo.json'
    );
    const geoJson = await geoResponse.json();
    initializeMap(geoJson);
  };

  /**
   * Placeholder intended to handle live websocket data. Feel free to completely delete if necessary.
   *
  const handleWebSocketData = (newData: any[]) => {
    const formattedData = newData.map((item) => ({
      'hc-key': item['hc-key'],
      Called:
        item.party_winner === 'D' ? 'D' : item.party_winner === 'R' ? 'R' : 'N',
      electoral_votes: item.electoral_votes,
      district: item.district,
    }));

    formattedData.forEach((item) => {
      const point = chartRef.current?.series[0].data.find(
        (p) => (p as any)['hc-key'] === item['hc-key']
      );
      point?.update({
        value: item.Called === 'D' ? 1 : item.Called === 'R' ? 2 : 0,
      });
    });

    setMapData(formattedData);
    initializeElectoralVotes(formattedData);
  };*/

  useEffect(() => {
    const fetchData = async (
      year: Year,
      setData: React.Dispatch<React.SetStateAction<RTCPresData[] | null>>,
      storageKey: string,
      csvPath: string
    ) => {
      const storedData = sessionStorage.getItem(storageKey);
      if (storedData) {
        setData(JSON.parse(storedData) as RTCPresData[]);
      } else {
        try {
          const response = await fetch(csvPath);
          const csvText = await response.text();
          parse(csvText, {
            header: true,
            complete: (results) => {
              const parsedData: RTCPresData[] = results.data.map(
                (row: any) => ({
                  year: parseInt(row.year),
                  state: row.state,
                  office_type: row.office_type,
                  party_winner: row.party_winner,
                  electoral_votes: parseInt(row.electoral_votes),
                  district: row.district,
                })
              );
              setData(parsedData);
              sessionStorage.setItem(storageKey, JSON.stringify(parsedData));
            },
          });
        } catch (error) {
          console.error(`Error loading ${year} data:`, error);
        }
      }
    };

    fetchData(
      Year.Sixteen,
      setSixteenPresData,
      'sixteenPresData',
      `${prodSlug}/R2C/2016Presidential.csv`
    );
    fetchData(
      Year.Twenty,
      setTwentyPresData,
      'twentyPresData',
      `${prodSlug}/R2C/2020Presidential.csv`
    );
  }, []);

  const initializeCircleValues = useCallback((data: RTCPresData[] = []) => {
    const initialCircleValues = { NE1: 0, NE2: 0, NE3: 0, ME1: 0, ME2: 0 };

    data.forEach((item) => {
      if ((item.state === 'NE' || item.state === 'ME') && item.district > 0) {
        const districtKey =
          `${item.state}${item.district}` as keyof typeof initialCircleValues;
        initialCircleValues[districtKey] =
          item.party_winner === 'D' ? 1 : item.party_winner === 'R' ? 2 : 0;
      }
    });

    setCircleValues(initialCircleValues);
  }, []);

  useEffect(() => {
    if (year === Year.Sixteen && sixteenPresData) {
      initializeCircleValues(sixteenPresData);
    } else if (year === Year.Twenty && twentyPresData) {
      initializeCircleValues(twentyPresData);
    } else {
      initializeCircleValues([]); // Placeholder for future data
    }
  }, [year, sixteenPresData, twentyPresData, initializeCircleValues]);

  useEffect(() => {
    if (
      (year === Year.Sixteen && sixteenPresData) ||
      (year === Year.Twenty && twentyPresData)
    ) {
      fetchMapDataAndInitializeMap();
    }
  }, [raceType, year, sixteenPresData, twentyPresData]);

  /**
   * Formats presidential data for use in a map.
   */
  const formatPresData = (data: RTCPresData[] | null) => {
    return data?.map((item) => ({
      'hc-key': 'us-' + item.state.toLowerCase(),
      Called:
        item.party_winner === 'D' ? 'D' : item.party_winner === 'R' ? 'R' : 'N',
      electoral_votes: item.electoral_votes,
      district: item.district,
    }));
  };

  /**
   * Formats data based on the race type and year provided.
   */
  const getFormattedData = (raceType: RaceType, year: Year) => {
    if (raceType === RaceType.Presidential) {
      switch (year) {
        case Year.Sixteen:
          return formatPresData(sixteenPresData);
        case Year.Twenty:
          return formatPresData(twentyPresData);
        default:
          return mockData;
      }
    } else {
      return mockData;
    }
  };

  const initializeMap = (geoJson: any) => {
    //TODO: Change mockData
    const formattedData = getFormattedData(raceType, year);
    const currentData = formattedData ? [...formattedData] : [...mockData];
    originalMap.current = {
      mapData: currentData
        .filter((item) => item.district == 0)
        .map((item) => ({ ...item })),
      circleValues: currentData
        .filter((item) => item.district != 0)
        .map((item) => ({ ...item })),
      collective: currentData.map((item) => ({ ...item })),
    }; // Store original state

    const processedData = currentData
      .filter((item) => item.district == 0)
      .map((item) => ({
        'hc-key': item['hc-key'],
        value: item.Called === 'D' ? 1 : item.Called === 'R' ? 2 : 0,
        electoral_votes: item.electoral_votes,
      }));

    const handleStateClick = function (this: any) {
      const point = this;
      const newValue = (point.value + 1) % 3; // Cycle between 0 (N), 1 (D), and 2 (R)
      point.update({ value: newValue });
      updateMapData(point['hc-key'], newValue, point.value);
    };

    const mapOptions: Highcharts.Options = {
      chart: { type: 'map', map: geoJson, backgroundColor: 'transparent' },
      title: { text: '' },
      credits: { enabled: false },
      plotOptions: {
        map: {
          cursor: 'pointer',
          point: {
            events: { click: handleStateClick },
          },
        },
      },
      legend: { enabled: false },
      tooltip: {
        formatter: function (this: any) {
          return '<b>' + this.point.name;
        },
        style: {
          fontFamily: 'gelica, book antiqua, georgia, times new roman, serif',
        },
      },
      colorAxis: {
        dataClasses: [
          { from: 0, to: 0, color: '#EAEAEA', name: 'Uncalled' },
          { from: 1, to: 1, color: '#595D9A', name: 'Democrat' },
          { from: 2, to: 2, color: '#B83C2B', name: 'Republican' },
        ],
      },
      series: [
        {
          type: 'map',
          data: processedData,
          mapData: geoJson,
          joinBy: 'hc-key',
          nullColor: '#EAEAEA',
          borderColor: 'black',
          borderWidth: 1,
          states: {
            hover: {
              borderColor: 'grey',
            },
          },
        },
      ],
    };
    const chart = Highcharts.mapChart('rtc-container', mapOptions);

    chartRef.current = chart;
    initializeElectoralVotes(currentData);
  };

  /**
   * Updates the map data and electoral counts based on the provided key and value.
   *
   * Update the map data with new values and adjust the electoral counts accordingly.
   * It maps through the current map data, finds the item with the matching key, and updates its 'Called' property.
   * Additionally, it updates the electoral counts using the provided key, value, oldValue, and the corresponding electoral votes.
   */
  const updateMapData = (key: string, value: number, oldValue: number) => {
    setMapData((prev) =>
      prev.map((item) =>
        item['hc-key'] === key
          ? { ...item, Called: (colorMapping as any)[value] }
          : item
      )
    );
    // Might need to change this to electoralVotes as an argument
    const electoral_votes = electoralVotesPerState[key];
    updateElectoralCounts(key, value, oldValue, electoral_votes);
  };

  /**
   * Updates the electoral counts based on the provided key and value.
   *
   * called when a state is clicked on the map.
   */
  const updateElectoralCounts = (
    key: string,
    value: number,
    oldValue: number,
    electoral_votes: number
  ) => {
    if (value === 1) {
      setLeftCount((prev) => prev + electoral_votes);
    } else if (value === 2) {
      setRightCount((prev) => prev + electoral_votes);
      setLeftCount((prev) => prev - electoral_votes);
    } else {
      setRightCount((prev) => prev - electoral_votes);
    }
  };

  /**
   * Initializes the electoral votes count for left and right parties.
   * Iterates through the provided data array and sums up the electoral votes
   * based on the 'Called' property ('D' for left and 'R' for right).
   * Updates the state with the total counts for both parties.
   *
   * Called on first render and when the map is reset.
   */
  const initializeElectoralVotes = (data: any[]) => {
    let leftVotes = 0;
    let rightVotes = 0;
    data.forEach((item) => {
      if (item.Called === 'D') {
        leftVotes += item.electoral_votes;
      } else if (item.Called === 'R') {
        rightVotes += item.electoral_votes;
      }
    });
    setLeftCount(leftVotes);
    setRightCount(rightVotes);
  };

  /**
   * Retrieves the value for a circle based on the state and district from the provided data.
   * Helper for `handleReset`.
   */
  const getCircleValue = (state: string, district: number, data: any[]) => {
    const item = data.find(
      (item) =>
        item['hc-key'] === state && item.district === district.toString()
    );
    if (!item) return 0;
    return item.Called === 'D' ? 1 : item.Called === 'R' ? 2 : 0;
  };

  /**
   * Resets the chart to its original state using the data stored in `originalMap`.
   * It updates the series data and circle values, and reinitializes the electoral votes.
   */
  const handleReset = () => {
    if (chartRef.current) {
      const originalData = originalMap.current;
      if (originalData) {
        const data = originalData.mapData;
        const original = data.map((item) => ({
          id: item['hc-key'],
          'hc-key': item['hc-key'],
          value: item.Called === 'D' ? 1 : item.Called === 'R' ? 2 : 0,
        }));

        // Reset the series data
        chartRef.current.series[0].setData(original);
        const circleValues = {
          NE1: getCircleValue('us-ne', 1, originalData.circleValues),
          NE2: getCircleValue('us-ne', 2, originalData.circleValues),
          NE3: getCircleValue('us-ne', 3, originalData.circleValues),
          ME1: getCircleValue('us-me', 1, originalData.circleValues),
          ME2: getCircleValue('us-me', 2, originalData.circleValues),
        };
        setCircleValues(circleValues);
        initializeElectoralVotes(originalData.collective);
      }
    }
  };

  const incrementLeftCount = () => setLeftCount((prev) => prev + 1);
  const incrementRightCount = () => setRightCount((prev) => prev + 1);
  const decrementLeftCount = () => setLeftCount((prev) => prev - 1);
  const decrementRightCount = () => setRightCount((prev) => prev - 1);

  return (
    <div className="map-container">
      <StatusBar leftCount={leftCount} rightCount={rightCount} />
      <div className="map-and-controls">
        <div id="rtc-container" className="map" />
        <div className="controls">
          <div className="circles">
            <Circle
              text="NE1"
              circleValue={circleValues.NE1}
              setCircleValue={(value) =>
                setCircleValues((prev) => ({
                  ...prev,
                  NE1: typeof value === 'function' ? value(prev.NE1) : value,
                }))
              }
              incrementLeftCount={() => setLeftCount((prev) => prev + 1)}
              incrementRightCount={() => setRightCount((prev) => prev + 1)}
              decrementLeftCount={() => setLeftCount((prev) => prev - 1)}
              decrementRightCount={() => setRightCount((prev) => prev - 1)}
            />
            <Circle
              text="NE2"
              circleValue={circleValues.NE2}
              setCircleValue={(value) =>
                setCircleValues((prev) => ({
                  ...prev,
                  NE2: typeof value === 'function' ? value(prev.NE2) : value,
                }))
              }
              incrementLeftCount={incrementLeftCount}
              incrementRightCount={incrementRightCount}
              decrementLeftCount={decrementLeftCount}
              decrementRightCount={decrementRightCount}
            />
            <Circle
              text="NE3"
              circleValue={circleValues.NE3}
              setCircleValue={(value) =>
                setCircleValues((prev) => ({
                  ...prev,
                  NE3: typeof value === 'function' ? value(prev.NE3) : value,
                }))
              }
              incrementLeftCount={incrementLeftCount}
              incrementRightCount={incrementRightCount}
              decrementLeftCount={decrementLeftCount}
              decrementRightCount={decrementRightCount}
            />
            <Circle
              text="ME1"
              circleValue={circleValues.ME1}
              setCircleValue={(value) =>
                setCircleValues((prev) => ({
                  ...prev,
                  ME1: typeof value === 'function' ? value(prev.ME1) : value,
                }))
              }
              incrementLeftCount={incrementLeftCount}
              incrementRightCount={incrementRightCount}
              decrementLeftCount={decrementLeftCount}
              decrementRightCount={decrementRightCount}
            />
            <Circle
              text="ME2"
              circleValue={circleValues.ME2}
              setCircleValue={(value) =>
                setCircleValues((prev) => ({
                  ...prev,
                  ME2: typeof value === 'function' ? value(prev.ME2) : value,
                }))
              }
              incrementLeftCount={incrementLeftCount}
              incrementRightCount={incrementRightCount}
              decrementLeftCount={decrementLeftCount}
              decrementRightCount={decrementRightCount}
            />
          </div>
          <button className="reset-button" onClick={handleReset}>
            Reset Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default RTCMap;
