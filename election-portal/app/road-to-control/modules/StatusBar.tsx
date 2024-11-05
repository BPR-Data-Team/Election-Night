import React from 'react';
import styles from './statusbar.module.css'; // Import CSS module

interface StatusBarProps {
  leftCount: number;
  rightCount: number;

}

const StatusBar: React.FC<StatusBarProps> = ({ leftCount, rightCount }) => {
  const total = 538;
  const leftPercentage = (leftCount / total) * 100;
  const rightPercentage = (rightCount / total) * 100;

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