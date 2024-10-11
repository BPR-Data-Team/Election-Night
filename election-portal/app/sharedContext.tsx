"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from "next/navigation";
import { SharedInfo, State, Year, RaceType } from '../types/SharedInfoType';

interface SharedStateContextProps {
    state: SharedInfo;
}

const SharedStateContext = createContext<SharedStateContextProps | undefined>(undefined);

export const SharedStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const router = useRouter();

    const [page, setPage] = useState<string>("/");
    const setCurrentPage = (page: string) => {
        setPage(page);
        router.push(page);
    }
    const [view, setView] = useState<State>(State.National);
    const [level, setLevel] = useState<"county" | "state" | "national">("national");
    const exitLevel = () => {
        if (level === "county") {
            setLevel("state");
        } else if (level === "state") {
            setLevel("national");
        }
    };
    const [drawMode, setDrawMode] = useState<boolean>(false);
    const toggleDraw = () => setDrawMode(!drawMode);
    const [breakdown, setBreakdown] = useState<RaceType>(RaceType.Presidential);
    const [availableBreakdowns, setAvailableBreakdowns] = useState<RaceType[]>([
        RaceType.Presidential,
        RaceType.Senate,
        RaceType.Gubernatorial,
        RaceType.House
    ]);
    const breakdownSwitch = (breakdown: RaceType) => {
        if (availableBreakdowns.includes(breakdown)) {
            setBreakdown(breakdown);
        }
    };
    const [year, setYear] = useState<Year>(Year.Twenty);
    const [availableYears, setAvailableYears] = useState<Year[]>([
        Year.TwentyTwo,
        Year.Twenty,
        Year.Eighteen,
        Year.Sixteen,
    ]);
    const yearSwitch = (year: Year) => {
        if (availableYears.includes(year)) {
            setYear(year);
        }
    };

    const state: SharedInfo = {
        page,
        setCurrentPage,
        view,
        setView,
        level,
        setLevel,
        exitLevel,
        drawMode,
        toggleDraw,
        breakdown,
        availableBreakdowns,
        setAvailableBreakdowns,
        breakdownSwitch,
        year,
        availableYears,
        setAvailableYears,
        yearSwitch,
    };


    return (
        <SharedStateContext.Provider value={{ state }}>
            {children}
        </SharedStateContext.Provider>
    );
};

export const useSharedState = (): SharedStateContextProps => {
    const context = useContext(SharedStateContext);
    if (!context) {
        throw new Error('useSharedState must be used within a SharedStateProvider');
    }
    return context;
};