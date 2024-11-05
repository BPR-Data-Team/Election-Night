import React, { useEffect, useState, useRef } from 'react';
import { getDataVersion, RaceType } from '@/types/RaceType';
import Highcharts from 'highcharts';
import HighchartsMap from 'highcharts/modules/map';
import highchartsAccessibility from 'highcharts/modules/accessibility';
import './EXMap.css';

import { useSharedState } from '../../sharedContext';
import { State, getStateFromString } from '../../../types/State';
import { HistoricalElectionData } from '@/types/data';
import { Year } from '@/types/Year';
interface ElectionData {
  'hc-key': string;
  value: number;
}

if (typeof window !== `undefined`) {
  highchartsAccessibility(Highcharts);
}

if (typeof Highcharts === 'object') {
  HighchartsMap(Highcharts);
}

interface EXMapProps {
  historicalElectionsData: HistoricalElectionData[] | null;
}

const colorAxisStops: [number, string][] = [
  [0, '#B83C2B'], // Republican red
  [0.25, '#B83C2B'],
  [0.5, '#EAEAEA'],
  [0.75, '#595D9A'],
  [1, '#595D9A'], // Democrat blue
];

const EXMap: React.FC<EXMapProps> = ({ historicalElectionsData }) => {
  const sharedState = useSharedState().state;
  const raceType = sharedState.breakdown;

  const [chart, setChart] = useState<any>(null);
  const [electionData, setElectionData] = useState<ElectionData[]>([]);
  const [geoData, setGeoData] = useState<any>(null);

  const [wasPanned, setWasPanned] = useState(false);

  const startPos = useRef<{ x: number; y: number } | null>(null);

  const [selectedStateKey, setSelectedStateKey] = useState<string>('');

  const handleMouseDown = (event: MouseEvent) => {
    startPos.current = { x: event.clientX, y: event.clientY };
    console.log('mouse down', event.clientX, event.clientY);
  };

  const handleMouseUp = (event: MouseEvent) => {
    if (startPos.current) {
      const deltaX = Math.abs(event.clientX - startPos.current.x);
      const deltaY = Math.abs(event.clientY - startPos.current.y);
      console.log('mouse up', event.clientX, event.clientY);
      if (deltaX > 10 || deltaY > 10) {
        setWasPanned(true);
      } else {
        setWasPanned(false);
      }
      startPos.current = null;
    }
  };

  useEffect(() => {
    sharedState.setAvailableBreakdowns([
      RaceType.Presidential,
      RaceType.Senate,
      RaceType.Gubernatorial,
    ]);
    sharedState.breakdownSwitch(sharedState.breakdown);
  }, []);

  useEffect(() => {
    console.log('adding event listeners');
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      console.log('removing event listeners');
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const fetchMapDataAndInitializeMap = async () => {
    const geoResponse = await fetch(
      'https://code.highcharts.com/mapdata/countries/us/us-all.geo.json'
    );
    let geoData = await geoResponse.json();
    setGeoData(geoData);
    initializeMap(geoData);
  };

  const handleStateClick = async (stateName: string, eventPoint: any) => {
    if (wasPanned) {
      return;
    }
    const stateEnum = getStateFromString(stateName);

    if (sharedState.view != stateEnum) {
      sharedState.setView(stateEnum as State);
      if (chart) {
        if (eventPoint) {
          chart.mapZoom(); // reset zoom
          chart.mapZoom(0.3); // do default zoom we want

          // I genuinely have no idea how this is formulated.
          // I just guess-and-checked until it looked right -- I assume that it has to
          // do with the zoomGeometry offsets.
          let toZoom = 0.8;
          if (
            stateName == 'Rhode Island' ||
            stateName == 'Connecticut' ||
            stateName == 'Delaware' ||
            stateName == 'New Jersey' ||
            stateName == 'Maryland' ||
            stateName == 'Massachusetts'
          ) {
            toZoom = 0.5;
          }
          chart.mapZoom(
            toZoom,
            eventPoint.plotX * 5 - 2000,
            eventPoint.plotY * -7 + 10000
          );
        }
      }
    } else if (sharedState.view == stateEnum) {
      // sharedState.setLevel('state');
    }

    setSelectedStateKey(eventPoint['hc-key']);
  };

  // Exists because page.tsx doesn't work if inside container div but outside USA boundaries
  const handleOOBClick = () => {
    if (wasPanned) {
      return;
    }
    sharedState.setView(State.National);
    chart.mapZoom(); // resets to default
    chart.mapZoom(0.3);

    setSelectedStateKey('');
  };

  useEffect(() => {
    fetchMapDataAndInitializeMap();
  }, [raceType, sharedState.year, historicalElectionsData]);

  useEffect(() => {
    const fetchedData = histDataToFetchedData(historicalElectionsData);
    const updatedData = fetchedData.map((state) => ({
      ...state,
      borderColor:
        state['hc-key'] === selectedStateKey ? 'lightgreen' : '#000000',
      borderWidth: state['hc-key'] === selectedStateKey ? 6 : 1,
    }));
    const reorderedData = [
      ...updatedData.filter((state) => state['hc-key'] !== selectedStateKey),
      ...updatedData.filter((state) => state['hc-key'] === selectedStateKey),
    ];

    if (chart) {
      chart.update({
        series: [
          {
            data: reorderedData,
          },
        ],
      });
    }
  }, [historicalElectionsData, selectedStateKey, chart, raceType]);

  useEffect(() => {
    if (chart) {
      chart.update({
        chart: {
          animation: {
            duration: 350,
          },
          events: {
            click: function (event: any) {
              if (!event.point) {
                handleOOBClick();
              }
            },
          },
        },
        series: [
          {
            events: {
              click: function (event: any) {
                const stateName = event.point['name'];
                handleStateClick(stateName, event.point);
              },
            },
          },
        ],
      });
    }
  }, [sharedState.view, wasPanned, chart]);

  // Deprecated as per the similar useEffect on line 149
  // useEffect(() => {
  //   if (chart) {
  //     const updatedData = electionData.map((state) => ({
  //       ...state,
  //       borderColor:
  //         state['hc-key'] === selectedStateKey ? 'lightgreen' : '#000000',
  //       borderWidth: state['hc-key'] === selectedStateKey ? 6 : 1,
  //     }));
  //     const reorderedData = [
  //       ...updatedData.filter((state) => state['hc-key'] !== selectedStateKey),
  //       ...updatedData.filter((state) => state['hc-key'] === selectedStateKey),
  //     ];
  //     chart.update({
  //       series: [
  //         {
  //           type: 'map',
  //           data: reorderedData,
  //         },
  //       ],
  //     });
  //   }
  // }, [selectedStateKey, chart, raceType]);

  function getMaxState(stateData: ElectionData[]): number {
    return Math.max(...stateData.map((state) => state.value));
  }

  function getMinState(stateData: ElectionData[]): number {
    return Math.min(...stateData.map((state) => state.value));
  }

  const zoomGeometry = {
    type: 'MultiPoint',
    coordinates: [
      [29000, 15000],
      [-20000, 15000],
      [29000, -2000],
      [-20000, -2000],
    ],
  };

  const histDataToFetchedData = (
    histData: HistoricalElectionData[] | null
  ): ElectionData[] => {
    let fetchedData: ElectionData[] = [];
    histData?.forEach((datum: HistoricalElectionData) => {
      if (datum.office_type === getDataVersion(raceType)) {
        switch (raceType) {
          case RaceType.Senate:
            switch (sharedState.year) {
              case Year.TwentyFour:
                break;
              case Year.Twenty:
                fetchedData.push({
                  'hc-key': 'us-' + datum.state.toLowerCase(),
                  value: datum.margin_pct_1,
                });
                break;
            }
            break;
          case RaceType.Presidential:
            switch (sharedState.year) {
              case Year.TwentyFour:
                break;
              case Year.Twenty:
                fetchedData.push({
                  'hc-key': 'us-' + datum.state.toLowerCase(),
                  value: datum.margin_pct_1,
                });
                break;
            }
            break;
        }
      }
    });
    if (sharedState.year === Year.TwentyFour) {
      sharedState.electionData?.forEach((datum) => {
        if (datum.office_type === getDataVersion(raceType)) {
          fetchedData.push({
            'hc-key': 'us-' + datum.state.toLowerCase(),
            value: datum.margin_pct,
          });
        }
      });
    }
    return fetchedData;
  };

  const initializeMap = (mapData: any) => {
    const fetchedData = histDataToFetchedData(historicalElectionsData);
    const axisMax: number = Math.max(
      Math.abs(getMinState(fetchedData)),
      Math.abs(getMaxState(fetchedData))
    );
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
            this.mapZoom(0.3);
          },
        },
        animation: {
          duration: 0,
        },
        panning: {
          enabled: true,
          type: 'xy',
        },
        reflow: false,
      },
      credits: {
        enabled: false,
      },
      accessibility: {
        description: 'Map of the United States.',
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
      colorAxis: {
        min: -axisMax,
        max: axisMax,
        stops: colorAxisStops,
        visible: false,
      },
      tooltip: {
        enabled: false,
      },
      // tooltip: {
      //   formatter: function (this: any) {
      //     let prefix = this.point['Called for Dems'] == 'TRUE' ? 'D' : 'R';
      //     return (
      //       '<b>' +
      //       this.point.name +
      //       '</b><br/>' +
      //       prefix +
      //       '+' +
      //       (Math.abs(this.point.value) <= 0.1
      //         ? '<0.1'
      //         : Math.abs(this.point.value).toFixed(1))
      //     );
      //   },
      //   style: {
      //     fontFamily: 'gelica, book antiqua, georgia, times new roman, serif',
      //   },
      // },
      legend: {
        itemStyle: {
          fontFamily: 'gelica, book antiqua, georgia, times new roman, serif',
        },
      },
      series: [
        {
          showInLegend: false,
          type: 'map',
          data: fetchedData,
          nullColor: '#505050',
          name: 'Predicted Margin',
          states: {
            hover: {
              enabled: false,
            },
          },
          point: {
            events: {},
          },
          borderColor: '#000000', // Conditionally green if selected state
          borderWidth: 1,
          dataLabels: {
            format: '{point.name}',
            style: {
              fontFamily:
                'gelica, book antiqua, georgia, times new roman, serif',
            },
          },
          events: {
            click: function (event: any) {
              const stateName = event.point['name'];
              handleStateClick(stateName, event.point);
            },
          },
        },
      ],
      mapView: {
        fitToGeometry: zoomGeometry,
      },
    };
    const ch = Highcharts.mapChart('ex-container', mapOptions);
    setChart(ch);
    setElectionData(fetchedData);
  };

  return <div id="ex-container" />;
};

export default EXMap;
