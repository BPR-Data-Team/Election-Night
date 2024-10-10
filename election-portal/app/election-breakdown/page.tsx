"use client";
import React, { useState, useEffect } from "react";
import { useSharedState } from "../sharedContext";
import Head from "next/head";
import Image from "next/image";
import Papa from "papaparse";
import styles from "./page.module.css";
import Menubar from "../modules/menubar/menubar";
import Banner from "./modules/banner";
import Canvas from "../modules/canvas/canvas";
import { HistoricalCountyData, HistoricalElectionData } from "@/types/data";

export default function Election_Breakdown_Page() {
  const [isBannerVisible, setIsBannerVisible] = useState<boolean>(true);
  const [historicalElectionsData, setHistoricalElectionsData] = useState<HistoricalElectionData[] | null>(null);
  const [historicalCountyData, setHistoricalCountyData] = useState<HistoricalCountyData[] | null>(null);
  const state = useSharedState().state;

  const toggleBanner = () => {
    setIsBannerVisible(!isBannerVisible);
  };

  useEffect(() => {
    const storedElectionsData = sessionStorage.getItem("historicalElectionsData");
    const storedCountyData = sessionStorage.getItem("historicalCountyData");

    // Load Historical Elections Data
    if (storedElectionsData) {
      setHistoricalElectionsData(JSON.parse(storedElectionsData) as HistoricalElectionData[]);
    } else {
      fetch('/cleaned_data/historical_elections.csv')
        .then((response) => response.text())
        .then((csvText) => {
          Papa.parse(csvText, {
            header: true,
            complete: (results) => {
              const parsedElectionData: HistoricalElectionData[] = results.data.map((row: any, index: number) => {
                return {
                  index: parseInt(row.index),
                  office_type: row.office_type,
                  state: row.state,
                  district: row.district,
                  margin_pct_1: parseFloat(row.margin_pct_1),
                  margin_votes_1: parseInt(row.margin_votes_1),
                  margin_pct_2: parseFloat(row.margin_pct_2),
                  absentee_pct_1: parseFloat(row.absentee_pct_1),
                  absentee_margin_pct_1: parseFloat(row.absentee_margin_pct_1),
                };
              });
              setHistoricalElectionsData(parsedElectionData);
              sessionStorage.setItem("historicalElectionsData", JSON.stringify(parsedElectionData));
            },
          });
        })
        .catch((error) => console.error("Error loading historical elections data:", error));
    }

    // Load Historical County Data
    // if (storedCountyData) {
    //   setHistoricalCountyData(JSON.parse(storedCountyData) as HistoricalCountyData[]);
    // } else {
      fetch('/cleaned_data/historical_county.csv')
        .then((response) => response.text())
        .then((csvText) => {
          Papa.parse(csvText, {
            header: true,
            complete: (results) => {
              const parsedCountyData: HistoricalCountyData[] = results.data.map((row: any, index: number) => {
                return {
                  county: row.county,
                  office_type: row.office_type,
                  district: row.district,
                  state: row.state,
                  fips: row.fips,
                  margin_votes_1: parseInt(row.margin_votes_1),
                  margin_pct_1: parseFloat(row.margin_pct_1),
                  absentee_pct_1: parseFloat(row.absentee_pct_1),
                  absentee_margin_pct_1: parseFloat(row.absentee_margin_pct_1),
                  margin_pct_2: parseFloat(row.margin_pct_2),
                  margin_votes_2: parseInt(row.margin_votes_2),
                };
              });
              setHistoricalCountyData(parsedCountyData);
              sessionStorage.setItem("historicalCountyData", JSON.stringify(parsedCountyData));
            },
          });
        })
        .catch((error) => console.error("Error loading historical county data:", error));
    // } 
  }, []);

  if (!historicalElectionsData || !historicalCountyData) return <p>Loading Data...</p>;

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

          {state.drawMode ? <Canvas /> : null}

          {/* Needs to be topmost during content screens */}
          <Menubar />

          {/* Future homepage topmost element */}
        </div>
      </div>
    </>
  );
}
