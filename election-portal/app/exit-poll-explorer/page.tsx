"use client";
import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { ExitPollData } from "../../types/data";
import styles from "./page.module.css";
import Menubar from "../modules/menubar/menubar";
import { useSharedState } from "../sharedContext";
import Canvas from "../modules/canvas/canvas";
import { RaceType } from "@/types/RaceType";
import { Year } from "@/types/Year";
import { Demographic } from "@/types/Demographic";
import EBMap from "../election-breakdown/modules/EBMap";
import Banner from "../election-breakdown/modules/banner";
import StatsTable from "./modules/statistics-table";

export default function Exit_Poll_Explorer_Page() {
  const [exitPollData, setExitPollData] = useState<ExitPollData[] | null>(null);
  const [tableData, setTableData] = useState<any>();
  const state = useSharedState().state;

  useEffect(() => {
    // Sets the menubar options
    state.setAvailableBreakdowns([]);
    state.breakdownSwitch(RaceType.Presidential);
    state.setAvailableYears([Year.Twenty, Year.TwentyFour]);
    state.yearSwitch(Year.TwentyFour);
    state.setAvailibleDemographics([
      Demographic.All,
      Demographic.Age,
      Demographic.Gender,
      Demographic.Race,
      Demographic.Education,
      Demographic.Income,
      Demographic.AreaType,
    ]);

    const storedExitPollData = sessionStorage.getItem("exitPollData");

    if (storedExitPollData) {
      setExitPollData(JSON.parse(storedExitPollData) as ExitPollData[]);
    } else {
      // Fetch the CSV data and log the response
      fetch("/cleaned_data/Locally-Hosted%20Data/CNN_exit_polls_2020.csv")
        .then((response) => {
          return response.text();
        })
        .then((csvText) => {
          console.log(csvText);
          Papa.parse(csvText, {
            header: true,
            complete: (results) => {
              console.log("results", results);
              const parsedData: ExitPollData[] = results.data.map(
                (row: any, index: number) => {
                  return {
                    index: parseInt(row.index),
                    state: row.state,
                    office_type: row.office_type,
                    question: row.question,
                    answer: row.answer,
                    demographic_pct: parseFloat(row.demographic_pct),
                    answer_pct: parseFloat(row.answer_pct),
                    lastName: row.lastName,
                  };
                }
              );

              setExitPollData(parsedData);
              sessionStorage.setItem(
                "exitPollData",
                JSON.stringify(parsedData)
              );
            },
          });
        })
        .catch((error) =>
          console.error("Error loading exit poll data:", error)
        );
    }
  }, []);

  useEffect(() => {
    switch (true) {
      case state.demographic == Demographic.Age && state.year == Year.Twenty:
        exitPollData?.forEach((datum) => {
          if (
            datum.question == Demographic.Age &&
            datum.office_type == "President"
          ) {
          }
        });
        break;
    }
  }, [state.demographic]);

  if (!exitPollData) return <p>Loading Exit Poll Data...</p>;

  const fakeStats2020 = {
    income: {
      national: [
        {
          category: "Less than $30,000",
          percentVote: 10,
          percentTrump: 55,
          percentBiden: 45,
        },
        {
          category: "$30,000-$49,999",
          percentVote: 20,
          percentTrump: 55,
          percentBiden: 45,
        },
        {
          category: "$50,000-$99,999",
          percentVote: 50,
          percentTrump: 55,
          percentBiden: 45,
        },
        {
          category: "$100,000-$199,999",
          percentVote: 10,
          percentTrump: 55,
          percentBiden: 45,
        },
        {
          category: "$200,000 or more",
          percentVote: 10,
          percentTrump: 55,
          percentBiden: 45,
        },
      ],
      AL: [
        {
          category: "Less than $30,000",
          percentVote: 10,
          percentTrump: 55,
          percentBiden: 45,
        },
        {
          category: "$30,000-$49,999",
          percentVote: 20,
          percentTrump: 55,
          percentBiden: 45,
        },
        {
          category: "$50,000-$99,999",
          percentVote: 50,
          percentTrump: 55,
          percentBiden: 45,
        },
        {
          category: "$100,000-$199,999",
          percentVote: 10,
          percentTrump: 55,
          percentBiden: 45,
        },
        {
          category: "$200,000 or more",
          percentVote: 10,
          percentTrump: 55,
          percentBiden: 45,
        },
      ],
    },
  };
  console.log(exitPollData);
  return (
    <div className={styles.page}>
      <Menubar />
      <div className={styles.main}>
        {state.drawMode ? <Canvas /> : null}
        <Banner
          align="left"
          height={2}
          wordmark={"24cast.org"}
          header=""
          message={"Exit Poll Explainer"}
        />
        <Banner
          align="left"
          height={7}
          wordmark={state.demographic}
          header=""
          message={state.year.toString()}
        />
        <div className={styles.mapWrapper} id="mapWrapper">
          <div className={styles.EBMapContainer} id="EBContainer">
            <EBMap />
          </div>
        </div>
        <StatsTable data={fakeStats2020.income.national} />
      </div>
    </div>
  );
}
