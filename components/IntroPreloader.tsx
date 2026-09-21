"use client";

import { useEffect } from "react";
import { initPreloader } from "@/lib/intro/preloader";

export default function IntroPreloader() {
  useEffect(() => {
    console.log("PRELOADER STARTED");
    initPreloader();
  }, []);

  return null;
}