/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ANALYZE_FOR_ENTRY_COMPONENTS, ChangeDetectionStrategy, ChangeDetectorRef, ComponentFactory, ComponentFactoryResolver, ComponentRef, ElementRef, Injector, LOCALE_ID, NgModuleFactory, NgModuleRef, QueryList, Renderer, SecurityContext, TRANSLATIONS_FORMAT, TemplateRef, ViewContainerRef, ViewEncapsulation, ɵCodegenComponentFactoryResolver, ɵEMPTY_ARRAY, ɵEMPTY_MAP, ɵand, ɵccf, ɵcmf, ɵcrt, ɵdid, ɵeld, ɵinlineInterpolate, ɵinterpolate, ɵmod, ɵmpd, ɵncd, ɵnov, ɵpad, ɵpid, ɵpod, ɵppd, ɵprd, ɵqud, ɵregisterModuleFactory, ɵted, ɵunv, ɵvid} from '@angular/core';

import {CompileIdentifierMetadata, CompileTokenMetadata} from './compile_metadata';
import {CompileReflector} from './compile_reflector';
import * as o from './output/output_ast';

const CORE = '@angular/core';

export class Identifiers {
  static ANALYZE_FOR_ENTRY_COMPONENTS: o.ExternalReference = {
    name: 'ANALYZE_FOR_ENTRY_COMPONENTS',
    moduleName: CORE,
    runtime: ANALYZE_FOR_ENTRY_COMPONENTS
  };
  static ElementRef:
      o.ExternalReference = {name: 'ElementRef', moduleName: CORE, runtime: ElementRef};
  static NgModuleRef:
      o.ExternalReference = {name: 'NgModuleRef', moduleName: CORE, runtime: NgModuleRef};
  static ViewContainerRef:
      o.ExternalReference = {name: 'ViewContainerRef', moduleName: CORE, runtime: ViewContainerRef};
  static ChangeDetectorRef: o.ExternalReference = {
    name: 'ChangeDetectorRef',
    moduleName: CORE,
    runtime: ChangeDetectorRef
  };
  static QueryList: o.ExternalReference = {name: 'QueryList', moduleName: CORE, runtime: QueryList};
  static TemplateRef:
      o.ExternalReference = {name: 'TemplateRef', moduleName: CORE, runtime: TemplateRef};
  static CodegenComponentFactoryResolver: o.ExternalReference = {
    name: 'ɵCodegenComponentFactoryResolver',
    moduleName: CORE,
    runtime: ɵCodegenComponentFactoryResolver
  };
  static ComponentFactoryResolver: o.ExternalReference = {
    name: 'ComponentFactoryResolver',
    moduleName: CORE,
    runtime: ComponentFactoryResolver
  };
  static ComponentFactory:
      o.ExternalReference = {name: 'ComponentFactory', moduleName: CORE, runtime: ComponentFactory};
  static ComponentRef:
      o.ExternalReference = {name: 'ComponentRef', moduleName: CORE, runtime: ComponentRef};
  static NgModuleFactory:
      o.ExternalReference = {name: 'NgModuleFactory', moduleName: CORE, runtime: NgModuleFactory};
  static createModuleFactory: o.ExternalReference = {
    name: 'ɵcmf',
    moduleName: CORE,
    runtime: ɵcmf,
  };
  static moduleDef: o.ExternalReference = {
    name: 'ɵmod',
    moduleName: CORE,
    runtime: ɵmod,
  };
  static moduleProviderDef: o.ExternalReference = {
    name: 'ɵmpd',
    moduleName: CORE,
    runtime: ɵmpd,
  };
  static RegisterModuleFactoryFn: o.ExternalReference = {
    name: 'ɵregisterModuleFactory',
    moduleName: CORE,
    runtime: ɵregisterModuleFactory,
  };
  static Injector: o.ExternalReference = {name: 'Injector', moduleName: CORE, runtime: Injector};
  static ViewEncapsulation: o.ExternalReference = {
    name: 'ViewEncapsulation',
    moduleName: CORE,
    runtime: ViewEncapsulation
  };
  static ChangeDetectionStrategy: o.ExternalReference = {
    name: 'ChangeDetectionStrategy',
    moduleName: CORE,
    runtime: ChangeDetectionStrategy
  };
  static SecurityContext: o.ExternalReference = {
    name: 'SecurityContext',
    moduleName: CORE,
    runtime: SecurityContext,
  };
  static LOCALE_ID: o.ExternalReference = {name: 'LOCALE_ID', moduleName: CORE, runtime: LOCALE_ID};
  static TRANSLATIONS_FORMAT: o.ExternalReference = {
    name: 'TRANSLATIONS_FORMAT',
    moduleName: CORE,
    runtime: TRANSLATIONS_FORMAT
  };
  static inlineInterpolate: o.ExternalReference = {
    name: 'ɵinlineInterpolate',
    moduleName: CORE,
    runtime: ɵinlineInterpolate
  };
  static interpolate:
      o.ExternalReference = {name: 'ɵinterpolate', moduleName: CORE, runtime: ɵinterpolate};
  static EMPTY_ARRAY:
      o.ExternalReference = {name: 'ɵEMPTY_ARRAY', moduleName: CORE, runtime: ɵEMPTY_ARRAY};
  static EMPTY_MAP:
      o.ExternalReference = {name: 'ɵEMPTY_MAP', moduleName: CORE, runtime: ɵEMPTY_MAP};
  static Renderer: o.ExternalReference = {name: 'Renderer', moduleName: CORE, runtime: Renderer};
  static viewDef: o.ExternalReference = {name: 'ɵvid', moduleName: CORE, runtime: ɵvid};
  static elementDef: o.ExternalReference = {name: 'ɵeld', moduleName: CORE, runtime: ɵeld};
  static anchorDef: o.ExternalReference = {name: 'ɵand', moduleName: CORE, runtime: ɵand};
  static textDef: o.ExternalReference = {name: 'ɵted', moduleName: CORE, runtime: ɵted};
  static directiveDef: o.ExternalReference = {name: 'ɵdid', moduleName: CORE, runtime: ɵdid};
  static providerDef: o.ExternalReference = {name: 'ɵprd', moduleName: CORE, runtime: ɵprd};
  static queryDef: o.ExternalReference = {name: 'ɵqud', moduleName: CORE, runtime: ɵqud};
  static pureArrayDef: o.ExternalReference = {name: 'ɵpad', moduleName: CORE, runtime: ɵpad};
  static pureObjectDef: o.ExternalReference = {name: 'ɵpod', moduleName: CORE, runtime: ɵpod};
  static purePipeDef: o.ExternalReference = {name: 'ɵppd', moduleName: CORE, runtime: ɵppd};
  static pipeDef: o.ExternalReference = {name: 'ɵpid', moduleName: CORE, runtime: ɵpid};
  static nodeValue: o.ExternalReference = {name: 'ɵnov', moduleName: CORE, runtime: ɵnov};
  static ngContentDef: o.ExternalReference = {name: 'ɵncd', moduleName: CORE, runtime: ɵncd};
  static unwrapValue: o.ExternalReference = {name: 'ɵunv', moduleName: CORE, runtime: ɵunv};
  static createRendererType2: o.ExternalReference = {name: 'ɵcrt', moduleName: CORE, runtime: ɵcrt};
  static RendererType2: o.ExternalReference = {
    name: 'RendererType2',
    moduleName: CORE,
    // type only
    runtime: null
  };
  static ViewDefinition: o.ExternalReference = {
    name: 'ɵViewDefinition',
    moduleName: CORE,
    // type only
    runtime: null
  };
  static createComponentFactory:
      o.ExternalReference = {name: 'ɵccf', moduleName: CORE, runtime: ɵccf};
}

export function createTokenForReference(reference: any): CompileTokenMetadata {
  return {identifier: {reference: reference}};
}

export function createTokenForExternalReference(
    reflector: CompileReflector, reference: o.ExternalReference): CompileTokenMetadata {
  return createTokenForReference(reflector.resolveExternalReference(reference));
}
