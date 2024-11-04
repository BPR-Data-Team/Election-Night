import React from 'react';
import './electoralvotebutton.module.css';

interface CircleProps {
  text: string;
  circleValue: number;
  setCircleValue: (value: number | ((prev: number) => number)) => void;
  incrementLeftCount: () => void;
  incrementRightCount: () => void;
  decrementLeftCount: () => void;
  decrementRightCount: () => void;
}
const Circle: React.FC<CircleProps> = ({
  text,
  circleValue,
  setCircleValue,
  incrementLeftCount,
  incrementRightCount,
  decrementLeftCount,
  decrementRightCount,
}) => {
  const getColor = () => {
    switch (circleValue) {
      case 1:
        return '#595D9A'; // Democrat
      case 2:
        return '#B83C2B'; // Republican
      default:
        return '#f0ecec'; // Uncalled
    }
  };

  return (
    <div
      className="circle"
      onClick={() =>
        setCircleValue((prev: number) => {
          const newValue = (prev + 1) % 3;
          if (prev === 1) decrementLeftCount();
          if (prev === 2) decrementRightCount();
          if (newValue === 1) incrementLeftCount();
          if (newValue === 2) incrementRightCount();
          return newValue;
        })
      }
      style={{ backgroundColor: getColor() }}
    >
      <span className="circle-text">{text}</span>
    </div>
  );
};

export default Circle;
