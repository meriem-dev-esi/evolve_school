"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    __introDone?: boolean;
  }
}

export default function IntroGate({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (
      window.__introDone ||
      (typeof sessionStorage !== "undefined" &&
        sessionStorage.getItem("evolve_intro_done"))
    ) {
      setDone(true);
      return;
    }

    const onDone = () => setDone(true);
    window.addEventListener("intro:done", onDone);
    const timeoutId = setTimeout(onDone, 1500);

    return () => {
      window.removeEventListener("intro:done", onDone);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div
      className={
        done
          ? "opacity-100 transition-opacity duration-700"
          : "pointer-events-none h-dvh overflow-hidden opacity-0"
      }
    >
      {children}
    </div>
  );
}
