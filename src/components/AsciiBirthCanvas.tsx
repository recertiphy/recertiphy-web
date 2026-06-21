import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { STARRY_NIGHT_HEX, STARRY_NIGHT_COLS, STARRY_NIGHT_ROWS } from './starryNightData';

const MOON_CHARS =
  " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";
const FIELD_CHARS = '  ..::--==++**##@@'.split('');

// Precomputed noise lookup table for performance (256x256 values)
const noiseLUT = new Float32Array(256 * 256);
for (let i = 0; i < 256 * 256; i++) {
  noiseLUT[i] = Math.random();
}

// Bilinear-filtered value noise using LUT (zero Math.sin calls in inner loop)
const sampleNoiseLUT = (x: number, y: number) => {
  const xWrapped = x < 0 ? 256 - (Math.abs(x) % 256) : x % 256;
  const yWrapped = y < 0 ? 256 - (Math.abs(y) % 256) : y % 256;

  const x0 = Math.floor(xWrapped) & 255;
  const y0 = Math.floor(yWrapped) & 255;
  const x1 = (x0 + 1) & 255;
  const y1 = (y0 + 1) & 255;

  const tx = xWrapped - Math.floor(xWrapped);
  const ty = yWrapped - Math.floor(yWrapped);

  const u = tx * tx * (3 - 2 * tx);
  const v = ty * ty * (3 - 2 * ty);

  const n00 = noiseLUT[y0 * 256 + x0];
  const n10 = noiseLUT[y0 * 256 + x1];
  const n01 = noiseLUT[y1 * 256 + x0];
  const n11 = noiseLUT[y1 * 256 + x1];

  return (1 - v) * ((1 - u) * n00 + u * n10) + v * ((1 - u) * n01 + u * n11);
};

const noise2D = (x: number, y: number) => {
  return sampleNoiseLUT(x, y);
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));


export interface AsciiBirthCanvasRef {
  start: () => void;
  stop: () => void;
}

interface AsciiBirthCanvasProps {
  animStateRef: React.RefObject<{
    bgProgress: number;
    sphereProgress: number;
    sphereScale: number;
    sphereX: number;
    sphereY: number;
    colorProgress: number;
  }>;
}

const AsciiBirthCanvas = forwardRef<AsciiBirthCanvasRef, AsciiBirthCanvasProps>(
  ({ animStateRef }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isLooping = useRef(false);
    
    const startLoopRef = useRef<() => void>(() => {});
    const stopLoopRef = useRef<() => void>(() => {});

    useImperativeHandle(ref, () => ({
      start() {
        startLoopRef.current();
      },
      stop() {
        stopLoopRef.current();
      }
    }));

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
        if (!canvas.parentElement) return;
        width = canvas.parentElement.offsetWidth;
        height = canvas.parentElement.offsetHeight;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        cols = width < 768 ? 95 : 135;
        const cellW = width / cols;
        const cellH = cellW * 1.18;
        rows = Math.ceil(height / cellH);

        // Render one frame immediately on resize to keep visuals up to date
        renderSingleFrame();
      };

      const renderSingleFrame = () => {
        // Background color
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        const state = animStateRef.current;
        if (!state) return;

        const bgProgress = state.bgProgress;
        const sphereProgress = state.sphereProgress;
        const sphereScale = state.sphereScale;
        const colorProgress = state.colorProgress;

        const cellW = width / cols;
        const cellH = cellW * 1.18;

        // Fast path for the start of the section (flat Starry Night art)
        if (sphereProgress <= 0.001 && bgProgress <= 0.001) {
          ctx.font = `${cellH * 0.84}px "Fragment Mono", monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          for (let r = 0; r < rows; r++) {
            const rowY = r * cellH + cellH / 2;
            const ny = rowY / height;

            for (let c = 0; c < cols; c++) {
              const x = c * cellW + cellW / 2;
              const nx = x / width;

              const tx = Math.floor(nx * STARRY_NIGHT_COLS);
              const ty = Math.floor(ny * STARRY_NIGHT_ROWS);
              const texCol = clamp(tx, 0, STARRY_NIGHT_COLS - 1);
              const texRow = clamp(ty, 0, STARRY_NIGHT_ROWS - 1);

              const colorIdx = (texRow * STARRY_NIGHT_COLS + texCol) * 6;
              const rVal = parseInt(STARRY_NIGHT_HEX.substring(colorIdx, colorIdx + 2), 16);
              const gVal = parseInt(STARRY_NIGHT_HEX.substring(colorIdx + 2, colorIdx + 4), 16);
              const bVal = parseInt(STARRY_NIGHT_HEX.substring(colorIdx + 4, colorIdx + 6), 16);

              const starryColor = `rgba(${rVal}, ${gVal}, ${bVal}`;
              let starryOpacity = 0.90;
              if (rVal > 190 && gVal > 170) {
                starryOpacity = 0.90 + Math.sin(time * 2.5 + (rVal + c) * 0.3) * 0.10;
              }

              const charSeed = noise2D(nx * 12, ny * 12);
              const char = charSeed > 0.5 ? '1' : '0';

              ctx.fillStyle = `${starryColor}, ${starryOpacity})`;
              ctx.fillText(char, x, rowY);
            }
          }
          return;
        }

        const starX = state.sphereX * width;
        const starY = state.sphereY * height;

        const baseRadius = Math.min(width, height) * (width < 768 ? 0.28 : 0.22);
        const starRadius = baseRadius * sphereScale;
        const radiusForCalc = Math.max(1.0, starRadius);

        // Center footprint coordinates for the sphere formation in lower center
        const starCenterX = width * 0.5;
        const starCenterY = height * 0.65;

        ctx.font = `${cellH * 0.84}px "Fragment Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let lx = -1.0;
        let ly = 0.15;
        let lz = -0.6;
        const lLen = Math.hypot(lx, ly, lz);
        lx /= lLen;
        ly /= lLen;
        lz /= lLen;

        const t = sphereProgress; // transition progress (0 -> 1)
        const coordT = 1 - Math.pow(1 - t, 3); // spring-like fast initial collapse
        const elasticFactor = Math.sin(t * Math.PI * 2) * Math.pow(1 - t, 1.5); // spring-like overshoot wiggles

        for (let r = 0; r < rows; r++) {
          const rowY = r * cellH + cellH / 2;
          const laneNorm = rowY / height;
          const laneSpeed = 1.75;

          for (let c = 0; c < cols; c++) {
            const x = c * cellW + cellW / 2;
            const y = rowY;

            const nx = x / width;
            const ny = y / height;

            // --- 1. DETERMINE STARRY NIGHT ELEMENT COLOR & OPACITY FOR THE CELL ---
            const tx = Math.floor(nx * STARRY_NIGHT_COLS);
            const ty = Math.floor(ny * STARRY_NIGHT_ROWS);
            const texCol = clamp(tx, 0, STARRY_NIGHT_COLS - 1);
            const texRow = clamp(ty, 0, STARRY_NIGHT_ROWS - 1);

            const colorIdx = (texRow * STARRY_NIGHT_COLS + texCol) * 6;
            const rVal = parseInt(STARRY_NIGHT_HEX.substring(colorIdx, colorIdx + 2), 16);
            const gVal = parseInt(STARRY_NIGHT_HEX.substring(colorIdx + 2, colorIdx + 4), 16);
            const bVal = parseInt(STARRY_NIGHT_HEX.substring(colorIdx + 4, colorIdx + 6), 16);

            const starryColor = `rgba(${rVal}, ${gVal}, ${bVal}`;
            let starryOpacity = 0.90;
            // Add subtle twinkling to stars and crescent moon
            if (rVal > 190 && gVal > 170) {
              starryOpacity = 0.90 + Math.sin(time * 2.5 + (rVal + c) * 0.3) * 0.10;
            }

            // --- 2. TRANSITION COORDINATES AND RENDER CELLS ---
            const distToCenter = Math.hypot(x - starCenterX, y - starCenterY);
            const isSphereCell = distToCenter < baseRadius;

            const dxCurrent = x - starX;
            const dyCurrent = y - starY;
            const distCurrent = Math.hypot(dxCurrent, dyCurrent);
            const normDistCurrent = distCurrent / radiusForCalc;

            if (isSphereCell) {
              // --- CELL DOCKS INTO SPHERE ---
              // Target coordinates in the moving, scaling sphere
              const targetX = starX + (x - starCenterX) * sphereScale;
              const targetY = starY + (y - starCenterY) * sphereScale;

              // Elastic Scrambling displacement
              const scrambleX = Math.sin(r * 0.4 + time * 1.5) * (width * 0.16) * elasticFactor + Math.sin(time * 5.0 + r * 0.5) * 15 * elasticFactor;
              const scrambleY = Math.cos(c * 0.4 + time * 1.2) * (height * 0.16) * elasticFactor + Math.cos(time * 4.0 + c * 0.5) * 15 * elasticFactor;

              const drawX = (1 - coordT) * x + coordT * targetX + scrambleX;
              const drawY = (1 - coordT) * y + coordT * targetY + scrambleY;

              const currentDx = drawX - starX;
              const currentDy = drawY - starY;

              let char = '';
              let opacity = 0;

              if (t < 0.8) {
                // Starry Night phase (strictly binary 0s and 1s)
                const charSeed = noise2D(nx * 12, ny * 12);
                char = charSeed > 0.5 ? '1' : '0';
                opacity = starryOpacity;
                
                const localX = currentDx / radiusForCalc;
                if (localX < 0.10) {
                  // Left 55% of width is orange tone
                  ctx.fillStyle = `rgba(240, 110, 32, ${opacity})`;
                } else {
                  // Outer part is the Starry Night color
                  ctx.fillStyle = `${starryColor}, ${opacity})`;
                }
              } else {
                // Sphere formed phase (glowing shaded star)
                const localX = currentDx / radiusForCalc;
                const localY = -currentDy / radiusForCalc;
                const localR2 = localX * localX + localY * localY;
                const z = Math.sqrt(Math.max(0, 1.0 - localR2));

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
                const ambient = 0.45; // Increased base ambient for glowing star effect
                const intensity = ambient + diffuse * albedo * 1.15;
                
                const moonIdx = clamp(
                  Math.floor(intensity * (MOON_CHARS.length - 1)),
                  0,
                  MOON_CHARS.length - 1
                );
                char = MOON_CHARS[moonIdx];
                opacity = clamp(0.15 + intensity * 0.85, 0.15, 1.0);

                // Left 55% of width transitions to warm orange, keeping rest cool cyan/white
                if (localX < 0.10) {
                  const rVal = Math.round(180 + (240 - 180) * colorProgress);
                  const gVal = Math.round(235 + (110 - 235) * colorProgress);
                  const bVal = Math.round(255 + (32 - 255) * colorProgress);
                  ctx.fillStyle = `rgba(${rVal}, ${gVal}, ${bVal}, ${opacity})`;
                } else {
                  ctx.fillStyle = `rgba(180, 235, 255, ${opacity})`;
                }
              }

              ctx.fillText(char, drawX, drawY);

            } else {
              // --- CELL SCRAMBLES & FADES OUT (Sky/Cypress cells) ---
              if (t < 0.99) {
                const scrambleX = Math.sin(r * 0.4 + time * 1.5) * (width * 0.16) * elasticFactor;
                const scrambleY = Math.cos(c * 0.4 + time * 1.2) * (height * 0.16) * elasticFactor;

                const drawX = x + scrambleX;
                const drawY = y + scrambleY;

                const charSeed = noise2D(nx * 12, ny * 12);
                const char = charSeed > 0.5 ? '1' : '0';
                
                // Fade out as transition t reaches 1.0
                const opacity = starryOpacity * (1 - t);

                if (opacity > 0.02) {
                  ctx.fillStyle = `${starryColor}, ${opacity})`;
                  ctx.fillText(char, drawX, drawY);
                }
              }

              // --- FADE IN STREAMING CORONA SPACE DUST (once star starts forming) ---
              if (bgProgress > 0.01) {
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

                // Corona illumination outside star
                const illumination = Math.exp(-Math.pow((normDistCurrent - 1.0) * 1.8, 2)) * colorProgress;
                density += illumination * 0.22;

                const bgThreshold = 0.75 - 0.17 * bgProgress;

                if (density > bgThreshold) {
                  const fieldIdx = clamp(
                    Math.floor(density * (FIELD_CHARS.length - 1)),
                    0,
                    FIELD_CHARS.length - 1
                  );
                  const char = FIELD_CHARS[fieldIdx];
                  const opacity = (0.012 + density * 0.08) * bgProgress;

                  let drawX = x;
                  let drawY = y;

                  // Streaming horizontal travel
                  drawX += (laneSpeed * 8 + flowB * 16) % (cellW * 3);
                  drawY += Math.sin(sampleX * 2.2 + time + laneNorm * 8) * 1.8;

                  // Swirl flow
                  if (t > 0.1 && sphereScale > 0.1) {
                    const angle = Math.atan2(dyCurrent, dxCurrent);
                    const orbitBand = Math.exp(-Math.pow((distCurrent / radiusForCalc - 1.15) * 6, 2));
                    const swirl = orbitBand * 10;
                    drawX += -Math.sin(angle) * swirl;
                    drawY += Math.cos(angle) * swirl * 0.6;
                  }

                  // Interpolate dust color based on star corona illumination
                  const rVal = Math.round(180 + (245 - 180) * illumination);
                  const gVal = Math.round(210 + (110 - 210) * illumination);
                  const bVal = Math.round(230 + (32 - 230) * illumination);
                  
                  ctx.fillStyle = `rgba(${rVal}, ${gVal}, ${bVal}, ${opacity})`;
                  ctx.fillText(char, drawX, drawY);
                }
              }
            }
          }
        }
      };

      const draw = () => {
        if (!isLooping.current) return;
        time += 0.012;
        renderSingleFrame();
        rafId = requestAnimationFrame(draw);
      };

      startLoopRef.current = () => {
        if (!isLooping.current) {
          isLooping.current = true;
          draw();
        }
      };

      stopLoopRef.current = () => {
        isLooping.current = false;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
        // Force-draw a final frame so the canvas matches the exact scroll position when stopped (especially t = 0)
        renderSingleFrame();
      };

      document.fonts.ready.then(() => {
        resize();
        renderSingleFrame();
      });

      window.addEventListener('resize', resize);

      return () => {
        isLooping.current = false;
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
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
);

AsciiBirthCanvas.displayName = 'AsciiBirthCanvas';
export default AsciiBirthCanvas;
