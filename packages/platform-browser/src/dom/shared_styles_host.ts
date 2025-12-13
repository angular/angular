/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT} from '@angular/common';
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
function removeElements(elements: Iterable<HTMLElement>): void {
  for (const element of elements) {
    element.remove();
  }
}

/**
 * Creates a `style` element with the provided inline style content.
 * @param style A string of the inline style content.
 * @param doc A DOM Document to use to create the element.
 * @returns An HTMLStyleElement instance.
 */
function createStyleElement(style: string, doc: Document): HTMLStyleElement {
  const styleElement = doc.createElement('style');
  styleElement.textContent = style;

  return styleElement;
}

/**
 * Searches a DOM document's head element for style elements with a matching application
 * identifier attribute (`ng-app-id`) to the provide identifier and adds usage records for each.
 * @param doc An HTML DOM document instance.
 * @param appId A string containing an Angular application identifer.
 * @param inline A Map object for tracking inline (defined via `styles` in component decorator) style usage.
 * @param external A Map object for tracking external (defined via `styleUrls` in component decorator) style usage.
 */
function addServerStyles(
  doc: Document,
  appId: string,
  inline: Map<string, UsageRecord<HTMLStyleElement>>,
  external: Map<string, UsageRecord<HTMLLinkElement>>,
): void {
  const elements = doc.head?.querySelectorAll<HTMLStyleElement | HTMLLinkElement>(
    `style[${APP_ID_ATTRIBUTE_NAME}="${appId}"],link[${APP_ID_ATTRIBUTE_NAME}="${appId}"]`,
  );

  if (elements) {
    for (const styleElement of elements) {
      styleElement.removeAttribute(APP_ID_ATTRIBUTE_NAME);
      if (styleElement instanceof HTMLLinkElement) {
        // Only use filename from href
        // The href is build time generated with a unique value to prevent duplicates.
        external.set(styleElement.href.slice(styleElement.href.lastIndexOf('/') + 1), {
          usage: 0,
          elements: [styleElement],
        });
      } else if (styleElement.textContent) {
        inline.set(styleElement.textContent, {usage: 0, elements: [styleElement]});
      }
    }
  }
}

/**
 * Creates a `link` element for the provided external style URL.
 * @param url A string of the URL for the stylesheet.
 * @param doc A DOM Document to use to create the element.
 * @returns An HTMLLinkElement instance.
 */
export function createLinkElement(url: string, doc: Document): HTMLLinkElement {
  const linkElement = doc.createElement('link');
  linkElement.setAttribute('rel', 'stylesheet');
  linkElement.setAttribute('href', url);

  return linkElement;
}

@Injectable()
export class SharedStylesHost implements OnDestroy {
  /**
   * Provides usage information for active inline style content and associated HTML <style> elements per host.
   * Embedded styles typically originate from the `styles` metadata of a rendered component.
   */
  private readonly inline = new Map<
    ShadowRoot | HTMLHeadElement,
    Map<string, UsageRecord<HTMLStyleElement>>
  >();

  /**
   * Provides usage information for active external style URLs and the associated HTML <link> elements per host.
   * External styles typically originate from the `ɵɵExternalStylesFeature` of a rendered component.
   */
  private readonly external = new Map<
    ShadowRoot | HTMLHeadElement,
    Map<string, UsageRecord<HTMLLinkElement>>
  >();

  /**
   * Set of host DOM nodes that will have styles attached.
   */
  private readonly standardShadowHosts = new Set<Node>();
  private readonly isolatedShadowRoots = new Set<Node>();

  constructor(
    @Inject(DOCUMENT) private readonly doc: Document,
    @Inject(APP_ID) private readonly appId: string,
    @Inject(CSP_NONCE) @Optional() private readonly nonce?: string | null,
    // Cannot remove it due to backward compatibility
    // (it seems some TGP targets might be calling this constructor directly).
    @Inject(PLATFORM_ID) platformId: object = {},
  ) {
    // Initialize maps for document head
    const inlineMap = new Map();
    const externalMap = new Map();
    this.inline.set(doc.head, inlineMap);
    this.external.set(doc.head, externalMap);

    addServerStyles(doc, appId, inlineMap, externalMap);
    this.standardShadowHosts.add(doc.head);
  }

  /**
   * Adds embedded styles to the DOM via HTML `style` elements.
   *
   * Modified to support IsolatedShadowDom by accepting a specific target shadow root.
   * This ensures styles are only added where they're actually needed rather than broadcasting
   * to all active shadow roots.
   *
   * @param styles An array of style content strings.
   * @param urls An optional array of external stylesheet URL strings.
   * @param shadowRoot Optional shadow root to add styles to. If provided, styles go only to this shadow root.
   *                   If not provided, styles go to document head and all standard shadow DOM hosts.
   */
  addStyles(styles: string[], urls?: string[], shadowRoot?: ShadowRoot): void {
    for (const style of styles) {
      this.addUsage(style, this.inline, createStyleElement, shadowRoot);
    }
    urls?.forEach((url) => this.addUsage(url, this.external, createLinkElement, shadowRoot));
  }

  /**
   * Removes embedded styles from the DOM that were added as HTML `style` elements.
   * @param styles An array of style content strings.
   * @param urls An optional array of external stylesheet URL strings to remove.
   * @param shadowRoot Optional shadow root to remove styles from (for IsolatedShadowDom).
   */
  removeStyles(styles: string[], urls?: string[], shadowRoot?: ShadowRoot): void {
    for (const value of styles) {
      this.removeUsage(value, this.inline, shadowRoot);
    }

    urls?.forEach((value) => this.removeUsage(value, this.external, shadowRoot));
  }

  /**
   * Handle timing issues with projected components. When adding styles to an
   * IsolatedShadowDom shadow root, we check if the same styles were previously added to doc.head
   * due to timing issues (renderer creation before DOM attachment). If so, we clean up the
   * incorrect doc.head styles to prevent duplication.
   */
  protected addUsage<T extends HTMLElement>(
    value: string,
    usagesMap: Map<ShadowRoot | HTMLHeadElement, Map<string, UsageRecord<T>>>,
    creator: (value: string, doc: Document) => T,
    targetShadowRoot?: ShadowRoot,
  ): void {
    if (targetShadowRoot) {
      // Precise targeting for isolated shadow DOM
      this.addUsageToTarget(value, usagesMap, creator, targetShadowRoot);
    } else {
      // Broadcast to all standard shadow hosts (including doc.head)
      for (const host of this.standardShadowHosts) {
        this.addUsageToTarget(value, usagesMap, creator, host as ShadowRoot | HTMLHeadElement);
      }
    }
  }

  /**
   * Helper method that handles adding styles to a specific target container
   * while managing usage tracking and deduplication.
   */
  private addUsageToTarget<T extends HTMLElement>(
    value: string,
    usagesMap: Map<ShadowRoot | HTMLHeadElement, Map<string, UsageRecord<T>>>,
    creator: (value: string, doc: Document) => T,
    styleRoot: ShadowRoot | HTMLHeadElement,
  ): void {
    let usages = usagesMap.get(styleRoot);
    if (!usages) {
      usages = new Map();
      usagesMap.set(styleRoot, usages);
    }

    const record = usages.get(value);
    if (record) {
      if ((typeof ngDevMode === 'undefined' || ngDevMode) && record.usage === 0) {
        record.elements.forEach((element) => element.setAttribute('ng-style-reused', ''));
      }
      record.usage++;
      return;
    }

    // Create new usage record with element for the specific target
    const element = this.addElement(styleRoot, creator(value, this.doc));
    usages.set(value, {usage: 1, elements: [element]});
  }

  /**
   * Removal logic to match the new precise targeting approach.
   * Previously removed styles from all active shadow roots, now removes only from
   * the specific target. This prevents accidental removal of styles from unrelated
   * IsolatedShadowDom components.
   */
  protected removeUsage<T extends HTMLElement>(
    value: string,
    usagesMap: Map<ShadowRoot | HTMLHeadElement, Map<string, UsageRecord<T>>>,
    targetShadowRoot?: ShadowRoot,
  ): void {
    if (targetShadowRoot) {
      // Remove from specific shadow root
      this.removeUsageFromTarget(value, usagesMap, targetShadowRoot);
    } else {
      // Remove from all standard shadow hosts (including doc.head)
      for (const host of this.standardShadowHosts) {
        this.removeUsageFromTarget(value, usagesMap, host as ShadowRoot | HTMLHeadElement);
      }
    }
  }
  /**
   * Helper method for removing styles from a specific target container.
   */
  private removeUsageFromTarget<T extends HTMLElement>(
    value: string,
    usagesMap: Map<ShadowRoot | HTMLHeadElement, Map<string, UsageRecord<T>>>,
    styleRoot: ShadowRoot | HTMLHeadElement,
  ): void {
    const usages = usagesMap.get(styleRoot);
    if (!usages) return;

    const record = usages.get(value);
    if (record) {
      record.usage--;
      if (record.usage <= 0) {
        removeElements(record.elements);
        usages.delete(value);
      }
    }
  }

  ngOnDestroy(): void {
    for (const usages of [...this.inline.values(), ...this.external.values()]) {
      for (const [, {elements}] of usages) {
        removeElements(elements);
      }
    }
    this.standardShadowHosts.clear();
  }

  /**
   * Adds a host node to the set of style hosts and adds all existing style usage to
   * the newly added host node.
   *
   * This is currently only used for Shadow DOM encapsulation mode.
   */
  addHost(hostNode: Node): void {
    this.standardShadowHosts.add(hostNode);

    // Add existing styles to new host
    const headInline = this.inline.get(this.doc.head);
    const headExternal = this.external.get(this.doc.head);

    // Initialize usage maps for the new host
    const hostKey = hostNode as ShadowRoot | HTMLHeadElement;
    const newInlineUsages = new Map();
    const newExternalUsages = new Map();
    this.inline.set(hostKey, newInlineUsages);
    this.external.set(hostKey, newExternalUsages);

    if (headInline) {
      for (const [style] of headInline) {
        const element = this.addElement(hostNode, createStyleElement(style, this.doc));
        newInlineUsages.set(style, {usage: 1, elements: [element]});
      }
    }

    if (headExternal) {
      for (const [url] of headExternal) {
        const element = this.addElement(hostNode, createLinkElement(url, this.doc));
        newExternalUsages.set(url, {usage: 1, elements: [element]});
      }
    }
  }

  removeHost(hostNode: Node): void {
    this.standardShadowHosts.delete(hostNode);

    // Clean up usage maps for removed host
    const hostKey = hostNode as ShadowRoot | HTMLHeadElement;
    const inlineUsages = this.inline.get(hostKey);
    const externalUsages = this.external.get(hostKey);

    if (inlineUsages) {
      for (const {elements} of inlineUsages.values()) {
        removeElements(elements);
      }
      this.inline.delete(hostKey);
    }

    if (externalUsages) {
      for (const {elements} of externalUsages.values()) {
        removeElements(elements);
      }
      this.external.delete(hostKey);
    }
  }

  private addElement<T extends HTMLElement>(host: Node, element: T): T {
    if (this.nonce) {
      element.setAttribute('nonce', this.nonce);
    }

    // Add application identifier when on the server to support client-side reuse
    if (typeof ngServerMode !== 'undefined' && ngServerMode) {
      element.setAttribute(APP_ID_ATTRIBUTE_NAME, this.appId);
    }
    host.appendChild(element);
    return element;
  }

  addShadowRoot(shadowRoot: ShadowRoot): void {
    // Throw error if using isolated shadow roots in SSR mode
    if (typeof ngServerMode !== 'undefined' && ngServerMode) {
      throw new Error(
        'IsolatedShadowRoot is not supported in SSR mode until declarative shadow DOM is supported.',
      );
    }

    // Check if ShadowRoot is supported in this environment
    if (typeof ShadowRoot === 'undefined') {
      throw new Error('ShadowRoot is not supported in this environment.');
    }

    if (typeof ngDevMode !== 'undefined' && ngDevMode && this.isolatedShadowRoots.has(shadowRoot)) {
      throw new Error('Shadow root is already registered.');
    }

    this.isolatedShadowRoots.add(shadowRoot);
  }

  removeShadowRoot(shadowRoot: ShadowRoot): void {
    if (
      typeof ngDevMode !== 'undefined' &&
      ngDevMode &&
      !this.isolatedShadowRoots.has(shadowRoot)
    ) {
      throw new Error('Attempted to remove shadow root that was not previously added.');
    }

    this.isolatedShadowRoots.delete(shadowRoot);

    // Clean up usage maps for removed shadow root
    const inlineUsages = this.inline.get(shadowRoot);
    const externalUsages = this.external.get(shadowRoot);

    if (inlineUsages) {
      for (const {elements} of inlineUsages.values()) {
        removeElements(elements);
      }
      this.inline.delete(shadowRoot);
    }

    if (externalUsages) {
      for (const {elements} of externalUsages.values()) {
        removeElements(elements);
      }
      this.external.delete(shadowRoot);
    }
  }
}
