/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, TmplAstBoundAttribute, TmplAstBoundEvent, TmplAstElement, TmplAstNode, TmplAstTemplate} from '@angular/compiler';
import * as ts from 'typescript';

import {AbsoluteFsPath} from '../../file_system';
import {isAssignment} from '../../util/src/typescript';
import {DirectiveSymbol, ElementSymbol, ExpressionSymbol, InputBindingSymbol, OutputBindingSymbol, ReferenceSymbol, Symbol, SymbolKind, TsNodeSymbolInfo, VariableSymbol} from '../api';

import {ExpressionIdentifier, findFirstMatchingNode, hasExpressionIdentifier} from './comments';
import {TemplateData} from './context';
import {TcbDirectiveOutputsOp} from './type_check_block';

/**
 * A class which extracts information from a type check block.
 * This class is essentially used as just a closure around the constructor parameters.
 */
export class SymbolBuilder {
  constructor(
      private readonly typeChecker: ts.TypeChecker, private readonly shimPath: AbsoluteFsPath,
      private readonly typeCheckBlock: ts.Node, private readonly templateData: TemplateData) {}

  getSymbol(node: AST|TmplAstNode): Symbol|null {
    if (node instanceof TmplAstBoundAttribute) {
      // TODO(atscott): input and output bindings only return the first directive match but should
      // return a list of bindings for all of them.
      return this.getSymbolOfInputBinding(node);
    } else if (node instanceof TmplAstBoundEvent) {
      return this.getSymbolOfBoundEvent(node);
    }
    return null;
  }

  private getSymbolOfBoundEvent(eventBinding: TmplAstBoundEvent): OutputBindingSymbol|null {
    // Outputs are a `ts.CallExpression` that look like one of the two:
    // * _outputHelper(_t1["outputField"]).subscribe(handler);
    // * _t1.addEventListener(handler);
    const node = findFirstMatchingNode(
        this.typeCheckBlock, {withSpan: eventBinding.sourceSpan, filter: ts.isCallExpression});
    if (node === null) {
      return null;
    }

    const consumer = this.templateData.boundTarget.getConsumerOfBinding(eventBinding);
    if (consumer instanceof TmplAstTemplate || consumer instanceof TmplAstElement) {
      // Bindings to element or template events produce `addEventListener` which
      // we cannot get the field for.
      return null;
    }
    const outputFieldAccess = TcbDirectiveOutputsOp.decodeOutputCallExpression(node);
    if (outputFieldAccess === null) {
      return null;
    }

    const tsSymbol = this.typeChecker.getSymbolAtLocation(outputFieldAccess.argumentExpression);
    if (tsSymbol === undefined) {
      return null;
    }


    const target = this.getDirectiveSymbolForAccessExpression(outputFieldAccess);
    if (target === null) {
      return null;
    }

    const positionInShimFile = outputFieldAccess.argumentExpression.getStart();
    const tsType = this.typeChecker.getTypeAtLocation(node);
    return {
      kind: SymbolKind.Output,
      bindings: [{
        kind: SymbolKind.Binding,
        tsSymbol,
        tsType,
        target,
        shimLocation: {shimPath: this.shimPath, positionInShimFile},
      }],
    };
  }

  private getSymbolOfInputBinding(attributeBinding: TmplAstBoundAttribute): InputBindingSymbol
      |null {
    const node = findFirstMatchingNode(
        this.typeCheckBlock, {withSpan: attributeBinding.sourceSpan, filter: isAssignment});
    if (node === null) {
      return null;
    }

    let tsSymbol: ts.Symbol|undefined;
    let positionInShimFile: number|null = null;
    let tsType: ts.Type;
    if (ts.isElementAccessExpression(node.left)) {
      tsSymbol = this.typeChecker.getSymbolAtLocation(node.left.argumentExpression);
      positionInShimFile = node.left.argumentExpression.getStart();
      tsType = this.typeChecker.getTypeAtLocation(node.left.argumentExpression);
    } else if (ts.isPropertyAccessExpression(node.left)) {
      tsSymbol = this.typeChecker.getSymbolAtLocation(node.left.name);
      positionInShimFile = node.left.name.getStart();
      tsType = this.typeChecker.getTypeAtLocation(node.left.name);
    } else {
      return null;
    }
    if (tsSymbol === undefined || positionInShimFile === null) {
      return null;
    }

    const consumer = this.templateData.boundTarget.getConsumerOfBinding(attributeBinding);
    let target: ElementSymbol|DirectiveSymbol|null;
    if (consumer instanceof TmplAstTemplate || consumer instanceof TmplAstElement) {
      // TODO(atscott): handle bindings to elements and templates
      target = null;
    } else {
      target = this.getDirectiveSymbolForAccessExpression(node.left);
    }

    if (target === null) {
      return null;
    }

    return {
      kind: SymbolKind.Input,
      bindings: [{
        kind: SymbolKind.Binding,
        tsSymbol,
        tsType,
        target,
        shimLocation: {shimPath: this.shimPath, positionInShimFile},
      }],
    };
  }

  private getDirectiveSymbolForAccessExpression(node: ts.ElementAccessExpression|
                                                ts.PropertyAccessExpression): DirectiveSymbol|null {
    // In either case, `_t1["index"]` or `_t1.index`, `node.expression` is _t1.
    // The retrieved symbol for _t1 will be the variable declaration.
    const tsSymbol = this.typeChecker.getSymbolAtLocation(node.expression);
    if (tsSymbol === undefined || tsSymbol.declarations.length === 0) {
      return null;
    }

    const [declaration] = tsSymbol.declarations;
    if (!ts.isVariableDeclaration(declaration) ||
        !hasExpressionIdentifier(
            // The expression identifier could be on the type (for regular directives) or the name
            // (for generic directives and the ctor op).
            declaration.getSourceFile(), declaration.type ?? declaration.name,
            ExpressionIdentifier.DIRECTIVE)) {
      return null;
    }

    const symbol = this.getSymbolOfVariableDeclaration(declaration);
    if (symbol === null || symbol.tsSymbol === null || symbol.tsType === null) {
      return null;
    }

    return {
      ...symbol,
      kind: SymbolKind.Directive,
      tsSymbol: symbol.tsSymbol,
      tsType: symbol.tsType,
    };
  }

  private getSymbolOfTsNode(node: ts.Node): TsNodeSymbolInfo|null {
    while (ts.isParenthesizedExpression(node)) {
      node = node.expression;
    }

    let tsSymbol: ts.Symbol|undefined;
    let positionInShimFile: number;
    if (ts.isPropertyAccessExpression(node)) {
      tsSymbol = this.typeChecker.getSymbolAtLocation(node.name);
      positionInShimFile = node.name.getStart();
    } else {
      tsSymbol = this.typeChecker.getSymbolAtLocation(node);
      positionInShimFile = node.getStart();
    }

    const type = this.typeChecker.getTypeAtLocation(node);
    return {
      // If we could not find a symbol, fall back to the symbol on the type for the node.
      // Some nodes won't have a "symbol at location" but will have a symbol for the type.
      // One example of this would be literals.
      tsSymbol: tsSymbol ?? type.symbol ?? null,
      tsType: type,
      shimLocation: {shimPath: this.shimPath, positionInShimFile},
    };
  }

  private getSymbolOfVariableDeclaration(declaration: ts.VariableDeclaration): TsNodeSymbolInfo
      |null {
    // Instead of returning the Symbol for the temporary variable, we want to get the `ts.Symbol`
    // for:
    // - The type reference for `var _t2: MyDir = xyz` (prioritize/trust the declared type)
    // - The initializer for `var _t2 = _t1.index`.
    if (declaration.type && ts.isTypeReferenceNode(declaration.type)) {
      return this.getSymbolOfTsNode(declaration.type.typeName);
    }
    if (declaration.initializer === undefined) {
      return null;
    }

    const symbol = this.getSymbolOfTsNode(declaration.initializer);
    if (symbol === null) {
      return null;
    }

    return symbol;
  }
}
