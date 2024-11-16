/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/**
 * Result type of visiting a node that's typically an entry in a list, which allows specifying that
 * nodes should be added before the visited node in the output.
 */
export type VisitListEntryResult<B extends ts.Node, T extends B> = {
  node: T;
  before?: B[];
  after?: B[];
};

/**
 * Visit a node with the given visitor and return a transformed copy.
 */
export function visit<T extends ts.Node>(
  node: T,
  visitor: Visitor,
  context: ts.TransformationContext,
): T {
  return visitor._visit(node, context);
}

/**
 * Abstract base class for visitors, which processes certain nodes specially to allow insertion
 * of other nodes before them.
 */
export abstract class Visitor {
  /**
   * Maps statements to an array of statements that should be inserted before them.
   */
  private _before = new Map<ts.Node, ts.Statement[]>();

  /**
   * Maps statements to an array of statements that should be inserted after them.
   */
  private _after = new Map<ts.Node, ts.Statement[]>();

  /**
   * Visit a class declaration, returning at least the transformed declaration and optionally other
   * nodes to insert before the declaration.
   */
  abstract visitClassDeclaration(
    node: ts.ClassDeclaration,
  ): VisitListEntryResult<ts.Statement, ts.ClassDeclaration>;

  private _visitListEntryNode<T extends ts.Statement>(
    node: T,
    visitor: (node: T) => VisitListEntryResult<ts.Statement, T>,
  ): T {
    const result = visitor(node);
    if (result.before !== undefined) {
      // Record that some nodes should be inserted before the given declaration. The declaration's
      // parent's _visit call is responsible for performing this insertion.
      this._before.set(result.node, result.before);
    }
    if (result.after !== undefined) {
      // Same with nodes that should be inserted after.
      this._after.set(result.node, result.after);
    }
    return result.node;
  }

  /**
   * Visit types of nodes which don't have their own explicit visitor.
   */
  visitOtherNode<T extends ts.Node>(node: T): T {
    return node;
  }

  /**
   * @internal
   */
  _visit<T extends ts.Node>(node: T, context: ts.TransformationContext): T {
    // First, visit the node. visitedNode starts off as `null` but should be set after visiting
    // is completed.
    let visitedNode: T | null = null;

    node = ts.visitEachChild(node, (child) => child && this._visit(child, context), context) as T;

    if (ts.isClassDeclaration(node)) {
      visitedNode = this._visitListEntryNode(node, (node: ts.ClassDeclaration) =>
        this.visitClassDeclaration(node),
      ) as typeof node;
    } else {
      visitedNode = this.visitOtherNode(node);
    }

    // If the visited node has a `statements` array then process them, maybe replacing the visited
    // node and adding additional statements.
    if (visitedNode && (ts.isBlock(visitedNode) || ts.isSourceFile(visitedNode))) {
      visitedNode = this._maybeProcessStatements(visitedNode);
    }

    return visitedNode;
  }

  private _maybeProcessStatements<T extends ts.Block | ts.SourceFile>(node: T): T {
    // Shortcut - if every statement doesn't require nodes to be prepended or appended,
    // this is a no-op.
    if (node.statements.every((stmt) => !this._before.has(stmt) && !this._after.has(stmt))) {
      return node;
    }

    // Build a new list of statements and patch it onto the clone.
    const newStatements: ts.Statement[] = [];
    node.statements.forEach((stmt) => {
      if (this._before.has(stmt)) {
        newStatements.push(...(this._before.get(stmt)! as ts.Statement[]));
        this._before.delete(stmt);
      }
      newStatements.push(stmt);
      if (this._after.has(stmt)) {
        newStatements.push(...(this._after.get(stmt)! as ts.Statement[]));
        this._after.delete(stmt);
      }
    });

    const statementsArray = ts.factory.createNodeArray(
      newStatements,
      node.statements.hasTrailingComma,
    );

    if (ts.isBlock(node)) {
      return ts.factory.updateBlock(node, statementsArray) as T;
    } else {
      return ts.factory.updateSourceFile(
        node,
        statementsArray,
        node.isDeclarationFile,
        node.referencedFiles,
        node.typeReferenceDirectives,
        node.hasNoDefaultLib,
        node.libReferenceDirectives,
      ) as T;
    }
  }
}
