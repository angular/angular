/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT, ɵDomAdapter as DomAdapter, ɵgetDOM as getDOM} from '@angular/common';
import {Inject, Injectable, ɵɵinject} from '@angular/core';

/**
 * Represents a link element.
 *
 * @publicApi
 */
export type LinkDefinition = {
  as?: string; crossorigin?: 'anonymous' | 'use-credentials'; disabled?: boolean; href?: string;
  hreflang?: string;
  importance?: 'auto' | 'high' | 'low';
  integrity?: string;
  media?: string;
  methods?: string;
  prefetch?: string;
  referrerpolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' |
      'origin-when-cross-origin' | 'unsafe-url';
  rel?: string;
  sizes?: string;
  target?: string;
  title?: string;
  type?: string;
} &
{
  [prop: string]: string;
};

/**
 * Factory to create Link service.
 */
export function createLink() {
  return new Link(ɵɵinject(DOCUMENT));
}

/**
 * A service that can be used to get and add link tags.
 *
 * @publicApi
 */
@Injectable({providedIn: 'root', useFactory: createLink, deps: []})
export class Link {
  private _dom: DomAdapter;
  constructor(@Inject(DOCUMENT) private _doc: any) { this._dom = getDOM(); }

  addLink(link: LinkDefinition, forceCreation: boolean = false): HTMLLinkElement|null {
    if (!link) return null;
    return this._getOrCreateElement(link, forceCreation);
  }

  addLinks(links: LinkDefinition[], forceCreation: boolean = false): HTMLLinkElement[] {
    if (!links) return [];
    return links.reduce((result: HTMLLinkElement[], link: LinkDefinition) => {
      if (link) {
        result.push(this._getOrCreateElement(link, forceCreation));
      }
      return result;
    }, []);
  }

  getLink(attrSelector: string): HTMLLinkElement|null {
    if (!attrSelector) return null;
    return this._doc.querySelector(`link[${attrSelector}]`) || null;
  }

  getLinks(attrSelector: string): HTMLLinkElement[] {
    if (!attrSelector) return [];
    const list /*NodeList*/ = this._doc.querySelectorAll(`link[${attrSelector}]`);
    return list ? [].slice.call(list) : [];
  }

  updateLink(link: LinkDefinition, selector?: string): HTMLLinkElement|null {
    if (!link) return null;
    selector = selector || this._parseSelector(link);
    const linkEl: HTMLLinkElement = this.getLink(selector) !;
    if (linkEl) {
      return this._setLinkElementAttributes(link, linkEl);
    }
    return this._getOrCreateElement(link, true);
  }

  removeLink(attrSelector: string): void { this.removeLinkElement(this.getLink(attrSelector) !); }

  removeLinkElement(link: HTMLLinkElement): void {
    if (link) {
      this._dom.remove(link);
    }
  }

  private _getOrCreateElement(link: LinkDefinition, forceCreation: boolean = false):
      HTMLLinkElement {
    if (!forceCreation) {
      const selector: string = this._parseSelector(link);
      const elem: HTMLLinkElement = this.getLink(selector) !;
      // It's allowed to have multiple elements with the same name so it's not enough to
      // just check that element with the same name already present on the page. We also need to
      // check if element has tag attributes
      if (elem && this._containsAttributes(link, elem)) return elem;
    }
    const element: HTMLLinkElement = this._dom.createElement('link') as HTMLLinkElement;
    this._setLinkElementAttributes(link, element);
    const head = this._doc.getElementsByTagName('head')[0];
    head.appendChild(element);
    return element;
  }

  private _setLinkElementAttributes(link: LinkDefinition, el: HTMLLinkElement): HTMLLinkElement {
    Object.keys(link).forEach((prop: string) => el.setAttribute(prop, link[prop]));
    return el;
  }

  private _parseSelector(link: LinkDefinition): string {
    const attr: string = link.rel ? 'rel' : 'href';
    return `${attr}="${link[attr]}"`;
  }

  private _containsAttributes(link: LinkDefinition, elem: HTMLLinkElement): boolean {
    return Object.keys(link).every((key: string) => elem.getAttribute(key) === link[key]);
  }
}
