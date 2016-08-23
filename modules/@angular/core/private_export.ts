/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ANY_STATE as ANY_STATE_, DEFAULT_STATE as DEFAULT_STATE_, EMPTY_STATE as EMPTY_STATE_, FILL_STYLE_FLAG as FILL_STYLE_FLAG_} from './src/animation/animation_constants';
import {AnimationGroupPlayer as AnimationGroupPlayer_} from './src/animation/animation_group_player';
import {AnimationKeyframe as AnimationKeyframe_} from './src/animation/animation_keyframe';
import {AnimationOutput as AnimationOutput_} from './src/animation/animation_output';
import {AnimationPlayer as AnimationPlayer_, NoOpAnimationPlayer as NoOpAnimationPlayer_} from './src/animation/animation_player';
import {AnimationSequencePlayer as AnimationSequencePlayer_} from './src/animation/animation_sequence_player';
import * as animationUtils from './src/animation/animation_style_util';
import {AnimationStyles as AnimationStyles_} from './src/animation/animation_styles';
import * as change_detection_util from './src/change_detection/change_detection_util';
import * as constants from './src/change_detection/constants';
import * as console from './src/console';
import * as debug from './src/debug/debug_renderer';
import * as provider from './src/di/provider';
import * as reflective_provider from './src/di/reflective_provider';
import * as component_factory_resolver from './src/linker/component_factory_resolver';
import * as debug_context from './src/linker/debug_context';
import * as element from './src/linker/element';
import * as ng_module_factory from './src/linker/ng_module_factory';
import * as template_ref from './src/linker/template_ref';
import * as view from './src/linker/view';
import * as view_type from './src/linker/view_type';
import * as view_utils from './src/linker/view_utils';
import * as lifecycle_hooks from './src/metadata/lifecycle_hooks';
import * as metadata_view from './src/metadata/view';
import * as wtf_init from './src/profile/wtf_init';
import * as reflection from './src/reflection/reflection';
// We need to import this name separately from the above wildcard, because this symbol is exposed.
import {Reflector} from './src/reflection/reflection'; // tslint:disable-line
import * as reflection_capabilities from './src/reflection/reflection_capabilities';
import * as reflector_reader from './src/reflection/reflector_reader';
import * as api from './src/render/api';
import * as security from './src/security';
import * as decorators from './src/util/decorators';

// These generic types can't be exported within the __core_private_types__
// interface because the generic type info will be lost. So just exporting
// them separately.
export type __core_private_DebugAppView__<T> = view.DebugAppView<T>;
export type __core_private_TemplateRef__<C> = template_ref.TemplateRef_<C>;

export interface __core_private_types__ {
  isDefaultChangeDetectionStrategy: typeof constants.isDefaultChangeDetectionStrategy;
  ChangeDetectorStatus: constants.ChangeDetectorStatus;
  CHANGE_DETECTION_STRATEGY_VALUES: typeof constants.CHANGE_DETECTION_STRATEGY_VALUES;
  constructDependencies: typeof reflective_provider.constructDependencies;
  LifecycleHooks: lifecycle_hooks.LifecycleHooks;
  LIFECYCLE_HOOKS_VALUES: typeof lifecycle_hooks.LIFECYCLE_HOOKS_VALUES;
  ReflectorReader: reflector_reader.ReflectorReader;
  CodegenComponentFactoryResolver:
      typeof component_factory_resolver.CodegenComponentFactoryResolver;
  AppElement: element.AppElement;
  AppView: typeof view.AppView;
  NgModuleInjector: typeof ng_module_factory.NgModuleInjector;
  ViewType: view_type.ViewType;
  MAX_INTERPOLATION_VALUES: typeof view_utils.MAX_INTERPOLATION_VALUES;
  checkBinding: typeof view_utils.checkBinding;
  flattenNestedViewRenderNodes: typeof view_utils.flattenNestedViewRenderNodes;
  interpolate: typeof view_utils.interpolate;
  ViewUtils: typeof view_utils.ViewUtils;
  VIEW_ENCAPSULATION_VALUES: typeof metadata_view.VIEW_ENCAPSULATION_VALUES;
  ViewMetadata: metadata_view.ViewMetadata;
  DebugContext: typeof debug_context.DebugContext;
  StaticNodeDebugInfo: typeof debug_context.StaticNodeDebugInfo;
  devModeEqual: typeof change_detection_util.devModeEqual;
  UNINITIALIZED: typeof change_detection_util.UNINITIALIZED;
  ValueUnwrapper: typeof change_detection_util.ValueUnwrapper;
  RenderDebugInfo: api.RenderDebugInfo;
  wtfInit: typeof wtf_init.wtfInit;
  ReflectionCapabilities: reflection_capabilities.ReflectionCapabilities;
  makeDecorator: typeof decorators.makeDecorator;
  DebugDomRootRenderer: debug.DebugDomRootRenderer;
  EMPTY_ARRAY: typeof view_utils.EMPTY_ARRAY;
  EMPTY_MAP: typeof view_utils.EMPTY_MAP;
  pureProxy1: typeof view_utils.pureProxy1;
  pureProxy2: typeof view_utils.pureProxy2;
  pureProxy3: typeof view_utils.pureProxy3;
  pureProxy4: typeof view_utils.pureProxy4;
  pureProxy5: typeof view_utils.pureProxy5;
  pureProxy6: typeof view_utils.pureProxy6;
  pureProxy7: typeof view_utils.pureProxy7;
  pureProxy8: typeof view_utils.pureProxy8;
  pureProxy9: typeof view_utils.pureProxy9;
  pureProxy10: typeof view_utils.pureProxy10;
  castByValue: typeof view_utils.castByValue;
  Console: console.Console;
  reflector: typeof reflection.reflector;
  Reflector: reflection.Reflector;
  NoOpAnimationPlayer: NoOpAnimationPlayer_;
  AnimationPlayer: AnimationPlayer_;
  AnimationSequencePlayer: AnimationSequencePlayer_;
  AnimationGroupPlayer: AnimationGroupPlayer_;
  AnimationKeyframe: AnimationKeyframe_;
  prepareFinalAnimationStyles: typeof animationUtils.prepareFinalAnimationStyles;
  balanceAnimationKeyframes: typeof animationUtils.balanceAnimationKeyframes;
  flattenStyles: typeof animationUtils.flattenStyles;
  clearStyles: typeof animationUtils.clearStyles;
  renderStyles: typeof animationUtils.renderStyles;
  collectAndResolveStyles: typeof animationUtils.collectAndResolveStyles;
  AnimationStyles: AnimationStyles_;
  AnimationOutput: AnimationOutput_;
  ANY_STATE: typeof ANY_STATE_;
  DEFAULT_STATE: typeof DEFAULT_STATE_;
  EMPTY_STATE: typeof EMPTY_STATE_;
  FILL_STYLE_FLAG: typeof FILL_STYLE_FLAG_;
}

export var __core_private__ = {
  isDefaultChangeDetectionStrategy: constants.isDefaultChangeDetectionStrategy,
  ChangeDetectorStatus: constants.ChangeDetectorStatus,
  CHANGE_DETECTION_STRATEGY_VALUES: constants.CHANGE_DETECTION_STRATEGY_VALUES,
  constructDependencies: reflective_provider.constructDependencies,
  LifecycleHooks: lifecycle_hooks.LifecycleHooks,
  LIFECYCLE_HOOKS_VALUES: lifecycle_hooks.LIFECYCLE_HOOKS_VALUES,
  ReflectorReader: reflector_reader.ReflectorReader,
  CodegenComponentFactoryResolver: component_factory_resolver.CodegenComponentFactoryResolver,
  AppElement: element.AppElement,
  AppView: view.AppView,
  DebugAppView: view.DebugAppView,
  NgModuleInjector: ng_module_factory.NgModuleInjector,
  ViewType: view_type.ViewType,
  MAX_INTERPOLATION_VALUES: view_utils.MAX_INTERPOLATION_VALUES,
  checkBinding: view_utils.checkBinding,
  flattenNestedViewRenderNodes: view_utils.flattenNestedViewRenderNodes,
  interpolate: view_utils.interpolate,
  ViewUtils: view_utils.ViewUtils,
  VIEW_ENCAPSULATION_VALUES: metadata_view.VIEW_ENCAPSULATION_VALUES,
  ViewMetadata: metadata_view.ViewMetadata,
  DebugContext: debug_context.DebugContext,
  StaticNodeDebugInfo: debug_context.StaticNodeDebugInfo,
  devModeEqual: change_detection_util.devModeEqual,
  UNINITIALIZED: change_detection_util.UNINITIALIZED,
  ValueUnwrapper: change_detection_util.ValueUnwrapper,
  RenderDebugInfo: api.RenderDebugInfo,
  TemplateRef_: template_ref.TemplateRef_,
  wtfInit: wtf_init.wtfInit,
  ReflectionCapabilities: reflection_capabilities.ReflectionCapabilities,
  makeDecorator: decorators.makeDecorator,
  DebugDomRootRenderer: debug.DebugDomRootRenderer,
  EMPTY_ARRAY: view_utils.EMPTY_ARRAY,
  EMPTY_MAP: view_utils.EMPTY_MAP,
  pureProxy1: view_utils.pureProxy1,
  pureProxy2: view_utils.pureProxy2,
  pureProxy3: view_utils.pureProxy3,
  pureProxy4: view_utils.pureProxy4,
  pureProxy5: view_utils.pureProxy5,
  pureProxy6: view_utils.pureProxy6,
  pureProxy7: view_utils.pureProxy7,
  pureProxy8: view_utils.pureProxy8,
  pureProxy9: view_utils.pureProxy9,
  pureProxy10: view_utils.pureProxy10,
  castByValue: view_utils.castByValue,
  Console: console.Console,
  reflector: reflection.reflector,
  Reflector: reflection.Reflector,
  NoOpAnimationPlayer: NoOpAnimationPlayer_,
  AnimationPlayer: AnimationPlayer_,
  AnimationSequencePlayer: AnimationSequencePlayer_,
  AnimationGroupPlayer: AnimationGroupPlayer_,
  AnimationKeyframe: AnimationKeyframe_,
  prepareFinalAnimationStyles: animationUtils.prepareFinalAnimationStyles,
  balanceAnimationKeyframes: animationUtils.balanceAnimationKeyframes,
  flattenStyles: animationUtils.flattenStyles,
  clearStyles: animationUtils.clearStyles,
  renderStyles: animationUtils.renderStyles,
  collectAndResolveStyles: animationUtils.collectAndResolveStyles,
  AnimationStyles: AnimationStyles_,
  AnimationOutput: AnimationOutput_,
  ANY_STATE: ANY_STATE_,
  DEFAULT_STATE: DEFAULT_STATE_,
  EMPTY_STATE: EMPTY_STATE_,
  FILL_STYLE_FLAG: FILL_STYLE_FLAG_
};
