/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Selects an Iframe and returns its body when it's done loading.
 * @param {string} selector - The selector for the iframe.
 * @returns {Function} A function that returns the wrapped body of the iframe.
 */
function enterIframe(selector) {
  return cy.get(selector, {log: false}).then({timeout: 30000}, async (frame) => {
    const contentWindow = frame.prop('contentWindow');

    while (
      contentWindow.location.toString() === 'about:blank' ||
      contentWindow.document.readyState !== 'complete'
    ) {
      await new Promise((resolve) => setTimeout(resolve));
    }

    // return the body of the iframe wrapped in cypress
    return () => cy.wrap(contentWindow.document.body);
  });
}

Cypress.Commands.add('enterIframe', enterIframe);
