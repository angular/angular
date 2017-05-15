/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {ALLOW_MULTIPLE_PLATFORMS as ɵALLOW_MULTIPLE_PLATFORMS} from './application_ref';
export {APP_ID_RANDOM_PROVIDER as ɵAPP_ID_RANDOM_PROVIDER} from './application_tokens';
export {ValueUnwrapper as ɵValueUnwrapper, devModeEqual as ɵdevModeEqual} from './change_detection/change_detection_util';
export {isListLikeIterable as ɵisListLikeIterable} from './change_detection/change_detection_util';
export {ChangeDetectorStatus as ɵChangeDetectorStatus, isDefaultChangeDetectionStrategy as ɵisDefaultChangeDetectionStrategy} from './change_detection/constants';
export {Console as ɵConsole} from './console';
export {ERROR_COMPONENT_TYPE as ɵERROR_COMPONENT_TYPE} from './errors';
export {ComponentFactory as ɵComponentFactory} from './linker/component_factory';
export {CodegenComponentFactoryResolver as ɵCodegenComponentFactoryResolver} from './linker/component_factory_resolver';
export {LIFECYCLE_HOOKS_VALUES as ɵLIFECYCLE_HOOKS_VALUES, LifecycleHooks as ɵLifecycleHooks} from './metadata/lifecycle_hooks';
export {ViewMetadata as ɵViewMetadata} from './metadata/view';
export {Reflector as ɵReflector, reflector as ɵreflector} from './reflection/reflection';
// We need to import this name separately from the above wildcard, because this symbol is exposed.
export {ReflectionCapabilities as ɵReflectionCapabilities} from './reflection/reflection_capabilities';
export {ReflectorReader as ɵReflectorReader} from './reflection/reflector_reader';
export {GetterFn as ɵGetterFn, MethodFn as ɵMethodFn, SetterFn as ɵSetterFn} from './reflection/types';
export {DirectRenderer as ɵDirectRenderer, RenderDebugInfo as ɵRenderDebugInfo} from './render/api';
export {global as ɵglobal, looseIdentical as ɵlooseIdentical, stringify as ɵstringify} from './util';
export {makeDecorator as ɵmakeDecorator} from './util/decorators';
export {isObservable as ɵisObservable, isPromise as ɵisPromise} from './util/lang';
export {clearProviderOverrides as ɵclearProviderOverrides, overrideProvider as ɵoverrideProvider} from './view/index';
export {NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR as ɵNOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR} from './view/provider';
