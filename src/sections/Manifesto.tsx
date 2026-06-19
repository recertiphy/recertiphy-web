import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AsciiBirthCanvas from '../components/AsciiBirthCanvas';

gsap.registerPlugin(ScrollTrigger);

export default function Manifesto() {
  const triggerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const [birthProgress, setBirthProgress] = useState(0);

  const title = "THE BIRTH";
  const line1 = "Every creation begins as a piece of your soul.";
  const line2 = "It starts as a spark in the quiet hours. You shape it with your hands, write it in your code, weave it into pixels and lines. It is hours of frustration, moments of breakthrough, and pure love poured into a digital vessel.";
  const line3 = "Yet, the moment it is released into the world, it is stripped of its origin — screenshotted, scraped, and copied without trace of the creator's touch.";
  const line4 = "Your effort deserves a permanent signature. Recertiphy embeds your proof forever.";

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Entrance animation for the title - plays once on entering the section
      const titleChars = textContainerRef.current?.querySelectorAll('.title-char');
      if (titleChars && titleChars.length) {
        gsap.fromTo(titleChars,
          { opacity: 0, filter: "blur(12px)", scale: 0.8 },
          {
            opacity: 1,
            filter: "blur(0px)",
            scale: 1,
            stagger: 0.03,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: triggerRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            }
          }
        );
      }

      // 2. Scroll-bound timeline for star birth progress and text reveal
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        }
      });

      // Animate progress value from 0 to 1 to drive canvas star birth
      const progressVal = { value: 0 };
      tl.to(progressVal, {
        value: 1,
        duration: 1.2,
        ease: "none",
        onUpdate: () => {
          setBirthProgress(progressVal.value);
        }
      }, 0);

      // Ghost reveal and colorify text stagger (starts as star is forming)
      const chars1 = textContainerRef.current?.querySelectorAll('.char-line-1');
      const chars2 = textContainerRef.current?.querySelectorAll('.char-line-2');
      const chars3 = textContainerRef.current?.querySelectorAll('.char-line-3');
      const chars4 = textContainerRef.current?.querySelectorAll('.char-line-4');

      if (chars1 && chars1.length) {
        tl.fromTo(chars1,
          { opacity: 0.05, filter: "blur(8px)" },
          { opacity: 1, filter: "blur(0px)", stagger: 0.015, ease: "power1.inOut", duration: 0.5 },
          0.9
        );
      }

      if (chars2 && chars2.length) {
        tl.fromTo(chars2,
          { opacity: 0.05, filter: "blur(6px)" },
          { opacity: 1, filter: "blur(0px)", stagger: 0.008, ease: "power1.inOut", duration: 0.5 },
          1.3
        );
      }

      if (chars3 && chars3.length) {
        tl.fromTo(chars3,
          { opacity: 0.05, filter: "blur(6px)" },
          { opacity: 1, filter: "blur(0px)", stagger: 0.008, ease: "power1.inOut", duration: 0.5 },
          1.7
        );
      }

      if (chars4 && chars4.length) {
        tl.fromTo(chars4,
          { opacity: 0.05, filter: "blur(6px)" },
          { opacity: 1, filter: "blur(0px)", stagger: 0.015, ease: "power1.inOut", duration: 0.5 },
          2.1
        );
      }

    }, triggerRef);

    return () => ctx.revert();
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
        {/* Render space after each word except the last one */}
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
      id="birth"
      style={{
        position: 'relative',
        height: '350vh', // Keep a generous scroll height for the dual animations
        background: '#000000',
        overflow: 'visible',
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
        <AsciiBirthCanvas progress={birthProgress} />
      </div>

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
        {/* Centered Text Container */}
        <div
          ref={textContainerRef}
          style={{
            position: 'relative',
            zIndex: 2,
            width: '90%',
            maxWidth: '900px',
            textAlign: 'center',
            color: '#ffffff',
            padding: '20px',
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          <h2
            style={{
              fontFamily: "'Geist Pixel', monospace",
              fontSize: 'clamp(32px, 5.5vw, 76px)',
              fontWeight: 400,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              margin: '0 0 32px 0',
              color: '#fff',
            }}
          >
            {renderLetters(title, 'title-char')}
          </h2>

          <p
            style={{
              fontSize: 'clamp(20px, 2.5vw, 36px)',
              fontWeight: 400,
              lineHeight: 1.4,
              margin: '0 0 24px 0',
              color: '#fff',
              fontFamily: "'IBM Plex Mono', monospace",
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
              maxWidth: '680px',
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
              maxWidth: '680px',
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
              maxWidth: '680px',
            }}
          >
            {renderLetters(line4, 'char-line-4')}
          </p>
        </div>
      </div>
    </div>
  );
}
