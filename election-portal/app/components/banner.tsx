"use client";

import React from 'react';
import './banner.css';

type BannerProps = { // give this alignment and height instead of position
  position: 'top' | 'bottom' | 'left' | 'right';
  wordmark: string;
  header: string;
  message: string;
  isVisible: boolean;
  toggleVisibility: () => void;
};

const Banner: React.FC<BannerProps> = ({ position, wordmark, header, message, isVisible, toggleVisibility }) => {
  return (
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
  );
};

export default Banner;
