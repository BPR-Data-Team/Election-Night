import React, { useEffect } from "react";
import { RaceType } from "@/types/RaceType";
import { Year } from "@/types/Year";
import Highcharts from "highcharts";
import HighchartsMap from "highcharts/modules/map";
import highchartsAccessibility from "highcharts/modules/accessibility";
import styles from "./exit-poll-map.module.css";

const presData = [
  { "hc-key": "us-al", Called: "R" },
  { "hc-key": "us-ak", Called: "D" },
  { "hc-key": "us-az", Called: "D" },
  { "hc-key": "us-ar", Called: "D" },
  { "hc-key": "us-ca", Called: "D" },
  { "hc-key": "us-co", Called: "R" },
  { "hc-key": "us-ct", Called: "R" },
  { "hc-key": "us-de", Called: "D" },
  { "hc-key": "us-dc", Called: "R" },
  { "hc-key": "us-fl", Called: "R" },
  { "hc-key": "us-ga", Called: "D" },
  { "hc-key": "us-hi", Called: "D" },
  { "hc-key": "us-id", Called: "R" },
  { "hc-key": "us-il", Called: "R" },
  { "hc-key": "us-in", Called: "R" },
  { "hc-key": "us-ia", Called: "D" },
  { "hc-key": "us-ks", Called: "D" },
  { "hc-key": "us-ky", Called: "R" },
  { "hc-key": "us-la", Called: "R" },
  { "hc-key": "us-me", Called: "D" },
  { "hc-key": "us-md", Called: "R" },
  { "hc-key": "us-ma", Called: "D" },
  { "hc-key": "us-mi", Called: "R" },
  { "hc-key": "us-mn", Called: "R" },
  { "hc-key": "us-ms", Called: "D" },
  { "hc-key": "us-mo", Called: "R" },
  { "hc-key": "us-mt", Called: "D" },
  { "hc-key": "us-ne", Called: "R" },
  { "hc-key": "us-nv", Called: "D" },
  { "hc-key": "us-nh", Called: "R" },
  { "hc-key": "us-nj", Called: "D" },
  { "hc-key": "us-nm", Called: "R" },
  { "hc-key": "us-ny", Called: "D" },
  { "hc-key": "us-nc", Called: "R" },
  { "hc-key": "us-nd", Called: "R" },
  { "hc-key": "us-oh", Called: "D" },
  { "hc-key": "us-ok", Called: "D" },
  { "hc-key": "us-or", Called: "N" },
  { "hc-key": "us-pa", Called: "N" },
  { "hc-key": "us-ri", Called: "R" },
  { "hc-key": "us-sc", Called: "D" },
  { "hc-key": "us-sd", Called: "R" },
  { "hc-key": "us-tn", Called: "D" },
  { "hc-key": "us-tx", Called: "D" },
  { "hc-key": "us-ut", Called: "R" },
  { "hc-key": "us-vt", Called: "R" },
  { "hc-key": "us-va", Called: "D" },
  { "hc-key": "us-wa", Called: "N" },
  { "hc-key": "us-wv", Called: "N" },
  { "hc-key": "us-wi", Called: "N" },
  { "hc-key": "us-wy", Called: "N" },
];

const senData = [
  { "hc-key": "us-az", Called: "D" },
  { "hc-key": "us-ca", Called: "D" },
  { "hc-key": "us-ct", Called: "R" },
  { "hc-key": "us-de", Called: "D" },
  { "hc-key": "us-fl", Called: "R" },
  { "hc-key": "us-hi", Called: "D" },
  { "hc-key": "us-in", Called: "R" },
  { "hc-key": "us-me", Called: "D" },
  { "hc-key": "us-md", Called: "R" },
  { "hc-key": "us-ma", Called: "D" },
  { "hc-key": "us-mi", Called: "R" },
  { "hc-key": "us-mn", Called: "R" },
  { "hc-key": "us-ms", Called: "D" },
  { "hc-key": "us-mo", Called: "R" },
  { "hc-key": "us-mt", Called: "D" },
  { "hc-key": "us-ne", Called: "R" },
  { "hc-key": "us-nv", Called: "D" },
  { "hc-key": "us-nj", Called: "D" },
  { "hc-key": "us-nm", Called: "R" },
  { "hc-key": "us-ny", Called: "D" },
  { "hc-key": "us-nd", Called: "R" },
  { "hc-key": "us-oh", Called: "D" },
  { "hc-key": "us-pa", Called: "N" },
  { "hc-key": "us-ri", Called: "R" },
  { "hc-key": "us-tn", Called: "D" },
  { "hc-key": "us-tx", Called: "D" },
  { "hc-key": "us-ut", Called: "R" },
  { "hc-key": "us-vt", Called: "R" },
  { "hc-key": "us-va", Called: "D" },
  { "hc-key": "us-wa", Called: "N" },
  { "hc-key": "us-wv", Called: "N" },
  { "hc-key": "us-wi", Called: "N" },
  { "hc-key": "us-wy", Called: "N" },
];

if (typeof window !== `undefined`) {
  highchartsAccessibility(Highcharts);
}

if (typeof Highcharts === "object") {
  HighchartsMap(Highcharts);
}

interface ExitPollMapProps {
  raceType: RaceType;
  year: Year;
}

const ExitPollMap: React.FC<ExitPollMapProps> = ({ raceType, year }) => {
  const fetchMapDataAndInitializeMap = async () => {
    const geoResponse = await fetch(
      "https://code.highcharts.com/mapdata/countries/us/us-all.geo.json"
    );
    let mapData = await geoResponse.json();

    initializeMap(mapData);
  };

  useEffect(() => {
    fetchMapDataAndInitializeMap();
  }, [raceType]);

  const initializeMap = (mapData: any) => {
    const processData = (data: any[]) => {
      return data.map((item) => {
        let value: number;
        if (item.Called === "D") {
          value = 1; // Democrat
        } else if (item.Called === "R") {
          value = 2; // Republican
        } else {
          value = 0; // Uncalled
        }
        return {
          "hc-key": item["hc-key"],
          value: value,
        };
      });
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
          cursor: "default",
        },
      },
      mapNavigation: {
        enabled: false,
        enableButtons: false,
      },
      colorAxis: {
        dataClasses: [
          {
            from: 0,
            to: 0,
            color: "#505050",
            name: "Uncalled",
          },
          {
            from: 1,
            to: 1,
            color: "#595D9A", // Democrat blue
            name: "Democrat",
          },
          {
            from: 2,
            to: 2,
            color: "#B83C2B", // Republican red
            name: "Republican",
          },
        ],
        dataClassColor: "category",
      },
      legend: {
        itemStyle: {
          fontFamily: "gelica, book antiqua, georgia, times new roman, serif",
        },
        enabled: false,
      },
      series: [
        {
          showInLegend: false,
          type: "map",
          data: processData(
            raceType === RaceType.Presidential ? presData : senData
          ),
          mapData: mapData,
          joinBy: "hc-key",
          nullColor: "#EAEAEA",
          name: "Call Status",
          states: {},
          dataLabels: {
            enabled: false,
          },
          enableMouseTracking: false,
        },
      ],
    };
    Highcharts.mapChart("container", mapOptions);
  };

  return <div id="container" />;
};

export default ExitPollMap;
