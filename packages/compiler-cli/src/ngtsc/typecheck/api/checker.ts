/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, ParseError, TmplAstNode, TmplAstTemplate} from '@angular/compiler';
import * as ts from 'typescript';

import {FullTemplateMapping} from './api';
import {GlobalCompletion} from './completion';
import {DirectiveInScope, PipeInScope} from './scope';
import {ShimLocation, Symbol} from './symbols';

/**
 * Interface to the Angular Template Type Checker to extract diagnostics and intelligence from the
 * compiler's understanding of component templates.
 *
 * This interface is analogous to TypeScript's own `ts.TypeChecker` API.
 *
 * In general, this interface supports two kinds of operations:
 *  - updating Type Check Blocks (TCB)s that capture the template in the form of TypeScript code
 *  - querying information about available TCBs, including diagnostics
 *
 * Once a TCB is available, information about it can be queried. If no TCB is available to answer a
 * query, depending on the method either `null` will be returned or an error will be thrown.
 */
export interface TemplateTypeChecker {
  /**
   * Clear all overrides and return the template type-checker to the original input program state.
   */
  resetOverrides(): void;

  /**
   * Retrieve the template in use for the given component.
   *
   * If the template has been overridden via `overrideComponentTemplate`, this will retrieve the
   * overridden template nodes.
   */
  getTemplate(component: ts.ClassDeclaration): TmplAstNode[]|null;

  /**
   * Provide a new template string that will be used in place of the user-defined template when
   * checking or operating on the given component.
   *
   * The compiler will parse this template for diagnostics, and will return any parsing errors if it
   * is not valid. If the template cannot be parsed correctly, no override will occur.
   */
  overrideComponentTemplate(component: ts.ClassDeclaration, template: string):
      {nodes: TmplAstNode[], errors?: ParseError[]};

  /**
   * Get all `ts.Diagnostic`s currently available for the given `ts.SourceFile`.
   *
   * This method will fail (throw) if there are components within the `ts.SourceFile` that do not
   * have TCBs available.
   *
   * Generating a template type-checking program is expensive, and in some workflows (e.g. checking
   * an entire program before emit), it should ideally only be done once. The `optimizeFor` flag
   * allows the caller to hint to `getDiagnosticsForFile` (which internally will create a template
   * type-checking program if needed) whether the caller is interested in just the results of the
   * single file, or whether they plan to query about other files in the program. Based on this
   * flag, `getDiagnosticsForFile` will determine how much of the user's program to prepare for
   * checking as part of the template type-checking program it creates.
   */
  getDiagnosticsForFile(sf: ts.SourceFile, optimizeFor: OptimizeFor): ts.Diagnostic[];

  /**
   * Given a `shim` and position within the file, returns information for mapping back to a template
   * location.
   */
  getTemplateMappingAtShimLocation(shimLocation: ShimLocation): FullTemplateMapping|null;

  /**
   * Get all `ts.Diagnostic`s currently available that pertain to the given component.
   *
   * This method always runs in `OptimizeFor.SingleFile` mode.
   */
  getDiagnosticsForComponent(component: ts.ClassDeclaration): ts.Diagnostic[];

  /**
   * Retrieve the top-level node representing the TCB for the given component.
   *
   * This can return `null` if there is no TCB available for the component.
   *
   * This method always runs in `OptimizeFor.SingleFile` mode.
   */
  getTypeCheckBlock(component: ts.ClassDeclaration): ts.Node|null;

  /**
   * Retrieves a `Symbol` for the node in a component's template.
   *
   * This method can return `null` if a valid `Symbol` cannot be determined for the node.
   *
   * @see Symbol
   */
  getSymbolOfNode(node: AST|TmplAstNode, component: ts.ClassDeclaration): Symbol|null;

  /**
   * Get "global" `Completion`s in the given context.
   *
   * Global completions are completions in the global context, as opposed to completions within an
   * existing expression. For example, completing inside a new interpolation expression (`{{|}}`) or
   * inside a new property binding `[input]="|" should retrieve global completions, which will
   * include completions from the template's context component, as well as any local references or
   * template variables which are in scope for that expression.
   */
  getGlobalCompletions(context: TmplAstTemplate|null, component: ts.ClassDeclaration):
      GlobalCompletion|null;

  /**
   * Get basic metadata on the directives which are in scope for the given component.
   */
  getDirectivesInScope(component: ts.ClassDeclaration): DirectiveInScope[]|null;

  /**
   * Get basic metadata on the pipes which are in scope for the given component.
   */
  getPipesInScope(component: ts.ClassDeclaration): PipeInScope[]|null;
}

/**
 * Describes the scope of the caller's interest in template type-checking results.
 */
export enum OptimizeFor {
  /**
   * Indicates that a consumer of a `TemplateTypeChecker` is only interested in results for a given
   * file, and wants them as fast as possible.
   *
   * Calling `TemplateTypeChecker` methods successively for multiple files while specifying
   * `OptimizeFor.SingleFile` can result in significant unnecessary overhead overall.
   */
  SingleFile,

  /**
   * Indicates that a consumer of a `TemplateTypeChecker` intends to query for results pertaining to
   * the entire user program, and so the type-checker should internally optimize for this case.
   *
   * Initial calls to retrieve type-checking information may take longer, but repeated calls to
   * gather information for the whole user program will be significantly faster with this mode of
   * optimization.
   */
  WholeProgram,
}
