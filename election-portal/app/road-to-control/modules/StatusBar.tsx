"use client"
import React, { useEffect, useState } from 'react';
import styles from './statusbar.module.css'; // Import CSS module

const StatusBar: React.FC = () => {
  const [leftPercentage, setLeftPercentage] = useState(0);
  const [rightPercentage, setRightPercentage] = useState(0);
  const [leftCount, setLeftCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);
  const total = 538

  // Simulate fetching data from an API
  useEffect(() => {
    const fetchData = async () => {
      // Temporary mock data
      const leftData = 200;
      const rightData = 270;

      // Set the count
      setLeftCount(leftData);
      setRightCount(rightData);

      // Calculate the percentages based on the total
      setLeftPercentage((leftData / total) * 100);
      setRightPercentage((rightData / total) * 100);
    };

    fetchData();
  }, []);

  return (
    <div className={styles.container}>
      <div
        className={`${styles.statusBar} ${styles.statusBarLeft}`}
        style={{ width: `${leftPercentage}%` }}
      >
        {`${leftCount}`}
      </div>
      <div className={styles.separator} />
      <div
        className={`${styles.statusBar} ${styles.statusBarRight}`}
        style={{ width: `${rightPercentage}%` }}
      >
        {`${rightCount}`}
      </div>
    </div>
  );
};

export default StatusBar;
