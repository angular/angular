/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ANALYZE_FOR_ENTRY_COMPONENTS, ChangeDetectionStrategy, ChangeDetectorRef, ComponentFactory, ComponentFactoryResolver, ComponentRef, ElementRef, Injector, LOCALE_ID, NgModuleFactory, QueryList, RenderComponentType, Renderer, SecurityContext, SimpleChange, TRANSLATIONS_FORMAT, TemplateRef, ViewContainerRef, ViewEncapsulation, ɵAnimationGroupPlayer, ɵAnimationKeyframe, ɵAnimationSequencePlayer, ɵAnimationStyles, ɵAnimationTransition, ɵAppView, ɵChangeDetectorStatus, ɵCodegenComponentFactoryResolver, ɵComponentRef_, ɵDebugAppView, ɵDebugContext, ɵEMPTY_ARRAY, ɵEMPTY_INLINE_ARRAY, ɵEMPTY_MAP, ɵInlineArray16, ɵInlineArray2, ɵInlineArray4, ɵInlineArray8, ɵInlineArrayDynamic, ɵNgModuleInjector, ɵNoOpAnimationPlayer, ɵStaticNodeDebugInfo, ɵTemplateRef_, ɵValueUnwrapper, ɵViewContainer, ɵViewType, ɵViewUtils, ɵand, ɵbalanceAnimationKeyframes, ɵcastByValue, ɵccf, ɵcheckBinding, ɵcheckBindingChange, ɵcheckRenderAttribute, ɵcheckRenderClass, ɵcheckRenderProperty, ɵcheckRenderStyle, ɵcheckRenderText, ɵclearStyles, ɵcollectAndResolveStyles, ɵcreateRenderComponentType, ɵcreateRenderElement, ɵcrt, ɵdevModeEqual, ɵdid, ɵeld, ɵinlineInterpolate, ɵinterpolate, ɵncd, ɵnoop, ɵnov, ɵpad, ɵpid, ɵpod, ɵppd, ɵprd, ɵprepareFinalAnimationStyles, ɵpureProxy1, ɵpureProxy10, ɵpureProxy2, ɵpureProxy3, ɵpureProxy4, ɵpureProxy5, ɵpureProxy6, ɵpureProxy7, ɵpureProxy8, ɵpureProxy9, ɵqud, ɵreflector, ɵregisterModuleFactory, ɵrenderStyles, ɵselectOrCreateRenderHostElement, ɵsetBindingDebugInfo, ɵsetBindingDebugInfoForChanges, ɵsubscribeToRenderElement, ɵted, ɵunv, ɵvid} from '@angular/core';

import {CompileIdentifierMetadata, CompileTokenMetadata} from './compile_metadata';

const CORE = assetUrl('core');
const VIEW_UTILS_MODULE_URL = assetUrl('core', 'linker/view_utils');

export interface IdentifierSpec {
  name: string;
  moduleUrl: string;
  runtime: any;
}

export class Identifiers {
  static ANALYZE_FOR_ENTRY_COMPONENTS: IdentifierSpec = {
    name: 'ANALYZE_FOR_ENTRY_COMPONENTS',
    moduleUrl: CORE,
    runtime: ANALYZE_FOR_ENTRY_COMPONENTS
  };
  static ViewUtils: IdentifierSpec = {name: 'ɵViewUtils', moduleUrl: CORE, runtime: ɵViewUtils};
  static AppView: IdentifierSpec = {name: 'ɵAppView', moduleUrl: CORE, runtime: ɵAppView};
  static DebugAppView:
      IdentifierSpec = {name: 'ɵDebugAppView', moduleUrl: CORE, runtime: ɵDebugAppView};
  static ViewContainer:
      IdentifierSpec = {name: 'ɵViewContainer', moduleUrl: CORE, runtime: ɵViewContainer};
  static ElementRef: IdentifierSpec = {name: 'ElementRef', moduleUrl: CORE, runtime: ElementRef};
  static ViewContainerRef:
      IdentifierSpec = {name: 'ViewContainerRef', moduleUrl: CORE, runtime: ViewContainerRef};
  static ChangeDetectorRef:
      IdentifierSpec = {name: 'ChangeDetectorRef', moduleUrl: CORE, runtime: ChangeDetectorRef};
  static RenderComponentType:
      IdentifierSpec = {name: 'RenderComponentType', moduleUrl: CORE, runtime: RenderComponentType};
  static QueryList: IdentifierSpec = {name: 'QueryList', moduleUrl: CORE, runtime: QueryList};
  static TemplateRef: IdentifierSpec = {name: 'TemplateRef', moduleUrl: CORE, runtime: TemplateRef};
  static TemplateRef_:
      IdentifierSpec = {name: 'ɵTemplateRef_', moduleUrl: CORE, runtime: ɵTemplateRef_};
  static CodegenComponentFactoryResolver: IdentifierSpec = {
    name: 'ɵCodegenComponentFactoryResolver',
    moduleUrl: CORE,
    runtime: ɵCodegenComponentFactoryResolver
  };
  static ComponentFactoryResolver: IdentifierSpec = {
    name: 'ComponentFactoryResolver',
    moduleUrl: CORE,
    runtime: ComponentFactoryResolver
  };
  static ComponentFactory:
      IdentifierSpec = {name: 'ComponentFactory', moduleUrl: CORE, runtime: ComponentFactory};
  static ComponentRef_: IdentifierSpec = {
    name: 'ɵComponentRef_',
    moduleUrl: CORE,
    runtime: ɵComponentRef_,
  };
  static ComponentRef:
      IdentifierSpec = {name: 'ComponentRef', moduleUrl: CORE, runtime: ComponentRef};
  static NgModuleFactory:
      IdentifierSpec = {name: 'NgModuleFactory', moduleUrl: CORE, runtime: NgModuleFactory};
  static NgModuleInjector: IdentifierSpec = {
    name: 'ɵNgModuleInjector',
    moduleUrl: CORE,
    runtime: ɵNgModuleInjector,
  };
  static RegisterModuleFactoryFn: IdentifierSpec = {
    name: 'ɵregisterModuleFactory',
    moduleUrl: CORE,
    runtime: ɵregisterModuleFactory,
  };
  static ValueUnwrapper:
      IdentifierSpec = {name: 'ɵValueUnwrapper', moduleUrl: CORE, runtime: ɵValueUnwrapper};
  static Injector: IdentifierSpec = {name: 'Injector', moduleUrl: CORE, runtime: Injector};
  static ViewEncapsulation:
      IdentifierSpec = {name: 'ViewEncapsulation', moduleUrl: CORE, runtime: ViewEncapsulation};
  static ViewType: IdentifierSpec = {name: 'ɵViewType', moduleUrl: CORE, runtime: ɵViewType};
  static ChangeDetectionStrategy: IdentifierSpec = {
    name: 'ChangeDetectionStrategy',
    moduleUrl: CORE,
    runtime: ChangeDetectionStrategy
  };
  static StaticNodeDebugInfo: IdentifierSpec = {
    name: 'ɵStaticNodeDebugInfo',
    moduleUrl: CORE,
    runtime: ɵStaticNodeDebugInfo
  };
  static DebugContext:
      IdentifierSpec = {name: 'ɵDebugContext', moduleUrl: CORE, runtime: ɵDebugContext};
  static Renderer: IdentifierSpec = {name: 'Renderer', moduleUrl: CORE, runtime: Renderer};
  static SimpleChange:
      IdentifierSpec = {name: 'SimpleChange', moduleUrl: CORE, runtime: SimpleChange};
  static ChangeDetectorStatus: IdentifierSpec = {
    name: 'ɵChangeDetectorStatus',
    moduleUrl: CORE,
    runtime: ɵChangeDetectorStatus
  };
  static checkBinding:
      IdentifierSpec = {name: 'ɵcheckBinding', moduleUrl: CORE, runtime: ɵcheckBinding};
  static checkBindingChange:
      IdentifierSpec = {name: 'ɵcheckBindingChange', moduleUrl: CORE, runtime: ɵcheckBindingChange};
  static checkRenderText:
      IdentifierSpec = {name: 'ɵcheckRenderText', moduleUrl: CORE, runtime: ɵcheckRenderText};
  static checkRenderProperty: IdentifierSpec = {
    name: 'ɵcheckRenderProperty',
    moduleUrl: CORE,
    runtime: ɵcheckRenderProperty
  };
  static checkRenderAttribute: IdentifierSpec = {
    name: 'ɵcheckRenderAttribute',
    moduleUrl: CORE,
    runtime: ɵcheckRenderAttribute
  };
  static checkRenderClass:
      IdentifierSpec = {name: 'ɵcheckRenderClass', moduleUrl: CORE, runtime: ɵcheckRenderClass};
  static checkRenderStyle:
      IdentifierSpec = {name: 'ɵcheckRenderStyle', moduleUrl: CORE, runtime: ɵcheckRenderStyle};
  static devModeEqual:
      IdentifierSpec = {name: 'ɵdevModeEqual', moduleUrl: CORE, runtime: ɵdevModeEqual};
  static inlineInterpolate:
      IdentifierSpec = {name: 'ɵinlineInterpolate', moduleUrl: CORE, runtime: ɵinlineInterpolate};
  static interpolate:
      IdentifierSpec = {name: 'ɵinterpolate', moduleUrl: CORE, runtime: ɵinterpolate};
  static castByValue:
      IdentifierSpec = {name: 'ɵcastByValue', moduleUrl: CORE, runtime: ɵcastByValue};
  static EMPTY_ARRAY:
      IdentifierSpec = {name: 'ɵEMPTY_ARRAY', moduleUrl: CORE, runtime: ɵEMPTY_ARRAY};
  static EMPTY_MAP: IdentifierSpec = {name: 'ɵEMPTY_MAP', moduleUrl: CORE, runtime: ɵEMPTY_MAP};
  static createRenderElement: IdentifierSpec = {
    name: 'ɵcreateRenderElement',
    moduleUrl: CORE,
    runtime: ɵcreateRenderElement
  };
  static selectOrCreateRenderHostElement: IdentifierSpec = {
    name: 'ɵselectOrCreateRenderHostElement',
    moduleUrl: CORE,
    runtime: ɵselectOrCreateRenderHostElement
  };
  static pureProxies: IdentifierSpec[] = [
    null,
    {name: 'ɵpureProxy1', moduleUrl: CORE, runtime: ɵpureProxy1},
    {name: 'ɵpureProxy2', moduleUrl: CORE, runtime: ɵpureProxy2},
    {name: 'ɵpureProxy3', moduleUrl: CORE, runtime: ɵpureProxy3},
    {name: 'ɵpureProxy4', moduleUrl: CORE, runtime: ɵpureProxy4},
    {name: 'ɵpureProxy5', moduleUrl: CORE, runtime: ɵpureProxy5},
    {name: 'ɵpureProxy6', moduleUrl: CORE, runtime: ɵpureProxy6},
    {name: 'ɵpureProxy7', moduleUrl: CORE, runtime: ɵpureProxy7},
    {name: 'ɵpureProxy8', moduleUrl: CORE, runtime: ɵpureProxy8},
    {name: 'ɵpureProxy9', moduleUrl: CORE, runtime: ɵpureProxy9},
    {name: 'ɵpureProxy10', moduleUrl: CORE, runtime: ɵpureProxy10},
  ];
  static SecurityContext: IdentifierSpec = {
    name: 'SecurityContext',
    moduleUrl: CORE,
    runtime: SecurityContext,
  };
  static AnimationKeyframe:
      IdentifierSpec = {name: 'ɵAnimationKeyframe', moduleUrl: CORE, runtime: ɵAnimationKeyframe};
  static AnimationStyles:
      IdentifierSpec = {name: 'ɵAnimationStyles', moduleUrl: CORE, runtime: ɵAnimationStyles};
  static NoOpAnimationPlayer: IdentifierSpec = {
    name: 'ɵNoOpAnimationPlayer',
    moduleUrl: CORE,
    runtime: ɵNoOpAnimationPlayer
  };
  static AnimationGroupPlayer: IdentifierSpec = {
    name: 'ɵAnimationGroupPlayer',
    moduleUrl: CORE,
    runtime: ɵAnimationGroupPlayer
  };
  static AnimationSequencePlayer: IdentifierSpec = {
    name: 'ɵAnimationSequencePlayer',
    moduleUrl: CORE,
    runtime: ɵAnimationSequencePlayer
  };
  static prepareFinalAnimationStyles: IdentifierSpec = {
    name: 'ɵprepareFinalAnimationStyles',
    moduleUrl: CORE,
    runtime: ɵprepareFinalAnimationStyles
  };
  static balanceAnimationKeyframes: IdentifierSpec = {
    name: 'ɵbalanceAnimationKeyframes',
    moduleUrl: CORE,
    runtime: ɵbalanceAnimationKeyframes
  };
  static clearStyles:
      IdentifierSpec = {name: 'ɵclearStyles', moduleUrl: CORE, runtime: ɵclearStyles};
  static renderStyles:
      IdentifierSpec = {name: 'ɵrenderStyles', moduleUrl: CORE, runtime: ɵrenderStyles};
  static collectAndResolveStyles: IdentifierSpec = {
    name: 'ɵcollectAndResolveStyles',
    moduleUrl: CORE,
    runtime: ɵcollectAndResolveStyles
  };
  static LOCALE_ID: IdentifierSpec = {name: 'LOCALE_ID', moduleUrl: CORE, runtime: LOCALE_ID};
  static TRANSLATIONS_FORMAT:
      IdentifierSpec = {name: 'TRANSLATIONS_FORMAT', moduleUrl: CORE, runtime: TRANSLATIONS_FORMAT};
  static setBindingDebugInfo: IdentifierSpec = {
    name: 'ɵsetBindingDebugInfo',
    moduleUrl: CORE,
    runtime: ɵsetBindingDebugInfo
  };
  static setBindingDebugInfoForChanges: IdentifierSpec = {
    name: 'ɵsetBindingDebugInfoForChanges',
    moduleUrl: CORE,
    runtime: ɵsetBindingDebugInfoForChanges
  };
  static AnimationTransition: IdentifierSpec = {
    name: 'ɵAnimationTransition',
    moduleUrl: CORE,
    runtime: ɵAnimationTransition
  };

  // This is just the interface!
  static InlineArray:
      IdentifierSpec = {name: 'InlineArray', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: null};
  static inlineArrays: IdentifierSpec[] = [
    {name: 'ɵInlineArray2', moduleUrl: CORE, runtime: ɵInlineArray2},
    {name: 'ɵInlineArray2', moduleUrl: CORE, runtime: ɵInlineArray2},
    {name: 'ɵInlineArray4', moduleUrl: CORE, runtime: ɵInlineArray4},
    {name: 'ɵInlineArray8', moduleUrl: CORE, runtime: ɵInlineArray8},
    {name: 'ɵInlineArray16', moduleUrl: CORE, runtime: ɵInlineArray16},
  ];
  static EMPTY_INLINE_ARRAY:
      IdentifierSpec = {name: 'ɵEMPTY_INLINE_ARRAY', moduleUrl: CORE, runtime: ɵEMPTY_INLINE_ARRAY};
  static InlineArrayDynamic:
      IdentifierSpec = {name: 'ɵInlineArrayDynamic', moduleUrl: CORE, runtime: ɵInlineArrayDynamic};
  static subscribeToRenderElement: IdentifierSpec = {
    name: 'ɵsubscribeToRenderElement',
    moduleUrl: CORE,
    runtime: ɵsubscribeToRenderElement
  };
  static createRenderComponentType: IdentifierSpec = {
    name: 'ɵcreateRenderComponentType',
    moduleUrl: CORE,
    runtime: ɵcreateRenderComponentType
  };


  static noop: IdentifierSpec = {name: 'ɵnoop', moduleUrl: CORE, runtime: ɵnoop};

  static viewDef: IdentifierSpec = {name: 'ɵvid', moduleUrl: CORE, runtime: ɵvid};
  static elementDef: IdentifierSpec = {name: 'ɵeld', moduleUrl: CORE, runtime: ɵeld};
  static anchorDef: IdentifierSpec = {name: 'ɵand', moduleUrl: CORE, runtime: ɵand};
  static textDef: IdentifierSpec = {name: 'ɵted', moduleUrl: CORE, runtime: ɵted};
  static directiveDef: IdentifierSpec = {name: 'ɵdid', moduleUrl: CORE, runtime: ɵdid};
  static providerDef: IdentifierSpec = {name: 'ɵprd', moduleUrl: CORE, runtime: ɵprd};
  static queryDef: IdentifierSpec = {name: 'ɵqud', moduleUrl: CORE, runtime: ɵqud};
  static pureArrayDef: IdentifierSpec = {name: 'ɵpad', moduleUrl: CORE, runtime: ɵpad};
  static pureObjectDef: IdentifierSpec = {name: 'ɵpod', moduleUrl: CORE, runtime: ɵpod};
  static purePipeDef: IdentifierSpec = {name: 'ɵppd', moduleUrl: CORE, runtime: ɵppd};
  static pipeDef: IdentifierSpec = {name: 'ɵpid', moduleUrl: CORE, runtime: ɵpid};
  static nodeValue: IdentifierSpec = {name: 'ɵnov', moduleUrl: CORE, runtime: ɵnov};
  static ngContentDef: IdentifierSpec = {name: 'ɵncd', moduleUrl: CORE, runtime: ɵncd};
  static unwrapValue: IdentifierSpec = {name: 'ɵunv', moduleUrl: CORE, runtime: ɵunv};
  static createRendererTypeV2: IdentifierSpec = {name: 'ɵcrt', moduleUrl: CORE, runtime: ɵcrt};
  static RendererTypeV2: IdentifierSpec = {
    name: 'RendererTypeV2',
    moduleUrl: CORE,
    // type only
    runtime: null
  };
  static ViewDefinition: IdentifierSpec = {
    name: 'ɵViewDefinition',
    moduleUrl: CORE,
    // type only
    runtime: null
  };
  static createComponentFactory: IdentifierSpec = {name: 'ɵccf', moduleUrl: CORE, runtime: ɵccf};
}

export function assetUrl(pkg: string, path: string = null, type: string = 'src'): string {
  if (path == null) {
    return `@angular/${pkg}`;
  } else {
    return `@angular/${pkg}/${type}/${path}`;
  }
}

export function resolveIdentifier(identifier: IdentifierSpec) {
  let name = identifier.name;
  return ɵreflector.resolveIdentifier(name, identifier.moduleUrl, null, identifier.runtime);
}

export function createIdentifier(identifier: IdentifierSpec): CompileIdentifierMetadata {
  return {reference: resolveIdentifier(identifier)};
}

export function identifierToken(identifier: CompileIdentifierMetadata): CompileTokenMetadata {
  return {identifier: identifier};
}

export function createIdentifierToken(identifier: IdentifierSpec): CompileTokenMetadata {
  return identifierToken(createIdentifier(identifier));
}

export function createEnumIdentifier(
    enumType: IdentifierSpec, name: string): CompileIdentifierMetadata {
  const resolvedEnum = ɵreflector.resolveEnum(resolveIdentifier(enumType), name);
  return {reference: resolvedEnum};
}
