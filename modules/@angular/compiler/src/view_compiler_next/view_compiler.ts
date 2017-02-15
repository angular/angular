/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy} from '@angular/core';

import {AnimationEntryCompileResult} from '../animation/animation_compiler';
import {CompileDiDependencyMetadata, CompileDirectiveMetadata, CompileDirectiveSummary, CompilePipeSummary, CompileProviderMetadata, CompileTokenMetadata, identifierModuleUrl, identifierName, tokenReference} from '../compile_metadata';
import {BuiltinConverter, BuiltinConverterFactory, EventHandlerVars, LocalResolver, convertActionBinding, convertPropertyBinding, convertPropertyBindingBuiltins} from '../compiler_util/expression_converter';
import {CompilerConfig} from '../config';
import {AST, ASTWithSource, Interpolation} from '../expression_parser/ast';
import {Identifiers, createIdentifier, resolveIdentifier} from '../identifiers';
import {CompilerInjectable} from '../injectable';
import * as o from '../output/output_ast';
import {convertValueToOutputAst} from '../output/value_util';
import {LifecycleHooks, viewEngine} from '../private_import_core';
import {ElementSchemaRegistry} from '../schema/element_schema_registry';
import {AttrAst, BoundDirectivePropertyAst, BoundElementPropertyAst, BoundEventAst, BoundTextAst, DirectiveAst, ElementAst, EmbeddedTemplateAst, NgContentAst, PropertyBindingType, ProviderAst, ProviderAstType, QueryId, QueryMatch, ReferenceAst, TemplateAst, TemplateAstVisitor, TextAst, VariableAst, templateVisitAll} from '../template_parser/template_ast';
import {ViewEncapsulationEnum} from '../view_compiler/constants';
import {ComponentFactoryDependency, ComponentViewDependency, DirectiveWrapperDependency, ViewCompileResult, ViewCompiler} from '../view_compiler/view_compiler';

const CLASS_ATTR = 'class';
const STYLE_ATTR = 'style';
const IMPLICIT_TEMPLATE_VAR = '\$implicit';

@CompilerInjectable()
export class ViewCompilerNext extends ViewCompiler {
  constructor(
      private _genConfigNext: CompilerConfig, private _schemaRegistryNext: ElementSchemaRegistry) {
    super(_genConfigNext, _schemaRegistryNext);
  }

  compileComponent(
      component: CompileDirectiveMetadata, template: TemplateAst[], styles: o.Expression,
      usedPipes: CompilePipeSummary[],
      compiledAnimations: AnimationEntryCompileResult[]): ViewCompileResult {
    const compName = identifierName(component.type) + (component.isHost ? `_Host` : '');

    let embeddedViewCount = 0;

    const viewBuilderFactory = (parent: ViewBuilder): ViewBuilder => {
      const embeddedViewIndex = embeddedViewCount++;
      const viewName = `view_${compName}_${embeddedViewIndex}`;
      return new ViewBuilder(parent, viewName, usedPipes, viewBuilderFactory);
    };

    const visitor = viewBuilderFactory(null);
    visitor.visitAll([], template, 0);

    const statements: o.Statement[] = [];
    statements.push(...visitor.build(component));

    return new ViewCompileResult(statements, visitor.viewName, []);
  }
}

interface ViewBuilderFactory {
  (parent: ViewBuilder): ViewBuilder;
}

interface UpdateExpression {
  nodeIndex: number;
  expressions: {context: o.Expression, value: AST}[];
}

interface HandleEventExpression {
  nodeIndex: number;
  context: o.Expression;
  eventName: string;
  expression: AST;
}

const VIEW_VAR = o.variable('view');
const CHECK_VAR = o.variable('check');
const COMP_VAR = o.variable('comp');
const NODE_INDEX_VAR = o.variable('nodeIndex');
const EVENT_NAME_VAR = o.variable('eventName');
const ALLOW_DEFAULT_VAR = o.variable(`allowDefault`);

class ViewBuilder implements TemplateAstVisitor, LocalResolver, BuiltinConverterFactory {
  private nodeDefs: o.Expression[] = [];
  private purePipeNodeIndices: {[pipeName: string]: number} = {};
  private refNodeIndices: {[refName: string]: number} = {};
  private variables: VariableAst[] = [];
  private children: ViewBuilder[] = [];
  private updateDirectivesExpressions: UpdateExpression[] = [];
  private updateRendererExpressions: UpdateExpression[] = [];
  private handleEventExpressions: HandleEventExpression[] = [];

  constructor(
      private parent: ViewBuilder, public viewName: string, private usedPipes: CompilePipeSummary[],
      private viewBuilderFactory: ViewBuilderFactory) {}

  visitAll(variables: VariableAst[], astNodes: TemplateAst[], elementDepth: number) {
    this.variables = variables;
    // create the pipes for the pure pipes immediately, so that we know their indices.
    if (!this.parent) {
      this.usedPipes.forEach((pipe) => {
        if (pipe.pure) {
          this.purePipeNodeIndices[pipe.name] = this._createPipe(pipe);
        }
      });
    }

    templateVisitAll(this, astNodes, {elementDepth});
    if (astNodes.length === 0 ||
        (this.parent && needsAdditionalRootNode(astNodes[astNodes.length - 1]))) {
      // if the view is empty, or an embedded view has a view container as last root nde,
      // create an additional root node.
      this.nodeDefs.push(o.importExpr(createIdentifier(Identifiers.anchorDef)).callFn([
        o.literal(viewEngine.NodeFlags.None), o.NULL_EXPR, o.NULL_EXPR, o.literal(0)
      ]));
    }
  }

  build(component: CompileDirectiveMetadata, targetStatements: o.Statement[] = []): o.Statement[] {
    const compType = o.importType(component.type);
    this.children.forEach((child) => { child.build(component, targetStatements); });

    const updateDirectivesFn = this._createUpdateFn(this.updateDirectivesExpressions, compType);
    const updateRendererFn = this._createUpdateFn(this.updateRendererExpressions, compType);

    const handleEventStmts: o.Statement[] = [];
    let handleEventBindingCount = 0;
    this.handleEventExpressions.forEach(({expression, context, nodeIndex, eventName}) => {
      const bindingId = `${handleEventBindingCount++}`;
      const nameResolver = context === COMP_VAR ? this : null;
      const {stmts, allowDefault} =
          convertActionBinding(nameResolver, context, expression, bindingId);
      const trueStmts = stmts;
      if (allowDefault) {
        trueStmts.push(ALLOW_DEFAULT_VAR.set(allowDefault.and(ALLOW_DEFAULT_VAR)).toStmt());
      }
      handleEventStmts.push(new o.IfStmt(
          o.literal(nodeIndex)
              .identical(NODE_INDEX_VAR)
              .and(o.literal(eventName).identical(EVENT_NAME_VAR)),
          trueStmts));
    });
    let handleEventFn: o.Expression;
    if (handleEventStmts.length > 0) {
      handleEventFn = o.fn(
          [
            new o.FnParam(VIEW_VAR.name), new o.FnParam(NODE_INDEX_VAR.name),
            new o.FnParam(EVENT_NAME_VAR.name), new o.FnParam(EventHandlerVars.event.name)
          ],
          [
            ALLOW_DEFAULT_VAR.set(o.literal(true)).toDeclStmt(o.BOOL_TYPE),
            COMP_VAR.set(VIEW_VAR.prop('component')).toDeclStmt(compType), ...handleEventStmts,
            new o.ReturnStatement(ALLOW_DEFAULT_VAR)
          ]);
    } else {
      handleEventFn = o.NULL_EXPR;
    }

    let viewFlags = viewEngine.ViewFlags.None;
    if (!this.parent && component.changeDetection === ChangeDetectionStrategy.OnPush) {
      viewFlags |= viewEngine.ViewFlags.OnPush;
    }
    const viewFactory = new o.DeclareFunctionStmt(
        this.viewName, [],
        [new o.ReturnStatement(o.importExpr(createIdentifier(Identifiers.viewDef)).callFn([
          o.literal(viewFlags), o.literalArr(this.nodeDefs), updateDirectivesFn, updateRendererFn,
          handleEventFn
        ]))]);

    targetStatements.push(viewFactory);
    return targetStatements;
  }

  private _createUpdateFn(expressions: UpdateExpression[], compType: o.Type): o.Expression {
    const updateStmts: o.Statement[] = [];
    let updateBindingCount = 0;
    expressions.forEach(({expressions, nodeIndex}) => {
      const exprs = expressions.map(({context, value}) => {
        const bindingId = `${updateBindingCount++}`;
        const nameResolver = context === COMP_VAR ? this : null;
        const {stmts, currValExpr} =
            convertPropertyBinding(nameResolver, context, value, bindingId);
        updateStmts.push(...stmts);
        return currValExpr;
      });
      updateStmts.push(callCheckStmt(nodeIndex, exprs).toStmt());
    });
    let updateFn: o.Expression;
    if (updateStmts.length > 0) {
      updateFn = o.fn(
          [new o.FnParam(CHECK_VAR.name), new o.FnParam(VIEW_VAR.name)],
          [COMP_VAR.set(VIEW_VAR.prop('component')).toDeclStmt(compType), ...updateStmts]);
    } else {
      updateFn = o.NULL_EXPR;
    }
    return updateFn;
  }

  visitNgContent(ast: NgContentAst, context: any): any {}

  visitText(ast: TextAst, context: any): any {
    // textDef(ngContentIndex: number, constants: string[]): NodeDef;
    this.nodeDefs.push(o.importExpr(createIdentifier(Identifiers.textDef)).callFn([
      o.NULL_EXPR, o.literalArr([o.literal(ast.value)])
    ]));
  }

  visitBoundText(ast: BoundTextAst, context: any): any {
    const nodeIndex = this.nodeDefs.length;
    // reserve the space in the nodeDefs array
    this.nodeDefs.push(null);

    const astWithSource = <ASTWithSource>ast.value;
    const inter = <Interpolation>astWithSource.ast;

    this._addUpdateExpressions(
        nodeIndex, inter.expressions.map((expr) => { return {context: COMP_VAR, value: expr}; }),
        this.updateRendererExpressions);

    // textDef(ngContentIndex: number, constants: string[]): NodeDef;
    this.nodeDefs[nodeIndex] = o.importExpr(createIdentifier(Identifiers.textDef)).callFn([
      o.NULL_EXPR, o.literalArr(inter.strings.map(s => o.literal(s)))
    ]);
  }

  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: {elementDepth: number}): any {
    const nodeIndex = this.nodeDefs.length;
    // reserve the space in the nodeDefs array
    this.nodeDefs.push(null);

    const {flags, queryMatchesExpr} = this._visitElementOrTemplate(nodeIndex, ast, context);

    const childVisitor = this.viewBuilderFactory(this);
    this.children.push(childVisitor);
    childVisitor.visitAll(ast.variables, ast.children, context.elementDepth + 1);

    const childCount = this.nodeDefs.length - nodeIndex - 1;

    // anchorDef(
    //   flags: NodeFlags, matchedQueries: [string, QueryValueType][], ngContentIndex: number,
    //   childCount: number, templateFactory?: ViewDefinitionFactory): NodeDef;
    this.nodeDefs[nodeIndex] = o.importExpr(createIdentifier(Identifiers.anchorDef)).callFn([
      o.literal(flags), queryMatchesExpr, o.NULL_EXPR, o.literal(childCount),
      o.variable(childVisitor.viewName)
    ]);
  }

  visitElement(ast: ElementAst, context: {elementDepth: number}): any {
    const nodeIndex = this.nodeDefs.length;
    // reserve the space in the nodeDefs array so we can add children
    this.nodeDefs.push(null);

    const {flags, usedEvents, queryMatchesExpr, hostBindings} =
        this._visitElementOrTemplate(nodeIndex, ast, context);

    templateVisitAll(this, ast.children, {elementDepth: context.elementDepth + 1});

    ast.inputs.forEach(
        (inputAst) => { hostBindings.push({context: COMP_VAR, value: inputAst.value}); });
    this._addUpdateExpressions(nodeIndex, hostBindings, this.updateRendererExpressions);

    const inputDefs = elementBindingDefs(ast.inputs);
    ast.directives.forEach(
        (dirAst, dirIndex) => { inputDefs.push(...elementBindingDefs(dirAst.hostProperties)); });
    const outputDefs = usedEvents.map(([target, eventName]) => {
      return target ? o.literalArr([o.literal(target), o.literal(eventName)]) :
                      o.literal(eventName);
    });

    const childCount = this.nodeDefs.length - nodeIndex - 1;

    // elementDef(
    //   flags: NodeFlags, matchedQueries: [string, QueryValueType][], ngContentIndex: number,
    //   childCount: number, name: string, fixedAttrs: {[name: string]: string} = {},
    //   bindings?:
    //       ([BindingType.ElementClass, string] | [BindingType.ElementStyle, string, string] |
    //         [BindingType.ElementAttribute | BindingType.ElementProperty, string,
    //         SecurityContext])[],
    //   outputs?: (string | [string, string])[]): NodeDef;
    this.nodeDefs[nodeIndex] = o.importExpr(createIdentifier(Identifiers.elementDef)).callFn([
      o.literal(flags), queryMatchesExpr, o.NULL_EXPR, o.literal(childCount), o.literal(ast.name),
      fixedAttrsDef(ast), inputDefs.length ? o.literalArr(inputDefs) : o.NULL_EXPR,
      outputDefs.length ? o.literalArr(outputDefs) : o.NULL_EXPR
    ]);
  }

  private _visitElementOrTemplate(
      nodeIndex: number, ast: {
        hasViewContainer: boolean,
        outputs: BoundEventAst[],
        directives: DirectiveAst[],
        providers: ProviderAst[],
        references: ReferenceAst[],
        queryMatches: QueryMatch[]
      },
      context: {elementDepth: number}): {
    flags: number,
    usedEvents: [string, string][],
    queryMatchesExpr: o.Expression,
    hostBindings: {value: AST, context: o.Expression}[],
  } {
    let flags = viewEngine.NodeFlags.None;
    if (ast.hasViewContainer) {
      flags |= viewEngine.NodeFlags.HasEmbeddedViews;
    }
    const usedEvents = new Map<string, [string, string]>();
    ast.outputs.forEach((event) => {
      usedEvents.set(
          viewEngine.elementEventFullName(event.target, event.name), [event.target, event.name]);
    });
    ast.directives.forEach((dirAst) => {
      dirAst.hostEvents.forEach((event) => {
        usedEvents.set(
            viewEngine.elementEventFullName(event.target, event.name), [event.target, event.name]);
      });
    });
    const hostBindings: {value: AST, context: o.Expression}[] = [];
    const hostEvents: {context: o.Expression, eventAst: BoundEventAst}[] = [];
    ast.providers.forEach((providerAst, providerIndex) => {
      let dirAst: DirectiveAst;
      let dirIndex: number;
      ast.directives.forEach((localDirAst, i) => {
        if (localDirAst.directive.type.reference === providerAst.token.identifier.reference) {
          dirAst = localDirAst;
          dirIndex = i;
        }
      });
      if (dirAst) {
        const {hostBindings: dirHostBindings, hostEvents: dirHostEvents} = this._visitDirective(
            providerAst, dirAst, dirIndex, nodeIndex, context.elementDepth, ast.references,
            ast.queryMatches, usedEvents);
        hostBindings.push(...dirHostBindings);
        hostEvents.push(...dirHostEvents);
      } else {
        this._visitProvider(providerAst, ast.queryMatches);
      }
    });

    let queryMatchExprs: o.Expression[] = [];
    ast.queryMatches.forEach((match) => {
      let valueType: number;
      if (tokenReference(match.value) === resolveIdentifier(Identifiers.ElementRef)) {
        valueType = viewEngine.QueryValueType.ElementRef;
      } else if (tokenReference(match.value) === resolveIdentifier(Identifiers.ViewContainerRef)) {
        valueType = viewEngine.QueryValueType.ViewContainerRef;
      } else if (tokenReference(match.value) === resolveIdentifier(Identifiers.TemplateRef)) {
        valueType = viewEngine.QueryValueType.TemplateRef;
      }
      if (valueType != null) {
        queryMatchExprs.push(
            o.literalArr([o.literal(calcQueryId(match.query)), o.literal(valueType)]));
      }
    });
    ast.references.forEach((ref) => {
      let valueType: number;
      if (!ref.value) {
        valueType = viewEngine.QueryValueType.RenderElement;
      } else if (tokenReference(ref.value) === resolveIdentifier(Identifiers.TemplateRef)) {
        valueType = viewEngine.QueryValueType.TemplateRef;
      }
      if (valueType != null) {
        this.refNodeIndices[ref.name] = nodeIndex;
        queryMatchExprs.push(o.literalArr([o.literal(`#${ref.name}`), o.literal(valueType)]));
      }
    });
    ast.outputs.forEach(
        (outputAst) => { hostEvents.push({context: COMP_VAR, eventAst: outputAst}); });
    hostEvents.forEach((hostEvent) => {
      this._addHandleEventExpression(
          nodeIndex, hostEvent.context,
          viewEngine.elementEventFullName(hostEvent.eventAst.target, hostEvent.eventAst.name),
          hostEvent.eventAst.handler);
    });

    return {
      flags,
      usedEvents: Array.from(usedEvents.values()),
      queryMatchesExpr: queryMatchExprs.length ? o.literalArr(queryMatchExprs) : o.NULL_EXPR,
      hostBindings,
    };
  }

  private _visitDirective(
      providerAst: ProviderAst, directiveAst: DirectiveAst, directiveIndex: number,
      elementNodeIndex: number, elementDepth: number, refs: ReferenceAst[],
      queryMatches: QueryMatch[], usedEvents: Map<string, any>): {
    hostBindings: {value: AST, context: o.Expression}[],
    hostEvents: {context: o.Expression, eventAst: BoundEventAst}[]
  } {
    const nodeIndex = this.nodeDefs.length;
    // reserve the space in the nodeDefs array so we can add children
    this.nodeDefs.push(null);

    directiveAst.directive.queries.forEach((query, queryIndex) => {
      const queryId: QueryId = {elementDepth, directiveIndex, queryIndex};
      const bindingType =
          query.first ? viewEngine.QueryBindingType.First : viewEngine.QueryBindingType.All;
      this.nodeDefs.push(o.importExpr(createIdentifier(Identifiers.queryDef)).callFn([
        o.literal(viewEngine.NodeFlags.HasContentQuery), o.literal(calcQueryId(queryId)),
        new o.LiteralMapExpr([new o.LiteralMapEntry(query.propertyName, o.literal(bindingType))])
      ]));
    });

    // Note: the operation below might also create new nodeDefs,
    // but we don't want them to be a child of a directive,
    // as they might be a provider/pipe on their own.
    // I.e. we only allow queries as children of directives nodes.
    const childCount = this.nodeDefs.length - nodeIndex - 1;

    const {flags, queryMatchExprs, providerExpr, providerType, depsExpr} =
        this._visitProviderOrDirective(providerAst, queryMatches);

    refs.forEach((ref) => {
      if (ref.value && tokenReference(ref.value) === tokenReference(providerAst.token)) {
        this.refNodeIndices[ref.name] = nodeIndex;
        queryMatchExprs.push(o.literalArr(
            [o.literal(`#${ref.name}`), o.literal(viewEngine.QueryValueType.Provider)]));
      }
    });

    let compView = o.NULL_EXPR;
    if (directiveAst.directive.isComponent) {
      compView = o.importExpr({reference: directiveAst.directive.componentViewType});
    }

    const inputDefs = directiveAst.inputs.map((inputAst, inputIndex) => {
      const mapValue = o.literalArr([o.literal(inputIndex), o.literal(inputAst.directiveName)]);
      // Note: it's important to not quote the key so that we can capture renames by minifiers!
      return new o.LiteralMapEntry(inputAst.directiveName, mapValue, false);
    });

    const outputDefs: o.LiteralMapEntry[] = [];
    const dirMeta = directiveAst.directive;
    Object.keys(dirMeta.outputs).forEach((propName) => {
      const eventName = dirMeta.outputs[propName];
      if (usedEvents.has(eventName)) {
        // Note: it's important to not quote the key so that we can capture renames by minifiers!
        outputDefs.push(new o.LiteralMapEntry(propName, o.literal(eventName), false));
      }
    });
    if (directiveAst.inputs.length) {
      this._addUpdateExpressions(
          nodeIndex,
          directiveAst.inputs.map((input) => { return {context: COMP_VAR, value: input.value}; }),
          this.updateDirectivesExpressions);
    }

    const dirContextExpr = o.importExpr(createIdentifier(Identifiers.nodeValue)).callFn([
      VIEW_VAR, o.literal(nodeIndex)
    ]);
    const hostBindings = directiveAst.hostProperties.map((hostBindingAst) => {
      return {
        value: (<ASTWithSource>hostBindingAst.value).ast,
        context: dirContextExpr,
      };
    });
    const hostEvents = directiveAst.hostEvents.map(
        (hostEventAst) => { return {context: dirContextExpr, eventAst: hostEventAst}; });


    // directiveDef(
    //   flags: NodeFlags, matchedQueries: [string, QueryValueType][], childCount: number, ctor:
    //   any,
    //   deps: ([DepFlags, any] | any)[], props?: {[name: string]: [number, string]},
    //   outputs?: {[name: string]: string}, component?: () => ViewDefinition): NodeDef;
    const nodeDef = o.importExpr(createIdentifier(Identifiers.directiveDef)).callFn([
      o.literal(flags), queryMatchExprs.length ? o.literalArr(queryMatchExprs) : o.NULL_EXPR,
      o.literal(childCount), providerExpr, depsExpr,
      inputDefs.length ? new o.LiteralMapExpr(inputDefs) : o.NULL_EXPR,
      outputDefs.length ? new o.LiteralMapExpr(outputDefs) : o.NULL_EXPR, compView
    ]);
    this.nodeDefs[nodeIndex] = nodeDef;

    return {hostBindings, hostEvents};
  }

  private _visitProvider(providerAst: ProviderAst, queryMatches: QueryMatch[]): void {
    const nodeIndex = this.nodeDefs.length;
    // reserve the space in the nodeDefs array so we can add children
    this.nodeDefs.push(null);

    const {flags, queryMatchExprs, providerExpr, providerType, depsExpr} =
        this._visitProviderOrDirective(providerAst, queryMatches);

    // providerDef(
    //   flags: NodeFlags, matchedQueries: [string, QueryValueType][], type: ProviderType, token:
    //   any,
    //   value: any, deps: ([DepFlags, any] | any)[]): NodeDef;
    const nodeDef = o.importExpr(createIdentifier(Identifiers.providerDef)).callFn([
      o.literal(flags), queryMatchExprs.length ? o.literalArr(queryMatchExprs) : o.NULL_EXPR,
      o.literal(providerType), tokenExpr(providerAst.token), providerExpr, depsExpr
    ]);
    this.nodeDefs[nodeIndex] = nodeDef;
  }

  private _visitProviderOrDirective(providerAst: ProviderAst, queryMatches: QueryMatch[]): {
    flags: number,
    queryMatchExprs: o.Expression[],
    providerExpr: o.Expression,
    providerType: number,
    depsExpr: o.Expression
  } {
    let flags = viewEngine.NodeFlags.None;
    if (!providerAst.eager) {
      flags |= viewEngine.NodeFlags.LazyProvider;
    }
    providerAst.lifecycleHooks.forEach((lifecycleHook) => {
      // for regular providers, we only support ngOnDestroy
      if (lifecycleHook === LifecycleHooks.OnDestroy ||
          providerAst.providerType === ProviderAstType.Directive ||
          providerAst.providerType === ProviderAstType.Component) {
        flags |= lifecycleHookToNodeFlag(lifecycleHook);
      }
    });
    let queryMatchExprs: o.Expression[] = [];

    queryMatches.forEach((match) => {
      if (tokenReference(match.value) === tokenReference(providerAst.token)) {
        queryMatchExprs.push(o.literalArr(
            [o.literal(calcQueryId(match.query)), o.literal(viewEngine.QueryValueType.Provider)]));
      }
    });
    const {providerExpr, providerType, depsExpr} = providerDef(providerAst);
    return {flags, queryMatchExprs, providerExpr, providerType, depsExpr};
  }

  getLocal(name: string): o.Expression {
    if (name == EventHandlerVars.event.name) {
      return EventHandlerVars.event;
    }
    let currViewExpr: o.Expression = VIEW_VAR;
    for (let currBuilder: ViewBuilder = this; currBuilder;
         currBuilder = currBuilder.parent, currViewExpr = currViewExpr.prop('parent')) {
      // check references
      const refNodeIndex = currBuilder.refNodeIndices[name];
      if (refNodeIndex != null) {
        return o.importExpr(createIdentifier(Identifiers.nodeValue)).callFn([
          currViewExpr, o.literal(refNodeIndex)
        ]);
      }

      // check variables
      const varAst = currBuilder.variables.find((varAst) => varAst.name === name);
      if (varAst) {
        const varValue = varAst.value || IMPLICIT_TEMPLATE_VAR;
        return currViewExpr.prop('context').prop(varValue);
      }
    }
    return null;
  }

  createLiteralArrayConverter(argCount: number): BuiltinConverter {
    if (argCount === 0) {
      const valueExpr = o.importExpr(createIdentifier(Identifiers.EMPTY_ARRAY));
      return () => valueExpr;
    }

    const nodeIndex = this.nodeDefs.length;
    // pureArrayDef(argCount: number): NodeDef;
    const nodeDef =
        o.importExpr(createIdentifier(Identifiers.pureArrayDef)).callFn([o.literal(argCount)]);
    this.nodeDefs.push(nodeDef);

    return (args: o.Expression[]) => callCheckStmt(nodeIndex, args);
  }
  createLiteralMapConverter(keys: string[]): BuiltinConverter {
    if (keys.length === 0) {
      const valueExpr = o.importExpr(createIdentifier(Identifiers.EMPTY_MAP));
      return () => valueExpr;
    }

    const nodeIndex = this.nodeDefs.length;
    // function pureObjectDef(propertyNames: string[]): NodeDef
    const nodeDef = o.importExpr(createIdentifier(Identifiers.pureObjectDef)).callFn([o.literalArr(
        keys.map(key => o.literal(key)))]);
    this.nodeDefs.push(nodeDef);

    return (args: o.Expression[]) => callCheckStmt(nodeIndex, args);
  }
  createPipeConverter(name: string, argCount: number): BuiltinConverter {
    const pipe = this._findPipe(name);
    if (pipe.pure) {
      const nodeIndex = this.nodeDefs.length;
      // function purePipeDef(argCount: number): NodeDef;
      const nodeDef =
          o.importExpr(createIdentifier(Identifiers.purePipeDef)).callFn([o.literal(argCount)]);
      this.nodeDefs.push(nodeDef);

      // find underlying pipe in the component view
      let compViewExpr: o.Expression = VIEW_VAR;
      let compBuilder: ViewBuilder = this;
      while (compBuilder.parent) {
        compBuilder = compBuilder.parent;
        compViewExpr = compViewExpr.prop('parent');
      }
      const pipeNodeIndex = compBuilder.purePipeNodeIndices[name];
      const pipeValueExpr: o.Expression =
          o.importExpr(createIdentifier(Identifiers.nodeValue)).callFn([
            compViewExpr, o.literal(pipeNodeIndex)
          ]);

      return (args: o.Expression[]) =>
                 callUnwrapValue(callCheckStmt(nodeIndex, [pipeValueExpr].concat(args)));
    } else {
      const nodeIndex = this._createPipe(pipe);
      const nodeValueExpr = o.importExpr(createIdentifier(Identifiers.nodeValue)).callFn([
        VIEW_VAR, o.literal(nodeIndex)
      ]);

      return (args: o.Expression[]) => callUnwrapValue(nodeValueExpr.callMethod('transform', args));
    }
  }

  private _findPipe(name: string): CompilePipeSummary {
    return this.usedPipes.find((pipeSummary) => pipeSummary.name === name);
  }

  private _createPipe(pipe: CompilePipeSummary): number {
    const nodeIndex = this.nodeDefs.length;
    let flags = viewEngine.NodeFlags.None;
    pipe.type.lifecycleHooks.forEach((lifecycleHook) => {
      // for pipes, we only support ngOnDestroy
      if (lifecycleHook === LifecycleHooks.OnDestroy) {
        flags |= lifecycleHookToNodeFlag(lifecycleHook);
      }
    });

    const depExprs = pipe.type.diDeps.map(depDef);
    // function pipeDef(
    //   flags: NodeFlags, ctor: any, deps: ([DepFlags, any] | any)[]): NodeDef
    const nodeDef = o.importExpr(createIdentifier(Identifiers.pipeDef)).callFn([
      o.literal(flags), o.importExpr(pipe.type), o.literalArr(depExprs)
    ]);
    this.nodeDefs.push(nodeDef);
    return nodeIndex;
  }

  // Attention: This might create new nodeDefs (for pipes and literal arrays and literal maps)!
  private _addUpdateExpressions(
      nodeIndex: number, expressions: {context: o.Expression, value: AST}[],
      target: UpdateExpression[]) {
    if (expressions.length === 0) {
      return;
    }
    const transformedExpressions = expressions.map(({context, value}) => {
      if (value instanceof ASTWithSource) {
        value = value.ast;
      }
      return {context, value: convertPropertyBindingBuiltins(this, value)};
    });
    target.push({nodeIndex, expressions: transformedExpressions});
  }

  private _addHandleEventExpression(
      nodeIndex: number, context: o.Expression, eventName: string, expression: AST) {
    if (expression instanceof ASTWithSource) {
      expression = expression.ast;
    }
    this.handleEventExpressions.push({nodeIndex, context, eventName, expression});
  }

  visitDirective(ast: DirectiveAst, context: {usedEvents: Set<string>}): any {}
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any {}
  visitReference(ast: ReferenceAst, context: any): any {}
  visitVariable(ast: VariableAst, context: any): any {}
  visitEvent(ast: BoundEventAst, context: any): any {}
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any {}
  visitAttr(ast: AttrAst, context: any): any {}
}

function providerDef(providerAst: ProviderAst):
    {providerExpr: o.Expression, providerType: number, depsExpr: o.Expression} {
  return providerAst.multiProvider ? multiProviderDef(providerAst.providers) :
                                     singleProviderDef(providerAst.providers[0]);
}

function multiProviderDef(providers: CompileProviderMetadata[]):
    {providerExpr: o.Expression, providerType: number, depsExpr: o.Expression} {
  const allDepDefs: o.Expression[] = [];
  const allParams: o.FnParam[] = [];
  const exprs = providers.map((provider, providerIndex) => {
    const depExprs = provider.deps.map((dep, depIndex) => {
      const paramName = `p${providerIndex}_${depIndex}`;
      allParams.push(new o.FnParam(paramName, o.DYNAMIC_TYPE));
      allDepDefs.push(depDef(dep));
      return o.variable(paramName);
    });
    let expr: o.Expression;
    if (provider.useClass) {
      expr = o.importExpr(provider.useClass).instantiate(depExprs);
    } else if (provider.useFactory) {
      expr = o.importExpr(provider.useFactory).callFn(depExprs);
    } else if (provider.useExisting) {
      expr = depExprs[0];
    } else {
      expr = convertValueToOutputAst(provider.useValue);
    }
    return expr;
  });
  const providerExpr = o.fn(allParams, [new o.ReturnStatement(o.literalArr(exprs))]);
  return {
    providerExpr,
    providerType: viewEngine.ProviderType.Factory,
    depsExpr: o.literalArr(allDepDefs)
  };
}

function singleProviderDef(providerMeta: CompileProviderMetadata):
    {providerExpr: o.Expression, providerType: number, depsExpr: o.Expression} {
  let providerExpr: o.Expression;
  let providerType: number;
  let deps: CompileDiDependencyMetadata[];
  if (providerMeta.useClass) {
    providerExpr = o.importExpr(providerMeta.useClass);
    providerType = viewEngine.ProviderType.Class;
    deps = providerMeta.deps || providerMeta.useClass.diDeps;
  } else if (providerMeta.useFactory) {
    providerExpr = o.importExpr(providerMeta.useFactory);
    providerType = viewEngine.ProviderType.Factory;
    deps = providerMeta.deps || providerMeta.useFactory.diDeps;
  } else if (providerMeta.useExisting) {
    providerExpr = o.NULL_EXPR;
    providerType = viewEngine.ProviderType.UseExisting;
    deps = [{token: providerMeta.useExisting}];
  } else {
    providerExpr = convertValueToOutputAst(providerMeta.useValue);
    providerType = viewEngine.ProviderType.Value;
    deps = [];
  }
  const depsExpr = o.literalArr(deps.map(dep => depDef(dep)));
  return {providerExpr, providerType, depsExpr};
}

function tokenExpr(tokenMeta: CompileTokenMetadata): o.Expression {
  return tokenMeta.identifier ? o.importExpr(tokenMeta.identifier) : o.literal(tokenMeta.value);
}

function depDef(dep: CompileDiDependencyMetadata): o.Expression {
  // Note: the following fields have already been normalized out by provider_analyzer:
  // - isAttribute, isSelf, isHost
  const expr = dep.isValue ? convertValueToOutputAst(dep.value) : tokenExpr(dep.token);
  let flags = viewEngine.DepFlags.None;
  if (dep.isSkipSelf) {
    flags |= viewEngine.DepFlags.SkipSelf;
  }
  if (dep.isOptional) {
    flags |= viewEngine.DepFlags.Optional;
  }
  if (dep.isValue) {
    flags |= viewEngine.DepFlags.Value;
  }
  return flags === viewEngine.DepFlags.None ? expr : o.literalArr([o.literal(flags), expr]);
}

function needsAdditionalRootNode(ast: TemplateAst): boolean {
  if (ast instanceof EmbeddedTemplateAst) {
    return ast.hasViewContainer;
  }

  if (ast instanceof ElementAst) {
    return ast.hasViewContainer;
  }

  return ast instanceof NgContentAst;
}

function calcQueryId(queryId: QueryId): string {
  if (queryId.directiveIndex == null) {
    // view query
    return `v${queryId.queryIndex}`;
  } else {
    return `c${queryId.elementDepth}_${queryId.directiveIndex}_${queryId.queryIndex}`;
  }
}

function lifecycleHookToNodeFlag(lifecycleHook: LifecycleHooks): number {
  let nodeFlag = viewEngine.NodeFlags.None;
  switch (lifecycleHook) {
    case LifecycleHooks.AfterContentChecked:
      nodeFlag = viewEngine.NodeFlags.AfterContentChecked;
      break;
    case LifecycleHooks.AfterContentInit:
      nodeFlag = viewEngine.NodeFlags.AfterContentInit;
      break;
    case LifecycleHooks.AfterViewChecked:
      nodeFlag = viewEngine.NodeFlags.AfterViewChecked;
      break;
    case LifecycleHooks.AfterViewInit:
      nodeFlag = viewEngine.NodeFlags.AfterViewInit;
      break;
    case LifecycleHooks.DoCheck:
      nodeFlag = viewEngine.NodeFlags.DoCheck;
      break;
    case LifecycleHooks.OnChanges:
      nodeFlag = viewEngine.NodeFlags.OnChanges;
      break;
    case LifecycleHooks.OnDestroy:
      nodeFlag = viewEngine.NodeFlags.OnDestroy;
      break;
    case LifecycleHooks.OnInit:
      nodeFlag = viewEngine.NodeFlags.OnInit;
      break;
  }
  return nodeFlag;
}

function elementBindingDefs(inputAsts: BoundElementPropertyAst[]): o.Expression[] {
  return inputAsts.map((inputAst) => {
    switch (inputAst.type) {
      case PropertyBindingType.Attribute:
        return o.literalArr([
          o.literal(viewEngine.BindingType.ElementAttribute), o.literal(inputAst.name),
          o.literal(inputAst.securityContext)
        ]);
      case PropertyBindingType.Property:
        return o.literalArr([
          o.literal(viewEngine.BindingType.ElementProperty), o.literal(inputAst.name),
          o.literal(inputAst.securityContext)
        ]);
      case PropertyBindingType.Class:
        return o.literalArr(
            [o.literal(viewEngine.BindingType.ElementClass), o.literal(inputAst.name)]);
      case PropertyBindingType.Style:
        return o.literalArr([
          o.literal(viewEngine.BindingType.ElementStyle), o.literal(inputAst.name),
          o.literal(inputAst.unit)
        ]);
    }
  });
}


function fixedAttrsDef(elementAst: ElementAst): o.LiteralMapExpr {
  const mapResult: {[key: string]: string} = {};
  elementAst.attrs.forEach(attrAst => { mapResult[attrAst.name] = attrAst.value; });
  elementAst.directives.forEach(dirAst => {
    Object.keys(dirAst.directive.hostAttributes).forEach(name => {
      const value = dirAst.directive.hostAttributes[name];
      const prevValue = mapResult[name];
      mapResult[name] = prevValue != null ? mergeAttributeValue(name, prevValue, value) : value;
    });
  });
  const mapEntries: o.LiteralMapEntry[] = [];
  // Note: We need to sort to get a defined output order
  // for tests and for caching generated artifacts...
  Object.keys(mapResult).sort().forEach((attrName) => {
    mapEntries.push(new o.LiteralMapEntry(attrName, o.literal(mapResult[attrName]), true));
  });
  return new o.LiteralMapExpr(mapEntries);
}

function mergeAttributeValue(attrName: string, attrValue1: string, attrValue2: string): string {
  if (attrName == CLASS_ATTR || attrName == STYLE_ATTR) {
    return `${attrValue1} ${attrValue2}`;
  } else {
    return attrValue2;
  }
}

function callCheckStmt(nodeIndex: number, exprs: o.Expression[]): o.Expression {
  if (exprs.length > 10) {
    return CHECK_VAR.callFn([
      VIEW_VAR, o.literal(nodeIndex), o.literal(viewEngine.ArgumentType.Dynamic),
      o.literalArr(exprs)
    ]);
  } else {
    return CHECK_VAR.callFn(
        [VIEW_VAR, o.literal(nodeIndex), o.literal(viewEngine.ArgumentType.Inline), ...exprs]);
  }
}

function callUnwrapValue(expr: o.Expression): o.Expression {
  return o.importExpr(createIdentifier(Identifiers.unwrapValue)).callFn([expr]);
}