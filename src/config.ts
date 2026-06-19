export interface SiteConfig {
  language: string
  siteTitle: string
  siteDescription: string
}

export interface NavigationLink {
  label: string
  href: string
}

export interface NavigationConfig {
  brandName: string
  links: NavigationLink[]
}

export interface HeroConfig {
  eyebrow: string
  titleLines: string[]
  leadText: string
  supportingNotes: {
    metric: string;
    description: string;
  }[]
}

export interface ManifestoConfig {
  videoPath: string
  text: string
}

export interface FacilityArticle {
  title: string
  paragraphs: string[]
}

export interface FacilityItem {
  slug: string
  name: string
  code: string
  address: string
  status: string
  email: string
  phone: string
  ctaText: string
  ctaHref: string
  image: string
  utcOffset: number
  article: FacilityArticle
}

export interface FacilitiesConfig {
  sectionLabel: string
  detailBackText: string
  detailNotFoundText: string
  detailReturnText: string
  items: FacilityItem[]
}

export interface ObservationConfig {
  sectionLabel: string
  videoPath: string
  statusText: string
  latLabel: string
  lonLabel: string
  initialLat: number
  initialLon: number
}

export interface ArchiveItem {
  src: string
  label: string
}

export interface ArchivesConfig {
  sectionLabel: string
  vaultTitle: string
  closeText: string
  items: ArchiveItem[]
}

export interface FooterConfig {
  copyrightText: string
  statusText: string
}

export const siteConfig: SiteConfig = {
  language: "en",
  siteTitle: "Recertiphy — Your Work. Signed. Forever.",
  siteDescription: "Every file you create is born without proof. Recertiphy embeds a permanent, cryptographic signature directly into the record of your asset. Invisible. Permanent. Yours.",
}

export const navigationConfig: NavigationConfig = {
  brandName: "RECERTIPHY",
  links: [
    { label: "The Birth", href: "#birth" },
    { label: "The Problems", href: "#archives" },
    { label: "The Crisis", href: "#pain-points" },
    { label: "Use Cases", href: "#facilities" },
  ],
}

export const heroConfig: HeroConfig = {
  eyebrow: "Proof that a digital file belongs to you",
  // titleLines: ["YOUR DIGITAL", "ASSETS ARE", "NEVER SAFE"],
  // titleLines: ["THE INTERNET", "IS BREAKING.", "WE'RE HERE", "TO FIX IT."],
  // titleLines: ["THE WORLD", "WILL KEEP MAKING FAKES.", "YOURS HAS PROOF."],
  titleLines: ["IN THE WORLD OF AI SLOP,", "WHERE IS THE DIGITAL PROOF?"],
  leadText: "Anyone can clone your photograph, replicate your artwork, or steal your footage — and the world will believe the fake. Until now.",
  supportingNotes: [
    {
      metric: "8M+",
      description: "deepfake files online in 2025. Growing 900% yearly.",
    },
    {
      metric: "62%",
      description: "of online content may be synthetic or manipulated.",
    },
  ],
}

export const manifestoConfig: ManifestoConfig = {
  videoPath: "/videos/manifesto.mp4",
  text: "Since the first digital asset was shared online, the internet has faced a fundamental flaw: copies are indistinguishable from originals. Every JPEG, MP4, and PDF is born without identity, easily cloned, screenshotted, or manipulated by AI. We believe that if you created something, you should be able to prove it — not through centralized platforms, but with the raw power of mathematics. Recertiphy embeds a permanent, cryptographic signature directly into the asset's fingerprint. It's time to restore trust to digital media and make ownership undeniable.",
}

export const facilitiesConfig: FacilitiesConfig = {
  sectionLabel: "Use Cases",
  detailBackText: "Back to Use Cases",
  detailNotFoundText: "Use case not found.",
  detailReturnText: "Return to Use Cases",
  items: [
    {
      slug: "photographers",
      name: "Photographers",
      code: "CREATOR-01",
      address: "Digital Imagery & Shoots",
      status: "Active Provenance",
      email: "verify@recertiphy.com",
      phone: "DigiCert TSA Active",
      ctaText: "View Case Study",
      ctaHref: "#",
      image: "/images/usecase-photographer.jpg",
      utcOffset: 0,
      article: {
        title: "Protecting Original Photography",
        paragraphs: [
          "Every photograph shared online is vulnerable to instant theft. Right-click, save-as, or screenshot — the metadata is stripped instantly, and your authorship is erased.",
          "Recertiphy allows photographers to generate a permanent cryptographic signature of their raw or high-res exports before posting them publicly. This establishes a legal timestamp that predates any unauthorised use.",
          "When platforms strip your EXIF data, the cryptographic hash remains an absolute, mathematical link to your identity. If your work is plagiarised or sold on third-party print sites, you have court-ready proof of ownership.",
        ],
      },
    },
    {
      slug: "digital-artists",
      name: "Digital Artists",
      code: "CREATOR-02",
      address: "Generative & Digital Art",
      status: "Active Provenance",
      email: "verify@recertiphy.com",
      phone: "SHA-256 Verified",
      ctaText: "View Case Study",
      ctaHref: "#",
      image: "/images/usecase-artist.jpg",
      utcOffset: 0,
      article: {
        title: "Proving Creative Process",
        paragraphs: [
          "In the age of generative AI, proving that you created an artwork by hand is increasingly difficult. Accusations of scraping or scraping-based compilation are common.",
          "By certifying version exports at various stages of your workflow (sketches, line art, color blocks, final render), you create an immutable chain of custody. This mathematically proves your step-by-step creative process.",
          "Each intermediate certificate serves as a milestone, establishing that the asset could only have been produced through your progressive work over time. Safe, public, and undeniable.",
        ],
      },
    },
    {
      slug: "filmmakers",
      name: "Filmmakers",
      code: "CREATOR-03",
      address: "Motion Picture & Video",
      status: "Active Provenance",
      email: "verify@recertiphy.com",
      phone: "Ed25519 Signed",
      ctaText: "View Case Study",
      ctaHref: "#",
      image: "/images/usecase-filmmaker.jpg",
      utcOffset: 0,
      article: {
        title: "Securing Video & Motion Assets",
        paragraphs: [
          "Video content represents high-value intellectual property that is frequently sliced, remixed, or re-uploaded without credit. Watermarks are easily cropped out or covered.",
          "Recertiphy secures your production pipeline by signing raw footage, rough cuts, and final exports. You build a documented production history that links every asset to the original creator.",
          "This is crucial for licensing, festival submissions, and distribution agreements, where chain of custody must be verified beyond a shadow of doubt.",
        ],
      },
    },
    {
      slug: "legal-professionals",
      name: "Legal Professionals",
      code: "LEGAL-04",
      address: "Digital Evidence & IP",
      status: "Court Ready",
      email: "verify@recertiphy.com",
      phone: "RFC 3161 Compliant",
      ctaText: "View Case Study",
      ctaHref: "#",
      image: "/images/usecase-legal.jpg",
      utcOffset: 0,
      article: {
        title: "Admissible Evidence & Legal Proof",
        paragraphs: [
          "Digital evidence must meet high standards of integrity to be admissible in legal disputes. Metadata alone is easily edited and rarely stands up to scrutiny.",
          "Recertiphy utilizes RFC 3161 trusted timestamps and Ed25519 signatures, which conform to strict legal standards for digital documentation and electronic signatures worldwide.",
          "Whether protecting trade secrets, certifying contracts, or documenting copyright infringements, our certificates provide attorneys with tamper-proof, court-ready verification.",
        ],
      },
    },
  ],
}

export const observationConfig: ObservationConfig = {
  sectionLabel: "Live Verification Network",
  videoPath: "/videos/observation.mp4",
  statusText: "TSA Ledger Node: Active",
  latLabel: "LEDGER OFFSET",
  lonLabel: "TSA DRIFT",
  initialLat: 12.45,
  initialLon: 0.04,
}

export const archivesConfig: ArchivesConfig = {
  sectionLabel: "THE PROBLEMS",
  vaultTitle: "Enter Slop Registry",
  closeText: "Close Slop Registry",
  items: [
    {
      src: "/images/archive-portrait.jpg",
      label: "AI Generated Portrait - 100% Synthetic",
    },
    {
      src: "/images/archive-art.jpg",
      label: "Style-Cloned Digital Art - Prompt Generated",
    },
    {
      src: "/images/archive-stamp.jpg",
      label: "Falsified Document Signature - Metadata Stripped",
    },
    {
      src: "/images/archive-waveform.jpg",
      label: "Voice-Cloned Waveform - Deepfake Audio",
    },
  ],
}

export const footerConfig: FooterConfig = {
  copyrightText: "© 2026 RECERTIPHY",
  statusText: "ALL CRYPTOGRAPHIC SYSTEMS NOMINAL",
}
