/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {newArray} from '../util/array_utils';

import {asPureExpressionData, BindingDef, BindingFlags, NodeDef, NodeFlags, PureExpressionData, ViewData} from './types';
import {calcBindingFlags, checkAndUpdateBinding} from './util';

export function purePipeDef(checkIndex: number, argCount: number): NodeDef {
  // argCount + 1 to include the pipe as first arg
  return _pureExpressionDef(NodeFlags.TypePurePipe, checkIndex, newArray(argCount + 1));
}

export function pureArrayDef(checkIndex: number, argCount: number): NodeDef {
  return _pureExpressionDef(NodeFlags.TypePureArray, checkIndex, newArray(argCount));
}

export function pureObjectDef(checkIndex: number, propToIndex: {[p: string]: number}): NodeDef {
  const keys = Object.keys(propToIndex);
  const nbKeys = keys.length;
  const propertyNames = [];
  for (let i = 0; i < nbKeys; i++) {
    const key = keys[i];
    const index = propToIndex[key];
    propertyNames.push(key);
  }

  return _pureExpressionDef(NodeFlags.TypePureObject, checkIndex, propertyNames);
}

function _pureExpressionDef(
    flags: NodeFlags, checkIndex: number, propertyNames: string[]): NodeDef {
  const bindings: BindingDef[] = [];
  for (let i = 0; i < propertyNames.length; i++) {
    const prop = propertyNames[i];
    bindings.push({
      flags: BindingFlags.TypeProperty,
      name: prop,
      ns: null,
      nonMinifiedName: prop,
      securityContext: null,
      suffix: null
    });
  }
  return {
    // will bet set by the view definition
    nodeIndex: -1,
    parent: null,
    renderParent: null,
    bindingIndex: -1,
    outputIndex: -1,
    // regular values
    checkIndex,
    flags,
    childFlags: 0,
    directChildFlags: 0,
    childMatchedQueries: 0,
    matchedQueries: {},
    matchedQueryIds: 0,
    references: {},
    ngContentIndex: -1,
    childCount: 0,
    bindings,
    bindingFlags: calcBindingFlags(bindings),
    outputs: [],
    element: null,
    provider: null,
    text: null,
    query: null,
    ngContent: null
  };
}

export function createPureExpression(view: ViewData, def: NodeDef): PureExpressionData {
  return {value: undefined};
}

export function checkAndUpdatePureExpressionInline(
    view: ViewData, def: NodeDef, v0: any, v1: any, v2: any, v3: any, v4: any, v5: any, v6: any,
    v7: any, v8: any, v9: any): boolean {
  const bindings = def.bindings;
  let changed = false;
  const bindLen = bindings.length;
  if (bindLen > 0 && checkAndUpdateBinding(view, def, 0, v0)) changed = true;
  if (bindLen > 1 && checkAndUpdateBinding(view, def, 1, v1)) changed = true;
  if (bindLen > 2 && checkAndUpdateBinding(view, def, 2, v2)) changed = true;
  if (bindLen > 3 && checkAndUpdateBinding(view, def, 3, v3)) changed = true;
  if (bindLen > 4 && checkAndUpdateBinding(view, def, 4, v4)) changed = true;
  if (bindLen > 5 && checkAndUpdateBinding(view, def, 5, v5)) changed = true;
  if (bindLen > 6 && checkAndUpdateBinding(view, def, 6, v6)) changed = true;
  if (bindLen > 7 && checkAndUpdateBinding(view, def, 7, v7)) changed = true;
  if (bindLen > 8 && checkAndUpdateBinding(view, def, 8, v8)) changed = true;
  if (bindLen > 9 && checkAndUpdateBinding(view, def, 9, v9)) changed = true;

  if (changed) {
    const data = asPureExpressionData(view, def.nodeIndex);
    let value: any;
    switch (def.flags & NodeFlags.Types) {
      case NodeFlags.TypePureArray:
        value = [];
        if (bindLen > 0) value.push(v0);
        if (bindLen > 1) value.push(v1);
        if (bindLen > 2) value.push(v2);
        if (bindLen > 3) value.push(v3);
        if (bindLen > 4) value.push(v4);
        if (bindLen > 5) value.push(v5);
        if (bindLen > 6) value.push(v6);
        if (bindLen > 7) value.push(v7);
        if (bindLen > 8) value.push(v8);
        if (bindLen > 9) value.push(v9);
        break;
      case NodeFlags.TypePureObject:
        value = {};
        if (bindLen > 0) value[bindings[0].name!] = v0;
        if (bindLen > 1) value[bindings[1].name!] = v1;
        if (bindLen > 2) value[bindings[2].name!] = v2;
        if (bindLen > 3) value[bindings[3].name!] = v3;
        if (bindLen > 4) value[bindings[4].name!] = v4;
        if (bindLen > 5) value[bindings[5].name!] = v5;
        if (bindLen > 6) value[bindings[6].name!] = v6;
        if (bindLen > 7) value[bindings[7].name!] = v7;
        if (bindLen > 8) value[bindings[8].name!] = v8;
        if (bindLen > 9) value[bindings[9].name!] = v9;
        break;
      case NodeFlags.TypePurePipe:
        const pipe = v0;
        switch (bindLen) {
          case 1:
            value = pipe.transform(v0);
            break;
          case 2:
            value = pipe.transform(v1);
            break;
          case 3:
            value = pipe.transform(v1, v2);
            break;
          case 4:
            value = pipe.transform(v1, v2, v3);
            break;
          case 5:
            value = pipe.transform(v1, v2, v3, v4);
            break;
          case 6:
            value = pipe.transform(v1, v2, v3, v4, v5);
            break;
          case 7:
            value = pipe.transform(v1, v2, v3, v4, v5, v6);
            break;
          case 8:
            value = pipe.transform(v1, v2, v3, v4, v5, v6, v7);
            break;
          case 9:
            value = pipe.transform(v1, v2, v3, v4, v5, v6, v7, v8);
            break;
          case 10:
            value = pipe.transform(v1, v2, v3, v4, v5, v6, v7, v8, v9);
            break;
        }
        break;
    }
    data.value = value;
  }
  return changed;
}

export function checkAndUpdatePureExpressionDynamic(
    view: ViewData, def: NodeDef, values: any[]): boolean {
  const bindings = def.bindings;
  let changed = false;
  for (let i = 0; i < values.length; i++) {
    // Note: We need to loop over all values, so that
    // the old values are updates as well!
    if (checkAndUpdateBinding(view, def, i, values[i])) {
      changed = true;
    }
  }
  if (changed) {
    const data = asPureExpressionData(view, def.nodeIndex);
    let value: any;
    switch (def.flags & NodeFlags.Types) {
      case NodeFlags.TypePureArray:
        value = values;
        break;
      case NodeFlags.TypePureObject:
        value = {};
        for (let i = 0; i < values.length; i++) {
          value[bindings[i].name!] = values[i];
        }
        break;
      case NodeFlags.TypePurePipe:
        const pipe = values[0];
        const params = values.slice(1);
        value = (<any>pipe.transform)(...params);
        break;
    }
    data.value = value;
  }
  return changed;
}
