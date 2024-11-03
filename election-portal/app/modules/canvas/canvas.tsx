import {
  ReactSketchCanvas,
  ReactSketchCanvasRef,
  CanvasRef,
} from 'react-sketch-canvas';
import './canvas.css';
import { useEffect, useRef } from 'react';

export default function Canvas() {
  // Fix for Firefox browser
  // (https://github.com/replicate/scribble-diffusion/issues/31#issuecomment-1451288647)
  const canvasDivRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const canvasMask = canvasDivRef.current?.querySelector<SVGGElement>(
      '#react-sketch-canvas__stroke-group-0'
    );

    if (canvasMask) {
      canvasMask.removeAttribute('mask');
    }
  }, []);

  return (
    <div className="drawCanvas" ref={canvasDivRef}>
      <ReactSketchCanvas
        className="canvasComponent"
        width="100%"
        height="100%"
        canvasColor="transparent"
        strokeColor="#22EE22"
      />
    </div>
  );
}
