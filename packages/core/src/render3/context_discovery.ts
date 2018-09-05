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
import {BINDING_INDEX, CONTEXT, DIRECTIVES, HEADER_OFFSET, LViewData, TVIEW} from './interfaces/view';
import {StylingIndex} from './styling';

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
  /** The component\'s view data */
  lViewData: LViewData;

  /** The index instance of the LNode */
  lNodeIndex: number;

  /** The instance of the DOM node that is attached to the lNode */
  native: RElement;

  /** The instance of the Component node */
  component: {}|null|undefined;

  /** The list of indices for the active directives that exist on this element */
  directiveIndices: number[]|null|undefined;

  /** The list of active directives that exist on this element */
  directives: Array<{}>|null|undefined;
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
  let mpValue = readLContext(target);
  if (mpValue) {
    // only when it's an array is it considered an LViewData instance
    // ... otherwise it's an already constructed LContext instance
    if (Array.isArray(mpValue)) {
      const lViewData: LViewData = mpValue !;
      let lNodeIndex: number;
      let component: any = undefined;
      let directiveIndices: number[]|null|undefined = undefined;
      let directives: any[]|null|undefined = undefined;

      if (isComponentInstance(target)) {
        lNodeIndex = findViaComponent(lViewData, target);
        if (lNodeIndex == -1) {
          throw new Error('The provided component was not found in the application');
        }
        component = target;
      } else if (isDirectiveInstance(target)) {
        lNodeIndex = findViaDirective(lViewData, target);
        if (lNodeIndex == -1) {
          throw new Error('The provided directive was not found in the application');
        }
        directiveIndices = discoverDirectiveIndices(lViewData, lNodeIndex);
        directives = directiveIndices ? discoverDirectives(lViewData, directiveIndices) : null;
      } else {
        lNodeIndex = findViaNativeElement(lViewData, target as RElement);
        if (lNodeIndex == -1) {
          return null;
        }
      }

      // the goal is not to fill the entire context full of data because the lookups
      // are expensive. Instead, only the target data (the element, compontent or
      // directive details) are filled into the context. If called multiple times
      // with different target values then the missing target data will be filled in.
      const lNode = getLNode(lViewData, lNodeIndex) !;
      const existingCtx = readLContext(lNode.native);
      const context: LContext = (existingCtx && !Array.isArray(existingCtx)) ?
          existingCtx :
          createLContext(lViewData, lNodeIndex, lNode.native);

      // only when the component has been discovered then update the monkey-patch
      if (component && context.component === undefined) {
        context.component = component;
        attachLContext(context.component, context);
      }

      // only when the directives have been discovered then update the monkey-patch
      if (directives && directiveIndices && context.directives === undefined) {
        context.directiveIndices = directiveIndices;
        context.directives = directives;
        for (let i = 0; i < directives.length; i++) {
          attachLContext(directives[i], context);
        }
      }

      attachLContext(context.native, context);
      mpValue = context;
    }
  } else {
    const rElement = target as RElement;
    ngDevMode && assertDomElement(rElement);

    // if the context is not found then we need to traverse upwards up the DOM
    // to find the nearest element that has already been monkey patched with data
    let parent = rElement as any;
    while (parent = parent.parentNode) {
      const parentContext = readLContext(parent);
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
          const lNode = getLNode(lViewData, index) !;
          const context = createLContext(lViewData, index, lNode.native);
          attachLContext(lNode.native, context);
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
    lNodeIndex,
    native,
    component: undefined,
    directiveIndices: undefined,
    directives: undefined,
  };
}

/**
 * A utility function for retrieving the matching lElementNode
 * from a given DOM element, component or directive.
 */
export function getLElementNode(target: any): LElementNode|null {
  const context = getContext(target);
  return context ? getLNode(context.lViewData, context.lNodeIndex) : null;
}

/**
 * Assigns the given data to the given target (which could be a component,
 * directive or DOM node instance) using monkey-patching.
 */
export function attachLContext(target: any, data: LViewData | LContext) {
  target[MONKEY_PATCH_KEY_NAME] = data;
}

/**
 * Returns the monkey-patch value data presnet on the target (which could be
 * a component, directive or a DOM node).
 */
export function readLContext(target: any): LViewData|LContext|null {
  return target[MONKEY_PATCH_KEY_NAME];
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
    const lNode = getLNode(lViewData, tNode.index) !;
    if (lNode.native === native) {
      return tNode.index;
    }

    if (tNode.child) {
      tNode = tNode.child;
    } else if (tNode.next) {
      tNode = tNode.next;
    } else if (tNode.parent) {
      tNode = tNode.parent.next || null;
    } else {
      tNode = null;
    }
  }

  return -1;
}

/**
 * Locates the component within the given LViewData and returns the matching index
 */
function findViaComponent(lViewData: LViewData, componentInstance: {}): number {
  const componentIndices = lViewData[TVIEW].components;
  if (componentIndices && componentIndices.length) {
    for (let i = 0; i < componentIndices.length; i++) {
      const elementComponentIndex = componentIndices[i];
      if (lViewData[elementComponentIndex].data[CONTEXT] === componentInstance) {
        return elementComponentIndex;
      }
    }
  } else if (lViewData[HEADER_OFFSET].data[CONTEXT] === componentInstance) {
    // we are dealing with the root element here therefore we know that the
    // element is the very first element after the HEADER data in the lView
    return HEADER_OFFSET;
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
  // in the view data. By first checking to see if the instance
  // is actually present we can narrow down to which lElementNode
  // contains the instance of the directive and then return the index
  const directivesAcrossView = lViewData[DIRECTIVES];
  const directiveIndex =
      directivesAcrossView ? directivesAcrossView.indexOf(directiveInstance) : -1;
  if (directiveIndex >= 0) {
    let tNode = lViewData[TVIEW].firstChild;
    while (tNode) {
      const lNode = getLNode(lViewData, tNode.index) !;
      const directiveIndexStart = getDirectiveStartIndex(lNode);
      const directiveIndexEnd = getDirectiveEndIndex(lNode);
      if (directiveIndex >= directiveIndexStart && directiveIndex < directiveIndexEnd) {
        return tNode.index;
      }

      if (tNode.child) {
        tNode = tNode.child;
      } else if (tNode.next) {
        tNode = tNode.next;
      } else if (tNode.parent) {
        tNode = tNode.parent.next || null;
      } else {
        tNode = null;
      }
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
function getLNode(lViewData: LViewData, lElementIndex: number): LElementNode|null {
  const value = lViewData[lElementIndex];
  if (value) {
    const lNodeValue = Array.isArray(value) ? value[StylingIndex.ElementPosition] : value;
    return lNodeValue && lNodeValue.tNode ? lNodeValue : null;
  }
  return null;
}

/**
 * Returns a collection of directive index values that are used on the element
 * (which is referenced by the lNodeIndex)
 */
function discoverDirectiveIndices(lViewData: LViewData, lNodeIndex: number): number[]|null {
  const directivesAcrossView = lViewData[DIRECTIVES];
  const lNode = getLNode(lViewData, lNodeIndex);
  if (lNode && directivesAcrossView && directivesAcrossView.length) {
    // this check for tNode is to determine if the calue is a LEmementNode instance
    const directiveIndexStart = getDirectiveStartIndex(lNode);
    const directiveIndexEnd = getDirectiveEndIndex(lNode);
    const directiveIndices: number[] = [];
    for (let i = directiveIndexStart; i < directiveIndexEnd; i++) {
      // special case since the instance of the component (if it exists)
      // is stored in the directives array.
      if (i > directiveIndexStart ||
          !isComponentInstance(directivesAcrossView[directiveIndexStart])) {
        directiveIndices.push(i);
      }
    }
    return directiveIndices.length ? directiveIndices : null;
  }
  return null;
}

function discoverDirectives(lViewData: LViewData, directiveIndices: number[]): number[]|null {
  const directives: any[] = [];
  const directiveInstances = lViewData[DIRECTIVES];
  if (directiveInstances) {
    for (let i = 0; i < directiveIndices.length; i++) {
      const directiveIndex = directiveIndices[i];
      const directive = directiveInstances[directiveIndex];
      directives.push(directive);
    }
  }
  return directives;
}

function getDirectiveStartIndex(lNode: LElementNode): number {
  // the tNode instances store a flag value which then has a
  // pointer which tells the starting index of where all the
  // active directives are in the master directive array
  return lNode.tNode.flags >> TNodeFlags.DirectiveStartingIndexShift;
}

function getDirectiveEndIndex(lNode: LElementNode): number {
  // The end value is also apart of the same flag
  // (see `TNodeFlags` to see how the flag bit shifting
  // values are used).
  const count = lNode.tNode.flags & TNodeFlags.DirectiveCountMask;
  return count ? (getDirectiveStartIndex(lNode) + count) : -1;
}
