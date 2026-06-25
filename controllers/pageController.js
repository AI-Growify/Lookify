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

module.exports = { home };
