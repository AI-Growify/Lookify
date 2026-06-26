/**
 * Netlify Function entry point
 * Wraps the Express app with serverless-http so Netlify can invoke it.
 */

const serverless = require('serverless-http');
const path = require('path');

// Point dotenv to the project root (two levels up from netlify/functions/)
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const routes = require('../../routes');

const app = express();

// --- View layer ------------------------------------------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// --- Middleware ------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files are served directly by Netlify from /public — no express.static needed

// --- Routes ----------------------------------------------------------------
app.use('/', routes);

// --- 404 -------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).send('Not found');
});

module.exports.handler = serverless(app);
