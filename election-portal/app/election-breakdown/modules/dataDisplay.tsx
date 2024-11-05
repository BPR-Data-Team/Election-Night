'use client';

import React, { useState, useEffect } from 'react';
import './dataDisplay.css';

import { getDataVersion, RaceType } from '@/types/RaceType';
import { Year } from '@/types/Year';

import { useSharedState } from '../../sharedContext';
import { getStateAbbreviation } from '../../../types/State';

import CountyDataDisplay from "./countyDataDisplay"
import { GiConsoleController } from 'react-icons/gi';
import { electionDisplayData } from '@/types/data';



const mockCountyData = {
  Democratic_name: 'DemE',
  Republican_name: 'RepE',
  dem_votes: 2357106,
  rep_votes: 2357106,
  dem_votes_pct: 43,
  rep_votes_pct: 57,
}

type DataDisplayProps = {
  stateName: string;
  countyName: string;
  year: number;
  stateData: any;
  historicalCountyData: any;
  historicalElectionsData: any;
  raceType: RaceType;
  sharedStateLevel: string;
  countyViewAll: boolean;
};

interface ElectionData {
  Democratic_name: string;
  Republican_name: string;
  Democratic_votes_percent: number;
  Republican_votes_percent: number;
  Democratic_votes: number;
  Republican_votes: number;
}

const DataDisplay: React.FC<DataDisplayProps> = ({
  stateName,
  countyName,
  year,
  stateData,
  historicalCountyData,
  historicalElectionsData,
  raceType,
  sharedStateLevel,
  countyViewAll,
}) => {
  const [demVotePercentage, setDemVotePercentage] = useState<string>('N/A');
  const [repVotePercentage, setRepVotePercentage] = useState<string>('N/A');
  const [pctReporting, setPctReporting] = useState<string>('N/A');

  const [levelTitle, setLevelTitle] = useState<string>('');

  const [displayData, setDisplayData] = useState<electionDisplayData>(mockCountyData);

  const [underScoreFirst, setUnderscoreFirst] = useState<boolean>(true);

  const sharedState = useSharedState().state;

  const firstOrSecond = (): boolean => {
    switch (sharedState.breakdown) {
      case RaceType.Presidential:
        switch(sharedState.year) {
        case Year.Twenty:
          return true
        case Year.Sixteen:
          return false
        default:
          return true
        } 
      case RaceType.Senate:
        switch(sharedState.year) {
          case Year.Eighteen:
            return true
          case Year.Twelve:
            return false
          default:
            return true
        }
      case RaceType.Gubernatorial:
        switch(sharedState.year) {
          case Year.Twenty:
            return true
          case Year.Sixteen:
            return false
          default:
            return true
        }
      default:
        return true
    }
  }

  useEffect(() => {
    if (sharedStateLevel == 'state') {
      setLevelTitle('Statewide');
      // let key = datum.office_type + datum.state + datum.district;
      let key = getDataVersion(raceType) + getStateAbbreviation(sharedState.view) + '0';
      if (firstOrSecond()) {
        key += '_1';
      } else {
        key += '_2';
      }
      let newDisplayData = sharedState.HistoricalElectionDataDisplayMap.get(key);
      if (newDisplayData) {
        setDisplayData(newDisplayData);
      }
    } else if (sharedStateLevel == 'county') {
      setLevelTitle(countyName);
      // let key = datum.state + datum.county + datum.office_type;
      let key = getStateAbbreviation(sharedState.view) + countyName + getDataVersion(raceType);
      if (firstOrSecond()) {
        key += '_1';
      } else {
        key += '_2';
      }
      let newDisplayData = sharedState.HistoricalCountyDataDisplayMap.get(key);
      if (newDisplayData) {
        setDisplayData(newDisplayData);
      }
    } else {
      setLevelTitle(stateName);
      console.log("Initialzing state data at the national level")

      if (sharedState.year === Year.TwentyFour) {
        // const key = row.officetype_district_state;
        console.log("sharedState.electionData", sharedState.electionData);
        console.log("sharedState.countyData", sharedState.countyData);
      }

      let key = getDataVersion(raceType) + getStateAbbreviation(sharedState.view) + '0';
      if (firstOrSecond()) {
        key += '_1';
      } else {
        key += '_2';
      }
      let newDisplayData = sharedState.HistoricalElectionDataDisplayMap.get(key);
      if (newDisplayData) {
        setDisplayData(newDisplayData);
      }

      console.log("Key: ", key);
      console.log("New display data: ", newDisplayData);
      console.log("The whole fucking map: ", sharedState.HistoricalElectionDataDisplayMap)
    }

    setUnderscoreFirst(firstOrSecond());
  }, [sharedStateLevel, countyName, stateName, year, historicalCountyData, historicalElectionsData, sharedState.level]);

  // const initializeCountyData = () => {
  //   console.log("Initializing county data");
  //   let fetchedData: ElectionData[] = [];
  //   historicalCountyData?.forEach((datum) => {
  //     if (
  //       datum.state === getStateAbbreviation(sharedState.view) &&
  //       datum.county === countyName &&
  //       datum.office_type === getDataVersion(sharedState.breakdown)
  //     ) {
  //       switch (sharedState.breakdown) {
  //         case RaceType.Senate:
  //           switch (sharedState.year) {
  //             case Year.Eighteen:
  //               fetchedData.push({
  //                 Democratic_name: 'Dem',
  //                 Republican_name: 'Rep',
  //                 Democratic_votes_percent: datum.democratic_percent_1,
  //                 Republican_votes_percent: datum.republican_percent_1,
  //                 Democratic_votes: datum.democratic_votes_1,
  //                 Republican_votes: datum.republican_votes_1,
  //               });
  //               break;
  //             case Year.Twelve:
  //               fetchedData.push({
  //                 Democratic_name: 'Dem',
  //                 Republican_name: 'Rep',
  //                 Democratic_votes_percent: datum.democratic_percent_2,
  //                 Republican_votes_percent: datum.republican_percent_2,
  //                 Democratic_votes: datum.democratic_votes_2,
  //                 Republican_votes: datum.republican_votes_2,
  //               });
  //               break;
  //           }
  //         case RaceType.Gubernatorial:
  //           switch (sharedState.year) {
  //             case Year.Twenty:
  //               fetchedData.push({
  //                 Democratic_name: 'Dem',
  //                 Republican_name: 'Rep',
  //                 Democratic_votes_percent: datum.democratic_percent_1,
  //                 Republican_votes_percent: datum.republican_percent_1,
  //                 Democratic_votes: datum.democratic_votes_1,
  //                 Republican_votes: datum.republican_votes_1,
  //               });
  //               break;
  //             case Year.Sixteen:
  //               fetchedData.push({
  //                 Democratic_name: 'Dem',
  //                 Republican_name: 'Rep',
  //                 Democratic_votes_percent: datum.democratic_percent_2,
  //                 Republican_votes_percent: datum.republican_percent_2,
  //                 Democratic_votes: datum.democratic_votes_2,
  //                 Republican_votes: datum.republican_votes_2,
  //               });
  //               break;
  //           }
  //         case RaceType.Presidential:
  //           switch (sharedState.year) {
  //             case Year.Twenty:
  //               fetchedData.push({
  //                 Democratic_name: 'Dem',
  //                 Republican_name: 'Rep',
  //                 Democratic_votes_percent: datum.democratic_percent_1,
  //                 Republican_votes_percent: datum.republican_percent_1,
  //                 Democratic_votes: datum.democratic_votes_1,
  //                 Republican_votes: datum.republican_votes_1,
  //               });
  //               break;
  //             case Year.Sixteen:
  //               fetchedData.push({
  //                 Democratic_name: 'Dem',
  //                 Republican_name: 'Rep',
  //                 Democratic_votes_percent: datum.democratic_percent_2,
  //                 Republican_votes_percent: datum.republican_percent_2,
  //                 Democratic_votes: datum.democratic_votes_2,
  //                 Republican_votes: datum.republican_votes_2,
  //               });
  //               break;
  //           }
  //       }
  //     }
  //   });

  //   console.log("Fetched data: ", fetchedData[0]);

  //   setDisplayData(fetchedData[0]);
  // }

  // const initializeStateData = () => {
  //   console.log("Initializing state data");
  //   let fetchedData: ElectionData[] = [];
  //   historicalElectionsData?.forEach((datum) => {
  //     if (
  //       datum.state === getStateAbbreviation(sharedState.view) &&
  //       datum.office_type === getDataVersion(sharedState.breakdown)
  //     ) {
  //       switch (sharedState.breakdown) {
  //         case RaceType.Senate:
  //           switch (sharedState.year) {
  //             case Year.Eighteen:
  //               fetchedData.push({
  //                 Democratic_name: 'Dem',
  //                 Republican_name: 'Rep',
  //                 Democratic_votes_percent: datum.democratic_percent_1,
  //                 Republican_votes_percent: datum.republican_percent_1,
  //                 Democratic_votes: datum.democratic_votes_1,
  //                 Republican_votes: datum.republican_votes_1,
  //               });
  //               break;
  //             case Year.Twelve:
  //               fetchedData.push({
  //                 Democratic_name: 'Dem',
  //                 Republican_name: 'Rep',
  //                 Democratic_votes_percent: datum.democratic_percent_2,
  //                 Republican_votes_percent: datum.republican_percent_2,
  //                 Democratic_votes: datum.democratic_votes_2,
  //                 Republican_votes: datum.republican_votes_2,
  //               });
  //               break;
  //           }
  //         case RaceType.Gubernatorial:
  //           switch (sharedState.year) {
  //             case Year.Twenty:
  //               fetchedData.push({
  //                 Democratic_name: 'Dem',
  //                 Republican_name: 'Rep',
  //                 Democratic_votes_percent: datum.democratic_percent_1,
  //                 Republican_votes_percent: datum.republican_percent_1,
  //                 Democratic_votes: datum.democratic_votes_1,
  //                 Republican_votes: datum.republican_votes_1,
  //               });
  //               break;
  //             case Year.Sixteen:
  //               fetchedData.push({
  //                 Democratic_name: 'Dem',
  //                 Republican_name: 'Rep',
  //                 Democratic_votes_percent: datum.democratic_percent_2,
  //                 Republican_votes_percent: datum.republican_percent_2,
  //                 Democratic_votes: datum.democratic_votes_2,
  //                 Republican_votes: datum.republican_votes_2,
  //               });
  //               break;
  //           }
  //         case RaceType.Presidential:
  //           switch (sharedState.year) {
  //             case Year.Twenty:
  //               fetchedData.push({
  //                 Democratic_name: 'Dem',
  //                 Republican_name: 'Rep',
  //                 Democratic_votes_percent: datum.democratic_percent_1,
  //                 Republican_votes_percent: datum.republican_percent_1,
  //                 Democratic_votes: datum.democratic_votes_1,
  //                 Republican_votes: datum.republican_votes_1,
  //               });
  //               break;
  //             case Year.Sixteen:
  //               fetchedData.push({
  //                 Democratic_name: 'Dem',
  //                 Republican_name: 'Rep',
  //                 Democratic_votes_percent: datum.democratic_percent_2,
  //                 Republican_votes_percent: datum.republican_percent_2,
  //                 Democratic_votes: datum.democratic_votes_2,
  //                 Republican_votes: datum.republican_votes_2,
  //               });
  //               break;
  //           }
  //       }
  //     }
  //   });

  //   // Loop through fetched data and do some math to figure out the state values of everything
  //   let stateDemVotes = 0;
  //   let stateRepVotes = 0;
  //   let stateDemPct = 0;
  //   let stateRepPct = 0;

  //   fetchedData.forEach((datum) => {
  //     stateDemVotes += datum.Democratic_votes;
  //     stateRepVotes += datum.Republican_votes;
  //   });

  //   stateDemPct = Math.round((stateDemVotes / (stateDemVotes + stateRepVotes)) * 100);
  //   stateRepPct = Math.round((stateRepVotes / (stateDemVotes + stateRepVotes)) * 100);

  //   const newDisplayData = {
  //     Democratic_name: 'Dem',
  //     Republican_name: 'Rep',
  //     Democratic_votes_percent: stateDemPct,
  //     Republican_votes_percent: stateRepPct,
  //     Democratic_votes: stateDemVotes,
  //     Republican_votes: stateRepVotes,
  //   }

  //   console.log("New display data: ", newDisplayData);
    
  //   setDisplayData(newDisplayData);
  // }

  // const initializeNationalData = () => {
  //   let fetchedData: ElectionData[] = [];
  //   historicalElectionsData?.forEach((datum) => {
  //     if (
  //       datum.office_type === getDataVersion(sharedState.breakdown)
  //     ) {
  //       switch (sharedState.breakdown) {
  //         case RaceType.Senate:
  //           switch (sharedState.year) {
  //             case Year.Eighteen:
  //               fetchedData.push({
  //                 Democratic_name: 'Dem',
  //                 Republican_name: 'Rep',
  //                 Democratic_votes_percent: datum.democratic_percent_1,
  //                 Republican_votes_percent: datum.republican_percent_1,
  //                 Democratic_votes: datum.democratic_votes_1,
  //                 Republican_votes: datum.republican_votes_1,
  //               });
  //               break;
  //             case Year.Twelve:
  //               fetchedData.push({
  //                 Democratic_name: 'Dem',
  //                 Republican_name: 'Rep',
  //                 Democratic_votes_percent: datum.democratic_percent_2,
  //                 Republican_votes_percent: datum.republican_percent_2,
  //                 Democratic_votes: datum.democratic_votes_2,
  //                 Republican_votes: datum.republican_votes_2,
  //               });
  //               break;
  //           }
  //         case RaceType.Gubernatorial:
  //           switch (sharedState.year) {
  //             case Year.Twenty:
  //               fetchedData.push({
  //                 Democratic_name: 'Dem',
  //                 Republican_name: 'Rep',
  //                 Democratic_votes_percent: datum.democratic_percent_1,
  //                 Republican_votes_percent: datum.republican_percent_1,
  //                 Democratic_votes: datum.democratic_votes_1,
  //                 Republican_votes: datum.republican_votes_1,
  //               });
  //               break;
  //             case Year.Sixteen:
  //               fetchedData.push({
  //                 Democratic_name: 'Dem',
  //                 Republican_name: 'Rep',
  //                 Democratic_votes_percent: datum.democratic_percent_2,
  //                 Republican_votes_percent: datum.republican_percent_2,
  //                 Democratic_votes: datum.democratic_votes_2,
  //                 Republican_votes: datum.republican_votes_2,
  //               });
  //               break;
  //           }
  //         case RaceType.Presidential:
  //           switch (sharedState.year) {
  //             case Year.Twenty:
  //               fetchedData.push({
  //                 Democratic_name: 'Dem',
  //                 Republican_name: 'Rep',
  //                 Democratic_votes_percent: datum.democratic_percent_1,
  //                 Republican_votes_percent: datum.republican_percent_1,
  //                 Democratic_votes: datum.democratic_votes_1,
  //                 Republican_votes: datum.republican_votes_1,
  //               });
  //               break;
  //             case Year.Sixteen:
  //               fetchedData.push({
  //                 Democratic_name: 'Dem',
  //                 Republican_name: 'Rep',
  //                 Democratic_votes_percent: datum.democratic_percent_2,
  //                 Republican_votes_percent: datum.republican_percent_2,
  //                 Democratic_votes: datum.democratic_votes_2,
  //                 Republican_votes: datum.republican_votes_2,
  //               });
  //               break;
  //           }
  //       }
  //     }
  //   });

  //   // Loop through fetched data and do some math to figure out the national values of everything
  //   let nationalDemVotes = 0;
  //   let nationalRepVotes = 0;
  //   let nationalDemPct = 0;
  //   let nationalRepPct = 0;
  //   let nationalSwing = 0;
  //   let nationalMargin = 0;
    
  //   fetchedData.forEach((datum) => {
  //     nationalDemVotes += datum.Democratic_votes;
  //     nationalRepVotes += datum.Republican_votes;
  //   });

  //   nationalDemPct = Math.round((nationalDemVotes / (nationalDemVotes + nationalRepVotes)) * 100);
  //   nationalRepPct = Math.round((nationalRepVotes / (nationalDemVotes + nationalRepVotes)) * 100);

  //   const newDisplayData = {
  //     Democratic_name: 'Dem',
  //     Republican_name: 'Rep',
  //     Democratic_votes_percent: nationalDemPct,
  //     Republican_votes_percent: nationalRepPct,
  //     Democratic_votes: nationalDemVotes,
  //     Republican_votes: nationalRepVotes,
  //   }
    
  //   setDisplayData(newDisplayData);
  // }

  

  

  const setBothVotePercentages = () => {
    setDemVotePercentage(
      stateData['dem_votes'] && stateData['rep_votes']
        ? Math.round(
            (stateData['dem_votes'] /
              (stateData['dem_votes'] + stateData['rep_votes'])) *
              100
          ) + '%'
        : 'N/A'
    );
    setRepVotePercentage(
      stateData['dem_votes'] && stateData['rep_votes']
        ? Math.round(
            (stateData['rep_votes'] /
              (stateData['dem_votes'] + stateData['rep_votes'])) *
              100
          ) + '%'
        : 'N/A'
    );
  };

  useEffect(() => {
    setBothVotePercentages();
    setPctReporting(
      Math.round(stateData['pct_reporting'])
        ? stateData['pct_reporting']
        : 'N/A'
    );
  }, [stateName, year, stateData, raceType]);



  return (
  <div>
      {((sharedStateLevel === 'county' || sharedStateLevel === 'state') && countyViewAll === true) ?
        <CountyDataDisplay
        stateName={sharedState.view}
        countyName={countyName}
        year={sharedState.year}
        stateData={mockCountyData}
        raceType={sharedState.breakdown}
        sharedStateLevel={sharedState.level}
        countyViewAll={countyViewAll}
      /> : 
    <div className="dataDisplay">
      <div className="stateYearDiv">
        <h1 className="stateYearHeader">
          <p className="stateName">
            {levelTitle}
          </p>{' '}
          | {year}
        </h1>
      </div>

      <div className="spaceDiv"></div>

      <div className="infoDiv">
        <div className="peopleDiv">
          <div className="personStack">
            <div className="personImageDiv">
              <img
                className="demPerson"
                src="https://upload.wikimedia.org/wikipedia/commons/7/71/Black.png"
                alt="Dem Candidate"
              />
            </div>
            <div className="infoDivTextDiv">
              <h2 className="personName">
                {displayData.Democratic_name ? displayData.Democratic_name : null}
              </h2>
              <h2 className="personPercentage">{Math.round(displayData.dem_votes_pct)+"%"}</h2>
              <h2 className="personVotes">
                {displayData.dem_votes
                  ? displayData.dem_votes.toLocaleString('en-US')
                  : null}
              </h2>
            </div>
          </div>

          <div className="personStack">
            <div className="personImageDiv">
              <img
                className="repPerson"
                src="https://upload.wikimedia.org/wikipedia/commons/7/71/Black.png"
                alt="Rep Candidate"
              />
            </div>
            <div className="infoDivTextDiv">
              <h2 className="personName">
                {displayData.Republican_name ? displayData.Republican_name : null}
              </h2>
              <h2 className="personPercentage">{Math.round(displayData.rep_votes_pct)+"%"}</h2>
              <h2 className="personVotes">
                {displayData.rep_votes
                  ? displayData.rep_votes.toLocaleString('en-US')
                  : null}
              </h2>
            </div>
          </div>
        </div>

        <div className="pctReportingDiv">
          <p className="pct_reporting">
            {pctReporting ? pctReporting + '% Reporting' : 'N/A'}
          </p>
        </div>
      </div>
    </div>
    }
  </div>
  );
};

export default DataDisplay;
