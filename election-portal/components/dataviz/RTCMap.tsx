import React, { useEffect, useState } from "react";
import { RaceType } from "@/types/RaceType";
import { Year } from "@/types/Year";
import Highcharts from "highcharts";
import HighchartsMap from "highcharts/modules/map";
import highchartsAccessibility from "highcharts/modules/accessibility";

if (typeof window !== `undefined`) {
  highchartsAccessibility(Highcharts);
}

if (typeof Highcharts === "object") {
  HighchartsMap(Highcharts);
}

interface CountryMap {
  raceType: RaceType;
  year: Year;
  onStateClick: (hcKey: string) => void;
}

const colorAxisStops: [number, string][] = [
  [0, "#B83C2B"], // Republican red
  [0.38, "#B83C2B"],
  [0.47, "#EAEAEA"],
  [0.53, "#EAEAEA"],
  [0.62, "#595D9A"],
  [1, "#595D9A"], // Democrat blue
];

const CountryMap: React.FC<CountryMap> = (props: CountryMap) => {
  const [state, setState] = useState("");

  const fetchMapDataAndInitializeMap = async () => {
    const response = await fetch(
      "https://code.highcharts.com/mapdata/countries/us/us-all.geo.json"
    );
    let data = await response.json();
    initializeMap(data);
  };

  useEffect(() => {
    fetchMapDataAndInitializeMap();
  }, []);

  const initializeMap = (mapData: any) => {
    const mapOptions: Highcharts.Options = {
      chart: {
        type: "map",
        map: mapData,
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
      tooltip: {
        formatter: function (this: any) {
          let prefix = this.point.value >= 0 ? "D" : "R";
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
          type: "map",
          data: [],
          name: "Map of the US",
          states: {},
          dataLabels: {
            format: "{point.name}",
            style: {
              fontFamily:
                "gelica, book antiqua, georgia, times new roman, serif",
            },
          },
          events: {
            click: function (event: any) {
              props.onStateClick(event.point["hc-key"]);
            },
          },
        },
      ],
    };
    Highcharts.mapChart("container", mapOptions);
  };

  return <div id="container" />;
};

export default CountryMap;
