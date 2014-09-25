import {ParseTreeTransformer} from 'traceur/src/codegeneration/ParseTreeTransformer';
import {createVariableStatement, createCallExpression, createIdentifierExpression, createArgumentList} from 'traceur/src/codegeneration/ParseTreeFactory';

// var token = traceur.syntax.TokenType;
// var CONSTRUCTOR = token.CONSTRUCTOR;

import {PROPERTY_METHOD_ASSIGNMENT, MEMBER_EXPRESSION, THIS_EXPRESSION, BINARY_EXPRESSION} from 'traceur/src/syntax/trees/ParseTreeType';
import {EQUAL_EQUAL_EQUAL, NOT_EQUAL_EQUAL} from 'traceur/src/syntax/TokenType';
import {CONSTRUCTOR} from 'traceur/src/syntax/PredefinedName';

import {VariableStatement, VariableDeclarationList} from 'traceur/src/syntax/trees/ParseTrees';

import {propName} from 'traceur/src/staticsemantics/PropName';

import {ClassFieldParseTree} from './ast/class_field';

// - rename constructor (name of the class - default Dart constructor)
export class ClassTransformer extends ParseTreeTransformer {
  // Transform multi-var declarations, into multiple statements:
  // var x, y;
  // ==>
  // var x;
  // var y;
  // TODO(vojta): move this into a separate transformer.

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


  // Transform triple equals into identical() call.
  // TODO(vojta): move to a separate transformer
  transformBinaryExpression(tree) {
    tree.left = this.transformAny(tree.left);
    tree.right = this.transformAny(tree.right);
    if (tree.operator.type === 'instanceof') {
      // a instanceof b -> a is b
      // TODO(vojta): do this in a cleaner way.
      tree.operator.type = 'is';
      return tree;
    } else if (tree.operator.type === EQUAL_EQUAL_EQUAL) {
      // a === b -> identical(a, b)
      return createCallExpression(createIdentifierExpression('identical'), createArgumentList([tree.left, tree.right]));
    } else if (tree.operator.type === NOT_EQUAL_EQUAL) {
      // a !== b -> !identical(a, b)
      // TODO(vojta): do this in a cleaner way.
      return createCallExpression(createIdentifierExpression('!identical'), createArgumentList([tree.left, tree.right]));
    } else {
      return tree;
    }
  };

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

    // Add the field definitions to the begining of the class.
    tree.elements = fields.concat(tree.elements);

    return super(tree);
  };
}
