import {ParseTreeTransformer} from './ParseTreeTransformer';

import {
  BINARY_EXPRESSION,
  CALL_EXPRESSION,
  IDENTIFIER_EXPRESSION,
  MEMBER_EXPRESSION,
  PROPERTY_METHOD_ASSIGNMENT,
  SUPER_EXPRESSION,
  THIS_EXPRESSION
} from 'traceur/src/syntax/trees/ParseTreeType';

import {EQUAL} from 'traceur/src/syntax/TokenType';

import {CONSTRUCTOR} from 'traceur/src/syntax/PredefinedName';

import {propName} from 'traceur/src/staticsemantics/PropName';

import {
  BinaryExpression,
  BindingIdentifier,
  FormalParameterList,
  FunctionBody,
  IdentifierExpression
} from 'traceur/src/syntax/trees/ParseTrees';

import {
  PropertyConstructorAssignment
} from '../syntax/trees/ParseTrees';

/**
 * Transforms class declaration:
 * - rename constructor to the name of the class (default Dart constructor),
 * - class fields are extracted from `this.field = expression;` in the ctor body,
 * - `@CONST` annotations on the ctor result in a const constructor & final fields in Dart,
 * - const constructor body is converted to an initializerList
 */
export class ClassTransformer extends ParseTreeTransformer {
  constructor(idGenerator, reporter) {
    this.reporter_ = reporter;
  }

  /**
   * @param {ClassDeclaration} tree
   * @returns {ParseTree}
   */
  transformClassDeclaration(tree) {
    var className = tree.name.identifierToken.toString();
    var argumentTypesMap = {};
    var fields = [];
    var isConst;
    var hasConstructor = false;
    var that = this;

    tree.elements.forEach(function(elementTree, index) {
      if (elementTree.type === PROPERTY_METHOD_ASSIGNMENT &&
          !elementTree.isStatic &&
          propName(elementTree) === CONSTRUCTOR) {

        hasConstructor = true;
        isConst = elementTree.annotations.some(that._isConstAnnotation);

        // Store constructor argument types,
        // so that we can use them to set the types of simple-assigned fields.
        elementTree.parameterList.parameters.forEach(function(p) {
          var binding = p.parameter.binding;
          if (binding && binding.identifierToken) {
            argumentTypesMap[binding.identifierToken.value] = p.typeAnnotation;
          }
        });

        // Rename "constructor" to the class name.
        elementTree.name.literalToken.value = className;

        // Compute the initializer list
        var initializerList = [];
        var superCall = that._extractSuperCall(elementTree.body);
        if (isConst) {
          initializerList = that._extractFieldInitializers(elementTree.body);
          if (elementTree.body.statements.length > 0) {
            that.reporter_.reportError(
              elementTree.location,
              'Const constructor body can only contain field initialization & super call');
          }
        }
        if (superCall) initializerList.push(superCall);

        // Replace the `PROPERTY_METHOD_ASSIGNMENT` with a Dart specific
        // `PROPERTY_CONSTRUCTOR_ASSIGNMENT`
        tree.elements[index] = new PropertyConstructorAssignment(
          elementTree.location,
          elementTree.isStatic,
          elementTree.functionKind,
          elementTree.name,
          elementTree.parameterList,
          elementTree.typeAnnotation,
          elementTree.annotations,
          elementTree.body,
          isConst,
          initializerList
        );
      }
    });

    // If no constructor exists then look to see if we should create a const constructor
    // when the class is annotated with @CONST.
    if (!hasConstructor) {
      let constClassAnnotation = this._extractConstAnnotation(tree);
      if (constClassAnnotation !== null) {
        tree.elements = [(new PropertyConstructorAssignment(
            constClassAnnotation.location,
            false,
            null,
            tree.name,
            new FormalParameterList(constClassAnnotation.location, []),
            null,
            [constClassAnnotation],
            new FunctionBody(constClassAnnotation.location, []),
            true,
            []
          ))].concat(tree.elements);
      }
    }

    // Add the field definitions to the beginning of the class.
    tree.elements = fields.concat(tree.elements);
    if (isConst) {
      tree.elements.forEach(function(element) {
        element.isFinal = true;
      });
    }

    return super.transformClassDeclaration(tree);
  }

  /**
   * Extract field initialization (`this.field = <expression>;`) from the body of the constructor.
   * The init statements are removed from the body statements and returned as an array.
   */
  _extractFieldInitializers(body) {
    var statements = [];
    var fieldInitializers = [];
    body.statements.forEach(function(statement) {
      var exp = statement.expression;
      if (exp.type === BINARY_EXPRESSION &&
          exp.operator.type === EQUAL &&
          exp.left.type === MEMBER_EXPRESSION &&
          exp.left.operand.type === THIS_EXPRESSION) {
          // `this.field = exp` -> `field = exp`
          // todo(vicb): check for `this.` on rhs, not allowed in Dart
          // -> remove if possible (arguments), throw otherwise.
        var fieldName = exp.left.memberName.value;
        fieldInitializers.push(new BinaryExpression(
          statement.location,
          new IdentifierExpression(statement.location, fieldName),
          EQUAL,
          exp.right
        ));
      } else {
        statements.push(statement);
      }
    });

    body.statements = statements;
    return fieldInitializers;
  }

  /**
   * Extract the super call (`super(<arg list>)`) from the body of the constructor.
   * When found the super call statement is removed from the body statements and returned.
   */
  _extractSuperCall(body) {
    var statements = [];
    var superCall = null;

    body.statements.forEach(function (statement) {
      if (statement.expression &&
          statement.expression.type === CALL_EXPRESSION &&
          statement.expression.operand.type === SUPER_EXPRESSION) {
        superCall = statement.expression;
      } else {
        statements.push(statement);
      }
    });

    body.statements = statements;
    return superCall;
  }

  /**
   * Extract the @CONST annotation from the class annotations.
   * When found the annotation is removed from the class annotations and returned.
   */
  _extractConstAnnotation(tree) {
    var annotations = [];
    var constAnnotation = null;
    var that = this;

    tree.annotations.forEach((annotation) => {
      if (that._isConstAnnotation(annotation)) {
        constAnnotation = annotation;
      } else {
        annotations.push(annotation);
      }
    });

    tree.annotations = annotations;
    return constAnnotation;
  }
  /**
   * Returns true if the annotation is @CONST
   */
  _isConstAnnotation(annotation) {
    return annotation.name.identifierToken.value === 'CONST';
  }

}
