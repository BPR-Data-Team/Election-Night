import React, { useState, useEffect, useRef } from "react";
import { RaceType } from "@/types/RaceType";
import { Year } from "@/types/Year";
import Highcharts, { color } from "highcharts";
import HighchartsMap from "highcharts/modules/map";
import highchartsAccessibility from "highcharts/modules/accessibility";
import "./rtcmap.css";
import Circle from "./ElectoralVoteButton";
import StatusBar from "./StatusBar";
import electoralVotesPerState from "./utils/electoralVotesPerState";
import { parse } from "papaparse";
import { RTCPresData } from "@/types/data";


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
const mockData = presData.map((item) => ({ ...item, Called: "N" }));

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

const colorMapping = { 0: "N", 1: "D", 2: "R" };

if (typeof window !== "undefined") {
  highchartsAccessibility(Highcharts);
}
if (typeof Highcharts === "object") {
  HighchartsMap(Highcharts);
}

interface RTCMapProps {
  raceType: RaceType;
  year: Year;
}

const RTCMap: React.FC<RTCMapProps> = ({ raceType, year }) => {
  const chartRef = useRef<Highcharts.Chart | null>(null);
  const originalMap = useRef<any[]>([]);
  const originalElectoralCounts= useRef<any[]>([]);
  const [mapData, setMapData] = useState(mockData); // Default to presData
  const [circleValues, setCircleValues] = useState({ NE2: 0, ME2: 0 });
  const [leftCount, setLeftCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);
  const [sixteenPresData, setSixteenPresData] = useState<RTCPresData[] | null>(null);
  const [twentyPresData, setTwentyPresData] = useState<RTCPresData[] | null>(null);

  const fetchMapDataAndInitializeMap = async () => {
    const geoResponse = await fetch(
      "https://code.highcharts.com/mapdata/countries/us/us-all.geo.json"
    );
    const geoJson = await geoResponse.json();
    initializeMap(geoJson);
  };

  useEffect(() => {
    //
    const storedSixteenPresData = sessionStorage.getItem("sixteenPresData");

    if (storedSixteenPresData) {
      setSixteenPresData(JSON.parse(storedSixteenPresData) as RTCPresData[]);
    } else {
      // Fetch the CSV data and log the response
      fetch("/R2C/2016Presidential.csv")
        .then((response) => {
          return response.text();
        })
        .then((csvText) => {
          parse(csvText, {
            header: true,
            complete: (results) => {
              const parsedData: RTCPresData[] = results.data.map(
                (row: any, index: number) => {
                  return {
                    year: parseInt(row.year),
                    state: row.state,
                    office_type: row.office_type,
                    party_winner: row.party_winner,
                    electoral_votes: parseInt(row.electoral_votes),
                  };
                }
              );
              setSixteenPresData(parsedData);
              sessionStorage.setItem(
                "sixteenPresData",
                JSON.stringify(parsedData)
              );
            },
          });
        })
        .catch((error) =>
          console.error("Error loading exit poll data:", error)
        );
    }
  }, []);

  useEffect(() => {
    fetchMapDataAndInitializeMap();
  }, [raceType, year]);

  const initializeMap = (geoJson: any) => {
    //TODO: Change mockData
    const formattedPresData = sixteenPresData?.map((item) => ({
      "hc-key": item.state,
      Called: item.party_winner === "D" ? "D" : item.party_winner === "R" ? "R" : "N",
    }));
    const currentData = (raceType === RaceType.Presidential && year === Year.Sixteen) ? [...formattedPresData] : [...mockData];
    originalMap.current = currentData.map((item) => ({ ...item })); // Store original state

    const processedData = currentData.map((item) => ({
      "hc-key": item["hc-key"],
      value: item.Called === "D" ? 1 : item.Called === "R" ? 2 : 0,
    }));


    const handleStateClick = function (this: any) {
      const point = this;
      const newValue = (point.value + 1) % 3; // Cycle between 0 (N), 1 (D), and 2 (R)
      point.update({ value: newValue });
      updateMapData(point["hc-key"], newValue, point.value);
    };

    const mapOptions: Highcharts.Options = {
      chart: { type: "map", map: geoJson, backgroundColor: "transparent" },
      title: { text: "" },
      credits: { enabled: false },
      plotOptions: {
        map: {
          cursor: "pointer",
          point: {
            events: { click: handleStateClick },
          },
        },
      },
      tooltip: {
        formatter: function (this: any) {
          return (
            "<b>" +
            this.point.name)
        },
        style: {
          fontFamily: "gelica, book antiqua, georgia, times new roman, serif",
        },
      },
      colorAxis: {
        dataClasses: [
          { from: 0, to: 0, color: "#505050", name: "Uncalled" },
          { from: 1, to: 1, color: "#595D9A", name: "Democrat" },
          { from: 2, to: 2, color: "#B83C2B", name: "Republican" },
        ],
      },
      series: [
        {
          type: "map",
          data: processedData,
          mapData: geoJson,
          joinBy: "hc-key",
          nullColor: "#EAEAEA",
          borderColor: "black",
          borderWidth: 2,
          states: {
            hover: {
              borderColor: "grey",
            }
          },
        },
      ],
    };

    const chart = Highcharts.mapChart("container", mapOptions);
    chartRef.current = chart;
    initializeElectoralVotes(currentData);
  };

  const updateMapData = (key: string, value: number, oldValue : number) => {
    setMapData((prev) =>
      prev.map((item) =>
        item["hc-key"] === key ? { ...item, Called: (colorMapping as any)[value] } : item
      )
    );
    updateElectoralCounts(key, value, oldValue);
  };

  const updateElectoralCounts = (key: string, value: number, oldValue : number) => {
    const electoralVotes = key in electoralVotesPerState ? electoralVotesPerState[key] : 0;
    if (value === 1) {
      setLeftCount((prev) => prev + electoralVotes);
    } else if (value === 2) {
      setRightCount((prev) => prev + (electoralVotes));
      setLeftCount((prev) => prev - electoralVotes);
    } else {
      setRightCount((prev) => prev - electoralVotes);
      
    }
  };

  const initializeElectoralVotes = (data: any[]) => {
    let leftVotes = 0;
    let rightVotes = 0;
    data.forEach((item) => {
      if (item.Called === "D") {
        item["hc-key"] in electoralVotesPerState && (leftVotes += electoralVotesPerState[item["hc-key"]]);
      } else if (item.Called === "R") {
        item["hc-key"] in electoralVotesPerState && (rightVotes += electoralVotesPerState[item["hc-key"]]);
      }
    });
    setLeftCount(leftVotes);
    setRightCount(rightVotes);
  };
  const handleReset = () => {
      if (chartRef.current) {
        const originalData = originalMap.current;
        if (originalData) {
          const original = originalData.map((item: any) => ({
            id: item["hc-key"],
            "hc-key": item["hc-key"],
            value: item.Called === "D" ? 1 : item.Called === "R" ? 2 : 0,
          }));
  
          // Reset the series data
          chartRef.current.series[0].setData(original);
          setCircleValues({NE2: 0, ME2: 0});
          initializeElectoralVotes(originalData);
        }
      }
    };

  const handleWebSocketData = (newData: any[]) => {
    newData.forEach((item) => {
      const point = chartRef.current?.series[0].data.find(
        (p) => (p as any)["hc-key"] === item["hc-key"]
      );
      point?.update({ value: item.Called === "D" ? 1 : item.Called === "R" ? 2 : 0 });
    });
    setMapData(newData);
    initializeElectoralVotes(newData);
  };

  useEffect(() => {
    // Placeholder WebSocket logic (replace with real WebSocket implementation)
    const ws = new WebSocket("wss://example.com/socket");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketData(data);
    };
    return () => ws.close();
  }, []);

  const incrementLeftCount = () => setLeftCount((prev) => prev + 1);
  const incrementRightCount = () => setRightCount((prev) => prev + 1);
  const decrementLeftCount = () => setLeftCount((prev) => prev - 1);
  const decrementRightCount = () => setRightCount((prev) => prev - 1);

  return (
    <div className="map-container">
      <StatusBar leftCount={leftCount} rightCount={rightCount} />
      <div className="map-and-controls">
        <div id="container" className="map" />
        <div className="controls">
          <div className="circles">
          <Circle
              text="NE2"
              circleValue={circleValues.NE2}
              setCircleValue={(value) =>
                setCircleValues((prev) => ({
                  ...prev,
                  NE2: typeof value === "function" ? value(prev.NE2) : value,
                }))
              }
              incrementLeftCount={incrementLeftCount}
              incrementRightCount={incrementRightCount}
              decrementLeftCount={decrementLeftCount}
              decrementRightCount={decrementRightCount}
            />
            <Circle
              text="ME2"
              circleValue={circleValues.ME2}
              setCircleValue={(value) =>
                setCircleValues((prev) => ({
                  ...prev,
                  ME2: typeof value === "function" ? value(prev.ME2) : value,
                }))
              }
              incrementLeftCount={incrementLeftCount}
              incrementRightCount={incrementRightCount}
              decrementLeftCount={decrementLeftCount}
              decrementRightCount={decrementRightCount}
            />
          </div>
          <button className="reset-button" onClick={handleReset}>Reset Map</button>
        </div>
      </div>
    </div>
  );
};

export default RTCMap;