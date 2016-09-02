/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
export * from './util';
export * from './di';
export {createPlatform, assertPlatform, destroyPlatform, getPlatform, PlatformRef, ApplicationRef, enableProdMode, isDevMode, createPlatformFactory} from './application_ref';
export {APP_ID, PACKAGE_ROOT_URL, PLATFORM_INITIALIZER, APP_BOOTSTRAP_LISTENER} from './application_tokens';
export {APP_INITIALIZER, ApplicationInitStatus} from './application_init';
export * from './zone';
export * from './render';
export * from './linker';
export {DebugElement, DebugNode, asNativeElements, getDebugNode} from './debug/debug_node';
export {GetTestability, Testability, TestabilityRegistry, setTestabilityGetter} from './testability/testability';
export * from './change_detection';
export * from './platform_core_providers';
export {TRANSLATIONS, TRANSLATIONS_FORMAT, LOCALE_ID} from './i18n/tokens';
export {ApplicationModule} from './application_module';
export {wtfCreateScope, wtfLeave, wtfStartTimeRange, wtfEndTimeRange, WtfScopeFn} from './profile/profile';
export {Type} from './type';
export {EventEmitter} from './facade/async';
export {ErrorHandler} from './error_handler';
export * from './core_private_export';
export * from './animation/metadata';
export {AnimationTransitionEvent} from './animation/animation_transition_event';
export {AnimationPlayer} from './animation/animation_player';
export {Sanitizer, SecurityContext} from './security';
