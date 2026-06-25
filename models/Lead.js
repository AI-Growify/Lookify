/**
 * Model: Lead
 * ----------------------------------------------------------------------------
 * Represents a demo request or contact message submitted through the site.
 *
 * Holds the validation rules (mirrored on the client for instant feedback, but
 * authoritative here on the server) and a tiny in-memory store. Swap `store`
 * for a real database later without touching the controllers or views.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// In-memory persistence. Replace with a DB adapter in production.
const store = [];

/**
 * Validate a submission against the required fields declared for that form.
 * @param {object} data    raw submitted values
 * @param {Array}  fields  field schema from models/siteContent forms.<type>.fields
 * @returns {{ valid: boolean, errors: object }}
 */
function validate(data, fields) {
  const errors = {};
  for (const field of fields) {
    const value = (data[field.name] || '').trim();
    if (field.required && !value) {
      errors[field.name] = `${field.label} is required.`;
      continue;
    }
    if (field.type === 'email' && value && !EMAIL_RE.test(value)) {
      errors[field.name] = 'Please enter a valid email address.';
    }
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Persist a validated lead.
 * @param {('demo'|'contact')} type
 * @param {object} data
 * @returns {object} the stored record
 */
function create(type, data) {
  const record = {
    id: Date.now(),
    type,
    name: (data.name || '').trim(),
    email: (data.email || '').trim(),
    company: (data.company || '').trim(),
    phone: (data.phone || '').trim(),
    message: (data.message || '').trim(),
    createdAt: new Date().toISOString(),
  };
  store.push(record);
  return record;
}

function all() {
  return store.slice();
}

module.exports = { validate, create, all, EMAIL_RE };
