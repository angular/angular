/**
 * @module
 * @description
 * Starting point to import all public core APIs.
 */
export * from './src/metadata';
export * from './src/util';
export * from './src/prod_mode';
export * from './src/di';
export * from './src/facade/facade';
export {enableProdMode} from './src/facade/lang';
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

export * from './private_export';
