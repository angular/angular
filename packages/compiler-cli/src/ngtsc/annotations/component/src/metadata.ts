/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  LegacyAnimationTriggerNames,
  DeclarationListEmitMode,
  DeferBlockDepsEmitMode,
  R3ClassDebugInfo,
  R3ClassMetadata,
  R3ComponentMetadata,
  R3DeferPerBlockDependency,
  R3DeferPerComponentDependency,
  R3TemplateDependencyMetadata,
  SchemaMetadata,
  TmplAstDeferredBlock,
} from '@angular/compiler';
import ts from 'typescript';

import {Reference} from '../../../imports';
import {
  ClassPropertyMapping,
  DirectiveResources,
  DirectiveTypeCheckMeta,
  HostDirectiveMeta,
  InputMapping,
} from '../../../metadata';
import {ClassDeclaration} from '../../../reflection';
import {SubsetOfKeys} from '../../../util/src/typescript';

import {ParsedTemplateWithSource, StyleUrlMeta} from './resources';
import {HostBindingNodes} from '../../directive';

/**
 * These fields of `R3ComponentMetadata` are updated in the `resolve` phase.
 *
 * The `keyof R3ComponentMetadata &` condition ensures that only fields of `R3ComponentMetadata` can
 * be included here.
 */
export type ComponentMetadataResolvedFields = SubsetOfKeys<
  R3ComponentMetadata<R3TemplateDependencyMetadata>,
  'declarations' | 'declarationListEmitMode' | 'defer' | 'hasDirectiveDependencies'
>;

export interface ComponentAnalysisData {
  /**
   * `meta` includes those fields of `R3ComponentMetadata` which are calculated at `analyze` time
   * (not during resolve).
   */
  meta: Omit<R3ComponentMetadata<R3TemplateDependencyMetadata>, ComponentMetadataResolvedFields>;
  baseClass: Reference<ClassDeclaration> | 'dynamic' | null;
  typeCheckMeta: DirectiveTypeCheckMeta;
  template: ParsedTemplateWithSource;
  classMetadata: R3ClassMetadata | null;
  classDebugInfo: R3ClassDebugInfo | null;

  inputs: ClassPropertyMapping<InputMapping>;
  inputFieldNamesFromMetadataArray: Set<string>;

  outputs: ClassPropertyMapping;

  /**
   * Providers extracted from the `providers` field of the component annotation which will require
   * an Angular factory definition at runtime.
   */
  providersRequiringFactory: Set<Reference<ClassDeclaration>> | null;

  /**
   * Providers extracted from the `viewProviders` field of the component annotation which will
   * require an Angular factory definition at runtime.
   */
  viewProvidersRequiringFactory: Set<Reference<ClassDeclaration>> | null;

  resources: DirectiveResources;

  /**
   * `styleUrls` extracted from the decorator, if present.
   */
  styleUrls: StyleUrlMeta[] | null;

  /**
   * Inline stylesheets extracted from the decorator, if present.
   */
  inlineStyles: string[] | null;

  isPoisoned: boolean;
  legacyAnimationTriggerNames: LegacyAnimationTriggerNames | null;

  rawImports: ts.Expression | null;
  resolvedImports: Reference<ClassDeclaration>[] | null;
  rawDeferredImports: ts.Expression | null;
  resolvedDeferredImports: Reference<ClassDeclaration>[] | null;

  /**
   * Map of symbol name -> import path for types from `@Component.deferredImports` field.
   */
  explicitlyDeferredTypes: R3DeferPerComponentDependency[] | null;

  schemas: SchemaMetadata[] | null;

  decorator: ts.Decorator | null;

  /** Additional directives applied to the component host. */
  hostDirectives: HostDirectiveMeta[] | null;

  /** Raw expression that defined the host directives array. Used for diagnostics. */
  rawHostDirectives: ts.Expression | null;

  /** Raw nodes representing the host bindings of the directive. */
  hostBindingNodes: HostBindingNodes;

  /** Whether selectorless is enabled for the specific component. */
  selectorlessEnabled: boolean;

  /**
   * Names of the symbols within the source file that are referenced directly inside the template.
   * Used to reduce the amount of lookups when determining which dependencies to expose.
   */
  localReferencedSymbols: Set<string> | null;
}

export interface ComponentResolutionData {
  declarations: R3TemplateDependencyMetadata[];
  declarationListEmitMode: DeclarationListEmitMode;

  /**
   * Map of all types that can be defer loaded (ts.ClassDeclaration) ->
   * corresponding import declaration (ts.ImportDeclaration) within
   * the current source file.
   */
  deferrableDeclToImportDecl: Map<ClassDeclaration, ts.ImportDeclaration>;

  /**
   * Map of `@defer` blocks -> their corresponding dependencies.
   * Required to compile the defer resolver function in `PerBlock` mode.
   */
  deferPerBlockDependencies: Map<TmplAstDeferredBlock, DeferredComponentDependency[]>;

  /**
   * Defines how dynamic imports for deferred dependencies should be grouped:
   *  - either in a function on per-component basis (in case of local compilation)
   *  - or in a function on per-block basis (in full compilation mode)
   */
  deferBlockDepsEmitMode: DeferBlockDepsEmitMode;

  /**
   * List of deferrable dependencies in the entire component. Used to compile the
   * defer resolver function in `PerComponent` mode.
   */
  deferPerComponentDependencies: R3DeferPerComponentDependency[];

  /** Whether the component is standalone and has any directly-imported directive dependencies. */
  hasDirectiveDependencies: boolean;
}

/**
 * Describes a dependency used within a `@defer` block.
 */
export type DeferredComponentDependency = R3DeferPerBlockDependency & {
  /** Reference to the declaration that defines the dependency. */
  declaration: Reference<ClassDeclaration>;
};
