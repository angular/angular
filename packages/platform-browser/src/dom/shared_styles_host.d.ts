/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { OnDestroy } from '@angular/core';
/**
 * A record of usage for a specific style including all elements added to the DOM
 * that contain a given style.
 */
interface UsageRecord<T> {
    elements: T[];
    usage: number;
}
/**
 * Creates a `link` element for the provided external style URL.
 * @param url A string of the URL for the stylesheet.
 * @param doc A DOM Document to use to create the element.
 * @returns An HTMLLinkElement instance.
 */
export declare function createLinkElement(url: string, doc: Document): HTMLLinkElement;
export declare class SharedStylesHost implements OnDestroy {
    private readonly doc;
    private readonly appId;
    private readonly nonce?;
    /**
     * Provides usage information for active inline style content and associated HTML <style> elements.
     * Embedded styles typically originate from the `styles` metadata of a rendered component.
     */
    private readonly inline;
    /**
     * Provides usage information for active external style URLs and the associated HTML <link> elements.
     * External styles typically originate from the `ɵɵExternalStylesFeature` of a rendered component.
     */
    private readonly external;
    /**
     * Set of host DOM nodes that will have styles attached.
     */
    private readonly hosts;
    constructor(doc: Document, appId: string, nonce?: string | null | undefined, platformId?: object);
    /**
     * Adds embedded styles to the DOM via HTML `style` elements.
     * @param styles An array of style content strings.
     */
    addStyles(styles: string[], urls?: string[]): void;
    /**
     * Removes embedded styles from the DOM that were added as HTML `style` elements.
     * @param styles An array of style content strings.
     */
    removeStyles(styles: string[], urls?: string[]): void;
    protected addUsage<T extends HTMLElement>(value: string, usages: Map<string, UsageRecord<T>>, creator: (value: string, doc: Document) => T): void;
    protected removeUsage<T extends HTMLElement>(value: string, usages: Map<string, UsageRecord<T>>): void;
    ngOnDestroy(): void;
    /**
     * Adds a host node to the set of style hosts and adds all existing style usage to
     * the newly added host node.
     *
     * This is currently only used for Shadow DOM encapsulation mode.
     */
    addHost(hostNode: Node): void;
    removeHost(hostNode: Node): void;
    private addElement;
}
export {};
