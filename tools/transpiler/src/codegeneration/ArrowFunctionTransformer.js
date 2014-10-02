import {FunctionExpression} from 'traceur/src/syntax/trees/ParseTrees';
import {ParseTreeTransformer} from 'traceur/src/codegeneration/ParseTreeTransformer';
import {FUNCTION_BODY} from 'traceur/src/syntax/trees/ParseTreeType';
import alphaRenameThisAndArguments from 'traceur/src/codegeneration/alphaRenameThisAndArguments';
import {
  createFunctionBody,
  createReturnStatement
} from 'traceur/src/codegeneration/ParseTreeFactory';

/**
 * Transforms an arrow function expression into a function declaration by adding a function
 * body and return statement if needed.
 */
export class ArrowFunctionTransformer extends ParseTreeTransformer {
  transformArrowFunctionExpression(tree) {
    var body = this.transformAny(tree.body);
    var parameterList = this.transformAny(tree.parameterList);

    if (body.type !== FUNCTION_BODY) {
      body = createFunctionBody([createReturnStatement(body)]);
    }

    return new FunctionExpression(tree.location, null, tree.functionKind, parameterList, null, [],
                                  body);
  }
}
