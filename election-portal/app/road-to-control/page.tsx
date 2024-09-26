"use client";
import { useState, useEffect } from "react";
import { RaceType } from "@/types/RaceType";
import CountryMap from "@/components/dataviz/RTCMap";
import { Year } from "@/types/Year";
import StatusBar from "./modules/StatusBar";
 import styles from "./page.module.css";
import { State, getStateFromAbbreviation } from "@/types/State";

export default function Road_To_Control_Page() {
  const [raceType, setRaceType] = useState<RaceType>(RaceType.Presidential);
  const [year, setYear] = useState<Year>(Year.TwentyTwo);
  const [state, setState] = useState<State>();

  const handleStateClick = (hcKey: string) => {
    const stateAbbrev = hcKey.replace("us-", "").toUpperCase();
    const state = getStateFromAbbreviation(stateAbbrev);
    setState(state);
  };

  return (
    <>
      <div className={styles.statusBar}>
      <StatusBar />  {/* This should render the StatusBar */}
      </div>
      <button onClick={() => setRaceType(RaceType.Presidential)}>Pres</button>
      <button onClick={() => setRaceType(RaceType.Senate)}>Sen</button>
      <button onClick={() => setRaceType(RaceType.House)}>Hse</button>
      <button onClick={() => setRaceType(RaceType.Gubernatorial)}>Gub</button>
      <button onClick={() => setYear(Year.Sixteen)}>2016</button>
      <button onClick={() => setYear(Year.Eighteen)}>2018</button>
      <button onClick={() => setYear(Year.Twenty)}>2020</button>
      <button onClick={() => setYear(Year.TwentyTwo)}>2022</button>
      <CountryMap
        year={year}
        raceType={raceType}
        onStateClick={handleStateClick}
      />
    </>
  );
}
