/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, ASTWithSource, BindingPipe, MethodCall, PropertyWrite, SafeMethodCall, SafePropertyRead, TmplAstBoundAttribute, TmplAstBoundEvent, TmplAstElement, TmplAstNode, TmplAstReference, TmplAstTemplate, TmplAstTextAttribute, TmplAstVariable} from '@angular/compiler';
import * as ts from 'typescript';

import {AbsoluteFsPath} from '../../file_system';
import {ClassDeclaration} from '../../reflection';
import {ComponentScopeReader} from '../../scope';
import {isAssignment} from '../../util/src/typescript';
import {BindingSymbol, DirectiveSymbol, DomBindingSymbol, ElementSymbol, ExpressionSymbol, InputBindingSymbol, OutputBindingSymbol, PipeSymbol, ReferenceSymbol, ShimLocation, Symbol, SymbolKind, TemplateSymbol, TsNodeSymbolInfo, TypeCheckableDirectiveMeta, VariableSymbol} from '../api';

import {ExpressionIdentifier, findAllMatchingNodes, findFirstMatchingNode, hasExpressionIdentifier} from './comments';
import {TemplateData} from './context';
import {isAccessExpression} from './ts_util';

/**
 * Generates and caches `Symbol`s for various template structures for a given component.
 *
 * The `SymbolBuilder` internally caches the `Symbol`s it creates, and must be destroyed and
 * replaced if the component's template changes.
 */
export class SymbolBuilder {
  private symbolCache = new Map<AST|TmplAstNode, Symbol|null>();

  constructor(
      private readonly shimPath: AbsoluteFsPath,
      private readonly typeCheckBlock: ts.Node,
      private readonly templateData: TemplateData,
      private readonly componentScopeReader: ComponentScopeReader,
      // The `ts.TypeChecker` depends on the current type-checking program, and so must be requested
      // on-demand instead of cached.
      private readonly getTypeChecker: () => ts.TypeChecker,
  ) {}

  getSymbol(node: TmplAstTemplate|TmplAstElement): TemplateSymbol|ElementSymbol|null;
  getSymbol(node: TmplAstReference|TmplAstVariable): ReferenceSymbol|VariableSymbol|null;
  getSymbol(node: AST|TmplAstNode): Symbol|null;
  getSymbol(node: AST|TmplAstNode): Symbol|null {
    if (this.symbolCache.has(node)) {
      return this.symbolCache.get(node)!;
    }

    let symbol: Symbol|null = null;
    if (node instanceof TmplAstBoundAttribute || node instanceof TmplAstTextAttribute) {
      // TODO(atscott): input and output bindings only return the first directive match but should
      // return a list of bindings for all of them.
      symbol = this.getSymbolOfInputBinding(node);
    } else if (node instanceof TmplAstBoundEvent) {
      symbol = this.getSymbolOfBoundEvent(node);
    } else if (node instanceof TmplAstElement) {
      symbol = this.getSymbolOfElement(node);
    } else if (node instanceof TmplAstTemplate) {
      symbol = this.getSymbolOfAstTemplate(node);
    } else if (node instanceof TmplAstVariable) {
      symbol = this.getSymbolOfVariable(node);
    } else if (node instanceof TmplAstReference) {
      symbol = this.getSymbolOfReference(node);
    } else if (node instanceof BindingPipe) {
      symbol = this.getSymbolOfPipe(node);
    } else if (node instanceof AST) {
      symbol = this.getSymbolOfTemplateExpression(node);
    } else {
      // TODO(atscott): TmplAstContent, TmplAstIcu
    }

    this.symbolCache.set(node, symbol);
    return symbol;
  }

  private getSymbolOfAstTemplate(template: TmplAstTemplate): TemplateSymbol|null {
    const directives = this.getDirectivesOfNode(template);
    return {kind: SymbolKind.Template, directives, templateNode: template};
  }

  private getSymbolOfElement(element: TmplAstElement): ElementSymbol|null {
    const elementSourceSpan = element.startSourceSpan ?? element.sourceSpan;

    const node = findFirstMatchingNode(
        this.typeCheckBlock, {withSpan: elementSourceSpan, filter: ts.isVariableDeclaration});
    if (node === null) {
      return null;
    }

    const symbolFromDeclaration = this.getSymbolOfTsNode(node);
    if (symbolFromDeclaration === null || symbolFromDeclaration.tsSymbol === null) {
      return null;
    }

    const directives = this.getDirectivesOfNode(element);
    // All statements in the TCB are `Expression`s that optionally include more information.
    // An `ElementSymbol` uses the information returned for the variable declaration expression,
    // adds the directives for the element, and updates the `kind` to be `SymbolKind.Element`.
    return {
      ...symbolFromDeclaration,
      kind: SymbolKind.Element,
      directives,
      templateNode: element,
    };
  }

  private getDirectivesOfNode(element: TmplAstElement|TmplAstTemplate): DirectiveSymbol[] {
    const elementSourceSpan = element.startSourceSpan ?? element.sourceSpan;
    const tcbSourceFile = this.typeCheckBlock.getSourceFile();
    // directives could be either:
    // - var _t1: TestDir /*T:D*/ = (null!);
    // - var _t1 /*T:D*/ = _ctor1({});
    const isDirectiveDeclaration = (node: ts.Node): node is ts.TypeNode|ts.Identifier =>
        (ts.isTypeNode(node) || ts.isIdentifier(node)) && ts.isVariableDeclaration(node.parent) &&
        hasExpressionIdentifier(tcbSourceFile, node, ExpressionIdentifier.DIRECTIVE);

    const nodes = findAllMatchingNodes(
        this.typeCheckBlock, {withSpan: elementSourceSpan, filter: isDirectiveDeclaration});
    return nodes
        .map(node => {
          const symbol = this.getSymbolOfTsNode(node.parent);
          if (symbol === null || symbol.tsSymbol === null ||
              symbol.tsSymbol.valueDeclaration === undefined ||
              !ts.isClassDeclaration(symbol.tsSymbol.valueDeclaration)) {
            return null;
          }
          const meta = this.getDirectiveMeta(element, symbol.tsSymbol.valueDeclaration);
          if (meta === null) {
            return null;
          }

          const ngModule = this.getDirectiveModule(symbol.tsSymbol.valueDeclaration);
          if (meta.selector === null) {
            return null;
          }
          const isComponent = meta.isComponent ?? null;
          const directiveSymbol: DirectiveSymbol = {
            ...symbol,
            tsSymbol: symbol.tsSymbol,
            selector: meta.selector,
            isComponent,
            ngModule,
            kind: SymbolKind.Directive,
            isStructural: meta.isStructural,
          };
          return directiveSymbol;
        })
        .filter((d): d is DirectiveSymbol => d !== null);
  }

  private getDirectiveMeta(
      host: TmplAstTemplate|TmplAstElement,
      directiveDeclaration: ts.Declaration): TypeCheckableDirectiveMeta|null {
    const directives = this.templateData.boundTarget.getDirectivesOfNode(host);
    if (directives === null) {
      return null;
    }

    return directives.find(m => m.ref.node === directiveDeclaration) ?? null;
  }

  private getDirectiveModule(declaration: ts.ClassDeclaration): ClassDeclaration|null {
    const scope = this.componentScopeReader.getScopeForComponent(declaration as ClassDeclaration);
    if (scope === null) {
      return null;
    }
    return scope.ngModule;
  }

  private getSymbolOfBoundEvent(eventBinding: TmplAstBoundEvent): OutputBindingSymbol|null {
    const consumer = this.templateData.boundTarget.getConsumerOfBinding(eventBinding);
    if (consumer === null) {
      return null;
    }

    // Outputs in the TCB look like one of the two:
    // * _t1["outputField"].subscribe(handler);
    // * _t1.addEventListener(handler);
    // Even with strict null checks disabled, we still produce the access as a separate statement
    // so that it can be found here.
    let expectedAccess: string;
    if (consumer instanceof TmplAstTemplate || consumer instanceof TmplAstElement) {
      expectedAccess = 'addEventListener';
    } else {
      const bindingPropertyNames = consumer.outputs.getByBindingPropertyName(eventBinding.name);
      if (bindingPropertyNames === null || bindingPropertyNames.length === 0) {
        return null;
      }
      // Note that we only get the expectedAccess text from a single consumer of the binding. If
      // there are multiple consumers (not supported in the `boundTarget` API) and one of them has
      // an alias, it will not get matched here.
      expectedAccess = bindingPropertyNames[0].classPropertyName;
    }

    function filter(n: ts.Node): n is ts.PropertyAccessExpression|ts.ElementAccessExpression {
      if (!isAccessExpression(n)) {
        return false;
      }

      if (ts.isPropertyAccessExpression(n)) {
        return n.name.getText() === expectedAccess;
      } else {
        return ts.isStringLiteral(n.argumentExpression) &&
            n.argumentExpression.text === expectedAccess;
      }
    }
    const outputFieldAccesses =
        findAllMatchingNodes(this.typeCheckBlock, {withSpan: eventBinding.keySpan, filter});

    const bindings: BindingSymbol[] = [];
    for (const outputFieldAccess of outputFieldAccesses) {
      if (consumer instanceof TmplAstTemplate || consumer instanceof TmplAstElement) {
        if (!ts.isPropertyAccessExpression(outputFieldAccess)) {
          continue;
        }

        const addEventListener = outputFieldAccess.name;
        const tsSymbol = this.getTypeChecker().getSymbolAtLocation(addEventListener);
        const tsType = this.getTypeChecker().getTypeAtLocation(addEventListener);
        const positionInShimFile = this.getShimPositionForNode(addEventListener);
        const target = this.getSymbol(consumer);

        if (target === null || tsSymbol === undefined) {
          continue;
        }

        bindings.push({
          kind: SymbolKind.Binding,
          tsSymbol,
          tsType,
          target,
          shimLocation: {shimPath: this.shimPath, positionInShimFile},
        });
      } else {
        if (!ts.isElementAccessExpression(outputFieldAccess)) {
          continue;
        }
        const tsSymbol =
            this.getTypeChecker().getSymbolAtLocation(outputFieldAccess.argumentExpression);
        if (tsSymbol === undefined) {
          continue;
        }


        const target = this.getDirectiveSymbolForAccessExpression(outputFieldAccess, consumer);
        if (target === null) {
          continue;
        }

        const positionInShimFile = this.getShimPositionForNode(outputFieldAccess);
        const tsType = this.getTypeChecker().getTypeAtLocation(outputFieldAccess);
        bindings.push({
          kind: SymbolKind.Binding,
          tsSymbol,
          tsType,
          target,
          shimLocation: {shimPath: this.shimPath, positionInShimFile},
        });
      }
    }

    if (bindings.length === 0) {
      return null;
    }
    return {kind: SymbolKind.Output, bindings};
  }

  private getSymbolOfInputBinding(binding: TmplAstBoundAttribute|
                                  TmplAstTextAttribute): InputBindingSymbol|DomBindingSymbol|null {
    const consumer = this.templateData.boundTarget.getConsumerOfBinding(binding);
    if (consumer === null) {
      return null;
    }

    if (consumer instanceof TmplAstElement || consumer instanceof TmplAstTemplate) {
      const host = this.getSymbol(consumer);
      return host !== null ? {kind: SymbolKind.DomBinding, host} : null;
    }

    const nodes = findAllMatchingNodes(
        this.typeCheckBlock, {withSpan: binding.sourceSpan, filter: isAssignment});
    const bindings: BindingSymbol[] = [];
    for (const node of nodes) {
      if (!isAccessExpression(node.left)) {
        continue;
      }

      const symbolInfo = this.getSymbolOfTsNode(node.left);
      if (symbolInfo === null || symbolInfo.tsSymbol === null) {
        continue;
      }

      const target = this.getDirectiveSymbolForAccessExpression(node.left, consumer);
      if (target === null) {
        continue;
      }
      bindings.push({
        ...symbolInfo,
        tsSymbol: symbolInfo.tsSymbol,
        kind: SymbolKind.Binding,
        target,
      });
    }
    if (bindings.length === 0) {
      return null;
    }

    return {kind: SymbolKind.Input, bindings};
  }

  private getDirectiveSymbolForAccessExpression(
      node: ts.ElementAccessExpression|ts.PropertyAccessExpression,
      {isComponent, selector, isStructural}: TypeCheckableDirectiveMeta): DirectiveSymbol|null {
    // In either case, `_t1["index"]` or `_t1.index`, `node.expression` is _t1.
    // The retrieved symbol for _t1 will be the variable declaration.
    const tsSymbol = this.getTypeChecker().getSymbolAtLocation(node.expression);
    if (tsSymbol === undefined || tsSymbol.declarations.length === 0 || selector === null) {
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

    const symbol = this.getSymbolOfTsNode(declaration);
    if (symbol === null || symbol.tsSymbol === null ||
        symbol.tsSymbol.valueDeclaration === undefined ||
        !ts.isClassDeclaration(symbol.tsSymbol.valueDeclaration)) {
      return null;
    }

    const ngModule = this.getDirectiveModule(symbol.tsSymbol.valueDeclaration);
    return {
      kind: SymbolKind.Directive,
      tsSymbol: symbol.tsSymbol,
      tsType: symbol.tsType,
      shimLocation: symbol.shimLocation,
      isComponent,
      isStructural,
      selector,
      ngModule,
    };
  }

  private getSymbolOfVariable(variable: TmplAstVariable): VariableSymbol|null {
    const node = findFirstMatchingNode(
        this.typeCheckBlock, {withSpan: variable.sourceSpan, filter: ts.isVariableDeclaration});
    if (node === null || node.initializer === undefined) {
      return null;
    }

    const expressionSymbol = this.getSymbolOfTsNode(node.initializer);
    if (expressionSymbol === null) {
      return null;
    }

    return {
      tsType: expressionSymbol.tsType,
      tsSymbol: expressionSymbol.tsSymbol,
      initializerLocation: expressionSymbol.shimLocation,
      kind: SymbolKind.Variable,
      declaration: variable,
      localVarLocation: {
        shimPath: this.shimPath,
        positionInShimFile: this.getShimPositionForNode(node.name),
      }
    };
  }

  private getSymbolOfReference(ref: TmplAstReference): ReferenceSymbol|null {
    const target = this.templateData.boundTarget.getReferenceTarget(ref);
    // Find the node for the reference declaration, i.e. `var _t2 = _t1;`
    let node = findFirstMatchingNode(
        this.typeCheckBlock, {withSpan: ref.sourceSpan, filter: ts.isVariableDeclaration});
    if (node === null || target === null || node.initializer === undefined) {
      return null;
    }

    // Get the original declaration for the references variable, with the exception of template refs
    // which are of the form var _t3 = (_t2 as any as i2.TemplateRef<any>)
    // TODO(atscott): Consider adding an `ExpressionIdentifier` to tag variable declaration
    // initializers as invalid for symbol retrieval.
    const originalDeclaration = ts.isParenthesizedExpression(node.initializer) &&
            ts.isAsExpression(node.initializer.expression) ?
        this.getTypeChecker().getSymbolAtLocation(node.name) :
        this.getTypeChecker().getSymbolAtLocation(node.initializer);
    if (originalDeclaration === undefined || originalDeclaration.valueDeclaration === undefined) {
      return null;
    }
    const symbol = this.getSymbolOfTsNode(originalDeclaration.valueDeclaration);
    if (symbol === null || symbol.tsSymbol === null) {
      return null;
    }

    const referenceVarShimLocation: ShimLocation = {
      shimPath: this.shimPath,
      positionInShimFile: this.getShimPositionForNode(node),
    };
    if (target instanceof TmplAstTemplate || target instanceof TmplAstElement) {
      return {
        kind: SymbolKind.Reference,
        tsSymbol: symbol.tsSymbol,
        tsType: symbol.tsType,
        target,
        declaration: ref,
        targetLocation: symbol.shimLocation,
        referenceVarLocation: referenceVarShimLocation,
      };
    } else {
      if (!ts.isClassDeclaration(target.directive.ref.node)) {
        return null;
      }

      return {
        kind: SymbolKind.Reference,
        tsSymbol: symbol.tsSymbol,
        tsType: symbol.tsType,
        declaration: ref,
        target: target.directive.ref.node,
        targetLocation: symbol.shimLocation,
        referenceVarLocation: referenceVarShimLocation,
      };
    }
  }

  private getSymbolOfPipe(expression: BindingPipe): PipeSymbol|null {
    const node = findFirstMatchingNode(
        this.typeCheckBlock, {withSpan: expression.sourceSpan, filter: ts.isCallExpression});
    if (node === null || !ts.isPropertyAccessExpression(node.expression)) {
      return null;
    }

    const methodAccess = node.expression;
    // Find the node for the pipe variable from the transform property access. This will be one of
    // two forms: `_pipe1.transform` or `(_pipe1 as any).transform`.
    const pipeVariableNode = ts.isParenthesizedExpression(methodAccess.expression) &&
            ts.isAsExpression(methodAccess.expression.expression) ?
        methodAccess.expression.expression.expression :
        methodAccess.expression;
    const pipeDeclaration = this.getTypeChecker().getSymbolAtLocation(pipeVariableNode);
    if (pipeDeclaration === undefined || pipeDeclaration.valueDeclaration === undefined) {
      return null;
    }

    const pipeInstance = this.getSymbolOfTsNode(pipeDeclaration.valueDeclaration);
    if (pipeInstance === null || pipeInstance.tsSymbol === null) {
      return null;
    }

    const symbolInfo = this.getSymbolOfTsNode(methodAccess);
    if (symbolInfo === null) {
      return null;
    }

    return {
      kind: SymbolKind.Pipe,
      ...symbolInfo,
      classSymbol: {
        ...pipeInstance,
        tsSymbol: pipeInstance.tsSymbol,
      },
    };
  }

  private getSymbolOfTemplateExpression(expression: AST): VariableSymbol|ReferenceSymbol
      |ExpressionSymbol|null {
    if (expression instanceof ASTWithSource) {
      expression = expression.ast;
    }

    const expressionTarget = this.templateData.boundTarget.getExpressionTarget(expression);
    if (expressionTarget !== null) {
      return this.getSymbol(expressionTarget);
    }

    // The `name` part of a `PropertyWrite` and `MethodCall` does not have its own
    // AST so there is no way to retrieve a `Symbol` for just the `name` via a specific node.
    const withSpan = (expression instanceof PropertyWrite || expression instanceof MethodCall) ?
        expression.nameSpan :
        expression.sourceSpan;

    let node = findFirstMatchingNode(
        this.typeCheckBlock, {withSpan, filter: (n: ts.Node): n is ts.Node => true});
    if (node === null) {
      return null;
    }

    while (ts.isParenthesizedExpression(node)) {
      node = node.expression;
    }

    // - If we have safe property read ("a?.b") we want to get the Symbol for b, the `whenTrue`
    // expression.
    // - If our expression is a pipe binding ("a | test:b:c"), we want the Symbol for the
    // `transform` on the pipe.
    // - Otherwise, we retrieve the symbol for the node itself with no special considerations
    if ((expression instanceof SafePropertyRead || expression instanceof SafeMethodCall) &&
        ts.isConditionalExpression(node)) {
      const whenTrueSymbol =
          (expression instanceof SafeMethodCall && ts.isCallExpression(node.whenTrue)) ?
          this.getSymbolOfTsNode(node.whenTrue.expression) :
          this.getSymbolOfTsNode(node.whenTrue);
      if (whenTrueSymbol === null) {
        return null;
      }

      return {
        ...whenTrueSymbol,
        kind: SymbolKind.Expression,
        // Rather than using the type of only the `whenTrue` part of the expression, we should
        // still get the type of the whole conditional expression to include `|undefined`.
        tsType: this.getTypeChecker().getTypeAtLocation(node)
      };
    } else {
      const symbolInfo = this.getSymbolOfTsNode(node);
      return symbolInfo === null ? null : {...symbolInfo, kind: SymbolKind.Expression};
    }
  }

  private getSymbolOfTsNode(node: ts.Node): TsNodeSymbolInfo|null {
    while (ts.isParenthesizedExpression(node)) {
      node = node.expression;
    }

    let tsSymbol: ts.Symbol|undefined;
    if (ts.isPropertyAccessExpression(node)) {
      tsSymbol = this.getTypeChecker().getSymbolAtLocation(node.name);
    } else if (ts.isElementAccessExpression(node)) {
      tsSymbol = this.getTypeChecker().getSymbolAtLocation(node.argumentExpression);
    } else {
      tsSymbol = this.getTypeChecker().getSymbolAtLocation(node);
    }

    const positionInShimFile = this.getShimPositionForNode(node);
    const type = this.getTypeChecker().getTypeAtLocation(node);
    return {
      // If we could not find a symbol, fall back to the symbol on the type for the node.
      // Some nodes won't have a "symbol at location" but will have a symbol for the type.
      // Examples of this would be literals and `document.createElement('div')`.
      tsSymbol: tsSymbol ?? type.symbol ?? null,
      tsType: type,
      shimLocation: {shimPath: this.shimPath, positionInShimFile},
    };
  }

  private getShimPositionForNode(node: ts.Node): number {
    if (ts.isTypeReferenceNode(node)) {
      return this.getShimPositionForNode(node.typeName);
    } else if (ts.isQualifiedName(node)) {
      return node.right.getStart();
    } else if (ts.isPropertyAccessExpression(node)) {
      return node.name.getStart();
    } else if (ts.isElementAccessExpression(node)) {
      return node.argumentExpression.getStart();
    } else {
      return node.getStart();
    }
  }
}
