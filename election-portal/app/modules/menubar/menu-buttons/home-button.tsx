import styles from "./home-button.module.css";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import home_icon from "../../../assets/home.png";

import HomePopup from "./home-popup";

interface HomeButtonProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}


const HomeButton: React.FC<HomeButtonProps> = (props: HomeButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const catchClickRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  /* if catchClickRef div is across the entire screen under the button */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && popupRef.current && menuRef.current && catchClickRef.current && 
        (
            ( !popupRef.current.contains(event.target as Node) &&
              !menuRef.current.contains(event.target as Node))
            || catchClickRef.current.contains(event.target as Node))
        ) {
        console.log("Clicked outside");
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div>
      <button onClick={toggleMenu} className={styles.button}>
        <div className={styles.button_container}>
          <div className={styles.button_col}>
            <div className={styles.button_image_container} ref={menuRef}>
              <Image
                className={styles.button_image}
                src={home_icon}
                alt={"This is a picture of a house icon for aesthetic purposes"}
              ></Image>
            </div>
          </div>
        </div>
      </button>
      <div ref={popupRef}>
        {isOpen && (
          <>
            <div className={styles.catch_clicks_overlay} ref={catchClickRef}></div>
            <div className={styles.overlay}></div>
            <HomePopup currentPage={props.currentPage} setCurrentPage={props.setCurrentPage} />
          </>
        )}
      </div>
    </div>
  );
};

export default HomeButton;
