import { useEffect, useRef } from 'react';

const MOON_CHARS =
  " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";
const FIELD_CHARS = '  ..::--==++**##@@'.split('');

const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
};

const smooth = (t: number) => t * t * (3 - 2 * t);

const noise2D = (x: number, y: number) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);

  const ux = smooth(fx);
  const uy = smooth(fy);

  return (
    a * (1 - ux) * (1 - uy) +
    b * ux * (1 - uy) +
    c * (1 - ux) * uy +
    d * ux * uy
  );
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

interface AsciiBirthCanvasProps {
  progress: number; // 0 to 1 scroll progress
}

export default function AsciiBirthCanvas({ progress }: AsciiBirthCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(progress);

  // Sync prop to ref for read in requestAnimationFrame loop
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let time = 0;
    let rafId = 0;

    const resize = () => {
      width = canvas.parentElement!.offsetWidth;
      height = canvas.parentElement!.offsetHeight;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      cols = width < 768 ? 90 : 128;
      const cellW = width / cols;
      const cellH = cellW * 1.18;
      rows = Math.ceil(height / cellH);
    };

    const draw = () => {
      // Background color
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      time += 0.012;
      const prog = progressRef.current;

      const cellW = width / cols;
      const cellH = cellW * 1.18;

      // Position the star below the title text
      const starX = width * 0.5;
      const starY = height * 0.55;

      // Sphere radius grows as scroll progress increases
      const baseRadius = Math.min(width, height) * (width < 768 ? 0.28 : 0.22);
      const starRadius = baseRadius * prog;

      ctx.font = `${cellH * 0.84}px "Fragment Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Light direction
      let lx = 1.0;
      let ly = 0.15;
      let lz = -0.6;
      const lLen = Math.hypot(lx, ly, lz);
      lx /= lLen;
      ly /= lLen;
      lz /= lLen;

      const displacement = 1 - prog;

      for (let r = 0; r < rows; r++) {
        const rowY = r * cellH + cellH / 2;
        const laneNorm = rowY / height;
        const laneSpeed = 1.75;

        for (let c = 0; c < cols; c++) {
          const x = c * cellW + cellW / 2;
          const y = rowY;

          let drawX = x;
          let drawY = y;

          const dx = x - starX;
          const dy = y - starY;
          const dist = Math.hypot(dx, dy);

          // 1. Gravity particle pull effect: particles are pulled from random positions into the sphere
          if (displacement > 0.001) {
            // Chaotic scatter
            const scatterX = Math.sin(r * 0.4 + time * 1.5) * 120 * displacement;
            const scatterY = Math.cos(c * 0.4 + time * 1.2) * 120 * displacement;

            // Pull towards the center of the star
            const pullX = dx * displacement * 0.75;
            const pullY = dy * displacement * 0.75;

            drawX += scatterX - pullX;
            drawY += scatterY - pullY;
          }

          // Recalculate distance after displacement for rendering checks
          const currentDx = drawX - starX;
          const currentDy = drawY - starY;
          const currentDist = Math.hypot(currentDx, currentDy);
          const normDist = currentDist / (starRadius || 1);

          let char = '';
          let opacity = 0;
          let isStarCell = false;

          if (prog > 0.05 && normDist < 1.0) {
            isStarCell = true;
            const localX = currentDx / (starRadius || 1);
            const localY = -currentDy / (starRadius || 1);
            const localR2 = localX * localX + localY * localY;
            const z = Math.sqrt(Math.max(0, 1.0 - localR2));

            // Star rotation
            const angle = time * 0.25;
            const px = localX * Math.cos(angle) - z * Math.sin(angle);
            const py = localY;
            const pz = localX * Math.sin(angle) + z * Math.cos(angle);

            let diffuse = px * lx + py * ly + pz * lz;
            diffuse = Math.max(0, diffuse);

            const maria =
              noise2D(px * 2.6 + 4.2, py * 2.6 - 1.7) * 0.6 +
              noise2D(pz * 3.4 - 8.1, py * 3.4 + 5.4) * 0.4;
            const craters =
              noise2D(px * 12.0 + py * 6.0 + 30.0, pz * 12.0 - px * 4.0 - 20.0) * 0.65 +
              noise2D(px * 20.0 - 11.0, py * 20.0 + 7.0) * 0.35;

            const albedo = clamp(0.76 + craters * 0.14 - maria * 0.18, 0.52, 0.92);

            const ambient = 0.05;
            const intensity = ambient + diffuse * albedo * 1.5;
            const moonIdx = clamp(
              Math.floor(intensity * (MOON_CHARS.length - 1)),
              0,
              MOON_CHARS.length - 1
            );

            char = MOON_CHARS[moonIdx];
            opacity = clamp(0.1 + intensity * 0.9, 0.1, 1.0);
          } else {
            // Background flow field (starry space dust)
            const sampleX =
              c * 0.085 -
              time * (1.8 + laneSpeed * 1.6);
            const sampleY =
              r * 0.11 +
              Math.sin(c * 0.025 + time * 1.2) * 0.6;

            const flowA = noise2D(sampleX, sampleY);
            const flowB = noise2D(sampleX * 1.7 + 20, sampleY * 0.8 - 14);
            const wave =
              Math.sin(sampleX * 1.9 + laneNorm * 14) * 0.5 +
              Math.cos(sampleY * 2.4 - time * 2.1) * 0.5;

            let density = flowA * 0.42 + flowB * 0.28 + (wave * 0.5 + 0.5) * 0.3;

            // Orbit ring around the growing star
            if (prog > 0.1) {
              const orbitBand = Math.exp(-Math.pow((dist / starRadius - 1.15) * 6, 2));
              density += orbitBand * 0.15;
            }

            if (density > 0.42) {
              const fieldIdx = clamp(
                Math.floor(density * (FIELD_CHARS.length - 1)),
                0,
                FIELD_CHARS.length - 1
              );
              char = FIELD_CHARS[fieldIdx];
              opacity = 0.01 + density * 0.06;

              // Swirl flow around the star
              if (prog > 0.1) {
                const angle = Math.atan2(dy, dx);
                const orbitBand = Math.exp(-Math.pow((dist / starRadius - 1.15) * 6, 2));
                const swirl = orbitBand * 8;
                drawX += -Math.sin(angle) * swirl;
                drawY += Math.cos(angle) * swirl * 0.6;
              }
            }
          }

          if (!char || opacity <= 0.02) continue;

          // 2. Color shift logic: Interpolate star cell colors to warm, light darkish orange as it grows
          if (isStarCell) {
            // Transition color from white (prog = 0) to glowing orange (prog = 1)
            // Orange tone: rgba(240, 110, 32)
            const rVal = Math.round(232 + (240 - 232) * prog);
            const gVal = Math.round(230 + (120 - 230) * prog);
            const bVal = Math.round(224 + (32 - 224) * prog);
            ctx.fillStyle = `rgba(${rVal}, ${gVal}, ${bVal}, ${opacity})`;
          } else {
            // Standard space dust is dim white
            ctx.fillStyle = `rgba(232, 230, 224, ${opacity})`;
          }

          ctx.fillText(char, drawX, drawY);
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    document.fonts.ready.then(() => {
      resize();
      draw();
    });

    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
}
