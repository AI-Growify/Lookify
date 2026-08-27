/**
 * Routes
 * ----------------------------------------------------------------------------
 * Maps URLs to controller actions. The only place that knows the URL scheme.
 */

const express = require('express');
const router = express.Router();

const pageController = require('../controllers/pageController');
const leadController = require('../controllers/leadController');

// Pages
router.get('/', pageController.home);
router.get('/privacy-policy', pageController.privacyPolicy);
router.get('/privacy', pageController.privacyPolicy);
router.get('/terms-of-use', pageController.termsOfUse);
router.get('/website-terms-of-use', pageController.termsOfUse);
router.get('/terms-of-service', pageController.termsOfUse);
router.get('/terms', pageController.termsOfUse);
router.get('/terms-and-conditions', pageController.termsOfUse);
router.get('/refund-policy', pageController.refundPolicy);
router.get('/refund-and-cancellation', pageController.refundPolicy);
router.get('/refund-cancellation-policy', pageController.refundPolicy);

// Lead-capture API (consumed by the on-page modal forms via fetch)
router.post('/api/demo', leadController.demo);
router.post('/api/contact', leadController.contact);

module.exports = router;
