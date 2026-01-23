/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import assert from 'assert';
import ts from 'typescript';
import {isNodeDescendantOf} from './is_descendant_of';

/** Symbol that can be used to mark a variable as reserved, synthetically. */
export const ReservedMarker: unique symbol = Symbol();

// typescript/stable/src/compiler/types.ts;l=967;rcl=651008033
export interface LocalsContainer extends ts.Node {
  locals?: Map<string, ts.Symbol | typeof ReservedMarker>;
  nextContainer?: LocalsContainer;
}

/**
 * Gets whether the given identifier name is free for use in the
 * given location, avoiding shadowed variable names.
 *
 */
export function isIdentifierFreeInScope(
  name: string,
  location: ts.Node,
): null | {container: LocalsContainer} {
  const startContainer = findClosestParentLocalsContainer(location);
  assert(startContainer !== undefined, 'Expecting a locals container.');

  // Traverse up and check for potential collisions.
  let container: LocalsContainer | undefined = startContainer;
  let firstNextContainer: LocalsContainer | undefined = undefined;

  while (container !== undefined) {
    if (!isIdentifierFreeInContainer(name, container)) {
      return null;
    }
    if (firstNextContainer === undefined && container.nextContainer !== undefined) {
      firstNextContainer = container.nextContainer;
    }
    container = findClosestParentLocalsContainer(container.parent);
  }

  // Check descendent local containers to avoid shadowing variables.
  // Note that this is not strictly needed, but it's helping avoid
  // some lint errors, like TSLint's no shadowed variables.
  container = firstNextContainer;
  while (container && isNodeDescendantOf(container, startContainer)) {
    if (!isIdentifierFreeInContainer(name, container)) {
      return null;
    }
    container = container.nextContainer;
  }

  return {container: startContainer};
}

/** Finds the closest parent locals container. */
function findClosestParentLocalsContainer(node: ts.Node): LocalsContainer | undefined {
  return ts.findAncestor(node, isLocalsContainer);
}

/** Whether the given identifier is free in the given locals container. */
function isIdentifierFreeInContainer(name: string, container: LocalsContainer): boolean {
  if (container.locals === undefined || !container.locals.has(name)) {
    return true;
  }

  // We consider alias symbols as locals conservatively.
  // Note: This check is similar to the check by the TypeScript emitter.
  // typescript/stable/src/compiler/emitter.ts;l=5436;rcl=651008033
  const local = container.locals.get(name)!;
  return (
    local !== ReservedMarker &&
    !(local.flags & (ts.SymbolFlags.Value | ts.SymbolFlags.ExportValue | ts.SymbolFlags.Alias))
  );
}

/**
 * Whether the given node can contain local variables.
 *
 * Note: This is similar to TypeScript's `canHaveLocals` internal helper.
 * typescript/stable/src/compiler/utilitiesPublic.ts;l=2265;rcl=651008033
 */
function isLocalsContainer(node: ts.Node): node is LocalsContainer {
  switch (node.kind) {
    case ts.SyntaxKind.ArrowFunction:
    case ts.SyntaxKind.Block:
    case ts.SyntaxKind.CallSignature:
    case ts.SyntaxKind.CaseBlock:
    case ts.SyntaxKind.CatchClause:
    case ts.SyntaxKind.ClassStaticBlockDeclaration:
    case ts.SyntaxKind.ConditionalType:
    case ts.SyntaxKind.Constructor:
    case ts.SyntaxKind.ConstructorType:
    case ts.SyntaxKind.ConstructSignature:
    case ts.SyntaxKind.ForStatement:
    case ts.SyntaxKind.ForInStatement:
    case ts.SyntaxKind.ForOfStatement:
    case ts.SyntaxKind.FunctionDeclaration:
    case ts.SyntaxKind.FunctionExpression:
    case ts.SyntaxKind.FunctionType:
    case ts.SyntaxKind.GetAccessor:
    case ts.SyntaxKind.IndexSignature:
    case ts.SyntaxKind.JSDocCallbackTag:
    case ts.SyntaxKind.JSDocEnumTag:
    case ts.SyntaxKind.JSDocFunctionType:
    case ts.SyntaxKind.JSDocSignature:
    case ts.SyntaxKind.JSDocTypedefTag:
    case ts.SyntaxKind.MappedType:
    case ts.SyntaxKind.MethodDeclaration:
    case ts.SyntaxKind.MethodSignature:
    case ts.SyntaxKind.ModuleDeclaration:
    case ts.SyntaxKind.SetAccessor:
    case ts.SyntaxKind.SourceFile:
    case ts.SyntaxKind.TypeAliasDeclaration:
      return true;
    default:
      return false;
  }
}
