"use client";
import React, { useState, useEffect } from "react";
import { useSharedState } from "../sharedContext";
import { State, getStateFromString } from "../../types/State";

import Head from "next/head";
import Image from "next/image";

import styles from "./page.module.css";

import Menubar from "../modules/menubar/menubar";
import Banner from "./modules/banner";
import Canvas from "../modules/canvas/canvas";

import EBMap from "./modules/EBMap";
import StateMap from "./modules/stateMap";

import { fetchStateGeoJSON } from "./modules/mapDataCache";

export default function Election_Breakdown_Page() {
  const [isBannerVisible, setIsBannerVisible] = useState<boolean>(true);
  const sharedState = useSharedState().state;

  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [currStateData, setCurrStateData] = useState<JSON | null>(null);

  const toggleBanner = () => {
    setIsBannerVisible(!isBannerVisible);
  };

  const handleStateClick = async (stateName: string) => {
    const stateEnum = getStateFromString(stateName);
    setSelectedState(stateName);
    const stateData = await fetchStateGeoJSON(stateName, String(sharedState.year));

    setCurrStateData(stateData);
    sharedState.setView(stateEnum);
    sharedState.setLevel("state");
  };

  return (
    <>
      <div className={styles.page}>
        <div className={styles.overflowCatch}>
          {/* Left title banner */}
          <Banner
            align="left"
            height={3}
            wordmark="24cast.org"
            header=""
            message="This is a top banner!"
            isVisible={isBannerVisible}
            toggleVisibility={toggleBanner}
          />

          {sharedState.drawMode ? <Canvas /> : null}

          {/* <EBMap year={state.year} raceType={state.breakdown} onClick={handleStateClick}/> */}
          <div className={styles.mapWrapper}>
            {((sharedState.level != "national") && selectedState) ?
            <StateMap year={sharedState.year} raceType={sharedState.breakdown} stateName={sharedState.view}/>
            :
            <EBMap year={sharedState.year} raceType={sharedState.breakdown} onClick={handleStateClick}/>
            }
          </div>
          

          {/* Needs to be topmost during content screens */}
          <Menubar />

          {/* Future homepage topmost element */}
        </div>
      </div>
    </>
  );
}
