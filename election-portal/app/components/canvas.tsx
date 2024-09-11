import { ReactSketchCanvas } from "react-sketch-canvas";
import './canvas.css';

export default function Canvas() {
  return (
    <div className="drawCanvas">
      <ReactSketchCanvas
        className="canvasComponent"
        width="100%"
        height="100%"
        canvasColor="transparent"
        strokeColor="#7AC943"
        withViewBox
      />
    </div>
  );
}
