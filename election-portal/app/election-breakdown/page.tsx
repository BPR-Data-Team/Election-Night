"use client";
import React, { useState, useEffect } from "react";
import { useSharedState } from "../sharedContext";
import { State, getStateFromString } from "../../types/State";
import { SharedInfo } from "../../types/SharedInfoType";

import Head from "next/head";
import Image from "next/image";

import styles from "./page.module.css";

import Menubar from "../modules/menubar/menubar";
import Canvas from "../modules/canvas/canvas";
import Banner from "./modules/banner";
import DataDisplay from "./modules/dataDisplay";

import EBMap from "./modules/EBMap";
import StateMap from "./modules/stateMap";

import { fetchStateGeoJSON } from "./modules/mapDataCache";

export default function Election_Breakdown_Page() {
  const sharedState = useSharedState().state;
  const [displayNational, setDisplayNational] = useState(true);

  // When sharedState.level changes wait 250ms before changing display state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sharedState.level == "national") {
        setDisplayNational(true);
      } else {
        setDisplayNational(false);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [sharedState.level, displayNational]);

  // State Mode While National
  const SMWN = (sharedState.view != State.National && displayNational);

  // Would appreciate a better way to do this, if possible
  useEffect(() => {
    const wrapperDiv = document?.getElementById("mapWrapper");
    const EBMapDiv = document?.getElementById("EBContainer");
    wrapperDiv?.addEventListener('click', function(event) {
      if (event.target === event.currentTarget) {
        sharedState.setView(State.National);
      }
    });
    EBMapDiv?.addEventListener('click', function(event) {
      if (event.target === event.currentTarget) {
        sharedState.setView(State.National);
      }
    });
  }, [sharedState]);


  return (
    <>
      <div className={styles.page}>
        <div className={styles.overflowCatch}>

          {sharedState.drawMode ? <Canvas /> : null}

          {/* <EBMap year={state.year} raceType={state.breakdown} onClick={handleStateClick}/> */}
          <div className={styles.mapWrapper} id="mapWrapper">
            {displayNational && (
              <div
                className={styles.EBMapContainer} id="EBContainer"
                style={{ ...(SMWN ? { left: "24%" } : {}), ...(sharedState.level == "national" ? { opacity: 1 } : { opacity: 0 }) }}
              >
                <EBMap />
              </div>
            )}
            {!displayNational && (
              <div
                className={styles.StateMapContainer}
                style={{...(sharedState.level != "national" ? { opacity: 1 } : { opacity: 0 })}}
              >
                <StateMap
                year={sharedState.year}
                raceType={sharedState.breakdown}
                stateName={sharedState.view}
                />
              </div>
            )}
          </div>

          {/* Left title banner */}
          <Banner
            align="left"
            height={3}
            wordmark={"view:" + sharedState.view}
            header=""
            message={"level:" + sharedState.level}
          />

          {SMWN && <DataDisplay /> }

          {/* Needs to be topmost during content screens */}
          <Menubar />

        </div>
      </div>
    </>
  );
}
