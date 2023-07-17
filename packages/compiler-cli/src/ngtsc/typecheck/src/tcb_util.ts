/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteSourceSpan, ParseSourceSpan} from '@angular/compiler';
import ts from 'typescript';

import {ClassDeclaration, ReflectionHost} from '../../../../src/ngtsc/reflection';
import {Reference} from '../../imports';
import {getTokenAtPosition} from '../../util/src/typescript';
import {FullTemplateMapping, SourceLocation, TemplateId, TemplateSourceMapping} from '../api';

import {hasIgnoreForDiagnosticsMarker, readSpanComment} from './comments';
import {TypeParameterEmitter} from './type_parameter_emitter';

/**
 * Represents the origin environment from where reference will be emitted. This interface exists
 * as an indirection for the `Environment` type, which would otherwise introduce a (type-only)
 * import cycle.
 */
export interface ReferenceEmitEnvironment {
  canReferenceType(ref: Reference): boolean;
}

/**
 * Adapter interface which allows the template type-checking diagnostics code to interpret offsets
 * in a TCB and map them back to original locations in the template.
 */
export interface TemplateSourceResolver {
  getTemplateId(node: ts.ClassDeclaration): TemplateId;

  /**
   * For the given template id, retrieve the original source mapping which describes how the offsets
   * in the template should be interpreted.
   */
  getSourceMapping(id: TemplateId): TemplateSourceMapping;

  /**
   * Convert an absolute source span associated with the given template id into a full
   * `ParseSourceSpan`. The returned parse span has line and column numbers in addition to only
   * absolute offsets and gives access to the original template source.
   */
  toParseSourceSpan(id: TemplateId, span: AbsoluteSourceSpan): ParseSourceSpan|null;
}

/**
 * Indicates whether a particular component requires an inline type check block.
 *
 * This is not a boolean state as inlining might only be required to get the best possible
 * type-checking, but the component could theoretically still be checked without it.
 */
export enum TcbInliningRequirement {
  /**
   * There is no way to type check this component without inlining.
   */
  MustInline,

  /**
   * Inlining should be used due to the component's generic bounds, but a non-inlining fallback
   * method can be used if that's not possible.
   */
  ShouldInlineForGenericBounds,

  /**
   * There is no requirement for this component's TCB to be inlined.
   */
  None,
}

export function requiresInlineTypeCheckBlock(
    ref: Reference<ClassDeclaration<ts.ClassDeclaration>>, env: ReferenceEmitEnvironment,
    usedPipes: Reference<ClassDeclaration<ts.ClassDeclaration>>[],
    reflector: ReflectionHost): TcbInliningRequirement {
  // In order to qualify for a declared TCB (not inline) two conditions must be met:
  // 1) the class must be suitable to be referenced from `env` (e.g. it must be exported)
  // 2) it must not have contextual generic type bounds
  if (!env.canReferenceType(ref)) {
    // Condition 1 is false, the class is not exported.
    return TcbInliningRequirement.MustInline;
  } else if (!checkIfGenericTypeBoundsCanBeEmitted(ref.node, reflector, env)) {
    // Condition 2 is false, the class has constrained generic types. It should be checked with an
    // inline TCB if possible, but can potentially use fallbacks to avoid inlining if not.
    return TcbInliningRequirement.ShouldInlineForGenericBounds;
  } else if (usedPipes.some(pipeRef => !env.canReferenceType(pipeRef))) {
    // If one of the pipes used by the component is not exported, a non-inline TCB will not be able
    // to import it, so this requires an inline TCB.
    return TcbInliningRequirement.MustInline;
  } else {
    return TcbInliningRequirement.None;
  }
}

/** Maps a shim position back to a template location. */
export function getTemplateMapping(
    shimSf: ts.SourceFile, position: number, resolver: TemplateSourceResolver,
    isDiagnosticRequest: boolean): FullTemplateMapping|null {
  const node = getTokenAtPosition(shimSf, position);
  const sourceLocation = findSourceLocation(node, shimSf, isDiagnosticRequest);
  if (sourceLocation === null) {
    return null;
  }

  const mapping = resolver.getSourceMapping(sourceLocation.id);
  const span = resolver.toParseSourceSpan(sourceLocation.id, sourceLocation.span);
  if (span === null) {
    return null;
  }
  // TODO(atscott): Consider adding a context span by walking up from `node` until we get a
  // different span.
  return {sourceLocation, templateSourceMapping: mapping, span};
}

export function findTypeCheckBlock(
    file: ts.SourceFile, id: TemplateId, isDiagnosticRequest: boolean): ts.Node|null {
  for (const stmt of file.statements) {
    if (ts.isFunctionDeclaration(stmt) && getTemplateId(stmt, file, isDiagnosticRequest) === id) {
      return stmt;
    }
  }
  return null;
}

/**
 * Traverses up the AST starting from the given node to extract the source location from comments
 * that have been emitted into the TCB. If the node does not exist within a TCB, or if an ignore
 * marker comment is found up the tree (and this is part of a diagnostic request), this function
 * returns null.
 */
export function findSourceLocation(
    node: ts.Node, sourceFile: ts.SourceFile, isDiagnosticsRequest: boolean): SourceLocation|null {
  // Search for comments until the TCB's function declaration is encountered.
  while (node !== undefined && !ts.isFunctionDeclaration(node)) {
    if (hasIgnoreForDiagnosticsMarker(node, sourceFile) && isDiagnosticsRequest) {
      // There's an ignore marker on this node, so the diagnostic should not be reported.
      return null;
    }

    const span = readSpanComment(node, sourceFile);
    if (span !== null) {
      // Once the positional information has been extracted, search further up the TCB to extract
      // the unique id that is attached with the TCB's function declaration.
      const id = getTemplateId(node, sourceFile, isDiagnosticsRequest);
      if (id === null) {
        return null;
      }
      return {id, span};
    }

    node = node.parent;
  }

  return null;
}

function getTemplateId(
    node: ts.Node, sourceFile: ts.SourceFile, isDiagnosticRequest: boolean): TemplateId|null {
  // Walk up to the function declaration of the TCB, the file information is attached there.
  while (!ts.isFunctionDeclaration(node)) {
    if (hasIgnoreForDiagnosticsMarker(node, sourceFile) && isDiagnosticRequest) {
      // There's an ignore marker on this node, so the diagnostic should not be reported.
      return null;
    }
    node = node.parent;

    // Bail once we have reached the root.
    if (node === undefined) {
      return null;
    }
  }

  const start = node.getFullStart();
  return ts.forEachLeadingCommentRange(sourceFile.text, start, (pos, end, kind) => {
    if (kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
      return null;
    }
    const commentText = sourceFile.text.substring(pos + 2, end - 2);
    return commentText;
  }) as TemplateId || null;
}

export function checkIfGenericTypeBoundsCanBeEmitted(
    node: ClassDeclaration<ts.ClassDeclaration>, reflector: ReflectionHost,
    env: ReferenceEmitEnvironment): boolean {
  // Generic type parameters are considered context free if they can be emitted into any context.
  const emitter = new TypeParameterEmitter(node.typeParameters, reflector);
  return emitter.canEmit(ref => env.canReferenceType(ref));
}
