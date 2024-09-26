import styles from "./home-button.module.css";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import exit_icon from "../../../assets/exit.png";


interface ExitButtonProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}


const HomeButton: React.FC<ExitButtonProps> = (props: ExitButtonProps) => {

  return (
    <div>
      <button onClick={() => {props.setCurrentPage("/")}} className={styles.button}>
        <div className={styles.button_container}>
          <div className={styles.button_col}>
            <div className={styles.button_image_container}>
              <Image
                className={styles.button_image}
                src={exit_icon}
                alt={"This is a picture of an exit icon for aesthetic purposes"}
              ></Image>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
};

export default HomeButton;
