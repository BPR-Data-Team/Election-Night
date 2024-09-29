"use client";
import { useState } from "react";
import { RaceType } from "@/types/RaceType";
import RTCMap from "./modules/RTCMap";
import { Year } from "@/types/Year";
import StatusBar from "./modules/StatusBar";
import styles from "./page.module.css";
import Rightbar from "@/components/rightbar";
import { useRouter } from "next/navigation";

export default function Road_To_Control_Page() {
  const [raceType, setRaceType] = useState<RaceType>(RaceType.Presidential);
  const [year, setYear] = useState<Year>(Year.TwentyTwo);
  const [showRightbar, setShowRightbar] = useState<boolean>(true);
  const [drawMode, setDrawMode] = useState<boolean>(true);
  const router = useRouter();

  const availibleYears = [
    Year.Sixteen,
    Year.Eighteen,
    Year.Twenty,
    Year.TwentyTwo,
    Year.TwentyFour,
  ];

  const availibleBreakdowns = [RaceType.Presidential, RaceType.Senate];

  const toggleRightbar = () => {
    setShowRightbar(!showRightbar);
  };

  const toggleYear = (year: Year) => {
    setYear(year);
    console.log("switched to year", year);
  };

  const toggleDrawMode = () => {
    setDrawMode(!drawMode);
    console.log("now in draw mode");
  };

  const switchBreakdown = (raceType: RaceType) => {
    setRaceType(raceType);
    console.log("switched to type", raceType);
  };

  const nav = () => {
    router.push("/");
  };

  return (
    <div className={styles.page}>
      <Rightbar
        availableBreakdowns={availibleBreakdowns}
        availableYears={availibleYears}
        breakdownSwitch={switchBreakdown}
        pageSwitch={nav}
        exit={() => {}}
        isDrawing={drawMode}
        toggleDraw={toggleDrawMode}
        yearSwitch={toggleYear}
        isVisible={showRightbar}
        toggleVisibility={toggleRightbar}
      />
      <div className={styles.main}>
        <div className={styles.statusBar}>
          <StatusBar /> {/* This should render the StatusBar */}
        </div>
        <div className={styles.rtcdiv}>
          <RTCMap year={year} raceType={raceType} />
        </div>
      </div>
    </div>
  );
}
