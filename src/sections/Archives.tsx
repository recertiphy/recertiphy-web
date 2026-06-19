import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { archivesConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

export default function Archives() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const scrollTlRef = useRef<gsap.core.Timeline | null>(null);
  const vaultImages = archivesConfig.items;

  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);

  const questions = [
    "Is this AI?",
    "Who created this?",
    "Has this file been manipulated?",
    "When was this asset signed?"
  ];

  const setupCarouselCells = useCallback(() => {
    if (!carouselRef.current) return;
    const cells = carouselRef.current.querySelectorAll<HTMLElement>('.carousel__cell');
    const count = cells.length;
    if (!count) return;
    const radius = window.innerWidth < 768 ? 280 : window.innerWidth < 1024 ? 400 : 500;
    const angleStep = 360 / count;

    cells.forEach((cell, index) => {
      cell.style.transform = `rotateY(${index * angleStep}deg) translateZ(${radius}px)`;
    });
  }, []);

  const createScrollTimeline = useCallback(() => {
    if (!wrapperRef.current || !carouselRef.current) return;

    const carousel = carouselRef.current;
    const cards = carousel.querySelectorAll<HTMLElement>('.carousel__cell img');
    const count = vaultImages.length;
    const angleStep = 360 / count;

    const tl = gsap.timeline({
      defaults: { ease: 'sine.inOut' },
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
        snap: {
          snapTo: 1 / (count - 1),
          duration: { min: 0.3, max: 0.8 },
          delay: 0.05,
          ease: "power2.out"
        },
        onUpdate: (self) => {
          const progress = self.progress;
          const idx = Math.min(count - 1, Math.max(0, Math.round(progress * (count - 1))));
          setActiveIndex(idx);
          activeIndexRef.current = idx;
        }
      },
    });

    tl.fromTo(carousel, { rotationY: 0 }, { rotationY: -(angleStep * (count - 1)) }, 0);
    tl.fromTo(carousel, { rotationZ: 3, rotationX: 3 }, { rotationZ: -3, rotationX: -3 }, 0);
    tl.fromTo(cards, { filter: 'brightness(250%)' }, { filter: 'brightness(80%)', ease: 'power3' }, 0);
    tl.fromTo(cards, { rotationZ: 10 }, { rotationZ: -10, ease: 'none' }, 0);

    scrollTlRef.current = tl;
  }, [vaultImages.length]);

  const getCardScrollPos = useCallback((index: number) => {
    if (!wrapperRef.current) return 0;
    const rect = wrapperRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const start = rect.top + scrollTop;
    const totalScroll = rect.height - window.innerHeight;
    return start + totalScroll * (index / (vaultImages.length - 1));
  }, [vaultImages.length]);

  useEffect(() => {
    setupCarouselCells();
    createScrollTimeline();

    return () => {
      if (scrollTlRef.current) {
        scrollTlRef.current.scrollTrigger?.kill();
        scrollTlRef.current.kill();
      }
    };
  }, [setupCarouselCells, createScrollTimeline]);

  // Re-setup on resize
  useEffect(() => {
    const handleResize = () => {
      setupCarouselCells();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setupCarouselCells]);

  // Stroke wheel handler for elastic snapping
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Check if section is sticky
      const isSticky = rect.top <= 10 && rect.bottom >= windowHeight - 10;

      if (!isSticky) {
        // Update active index based on scroll position
        const totalScroll = rect.height - windowHeight;
        if (totalScroll > 0) {
          const progress = -rect.top / totalScroll;
          const idx = Math.min(vaultImages.length - 1, Math.max(0, Math.round(progress * (vaultImages.length - 1))));
          activeIndexRef.current = idx;
          setActiveIndex(idx);
        }
        return;
      }

      if (isAnimatingRef.current) {
        e.preventDefault();
        return;
      }

      const direction = e.deltaY > 0 ? 1 : -1;
      const currentIndex = activeIndexRef.current;
      const targetIndex = currentIndex + direction;

      if (targetIndex >= 0 && targetIndex < vaultImages.length) {
        e.preventDefault();
        
        const targetScroll = getCardScrollPos(targetIndex);
        isAnimatingRef.current = true;
        activeIndexRef.current = targetIndex;
        setActiveIndex(targetIndex);

        if ((window as any).lenis) {
          (window as any).lenis.scrollTo(targetScroll, {
            duration: 1.0,
            onComplete: () => {
              isAnimatingRef.current = false;
            }
          });
        } else {
          window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
          });
          setTimeout(() => {
            isAnimatingRef.current = false;
          }, 800);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [getCardScrollPos, vaultImages.length]);

  if (!archivesConfig.sectionLabel && vaultImages.length === 0) {
    return null;
  }

  return (
    <>
      <section
        ref={wrapperRef}
        id="archives"
        style={{
          background: '#000',
          color: '#fff',
          minHeight: '350vh', // Increased minHeight for smoother snapping
          position: 'relative',
        }}
      >
        <div ref={headerRef} className="archives-header" style={{ padding: '80px 40px 40px', position: 'relative', zIndex: 10 }}>
          <h3
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '17.5px',
              fontWeight: 400,
              lineHeight: '20px',
              textTransform: 'uppercase',
              color: '#fff',
              margin: '0 0 24px 0',
            }}
          >
            {archivesConfig.sectionLabel}
          </h3>
        </div>

        <div
          ref={sceneRef}
          className="scene"
          style={{
            perspective: '900px',
            position: 'sticky',
            top: 0,
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Replace button with list of 4 questions */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 20,
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              width: '90%',
              maxWidth: '850px',
            }}
          >
            {questions.map((q, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={idx}
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '11px',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    color: isActive ? '#000000' : 'rgba(255, 255, 255, 0.4)',
                    background: isActive ? '#ffffff' : 'transparent',
                    border: isActive ? '1px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '26px',
                    padding: '8px 18px',
                    letterSpacing: '0.08em',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isActive ? '0 0 20px rgba(255, 255, 255, 0.25)' : 'none',
                  }}
                >
                  {q}
                </div>
              );
            })}
          </div>

          <div
            ref={carouselRef}
            className="carousel carousel-container"
            style={{
              width: '400px',
              height: '500px',
              position: 'absolute',
              transformStyle: 'preserve-3d',
              willChange: 'transform',
              transform: 'translateZ(-550px) rotateY(0deg)',
            }}
          >
            {vaultImages.map((item, index) => (
              <div
                key={`${item.label}-${index}`}
                className="carousel__cell carousel-cell"
                style={{
                  position: 'absolute',
                  width: '350px',
                  height: '420px',
                  left: '0',
                  top: '0',
                  transformStyle: 'preserve-3d',
                }}
              >
                <img
                  src={item.src}
                  alt={item.label}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    filter: 'grayscale(100%)',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '10px',
                    fontWeight: 400,
                    textTransform: 'uppercase',
                    color: '#fff',
                    letterSpacing: '0.05em',
                    background: 'rgba(0,0,0,0.6)',
                    padding: '4px 8px',
                  }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
