/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ParseError,
  ParseSourceFile,
  R3TargetBinder,
  SchemaMetadata,
  TmplAstHostElement,
  TmplAstNode,
} from '@angular/compiler';
import ts from 'typescript';

import {Reference} from '../../imports';
import {DirectiveMeta, PipeMeta} from '../../metadata';
import {ClassDeclaration} from '../../reflection';

import {SourceMapping, TypeCheckableDirectiveMeta} from './api';

/** Contextuable data for type checking the template of a component. */
export interface TemplateContext {
  /** AST nodes representing the template. */
  nodes: TmplAstNode[];

  /** Describes the origin of the template text. Used for mapping errors back. */
  sourceMapping: SourceMapping;

  /** `ParseSourceFile` associated with the template. */
  file: ParseSourceFile;

  /** Errors produced while parsing the template. */
  parseErrors: ParseError[] | null;

  /** Pipes available within the template. */
  pipes: Map<string, PipeMeta>;

  /** Whether the template preserves whitespaces. */
  preserveWhitespaces: boolean;
}

/** Contextual data for type checking the host bindings of a directive. */
export interface HostBindingsContext {
  /** AST node representing the host element of the directive. */
  node: TmplAstHostElement;

  /** Directives present on the host element. */
  directives: DirectiveMeta[];

  /** Describes the source of the host bindings. Used for mapping errors back. */
  sourceMapping: SourceMapping;
}

/**
 * Describes the type of `read` option used in a view query.
 * - `none`: No `read` option specified.
 * - `templateRef`: `read: TemplateRef`
 * - `elementRef`: `read: ElementRef`
 * - `viewContainerRef`: `read: ViewContainerRef`
 * - `directive`: `read: SomeDirective` or `read: SomeComponent`
 * - `unknown`: `read` is set to something we can't statically analyze.
 */
export type QueryReadType =
  | {kind: 'none'}
  | {kind: 'templateRef'}
  | {kind: 'elementRef'}
  | {kind: 'viewContainerRef'}
  | {kind: 'directive'; name: string}
  | {kind: 'unknown'};

/**
 * Metadata about a view query that should be validated against the component's template.
 */
export interface ViewQueryCheckMeta {
  /** Property name on the component class. */
  propertyName: string;
  /** String predicates (e.g. template reference variable names), or null for type predicates. */
  stringPredicates: string[] | null;
  /** Whether the query was declared as required (e.g. `viewChild.required('foo')`). */
  isRequired: boolean;
  /** Whether the query uses `static: true`. */
  isStatic: boolean;
  /** Whether this is a single query (viewChild/contentChild) or multi query (viewChildren/contentChildren). */
  first: boolean;
  /** Whether the query has `read: TemplateRef` option. */
  readIsTemplateRef: boolean;
  /** Detailed type information about the `read` option. */
  readType: QueryReadType;
}

/**
 * A currently pending type checking operation, into which templates for type-checking can be
 * registered.
 */
export interface TypeCheckContext {
  /**
   * Register a directive to be potentially be type-checked.
   *
   * Directives registered via `addDIrective` are available for checking, but might be skipped if
   * checking of that class is not required. This can happen for a few reasons, including if it was
   * previously checked and the prior results are still valid.
   *
   * @param ref a `Reference` to the directive class which yielded this template.
   * @param binder an `R3TargetBinder` which encapsulates the scope of this template, including all
   * available directives.
   * @param schemas Schemas that will apply when checking the directive.
   * @param templateContext Contextual information necessary for checking the template.
   * Only relevant for component classes.
   * @param hostBindingContext Contextual information necessary for checking the host bindings of
   * a directive.
   * @param isStandalone a boolean indicating whether the directive is standalone.
   * @param viewQueries Optional metadata about view queries to validate against the template.
   */
  addDirective(
    ref: Reference<ClassDeclaration<ts.ClassDeclaration>>,
    binder: R3TargetBinder<TypeCheckableDirectiveMeta>,
    schemas: SchemaMetadata[],
    templateContext: TemplateContext | null,
    hostBindingContext: HostBindingsContext | null,
    isStandalone: boolean,
    viewQueries?: ViewQueryCheckMeta[],
  ): void;
}

/**
 * Interface to trigger generation of type-checking code for a program given a new
 * `TypeCheckContext`.
 */
export interface ProgramTypeCheckAdapter {
  typeCheck(sf: ts.SourceFile, ctx: TypeCheckContext): void;
}
