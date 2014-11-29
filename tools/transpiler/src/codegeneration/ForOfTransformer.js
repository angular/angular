import {TempVarTransformer} from 'traceur/src/codegeneration/TempVarTransformer';
import {VARIABLE_DECLARATION_LIST} from 'traceur/src/syntax/trees/ParseTreeType';
import {VAR} from 'traceur/src/syntax/TokenType';
import {
  ForInStatement,
  FunctionBody
} from 'traceur/src/syntax/trees/ParseTrees';
import {parseStatement} from 'traceur/src/codegeneration/PlaceholderParser';
import {prependStatements} from 'traceur/src/codegeneration/PrependStatements';
import {
  createIdentifierExpression as id,
  createVariableDeclarationList,
  createVariableStatement
} from 'traceur/src/codegeneration/ParseTreeFactory';

/**
 * Transforms for-of into for-in.
 * If the initializer is an array pattern then a temp variable is assigned
 * to the result of the iterator and the destructuring pattern set up within
 * the loop.
 */
export class ForOfTransformer extends TempVarTransformer {
  /**
   * @param {ForOfStatement} tree
   * @return {ParseTree}
   */
  transformForOfStatement(original) {
    var tree = super.transformForOfStatement(original);
    var temp = id(this.getTempIdentifier());

    var assignment;
    var body = tree.body;
    var initializer = tree.initializer;
    if (tree.initializer.isPattern()) {
      parseStatement `${tree.initializer} = ${temp};`
    } else if (tree.initializer.type === VARIABLE_DECLARATION_LIST &&
        tree.initializer.declarations.some(declaration => declaration.lvalue.isPattern())) {
      // {var,let} initializer = $temp;
      assignment = createVariableStatement(
          tree.initializer.declarationType,
          tree.initializer.declarations[0].lvalue,
          temp);
    }

    if (assignment) {
      let statements = prependStatements(body.statements, assignment);
      initializer = createVariableDeclarationList(VAR, temp, null);
      body = new FunctionBody(tree.body.location, statements);
    }

    return new ForInStatement(tree.location, initializer, tree.collection, body);
  }
}
