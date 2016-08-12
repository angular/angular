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
export * from './src/metadata';
export * from './src/util';
export * from './src/di';
export {createPlatform, assertPlatform, destroyPlatform, getPlatform, PlatformRef, ApplicationRef, enableProdMode, isDevMode, createPlatformFactory} from './src/application_ref';
export {APP_ID, PACKAGE_ROOT_URL, PLATFORM_INITIALIZER, APP_BOOTSTRAP_LISTENER} from './src/application_tokens';
export {APP_INITIALIZER, ApplicationInitStatus} from './src/application_init';
export * from './src/zone';
export * from './src/render';
export * from './src/linker';
export {DebugElement, DebugNode, asNativeElements, getDebugNode} from './src/debug/debug_node';
export * from './src/testability/testability';
export * from './src/change_detection';
export * from './src/platform_directives_and_pipes';
export * from './src/platform_core_providers';
export {TRANSLATIONS, TRANSLATIONS_FORMAT, LOCALE_ID} from './src/i18n/tokens';
export {APPLICATION_COMMON_PROVIDERS, ApplicationModule} from './src/application_module';
export {wtfCreateScope, wtfLeave, wtfStartTimeRange, wtfEndTimeRange, WtfScopeFn} from './src/profile/profile';

export {Type} from './src/type';
export {EventEmitter} from './src/facade/async';
export {ExceptionHandler, WrappedException, BaseException} from './src/facade/exceptions';
export * from './private_export';

export * from './src/animation/metadata';
export {AnimationPlayer} from './src/animation/animation_player';

export {SanitizationService, SecurityContext} from './src/security';
