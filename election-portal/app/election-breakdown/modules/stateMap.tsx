import React, { useEffect, useState, useRef } from 'react';
import { getDataVersion, RaceType } from '@/types/RaceType';
import { Year } from '@/types/Year';
import Highcharts from 'highcharts';
import HighchartsMap from 'highcharts/modules/map';
import highchartsAccessibility from 'highcharts/modules/accessibility';

import GeoJsonCache from './mapDataCache';
import { getStateAbbreviation } from '../../../types/State';

import { useSharedState } from '../../sharedContext';
import './stateMap.css';
import { HistoricalCountyData } from '@/types/data';

// const countyData = [
//   { district: '01', value: 12.1},
//   { district: '02', value: -3.2},
//   { district: '03', value: 4.3},
//   { district: '04', value: 5.4},
//   { district: '05', value: 6.5},
//   { district: '06', value: -7.6},
//   { district: '07', value: 8.7},
//   { district: '0', value: 9.8},
// ];

if (typeof window !== `undefined`) {
  highchartsAccessibility(Highcharts);
}

if (typeof Highcharts === 'object') {
  HighchartsMap(Highcharts);
}

interface ElectionBreakdownProps {
  raceType: RaceType;
  year: Year;
  stateName: string;
  countyData: any;
  setCountyName: any;
}

interface ElectionData {
  NAME: string;
  value: number;
}

const colorAxisStops: [number, string][] = [
  [0, '#B83C2B'], // Republican red
  [0.25, '#B83C2B'],
  [0.5, '#EAEAEA'],
  [0.75, '#595D9A'],
  [1, '#595D9A'], // Democrat blue
];

const StateMap: React.FC<ElectionBreakdownProps> = ({
  raceType,
  year,
  stateName,
  countyData,
  setCountyName,
}) => {
  const { fetchStateGeoJSON, fetchCityGeoJSON } = GeoJsonCache();
  const sharedState = useSharedState().state;

  const [wasPanned, setWasPanned] = useState(false);

  const [stateChart, setStateChart] = useState<any>(null);
  const [selectedCounty, setSelectedCounty] = useState('');
  const [electionData, setElectionData] = useState<ElectionData[]>([]);

  const [mapData, setMapData] = useState<any>(null);
  const [cityData, setCityData] = useState<any>(null);

  const [zoomScale, setZoomScale] = useState<number | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number | null>(null);
  const [centerPosition, setCenterPosition] = useState<[number, number] | null>(
    null
  );

  const startPos = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = (event: MouseEvent) => {
    startPos.current = { x: event.clientX, y: event.clientY };
  };

  const handleMouseUp = (event: MouseEvent) => {
    if (startPos.current) {
      const deltaX = Math.abs(event.clientX - startPos.current.x);
      const deltaY = Math.abs(event.clientY - startPos.current.y);
      if (deltaX > 10 || deltaY > 10) {
        setWasPanned(true);
      } else {
        setWasPanned(false);
      }
      startPos.current = null;
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    retrieveMapData();
    // sharedState.setLevel('state'); //breaks EBMap
    // setSelectedCounty('');
    // setCountyName('');
  }, [
    sharedState.breakdown,
    sharedState.year,
    sharedState.view,
    countyData,
    year,
    raceType,
    sharedState.electionData,
    sharedState.countyData,
    stateName,
  ]);
  
  useEffect(() => {
    if (stateChart) {
      stateChart.update({
        chart: {
          events: {
            click: function (event: any) {
              if (!event.point) {
                handleOOBClick(stateChart, zoomScale);
              }
            },
          },
        },
      });
    }
  }, [sharedState.level]);

  // GPT code
  function normalizeString(input: string): string {
    return input
        .normalize("NFD") // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritical marks
        .replace(/ä/g, "a") // Replace umlauts with alphanumeric equivalents
        .replace(/ö/g, "o")
        .replace(/ü/g, "u")
  }

  const retrieveMapData = async () => {
    if (stateName == 'National') {
      return;
    }
    // const countyOrDistrict = raceType === RaceType.Presidential ? 'County' : 'Congressional District';
    const newMapData = await fetchStateGeoJSON(
      stateName,
      String(year),
      'County'
    );
    const newCityData = await fetchCityGeoJSON(stateName);
    if (mapData === null || cityData === null) {
      console.log('Setting map data');
      setMapData(newMapData);
      setCityData(newCityData);
      initializeMap(newMapData, newCityData);
    } else {
      console.log('Updating map data');
      console.log('New map data:', newMapData);
      console.log('New city data:', newCityData);
      console.log('New Map Data does not equal old map data:', newMapData !== mapData);
      setMapData(newMapData);
      setCityData(newCityData);

      let fetchedData: ElectionData[] = [];
    countyData?.forEach(
      (datum: {
        state: string;
        office_type: string;
        county: any;
        margin_pct_1: any;
        margin_pct_2: any;
      }) => {
        if (
          datum.state === getStateAbbreviation(sharedState.view) &&
          datum.office_type === getDataVersion(sharedState.breakdown)
        ) {
          switch (sharedState.breakdown) {
            case RaceType.Senate:
              switch (sharedState.year) {
                case Year.Eighteen:
                  fetchedData.push({
                    NAME: datum.county,
                    value: (datum.margin_pct_1),
                  });
                  break;
                case Year.Twelve:
                  fetchedData.push({
                    NAME: datum.county,
                    value: (datum.margin_pct_2),
                  });
                  break;
              }
            case RaceType.Gubernatorial:
              switch (sharedState.year) {
                case Year.Twenty:
                  fetchedData.push({
                    NAME: datum.county,
                    value: (datum.margin_pct_1),
                  });
                  break;
                case Year.Sixteen:
                  fetchedData.push({
                    NAME: datum.county,
                    value: (datum.margin_pct_2),
                  });
                  break;
              }
            case RaceType.Presidential:
              switch (sharedState.year) {
                case Year.Twenty:
                  fetchedData.push({
                    NAME: datum.county,
                    value: (datum.margin_pct_1),
                  });
                  break;
                case Year.Sixteen:
                  fetchedData.push({
                    NAME: datum.county,
                    value: (datum.margin_pct_2),
                  });
                  break;
              }
          }
        }
      }
    );

    if (sharedState.year === Year.TwentyFour) {
      sharedState.countyData?.forEach((datum) => {
        if (
          datum.state === getStateAbbreviation(sharedState.view) &&
          datum.office_type === getDataVersion(sharedState.breakdown) &&
          (datum.pct_reporting != 0 || datum.dem_votes != 0 || datum.rep_votes != 0)
        ) {
          console.log(datum);
          console.log("pct reporting:", datum.pct_reporting);
          fetchedData.push({
          NAME: normalizeString(datum.county),
          value: (datum.margin_pct),
          });
        }
      });
    }
    console.log("Fetched data:", fetchedData);

      if (stateChart) {
        stateChart.update({
          series: [
            {
              type: 'map',
              map: newMapData,
              data: fetchedData.map((datum) => ({
                ...datum,
                borderColor:
                  datum.NAME === selectedCounty && sharedState.level === 'county'
                    ? 'lightgreen'
                    : '#000000',
                borderWidth:
                  datum.NAME === selectedCounty && sharedState.level === 'county'
                    ? 6
                    : 1,
              })),
            },
            {
              type: 'mappoint',
              map: newCityData,
            },
          ],
        });
      }

      setElectionData(fetchedData);
    }
  };

  useEffect(() => {
    if (stateChart) {

      stateChart.update({
        chart: {
          animation: {
            duration: 50,
          },
          events: {
            click: function (event: any) {
              if (!event.point) {
                handleOOBClick(stateChart, zoomScale);
              }
            },
          },
        },
        series: [
          {
            events: {
              click: function (event: any) {
                // const countyName = raceType == RaceType.Presidential ? event.point["name"] : event.point.properties.NAMELSAD;
                // const fipsOrDistrict = raceType == RaceType.Presidential ? event.point.fips : event.point.district;
                handleCountyClick(event.point['name'], event.point['name']);
              },
            },
          },
        ],
      });
    }
  }, [sharedState.view, wasPanned, stateChart]);

  function getMaxState(stateData: ElectionData[]): number {
    return Math.max(...stateData.map((state) => state.value));
  }

  function getMinState(stateData: ElectionData[]): number {
    return Math.min(...stateData.map((state) => state.value));
  }

  const setMenubar = () => {
    const options: RaceType[] = [RaceType.Presidential];
    if (
      countyData.some(
        (datum: { state: string; office_type: string }) =>
          datum.state === getStateAbbreviation(sharedState.view) &&
          datum.office_type === 'Governor'
      )
    ) {
      options.push(RaceType.Gubernatorial);
    } else if (
      countyData.some(
        (datum: { state: string; office_type: string }) =>
          datum.state === getStateAbbreviation(sharedState.view) &&
          datum.office_type === 'Senate'
      )
    ) {
      options.push(RaceType.Senate);
    }
    sharedState.setAvailableBreakdowns(options);
  };

  const handleOOBClick = (chart: any, zoomScale: any) => {
    if (wasPanned) {
      return;
    }
    sharedState.exitLevel();
    setSelectedCounty('');
    setCountyName('');
    // if (chart) {
    //   // chart.mapZoom();
    //   // setTimeout(() => chart.mapZoom(zoomScale), 50);
    //   chart.mapZoom();
    //   chart.mapZoom(zoomScale);
    // }
  };

  const handleCountyClick = (countyKey: string, countyName: string) => {
    console.log('wasPanned', wasPanned);
    if (!wasPanned) {
      // setSelectedCounty(countyKey); // Update selected county key for border
      setSelectedCounty(countyName);

      sharedState.setLevel('county');
      setCountyName(countyName);
    }
  };

  useEffect(() => {
    if (stateChart && countyData) {
      stateChart.update({
        series: [
          {
            type: 'map',
            data: electionData.map((datum) => ({
              ...datum,
              borderColor:
                datum.NAME === selectedCounty && sharedState.level === 'county'
                  ? 'lightgreen'
                  : '#000000',
              borderWidth:
                datum.NAME === selectedCounty && sharedState.level === 'county'
                  ? 6
                  : 1,
            })),
          },
        ],
      });
    }
  }, [selectedCounty, stateChart, sharedState.level]);

  // useEffect(() => {
  //   if (stateChart && raceType === RaceType.Presidential) {
  //     stateChart.update({
  //       series: [
  //         {
  //           type: 'map',
  //           data: presData.map((county) => ({
  //             ...county,
  //             borderColor:
  //               ((county.fips === selectedCounty) && (sharedState.level === "county"))  ? 'lightgreen' : '#000000',
  //             borderWidth:
  //               ((county.fips === selectedCounty) && (sharedState.level === "county")) ? 6 : 1,
  //           })),
  //         },

  //       ],
  //     });
  //   } else if (stateChart && raceType != RaceType.Presidential) {
  //     stateChart.update({
  //       series: [
  //         {
  //           type: 'map',
  //           data: countyData.map((district) => ({
  //             ...district,
  //             borderColor:
  //               ((district.district === selectedCounty) && (sharedState.level === "county"))  ? 'lightgreen' : '#000000',
  //             borderWidth:
  //               ((district.district === selectedCounty) && (sharedState.level === "county")) ? 6 : 1,
  //           })),
  //         },

  //       ],
  //     });
  //   }
  // }, [selectedCounty, stateChart, sharedState.level]);

  const initializeMap = (mapData: any, cityData: any) => {
    let fetchedData: ElectionData[] = [];
    countyData?.forEach(
      (datum: {
        state: string;
        office_type: string;
        county: any;
        margin_pct_1: any;
        margin_pct_2: any;
      }) => {
        if (
          datum.state === getStateAbbreviation(sharedState.view) &&
          datum.office_type === getDataVersion(sharedState.breakdown)
        ) {
          switch (sharedState.breakdown) {
            case RaceType.Senate:
              switch (sharedState.year) {
                case Year.Eighteen:
                  fetchedData.push({
                    NAME: datum.county,
                    value: (datum.margin_pct_1),
                  });
                  break;
                case Year.Twelve:
                  fetchedData.push({
                    NAME: datum.county,
                    value: (datum.margin_pct_2),
                  });
                  break;
              }
            case RaceType.Gubernatorial:
              switch (sharedState.year) {
                case Year.Twenty:
                  fetchedData.push({
                    NAME: datum.county,
                    value: (datum.margin_pct_1),
                  });
                  break;
                case Year.Sixteen:
                  fetchedData.push({
                    NAME: datum.county,
                    value: (datum.margin_pct_2),
                  });
                  break;
              }
            case RaceType.Presidential:
              switch (sharedState.year) {
                case Year.Twenty:
                  fetchedData.push({
                    NAME: datum.county,
                    value: (datum.margin_pct_1),
                  });
                  break;
                case Year.Sixteen:
                  fetchedData.push({
                    NAME: datum.county,
                    value: (datum.margin_pct_2),
                  });
                  break;
              }
          }
        }
      }
    );

    if (sharedState.year === Year.TwentyFour) {
      console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\nSHARED STATE COUNTY DATA:");
      console.log(sharedState.countyData);
      sharedState.countyData?.forEach((datum) => {
        if (
          datum.state === getStateAbbreviation(sharedState.view) &&
          datum.office_type === getDataVersion(sharedState.breakdown) && 
          (datum.pct_reporting != 0 || datum.dem_votes != 0 || datum.rep_votes != 0)
        ) {
          console.log("pct reporting:", datum.pct_reporting);
          fetchedData.push({
          NAME: normalizeString(datum.county),
          value: (datum.margin_pct),
          });
        }
      });

      console.log('Fetched data:', fetchedData);
      console.log('Electoral data:', electionData);
      console.log('Fetched data does not equal election data:', fetchedData !== electionData);
    }

    let axisMax: number = Math.max(
      Math.abs(getMinState(fetchedData)),
      Math.abs(getMaxState(fetchedData))
    );
    if (fetchedData.length < 2) {
      axisMax = 1;
    }
    const colorAxis: Highcharts.ColorAxisOptions = {
      min: -25,
      max: 25,
      stops: colorAxisStops,
      visible: false,
    };

    const getMinMaxCoordinates = (mapData: any) => {
      let minLongitude = Infinity,
        maxLongitude = -Infinity;
      let minLatitude = Infinity,
        maxLatitude = -Infinity;

      mapData.features.forEach((feature: any) => {
        feature.geometry.coordinates.forEach((coordinates: any) => {
          const processCoordinates = (coords: any) => {
            if (
              typeof coords[0] === 'number' &&
              typeof coords[1] === 'number'
            ) {
              const [longitude, latitude] = coords;
              if (longitude < minLongitude) minLongitude = longitude;
              if (longitude > maxLongitude) maxLongitude = longitude;
              if (latitude < minLatitude) minLatitude = latitude;
              if (latitude > maxLatitude) maxLatitude = latitude;
            } else {
              if (Array.isArray(coords)) {
                coords.forEach((innerCoords: any) =>
                  processCoordinates(innerCoords)
                );
              }
            }
          };
          processCoordinates(coordinates);
        });
      });

      return { minLongitude, maxLongitude, minLatitude, maxLatitude };
    };
    const { minLongitude, maxLongitude, minLatitude, maxLatitude } =
      getMinMaxCoordinates(mapData);
    // const axisMaxFirst: number = Math.max(
    //   Math.abs(getMinState(presData)),
    //   Math.abs(getMaxState(presData))
    // );
    // const zoomScale = axisMaxFirst > 100
    //   ? 0.8
    //   : axisMaxFirst > 50
    //   ? 1.0
    //   : axisMaxFirst > 25
    //   ? 1.2
    //   : 1.5
    // ;
    const horizDiff = maxLongitude - minLongitude;
    const vertDiff = maxLatitude - minLatitude;
    // let zoomScale = 0.8;
    setZoomScale(0.8);
    setCurrentZoom(0.8);
    if (vertDiff > horizDiff) {
      // zoomScale = 1;
      setZoomScale(1);
      setCurrentZoom(1);
    }
    const zoomGeometry = {
      type: 'MultiPoint',
      coordinates: [
        [minLongitude - horizDiff, maxLatitude - vertDiff],
        [minLongitude - horizDiff, minLatitude + vertDiff],
        [maxLongitude + horizDiff, minLatitude + vertDiff],
        [maxLongitude + horizDiff, maxLatitude - vertDiff],
      ],
    };

    const mapOptions: Highcharts.Options = {
      chart: {
        type: 'map',
        map: mapData,
        backgroundColor: 'transparent',
        panning: {
          enabled: true,
          type: 'xy',
        },
        spacing: [0, 0, 0, 0],
        events: {
          click: function (event: any) {
            const chart = this;

            if (!event.point) {
              handleOOBClick(chart, zoomScale);
            }
          },
          load: function () {
            const chart = this;

            if (currentZoom && centerPosition) {
              (chart as any).mapView.setView(centerPosition, currentZoom);
              // chart.setCenter(centerPosition);
              // chart.mapZoom(currentZoom);
            }

            chart.series.forEach(function (series) {
              if (series.type === 'mappoint') {
                series.points.forEach(function (point, index) {
                  const xOffset = index % 2 === 0 ? point.x - 20 : point.x + 20;
                  point.update(
                    {
                      dataLabels: {
                        x: xOffset,
                        y: -2,
                      },
                    },
                    // false
                    true
                  ); //Don't redraw the chart every time we update a point
                });
              }
            });

            if (currentZoom !== null) {
              this.mapZoom(currentZoom);
            } else if (zoomScale !== null) {
              this.mapZoom(zoomScale);
            }
            chart.redraw();
          },
          redraw: function () {
            const chart = this as any;

            const zoomLevel = chart.mapView.zoom;
            setCurrentZoom(zoomLevel);
          },
        },
      },
      tooltip: {
        enabled: false,
        formatter: function (this: any) {
          let prefix = this.point.value >= 0 ? 'D' : 'R';
          return (
            '<b>' +
            this.point.name +
            '</b><br/>' +
            prefix +
            '+' +
            (Math.abs(this.point.value) <= 0.1
              ? '<0.1'
              : Math.abs(this.point.value).toFixed(1))
          );
        },
        style: {
          fontFamily: 'gelica, book antiqua, georgia, times new roman, serif',
        },
      },
      credits: {
        enabled: false,
      },
      accessibility: {
        description: 'State Map.',
      },
      title: {
        text: '',
      },
      plotOptions: {
        map: {
          cursor: 'pointer',
        },
      },
      mapNavigation: {
        enabled: true,
        enableMouseWheelZoom: true,
        enableButtons: false,
        enableTouchZoom: true,
      },
      colorAxis: colorAxis,
      legend: {
        itemStyle: {
          fontFamily: 'gelica, book antiqua, georgia, times new roman, serif',
        },
      },
      series: [
        {
          showInLegend: false,
          type: 'map',
          mapData: mapData,
          data: fetchedData,
          // joinBy: raceType == RaceType.Presidential ? ['COUNTYFP', 'fips'] : ['CD116FP', 'district'],
          joinBy: 'NAME',
          nullColor: '#505050',
          name: 'Counties',
          borderColor: 'black',
          borderWidth: 2,
          states: {
            hover: {
              enabled: false,
            },
          },
          dataLabels: {
            format: '{point.properties.NAME}',
            style: {
              fontFamily:
                'gelica, book antiqua, georgia, times new roman, serif',
            },
            padding: 10,
          },
          tooltip: {
            pointFormat:
              raceType === RaceType.Presidential
                ? '{point.properties.NAME} County'
                : '{point.properties.NAMELSAD}',
          },
          events: {
            click: function (event: any) {
              const countyName =
                raceType == RaceType.Presidential
                  ? event.point['name']
                  : event.point.properties.NAMELSAD;
              const fipsOrDistrict =
                raceType == RaceType.Presidential
                  ? event.point.fips
                  : event.point.district;
              handleCountyClick(fipsOrDistrict, countyName);
            },
          },
        },
        {
          // Series for cities (mappoint)
          type: 'mappoint',
          enableMouseTracking: false,
          name: 'Cities',
          color: '#D9D9D9',
          data: cityData,
          dataLabels: {
            enabled: true,
            allowOverlap: true,
            style: {
              fontSize: '12px',
              fontWeight: 'bold',
              textOutline: '1px contrast',
              color: '#FFFFFF',
              fontFamily:
                'gelica, book antiqua, georgia, times new roman, serif',
            },
            formatter: function () {
              // const offsetX = '      ';
              // const final_result = this.point.index % 2 === 0 ? offsetX + this.point.name: this.point.name + offsetX;
              // return final_result;
              return this.point.name;
            },
            overflow: true,
            crop: false,
          },
          marker: {
            radius: 5,
            lineColor: '#000000',
            lineWidth: 1,
          },
        },
      ],
      mapView: {
        projection: {
          name: 'WebMercator',
        },
        fitToGeometry: zoomGeometry,
      },
    };

    // Highcharts.mapChart("eb-state-container", mapOptions);
    const ch = Highcharts.mapChart('eb-state-container', mapOptions);
    console.log(ch ? 'Ch exists' : 'Ch does not exist');
    console.log(ch);
    setStateChart(ch);
    setElectionData(fetchedData);
  };

  return <div id="eb-state-container" />;
};

export default StateMap;
