/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Injectable} from '@angular/core';
/** The style elements attribute name used to set value of `APP_ID` token. */
const APP_ID_ATTRIBUTE_NAME = 'ng-app-id';
/**
 * Removes all provided elements from the document.
 * @param elements An array of HTML Elements.
 */
function removeElements(elements) {
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
function createStyleElement(style, doc) {
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
function addServerStyles(doc, appId, inline, external) {
  const elements = doc.head?.querySelectorAll(
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
export function createLinkElement(url, doc) {
  const linkElement = doc.createElement('link');
  linkElement.setAttribute('rel', 'stylesheet');
  linkElement.setAttribute('href', url);
  return linkElement;
}
let SharedStylesHost = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var SharedStylesHost = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      SharedStylesHost = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    doc;
    appId;
    nonce;
    /**
     * Provides usage information for active inline style content and associated HTML <style> elements.
     * Embedded styles typically originate from the `styles` metadata of a rendered component.
     */
    inline = new Map();
    /**
     * Provides usage information for active external style URLs and the associated HTML <link> elements.
     * External styles typically originate from the `ɵɵExternalStylesFeature` of a rendered component.
     */
    external = new Map();
    /**
     * Set of host DOM nodes that will have styles attached.
     */
    hosts = new Set();
    constructor(doc, appId, nonce, platformId = {}) {
      this.doc = doc;
      this.appId = appId;
      this.nonce = nonce;
      addServerStyles(doc, appId, this.inline, this.external);
      this.hosts.add(doc.head);
    }
    /**
     * Adds embedded styles to the DOM via HTML `style` elements.
     * @param styles An array of style content strings.
     */
    addStyles(styles, urls) {
      for (const value of styles) {
        this.addUsage(value, this.inline, createStyleElement);
      }
      urls?.forEach((value) => this.addUsage(value, this.external, createLinkElement));
    }
    /**
     * Removes embedded styles from the DOM that were added as HTML `style` elements.
     * @param styles An array of style content strings.
     */
    removeStyles(styles, urls) {
      for (const value of styles) {
        this.removeUsage(value, this.inline);
      }
      urls?.forEach((value) => this.removeUsage(value, this.external));
    }
    addUsage(value, usages, creator) {
      // Attempt to get any current usage of the value
      const record = usages.get(value);
      // If existing, just increment the usage count
      if (record) {
        if ((typeof ngDevMode === 'undefined' || ngDevMode) && record.usage === 0) {
          // A usage count of zero indicates a preexisting server generated style.
          // This attribute is solely used for debugging purposes of SSR style reuse.
          record.elements.forEach((element) => element.setAttribute('ng-style-reused', ''));
        }
        record.usage++;
      } else {
        // Otherwise, create an entry to track the elements and add element for each host
        usages.set(value, {
          usage: 1,
          elements: [...this.hosts].map((host) => this.addElement(host, creator(value, this.doc))),
        });
      }
    }
    removeUsage(value, usages) {
      // Attempt to get any current usage of the value
      const record = usages.get(value);
      // If there is a record, reduce the usage count and if no longer used,
      // remove from DOM and delete usage record.
      if (record) {
        record.usage--;
        if (record.usage <= 0) {
          removeElements(record.elements);
          usages.delete(value);
        }
      }
    }
    ngOnDestroy() {
      for (const [, {elements}] of [...this.inline, ...this.external]) {
        removeElements(elements);
      }
      this.hosts.clear();
    }
    /**
     * Adds a host node to the set of style hosts and adds all existing style usage to
     * the newly added host node.
     *
     * This is currently only used for Shadow DOM encapsulation mode.
     */
    addHost(hostNode) {
      this.hosts.add(hostNode);
      // Add existing styles to new host
      for (const [style, {elements}] of this.inline) {
        elements.push(this.addElement(hostNode, createStyleElement(style, this.doc)));
      }
      for (const [url, {elements}] of this.external) {
        elements.push(this.addElement(hostNode, createLinkElement(url, this.doc)));
      }
    }
    removeHost(hostNode) {
      this.hosts.delete(hostNode);
    }
    addElement(host, element) {
      // Add a nonce if present
      if (this.nonce) {
        element.setAttribute('nonce', this.nonce);
      }
      // Add application identifier when on the server to support client-side reuse
      if (typeof ngServerMode !== 'undefined' && ngServerMode) {
        element.setAttribute(APP_ID_ATTRIBUTE_NAME, this.appId);
      }
      // Insert the element into the DOM with the host node as parent
      return host.appendChild(element);
    }
  };
  return (SharedStylesHost = _classThis);
})();
export {SharedStylesHost};
//# sourceMappingURL=shared_styles_host.js.map
