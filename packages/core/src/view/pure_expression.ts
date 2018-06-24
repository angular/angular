/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BindingDef, BindingFlags, NodeDef, NodeFlags, PureExpressionData, ViewData, asPureExpressionData} from './types';
import {calcBindingFlags, checkAndUpdateBinding} from './util';

export function purePipeDef(checkIndex: number, argCount: number): NodeDef {
  // argCount + 1 to include the pipe as first arg
  return _pureExpressionDef(NodeFlags.TypePurePipe, checkIndex, new Array(argCount + 1));
}

export function pureArrayDef(checkIndex: number, argCount: number): NodeDef {
  return _pureExpressionDef(NodeFlags.TypePureArray, checkIndex, new Array(argCount));
}

export function pureObjectDef(checkIndex: number, propToIndex: {[p: string]: number}): NodeDef {
  const keys = Object.keys(propToIndex);
  const nbKeys = keys.length;
  const propertyNames = new Array(nbKeys);
  for (let i = 0; i < nbKeys; i++) {
    const key = keys[i];
    const index = propToIndex[key];
    propertyNames[index] = key;
  }

  return _pureExpressionDef(NodeFlags.TypePureObject, checkIndex, propertyNames);
}

function _pureExpressionDef(
    flags: NodeFlags, checkIndex: number, propertyNames: string[]): NodeDef {
  const bindings: BindingDef[] = new Array(propertyNames.length);
  for (let i = 0; i < propertyNames.length; i++) {
    const prop = propertyNames[i];
    bindings[i] = {
      flags: BindingFlags.TypeProperty,
      name: prop,
      ns: null,
      nonMinifiedName: prop,
      securityContext: null,
      suffix: null
    };
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
    childCount: 0, bindings,
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

export const checkAndUpdatePureExpressionInline: (view: ViewData, def: NodeDef, ...args: any[]) =>
    boolean = function(view: ViewData, def: NodeDef) {
      const bindings = def.bindings;
      let changed = false;
      const bindLen = bindings.length;
      const vargs: any[] = [].slice.call(arguments, 2);
      for (let i = 0; i < bindLen; i++) {
        if (checkAndUpdateBinding(view, def, i, vargs[i])) {
          changed = true;
        }
      }

      if (changed) {
        const data = asPureExpressionData(view, def.nodeIndex);
        let value: any;
        switch (def.flags & NodeFlags.Types) {
          case NodeFlags.TypePureArray:
            value = new Array(bindings.length);
            for (let i = 0; i < bindLen; i++) {
              value[i] = vargs[i];
            }
            break;
          case NodeFlags.TypePureObject:
            value = {};
            for (let i = 0; i < bindLen; i++) {
              value[bindings[i].name !] = vargs[i];
            }
            break;
          case NodeFlags.TypePurePipe:
            const pipe = vargs[0];
            const collectedTransforms: any[] = [];
            if (bindLen === 1) {
              collectedTransforms.push(pipe);
            } else {
              for (let i = 1; i < bindLen; i++) {
                collectedTransforms.push(vargs[i]);
              }
            }
            value = pipe.transform(...collectedTransforms);
            break;
        }
        data.value = value;
      }
      return changed;
    };

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
          value[bindings[i].name !] = values[i];
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
