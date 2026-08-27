/**
 * Controller: Page
 * ----------------------------------------------------------------------------
 * Handles requests for rendered HTML pages. Reads content from the model and
 * hands it to the view. No business data lives here — it only orchestrates.
 */

const content = require('../models/siteContent');

/** GET / -> the landing page. */
function home(req, res) {
  res.render('index', {
    // Spread the whole content model into the view locals so partials can
    // reference brand, nav, metrics, pricing, forms, footer directly.
    ...content,
    title: `${content.brand.name} — ${content.brand.tagline}`,
  });
}

/** GET /privacy-policy -> Privacy Policy page. */
function privacyPolicy(req, res) {
  res.render('privacy-policy', {
    ...content,
    title: `Privacy Policy — ${content.brand.name}`,
  });
}

/** GET /terms-of-use -> Website Terms of Use page. */
function termsOfUse(req, res) {
  res.render('terms-of-service', {
    ...content,
    title: `Website Terms of Use — ${content.brand.name}`,
  });
}

/** GET /refund-policy -> Refund and Cancellation Policy page. */
function refundPolicy(req, res) {
  res.render('refund-policy', {
    ...content,
    title: `Refund & Cancellation Policy — ${content.brand.name}`,
  });
}

module.exports = {
  home,
  privacyPolicy,
  termsOfService: termsOfUse,
  termsOfUse,
  refundPolicy,
};

