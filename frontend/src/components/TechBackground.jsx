import React, { useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * Bold tech background: animated particle network + scanning beam + grid pulse.
 * Designed to be clearly visible behind decorative section shapes.
 */
export default function TechBackground() {
  const ref = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf, w, h;
    const mouse = { x: -9999, y: -9999 };

    const isDark = theme === "dark";
    const baseRGB = isDark ? "0, 240, 255" : "0, 102, 255";

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    // Denser particles for visibility
    const count = Math.min(150, Math.floor((w * h) / 9000));
    const nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      r: 1.2 + Math.random() * 1.6,
      pulse: Math.random() * Math.PI * 2,
    }));

    // Roaming "scanner" point that creates extra connection focal
    const scanner = {
      x: w * 0.3,
      y: h * 0.4,
      angle: Math.random() * Math.PI * 2,
      speed: 0.6,
    };

    function tick(t) {
      const time = t * 0.001;
      ctx.clearRect(0, 0, w, h);

      // Move scanner
      scanner.x += Math.cos(scanner.angle) * scanner.speed;
      scanner.y += Math.sin(scanner.angle) * scanner.speed;
      if (scanner.x < 50 || scanner.x > w - 50) scanner.angle = Math.PI - scanner.angle;
      if (scanner.y < 50 || scanner.y > h - 50) scanner.angle = -scanner.angle;
      scanner.angle += (Math.random() - 0.5) * 0.06;

      // Update + draw nodes with halo
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        n.pulse += 0.02;

        // mouse repel
        const dxm = n.x - mouse.x, dym = n.y - mouse.y;
        const dm = Math.hypot(dxm, dym);
        if (dm < 160) {
          n.x += (dxm / dm) * 0.7;
          n.y += (dym / dm) * 0.7;
        }

        const pulseAlpha = 0.55 + Math.sin(n.pulse) * 0.25;

        // Halo
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6);
        grad.addColorStop(0, `rgba(${baseRGB}, ${pulseAlpha * 0.5})`);
        grad.addColorStop(1, `rgba(${baseRGB}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2);
        ctx.fill();

        // Solid core
        ctx.fillStyle = `rgba(${baseRGB}, ${pulseAlpha})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Connections — denser & brighter
      const maxDist = 150;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < maxDist) {
            const alpha = (1 - d / maxDist) * 0.45;
            ctx.strokeStyle = `rgba(${baseRGB}, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Scanner connections to nearby nodes (highlight effect)
      for (const n of nodes) {
        const dx = n.x - scanner.x, dy = n.y - scanner.y;
        const d = Math.hypot(dx, dy);
        if (d < 220) {
          const alpha = (1 - d / 220) * 0.55;
          ctx.strokeStyle = `rgba(${baseRGB}, ${alpha})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(scanner.x, scanner.y);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();
        }
      }

      // Scanner core
      const pulseR = 4 + Math.sin(time * 2) * 1.5;
      const scanGrad = ctx.createRadialGradient(scanner.x, scanner.y, 0, scanner.x, scanner.y, 40);
      scanGrad.addColorStop(0, `rgba(${baseRGB}, 0.8)`);
      scanGrad.addColorStop(1, `rgba(${baseRGB}, 0)`);
      ctx.fillStyle = scanGrad;
      ctx.beginPath();
      ctx.arc(scanner.x, scanner.y, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(${baseRGB}, 1)`;
      ctx.beginPath();
      ctx.arc(scanner.x, scanner.y, pulseR, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }
    function onLeave() { mouse.x = -9999; mouse.y = -9999; }
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, [theme]);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" data-testid="tech-background">
      <div className="absolute inset-0 tech-grid-bold" />
      <canvas ref={ref} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/70" />
    </div>
  );
}
