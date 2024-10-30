"use client";

import React,{useState, useEffect} from 'react';
import './dataDisplay.css';
import { RaceType } from '@/types/RaceType';

// type DataProps = {
// };



type DataDisplayProps = {
  stateName: string;
  year: number;
  stateData: any;
  raceType: RaceType;
  sharedStateLevel: string;
};


const DataDisplay: React.FC<DataDisplayProps> = ({stateName, year, stateData, raceType, sharedStateLevel}) => {
  const [demVotePercentage, setDemVotePercentage] = useState<string>("N/A");
  const [repVotePercentage, setRepVotePercentage] = useState<string>("N/A");
  const [pctReporting, setPctReporting] = useState<string>("N/A");

  const setBothVotePercentages = () => {
    setDemVotePercentage(stateData["dem_votes"] && stateData["rep_votes"] 
                        ? Math.round((stateData["dem_votes"] / (stateData["dem_votes"] + stateData["rep_votes"])) * 100) + "%" 
                        : "N/A");
    setRepVotePercentage(stateData["dem_votes"] && stateData["rep_votes"]
                        ? Math.round((stateData["rep_votes"] / (stateData["dem_votes"] + stateData["rep_votes"])) * 100) + "%" 
                        : "N/A");
  }

  

  useEffect(() => {
    setBothVotePercentages();
    setPctReporting(Math.round(stateData["pct_reporting"]) ? stateData["pct_reporting"] : "N/A");
  }, [stateName, year, stateData, raceType]);

  return (
    <div>
      <div className="dataDisplay">

        <div className='stateYearDiv'>
          <h1 className='stateYearHeader'><p className='stateName'>{sharedStateLevel=="state" ? "Statewide" : stateName}</p> | {year}</h1>
        </div>

        <div className='spaceDiv'>
          
        </div>

        <div className='infoDiv'>
          <div className="peopleDiv">
            <div className='personStack'>
              <div className='personImageDiv'>
                <img className='demPerson' src="https://upload.wikimedia.org/wikipedia/commons/7/71/Black.png" alt="Dem Candidate"/>
              </div>
              <div className="infoDivTextDiv">
                <h2 className='personName'>{stateData["dem_name"] ? stateData["dem_name"] : "N/A"}</h2>
                <h2 className='personPercentage'>{demVotePercentage}</h2>
                <h2 className='personVotes'>{stateData["dem_votes"] ? stateData["dem_votes"].toLocaleString("en-US") : "N/A"}</h2>
              </div>
            </div>
            
            <div className='personStack'>
              <div className='personImageDiv'>
                <img className='repPerson' src="https://upload.wikimedia.org/wikipedia/commons/7/71/Black.png" alt="Rep Candidate"/>
              </div>
              <div className="infoDivTextDiv">
                <h2 className='personName'>{stateData["rep_name"] ? stateData["rep_name"] : "N/A"}</h2>
                <h2 className='personPercentage'>{repVotePercentage}</h2>
                <h2 className='personVotes'>{stateData["rep_votes"] ? stateData["rep_votes"].toLocaleString("en-US") : "N/A"}</h2>
              </div>
            </div>
          </div>

          <div className='pctReportingDiv'>
            <p className='pct_reporting'>{pctReporting ? pctReporting + "% Reporting" : "N/A"}</p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default DataDisplay;
