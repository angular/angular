/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Naively checks whether this node path resolves to an Angular declare invocation. */
function isNgDeclareCallExpression(nodePath) {
  if (!nodePath.node.name.startsWith('ɵɵngDeclare')) {
    return false;
  }

  // Expect the `ngDeclare` identifier to be used as part of a property access that
  // is invoked within a call expression. e.g. `i0.ɵɵngDeclare<>`.
  return (
    nodePath.parentPath?.type === 'MemberExpression' &&
    nodePath.parentPath.parentPath?.type === 'CallExpression'
  );
}

/** Asserts that the given AST does not contain any Angular partial declaration. */
export async function assertNoPartialDeclaration(filePath, ast, traverseFn) {
  // Naively check if there are any Angular declarations left that haven't been linked.
  traverseFn(ast, {
    Identifier: (astPath) => {
      if (isNgDeclareCallExpression(astPath)) {
        throw astPath.buildCodeFrameError(
          `Found Angular declaration that has not been linked. ${filePath}`,
          Error,
        );
      }
    },
  });
}
