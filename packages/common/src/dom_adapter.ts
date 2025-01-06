/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

let _DOM: DomAdapter = null!;

export function getDOM(): DomAdapter {
  return _DOM;
}

export function setRootDomAdapter(adapter: DomAdapter) {
  _DOM ??= adapter;
}

/**
 * Provides DOM operations in an environment-agnostic way.
 *
 * @security Tread carefully! Interacting with the DOM directly is dangerous and
 * can introduce XSS risks.
 */
export abstract class DomAdapter {
  // Needs Domino-friendly test utility
  abstract dispatchEvent(el: any, evt: any): any;
  abstract readonly supportsDOMEvents: boolean;

  // Used by Meta
  abstract remove(el: any): void;
  abstract createElement(tagName: any, doc?: any): HTMLElement;
  abstract createHtmlDocument(): Document;
  abstract getDefaultDocument(): Document;

  // Used by By.css
  abstract isElementNode(node: any): boolean;

  // Used by Testability
  abstract isShadowRoot(node: any): boolean;

  // Used by KeyEventsPlugin
  abstract onAndCancel(el: any, evt: any, listener: any, options?: any): Function;

  // Used by PlatformLocation and ServerEventManagerPlugin
  abstract getGlobalEventTarget(doc: Document, target: string): any;

  // Used by PlatformLocation
  abstract getBaseHref(doc: Document): string | null;
  abstract resetBaseElement(): void;

  // TODO: remove dependency in DefaultValueAccessor
  abstract getUserAgent(): string;

  // Used in the legacy @angular/http package which has some usage in g3.
  abstract getCookie(name: string): string | null;
}
