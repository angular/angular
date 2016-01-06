import {isBlank, isPresent, Type, stringify, CONST_EXPR} from 'angular2/src/facade/lang';
import {ListWrapper} from 'angular2/src/facade/collection';
import {BaseException} from 'angular2/src/facade/exceptions';
import {AppElement} from './element';

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
      return c0 + toStringWithNull(a1) + c1;
    case 2:
      return c0 + toStringWithNull(a1) + c1 + toStringWithNull(a2) + c2;
    case 3:
      return c0 + toStringWithNull(a1) + c1 + toStringWithNull(a2) + c2 + toStringWithNull(a3) + c3;
    case 4:
      return c0 + toStringWithNull(a1) + c1 + toStringWithNull(a2) + c2 + toStringWithNull(a3) +
             c3 + toStringWithNull(a4) + c4;
    case 5:
      return c0 + toStringWithNull(a1) + c1 + toStringWithNull(a2) + c2 + toStringWithNull(a3) +
             c3 + toStringWithNull(a4) + c4 + toStringWithNull(a5) + c5;
    case 6:
      return c0 + toStringWithNull(a1) + c1 + toStringWithNull(a2) + c2 + toStringWithNull(a3) +
             c3 + toStringWithNull(a4) + c4 + toStringWithNull(a5) + c5 + toStringWithNull(a6) + c6;
    case 7:
      return c0 + toStringWithNull(a1) + c1 + toStringWithNull(a2) + c2 + toStringWithNull(a3) +
             c3 + toStringWithNull(a4) + c4 + toStringWithNull(a5) + c5 + toStringWithNull(a6) +
             c6 + toStringWithNull(a7) + c7;
    case 8:
      return c0 + toStringWithNull(a1) + c1 + toStringWithNull(a2) + c2 + toStringWithNull(a3) +
             c3 + toStringWithNull(a4) + c4 + toStringWithNull(a5) + c5 + toStringWithNull(a6) +
             c6 + toStringWithNull(a7) + c7 + toStringWithNull(a8) + c8;
    case 9:
      return c0 + toStringWithNull(a1) + c1 + toStringWithNull(a2) + c2 + toStringWithNull(a3) +
             c3 + toStringWithNull(a4) + c4 + toStringWithNull(a5) + c5 + toStringWithNull(a6) +
             c6 + toStringWithNull(a7) + c7 + toStringWithNull(a8) + c8 + toStringWithNull(a9) + c9;
    default:
      throw new BaseException(`Does not support more than 9 expressions`);
  }
}

function toStringWithNull(v: any): string {
  return v != null ? v.toString() : '';
}
