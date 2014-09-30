import {VariableStatement, VariableDeclarationList} from 'traceur/src/syntax/trees/ParseTrees';

import {ParseTreeTransformer} from 'traceur/src/codegeneration/ParseTreeTransformer';

/**
 * Transforms `var a, b;` to `var a; var b;`
 */
export class MultiVarTransformer extends ParseTreeTransformer {
  // Individual item transformer can return an array of items.
  // This is used in `transformVariableStatement`.
  // Otherwise this is copy/pasted from `ParseTreeTransformer`.
  transformList(list) {
    var transformedList = [];
    var transformedItem = null;

    for (var i = 0, ii = list.length; i < ii; i++) {
      transformedItem = this.transformAny(list[i]);
      if (Array.isArray(transformedItem)) {
        transformedList = transformedList.concat(transformedItem);
      } else {
        transformedList.push(transformedItem);
      }
    }

    return transformedList;
  }

  /**
   * @param {VariableStatement} tree
   * @returns {ParseTree}
   */
  transformVariableStatement(tree) {
    var declarations = tree.declarations.declarations;

    if (declarations.length === 1 || declarations.length === 0) {
      return tree;
    }

    // Multiple var declaration, we will split it into multiple statements.
    // TODO(vojta): We can leave the multi-definition as long as they are all the same type/untyped.
    return declarations.map(function(declaration) {
      return new VariableStatement(tree.location, new VariableDeclarationList(tree.location,
          tree.declarations.declarationType, [declaration]));
    });
  }
}