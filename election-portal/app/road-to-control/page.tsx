"use client";
import { useEffect } from "react";
import RTCMap from "./modules/RTCMap";
import StatusBar from "./modules/StatusBar";
import styles from "./page.module.css";
import Menubar from "../modules/menubar/menubar";
import { useSharedState } from "../sharedContext";
import Canvas from "../modules/canvas/canvas";
import { RaceType } from "@/types/RaceType";
import { Year } from "@/types/Year";

export default function Road_To_Control_Page() {
  const sharedState = useSharedState().state;

  useEffect(() => {
    // set menubar options
    sharedState.setAvailableBreakdowns([
      RaceType.Presidential,
      RaceType.Senate,
      RaceType.Gubernatorial,
    ]);
    sharedState.setAvailableYears([
      Year.TwentyTwo,
      Year.Twenty,
      Year.Eighteen,
      Year.Sixteen,
    ]);
    sharedState.setAvailibleDemographics([]);
  }, []);
  return (
      <div className={styles.page}>
        <div className={styles.overflowCatch}>
          {sharedState.drawMode ? <Canvas /> : null}
          <div className={styles.statusBar}>
            <StatusBar />
          </div>
          <div className={styles.mapWrapper} id="mapWrapper">
            <div
              className={styles.StateMapContainer}
            >
              <RTCMap year={sharedState.year} raceType={sharedState.breakdown}/>
            </div>
          </div>
          <Menubar />
        </div>
      </div>
  );
}
