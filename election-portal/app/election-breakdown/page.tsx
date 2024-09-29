"use client";
import React, { useState } from "react";

import Head from "next/head";
import Image from "next/image";

import styles from "./page.module.css";
import Banner from "./modules/banner";
import Canvas from "./modules/canvas";
import { redirect } from "next/navigation";
import { Year } from "@/types/Year";
import { RaceType } from "@/types/RaceType";
import Rightbar from "@/components/rightbar";
import { useRouter } from "next/navigation";

export default function Election_Breakdown_Page() {
  const [isBannerVisible, setIsBannerVisible] = useState<boolean>(true);
  const [raceType, setRaceType] = useState<RaceType>(RaceType.Presidential);
  const [year, setYear] = useState<Year>(Year.TwentyTwo);
  const [showRightbar, setShowRightbar] = useState<boolean>(true);
  const [drawMode, setDrawMode] = useState<boolean>(true);
  const router = useRouter();

  const availableYears = [
    Year.Sixteen,
    Year.Eighteen,
    Year.Twenty,
    Year.TwentyTwo,
    Year.TwentyFour,
  ];

  const availibleBreakdowns = [
    RaceType.Presidential,
    RaceType.Senate,
    RaceType.House,
    RaceType.Gubernatorial,
  ];

  const toggleBanner = () => {
    setIsBannerVisible(!isBannerVisible);
  };

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
    <>
      <div className={styles.page}>
        <div className="overflow-catch">
          {/* Left title banner */}
          <Banner
            align="left"
            height={6}
            wordmark="24cast.org"
            header=""
            message="This is a top banner!"
            isVisible={isBannerVisible}
            toggleVisibility={toggleBanner}
          />

          {drawMode && <Canvas />}

          {/* Needs to be topmost during content screens */}
          <Rightbar
            pageSwitch={nav}
            exit={toggleBanner}
            toggleDraw={toggleDrawMode}
            availableBreakdowns={availibleBreakdowns}
            breakdownSwitch={switchBreakdown}
            availableYears={availableYears}
            yearSwitch={toggleYear}
            isVisible={showRightbar}
            toggleVisibility={toggleRightbar}
            isDrawing={drawMode}
          />

          {/* Future homepage topmost element */}
        </div>
      </div>
    </>
  );
}
