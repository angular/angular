/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT, ɵDomAdapter as DomAdapter, ɵgetDOM as getDOM} from '@angular/common';
import {Inject, Injectable} from '@angular/core';

/**
 * Represents the attributes of an HTML `<meta>` element. The element itself is
 * represented by the internal `HTMLMetaElement`.
 *
 * @see [HTML meta tag](https://developer.mozilla.org/docs/Web/HTML/Element/meta)
 * @see {@link Meta}
 *
 * @publicApi
 */
export type MetaDefinition = {
  charset?: string;
  content?: string;
  httpEquiv?: string;
  id?: string;
  itemprop?: string;
  name?: string;
  property?: string;
  scheme?: string;
  url?: string;
} & {
  // TODO(IgorMinar): this type looks wrong
  [prop: string]: string;
};

/**
 * A service for managing HTML `<meta>` tags.
 *
 * Properties of the `MetaDefinition` object match the attributes of the
 * HTML `<meta>` tag. These tags define document metadata that is important for
 * things like configuring a Content Security Policy, defining browser compatibility
 * and security settings, setting HTTP Headers, defining rich content for social sharing,
 * and Search Engine Optimization (SEO).
 *
 * To identify specific `<meta>` tags in a document, use an attribute selection
 * string in the format `"tag_attribute='value string'"`.
 * For example, an `attrSelector` value of `"name='description'"` matches a tag
 * whose `name` attribute has the value `"description"`.
 * Selectors are used with the `querySelector()` Document method,
 * in the format `meta[{attrSelector}]`.
 *
 * @see [HTML meta tag](https://developer.mozilla.org/docs/Web/HTML/Element/meta)
 * @see [Document.querySelector()](https://developer.mozilla.org/docs/Web/API/Document/querySelector)
 *
 *
 * @publicApi
 */
@Injectable({providedIn: 'root'})
export class Meta {
  private _dom: DomAdapter;
  constructor(@Inject(DOCUMENT) private _doc: any) {
    this._dom = getDOM();
  }
  /**
   * Retrieves or creates a specific `<meta>` tag element in the current HTML document.
   * In searching for an existing tag, Angular attempts to match the `name` or `property` attribute
   * values in the provided tag definition, and verifies that all other attribute values are equal.
   * If an existing element is found, it is returned and is not modified in any way.
   * @param tag The definition of a `<meta>` element to match or create.
   * @param forceCreation True to create a new element without checking whether one already exists.
   * @returns The existing element with the same attributes and values if found,
   * the new element if no match is found, or `null` if the tag parameter is not defined.
   */
  addTag(tag: MetaDefinition, forceCreation: boolean = false): HTMLMetaElement | null {
    if (!tag) return null;
    return this._getOrCreateElement(tag, forceCreation);
  }

  /**
   * Retrieves or creates a set of `<meta>` tag elements in the current HTML document.
   * In searching for an existing tag, Angular attempts to match the `name` or `property` attribute
   * values in the provided tag definition, and verifies that all other attribute values are equal.
   * @param tags An array of tag definitions to match or create.
   * @param forceCreation True to create new elements without checking whether they already exist.
   * @returns The matching elements if found, or the new elements.
   */
  addTags(tags: MetaDefinition[], forceCreation: boolean = false): HTMLMetaElement[] {
    if (!tags) return [];
    return tags.reduce((result: HTMLMetaElement[], tag: MetaDefinition) => {
      if (tag) {
        result.push(this._getOrCreateElement(tag, forceCreation));
      }
      return result;
    }, []);
  }

  /**
   * Retrieves a `<meta>` tag element in the current HTML document.
   * @param attrSelector The tag attribute and value to match against, in the format
   * `"tag_attribute='value string'"`.
   * @returns The matching element, if any.
   */
  getTag(attrSelector: string): HTMLMetaElement | null {
    if (!attrSelector) return null;
    return this._doc.querySelector(`meta[${attrSelector}]`) || null;
  }

  /**
   * Retrieves a set of `<meta>` tag elements in the current HTML document.
   * @param attrSelector The tag attribute and value to match against, in the format
   * `"tag_attribute='value string'"`.
   * @returns The matching elements, if any.
   */
  getTags(attrSelector: string): HTMLMetaElement[] {
    if (!attrSelector) return [];
    const list /*NodeList*/ = this._doc.querySelectorAll(`meta[${attrSelector}]`);
    return list ? [].slice.call(list) : [];
  }

  /**
   * Modifies an existing `<meta>` tag element in the current HTML document.
   * @param tag The tag description with which to replace the existing tag content.
   * @param selector A tag attribute and value to match against, to identify
   * an existing tag. A string in the format `"tag_attribute=`value string`"`.
   * If not supplied, matches a tag with the same `name` or `property` attribute value as the
   * replacement tag.
   * @return The modified element.
   */
  updateTag(tag: MetaDefinition, selector?: string): HTMLMetaElement | null {
    if (!tag) return null;
    selector = selector || this._parseSelector(tag);
    const meta: HTMLMetaElement = this.getTag(selector)!;
    if (meta) {
      return this._setMetaElementAttributes(tag, meta);
    }
    return this._getOrCreateElement(tag, true);
  }

  /**
   * Removes an existing `<meta>` tag element from the current HTML document.
   * @param attrSelector A tag attribute and value to match against, to identify
   * an existing tag. A string in the format `"tag_attribute=`value string`"`.
   */
  removeTag(attrSelector: string): void {
    this.removeTagElement(this.getTag(attrSelector)!);
  }

  /**
   * Removes an existing `<meta>` tag element from the current HTML document.
   * @param meta The tag definition to match against to identify an existing tag.
   */
  removeTagElement(meta: HTMLMetaElement): void {
    if (meta) {
      this._dom.remove(meta);
    }
  }

  private _getOrCreateElement(
    meta: MetaDefinition,
    forceCreation: boolean = false,
  ): HTMLMetaElement {
    if (!forceCreation) {
      const selector: string = this._parseSelector(meta);
      // It's allowed to have multiple elements with the same name so it's not enough to
      // just check that element with the same name already present on the page. We also need to
      // check if element has tag attributes
      const elem = this.getTags(selector).filter((elem) => this._containsAttributes(meta, elem))[0];
      if (elem !== undefined) return elem;
    }
    const element: HTMLMetaElement = this._dom.createElement('meta') as HTMLMetaElement;
    this._setMetaElementAttributes(meta, element);
    const head = this._doc.getElementsByTagName('head')[0];
    head.appendChild(element);
    return element;
  }

  private _setMetaElementAttributes(tag: MetaDefinition, el: HTMLMetaElement): HTMLMetaElement {
    Object.keys(tag).forEach((prop: string) =>
      el.setAttribute(this._getMetaKeyMap(prop), tag[prop]),
    );
    return el;
  }

  private _parseSelector(tag: MetaDefinition): string {
    const attr: string = tag.name ? 'name' : 'property';
    return `${attr}="${tag[attr]}"`;
  }

  private _containsAttributes(tag: MetaDefinition, elem: HTMLMetaElement): boolean {
    return Object.keys(tag).every(
      (key: string) => elem.getAttribute(this._getMetaKeyMap(key)) === tag[key],
    );
  }

  private _getMetaKeyMap(prop: string): string {
    return META_KEYS_MAP[prop] || prop;
  }
}

/**
 * Mapping for MetaDefinition properties with their correct meta attribute names
 */
const META_KEYS_MAP: {[prop: string]: string} = {
  httpEquiv: 'http-equiv',
};
