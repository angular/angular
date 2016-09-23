/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ANALYZE_FOR_ENTRY_COMPONENTS, ChangeDetectionStrategy, ChangeDetectorRef, ComponentFactory, ComponentFactoryResolver, ElementRef, Injector, LOCALE_ID as LOCALE_ID_, NgModuleFactory, QueryList, RenderComponentType, Renderer, SecurityContext, SimpleChange, TRANSLATIONS_FORMAT as TRANSLATIONS_FORMAT_, TemplateRef, ViewContainerRef, ViewEncapsulation} from '@angular/core';

import {CompileIdentifierMetadata, CompileTokenMetadata} from './compile_metadata';
import {AnimationGroupPlayer, AnimationKeyframe, AnimationSequencePlayer, AnimationStyles, AppElement, AppView, ChangeDetectorStatus, CodegenComponentFactoryResolver, DebugAppView, DebugContext, EMPTY_ARRAY, EMPTY_MAP, NgModuleInjector, NoOpAnimationPlayer, StaticNodeDebugInfo, TemplateRef_, UNINITIALIZED, ValueUnwrapper, ViewType, ViewUtils, balanceAnimationKeyframes, castByValue, checkBinding, clearStyles, collectAndResolveStyles, devModeEqual, flattenNestedViewRenderNodes, interpolate, prepareFinalAnimationStyles, pureProxy1, pureProxy10, pureProxy2, pureProxy3, pureProxy4, pureProxy5, pureProxy6, pureProxy7, pureProxy8, pureProxy9, reflector, registerModuleFactory, renderStyles} from './private_import_core';
import {assetUrl} from './util';

var APP_VIEW_MODULE_URL = assetUrl('core', 'linker/view');
var VIEW_UTILS_MODULE_URL = assetUrl('core', 'linker/view_utils');
var CD_MODULE_URL = assetUrl('core', 'change_detection/change_detection');

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
    runtime: ViewUtils
  };
  static AppView:
      IdentifierSpec = {name: 'AppView', moduleUrl: APP_VIEW_MODULE_URL, runtime: AppView};
  static DebugAppView: IdentifierSpec = {
    name: 'DebugAppView',
    moduleUrl: APP_VIEW_MODULE_URL,
    runtime: DebugAppView
  };
  static AppElement: IdentifierSpec = {
    name: 'AppElement',
    moduleUrl: assetUrl('core', 'linker/element'),
    runtime: AppElement
  };
  static ElementRef: IdentifierSpec = {
    name: 'ElementRef',
    moduleUrl: assetUrl('core', 'linker/element_ref'),
    runtime: ElementRef
  };
  static ViewContainerRef: IdentifierSpec = {
    name: 'ViewContainerRef',
    moduleUrl: assetUrl('core', 'linker/view_container_ref'),
    runtime: ViewContainerRef
  };
  static ChangeDetectorRef: IdentifierSpec = {
    name: 'ChangeDetectorRef',
    moduleUrl: assetUrl('core', 'change_detection/change_detector_ref'),
    runtime: ChangeDetectorRef
  };
  static RenderComponentType: IdentifierSpec = {
    name: 'RenderComponentType',
    moduleUrl: assetUrl('core', 'render/api'),
    runtime: RenderComponentType
  };
  static QueryList: IdentifierSpec = {
    name: 'QueryList',
    moduleUrl: assetUrl('core', 'linker/query_list'),
    runtime: QueryList
  };
  static TemplateRef: IdentifierSpec = {
    name: 'TemplateRef',
    moduleUrl: assetUrl('core', 'linker/template_ref'),
    runtime: TemplateRef
  };
  static TemplateRef_: IdentifierSpec = {
    name: 'TemplateRef_',
    moduleUrl: assetUrl('core', 'linker/template_ref'),
    runtime: TemplateRef_
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
  static RegisterModuleFactoryFn: IdentifierSpec = {
    name: 'registerModuleFactory',
    runtime: registerModuleFactory,
    moduleUrl: assetUrl('core', 'linker/ng_module_factory_loader')
  };
  static ValueUnwrapper:
      IdentifierSpec = {name: 'ValueUnwrapper', moduleUrl: CD_MODULE_URL, runtime: ValueUnwrapper};
  static Injector: IdentifierSpec = {
    name: 'Injector',
    moduleUrl: assetUrl('core', 'di/injector'),
    runtime: Injector
  };
  static ViewEncapsulation: IdentifierSpec = {
    name: 'ViewEncapsulation',
    moduleUrl: assetUrl('core', 'metadata/view'),
    runtime: ViewEncapsulation
  };
  static ViewType: IdentifierSpec = {
    name: 'ViewType',
    moduleUrl: assetUrl('core', 'linker/view_type'),
    runtime: ViewType
  };
  static ChangeDetectionStrategy: IdentifierSpec = {
    name: 'ChangeDetectionStrategy',
    moduleUrl: CD_MODULE_URL,
    runtime: ChangeDetectionStrategy
  };
  static StaticNodeDebugInfo: IdentifierSpec = {
    name: 'StaticNodeDebugInfo',
    moduleUrl: assetUrl('core', 'linker/debug_context'),
    runtime: StaticNodeDebugInfo
  };
  static DebugContext: IdentifierSpec = {
    name: 'DebugContext',
    moduleUrl: assetUrl('core', 'linker/debug_context'),
    runtime: DebugContext
  };
  static Renderer: IdentifierSpec = {
    name: 'Renderer',
    moduleUrl: assetUrl('core', 'render/api'),
    runtime: Renderer
  };
  static SimpleChange:
      IdentifierSpec = {name: 'SimpleChange', moduleUrl: CD_MODULE_URL, runtime: SimpleChange};
  static UNINITIALIZED:
      IdentifierSpec = {name: 'UNINITIALIZED', moduleUrl: CD_MODULE_URL, runtime: UNINITIALIZED};
  static ChangeDetectorStatus: IdentifierSpec = {
    name: 'ChangeDetectorStatus',
    moduleUrl: CD_MODULE_URL,
    runtime: ChangeDetectorStatus
  };
  static checkBinding: IdentifierSpec = {
    name: 'checkBinding',
    moduleUrl: VIEW_UTILS_MODULE_URL,
    runtime: checkBinding
  };
  static flattenNestedViewRenderNodes: IdentifierSpec = {
    name: 'flattenNestedViewRenderNodes',
    moduleUrl: VIEW_UTILS_MODULE_URL,
    runtime: flattenNestedViewRenderNodes
  };
  static devModeEqual:
      IdentifierSpec = {name: 'devModeEqual', moduleUrl: CD_MODULE_URL, runtime: devModeEqual};
  static interpolate: IdentifierSpec = {
    name: 'interpolate',
    moduleUrl: VIEW_UTILS_MODULE_URL,
    runtime: interpolate
  };
  static castByValue: IdentifierSpec = {
    name: 'castByValue',
    moduleUrl: VIEW_UTILS_MODULE_URL,
    runtime: castByValue
  };
  static EMPTY_ARRAY: IdentifierSpec = {
    name: 'EMPTY_ARRAY',
    moduleUrl: VIEW_UTILS_MODULE_URL,
    runtime: EMPTY_ARRAY
  };
  static EMPTY_MAP:
      IdentifierSpec = {name: 'EMPTY_MAP', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: EMPTY_MAP};

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
    runtime: AnimationKeyframe
  };
  static AnimationStyles: IdentifierSpec = {
    name: 'AnimationStyles',
    moduleUrl: assetUrl('core', 'animation/animation_styles'),
    runtime: AnimationStyles
  };
  static NoOpAnimationPlayer: IdentifierSpec = {
    name: 'NoOpAnimationPlayer',
    moduleUrl: assetUrl('core', 'animation/animation_player'),
    runtime: NoOpAnimationPlayer
  };
  static AnimationGroupPlayer: IdentifierSpec = {
    name: 'AnimationGroupPlayer',
    moduleUrl: assetUrl('core', 'animation/animation_group_player'),
    runtime: AnimationGroupPlayer
  };
  static AnimationSequencePlayer: IdentifierSpec = {
    name: 'AnimationSequencePlayer',
    moduleUrl: assetUrl('core', 'animation/animation_sequence_player'),
    runtime: AnimationSequencePlayer
  };
  static prepareFinalAnimationStyles: IdentifierSpec = {
    name: 'prepareFinalAnimationStyles',
    moduleUrl: ANIMATION_STYLE_UTIL_ASSET_URL,
    runtime: prepareFinalAnimationStyles
  };
  static balanceAnimationKeyframes: IdentifierSpec = {
    name: 'balanceAnimationKeyframes',
    moduleUrl: ANIMATION_STYLE_UTIL_ASSET_URL,
    runtime: balanceAnimationKeyframes
  };
  static clearStyles: IdentifierSpec = {
    name: 'clearStyles',
    moduleUrl: ANIMATION_STYLE_UTIL_ASSET_URL,
    runtime: clearStyles
  };
  static renderStyles: IdentifierSpec = {
    name: 'renderStyles',
    moduleUrl: ANIMATION_STYLE_UTIL_ASSET_URL,
    runtime: renderStyles
  };
  static collectAndResolveStyles: IdentifierSpec = {
    name: 'collectAndResolveStyles',
    moduleUrl: ANIMATION_STYLE_UTIL_ASSET_URL,
    runtime: collectAndResolveStyles
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
}

export function resolveIdentifier(identifier: IdentifierSpec) {
  return new CompileIdentifierMetadata({
    name: identifier.name,
    moduleUrl: identifier.moduleUrl,
    reference:
        reflector.resolveIdentifier(identifier.name, identifier.moduleUrl, identifier.runtime)
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
  const resolvedEnum = reflector.resolveEnum(enumType.reference, name);
  return new CompileIdentifierMetadata(
      {name: `${enumType.name}.${name}`, moduleUrl: enumType.moduleUrl, reference: resolvedEnum});
}
