/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ANALYZE_FOR_ENTRY_COMPONENTS, ChangeDetectionStrategy, ChangeDetectorRef, ComponentFactory, ComponentFactoryResolver, ComponentRef, ElementRef, Injector, LOCALE_ID, NgModuleFactory, NgModuleRef, QueryList, Renderer, SecurityContext, TRANSLATIONS_FORMAT, TemplateRef, ViewContainerRef, ViewEncapsulation, ɵCodegenComponentFactoryResolver, ɵEMPTY_ARRAY, ɵEMPTY_MAP, ɵand, ɵccf, ɵcmf, ɵcrt, ɵdid, ɵeld, ɵinlineInterpolate, ɵinterpolate, ɵmod, ɵmpd, ɵncd, ɵnov, ɵpad, ɵpid, ɵpod, ɵppd, ɵprd, ɵqud, ɵreflector, ɵregisterModuleFactory, ɵted, ɵunv, ɵvid} from '@angular/core';

import {CompileIdentifierMetadata, CompileTokenMetadata} from './compile_metadata';

const CORE = assetUrl('core');

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
  static ElementRef: IdentifierSpec = {name: 'ElementRef', moduleUrl: CORE, runtime: ElementRef};
  static NgModuleRef: IdentifierSpec = {name: 'NgModuleRef', moduleUrl: CORE, runtime: NgModuleRef};
  static ViewContainerRef:
      IdentifierSpec = {name: 'ViewContainerRef', moduleUrl: CORE, runtime: ViewContainerRef};
  static ChangeDetectorRef:
      IdentifierSpec = {name: 'ChangeDetectorRef', moduleUrl: CORE, runtime: ChangeDetectorRef};
  static QueryList: IdentifierSpec = {name: 'QueryList', moduleUrl: CORE, runtime: QueryList};
  static TemplateRef: IdentifierSpec = {name: 'TemplateRef', moduleUrl: CORE, runtime: TemplateRef};
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
  static ComponentRef:
      IdentifierSpec = {name: 'ComponentRef', moduleUrl: CORE, runtime: ComponentRef};
  static NgModuleFactory:
      IdentifierSpec = {name: 'NgModuleFactory', moduleUrl: CORE, runtime: NgModuleFactory};
  static createModuleFactory: IdentifierSpec = {
    name: 'ɵcmf',
    moduleUrl: CORE,
    runtime: ɵcmf,
  };
  static moduleDef: IdentifierSpec = {
    name: 'ɵmod',
    moduleUrl: CORE,
    runtime: ɵmod,
  };
  static moduleProviderDef: IdentifierSpec = {
    name: 'ɵmpd',
    moduleUrl: CORE,
    runtime: ɵmpd,
  };
  static RegisterModuleFactoryFn: IdentifierSpec = {
    name: 'ɵregisterModuleFactory',
    moduleUrl: CORE,
    runtime: ɵregisterModuleFactory,
  };
  static Injector: IdentifierSpec = {name: 'Injector', moduleUrl: CORE, runtime: Injector};
  static ViewEncapsulation:
      IdentifierSpec = {name: 'ViewEncapsulation', moduleUrl: CORE, runtime: ViewEncapsulation};
  static ChangeDetectionStrategy: IdentifierSpec = {
    name: 'ChangeDetectionStrategy',
    moduleUrl: CORE,
    runtime: ChangeDetectionStrategy
  };
  static SecurityContext: IdentifierSpec = {
    name: 'SecurityContext',
    moduleUrl: CORE,
    runtime: SecurityContext,
  };
  static LOCALE_ID: IdentifierSpec = {name: 'LOCALE_ID', moduleUrl: CORE, runtime: LOCALE_ID};
  static TRANSLATIONS_FORMAT:
      IdentifierSpec = {name: 'TRANSLATIONS_FORMAT', moduleUrl: CORE, runtime: TRANSLATIONS_FORMAT};
  static inlineInterpolate:
      IdentifierSpec = {name: 'ɵinlineInterpolate', moduleUrl: CORE, runtime: ɵinlineInterpolate};
  static interpolate:
      IdentifierSpec = {name: 'ɵinterpolate', moduleUrl: CORE, runtime: ɵinterpolate};
  static EMPTY_ARRAY:
      IdentifierSpec = {name: 'ɵEMPTY_ARRAY', moduleUrl: CORE, runtime: ɵEMPTY_ARRAY};
  static EMPTY_MAP: IdentifierSpec = {name: 'ɵEMPTY_MAP', moduleUrl: CORE, runtime: ɵEMPTY_MAP};
  static Renderer: IdentifierSpec = {name: 'Renderer', moduleUrl: CORE, runtime: Renderer};
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
  static createRendererType2: IdentifierSpec = {name: 'ɵcrt', moduleUrl: CORE, runtime: ɵcrt};
  static RendererType2: IdentifierSpec = {
    name: 'RendererType2',
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

export function assetUrl(pkg: string, path: string | null = null, type: string = 'src'): string {
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
