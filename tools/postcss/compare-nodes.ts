/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Node, Declaration, Rule, Comment} from 'postcss';

/**
 * Compares two Postcss AST nodes and returns whether a boolean indicating
 * whether they represent the same styles or not. The function does not handle
 * `AtRule` nodes or nested rules as it is only concerned with CSS stylesheets
 * and the comparison of declarations and rule selectors.
 */
export function compareNodes(a: Node, b: Node): boolean {
  if (a.type !== b.type) {
    return false;
  }

  if (isComment(a) && isComment(b)) {
    return a.text === b.text;
  }

  // Types of A and B are always equal, but for type inferring we
  // check both nodes again.
  if (isDeclaration(a) && isDeclaration(b)) {
    return a.prop === b.prop && a.value === b.value;
  }

  // We only check either rules or declarations. Since we check CSS,
  // there cannot be any nested `atrule` or `rule` nodes.
  if (!isRule(a) || !isRule(b)) {
    return false;
  }

  const aNodes = a.nodes || [];
  const bNodes = b.nodes || [];

  if (aNodes.length !== bNodes.length) {
    return false;
  }

  let equal = true;
  for (let i = 0; i < aNodes.length; i++) {
    equal = equal && compareNodes(aNodes[i], bNodes[i]);
  }
  return equal;
}

/** Asserts that a node is a `Declaration`. */
function isDeclaration(node: Node): node is Declaration {
  return node.type === 'decl';
}

/** Asserts that a node is a `Rule`. */
function isRule(node: Node): node is Rule {
  return node.type === 'rule';
}

/** Asserts that a node is a `Comment`. */
function isComment(node: Node): node is Comment {
  return node.type === 'comment';
}
