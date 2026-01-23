/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {getInheritedTypes} from './heritage_types';

/**
 * Node captured in the inheritance graph.
 */
export type GraphNode = ts.ClassDeclaration | ts.ClassExpression | ts.InterfaceDeclaration;

/**
 * Inheritance graph tracks edges between classes that describe
 * heritage.
 *
 * This graph is helpful for efficient lookups whether e.g. an input
 * is overridden, or inherited etc. This is helpful when detecting
 * and propagating input incompatibility statuses.
 */
export class InheritanceGraph {
  /** Maps nodes to their parent nodes. */
  classToParents = new Map<GraphNode, GraphNode[]>();
  /** Maps nodes to their derived nodes. */
  parentToChildren = new Map<GraphNode, GraphNode[]>();
  /** All classes seen participating in inheritance chains. */
  allClassesInInheritance = new Set<GraphNode>();

  constructor(private checker: ts.TypeChecker) {}

  /** Registers a given class in the graph. */
  registerClass(clazz: GraphNode, parents: GraphNode[]) {
    this.classToParents.set(clazz, parents);
    this.allClassesInInheritance.add(clazz);

    for (const parent of parents) {
      this.allClassesInInheritance.add(parent);

      if (!this.parentToChildren.has(parent)) {
        this.parentToChildren.set(parent, []);
      }
      this.parentToChildren.get(parent)!.push(clazz);
    }
  }

  /**
   * Checks if the given class has overlapping members, either
   * inherited or derived.
   *
   * @returns Symbols of the inherited or derived members, if they exist.
   */
  checkOverlappingMembers(
    clazz: GraphNode,
    member: ts.ClassElement,
    memberName: string,
  ): {
    inherited: ts.Symbol | undefined;
    derivedMembers: ts.Symbol[];
  } {
    const inheritedTypes = (this.classToParents.get(clazz) ?? []).map((c) =>
      this.checker.getTypeAtLocation(c),
    );
    const derivedLeafs = this._traceDerivedChainToLeafs(clazz).map((c) =>
      this.checker.getTypeAtLocation(c),
    );

    const inheritedMember = inheritedTypes
      .map((t) => t.getProperty(memberName))
      .find((m) => m !== undefined);
    const derivedMembers = derivedLeafs
      .map((t) => t.getProperty(memberName))
      // Skip members that point back to the current class element. The derived type
      // might look up back to our starting point— which we ignore.
      .filter((m): m is ts.Symbol => m !== undefined && m.valueDeclaration !== member);

    return {inherited: inheritedMember, derivedMembers};
  }

  /** Gets all leaf derived classes that extend from the given class. */
  private _traceDerivedChainToLeafs(clazz: GraphNode): GraphNode[] {
    const queue = [clazz];
    const leafs: GraphNode[] = [];

    while (queue.length) {
      const node = queue.shift()!;
      if (!this.parentToChildren.has(node)) {
        if (node !== clazz) {
          leafs.push(node);
        }
        continue;
      }
      queue.push(...this.parentToChildren.get(node)!);
    }
    return leafs;
  }

  /** Gets all derived classes of the given node. */
  traceDerivedClasses(clazz: GraphNode): GraphNode[] {
    const queue = [clazz];
    const derived: GraphNode[] = [];
    while (queue.length) {
      const node = queue.shift()!;
      if (node !== clazz) {
        derived.push(node);
      }
      if (!this.parentToChildren.has(node)) {
        continue;
      }
      queue.push(...this.parentToChildren.get(node)!);
    }
    return derived;
  }

  /**
   * Populates the graph.
   *
   * NOTE: This is expensive and should be called with caution.
   */
  expensivePopulate(files: readonly ts.SourceFile[]) {
    for (const file of files) {
      const visitor = (node: ts.Node) => {
        if (
          (ts.isClassLike(node) || ts.isInterfaceDeclaration(node)) &&
          node.heritageClauses !== undefined
        ) {
          const heritageTypes = getInheritedTypes(node, this.checker);
          const parents = heritageTypes
            // Interfaces participate in the graph and are not "value declarations".
            // Also, symbol may be undefined for unresolvable nodes.
            .map((t) => (t.symbol ? t.symbol.declarations?.[0] : undefined))
            .filter(
              (d): d is GraphNode =>
                d !== undefined && (ts.isClassLike(d) || ts.isInterfaceDeclaration(d)),
            );

          this.registerClass(node, parents);
        }
        ts.forEachChild(node, visitor);
      };
      ts.forEachChild(file, visitor);
    }
    return this;
  }
}
