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

// Lead-capture API (consumed by the on-page modal forms via fetch)
router.post('/api/demo', leadController.demo);
router.post('/api/contact', leadController.contact);

module.exports = router;
