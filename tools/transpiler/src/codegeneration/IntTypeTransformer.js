import {INSTANCEOF} from 'traceur/src/syntax/TokenType';
import {IdentifierToken} from 'traceur/src/syntax/IdentifierToken';
import {TypeName, PredefinedType} from 'traceur/src/syntax/trees/ParseTrees';
import {ParseTreeTransformer} from './ParseTreeTransformer';

import {TransformedIdentifierToken} from '../syntax/trees/ParseTrees';

/**
 * Transforms `int` to `number`. The type `int` is not defined in the standard,
 * but making it available for the developer convenience. Tools may lint the
 * code based on the extra type information, e.g. preventing float operations.
 */
export class IntTypeTransformer extends ParseTreeTransformer {

  transformTypeName(tree) {
    var tree = super.transformTypeName(tree);
    if (tree.name.value === 'int') {
      // Using a subclass for the identifier token, that presents a valid built-in
      // type, and contains the original declaration too (may be extended to
      // variable-length int types).
      var newType = new TransformedIdentifierToken(tree.name.location, 'number', 'int');
      return new PredefinedType(tree.location, newType);
    }
    return tree;
  }
}
