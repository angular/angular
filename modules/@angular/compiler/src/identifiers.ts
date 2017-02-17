/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ANALYZE_FOR_ENTRY_COMPONENTS, ChangeDetectionStrategy, ChangeDetectorRef, ComponentFactory, ComponentFactoryResolver, ComponentRef, ComponentRenderTypeV2, ElementRef, Injector, LOCALE_ID, NgModuleFactory, QueryList, RenderComponentType, Renderer, SecurityContext, SimpleChange, TRANSLATIONS_FORMAT, TemplateRef, ViewContainerRef, ViewEncapsulation, ɵAnimationGroupPlayer, ɵAnimationKeyframe, ɵAnimationSequencePlayer, ɵAnimationStyles, ɵAnimationTransition, ɵAppView, ɵChangeDetectorStatus, ɵCodegenComponentFactoryResolver, ɵComponentRef_, ɵDebugAppView, ɵDebugContext, ɵNgModuleInjector, ɵNoOpAnimationPlayer, ɵStaticNodeDebugInfo, ɵTemplateRef_, ɵValueUnwrapper, ɵViewContainer, ɵViewType, ɵbalanceAnimationKeyframes, ɵclearStyles, ɵcollectAndResolveStyles, ɵdevModeEqual, ɵprepareFinalAnimationStyles, ɵreflector, ɵregisterModuleFactory, ɵrenderStyles, ɵviewEngine,
  ɵViewUtils as ViewUtils,
  ɵcheckBinding as checkBinding,
  ɵcheckBinding as checkBinding,
  ɵcheckBindingChange as checkBindingChange,
  ɵcheckRenderText as checkRenderText,
  ɵcheckRenderProperty as checkRenderProperty,
  ɵcheckRenderAttribute as checkRenderAttribute,
  ɵcheckRenderClass as checkRenderClass,
  ɵcheckRenderStyle as checkRenderStyle,
  ɵinlineInterpolate as inlineInterpolate,
  ɵinterpolate as interpolate,
  ɵcastByValue as castByValue,
  ɵEMPTY_ARRAY as EMPTY_ARRAY,
  ɵEMPTY_MAP as EMPTY_MAP,
  ɵcreateRenderElement as createRenderElement,
  ɵselectOrCreateRenderHostElement as selectOrCreateRenderHostElement,
  ɵpureProxy1 as pureProxy1,
  ɵpureProxy2 as pureProxy2,
  ɵpureProxy3 as pureProxy3,
  ɵpureProxy4 as pureProxy4,
  ɵpureProxy5 as pureProxy5,
  ɵpureProxy6 as pureProxy6,
  ɵpureProxy7 as pureProxy7,
  ɵpureProxy8 as pureProxy8,
  ɵpureProxy9 as pureProxy9,
  ɵpureProxy10 as pureProxy10,
  ɵnoop as noop,
  ɵsetBindingDebugInfo as setBindingDebugInfo,
  ɵsetBindingDebugInfoForChanges as setBindingDebugInfoForChanges,
  ɵInlineArray2 as InlineArray2
  ɵInlineArray4 as InlineArray4
  ɵInlineArray8 as InlineArray8
  ɵInlineArray16 as InlineArray16
  ɵEMPTY_INLINE_ARRAY as EMPTY_INLINE_ARRAY,
  ɵInlineArrayDynamic as InlineArrayDynamic,
  ɵsubscribeToRenderElement as subscribeToRenderElement,
  ɵcreateRenderComponentType as createRenderComponentType
} from '@angular/core';

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
  static ViewUtils: IdentifierSpec = {name: 'ɵViewUtils', moduleUrl: CORE, runtime: ViewUtils};
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
  static checkBinding: IdentifierSpec = {
    name: 'checkBinding',
    moduleUrl: CORE,
    runtime: checkBinding
  };
  static checkBindingChange: IdentifierSpec = {
    name: 'checkBindingChange',
    moduleUrl: CORE,
    runtime: checkBindingChange
  };
  static checkRenderText: IdentifierSpec = {
    name: 'checkRenderText',
    moduleUrl: CORE,
    runtime: checkRenderText
  };
  static checkRenderProperty: IdentifierSpec = {
    name: 'checkRenderProperty',
    moduleUrl: CORE,
    runtime: checkRenderProperty
  };
  static checkRenderAttribute: IdentifierSpec = {
    name: 'checkRenderAttribute',
    moduleUrl: CORE,
    runtime: checkRenderAttribute
  };
  static checkRenderClass: IdentifierSpec = {
    name: 'checkRenderClass',
    moduleUrl: CORE,
    runtime: checkRenderClass
  };
  static checkRenderStyle: IdentifierSpec = {
    name: 'checkRenderStyle',
    moduleUrl: CORE,
    runtime: checkRenderStyle
  };
  static devModeEqual:
      IdentifierSpec = {name: 'ɵdevModeEqual', moduleUrl: CORE, runtime: ɵdevModeEqual};
  static inlineInterpolate: IdentifierSpec = {
    name: 'inlineInterpolate',
    moduleUrl: CORE,
    runtime: inlineInterpolate
  };
  static interpolate: IdentifierSpec = {
    name: 'interpolate',
    moduleUrl: CORE,
    runtime: interpolate
  };
  static castByValue: IdentifierSpec = {
    name: 'castByValue',
    moduleUrl: CORE,
    runtime: castByValue
  };
  static EMPTY_ARRAY: IdentifierSpec = {
    name: 'EMPTY_ARRAY',
    moduleUrl: CORE,
    runtime: EMPTY_ARRAY
  };
  static EMPTY_MAP: IdentifierSpec =
      {name: 'EMPTY_MAP', moduleUrl: CORE, runtime: EMPTY_MAP};
  static createRenderElement: IdentifierSpec = {
    name: 'createRenderElement',
    moduleUrl: CORE,
    runtime: createRenderElement
  };
  static selectOrCreateRenderHostElement: IdentifierSpec = {
    name: 'selectOrCreateRenderHostElement',
    moduleUrl: CORE,
    runtime: selectOrCreateRenderHostElement
  };
  static pureProxies: IdentifierSpec[] = [
    null,
    {name: 'pureProxy1', moduleUrl: CORE, runtime: pureProxy1},
    {name: 'pureProxy2', moduleUrl: CORE, runtime: pureProxy2},
    {name: 'pureProxy3', moduleUrl: CORE, runtime: pureProxy3},
    {name: 'pureProxy4', moduleUrl: CORE, runtime: pureProxy4},
    {name: 'pureProxy5', moduleUrl: CORE, runtime: pureProxy5},
    {name: 'pureProxy6', moduleUrl: CORE, runtime: pureProxy6},
    {name: 'pureProxy7', moduleUrl: CORE, runtime: pureProxy7},
    {name: 'pureProxy8', moduleUrl: CORE, runtime: pureProxy8},
    {name: 'pureProxy9', moduleUrl: CORE, runtime: pureProxy9},
    {name: 'pureProxy10', moduleUrl: CORE, runtime: pureProxy10},
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
    name: 'setBindingDebugInfo',
    moduleUrl: CORE,
    runtime: setBindingDebugInfo
  };
  static setBindingDebugInfoForChanges: IdentifierSpec = {
    name: 'setBindingDebugInfoForChanges',
    moduleUrl: CORE,
    runtime: setBindingDebugInfoForChanges
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
    {
      name: 'InlineArray2',
      moduleUrl: CORE,
      runtime: InlineArray2
    },
    {
      name: 'InlineArray2',
      moduleUrl: CORE,
      runtime: InlineArray2
    },
    {
      name: 'InlineArray4',
      moduleUrl: CORE,
      runtime: InlineArray4
    },
    {
      name: 'InlineArray8',
      moduleUrl: CORE,
      runtime: InlineArray8
    },
    {
      name: 'InlineArray16',
      moduleUrl: CORE,
      runtime: InlineArray16
    },
  ];
  static EMPTY_INLINE_ARRAY: IdentifierSpec = {
    name: 'EMPTY_INLINE_ARRAY',
    moduleUrl: CORE,
    runtime: EMPTY_INLINE_ARRAY
  };
  static InlineArrayDynamic: IdentifierSpec = {
    name: 'InlineArrayDynamic',
    moduleUrl: CORE,
    runtime: InlineArrayDynamic
  };
  static subscribeToRenderElement: IdentifierSpec = {
    name: 'subscribeToRenderElement',
    moduleUrl: CORE,
    runtime: subscribeToRenderElement
  };
  static createRenderComponentType: IdentifierSpec = {
    name: 'createRenderComponentType',
    moduleUrl: CORE,
    runtime: createRenderComponentType
  };


  static noop: IdentifierSpec =
      {name: 'noop', moduleUrl: CORE, runtime: noop};

  static viewDef: IdentifierSpec =
      {name: 'ɵviewEngine', moduleUrl: CORE, member: 'viewDef', runtime: ɵviewEngine.viewDef};
  static elementDef: IdentifierSpec =
      {name: 'ɵviewEngine', moduleUrl: CORE, member: 'elementDef', runtime: ɵviewEngine.elementDef};
  static anchorDef: IdentifierSpec =
      {name: 'ɵviewEngine', moduleUrl: CORE, member: 'anchorDef', runtime: ɵviewEngine.anchorDef};
  static textDef: IdentifierSpec =
      {name: 'ɵviewEngine', moduleUrl: CORE, member: 'textDef', runtime: ɵviewEngine.textDef};
  static directiveDef: IdentifierSpec = {
    name: 'ɵviewEngine',
    moduleUrl: CORE,
    member: 'directiveDef',
    runtime: ɵviewEngine.directiveDef
  };
  static providerDef: IdentifierSpec = {
    name: 'ɵviewEngine',
    moduleUrl: CORE,
    member: 'providerDef',
    runtime: ɵviewEngine.providerDef
  };
  static queryDef: IdentifierSpec =
      {name: 'ɵviewEngine', moduleUrl: CORE, member: 'queryDef', runtime: ɵviewEngine.queryDef};
  static pureArrayDef: IdentifierSpec = {
    name: 'ɵviewEngine',
    moduleUrl: CORE,
    member: 'pureArrayDef',
    runtime: ɵviewEngine.pureArrayDef
  };
  static pureObjectDef: IdentifierSpec = {
    name: 'ɵviewEngine',
    moduleUrl: CORE,
    member: 'pureObjectDef',
    runtime: ɵviewEngine.pureObjectDef
  };
  static purePipeDef: IdentifierSpec = {
    name: 'ɵviewEngine',
    moduleUrl: CORE,
    member: 'purePipeDef',
    runtime: ɵviewEngine.purePipeDef
  };
  static pipeDef: IdentifierSpec =
      {name: 'ɵviewEngine', moduleUrl: CORE, member: 'pipeDef', runtime: ɵviewEngine.pipeDef};
  static nodeValue: IdentifierSpec =
      {name: 'ɵviewEngine', moduleUrl: CORE, member: 'nodeValue', runtime: ɵviewEngine.nodeValue};
  static ngContentDef: IdentifierSpec = {
    name: 'ɵviewEngine',
    moduleUrl: CORE,
    member: 'ngContentDef',
    runtime: ɵviewEngine.ngContentDef
  };
  static unwrapValue: IdentifierSpec = {
    name: 'ɵviewEngine',
    moduleUrl: CORE,
    member: 'unwrapValue',
    runtime: ɵviewEngine.unwrapValue
  };
  static createComponentRenderTypeV2: IdentifierSpec = {
    name: 'ɵviewEngine',
    moduleUrl: CORE,
    member: 'createComponentRenderTypeV2',
    runtime: ɵviewEngine.createComponentRenderTypeV2
  };
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
