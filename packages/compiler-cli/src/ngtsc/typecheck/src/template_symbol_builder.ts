/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  ASTWithName,
  ASTWithSource,
  Binary,
  BindingPipe,
  ClassPropertyMapping,
  MatchSource,
  ParseSourceSpan,
  PropertyRead,
  R3Identifiers,
  ReferenceTarget,
  SafePropertyRead,
  TemplateEntity,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstComponent,
  TmplAstDirective,
  TmplAstElement,
  TmplAstLetDeclaration,
  TmplAstNode,
  TmplAstReference,
  TmplAstTemplate,
  TmplAstTextAttribute,
  TmplAstVariable,
  TypeCheckingConfig,
  Unary,
  unwrapWriteTarget,
} from '@angular/compiler';
import ts from 'typescript';

import {AbsoluteFsPath} from '../../file_system';
import {HostDirectiveMeta, isHostDirectiveMetaForGlobalMode} from '../../metadata';

import {ClassDeclaration} from '../../reflection';
import {isAssignment} from '../../util/src/typescript';
import {
  BindingSymbol,
  DirectiveSymbol,
  DomBindingSymbol,
  ElementSymbol,
  ExpressionSymbol,
  InputBindingSymbol,
  LetDeclarationSymbol,
  OutputBindingSymbol,
  PipeSymbol,
  ReferenceSymbol,
  SelectorlessComponentSymbol,
  SelectorlessDirectiveSymbol,
  Symbol,
  SymbolKind,
  SymbolReference,
  TcbLocation,
  TemplateSymbol,
  VariableSymbol,
} from '../api';
import {findAllMatchingNodes, findFirstMatchingNode, readDirectiveIdFromComment} from './comments';

import {isAccessExpression, isDirectiveDeclaration} from './ts_util';

export interface SymbolDirectiveMeta {
  getSymbolReference(): SymbolReference;
  getNgModule(): ClassDeclaration | null;
  matchSource: MatchSource;
  isComponent: boolean;
  selector: string | null;
  isStructural: boolean;
  inputs: ClassPropertyMapping;
  outputs: ClassPropertyMapping;
  hostDirectives?: HostDirectiveMeta[] | null;
}

export interface SymbolBoundTarget {
  getDirectivesOfNode(node: TmplAstNode): SymbolDirectiveMeta[] | null;
  getConsumerOfBinding(
    binding: TmplAstBoundAttribute | TmplAstBoundEvent | TmplAstTextAttribute,
  ): SymbolDirectiveMeta | TmplAstElement | TmplAstTemplate | null;
  getReferenceTarget(ref: TmplAstReference): ReferenceTarget<SymbolDirectiveMeta> | null;
  getExpressionTarget(expr: AST): TemplateEntity | null;
}

/**
 * Generates and caches `Symbol`s for various template structures for a given component.
 *
 * The `SymbolBuilder` internally caches the `Symbol`s it creates, and must be destroyed and
 * replaced if the component's template changes.
 */
export class SymbolBuilder {
  private symbolCache = new Map<AST | TmplAstNode, Symbol | null>();

  constructor(
    private readonly tcbPath: AbsoluteFsPath,
    private readonly tcbIsShim: boolean,
    private readonly typeCheckBlock: ts.Node,
    private readonly boundTarget: SymbolBoundTarget,
    private readonly typeCheckingConfig: TypeCheckingConfig,
  ) {}

  getSymbol(node: TmplAstTemplate | TmplAstElement): TemplateSymbol | ElementSymbol | null;
  getSymbol(
    node: TmplAstReference | TmplAstVariable | TmplAstLetDeclaration,
  ): ReferenceSymbol | VariableSymbol | LetDeclarationSymbol | null;
  getSymbol(node: TmplAstComponent): SelectorlessComponentSymbol | null;
  getSymbol(node: TmplAstDirective): SelectorlessDirectiveSymbol | null;
  getSymbol(node: AST | TmplAstNode): Symbol | null;
  getSymbol(node: AST | TmplAstNode): Symbol | null {
    if (this.symbolCache.has(node)) {
      return this.symbolCache.get(node)!;
    }

    let symbol: Symbol | null = null;
    if (node instanceof TmplAstBoundAttribute || node instanceof TmplAstTextAttribute) {
      // TODO(atscott): input and output bindings only return the first directive match but should
      // return a list of bindings for all of them.
      symbol = this.getSymbolOfInputBinding(node);
    } else if (node instanceof TmplAstBoundEvent) {
      symbol = this.getSymbolOfBoundEvent(node);
    } else if (node instanceof TmplAstElement) {
      symbol = this.getSymbolOfElement(node);
    } else if (node instanceof TmplAstComponent) {
      symbol = this.getSymbolOfSelectorlessComponent(node);
    } else if (node instanceof TmplAstDirective) {
      symbol = this.getSymbolOfSelectorlessDirective(node);
    } else if (node instanceof TmplAstTemplate) {
      symbol = this.getSymbolOfAstTemplate(node);
    } else if (node instanceof TmplAstVariable) {
      symbol = this.getSymbolOfVariable(node);
    } else if (node instanceof TmplAstLetDeclaration) {
      symbol = this.getSymbolOfLetDeclaration(node);
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

  private getSymbolOfAstTemplate(template: TmplAstTemplate): TemplateSymbol | null {
    const directives = this.getDirectivesOfNode(template);
    return {kind: SymbolKind.Template, directives, templateNode: template};
  }

  private getSymbolOfElement(element: TmplAstElement): ElementSymbol | null {
    const elementSourceSpan = element.startSourceSpan ?? element.sourceSpan;

    const node = findFirstMatchingNode(this.typeCheckBlock, {
      withSpan: elementSourceSpan,
      filter: ts.isVariableDeclaration,
    });
    if (node === null) {
      return null;
    }

    const tcbLocation = this.getTcbLocationForNode(node);

    const directives = this.getDirectivesOfNode(element);
    // All statements in the TCB are `Expression`s that optionally include more information.
    // An `ElementSymbol` uses the information returned for the variable declaration expression,
    // adds the directives for the element, and updates the `kind` to be `SymbolKind.Element`.
    return {
      kind: SymbolKind.Element,
      tcbLocation,
      directives,
      templateNode: element,
    };
  }

  private getSymbolOfSelectorlessComponent(
    node: TmplAstComponent,
  ): SelectorlessComponentSymbol | null {
    const directives = this.getDirectivesOfNode(node);
    const primaryDirective =
      directives.find((dir) => dir.matchSource === MatchSource.Selector && dir.isComponent) ?? null;

    if (primaryDirective === null) {
      return null;
    }

    return {
      tcbLocation: primaryDirective.tcbLocation,
      kind: SymbolKind.SelectorlessComponent,
      directives,
      templateNode: node,
    };
  }

  private getSymbolOfSelectorlessDirective(
    node: TmplAstDirective,
  ): SelectorlessDirectiveSymbol | null {
    const directives = this.getDirectivesOfNode(node);
    const primaryDirective =
      directives.find((dir) => dir.matchSource === MatchSource.Selector && !dir.isComponent) ??
      null;

    if (primaryDirective === null) {
      return null;
    }

    return {
      tcbLocation: primaryDirective.tcbLocation,
      kind: SymbolKind.SelectorlessDirective,
      directives,
      templateNode: node,
    };
  }

  private getDirectivesOfNode(
    templateNode: TmplAstElement | TmplAstTemplate | TmplAstComponent | TmplAstDirective,
  ): DirectiveSymbol[] {
    const elementSourceSpan = templateNode.startSourceSpan ?? templateNode.sourceSpan;
    const boundDirectives = this.boundTarget.getDirectivesOfNode(templateNode) ?? [];
    let symbols = this.getDirectiveSymbolsForDirectives(boundDirectives, elementSourceSpan);

    // 'getDirectivesOfNode' will not return the directives intended for an element
    // on a microsyntax template, for example '<div *ngFor="let user of users;" dir>',
    // the 'dir' will be skipped, but it's needed in language service.
    if (!(templateNode instanceof TmplAstDirective)) {
      const firstChild = templateNode.children.find(
        (c): c is TmplAstElement => c instanceof TmplAstElement,
      );
      if (firstChild !== undefined) {
        const isMicrosyntaxTemplate =
          templateNode instanceof TmplAstTemplate &&
          sourceSpanEqual(firstChild.sourceSpan, templateNode.sourceSpan);
        if (isMicrosyntaxTemplate) {
          const firstChildDirectives = this.boundTarget.getDirectivesOfNode(firstChild);
          if (firstChildDirectives !== null) {
            const childSymbols = this.getDirectiveSymbolsForDirectives(
              firstChildDirectives,
              elementSourceSpan,
            );
            // Merge symbols, avoiding duplicates
            for (const symbol of childSymbols) {
              if (
                !symbols.some(
                  (s) => s.ref.name === symbol.ref.name && s.ref.filePath === symbol.ref.filePath,
                )
              ) {
                symbols.push(symbol);
              }
            }
          }
        }
      }
    }

    return symbols;
  }

  private getDirectiveSymbolsForDirectives(
    boundDirectives: SymbolDirectiveMeta[],
    span: ParseSourceSpan,
  ): DirectiveSymbol[] {
    const nodes = findAllMatchingNodes(this.typeCheckBlock, {
      withSpan: span,
      filter: isDirectiveDeclaration,
    });

    const hostDirectiveMap = new Map<string, HostDirectiveMeta>();
    for (const d of boundDirectives) {
      if (d.hostDirectives) {
        for (const hd of d.hostDirectives) {
          if (isHostDirectiveMetaForGlobalMode(hd)) {
            const key = `${hd.directive.node.getSourceFile().fileName}#${hd.directive.node.name.text}`;
            hostDirectiveMap.set(key, hd);
          }
        }
      }
    }

    const symbols: DirectiveSymbol[] = [];
    const seenDirectives = new Set<string>();
    const sf = this.typeCheckBlock.getSourceFile();

    for (const node of nodes) {
      const id = readDirectiveIdFromComment(sf, node);
      if (id === null) continue;
      const meta = boundDirectives[id];
      if (!meta) continue;

      const ref = meta.getSymbolReference();
      const refKey = `${ref.filePath}#${ref.name}`;

      if (!seenDirectives.has(refKey)) {
        const ref = meta.getSymbolReference();
        const key = `${ref.filePath}#${ref.name}`;
        const hostMeta = hostDirectiveMap.get(key) || null;
        const directiveSymbol: DirectiveSymbol = hostMeta
          ? {
              tcbLocation: this.getTcbLocationForNode(node),
              ref,
              selector: meta.selector,
              isComponent: meta.isComponent,
              ngModule: meta.getNgModule(),
              kind: SymbolKind.Directive,
              isStructural: meta.isStructural,
              isInScope: true,
              tsCompletionEntryInfos: null,
              matchSource: MatchSource.HostDirective,
              exposedInputs: hostMeta.inputs,
              exposedOutputs: hostMeta.outputs,
            }
          : {
              tcbLocation: this.getTcbLocationForNode(node),
              ref,
              selector: meta.selector,
              isComponent: meta.isComponent,
              ngModule: meta.getNgModule(),
              kind: SymbolKind.Directive,
              isStructural: meta.isStructural,
              isInScope: true,
              tsCompletionEntryInfos: null,
              matchSource: MatchSource.Selector,
            };

        symbols.push(directiveSymbol);
        seenDirectives.add(refKey);
      }
    }

    return symbols;
  }

  private getSymbolOfBoundEvent(eventBinding: TmplAstBoundEvent): OutputBindingSymbol | null {
    const consumer = this.boundTarget.getConsumerOfBinding(eventBinding);
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

    function filter(n: ts.Node): n is ts.PropertyAccessExpression | ts.ElementAccessExpression {
      if (!isAccessExpression(n)) {
        return false;
      }

      if (ts.isPropertyAccessExpression(n)) {
        return n.name.getText() === expectedAccess;
      } else {
        return (
          ts.isStringLiteral(n.argumentExpression) && n.argumentExpression.text === expectedAccess
        );
      }
    }
    const outputFieldAccesses = findAllMatchingNodes(this.typeCheckBlock, {
      withSpan: eventBinding.keySpan,
      filter,
    });

    const bindings: BindingSymbol[] = [];
    for (const outputFieldAccess of outputFieldAccesses) {
      if (consumer instanceof TmplAstTemplate || consumer instanceof TmplAstElement) {
        if (!ts.isPropertyAccessExpression(outputFieldAccess)) {
          continue;
        }

        const addEventListener = outputFieldAccess.name;
        const target = this.getSymbol(consumer);

        if (target === null) {
          continue;
        }

        bindings.push({
          kind: SymbolKind.Binding,
          target,
          tcbLocation: this.getTcbLocationForNode(addEventListener),
          tcbTypeLocation: this.getTcbSpanForNode(addEventListener),
        });
      } else {
        if (!ts.isElementAccessExpression(outputFieldAccess)) {
          continue;
        }
        const target = this.getDirectiveSymbolForAccessExpression(outputFieldAccess, consumer);
        if (target === null) {
          continue;
        }

        bindings.push({
          kind: SymbolKind.Binding,
          target,
          tcbLocation: this.getTcbLocationForNode(outputFieldAccess),
          tcbTypeLocation: this.getTcbSpanForNode(outputFieldAccess),
        });
      }
    }

    if (bindings.length === 0) {
      return null;
    }
    return {kind: SymbolKind.Output, bindings};
  }

  private getSymbolOfInputBinding(
    binding: TmplAstBoundAttribute | TmplAstTextAttribute,
  ): InputBindingSymbol | DomBindingSymbol | null {
    const consumer = this.boundTarget.getConsumerOfBinding(binding);
    if (consumer === null) {
      return null;
    }

    if (consumer instanceof TmplAstElement || consumer instanceof TmplAstTemplate) {
      const host = this.getSymbol(consumer);
      return host !== null ? {kind: SymbolKind.DomBinding, host} : null;
    }

    // Check if the consumer actually declares this binding as an input.
    // Sometimes the BindingTarget will say a directive consumes it, but it's undeclared in the class.
    if (!consumer.inputs.hasBindingPropertyName(binding.name)) {
      return null;
    }

    const nodes = findAllMatchingNodes(this.typeCheckBlock, {
      withSpan: binding.sourceSpan,
      filter: isAssignment,
    });
    const bindings: BindingSymbol[] = [];
    for (const node of nodes) {
      // Signal inputs need special treatment because they are generated with an extra keyed
      // access. E.g. `_t1.prop[WriteT_ACCESSOR_SYMBOL]`. Observations:
      //   - The keyed access for the write type needs to be resolved for the "input type".
      //   - The definition symbol of the input should be the input class member, and not the
      //     internal write accessor. Symbol should resolve `_t1.prop`.
      const signalInputAssignment = isAccessExpression(node.left)
        ? unwrapSignalInputWriteTAccessor(node.left)
        : null;
      const fieldExpr =
        signalInputAssignment !== null ? signalInputAssignment.fieldExpr : node.left;

      // The node whose location resolves to the input's class member.
      let fieldNode: ts.Node;
      // The node whose type is the type of the input's class member.
      let fieldTypeNode: ts.Node;
      // The node whose location resolves to the directive instance.
      let instanceNode: ts.Node;

      if (isAccessExpression(fieldExpr)) {
        fieldNode = fieldExpr;
        fieldTypeNode = fieldExpr;
        instanceNode = fieldExpr.expression;
      } else if (ts.isIdentifier(fieldExpr)) {
        // If the field expression refers to just an identifier, the input binding was assigned
        // into a temporary variable. This is the case for fields with restricted access
        // (private/protected/readonly) when `honorAccessModifiersForInputBindings = false`, where
        // the TCB generates `var _tmp = null! as typeof _dir.fieldName; _tmp = expr;`.
        // Recover the class member and the directive instance from the type in the temporary
        // variable's declaration.
        const restrictedField = unwrapRestrictedFieldTempVariable(this.typeCheckBlock, fieldExpr);
        if (restrictedField === null) {
          continue;
        }
        fieldNode = restrictedField.fieldNode;
        fieldTypeNode = restrictedField.typeNode;
        instanceNode = restrictedField.instanceNode;
      } else {
        continue;
      }

      const target = this.getDirectiveSymbolForInstanceNode(instanceNode, consumer);
      if (target === null) {
        continue;
      }

      bindings.push({
        tcbLocation: this.getTcbLocationForNode(fieldNode),
        tcbTypeLocation: this.getTcbSpanForNode(fieldTypeNode),
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
    fieldAccessExpr: ts.ElementAccessExpression | ts.PropertyAccessExpression,
    meta: SymbolDirectiveMeta,
  ): DirectiveSymbol | null {
    return this.getDirectiveSymbolForInstanceNode(fieldAccessExpr.expression, meta);
  }

  private getDirectiveSymbolForInstanceNode(
    instanceNode: ts.Node,
    meta: SymbolDirectiveMeta,
  ): DirectiveSymbol | null {
    return {
      ref: meta.getSymbolReference(),
      kind: SymbolKind.Directive,
      tcbLocation: this.getTcbLocationForNode(instanceNode),
      isComponent: meta.isComponent,
      isStructural: meta.isStructural,
      selector: meta.selector,
      ngModule: meta.getNgModule(),
      matchSource: MatchSource.Selector,
      isInScope: true, // TODO: this should always be in scope in this context, right?
      tsCompletionEntryInfos: null,
    };
  }

  private getSymbolOfVariable(variable: TmplAstVariable): VariableSymbol | null {
    const node = findFirstMatchingNode(this.typeCheckBlock, {
      withSpan: variable.sourceSpan,
      filter: ts.isVariableDeclaration,
    });
    if (node === null) {
      return null;
    }

    let initializerNode: ts.Node | null = null;
    if (ts.isForOfStatement(node.parent.parent)) {
      initializerNode = node;
    } else if (node.initializer !== undefined) {
      initializerNode = node.initializer;
    }

    if (initializerNode === null) {
      return null;
    }

    return {
      kind: SymbolKind.Variable,
      declaration: variable,
      localVarLocation: this.getTcbLocationForNode(node.name),
      initializerLocation: this.getTcbLocationForNode(initializerNode),
    };
  }

  private getSymbolOfReference(ref: TmplAstReference): ReferenceSymbol | null {
    const target = this.boundTarget.getReferenceTarget(ref);
    if (target === null) {
      return null;
    }

    if (target instanceof TmplAstElement && !this.typeCheckingConfig.checkTypeOfDomReferences) {
      return null;
    }
    if (
      !(target instanceof TmplAstElement) &&
      !this.typeCheckingConfig.checkTypeOfNonDomReferences
    ) {
      return null;
    }

    // Find the node for the reference declaration, i.e. `var _t2 = _t1;`
    let node = findFirstMatchingNode(this.typeCheckBlock, {
      withSpan: ref.sourceSpan,
      filter: ts.isVariableDeclaration,
    });
    if (node === null || node.initializer === undefined) {
      return null;
    }

    let targetNode: ts.Node = node.initializer;
    if (ts.isCallExpression(targetNode)) {
      return null;
    }
    if (ts.isParenthesizedExpression(targetNode) && ts.isAsExpression(targetNode.expression)) {
      targetNode = node.name;
    }
    const targetLocation: TcbLocation = {
      tcbPath: this.tcbPath,
      isShimFile: this.tcbIsShim,
      positionInFile: this.getTcbPositionForNode(targetNode),
    };

    const referenceVarTcbLocation: TcbLocation = {
      tcbPath: this.tcbPath,
      isShimFile: this.tcbIsShim,
      positionInFile: this.getTcbPositionForNode(node),
    };
    if (target instanceof TmplAstTemplate || target instanceof TmplAstElement) {
      // Logic for checkTypeOfDomReferences is not strictly needed here because
      // TCB generation will output `any` when it is disabled, which yields a null tsSymbol anyway.
      return {
        kind: SymbolKind.Reference,
        target,
        declaration: ref,
        targetLocation,
        referenceVarLocation: referenceVarTcbLocation,
      };
    } else {
      const targetNode = target.directive.getSymbolReference();

      return {
        kind: SymbolKind.Reference,
        declaration: ref,
        target: targetNode,
        targetLocation,
        referenceVarLocation: referenceVarTcbLocation,
      };
    }
  }

  private getSymbolOfLetDeclaration(decl: TmplAstLetDeclaration): LetDeclarationSymbol | null {
    const node = findFirstMatchingNode(this.typeCheckBlock, {
      withSpan: decl.sourceSpan,
      filter: ts.isVariableDeclaration,
    });

    if (node === null || node.initializer === undefined) {
      return null;
    }

    return {
      kind: SymbolKind.LetDeclaration,
      declaration: decl,
      localVarLocation: this.getTcbLocationForNode(node.name),
      initializerLocation: this.getTcbLocationForNode(node.initializer),
    };
  }

  private getSymbolOfPipe(expression: BindingPipe): PipeSymbol | null {
    const methodAccessId = findFirstMatchingNode(this.typeCheckBlock, {
      withSpan: expression.nameSpan,
      filter: ts.isIdentifier,
    });
    if (methodAccessId === null || !ts.isPropertyAccessExpression(methodAccessId.parent)) {
      return null;
    }
    const methodAccess = methodAccessId.parent;

    const pipeVariableNode = methodAccess.expression;

    return {
      tcbLocation: this.getTcbLocationForNode(methodAccess),
      kind: SymbolKind.Pipe,
      classSymbol: {
        tcbLocation: this.getTcbLocationForNode(pipeVariableNode),
        isPipeClassSymbol: true,
      },
    };
  }

  private getSymbolOfTemplateExpression(
    expression: AST,
  ): VariableSymbol | ReferenceSymbol | ExpressionSymbol | LetDeclarationSymbol | null {
    if (expression instanceof ASTWithSource) {
      expression = expression.ast;
    }

    const expressionTarget = this.boundTarget.getExpressionTarget(expression);
    if (expressionTarget !== null) {
      return this.getSymbol(expressionTarget) as
        VariableSymbol | ReferenceSymbol | ExpressionSymbol | LetDeclarationSymbol | null;
    }

    let withSpan = expression.sourceSpan;

    // Whether `withSpan` points at a property read, in which case the search below should look
    // for a `PropertyAccessExpression` rather than settling for whichever node comes first.
    let isPropertyRead = expression instanceof PropertyRead;

    // The `name` part of a property write and `ASTWithName` do not have their own
    // AST so there is no way to retrieve a `Symbol` for just the `name` via a specific node.
    if (expression instanceof Binary && Binary.isAssignmentOperation(expression.operation)) {
      const target = unwrapWriteTarget(expression.left);
      if (target instanceof PropertyRead) {
        withSpan = target.nameSpan;
        isPropertyRead = true;
      }
    } else if (expression instanceof Unary && Unary.isUpdateOperation(expression.operator)) {
      // The target of an update operator can be wrapped in parentheses or a non-null assertion
      // (e.g. `(value)++` or `value!++`), neither of which affect what is being written to.
      const target = unwrapWriteTarget(expression.expr);
      if (target instanceof PropertyRead) {
        withSpan = target.nameSpan;
        isPropertyRead = true;
      }
    } else if (
      expression instanceof ASTWithName &&
      !(expression instanceof SafePropertyRead) &&
      expression.constructor.name !== 'MethodCall'
    ) {
      withSpan = expression.nameSpan;
    }

    let node: ts.Node | null = null;

    // Property reads in templates usually map to a `PropertyAccessExpression`
    // (e.g. `ctx.foo`) so try looking for one first.
    if (isPropertyRead || expression instanceof SafePropertyRead) {
      node = findFirstMatchingNode(this.typeCheckBlock, {
        withSpan,
        filter: ts.isPropertyAccessExpression,
      });
    }

    // Otherwise fall back to searching for any AST node.
    if (node === null) {
      node = findFirstMatchingNode(this.typeCheckBlock, {withSpan, filter: anyNodeFilter});
    }

    // Safe property reads can be emitted as optional chaining in the TCB.
    // In that form, the full source span does not always map to a single node,
    // so fall back to resolving from the property name span.
    if (node === null && expression instanceof SafePropertyRead) {
      const nameNode = findFirstMatchingNode(this.typeCheckBlock, {
        withSpan: expression.nameSpan,
        filter: anyNodeFilter,
      });

      if (nameNode !== null) {
        node = nameNode;
        while (
          node.parent !== undefined &&
          (ts.isParenthesizedExpression(node.parent) ||
            ts.isNonNullExpression(node.parent) ||
            (ts.isPropertyAccessExpression(node.parent) && node.parent.name === node))
        ) {
          node = node.parent;
        }
      }
    }

    if (node === null) {
      return null;
    }

    while (ts.isParenthesizedExpression(node)) {
      node = node.expression;
    }

    // - If we have safe property read ("a?.b") in the legacy conditional form, we want to get the
    // Symbol for b, the `whenTrue` expression.
    // - If our expression is a pipe binding ("a | test:b:c"), we want the Symbol for the
    // `transform` on the pipe.
    // - Otherwise, we retrieve the symbol for the node itself with no special considerations
    if (expression instanceof SafePropertyRead && ts.isConditionalExpression(node)) {
      return {
        tcbLocation: this.getTcbLocationForNode(node.whenTrue),
        tcbTypeLocation: this.getTcbSpanForNode(node),
        kind: SymbolKind.Expression,
      };
    } else {
      return {
        tcbLocation: this.getTcbLocationForNode(node),
        tcbTypeLocation: this.getTcbSpanForNode(node),
        kind: SymbolKind.Expression,
      };
    }
  }

  private getTcbSpanForNode(node: ts.Node): TcbLocation {
    while (ts.isParenthesizedExpression(node)) {
      node = node.expression;
    }
    return {
      tcbPath: this.tcbPath,
      isShimFile: this.tcbIsShim,
      positionInFile: node.getStart(),
      endInFile: node.getEnd(),
    };
  }

  private getTcbLocationForNode(node: ts.Node): TcbLocation {
    while (ts.isParenthesizedExpression(node)) {
      node = node.expression;
    }
    return {
      tcbPath: this.tcbPath,
      isShimFile: this.tcbIsShim,
      positionInFile: this.getTcbPositionForNode(node),
    };
  }

  private getTcbPositionForNode(node: ts.Node): number {
    if (ts.isTypeReferenceNode(node)) {
      return this.getTcbPositionForNode(node.typeName);
    } else if (ts.isQualifiedName(node)) {
      return node.right.getStart();
    } else if (ts.isPropertyAccessExpression(node)) {
      return node.name.getStart();
    } else if (ts.isElementAccessExpression(node)) {
      return node.argumentExpression.getStart();
    } else if (ts.isCallExpression(node)) {
      return this.getTcbPositionForNode(node.expression);
    } else if (ts.isAsExpression(node)) {
      return this.getTcbPositionForNode(node.expression);
    } else if (ts.isNonNullExpression(node)) {
      return this.getTcbPositionForNode(node.expression);
    } else {
      return node.getStart();
    }
  }
}

/** Filter predicate function that matches any AST node. */
function anyNodeFilter(n: ts.Node): n is ts.Node {
  return true;
}

function sourceSpanEqual(a: ParseSourceSpan, b: ParseSourceSpan) {
  return a.start.offset === b.start.offset && a.end.offset === b.end.offset;
}

function unwrapSignalInputWriteTAccessor(expr: ts.LeftHandSideExpression): null | {
  fieldExpr: ts.ElementAccessExpression | ts.PropertyAccessExpression | ts.Identifier;
  typeExpr: ts.ElementAccessExpression;
} {
  // e.g. `_t2.inputA[i2.ɵINPUT_SIGNAL_BRAND_WRITE_TYPE]`
  // 1. Assert that we are dealing with an element access expression.
  // 2. Assert that we are dealing with a signal brand symbol access in the argument expression.
  if (
    !ts.isElementAccessExpression(expr) ||
    !ts.isPropertyAccessExpression(expr.argumentExpression)
  ) {
    return null;
  }

  // Assert that the property access in the element access is a simple identifier and
  // refers to `ɵINPUT_SIGNAL_BRAND_WRITE_TYPE`.
  if (
    !ts.isIdentifier(expr.argumentExpression.name) ||
    expr.argumentExpression.name.text !== R3Identifiers.InputSignalBrandWriteType.name
  ) {
    return null;
  }

  // Assert that the expression is either:
  //   - `_t2.inputA[ɵINPUT_SIGNAL_BRAND_WRITE_TYPE]` or (common case)
  //   - or `_t2['input-A'][ɵINPUT_SIGNAL_BRAND_WRITE_TYPE]` (non-identifier input field names)
  //   - or `_dirInput[ɵINPUT_SIGNAL_BRAND_WRITE_TYPE` (honorAccessModifiersForInputBindings=false)
  // This is checked for type safety and to catch unexpected cases.
  if (
    !ts.isPropertyAccessExpression(expr.expression) &&
    !ts.isElementAccessExpression(expr.expression) &&
    !ts.isIdentifier(expr.expression)
  ) {
    throw new Error('Unexpected expression for signal input write type.');
  }

  return {
    fieldExpr: expr.expression,
    typeExpr: expr,
  };
}

/**
 * Resolves the temporary variable that an input binding is assigned into when the input's class
 * member has restricted access (private/protected/readonly) and
 * `honorAccessModifiersForInputBindings` is disabled.
 *
 * Such bindings are generated as
 * `var _tmp = null! as (typeof _dir)["fieldName"]; null! as typeof _dir.fieldName; _tmp = expr;`,
 * so the member type and the directive instance (`_dir`) can be recovered from the indexed
 * access type in the declaration of the temporary variable, and the input's class member from
 * the qualified name in the accompanying type query statement. The type query statement is not
 * emitted for field names that are not valid identifiers, in which case the string literal of
 * the indexed access type is used (which TypeScript can resolve to the class member for e.g.
 * quick info and go to definition, but does not treat as a reference).
 */
function unwrapRestrictedFieldTempVariable(
  typeCheckBlock: ts.Node,
  id: ts.Identifier,
): null | {
  fieldNode: ts.Node;
  typeNode: ts.Node;
  instanceNode: ts.Node;
} {
  const declaration = findVariableDeclaration(typeCheckBlock, id.text);
  if (
    declaration === null ||
    declaration.initializer === undefined ||
    !ts.isAsExpression(declaration.initializer) ||
    !ts.isIndexedAccessTypeNode(declaration.initializer.type)
  ) {
    return null;
  }

  // `var _tmp = null! as (typeof _dir)["fieldName"];`
  const type = declaration.initializer.type;
  const {indexType} = type;
  let objectType: ts.TypeNode = type.objectType;
  while (ts.isParenthesizedTypeNode(objectType)) {
    objectType = objectType.type;
  }
  if (
    !ts.isTypeQueryNode(objectType) ||
    !ts.isIdentifier(objectType.exprName) ||
    !ts.isLiteralTypeNode(indexType) ||
    !ts.isStringLiteralLike(indexType.literal)
  ) {
    return null;
  }

  // `null! as typeof _dir.fieldName;`
  const fieldReference = findRestrictedFieldReference(
    typeCheckBlock,
    objectType.exprName.text,
    indexType.literal.text,
  );

  return {
    // The temporary variable's name is used for the type rather than the indexed access type
    // node: the variable's type is the widened one (fresh literal types of `readonly` fields
    // widen through the indexed access when declaring the variable), which is the type that the
    // binding is actually checked against.
    fieldNode: fieldReference ?? indexType.literal,
    typeNode: declaration.name,
    instanceNode: objectType.exprName,
  };
}

/**
 * Finds the qualified name of the `null! as typeof _dir.fieldName` statement that accompanies
 * the temporary variable of an input binding to a field with restricted access.
 */
function findRestrictedFieldReference(
  root: ts.Node,
  instanceName: string,
  fieldName: string,
): ts.QualifiedName | null {
  let result: ts.QualifiedName | null = null;
  const visit = (node: ts.Node): void => {
    if (result !== null) {
      return;
    }
    if (
      ts.isTypeQueryNode(node) &&
      ts.isQualifiedName(node.exprName) &&
      ts.isIdentifier(node.exprName.left) &&
      node.exprName.left.text === instanceName &&
      node.exprName.right.text === fieldName
    ) {
      result = node.exprName;
      return;
    }
    node.forEachChild(visit);
  };
  visit(root);
  return result;
}

/** Finds the declaration of the variable with the given name within the given node. */
function findVariableDeclaration(root: ts.Node, name: string): ts.VariableDeclaration | null {
  let result: ts.VariableDeclaration | null = null;
  const visit = (node: ts.Node): void => {
    if (result !== null) {
      return;
    }
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name) {
      result = node;
      return;
    }
    node.forEachChild(visit);
  };
  visit(root);
  return result;
}
