/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export declare function getDOM(): DomAdapter;
export declare function setRootDomAdapter(adapter: DomAdapter): void;
/**
 * Provides DOM operations in an environment-agnostic way.
 *
 * @security Tread carefully! Interacting with the DOM directly is dangerous and
 * can introduce XSS risks.
 */
export declare abstract class DomAdapter {
    abstract dispatchEvent(el: any, evt: any): any;
    abstract readonly supportsDOMEvents: boolean;
    abstract remove(el: any): void;
    abstract createElement(tagName: any, doc?: any): HTMLElement;
    abstract createHtmlDocument(): Document;
    abstract getDefaultDocument(): Document;
    abstract isElementNode(node: any): boolean;
    abstract isShadowRoot(node: any): boolean;
    abstract onAndCancel(el: any, evt: any, listener: any, options?: any): Function;
    abstract getGlobalEventTarget(doc: Document, target: string): any;
    abstract getBaseHref(doc: Document): string | null;
    abstract resetBaseElement(): void;
    abstract getUserAgent(): string;
    abstract getCookie(name: string): string | null;
}
