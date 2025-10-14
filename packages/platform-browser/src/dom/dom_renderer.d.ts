/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { InjectionToken, NgZone, OnDestroy, Renderer2, RendererFactory2, RendererType2, ɵTracingService as TracingService, ɵTracingSnapshot as TracingSnapshot } from '@angular/core';
import { EventManager } from './events/event_manager';
import { SharedStylesHost } from './shared_styles_host';
export declare const NAMESPACE_URIS: {
    [ns: string]: string;
};
export declare const COMPONENT_VARIABLE = "%COMP%";
export declare const HOST_ATTR = "_nghost-%COMP%";
export declare const CONTENT_ATTR = "_ngcontent-%COMP%";
/**
 * A DI token that indicates whether styles
 * of destroyed components should be removed from DOM.
 *
 * By default, the value is set to `true`.
 * @publicApi
 */
export declare const REMOVE_STYLES_ON_COMPONENT_DESTROY: InjectionToken<boolean>;
export declare function shimContentAttribute(componentShortId: string): string;
export declare function shimHostAttribute(componentShortId: string): string;
export declare function shimStylesContent(compId: string, styles: string[]): string[];
/**
 * Prepends a baseHref to the `sourceMappingURL` within the provided CSS content.
 * If the `sourceMappingURL` contains an inline (encoded) map, the function skips processing.
 *
 * @note For inline stylesheets, the `sourceMappingURL` is relative to the page's origin
 * and not the provided baseHref. This function is needed as when accessing the page with a URL
 * containing two or more segments.
 * For example, if the baseHref is set to `/`, and you visit a URL like `http://localhost/foo/bar`,
 * the map would be requested from `http://localhost/foo/bar/comp.css.map` instead of what you'd expect,
 * which is `http://localhost/comp.css.map`. This behavior is corrected by modifying the `sourceMappingURL`
 * to ensure external source maps are loaded relative to the baseHref.
 *

 * @param baseHref - The base URL to prepend to the `sourceMappingURL`.
 * @param styles - An array of CSS content strings, each potentially containing a `sourceMappingURL`.
 * @returns The updated array of CSS content strings with modified `sourceMappingURL` values,
 * or the original content if no modification is needed.
 */
export declare function addBaseHrefToCssSourceMap(baseHref: string, styles: string[]): string[];
export declare class DomRendererFactory2 implements RendererFactory2, OnDestroy {
    private readonly eventManager;
    private readonly sharedStylesHost;
    private readonly appId;
    private removeStylesOnCompDestroy;
    private readonly doc;
    readonly platformId: Object;
    readonly ngZone: NgZone;
    private readonly nonce;
    private readonly tracingService;
    private readonly rendererByCompId;
    private readonly defaultRenderer;
    private readonly platformIsServer;
    constructor(eventManager: EventManager, sharedStylesHost: SharedStylesHost, appId: string, removeStylesOnCompDestroy: boolean, doc: Document, platformId: Object, ngZone: NgZone, nonce?: string | null, tracingService?: TracingService<TracingSnapshot> | null);
    createRenderer(element: any, type: RendererType2 | null): Renderer2;
    private getOrCreateRenderer;
    ngOnDestroy(): void;
    /**
     * Used during HMR to clear any cached data about a component.
     * @param componentId ID of the component that is being replaced.
     */
    protected componentReplaced(componentId: string): void;
}
