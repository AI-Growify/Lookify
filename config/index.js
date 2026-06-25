/**
 * Configuration
 * ----------------------------------------------------------------------------
 * Central place for environment-driven settings. Keeps server.js tidy.
 */

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
};
