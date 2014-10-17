import {INSTANCEOF} from 'traceur/src/syntax/TokenType';
import {ParseTreeTransformer} from './ParseTreeTransformer';
import {
  createBinaryExpression,
  createOperatorToken
} from 'traceur/src/codegeneration/ParseTreeFactory';

/**
 * Transforms `a instanceof b` to `a is b`,
 */
export class InstanceOfTransformer extends ParseTreeTransformer {
  /**
   * @param {BinaryExpression} tree
   * @return {ParseTree}
   */
  transformBinaryExpression(tree) {
    tree = super.transformBinaryExpression(tree);

    if (tree.operator.type === INSTANCEOF) {
      return createBinaryExpression(tree.left, createOperatorToken('is'), tree.right);
    }

    return tree;
  }
}
