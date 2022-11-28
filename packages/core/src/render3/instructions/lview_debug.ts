/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../../interface/type';
import {KeyValueArray} from '../../util/array_utils';
import {assertNodeInjector} from '../assert';
import {getInjectorIndex, getParentInjectorLocation} from '../di';
import {DirectiveDef} from '../interfaces/definition';
import {NO_PARENT_INJECTOR, NodeInjectorOffset} from '../interfaces/injector';
import {AttributeMarker, InsertBeforeIndex, PropertyAliases, TContainerNode, TElementNode, TNode as ITNode, TNodeFlags, TNodeProviderIndexes, TNodeType, toTNodeTypeAsString} from '../interfaces/node';
import {SelectorFlags} from '../interfaces/projection';
import {RNode} from '../interfaces/renderer_dom';
import {getTStylingRangeNext, getTStylingRangeNextDuplicate, getTStylingRangePrev, getTStylingRangePrevDuplicate, TStylingKey, TStylingRange} from '../interfaces/styling';
import {DebugNode, LView, NodeInjectorDebug, TView as ITView, TVIEW, TView} from '../interfaces/view';
import {getParentInjectorIndex, getParentInjectorView} from '../util/injector_utils';
import {unwrapRNode} from '../util/view_utils';

/*
 * This file contains conditionally attached classes which provide human readable (debug) level
 * information for `LView`, `LContainer` and other internal data structures. These data structures
 * are stored internally as array which makes it very difficult during debugging to reason about the
 * current state of the system.
 *
 * Patching the array with extra property does change the array's hidden class' but it does not
 * change the cost of access, therefore this patching should not have significant if any impact in
 * `ngDevMode` mode. (see: https://jsperf.com/array-vs-monkey-patch-array)
 *
 * So instead of seeing:
 * ```
 * Array(30) [Object, 659, null, …]
 * ```
 *
 * You get to see:
 * ```
 * LViewDebug {
 *   views: [...],
 *   flags: {attached: true, ...}
 *   nodes: [
 *     {html: '<div id="123">', ..., nodes: [
 *       {html: '<span>', ..., nodes: null}
 *     ]}
 *   ]
 * }
 * ```
 */

class TNode implements ITNode {
  constructor(
      public tView_: TView,                                                          //
      public type: TNodeType,                                                        //
      public index: number,                                                          //
      public insertBeforeIndex: InsertBeforeIndex,                                   //
      public injectorIndex: number,                                                  //
      public componentOffset: number,                                                //
      public directiveStart: number,                                                 //
      public directiveEnd: number,                                                   //
      public directiveStylingLast: number,                                           //
      public propertyBindings: number[]|null,                                        //
      public flags: TNodeFlags,                                                      //
      public providerIndexes: TNodeProviderIndexes,                                  //
      public value: string|null,                                                     //
      public attrs: (string|AttributeMarker|(string|SelectorFlags)[])[]|null,        //
      public mergedAttrs: (string|AttributeMarker|(string|SelectorFlags)[])[]|null,  //
      public localNames: (string|number)[]|null,                                     //
      public initialInputs: (string[]|null)[]|null|undefined,                        //
      public inputs: PropertyAliases|null,                                           //
      public outputs: PropertyAliases|null,                                          //
      public tViews: ITView|ITView[]|null,                                           //
      public next: ITNode|null,                                                      //
      public projectionNext: ITNode|null,                                            //
      public child: ITNode|null,                                                     //
      public parent: TElementNode|TContainerNode|null,                               //
      public projection: number|(ITNode|RNode[])[]|null,                             //
      public styles: string|null,                                                    //
      public stylesWithoutHost: string|null,                                         //
      public residualStyles: KeyValueArray<any>|undefined|null,                      //
      public classes: string|null,                                                   //
      public classesWithoutHost: string|null,                                        //
      public residualClasses: KeyValueArray<any>|undefined|null,                     //
      public classBindings: TStylingRange,                                           //
      public styleBindings: TStylingRange,                                           //
  ) {}

  /**
   * Return a human debug version of the set of `NodeInjector`s which will be consulted when
   * resolving tokens from this `TNode`.
   *
   * When debugging applications, it is often difficult to determine which `NodeInjector`s will be
   * consulted. This method shows a list of `DebugNode`s representing the `TNode`s which will be
   * consulted in order when resolving a token starting at this `TNode`.
   *
   * The original data is stored in `LView` and `TView` with a lot of offset indexes, and so it is
   * difficult to reason about.
   *
   * @param lView The `LView` instance for this `TNode`.
   */
  debugNodeInjectorPath(lView: LView): DebugNode[] {
    const path: DebugNode[] = [];
    let injectorIndex = getInjectorIndex(this, lView);
    if (injectorIndex === -1) {
      // Looks like the current `TNode` does not have `NodeInjector` associated with it => look for
      // parent NodeInjector.
      const parentLocation = getParentInjectorLocation(this, lView);
      if (parentLocation !== NO_PARENT_INJECTOR) {
        // We found a parent, so start searching from the parent location.
        injectorIndex = getParentInjectorIndex(parentLocation);
        lView = getParentInjectorView(parentLocation, lView);
      } else {
        // No parents have been found, so there are no `NodeInjector`s to consult.
      }
    }
    while (injectorIndex !== -1) {
      ngDevMode && assertNodeInjector(lView, injectorIndex);
      const tNode = lView[TVIEW].data[injectorIndex + NodeInjectorOffset.TNODE] as TNode;
      path.push(buildDebugNode(tNode, lView));
      const parentLocation = lView[injectorIndex + NodeInjectorOffset.PARENT];
      if (parentLocation === NO_PARENT_INJECTOR) {
        injectorIndex = -1;
      } else {
        injectorIndex = getParentInjectorIndex(parentLocation);
        lView = getParentInjectorView(parentLocation, lView);
      }
    }
    return path;
  }

  get type_(): string {
    return toTNodeTypeAsString(this.type) || `TNodeType.?${this.type}?`;
  }

  get flags_(): string {
    const flags: string[] = [];
    if (this.flags & TNodeFlags.hasClassInput) flags.push('TNodeFlags.hasClassInput');
    if (this.flags & TNodeFlags.hasContentQuery) flags.push('TNodeFlags.hasContentQuery');
    if (this.flags & TNodeFlags.hasStyleInput) flags.push('TNodeFlags.hasStyleInput');
    if (this.flags & TNodeFlags.hasHostBindings) flags.push('TNodeFlags.hasHostBindings');
    if (this.flags & TNodeFlags.isDirectiveHost) flags.push('TNodeFlags.isDirectiveHost');
    if (this.flags & TNodeFlags.isDetached) flags.push('TNodeFlags.isDetached');
    if (this.flags & TNodeFlags.isProjected) flags.push('TNodeFlags.isProjected');
    return flags.join('|');
  }

  get template_(): string {
    if (this.type & TNodeType.Text) return this.value!;
    const buf: string[] = [];
    const tagName = typeof this.value === 'string' && this.value || this.type_;
    buf.push('<', tagName);
    if (this.flags) {
      buf.push(' ', this.flags_);
    }
    if (this.attrs) {
      for (let i = 0; i < this.attrs.length;) {
        const attrName = this.attrs[i++];
        if (typeof attrName == 'number') {
          break;
        }
        const attrValue = this.attrs[i++];
        buf.push(' ', attrName as string, '="', attrValue as string, '"');
      }
    }
    buf.push('>');
    processTNodeChildren(this.child, buf);
    buf.push('</', tagName, '>');
    return buf.join('');
  }

  get styleBindings_(): DebugStyleBindings {
    return toDebugStyleBinding(this, false);
  }
  get classBindings_(): DebugStyleBindings {
    return toDebugStyleBinding(this, true);
  }

  get providerIndexStart_(): number {
    return this.providerIndexes & TNodeProviderIndexes.ProvidersStartIndexMask;
  }
  get providerIndexEnd_(): number {
    return this.providerIndexStart_ +
        (this.providerIndexes >>> TNodeProviderIndexes.CptViewProvidersCountShift);
  }
}
export const TNodeDebug = TNode;
export type TNodeDebug = TNode;

export interface DebugStyleBindings extends
    Array<KeyValueArray<any>|DebugStyleBinding|string|null> {}
export interface DebugStyleBinding {
  key: TStylingKey;
  index: number;
  isTemplate: boolean;
  prevDuplicate: boolean;
  nextDuplicate: boolean;
  prevIndex: number;
  nextIndex: number;
}

function toDebugStyleBinding(tNode: TNode, isClassBased: boolean): DebugStyleBindings {
  const tData = tNode.tView_.data;
  const bindings: DebugStyleBindings = [] as any;
  const range = isClassBased ? tNode.classBindings : tNode.styleBindings;
  const prev = getTStylingRangePrev(range);
  const next = getTStylingRangeNext(range);
  let isTemplate = next !== 0;
  let cursor = isTemplate ? next : prev;
  while (cursor !== 0) {
    const itemKey = tData[cursor] as TStylingKey;
    const itemRange = tData[cursor + 1] as TStylingRange;
    bindings.unshift({
      key: itemKey,
      index: cursor,
      isTemplate: isTemplate,
      prevDuplicate: getTStylingRangePrevDuplicate(itemRange),
      nextDuplicate: getTStylingRangeNextDuplicate(itemRange),
      nextIndex: getTStylingRangeNext(itemRange),
      prevIndex: getTStylingRangePrev(itemRange),
    });
    if (cursor === prev) isTemplate = false;
    cursor = getTStylingRangePrev(itemRange);
  }
  bindings.push((isClassBased ? tNode.residualClasses : tNode.residualStyles) || null);
  return bindings;
}

function processTNodeChildren(tNode: ITNode|null, buf: string[]) {
  while (tNode) {
    buf.push((tNode as any as {template_: string}).template_);
    tNode = tNode.next;
  }
}

/**
 * Use this method to unwrap a native element in `LView` and convert it into HTML for easier
 * reading.
 *
 * @param value possibly wrapped native DOM node.
 * @param includeChildren If `true` then the serialized HTML form will include child elements
 * (same
 * as `outerHTML`). If `false` then the serialized HTML form will only contain the element
 * itself
 * (will not serialize child elements).
 */
function toHtml(value: any, includeChildren: boolean = false): string|null {
  const node: Node|null = unwrapRNode(value) as any;
  if (node) {
    switch (node.nodeType) {
      case Node.TEXT_NODE:
        return node.textContent;
      case Node.COMMENT_NODE:
        return `<!--${(node as Comment).textContent}-->`;
      case Node.ELEMENT_NODE:
        const outerHTML = (node as Element).outerHTML;
        if (includeChildren) {
          return outerHTML;
        } else {
          const innerHTML = '>' + (node as Element).innerHTML + '<';
          return (outerHTML.split(innerHTML)[0]) + '>';
        }
    }
  }
  return null;
}


/**
 * Turns a flat list of nodes into a tree by walking the associated `TNode` tree.
 *
 * @param tNode
 * @param lView
 */
export function toDebugNodes(tNode: ITNode|null, lView: LView): DebugNode[] {
  if (tNode) {
    const debugNodes: DebugNode[] = [];
    let tNodeCursor: ITNode|null = tNode;
    while (tNodeCursor) {
      debugNodes.push(buildDebugNode(tNodeCursor, lView));
      tNodeCursor = tNodeCursor.next;
    }
    return debugNodes;
  } else {
    return [];
  }
}

export function buildDebugNode(tNode: ITNode, lView: LView): DebugNode {
  const rawValue = lView[tNode.index];
  const native = unwrapRNode(rawValue);
  const factories: Type<any>[] = [];
  const instances: any[] = [];
  const tView = lView[TVIEW];
  for (let i = tNode.directiveStart; i < tNode.directiveEnd; i++) {
    const def = tView.data[i] as DirectiveDef<any>;
    factories.push(def.type);
    instances.push(lView[i]);
  }
  return {
    html: toHtml(native),
    type: toTNodeTypeAsString(tNode.type),
    tNode,
    native: native as any,
    children: toDebugNodes(tNode.child, lView),
    factories,
    instances,
    injector: buildNodeInjectorDebug(tNode, tView, lView),
    get injectorResolutionPath() {
      return (tNode as TNode).debugNodeInjectorPath(lView);
    },
  };
}

function buildNodeInjectorDebug(tNode: ITNode, tView: ITView, lView: LView): NodeInjectorDebug {
  const viewProviders: Type<any>[] = [];
  for (let i = (tNode as TNode).providerIndexStart_; i < (tNode as TNode).providerIndexEnd_; i++) {
    viewProviders.push(tView.data[i] as Type<any>);
  }
  const providers: Type<any>[] = [];
  for (let i = (tNode as TNode).providerIndexEnd_; i < (tNode as TNode).directiveEnd; i++) {
    providers.push(tView.data[i] as Type<any>);
  }
  const nodeInjectorDebug = {
    bloom: toBloom(lView, tNode.injectorIndex),
    cumulativeBloom: toBloom(tView.data, tNode.injectorIndex),
    providers,
    viewProviders,
    parentInjectorIndex: lView[(tNode as TNode).providerIndexStart_ - 1],
  };
  return nodeInjectorDebug;
}

/**
 * Convert a number at `idx` location in `array` into binary representation.
 *
 * @param array
 * @param idx
 */
function binary(array: any[], idx: number): string {
  const value = array[idx];
  // If not a number we print 8 `?` to retain alignment but let user know that it was called on
  // wrong type.
  if (typeof value !== 'number') return '????????';
  // We prefix 0s so that we have constant length number
  const text = '00000000' + value.toString(2);
  return text.substring(text.length - 8);
}

/**
 * Convert a bloom filter at location `idx` in `array` into binary representation.
 *
 * @param array
 * @param idx
 */
function toBloom(array: any[], idx: number): string {
  if (idx < 0) {
    return 'NO_NODE_INJECTOR';
  }
  return `${binary(array, idx + 7)}_${binary(array, idx + 6)}_${binary(array, idx + 5)}_${
      binary(array, idx + 4)}_${binary(array, idx + 3)}_${binary(array, idx + 2)}_${
      binary(array, idx + 1)}_${binary(array, idx + 0)}`;
}
