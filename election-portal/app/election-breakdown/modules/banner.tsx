"use client";

import React from 'react';
import './banner.css';

type BannerProps = {
  align: "left" | "right";
  height: number;
  wordmark: string;
  header: string;
  message: string;
  isVisible: boolean;
  toggleVisibility: () => void;
};


const Banner: React.FC<BannerProps> = ({ align, height, wordmark, header, message, isVisible, toggleVisibility }) => {

  const divStyle = {
    top: height.toString() + 'rem'
  }

  return (
    <div style={{ top: `${height}rem` }} className={align}> {/* Is this good practice? Idk :P */}
      <div className="banner">
        {isVisible && (
          <>
            <span className="wordmark">{wordmark}</span>
            <span className="wordmark">{header}</span>
            <p> | </p>
            <p>
              {message}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Banner;
