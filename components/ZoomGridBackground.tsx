"use client";

import { useEffect, useRef } from "react";

export default function ZoomGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number | null = null;
    const mouse = { x: -1000, y: -1000 };
    let isHovering = false;

    // Grid Settings
    const SPACING = 24; // Distance between dots
    const BASE_RADIUS = 0.8; // Normal dot size
    const MAX_RADIUS = 3.0; // Zoomed dot size under cursor
    const EFFECT_RADIUS = 150; // How far the zoom impact reaches

    const render = () => {
      animationFrameId = null;
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const baseX = i * SPACING;
          const baseY = j * SPACING;

          let r = BASE_RADIUS;
          let alpha = 0.15;
          let x = baseX;
          let y = baseY;

          if (isHovering) {
            const dx = mouse.x - baseX;
            const dy = mouse.y - baseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < EFFECT_RADIUS) {
              const factor = (1 - dist / EFFECT_RADIUS) ** 2;
              r = BASE_RADIUS + (MAX_RADIUS - BASE_RADIUS) * factor;
              alpha = 0.15 + 0.85 * factor;
              const pullForce = factor * 4;
              x += (dx / dist) * pullForce;
              y += (dy / dist) * pullForce;
            }
          }

          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fill();
        }
      }
    };

    const triggerRender = () => {
      if (animationFrameId === null) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      triggerRender();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      isHovering = true;
      triggerRender();
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      isHovering = false;
      triggerRender();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full bg-[#0b0b0b]"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
