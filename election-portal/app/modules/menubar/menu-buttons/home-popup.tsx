import React from 'react';
import styles from "./home-popup.module.css";

interface HomePopupProps {
    currentPage: string;
    setCurrentPage: (page: string) => void;
}

const HomePopup: React.FC<HomePopupProps> = (props: HomePopupProps) => {
    return (
        <div className={styles.container}> 
            <div className={styles.popup}>
                <button className={styles.button}>Election Breakdown</button>
                <button className={styles.button}>Race for Control</button>
                <button className={styles.button}>Exit Poll Explorer</button>
            </div>
        </div>
    );
};

export default HomePopup;