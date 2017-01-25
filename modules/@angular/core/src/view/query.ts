/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef} from '../linker/element_ref';
import {ExpressionChangedAfterItHasBeenCheckedError} from '../linker/errors';
import {QueryList} from '../linker/query_list';
import {TemplateRef} from '../linker/template_ref';
import {ViewContainerRef} from '../linker/view_container_ref';

import {NodeDef, NodeFlags, NodeType, QueryBindingDef, QueryBindingType, QueryDef, QueryValueType, ViewData, asElementData, asProviderData, asQueryList} from './types';
import {declaredViewContainer} from './util';

export function queryDef(
    flags: NodeFlags, id: string, bindings: {[propName: string]: QueryBindingType}): NodeDef {
  let bindingDefs: QueryBindingDef[] = [];
  for (let propName in bindings) {
    const bindingType = bindings[propName];
    bindingDefs.push({propName, bindingType});
  }

  return {
    type: NodeType.Query,
    // will bet set by the view definition
    index: undefined,
    reverseChildIndex: undefined,
    parent: undefined,
    childFlags: undefined,
    childMatchedQueries: undefined,
    bindingIndex: undefined,
    disposableIndex: undefined,
    // regular values
    flags,
    matchedQueries: {},
    childCount: 0,
    bindings: [],
    disposableCount: 0,
    element: undefined,
    provider: undefined,
    text: undefined,
    pureExpression: undefined,
    query: {id, bindings: bindingDefs}
  };
}

export function createQuery(): QueryList<any> {
  return new QueryList();
}

export function dirtyParentQuery(queryId: string, view: ViewData) {
  let nodeIndex = view.parentIndex;
  view = view.parent;
  let queryIdx: number;
  while (view) {
    const elementDef = view.def.nodes[nodeIndex];
    queryIdx = elementDef.element.providerIndices[queryId];
    if (queryIdx != null) {
      break;
    }
    nodeIndex = view.parentIndex;
    view = view.parent;
  }
  if (!view) {
    throw new Error(
        `Illegal State: Tried to dirty parent query ${queryId} but the query could not be found!`);
  }
  asQueryList(view, queryIdx).setDirty();
}

export function checkAndUpdateQuery(view: ViewData, nodeDef: NodeDef) {
  const queryList = asQueryList(view, nodeDef.index);
  if (!queryList.dirty) {
    return;
  }
  const queryId = nodeDef.query.id;
  const providerDef = view.def.nodes[nodeDef.parent];
  const providerData = asProviderData(view, providerDef.index);
  let newValues: any[];
  if (nodeDef.flags & NodeFlags.HasContentQuery) {
    const elementDef = view.def.nodes[providerDef.parent];
    newValues = calcQueryValues(
        view, elementDef.index, elementDef.index + elementDef.childCount, queryId, []);
  } else if (nodeDef.flags & NodeFlags.HasViewQuery) {
    const compView = providerData.componentView;
    newValues = calcQueryValues(compView, 0, compView.def.nodes.length - 1, queryId, []);
  }
  queryList.reset(newValues);
  let boundValue: any;
  const bindings = nodeDef.query.bindings;
  for (let i = 0; i < bindings.length; i++) {
    const binding = bindings[i];
    switch (binding.bindingType) {
      case QueryBindingType.First:
        boundValue = queryList.first;
        break;
      case QueryBindingType.All:
        boundValue = queryList;
        break;
    }
    providerData.instance[binding.propName] = boundValue;
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
          value = new ElementRef(asElementData(view, i).renderElement);
          break;
        case QueryValueType.TemplateRef:
          value = view.services.createTemplateRef(view, nodeDef);
          break;
        case QueryValueType.ViewContainerRef:
          value = view.services.createViewContainerRef(asElementData(view, i));
          break;
        case QueryValueType.Provider:
          value = asProviderData(view, i).instance;
          break;
      }
      values.push(value);
    }
    if (nodeDef.flags & NodeFlags.HasEmbeddedViews &&
        queryId in nodeDef.element.template.nodeMatchedQueries) {
      // check embedded views that were attached at the place of their template.
      const elementData = asElementData(view, i);
      const embeddedViews = elementData.embeddedViews;
      for (let k = 0; k < embeddedViews.length; k++) {
        const embeddedView = embeddedViews[k];
        const dvc = declaredViewContainer(embeddedView);
        if (dvc && dvc === elementData) {
          calcQueryValues(embeddedView, 0, embeddedView.def.nodes.length - 1, queryId, values);
        }
      }
      const projectedViews = elementData.projectedViews;
      if (projectedViews) {
        for (let k = 0; k < projectedViews.length; k++) {
          const projectedView = projectedViews[k];
          calcQueryValues(projectedView, 0, projectedView.def.nodes.length - 1, queryId, values);
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
