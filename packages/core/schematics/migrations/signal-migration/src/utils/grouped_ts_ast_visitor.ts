/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/**
 * Class that allows for efficient grouping of TypeScript node AST
 * traversal.
 *
 * Allows visitors to execute in a single pass when visiting all
 * children of source files.
 */
export class GroupedTsAstVisitor {
  private visitors: Array<(node: ts.Node) => void> = [];
  private doneFns: Array<() => void> = [];

  constructor(private files: readonly ts.SourceFile[]) {}

  state = {
    insidePropertyDeclaration: null as ts.PropertyDeclaration | null,
  };

  register(visitor: (node: ts.Node) => void, done?: () => void) {
    this.visitors.push(visitor);
    if (done !== undefined) {
      this.doneFns.push(done);
    }
  }

  execute() {
    const visitor = (node: ts.Node) => {
      for (const v of this.visitors) {
        v(node);
      }
      if (ts.isPropertyDeclaration(node)) {
        this.state.insidePropertyDeclaration = node;
        ts.forEachChild(node, visitor);
        this.state.insidePropertyDeclaration = null;
      } else {
        ts.forEachChild(node, visitor);
      }
    };

    for (const file of this.files) {
      ts.forEachChild(file, visitor);
    }

    for (const doneFn of this.doneFns) {
      doneFn();
    }

    this.visitors = [];
  }
}
