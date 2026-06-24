import { UAParser } from 'ua-parser-js';

// Attaches normalized IP + device info to req.context for audit/device tracking.
export function requestContext(req, _res, next) {
  const ip =
    (req.headers['x-forwarded-for']?.split(',')[0] || '').trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    '';

  const ua = req.headers['user-agent'] || '';
  const parsed = new UAParser(ua).getResult();

  req.context = {
    ip,
    userAgent: ua,
    browser: [parsed.browser.name, parsed.browser.version].filter(Boolean).join(' '),
    os: [parsed.os.name, parsed.os.version].filter(Boolean).join(' '),
  };
  next();
}
