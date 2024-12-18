'use client';
import React, { useState, useEffect } from 'react';
import { useSharedState } from '../sharedContext';
import { State, getStateFromString } from '../../types/State';
import { RaceType, SharedInfo, Year } from '../../types/SharedInfoType';
import Head from 'next/head';
import Image from 'next/image';
import Papa from 'papaparse';
import styles from './page.module.css';
import Menubar from '../modules/menubar/menubar';
import Canvas from '../modules/canvas/canvas';
import { HistoricalCountyData, HistoricalElectionData } from '@/types/data';
import Banner from './modules/banner';
import DataDisplay from './modules/dataDisplay';
import CountyDataDisplay from './modules/countyDataDisplay';

import EBMap from './modules/EBMap';
import StateMap from './modules/stateMap';
const prodSlug =
  process.env.NODE_ENV === 'development' ? '' : '/Election-Night';

const mockStateData = {
  dem_name: 'Stevens',
  rep_name: 'Richardson',
  dem_votes: 2128102,
  rep_votes: 2357106,
  pct_reporting: 71,
};

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
  const [countyViewAll, setCountyViewAll] = useState<boolean>(false);

  // When sharedState.level changes wait 250ms before changing display state
  useEffect(() => {
    if (sharedState.level == 'national') {
      setDisplayNational(true);
    } else {
      setDisplayNational(false);
    }
  }, [sharedState.level]);

  useEffect(() => {
    if (
      sharedState.HistoricalCountyDataDisplayMap.size === 0 &&
      sharedState.HistoricalElectionDataDisplayMap.size === 0
    ) {
      sharedState.fetchHistoricalCountyDataForDisplay(historicalCountyData);
      sharedState.fetchHistoricalElectionDataForDisplay(
        historicalElectionsData
      );
    }
  }, [historicalCountyData, historicalElectionsData]);

  // State Mode While National
  const SMWN = (sharedState.view != State.National) && displayNational;

  useEffect(() => {
    const wrapperDiv = document?.getElementById('mapWrapper');
    const EBMapDiv = document?.getElementById('EBContainer');
    wrapperDiv?.addEventListener('click', function (event) {
      if (event.target === event.currentTarget) {
        sharedState.setView(State.National);
      }
    });
    EBMapDiv?.addEventListener('click', function (event) {
      if (event.target === event.currentTarget) {
        sharedState.setView(State.National);
      }
    });

    // console.log(
    //   'sharedState.electionData on page load: ',
    //   sharedState.electionData
    // );
  }, [sharedState]);

  useEffect(() => {
    if (sharedState.level != 'county') {
      setCountyViewAll(false);
    }
  }, [sharedState.level]);

  useEffect(() => {
    const storedElectionsData = sessionStorage.getItem(
      'historicalElectionsData'
    );
    const storedCountyData = sessionStorage.getItem('historicalCountyData');

    // Load Historical Elections Data
    if (storedElectionsData) {
      setHistoricalElectionsData(
        JSON.parse(storedElectionsData) as HistoricalElectionData[]
      );
    } else {
      fetch(`${prodSlug}/cleaned_data/historical_elections.csv`)
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
                    democratic_percent_1: parseFloat(row.democratic_percent_1),
                    republican_percent_1: parseFloat(row.republican_percent_1),
                    democratic_percent_2: parseFloat(row.democratic_percent_2),
                    republican_percent_2: parseFloat(row.republican_percent_2),
                    democratic_votes_1: parseInt(row.democratic_votes_1),
                    republican_votes_1: parseInt(row.republican_votes_1),
                    democratic_votes_2: parseInt(row.democratic_votes_2),
                    republican_votes_2: parseInt(row.republican_votes_2),
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
                'historicalElectionsData',
                JSON.stringify(parsedElectionData)
              );
            },
          });
        })
        .catch((error) =>
          console.error('Error loading historical elections data:', error)
        );
    }

    // set menubar options
    sharedState.setAvailableBreakdowns([
      RaceType.Presidential,
      RaceType.Senate,
      RaceType.Gubernatorial,
    ]);
    sharedState.breakdownSwitch(RaceType.Presidential);

    sharedState.setAvailibleDemographics([]);

    // Load Historical County Data
    if (storedCountyData) {
      setHistoricalCountyData(
        JSON.parse(storedCountyData) as HistoricalCountyData[]
      );
    } else {
      fetch(`${prodSlug}/cleaned_data/historical_county.csv`)
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
                    democratic_percent_1: parseFloat(row.democratic_percent_1),
                    republican_percent_1: parseFloat(row.republican_percent_1),
                    democratic_percent_2: parseFloat(row.democratic_percent_2),
                    republican_percent_2: parseFloat(row.republican_percent_2),
                    democratic_votes_1: parseInt(row.democratic_votes_1),
                    republican_votes_1: parseInt(row.republican_votes_1),
                    democratic_votes_2: parseInt(row.democratic_votes_2),
                    republican_votes_2: parseInt(row.republican_votes_2),
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
                'historicalCountyData',
                JSON.stringify(parsedCountyData)
              );
            },
          });
        })
        .catch((error) =>
          console.error('Error loading historical county data:', error)
        );
    }
  }, []);

  return (
    <>
      <div className={styles.page}>
        <div className={styles.overflowCatch}>
          {sharedState.drawMode ? <Canvas /> : null}
          <div className={styles.mapWrapper} id="mapWrapper">
            {displayNational && (
              <div
                className={styles.EBMapContainer}
                id="EBContainer"
                style={{
                  ...(sharedState.level == 'national'
                    ? { opacity: 1 }
                    : { opacity: 0 }),
                }}
              >
                <EBMap historicalElectionsData={historicalElectionsData} />
              </div>
            )}
            {!displayNational && (
              <div
                className={styles.StateMapContainer}
                style={{
                  ...(sharedState.level != 'national'
                    ? { opacity: 1 }
                    : { opacity: 0 }),
                }}
              >
                <StateMap
                  year={sharedState.year}
                  raceType={sharedState.breakdown}
                  stateName={sharedState.view}
                  setCountyName={sharedState.setCountyName}
                  countyData={historicalCountyData}
                />
              </div>
            )}
          </div>

          {/* Left title banner */}
          <Banner
            align="left"
            height={3}
            wordmark="Election Breakdown"
            header=""
            message={sharedState.view}
          />

          {(SMWN || !displayNational) && (
            <DataDisplay
              stateName={sharedState.view}
              countyName={sharedState.countyName}
              year={sharedState.year}
              stateData={mockStateData}
              historicalCountyData={historicalCountyData}
              historicalElectionsData={historicalElectionsData}
              raceType={sharedState.breakdown}
              sharedStateLevel={sharedState.level}
              countyViewAll={countyViewAll}
            />
          )}

          {/* {((SMWN || !displayNational) && sharedState.level === 'county' && countyViewAll == true) && (
            <CountyDataDisplay
              stateName={sharedState.view}
              countyName={countyName}
              year={sharedState.year}
              stateData={mockCountyData}
              raceType={sharedState.breakdown}
              sharedStateLevel={sharedState.level}
              countyViewAll={countyViewAll}
            />
            )} */}

          {/* Needs to be topmost during content screens */}
          {sharedState.level != 'national' ? (
            <Menubar
              countyViewAll={countyViewAll}
              setCountyViewAll={setCountyViewAll}
            />
          ) : (
            <Menubar />
          )}
          {/* Future homepage topmost element */}
        </div>
      </div>
    </>
  );
}
