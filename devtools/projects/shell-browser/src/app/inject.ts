/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const loadScripts = (urls: string[]) => {
  return urls
      .map((url, idx) => {
        return `
      const script${idx} = document.constructor.prototype.createElement.call(document, 'script');
      script${idx}.src = getScriptName("${url}");
      document.documentElement.appendChild(script${idx});
      script${idx}.parentNode.removeChild(script${idx});
    `;
      })
      .join('\n');
};

let loaded = false;
export const injectScripts = (urls: string[], cb?: () => void) => {
  if (loaded) {
    // Not throwing a hard error here, because we don't want to stop the
    // execution when folks are not using Trusted Types or when they have
    // allowed redeclaration of a security policy.
    console.error('Trying to reinject scripts');
  }
  loaded = true;
  urls = urls.map((s) => chrome.runtime.getURL(s));
  const script = `
  (function () {
    let policy = null;
    if (window.trustedTypes && window.trustedTypes.createPolicy) {
      policy = window.trustedTypes.createPolicy('angular#devtools', {
        createScriptURL: url => ${JSON.stringify(urls)}.indexOf(url) >= 0 ? url : null
      });
    }
    const getScriptName = name => policy ? policy.createScriptURL(name) : name;
    ${loadScripts(urls)}
  })();
  `;
  chrome.devtools.inspectedWindow.eval(script, (_, err) => {
    if (err) {
      // tslint:disable-next-line:no-console
      console.log(err);
    }
    cb?.();
  });
};
