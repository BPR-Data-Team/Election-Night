"use client";
import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { ExitPollData } from '../../types/data';

export default function Exit_Poll_Explorer_Page() {
  const [exitPollData, setExitPollData] = useState<ExitPollData[] | null>(null);

  useEffect(() => {
    const storedExitPollData = sessionStorage.getItem('exitPollData');

    if (storedExitPollData) {
      setExitPollData(JSON.parse(storedExitPollData) as ExitPollData[]);
    } else {
      // Fetch the CSV data and log the response
      fetch('/cleaned_data/CNN_exit_polls_2020.csv')
        .then((response) => {
          return response.text();
        })
        .then((csvText) => {
          Papa.parse(csvText, {
            header: true,
            complete: (results) => {
              const parsedData: ExitPollData[] = results.data.map((row: any, index: number) => {
                
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
              });

              setExitPollData(parsedData);
              sessionStorage.setItem('exitPollData', JSON.stringify(parsedData));
            },
          });
        })
        .catch((error) => console.error('Error loading exit poll data:', error));
    }
}, []);

  if (!exitPollData) return <p>Loading Exit Poll Data...</p>;

  return (
    <div>
      <h1>Exit Poll Explorer</h1>
      <p>{exitPollData[1].lastName}</p>
    </div>
  );
}
