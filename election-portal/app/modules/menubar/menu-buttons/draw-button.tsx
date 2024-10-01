import styles from "./draw-button.module.css";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import { MdDraw } from "react-icons/md";


interface ExitButtonProps {
    drawMode: boolean;
    toggleDraw: () => void;
}


const DrawButton: React.FC<ExitButtonProps> = (props: ExitButtonProps) => {


    return (
        <div>
        <button onClick={props.toggleDraw} 
            className={styles.button}>
            <div className={`${styles.button_container} ${props.drawMode ? styles.button_container_active : ""}`}>
            <div className={styles.button_col}>
                <div className={styles.button_icon_container}>
                    <MdDraw 
                        className={`${styles.draw_icon} ${props.drawMode ? styles.draw_icon_active : ""}`}
                        title="Toggle Draw" />
                </div>
            </div>
            </div>
        </button>
        </div>
  );
};

export default DrawButton;
