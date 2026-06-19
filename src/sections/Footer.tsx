import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { footerConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        footerRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 95%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  if (!footerConfig.copyrightText && !footerConfig.statusText) {
    return null;
  }

  return (
    <footer
      ref={footerRef}
      className="site-footer"
      style={{
        background: '#000000',
        color: '#ffffff',
        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
        padding: '32px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '12px',
        fontWeight: 400,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        opacity: 0,
      }}
    >
      <span>{footerConfig.copyrightText}</span>
      <span>{footerConfig.statusText}</span>
    </footer>
  );
}
