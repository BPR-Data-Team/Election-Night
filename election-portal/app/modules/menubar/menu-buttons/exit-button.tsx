import styles from "./exit-button.module.css";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import exit_icon from "../../../assets/exit.png";
import { MdExitToApp } from "react-icons/md";


interface ExitButtonProps {
    currentPage: string;
    setCurrentPage: (page: string) => void;
}


const ExitButton: React.FC<ExitButtonProps> = (props: ExitButtonProps) => {

    return (
        <div>
        <button onClick={() => {props.setCurrentPage("/")}} className={styles.button}>
            <div className={styles.button_container}>
            <div className={styles.button_col}>
                <div className={styles.button_icon_container}>
                    <MdExitToApp className={styles.exit_icon} title="Exit" />
                </div>
            </div>
            </div>
        </button>
        </div>
    );
};

export default ExitButton;
