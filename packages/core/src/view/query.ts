/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef} from '../linker/element_ref';
import {QueryList} from '../linker/query_list';

import {NodeDef, NodeFlags, QueryBindingDef, QueryBindingType, QueryDef, QueryValueType, ViewData, asElementData, asProviderData, asQueryList} from './types';
import {declaredViewContainer, filterQueryId, isEmbeddedView} from './util';

export function queryDef(
    flags: NodeFlags, id: number, bindings: {[propName: string]: QueryBindingType}): NodeDef {
  let bindingDefs: QueryBindingDef[] = [];
  for (let propName in bindings) {
    const bindingType = bindings[propName];
    bindingDefs.push({propName, bindingType});
  }

  return {
    // will bet set by the view definition
    index: -1,
    parent: null,
    renderParent: null,
    bindingIndex: -1,
    outputIndex: -1,
    // regular values
    flags,
    childFlags: 0,
    directChildFlags: 0,
    childMatchedQueries: 0,
    ngContentIndex: -1,
    matchedQueries: {},
    matchedQueryIds: 0,
    references: {},
    childCount: 0,
    bindings: [],
    bindingFlags: 0,
    outputs: [],
    element: null,
    provider: null,
    text: null,
    query: {id, filterId: filterQueryId(id), bindings: bindingDefs},
    ngContent: null
  };
}

export function createQuery(): QueryList<any> {
  return new QueryList();
}

export function dirtyParentQueries(view: ViewData) {
  const queryIds = view.def.nodeMatchedQueries;
  while (view.parent && isEmbeddedView(view)) {
    let tplDef = view.parentNodeDef !;
    view = view.parent;
    // content queries
    const end = tplDef.index + tplDef.childCount;
    for (let i = 0; i <= end; i++) {
      const nodeDef = view.def.nodes[i];
      if ((nodeDef.flags & NodeFlags.TypeContentQuery) &&
          (nodeDef.flags & NodeFlags.DynamicQuery) &&
          (nodeDef.query !.filterId & queryIds) === nodeDef.query !.filterId) {
        asQueryList(view, i).setDirty();
      }
      if ((nodeDef.flags & NodeFlags.TypeElement && i + nodeDef.childCount < tplDef.index) ||
          !(nodeDef.childFlags & NodeFlags.TypeContentQuery) ||
          !(nodeDef.childFlags & NodeFlags.DynamicQuery)) {
        // skip elements that don't contain the template element or no query.
        i += nodeDef.childCount;
      }
    }
  }

  // view queries
  if (view.def.nodeFlags & NodeFlags.TypeViewQuery) {
    for (let i = 0; i < view.def.nodes.length; i++) {
      const nodeDef = view.def.nodes[i];
      if ((nodeDef.flags & NodeFlags.TypeViewQuery) && (nodeDef.flags & NodeFlags.DynamicQuery)) {
        asQueryList(view, i).setDirty();
      }
      // only visit the root nodes
      i += nodeDef.childCount;
    }
  }
}

export function checkAndUpdateQuery(view: ViewData, nodeDef: NodeDef) {
  const queryList = asQueryList(view, nodeDef.index);
  if (!queryList.dirty) {
    return;
  }
  let directiveInstance: any;
  let newValues: any[] = undefined !;
  if (nodeDef.flags & NodeFlags.TypeContentQuery) {
    const elementDef = nodeDef.parent !.parent !;
    newValues = calcQueryValues(
        view, elementDef.index, elementDef.index + elementDef.childCount, nodeDef.query !, []);
    directiveInstance = asProviderData(view, nodeDef.parent !.index).instance;
  } else if (nodeDef.flags & NodeFlags.TypeViewQuery) {
    newValues = calcQueryValues(view, 0, view.def.nodes.length - 1, nodeDef.query !, []);
    directiveInstance = view.component;
  }
  queryList.reset(newValues);
  const bindings = nodeDef.query !.bindings;
  let notify = false;
  for (let i = 0; i < bindings.length; i++) {
    const binding = bindings[i];
    let boundValue: any;
    switch (binding.bindingType) {
      case QueryBindingType.First:
        boundValue = queryList.first;
        break;
      case QueryBindingType.All:
        boundValue = queryList;
        notify = true;
        break;
    }
    directiveInstance[binding.propName] = boundValue;
  }
  if (notify) {
    queryList.notifyOnChanges();
  }
}

function calcQueryValues(
    view: ViewData, startIndex: number, endIndex: number, queryDef: QueryDef,
    values: any[]): any[] {
  for (let i = startIndex; i <= endIndex; i++) {
    const nodeDef = view.def.nodes[i];
    const valueType = nodeDef.matchedQueries[queryDef.id];
    if (valueType != null) {
      values.push(getQueryValue(view, nodeDef, valueType));
    }
    if (nodeDef.flags & NodeFlags.TypeElement && nodeDef.element !.template &&
        (nodeDef.element !.template !.nodeMatchedQueries & queryDef.filterId) ===
            queryDef.filterId) {
      // check embedded views that were attached at the place of their template.
      const elementData = asElementData(view, i);
      if (nodeDef.flags & NodeFlags.EmbeddedViews) {
        const embeddedViews = elementData.viewContainer !._embeddedViews;
        for (let k = 0; k < embeddedViews.length; k++) {
          const embeddedView = embeddedViews[k];
          const dvc = declaredViewContainer(embeddedView);
          if (dvc && dvc === elementData) {
            calcQueryValues(embeddedView, 0, embeddedView.def.nodes.length - 1, queryDef, values);
          }
        }
      }
      const projectedViews = elementData.template._projectedViews;
      if (projectedViews) {
        for (let k = 0; k < projectedViews.length; k++) {
          const projectedView = projectedViews[k];
          calcQueryValues(projectedView, 0, projectedView.def.nodes.length - 1, queryDef, values);
        }
      }
    }
    if ((nodeDef.childMatchedQueries & queryDef.filterId) !== queryDef.filterId) {
      // if no child matches the query, skip the children.
      i += nodeDef.childCount;
    }
  }
  return values;
}

export function getQueryValue(
    view: ViewData, nodeDef: NodeDef, queryValueType: QueryValueType): any {
  if (queryValueType != null) {
    // a match
    let value: any;
    switch (queryValueType) {
      case QueryValueType.RenderElement:
        value = asElementData(view, nodeDef.index).renderElement;
        break;
      case QueryValueType.ElementRef:
        value = new ElementRef(asElementData(view, nodeDef.index).renderElement);
        break;
      case QueryValueType.TemplateRef:
        value = asElementData(view, nodeDef.index).template;
        break;
      case QueryValueType.ViewContainerRef:
        value = asElementData(view, nodeDef.index).viewContainer;
        break;
      case QueryValueType.Provider:
        value = asProviderData(view, nodeDef.index).instance;
        break;
    }
    return value;
  }
}