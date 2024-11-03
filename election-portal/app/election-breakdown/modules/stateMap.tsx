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
  countyData: HistoricalCountyData[];
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
}) => {
  const { fetchStateGeoJSON, fetchCityGeoJSON } = GeoJsonCache();
  const sharedState = useSharedState().state;

  const [wasPanned, setWasPanned] = useState(false);

  const [stateChart, setStateChart] = useState<any>(null);
  const [selectedCounty, setSelectedCounty] = useState('');
  const [electionData, setElectionData] = useState<ElectionData[]>([]);

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
    setMenubar();
  }, []);

  useEffect(() => {
    retrieveMapData();
  }, [
    sharedState.breakdown,
    sharedState.year,
    sharedState.view,
    countyData,
    year,
    stateName,
    raceType,
  ]);

  const retrieveMapData = async () => {
    if (stateName == 'National') {
      return;
    }
    const newMapData = await fetchStateGeoJSON(stateName, String(year));
    const newCityData = await fetchCityGeoJSON(stateName);
    initializeMap(newMapData, newCityData);
  };

  const setMenubar = () => {
    const options: RaceType[] = [RaceType.Presidential];
    if (
      countyData.some(
        (datum) =>
          datum.state === getStateAbbreviation(sharedState.view) &&
          datum.office_type === 'Governor'
      )
    ) {
      options.push(RaceType.Gubernatorial);
    } else if (
      countyData.some(
        (datum) =>
          datum.state === getStateAbbreviation(sharedState.view) &&
          datum.office_type === 'Senate'
      )
    ) {
      options.push(RaceType.Senate);
    }
    sharedState.setAvailableBreakdowns(options);
  };

  function getMaxState(stateData: ElectionData[]): number {
    return Math.max(...stateData.map((state) => state.value));
  }

  function getMinState(stateData: ElectionData[]): number {
    return Math.min(...stateData.map((state) => state.value));
  }

  const handleOOBClick = () => {
    if (wasPanned) {
      return;
    }
    setSelectedCounty('');
  };

  const handleCountyClick = (countyKey: string) => {
    if (!wasPanned) {
      setSelectedCounty(countyKey); // Update selected county key for border
    }
  };

  const initializeMap = (mapData: any, cityData: any) => {
    let fetchedData: ElectionData[] = [];
    countyData?.forEach((datum) => {
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
                  value: datum.margin_pct_1,
                });
                break;
              case Year.Twelve:
                fetchedData.push({
                  NAME: datum.county,
                  value: datum.margin_pct_2,
                });
                break;
            }
          case RaceType.Gubernatorial:
            switch (sharedState.year) {
              case Year.Twenty:
                fetchedData.push({
                  NAME: datum.county,
                  value: datum.margin_pct_1,
                });
                break;
              case Year.Sixteen:
                fetchedData.push({
                  NAME: datum.county,
                  value: datum.margin_pct_2,
                });
                break;
            }
          case RaceType.Presidential:
            switch (sharedState.year) {
              case Year.Twenty:
                fetchedData.push({
                  NAME: datum.county,
                  value: datum.margin_pct_1,
                });
                break;
              case Year.Sixteen:
                fetchedData.push({
                  NAME: datum.county,
                  value: datum.margin_pct_2,
                });
                break;
            }
        }
      }
    });

    const axisMax: number = Math.max(
      Math.abs(getMinState(fetchedData)),
      Math.abs(getMaxState(fetchedData))
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
    const horizDiff = maxLongitude - minLongitude;
    const vertDiff = maxLatitude - minLatitude;
    let zoomScale = 0.7;
    if (vertDiff > horizDiff) {
      zoomScale = 1;
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
        spacing: [0, 0, 0, 0],
        events: {
          click: function (event: any) {
            if (!event.point) {
              handleOOBClick();
            }
          },
          load: function () {
            const chart = this;

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
                    false
                  ); //Don't redraw the chart every time we update a point
                });
              }
            });

            this.mapZoom(zoomScale);
            chart.redraw();
          },
        },

        animation: {
          duration: 0,
        },
      },
      tooltip: {
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
          joinBy: 'NAME',
          nullColor: '#505050',
          name: 'Counties',
          borderColor: 'black',
          borderWidth: 2,
          states: {
            hover: {
              borderColor: 'lightgreen',
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
            pointFormat: '{point.properties.NAME} County',
          },
          events: {
            click: function (event: any) {
              // const countyName = event.point["name"];
              handleCountyClick(event.point.GEOID);
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
                '"gelica, book antiqua, georgia, times new roman, serif"',
            },
            formatter: function () {
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
    setStateChart(ch);
    setElectionData(fetchedData);
  };

  return <div id="eb-state-container" />;
};

export default StateMap;
