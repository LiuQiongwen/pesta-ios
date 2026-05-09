export function getWebOrigin(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export function isTrustedWebUrl(url: string, trustedOrigin: string | null): boolean {
  if (url === 'about:blank' || url.startsWith('about:blank#')) {
    return true;
  }

  if (!trustedOrigin) return false;

  return getWebOrigin(url) === trustedOrigin;
}

export function buildNativeBridgeScript(token: string | undefined, trustedOrigin: string | null): string {
  const originGuard = trustedOrigin
    ? `
        var trustedOrigin = ${JSON.stringify(trustedOrigin)};
        var currentOrigin = window.location.origin || (window.location.protocol + '//' + window.location.host);
        if (currentOrigin !== trustedOrigin) return true;
      `
    : 'return true;';

  return `
    (function() {
      try {
        ${originGuard}
        window.__PESTA_NATIVE__ = true;
        ${token ? `
        window.__PESTA_TOKEN__ = ${JSON.stringify(token)};
        window.dispatchEvent(new CustomEvent('pesta-native-auth', {
          detail: { token: ${JSON.stringify(token)} }
        }));
        ` : ''}
        window.pestaNativeNavigate = function(route, params) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'NAVIGATE',
            payload: { route: route, params: params || {} }
          }));
        };
      } catch(e) {}
    })();
    true;
  `;
}
