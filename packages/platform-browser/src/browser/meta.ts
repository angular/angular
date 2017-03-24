/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable} from '@angular/core';

import {DomAdapter, getDOM} from '../dom/dom_adapter';
import {DOCUMENT} from '../dom/dom_tokens';


/**
 * Represents a meta element.
 *
 * @experimental
 */
export type MetaDefinition = {
  charset?: string; content?: string; httpEquiv?: string; id?: string; itemprop?: string;
  name?: string;
  property?: string;
  scheme?: string;
  url?: string;
} &
{
  // TODO(IgorMinar): this type looks wrong
  [prop: string]: string;
};

/**
 * A service that can be used to get and add meta tags.
 *
 * @experimental
 */
@Injectable()
export class Meta {
  private _dom: DomAdapter;
  constructor(@Inject(DOCUMENT) private _doc: any) { this._dom = getDOM(); }

  addTag(tag: MetaDefinition, forceCreation: boolean = false): HTMLMetaElement|null {
    if (!tag) return null;
    return this._getOrCreateElement(tag, forceCreation);
  }

  addTags(tags: MetaDefinition[], forceCreation: boolean = false): HTMLMetaElement[] {
    if (!tags) return [];
    return tags.reduce((result: HTMLMetaElement[], tag: MetaDefinition) => {
      if (tag) {
        result.push(this._getOrCreateElement(tag, forceCreation));
      }
      return result;
    }, []);
  }

  getTag(attrSelector: string): HTMLMetaElement|null {
    if (!attrSelector) return null;
    return this._dom.querySelector(this._doc, `meta[${attrSelector}]`);
  }

  getTags(attrSelector: string): HTMLMetaElement[] {
    if (!attrSelector) return [];
    const list /*NodeList*/ = this._dom.querySelectorAll(this._doc, `meta[${attrSelector}]`);
    return list ? [].slice.call(list) : [];
  }

  updateTag(tag: MetaDefinition, selector?: string): HTMLMetaElement|null {
    if (!tag) return null;
    selector = selector || this._parseSelector(tag);
    const meta: HTMLMetaElement = this.getTag(selector) !;
    if (meta) {
      return this._setMetaElementAttributes(tag, meta);
    }
    return this._getOrCreateElement(tag, true);
  }

  removeTag(attrSelector: string): void { this.removeTagElement(this.getTag(attrSelector) !); }

  removeTagElement(meta: HTMLMetaElement): void {
    if (meta) {
      this._dom.remove(meta);
    }
  }

  private _getOrCreateElement(meta: MetaDefinition, forceCreation: boolean = false):
      HTMLMetaElement {
    if (!forceCreation) {
      const selector: string = this._parseSelector(meta);
      const elem: HTMLMetaElement = this.getTag(selector) !;
      // It's allowed to have multiple elements with the same name so it's not enough to
      // just check that element with the same name already present on the page. We also need to
      // check if element has tag attributes
      if (elem && this._containsAttributes(meta, elem)) return elem;
    }
    const element: HTMLMetaElement = this._dom.createElement('meta') as HTMLMetaElement;
    this._setMetaElementAttributes(meta, element);
    const head = this._dom.getElementsByTagName(this._doc, 'head')[0];
    this._dom.appendChild(head, element);
    return element;
  }

  private _setMetaElementAttributes(tag: MetaDefinition, el: HTMLMetaElement): HTMLMetaElement {
    Object.keys(tag).forEach((prop: string) => this._dom.setAttribute(el, prop, tag[prop]));
    return el;
  }

  private _parseSelector(tag: MetaDefinition): string {
    const attr: string = tag.name ? 'name' : 'property';
    return `${attr}="${tag[attr]}"`;
  }

  private _containsAttributes(tag: MetaDefinition, elem: HTMLMetaElement): boolean {
    return Object.keys(tag).every((key: string) => this._dom.getAttribute(elem, key) === tag[key]);
  }
}
