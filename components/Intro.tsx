"use client";

import { useEffect } from "react";
import { initPreloader } from "@/lib/intro/preloader";

export default function Intro() {
  useEffect(() => {
    initPreloader();
  }, []);

  return <section>{/* Your Intro content */}</section>;
}
