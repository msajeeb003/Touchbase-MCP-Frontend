/**
 * Paste this into Google Apps Script (Code.gs), then redeploy the web app.
 * Sheet columns: Timestamp | Name | Email | Role | Country
 */
function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, message: "Waitlist endpoint is live" }),
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const name = String(data.name || "").trim();
    const email = String(data.email || "").trim();
    const role = String(data.role || "").trim();
    const country = String(data.country || "").trim();

    if (!name || !email || !role || !country) {
      return json_({ ok: false, error: "Missing required fields" });
    }

    const sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    sheet.appendRow([
      new Date().toISOString(),
      name,
      email,
      role,
      country,
    ]);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
