import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { facilitiesConfig, type FacilityItem } from '../config';

gsap.registerPlugin(ScrollTrigger);

function FacilityColumn({ facility, isLast, index }: { facility: FacilityItem; isLast: boolean; index: number }) {
  const [imgHover, setImgHover] = useState(false);
  const colRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!colRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        colRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: index * 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: colRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, colRef);

    return () => ctx.revert();
  }, [index]);

  // Adjust padding for first and last columns on desktop to align content to the 40px side margins
  const isFirst = index === 0;
  const isLastCol = index === facilitiesConfig.items.length - 1;
  const paddingStyle = isFirst && isLastCol
    ? '40px 40px'
    : isFirst
      ? '40px 24px 40px 40px'
      : isLastCol
        ? '40px 40px 40px 24px'
        : '40px 24px';

  return (
    <div
      ref={colRef}
      className="facility-column"
      style={{
        borderRight: isLast ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
        padding: paddingStyle,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        opacity: 0,
      }}
    >
      <Link
        to={`/facility/${facility.slug}`}
        style={{
          textDecoration: 'none',
          color: '#fff',
        }}
      >
        <h2
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '20px',
            fontWeight: 400,
            lineHeight: '25px',
            textTransform: 'uppercase',
            margin: '0 0 4px 0',
            color: '#fff',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = '0.6';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = '1';
          }}
        >
          {facility.name}
          {facility.code ? `, ${facility.code}` : ''}
        </h2>
      </Link>

      {facility.address && (
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '20px',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.7)',
            margin: '0 0 12px 0',
          }}
        >
          {facility.address}
        </p>
      )}

      {facility.status && (
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'rgba(255, 255, 255, 0.5)',
            margin: '0 0 12px 0',
            fontStyle: 'italic',
          }}
        >
          {facility.status}
        </p>
      )}

      <p
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '12px',
          fontWeight: 400,
          lineHeight: '20px',
          color: 'rgba(255, 255, 255, 0.6)',
          margin: '0 0 4px 0',
        }}
      >
        {facility.email}
      </p>
      <p
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '12px',
          fontWeight: 400,
          lineHeight: '20px',
          color: 'rgba(255, 255, 255, 0.6)',
          margin: '0 0 24px 0',
        }}
      >
        {facility.phone}
      </p>

      {facility.ctaText && (
        <a
          href={facility.ctaHref || '#'}
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            fontWeight: 400,
            textTransform: 'uppercase',
            color: '#fff',
            textDecoration: 'none',
            borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
            paddingBottom: '2px',
            display: 'inline-block',
            marginBottom: '32px',
            transition: 'border-bottom-width 0.2s',
          }}
          onClick={(e) => {
            if (!facility.ctaHref || facility.ctaHref === '#') e.preventDefault();
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.borderBottomWidth = '2px';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.borderBottomWidth = '1px';
          }}
        >
          {facility.ctaText}
        </a>
      )}

      {facility.image && (
        <div style={{ marginTop: 'auto', overflow: 'hidden' }}>
          <img
            src={facility.image}
            alt={facility.name}
            onMouseEnter={() => setImgHover(true)}
            onMouseLeave={() => setImgHover(false)}
            style={{
              width: '100%',
              aspectRatio: '3 / 4',
              objectFit: 'cover',
              display: 'block',
              opacity: imgHover ? 0.8 : 1,
              transition: 'opacity 0.2s',
              filter: 'grayscale(100%)',
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function Facilities() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const facilities = facilitiesConfig.items;

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current) return;

    const ctx = gsap.context(() => {
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
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  if (!facilitiesConfig.sectionLabel && facilities.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      id="facilities"
      style={{
        background: '#000000',
        color: '#ffffff',
        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
        boxSizing: 'border-box',
      }}
    >
      <div
        ref={headerRef}
        className="facilities-section-header"
        style={{
          padding: '80px 40px 40px 40px',
          opacity: 0,
        }}
      >
        <h3
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '17.5px',
            fontWeight: 400,
            lineHeight: '20px',
            textTransform: 'uppercase',
            color: '#fff',
            margin: '0 0 16px 0',
          }}
        >
          {facilitiesConfig.sectionLabel}
        </h3>
      </div>

      <div
        className="facilities-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(facilities.length, 4)}, 1fr)`,
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          width: '100%',
        }}
      >
        {facilities.map((facility, index) => (
          <FacilityColumn
            key={facility.slug || `${facility.name}-${index}`}
            facility={facility}
            isLast={index === facilities.length - 1}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
