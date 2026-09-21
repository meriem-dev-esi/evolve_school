"use client";

import { useEffect, useRef } from "react";
import { createEarth } from "@/lib/earth";

export default function EarthGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let earth: Awaited<ReturnType<typeof createEarth>> | null = null;
    let cancelled = false;

    createEarth(containerRef.current).then((instance) => {
      // React may have already cleaned up the effect.
      if (cancelled) {
        instance.dispose();
        return;
      }

      earth = instance;
      earth.play();
    });

    return () => {
      cancelled = true;

      earth?.dispose();
      earth = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
    />
  );
}