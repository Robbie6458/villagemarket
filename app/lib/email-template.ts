// On-brand HTML shell for all transactional email. Table-based + inline styles
// for broad email-client support (Gmail, Apple Mail, Outlook). Fraunces won't
// load in email, so the wordmark uses a serif fallback.

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://village-market-app.onrender.com";

export function brandedEmail(bodyHtml: string): string {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#ECE3D1;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ECE3D1;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <tr><td style="background:#17120E;border-radius:16px 16px 0 0;padding:26px 30px;">
          <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#C9962E;font-weight:600;">A Village Collective Project</div>
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:23px;color:#FBF6EC;margin-top:3px;letter-spacing:-0.2px;">Village <span style="color:#E8A020;">Market</span></div>
        </td></tr>
        <tr><td style="background:#FBF6EC;padding:30px;color:#241C15;font-size:15px;line-height:1.65;">
          ${bodyHtml}
        </td></tr>
        <tr><td style="background:#17120E;border-radius:0 0 16px 16px;padding:22px 30px;">
          <div style="font-size:12px;color:#8A7B66;line-height:1.7;">
            Village Market · Coeur d&rsquo;Alene, North Idaho<br>
            Real people. Real goods. Right here.<br>
            <a href="${APP_URL}" style="color:#C9962E;text-decoration:none;">Visit the market</a>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// A gold, on-brand CTA button for use inside brandedEmail body content.
export function emailButton(text: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;"><tr><td style="border-radius:999px;background:#E8A020;">
    <a href="${href}" style="display:inline-block;padding:12px 26px;font-size:15px;font-weight:600;color:#17120E;text-decoration:none;border-radius:999px;">${text}</a>
  </td></tr></table>`;
}
