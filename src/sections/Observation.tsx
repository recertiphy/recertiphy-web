import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { observationConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

export default function Observation() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({
    lat: observationConfig.initialLat,
    lon: observationConfig.initialLon,
  });

  useEffect(() => {
    setCoords({
      lat: observationConfig.initialLat,
      lon: observationConfig.initialLon,
    });
  }, [observationConfig.initialLat, observationConfig.initialLon]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCoords((prev) => ({
        lat: parseFloat((prev.lat + (Math.random() - 0.5) * 0.02).toFixed(2)),
        lon: parseFloat((prev.lon + (Math.random() - 0.5) * 0.03).toFixed(2)),
      }));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Header fade in
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Video scale and fade
      if (videoRef.current) {
        gsap.fromTo(
          videoRef.current,
          { opacity: 0, scale: 0.92, y: 40 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Parallax on container
      if (containerRef.current) {
        gsap.fromTo(
          containerRef.current,
          { y: 30 },
          {
            y: -30,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  if (!observationConfig.sectionLabel && !observationConfig.videoPath) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      id="observation"
      className="observation-section"
      style={{
        background: '#000',
        color: '#fff',
        padding: '120px 40px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <h3
        ref={headerRef}
        className="observation-header"
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '17.5px',
          fontWeight: 400,
          lineHeight: '20px',
          textTransform: 'uppercase',
          color: '#fff',
          margin: '0 0 48px 0',
          alignSelf: 'flex-start',
          opacity: 0,
        }}
      >
        {observationConfig.sectionLabel}
      </h3>

      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1200px',
        }}
      >
        {observationConfig.videoPath && (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              aspectRatio: '16/9',
              objectFit: 'cover',
              opacity: 0,
            }}
          >
            <source src={observationConfig.videoPath} type="video/mp4" />
          </video>
        )}

        <div
          className="observation-overlay"
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            fontWeight: 400,
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            background: 'rgba(0,0,0,0.5)',
            padding: '6px 10px',
          }}
        >
          {observationConfig.latLabel}: {coords.lat.toFixed(2)}ms | {observationConfig.lonLabel}: {coords.lon.toFixed(2)}s
        </div>

        {observationConfig.statusText && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '12px',
              fontWeight: 400,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#fff',
                display: 'inline-block',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            {observationConfig.statusText}
          </div>
        )}
      </div>
    </section>
  );
}
