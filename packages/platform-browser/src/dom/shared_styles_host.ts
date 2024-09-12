/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT, isPlatformServer} from '@angular/common';
import {
  APP_ID,
  CSP_NONCE,
  Inject,
  Injectable,
  OnDestroy,
  Optional,
  PLATFORM_ID,
} from '@angular/core';

/** The style elements attribute name used to set value of `APP_ID` token. */
const APP_ID_ATTRIBUTE_NAME = 'ng-app-id';

/**
 * A record of usage for a specific style including all elements added to the DOM
 * that contain a given style.
 */
interface UsageRecord<T> {
  elements: T[];
  usage: number;
}

/**
 * Removes all elements referenced in the provided usage map from the DOM and
 * clears out the map to prevent references from being unecessarily retained.
 * @param usages A Map containing the style/link elements to remove.
 */
function removeAll(usages: Map<unknown, UsageRecord<Element>>): void {
  for (const record of usages.values()) {
    record.elements.forEach((element) => element.remove());
  }
  usages.clear();
}

@Injectable()
export class SharedStylesHost implements OnDestroy {
  /**
   * Provides usage information for embedded style content and the HTML style elements using each style.
   */
  private readonly embedded = new Map<string /** Style content */, UsageRecord<HTMLStyleElement>>();

  /**
   * Provides usage information for external style URLs and the HTML link elements using each style.
   */
  private readonly external = new Map<string /** Style URL */, UsageRecord<HTMLLinkElement>>();

  /**
   * Set of host DOM nodes that will have styles attached.
   */
  private readonly hosts = new Set<Node>();

  /**
   * A lookup for server rendered styles if any are present in the DOM on initialization.
   * `null` if no server rendered styles are present in the DOM.
   */
  private readonly serverStyles: Map<string, HTMLStyleElement> | null;

  /**
   * Whether the application code is currently executing on a server.
   */
  private readonly isServer: boolean;

  constructor(
    @Inject(DOCUMENT) private readonly doc: Document,
    @Inject(APP_ID) private readonly appId: string,
    @Inject(CSP_NONCE) @Optional() private readonly nonce?: string | null,
    @Inject(PLATFORM_ID) platformId: object = {},
  ) {
    this.isServer = isPlatformServer(platformId);
    this.serverStyles = this.findServerStyles();
    this.hosts.add(this.doc.head);
  }

  /**
   * Adds embedded styles to the DOM via HTML `style` elements.
   * @param styles An array of style content strings.
   */
  addStyles(styles: string[]): void {
    this.add(styles, this.embedded, this.getStyleElement.bind(this));
  }

  /**
   * Removes embedded styles from the DOM that were added as HTML `style` elements.
   * @param styles An array of style content strings.
   */
  removeStyles(styles: string[]): void {
    this.remove(styles, this.embedded);
  }

  /**
   * Adds external runtime styles to the DOM via HTML `link` elements.
   * @param urls An array of stylesheet URL strings.
   */
  addExternalStyles(urls: string[]): void {
    this.add(urls, this.external, this.getLinkElement.bind(this));
  }

  /**
   * Removes external runtime styles from the DOM that were added as HTML `link` elements.
   * @param urls An array of stylesheet URL strings.
   */
  removeExternalStyles(urls: string[]): void {
    this.remove(urls, this.external);
  }

  private add<T>(
    values: string[],
    usages: Map<string, UsageRecord<T>>,
    creator: (host: Node, value: string) => T,
  ): void {
    for (const value of values) {
      // Attempt to get any current usage of the value
      let record = usages.get(value);

      // If not present create an entry to track the elements and add element for each host
      if (record === undefined) {
        record = {usage: 1, elements: [...this.hosts].map((host) => creator(host, value))};
        usages.set(value, record);
      } else {
        // If existing, increment the usage count
        record.usage++;
      }
    }
  }

  private remove<T extends HTMLElement>(
    values: string[],
    usages: Map<string, UsageRecord<T>>,
  ): void {
    for (const value of values) {
      // Attempt to get any current usage of the value
      const record = usages.get(value);

      // If there is a record, reduce the usage count and if no longer used,
      // remove from DOM and delete usage record.
      if (record && --record.usage <= 0) {
        record.elements.forEach((element) => element.remove());
        usages.delete(value);
      }
    }
  }

  private getLinkElement(host: Node, url: string): HTMLLinkElement {
    const linkElement = this.doc.createElement('link');
    linkElement.setAttribute('rel', 'stylesheet');
    linkElement.setAttribute('href', url);

    return this.addElement(host, linkElement);
  }

  private addElement<T extends HTMLElement>(host: Node, element: T): T {
    if (this.nonce) {
      element.setAttribute('nonce', this.nonce);
    }

    if (this.isServer) {
      element.setAttribute(APP_ID_ATTRIBUTE_NAME, this.appId);
    }

    return host.appendChild(element);
  }

  ngOnDestroy(): void {
    const serverStyles = this.serverStyles;
    if (serverStyles) {
      serverStyles.forEach((node) => node.remove());
      serverStyles.clear();
    }

    removeAll(this.embedded);
    removeAll(this.external);

    this.hosts.clear();
  }

  addHost(hostNode: Node): void {
    this.hosts.add(hostNode);

    for (const [style, {elements}] of this.embedded) {
      elements.push(this.getStyleElement(hostNode, style));
    }

    for (const [url, {elements}] of this.external) {
      elements.push(this.getLinkElement(hostNode, url));
    }
  }

  removeHost(hostNode: Node): void {
    this.hosts.delete(hostNode);
  }

  private findServerStyles(): Map<string, HTMLStyleElement> | null {
    const styles = this.doc.head?.querySelectorAll<HTMLStyleElement>(
      `style[${APP_ID_ATTRIBUTE_NAME}="${this.appId}"]`,
    );

    if (styles?.length) {
      const styleMap = new Map<string, HTMLStyleElement>();

      styles.forEach((style) => {
        if (style.textContent != null) {
          styleMap.set(style.textContent, style);
        }
      });

      return styleMap;
    }

    return null;
  }

  private getStyleElement(host: Node, style: string): HTMLStyleElement {
    const styleNodesInDOM = this.serverStyles;
    let styleEl = styleNodesInDOM?.get(style);
    if (styleEl?.parentNode === host) {
      // `styleNodesInDOM` cannot be undefined due to the above `styleNodesInDOM?.get`.
      styleNodesInDOM!.delete(style);

      styleEl.removeAttribute(APP_ID_ATTRIBUTE_NAME);

      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        // This attribute is solely used for debugging purposes.
        styleEl.setAttribute('ng-style-reused', '');
      }
    } else {
      styleEl = this.doc.createElement('style');
      styleEl.textContent = style;

      this.addElement(host, styleEl);
    }

    return styleEl;
  }
}
