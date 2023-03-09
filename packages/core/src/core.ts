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
export * from './metadata';
export * from './version';
export {TypeDecorator} from './util/decorators';
export * from './di';
export {createPlatform, assertPlatform, destroyPlatform, getPlatform, BootstrapOptions, NgZoneOptions, PlatformRef, ApplicationRef, provideZoneChangeDetection, createPlatformFactory, NgProbeToken, APP_BOOTSTRAP_LISTENER} from './application_ref';
export {enableProdMode, isDevMode} from './util/is_dev_mode';
export {APP_ID, PACKAGE_ROOT_URL, PLATFORM_INITIALIZER, PLATFORM_ID, ANIMATION_MODULE_TYPE, CSP_NONCE} from './application_tokens';
export {APP_INITIALIZER, ApplicationInitStatus} from './application_init';
export * from './zone';
export * from './render';
export * from './linker';
export * from './linker/ng_module_factory_loader_impl';
export {DebugElement, DebugEventListener, DebugNode, asNativeElements, getDebugNode, Predicate} from './debug/debug_node';
export {GetTestability, Testability, TestabilityRegistry, setTestabilityGetter} from './testability/testability';
export * from './change_detection';
export * from './platform_core_providers';
export {TRANSLATIONS, TRANSLATIONS_FORMAT, LOCALE_ID, DEFAULT_CURRENCY_CODE, MissingTranslationStrategy} from './i18n/tokens';
export {ApplicationModule} from './application_module';
export {AbstractType, Type} from './interface/type';
export {EventEmitter} from './event_emitter';
export {ErrorHandler} from './error_handler';
export * from './core_private_export';
export * from './core_render3_private_export';
export * from './core_reactivity_export';
export {SecurityContext} from './sanitization/security';
export {Sanitizer} from './sanitization/sanitizer';
export {createNgModule, createNgModuleRef, createEnvironmentInjector} from './render3/ng_module_ref';
export {createComponent, reflectComponentType, ComponentMirror} from './render3/component';
export {isStandalone} from './render3/definition';
export {ApplicationConfig, mergeApplicationConfig} from './application_config';
export {makeStateKey, StateKey, TransferState} from './transfer_state';

import {global} from './util/global';
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
