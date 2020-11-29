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
  compileInjectable(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string, meta: R3InjectableMetadataFacade): any;
  compileInjector(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string, meta: R3InjectorMetadataFacade): any;
  compileNgModule(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string, meta: R3NgModuleMetadataFacade): any;
  compileDirective(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string, meta: R3DirectiveMetadataFacade): any;
  compileComponent(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string, meta: R3ComponentMetadataFacade): any;
  compileFactory(
      angularCoreEnv: CoreEnvironment, sourceMapUrl: string, meta: R3FactoryDefMetadataFacade): any;

  createParseSourceSpan(kind: string, typeName: string, sourceUrl: string): ParseSourceSpan;

  R3ResolvedDependencyType: typeof R3ResolvedDependencyType;
  R3FactoryTarget: typeof R3FactoryTarget;
  ResourceLoader: {new(): ResourceLoader};
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

export type Provider = any;

export enum R3ResolvedDependencyType {
  Token = 0,
  Attribute = 1,
  ChangeDetectorRef = 2,
  Invalid = 3,
}

export enum R3FactoryTarget {
  Directive = 0,
  Component = 1,
  Injectable = 2,
  Pipe = 3,
  NgModule = 4,
}

export interface R3DependencyMetadataFacade {
  token: any;
  resolved: R3ResolvedDependencyType;
  host: boolean;
  optional: boolean;
  self: boolean;
  skipSelf: boolean;
}

export interface R3PipeMetadataFacade {
  name: string;
  type: any;
  typeArgumentCount: number;
  pipeName: string;
  deps: R3DependencyMetadataFacade[]|null;
  pure: boolean;
}

export interface R3InjectableMetadataFacade {
  name: string;
  type: any;
  typeArgumentCount: number;
  providedIn: any;
  useClass?: any;
  useFactory?: any;
  useExisting?: any;
  useValue?: any;
  userDeps?: R3DependencyMetadataFacade[];
}

export interface R3NgModuleMetadataFacade {
  type: any;
  bootstrap: Function[];
  declarations: Function[];
  imports: Function[];
  exports: Function[];
  schemas: {name: string}[]|null;
  id: string|null;
}

export interface R3InjectorMetadataFacade {
  name: string;
  type: any;
  deps: R3DependencyMetadataFacade[]|null;
  providers: any[];
  imports: any[];
}

export interface R3DirectiveMetadataFacade {
  name: string;
  type: any;
  typeArgumentCount: number;
  typeSourceSpan: ParseSourceSpan;
  deps: R3DependencyMetadataFacade[]|null;
  selector: string|null;
  queries: R3QueryMetadataFacade[];
  host: {[key: string]: string};
  propMetadata: {[key: string]: any[]};
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
  animations: any[]|undefined;
  pipes: Map<string, any>;
  directives: R3UsedDirectiveMetadata[];
  styles: string[];
  encapsulation: ViewEncapsulation;
  viewProviders: Provider[]|null;
  interpolation?: [string, string];
  changeDetection?: ChangeDetectionStrategy;
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
  type: any;
  typeArgumentCount: number;
  deps: R3DependencyMetadataFacade[]|null;
  injectFn: 'directiveInject'|'inject';
  target: R3FactoryTarget;
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
  predicate: any|string[];
  descendants: boolean;
  read: any|null;
  static: boolean;
}

export interface ParseSourceSpan {
  start: any;
  end: any;
  details: any;
  fullStart: any;
}
