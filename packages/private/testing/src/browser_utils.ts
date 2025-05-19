/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {NgZone} from '@angular/core';

export function dispatchEvent(element: any, eventType: any): Event {
  const evt: Event = getDOM().getDefaultDocument().createEvent('Event');
  evt.initEvent(eventType, true, true);
  getDOM().dispatchEvent(element, evt);
  return evt;
}

export function createMouseEvent(eventType: string): MouseEvent {
  const evt: MouseEvent = getDOM().getDefaultDocument().createEvent('MouseEvent');
  evt.initEvent(eventType, true, true);
  return evt;
}

export function el(html: string): HTMLElement {
  return <HTMLElement>getContent(createTemplate(html)).firstChild;
}

function getAttributeMap(element: any): Map<string, string> {
  const res = new Map<string, string>();
  const elAttrs = element.attributes;
  for (let i = 0; i < elAttrs.length; i++) {
    const attrib = elAttrs.item(i);
    res.set(attrib.name, attrib.value);
  }
  return res;
}

const _selfClosingTags = ['br', 'hr', 'input'];
export function stringifyElement(el: Element): string {
  let result = '';
  if (getDOM().isElementNode(el)) {
    const tagName = el.tagName.toLowerCase();

    // Opening tag
    result += `<${tagName}`;

    // Attributes in an ordered way
    const attributeMap = getAttributeMap(el);
    const sortedKeys = Array.from(attributeMap.keys()).sort();
    for (const key of sortedKeys) {
      const lowerCaseKey = key.toLowerCase();
      let attValue = attributeMap.get(key);

      if (typeof attValue !== 'string') {
        result += ` ${lowerCaseKey}`;
      } else {
        // Browsers order style rules differently. Order them alphabetically for consistency.
        if (lowerCaseKey === 'style') {
          attValue = attValue
            .split(/; ?/)
            .filter((s) => !!s)
            .sort()
            .map((s) => `${s};`)
            .join(' ');
        }

        result += ` ${lowerCaseKey}="${attValue}"`;
      }
    }
    result += '>';

    // Children
    const childrenRoot = templateAwareRoot(el);
    const children = childrenRoot ? childrenRoot.childNodes : [];
    for (let j = 0; j < children.length; j++) {
      result += stringifyElement(children[j]);
    }

    // Closing tag
    if (_selfClosingTags.indexOf(tagName) == -1) {
      result += `</${tagName}>`;
    }
  } else if (isCommentNode(el)) {
    result += `<!--${el.nodeValue}-->`;
  } else {
    result += el.textContent;
  }

  return result;
}

export function createNgZone(): NgZone {
  return new NgZone({enableLongStackTrace: true, shouldCoalesceEventChangeDetection: false});
}

export function isCommentNode(node: Node): boolean {
  return node.nodeType === Node.COMMENT_NODE;
}

export function isTextNode(node: Node): boolean {
  return node.nodeType === Node.TEXT_NODE;
}

export function getContent(node: Node): Node {
  if ('content' in node) {
    return (<any>node).content;
  } else {
    return node;
  }
}

export function templateAwareRoot(el: Node): any {
  return getDOM().isElementNode(el) && el.nodeName === 'TEMPLATE' ? getContent(el) : el;
}

export function setCookie(name: string, value: string) {
  // document.cookie is magical, assigning into it assigns/overrides one cookie value, but does
  // not clear other cookies.
  document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
}

export function hasStyle(element: any, styleName: string, styleValue?: string | null): boolean {
  const value = element.style[styleName] || '';
  return styleValue ? value == styleValue : value.length > 0;
}

export function hasClass(element: any, className: string): boolean {
  return element.classList.contains(className);
}

export function sortedClassList(element: any): any[] {
  return Array.prototype.slice.call(element.classList, 0).sort();
}

export function createTemplate(html: any): HTMLElement {
  const t = getDOM().getDefaultDocument().createElement('template');
  t.innerHTML = html;
  return t;
}

export function childNodesAsList(el: Node): any[] {
  const childNodes = el.childNodes;
  const res = [];
  for (let i = 0; i < childNodes.length; i++) {
    res[i] = childNodes[i];
  }
  return res;
}
