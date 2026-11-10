// Shared CLI settings keep the launched server and Playwright readiness URL aligned.
export function devArguments(args, {managedLinux = false, port = process.env.PORT} = {}) {
  const explicitPort = args.some(arg => arg === '--port' || arg === '-p' || arg.startsWith('--port=') || /^-p\d/.test(arg));
  const defaultPort = port || '5173';
  if (!explicitPort && !/^\d+$/.test(defaultPort)) throw new Error('PORT must be an integer.');
  if (!explicitPort && (Number(defaultPort) < 1 || Number(defaultPort) > 65535)) throw new Error('PORT must be between 1 and 65535.');
  return [...(!explicitPort && (!managedLinux || port) ? ['--port', defaultPort] : []), ...args];
}

export function testServerSettings(baseURL = 'http://127.0.0.1:5187', managedLinux = false) {
  const url = new URL(baseURL);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('PLAYWRIGHT_BASE_URL must be an HTTP(S) URL without credentials.');
  const local = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
  return {
    baseURL: url.origin,
    local,
    args: local ? ['--port', url.port || (url.protocol === 'https:' ? '443' : '80'), managedLinux ? '--host' : '--hostname', url.hostname.replace(/^\[|\]$/g, '')] : [],
  };
}
