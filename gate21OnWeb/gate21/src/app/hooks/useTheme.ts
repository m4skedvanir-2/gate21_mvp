//app/hooks/useTheme.ts
"use client";
import {useState, useEffect} from "react";
import type {Theme} from "@/app/types";

export function useTheme() {
    const [theme, setTheme] = useState<Theme>("dark");

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    },[theme]);

    const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
    return {theme, toggle};
}