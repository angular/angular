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
export {createPlatform, assertPlatform, disposePlatform, getPlatform, coreBootstrap, coreLoadAndBootstrap, PlatformRef, ApplicationRef, enableProdMode, lockRunMode, isDevMode} from './src/application_ref';
export {APP_ID, APP_INITIALIZER, PACKAGE_ROOT_URL, PLATFORM_INITIALIZER} from './src/application_tokens';
export * from './src/zone';
export * from './src/render';
export * from './src/linker';
export {DebugElement, DebugNode, asNativeElements, getDebugNode} from './src/debug/debug_node';
export * from './src/testability/testability';
export * from './src/change_detection';
export * from './src/platform_directives_and_pipes';
export * from './src/platform_common_providers';
export {APPLICATION_COMMON_PROVIDERS} from './src/application_common_providers';
export {wtfCreateScope, wtfLeave, wtfStartTimeRange, wtfEndTimeRange, WtfScopeFn} from './src/profile/profile';

export {Type} from './src/facade/lang';
export {EventEmitter} from './src/facade/async';
export {ExceptionHandler, WrappedException, BaseException} from './src/facade/exceptions';
export * from './private_export';

export * from './src/animation/metadata';
export {AnimationPlayer} from './src/animation/animation_player';

export {SanitizationService, SecurityContext} from './src/security';
