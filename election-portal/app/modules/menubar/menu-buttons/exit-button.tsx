import styles from './exit-button.module.css';
import Image, { StaticImageData } from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState, useRef, useEffect, ReactNode } from 'react';
import exit_icon from '../../../assets/exit.png';
import {
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdUpload,
} from 'react-icons/md';

interface ExitButtonProps {
  currentLevel: string;
  exitLevel: () => void;
}

const ExitButton: React.FC<ExitButtonProps> = (props: ExitButtonProps) => {
  const buttonIcon: () => JSX.Element = () => {
    if (props.currentLevel === 'national') {
      return <MdUpload className={styles.exit_icon} title="Exit" />;
    } else if (props.currentLevel === 'state') {
      return (
        <MdKeyboardDoubleArrowUp className={styles.exit_icon} title="Exit" />
      );
    } else {
      return <MdKeyboardArrowUp className={styles.exit_icon} title="Exit" />;
    }
  };

  return (
    <div>
      <button onClick={props.exitLevel} className={styles.button}>
        <div className={styles.button_container}>
          <div className={styles.button_col}>
            <div className={styles.button_icon_container}>{buttonIcon()}</div>
          </div>
        </div>
      </button>
    </div>
  );
};

export default ExitButton;
