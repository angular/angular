/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, ViewEncapsulation} from '@angular/core';

import {AnimationEntryCompileResult} from '../animation/animation_compiler';
import {CompileDiDependencyMetadata, CompileDirectiveMetadata, CompileDirectiveSummary, CompilePipeSummary, CompileProviderMetadata, CompileTokenMetadata, CompileTypeMetadata, identifierModuleUrl, identifierName, rendererTypeName, tokenReference, viewClassName} from '../compile_metadata';
import {BuiltinConverter, BuiltinConverterFactory, EventHandlerVars, LocalResolver, convertActionBinding, convertPropertyBinding, convertPropertyBindingBuiltins} from '../compiler_util/expression_converter';
import {CompilerConfig} from '../config';
import {AST, ASTWithSource, Interpolation} from '../expression_parser/ast';
import {Identifiers, createIdentifier, createIdentifierToken, resolveIdentifier} from '../identifiers';
import {CompilerInjectable} from '../injectable';
import * as o from '../output/output_ast';
import {convertValueToOutputAst} from '../output/value_util';
import {LifecycleHooks, viewEngine} from '../private_import_core';
import {ElementSchemaRegistry} from '../schema/element_schema_registry';
import {AttrAst, BoundDirectivePropertyAst, BoundElementPropertyAst, BoundEventAst, BoundTextAst, DirectiveAst, ElementAst, EmbeddedTemplateAst, NgContentAst, PropertyBindingType, ProviderAst, ProviderAstType, QueryMatch, ReferenceAst, TemplateAst, TemplateAstVisitor, TextAst, VariableAst, templateVisitAll} from '../template_parser/template_ast';
import {ComponentFactoryDependency, ComponentViewDependency, DirectiveWrapperDependency, ViewCompileResult, ViewCompiler} from '../view_compiler/view_compiler';

const CLASS_ATTR = 'class';
const STYLE_ATTR = 'style';
const IMPLICIT_TEMPLATE_VAR = '\$implicit';
const NG_CONTAINER_TAG = 'ng-container';

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
    let embeddedViewCount = 0;
    const staticQueryIds = findStaticQueryIds(template);

    const statements: o.Statement[] = [];

    const renderComponentVar = o.variable(rendererTypeName(component.type.reference));
    statements.push(
        renderComponentVar
            .set(o.importExpr(createIdentifier(Identifiers.createRendererTypeV2)).callFn([
              new o.LiteralMapExpr([
                new o.LiteralMapEntry('encapsulation', o.literal(component.template.encapsulation)),
                new o.LiteralMapEntry('styles', styles),
                // TODO: copy this from the @Component directive...
                new o.LiteralMapEntry('data', o.literalMap([])),
              ])
            ]))
            .toDeclStmt(
                o.importType(createIdentifier(Identifiers.RendererTypeV2)),
                [o.StmtModifier.Final]));

    const viewBuilderFactory = (parent: ViewBuilder): ViewBuilder => {
      const embeddedViewIndex = embeddedViewCount++;
      return new ViewBuilder(
          parent, component, embeddedViewIndex, usedPipes, staticQueryIds, viewBuilderFactory);
    };

    const visitor = viewBuilderFactory(null);
    visitor.visitAll([], template);

    statements.push(...visitor.build());

    return new ViewCompileResult(statements, visitor.viewName, renderComponentVar.name, []);
  }
}

interface ViewBuilderFactory {
  (parent: ViewBuilder): ViewBuilder;
}

interface UpdateExpression {
  nodeIndex: number;
  expressions: {context: o.Expression, value: AST}[];
}

const VIEW_VAR = o.variable('view');
const CHECK_VAR = o.variable('check');
const COMP_VAR = o.variable('comp');
const NODE_INDEX_VAR = o.variable('nodeIndex');
const EVENT_NAME_VAR = o.variable('eventName');
const ALLOW_DEFAULT_VAR = o.variable(`allowDefault`);

class ViewBuilder implements TemplateAstVisitor, LocalResolver, BuiltinConverterFactory {
  private compType: o.Type;
  private nodeDefs: (() => o.Expression)[] = [];
  private purePipeNodeIndices: {[pipeName: string]: number} = {};
  private refNodeIndices: {[refName: string]: number} = {};
  private variables: VariableAst[] = [];
  private children: ViewBuilder[] = [];
  private updateDirectivesExpressions: UpdateExpression[] = [];
  private updateRendererExpressions: UpdateExpression[] = [];

  constructor(
      private parent: ViewBuilder, private component: CompileDirectiveMetadata,
      private embeddedViewIndex: number, private usedPipes: CompilePipeSummary[],
      private staticQueryIds: Map<TemplateAst, StaticAndDynamicQueryIds>,
      private viewBuilderFactory: ViewBuilderFactory) {
    // TODO(tbosch): The old view compiler used to use an `any` type
    // for the context in any embedded view. We keep this behaivor for now
    // to be able to introduce the new view compiler without too many errors.
    this.compType = this.embeddedViewIndex > 0 ? o.DYNAMIC_TYPE : o.importType(this.component.type);
  }

  get viewName(): string {
    return viewClassName(this.component.type.reference, this.embeddedViewIndex);
  }

  visitAll(variables: VariableAst[], astNodes: TemplateAst[]) {
    this.variables = variables;
    // create the pipes for the pure pipes immediately, so that we know their indices.
    if (!this.parent) {
      this.usedPipes.forEach((pipe) => {
        if (pipe.pure) {
          this.purePipeNodeIndices[pipe.name] = this._createPipe(pipe);
        }
      });
    }

    if (!this.parent) {
      const queryIds = staticViewQueryIds(this.staticQueryIds);
      this.component.viewQueries.forEach((query, queryIndex) => {
        // Note: queries start with id 1 so we can use the number in a Bloom filter!
        const queryId = queryIndex + 1;
        const bindingType =
            query.first ? viewEngine.QueryBindingType.First : viewEngine.QueryBindingType.All;
        let flags = viewEngine.NodeFlags.HasViewQuery;
        if (queryIds.staticQueryIds.has(queryId)) {
          flags |= viewEngine.NodeFlags.HasStaticQuery;
        } else {
          flags |= viewEngine.NodeFlags.HasDynamicQuery;
        }
        this.nodeDefs.push(() => o.importExpr(createIdentifier(Identifiers.queryDef)).callFn([
          o.literal(flags), o.literal(queryId),
          new o.LiteralMapExpr([new o.LiteralMapEntry(query.propertyName, o.literal(bindingType))])
        ]));
      });
    }
    templateVisitAll(this, astNodes);
    if (astNodes.length === 0 ||
        (this.parent && needsAdditionalRootNode(astNodes[astNodes.length - 1]))) {
      // if the view is empty, or an embedded view has a view container as last root nde,
      // create an additional root node.
      this.nodeDefs.push(() => o.importExpr(createIdentifier(Identifiers.anchorDef)).callFn([
        o.literal(viewEngine.NodeFlags.None), o.NULL_EXPR, o.NULL_EXPR, o.literal(0)
      ]));
    }
  }

  build(targetStatements: o.Statement[] = []): o.Statement[] {
    this.children.forEach((child) => child.build(targetStatements));

    const updateDirectivesFn = this._createUpdateFn(this.updateDirectivesExpressions);
    const updateRendererFn = this._createUpdateFn(this.updateRendererExpressions);


    let viewFlags = viewEngine.ViewFlags.None;
    if (!this.parent && this.component.changeDetection === ChangeDetectionStrategy.OnPush) {
      viewFlags |= viewEngine.ViewFlags.OnPush;
    }
    const viewFactory = new o.DeclareFunctionStmt(
        this.viewName, [],
        [new o.ReturnStatement(o.importExpr(createIdentifier(Identifiers.viewDef)).callFn([
          o.literal(viewFlags),
          o.literalArr(this.nodeDefs.map(nd => nd())),
          updateDirectivesFn,
          updateRendererFn,
        ]))],
        o.importType(createIdentifier(Identifiers.ViewDefinition)));

    targetStatements.push(viewFactory);
    return targetStatements;
  }

  private _createUpdateFn(expressions: UpdateExpression[]): o.Expression {
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
      const preStmts: o.Statement[] = [];
      if (!this.component.isHost) {
        preStmts.push(COMP_VAR.set(VIEW_VAR.prop('component')).toDeclStmt(this.compType));
      }
      updateFn = o.fn(
          [
            new o.FnParam(CHECK_VAR.name, o.INFERRED_TYPE),
            new o.FnParam(VIEW_VAR.name, o.INFERRED_TYPE)
          ],
          [...preStmts, ...updateStmts], o.INFERRED_TYPE);
    } else {
      updateFn = o.NULL_EXPR;
    }
    return updateFn;
  }

  visitNgContent(ast: NgContentAst, context: any): any {
    // ngContentDef(ngContentIndex: number, index: number): NodeDef;
    this.nodeDefs.push(() => o.importExpr(createIdentifier(Identifiers.ngContentDef)).callFn([
      o.literal(ast.ngContentIndex), o.literal(ast.index)
    ]));
  }

  visitText(ast: TextAst, context: any): any {
    // textDef(ngContentIndex: number, constants: string[]): NodeDef;
    this.nodeDefs.push(() => o.importExpr(createIdentifier(Identifiers.textDef)).callFn([
      o.literal(ast.ngContentIndex), o.literalArr([o.literal(ast.value)])
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
    this.nodeDefs[nodeIndex] = () => o.importExpr(createIdentifier(Identifiers.textDef)).callFn([
      o.literal(ast.ngContentIndex), o.literalArr(inter.strings.map(s => o.literal(s)))
    ]);
  }

  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
    const nodeIndex = this.nodeDefs.length;
    // reserve the space in the nodeDefs array
    this.nodeDefs.push(null);

    const {flags, queryMatchesExpr, hostEvents} = this._visitElementOrTemplate(nodeIndex, ast);

    const childVisitor = this.viewBuilderFactory(this);
    this.children.push(childVisitor);
    childVisitor.visitAll(ast.variables, ast.children);

    const childCount = this.nodeDefs.length - nodeIndex - 1;

    // anchorDef(
    //   flags: NodeFlags, matchedQueries: [string, QueryValueType][], ngContentIndex: number,
    //   childCount: number, handleEventFn?: ElementHandleEventFn, templateFactory?:
    //   ViewDefinitionFactory): NodeDef;
    const nodeDef = () => o.importExpr(createIdentifier(Identifiers.anchorDef)).callFn([
      o.literal(flags),
      queryMatchesExpr,
      o.literal(ast.ngContentIndex),
      o.literal(childCount),
      this._createElementHandleEventFn(nodeIndex, hostEvents),
      o.variable(childVisitor.viewName),
    ]);
    this.nodeDefs[nodeIndex] = nodeDef;
  }

  visitElement(ast: ElementAst, context: any): any {
    const nodeIndex = this.nodeDefs.length;
    // reserve the space in the nodeDefs array so we can add children
    this.nodeDefs.push(null);

    let elName = ast.name;
    if (ast.name === NG_CONTAINER_TAG) {
      // Using a null element name creates an anchor.
      elName = null;
    }

    let {flags, usedEvents, queryMatchesExpr, hostBindings, hostEvents} =
        this._visitElementOrTemplate(nodeIndex, ast);

    let inputDefs: o.Expression[] = [];
    let outputDefs: o.Expression[] = [];
    if (elName) {
      ast.inputs.forEach(
          (inputAst) => hostBindings.push({context: COMP_VAR, value: inputAst.value}));
      if (hostBindings.length) {
        this._addUpdateExpressions(nodeIndex, hostBindings, this.updateRendererExpressions);
      }
      // Note: inputDefs have to be in the same order as hostBindings:
      // - first the entries from the directives, then the ones from the element.
      ast.directives.forEach(
          (dirAst, dirIndex) => inputDefs.push(...elementBindingDefs(dirAst.hostProperties)));
      inputDefs.push(...elementBindingDefs(ast.inputs));

      outputDefs = usedEvents.map(([target, eventName]) => {
        return target ? o.literalArr([o.literal(target), o.literal(eventName)]) :
                        o.literal(eventName);
      });
    }

    templateVisitAll(this, ast.children);

    const childCount = this.nodeDefs.length - nodeIndex - 1;

    // elementDef(
    //   flags: NodeFlags, matchedQueries: [string, QueryValueType][], ngContentIndex: number,
    //   childCount: number, name: string, fixedAttrs: {[name: string]: string} = {},
    //   bindings?:
    //       ([BindingType.ElementClass, string] | [BindingType.ElementStyle, string, string] |
    //         [BindingType.ElementAttribute | BindingType.ElementProperty, string,
    //         SecurityContext])[],
    //   outputs?: (string | [string, string])[], eventHandlerFn: ElementHandleEventFn): NodeDef;
    const nodeDef = () => o.importExpr(createIdentifier(Identifiers.elementDef)).callFn([
      o.literal(flags), queryMatchesExpr, o.literal(ast.ngContentIndex), o.literal(childCount),
      o.literal(elName), elName ? fixedAttrsDef(ast) : o.NULL_EXPR,
      inputDefs.length ? o.literalArr(inputDefs) : o.NULL_EXPR,
      outputDefs.length ? o.literalArr(outputDefs) : o.NULL_EXPR,
      this._createElementHandleEventFn(nodeIndex, hostEvents)
    ]);

    this.nodeDefs[nodeIndex] = nodeDef;
  }

  private _visitElementOrTemplate(nodeIndex: number, ast: {
    hasViewContainer: boolean,
    outputs: BoundEventAst[],
    directives: DirectiveAst[],
    providers: ProviderAst[],
    references: ReferenceAst[],
    queryMatches: QueryMatch[]
  }): {
    flags: number,
    usedEvents: [string, string][],
    queryMatchesExpr: o.Expression,
    hostBindings: {value: AST, context: o.Expression}[],
    hostEvents: {context: o.Expression, eventAst: BoundEventAst}[],
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
    const componentFactoryResolverProvider = createComponentFactoryResolver(ast.directives);
    if (componentFactoryResolverProvider) {
      this._visitProvider(componentFactoryResolverProvider, ast.queryMatches);
    }

    ast.providers.forEach((providerAst, providerIndex) => {
      let dirAst: DirectiveAst;
      let dirIndex: number;
      ast.directives.forEach((localDirAst, i) => {
        if (localDirAst.directive.type.reference === tokenReference(providerAst.token)) {
          dirAst = localDirAst;
          dirIndex = i;
        }
      });
      if (dirAst) {
        const {hostBindings: dirHostBindings, hostEvents: dirHostEvents} = this._visitDirective(
            providerAst, dirAst, dirIndex, nodeIndex, ast.references, ast.queryMatches, usedEvents,
            this.staticQueryIds.get(<any>ast));
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
        queryMatchExprs.push(o.literalArr([o.literal(match.queryId), o.literal(valueType)]));
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
        queryMatchExprs.push(o.literalArr([o.literal(ref.name), o.literal(valueType)]));
      }
    });
    ast.outputs.forEach(
        (outputAst) => { hostEvents.push({context: COMP_VAR, eventAst: outputAst}); });

    return {
      flags,
      usedEvents: Array.from(usedEvents.values()),
      queryMatchesExpr: queryMatchExprs.length ? o.literalArr(queryMatchExprs) : o.NULL_EXPR,
      hostBindings,
      hostEvents
    };
  }

  private _visitDirective(
      providerAst: ProviderAst, directiveAst: DirectiveAst, directiveIndex: number,
      elementNodeIndex: number, refs: ReferenceAst[], queryMatches: QueryMatch[],
      usedEvents: Map<string, any>, queryIds: StaticAndDynamicQueryIds): {
    hostBindings: {value: AST, context: o.Expression}[],
    hostEvents: {context: o.Expression, eventAst: BoundEventAst}[]
  } {
    const nodeIndex = this.nodeDefs.length;
    // reserve the space in the nodeDefs array so we can add children
    this.nodeDefs.push(null);

    directiveAst.directive.queries.forEach((query, queryIndex) => {
      let flags = viewEngine.NodeFlags.HasContentQuery;
      const queryId = directiveAst.contentQueryStartId + queryIndex;
      if (queryIds.staticQueryIds.has(queryId)) {
        flags |= viewEngine.NodeFlags.HasStaticQuery;
      } else {
        flags |= viewEngine.NodeFlags.HasDynamicQuery;
      }
      const bindingType =
          query.first ? viewEngine.QueryBindingType.First : viewEngine.QueryBindingType.All;
      this.nodeDefs.push(() => o.importExpr(createIdentifier(Identifiers.queryDef)).callFn([
        o.literal(flags), o.literal(queryId),
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
        queryMatchExprs.push(
            o.literalArr([o.literal(ref.name), o.literal(viewEngine.QueryValueType.Provider)]));
      }
    });

    let rendererType = o.NULL_EXPR;
    let compView = o.NULL_EXPR;
    if (directiveAst.directive.isComponent) {
      compView = o.importExpr({reference: directiveAst.directive.componentViewType});
      rendererType = o.importExpr({reference: directiveAst.directive.rendererType});
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
    if (directiveAst.inputs.length ||
        (flags & (viewEngine.NodeFlags.DoCheck | viewEngine.NodeFlags.OnInit)) > 0) {
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
    const nodeDef = () => o.importExpr(createIdentifier(Identifiers.directiveDef)).callFn([
      o.literal(flags), queryMatchExprs.length ? o.literalArr(queryMatchExprs) : o.NULL_EXPR,
      o.literal(childCount), providerExpr, depsExpr,
      inputDefs.length ? new o.LiteralMapExpr(inputDefs) : o.NULL_EXPR,
      outputDefs.length ? new o.LiteralMapExpr(outputDefs) : o.NULL_EXPR, compView, rendererType
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
    const nodeDef = () => o.importExpr(createIdentifier(Identifiers.providerDef)).callFn([
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
    if (providerAst.providerType === ProviderAstType.PrivateService) {
      flags |= viewEngine.NodeFlags.PrivateProvider;
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
            [o.literal(match.queryId), o.literal(viewEngine.QueryValueType.Provider)]));
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
    const nodeDef = () =>
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
    const nodeDef = () =>
        o.importExpr(createIdentifier(Identifiers.pureObjectDef)).callFn([o.literalArr(
            keys.map(key => o.literal(key)))]);
    this.nodeDefs.push(nodeDef);

    return (args: o.Expression[]) => callCheckStmt(nodeIndex, args);
  }
  createPipeConverter(name: string, argCount: number): BuiltinConverter {
    const pipe = this._findPipe(name);
    if (pipe.pure) {
      const nodeIndex = this.nodeDefs.length;
      // function purePipeDef(argCount: number): NodeDef;
      const nodeDef = () =>
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
    const nodeDef = () => o.importExpr(createIdentifier(Identifiers.pipeDef)).callFn([
      o.literal(flags), o.importExpr(pipe.type), o.literalArr(depExprs)
    ]);
    this.nodeDefs.push(nodeDef);
    return nodeIndex;
  }

  // Attention: This might create new nodeDefs (for pipes and literal arrays and literal maps)!
  private _addUpdateExpressions(
      nodeIndex: number, expressions: {context: o.Expression, value: AST}[],
      target: UpdateExpression[]) {
    const transformedExpressions = expressions.map(({context, value}) => {
      if (value instanceof ASTWithSource) {
        value = value.ast;
      }
      return {context, value: convertPropertyBindingBuiltins(this, value)};
    });
    target.push({nodeIndex, expressions: transformedExpressions});
  }

  private _createElementHandleEventFn(
      nodeIndex: number, handlers: {context: o.Expression, eventAst: BoundEventAst}[]) {
    const handleEventStmts: o.Statement[] = [];
    let handleEventBindingCount = 0;
    handlers.forEach(({context, eventAst}) => {
      const bindingId = `${handleEventBindingCount++}`;
      const nameResolver = context === COMP_VAR ? this : null;
      const expression =
          eventAst.handler instanceof ASTWithSource ? eventAst.handler.ast : eventAst.handler;
      const {stmts, allowDefault} =
          convertActionBinding(nameResolver, context, expression, bindingId);
      const trueStmts = stmts;
      if (allowDefault) {
        trueStmts.push(ALLOW_DEFAULT_VAR.set(allowDefault.and(ALLOW_DEFAULT_VAR)).toStmt());
      }
      const fullEventName = viewEngine.elementEventFullName(eventAst.target, eventAst.name);
      handleEventStmts.push(
          new o.IfStmt(o.literal(fullEventName).identical(EVENT_NAME_VAR), trueStmts));
    });
    let handleEventFn: o.Expression;
    if (handleEventStmts.length > 0) {
      const preStmts: o.Statement[] =
          [ALLOW_DEFAULT_VAR.set(o.literal(true)).toDeclStmt(o.BOOL_TYPE)];
      if (!this.component.isHost) {
        preStmts.push(COMP_VAR.set(VIEW_VAR.prop('component')).toDeclStmt(this.compType));
      }
      handleEventFn = o.fn(
          [
            new o.FnParam(VIEW_VAR.name, o.INFERRED_TYPE),
            new o.FnParam(EVENT_NAME_VAR.name, o.INFERRED_TYPE),
            new o.FnParam(EventHandlerVars.event.name, o.INFERRED_TYPE)
          ],
          [...preStmts, ...handleEventStmts, new o.ReturnStatement(ALLOW_DEFAULT_VAR)],
          o.INFERRED_TYPE);
    } else {
      handleEventFn = o.NULL_EXPR;
    }
    return handleEventFn;
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
    let expr: o.Expression;
    if (provider.useClass) {
      const depExprs = convertDeps(providerIndex, provider.deps || provider.useClass.diDeps);
      expr = o.importExpr(provider.useClass).instantiate(depExprs);
    } else if (provider.useFactory) {
      const depExprs = convertDeps(providerIndex, provider.deps || provider.useFactory.diDeps);
      expr = o.importExpr(provider.useFactory).callFn(depExprs);
    } else if (provider.useExisting) {
      const depExprs = convertDeps(providerIndex, [{token: provider.useExisting}]);
      expr = depExprs[0];
    } else {
      expr = convertValueToOutputAst(provider.useValue);
    }
    return expr;
  });
  const providerExpr =
      o.fn(allParams, [new o.ReturnStatement(o.literalArr(exprs))], o.INFERRED_TYPE);
  return {
    providerExpr,
    providerType: viewEngine.ProviderType.Factory,
    depsExpr: o.literalArr(allDepDefs)
  };

  function convertDeps(providerIndex: number, deps: CompileDiDependencyMetadata[]) {
    return deps.map((dep, depIndex) => {
      const paramName = `p${providerIndex}_${depIndex}`;
      allParams.push(new o.FnParam(paramName, o.DYNAMIC_TYPE));
      allDepDefs.push(depDef(dep));
      return o.variable(paramName);
    });
  }
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
    if (ast.name === NG_CONTAINER_TAG && ast.children.length) {
      return needsAdditionalRootNode(ast.children[ast.children.length - 1]);
    }
    return ast.hasViewContainer;
  }

  return ast instanceof NgContentAst;
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
      case PropertyBindingType.Animation:
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


function fixedAttrsDef(elementAst: ElementAst): o.Expression {
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
  return o.literalArr(Object.keys(mapResult).sort().map(
      (attrName) => o.literalArr([o.literal(attrName), o.literal(mapResult[attrName])])));
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

interface StaticAndDynamicQueryIds {
  staticQueryIds: Set<number>;
  dynamicQueryIds: Set<number>;
}


function findStaticQueryIds(
    nodes: TemplateAst[], result = new Map<TemplateAst, StaticAndDynamicQueryIds>()):
    Map<TemplateAst, StaticAndDynamicQueryIds> {
  nodes.forEach((node) => {
    const staticQueryIds = new Set<number>();
    const dynamicQueryIds = new Set<number>();
    let queryMatches: QueryMatch[];
    if (node instanceof ElementAst) {
      findStaticQueryIds(node.children, result);
      node.children.forEach((child) => {
        const childData = result.get(child);
        childData.staticQueryIds.forEach(queryId => staticQueryIds.add(queryId));
        childData.dynamicQueryIds.forEach(queryId => dynamicQueryIds.add(queryId));
      });
      queryMatches = node.queryMatches;
    } else if (node instanceof EmbeddedTemplateAst) {
      findStaticQueryIds(node.children, result);
      node.children.forEach((child) => {
        const childData = result.get(child);
        childData.staticQueryIds.forEach(queryId => dynamicQueryIds.add(queryId));
        childData.dynamicQueryIds.forEach(queryId => dynamicQueryIds.add(queryId));
      });
      queryMatches = node.queryMatches;
    }
    if (queryMatches) {
      queryMatches.forEach((match) => staticQueryIds.add(match.queryId));
    }
    dynamicQueryIds.forEach(queryId => staticQueryIds.delete(queryId));
    result.set(node, {staticQueryIds, dynamicQueryIds});
  });
  return result;
}

function staticViewQueryIds(nodeStaticQueryIds: Map<TemplateAst, StaticAndDynamicQueryIds>):
    StaticAndDynamicQueryIds {
  const staticQueryIds = new Set<number>();
  const dynamicQueryIds = new Set<number>();
  Array.from(nodeStaticQueryIds.values()).forEach((entry) => {
    entry.staticQueryIds.forEach(queryId => staticQueryIds.add(queryId));
    entry.dynamicQueryIds.forEach(queryId => dynamicQueryIds.add(queryId));
  });
  dynamicQueryIds.forEach(queryId => staticQueryIds.delete(queryId));
  return {staticQueryIds, dynamicQueryIds};
}

function createComponentFactoryResolver(directives: DirectiveAst[]): ProviderAst {
  const componentDirMeta = directives.find(dirAst => dirAst.directive.isComponent);
  if (componentDirMeta && componentDirMeta.directive.entryComponents.length) {
    const entryComponentFactories = componentDirMeta.directive.entryComponents.map(
        (entryComponent) => o.importExpr({reference: entryComponent.componentFactory}));
    const cfrExpr = o.importExpr(createIdentifier(Identifiers.CodegenComponentFactoryResolver))
                        .instantiate([o.literalArr(entryComponentFactories)]);
    const token = createIdentifierToken(Identifiers.ComponentFactoryResolver);
    const classMeta: CompileTypeMetadata = {
      diDeps: [
        {isValue: true, value: o.literalArr(entryComponentFactories)},
        {token: token, isSkipSelf: true, isOptional: true}
      ],
      lifecycleHooks: [],
      reference: resolveIdentifier(Identifiers.CodegenComponentFactoryResolver)
    };
    return new ProviderAst(
        token, false, true, [{token, multi: false, useClass: classMeta}],
        ProviderAstType.PrivateService, [], componentDirMeta.sourceSpan);
  }
  return null;
}
