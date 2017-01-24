/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SimpleChange, SimpleChanges} from '../change_detection/change_detection';
import {Injector} from '../di';
import {stringify} from '../facade/lang';
import {ElementRef} from '../linker/element_ref';
import {ExpressionChangedAfterItHasBeenCheckedError} from '../linker/errors';
import {QueryList} from '../linker/query_list';
import {TemplateRef} from '../linker/template_ref';
import {ViewContainerRef} from '../linker/view_container_ref';
import {Renderer} from '../render/api';

import {BindingDef, BindingType, DepDef, DepFlags, DisposableFn, NodeData, NodeDef, NodeFlags, NodeType, ProviderOutputDef, QueryBindingType, QueryDef, QueryValueType, Services, ViewData, ViewDefinition, ViewFlags} from './types';
import {checkAndUpdateBinding, checkAndUpdateBindingWithChange, declaredViewContainer, setBindingDebugInfo} from './util';

const _tokenKeyCache = new Map<any, string>();

const RendererTokenKey = tokenKey(Renderer);
const ElementRefTokenKey = tokenKey(ElementRef);
const ViewContainerRefTokenKey = tokenKey(ViewContainerRef);
const TemplateRefTokenKey = tokenKey(TemplateRef);

export function providerDef(
    flags: NodeFlags, matchedQueries: [string, QueryValueType][], ctor: any,
    deps: ([DepFlags, any] | any)[], props?: {[name: string]: [number, string]},
    outputs?: {[name: string]: string},
    contentQueries?: {[name: string]: [string, QueryBindingType]}, component?: () => ViewDefinition,
    viewQueries?: {[name: string]: [string, QueryBindingType]}, ): NodeDef {
  const matchedQueryDefs: {[queryId: string]: QueryValueType} = {};
  if (matchedQueries) {
    matchedQueries.forEach(([queryId, valueType]) => { matchedQueryDefs[queryId] = valueType; });
  }

  const bindings: BindingDef[] = [];
  if (props) {
    for (let prop in props) {
      const [bindingIndex, nonMinifiedName] = props[prop];
      bindings[bindingIndex] = {
        type: BindingType.ProviderProperty,
        name: prop, nonMinifiedName,
        securityContext: undefined,
        suffix: undefined
      };
    }
  }
  const outputDefs: ProviderOutputDef[] = [];
  if (outputs) {
    for (let propName in outputs) {
      outputDefs.push({propName, eventName: outputs[propName]});
    }
  }
  const depDefs: DepDef[] = deps.map(value => {
    let token: any;
    let flags: DepFlags;
    if (Array.isArray(value)) {
      [flags, token] = value;
    } else {
      flags = DepFlags.None;
      token = value;
    }
    return {flags, token, tokenKey: tokenKey(token)};
  });
  const contentQueryDefs: QueryDef[] = [];
  for (let propName in contentQueries) {
    const [id, bindingType] = contentQueries[propName];
    contentQueryDefs.push({id, propName, bindingType});
  }
  const viewQueryDefs: QueryDef[] = [];
  for (let propName in viewQueries) {
    const [id, bindingType] = viewQueries[propName];
    viewQueryDefs.push({id, propName, bindingType});
  }

  if (component) {
    flags = flags | NodeFlags.HasComponent;
  }
  if (contentQueryDefs.length) {
    flags = flags | NodeFlags.HasContentQuery;
  }
  if (viewQueryDefs.length) {
    flags = flags | NodeFlags.HasViewQuery;
  }

  return {
    type: NodeType.Provider,
    // will bet set by the view definition
    index: undefined,
    reverseChildIndex: undefined,
    parent: undefined,
    childFlags: undefined,
    childMatchedQueries: undefined,
    bindingIndex: undefined,
    disposableIndex: undefined,
    providerIndices: undefined,
    // regular values
    flags,
    matchedQueries: matchedQueryDefs,
    childCount: 0, bindings,
    disposableCount: outputDefs.length,
    element: undefined,
    provider: {
      tokenKey: tokenKey(ctor),
      ctor,
      deps: depDefs,
      outputs: outputDefs,
      contentQueries: contentQueryDefs,
      viewQueries: viewQueryDefs, component
    },
    text: undefined,
    pureExpression: undefined,
  };
}

export function tokenKey(token: any): string {
  let key = _tokenKeyCache.get(token);
  if (!key) {
    key = stringify(token) + '_' + _tokenKeyCache.size;
    _tokenKeyCache.set(token, key);
  }
  return key;
}

export function createProvider(view: ViewData, def: NodeDef, componentView: ViewData): NodeData {
  const providerDef = def.provider;
  const provider = createInstance(view, def.parent, providerDef.ctor, providerDef.deps);
  if (providerDef.outputs.length) {
    for (let i = 0; i < providerDef.outputs.length; i++) {
      const output = providerDef.outputs[i];
      const subscription = provider[output.propName].subscribe(
          view.def.handleEvent.bind(null, view, def.parent, output.eventName));
      view.disposables[def.disposableIndex + i] = subscription.unsubscribe.bind(subscription);
    }
  }
  let queries: {[queryId: string]: QueryList<any>};
  if (providerDef.contentQueries.length || providerDef.viewQueries.length) {
    queries = {};
    for (let i = 0; i < providerDef.contentQueries.length; i++) {
      const def = providerDef.contentQueries[i];
      queries[def.id] = new QueryList<any>();
    }
    for (let i = 0; i < providerDef.viewQueries.length; i++) {
      const def = providerDef.viewQueries[i];
      queries[def.id] = new QueryList<any>();
    }
  }
  return {
    elementOrText: undefined,
    provider: {instance: provider, componentView: componentView, queries},
    pureExpression: undefined,
  };
}

export function checkAndUpdateProviderInline(
    view: ViewData, def: NodeDef, v0: any, v1: any, v2: any, v3: any, v4: any, v5: any, v6: any,
    v7: any, v8: any, v9: any) {
  const provider = view.nodes[def.index].provider.instance;
  let changes: SimpleChanges;
  // Note: fallthrough is intended!
  switch (def.bindings.length) {
    case 10:
      changes = checkAndUpdateProp(view, provider, def, 9, v9, changes);
    case 9:
      changes = checkAndUpdateProp(view, provider, def, 8, v8, changes);
    case 8:
      changes = checkAndUpdateProp(view, provider, def, 7, v7, changes);
    case 7:
      changes = checkAndUpdateProp(view, provider, def, 6, v6, changes);
    case 6:
      changes = checkAndUpdateProp(view, provider, def, 5, v5, changes);
    case 5:
      changes = checkAndUpdateProp(view, provider, def, 4, v4, changes);
    case 4:
      changes = checkAndUpdateProp(view, provider, def, 3, v3, changes);
    case 3:
      changes = checkAndUpdateProp(view, provider, def, 2, v2, changes);
    case 2:
      changes = checkAndUpdateProp(view, provider, def, 1, v1, changes);
    case 1:
      changes = checkAndUpdateProp(view, provider, def, 0, v0, changes);
  }
  if (changes) {
    provider.ngOnChanges(changes);
  }
  if (view.firstChange && (def.flags & NodeFlags.OnInit)) {
    provider.ngOnInit();
  }
  if (def.flags & NodeFlags.DoCheck) {
    provider.ngDoCheck();
  }
}

export function checkAndUpdateProviderDynamic(view: ViewData, def: NodeDef, values: any[]) {
  const provider = view.nodes[def.index].provider.instance;
  let changes: SimpleChanges;
  for (let i = 0; i < values.length; i++) {
    changes = checkAndUpdateProp(view, provider, def, i, values[i], changes);
  }
  if (changes) {
    provider.ngOnChanges(changes);
  }
  if (view.firstChange && (def.flags & NodeFlags.OnInit)) {
    provider.ngOnInit();
  }
  if (def.flags & NodeFlags.DoCheck) {
    provider.ngDoCheck();
  }
}

function createInstance(view: ViewData, elIndex: number, ctor: any, deps: DepDef[]): any {
  const len = deps.length;
  let injectable: any;
  switch (len) {
    case 0:
      injectable = new ctor();
      break;
    case 1:
      injectable = new ctor(resolveDep(view, elIndex, deps[0]));
      break;
    case 2:
      injectable = new ctor(resolveDep(view, elIndex, deps[0]), resolveDep(view, elIndex, deps[1]));
      break;
    case 3:
      injectable = new ctor(
          resolveDep(view, elIndex, deps[0]), resolveDep(view, elIndex, deps[1]),
          resolveDep(view, elIndex, deps[2]));
      break;
    default:
      const depValues = new Array(len);
      for (let i = 0; i < len; i++) {
        depValues[i] = resolveDep(view, elIndex, deps[i]);
      }
      injectable = new ctor(...depValues);
  }
  return injectable;
}

export function resolveDep(
    view: ViewData, elIndex: number, depDef: DepDef,
    notFoundValue: any = Injector.THROW_IF_NOT_FOUND): any {
  const tokenKey = depDef.tokenKey;

  if (depDef.flags & DepFlags.SkipSelf) {
    const elDef = view.def.nodes[elIndex];
    if (elDef.parent != null) {
      elIndex = elDef.parent;
    } else {
      elIndex = view.parentDiIndex;
      view = view.parent;
    }
  }

  while (view) {
    const elDef = view.def.nodes[elIndex];
    switch (tokenKey) {
      case RendererTokenKey:
        if (view.renderer) {
          return view.renderer;
        } else {
          return Injector.NULL.get(depDef.token, notFoundValue);
        }
      case ElementRefTokenKey:
        return new ElementRef(view.nodes[elIndex].elementOrText.node);
      case ViewContainerRefTokenKey:
        return view.services.createViewContainerRef(view.nodes[elIndex]);
      case TemplateRefTokenKey:
        return view.services.createTemplateRef(view, elDef);
      default:
        const providerIndex = elDef.providerIndices[tokenKey];
        if (providerIndex != null) {
          return view.nodes[providerIndex].provider.instance;
        }
    }
    elIndex = view.parentDiIndex;
    view = view.parent;
  }
  return Injector.NULL.get(depDef.token, notFoundValue);
}

function checkAndUpdateProp(
    view: ViewData, provider: any, def: NodeDef, bindingIdx: number, value: any,
    changes: SimpleChanges): SimpleChanges {
  let change: SimpleChange;
  let changed: boolean;
  if (def.flags & NodeFlags.OnChanges) {
    change = checkAndUpdateBindingWithChange(view, def, bindingIdx, value);
    changed = !!change;
  } else {
    changed = checkAndUpdateBinding(view, def, bindingIdx, value);
  }
  if (changed) {
    const binding = def.bindings[bindingIdx];
    const propName = binding.name;
    // Note: This is still safe with Closure Compiler as
    // the user passed in the property name as an object has to `providerDef`,
    // so Closure Compiler will have renamed the property correctly already.
    provider[propName] = value;

    if (view.def.flags & ViewFlags.LogBindingUpdate) {
      setBindingDebugInfo(
          view.renderer, view.nodes[def.parent].elementOrText.node, binding.nonMinifiedName, value);
    }
    if (change) {
      changes = changes || {};
      changes[binding.nonMinifiedName] = change;
    }
  }
  return changes;
}

export enum QueryAction {
  CheckNoChanges,
  CheckAndUpdate,
}

export function execContentQueriesAction(view: ViewData, action: QueryAction) {
  if (!(view.def.nodeFlags & NodeFlags.HasContentQuery)) {
    return;
  }
  for (let i = 0; i < view.nodes.length; i++) {
    const nodeDef = view.def.nodes[i];
    if (nodeDef.flags & NodeFlags.HasContentQuery) {
      execContentQuery(view, nodeDef, action);
    } else if ((nodeDef.childFlags & NodeFlags.HasContentQuery) === 0) {
      // no child has a content query
      // then skip the children
      i += nodeDef.childCount;
    }
  }
}

export function updateViewQueries(view: ViewData, action: QueryAction) {
  if (!(view.def.nodeFlags & NodeFlags.HasViewQuery)) {
    return;
  }
  for (let i = 0; i < view.nodes.length; i++) {
    const nodeDef = view.def.nodes[i];
    if (nodeDef.flags & NodeFlags.HasViewQuery) {
      updateViewQuery(view, nodeDef, action);
    } else if ((nodeDef.childFlags & NodeFlags.HasViewQuery) === 0) {
      // no child has a view query
      // then skip the children
      i += nodeDef.childCount;
    }
  }
}

function execContentQuery(view: ViewData, nodeDef: NodeDef, action: QueryAction) {
  const providerData = view.nodes[nodeDef.index].provider;
  for (let i = 0; i < nodeDef.provider.contentQueries.length; i++) {
    const queryDef = nodeDef.provider.contentQueries[i];
    const queryId = queryDef.id;
    const queryList = providerData.queries[queryId];
    if (queryList.dirty) {
      const elementDef = view.def.nodes[nodeDef.parent];
      const newValues = calcQueryValues(
          view, elementDef.index, elementDef.index + elementDef.childCount, queryId, []);
      execQueryAction(view, providerData.instance, queryList, queryDef, newValues, action);
    }
  }
}

function updateViewQuery(view: ViewData, nodeDef: NodeDef, action: QueryAction) {
  for (let i = 0; i < nodeDef.provider.viewQueries.length; i++) {
    const queryDef = nodeDef.provider.viewQueries[i];
    const queryId = queryDef.id;
    const providerData = view.nodes[nodeDef.index].provider;
    const queryList = providerData.queries[queryId];
    if (queryList.dirty) {
      const componentView = providerData.componentView;
      const newValues =
          calcQueryValues(componentView, 0, componentView.nodes.length - 1, queryId, []);
      execQueryAction(view, providerData.instance, queryList, queryDef, newValues, action);
    }
  }
}

function execQueryAction(
    view: ViewData, provider: any, queryList: QueryList<any>, queryDef: QueryDef, newValues: any[],
    action: QueryAction) {
  switch (action) {
    case QueryAction.CheckAndUpdate:
      queryList.reset(newValues);
      let boundValue: any;
      switch (queryDef.bindingType) {
        case QueryBindingType.First:
          boundValue = queryList.first;
          break;
        case QueryBindingType.All:
          boundValue = queryList;
          break;
      }
      provider[queryDef.propName] = boundValue;
      break;
    case QueryAction.CheckNoChanges:
      // queries should always be non dirty when we go into checkNoChanges!
      const oldValuesStr = queryList.toArray().map(v => stringify(v));
      const newValuesStr = newValues.map(v => stringify(v));
      throw new ExpressionChangedAfterItHasBeenCheckedError(
          oldValuesStr, newValuesStr, view.firstChange);
  }
}

function calcQueryValues(
    view: ViewData, startIndex: number, endIndex: number, queryId: string, values: any[]): any[] {
  const len = view.def.nodes.length;
  for (let i = startIndex; i <= endIndex; i++) {
    const nodeDef = view.def.nodes[i];
    const queryValueType = <QueryValueType>nodeDef.matchedQueries[queryId];
    if (queryValueType != null) {
      // a match
      let value: any;
      switch (queryValueType) {
        case QueryValueType.ElementRef:
          value = new ElementRef(view.nodes[i].elementOrText.node);
          break;
        case QueryValueType.TemplateRef:
          value = view.services.createTemplateRef(view, nodeDef);
          break;
        case QueryValueType.ViewContainerRef:
          value = view.services.createViewContainerRef(view.nodes[i]);
          break;
        case QueryValueType.Provider:
          value = view.nodes[i].provider.instance;
          break;
      }
      values.push(value);
    }
    if (nodeDef.flags & NodeFlags.HasEmbeddedViews &&
        queryId in nodeDef.element.template.nodeMatchedQueries) {
      // check embedded views that were attached at the place of their template.
      const nodeData = view.nodes[i];
      const embeddedViews = nodeData.elementOrText.embeddedViews;
      for (let k = 0; k < embeddedViews.length; k++) {
        const embeddedView = embeddedViews[k];
        const dvc = declaredViewContainer(embeddedView);
        if (dvc && dvc === nodeData) {
          calcQueryValues(embeddedView, 0, embeddedView.nodes.length - 1, queryId, values);
        }
      }
      const projectedViews = nodeData.elementOrText.projectedViews;
      if (projectedViews) {
        for (let k = 0; k < projectedViews.length; k++) {
          const projectedView = projectedViews[k];
          calcQueryValues(projectedView, 0, projectedView.nodes.length - 1, queryId, values);
        }
      }
    }
    if (!(queryId in nodeDef.childMatchedQueries)) {
      // If don't check descendants, skip the children.
      // Or: no child matches the query, then skip the children as well.
      i += nodeDef.childCount;
    }
  }
  return values;
}

export function callLifecycleHooksChildrenFirst(view: ViewData, lifecycles: NodeFlags) {
  if (!(view.def.nodeFlags & lifecycles)) {
    return;
  }
  const len = view.def.nodes.length;
  for (let i = 0; i < len; i++) {
    // We use the provider post order to call providers of children first.
    const nodeDef = view.def.reverseChildNodes[i];
    const nodeIndex = nodeDef.index;
    if (nodeDef.flags & lifecycles) {
      // a leaf
      callProviderLifecycles(view.nodes[nodeIndex].provider.instance, nodeDef.flags & lifecycles);
    } else if ((nodeDef.childFlags & lifecycles) === 0) {
      // a parent with leafs
      // no child matches one of the lifecycles,
      // then skip the children
      i += nodeDef.childCount;
    }
  }
}

function callProviderLifecycles(provider: any, lifecycles: NodeFlags) {
  if (lifecycles & NodeFlags.AfterContentInit) {
    provider.ngAfterContentInit();
  }
  if (lifecycles & NodeFlags.AfterContentChecked) {
    provider.ngAfterContentChecked();
  }
  if (lifecycles & NodeFlags.AfterViewInit) {
    provider.ngAfterViewInit();
  }
  if (lifecycles & NodeFlags.AfterViewChecked) {
    provider.ngAfterViewChecked();
  }
  if (lifecycles & NodeFlags.OnDestroy) {
    provider.ngOnDestroy();
  }
}
