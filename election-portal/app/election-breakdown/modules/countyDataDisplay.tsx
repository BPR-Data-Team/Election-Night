'use client';

import React, { useState, useEffect } from 'react';
import './countyDataDisplay.css';
import { RaceType, getDataVersion } from '@/types/RaceType';
import { useSharedState } from '../../sharedContext';
import { getStateAbbreviation } from '@/types/State';

import { electionDisplayData } from '@/types/data';

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
  Democratic_name: 'DemE',
  Republican_name: 'RepE',
  dem_votes: 2357106,
  rep_votes: 2357106,
  dem_votes_pct: 43,
  rep_votes_pct: 57,
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
    }

  }, [stateName, year, stateData, raceType, countyName]);

  return (
    <div>
      <div className="countyDataDisplay">
        <div className="countyStateYearDiv">
          <h1 className="countyStateYearHeader">
            <p className="countyName">
              {countyName}
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
                    <div className="firstCountyCell"><p className='countyName'>{stateData['Democratic_name']}</p></div>
                    <div className="countyCell">
                        {(year === 2024 || countyViewAll) && 
                            <div className='countyPercentCell'>
                                <p className='votesPercentage'>Holder</p>
                                <p className='votesNumber'>Holder</p>
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
                    <div className="firstCountyCell"><p className='countyName'>{stateData['Republican_name']}</p></div>
                    <div className="countyCell">
                        {(year === 2024 || countyViewAll) && 
                            <div className='countyPercentCell'>
                                <p className='votesPercentage'>Holder</p>
                                <p className='votesNumber'>Holder</p>
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
