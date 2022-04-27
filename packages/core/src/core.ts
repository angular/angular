/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @module
 * @description
 * Entry point from which you should import all public core APIs.
 */
export * from './metadata.js';
export * from './version.js';
export {TypeDecorator} from './util/decorators.js';
export * from './di/index.js';
export {createPlatform, assertPlatform, destroyPlatform, getPlatform, PlatformRef, ApplicationRef, createPlatformFactory, NgProbeToken} from './application_ref.js';
export {enableProdMode, isDevMode} from './util/is_dev_mode.js';
export {APP_ID, PACKAGE_ROOT_URL, PLATFORM_INITIALIZER, PLATFORM_ID, APP_BOOTSTRAP_LISTENER, ANIMATION_MODULE_TYPE} from './application_tokens.js';
export {APP_INITIALIZER, ApplicationInitStatus} from './application_init.js';
export * from './zone.js';
export * from './render.js';
export * from './linker.js';
export * from './linker/ng_module_factory_loader_impl.js';
export {DebugElement, DebugEventListener, DebugNode, asNativeElements, getDebugNode, Predicate} from './debug/debug_node.js';
export {GetTestability, Testability, TestabilityRegistry, setTestabilityGetter} from './testability/testability.js';
export * from './change_detection.js';
export * from './platform_core_providers.js';
export {TRANSLATIONS, TRANSLATIONS_FORMAT, LOCALE_ID, DEFAULT_CURRENCY_CODE, MissingTranslationStrategy} from './i18n/tokens.js';
export {ApplicationModule} from './application_module.js';
export {AbstractType, Type} from './interface/type.js';
export {EventEmitter} from './event_emitter.js';
export {ErrorHandler} from './error_handler.js';
export * from './core_private_export.js';
export * from './core_render3_private_export.js';
export {SecurityContext} from './sanitization/security.js';
export {Sanitizer} from './sanitization/sanitizer.js';
export {createNgModuleRef, createEnvironmentInjector} from './render3/ng_module_ref.js';

import {global} from './util/global.js';
if (typeof ngDevMode !== 'undefined' && ngDevMode) {
  // This helper is to give a reasonable error message to people upgrading to v9 that have not yet
  // installed `@angular/localize` in their app.
  // tslint:disable-next-line: no-toplevel-property-access
  global.$localize = global.$localize || function() {
    throw new Error(
        'It looks like your application or one of its dependencies is using i18n.\n' +
        'Angular 9 introduced a global `$localize()` function that needs to be loaded.\n' +
        'Please run `ng add @angular/localize` from the Angular CLI.\n' +
        '(For non-CLI projects, add `import \'@angular/localize/init\';` to your `polyfills.ts` file.\n' +
        'For server-side rendering applications add the import to your `main.server.ts` file.)');
  };
}
