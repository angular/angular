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
 *
 * Depending upon browser support we use the first of the following strategies that is available:
 *
 * 1. InertDocument using `<template>` element
 * 2. DOMParser
 * 3. InertDocument using
 */
export function getInertElementHelper(defaultDoc: Document): InertElementHelper {
  if (isTemplateElementAvailable(defaultDoc)) {
    // If `<template>` is available use that in an inertDocument since it supports HTML fragments,
    // which DOMParser does not.
    return new InertTemplateHelper(defaultDoc);
  } else {
    const inertDocumentHelper = new InertDocumentHelper(defaultDoc);
    if (isDOMParserAvailable()) {
      // No `<template>` then use DOMParser if it is available
      return new InertDOMParserHelper(inertDocumentHelper);
    } else {
      // No DOMParser so use the inertDocument which will fallback to not using `<template>` since
      // it is not available.
      return inertDocumentHelper;
    }
  }
}

export interface InertElementHelper {
  /**
   * Get an inert DOM element containing DOM created from the dirty HTML string provided.
   */
  getInertElement: (html: string) => HTMLElement | null;
}

/**
 * Use an HTML5 `<template>` element on an inert DOM element.
 *
 * This is the default strategy if the browser supports it.
 */
class InertTemplateHelper implements InertElementHelper {
  protected inertDocument: Document;

  constructor(protected defaultDoc: Document) {
    this.inertDocument = this.defaultDoc.implementation.createHTMLDocument('sanitization-inert');
  }

  getInertElement(html: string): HTMLElement|null {
    // Prefer using <template> element if supported.
    const templateEl = this.inertDocument.createElement('template');
    templateEl.innerHTML = trustedHTMLFromString(html) as string;
    return templateEl;
  }
}

/**
 * Use DOMParser to create and fill an inert body element.
 *
 * This is the strategy used in browsers that support it, where `<template>` element is not
 * supported.
 */
class InertDOMParserHelper implements InertElementHelper {
  constructor(private inertDocumentHelper: InertElementHelper) {}

  getInertElement(html: string): HTMLElement|null {
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
        return this.inertDocumentHelper.getInertElement(html);
      }
      body.removeChild(body.firstChild!);
      return body;
    } catch {
      return null;
    }
  }
}

/**
 * Use an inert body element created via `createHtmlDocument` to create and fill an inert DOM
 * element.
 *
 * This is the fallback strategy if the browser does not support `<template>` nor `DOMParser`.
 */
class InertDocumentHelper extends InertTemplateHelper {
  constructor(defaultDoc: Document) {
    super(defaultDoc);

    if (this.inertDocument.body == null) {
      // usually there should be only one body element in the document, but IE doesn't have any, so
      // we need to create one.
      const inertHtml = this.inertDocument.createElement('html');
      this.inertDocument.appendChild(inertHtml);
      const inertBodyElement = this.inertDocument.createElement('body');
      inertHtml.appendChild(inertBodyElement);
    }
  }

  getInertElement(html: string): HTMLElement|null {
    // Note that previously we used to do something like `this.inertDocument.body.innerHTML = html`
    // and we returned the inert `body` node. This was changed, because IE seems to treat setting
    // `innerHTML` on an inserted element differently, compared to one that hasn't been inserted
    // yet. In particular, IE appears to split some of the text into multiple text nodes rather
    // than keeping them in a single one which ends up messing with Ivy's i18n parsing further
    // down the line. This has been worked around by creating a new inert `body` and using it as
    // the root node in which we insert the HTML.
    const inertBody = this.inertDocument.createElement('body');
    inertBody.innerHTML = trustedHTMLFromString(html) as string;

    // Support: IE 11 only
    // strip custom-namespaced attributes on IE<=11
    if ((this.defaultDoc as any).documentMode) {
      this.stripCustomNsAttrs(inertBody);
    }

    return inertBody;
  }

  /**
   * When IE11 comes across an unknown namespaced attribute e.g. 'xlink:foo' it adds 'xmlns:ns1'
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

export function isTemplateElementAvailable(doc: Document): boolean {
  return 'content' in doc.createElement('template');
}
