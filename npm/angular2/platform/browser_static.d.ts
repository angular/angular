export * from 'angular2/src/core/angular_entrypoint';
export { BROWSER_PROVIDERS, ELEMENT_PROBE_PROVIDERS, ELEMENT_PROBE_PROVIDERS_PROD_MODE, inspectNativeElement, BrowserDomAdapter, By, Title, enableDebugTools, disableDebugTools } from 'angular2/src/platform/browser_common';
import { Type } from 'angular2/src/facade/lang';
import { ComponentRef, PlatformRef } from 'angular2/core';
/**
 * An array of providers that should be passed into `application()` when bootstrapping a component
 * when all templates
 * have been precompiled offline.
 */
export declare const BROWSER_APP_PROVIDERS: Array<any>;
export declare function browserStaticPlatform(): PlatformRef;
/**
 * See {@link bootstrap} for more information.
 */
export declare function bootstrapStatic(appComponentType: Type, customProviders?: Array<any>, initReflector?: Function): Promise<ComponentRef<any>>;
