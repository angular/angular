/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


/**
 * A set of interfaces which are shared between `@angular/core` and `@angular/compiler` to allow
 * for late binding of `@angular/compiler` for JIT purposes.
 *
 * This file has two copies. Please ensure that they are in sync:
 *  - packages/compiler/src/compiler_facade_interface.ts             (master)
 *  - packages/core/src/render3/jit/compiler_facade_interface.ts     (copy)
 *
 * Please ensure that the two files are in sync using this command:
 * ```
 * cp packages/compiler/src/compiler_facade_interface.ts \
 *    packages/core/src/render3/jit/compiler_facade_interface.ts
 * ```
 */

export interface ExportedCompilerFacade { ɵcompilerFacade: CompilerFacade; }

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
  compileBase(angularCoreEnv: CoreEnvironment, sourceMapUrl: string, meta: R3BaseMetadataFacade):
      any;

  createParseSourceSpan(kind: string, typeName: string, sourceUrl: string): ParseSourceSpan;

  R3ResolvedDependencyType: typeof R3ResolvedDependencyType;
  ResourceLoader: {new (): ResourceLoader};
}

export interface CoreEnvironment { [name: string]: Function; }

export type ResourceLoader = {
  get(url: string): Promise<string>| string;
};

export type StringMap = {
  [key: string]: string;
};

export type StringMapWithRename = {
  [key: string]: string | [string, string];
};

export type Provider = any;

export enum R3ResolvedDependencyType {
  Token = 0,
  Attribute = 1,
  ChangeDetectorRef = 2,
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
  ctorDeps: R3DependencyMetadataFacade[]|null;
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
  emitInline: boolean;
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
  directives: {selector: string, expression: any}[];
  styles: string[];
  encapsulation: ViewEncapsulation;
  viewProviders: Provider[]|null;
  interpolation?: [string, string];
  changeDetection?: ChangeDetectionStrategy;
}

export interface R3BaseMetadataFacade {
  name: string;
  type: any;
  propMetadata: {[key: string]: any[]};
  inputs?: {[key: string]: string | [string, string]};
  outputs?: {[key: string]: string};
  queries?: R3QueryMetadataFacade[];
  viewQueries?: R3QueryMetadataFacade[];
}

export type ViewEncapsulation = number;

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
}
