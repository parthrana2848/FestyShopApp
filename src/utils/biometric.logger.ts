const PREFIX = '[Biometric]';

type LogPayload = Record<string, unknown> | undefined;

export const biometricLogger = {
  info(message: string, payload?: LogPayload) {
    // Avoid logging tokens or secrets in payload
    console.log(`${PREFIX} ${message}`, payload ? sanitize(payload) : '');
  },
  warn(message: string, payload?: LogPayload) {
    console.warn(`${PREFIX} ${message}`, payload ? sanitize(payload) : '');
  },
  error(message: string, payload?: LogPayload) {
    console.error(`${PREFIX} ${message}`, payload ? sanitize(payload) : '');
  },
};

export default biometricLogger;

function sanitize(payload: LogPayload): LogPayload {
  if (!payload) return payload;
  const copy: LogPayload = {};
  for (const [k, v] of Object.entries(payload)) {
    if (typeof v === 'string' && /token|password|secret/i.test(k)) {
      copy[k] = 'REDACTED';
    } else {
      copy[k] = v;
    }
  }
  return copy;
}
