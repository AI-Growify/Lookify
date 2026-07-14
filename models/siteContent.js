/**
 * Model: Site Content
 * ----------------------------------------------------------------------------
 * Single source of truth for all structured content rendered on the landing
 * page. Controllers read from this model and pass it to the views; views never
 * hard-code business data (nav links, metrics, pricing, etc.) — they iterate
 * over what this model provides.
 *
 * Editing copy or adding a pricing tier is a data change here, not a markup
 * change in the views. That separation is the point of the MVC split.
 */

const brand = {
  name: 'Lookify',
  tagline: 'Virtual Try-On',
  logo: '/images/9db0aa83-3677-4710-9118-ea791814f503.png',
  logoAlt: 'Lookify Virtual Try-On',
  year: 2026,
  whatsapp: 'https://wa.me/919810505644',
};

/** Primary navigation — rendered in both the desktop bar and the mobile menu. */
const nav = {
  links: [
    { label: 'Home', href: '#top' },
    { label: 'How It Works', href: '#how' },
    { label: 'Our Partners', href: '#about' },
    { label: 'Pricing', href: '#pricing' },
  ],
  cta: { label: 'Book a Demo', action: 'openModal' },
};

/** Social-proof metrics strip. */
const metrics = {
  eyebrow: 'Live on 20+ Fashion Houses',
  heading: 'Loved by shoppers. Trusted by brands.',
  // `accent` marks the trailing glyph that gets the gradient treatment.
  stats: [
    { value: '90', accent: '%', label: 'Success Rate' },
    { value: '100K', accent: '+', label: 'Virtual Try-Ons' },
    { value: '25K', accent: '', label: 'Shopper Shares' },
    { value: '2K', accent: '+', label: 'Leads Generated' },
  ],
};

/** Pricing plans. `featured` flags the highlighted "Most Popular" card. */
const pricing = {
  eyebrow: 'Pricing',
  heading: ['Start free.', 'Scale as you grow.'],
  subheading: 'Every plan includes the Virtual Try-On widget. No hidden fees.',
  plans: [
    {
      id: 'free',
      name: 'Free',
      price: '\u20B90',
      cadence: 'Limited Use',
      overage: '',
      features: ['10 monthly try-ons', 'Customizable Try-On Button'],
      cta: 'Get Started',
      featured: false,
    },
    {
      id: 'starter',
      name: 'Starter',
      price: '\u20B91,999',
      cadence: '/mo',
      overage: '+\u20B917 per extra try-on',
      features: ['100 monthly try-ons'],
      cta: 'Get Started',
      featured: false,
    },
    {
      id: 'growth',
      name: 'Growth',
      price: '\u20B94,999',
      cadence: '/mo',
      overage: '+\u20B912 per extra try-on',
      features: ['350 monthly try-ons'],
      cta: 'Get Started',
      featured: true,
      badge: 'Most Popular',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '\u20B99,999',
      cadence: '/mo',
      overage: '+\u20B910 per extra try-on',
      features: ['1,000 monthly try-ons'],
      cta: 'Get Started',
      featured: false,
    },
  ],
  enterprise: {
    name: 'Enterprise',
    price: 'Custom Pricing',
    subtitle: 'Tailored to your volume and requirements.',
    features: [
      'Custom try-on volumes',
      'White-label solution',
      'Call support & custom integrations',
    ],
    cta: 'Talk to Sales',
  },
};

/** Form field schemas — consumed by the views to render inputs and by the
 *  controllers to validate submissions, so the two never drift apart. */
const forms = {
  demo: {
    title: 'Book your Lookify demo',
    intro: "Tell us about your brand and we'll arrange a private walkthrough of the Virtual Try-On engine.",
    submitLabel: 'Book My Demo',
    success: {
      title: 'Request received',
      body: 'Thank you. Our team will be in touch shortly to arrange your private Lookify demonstration.',
    },
    fields: [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Work Email', type: 'email', required: true },
      { name: 'company', label: 'Company / Brand Name', type: 'text', required: true },
      { name: 'phone', label: 'Phone Number', type: 'tel', required: false },
      { name: 'message', label: 'Message or Requirements', type: 'textarea', required: false },
    ],
  },
  contact: {
    title: 'Get in Touch',
    intro: "Have a question or want to discuss your store? We'd love to hear from you.",
    submitLabel: 'Send Message',
    success: {
      title: 'Message sent',
      body: "We'll be in touch shortly. You can also reach us on WhatsApp anytime.",
    },
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'company', label: 'Company', type: 'text', required: false },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'message', label: 'Message', type: 'textarea', required: false },
    ],
  },
};

const footer = {
  links: [
    { label: 'Privacy Policy', href: 'https://growify.in/pages/privacy-policy' },
    { label: 'Contact', action: 'openContactModal' },
  ],
};

module.exports = {
  brand,
  nav,
  metrics,
  pricing,
  forms,
  footer,
};
