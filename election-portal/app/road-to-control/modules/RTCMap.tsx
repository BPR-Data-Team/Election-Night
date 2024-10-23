import React, { useState, useEffect, useRef } from "react";
import { RaceType } from "@/types/RaceType";
import { Year } from "@/types/Year";
import Highcharts from "highcharts";
import HighchartsMap from "highcharts/modules/map";
import highchartsAccessibility from "highcharts/modules/accessibility";
import "./rtcmap.css";
import { stateCodeToName } from "./utils/stateMap"; // Adjust the path if needed


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

interface RTCMapProps {
  raceType: RaceType;
  year: Year;
}

const RTCMap: React.FC<RTCMapProps> = ({ raceType, year }) => {
  const [modalOpen, setModalOpen] = useState(false); // Modal visibility state
  const [selectedState, setSelectedState] = useState<string | null>(null); // Store clicked state
  const chartRef = useRef<Highcharts.Chart | null>(null);
  const originalMap = useRef<any[]>([]);
  const fetchMapDataAndInitializeMap = async () => {
    const geoResponse = await fetch(
      "https://code.highcharts.com/mapdata/countries/us/us-all.geo.json"
    );
    let mapData = await geoResponse.json();

    initializeMap(mapData);
  };

  useEffect(() => {
    fetchMapDataAndInitializeMap();
  }, [raceType, year]);

  const initializeMap = (mapData: any) => {
    const currentData = raceType === RaceType.Presidential ? [...presData] : [...senData];
    originalMap.current = currentData.map((item) => ({...item}));
    const processData = (data: any[]) =>
      data.map((item) => ({
        "hc-key": item["hc-key"],
        value: item.Called === "D" ? 1 : item.Called === "R" ? 2 : 0,
      }));

    const handleStateClick = function (this: any) {
      const stateKey = this["hc-key"] as string;
      setSelectedState(stateKey); // Store clicked state
      setModalOpen(true); // Open modal for selection
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
          point: {
            events: {
              click: handleStateClick
            }
          }
        },
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
        enabled: false,
      },
      mapNavigation: {
        enabled: true,
        enableMouseWheelZoom: true,
        enableButtons: false,
      },
      tooltip: {
        formatter: function (this: any) {

          return (
            "<b>" +
            this.point.name )
        },
        style: {
          fontFamily: "gelica, book antiqua, georgia, times new roman, serif",
        },
      },
      series: [
        {
          type: "map",
          data: processData(currentData),
          mapData: mapData,
          joinBy: "hc-key",
          nullColor: "#EAEAEA",
          borderColor: "black",
          borderWidth: 2,
          name: "Call Status",
          enableMouseTracking: true,  
          states: {
            hover: {
              enabled: false,
            },
          },
          // tooltip: {
          //   pointFormat: "{point.name}",
          // },
        },
      ],
      
    };
    const chart = Highcharts.mapChart("container", mapOptions);
    
    chartRef.current = chart;
  };

  const handleOutcomeSelect = (outcome: string) => {
    console.log(`Selected state: ${selectedState}`);
    if (selectedState && chartRef.current) {
      const series = chartRef.current.series[0]; // Access the first series
      const point = series.data.find(
        (p) => (p.options as any)["hc-key"] === selectedState
      );
      if (point) {
        console.log("point is not undefined. Yay!")
        point.update({ value: outcome === "D" ? 1 : outcome === "R" ? 2 : 0 });
      }
    }
    setModalOpen(false);
  };

  const handleReset = () => {
    if (chartRef.current) {
      const originalData = originalMap.current;
      if (originalData) {
        const processedData = originalData.map((item: any) => ({
          id: item["hc-key"],
          "hc-key": item["hc-key"],
          value: item.Called === "D" ? 1 : item.Called === "R" ? 2 : 0,
        }));

        // Reset the series data
        chartRef.current.series[0].setData(processedData);
      }
    }
  };

  return (
    <>
      <div id="container" />
        <div className="reset-button-container">
          <button onClick={handleReset} className="reset-button">
            Reset Map
          </button>
        </div>
      {modalOpen && selectedState && (
        <OutcomeModal
          stateName={selectedState}
          onClose={() => setModalOpen(false)}
          onSelect={handleOutcomeSelect}
        />
      )}
    </>
  );
};
const OutcomeModal = ({
  stateName,
  onClose,
  onSelect,
}: {
  stateName: string;
  onClose: () => void;
  onSelect: (outcome: string) => void;
}) => {
  const fullStateName = stateCodeToName.get(stateName) || stateName;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation(); // Ensure the click doesn't bubble up
    onClose(); // Close the modal when clicking outside the content
  };

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation(); // Prevent click inside content from closing the modal
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={handleContentClick}>
        <h3>Select Outcome for {fullStateName}</h3>
        <button onClick={() => onSelect("D")} className="modal-button">Democrat</button>
        <button onClick={() => onSelect("R")} className="modal-button">Republican</button>
        <button onClick={() => onSelect("N")} className="modal-button">Uncalled</button>
        <button onClick={onClose} className="modal-button">Cancel</button>
      </div>
    </div>
  );
};


export default RTCMap;
