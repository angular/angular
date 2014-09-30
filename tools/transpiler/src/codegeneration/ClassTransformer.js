import {ParseTreeTransformer} from 'traceur/src/codegeneration/ParseTreeTransformer';

import {
  PROPERTY_METHOD_ASSIGNMENT,
  MEMBER_EXPRESSION,
  THIS_EXPRESSION,
  BINARY_EXPRESSION
} from 'traceur/src/syntax/trees/ParseTreeType';

import {CONSTRUCTOR} from 'traceur/src/syntax/PredefinedName';

import {propName} from 'traceur/src/staticsemantics/PropName';

import {ClassFieldParseTree} from '../ast/class_field';

/**
 * Transforms class declaration:
 * - rename constructor (name of the class - default Dart constructor)
 *
 */

export class ClassTransformer extends ParseTreeTransformer {
  /**
   * @param {ClassDeclaration} tree
   * @returns {ParseTree}
   */
  transformClassDeclaration(tree) {
    var className = tree.name.identifierToken.toString();
    var argumentTypesMap = {};
    var fields = [];

    tree.elements.forEach(function(elementTree) {
      if (elementTree.type === PROPERTY_METHOD_ASSIGNMENT &&
          !elementTree.isStatic &&
          propName(elementTree) === CONSTRUCTOR) {

        // Store constructor argument types,
        // so that we can use them to set the types of simple-assigned fields.
        elementTree.parameterList.parameters.forEach(function(p) {
          var binding = p.parameter.binding;
          if (binding.identifierToken) {
            argumentTypesMap[binding.identifierToken.value] = p.typeAnnotation;
          }
        });

        // Rename "constructor" to the class name.
        elementTree.name.literalToken.value = className;

        // Collect all fields, defined in the constructor.
        elementTree.body.statements.forEach(function(statement) {
          if (statement.expression.type === BINARY_EXPRESSION &&
              statement.expression.operator.type === '=' &&
              statement.expression.left.type === MEMBER_EXPRESSION &&
              statement.expression.left.operand.type === THIS_EXPRESSION) {

            var typeAnnotation = argumentTypesMap[statement.expression.left.memberName.value] || null;
            fields.push(new ClassFieldParseTree(tree.location, statement.expression.left.memberName, typeAnnotation));
          }
        });
      }
    });

    // Add the field definitions to the beginning of the class.
    tree.elements = fields.concat(tree.elements);

    return super(tree);
  };
}
