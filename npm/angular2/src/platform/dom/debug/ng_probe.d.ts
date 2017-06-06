import { DebugNode } from 'angular2/src/core/debug/debug_node';
/**
 * Returns a {@link DebugElement} for the given native DOM element, or
 * null if the given native element does not have an Angular view associated
 * with it.
 */
export declare function inspectNativeElement(element: any): DebugNode;
/**
 * Providers which support debugging Angular applications (e.g. via `ng.probe`).
 */
export declare const ELEMENT_PROBE_PROVIDERS: any[];
export declare const ELEMENT_PROBE_PROVIDERS_PROD_MODE: any[];
