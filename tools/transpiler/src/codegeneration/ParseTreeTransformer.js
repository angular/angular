import {
  ParseTreeTransformer as TraceurParseTreeTransformer
} from 'traceur/src/codegeneration/ParseTreeTransformer';

import {
  ClassFieldDeclaration,
  PropertyConstructorAssignment
} from '../syntax/trees/ParseTrees'

export class ParseTreeTransformer extends TraceurParseTreeTransformer {
  transformClassFieldDeclaration(tree) {
    var lvalue = this.transformAny(tree.lvalue);
    var typeAnnotation = this.transformAny(tree.typeAnnotation);
    if (lvalue === tree.lvalue && typeAnnotation === tree.typeAnnotation) {
      return tree;
    }
    return new ClassFieldDeclaration(tree.location, lvalue, typeAnnotation, initializer);
  }

  transformPropertyConstructorAssignment(tree) {
    tree = super.transformPropertyMethodAssignment(tree);
    var initializerList = this.transformList(tree.initializerList);
    if (initializerList === tree.initializerList) {
      return tree;
    }

    return new PropertyConstructorAssignment(tree.location, tree.isStatic, tree.functionKind,
      tree.name, tree.parameterList, tree.typeAnnotation, tree.annotations, tree.body, tree.isConst,
      initializerList);
  }
}