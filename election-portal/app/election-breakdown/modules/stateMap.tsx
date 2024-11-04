import React, { useEffect, useState, useRef } from 'react';
import { RaceType } from '@/types/RaceType';
import { Year } from '@/types/Year';
import Highcharts from 'highcharts';
import HighchartsMap from 'highcharts/modules/map';
import highchartsAccessibility from 'highcharts/modules/accessibility';

import GeoJsonCache from './mapDataCache';
import { State, getStateFromString } from '../../../types/State';

import { useSharedState } from '../../sharedContext';
import './stateMap.css';
import { json } from 'stream/consumers';

const presData = [
  { fips: '069', value: -2.5 },
  { fips: '023', value: 14.29 },
  { fips: '005', value: 1.47 },
  { fips: '107', value: 26.1 },
  { fips: '033', value: 33.26 },
  { fips: '051', value: 47.24 },
  { fips: '009', value: -24.56 },
  { fips: '025', value: 16.06 },
  { fips: '055', value: 3.66 },
  { fips: '115', value: -38.52 },
  { fips: '065', value: -43.17 },
  { fips: '089', value: 12.89 },
  { fips: '071', value: 57.24 },
  { fips: '043', value: -23.14 },
  { fips: '001', value: -7.58 },
  { fips: '121', value: 6.38 },
  { fips: '131', value: -27.42 },
  { fips: '091', value: 3.56 },
  { fips: '041', value: -48.73 },
  { fips: '085', value: 9.22 },
  { fips: '063', value: -58.39 },
  { fips: '101', value: 40.66 },
  { fips: '095', value: 35.89 },
  { fips: '109', value: -18.32 },
  { fips: '003', value: -2.08 },
  { fips: '129', value: 25.98 },
  { fips: '117', value: -50.14 },
  { fips: '035', value: -49.59 },
  { fips: '049', value: 27.63 },
  { fips: '073', value: 45.52 },
  { fips: '047', value: -28.97 },
  { fips: '099', value: -38.41 },
  { fips: '097', value: 20.71 },
  { fips: '039', value: 6.83 },
  { fips: '119', value: -15.74 },
  { fips: '075', value: -54.88 },
  { fips: '029', value: 18.67 },
  { fips: '021', value: -47.64 },
  { fips: '103', value: 13.28 },
  { fips: '037', value: 36.94 },
  { fips: '083', value: 2.53 },
  { fips: '013', value: -10.52 },
  { fips: '045', value: 32.41 },
  { fips: '105', value: -9.76 },
  { fips: '031', value: 50.42 },
  { fips: '011', value: -33.24 },
  { fips: '125', value: -35.09 },
  { fips: '015', value: 40.84 },
  { fips: '007', value: -11.89 },
  { fips: '067', value: 19.67 },
  { fips: '017', value: 7.01 },
  { fips: '077', value: 54.83 },
  { fips: '127', value: -37.55 },
  { fips: '057', value: -20.04 },
  { fips: '061', value: 3.15 },
  { fips: '079', value: -39.21 },
  { fips: '027', value: -57.08 },
  { fips: '087', value: 38.02 },
  { fips: '093', value: 48.78 },
  { fips: '133', value: -25.33 },
  { fips: '113', value: -30.47 },
  { fips: '081', value: 17.48 },
  { fips: '019', value: -44.23 },
  { fips: '059', value: 22.79 },
  { fips: '111', value: -5.12 },
  { fips: '123', value: -21.74 },
  { fips: '053', value: 41.69 },
];

const countyData = [
  { district: '01', value: 12.1},
  { district: '02', value: -3.2},
  { district: '03', value: 4.3},
  { district: '04', value: 5.4},
  { district: '05', value: 6.5},
  { district: '06', value: -7.6},
  { district: '07', value: 8.7},
  { district: '0', value: 9.8},
];


if (typeof window !== `undefined`) {
  highchartsAccessibility(Highcharts);
}

if (typeof Highcharts === 'object') {
  HighchartsMap(Highcharts);
}

interface RTCMapProps {
  raceType: RaceType;
  year: Year;
  stateName: string;
  setCountyName: any;
}

interface FakeData {
  fips: string;
  value: number;
}

interface countyFakeData {
  district: string;
  value: number;
}

const colorAxisStops: [number, string][] = [
  [0, '#B83C2B'], // Republican red
  [0.25, '#B83C2B'],
  [0.5, '#EAEAEA'],
  [0.75, '#595D9A'],
  [1, '#595D9A'], // Democrat blue
];

const StateMap: React.FC<RTCMapProps> = ({ raceType, year, stateName, setCountyName }) => {
  const { fetchStateGeoJSON, fetchCityGeoJSON } = GeoJsonCache();
  const sharedState = useSharedState().state;

  const [wasPanned, setWasPanned] = useState(false);

  const [stateChart, setStateChart] = useState<any>(null);
  const [selectedCounty, setSelectedCounty] = useState('');

  const [zoomScale, setZoomScale] = useState<number | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number | null>(null);
  const [centerPosition, setCenterPosition] = useState<[number, number] | null>(null);

  const startPos = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = (event: MouseEvent) => {
    startPos.current = { x: event.clientX, y: event.clientY };
    console.log('Mouse down: ', event.clientX, event.clientY);
  };

  const handleMouseUp = (event: MouseEvent) => {
    if (startPos.current) {
      const deltaX = Math.abs(event.clientX - startPos.current.x);
      const deltaY = Math.abs(event.clientY - startPos.current.y);
      console.log('Mouse up: ', event.clientX, event.clientY);
      console.log('Delta X: ', deltaX, 'Delta Y: ', deltaY);
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

    if (stateChart) {
      const zoomLevel = stateChart.mapView.zoom;
      const center = stateChart.mapView.center;
      setCurrentZoom(zoomLevel);
      setCenterPosition(center);
      sharedState.setLevel('state');
      setSelectedCounty('');
      setCountyName('');
    }

    retrieveMapData();
    console.log('stateChart', stateChart);
  }, [raceType, year, stateName]);

  const retrieveMapData = async () => {
    if (stateName == 'National') {
      return;
    }
    const countyOrDistrict = raceType === RaceType.Presidential ? 'County' : 'Congressional District';
    console.log('Retrieving map data for', stateName, year);
    const newMapData = await fetchStateGeoJSON(stateName, String(year), countyOrDistrict);
    const newCityData = await fetchCityGeoJSON(stateName);
    console.log(newMapData);
    initializeMap(newMapData, newCityData);
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
                const countyName = raceType == RaceType.Presidential ? event.point["name"] : event.point.properties.NAMELSAD;
                const fipsOrDistrict = raceType == RaceType.Presidential ? event.point.fips : event.point.district;
                handleCountyClick(fipsOrDistrict, countyName);
              },
            },
          },
        ],
      });
    }
  }, [sharedState.view, wasPanned, stateChart]);

  function getMaxState(stateData: FakeData[] | countyFakeData[]): number {
    return Math.max(...stateData.map((state) => state.value));
  }

  function getMinState(stateData: FakeData[] | countyFakeData[]): number {
    return Math.min(...stateData.map((state) => state.value));
  }

  const handleOOBClick = (chart: any, zoomScale: any) => {
    if (wasPanned) {
      return;
    }
    // sharedState.setView(State.National);
    const stateEnum = getStateFromString(stateName);
    sharedState.setLevel('state');
    setSelectedCounty('');
    setCountyName('');
    if (chart) {
      // chart.mapZoom();
      // setTimeout(() => chart.mapZoom(zoomScale), 50);
      chart.mapZoom();
      chart.mapZoom(zoomScale);
    }
  };

  const handleCountyClick = (countyKey: string, countyName: string) => {
    console.log('wasPanned', wasPanned);
    if (!wasPanned) {
      setSelectedCounty(countyKey); // Update selected county key for border
      
      sharedState.setLevel('county');
      setCountyName(countyName);
    }
  };

  useEffect(() => {
    if (stateChart && raceType === RaceType.Presidential) {
      stateChart.update({
        series: [
          {
            type: 'map',
            data: presData.map((county) => ({
              ...county,
              borderColor:
                ((county.fips === selectedCounty) && (sharedState.level === "county"))  ? 'lightgreen' : '#000000',
              borderWidth: 
                ((county.fips === selectedCounty) && (sharedState.level === "county")) ? 6 : 1,
            })),
          },
          
        ],
      });
    } else if (stateChart && raceType != RaceType.Presidential) {
      stateChart.update({
        series: [
          {
            type: 'map',
            data: countyData.map((district) => ({
              ...district,
              borderColor:
                ((district.district === selectedCounty) && (sharedState.level === "county"))  ? 'lightgreen' : '#000000',
              borderWidth: 
                ((district.district === selectedCounty) && (sharedState.level === "county")) ? 6 : 1,
            })),
          },
          
        ],
      });
    }
  }, [selectedCounty, stateChart, sharedState.level]);

  const initializeMap = (mapData: any, cityData: any) => {
    const axisMax: number = Math.max(
      raceType === RaceType.Presidential ? Math.abs(getMinState(presData)) : Math.abs(getMinState(countyData)),
      raceType === RaceType.Presidential ? Math.abs(getMaxState(presData)) : Math.abs(getMaxState(countyData))
      // Math.abs(getMaxState(presData))
    );
    const colorAxis: Highcharts.ColorAxisOptions = {
      min: -axisMax,
      max: axisMax,
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
    setCurrentZoom(0.8)
    if (vertDiff > horizDiff) {
      // zoomScale = 1;
      setZoomScale(1);
      setCurrentZoom(1);
    }
    console.log(maxLongitude + horizDiff, maxLatitude - vertDiff);
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
        // animation: {
        //   duration: 50,
        // },
        panning: {
          enabled: true,
          type: 'xy',
        },
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
              (chart as any).mapView.setView(centerPosition, currentZoom)
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
      credits: {
        enabled: false,
      },
      accessibility: {
        description: 'State Map.',
      },
      title: {
        text: '',
      },
      tooltip: {
        enabled: true,
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
          data: raceType == RaceType.Presidential ? presData : countyData,
          joinBy: raceType == RaceType.Presidential ? ['COUNTYFP', 'fips'] : ['CD116FP', 'district'],
          nullColor: '#FFFFFF',
          name: 'Counties',
          borderColor: 'black',
          borderWidth: 2,
          states: {
            hover: {
              enabled: false,
            }
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
            pointFormat: raceType === RaceType.Presidential ? '{point.properties.NAME} County' : '{point.properties.NAMELSAD}',
          },
          events: {
            click: function (event: any) {
              const countyName = raceType == RaceType.Presidential ? event.point["name"] : event.point.properties.NAMELSAD;
              const fipsOrDistrict = raceType == RaceType.Presidential ? event.point.fips : event.point.district;
              handleCountyClick(fipsOrDistrict, countyName);
            },
          },
        },
        {
          // Series for cities (mappoint)
          type: 'mappoint',
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
                '"gelica, book antiqua, georgia, times new roman, serif"',
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
          tooltip: {
            pointFormat: '{point.name}',
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
    console.log(ch ? "Ch exists" : "Ch does not exist");
    setStateChart(ch);
  };

  return <div id="eb-state-container" />;
};

export default StateMap;
