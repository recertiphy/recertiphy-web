import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { STARRY_NIGHT_HEX, STARRY_NIGHT_COLS, STARRY_NIGHT_ROWS } from './starryNightData';


// Precomputed noise lookup table for performance (256x256 values)
const noiseLUT = new Float32Array(256 * 256);
for (let i = 0; i < 256 * 256; i++) {
  noiseLUT[i] = Math.random();
}

const FIELD_CHARS = '  ..::--==++**##@@'.split('');
const RING_CHARS = 'XIlueYkU15SHoSmZq9[]5dqa1xxi'.split('');

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

// Precomputed RGB buffer for Starry Night hex data
const STARRY_NIGHT_RGB = new Uint8Array(STARRY_NIGHT_COLS * STARRY_NIGHT_ROWS * 3);
for (let i = 0; i < STARRY_NIGHT_COLS * STARRY_NIGHT_ROWS; i++) {
  const colorIdx = i * 6;
  STARRY_NIGHT_RGB[i * 3]     = parseInt(STARRY_NIGHT_HEX.substring(colorIdx, colorIdx + 2), 16);
  STARRY_NIGHT_RGB[i * 3 + 1] = parseInt(STARRY_NIGHT_HEX.substring(colorIdx + 2, colorIdx + 4), 16);
  STARRY_NIGHT_RGB[i * 3 + 2] = parseInt(STARRY_NIGHT_HEX.substring(colorIdx + 4, colorIdx + 6), 16);
}

const getStarryNightColor = (x: number, y: number, canvasWidth: number, canvasHeight: number) => {
  const scaleX = STARRY_NIGHT_COLS / canvasWidth;
  const scaleY = STARRY_NIGHT_ROWS / canvasHeight;
  const coverScale = Math.min(scaleX, scaleY);

  // Map canvas coordinate (x, y) to texture space using CSS cover mode
  const texX = (x - canvasWidth / 2) * coverScale + STARRY_NIGHT_COLS / 2;
  const texY = (y - canvasHeight / 2) * coverScale + STARRY_NIGHT_ROWS / 2;

  const texCol = clamp(Math.floor(texX), 0, STARRY_NIGHT_COLS - 1);
  const texRow = clamp(Math.floor(texY), 0, STARRY_NIGHT_ROWS - 1);

  const pixelIdx = (texRow * STARRY_NIGHT_COLS + texCol) * 3;
  const rVal = STARRY_NIGHT_RGB[pixelIdx];
  const gVal = STARRY_NIGHT_RGB[pixelIdx + 1];
  const bVal = STARRY_NIGHT_RGB[pixelIdx + 2];

  return { rVal, gVal, bVal, texCol, texRow };
};


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
    shadeProgress: number;
    blackHoleProgress: number;
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

        // Adjust column count dynamically for performance and readable size
        if (width < 480) {
          cols = 55; // Small mobile
        } else if (width < 768) {
          cols = 75; // Tablet/Large mobile
        } else {
          cols = 135; // Desktop
        }

        const cellW = width / cols;
        const cellH = cellW * 1.18;
        rows = Math.ceil(height / cellH);

        // Render one frame immediately on resize to keep visuals up to date
        renderSingleFrame();
      };

      const renderSingleFrame = () => {
        const state = animStateRef.current;
        if (!state) return;

        const bh = state.blackHoleProgress; // black hole progress (0 -> 1)

        // Background color shifts from `#000000` to `#0A0A0A` based on `bh`
        const bgR = Math.round(0 + 10 * bh);
        const bgG = Math.round(0 + 10 * bh);
        const bgB = Math.round(0 + 10 * bh);
        ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
        ctx.fillRect(0, 0, width, height);

        const bgProgress = state.bgProgress;
        const sphereProgress = state.sphereProgress;
        const shadeProgress = state.shadeProgress;

        const cellW = width / cols;
        const cellH = cellW * 1.18;

        // Fast path for the start of the section (flat Starry Night art)
        if (sphereProgress <= 0.001 && bgProgress <= 0.001) {
          ctx.font = `${cellH * 0.84}px "Fragment Mono", monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          for (let r = 0; r < rows; r++) {
            const rowY = r * cellH + cellH / 2;

            for (let c = 0; c < cols; c++) {
              const x = c * cellW + cellW / 2;

              const { rVal, gVal, bVal } = getStarryNightColor(x, rowY, width, height);
              const starryColor = `rgba(${rVal}, ${gVal}, ${bVal}`;

              let starryOpacity = 0.90;
              if (rVal > 190 && gVal > 170) {
                starryOpacity = 0.90 + Math.sin(time * 2.5 + (rVal + c) * 0.3) * 0.10;
              }

              const charSeed = noise2D((x / width) * 12, (rowY / height) * 12);
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

        // Center footprint coordinates for the sphere formation (perfect center)
        const starCenterX = width * 0.5;
        const starCenterY = height * 0.5;

        ctx.font = `${cellH * 0.84}px "Fragment Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Dynamic light vector: shifts/rotates on scroll to crawl shadow from left to right
        let lx = 1.0 - 2.0 * shadeProgress; 
        let ly = 0.15;
        let lz = -0.10; // Sets shadow boundary around localX = 0.10 (55% width from left) at start
        const lLen = Math.hypot(lx, ly, lz);
        lx /= lLen;
        ly /= lLen;
        lz /= lLen;

        const t = sphereProgress; // transition progress (0 -> 1)
        
        // Easing transition: Quad ease-in-out for extremely smooth transition
        const coordT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        // Shift center of rotation and black hole on scroll
        const centerX = starCenterX + (starX - starCenterX) * coordT;
        const centerY = starCenterY + (starY - starCenterY) * coordT;

        // Slow rotation angle for the background sheet
        const angle = -0.32 * coordT;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        // Precompute column waves for efficiency
        const colWaves = new Float32Array(cols);
        for (let c = 0; c < cols; c++) {
          colWaves[c] = Math.sin(c * 0.18 + time * 2.2) * 8.0;
        }

        // Black Hole Horizon Radius (sized to match reference sphere beautifully)
        const bhRadius = baseRadius * 0.85;

        // Two-pass rendering list for small ring characters (prevents layout CPU lockups)
        interface RingCharToDraw {
          char: string;
          x: number;
          y: number;
          r: number;
          g: number;
          b: number;
          opacity: number;
        }
        const ringCharsList: RingCharToDraw[] = [];

        for (let r = 0; r < rows; r++) {
          const rowY = r * cellH + cellH / 2;
          const rowWave = Math.cos(r * 0.18 + time * 2.2) * 8.0;
          const laneNorm = rowY / height;
          const laneSpeed = 1.75;

          for (let c = 0; c < cols; c++) {
            const x = c * cellW + cellW / 2;
            const y = rowY;

            // Original coordinates relative to screen center
            const dx = x - starCenterX;
            const dy = y - starCenterY;

            const charSeed = noise2D((x / width) * 12, (rowY / height) * 12);

            // 1. If the black hole is forming and this cell falls inside the event horizon void, skip it (keep it black)
            if (bh > 0.001) {
              const dxCell = x - centerX;
              const dyCell = y - centerY;
              if (Math.hypot(dxCell, dyCell) < bhRadius * 0.92) {
                continue;
              }
            }

            // 2. Render outside of black hole (collapsing primary grid + streaming background)

            // --- Primary Grid (Starry Night / Sphere -> Spiraling Collapse to Ring) ---
            const { rVal, gVal, bVal } = getStarryNightColor(x, y, width, height);
            let starryOpacity = 0.90;
            if (rVal > 190 && gVal > 170) {
              starryOpacity = 0.90 + Math.sin(time * 2.5 + (rVal + c) * 0.3) * 0.10;
            }

            // Original coordinates after slow rotation and scrambling
            const rx = dx * cosA - dy * sinA;
            const ry = dx * sinA + dy * cosA;
            const baseX = centerX + rx;
            const baseY = centerY + ry;

            // Wavy corners
            const ndX = Math.abs(dx) / (width * 0.5);
            const ndY = Math.abs(dy) / (height * 0.5);
            const cornerFactor = 1.0 + 3.0 * (ndX * ndX + ndY * ndY);

            const scrambleX = rowWave * coordT * cornerFactor;
            const scrambleY = colWaves[c] * coordT * cornerFactor;

            const drawX = baseX + scrambleX;
            const drawY = baseY + scrambleY;

            // Calculate position relative to black hole center for collapse logic
            const dxBH = drawX - centerX;
            const dyBH = drawY - centerY;
            const distBH = Math.hypot(dxBH, dyBH);
            const angleBH = Math.atan2(dyBH, dxBH);

            // Calculate final primary coordinates and color
            let drawPrimaryX = drawX;
            let drawPrimaryY = drawY;
            let primaryChar = charSeed > 0.5 ? '1' : '0';
            let primaryOpacity = starryOpacity;
            let primaryR = rVal;
            let primaryG = gVal;
            let primaryB = bVal;

            if (bh > 0.001) {
              // Target radius: wavy ring shape with 5 concentric strands
              const strandIdx = (c * 23 + r * 37) % 5;
              const frequency = 3 + strandIdx * 1.2;
              const speed = 2.0 - strandIdx * 0.3;
              const amplitude = bhRadius * (0.04 + strandIdx * 0.012);
              const phase = time * speed + strandIdx * (Math.PI / 2.5);

              // Calculate the wavy target radius for this particle
              const targetRadius = bhRadius * (0.95 + strandIdx * 0.04) + Math.sin(angleBH * frequency + phase) * amplitude;

              // Add a small noise offset to make it look organic (fuzzy accretion disk)
              const noiseOffset = (noise2D(c * 0.5, r * 0.5) - 0.5) * bhRadius * 0.03 * bh;
              const finalTargetRadius = targetRadius + noiseOffset;

              // Interpolate distance: original distance (distBH) -> wavy target radius (finalTargetRadius)
              const drawDistance = distBH * (1 - bh) + finalTargetRadius * bh;

              // Spiral rotation: rotate coordinates as they collapse into the vortex
              const spiralSpeed = 6.0;
              const spiralAngle = angleBH + bh * spiralSpeed * (1.0 - distBH / Math.max(width, height)) - time * 2.2 * bh;

              // Chaotic scattering during transition (peaks at bh = 0.5, returns to 0 at bh = 1.0)
              const scatterStrength = Math.sin(bh * Math.PI) * 45 * (1.0 + (c % 3) * 0.4);
              const noiseValX = noise2D(c * 0.2 + time, r * 0.2);
              const noiseValY = noise2D(c * 0.2, r * 0.2 + time);
              const scatterX = (noiseValX - 0.5) * scatterStrength;
              const scatterY = (noiseValY - 0.5) * scatterStrength;

              drawPrimaryX = centerX + Math.cos(spiralAngle) * drawDistance + scatterX;
              drawPrimaryY = centerY + Math.sin(spiralAngle) * drawDistance + scatterY;

              // Skip rendering if the lensed coordinate ends up inside the void
              const finalDistBH = Math.hypot(drawPrimaryX - centerX, drawPrimaryY - centerY);
              if (finalDistBH < bhRadius * 0.92) {
                primaryOpacity = 0;
              }

              // Density Control: Only 50% survive on the ring to make it clean but visible
              const survivalSeed = noise2D(c * 7.7, r * 9.3);
              const survivalThreshold = 1.0 - 0.50 * bh;
              if (survivalSeed > survivalThreshold) {
                primaryOpacity *= (1 - bh);
              }

              // Use ring characters for collapsing characters to make the accretion ring look authentic
              const charIdx = Math.floor(noise2D(x * 0.5, y * 0.5) * RING_CHARS.length);
              primaryChar = RING_CHARS[charIdx];

              // Color transition to glowing orange near the event horizon
              primaryR = Math.round(rVal + (255 - rVal) * bh);
              primaryG = Math.round(gVal + (105 - gVal) * bh);
              primaryB = Math.round(bVal + (0 - bVal) * bh);
            }

            const isRingChar = bh > 0.001;

            if (primaryOpacity > 0.02) {
              if (isRingChar) {
                // Save ring characters to draw them in Pass 2 with a smaller font
                ringCharsList.push({
                  char: primaryChar,
                  x: drawPrimaryX,
                  y: drawPrimaryY,
                  r: primaryR,
                  g: primaryG,
                  b: primaryB,
                  opacity: primaryOpacity
                });
              } else {
                ctx.fillStyle = `rgba(${primaryR}, ${primaryG}, ${primaryB}, ${primaryOpacity})`;
                ctx.fillText(primaryChar, drawPrimaryX, drawPrimaryY);
              }
            }

            // --- Streaming Background (Hero-like Flow Field) ---
            if (bh > 0.001) {
              const sampleX = c * 0.085 - time * (1.8 + laneSpeed * 1.6);
              const sampleY = r * 0.11 + Math.sin(c * 0.025 + time * 1.2) * 0.6;

              const flowA = noise2D(sampleX, sampleY);
              const flowB = noise2D(sampleX * 1.7 + 20, sampleY * 0.8 - 14);
              const wave = Math.sin(sampleX * 1.9 + laneNorm * 14) * 0.5 + Math.cos(sampleY * 2.4 - time * 2.1) * 0.5;

              let density = flowA * 0.42 + flowB * 0.28 + (wave * 0.5 + 0.5) * 0.3;

              // Base dust coordinate travelling horizontally
              const dustX = x + (laneSpeed * 8 + flowB * 16) % (cellW * 3);
              const dustY = rowY + Math.sin(sampleX * 2.2 + time + laneNorm * 8) * 1.8;
              
              const dxDust = dustX - centerX;
              const dyDust = dustY - centerY;
              const distDust = Math.hypot(dxDust, dyDust);
              const normDust = distDust / bhRadius;

              if (density > 0.38 && normDust >= 0.92) {
                const fieldIdx = clamp(Math.floor(density * (FIELD_CHARS.length - 1)), 0, FIELD_CHARS.length - 1);
                const streamChar = FIELD_CHARS[fieldIdx];

                // Gravitational lensing (push outward near horizon)
                const lensFactor = 1.0 + (0.30 / (normDust * normDust + 0.15)) * bh;
                const lensedDist = distDust * lensFactor;
                const angleDust = Math.atan2(dyDust, dxDust);

                // Swirl angle deflection: spiral rotation around center
                const swirlFactor = (1.2 * bh) / (normDust * normDust + 0.3);
                const finalAngle = angleDust + swirlFactor;

                let drawDustX = centerX + Math.cos(finalAngle) * lensedDist;
                let drawDustY = centerY + Math.sin(finalAngle) * lensedDist;

                const streamOpacityFinal = (0.012 + density * 0.08) * bh;

                if (streamOpacityFinal > 0.02) {
                  // Dust color is white/gray far away, transitioning to glowing orange near event horizon
                  let rStream = 232;
                  let gStream = 230;
                  let bStream = 224;

                  if (normDust < 1.8) {
                    const orangeFactor = clamp((1.8 - normDust) / 0.95, 0, 1);
                    rStream = Math.round(232 + (255 - 232) * orangeFactor);
                    gStream = Math.round(230 + (80 - 230) * orangeFactor);
                    bStream = Math.round(224 + (0 - 224) * orangeFactor);
                  }

                  ctx.fillStyle = `rgba(${rStream}, ${gStream}, ${bStream}, ${streamOpacityFinal})`;
                  ctx.fillText(streamChar, drawDustX, drawDustY);
                }
              }
            }
          }
        }

        // Pass 2: Draw all ring characters using a smaller, high-density font setting
        if (ringCharsList.length > 0) {
          ctx.font = `${cellH * (0.84 - 0.46 * bh)}px "Fragment Mono", monospace`;
          for (let i = 0; i < ringCharsList.length; i++) {
            const rc = ringCharsList[i];
            if (rc.opacity > 0.02) {
              ctx.fillStyle = `rgba(${rc.r}, ${rc.g}, ${rc.b}, ${rc.opacity})`;
              ctx.fillText(rc.char, rc.x, rc.y);
            }
          }
          // Restore font size to original setting
          ctx.font = `${cellH * 0.84}px "Fragment Mono", monospace`;
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

      (window as any).debugCanvas = {
        getLoopState: () => isLooping.current,
        getParams: () => {
          const state = animStateRef.current;
          return state ? {
            bgProgress: state.bgProgress,
            sphereProgress: state.sphereProgress,
            blackHoleProgress: state.blackHoleProgress,
            sphereX: state.sphereX,
            sphereY: state.sphereY,
          } : null;
        },
        forceRender: () => {
          renderSingleFrame();
        }
      };

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
