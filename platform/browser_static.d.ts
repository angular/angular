export { AngularEntrypoint } from 'angular2/src/core/angular_entrypoint';
export { BROWSER_PROVIDERS, ELEMENT_PROBE_BINDINGS, ELEMENT_PROBE_PROVIDERS, inspectNativeElement, BrowserDomAdapter, By, Title, enableDebugTools, disableDebugTools } from 'angular2/src/platform/browser_common';
import { Type } from 'angular2/src/facade/lang';
import { Promise } from 'angular2/src/facade/promise';
import { ComponentRef } from 'angular2/core';
/**
 * An array of providers that should be passed into `application()` when bootstrapping a component
 * when all templates
 * have been precompiled offline.
 */
export declare const BROWSER_APP_PROVIDERS: Array<any>;
/**
 * See {@link bootstrap} for more information.
 */
export declare function bootstrapStatic(appComponentType: Type, customProviders?: Array<any>, initReflector?: Function): Promise<ComponentRef>;
