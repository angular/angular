import {
  createArgumentList,
  createCallExpression,
  createIdentifierExpression
} from 'traceur/src/codegeneration/ParseTreeFactory';

import {
  EQUAL_EQUAL_EQUAL,
  NOT_EQUAL_EQUAL
} from 'traceur/src/syntax/TokenType';

import {ParseTreeTransformer} from './ParseTreeTransformer';

/**
 * Transforms:
 * - `a === b` to `indentical(a, b)`,
 * - `a !== b` to `!identical(a, b)`
 */
export class StrictEqualityTransformer extends ParseTreeTransformer {
  /**
   * @param {BinaryExpression} tree
   * @return {ParseTree}
   */
  transformBinaryExpression(tree) {
    tree.left = this.transformAny(tree.left);
    tree.right = this.transformAny(tree.right);

    if (tree.operator.type === EQUAL_EQUAL_EQUAL) {
      // `a === b` -> `identical(a, b)`
      return createCallExpression(createIdentifierExpression('identical'),
                                  createArgumentList([tree.left, tree.right]));
    }

    if (tree.operator.type === NOT_EQUAL_EQUAL) {
      // `a !== b` -> `!identical(a, b)`
      // TODO(vojta): do this in a cleaner way.
      return createCallExpression(createIdentifierExpression('!identical'),
                                  createArgumentList([tree.left, tree.right]));
    }

    return tree;
  }
}