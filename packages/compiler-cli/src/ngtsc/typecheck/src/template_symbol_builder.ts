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
  MatchSource,
  ParseSourceSpan,
  PropertyRead,
  R3Identifiers,
  SafePropertyRead,
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
} from '@angular/compiler';
import ts from 'typescript';

import {AbsoluteFsPath} from '../../file_system';
import {Reference} from '../../imports';
import {HostDirectiveMeta, isHostDirectiveMetaForGlobalMode} from '../../metadata';

import {ClassDeclaration} from '../../reflection';
import {ComponentScopeKind, ComponentScopeReader} from '../../scope';
import {isAssignment, isSymbolWithValueDeclaration} from '../../util/src/typescript';
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
  TcbLocation,
  TemplateSymbol,
  TsNodeSymbolInfo,
  TypeCheckableDirectiveMeta,
  TypeCheckingConfig,
  VariableSymbol,
} from '../api';

import {
  ExpressionIdentifier,
  findAllMatchingNodes,
  findFirstMatchingNode,
  hasExpressionIdentifier,
} from './comments';
import {TypeCheckData} from './context';
import {isAccessExpression, isDirectiveDeclaration} from './ts_util';
import {MaybeSourceFileWithOriginalFile, NgOriginalFile} from '../../program_driver';

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
    private readonly typeCheckData: TypeCheckData,
    private readonly componentScopeReader: ComponentScopeReader,
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
    const nodes = findAllMatchingNodes(this.typeCheckBlock, {
      withSpan: elementSourceSpan,
      filter: isDirectiveDeclaration,
    });
    const symbols: DirectiveSymbol[] = [];
    const seenDirectives = new Set<ts.ClassDeclaration>();

    let boundDirectives = this.typeCheckData.boundTarget.getDirectivesOfNode(templateNode) ?? [];

    // 'getDirectivesOfNode' will not return the directives intended for an element
    // on a microsyntax template, for example '<div *ngFor="let user of users;" dir>',
    // the 'dir' will be skipped, but it's needed in language service.
    if (!(templateNode instanceof TmplAstDirective)) {
      const firstChild = templateNode.children?.[0];
      if (firstChild instanceof TmplAstElement) {
        const isMicrosyntaxTemplate =
          templateNode instanceof TmplAstTemplate &&
          sourceSpanEqual(firstChild.sourceSpan, templateNode.sourceSpan);
        if (isMicrosyntaxTemplate) {
          const firstChildDirectives =
            this.typeCheckData.boundTarget.getDirectivesOfNode(firstChild);
          if (firstChildDirectives !== null && boundDirectives.length > 0) {
            boundDirectives = boundDirectives.concat(firstChildDirectives);
          } else if (firstChildDirectives !== null) {
            boundDirectives = firstChildDirectives;
          }
        }
      }
    }

    const hostDirectiveMap = new Map<ts.Node, HostDirectiveMeta>();
    for (const d of boundDirectives) {
      if (d.hostDirectives) {
        for (const hd of d.hostDirectives) {
          if (isHostDirectiveMetaForGlobalMode(hd)) {
            hostDirectiveMap.set(hd.directive.node, hd);
          }
        }
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      let nodeName: string | null = null;
      let typeNode = ts.isTypeNode(node)
        ? node
        : ts.isIdentifier(node) && node.parent && ts.isVariableDeclaration(node.parent)
          ? node.parent.type
          : null;
      if (typeNode && ts.isTypeReferenceNode(typeNode)) {
        const typeName = typeNode.typeName;
        nodeName = ts.isIdentifier(typeName) ? typeName.text : typeName.right.text;
      } else if (typeNode && ts.isIntersectionTypeNode(typeNode)) {
        const first = typeNode.types[0];
        if (ts.isTypeReferenceNode(first)) {
          const typeName = first.typeName;
          nodeName = ts.isIdentifier(typeName) ? typeName.text : typeName.right.text;
        }
      }

      // Match by name with index fallback
      let meta = boundDirectives[i];
      if (nodeName) {
        meta =
          boundDirectives.find((m) => m.ref.node.name && m.ref.node.name.text === nodeName) ?? meta;
      }

      if (!meta) continue;

      const declaration = meta.ref.node as unknown as ts.ClassDeclaration;

      if (!seenDirectives.has(declaration)) {
        const ref = new Reference<ClassDeclaration>(declaration as ClassDeclaration);

        const hostMeta = hostDirectiveMap.get(declaration);
        const directiveSymbol: DirectiveSymbol = hostMeta
          ? {
              tcbLocation: this.getTcbLocationForNode(node),
              ref,
              selector: meta.selector,
              isComponent: meta.isComponent,
              ngModule: this.getDirectiveModule(declaration),
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
              ngModule: this.getDirectiveModule(declaration),
              kind: SymbolKind.Directive,
              isStructural: meta.isStructural,
              isInScope: true,
              tsCompletionEntryInfos: null,
              matchSource: MatchSource.Selector,
            };

        symbols.push(directiveSymbol);
        seenDirectives.add(declaration);
      }
    }

    // Sort to ensure host directives appear first (matching test expectations)
    symbols.sort((a, b) => {
      if (a.matchSource === MatchSource.HostDirective && b.matchSource === MatchSource.Selector) {
        return -1;
      }
      if (a.matchSource === MatchSource.Selector && b.matchSource === MatchSource.HostDirective) {
        return 1;
      }
      return 0;
    });

    return symbols;
  }

  private getDirectiveMeta(
    host: TmplAstTemplate | TmplAstElement | TmplAstComponent | TmplAstDirective,
    directiveDeclaration: ts.ClassDeclaration,
  ): TypeCheckableDirectiveMeta | null {
    let directives = this.typeCheckData.boundTarget.getDirectivesOfNode(host);

    // `getDirectivesOfNode` will not return the directives intended for an element
    // on a microsyntax template, for example `<div *ngFor="let user of users;" dir>`,
    // the `dir` will be skipped, but it's needed in language service.
    if (!(host instanceof TmplAstDirective)) {
      const firstChild = host.children[0];
      if (firstChild instanceof TmplAstElement) {
        const isMicrosyntaxTemplate =
          host instanceof TmplAstTemplate &&
          sourceSpanEqual(firstChild.sourceSpan, host.sourceSpan);
        if (isMicrosyntaxTemplate) {
          const firstChildDirectives =
            this.typeCheckData.boundTarget.getDirectivesOfNode(firstChild);
          if (firstChildDirectives !== null && directives !== null) {
            directives = directives.concat(firstChildDirectives);
          } else {
            directives = directives ?? firstChildDirectives;
          }
        }
      }
    }
    if (directives === null) {
      return null;
    }

    const directive = directives.find((m) =>
      isSameDirectiveDeclaration(m.ref.node, directiveDeclaration),
    );
    if (directive) {
      return directive;
    }

    const originalFile = (directiveDeclaration.getSourceFile() as MaybeSourceFileWithOriginalFile)[
      NgOriginalFile
    ];

    if (originalFile !== undefined) {
      // This is a preliminary check ahead of a more expensive search
      const hasPotentialCandidate = directives.find(
        (m) => m.ref.node.name.text === directiveDeclaration.name?.text,
      );

      if (hasPotentialCandidate) {
        // In case the TCB has been inlined,
        // We will look for a matching class
        // If we find one, we look for it in the directives array
        const classWithSameName = findMatchingDirective(originalFile, directiveDeclaration);
        if (classWithSameName !== null) {
          return (
            directives.find((m) => isSameDirectiveDeclaration(m.ref.node, classWithSameName)) ??
            null
          );
        }
      }
    }

    // Really nothing was found
    return null;
  }

  private getDirectiveModule(declaration: ts.ClassDeclaration): ClassDeclaration | null {
    const scope = this.componentScopeReader.getScopeForComponent(declaration as ClassDeclaration);
    if (scope === null || scope.kind !== ComponentScopeKind.NgModule) {
      return null;
    }
    return scope.ngModule;
  }

  private getSymbolOfBoundEvent(eventBinding: TmplAstBoundEvent): OutputBindingSymbol | null {
    const consumer = this.typeCheckData.boundTarget.getConsumerOfBinding(eventBinding);
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
    const consumer = this.typeCheckData.boundTarget.getConsumerOfBinding(binding);
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
      if (!isAccessExpression(node.left)) {
        continue;
      }

      const signalInputAssignment = unwrapSignalInputWriteTAccessor(node.left);
      let fieldAccessExpr: ts.PropertyAccessExpression | ts.ElementAccessExpression;
      // Signal inputs need special treatment because they are generated with an extra keyed
      // access. E.g. `_t1.prop[WriteT_ACCESSOR_SYMBOL]`. Observations:
      //   - The keyed access for the write type needs to be resolved for the "input type".
      //   - The definition symbol of the input should be the input class member, and not the
      //     internal write accessor. Symbol should resolve `_t1.prop`.
      let tcbLocation: TcbLocation;
      if (signalInputAssignment !== null) {
        // Note: If the field expression for the input binding refers to just an identifier,
        // then we are handling the case of a temporary variable being used for the input field.
        // This is the case with `honorAccessModifiersForInputBindings = false` and in those cases
        // we cannot resolve the owning directive, similar to how we guard above with `isAccessExpression`.
        if (ts.isIdentifier(signalInputAssignment.fieldExpr)) {
          continue;
        }

        fieldAccessExpr = signalInputAssignment.fieldExpr;
        tcbLocation = this.getTcbLocationForNode(fieldAccessExpr);
      } else {
        fieldAccessExpr = node.left;
        tcbLocation = this.getTcbLocationForNode(fieldAccessExpr);
      }

      const target = this.getDirectiveSymbolForAccessExpression(fieldAccessExpr, consumer);
      if (target === null) {
        continue;
      }

      if (!consumer.inputs.hasBindingPropertyName(binding.name)) {
        continue;
      }

      bindings.push({
        tcbLocation,
        tcbTypeLocation: this.getTcbSpanForNode(fieldAccessExpr),
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
    meta: TypeCheckableDirectiveMeta,
  ): DirectiveSymbol | null {
    const ngModule = this.getDirectiveModule(meta.ref.node as unknown as ts.ClassDeclaration);

    return {
      ref: meta.ref,
      kind: SymbolKind.Directive,
      tcbLocation: this.getTcbLocationForNode(fieldAccessExpr.expression),
      isComponent: meta.isComponent,
      isStructural: meta.isStructural,
      selector: meta.selector,
      ngModule,
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
    const target = this.typeCheckData.boundTarget.getReferenceTarget(ref);
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
      if (!ts.isClassDeclaration(target.directive.ref.node)) {
        return null;
      }

      return {
        kind: SymbolKind.Reference,
        declaration: ref,
        target: target.directive.ref.node,
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
    } as any;
  }

  private getSymbolOfTemplateExpression(
    expression: AST,
  ): VariableSymbol | ReferenceSymbol | ExpressionSymbol | LetDeclarationSymbol | null {
    if (expression instanceof ASTWithSource) {
      expression = expression.ast;
    }

    const expressionTarget = this.typeCheckData.boundTarget.getExpressionTarget(expression);
    if (expressionTarget !== null) {
      return this.getSymbol(expressionTarget);
    }

    let withSpan = expression.sourceSpan;

    // The `name` part of a property write and `ASTWithName` do not have their own
    // AST so there is no way to retrieve a `Symbol` for just the `name` via a specific node.
    // Also skipping SafePropertyReads as it breaks nullish coalescing not nullable extended diagnostic
    if (
      expression instanceof Binary &&
      Binary.isAssignmentOperation(expression.operation) &&
      expression.left instanceof PropertyRead
    ) {
      withSpan = expression.left.nameSpan;
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
    if (expression instanceof PropertyRead) {
      node = findFirstMatchingNode(this.typeCheckBlock, {
        withSpan,
        filter: ts.isPropertyAccessExpression,
      });
    }

    // Otherwise fall back to searching for any AST node.
    if (node === null) {
      node = findFirstMatchingNode(this.typeCheckBlock, {withSpan, filter: anyNodeFilter});
    }

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
 * Checks whether two directive declarations are the same.
 *
 * This function accounts for the fact that TypeScript might return different `ClassDeclaration`
 * instances for the same file, such as when resolving `ExternalExpr` imports from `tcb_adapter`s
 * `NoAliasing` emit flag.
 */
function isSameDirectiveDeclaration(
  a: ts.ClassDeclaration | ClassDeclaration,
  b: ts.ClassDeclaration | ClassDeclaration,
): boolean {
  if (a === b) {
    return true;
  }
  const aName = a.name?.text;
  const bName = b.name?.text;
  return (
    aName !== undefined &&
    bName !== undefined &&
    aName === bName &&
    a.getSourceFile().fileName === b.getSourceFile().fileName
  );
}

/**
 * Looks for a class declaration in the original source file that matches a given directive
 * from the type check source file.
 *
 * @param originalSourceFile The original source where the runtime code resides
 * @param directiveDeclarationInTypeCheckSourceFile The directive from the type check source file
 */
function findMatchingDirective(
  originalSourceFile: ts.SourceFile,
  directiveDeclarationInTypeCheckSourceFile: ts.ClassDeclaration,
): ts.ClassDeclaration | null {
  const className = directiveDeclarationInTypeCheckSourceFile.name?.text ?? '';
  // We build an index of the class declarations with the same name
  // To then compare the indexes to confirm we found the right class declaration
  const ogClasses = collectClassesWithName(originalSourceFile, className);
  const typecheckClasses = collectClassesWithName(
    directiveDeclarationInTypeCheckSourceFile.getSourceFile(),
    className,
  );

  return ogClasses[typecheckClasses.indexOf(directiveDeclarationInTypeCheckSourceFile)] ?? null;
}

/**
 * Builds a list of class declarations of a given name
 * Is used as a index based reference to compare class declarations
 * between the typecheck source file and the original source file
 */
function collectClassesWithName(
  sourceFile: ts.SourceFile,
  className: string,
): ts.ClassDeclaration[] {
  const classes: ts.ClassDeclaration[] = [];
  function visit(node: ts.Node) {
    if (ts.isClassDeclaration(node) && node.name?.text === className) {
      classes.push(node);
    }
    ts.forEachChild(node, visit);
  }
  sourceFile.forEachChild(visit);

  return classes;
}

function extractNameFromTypeNode(node: ts.Node): string | null {
  if (ts.isTypeQueryNode(node)) {
    let expr = node.exprName;
    while (ts.isQualifiedName(expr)) expr = expr.right;
    if (ts.isIdentifier(expr)) return expr.text;
  } else if (ts.isTypeReferenceNode(node)) {
    let typeName = node.typeName;
    while (ts.isQualifiedName(typeName)) typeName = typeName.right;
    if (ts.isIdentifier(typeName)) return typeName.text;
  }
  return null;
}
