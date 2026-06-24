/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AbsoluteSourceSpan, ParseSourceSpan, R3Identifiers} from '@angular/compiler';
import ts from 'typescript';

import {ClassDeclaration, ReflectionHost} from '../../../../src/ngtsc/reflection';
import {Reference} from '../../imports';
import {getTokenAtPosition} from '../../util/src/typescript';
import {FullSourceMapping, SourceLocation, TypeCheckId, SourceMapping} from '../api';

import {hasIgnoreForDiagnosticsMarker, readSpanComment} from './comments';
import {ReferenceEmitEnvironment} from './reference_emit_environment';
import {TypeParameterEmitter} from './type_parameter_emitter';
import {isHostBindingsBlockGuard} from './host_bindings';

/**
 * External modules/identifiers that always should exist for type check
 * block files.
 *
 * Importing the modules in preparation helps ensuring a stable import graph
 * that would not degrade TypeScript's incremental program structure re-use.
 *
 * Note: For inline type check blocks, or type constructors, we cannot add preparation
 * imports, but ideally the required modules are already imported and can be re-used
 * to not incur a structural TypeScript program re-use discarding.
 */
const TCB_FILE_IMPORT_GRAPH_PREPARE_IDENTIFIERS = [
  // Imports may be added for signal input checking. We wouldn't want to change the
  // import graph for incremental compilations when suddenly a signal input is used,
  // or removed.
  R3Identifiers.InputSignalBrandWriteType,
];

/**
 * Adapter interface which allows the directive type-checking diagnostics code to interpret offsets
 * in a TCB and map them back to their original locations.
 */
export interface TypeCheckSourceResolver {
  getTypeCheckId(node: ts.ClassDeclaration): TypeCheckId;

  /**
   * For the given type checking id, retrieve the original source mapping which describes how the
   * offsets in the template should be interpreted.
   */
  getTemplateSourceMapping(id: TypeCheckId): SourceMapping;

  /**
   * Convert an absolute source span coming from the template associated with the given type
   * checking id into a full `ParseSourceSpan`. The returned parse span has line and column
   * numbers in addition to only absolute offsets and gives access to the original source code.
   */
  toTemplateParseSourceSpan(id: TypeCheckId, span: AbsoluteSourceSpan): ParseSourceSpan | null;

  /** For the given type checking id, retrieve the source mapping of its host bindings. */
  getHostBindingsMapping(id: TypeCheckId): SourceMapping;

  /**
   * Convert an absolute source span coming from a host binding associated with the given type
   * checking id into a full `ParseSourceSpan`. The returned parse span has line and column
   * numbers in addition to only absolute offsets and gives access to the original source code.
   */
  toHostParseSourceSpan(id: TypeCheckId, span: AbsoluteSourceSpan): ParseSourceSpan | null;
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
  ref: Reference<ClassDeclaration<ts.ClassDeclaration>>,
  env: ReferenceEmitEnvironment,
  usedPipes: Reference<ClassDeclaration<ts.ClassDeclaration>>[],
  reflector: ReflectionHost,
): TcbInliningRequirement {
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
  } else if (usedPipes.some((pipeRef) => !env.canReferenceType(pipeRef))) {
    // If one of the pipes used by the component is not exported, a non-inline TCB will not be able
    // to import it, so this requires an inline TCB.
    return TcbInliningRequirement.MustInline;
  } else {
    return TcbInliningRequirement.None;
  }
}

/** Maps a shim position back to a source code location. */
export function getSourceMapping(
  shimSf: ts.SourceFile,
  position: number,
  resolver: TypeCheckSourceResolver,
  isDiagnosticRequest: boolean,
): FullSourceMapping | null {
  const node = getTokenAtPosition(shimSf, position);
  const sourceLocation = findSourceLocation(node, shimSf, isDiagnosticRequest);
  if (sourceLocation === null) {
    return null;
  }

  if (isInHostBindingTcb(node)) {
    const hostSourceMapping = resolver.getHostBindingsMapping(sourceLocation.id);
    const span = resolver.toHostParseSourceSpan(sourceLocation.id, sourceLocation.span);
    if (span === null) {
      return null;
    }
    return {sourceLocation, sourceMapping: hostSourceMapping, span};
  }

  const span = resolver.toTemplateParseSourceSpan(sourceLocation.id, sourceLocation.span);
  if (span === null) {
    return null;
  }
  // TODO(atscott): Consider adding a context span by walking up from `node` until we get a
  // different span.
  return {
    sourceLocation,
    sourceMapping: resolver.getTemplateSourceMapping(sourceLocation.id),
    span,
  };
}

function isInHostBindingTcb(node: ts.Node): boolean {
  let current = node;
  while (current && !ts.isFunctionDeclaration(current)) {
    if (isHostBindingsBlockGuard(current)) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

export function findTypeCheckBlock(
  file: ts.SourceFile,
  id: TypeCheckId,
  isDiagnosticRequest: boolean,
): ts.Node | null {
  // This prioritised-level statements using a breadth-first search
  // This is usually sufficient to find the TCB we're looking for
  for (const stmt of file.statements) {
    if (ts.isFunctionDeclaration(stmt) && getTypeCheckId(stmt, file, isDiagnosticRequest) === id) {
      return stmt;
    }
  }

  // In case the TCB we're looking for is nested (which is not common)
  // eg: when a directive is declared inside a function, as it can happen in test files
  return findNodeInFile(
    file,
    (node) =>
      ts.isFunctionDeclaration(node) && getTypeCheckId(node, file, isDiagnosticRequest) === id,
  );
}

/**
 * Traverses up the AST starting from the given node to extract the source location from comments
 * that have been emitted into the TCB. If the node does not exist within a TCB, or if an ignore
 * marker comment is found up the tree (and this is part of a diagnostic request), this function
 * returns null.
 */
export function findSourceLocation(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  isDiagnosticsRequest: boolean,
): SourceLocation | null {
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
      const id = getTypeCheckId(node, sourceFile, isDiagnosticsRequest);
      if (id === null) {
        return null;
      }
      return {id, span};
    }

    node = node.parent;
  }

  return null;
}

function getTypeCheckId(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  isDiagnosticRequest: boolean,
): TypeCheckId | null {
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
  return (
    (ts.forEachLeadingCommentRange(sourceFile.text, start, (pos, end, kind) => {
      if (kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
        return null;
      }
      const commentText = sourceFile.text.substring(pos + 2, end - 2);
      return commentText;
    }) as TypeCheckId) || null
  );
}

/**
 * Ensure imports for certain external modules that should always
 * exist are generated. These are ensured to exist to avoid frequent
 * import graph changes whenever e.g. a signal input is introduced in user code.
 */
export function ensureTypeCheckFilePreparationImports(env: ReferenceEmitEnvironment): void {
  for (const identifier of TCB_FILE_IMPORT_GRAPH_PREPARE_IDENTIFIERS) {
    env.importManager.addImport({
      exportModuleSpecifier: identifier.moduleName,
      exportSymbolName: identifier.name,
      requestedFile: env.contextFile,
    });
  }
}

export function checkIfGenericTypeBoundsCanBeEmitted(
  node: ClassDeclaration<ts.ClassDeclaration>,
  reflector: ReflectionHost,
  env: ReferenceEmitEnvironment,
): boolean {
  // Generic type parameters are considered context free if they can be emitted into any context.
  const emitter = new TypeParameterEmitter(node.typeParameters, reflector);
  return emitter.canEmit((ref) => env.canReferenceType(ref));
}

export function findNodeInFile<T extends ts.Node>(
  file: ts.SourceFile,
  predicate: (node: ts.Node) => node is T,
): T | null;
export function findNodeInFile(
  file: ts.SourceFile,
  predicate: (node: ts.Node) => boolean,
): ts.Node | null;
export function findNodeInFile(
  file: ts.SourceFile,
  predicate: (node: ts.Node) => boolean,
): ts.Node | null {
  const visit = (node: ts.Node): ts.Node | null => {
    if (predicate(node)) {
      return node;
    }
    return ts.forEachChild(node, visit) ?? null;
  };
  return ts.forEachChild(file, visit) ?? null;
}
