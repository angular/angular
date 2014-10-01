import {ParseTree} from 'traceur/src/syntax/trees/ParseTree';

import {PropertyMethodAssignment} from 'traceur/src/syntax/trees/ParseTrees';

import * as ParseTreeType from './ParseTreeType';

/**
 * Property declaration
 */
export class ClassFieldDeclaration extends ParseTree {
  constructor(location, lvalue, typeAnnotation, isFinal) {
    this.location = location;
    this.lvalue = lvalue;
    this.typeAnnotation = typeAnnotation;
    this.isFinal = isFinal;
  }

  get type() {
    return CLASS_FIELD_DECLARATION;
  }

  visit(visitor) {
    visitor.visitClassFieldDeclaration(this);
  }

  transform(transformer) {
    return transformer.transformClassFieldDeclaration(this);
  }
}

var CLASS_FIELD_DECLARATION = ParseTreeType.CLASS_FIELD_DECLARATION;

/**
 * Class constructor
 */
export class PropertyConstructorAssignment extends PropertyMethodAssignment {
  /**
   * @param {SourceRange} location
   * @param {boolean} isStatic
   * @param {Token} functionKind
   * @param {ParseTree} name
   * @param {FormalParameterList} parameterList
   * @param {ParseTree} typeAnnotation
   * @param {Array.<ParseTree>} annotations
   * @param {FunctionBody} body
   * @param {boolean} isConst
   * @param {ParseTree} initializerList
   */
  constructor(location, isStatic, functionKind, name, parameterList, typeAnnotation, annotations,
              body, isConst, initializerList) {
    super(location, isStatic, functionKind, name, parameterList, typeAnnotation, annotations,
          body);
    this.isConst = isConst;
    this.initializerList = initializerList;
  }

  /**
   * @param {ParseTreeTransformer} transformer
   */
  transform(transformer) {
    return transformer.transformPropertyConstructorAssignment(this);
  }

  /**
   * @param {ParseTreeVisitor} visitor
   */
  visit(visitor) {
    visitor.visitPropertyConstructorAssignment(this);
  }

  /**
   * @type {ParseTreeType}
   */
  get type() {
    return PROPERTY_CONSTRUCTOR_ASSIGNMENT;
  }
}

var PROPERTY_CONSTRUCTOR_ASSIGNMENT = ParseTreeType.PROPERTY_CONSTRUCTOR_ASSIGNMENT;

