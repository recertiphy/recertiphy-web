import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AsciiCanvas from '../components/AsciiCanvas';
import { heroConfig, navigationConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);
  const waitlistRef = useRef<HTMLFormElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const notes = heroConfig.supportingNotes.slice(0, 3);
  const hasHeroContent =
    navigationConfig.brandName ||
    navigationConfig.links.length > 0 ||
    heroConfig.eyebrow ||
    heroConfig.titleLines.length > 0 ||
    heroConfig.leadText ||
    notes.length > 0;

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      if ((window as any).lenis) {
        (window as any).lenis.stop();
      }
    } else {
      document.body.style.overflow = '';
      if ((window as any).lenis) {
        (window as any).lenis.start();
      }
    }
    return () => {
      document.body.style.overflow = '';
      if ((window as any).lenis) {
        (window as any).lenis.start();
      }
    };
  }, [mobileMenuOpen]);

  if (!hasHeroContent) return null;

  useEffect(() => {
    if (!leftRef.current) return;

    const ctx = gsap.context(() => {
      // Staggered entrance animation
      const tl = gsap.timeline({ delay: 0.3 });

      if (eyebrowRef.current) {
        tl.fromTo(
          eyebrowRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
        );
      }

      if (titleRef.current) {
        tl.fromTo(
          titleRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' },
          '-=0.4'
        );
      }

      if (leadRef.current) {
        tl.fromTo(
          leadRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
          '-=0.6'
        );
      }

      if (waitlistRef.current) {
        tl.fromTo(
          waitlistRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
          '-=0.6'
        );
      }

      if (notesRef.current) {
        const noteItems = notesRef.current.querySelectorAll('.hero-note-item');
        tl.fromTo(
          noteItems,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out' },
          '-=0.4'
        );
      }

      // Parallax scroll effect on the left panel
      gsap.to(leftRef.current, {
        y: 80,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="hero-section"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
      }}
    >
      {/* Background ASCII Canvas covering the full screen */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <AsciiCanvas />
      </div>

      {/* Navigation */}
      <nav
        className="hero-nav"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 50,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 40px',
          background: 'transparent',
          fontFamily: "'IBM Plex Mono', monospace",
          boxSizing: 'border-box',
        }}
      >
        <Link
          to="/"
          style={{
            fontSize: '18px',
            fontWeight: 400,
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          {navigationConfig.brandName}
        </Link>

        {/* Desktop Nav Links */}
        <div className="hero-nav-links" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          {navigationConfig.links.map((item, index) => (
            <div key={`${item.label}-${item.href}`} style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <a
                href={item.href}
                style={{
                  fontSize: '12px',
                  fontWeight: 400,
                  color: '#fff',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  letterSpacing: '0.08em',
                  borderBottom: '1px solid transparent',
                  transition: 'border-color 0.2s',
                  paddingBottom: '2px',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.borderBottomColor = '#fff';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.borderBottomColor = 'transparent';
                }}
              >
                {item.label}
              </a>
              {index < navigationConfig.links.length - 1 && (
                <span className="separator" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>·</span>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
          }}
          className="mobile-menu-btn"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
            <line x1="4" y1="8" x2="20" y2="8" />
            <line x1="4" y1="16" x2="20" y2="16" />
          </svg>
        </button>
      </nav>

      {/* Mobile Drawer Overlay Background */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 90,
          }}
        />
      )}

      {/* Mobile Navigation Drawer Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(300px, 80%)',
          background: '#000000',
          borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          padding: '40px 32px',
          boxSizing: 'border-box',
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Close Button in Drawer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '48px' }}>
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Drawer Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {navigationConfig.links.map((item) => (
            <div key={`${item.label}-${item.href}`}>
              <a
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-drawer-link"
              >
                {item.label}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Left Panel */}
      <div
        ref={leftRef}
        className="hero-left"
        style={{
          position: 'relative',
          width: '40%',
          minWidth: '320px',
          background: 'transparent',
          overflow: 'hidden',
          zIndex: 10,
        }}
      >
        {/* Hero Title */}
        <div
          className="hero-title-area"
          style={{
            position: 'absolute',
            left: '40px',
            right: '24px',
            top: '22vh',
            zIndex: 10,
            width: '100%',
            maxWidth: '560px',
          }}
        >
          <p
            ref={eyebrowRef}
            className="hero-eyebrow"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              fontWeight: 400,
              lineHeight: 1.6,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.42)',
              margin: '0 0 22px 0',
              opacity: 0,
            }}
          >
            {heroConfig.eyebrow}
          </p>
          <h1
            ref={titleRef}
            className="hero-title"
            style={{
              fontFamily: "'Geist Pixel', monospace",
              fontSize: 'clamp(38px, 4.2vw, 68px)',
              fontWeight: 400,
              lineHeight: 0.96,
              color: '#fff',
              textTransform: 'uppercase',
              margin: 0,
              textWrap: 'balance',
              letterSpacing: '0.05em',
              opacity: 0,
            }}
          >
            {heroConfig.titleLines.map((line, index) => {
              if (line.includes("DIGITAL PROOF?")) {
                const parts = line.split("DIGITAL PROOF?");
                return (
                  <span key={`${line}-${index}`}>
                    {parts[0]}
                    <span style={{ whiteSpace: 'nowrap' }}>DIGITAL PROOF?</span>
                    {parts[1]}
                    {index < heroConfig.titleLines.length - 1 && <br />}
                  </span>
                );
              }
              return (
                <span key={`${line}-${index}`}>
                  {line}
                  {index < heroConfig.titleLines.length - 1 && <br />}
                </span>
              );
            })}
          </h1>

          {/* Lead text in flow */}
          {heroConfig.leadText && (
            <p
              ref={leadRef}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '12px',
                fontWeight: 400,
                lineHeight: 1.95,
                color: 'rgba(255,255,255,0.56)',
                margin: '28px 0 0 0',
                width: '100%',
                maxWidth: '38ch',
                opacity: 0,
              }}
            >
              {heroConfig.leadText}
            </p>
          )}

          {/* Waitlist Sign Up Form */}
          <form
            ref={waitlistRef}
            onSubmit={(e) => {
              e.preventDefault();
              if (!email) return;
              setSubmitted(true);
              setEmail('');
            }}
            style={{
              display: 'flex',
              marginTop: '36px',
              width: '100%',
              maxWidth: '420px',
              opacity: 0,
            }}
          >
            {submitted ? (
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#fff',
                  border: '1px solid #fff',
                  padding: '12px 18px',
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  boxSizing: 'border-box',
                }}
              >
                TRANSMISSION RECEIVED. ACCESS PENDING.
              </div>
            ) : (
              <>
                <input
                  type="email"
                  required
                  placeholder="ENTER EMAIL FOR WAITLIST"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    flexGrow: 1,
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '12px',
                    color: '#fff',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRight: 'none',
                    padding: '12px 16px',
                    borderRadius: '0px',
                    outline: 'none',
                    letterSpacing: '0.05em',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#fff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                  }}
                />
                <button
                  type="submit"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#000',
                    background: '#fff',
                    border: '1px solid #fff',
                    padding: '12px 24px',
                    borderRadius: '0px',
                    cursor: 'pointer',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    transition: 'background 0.2s, color 0.2s, border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.borderColor = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.color = '#000';
                    e.currentTarget.style.borderColor = '#fff';
                  }}
                >
                  JOIN
                </button>
              </>
            )}
          </form>
        </div>
      </div>

      {/* Right Panel - Empty but layout-occupying */}
      <div
        className="hero-right"
        style={{
          position: 'relative',
          width: '60%',
          background: 'transparent',
          overflow: 'hidden',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />

      {/* Floating Supporting Notes Container */}
      <div
        ref={notesRef}
        className="hero-notes-container"
      >
        {notes.map((note, idx) => (
          <div
            key={`note-${idx}`}
            className={`hero-note-item floating-note-${idx + 1}`}
            style={{ opacity: 0 }}
          >
            <span className="note-metric">{note.metric}</span>
            <span className="note-description">{note.description}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
