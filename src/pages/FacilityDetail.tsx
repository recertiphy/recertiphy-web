import { useMemo, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { facilitiesConfig, navigationConfig } from '../config';

export default function FacilityDetail() {
  const { slug } = useParams<{ slug: string }>();
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const paragraphsRef = useRef<HTMLDivElement>(null);

  const facility = useMemo(
    () => facilitiesConfig.items.find((item) => item.slug === slug) ?? null,
    [slug]
  );

  useEffect(() => {
    if (!facility) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });

      if (titleRef.current) {
        tl.fromTo(
          titleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        );
      }

      if (paragraphsRef.current) {
        const paragraphs = paragraphsRef.current.querySelectorAll('p');
        tl.fromTo(
          paragraphs,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out' },
          '-=0.4'
        );
      }

      if (imageRef.current) {
        tl.fromTo(
          imageRef.current,
          { opacity: 0, scale: 1.05 },
          { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' },
          '-=0.8'
        );
      }
    });

    return () => ctx.revert();
  }, [facility]);

  if (!facility) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#000000',
          color: '#ffffff',
          fontFamily: "'IBM Plex Mono', monospace",
          padding: '40px',
        }}
      >
        <p>{facilitiesConfig.detailNotFoundText}</p>
        <Link to="/" style={{ color: '#fff', textDecoration: 'underline' }}>
          {facilitiesConfig.detailReturnText}
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000000',
        color: '#ffffff',
        fontFamily: "'IBM Plex Mono', monospace",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <nav
        className="facility-detail-nav"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 40px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <span
          style={{
            fontSize: '18px',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {navigationConfig.brandName}
        </span>
        <Link
          to="/#facilities"
          style={{
            fontSize: '12px',
            fontWeight: 400,
            textTransform: 'uppercase',
            color: '#fff',
            textDecoration: 'none',
            borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
            paddingBottom: '2px',
          }}
        >
          {facilitiesConfig.detailBackText}
        </Link>
      </nav>

      <div
        className="facility-detail-layout"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <div
          ref={contentRef}
          className="facility-detail-content"
          style={{
            flex: 1,
            padding: '60px 48px',
            borderRight: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <h1
            ref={titleRef}
            className="facility-detail-title"
            style={{
              fontSize: '28px',
              fontWeight: 400,
              lineHeight: '34px',
              textTransform: 'uppercase',
              margin: '0 0 40px 0',
              opacity: 0,
            }}
          >
            {facility.article.title}
          </h1>
          <div ref={paragraphsRef} style={{ maxWidth: '520px' }}>
            {facility.article.paragraphs.map((paragraph, index) => (
              <p
                key={`${facility.slug}-${index}`}
                style={{
                  fontSize: '13px',
                  fontWeight: 400,
                  lineHeight: '22px',
                  margin: '0 0 20px 0',
                  opacity: 0,
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div style={{ marginTop: '48px', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
            {facility.address && (
              <div>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255, 255, 255, 0.5)', margin: '0 0 4px 0' }}>Location</p>
                <p style={{ fontSize: '12px', margin: 0 }}>{facility.address}</p>
              </div>
            )}
            {facility.status && (
              <div>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255, 255, 255, 0.5)', margin: '0 0 4px 0' }}>Status</p>
                <p style={{ fontSize: '12px', margin: 0 }}>{facility.status}</p>
              </div>
            )}
            <div>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255, 255, 255, 0.5)', margin: '0 0 4px 0' }}>Contact</p>
              <p style={{ fontSize: '12px', margin: '0 0 2px 0' }}>{facility.email}</p>
              <p style={{ fontSize: '12px', margin: 0 }}>{facility.phone}</p>
            </div>
          </div>
        </div>

        <div
          ref={imageRef}
          className="facility-detail-image"
          style={{
            flex: 1,
            position: 'relative',
            background: '#000',
            opacity: 0,
          }}
        >
          {facility.image ? (
            <img
              src={facility.image}
              alt={facility.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'grayscale(100%)',
                display: 'block',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                textTransform: 'uppercase',
                color: '#fff',
              }}
            >
              No Image
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
