import React, { useEffect, useState } from "react";
import { RaceType } from "@/types/RaceType";
import { Year } from "@/types/Year";
import Highcharts from "highcharts";
import HighchartsMap from "highcharts/modules/map";
import highchartsAccessibility from "highcharts/modules/accessibility";
import "./EBMap.css";

const presData: FakeData[] = [
]

if (typeof window !== `undefined`) {
  highchartsAccessibility(Highcharts);
}

if (typeof Highcharts === "object") {
  HighchartsMap(Highcharts);
}

interface RTCMapProps {
  raceType: RaceType;
  year: Year;
  stateData: JSON | null;
}

interface FakeData {
  "hc-key": string;
  "Office Type": string;
  "Called for Dems": string;
  "Called for Reps": string;
  value: number;
}

const colorAxisStops: [number, string][] = [
  [0, "#B83C2B"], // Republican red
  [0.38, "#B83C2B"],
  [0.47, "#EAEAEA"],
  [0.53, "#EAEAEA"],
  [0.62, "#595D9A"],
  [1, "#595D9A"], // Democrat blue
];

const StateMap: React.FC<RTCMapProps> = ({ raceType, year, stateData }) => {
    
    useEffect(() => {
    initializeMap(stateData);
    }, [raceType]);


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
        description: "Map of the United States.",
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
          let prefix = this.point["Called for Dems"] == "TRUE" ? "D" : "R";
          return (
            "<b>" +
            this.point.name +
            "</b><br/>" +
            prefix +
            "+" +
            (Math.abs(this.point.value) <= 0.1
              ? "<0.1"
              : Math.abs(this.point.value).toFixed(1))
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
          data: raceType == RaceType.Presidential ? presData : presData,
          nullColor: "#505050",
          name: "Predicted Margin",
          states: {},
          dataLabels: {
            format: "{point.name}",
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
