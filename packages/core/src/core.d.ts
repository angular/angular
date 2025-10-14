/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * @module
 * @description
 * Entry point from which you should import all public core APIs.
 */
export * from './authoring';
export { input } from './authoring/input/input';
export { contentChild, contentChildren, viewChild, viewChildren } from './authoring/queries';
export { model } from './authoring/model/model';
export * from './metadata';
export * from './version';
export { TypeDecorator } from './util/decorators';
export * from './di';
export { BootstrapOptions, ApplicationRef, APP_BOOTSTRAP_LISTENER, } from './application/application_ref';
export { PlatformRef } from './platform/platform_ref';
export { createPlatform, createPlatformFactory, assertPlatform, destroyPlatform, getPlatform, providePlatformInitializer, createOrReusePlatformInjector as ɵcreateOrReusePlatformInjector, } from './platform/platform';
export { provideZoneChangeDetection, NgZoneOptions, } from './change_detection/scheduling/ng_zone_scheduling';
export { provideZonelessChangeDetection } from './change_detection/scheduling/zoneless_scheduling_impl';
export { PendingTasks } from './pending_tasks';
export { provideCheckNoChangesConfig } from './change_detection/provide_check_no_changes_config';
export { enableProdMode, isDevMode } from './util/is_dev_mode';
export { APP_ID, PLATFORM_INITIALIZER, PLATFORM_ID, ANIMATION_MODULE_TYPE, CSP_NONCE, } from './application/application_tokens';
export { APP_INITIALIZER, ApplicationInitStatus, provideAppInitializer, } from './application/application_init';
export * from './zone';
export * from './render';
export * from './linker';
export * from './linker/ng_module_factory_loader_impl';
export { DebugElement, DebugEventListener, DebugNode, asNativeElements, getDebugNode, Predicate, } from './debug/debug_node';
export { GetTestability, Testability, TestabilityRegistry, setTestabilityGetter, } from './testability/testability';
export * from './change_detection';
export * from './platform/platform_core_providers';
export { TRANSLATIONS, TRANSLATIONS_FORMAT, LOCALE_ID, DEFAULT_CURRENCY_CODE, MissingTranslationStrategy, } from './i18n/tokens';
export { ApplicationModule } from './application/application_module';
export { AbstractType, Type } from './interface/type';
export { EventEmitter } from './event_emitter';
export { ErrorHandler, provideBrowserGlobalErrorListeners } from './error_handler';
export * from './core_private_export';
export * from './core_render3_private_export';
export * from './core_reactivity_export';
export * from './resource';
export { SecurityContext } from './sanitization/security';
export { Sanitizer } from './sanitization/sanitizer';
export { createNgModule, createNgModuleRef, createEnvironmentInjector, } from './render3/ng_module_ref';
export { createComponent, reflectComponentType, ComponentMirror } from './render3/component';
export { isStandalone } from './render3/def_getters';
export { AfterRenderRef } from './render3/after_render/api';
export { publishExternalGlobalUtil as ɵpublishExternalGlobalUtil } from './render3/util/global_utils';
export { enableProfiling } from './render3/debug/chrome_dev_tools_performance';
export { AfterRenderOptions, afterEveryRender, afterNextRender, ɵFirstAvailable, } from './render3/after_render/hooks';
export { Binding, inputBinding, outputBinding, twoWayBinding } from './render3/dynamic_bindings';
export { ApplicationConfig, mergeApplicationConfig } from './application/application_config';
export { makeStateKey, StateKey, TransferState } from './transfer_state';
export { booleanAttribute, numberAttribute } from './util/coercion';
export { REQUEST, REQUEST_CONTEXT, RESPONSE_INIT } from './application/platform_tokens';
export { DOCUMENT } from './document';
export { provideNgReflectAttributes } from './ng_reflect';
export { AnimationCallbackEvent, AnimationFunction, MAX_ANIMATION_TIMEOUT, } from './animation/interfaces';
