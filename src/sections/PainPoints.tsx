import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface PainPointItem {
  id: string;
  title: string;
  issue: string;
  consequence: string;
}

const PAIN_POINTS: PainPointItem[] = [
  {
    id: "01",
    title: "EXIF & Metadata Stripping",
    issue: "Social platforms and portfolio sites strip all metadata (EXIF/IPTC) upon upload to save bandwidth or cover privacy.",
    consequence: "Your copyright notices and authorship tags are wiped out in milliseconds. The file is left completely anonymous.",
  },
  {
    id: "02",
    title: "Zero-Cost AI Cloning",
    issue: "Generative models scrape public portfolios, allowing anyone to duplicate your unique aesthetic style for free.",
    consequence: "Your visual identity is commoditized, flooded by algorithmic noise that drowns out original creators.",
  },
  {
    id: "03",
    title: "Screenshots are Indistinguishable",
    issue: "Standard files have no built-in signature. A screenshot of your work looks exactly like your original export.",
    consequence: "You cannot prove ownership simply by displaying the file — because the copy looks identical to the original.",
  },
  {
    id: "04",
    title: "Inadmissible Digital Evidence",
    issue: "Standard system timestamps and email trail records are trivial to modify and fail strict judicial evidence standards.",
    consequence: "In copyright disputes, DMCA filings, or client breaches, you lack legally recognized, tamper-proof proof of origin.",
  },
];

export default function PainPoints() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Header Animation
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
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Grid Cards Animation
      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll('.pain-card');
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="pain-points"
      style={{
        background: '#000000',
        color: '#ffffff',
        padding: '120px 40px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
        boxSizing: 'border-box',
      }}
    >
      <div
        ref={headerRef}
        style={{
          width: '100%',
          marginBottom: '56px',
          opacity: 0,
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            fontWeight: 400,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#fff',
            opacity: 0.5,
            display: 'block',
            marginBottom: '16px',
          }}
        >
          THE CREATOR CRISIS
        </span>
        <h2
          style={{
            fontFamily: "'Geist Pixel', monospace",
            fontSize: 'clamp(28px, 4vw, 52px)',
            fontWeight: 400,
            lineHeight: 1.1,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            margin: '0 0 20px 0',
          }}
        >
          In a world of AI slop,<br />
          your creations get lost.
        </h2>
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '13px',
            lineHeight: 1.8,
            color: 'rgba(255, 255, 255, 0.6)',
            maxWidth: '560px',
            margin: 0,
          }}
        >
          Every day, synthetic generators ingest your work and strip your identity. The standard files you export offer no protection. Here are the core issues rendering your work defenseless:
        </p>
      </div>

      <div
        ref={gridRef}
        className="pain-points-grid"
        style={{
          width: '100%',
          gap: '24px',
        }}
      >
        {PAIN_POINTS.map((point) => (
          <div
            key={point.id}
            className="pain-card"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.02)',
              padding: '36px 30px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'border-color 0.3s ease, background 0.3s ease',
              opacity: 0,
              minHeight: '220px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <h3
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '15px',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    color: '#fff',
                    margin: 0,
                  }}
                >
                  {point.title}
                </h3>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.3)',
                    letterSpacing: '0.1em',
                  }}
                >
                  NO. {point.id}
                </span>
              </div>
              <p
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '12.5px',
                  lineHeight: 1.75,
                  color: 'rgba(255, 255, 255, 0.56)',
                  margin: '0 0 16px 0',
                }}
              >
                {point.issue}
              </p>
            </div>
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '16px',
                marginTop: 'auto',
              }}
            >
              <p
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '12px',
                  lineHeight: 1.7,
                  color: '#fff',
                  margin: 0,
                }}
              >
                <strong style={{ fontWeight: 500 }}>CONSEQUENCE:</strong> {point.consequence}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
