import React, { useEffect, useState } from "react";
import { RaceType } from "@/types/RaceType";
import { Year } from "@/types/Year";
import Highcharts from "highcharts";
import HighchartsMap from "highcharts/modules/map";
import highchartsAccessibility from "highcharts/modules/accessibility";

import { fetchStateGeoJSON } from "./mapDataCache";

import "./EBMap.css";

const presData: FakeData[] = [{'GEOID': '01069', 'value': 9.95},
    {'GEOID': '01023', 'value': 45.82},
    {'GEOID': '01005', 'value': 1.65},
    {'GEOID': '01107', 'value': 33.11},
    {'GEOID': '01033', 'value': -14.81},
    {'GEOID': '01051', 'value': -34.78},
    {'GEOID': '01009', 'value': 48.03},
    {'GEOID': '01025', 'value': -37.8},
    {'GEOID': '01055', 'value': 36.01},
    {'GEOID': '01115', 'value': -51.13},
    {'GEOID': '01065', 'value': 16.99},
    {'GEOID': '01089', 'value': 54.39},
    {'GEOID': '01071', 'value': -29.49},
    {'GEOID': '01043', 'value': -55.66},
    {'GEOID': '01001', 'value': -4.65},
    {'GEOID': '01121', 'value': -21.15},
    {'GEOID': '01131', 'value': 16.02},
    {'GEOID': '01091', 'value': -54.56},
    {'GEOID': '01041', 'value': 57.05},
    {'GEOID': '01085', 'value': -44.73},
    {'GEOID': '01063', 'value': -16.74},
    {'GEOID': '01101', 'value': -14.82},
    {'GEOID': '01095', 'value': 3.35},
    {'GEOID': '01109', 'value': -11.49},
    {'GEOID': '01003', 'value': -57.97},
    {'GEOID': '01129', 'value': -38.97},
    {'GEOID': '01117', 'value': -21.34},
    {'GEOID': '01035', 'value': 2.43},
    {'GEOID': '01049', 'value': -25.35},
    {'GEOID': '01073', 'value': 15.81},
    {'GEOID': '01047', 'value': 43.23},
    {'GEOID': '01099', 'value': 45.62},
    {'GEOID': '01097', 'value': 12.21},
    {'GEOID': '01039', 'value': -21.67},
    {'GEOID': '01119', 'value': 0.15},
    {'GEOID': '01075', 'value': -16.85},
    {'GEOID': '01029', 'value': 18.99},
    {'GEOID': '01021', 'value': 28.95},
    {'GEOID': '01103', 'value': -52.05},
    {'GEOID': '01037', 'value': -3.55},
    {'GEOID': '01083', 'value': -36.22},
    {'GEOID': '01013', 'value': 12.85},
    {'GEOID': '01045', 'value': 44.93},
    {'GEOID': '01105', 'value': 38.47},
    {'GEOID': '01031', 'value': -31.9},
    {'GEOID': '01011', 'value': 10.02},
    {'GEOID': '01125', 'value': 55.04},
    {'GEOID': '01015', 'value': -5.31},
    {'GEOID': '01007', 'value': -25.12},
    {'GEOID': '01067', 'value': 9.45},
    {'GEOID': '01017', 'value': -51.97},
    {'GEOID': '01077', 'value': 27.22},
    {'GEOID': '01127', 'value': 26.35},
    {'GEOID': '01057', 'value': 44.94},
    {'GEOID': '01061', 'value': -22.18},
    {'GEOID': '01079', 'value': 44.87},
    {'GEOID': '01027', 'value': -14.94},
    {'GEOID': '01087', 'value': -54.41},
    {'GEOID': '01093', 'value': -35.95},
    {'GEOID': '01133', 'value': -51.93},
    {'GEOID': '01113', 'value': 7.08},
    {'GEOID': '01081', 'value': -24.97},
    {'GEOID': '01019', 'value': -8.82},
    {'GEOID': '01059', 'value': -38.0},
    {'GEOID': '01111', 'value': 17.56},
    {'GEOID': '01123', 'value': 8.96},
    {'GEOID': '01053', 'value': -59.64}]

if (typeof window !== `undefined`) {
  highchartsAccessibility(Highcharts);
}

if (typeof Highcharts === "object") {
  HighchartsMap(Highcharts);
}

interface RTCMapProps {
  raceType: RaceType;
  year: Year;
  stateName: string;
}

interface FakeData {
    "GEOID": string;
    "value": number;
}

const colorAxisStops: [number, string][] = [
  [0, "#B83C2B"], // Republican red
  [0.25, "#B83C2B"],
  [0.5, "#EAEAEA"],
  [0.75, "#595D9A"],
  [1, "#595D9A"], // Democrat blue
];



const StateMap: React.FC<RTCMapProps> = ({ raceType, year, stateName }) => {
  const [currMapData, setCurrMapData] = useState<JSON | null>(null);
    
    useEffect(() => {
      retrieveMapData();
    }, [raceType, year]);

    const retrieveMapData = async() => {
      const newMapData = await fetchStateGeoJSON(stateName, String(year))
      setCurrMapData(newMapData);
      console.log("Set map data in state");
      console.log(newMapData);
      initializeMap(newMapData);
    }


  function getMaxState(stateData: FakeData[]): number {
    return Math.max(...stateData.map((state) => state.value));
  }

  function getMinState(stateData: FakeData[]): number {
    return Math.min(...stateData.map((state) => state.value));
  }


  const initializeMap = (mapData: any) => {
    const axisMax: number = Math.max(
      Math.abs(getMinState(presData)),
      Math.abs(getMaxState(presData))
    );
    const colorAxis: Highcharts.ColorAxisOptions = {
      min: -axisMax,
      max: axisMax,
      stops: colorAxisStops,
      visible: false,
    };
    const mapOptions: Highcharts.Options = {
      chart: {
        type: "map",
        map: mapData,
        backgroundColor: "transparent",
      },
      credits: {
        enabled: false,
      },
      accessibility: {
        description: "State Map .",
      },
      title: {
        text: "",
      },
      plotOptions: {
        map: {
          cursor: "pointer",
        },
      },
      mapNavigation: {
        enabled: false,
        enableButtons: false,
      },
      colorAxis: colorAxis,
      tooltip: {
        formatter: function (this: any) {
          return (
            "<b>" +
            this.point.properties.NAME + " County" +
            "</b>"
          );
        },
        style: {
          fontFamily: "gelica, book antiqua, georgia, times new roman, serif",
        },
      },
      legend: {
        itemStyle: {
          fontFamily: "gelica, book antiqua, georgia, times new roman, serif",
        },
      },
      series: [
        {
          showInLegend: false,
          type: "map",
          mapData: mapData,
          data: presData,
          joinBy: 'GEOID',
          nullColor: "#FFFFFF",
          name: "Predicted Margin",
          borderColor: "black",
          events: {
            click: function(event: any) {
              const countyName = event.point.properties.NAME;
              alert(`You just clicked ${countyName}`);
            },
          },
          dataLabels: {
            // enabled: true,
            format: "{point.properties.NAME}",
            style: {
              fontFamily:
                "gelica, book antiqua, georgia, times new roman, serif",
            },
          },
        },
      ],
    };
    Highcharts.mapChart("container", mapOptions);
  };

  return <div id="container" />;
};

export default StateMap;
