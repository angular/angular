import * as constants from './src/change_detection/constants';
import * as reflective_provider from './src/di/reflective_provider';
import * as lifecycle_hooks from './src/metadata/lifecycle_hooks';
import * as reflector_reader from './src/reflection/reflector_reader';
import * as component_resolver from './src/linker/component_resolver';
import * as element from './src/linker/element';
import * as view from './src/linker/view';
import * as view_type from './src/linker/view_type';
import * as view_utils from './src/linker/view_utils';
import * as metadata_view from './src/metadata/view';
import * as debug_context from './src/linker/debug_context';
import * as change_detection_util from './src/change_detection/change_detection_util';
import * as api from './src/render/api';
import * as template_ref from './src/linker/template_ref';
import * as wtf_init from './src/profile/wtf_init';
import * as reflection_capabilities from './src/reflection/reflection_capabilities';
import * as decorators from './src/util/decorators';
import * as debug from './src/debug/debug_renderer';
import * as provider_util from './src/di/provider_util';
import {Provider} from './src/di/provider';

export declare namespace __core_private_types__ {
  export var isDefaultChangeDetectionStrategy: typeof constants.isDefaultChangeDetectionStrategy;
  export type ChangeDetectorState = constants.ChangeDetectorState;
  export var ChangeDetectorState: typeof  constants.ChangeDetectorState;
  export var CHANGE_DETECTION_STRATEGY_VALUES: typeof constants.CHANGE_DETECTION_STRATEGY_VALUES;
  export var constructDependencies: typeof reflective_provider.constructDependencies;
  export type LifecycleHooks = lifecycle_hooks.LifecycleHooks;
  export var LifecycleHooks: typeof lifecycle_hooks.LifecycleHooks;
  export var LIFECYCLE_HOOKS_VALUES: typeof lifecycle_hooks.LIFECYCLE_HOOKS_VALUES;
  export type ReflectorReader = reflector_reader.ReflectorReader;
  export var ReflectorReader: typeof reflector_reader.ReflectorReader;
  export var ReflectorComponentResolver: typeof component_resolver.ReflectorComponentResolver;
  export type AppElement = element.AppElement;
  export var AppElement: typeof element.AppElement;
  export var AppView: typeof view.AppView;
  export type ViewType = view_type.ViewType;
  export var ViewType: typeof view_type.ViewType;
  export var MAX_INTERPOLATION_VALUES: typeof view_utils.MAX_INTERPOLATION_VALUES;
  export var checkBinding: typeof view_utils.checkBinding;
  export var flattenNestedViewRenderNodes: typeof view_utils.flattenNestedViewRenderNodes;
  export var interpolate: typeof view_utils.interpolate;
  export var ViewUtils: typeof view_utils.ViewUtils;
  export var VIEW_ENCAPSULATION_VALUES: typeof metadata_view.VIEW_ENCAPSULATION_VALUES;
  export var DebugContext: typeof debug_context.DebugContext;
  export var StaticNodeDebugInfo: typeof debug_context.StaticNodeDebugInfo;
  export var devModeEqual: typeof change_detection_util.devModeEqual;
  export var uninitialized: typeof change_detection_util.uninitialized;
  export var ValueUnwrapper: typeof change_detection_util.ValueUnwrapper;
  export type RenderDebugInfo = api.RenderDebugInfo;
  export var RenderDebugInfo: typeof api.RenderDebugInfo;
  export type TemplateRef_ = template_ref.TemplateRef_;
  export var TemplateRef_: typeof template_ref.TemplateRef_;
  export var wtfInit: typeof wtf_init.wtfInit;
  export type ReflectionCapabilities = reflection_capabilities.ReflectionCapabilities;
  export var ReflectionCapabilities: typeof reflection_capabilities.ReflectionCapabilities;
  export var makeDecorator: typeof decorators.makeDecorator;
  export type DebugDomRootRenderer = debug.DebugDomRootRenderer;
  export var DebugDomRootRenderer: typeof debug.DebugDomRootRenderer;
  export var createProvider: typeof provider_util.createProvider;
  export var isProviderLiteral: typeof provider_util.isProviderLiteral;
}

export var __core_private__ = {
    isDefaultChangeDetectionStrategy: constants.isDefaultChangeDetectionStrategy,
    ChangeDetectorState: constants.ChangeDetectorState,
    CHANGE_DETECTION_STRATEGY_VALUES: constants.CHANGE_DETECTION_STRATEGY_VALUES,
    constructDependencies: reflective_provider.constructDependencies,
    LifecycleHooks: lifecycle_hooks.LifecycleHooks,
    LIFECYCLE_HOOKS_VALUES: lifecycle_hooks.LIFECYCLE_HOOKS_VALUES,
    ReflectorReader: reflector_reader.ReflectorReader,
    ReflectorComponentResolver: component_resolver.ReflectorComponentResolver,
    AppElement: element.AppElement,
    AppView: view.AppView,
    ViewType: view_type.ViewType,
    MAX_INTERPOLATION_VALUES: view_utils.MAX_INTERPOLATION_VALUES,
    checkBinding: view_utils.checkBinding,
    flattenNestedViewRenderNodes: view_utils.flattenNestedViewRenderNodes,
    interpolate: view_utils.interpolate,
    ViewUtils: view_utils.ViewUtils,
    VIEW_ENCAPSULATION_VALUES: metadata_view.VIEW_ENCAPSULATION_VALUES,
    DebugContext: debug_context.DebugContext,
    StaticNodeDebugInfo: debug_context.StaticNodeDebugInfo,
    devModeEqual: change_detection_util.devModeEqual,
    uninitialized: change_detection_util.uninitialized,
    ValueUnwrapper: change_detection_util.ValueUnwrapper,
    RenderDebugInfo: api.RenderDebugInfo,
    TemplateRef_: template_ref.TemplateRef_,
    wtfInit: wtf_init.wtfInit,
    ReflectionCapabilities: reflection_capabilities.ReflectionCapabilities,
    makeDecorator: decorators.makeDecorator,
    DebugDomRootRenderer: debug.DebugDomRootRenderer,
    createProvider: provider_util.createProvider,
    isProviderLiteral: provider_util.isProviderLiteral
};
