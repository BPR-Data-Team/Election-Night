"use client";
import { useState } from "react";
import { RaceType } from "@/types/RaceType";
import RTCMap from "./modules/RTCMap";
import { Year } from "@/types/Year";
import StatusBar from "./modules/StatusBar";
import styles from "./page.module.css";
import Rightbar from "@/components/rightbar";
import { useRouter } from "next/navigation";
import Menubar from "../modules/menubar/menubar";
import { useSharedState } from "../sharedContext";
import Canvas from "../modules/canvas/canvas";

export default function Road_To_Control_Page() {
  const state = useSharedState().state;
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
