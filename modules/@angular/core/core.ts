/**
 * @module
 * @description
 * Starting point to import all public core APIs.
 */
export * from './src/metadata';
export * from './src/util';
export * from './src/prod_mode';
export * from './src/di';
export {
  createPlatform,
  assertPlatform,
  disposePlatform,
  getPlatform,
  coreBootstrap,
  coreLoadAndBootstrap,
  createNgZone,
  PlatformRef,
  ApplicationRef
} from './src/application_ref';
export {
  APP_ID,
  APP_INITIALIZER,
  PACKAGE_ROOT_URL,
  PLATFORM_INITIALIZER
} from './src/application_tokens';
export * from './src/zone';
export * from './src/render';
export * from './src/linker';
export {DebugElement, DebugNode, asNativeElements, getDebugNode} from './src/debug/debug_node';
export {DebugDomRootRenderer} from './src/debug/debug_renderer';
export * from './src/testability/testability';
export * from './src/change_detection';
export * from './src/platform_directives_and_pipes';
export * from './src/platform_common_providers';
export * from './src/application_common_providers';
export * from './src/reflection/reflection';
export * from './instrumentation';


// reexport a few things from facades under core
import * as facade from '@angular/facade';
export type Type = facade.Type;
export var Type: typeof facade.Type = facade.Type;
export type EventEmitter<T> = facade.EventEmitter<T>;
export var EventEmitter: typeof facade.EventEmitter = facade.EventEmitter;
export type WrappedException = facade.WrappedException;
export var WrappedException: typeof facade.WrappedException = facade.WrappedException;
export type ExceptionHandler = facade.ExceptionHandler;
export var ExceptionHandler: typeof facade.ExceptionHandler = facade.ExceptionHandler;
export var enableProdMode: typeof facade.enableProdMode = facade.enableProdMode;

export * from './private_export';
