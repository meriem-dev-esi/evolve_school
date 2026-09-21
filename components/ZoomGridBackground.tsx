"use client";

import { useEffect, useRef } from "react";

export default function ZoomGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const mouse = { x: -1000, y: -1000 };

    // Grid Settings
    const SPACING = 20; // Distance between dots
    const BASE_RADIUS = 0.8; // Normal dot size
    const MAX_RADIUS = 3.2; // Zoomed dot size under cursor
    const EFFECT_RADIUS = 160; // How far the zoom impact reaches

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    handleResize();

    // Render loop
    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const baseX = i * SPACING;
          const baseY = j * SPACING;

          // Distance between this dot and the mouse
          const dx = mouse.x - baseX;
          const dy = mouse.y - baseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let r = BASE_RADIUS;
          let alpha = 0.15; // Normal opacity
          let x = baseX;
          let y = baseY;

          if (dist < EFFECT_RADIUS) {
            // Smooth easing factor (0 to 1)
            const factor = Math.pow(1 - dist / EFFECT_RADIUS, 2);

            // 1. Zoom in size
            r = BASE_RADIUS + (MAX_RADIUS - BASE_RADIUS) * factor;

            // 2. Brighten dot opacity
            alpha = 0.15 + 0.85 * factor;

            // 3. Subtle displacement / physical push effect
            const pullForce = factor * 4;
            x += (dx / dist) * pullForce;
            y += (dy / dist) * pullForce;
          }

          // Draw Dot
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
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