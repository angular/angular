/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { StaticProvider } from '../di';
import { InjectionToken } from '../di/injection_token';
/**
 * A DI token representing a string ID, used
 * primarily for prefixing application attributes and CSS styles when
 * {@link ViewEncapsulation#Emulated} is being used.
 *
 * The token is needed in cases when multiple applications are bootstrapped on a page
 * (for example, using `bootstrapApplication` calls). In this case, ensure that those applications
 * have different `APP_ID` value setup. For example:
 *
 * ```ts
 * bootstrapApplication(ComponentA, {
 *   providers: [
 *     { provide: APP_ID, useValue: 'app-a' },
 *     // ... other providers ...
 *   ]
 * });
 *
 * bootstrapApplication(ComponentB, {
 *   providers: [
 *     { provide: APP_ID, useValue: 'app-b' },
 *     // ... other providers ...
 *   ]
 * });
 * ```
 *
 * By default, when there is only one application bootstrapped, you don't need to provide the
 * `APP_ID` token (the `ng` will be used as an app ID).
 *
 * @publicApi
 */
export declare const APP_ID: InjectionToken<string>;
/** Initializer check for the validity of the APP_ID */
export declare const validAppIdInitializer: StaticProvider;
/**
 * A function that is executed when a platform is initialized.
 *
 * @deprecated from v19.0.0, use providePlatformInitializer instead
 *
 * @see {@link providePlatformInitializer}
 *
 * @publicApi
 */
export declare const PLATFORM_INITIALIZER: InjectionToken<readonly (() => void)[]>;
/**
 * A token that indicates an opaque platform ID.
 * @publicApi
 */
export declare const PLATFORM_ID: InjectionToken<Object>;
/**
 * A [DI token](api/core/InjectionToken) that indicates which animations
 * module has been loaded.
 * @publicApi
 */
export declare const ANIMATION_MODULE_TYPE: InjectionToken<"NoopAnimations" | "BrowserAnimations">;
/**
 * Token used to configure the [Content Security Policy](https://web.dev/strict-csp/) nonce that
 * Angular will apply when inserting inline styles. If not provided, Angular will look up its value
 * from the `ngCspNonce` attribute of the application root node.
 *
 * @publicApi
 */
export declare const CSP_NONCE: InjectionToken<string | null>;
/**
 * A configuration object for the image-related options. Contains:
 * - breakpoints: An array of integer breakpoints used to generate
 *      srcsets for responsive images.
 * - disableImageSizeWarning: A boolean value. Setting this to true will
 *      disable console warnings about oversized images.
 * - disableImageLazyLoadWarning: A boolean value. Setting this to true will
 *      disable console warnings about LCP images configured with `loading="lazy"`.
 * Learn more about the responsive image configuration in [the NgOptimizedImage
 * guide](guide/image-optimization).
 * Learn more about image warning options in [the related error page](errors/NG0913).
 * @publicApi
 */
export type ImageConfig = {
    breakpoints?: number[];
    placeholderResolution?: number;
    disableImageSizeWarning?: boolean;
    disableImageLazyLoadWarning?: boolean;
};
export declare const IMAGE_CONFIG_DEFAULTS: ImageConfig;
/**
 * Injection token that configures the image optimized image functionality.
 * See {@link ImageConfig} for additional information about parameters that
 * can be used.
 *
 * @see {@link NgOptimizedImage}
 * @see {@link ImageConfig}
 * @publicApi
 */
export declare const IMAGE_CONFIG: InjectionToken<ImageConfig>;
