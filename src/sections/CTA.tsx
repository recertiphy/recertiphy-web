import React, { useState } from 'react';

export default function CTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <section
      id="cta"
      style={{
        background: '#000000',
        color: '#ffffff',
        padding: '120px 40px',
        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: '800px', width: '100%' }}>
        <h2
          style={{
            fontFamily: "'Geist Pixel', monospace",
            fontSize: 'clamp(24px, 4vw, 48px)',
            fontWeight: 400,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '24px',
            lineHeight: 1.2,
          }}
        >
          THE WORLD WILL KEEP MAKING FAKES.<br />YOURS HAS PROOF.
        </h2>
        
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 'clamp(13px, 1.2vw, 15px)',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '48px',
            lineHeight: 1.8,
            maxWidth: '600px',
            margin: '0 auto 48px',
          }}
        >
          Recertiphy is launching soon. Join the waitlist and be among the first creators to certify their work. We'll contact you once the product is live.
        </p>

        {submitted ? (
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '13px',
              color: '#ffffff',
              border: '1px solid #ffffff',
              padding: '20px 32px',
              borderRadius: '0px',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'inline-block',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            ✓ YOU'RE ON THE LIST. WE'LL CONTACT YOU ONCE THE PRODUCT IS LIVE.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              maxWidth: '500px',
              margin: '0 auto',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <input
              type="email"
              required
              placeholder="ENTER YOUR EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: '1 1 280px',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                padding: '16px 20px',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '12px',
                outline: 'none',
                borderRadius: '0px',
                letterSpacing: '0.08em',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#ffffff')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)')}
            />
            <button
              type="submit"
              style={{
                background: '#ffffff',
                color: '#000000',
                border: '1px solid #ffffff',
                padding: '16px 32px',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                borderRadius: '0px',
                transition: 'background 0.3s, color 0.3s',
                boxSizing: 'border-box',
                textTransform: 'uppercase',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#000000';
              }}
            >
              JOIN WAITLIST
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
