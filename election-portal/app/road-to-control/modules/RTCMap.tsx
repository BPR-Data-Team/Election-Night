import React, { useEffect, useState } from "react";
import { RaceType } from "@/types/RaceType";
import { Year } from "@/types/Year";
import Highcharts from "highcharts";
import HighchartsMap from "highcharts/modules/map";
import highchartsAccessibility from "highcharts/modules/accessibility";
import "./rtcmap.css";

const presData: FakeData[] = [
  {
    "hc-key": "us-al",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -9, // Changed to negative
  },
  {
    "hc-key": "us-ak",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 3,
  },
  {
    "hc-key": "us-az",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 11,
  },
  {
    "hc-key": "us-ar",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 6,
  },
  {
    "hc-key": "us-ca",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 55,
  },
  {
    "hc-key": "us-co",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -9, // Changed to negative
  },
  {
    "hc-key": "us-ct",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -7, // Changed to negative
  },
  {
    "hc-key": "us-de",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 3,
  },
  {
    "hc-key": "us-dc",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -3, // Changed to negative
  },
  {
    "hc-key": "us-fl",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -29, // Changed to negative
  },
  {
    "hc-key": "us-ga",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 16,
  },
  {
    "hc-key": "us-hi",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 4,
  },
  {
    "hc-key": "us-id",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -4, // Changed to negative
  },
  {
    "hc-key": "us-il",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -20, // Changed to negative
  },
  {
    "hc-key": "us-in",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -11, // Changed to negative
  },
  {
    "hc-key": "us-ia",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 6,
  },
  {
    "hc-key": "us-ks",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 6,
  },
  {
    "hc-key": "us-ky",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -8, // Changed to negative
  },
  {
    "hc-key": "us-la",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -8, // Changed to negative
  },
  {
    "hc-key": "us-me",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 4,
  },
  {
    "hc-key": "us-md",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -10, // Changed to negative
  },
  {
    "hc-key": "us-ma",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 11,
  },
  {
    "hc-key": "us-mi",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -16, // Changed to negative
  },
  {
    "hc-key": "us-mn",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -10, // Changed to negative
  },
  {
    "hc-key": "us-ms",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 6,
  },
  {
    "hc-key": "us-mo",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -10, // Changed to negative
  },
  {
    "hc-key": "us-mt",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 3,
  },
  {
    "hc-key": "us-ne",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -5, // Changed to negative
  },
  {
    "hc-key": "us-nv",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 6,
  },
  {
    "hc-key": "us-nh",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -4, // Changed to negative
  },
  {
    "hc-key": "us-nj",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 14,
  },
  {
    "hc-key": "us-nm",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -5, // Changed to negative
  },
  {
    "hc-key": "us-ny",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 29,
  },
  {
    "hc-key": "us-nc",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -15, // Changed to negative
  },
  {
    "hc-key": "us-nd",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -3, // Changed to negative
  },
  {
    "hc-key": "us-oh",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 18,
  },
  {
    "hc-key": "us-ok",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 7,
  },
  {
    "hc-key": "us-or",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "FALSE",
    value: 7,
  },
  {
    "hc-key": "us-pa",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "FALSE",
    value: 20,
  },
  {
    "hc-key": "us-ri",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -4, // Changed to negative
  },
  {
    "hc-key": "us-sc",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 9,
  },
  {
    "hc-key": "us-sd",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -3, // Changed to negative
  },
  {
    "hc-key": "us-tn",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 11,
  },
  {
    "hc-key": "us-tx",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 38,
  },
  {
    "hc-key": "us-ut",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -6, // Changed to negative
  },
  {
    "hc-key": "us-vt",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -3, // Changed to negative
  },
  {
    "hc-key": "us-va",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 13,
  },
  {
    "hc-key": "us-wa",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "FALSE",
    value: 12,
  },
  {
    "hc-key": "us-wv",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "FALSE",
    value: 5,
  },
  {
    "hc-key": "us-wi",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "FALSE",
    value: 10,
  },
  {
    "hc-key": "us-wy",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "FALSE",
    value: 3,
  },
];

const senData = [
  {
    "hc-key": "us-az",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 11,
  },
  {
    "hc-key": "us-ca",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 55,
  },
  {
    "hc-key": "us-ct",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -7, // Changed to negative
  },
  {
    "hc-key": "us-de",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 3,
  },
  {
    "hc-key": "us-fl",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -29, // Changed to negative
  },
  {
    "hc-key": "us-hi",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 4,
  },
  {
    "hc-key": "us-in",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -11, // Changed to negative
  },
  {
    "hc-key": "us-me",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 4,
  },
  {
    "hc-key": "us-md",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -10, // Changed to negative
  },
  {
    "hc-key": "us-ma",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 11,
  },
  {
    "hc-key": "us-mi",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -16, // Changed to negative
  },
  {
    "hc-key": "us-mn",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -10, // Changed to negative
  },
  {
    "hc-key": "us-ms",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 6,
  },
  {
    "hc-key": "us-mo",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -10, // Changed to negative
  },
  {
    "hc-key": "us-mt",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 3,
  },
  {
    "hc-key": "us-ne",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -5, // Changed to negative
  },
  {
    "hc-key": "us-nv",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 6,
  },
  {
    "hc-key": "us-nj",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 14,
  },
  {
    "hc-key": "us-nm",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -5, // Changed to negative
  },
  {
    "hc-key": "us-ny",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 29,
  },
  {
    "hc-key": "us-nd",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -3, // Changed to negative
  },
  {
    "hc-key": "us-oh",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 18,
  },
  {
    "hc-key": "us-pa",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "FALSE",
    value: 20,
  },
  {
    "hc-key": "us-ri",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -4, // Changed to negative
  },
  {
    "hc-key": "us-tn",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 11,
  },
  {
    "hc-key": "us-tx",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 38,
  },
  {
    "hc-key": "us-ut",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -6, // Changed to negative
  },
  {
    "hc-key": "us-vt",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "TRUE",
    value: -3, // Changed to negative
  },
  {
    "hc-key": "us-va",
    "Office Type": "President",
    "Called for Dems": "TRUE",
    "Called for Reps": "FALSE",
    value: 13,
  },
  {
    "hc-key": "us-wa",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "FALSE",
    value: 12,
  },
  {
    "hc-key": "us-wv",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "FALSE",
    value: 5,
  },
  {
    "hc-key": "us-wi",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "FALSE",
    value: 10,
  },
  {
    "hc-key": "us-wy",
    "Office Type": "President",
    "Called for Dems": "FALSE",
    "Called for Reps": "FALSE",
    value: 3,
  },
];

if (typeof window !== `undefined`) {
  highchartsAccessibility(Highcharts);
}

if (typeof Highcharts === "object") {
  HighchartsMap(Highcharts);
}

interface RTCMapProps {
  raceType: RaceType;
  year: Year;
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

const RTCMap: React.FC<RTCMapProps> = ({ raceType, year }) => {
  const fetchMapDataAndInitializeMap = async () => {
    const geoResponse = await fetch(
      "https://code.highcharts.com/mapdata/countries/us/us-all.geo.json"
    );
    let geoData = await geoResponse.json();

    initializeMap(geoData);
  };

  useEffect(() => {
    fetchMapDataAndInitializeMap();
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
          data: raceType == RaceType.Presidential ? presData : senData,
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

export default RTCMap;
