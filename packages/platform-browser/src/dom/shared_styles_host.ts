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
 * Removes all provided elements from the document.
 * @param elements An array of HTML Elements.
 */
function removeAll(elements: Iterable<HTMLElement>): void {
  for (const element of elements) {
    element.remove();
  }
}

/**
 * Searches a DOM document's head element for style elements with a matching application
 * identifier attribute (`ng-app-id`) to the provide identifier.
 * @param doc An HTML DOM document instance.
 * @param appId A string containing an Angular application identifer.
 * @returns A map of style strings to style elements if found; Otherwise, `null`.
 */
function findServerStyles(doc: Document, appId: string): Map<string, HTMLStyleElement> | null {
  const styleElements = doc.head?.querySelectorAll<HTMLStyleElement>(
    `style[${APP_ID_ATTRIBUTE_NAME}="${appId}"]`,
  );

  let styles: null | Map<string, HTMLStyleElement> = null;
  if (styleElements) {
    for (const styleElement of styleElements) {
      if (styleElement.textContent) {
        styles ??= new Map();
        styles.set(styleElement.textContent, styleElement);
      }
    }
  }

  return styles;
}

@Injectable()
export class SharedStylesHost implements OnDestroy {
  /**
   * Provides usage information for active embedded style content and associated HTML <style> elements.
   * Embedded styles typically originate from the `styles` metadata of a rendered component.
   */
  private readonly embeddedStyles = new Map<string /** content */, UsageRecord<HTMLStyleElement>>();

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
    this.serverStyles = findServerStyles(doc, appId);
    this.hosts.add(doc.head);
  }

  /**
   * Adds embedded styles to the DOM via HTML `style` elements.
   * @param styles An array of style content strings.
   */
  addStyles(styles: string[]): void {
    const creator = this.getStyleElement.bind(this);
    for (const value of styles) {
      this.add(value, this.embeddedStyles, creator);
    }
  }

  /**
   * Removes embedded styles from the DOM that were added as HTML `style` elements.
   * @param styles An array of style content strings.
   */
  removeStyles(styles: string[]): void {
    for (const value of styles) {
      this.remove(value, this.embeddedStyles);
    }
  }

  protected add<T extends HTMLElement>(
    value: string,
    usages: Map<string, UsageRecord<T>>,
    creator: (host: Node, value: string) => T,
  ): void {
    // Attempt to get any current usage of the value
    const record = usages.get(value);

    // If existing, just increment the usage count
    if (record) {
      record.usage++;
    } else {
      // Otherwise, create an entry to track the elements and add element for each host
      usages.set(value, {usage: 1, elements: [...this.hosts].map((host) => creator(host, value))});
    }
  }

  protected remove<T extends HTMLElement>(
    value: string,
    usages: Map<string, UsageRecord<T>>,
  ): void {
    // Attempt to get any current usage of the value
    const record = usages.get(value);

    // If there is a record, reduce the usage count and if no longer used,
    // remove from DOM and delete usage record.
    if (record) {
      record.usage--;
      if (record.usage <= 0) {
        removeAll(record.elements);
        usages.delete(value);
      }
    }
  }

  ngOnDestroy(): void {
    const serverStyles = this.serverStyles;
    if (serverStyles) {
      removeAll(serverStyles.values());
      serverStyles.clear();
    }

    for (const [, {elements}] of this.embeddedStyles) {
      removeAll(elements);
    }
    this.hosts.clear();
  }

  /**
   * Adds a host node to the set of style hosts and adds all existing style usage to
   * the newly added host node.
   *
   * This is currently only used for Shadow DOM encapsulation mode.
   */
  addHost(hostNode: Node): void {
    this.hosts.add(hostNode);

    for (const [style, {elements}] of this.embeddedStyles) {
      elements.push(this.getStyleElement(hostNode, style));
    }
  }

  removeHost(hostNode: Node): void {
    this.hosts.delete(hostNode);
  }

  private addElement<T extends HTMLElement>(host: Node, element: T): T {
    // Add a nonce if present
    if (this.nonce) {
      element.setAttribute('nonce', this.nonce);
    }

    // Add application identifier when on the server to support client-side reuse
    if (this.isServer) {
      element.setAttribute(APP_ID_ATTRIBUTE_NAME, this.appId);
    }

    // Insert the element into the DOM with the host node as parent
    return host.appendChild(element);
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
