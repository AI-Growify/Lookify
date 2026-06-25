/**
 * Controller: Lead
 * ----------------------------------------------------------------------------
 * Handles the two lead-capture forms (demo request + contact message).
 *
 * Validated submissions are stored in-memory and appended to Google Sheets.
 * Set these environment variables to enable Sheets:
 *   GOOGLE_SHEET_ID         — the spreadsheet ID from the Sheet URL
 *   GOOGLE_SERVICE_ACCOUNT  — JSON string of the service account key file
 *                             (or set GOOGLE_SERVICE_ACCOUNT_FILE to a path)
 */

const content = require('../models/siteContent');
const Lead = require('../models/Lead');

// ---- Google Sheets helper (no-op when credentials are absent) --------------
const SHEET_IDS = {
  demo:    process.env.GOOGLE_DEMO_SHEET_ID,
  contact: process.env.GOOGLE_CONTACT_SHEET_ID,
};

async function appendToSheet(record) {
  const sheetId = SHEET_IDS[record.type];
  if (!sheetId) return; // Sheets not configured for this form — skip silently

  let credentials;
  try {
    const raw = process.env.GOOGLE_SERVICE_ACCOUNT
      || (process.env.GOOGLE_SERVICE_ACCOUNT_FILE
          ? require('fs').readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_FILE, 'utf8')
          : null);
    if (!raw) return;
    credentials = JSON.parse(raw);
  } catch (e) {
    console.warn('[sheets] could not parse service account credentials:', e.message);
    return;
  }

  try {
    const { google } = require('googleapis');
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:H',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          record.id,
          record.type,
          record.name,
          record.email,
          record.phone || '',
          record.company,
          record.message,
          record.createdAt,
        ]],
      },
    });
    console.log(`[sheets] appended lead #${record.id} to sheet`);
  } catch (e) {
    console.error('[sheets] append failed:', e.message);
  }
}

function handle(type) {
  const formConfig = content.forms[type];

  return function (req, res) {
    const { valid, errors } = Lead.validate(req.body || {}, formConfig.fields);

    if (!valid) {
      return res.status(422).json({ ok: false, errors });
    }

    const record = Lead.create(type, req.body);

    console.log(`[lead] new ${type} request #${record.id} from ${record.email}`);
    appendToSheet(record); // fire-and-forget

    return res.status(201).json({
      ok: true,
      id: record.id,
      success: formConfig.success,
    });
  };
}

module.exports = {
  demo: handle('demo'),
  contact: handle('contact'),
};
