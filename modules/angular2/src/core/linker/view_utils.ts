import {
  isBlank,
  isPresent,
  Type,
  stringify,
  CONST_EXPR,
  looseIdentical
} from 'angular2/src/facade/lang';
import {ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {BaseException} from 'angular2/src/facade/exceptions';
import {AppElement} from './element';
import {ExpressionChangedAfterItHasBeenCheckedException} from './exceptions';
import {devModeEqual} from 'angular2/src/core/change_detection/change_detection';

export function flattenNestedViewRenderNodes(nodes: any[]): any[] {
  return _flattenNestedViewRenderNodes(nodes, []);
}

function _flattenNestedViewRenderNodes(nodes: any[], renderNodes: any[]): any[] {
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    if (node instanceof AppElement) {
      var appEl = <AppElement>node;
      renderNodes.push(appEl.nativeElement);
      if (isPresent(appEl.nestedViews)) {
        for (var k = 0; k < appEl.nestedViews.length; k++) {
          _flattenNestedViewRenderNodes(appEl.nestedViews[k].rootNodesOrAppElements, renderNodes);
        }
      }
    } else {
      renderNodes.push(node);
    }
  }
  return renderNodes;
}

const EMPTY_ARR = CONST_EXPR([]);

export function ensureSlotCount(projectableNodes: any[][], expectedSlotCount: number): any[][] {
  var res;
  if (isBlank(projectableNodes)) {
    res = EMPTY_ARR;
  } else if (projectableNodes.length < expectedSlotCount) {
    var givenSlotCount = projectableNodes.length;
    res = ListWrapper.createFixedSize(expectedSlotCount);
    for (var i = 0; i < expectedSlotCount; i++) {
      res[i] = (i < givenSlotCount) ? projectableNodes[i] : EMPTY_ARR;
    }
  } else {
    res = projectableNodes;
  }
  return res;
}

export const MAX_INTERPOLATION_VALUES = 9;

export function interpolate(valueCount: number, c0: string, a1: any, c1: string, a2?: any,
                            c2?: string, a3?: any, c3?: string, a4?: any, c4?: string, a5?: any,
                            c5?: string, a6?: any, c6?: string, a7?: any, c7?: string, a8?: any,
                            c8?: string, a9?: any, c9?: string): string {
  switch (valueCount) {
    case 1:
      return c0 + _toStringWithNull(a1) + c1;
    case 2:
      return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2;
    case 3:
      return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
             c3;
    case 4:
      return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
             c3 + _toStringWithNull(a4) + c4;
    case 5:
      return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
             c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5;
    case 6:
      return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
             c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) +
             c6;
    case 7:
      return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
             c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) +
             c6 + _toStringWithNull(a7) + c7;
    case 8:
      return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
             c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) +
             c6 + _toStringWithNull(a7) + c7 + _toStringWithNull(a8) + c8;
    case 9:
      return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
             c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) +
             c6 + _toStringWithNull(a7) + c7 + _toStringWithNull(a8) + c8 + _toStringWithNull(a9) +
             c9;
    default:
      throw new BaseException(`Does not support more than 9 expressions`);
  }
}

function _toStringWithNull(v: any): string {
  return v != null ? v.toString() : '';
}

export function checkBinding(throwOnChange: boolean, oldValue: any, newValue: any): boolean {
  if (throwOnChange) {
    if (!devModeEqual(oldValue, newValue)) {
      throw new ExpressionChangedAfterItHasBeenCheckedException(oldValue, newValue, null);
    }
    return false;
  } else {
    return !looseIdentical(oldValue, newValue);
  }
}

export function arrayLooseIdentical(a: any[], b: any[]): boolean {
  if (a.length != b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (!looseIdentical(a[i], b[i])) return false;
  }
  return true;
}

export function mapLooseIdentical<V>(m1: {[key: string]: V}, m2: {[key: string]: V}): boolean {
  var k1 = StringMapWrapper.keys(m1);
  var k2 = StringMapWrapper.keys(m2);
  if (k1.length != k2.length) {
    return false;
  }
  var key;
  for (var i = 0; i < k1.length; i++) {
    key = k1[i];
    if (!looseIdentical(m1[key], m2[key])) {
      return false;
    }
  }
  return true;
}
