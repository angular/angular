import {ParseTreeTransformer} from 'traceur/src/codegeneration/ParseTreeTransformer';
import {ForInStatement} from 'traceur/src/syntax/trees/ParseTrees';

/**
 * Transforms for-of into for-in.
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
