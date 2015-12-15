import { AppViewListener } from 'angular2/src/core/linker/view_listener';
import { AppView } from 'angular2/src/core/linker/view';
import { Renderer } from 'angular2/src/core/render/api';
import { DebugElement } from 'angular2/src/core/debug/debug_element';
/**
 * Returns a {@link DebugElement} for the given native DOM element, or
 * null if the given native element does not have an Angular view associated
 * with it.
 */
export declare function inspectNativeElement(element: any): DebugElement;
export declare class DebugElementViewListener implements AppViewListener {
    private _renderer;
    constructor(_renderer: Renderer);
    onViewCreated(view: AppView): void;
    onViewDestroyed(view: AppView): void;
}
/**
 * Providers which support debugging Angular applications (e.g. via `ng.probe`).
 *
 * ## Example
 *
 * {@example platform/dom/debug/ts/debug_element_view_listener/providers.ts region='providers'}
 */
export declare const ELEMENT_PROBE_PROVIDERS: any[];
/**
 * Use {@link ELEMENT_PROBE_PROVIDERS}.
 *
 * @deprecated
 */
export declare const ELEMENT_PROBE_BINDINGS: any[];
