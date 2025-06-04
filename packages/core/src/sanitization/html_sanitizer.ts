/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {XSS_SECURITY_URL} from '../error_details_base_url';
import {TrustedHTML} from '../util/security/trusted_type_defs';
import {trustedHTMLFromString} from '../util/security/trusted_types';

import {getInertBodyHelper, InertBodyHelper} from './inert_body';
import {_sanitizeUrl} from './url_sanitizer';

function tagSet(tags: string): {[k: string]: boolean} {
  const res: {[k: string]: boolean} = {};
  for (const t of tags.split(',')) res[t] = true;
  return res;
}

function merge(...sets: {[k: string]: boolean}[]): {[k: string]: boolean} {
  const res: {[k: string]: boolean} = {};
  for (const s of sets) {
    for (const v in s) {
      if (s.hasOwnProperty(v)) res[v] = true;
    }
  }
  return res;
}

// Good source of info about elements and attributes
// https://html.spec.whatwg.org/#semantics
// https://simon.html5.org/html-elements

// Safe Void Elements - HTML5
// https://html.spec.whatwg.org/#void-elements
const VOID_ELEMENTS = tagSet('area,br,col,hr,img,wbr');

// Elements that you can, intentionally, leave open (and which close themselves)
// https://html.spec.whatwg.org/#optional-tags
const OPTIONAL_END_TAG_BLOCK_ELEMENTS = tagSet('colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr');
const OPTIONAL_END_TAG_INLINE_ELEMENTS = tagSet('rp,rt');
const OPTIONAL_END_TAG_ELEMENTS = merge(
  OPTIONAL_END_TAG_INLINE_ELEMENTS,
  OPTIONAL_END_TAG_BLOCK_ELEMENTS,
);

// Safe Block Elements - HTML5
const BLOCK_ELEMENTS = merge(
  OPTIONAL_END_TAG_BLOCK_ELEMENTS,
  tagSet(
    'address,article,' +
      'aside,blockquote,caption,center,del,details,dialog,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,' +
      'h6,header,hgroup,hr,ins,main,map,menu,nav,ol,pre,section,summary,table,ul',
  ),
);

// Inline Elements - HTML5
const INLINE_ELEMENTS = merge(
  OPTIONAL_END_TAG_INLINE_ELEMENTS,
  tagSet(
    'a,abbr,acronym,audio,b,' +
      'bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,picture,q,ruby,rp,rt,s,' +
      'samp,small,source,span,strike,strong,sub,sup,time,track,tt,u,var,video',
  ),
);

export const VALID_ELEMENTS: {[k: string]: boolean} = merge(
  VOID_ELEMENTS,
  BLOCK_ELEMENTS,
  INLINE_ELEMENTS,
  OPTIONAL_END_TAG_ELEMENTS,
);

// Attributes that have href and hence need to be sanitized
export const URI_ATTRS: {[k: string]: boolean} = tagSet(
  'background,cite,href,itemtype,longdesc,poster,src,xlink:href',
);

const HTML_ATTRS = tagSet(
  'abbr,accesskey,align,alt,autoplay,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,' +
    'compact,controls,coords,datetime,default,dir,download,face,headers,height,hidden,hreflang,hspace,' +
    'ismap,itemscope,itemprop,kind,label,lang,language,loop,media,muted,nohref,nowrap,open,preload,rel,rev,role,rows,rowspan,rules,' +
    'scope,scrolling,shape,size,sizes,span,srclang,srcset,start,summary,tabindex,target,title,translate,type,usemap,' +
    'valign,value,vspace,width',
);

// Accessibility attributes as per WAI-ARIA 1.1 (W3C Working Draft 14 December 2018)
const ARIA_ATTRS = tagSet(
  'aria-activedescendant,aria-atomic,aria-autocomplete,aria-busy,aria-checked,aria-colcount,aria-colindex,' +
    'aria-colspan,aria-controls,aria-current,aria-describedby,aria-details,aria-disabled,aria-dropeffect,' +
    'aria-errormessage,aria-expanded,aria-flowto,aria-grabbed,aria-haspopup,aria-hidden,aria-invalid,' +
    'aria-keyshortcuts,aria-label,aria-labelledby,aria-level,aria-live,aria-modal,aria-multiline,' +
    'aria-multiselectable,aria-orientation,aria-owns,aria-placeholder,aria-posinset,aria-pressed,aria-readonly,' +
    'aria-relevant,aria-required,aria-roledescription,aria-rowcount,aria-rowindex,aria-rowspan,aria-selected,' +
    'aria-setsize,aria-sort,aria-valuemax,aria-valuemin,aria-valuenow,aria-valuetext',
);

// NB: This currently consciously doesn't support SVG. SVG sanitization has had several security
// issues in the past, so it seems safer to leave it out if possible. If support for binding SVG via
// innerHTML is required, SVG attributes should be added here.

// NB: Sanitization does not allow <form> elements or other active elements (<button> etc). Those
// can be sanitized, but they increase security surface area without a legitimate use case, so they
// are left out here.

export const VALID_ATTRS: {[k: string]: boolean} = merge(URI_ATTRS, HTML_ATTRS, ARIA_ATTRS);

// Elements whose content should not be traversed/preserved, if the elements themselves are invalid.
//
// Typically, `<invalid>Some content</invalid>` would traverse (and in this case preserve)
// `Some content`, but strip `invalid-element` opening/closing tags. For some elements, though, we
// don't want to preserve the content, if the elements themselves are going to be removed.
const SKIP_TRAVERSING_CONTENT_IF_INVALID_ELEMENTS = tagSet('script,style,template');

/**
 * SanitizingHtmlSerializer serializes a DOM fragment, stripping out any unsafe elements and unsafe
 * attributes.
 */
class SanitizingHtmlSerializer {
  // Explicitly track if something was stripped, to avoid accidentally warning of sanitization just
  // because characters were re-encoded.
  public sanitizedSomething = false;
  private buf: string[] = [];

  sanitizeChildren(el: Element): string {
    // This cannot use a TreeWalker, as it has to run on Angular's various DOM adapters.
    // However this code never accesses properties off of `document` before deleting its contents
    // again, so it shouldn't be vulnerable to DOM clobbering.
    let current: Node = el.firstChild!;
    let traverseContent = true;
    let parentNodes = [];
    while (current) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        traverseContent = this.startElement(current as Element);
      } else if (current.nodeType === Node.TEXT_NODE) {
        this.chars(current.nodeValue!);
      } else {
        // Strip non-element, non-text nodes.
        this.sanitizedSomething = true;
      }
      if (traverseContent && current.firstChild) {
        // Push current node to the parent stack before entering its content.
        parentNodes.push(current);
        current = getFirstChild(current)!;
        continue;
      }
      while (current) {
        // Leaving the element.
        // Walk up and to the right, closing tags as we go.
        if (current.nodeType === Node.ELEMENT_NODE) {
          this.endElement(current as Element);
        }

        let next = getNextSibling(current)!;

        if (next) {
          current = next;
          break;
        }

        // There was no next sibling, walk up to the parent node (extract it from the stack).
        current = parentNodes.pop()!;
      }
    }
    return this.buf.join('');
  }

  /**
   * Sanitizes an opening element tag (if valid) and returns whether the element's contents should
   * be traversed. Element content must always be traversed (even if the element itself is not
   * valid/safe), unless the element is one of `SKIP_TRAVERSING_CONTENT_IF_INVALID_ELEMENTS`.
   *
   * @param element The element to sanitize.
   * @return True if the element's contents should be traversed.
   */
  private startElement(element: Element): boolean {
    const tagName = getNodeName(element).toLowerCase();
    if (!VALID_ELEMENTS.hasOwnProperty(tagName)) {
      this.sanitizedSomething = true;
      return !SKIP_TRAVERSING_CONTENT_IF_INVALID_ELEMENTS.hasOwnProperty(tagName);
    }
    this.buf.push('<');
    this.buf.push(tagName);
    const elAttrs = element.attributes;
    for (let i = 0; i < elAttrs.length; i++) {
      const elAttr = elAttrs.item(i);
      const attrName = elAttr!.name;
      const lower = attrName.toLowerCase();
      if (!VALID_ATTRS.hasOwnProperty(lower)) {
        this.sanitizedSomething = true;
        continue;
      }
      let value = elAttr!.value;
      // TODO(martinprobst): Special case image URIs for data:image/...
      if (URI_ATTRS[lower]) value = _sanitizeUrl(value);
      this.buf.push(' ', attrName, '="', encodeEntities(value), '"');
    }
    this.buf.push('>');
    return true;
  }

  private endElement(current: Element) {
    const tagName = getNodeName(current).toLowerCase();
    if (VALID_ELEMENTS.hasOwnProperty(tagName) && !VOID_ELEMENTS.hasOwnProperty(tagName)) {
      this.buf.push('</');
      this.buf.push(tagName);
      this.buf.push('>');
    }
  }

  private chars(chars: string) {
    this.buf.push(encodeEntities(chars));
  }
}

/**
 * Verifies whether a given child node is a descendant of a given parent node.
 * It may not be the case when properties like `.firstChild` are clobbered and
 * accessing `.firstChild` results in an unexpected node returned.
 */
function isClobberedElement(parentNode: Node, childNode: Node): boolean {
  return (
    (parentNode.compareDocumentPosition(childNode) & Node.DOCUMENT_POSITION_CONTAINED_BY) !==
    Node.DOCUMENT_POSITION_CONTAINED_BY
  );
}

/**
 * Retrieves next sibling node and makes sure that there is no
 * clobbering of the `nextSibling` property happening.
 */
function getNextSibling(node: Node): Node | null {
  const nextSibling = node.nextSibling;
  // Make sure there is no `nextSibling` clobbering: navigating to
  // the next sibling and going back to the previous one should result
  // in the original node.
  if (nextSibling && node !== nextSibling.previousSibling) {
    throw clobberedElementError(nextSibling);
  }
  return nextSibling;
}

/**
 * Retrieves first child node and makes sure that there is no
 * clobbering of the `firstChild` property happening.
 */
function getFirstChild(node: Node): Node | null {
  const firstChild = node.firstChild;
  if (firstChild && isClobberedElement(node, firstChild)) {
    throw clobberedElementError(firstChild);
  }
  return firstChild;
}

/** Gets a reasonable nodeName, even for clobbered nodes. */
export function getNodeName(node: Node): string {
  const nodeName = node.nodeName;
  // If the property is clobbered, assume it is an `HTMLFormElement`.
  return typeof nodeName === 'string' ? nodeName : 'FORM';
}

function clobberedElementError(node: Node) {
  return new Error(
    `Failed to sanitize html because the element is clobbered: ${(node as Element).outerHTML}`,
  );
}

// Regular Expressions for parsing tags and attributes
const SURROGATE_PAIR_REGEXP = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
// ! to ~ is the ASCII range.
const NON_ALPHANUMERIC_REGEXP = /([^\#-~ |!])/g;

/**
 * Escapes all potentially dangerous characters, so that the
 * resulting string can be safely inserted into attribute or
 * element text.
 * @param value
 */
function encodeEntities(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(SURROGATE_PAIR_REGEXP, function (match: string) {
      const hi = match.charCodeAt(0);
      const low = match.charCodeAt(1);
      return '&#' + ((hi - 0xd800) * 0x400 + (low - 0xdc00) + 0x10000) + ';';
    })
    .replace(NON_ALPHANUMERIC_REGEXP, function (match: string) {
      return '&#' + match.charCodeAt(0) + ';';
    })
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

let inertBodyHelper: InertBodyHelper;

/**
 * Sanitizes the given unsafe, untrusted HTML fragment, and returns HTML text that is safe to add to
 * the DOM in a browser environment.
 */
export function _sanitizeHtml(defaultDoc: any, unsafeHtmlInput: string): TrustedHTML | string {
  let inertBodyElement: HTMLElement | null = null;
  try {
    inertBodyHelper = inertBodyHelper || getInertBodyHelper(defaultDoc);
    // Make sure unsafeHtml is actually a string (TypeScript types are not enforced at runtime).
    let unsafeHtml = unsafeHtmlInput ? String(unsafeHtmlInput) : '';
    inertBodyElement = inertBodyHelper.getInertBodyElement(unsafeHtml);

    // mXSS protection. Repeatedly parse the document to make sure it stabilizes, so that a browser
    // trying to auto-correct incorrect HTML cannot cause formerly inert HTML to become dangerous.
    let mXSSAttempts = 5;
    let parsedHtml = unsafeHtml;

    do {
      if (mXSSAttempts === 0) {
        throw new Error('Failed to sanitize html because the input is unstable');
      }
      mXSSAttempts--;

      unsafeHtml = parsedHtml;
      parsedHtml = inertBodyElement!.innerHTML;
      inertBodyElement = inertBodyHelper.getInertBodyElement(unsafeHtml);
    } while (unsafeHtml !== parsedHtml);

    const sanitizer = new SanitizingHtmlSerializer();
    const safeHtml = sanitizer.sanitizeChildren(
      (getTemplateContent(inertBodyElement!) as Element) || inertBodyElement,
    );
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && sanitizer.sanitizedSomething) {
      console.warn(`WARNING: sanitizing HTML stripped some content, see ${XSS_SECURITY_URL}`);
    }

    return trustedHTMLFromString(safeHtml);
  } finally {
    // In case anything goes wrong, clear out inertElement to reset the entire DOM structure.
    if (inertBodyElement) {
      const parent = getTemplateContent(inertBodyElement) || inertBodyElement;
      while (parent.firstChild) {
        parent.firstChild.remove();
      }
    }
  }
}

export function getTemplateContent(el: Node): Node | null {
  return 'content' in (el as any) /** Microsoft/TypeScript#21517 */ && isTemplateElement(el)
    ? el.content
    : null;
}
function isTemplateElement(el: Node): el is HTMLTemplateElement {
  return el.nodeType === Node.ELEMENT_NODE && el.nodeName === 'TEMPLATE';
}
