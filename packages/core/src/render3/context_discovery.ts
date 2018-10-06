/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import './ng_dev_mode';

import {assertEqual} from './assert';
import {LElementNode, TNode, TNodeFlags} from './interfaces/node';
import {RElement} from './interfaces/renderer';
import {CONTEXT, DIRECTIVES, HEADER_OFFSET, LViewData, TVIEW} from './interfaces/view';

/**
 * This property will be monkey-patched on elements, components and directives
 */
export const MONKEY_PATCH_KEY_NAME = '__ngContext__';

/**
 * The internal view context which is specific to a given DOM element, directive or
 * component instance. Each value in here (besides the LViewData and element node details)
 * can be present, null or undefined. If undefined then it implies the value has not been
 * looked up yet, otherwise, if null, then a lookup was executed and nothing was found.
 *
 * Each value will get filled when the respective value is examined within the getContext
 * function. The component, element and each directive instance will share the same instance
 * of the context.
 */
export interface LContext {
  /**
   * The component's parent view data.
   */
  lViewData: LViewData;

  /**
   * The index instance of the node.
   */
  nodeIndex: number;

  /**
   * The instance of the DOM node that is attached to the lNode.
   */
  native: RElement;

  /**
   * The instance of the Component node.
   */
  component: {}|null|undefined;

  /**
   * The list of active directives that exist on this element.
   */
  directives: any[]|null|undefined;

  /**
   * The map of local references (local reference name => element or directive instance) that exist
   * on this element.
   */
  localRefs: {[key: string]: any}|null|undefined;
}

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
      const lNode = getLNodeFromViewData(lViewData, nodeIndex) !;
      const existingCtx = readPatchedData(lNode.native);
      const context: LContext = (existingCtx && !Array.isArray(existingCtx)) ?
          existingCtx :
          createLContext(lViewData, nodeIndex, lNode.native);

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
          const lNode = getLNodeFromViewData(lViewData, index) !;
          const context = createLContext(lViewData, index, lNode.native);
          attachPatchData(lNode.native, context);
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
function createLContext(lViewData: LViewData, lNodeIndex: number, native: RElement): LContext {
  return {
    lViewData,
    nodeIndex: lNodeIndex, native,
    component: undefined,
    directives: undefined,
    localRefs: undefined,
  };
}

/**
 * A simplified lookup function for finding the LElementNode from a component instance.
 *
 * This function exists for tree-shaking purposes to avoid having to pull in everything
 * that `getContext` has in the event that an Angular application doesn't need to have
 * any programmatic access to an element's context (only change detection uses this function).
 */
export function getLElementFromComponent(componentInstance: {}): LElementNode {
  let lViewData = readPatchedData(componentInstance);
  let lNode: LElementNode;

  if (Array.isArray(lViewData)) {
    const lNodeIndex = findViaComponent(lViewData, componentInstance);
    lNode = readElementValue(lViewData[lNodeIndex]);
    const context = createLContext(lViewData, lNodeIndex, lNode.native);
    context.component = componentInstance;
    attachPatchData(componentInstance, context);
    attachPatchData(context.native, context);
  } else {
    const context = lViewData as any as LContext;
    lNode = readElementValue(context.lViewData[context.nodeIndex]);
  }

  return lNode;
}

/**
 * Assigns the given data to the given target (which could be a component,
 * directive or DOM node instance) using monkey-patching.
 */
export function attachPatchData(target: any, data: LViewData | LContext) {
  target[MONKEY_PATCH_KEY_NAME] = data;
}

/**
 * Returns the monkey-patch value data present on the target (which could be
 * a component, directive or a DOM node).
 */
export function readPatchedData(target: any): LViewData|LContext|null {
  return target[MONKEY_PATCH_KEY_NAME];
}

export function readPatchedLViewData(target: any): LViewData|null {
  const value = readPatchedData(target);
  if (value) {
    return Array.isArray(value) ? value : (value as LContext).lViewData;
  }
  return null;
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
function findViaNativeElement(lViewData: LViewData, native: RElement): number {
  let tNode = lViewData[TVIEW].firstChild;
  while (tNode) {
    const lNode = getLNodeFromViewData(lViewData, tNode.index) !;
    if (lNode.native === native) {
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
      const lNodeData = readElementValue(lViewData[elementComponentIndex] !).data !;
      if (lNodeData[CONTEXT] === componentInstance) {
        return elementComponentIndex;
      }
    }
  } else {
    const rootNode = lViewData[HEADER_OFFSET];
    const rootComponent = rootNode.data[CONTEXT];
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
  const directivesAcrossView = lViewData[DIRECTIVES];
  let tNode = lViewData[TVIEW].firstChild;
  if (directivesAcrossView != null) {
    while (tNode) {
      const directiveIndexStart = getDirectiveStartIndex(tNode);
      const directiveIndexEnd = getDirectiveEndIndex(tNode, directiveIndexStart);
      for (let i = directiveIndexStart; i < directiveIndexEnd; i++) {
        if (directivesAcrossView[i] === directiveInstance) {
          return tNode.index;
        }
      }
      tNode = traverseNextElement(tNode);
    }
  }

  return -1;
}

function assertDomElement(element: any) {
  assertEqual(element.nodeType, 1, 'The provided value must be an instance of an HTMLElement');
}

/**
 * Retruns the instance of the LElementNode at the given index in the LViewData.
 *
 * This function will also unwrap the inner value incase it's stuffed into an
 * array (which is what happens when [style] and [class] bindings are present
 * in the view instructions for the element being returned).
 */
function getLNodeFromViewData(lViewData: LViewData, lElementIndex: number): LElementNode|null {
  const value = lViewData[lElementIndex];
  return value ? readElementValue(value) : null;
}

/**
 * Returns a list of directives extracted from the given view. Does not contain
 * the component.
 *
 * @param nodeIndex Index of node to search
 * @param lViewData The target view data
 * @param includeComponents Whether or not to include components in returned directives
 */
export function discoverDirectives(
    nodeIndex: number, lViewData: LViewData, includeComponents: boolean): any[]|null {
  const directivesAcrossView = lViewData[DIRECTIVES];
  if (directivesAcrossView != null) {
    const tNode = lViewData[TVIEW].data[nodeIndex] as TNode;
    let directiveStartIndex = getDirectiveStartIndex(tNode);
    const directiveEndIndex = getDirectiveEndIndex(tNode, directiveStartIndex);
    if (!includeComponents && tNode.flags & TNodeFlags.isComponent) directiveStartIndex++;
    return directivesAcrossView.slice(directiveStartIndex, directiveEndIndex);
  }
  return null;
}

/**
 * Returns a map of local references (local reference name => element or directive instance) that
 * exist on a given element.
 */
export function discoverLocalRefs(lViewData: LViewData, lNodeIndex: number): {[key: string]: any}|
    null {
  const tNode = lViewData[TVIEW].data[lNodeIndex] as TNode;
  if (tNode && tNode.localNames) {
    const result: {[key: string]: any} = {};
    for (let i = 0; i < tNode.localNames.length; i += 2) {
      const localRefName = tNode.localNames[i];
      const directiveIndex = tNode.localNames[i + 1] as number;
      result[localRefName] = directiveIndex === -1 ?
          getLNodeFromViewData(lViewData, lNodeIndex) !.native :
          lViewData[DIRECTIVES] ![directiveIndex];
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

export function readElementValue(value: LElementNode | any[]): LElementNode {
  return (Array.isArray(value) ? (value as any as any[])[0] : value) as LElementNode;
}
