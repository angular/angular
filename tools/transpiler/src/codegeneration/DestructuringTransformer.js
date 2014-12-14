import {
  COMMA_EXPRESSION,
  EXPRESSION_STATEMENT
} from 'traceur/src/syntax/trees/ParseTreeType';

import {
  DestructuringTransformer as TraceurDestructuringTransformer
} from 'traceur/src/codegeneration/DestructuringTransformer';

import {
  createExpressionStatement
} from 'traceur/src/codegeneration/ParseTreeFactory';

export class DestructuringTransformer extends TraceurDestructuringTransformer {
  /**
   * Overrides formal parameters to skip processing since they are already handled
   * by the NamedParamsTransformer.
   */
  transformFormalParameter(tree) {
    return tree;
  }

  /**
   * Converts the comma expressions created by Traceur into multiple statements.
   */
  desugarBinding_(bindingTree, statements, declarationType) {
    var binding = super.desugarBinding_(bindingTree, statements, declarationType);
    for (var i = 0; i < statements.length; i++) {
      if (statements[i].type === EXPRESSION_STATEMENT &&
          statements[i].expression.type === COMMA_EXPRESSION) {
        let expression = statements[i].expression;
        let expressionStatements = expression.expressions.map(e => {
          return createExpressionStatement(e);
        });

        statements.splice(i, 1, ...expressionStatements);
      }
    }
    return binding;
  }
}
