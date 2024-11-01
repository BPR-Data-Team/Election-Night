import { useSharedState } from '@/app/sharedContext';
import styles from './draw-button.module.css';
import Image, { StaticImageData } from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState, useRef, useEffect } from 'react';
import { MdDraw } from 'react-icons/md';

const DrawButton: React.FC = () => {
  const state = useSharedState().state;

  return (
    <div>
      <button onClick={state.toggleDraw} className={styles.button}>
        <div
          className={`${styles.button_container} ${
            state.drawMode ? styles.button_container_active : ''
          }`}
        >
          <div className={styles.button_col}>
            <div className={styles.button_icon_container}>
              <MdDraw
                className={`${styles.draw_icon} ${
                  state.drawMode ? styles.draw_icon_active : ''
                }`}
                title="Toggle Draw"
              />
            </div>
          </div>
        </div>
      </button>
    </div>
  );
};

export default DrawButton;
