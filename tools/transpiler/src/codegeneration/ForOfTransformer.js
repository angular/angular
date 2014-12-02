import {ParseTreeTransformer} from 'traceur/src/codegeneration/ParseTreeTransformer';
import {ForInStatement} from 'traceur/src/syntax/trees/ParseTrees';

/**
 * Transforms for-of into for-in.
 * If the initializer is an array pattern then a temp variable is assigned
 * to the result of the iterator and the destructuring pattern set up within
 * the loop.
 */
export class ForOfTransformer extends ParseTreeTransformer {
  /**
   * @param {ForOfStatement} tree
   * @return {ParseTree}
   */
  transformForOfStatement(original) {
    var tree = super.transformForOfStatement(original);
    return new ForInStatement(tree.location, tree.initializer, tree.collection, tree.body);
  }
}
