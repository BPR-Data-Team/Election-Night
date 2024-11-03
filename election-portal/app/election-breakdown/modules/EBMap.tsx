import React, { useEffect, useState, useRef } from 'react';
import { getDataVersion, RaceType } from '@/types/RaceType';
import Highcharts from 'highcharts';
import HighchartsMap from 'highcharts/modules/map';
import highchartsAccessibility from 'highcharts/modules/accessibility';
import './EBMap.css';

import { useSharedState } from '../../sharedContext';
import { State, getStateAbbreviation, getStateFromString } from '../../../types/State';
import { HistoricalElectionData } from '@/types/data';
interface ElectionData {
  "hc-key": string;
  value: number;
}
const presData: FakeData[] = [
  {
    'hc-key': 'us-al',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -9, // Changed to negative
  },
  {
    'hc-key': 'us-ak',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 3,
  },
  {
    'hc-key': 'us-az',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 11,
  },
  {
    'hc-key': 'us-ar',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 6,
  },
  {
    'hc-key': 'us-ca',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 55,
  },
  {
    'hc-key': 'us-co',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -9, // Changed to negative
  },
  {
    'hc-key': 'us-ct',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -7, // Changed to negative
  },
  {
    'hc-key': 'us-de',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 3,
  },
  {
    'hc-key': 'us-dc',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -3, // Changed to negative
  },
  {
    'hc-key': 'us-fl',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -29, // Changed to negative
  },
  {
    'hc-key': 'us-ga',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 16,
  },
  {
    'hc-key': 'us-hi',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 4,
  },
  {
    'hc-key': 'us-id',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -4, // Changed to negative
  },
  {
    'hc-key': 'us-il',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -20, // Changed to negative
  },
  {
    'hc-key': 'us-in',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -11, // Changed to negative
  },
  {
    'hc-key': 'us-ia',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 6,
  },
  {
    'hc-key': 'us-ks',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 6,
  },
  {
    'hc-key': 'us-ky',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -8, // Changed to negative
  },
  {
    'hc-key': 'us-la',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -8, // Changed to negative
  },
  {
    'hc-key': 'us-me',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 4,
  },
  {
    'hc-key': 'us-md',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -10, // Changed to negative
  },
  {
    'hc-key': 'us-ma',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 11,
  },
  {
    'hc-key': 'us-mi',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -16, // Changed to negative
  },
  {
    'hc-key': 'us-mn',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -10, // Changed to negative
  },
  {
    'hc-key': 'us-ms',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 6,
  },
  {
    'hc-key': 'us-mo',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -10, // Changed to negative
  },
  {
    'hc-key': 'us-mt',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 3,
  },
  {
    'hc-key': 'us-ne',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -5, // Changed to negative
  },
  {
    'hc-key': 'us-nv',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 6,
  },
  {
    'hc-key': 'us-nh',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -4, // Changed to negative
  },
  {
    'hc-key': 'us-nj',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 14,
  },
  {
    'hc-key': 'us-nm',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -5, // Changed to negative
  },
  {
    'hc-key': 'us-ny',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 29,
  },
  {
    'hc-key': 'us-nc',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -15, // Changed to negative
  },
  {
    'hc-key': 'us-nd',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -3, // Changed to negative
  },
  {
    'hc-key': 'us-oh',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 18,
  },
  {
    'hc-key': 'us-ok',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 7,
  },
  {
    'hc-key': 'us-or',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'FALSE',
    value: 7,
  },
  {
    'hc-key': 'us-pa',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'FALSE',
    value: 20,
  },
  {
    'hc-key': 'us-ri',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -4, // Changed to negative
  },
  {
    'hc-key': 'us-sc',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 9,
  },
  {
    'hc-key': 'us-sd',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -3, // Changed to negative
  },
  {
    'hc-key': 'us-tn',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 11,
  },
  {
    'hc-key': 'us-tx',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 38,
  },
  {
    'hc-key': 'us-ut',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -6, // Changed to negative
  },
  {
    'hc-key': 'us-vt',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -3, // Changed to negative
  },
  {
    'hc-key': 'us-va',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 13,
  },
  {
    'hc-key': 'us-wa',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'FALSE',
    value: 12,
  },
  {
    'hc-key': 'us-wv',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'FALSE',
    value: 5,
  },
  {
    'hc-key': 'us-wi',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'FALSE',
    value: 10,
  },
  {
    'hc-key': 'us-wy',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'FALSE',
    value: 3,
  },
];

const senData = [
  {
    'hc-key': 'us-az',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 11,
  },
  {
    'hc-key': 'us-ca',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 55,
  },
  {
    'hc-key': 'us-ct',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -7, // Changed to negative
  },
  {
    'hc-key': 'us-de',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 3,
  },
  {
    'hc-key': 'us-fl',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -29, // Changed to negative
  },
  {
    'hc-key': 'us-hi',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 4,
  },
  {
    'hc-key': 'us-in',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -11, // Changed to negative
  },
  {
    'hc-key': 'us-me',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 4,
  },
  {
    'hc-key': 'us-md',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -10, // Changed to negative
  },
  {
    'hc-key': 'us-ma',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 11,
  },
  {
    'hc-key': 'us-mi',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -16, // Changed to negative
  },
  {
    'hc-key': 'us-mn',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -10, // Changed to negative
  },
  {
    'hc-key': 'us-ms',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 6,
  },
  {
    'hc-key': 'us-mo',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -10, // Changed to negative
  },
  {
    'hc-key': 'us-mt',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 3,
  },
  {
    'hc-key': 'us-ne',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -5, // Changed to negative
  },
  {
    'hc-key': 'us-nv',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 6,
  },
  {
    'hc-key': 'us-nj',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 14,
  },
  {
    'hc-key': 'us-nm',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -5, // Changed to negative
  },
  {
    'hc-key': 'us-ny',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 29,
  },
  {
    'hc-key': 'us-nd',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -3, // Changed to negative
  },
  {
    'hc-key': 'us-oh',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 18,
  },
  {
    'hc-key': 'us-pa',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'FALSE',
    value: 20,
  },
  {
    'hc-key': 'us-ri',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -4, // Changed to negative
  },
  {
    'hc-key': 'us-tn',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 11,
  },
  {
    'hc-key': 'us-tx',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 38,
  },
  {
    'hc-key': 'us-ut',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -6, // Changed to negative
  },
  {
    'hc-key': 'us-vt',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'TRUE',
    value: -3, // Changed to negative
  },
  {
    'hc-key': 'us-va',
    'Office Type': 'President',
    'Called for Dems': 'TRUE',
    'Called for Reps': 'FALSE',
    value: 13,
  },
  {
    'hc-key': 'us-wa',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'FALSE',
    value: 12,
  },
  {
    'hc-key': 'us-wv',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'FALSE',
    value: 5,
  },
  {
    'hc-key': 'us-wi',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'FALSE',
    value: 10,
  },
  {
    'hc-key': 'us-wy',
    'Office Type': 'President',
    'Called for Dems': 'FALSE',
    'Called for Reps': 'FALSE',
    value: 3,
  },
];

if (typeof window !== `undefined`) {
  highchartsAccessibility(Highcharts);
}

if (typeof Highcharts === 'object') {
  HighchartsMap(Highcharts);
}

interface FakeData {
  'hc-key': string;
  'Office Type': string;
  'Called for Dems': string;
  'Called for Reps': string;
  value: number;
}

interface EBMapProps {
  historicalElectionsData: HistoricalElectionData[] | null
}

const colorAxisStops: [number, string][] = [
  [0, '#B83C2B'], // Republican red
  [0.25, '#B83C2B'],
  [0.5, '#EAEAEA'],
  [0.75, '#595D9A'],
  [1, '#595D9A'], // Democrat blue
];


const EBMap: React.FC<EBMapProps> = ({ historicalElectionsData }) => {
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
            eventPoint.plotX * 7 - 1000,
            eventPoint.plotY * -8 + 10000
          );
        }
      }
    } else if (sharedState.view == stateEnum) {
      sharedState.setLevel('state');
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
  }, [raceType]);

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

  useEffect(() => {
    if (chart) {
      chart.update({
        series: [
          {
            type: 'map',
            data: electionData.map(
              (state) => ({
                ...state,
                borderColor:
                  state['hc-key'] === selectedStateKey
                    ? 'lightgreen'
                    : '#000000',
                borderWidth: state['hc-key'] === selectedStateKey ? 6 : 1,
              })
            ),
          },
        ],
      });
    }
  }, [selectedStateKey, chart, raceType]);

  function getMaxState(stateData: ElectionData[]): number {
    return Math.max(...stateData.map((state) => state.value));
  }

  function getMinState(stateData: ElectionData[]): number {
    return Math.min(...stateData.map((state) => state.value));
  }

  // Because highcharts sucks
  const zoomGeometry = {
    type: 'MultiPoint',
    coordinates: [
      [29000, 15000],
      [-20000, 15000],
      [29000, -2000],
      [-20000, -2000],
    ],
  };

  const initializeMap = (mapData: any) => {
    let fetchedData: ElectionData[] = [];
    historicalElectionsData?.forEach((datum) => {
      if (
        datum.office_type === getDataVersion(sharedState.breakdown)
      ) {
        fetchedData.push({ "hc-key": "us-" + datum.state.toLowerCase(), value: datum.margin_pct_1 })
      }
    });

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
      },
      colorAxis: {
        min: -axisMax,
        max: axisMax,
        stops: colorAxisStops,
        visible: false,
      },
      tooltip: {
        formatter: function (this: any) {
          let prefix = this.point['Called for Dems'] == 'TRUE' ? 'D' : 'R';
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
              borderColor: 'lightgreen',
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
    const ch = Highcharts.mapChart('container', mapOptions);
    setChart(ch);
    setElectionData(fetchedData);
  };

  return <div id="container" />;
};

export default EBMap;
