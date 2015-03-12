// Based on https://github.com/google/traceur-compiler/blob/master/src/codegeneration/TypeToExpressionTransformer.js
// Copyright 2012 Traceur Authors.
// Licensed under the Apache License, Version 2.0 (the 'License');
//
// Modifications:
// - use `assert` import, instead of `$traceurRuntime....` so
//   that a transpilation to ES6 does not contain any traceur references.
import {ParseTreeTransformer} from 'traceur/src/codegeneration/ParseTreeTransformer.js';
import {
  ArgumentList,
  IdentifierExpression,
  MemberExpression
} from 'traceur/src/syntax/trees/ParseTrees.js';
import {
  parseExpression
} from 'traceur/src/codegeneration/PlaceholderParser.js';

export class TypeToExpressionTransformer extends ParseTreeTransformer {

  transformTypeName(tree) {
    if (tree.moduleName) {
      var operand = this.transformAny(tree.moduleName);
      return new MemberExpression(tree.location, operand, tree.name);
    }
    return new IdentifierExpression(tree.location, tree.name);
  }

  transformPredefinedType(tree) {
    return parseExpression `assert.type.${tree.typeToken})`;
  }

  transformTypeReference(tree) {
    var typeName = this.transformAny(tree.typeName);
    var args = this.transformAny(tree.args);
    var argumentList = new ArgumentList(tree.location, [typeName, ...args]);
    return parseExpression `assert.genericType(${argumentList})`;
  }

  transformTypeArguments(tree) {
    return this.transformList(tree.args);
  }

}