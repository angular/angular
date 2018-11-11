/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import './ng_dev_mode';

import {assertEqual} from './assert';
import {LContext, MONKEY_PATCH_KEY_NAME} from './interfaces/context';
import {TNode, TNodeFlags} from './interfaces/node';
import {RElement} from './interfaces/renderer';
import {CONTEXT, HEADER_OFFSET, HOST, LViewData, TVIEW} from './interfaces/view';
import {getComponentViewByIndex, getNativeByTNode, readElementValue, readPatchedData} from './util';


/** Returns the matching `LContext` data for a given DOM node, directive or component instance.
 *
 * This function will examine the provided DOM element, component, or directive instance\'s
 * monkey-patched property to derive the `LContext` data. Once called then the monkey-patched
 * value will be that of the newly created `LContext`.
 *
 * If the monkey-patched value is the `LViewData` instance then the context value for that
 * target will be created and the monkey-patch reference will be updated. Therefore when this
 * function is called it may mutate the provided element\'s, component\'s or any of the associated
 * directive\'s monkey-patch values.
 *
 * If the monkey-patch value is not detected then the code will walk up the DOM until an element
 * is found which contains a monkey-patch reference. When that occurs then the provided element
 * will be updated with a new context (which is then returned). If the monkey-patch value is not
 * detected for a component/directive instance then it will throw an error (all components and
 * directives should be automatically monkey-patched by ivy).
 */
export function getContext(target: any): LContext|null {
  let mpValue = readPatchedData(target);
  if (mpValue) {
    // only when it's an array is it considered an LViewData instance
    // ... otherwise it's an already constructed LContext instance
    if (Array.isArray(mpValue)) {
      const lViewData: LViewData = mpValue !;
      let nodeIndex: number;
      let component: any = undefined;
      let directives: any[]|null|undefined = undefined;

      if (isComponentInstance(target)) {
        nodeIndex = findViaComponent(lViewData, target);
        if (nodeIndex == -1) {
          throw new Error('The provided component was not found in the application');
        }
        component = target;
      } else if (isDirectiveInstance(target)) {
        nodeIndex = findViaDirective(lViewData, target);
        if (nodeIndex == -1) {
          throw new Error('The provided directive was not found in the application');
        }
        directives = discoverDirectives(nodeIndex, lViewData, false);
      } else {
        nodeIndex = findViaNativeElement(lViewData, target as RElement);
        if (nodeIndex == -1) {
          return null;
        }
      }

      // the goal is not to fill the entire context full of data because the lookups
      // are expensive. Instead, only the target data (the element, compontent or
      // directive details) are filled into the context. If called multiple times
      // with different target values then the missing target data will be filled in.
      const native = readElementValue(lViewData[nodeIndex]);
      const existingCtx = readPatchedData(native);
      const context: LContext = (existingCtx && !Array.isArray(existingCtx)) ?
          existingCtx :
          createLContext(lViewData, nodeIndex, native);

      // only when the component has been discovered then update the monkey-patch
      if (component && context.component === undefined) {
        context.component = component;
        attachPatchData(context.component, context);
      }

      // only when the directives have been discovered then update the monkey-patch
      if (directives && context.directives === undefined) {
        context.directives = directives;
        for (let i = 0; i < directives.length; i++) {
          attachPatchData(directives[i], context);
        }
      }

      attachPatchData(context.native, context);
      mpValue = context;
    }
  } else {
    const rElement = target as RElement;
    ngDevMode && assertDomElement(rElement);

    // if the context is not found then we need to traverse upwards up the DOM
    // to find the nearest element that has already been monkey patched with data
    let parent = rElement as any;
    while (parent = parent.parentNode) {
      const parentContext = readPatchedData(parent);
      if (parentContext) {
        let lViewData: LViewData|null;
        if (Array.isArray(parentContext)) {
          lViewData = parentContext as LViewData;
        } else {
          lViewData = parentContext.lViewData;
        }

        // the edge of the app was also reached here through another means
        // (maybe because the DOM was changed manually).
        if (!lViewData) {
          return null;
        }

        const index = findViaNativeElement(lViewData, rElement);
        if (index >= 0) {
          const native = readElementValue(lViewData[index]);
          const context = createLContext(lViewData, index, native);
          attachPatchData(native, context);
          mpValue = context;
          break;
        }
      }
    }
  }
  return (mpValue as LContext) || null;
}

/**
 * Creates an empty instance of a `LContext` context
 */
function createLContext(lViewData: LViewData, nodeIndex: number, native: RElement): LContext {
  return {
    lViewData,
    nodeIndex: nodeIndex, native,
    component: undefined,
    directives: undefined,
    localRefs: undefined,
  };
}

/**
 * Takes a component instance and returns the view for that component.
 *
 * @param componentInstance
 * @returns The component's view
 */
export function getComponentViewByInstance(componentInstance: {}): LViewData {
  let lViewData = readPatchedData(componentInstance);
  let view: LViewData;

  if (Array.isArray(lViewData)) {
    const nodeIndex = findViaComponent(lViewData, componentInstance);
    view = getComponentViewByIndex(nodeIndex, lViewData);
    const context = createLContext(lViewData, nodeIndex, view[HOST] as RElement);
    context.component = componentInstance;
    attachPatchData(componentInstance, context);
    attachPatchData(context.native, context);
  } else {
    const context = lViewData as any as LContext;
    view = getComponentViewByIndex(context.nodeIndex, context.lViewData);
  }
  return view;
}

/**
 * Assigns the given data to the given target (which could be a component,
 * directive or DOM node instance) using monkey-patching.
 */
export function attachPatchData(target: any, data: LViewData | LContext) {
  target[MONKEY_PATCH_KEY_NAME] = data;
}

export function isComponentInstance(instance: any): boolean {
  return instance && instance.constructor && instance.constructor.ngComponentDef;
}

export function isDirectiveInstance(instance: any): boolean {
  return instance && instance.constructor && instance.constructor.ngDirectiveDef;
}

/**
 * Locates the element within the given LViewData and returns the matching index
 */
function findViaNativeElement(lViewData: LViewData, target: RElement): number {
  let tNode = lViewData[TVIEW].firstChild;
  while (tNode) {
    const native = getNativeByTNode(tNode, lViewData) !;
    if (native === target) {
      return tNode.index;
    }
    tNode = traverseNextElement(tNode);
  }

  return -1;
}

/**
 * Locates the next tNode (child, sibling or parent).
 */
function traverseNextElement(tNode: TNode): TNode|null {
  if (tNode.child) {
    return tNode.child;
  } else if (tNode.next) {
    return tNode.next;
  } else if (tNode.parent) {
    return tNode.parent.next || null;
  }
  return null;
}

/**
 * Locates the component within the given LViewData and returns the matching index
 */
function findViaComponent(lViewData: LViewData, componentInstance: {}): number {
  const componentIndices = lViewData[TVIEW].components;
  if (componentIndices) {
    for (let i = 0; i < componentIndices.length; i++) {
      const elementComponentIndex = componentIndices[i];
      const componentView = getComponentViewByIndex(elementComponentIndex, lViewData);
      if (componentView[CONTEXT] === componentInstance) {
        return elementComponentIndex;
      }
    }
  } else {
    const rootComponentView = getComponentViewByIndex(HEADER_OFFSET, lViewData);
    const rootComponent = rootComponentView[CONTEXT];
    if (rootComponent === componentInstance) {
      // we are dealing with the root element here therefore we know that the
      // element is the very first element after the HEADER data in the lView
      return HEADER_OFFSET;
    }
  }
  return -1;
}

/**
 * Locates the directive within the given LViewData and returns the matching index
 */
function findViaDirective(lViewData: LViewData, directiveInstance: {}): number {
  // if a directive is monkey patched then it will (by default)
  // have a reference to the LViewData of the current view. The
  // element bound to the directive being search lives somewhere
  // in the view data. We loop through the nodes and check their
  // list of directives for the instance.
  let tNode = lViewData[TVIEW].firstChild;
  while (tNode) {
    const directiveIndexStart = getDirectiveStartIndex(tNode);
    const directiveIndexEnd = getDirectiveEndIndex(tNode, directiveIndexStart);
    for (let i = directiveIndexStart; i < directiveIndexEnd; i++) {
      if (lViewData[i] === directiveInstance) {
        return tNode.index;
      }
    }
    tNode = traverseNextElement(tNode);
  }
  return -1;
}

function assertDomElement(element: any) {
  assertEqual(
      element && (element.nodeType == Node.ELEMENT_NODE || element.nodeType == Node.TEXT_NODE),
      true, 'The provided value must be an instance of an HTMLElement');
}

/**
 * Returns a list of directives extracted from the given view based on the
 * provided list of directive index values.
 *
 * @param nodeIndex The node index
 * @param lViewData The target view data
 * @param includeComponents Whether or not to include components in returned directives
 */
export function discoverDirectives(
    nodeIndex: number, lViewData: LViewData, includeComponents: boolean): any[]|null {
  const tNode = lViewData[TVIEW].data[nodeIndex] as TNode;
  let directiveStartIndex = getDirectiveStartIndex(tNode);
  const directiveEndIndex = getDirectiveEndIndex(tNode, directiveStartIndex);
  if (!includeComponents && tNode.flags & TNodeFlags.isComponent) directiveStartIndex++;
  return lViewData.slice(directiveStartIndex, directiveEndIndex);
}

/**
 * Returns a map of local references (local reference name => element or directive instance) that
 * exist on a given element.
 */
export function discoverLocalRefs(lViewData: LViewData, nodeIndex: number): {[key: string]: any}|
    null {
  const tNode = lViewData[TVIEW].data[nodeIndex] as TNode;
  if (tNode && tNode.localNames) {
    const result: {[key: string]: any} = {};
    for (let i = 0; i < tNode.localNames.length; i += 2) {
      const localRefName = tNode.localNames[i];
      const directiveIndex = tNode.localNames[i + 1] as number;
      result[localRefName] =
          directiveIndex === -1 ? getNativeByTNode(tNode, lViewData) ! : lViewData[directiveIndex];
    }
    return result;
  }

  return null;
}

function getDirectiveStartIndex(tNode: TNode): number {
  // the tNode instances store a flag value which then has a
  // pointer which tells the starting index of where all the
  // active directives are in the master directive array
  return tNode.flags >> TNodeFlags.DirectiveStartingIndexShift;
}

function getDirectiveEndIndex(tNode: TNode, startIndex: number): number {
  // The end value is also a part of the same flag
  // (see `TNodeFlags` to see how the flag bit shifting
  // values are used).
  const count = tNode.flags & TNodeFlags.DirectiveCountMask;
  return count ? (startIndex + count) : -1;
}
