/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ANALYZE_FOR_ENTRY_COMPONENTS, ChangeDetectionStrategy, ChangeDetectorRef, ComponentFactory, ComponentFactoryResolver, ComponentRef, ElementRef, Injector, LOCALE_ID, NgModuleFactory, QueryList, RenderComponentType, Renderer, SecurityContext, SimpleChange, TRANSLATIONS_FORMAT, TemplateRef, ViewContainerRef, ViewEncapsulation, ɵAnimationGroupPlayer, ɵAnimationKeyframe, ɵAnimationSequencePlayer, ɵAnimationStyles, ɵAnimationTransition, ɵAppView, ɵChangeDetectorStatus, ɵCodegenComponentFactoryResolver, ɵComponentRef_, ɵDebugAppView, ɵDebugContext, ɵNgModuleInjector, ɵNoOpAnimationPlayer, ɵStaticNodeDebugInfo, ɵTemplateRef_, ɵValueUnwrapper, ɵViewContainer, ɵViewType, ɵbalanceAnimationKeyframes, ɵclearStyles, ɵcollectAndResolveStyles, ɵdevModeEqual, ɵprepareFinalAnimationStyles, ɵreflector, ɵregisterModuleFactory, ɵrenderStyles, ɵviewEngine, ɵview_utils} from '@angular/core';

import {CompileIdentifierMetadata, CompileTokenMetadata} from './compile_metadata';

const CORE = assetUrl('core');
const VIEW_UTILS_MODULE_URL = assetUrl('core', 'linker/view_utils');

export interface IdentifierSpec {
  name: string;
  moduleUrl: string;
  member?: string;
  runtime: any;
}

export class Identifiers {
  static ANALYZE_FOR_ENTRY_COMPONENTS: IdentifierSpec = {
    name: 'ANALYZE_FOR_ENTRY_COMPONENTS',
    moduleUrl: CORE,
    runtime: ANALYZE_FOR_ENTRY_COMPONENTS
  };
  static ViewUtils: IdentifierSpec =
      {name: 'ɵview_utils', moduleUrl: CORE, member: 'ViewUtils', runtime: ɵview_utils.ViewUtils};
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
    name: 'ɵview_utils',
    moduleUrl: CORE,
    member: 'checkBinding',
    runtime: ɵview_utils.checkBinding
  };
  static checkBindingChange: IdentifierSpec = {
    name: 'ɵview_utils',
    moduleUrl: CORE,
    member: 'checkBindingChange',
    runtime: ɵview_utils.checkBindingChange
  };
  static checkRenderText: IdentifierSpec = {
    name: 'ɵview_utils',
    moduleUrl: CORE,
    member: 'checkRenderText',
    runtime: ɵview_utils.checkRenderText
  };
  static checkRenderProperty: IdentifierSpec = {
    name: 'ɵview_utils',
    moduleUrl: CORE,
    member: 'checkRenderProperty',
    runtime: ɵview_utils.checkRenderProperty
  };
  static checkRenderAttribute: IdentifierSpec = {
    name: 'ɵview_utils',
    moduleUrl: CORE,
    member: 'checkRenderAttribute',
    runtime: ɵview_utils.checkRenderAttribute
  };
  static checkRenderClass: IdentifierSpec = {
    name: 'ɵview_utils',
    moduleUrl: CORE,
    member: 'checkRenderClass',
    runtime: ɵview_utils.checkRenderClass
  };
  static checkRenderStyle: IdentifierSpec = {
    name: 'ɵview_utils',
    moduleUrl: CORE,
    member: 'checkRenderStyle',
    runtime: ɵview_utils.checkRenderStyle
  };
  static devModeEqual:
      IdentifierSpec = {name: 'ɵdevModeEqual', moduleUrl: CORE, runtime: ɵdevModeEqual};
  static inlineInterpolate: IdentifierSpec = {
    name: 'ɵview_utils',
    moduleUrl: CORE,
    member: 'inlineInterpolate',
    runtime: ɵview_utils.inlineInterpolate
  };
  static interpolate: IdentifierSpec = {
    name: 'ɵview_utils',
    moduleUrl: CORE,
    member: 'interpolate',
    runtime: ɵview_utils.interpolate
  };
  static castByValue: IdentifierSpec = {
    name: 'ɵview_utils',
    moduleUrl: CORE,
    member: 'castByValue',
    runtime: ɵview_utils.castByValue
  };
  static EMPTY_ARRAY: IdentifierSpec = {
    name: 'ɵview_utils',
    moduleUrl: CORE,
    member: 'EMPTY_ARRAY',
    runtime: ɵview_utils.EMPTY_ARRAY
  };
  static EMPTY_MAP: IdentifierSpec =
      {name: 'ɵview_utils', moduleUrl: CORE, member: 'EMPTY_MAP', runtime: ɵview_utils.EMPTY_MAP};
  static createRenderElement: IdentifierSpec = {
    name: 'ɵview_utils',
    moduleUrl: CORE,
    member: 'createRenderElement',
    runtime: ɵview_utils.createRenderElement
  };
  static selectOrCreateRenderHostElement: IdentifierSpec = {
    name: 'ɵview_utils',
    moduleUrl: CORE,
    member: 'selectOrCreateRenderHostElement',
    runtime: ɵview_utils.selectOrCreateRenderHostElement
  };
  static pureProxies: IdentifierSpec[] = [
    null,
    {name: 'ɵview_utils', moduleUrl: CORE, member: 'pureProxy1', runtime: ɵview_utils.pureProxy1},
    {name: 'ɵview_utils', moduleUrl: CORE, member: 'pureProxy2', runtime: ɵview_utils.pureProxy2},
    {name: 'ɵview_utils', moduleUrl: CORE, member: 'pureProxy3', runtime: ɵview_utils.pureProxy3},
    {name: 'ɵview_utils', moduleUrl: CORE, member: 'pureProxy4', runtime: ɵview_utils.pureProxy4},
    {name: 'ɵview_utils', moduleUrl: CORE, member: 'pureProxy5', runtime: ɵview_utils.pureProxy5},
    {name: 'ɵview_utils', moduleUrl: CORE, member: 'pureProxy6', runtime: ɵview_utils.pureProxy6},
    {name: 'ɵview_utils', moduleUrl: CORE, member: 'pureProxy7', runtime: ɵview_utils.pureProxy7},
    {name: 'ɵview_utils', moduleUrl: CORE, member: 'pureProxy8', runtime: ɵview_utils.pureProxy8},
    {name: 'ɵview_utils', moduleUrl: CORE, member: 'pureProxy9', runtime: ɵview_utils.pureProxy9},
    {name: 'ɵview_utils', moduleUrl: CORE, member: 'pureProxy10', runtime: ɵview_utils.pureProxy10},
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
    name: 'ɵview_utils',
    moduleUrl: CORE,
    member: 'setBindingDebugInfo',
    runtime: ɵview_utils.setBindingDebugInfo
  };
  static setBindingDebugInfoForChanges: IdentifierSpec = {
    name: 'ɵview_utils',
    moduleUrl: CORE,
    member: 'setBindingDebugInfoForChanges',
    runtime: ɵview_utils.setBindingDebugInfoForChanges
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
      name: 'ɵview_utils',
      moduleUrl: CORE,
      member: 'InlineArray2',
      runtime: ɵview_utils.InlineArray2
    },
    {
      name: 'ɵview_utils',
      moduleUrl: CORE,
      member: 'InlineArray2',
      runtime: ɵview_utils.InlineArray2
    },
    {
      name: 'ɵview_utils',
      moduleUrl: CORE,
      member: 'InlineArray4',
      runtime: ɵview_utils.InlineArray4
    },
    {
      name: 'ɵview_utils',
      moduleUrl: CORE,
      member: 'InlineArray8',
      runtime: ɵview_utils.InlineArray8
    },
    {
      name: 'ɵview_utils',
      moduleUrl: CORE,
      member: 'InlineArray16',
      runtime: ɵview_utils.InlineArray16
    },
  ];
  static EMPTY_INLINE_ARRAY: IdentifierSpec = {
    name: 'ɵview_utils',
    moduleUrl: CORE,
    member: 'EMPTY_INLINE_ARRAY',
    runtime: ɵview_utils.EMPTY_INLINE_ARRAY
  };
  static InlineArrayDynamic: IdentifierSpec = {
    name: 'ɵview_utils',
    moduleUrl: CORE,
    member: 'InlineArrayDynamic',
    runtime: ɵview_utils.InlineArrayDynamic
  };
  static subscribeToRenderElement: IdentifierSpec = {
    name: 'ɵview_utils',
    moduleUrl: CORE,
    member: 'subscribeToRenderElement',
    runtime: ɵview_utils.subscribeToRenderElement
  };
  static createRenderComponentType: IdentifierSpec = {
    name: 'ɵview_utils',
    moduleUrl: CORE,
    member: 'createRenderComponentType',
    runtime: ɵview_utils.createRenderComponentType
  };


  static noop: IdentifierSpec =
      {name: 'ɵview_utils', moduleUrl: CORE, member: 'noop', runtime: ɵview_utils.noop};

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
  let members = identifier.member && [identifier.member];
  return ɵreflector.resolveIdentifier(name, identifier.moduleUrl, members, identifier.runtime);
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
