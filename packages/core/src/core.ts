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
export * from './version';
export {Class, ClassDefinition, TypeDecorator} from './util/decorators';
export * from './di';
export {createPlatform, assertPlatform, destroyPlatform, getPlatform, PlatformRef, ApplicationRef, enableProdMode, isDevMode, createPlatformFactory, NgProbeToken} from './application_ref';
export {APP_ID, PACKAGE_ROOT_URL, PLATFORM_INITIALIZER, PLATFORM_ID, APP_BOOTSTRAP_LISTENER} from './application_tokens';
export {APP_INITIALIZER, ApplicationInitStatus} from './application_init';
export * from './zone';
export * from './render';
export * from './linker';
export {DebugElement, DebugNode, asNativeElements, getDebugNode, Predicate} from './debug/debug_node';
export {GetTestability, Testability, TestabilityRegistry, setTestabilityGetter} from './testability/testability';
export * from './change_detection';
export * from './platform_core_providers';
export {TRANSLATIONS, TRANSLATIONS_FORMAT, LOCALE_ID, MissingTranslationStrategy} from './i18n/tokens';
export {ApplicationModule} from './application_module';
export {wtfCreateScope, wtfLeave, wtfStartTimeRange, wtfEndTimeRange, WtfScopeFn} from './profile/profile';
export {Type} from './type';
export {EventEmitter} from './event_emitter';
export {ErrorHandler} from './error_handler';
export * from './core_private_export';
export {Sanitizer, SecurityContext} from './security';
export * from './codegen_private_exports';
export * from './animation/animation_metadata_wrapped';
import {AnimationTriggerMetadata} from './animation/animation_metadata_wrapped';


// For backwards compatibility.
/**
 * @deprecated from v4
 */
export type AnimationEntryMetadata = any;
/**
 * @deprecated from v4
 */
export type AnimationStateTransitionMetadata = any;
/**
 * @deprecated from v4
 */
export type AnimationPlayer = any;
/**
 * @deprecated from v4
 */
export type AnimationStyles = any;
/**
 * @deprecated from v4
 */
export type AnimationKeyframe = any;
