/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * This helper is used to get hold of an inert tree of DOM elements containing dirty HTML
 * that needs sanitizing.
 * Depending upon browser support we use one of two strategies for doing this.
 * Default: DOMParser strategy
 * Fallback: InertDocument strategy
 */
export function getInertBodyHelper(defaultDoc: Document): InertBodyHelper {
  return isDOMParserAvailable() ? new DOMParserHelper() : new InertDocumentHelper(defaultDoc);
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
  getInertBodyElement(html: string): HTMLElement|null {
    // We add these extra elements to ensure that the rest of the content is parsed as expected
    // e.g. leading whitespace is maintained and tags like `<meta>` do not get hoisted to the
    // `<head>` tag.
    html = '<body><remove></remove>' + html + '</body>';
    try {
      const body = new (window as any).DOMParser().parseFromString(html, 'text/html').body as
          HTMLBodyElement;
      body.removeChild(body.firstChild!);
      return body;
    } catch {
      return null;
    }
  }
}

/**
 * Use an HTML5 `template` element, if supported, or an inert body element created via
 * `createHtmlDocument` to create and fill an inert DOM element.
 * This is the fallback strategy if the browser does not support DOMParser.
 */
class InertDocumentHelper implements InertBodyHelper {
  private inertDocument: Document;

  constructor(private defaultDoc: Document) {
    this.inertDocument = this.defaultDoc.implementation.createHTMLDocument('sanitization-inert');

    if (this.inertDocument.body == null) {
      // usually there should be only one body element in the document, but IE doesn't have any, so
      // we need to create one.
      const inertHtml = this.inertDocument.createElement('html');
      this.inertDocument.appendChild(inertHtml);
      const inertBodyElement = this.inertDocument.createElement('body');
      inertHtml.appendChild(inertBodyElement);
    }
  }

  getInertBodyElement(html: string): HTMLElement|null {
    // Prefer using <template> element if supported.
    const templateEl = this.inertDocument.createElement('template');
    if ('content' in templateEl) {
      templateEl.innerHTML = html;
      return templateEl;
    }

    // Note that previously we used to do something like `this.inertDocument.body.innerHTML = html`
    // and we returned the inert `body` node. This was changed, because IE seems to treat setting
    // `innerHTML` on an inserted element differently, compared to one that hasn't been inserted
    // yet. In particular, IE appears to split some of the text into multiple text nodes rather
    // than keeping them in a single one which ends up messing with Ivy's i18n parsing further
    // down the line. This has been worked around by creating a new inert `body` and using it as
    // the root node in which we insert the HTML.
    const inertBody = this.inertDocument.createElement('body');
    inertBody.innerHTML = html;

    // Support: IE 9-11 only
    // strip custom-namespaced attributes on IE<=11
    if ((this.defaultDoc as any).documentMode) {
      this.stripCustomNsAttrs(inertBody);
    }

    return inertBody;
  }

  /**
   * When IE9-11 comes across an unknown namespaced attribute e.g. 'xlink:foo' it adds 'xmlns:ns1'
   * attribute to declare ns1 namespace and prefixes the attribute with 'ns1' (e.g.
   * 'ns1:xlink:foo').
   *
   * This is undesirable since we don't want to allow any of these custom attributes. This method
   * strips them all.
   */
  private stripCustomNsAttrs(el: Element) {
    const elAttrs = el.attributes;
    // loop backwards so that we can support removals.
    for (let i = elAttrs.length - 1; 0 < i; i--) {
      const attrib = elAttrs.item(i);
      const attrName = attrib!.name;
      if (attrName === 'xmlns:ns1' || attrName.indexOf('ns1:') === 0) {
        el.removeAttribute(attrName);
      }
    }
    let childNode = el.firstChild as Node | null;
    while (childNode) {
      if (childNode.nodeType === Node.ELEMENT_NODE) this.stripCustomNsAttrs(childNode as Element);
      childNode = childNode.nextSibling;
    }
  }
}

/**
 * We need to determine whether the DOMParser exists in the global context.
 * The try-catch is because, on some browsers, trying to access this property
 * on window can actually throw an error.
 *
 * @suppress {uselessCode}
 */
function isDOMParserAvailable() {
  try {
    return !!(window as any).DOMParser;
  } catch {
    return false;
  }
}
