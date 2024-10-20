"use client";
import React, { useState, useEffect } from "react";
import { useSharedState } from "../sharedContext";
import { State, getStateFromString } from "../../types/State";
import { RaceType, SharedInfo, Year } from "../../types/SharedInfoType";
import Head from "next/head";
import Image from "next/image";
import Papa from "papaparse";
import styles from "./page.module.css";
import Menubar from "../modules/menubar/menubar";
import Canvas from "../modules/canvas/canvas";
import { HistoricalCountyData, HistoricalElectionData } from "@/types/data";
import Banner from "./modules/banner";
import DataDisplay from "./modules/dataDisplay";

import EBMap from "./modules/EBMap";
import StateMap from "./modules/stateMap";

export default function Election_Breakdown_Page() {
  const [isBannerVisible, setIsBannerVisible] = useState<boolean>(true);
  const [historicalElectionsData, setHistoricalElectionsData] = useState<
    HistoricalElectionData[] | null
  >(null);
  const [historicalCountyData, setHistoricalCountyData] = useState<
    HistoricalCountyData[] | null
  >(null);
  const sharedState = useSharedState().state;
  const [displayNational, setDisplayNational] = useState(true);
  const toggleBanner = () => {
    setIsBannerVisible(!isBannerVisible);
  };

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
  const SMWN = sharedState.view != State.National && displayNational;

  // Would appreciate a better way to do this, if possible
  useEffect(() => {
    const wrapperDiv = document?.getElementById("mapWrapper");
    const EBMapDiv = document?.getElementById("EBContainer");
    wrapperDiv?.addEventListener("click", function (event) {
      if (event.target === event.currentTarget) {
        sharedState.setView(State.National);
      }
    });
    EBMapDiv?.addEventListener("click", function (event) {
      if (event.target === event.currentTarget) {
        sharedState.setView(State.National);
      }
    });
  }, [sharedState]);

  useEffect(() => {
    const storedElectionsData = sessionStorage.getItem(
      "historicalElectionsData"
    );
    const storedCountyData = sessionStorage.getItem("historicalCountyData");

    // Load Historical Elections Data
    if (storedElectionsData) {
      setHistoricalElectionsData(
        JSON.parse(storedElectionsData) as HistoricalElectionData[]
      );
    } else {
      fetch("/cleaned_data/historical_elections.csv")
        .then((response) => response.text())
        .then((csvText) => {
          Papa.parse(csvText, {
            header: true,
            complete: (results) => {
              const parsedElectionData: HistoricalElectionData[] =
                results.data.map((row: any, index: number) => {
                  return {
                    index: parseInt(row.index),
                    office_type: row.office_type,
                    state: row.state,
                    district: row.district,
                    margin_pct_1: parseFloat(row.margin_pct_1),
                    margin_votes_1: parseInt(row.margin_votes_1),
                    margin_pct_2: parseFloat(row.margin_pct_2),
                    absentee_pct_1: parseFloat(row.absentee_pct_1),
                    absentee_margin_pct_1: parseFloat(
                      row.absentee_margin_pct_1
                    ),
                  };
                });
              setHistoricalElectionsData(parsedElectionData);
              sessionStorage.setItem(
                "historicalElectionsData",
                JSON.stringify(parsedElectionData)
              );
            },
          });
        })
        .catch((error) =>
          console.error("Error loading historical elections data:", error)
        );
    }

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

    // Load Historical County Data
    if (storedCountyData) {
      setHistoricalCountyData(
        JSON.parse(storedCountyData) as HistoricalCountyData[]
      );
    } else {
      fetch("/cleaned_data/historical_county.csv")
        .then((response) => response.text())
        .then((csvText) => {
          Papa.parse(csvText, {
            header: true,
            complete: (results) => {
              const parsedCountyData: HistoricalCountyData[] = results.data.map(
                (row: any, index: number) => {
                  return {
                    county: row.county,
                    office_type: row.office_type,
                    district: row.district,
                    state: row.state,
                    fips: row.fips,
                    margin_votes_1: parseInt(row.margin_votes_1),
                    margin_pct_1: parseFloat(row.margin_pct_1),
                    absentee_pct_1: parseFloat(row.absentee_pct_1),
                    absentee_margin_pct_1: parseFloat(
                      row.absentee_margin_pct_1
                    ),
                    margin_pct_2: parseFloat(row.margin_pct_2),
                    margin_votes_2: parseInt(row.margin_votes_2),
                  };
                }
              );
              setHistoricalCountyData(parsedCountyData);
              sessionStorage.setItem(
                "historicalCountyData",
                JSON.stringify(parsedCountyData)
              );
            },
          });
        })
        .catch((error) =>
          console.error("Error loading historical county data:", error)
        );
    }
    // }
  }, []);

  if (!historicalElectionsData || !historicalCountyData)
    return <p>Loading Data...</p>;

  return (
    <>
      <div className={styles.page}>
        <div className={styles.overflowCatch}>
          {sharedState.drawMode ? <Canvas /> : null}

          {/* <EBMap year={state.year} raceType={state.breakdown} onClick={handleStateClick}/> */}
          <div className={styles.mapWrapper} id="mapWrapper">
            {displayNational && (
              <div
                className={styles.EBMapContainer}
                id="EBContainer"
                style={{
                  ...(sharedState.level == "national"
                    ? { opacity: 1 }
                    : { opacity: 0 }),
                }}
              >
                <EBMap />
              </div>
            )}
            {!displayNational && (
              <div
                className={styles.StateMapContainer}
                style={{
                  ...(sharedState.level != "national"
                    ? { opacity: 1 }
                    : { opacity: 0 }),
                }}
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

          {SMWN && <DataDisplay />}

          {/* Needs to be topmost during content screens */}
          <Menubar />
          {/* Future homepage topmost element */}
        </div>
      </div>
    </>
  );
}
