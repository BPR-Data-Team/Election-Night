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
  const state = useSharedState().state;

  useEffect(() => {
    // set menubar options
    state.setAvailableBreakdowns([
      RaceType.Presidential,
      RaceType.Senate,
      RaceType.Gubernatorial,
    ]);
    state.setAvailableYears([
      Year.TwentyTwo,
      Year.Twenty,
      Year.Eighteen,
      Year.Sixteen,
    ]);
    state.setAvailibleDemographics([]);
  }, []);
  return (
    <div className={styles.page}>
      <Menubar />
      <div className={styles.main}>
        <div className={styles.statusBar}>
          <StatusBar /> {/* This should render the StatusBar */}
        </div>
        {state.drawMode ? <Canvas /> : null}
        <div className={styles.rtcdiv}>
          <RTCMap year={state.year} raceType={state.breakdown} />
        </div>
      </div>
    </div>
  );
}
