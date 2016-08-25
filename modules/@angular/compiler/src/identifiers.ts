/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ANALYZE_FOR_ENTRY_COMPONENTS, ChangeDetectionStrategy, ChangeDetectorRef, ComponentFactory, ComponentFactoryResolver, ElementRef, Injector, LOCALE_ID as LOCALE_ID_, NgModuleFactory, QueryList, RenderComponentType, Renderer, SecurityContext, SimpleChange, TRANSLATIONS_FORMAT as TRANSLATIONS_FORMAT_, TemplateRef, ViewContainerRef, ViewEncapsulation} from '@angular/core';

import {AnimationGroupPlayer as AnimationGroupPlayer_, AnimationKeyframe as AnimationKeyframe_, AnimationOutput as AnimationOutput_, AnimationSequencePlayer as AnimationSequencePlayer_, AnimationStyles as AnimationStyles_, AppElement, AppView, ChangeDetectorStatus, CodegenComponentFactoryResolver, DebugAppView, DebugContext, EMPTY_ARRAY, EMPTY_MAP, NgModuleInjector, NoOpAnimationPlayer as NoOpAnimationPlayer_, StaticNodeDebugInfo, TemplateRef_, UNINITIALIZED, ValueUnwrapper, ViewType, ViewUtils, balanceAnimationKeyframes as impBalanceAnimationKeyframes, castByValue, checkBinding, clearStyles as impClearStyles, collectAndResolveStyles as impCollectAndResolveStyles, devModeEqual, flattenNestedViewRenderNodes, interpolate, prepareFinalAnimationStyles as impBalanceAnimationStyles, pureProxy1, pureProxy10, pureProxy2, pureProxy3, pureProxy4, pureProxy5, pureProxy6, pureProxy7, pureProxy8, pureProxy9, reflector, renderStyles as impRenderStyles} from '../core_private';

import {CompileIdentifierMetadata, CompileTokenMetadata} from './compile_metadata';
import {assetUrl} from './util';

var APP_VIEW_MODULE_URL = assetUrl('core', 'linker/view');
var VIEW_UTILS_MODULE_URL = assetUrl('core', 'linker/view_utils');
var CD_MODULE_URL = assetUrl('core', 'change_detection/change_detection');

// Reassign the imports to different variables so we can
// define static variables with the name of the import.
// (only needed for Dart).
var impViewUtils = ViewUtils;
var impAppView = AppView;
var impDebugAppView = DebugAppView;
var impDebugContext = DebugContext;
var impAppElement = AppElement;
var impElementRef = ElementRef;
var impViewContainerRef = ViewContainerRef;
var impChangeDetectorRef = ChangeDetectorRef;
var impRenderComponentType = RenderComponentType;
var impQueryList = QueryList;
var impTemplateRef = TemplateRef;
var impTemplateRef_ = TemplateRef_;
var impValueUnwrapper = ValueUnwrapper;
var impInjector = Injector;
var impViewEncapsulation = ViewEncapsulation;
var impViewType = ViewType;
var impChangeDetectionStrategy = ChangeDetectionStrategy;
var impStaticNodeDebugInfo = StaticNodeDebugInfo;
var impRenderer = Renderer;
var impSimpleChange = SimpleChange;
var impUNINITIALIZED = UNINITIALIZED;
var impChangeDetectorStatus = ChangeDetectorStatus;
var impFlattenNestedViewRenderNodes = flattenNestedViewRenderNodes;
var impDevModeEqual = devModeEqual;
var impInterpolate = interpolate;
var impCheckBinding = checkBinding;
var impCastByValue = castByValue;
var impEMPTY_ARRAY = EMPTY_ARRAY;
var impEMPTY_MAP = EMPTY_MAP;
var impAnimationGroupPlayer = AnimationGroupPlayer_;
var impAnimationSequencePlayer = AnimationSequencePlayer_;
var impAnimationKeyframe = AnimationKeyframe_;
var impAnimationStyles = AnimationStyles_;
var impNoOpAnimationPlayer = NoOpAnimationPlayer_;
var impAnimationOutput = AnimationOutput_;

var ANIMATION_STYLE_UTIL_ASSET_URL = assetUrl('core', 'animation/animation_style_util');

export interface IdentifierSpec {
  name: string;
  moduleUrl: string;
  runtime: any;
}

export class Identifiers {
  static ANALYZE_FOR_ENTRY_COMPONENTS: IdentifierSpec = {
    name: 'ANALYZE_FOR_ENTRY_COMPONENTS',
    moduleUrl: assetUrl('core', 'metadata/di'),
    runtime: ANALYZE_FOR_ENTRY_COMPONENTS
  };
  static ViewUtils: IdentifierSpec = {
    name: 'ViewUtils',
    moduleUrl: assetUrl('core', 'linker/view_utils'),
    runtime: impViewUtils
  };
  static AppView:
      IdentifierSpec = {name: 'AppView', moduleUrl: APP_VIEW_MODULE_URL, runtime: impAppView};
  static DebugAppView: IdentifierSpec = {
    name: 'DebugAppView',
    moduleUrl: APP_VIEW_MODULE_URL,
    runtime: impDebugAppView
  };
  static AppElement: IdentifierSpec = {
    name: 'AppElement',
    moduleUrl: assetUrl('core', 'linker/element'),
    runtime: impAppElement
  };
  static ElementRef: IdentifierSpec = {
    name: 'ElementRef',
    moduleUrl: assetUrl('core', 'linker/element_ref'),
    runtime: impElementRef
  };
  static ViewContainerRef: IdentifierSpec = {
    name: 'ViewContainerRef',
    moduleUrl: assetUrl('core', 'linker/view_container_ref'),
    runtime: impViewContainerRef
  };
  static ChangeDetectorRef: IdentifierSpec = {
    name: 'ChangeDetectorRef',
    moduleUrl: assetUrl('core', 'change_detection/change_detector_ref'),
    runtime: impChangeDetectorRef
  };
  static RenderComponentType: IdentifierSpec = {
    name: 'RenderComponentType',
    moduleUrl: assetUrl('core', 'render/api'),
    runtime: impRenderComponentType
  };
  static QueryList: IdentifierSpec = {
    name: 'QueryList',
    moduleUrl: assetUrl('core', 'linker/query_list'),
    runtime: impQueryList
  };
  static TemplateRef: IdentifierSpec = {
    name: 'TemplateRef',
    moduleUrl: assetUrl('core', 'linker/template_ref'),
    runtime: impTemplateRef
  };
  static TemplateRef_: IdentifierSpec = {
    name: 'TemplateRef_',
    moduleUrl: assetUrl('core', 'linker/template_ref'),
    runtime: impTemplateRef_
  };
  static CodegenComponentFactoryResolver: IdentifierSpec = {
    name: 'CodegenComponentFactoryResolver',
    moduleUrl: assetUrl('core', 'linker/component_factory_resolver'),
    runtime: CodegenComponentFactoryResolver
  };
  static ComponentFactoryResolver: IdentifierSpec = {
    name: 'ComponentFactoryResolver',
    moduleUrl: assetUrl('core', 'linker/component_factory_resolver'),
    runtime: ComponentFactoryResolver
  };
  static ComponentFactory: IdentifierSpec = {
    name: 'ComponentFactory',
    runtime: ComponentFactory,
    moduleUrl: assetUrl('core', 'linker/component_factory')
  };
  static NgModuleFactory: IdentifierSpec = {
    name: 'NgModuleFactory',
    runtime: NgModuleFactory,
    moduleUrl: assetUrl('core', 'linker/ng_module_factory')
  };
  static NgModuleInjector: IdentifierSpec = {
    name: 'NgModuleInjector',
    runtime: NgModuleInjector,
    moduleUrl: assetUrl('core', 'linker/ng_module_factory')
  };
  static ValueUnwrapper: IdentifierSpec = {
    name: 'ValueUnwrapper',
    moduleUrl: CD_MODULE_URL,
    runtime: impValueUnwrapper
  };
  static Injector: IdentifierSpec = {
    name: 'Injector',
    moduleUrl: assetUrl('core', 'di/injector'),
    runtime: impInjector
  };
  static ViewEncapsulation: IdentifierSpec = {
    name: 'ViewEncapsulation',
    moduleUrl: assetUrl('core', 'metadata/view'),
    runtime: impViewEncapsulation
  };
  static ViewType: IdentifierSpec = {
    name: 'ViewType',
    moduleUrl: assetUrl('core', 'linker/view_type'),
    runtime: impViewType
  };
  static ChangeDetectionStrategy: IdentifierSpec = {
    name: 'ChangeDetectionStrategy',
    moduleUrl: CD_MODULE_URL,
    runtime: impChangeDetectionStrategy
  };
  static StaticNodeDebugInfo: IdentifierSpec = {
    name: 'StaticNodeDebugInfo',
    moduleUrl: assetUrl('core', 'linker/debug_context'),
    runtime: impStaticNodeDebugInfo
  };
  static DebugContext: IdentifierSpec = {
    name: 'DebugContext',
    moduleUrl: assetUrl('core', 'linker/debug_context'),
    runtime: impDebugContext
  };
  static Renderer: IdentifierSpec = {
    name: 'Renderer',
    moduleUrl: assetUrl('core', 'render/api'),
    runtime: impRenderer
  };
  static SimpleChange:
      IdentifierSpec = {name: 'SimpleChange', moduleUrl: CD_MODULE_URL, runtime: impSimpleChange};
  static UNINITIALIZED:
      IdentifierSpec = {name: 'UNINITIALIZED', moduleUrl: CD_MODULE_URL, runtime: impUNINITIALIZED};
  static ChangeDetectorStatus: IdentifierSpec = {
    name: 'ChangeDetectorStatus',
    moduleUrl: CD_MODULE_URL,
    runtime: impChangeDetectorStatus
  };
  static checkBinding: IdentifierSpec = {
    name: 'checkBinding',
    moduleUrl: VIEW_UTILS_MODULE_URL,
    runtime: impCheckBinding
  };
  static flattenNestedViewRenderNodes: IdentifierSpec = {
    name: 'flattenNestedViewRenderNodes',
    moduleUrl: VIEW_UTILS_MODULE_URL,
    runtime: impFlattenNestedViewRenderNodes
  };
  static devModeEqual:
      IdentifierSpec = {name: 'devModeEqual', moduleUrl: CD_MODULE_URL, runtime: impDevModeEqual};
  static interpolate: IdentifierSpec = {
    name: 'interpolate',
    moduleUrl: VIEW_UTILS_MODULE_URL,
    runtime: impInterpolate
  };
  static castByValue: IdentifierSpec = {
    name: 'castByValue',
    moduleUrl: VIEW_UTILS_MODULE_URL,
    runtime: impCastByValue
  };
  static EMPTY_ARRAY: IdentifierSpec = {
    name: 'EMPTY_ARRAY',
    moduleUrl: VIEW_UTILS_MODULE_URL,
    runtime: impEMPTY_ARRAY
  };
  static EMPTY_MAP:
      IdentifierSpec = {name: 'EMPTY_MAP', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: impEMPTY_MAP};

  static pureProxies = [
    null,
    {name: 'pureProxy1', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: pureProxy1},
    {name: 'pureProxy2', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: pureProxy2},
    {name: 'pureProxy3', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: pureProxy3},
    {name: 'pureProxy4', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: pureProxy4},
    {name: 'pureProxy5', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: pureProxy5},
    {name: 'pureProxy6', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: pureProxy6},
    {name: 'pureProxy7', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: pureProxy7},
    {name: 'pureProxy8', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: pureProxy8},
    {name: 'pureProxy9', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: pureProxy9},
    {name: 'pureProxy10', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: pureProxy10},
  ];
  static SecurityContext: IdentifierSpec = {
    name: 'SecurityContext',
    moduleUrl: assetUrl('core', 'security'),
    runtime: SecurityContext,
  };
  static AnimationKeyframe: IdentifierSpec = {
    name: 'AnimationKeyframe',
    moduleUrl: assetUrl('core', 'animation/animation_keyframe'),
    runtime: impAnimationKeyframe
  };
  static AnimationStyles: IdentifierSpec = {
    name: 'AnimationStyles',
    moduleUrl: assetUrl('core', 'animation/animation_styles'),
    runtime: impAnimationStyles
  };
  static NoOpAnimationPlayer: IdentifierSpec = {
    name: 'NoOpAnimationPlayer',
    moduleUrl: assetUrl('core', 'animation/animation_player'),
    runtime: impNoOpAnimationPlayer
  };
  static AnimationGroupPlayer: IdentifierSpec = {
    name: 'AnimationGroupPlayer',
    moduleUrl: assetUrl('core', 'animation/animation_group_player'),
    runtime: impAnimationGroupPlayer
  };
  static AnimationSequencePlayer: IdentifierSpec = {
    name: 'AnimationSequencePlayer',
    moduleUrl: assetUrl('core', 'animation/animation_sequence_player'),
    runtime: impAnimationSequencePlayer
  };
  static prepareFinalAnimationStyles: IdentifierSpec = {
    name: 'prepareFinalAnimationStyles',
    moduleUrl: ANIMATION_STYLE_UTIL_ASSET_URL,
    runtime: impBalanceAnimationStyles
  };
  static balanceAnimationKeyframes: IdentifierSpec = {
    name: 'balanceAnimationKeyframes',
    moduleUrl: ANIMATION_STYLE_UTIL_ASSET_URL,
    runtime: impBalanceAnimationKeyframes
  };
  static clearStyles: IdentifierSpec = {
    name: 'clearStyles',
    moduleUrl: ANIMATION_STYLE_UTIL_ASSET_URL,
    runtime: impClearStyles
  };
  static renderStyles: IdentifierSpec = {
    name: 'renderStyles',
    moduleUrl: ANIMATION_STYLE_UTIL_ASSET_URL,
    runtime: impRenderStyles
  };
  static collectAndResolveStyles: IdentifierSpec = {
    name: 'collectAndResolveStyles',
    moduleUrl: ANIMATION_STYLE_UTIL_ASSET_URL,
    runtime: impCollectAndResolveStyles
  };
  static LOCALE_ID: IdentifierSpec = {
    name: 'LOCALE_ID',
    moduleUrl: assetUrl('core', 'i18n/tokens'),
    runtime: LOCALE_ID_
  };
  static TRANSLATIONS_FORMAT: IdentifierSpec = {
    name: 'TRANSLATIONS_FORMAT',
    moduleUrl: assetUrl('core', 'i18n/tokens'),
    runtime: TRANSLATIONS_FORMAT_
  };
  static AnimationOutput: IdentifierSpec = {
    name: 'AnimationOutput',
    moduleUrl: assetUrl('core', 'animation/animation_output'),
    runtime: impAnimationOutput
  };
}

export function resolveIdentifier(identifier: IdentifierSpec) {
  return new CompileIdentifierMetadata({
    name: identifier.name,
    moduleUrl: identifier.moduleUrl,
    runtime: reflector.resolveType(identifier.name, identifier.moduleUrl) || identifier.runtime
  });
}

export function identifierToken(identifier: CompileIdentifierMetadata): CompileTokenMetadata {
  return new CompileTokenMetadata({identifier: identifier});
}

export function resolveIdentifierToken(identifier: IdentifierSpec): CompileTokenMetadata {
  return identifierToken(resolveIdentifier(identifier));
}

export function resolveEnumIdentifier(
    enumType: CompileIdentifierMetadata, name: string): CompileIdentifierMetadata {
  const resolvedEnum = reflector.resolveEnum(enumType, name);
  if (resolvedEnum) {
    return new CompileIdentifierMetadata(
        {name: enumType.name, moduleUrl: enumType.moduleUrl, runtime: resolvedEnum});
  } else {
    return new CompileIdentifierMetadata({
      name: `${enumType.name}.${name}`,
      moduleUrl: enumType.moduleUrl,
      runtime: enumType.runtime[name]
    });
  }
}