import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AsciiBirthCanvas from '../components/AsciiBirthCanvas';
import type { AsciiBirthCanvasRef } from '../components/AsciiBirthCanvas';

gsap.registerPlugin(ScrollTrigger);

export default function Manifesto() {
  const triggerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<AsciiBirthCanvasRef>(null);

  // Plain JS ref to drive Canvas rendering at 60fps without React re-renders
  const animState = useRef({
    bgProgress: 0,
    sphereProgress: 0,
    sphereScale: 0,
    sphereX: 0.5,
    sphereY: 0.65, // Emerges in the lower center part of the screen
    colorProgress: 0, // Cool cyan/white -> Warm glowing orange
  });

  useEffect(() => {
    (window as any).animState = animState;
  }, []);

  const titleLayoutRef = useRef({
    x: 0.5,
    y: 0.38,
    width: 0,
    height: 0,
  });

  const title = "THE BIRTH";
  const line1 = "Every creation begins as with a story.";
  const line2 = "It starts as a spark in the quiet hours. You shape it with your hands, write it in your code, weave it into pixels and lines. It is hours of frustration, moments of breakthrough, and pure love poured into a digital vessel.";
  const line3 = "Yet, the moment it is released into the world, it is stripped of its origin — screenshotted, scraped, and copied without trace of the creator's touch.";
  const line4 = "Your effort deserves a permanent signature. Recertiphy embeds your proof forever.";

  const updateTitleLayout = () => {
    if (!spacerRef.current || !containerRef.current) return;
    const spacerRect = spacerRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const cx = ((spacerRect.left + spacerRect.right) / 2 - containerRect.left) / containerRect.width;
    const cy = ((spacerRect.top + spacerRect.bottom) / 2 - containerRect.top) / containerRect.height;
    
    titleLayoutRef.current = {
      x: cx || 0.5,
      y: cy || 0.38,
      width: spacerRect.width,
      height: spacerRect.height,
    };
  };

  useEffect(() => {
    const handleResize = () => {
      updateTitleLayout();
    };

    const ctx = gsap.context(() => {
      // Initial measurement
      updateTitleLayout();

      // Calculate delay fraction dynamically: 200px scroll delay
      const scrollDist = window.innerHeight * 2.5;
      const delayTime = (200 / scrollDist) * 6.9; // exact 200px delay relative to timeline scale

      const p1Start = delayTime;
      const p2Start = p1Start + 1.8;
      const p3Start = p2Start + 0.8;
      const p4Start = p3Start + 0.9;
      const p5Start = p4Start + 0.7;

      const line1Start = p5Start;
      const line2Start = line1Start + 0.5;
      const line3Start = line2Start + 0.5;
      const line4Start = line3Start + 0.5;

      // Master Scroll-bound Scrub Timeline for Starry Night scrambling, sphere formation, docking, and text reveals
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
          onToggle: (self) => {
            if (self.isActive) {
              canvasRef.current?.start();
            } else {
              // Reset state exactly to 0 when scrolled above to prevent inertia freeze distortion
              if (self.progress === 0) {
                animState.current.bgProgress = 0;
                animState.current.sphereProgress = 0;
                animState.current.sphereScale = 0;
                animState.current.sphereX = 0.5;
                animState.current.sphereY = 0.65;
                animState.current.colorProgress = 0;
              }
              canvasRef.current?.stop();
            }
          }
        }
      });

      // Phase 1: Static delay, then dissolves (scrambles) and sphere forms
      // The sphere forms at the lower center footprint (sphereY = 0.65)
      tl.to(animState.current, {
        bgProgress: 1.0,
        duration: 1.0,
        ease: "power1.inOut",
      }, p1Start);

      tl.to(animState.current, {
        sphereScale: 1.0,
        sphereProgress: 1.0,
        colorProgress: 1.0, // animate color in parallel with sphere formation
        duration: 1.8,
        ease: "power2.out",
      }, p1Start);

      // Phase 2: The sphere ignites and grows larger
      tl.to(animState.current, {
        sphereScale: 1.6, // Grows up on scroll
        duration: 0.8,
        ease: "power1.inOut",
      }, p2Start);

      // Phase 3: Sphere scrolls up to the very top edge to stick/dock there
      tl.to(animState.current, {
        sphereY: -0.05, // Sticks at the very top edge
        duration: 0.9,
        ease: "power2.inOut",
      }, p3Start);

      // Phase 4: Title "THE BIRTH" text reveals sequentially after the star is docked
      const titleChars = textContainerRef.current?.querySelectorAll('.title-char');
      if (titleChars && titleChars.length) {
        tl.fromTo(titleChars,
          { opacity: 0.05, filter: "blur(12px)", scale: 0.8 },
          {
            opacity: 1,
            filter: "blur(0px)",
            scale: 1,
            stagger: 0.02,
            duration: 0.7,
            ease: "power2.out",
          },
          p4Start
        );
      }

      // Phase 5: Copy lines reveal in sequence (staggered scroll reveal)
      // Line 1 ("Every creation begins as with a story.")
      const chars1 = textContainerRef.current?.querySelectorAll('.char-line-1');
      if (chars1 && chars1.length) {
        tl.fromTo(chars1,
          { opacity: 0.05, filter: "blur(8px)" },
          {
            opacity: 1,
            filter: "blur(0px)",
            stagger: 0.012,
            ease: "power1.inOut",
            duration: 0.6,
          },
          line1Start
        );
      }

      // Line 2
      const chars2 = textContainerRef.current?.querySelectorAll('.char-line-2');
      if (chars2 && chars2.length) {
        tl.fromTo(chars2,
          { opacity: 0.05, filter: "blur(6px)" },
          {
            opacity: 1,
            filter: "blur(0px)",
            stagger: 0.004,
            ease: "power1.inOut",
            duration: 0.6,
          },
          line2Start
        );
      }

      // Line 3
      const chars3 = textContainerRef.current?.querySelectorAll('.char-line-3');
      if (chars3 && chars3.length) {
        tl.fromTo(chars3,
          { opacity: 0.05, filter: "blur(6px)" },
          {
            opacity: 1,
            filter: "blur(0px)",
            stagger: 0.004,
            ease: "power1.inOut",
            duration: 0.6,
          },
          line3Start
        );
      }

      // Line 4
      const chars4 = textContainerRef.current?.querySelectorAll('.char-line-4');
      if (chars4 && chars4.length) {
        tl.fromTo(chars4,
          { opacity: 0.05, filter: "blur(6px)" },
          {
            opacity: 1,
            filter: "blur(0px)",
            stagger: 0.012,
            ease: "power1.inOut",
            duration: 0.6,
          },
          line4Start
        );
      }

    }, triggerRef);

    window.addEventListener('resize', handleResize);

    return () => {
      ctx.revert();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const renderLetters = (text: string, className: string) => {
    return text.split(" ").map((word, wordIdx, array) => (
      <span
        key={wordIdx}
        style={{
          display: 'inline-block',
          whiteSpace: 'nowrap',
        }}
      >
        {word.split("").map((char, charIdx) => (
          <span
            key={charIdx}
            className={className}
            style={{
              display: 'inline-block',
              opacity: 0.05,
              filter: "blur(4px)",
              transition: 'color 0.3s ease',
            }}
          >
            {char}
          </span>
        ))}
        {wordIdx < array.length - 1 && (
          <span
            className={className}
            style={{
              display: 'inline-block',
              opacity: 0.05,
              filter: "blur(4px)",
              whiteSpace: 'pre',
            }}
          >
            {" "}
          </span>
        )}
      </span>
    ));
  };

  return (
    <div
      ref={triggerRef}
      style={{
        position: 'relative',
        height: '350vh',
        background: '#000000',
        overflow: 'visible',
      }}
    >
      {/* Sticky viewport for animation */}
      <div
        ref={containerRef}
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          zIndex: 5,
        }}
      >
        {/* Background Ascii Birth Canvas */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          <AsciiBirthCanvas ref={canvasRef} animStateRef={animState} />
        </div>

        {/* Centered Text Container */}
        <div
          ref={textContainerRef}
          style={{
            position: 'relative',
            zIndex: 2,
            width: '90%',
            maxWidth: '1200px',
            textAlign: 'center',
            color: '#ffffff',
            padding: '20px',
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          {/* Spacer moved to the very top to leave room for the sticking star dome */}
          <div
            ref={spacerRef}
            style={{
              height: 'clamp(100px, 12vw, 160px)',
              width: '100%',
              pointerEvents: 'none',
              margin: '0 auto',
            }}
          />

          <div id="birth" style={{ marginBottom: '24px' }}>
            <h2
              ref={titleRef}
              style={{
                fontFamily: "'Geist Pixel', monospace",
                fontSize: 'clamp(32px, 5.5vw, 76px)',
                fontWeight: 400,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                margin: '0',
                color: '#fff',
                display: 'inline-block',
              }}
            >
              {renderLetters(title, 'title-char')}
            </h2>
          </div>

          <p
            style={{
              fontSize: 'clamp(20px, 2.5vw, 36px)',
              fontWeight: 400,
              lineHeight: 1.4,
              margin: '0 auto 24px',
              color: '#fff',
              fontFamily: "'IBM Plex Mono', monospace",
              maxWidth: 'clamp(680px, 70vw, 950px)',
            }}
          >
            {renderLetters(line1, 'char-line-1')}
          </p>

          <p
            style={{
              fontSize: 'clamp(12px, 1.1vw, 15px)',
              fontWeight: 400,
              lineHeight: 1.9,
              color: 'rgba(255,255,255,0.6)',
              margin: '0 auto 16px',
              maxWidth: 'clamp(680px, 70vw, 950px)',
            }}
          >
            {renderLetters(line2, 'char-line-2')}
          </p>

          <p
            style={{
              fontSize: 'clamp(12px, 1.1vw, 15px)',
              fontWeight: 400,
              lineHeight: 1.9,
              color: 'rgba(255,255,255,0.6)',
              margin: '0 auto 16px',
              maxWidth: 'clamp(680px, 70vw, 950px)',
            }}
          >
            {renderLetters(line3, 'char-line-3')}
          </p>

          <p
            style={{
              fontSize: 'clamp(13px, 1.2vw, 16px)',
              fontWeight: 500,
              lineHeight: 1.9,
              color: '#fff',
              margin: '0 auto',
              maxWidth: 'clamp(680px, 70vw, 950px)',
            }}
          >
            {renderLetters(line4, 'char-line-4')}
          </p>
        </div>
      </div>
    </div>
  );
}
