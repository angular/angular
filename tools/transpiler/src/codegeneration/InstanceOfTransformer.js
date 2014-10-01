import {INSTANCEOF} from 'traceur/src/syntax/TokenType';

import {ParseTreeTransformer} from './ParseTreeTransformer';

/**
 * Transforms `a instanceof b` to `a is b`,
 */
export class InstanceOfTransformer extends ParseTreeTransformer {
  /**
   * @param {BinaryExpression} tree
   * @return {ParseTree}
   */
  transformBinaryExpression(tree) {
    tree.left = this.transformAny(tree.left);
    tree.right = this.transformAny(tree.right);

    if (tree.operator.type === 'instanceof') {
      // TODO(vojta): do this in a cleaner way.
      tree.operator.type = 'is';
      return tree;
    }

    return tree;
  }
}