import { OpaqueToken } from 'angular2/src/core/di';
export { DOCUMENT } from 'angular2/src/platform/dom/dom_tokens';
export { Title } from 'angular2/src/platform/browser/title';
export { ELEMENT_PROBE_PROVIDERS, ELEMENT_PROBE_PROVIDERS_PROD_MODE, inspectNativeElement, By } from 'angular2/platform/common_dom';
export { BrowserDomAdapter } from './browser/browser_adapter';
export { enableDebugTools, disableDebugTools } from 'angular2/src/platform/browser/tools/tools';
export { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from './dom/events/hammer_gestures';
export declare const BROWSER_PLATFORM_MARKER: OpaqueToken;
/**
 * A set of providers to initialize the Angular platform in a web browser.
 *
 * Used automatically by `bootstrap`, or can be passed to {@link platform}.
 */
export declare const BROWSER_PROVIDERS: Array<any>;
/**
 * A set of providers to initialize an Angular application in a web browser.
 *
 * Used automatically by `bootstrap`, or can be passed to {@link PlatformRef.application}.
 */
export declare const BROWSER_APP_COMMON_PROVIDERS: Array<any>;
export declare const CACHED_TEMPLATE_PROVIDER: Array<any>;
export declare function initDomAdapter(): void;
