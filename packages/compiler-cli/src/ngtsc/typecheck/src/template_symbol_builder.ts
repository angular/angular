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
  VariableSymbol,
} from '../api';

import {
  ExpressionIdentifier,
  findAllMatchingNodes,
  findFirstMatchingNode,
  hasExpressionIdentifier,
} from './comments';
import {TypeCheckData} from './context';
import {isAccessExpression} from './ts_util';
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
    // The `ts.TypeChecker` depends on the current type-checking program, and so must be requested
    // on-demand instead of cached.
    private readonly getTypeChecker: () => ts.TypeChecker,
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

  private getSymbolOfSelectorlessComponent(
    node: TmplAstComponent,
  ): SelectorlessComponentSymbol | null {
    const directives = this.getDirectivesOfNode(node);
    const primaryDirective =
      directives.find((dir) => !dir.isHostDirective && dir.isComponent) ?? null;

    if (primaryDirective === null) {
      return null;
    }

    return {
      tsType: primaryDirective.tsType,
      tsSymbol: primaryDirective.tsSymbol,
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
      directives.find((dir) => !dir.isHostDirective && !dir.isComponent) ?? null;

    if (primaryDirective === null) {
      return null;
    }

    return {
      tsType: primaryDirective.tsType,
      tsSymbol: primaryDirective.tsSymbol,
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
    const tcbSourceFile = this.typeCheckBlock.getSourceFile();
    // directives could be either:
    // - var _t1: TestDir /*T:D*/ = null! as TestDir;
    // - var _t1 /*T:D*/ = _ctor1({});
    const isDirectiveDeclaration = (node: ts.Node): node is ts.TypeNode | ts.Identifier =>
      (ts.isTypeNode(node) || ts.isIdentifier(node)) &&
      ts.isVariableDeclaration(node.parent) &&
      hasExpressionIdentifier(tcbSourceFile, node, ExpressionIdentifier.DIRECTIVE);

    const nodes = findAllMatchingNodes(this.typeCheckBlock, {
      withSpan: elementSourceSpan,
      filter: isDirectiveDeclaration,
    });
    const symbols: DirectiveSymbol[] = [];
    const seenDirectives = new Set<ts.ClassDeclaration>();

    for (const node of nodes) {
      const symbol = this.getSymbolOfTsNode(node.parent);
      if (
        symbol === null ||
        !isSymbolWithValueDeclaration(symbol.tsSymbol) ||
        !ts.isClassDeclaration(symbol.tsSymbol.valueDeclaration)
      ) {
        continue;
      }

      const declaration = symbol.tsSymbol.valueDeclaration;
      const meta = this.getDirectiveMeta(templateNode, declaration);

      // Host directives will be added as identifiers with the same offset as the host
      // which means that they'll get added twice. De-duplicate them to avoid confusion.
      if (meta !== null && !seenDirectives.has(declaration)) {
        const ref = new Reference<ClassDeclaration>(declaration as ClassDeclaration);

        if (meta.hostDirectives !== null) {
          this.addHostDirectiveSymbols(templateNode, meta.hostDirectives, symbols, seenDirectives);
        }

        const directiveSymbol: DirectiveSymbol = {
          ...symbol,
          ref,
          tsSymbol: symbol.tsSymbol,
          selector: meta.selector,
          isComponent: meta.isComponent,
          ngModule: this.getDirectiveModule(declaration),
          kind: SymbolKind.Directive,
          isStructural: meta.isStructural,
          isInScope: true,
          isHostDirective: false,
          tsCompletionEntryInfos: null,
        };

        symbols.push(directiveSymbol);
        seenDirectives.add(declaration);
      }
    }

    return symbols;
  }

  private addHostDirectiveSymbols(
    host: TmplAstTemplate | TmplAstElement | TmplAstComponent | TmplAstDirective,
    hostDirectives: HostDirectiveMeta[],
    symbols: DirectiveSymbol[],
    seenDirectives: Set<ts.ClassDeclaration>,
  ): void {
    for (const current of hostDirectives) {
      if (!isHostDirectiveMetaForGlobalMode(current)) {
        throw new Error('Impossible state: typecheck code path in local compilation mode.');
      }

      const node = current.directive.node;

      if (!ts.isClassDeclaration(node) || seenDirectives.has(node)) {
        continue;
      }

      const symbol = this.getSymbolOfTsNode(node);
      const meta = this.getDirectiveMeta(host, node);

      if (meta !== null && symbol !== null && isSymbolWithValueDeclaration(symbol.tsSymbol)) {
        if (meta.hostDirectives !== null) {
          this.addHostDirectiveSymbols(host, meta.hostDirectives, symbols, seenDirectives);
        }

        const directiveSymbol: DirectiveSymbol = {
          ...symbol,
          isHostDirective: true,
          ref: current.directive,
          tsSymbol: symbol.tsSymbol,
          exposedInputs: current.inputs,
          exposedOutputs: current.outputs,
          selector: meta.selector,
          isComponent: meta.isComponent,
          ngModule: this.getDirectiveModule(node),
          kind: SymbolKind.Directive,
          isStructural: meta.isStructural,
          isInScope: true,
          tsCompletionEntryInfos: null,
        };

        symbols.push(directiveSymbol);
        seenDirectives.add(node);
      }
    }
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

    const directive = directives.find((m) => m.ref.node === directiveDeclaration);
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
          return directives.find((m) => m.ref.node === classWithSameName) ?? null;
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
        const tsSymbol = this.getTypeChecker().getSymbolAtLocation(addEventListener);
        const tsType = this.getTypeChecker().getTypeAtLocation(addEventListener);
        const positionInFile = this.getTcbPositionForNode(addEventListener);
        const target = this.getSymbol(consumer);

        if (target === null || tsSymbol === undefined) {
          continue;
        }

        bindings.push({
          kind: SymbolKind.Binding,
          tsSymbol,
          tsType,
          target,
          tcbLocation: {
            tcbPath: this.tcbPath,
            isShimFile: this.tcbIsShim,
            positionInFile,
          },
        });
      } else {
        if (!ts.isElementAccessExpression(outputFieldAccess)) {
          continue;
        }
        const tsSymbol = this.getTypeChecker().getSymbolAtLocation(
          outputFieldAccess.argumentExpression,
        );
        if (tsSymbol === undefined) {
          continue;
        }

        const target = this.getDirectiveSymbolForAccessExpression(outputFieldAccess, consumer);
        if (target === null) {
          continue;
        }

        const positionInFile = this.getTcbPositionForNode(outputFieldAccess);
        const tsType = this.getTypeChecker().getTypeAtLocation(outputFieldAccess);
        bindings.push({
          kind: SymbolKind.Binding,
          tsSymbol,
          tsType,
          target,
          tcbLocation: {
            tcbPath: this.tcbPath,
            isShimFile: this.tcbIsShim,
            positionInFile,
          },
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
      let symbolInfo: TsNodeSymbolInfo | null = null;

      // Signal inputs need special treatment because they are generated with an extra keyed
      // access. E.g. `_t1.prop[WriteT_ACCESSOR_SYMBOL]`. Observations:
      //   - The keyed access for the write type needs to be resolved for the "input type".
      //   - The definition symbol of the input should be the input class member, and not the
      //     internal write accessor. Symbol should resolve `_t1.prop`.
      if (signalInputAssignment !== null) {
        // Note: If the field expression for the input binding refers to just an identifier,
        // then we are handling the case of a temporary variable being used for the input field.
        // This is the case with `honorAccessModifiersForInputBindings = false` and in those cases
        // we cannot resolve the owning directive, similar to how we guard above with `isAccessExpression`.
        if (ts.isIdentifier(signalInputAssignment.fieldExpr)) {
          continue;
        }

        const fieldSymbol = this.getSymbolOfTsNode(signalInputAssignment.fieldExpr);
        const typeSymbol = this.getSymbolOfTsNode(signalInputAssignment.typeExpr);

        fieldAccessExpr = signalInputAssignment.fieldExpr;
        symbolInfo =
          fieldSymbol === null || typeSymbol === null
            ? null
            : {
                tcbLocation: fieldSymbol.tcbLocation,
                tsSymbol: fieldSymbol.tsSymbol,
                tsType: typeSymbol.tsType,
              };
      } else {
        fieldAccessExpr = node.left;
        symbolInfo = this.getSymbolOfTsNode(node.left);
      }

      if (symbolInfo === null || symbolInfo.tsSymbol === null) {
        continue;
      }

      const target = this.getDirectiveSymbolForAccessExpression(fieldAccessExpr, consumer);
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
    fieldAccessExpr: ts.ElementAccessExpression | ts.PropertyAccessExpression,
    {isComponent, selector, isStructural}: TypeCheckableDirectiveMeta,
  ): DirectiveSymbol | null {
    // In all cases, `_t1["index"]` or `_t1.index`, `node.expression` is _t1.
    const tsSymbol = this.getTypeChecker().getSymbolAtLocation(fieldAccessExpr.expression);
    if (tsSymbol?.declarations === undefined || tsSymbol.declarations.length === 0) {
      return null;
    }

    const [declaration] = tsSymbol.declarations;
    if (
      !ts.isVariableDeclaration(declaration) ||
      !hasExpressionIdentifier(
        // The expression identifier could be on the type (for regular directives) or the name
        // (for generic directives and the ctor op).
        declaration.getSourceFile(),
        declaration.type ?? declaration.name,
        ExpressionIdentifier.DIRECTIVE,
      )
    ) {
      return null;
    }

    const symbol = this.getSymbolOfTsNode(declaration);
    if (
      symbol === null ||
      !isSymbolWithValueDeclaration(symbol.tsSymbol) ||
      !ts.isClassDeclaration(symbol.tsSymbol.valueDeclaration)
    ) {
      return null;
    }

    const ref: Reference<ClassDeclaration> = new Reference(symbol.tsSymbol.valueDeclaration as any);
    const ngModule = this.getDirectiveModule(symbol.tsSymbol.valueDeclaration);
    return {
      ref,
      kind: SymbolKind.Directive,
      tsSymbol: symbol.tsSymbol,
      tsType: symbol.tsType,
      tcbLocation: symbol.tcbLocation,
      isComponent,
      isStructural,
      selector,
      ngModule,
      isHostDirective: false,
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

    let nodeValueSymbol: TsNodeSymbolInfo | null = null;
    if (ts.isForOfStatement(node.parent.parent)) {
      nodeValueSymbol = this.getSymbolOfTsNode(node);
    } else if (node.initializer !== undefined) {
      nodeValueSymbol = this.getSymbolOfTsNode(node.initializer);
    }

    if (nodeValueSymbol === null) {
      return null;
    }

    return {
      tsType: nodeValueSymbol.tsType,
      tsSymbol: nodeValueSymbol.tsSymbol,
      initializerLocation: nodeValueSymbol.tcbLocation,
      kind: SymbolKind.Variable,
      declaration: variable,
      localVarLocation: {
        tcbPath: this.tcbPath,
        isShimFile: this.tcbIsShim,
        positionInFile: this.getTcbPositionForNode(node.name),
      },
    };
  }

  private getSymbolOfReference(ref: TmplAstReference): ReferenceSymbol | null {
    const target = this.typeCheckData.boundTarget.getReferenceTarget(ref);
    // Find the node for the reference declaration, i.e. `var _t2 = _t1;`
    let node = findFirstMatchingNode(this.typeCheckBlock, {
      withSpan: ref.sourceSpan,
      filter: ts.isVariableDeclaration,
    });
    if (node === null || target === null || node.initializer === undefined) {
      return null;
    }

    // Get the original declaration for the references variable, with the exception of template refs
    // which are of the form var _t3 = (_t2 as any as i2.TemplateRef<any>)
    // TODO(atscott): Consider adding an `ExpressionIdentifier` to tag variable declaration
    // initializers as invalid for symbol retrieval.
    const originalDeclaration =
      ts.isParenthesizedExpression(node.initializer) &&
      ts.isAsExpression(node.initializer.expression)
        ? this.getTypeChecker().getSymbolAtLocation(node.name)
        : this.getTypeChecker().getSymbolAtLocation(node.initializer);
    if (originalDeclaration === undefined || originalDeclaration.valueDeclaration === undefined) {
      return null;
    }
    const symbol = this.getSymbolOfTsNode(originalDeclaration.valueDeclaration);
    if (symbol === null || symbol.tsSymbol === null) {
      return null;
    }

    const referenceVarTcbLocation: TcbLocation = {
      tcbPath: this.tcbPath,
      isShimFile: this.tcbIsShim,
      positionInFile: this.getTcbPositionForNode(node),
    };
    if (target instanceof TmplAstTemplate || target instanceof TmplAstElement) {
      return {
        kind: SymbolKind.Reference,
        tsSymbol: symbol.tsSymbol,
        tsType: symbol.tsType,
        target,
        declaration: ref,
        targetLocation: symbol.tcbLocation,
        referenceVarLocation: referenceVarTcbLocation,
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
        targetLocation: symbol.tcbLocation,
        referenceVarLocation: referenceVarTcbLocation,
      };
    }
  }

  private getSymbolOfLetDeclaration(decl: TmplAstLetDeclaration): LetDeclarationSymbol | null {
    const node = findFirstMatchingNode(this.typeCheckBlock, {
      withSpan: decl.sourceSpan,
      filter: ts.isVariableDeclaration,
    });

    if (node === null) {
      return null;
    }

    const nodeValueSymbol = this.getSymbolOfTsNode(node.initializer!);

    if (nodeValueSymbol === null) {
      return null;
    }

    return {
      tsType: nodeValueSymbol.tsType,
      tsSymbol: nodeValueSymbol.tsSymbol,
      initializerLocation: nodeValueSymbol.tcbLocation,
      kind: SymbolKind.LetDeclaration,
      declaration: decl,
      localVarLocation: {
        tcbPath: this.tcbPath,
        isShimFile: this.tcbIsShim,
        positionInFile: this.getTcbPositionForNode(node.name),
      },
    };
  }

  private getSymbolOfPipe(expression: BindingPipe): PipeSymbol | null {
    const methodAccess = findFirstMatchingNode(this.typeCheckBlock, {
      withSpan: expression.nameSpan,
      filter: ts.isPropertyAccessExpression,
    });
    if (methodAccess === null) {
      return null;
    }

    const pipeVariableNode = methodAccess.expression;
    const pipeDeclaration = this.getTypeChecker().getSymbolAtLocation(pipeVariableNode);
    if (pipeDeclaration === undefined || pipeDeclaration.valueDeclaration === undefined) {
      return null;
    }

    const pipeInstance = this.getSymbolOfTsNode(pipeDeclaration.valueDeclaration);
    // The instance should never be null, nor should the symbol lack a value declaration. This
    // is because the node used to look for the `pipeInstance` symbol info is a value
    // declaration of another symbol (i.e. the `pipeDeclaration` symbol).
    if (pipeInstance === null || !isSymbolWithValueDeclaration(pipeInstance.tsSymbol)) {
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
    } else if (expression instanceof ASTWithName && !(expression instanceof SafePropertyRead)) {
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
      const whenTrueSymbol = this.getSymbolOfTsNode(node.whenTrue);
      if (whenTrueSymbol === null) {
        return null;
      }

      return {
        ...whenTrueSymbol,
        kind: SymbolKind.Expression,
        // Rather than using the type of only the `whenTrue` part of the expression, we should
        // still get the type of the whole conditional expression to include `|undefined`.
        tsType: this.getTypeChecker().getTypeAtLocation(node),
      };
    } else {
      const symbolInfo = this.getSymbolOfTsNode(node);
      return symbolInfo === null ? null : {...symbolInfo, kind: SymbolKind.Expression};
    }
  }

  private getSymbolOfTsNode(node: ts.Node): TsNodeSymbolInfo | null {
    while (ts.isParenthesizedExpression(node)) {
      node = node.expression;
    }

    let tsSymbol: ts.Symbol | undefined;
    if (ts.isPropertyAccessExpression(node)) {
      tsSymbol = this.getTypeChecker().getSymbolAtLocation(node.name);
    } else if (ts.isCallExpression(node)) {
      tsSymbol = this.getTypeChecker().getSymbolAtLocation(node.expression);
    } else {
      tsSymbol = this.getTypeChecker().getSymbolAtLocation(node);
    }

    const positionInFile = this.getTcbPositionForNode(node);
    const type = this.getTypeChecker().getTypeAtLocation(node);
    return {
      // If we could not find a symbol, fall back to the symbol on the type for the node.
      // Some nodes won't have a "symbol at location" but will have a symbol for the type.
      // Examples of this would be literals and `document.createElement('div')`.
      tsSymbol: tsSymbol ?? type.symbol ?? null,
      tsType: type,
      tcbLocation: {
        tcbPath: this.tcbPath,
        isShimFile: this.tcbIsShim,
        positionInFile,
      },
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
