/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {trustedHTMLFromString} from '../util/security/trusted_types';

/**
 * This helper is used to get hold of an inert tree of DOM elements containing dirty HTML
 * that needs sanitizing.
 * Depending upon browser support we use one of two strategies for doing this.
 * Default: DOMParser strategy
 * Fallback: InertDocument strategy
 */
export function getInertBodyHelper(defaultDoc: Document): InertBodyHelper {
  const inertDocumentHelper = new InertDocumentHelper(defaultDoc);
  return isDOMParserAvailable() ? new DOMParserHelper(inertDocumentHelper) : inertDocumentHelper;
}

export interface InertBodyHelper {
  /**
   * Get an inert DOM element containing DOM created from the dirty HTML string provided.
   */
  getInertBodyElement: (html: string) => HTMLElement | null;
}

/**
 * Uses DOMParser to create and fill an inert body element.
 * This is the default strategy used in browsers that support it.
 */
class DOMParserHelper implements InertBodyHelper {
  constructor(private inertDocumentHelper: InertBodyHelper) {}

  getInertBodyElement(html: string): HTMLElement|null {
    // We add these extra elements to ensure that the rest of the content is parsed as expected
    // e.g. leading whitespace is maintained and tags like `<meta>` do not get hoisted to the
    // `<head>` tag. Note that the `<body>` tag is closed implicitly to prevent unclosed tags
    // in `html` from consuming the otherwise explicit `</body>` tag.
    html = '<body><remove></remove>' + html;
    try {
      const body = new window.DOMParser()
                       .parseFromString(trustedHTMLFromString(html) as string, 'text/html')
                       .body as HTMLBodyElement;
      if (body === null) {
        // In some browsers (e.g. Mozilla/5.0 iPad AppleWebKit Mobile) the `body` property only
        // becomes available in the following tick of the JS engine. In that case we fall back to
        // the `inertDocumentHelper` instead.
        return this.inertDocumentHelper.getInertBodyElement(html);
      }
      body.removeChild(body.firstChild!);
      return body;
    } catch {
      return null;
    }
  }
}

/**
 * Use an HTML5 `template` element to create and fill an inert DOM element.
 * This is the fallback strategy if the browser does not support DOMParser.
 */
class InertDocumentHelper implements InertBodyHelper {
  private inertDocument: Document;

  constructor(private defaultDoc: Document) {
    this.inertDocument = this.defaultDoc.implementation.createHTMLDocument('sanitization-inert');
  }

  getInertBodyElement(html: string): HTMLElement|null {
    const templateEl = this.inertDocument.createElement('template');
    templateEl.innerHTML = trustedHTMLFromString(html) as string;
    return templateEl;
  }
}

/**
 * We need to determine whether the DOMParser exists in the global context and
 * supports parsing HTML; HTML parsing support is not as wide as other formats, see
 * https://developer.mozilla.org/en-US/docs/Web/API/DOMParser#Browser_compatibility.
 *
 * @suppress {uselessCode}
 */
export function isDOMParserAvailable() {
  try {
    return !!new window.DOMParser().parseFromString(
        trustedHTMLFromString('') as string, 'text/html');
  } catch {
    return false;
  }
}
