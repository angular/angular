/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationEntryCompileResult} from '../animation/animation_compiler';
import {CompileDirectiveMetadata, CompileIdentifierMetadata, CompilePipeMetadata} from '../compile_metadata';
import {EventHandlerVars, NameResolver} from '../compiler_util/expression_converter';
import {createPureProxy} from '../compiler_util/identifier_util';
import {CompilerConfig} from '../config';
import {MapWrapper} from '../facade/collection';
import {isPresent} from '../facade/lang';
import {Identifiers, resolveIdentifier} from '../identifiers';
import * as o from '../output/output_ast';
import {ViewType} from '../private_import_core';

import {CompileElement, CompileNode} from './compile_element';
import {CompileMethod} from './compile_method';
import {CompilePipe} from './compile_pipe';
import {CompileQuery, addQueryToTokenMap, createQueryList} from './compile_query';
import {getPropertyInView, getViewFactoryName} from './util';

export class CompileView implements NameResolver {
  public viewType: ViewType;
  public viewQueries: Map<any, CompileQuery[]>;

  public nodes: CompileNode[] = [];
  // root nodes or AppElements for ViewContainers
  public rootNodesOrAppElements: o.Expression[] = [];

  public createMethod: CompileMethod;
  public animationBindingsMethod: CompileMethod;
  public injectorGetMethod: CompileMethod;
  public updateContentQueriesMethod: CompileMethod;
  public dirtyParentQueriesMethod: CompileMethod;
  public updateViewQueriesMethod: CompileMethod;
  public detectChangesInInputsMethod: CompileMethod;
  public detectChangesRenderPropertiesMethod: CompileMethod;
  public afterContentLifecycleCallbacksMethod: CompileMethod;
  public afterViewLifecycleCallbacksMethod: CompileMethod;
  public destroyMethod: CompileMethod;
  public detachMethod: CompileMethod;
  public methods: o.ClassMethod[] = [];

  public ctorStmts: o.Statement[] = [];
  public fields: o.ClassField[] = [];
  public getters: o.ClassGetter[] = [];
  public disposables: o.Expression[] = [];
  public subscriptions: o.Expression[] = [];

  public componentView: CompileView;
  public purePipes = new Map<string, CompilePipe>();
  public pipes: CompilePipe[] = [];
  public locals = new Map<string, o.Expression>();
  public className: string;
  public classType: o.Type;
  public viewFactory: o.ReadVarExpr;

  public literalArrayCount = 0;
  public literalMapCount = 0;
  public pipeCount = 0;

  public componentContext: o.Expression;

  constructor(
      public component: CompileDirectiveMetadata, public genConfig: CompilerConfig,
      public pipeMetas: CompilePipeMetadata[], public styles: o.Expression,
      public animations: AnimationEntryCompileResult[], public viewIndex: number,
      public declarationElement: CompileElement, public templateVariableBindings: string[][]) {
    this.createMethod = new CompileMethod(this);
    this.animationBindingsMethod = new CompileMethod(this);
    this.injectorGetMethod = new CompileMethod(this);
    this.updateContentQueriesMethod = new CompileMethod(this);
    this.dirtyParentQueriesMethod = new CompileMethod(this);
    this.updateViewQueriesMethod = new CompileMethod(this);
    this.detectChangesInInputsMethod = new CompileMethod(this);
    this.detectChangesRenderPropertiesMethod = new CompileMethod(this);

    this.afterContentLifecycleCallbacksMethod = new CompileMethod(this);
    this.afterViewLifecycleCallbacksMethod = new CompileMethod(this);
    this.destroyMethod = new CompileMethod(this);
    this.detachMethod = new CompileMethod(this);

    this.viewType = getViewType(component, viewIndex);
    this.className = `_View_${component.type.name}${viewIndex}`;
    this.classType = o.importType(new CompileIdentifierMetadata({name: this.className}));
    this.viewFactory = o.variable(getViewFactoryName(component, viewIndex));
    if (this.viewType === ViewType.COMPONENT || this.viewType === ViewType.HOST) {
      this.componentView = this;
    } else {
      this.componentView = this.declarationElement.view.componentView;
    }
    this.componentContext =
        getPropertyInView(o.THIS_EXPR.prop('context'), this, this.componentView);

    var viewQueries = new Map<any, CompileQuery[]>();
    if (this.viewType === ViewType.COMPONENT) {
      var directiveInstance = o.THIS_EXPR.prop('context');
      this.component.viewQueries.forEach((queryMeta, queryIndex) => {
        var propName = `_viewQuery_${queryMeta.selectors[0].name}_${queryIndex}`;
        var queryList = createQueryList(queryMeta, directiveInstance, propName, this);
        var query = new CompileQuery(queryMeta, queryList, directiveInstance, this);
        addQueryToTokenMap(viewQueries, query);
      });
      var constructorViewQueryCount = 0;
      this.component.type.diDeps.forEach((dep) => {
        if (isPresent(dep.viewQuery)) {
          var queryList = o.THIS_EXPR.prop('declarationAppElement')
                              .prop('componentConstructorViewQueries')
                              .key(o.literal(constructorViewQueryCount++));
          var query = new CompileQuery(dep.viewQuery, queryList, null, this);
          addQueryToTokenMap(viewQueries, query);
        }
      });
    }
    this.viewQueries = viewQueries;
    templateVariableBindings.forEach(
        (entry) => { this.locals.set(entry[1], o.THIS_EXPR.prop('context').prop(entry[0])); });

    if (!this.declarationElement.isNull()) {
      this.declarationElement.setEmbeddedView(this);
    }
  }

  callPipe(name: string, input: o.Expression, args: o.Expression[]): o.Expression {
    return CompilePipe.call(this, name, [input].concat(args));
  }

  getLocal(name: string): o.Expression {
    if (name == EventHandlerVars.event.name) {
      return EventHandlerVars.event;
    }
    var currView: CompileView = this;
    var result = currView.locals.get(name);
    while (!result && isPresent(currView.declarationElement.view)) {
      currView = currView.declarationElement.view;
      result = currView.locals.get(name);
    }
    if (isPresent(result)) {
      return getPropertyInView(result, this, currView);
    } else {
      return null;
    }
  }

  afterNodes() {
    MapWrapper.values(this.viewQueries)
        .forEach(
            (queries) => queries.forEach(
                (query) => query.afterChildren(this.createMethod, this.updateViewQueriesMethod)));
  }
}

function getViewType(component: CompileDirectiveMetadata, embeddedTemplateIndex: number): ViewType {
  if (embeddedTemplateIndex > 0) {
    return ViewType.EMBEDDED;
  } else if (component.type.isHost) {
    return ViewType.HOST;
  } else {
    return ViewType.COMPONENT;
  }
}
