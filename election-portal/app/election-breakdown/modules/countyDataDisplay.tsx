'use client';

import React, { useState, useEffect } from 'react';
import './countyDataDisplay.css';
import { RaceType, getDataVersion } from '@/types/RaceType';
import { useSharedState } from '../../sharedContext';
import { getStateAbbreviation } from '@/types/State';

import { electionDisplayData, ElectionData } from '@/types/data';

type DataDisplayProps = {
  stateName: string;
  countyName: string;
  year: number;
  stateData: any;
  raceType: RaceType;
  sharedStateLevel: string;
  countyViewAll: boolean;
};

const mockCountyData = {
  Democratic_name: 'N/A',
  Republican_name: 'N/A',
  dem_votes: 1,
  rep_votes: 1,
  dem_votes_pct: 1,
  rep_votes_pct: 1,
}

const CountyDataDisplay: React.FC<DataDisplayProps> = ({
  stateName,
  countyName,
  year,
  stateData,
  raceType,
  sharedStateLevel,
  countyViewAll,
}) => {
  const [demVotePercentage, setDemVotePercentage] = useState<string>('N/A');
  const [repVotePercentage, setRepVotePercentage] = useState<string>('N/A');
  const [pctReporting, setPctReporting] = useState<string>('N/A');

  const [historicalDisplayData_1, sethistoricalDisplayData_1] = useState<electionDisplayData>(mockCountyData);
  const [historicalDisplayData_2, sethistoricalDisplayData_2] = useState<electionDisplayData>(mockCountyData);
  const [modernDisplayData, setModernDisplayData] = useState<ElectionData | electionDisplayData>(mockCountyData);

  const [listOfYears, setListOfYears] = useState<number[]>([2024,2020,2016]);

  const sharedState = useSharedState().state;

  // const setBothVotePercentages = () => {
  //   setDemVotePercentage(
  //     stateData['dem_votes'] && stateData['rep_votes']
  //       ? Math.round(
  //           (stateData['dem_votes'] /
  //             (stateData['dem_votes'] + stateData['rep_votes'])) *
  //             100
  //         ) + '%'
  //       : 'N/A'
  //   );
  //   setRepVotePercentage(
  //     stateData['dem_votes'] && stateData['rep_votes']
  //       ? Math.round(
  //           (stateData['rep_votes'] /
  //             (stateData['dem_votes'] + stateData['rep_votes'])) *
  //             100
  //         ) + '%'
  //       : 'N/A'
  //   );
  // };

  useEffect(() => {
    // setBothVotePercentages();
    setPctReporting(
      Math.round(stateData['pct_reporting'])
        ? stateData['pct_reporting']
        : 'N/A'
    );

    if (sharedState.breakdown === RaceType.Presidential) {
      setListOfYears([2024, 2020, 2016]);
    } else if (sharedState.breakdown === RaceType.Senate) {
      setListOfYears([2024, 2018, 2012]);
    } else if (sharedState.breakdown === RaceType.Gubernatorial) {
      setListOfYears([2024, 2020, 2016]);
    }
    
    if (sharedStateLevel === 'county') {
      let key = getStateAbbreviation(sharedState.view) + countyName + getDataVersion(raceType);
      let newDisplayData = sharedState.HistoricalCountyDataDisplayMap.get(key+"_1");
      if (newDisplayData) {
        sethistoricalDisplayData_1(newDisplayData);
      }
      let newDisplayData2 = sharedState.HistoricalCountyDataDisplayMap.get(key+"_2");
      if (newDisplayData2) {
        sethistoricalDisplayData_2(newDisplayData2);
      }
      let key24 = getDataVersion(raceType) + countyName + '0' + getStateAbbreviation(sharedState.view);
      let newDisplayData3 = sharedState.countyData?.get(key24);
      if (newDisplayData3) {
        setModernDisplayData(newDisplayData3);
      }
    }

    if (sharedStateLevel === 'state') {
      let key = getDataVersion(raceType) + getStateAbbreviation(sharedState.view) + '0';
      let newDisplayData = sharedState.HistoricalElectionDataDisplayMap.get(key+"_1");
      if (newDisplayData) {
        sethistoricalDisplayData_1(newDisplayData);
      }
      let newDisplayData2 = sharedState.HistoricalElectionDataDisplayMap.get(key+"_2");
      if (newDisplayData2) {
        sethistoricalDisplayData_2(newDisplayData2);
      }
      let key24 = getDataVersion(raceType) + '0' + getStateAbbreviation(sharedState.view);
      let newDisplayData3 = sharedState.electionData?.get(key24);
      if (newDisplayData3) {
        setModernDisplayData(newDisplayData3);
      }
    }

  }, [stateName, year, stateData, raceType, countyName, sharedState.electionData, sharedState.countyData]);

  return (
    <div>
      <div className="countyDataDisplay">
        <div className="countyStateYearDiv">
          <h1 className="countyStateYearHeader">
            <p className="countyName">
              {sharedState.level === 'county' ? countyName : stateName}
            </p>{' '}
          </h1>
        </div>

        <div className="spaceDiv"></div>

        <div className="countyInfoDiv">
            <div className="countyTable">

                <div className="countyRow">
                    <div className="firstCountyCell"></div>
                    <div className="countyCell"><p>{listOfYears[0]}</p></div>
                    <div className="countyCell"><p>{listOfYears[1]}</p></div>
                    <div className="countyCell"><p>{listOfYears[2]}</p></div>
                </div>

                <div className="countyRow">
                    <div className="firstCountyCell"><p className='countyName'>{stateData.Democratic_name ? (stateData.Democratic_name.split(" ").pop() === "Jr." ? stateData.Democratic_name.split(" ").slice(-2, -1)[0] : stateData.Democratic_name.split(" ").pop()) : null}</p></div>
                    <div className="countyCell">
                        {(year === 2024 || countyViewAll) && 
                            <div className='countyPercentCell'>
                                <p className='votesPercentage'>{Math.round(modernDisplayData.dem_votes_pct) + "%"}</p>
                                <p className='votesNumber'>{Number(modernDisplayData.dem_votes).toLocaleString('en-us')}</p>
                            </div>
                        }
                    </div>
                    <div className="countyCell">
                        {(year === 2020 || countyViewAll) && 
                            <div className='countyPercentCell'> 
                                <p className='votesPercentage'>{Math.round(historicalDisplayData_1.dem_votes_pct) + "%"}</p>
                                <p className='votesNumber'>{historicalDisplayData_1.dem_votes.toLocaleString('en-US')}</p>
                            </div>
                        }
                    </div>
                    <div className="countyCell">
                        {(year === 2016 || countyViewAll) && 
                            <div className='countyPercentCell'>
                                <p className='votesPercentage'>{Math.round(historicalDisplayData_2.dem_votes_pct) + "%"}</p>
                                <p className='votesNumber'>{historicalDisplayData_2.dem_votes.toLocaleString('en-US')}</p>
                            </div>
                        }
                    </div>
                </div>

                <div className="countyRow">
                    <div className="firstCountyCell"><p className='countyName'>{stateData.Democratic_name ? (stateData.Republican_name.split(" ").pop() === "Jr." ? stateData.Republican_name.split(" ").slice(-2, -1)[0] : stateData.Republican_name.split(" ").pop()) : null}</p></div>
                    <div className="countyCell">
                        {(year === 2024 || countyViewAll) && 
                            <div className='countyPercentCell'>
                                <p className='votesPercentage'>{Math.round(modernDisplayData.rep_votes_pct) + "%"}</p>
                                <p className='votesNumber'>{Number(modernDisplayData.rep_votes).toLocaleString('en-us')}</p>
                            </div>
                        }
                    </div>
                    <div className="countyCell">
                        {(year === 2020 || countyViewAll) && 
                            <div className='countyPercentCell'>
                                <p className='votesPercentage'>{Math.round(historicalDisplayData_1.rep_votes_pct) + "%"}</p>
                                <p className='votesNumber'>{historicalDisplayData_1.rep_votes.toLocaleString('en-US')}</p>
                            </div>
                        }
                    </div>
                    <div className="countyCell">
                        {(year === 2016 || countyViewAll) && 
                            <div className='countyPercentCell'>
                                <p className='votesPercentage'>{Math.round(historicalDisplayData_2.rep_votes_pct) + "%"}</p>
                                <p className='votesNumber'>{historicalDisplayData_2.rep_votes.toLocaleString('en-US')}</p>
                            </div>
                        }
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default CountyDataDisplay;
