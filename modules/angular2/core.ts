/**
 * @module
 * @description
 * Starting point to import all public core APIs.
 */
export * from './src/core/metadata';
export * from './src/core/util';
export * from './src/core/di';
export * from './src/core/pipes';
export * from './src/core/facade';
export * from './src/core/application';
export * from './src/core/services';
export * from './src/core/compiler';
export * from './src/core/lifecycle';
export * from './src/core/zone';
export * from './src/core/render';
export * from './src/core/directives';
export * from './src/core/forms';
export * from './src/core/debug';
export * from './src/core/change_detection';
export {Reflector, ReflectionInfo} from './src/core/reflection/reflection';
export {
  PlatformReflectionCapabilities
} from './src/core/reflection/platform_reflection_capabilities';
export {SetterFn, GetterFn, MethodFn} from './src/core/reflection/types';
