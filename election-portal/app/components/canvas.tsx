import { ReactSketchCanvas } from "react-sketch-canvas";
import './canvas.css';

export default function Canvas() {
  return (
    <div className="drawCanvas">
      <ReactSketchCanvas
        width="100%"
        height="100%"
        canvasColor="red"
        strokeColor="#7AC943"
      />
    </div>
  );
}
