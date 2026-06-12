/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT} from '@angular/common';
import {Inject, Injectable} from '@angular/core';

/**
 * Represents the attributes of an HTML `<link>` element.
 *
 * @see [HTML link element](https://developer.mozilla.org/docs/Web/HTML/Element/link)
 * @see {@link Link}
 *
 * @publicApi
 */
export type LinkDefinition = {
  as?: string;
  blocking?: string;
  charset?: string;
  crossorigin?: string;
  disabled?: string;
  fetchpriority?: string;
  href?: string;
  hreflang?: string;
  imagesizes?: string;
  imagesrcset?: string;
  integrity?: string;
  media?: string;
  nonce?: string;
  referrerpolicy?: string;
  rel?: string;
  rev?: string;
  sizes?: string;
  target?: string;
  title?: string;
  type?: string;
} & {
  [prop: string]: string | undefined;
};

/**
 * A service for managing HTML `<link>` tags.
 *
 * Properties of the `LinkDefinition` object match the attributes of the
 * HTML `<link>` tag. These tags are used for canonical URLs, stylesheets,
 * preload and prefetch hints, Web App Manifest references, and more.
 *
 * To identify specific `<link>` tags in a document, use an attribute selection
 * string in the format `"tag_attribute='value string'"`.
 * For example, an `attrSelector` value of `"rel='canonical'"` matches a tag
 * whose `rel` attribute has the value `"canonical"`.
 * Selectors are used with the `querySelector()` Document method,
 * in the format `link[{attrSelector}]`.
 *
 * @see [HTML link element](https://developer.mozilla.org/docs/Web/HTML/Element/link)
 * @see [Document.querySelector()](https://developer.mozilla.org/docs/Web/API/Document/querySelector)
 *
 * @publicApi
 */
@Injectable({providedIn: 'root'})
export class Link {
  constructor(@Inject(DOCUMENT) private _doc: any) {}

  /**
   * Retrieves or creates a specific `<link>` tag element in the current HTML document.
   */
  addTag(tag: LinkDefinition, forceCreation: boolean = false): HTMLLinkElement | null {
    if (!tag) return null;

    return this._getOrCreateElement(tag, forceCreation);
  }

  /**
   * Retrieves or creates a set of `<link>` tag elements in the current HTML document.
   */
  addTags(tags: LinkDefinition[], forceCreation: boolean = false): HTMLLinkElement[] {
    if (!tags) return [];

    return tags.reduce((result: HTMLLinkElement[], tag: LinkDefinition) => {
      if (tag) {
        result.push(this._getOrCreateElement(tag, forceCreation));
      }

      return result;
    }, []);
  }

  /**
   * Retrieves a `<link>` tag element in the current HTML document.
   */
  getTag(attrSelector: string): HTMLLinkElement | null {
    if (!attrSelector) return null;

    return this._doc.querySelector(`link[${attrSelector}]`) || null;
  }

  /**
   * Retrieves a set of `<link>` tag elements in the current HTML document.
   */
  getTags(attrSelector: string): HTMLLinkElement[] {
    if (!attrSelector) return [];

    const list = this._doc.querySelectorAll(`link[${attrSelector}]`);

    return list ? [].slice.call(list) : [];
  }

  /**
   * Modifies an existing `<link>` tag element in the current HTML document.
   */
  updateTag(tag: LinkDefinition, selector?: string): HTMLLinkElement | null {
    if (!tag) return null;

    selector = selector || this._parseSelector(tag);

    const link = this.getTag(selector);

    if (link) {
      return this._setLinkElementAttributes(tag, link);
    }

    return this._getOrCreateElement(tag, true);
  }

  /**
   * Removes an existing `<link>` tag element from the current HTML document.
   */
  removeTag(attrSelector: string): void {
    this.removeTagElement(this.getTag(attrSelector)!);
  }

  /**
   * Removes a specific `<link>` tag element from the document.
   */
  removeTagElement(link: HTMLLinkElement): void {
    if (link && link.parentNode) {
      link.parentNode.removeChild(link);
    }
  }

  private _getOrCreateElement(
    link: LinkDefinition,
    forceCreation: boolean = false,
  ): HTMLLinkElement {
    if (!forceCreation) {
      const selector = this._parseSelector(link);

      if (selector) {
        const existing = this.getTags(selector).filter((elem) =>
          this._containsAttributes(link, elem),
        )[0];

        if (existing !== undefined) {
          return existing;
        }
      }
    }

    const element = this._doc.createElement('link') as HTMLLinkElement;

    this._setLinkElementAttributes(link, element);

    this._doc.head.appendChild(element);

    return element;
  }

  private _setLinkElementAttributes(tag: LinkDefinition, el: HTMLLinkElement): HTMLLinkElement {
    Object.keys(tag).forEach((prop: string) => {
      const value = tag[prop];

      if (value !== undefined) {
        (el as unknown as Record<string, string>)[prop] = value;
      }
    });

    return el;
  }

  private _parseSelector(tag: LinkDefinition): string {
    const selectors: string[] = [];

    if (tag.rel) {
      selectors.push(`rel="${tag.rel}"`);
    }

    if (tag.href) {
      selectors.push(`href="${tag.href}"`);
    }

    return selectors.join('][');
  }

  private _containsAttributes(tag: LinkDefinition, elem: HTMLLinkElement): boolean {
    return Object.keys(tag).every((key: string) => elem.getAttribute(key) === tag[key]);
  }
}
