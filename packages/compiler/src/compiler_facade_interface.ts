/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


/**
 * A set of interfaces which are shared between `@angular/core` and `@angular/compiler` to allow
 * for late binding of `@angular/compiler` for JIT purposes.
 *
 * This file has two copies. Please ensure that they are in sync:
 *  - packages/compiler/src/compiler_facade_interface.ts          (main)
 *  - packages/core/src/compiler/compiler_facade_interface.ts     (replica)
 *
 * Please ensure that the two files are in sync using this command:
 * ```
 * cp packages/compiler/src/compiler_facade_interface.ts \
 *    packages/core/src/compiler/compiler_facade_interface.ts
 * ```
 */

export interface ExportedCompilerFacade {
  ɵcompilerFacade: CompilerFacade;
}

export interface CompilerFacade {
  compilePipe(angularCoreEnv: CoreEnvironment, sourceMapUrl: string, meta: R3PipeMetadataFacade):
      any;
  compilePipeDeclaration(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string, declaration: R3DeclarePipeFacade): any;
  compileInjectable(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string, meta: R3InjectableMetadataFacade): any;
  compileInjectableDeclaration(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string, meta: R3DeclareInjectableFacade): any;
  compileInjector(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string, meta: R3InjectorMetadataFacade): any;
  compileInjectorDeclaration(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string,
      declaration: R3DeclareInjectorFacade): any;
  compileNgModule(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string, meta: R3NgModuleMetadataFacade): any;
  compileNgModuleDeclaration(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string,
      declaration: R3DeclareNgModuleFacade): any;
  compileDirective(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string, meta: R3DirectiveMetadataFacade): any;
  compileDirectiveDeclaration(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string,
      declaration: R3DeclareDirectiveFacade): any;
  compileComponent(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string, meta: R3ComponentMetadataFacade): any;
  compileComponentDeclaration(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string,
      declaration: R3DeclareComponentFacade): any;
  compileFactory(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string, meta: R3FactoryDefMetadataFacade): any;
  compileFactoryDeclaration(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string, meta: R3DeclareFactoryFacade): any;

  createParseSourceSpan(kind: string, typeName: string, sourceUrl: string): ParseSourceSpan;

  FactoryTarget: typeof FactoryTarget;
  // Note that we do not use `{new(): ResourceLoader}` here because
  // the resource loader class is abstract and not constructable.
  ResourceLoader: Function&{prototype: ResourceLoader};
}

export interface CoreEnvironment {
  [name: string]: Function;
}

export type ResourceLoader = {
  get(url: string): Promise<string>|string;
};

export type StringMap = {
  [key: string]: string;
};

export type StringMapWithRename = {
  [key: string]: string|[string, string];
};

export type Provider = unknown;
export type Type = Function;
export type OpaqueValue = unknown;

export enum FactoryTarget {
  Directive = 0,
  Component = 1,
  Injectable = 2,
  Pipe = 3,
  NgModule = 4,
}

export interface R3DependencyMetadataFacade {
  token: OpaqueValue;
  attribute: string|null;
  host: boolean;
  optional: boolean;
  self: boolean;
  skipSelf: boolean;
}

export interface R3DeclareDependencyMetadataFacade {
  token: OpaqueValue;
  attribute?: boolean;
  host?: boolean;
  optional?: boolean;
  self?: boolean;
  skipSelf?: boolean;
}

export interface R3PipeMetadataFacade {
  name: string;
  type: Type;
  pipeName: string;
  pure: boolean;
}

export interface R3InjectableMetadataFacade {
  name: string;
  type: Type;
  typeArgumentCount: number;
  providedIn?: Type|'root'|'platform'|'any'|null;
  useClass?: OpaqueValue;
  useFactory?: OpaqueValue;
  useExisting?: OpaqueValue;
  useValue?: OpaqueValue;
  deps?: R3DependencyMetadataFacade[];
}

export interface R3NgModuleMetadataFacade {
  type: Type;
  bootstrap: Function[];
  declarations: Function[];
  imports: Function[];
  exports: Function[];
  schemas: {name: string}[]|null;
  id: string|null;
}

export interface R3InjectorMetadataFacade {
  name: string;
  type: Type;
  providers: Provider[];
  imports: OpaqueValue[];
}

export interface R3DirectiveMetadataFacade {
  name: string;
  type: Type;
  typeSourceSpan: ParseSourceSpan;
  selector: string|null;
  queries: R3QueryMetadataFacade[];
  host: {[key: string]: string};
  propMetadata: {[key: string]: OpaqueValue[]};
  lifecycle: {usesOnChanges: boolean;};
  inputs: string[];
  outputs: string[];
  usesInheritance: boolean;
  exportAs: string[]|null;
  providers: Provider[]|null;
  viewQueries: R3QueryMetadataFacade[];
}

export interface R3ComponentMetadataFacade extends R3DirectiveMetadataFacade {
  template: string;
  preserveWhitespaces: boolean;
  animations: OpaqueValue[]|undefined;
  pipes: Map<string, any>;
  directives: R3UsedDirectiveMetadata[];
  styles: string[];
  encapsulation: ViewEncapsulation;
  viewProviders: Provider[]|null;
  interpolation?: [string, string];
  changeDetection?: ChangeDetectionStrategy;
}

export interface R3DeclareDirectiveFacade {
  selector?: string;
  type: Type;
  inputs?: {[classPropertyName: string]: string|[string, string]};
  outputs?: {[classPropertyName: string]: string};
  host?: {
    attributes?: {[key: string]: OpaqueValue};
    listeners?: {[key: string]: string};
    properties?: {[key: string]: string};
    classAttribute?: string;
    styleAttribute?: string;
  };
  queries?: R3DeclareQueryMetadataFacade[];
  viewQueries?: R3DeclareQueryMetadataFacade[];
  providers?: OpaqueValue;
  exportAs?: string[];
  usesInheritance?: boolean;
  usesOnChanges?: boolean;
}

export interface R3DeclareComponentFacade extends R3DeclareDirectiveFacade {
  template: string;
  isInline?: boolean;
  styles?: string[];
  components?: R3DeclareUsedDirectiveFacade[];
  directives?: R3DeclareUsedDirectiveFacade[];
  pipes?: {[pipeName: string]: OpaqueValue|(() => OpaqueValue)};
  viewProviders?: OpaqueValue;
  animations?: OpaqueValue;
  changeDetection?: ChangeDetectionStrategy;
  encapsulation?: ViewEncapsulation;
  interpolation?: [string, string];
  preserveWhitespaces?: boolean;
}

export interface R3DeclareUsedDirectiveFacade {
  selector: string;
  type: OpaqueValue|(() => OpaqueValue);
  inputs?: string[];
  outputs?: string[];
  exportAs?: string[];
}

export interface R3UsedDirectiveMetadata {
  selector: string;
  inputs: string[];
  outputs: string[];
  exportAs: string[]|null;
  type: any;
}

export interface R3FactoryDefMetadataFacade {
  name: string;
  type: Type;
  typeArgumentCount: number;
  deps: R3DependencyMetadataFacade[]|null;
  target: FactoryTarget;
}

export interface R3DeclareFactoryFacade {
  type: Type;
  deps: R3DeclareDependencyMetadataFacade[]|null;
  target: FactoryTarget;
}

export interface R3DeclareInjectableFacade {
  type: Type;
  providedIn?: Type|'root'|'platform'|'any'|null;
  useClass?: OpaqueValue;
  useFactory?: OpaqueValue;
  useExisting?: OpaqueValue;
  useValue?: OpaqueValue;
  deps?: R3DeclareDependencyMetadataFacade[];
}

export enum ViewEncapsulation {
  Emulated = 0,
  // Historically the 1 value was for `Native` encapsulation which has been removed as of v11.
  None = 2,
  ShadowDom = 3
}

export type ChangeDetectionStrategy = number;

export interface R3QueryMetadataFacade {
  propertyName: string;
  first: boolean;
  predicate: OpaqueValue|string[];
  descendants: boolean;
  emitDistinctChangesOnly: boolean;
  read: OpaqueValue|null;
  static: boolean;
}

export interface R3DeclareQueryMetadataFacade {
  propertyName: string;
  first?: boolean;
  predicate: OpaqueValue|string[];
  descendants?: boolean;
  read?: OpaqueValue;
  static?: boolean;
  emitDistinctChangesOnly?: boolean;
}

export interface R3DeclareInjectorFacade {
  type: Type;
  imports?: OpaqueValue[];
  providers?: OpaqueValue[];
}

export interface R3DeclareNgModuleFacade {
  type: Type;
  bootstrap?: OpaqueValue[]|(() => OpaqueValue[]);
  declarations?: OpaqueValue[]|(() => OpaqueValue[]);
  imports?: OpaqueValue[]|(() => OpaqueValue[]);
  exports?: OpaqueValue[]|(() => OpaqueValue[]);
  schemas?: OpaqueValue[];
  id?: OpaqueValue;
}

export interface R3DeclarePipeFacade {
  type: Type;
  name: string;
  pure?: boolean;
}

export interface ParseSourceSpan {
  start: any;
  end: any;
  details: any;
  fullStart: any;
}
