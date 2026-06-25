/**
 * Server entry point
 * ----------------------------------------------------------------------------
 * Wires together the MVC pieces:
 *   - View engine (EJS) + layout support
 *   - Static assets (CSS, JS, images, fonts)
 *   - Body parsing for JSON form submissions
 *   - Routes -> Controllers -> Models -> Views
 */

require('dotenv').config();
const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const config = require('./config');
const routes = require('./routes');

const app = express();

// --- View layer ------------------------------------------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout'); // views/layout.ejs wraps every page

// --- Middleware ------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- Routes ----------------------------------------------------------------
app.use('/', routes);

// --- 404 -------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).send('Not found');
});

// --- Start -----------------------------------------------------------------
app.listen(config.port, () => {
  console.log(`Lookify MVC running at http://localhost:${config.port} (${config.env})`);
});

module.exports = app;
