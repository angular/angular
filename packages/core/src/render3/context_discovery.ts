/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import '../util/ng_dev_mode';

import {assertDefined, assertDomNode} from '../util/assert';

import {EMPTY_ARRAY} from '../util/empty';
import {LContext} from './interfaces/context';
import {TNode, TNodeFlags} from './interfaces/node';
import {RElement, RNode} from './interfaces/renderer_dom';
import {CONTEXT, HEADER_OFFSET, HOST, LView, TVIEW} from './interfaces/view';
import {getComponentLViewByIndex, unwrapRNode} from './util/view_utils';



/**
 * Returns the matching `LContext` data for a given DOM node, directive or component instance.
 *
 * This function will examine the provided DOM element, component, or directive instance\'s
 * monkey-patched property to derive the `LContext` data. Once called then the monkey-patched
 * value will be that of the newly created `LContext`.
 *
 * If the monkey-patched value is the `LView` instance then the context value for that
 * target will be created and the monkey-patch reference will be updated. Therefore when this
 * function is called it may mutate the provided element\'s, component\'s or any of the associated
 * directive\'s monkey-patch values.
 *
 * If the monkey-patch value is not detected then the code will walk up the DOM until an element
 * is found which contains a monkey-patch reference. When that occurs then the provided element
 * will be updated with a new context (which is then returned). If the monkey-patch value is not
 * detected for a component/directive instance then it will throw an error (all components and
 * directives should be automatically monkey-patched by ivy).
 *
 * @param target Component, Directive or DOM Node.
 */
export function getLContext(target: any): LContext|null {
  let mpValue = readPatchedData(target);
  if (mpValue) {
    // only when it's an array is it considered an LView instance
    // ... otherwise it's an already constructed LContext instance
    if (Array.isArray(mpValue)) {
      const lView: LView = mpValue!;
      let nodeIndex: number;
      let component: any = undefined;
      let directives: any[]|null|undefined = undefined;

      if (isComponentInstance(target)) {
        nodeIndex = findViaComponent(lView, target);
        if (nodeIndex == -1) {
          throw new Error('The provided component was not found in the application');
        }
        component = target;
      } else if (isDirectiveInstance(target)) {
        nodeIndex = findViaDirective(lView, target);
        if (nodeIndex == -1) {
          throw new Error('The provided directive was not found in the application');
        }
        directives = getDirectivesAtNodeIndex(nodeIndex, lView, false);
      } else {
        nodeIndex = findViaNativeElement(lView, target as RElement);
        if (nodeIndex == -1) {
          return null;
        }
      }

      // the goal is not to fill the entire context full of data because the lookups
      // are expensive. Instead, only the target data (the element, component, container, ICU
      // expression or directive details) are filled into the context. If called multiple times
      // with different target values then the missing target data will be filled in.
      const native = unwrapRNode(lView[nodeIndex]);
      const existingCtx = readPatchedData(native);
      const context: LContext = (existingCtx && !Array.isArray(existingCtx)) ?
          existingCtx :
          createLContext(lView, nodeIndex, native);

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
    ngDevMode && assertDomNode(rElement);

    // if the context is not found then we need to traverse upwards up the DOM
    // to find the nearest element that has already been monkey patched with data
    let parent = rElement as any;
    while (parent = parent.parentNode) {
      const parentContext = readPatchedData(parent);
      if (parentContext) {
        let lView: LView|null;
        if (Array.isArray(parentContext)) {
          lView = parentContext as LView;
        } else {
          lView = parentContext.lView;
        }

        // the edge of the app was also reached here through another means
        // (maybe because the DOM was changed manually).
        if (!lView) {
          return null;
        }

        const index = findViaNativeElement(lView, rElement);
        if (index >= 0) {
          const native = unwrapRNode(lView[index]);
          const context = createLContext(lView, index, native);
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
function createLContext(lView: LView, nodeIndex: number, native: RNode): LContext {
  return {
    lView,
    nodeIndex,
    native,
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
export function getComponentViewByInstance(componentInstance: {}): LView {
  let lView = readPatchedData(componentInstance);
  let view: LView;

  if (Array.isArray(lView)) {
    const nodeIndex = findViaComponent(lView, componentInstance);
    view = getComponentLViewByIndex(nodeIndex, lView);
    const context = createLContext(lView, nodeIndex, view[HOST] as RElement);
    context.component = componentInstance;
    attachPatchData(componentInstance, context);
    attachPatchData(context.native, context);
  } else {
    const context = lView as any as LContext;
    view = getComponentLViewByIndex(context.nodeIndex, context.lView);
  }
  return view;
}

/**
 * This property will be monkey-patched on elements, components and directives.
 */
const MONKEY_PATCH_KEY_NAME = '__ngContext__';

/**
 * Assigns the given data to the given target (which could be a component,
 * directive or DOM node instance) using monkey-patching.
 */
export function attachPatchData(target: any, data: LView|LContext) {
  ngDevMode && assertDefined(target, 'Target expected');
  target[MONKEY_PATCH_KEY_NAME] = data;
}

/**
 * Returns the monkey-patch value data present on the target (which could be
 * a component, directive or a DOM node).
 */
export function readPatchedData(target: any): LView|LContext|null {
  ngDevMode && assertDefined(target, 'Target expected');
  return target[MONKEY_PATCH_KEY_NAME] || null;
}

export function readPatchedLView(target: any): LView|null {
  const value = readPatchedData(target);
  if (value) {
    return Array.isArray(value) ? value : (value as LContext).lView;
  }
  return null;
}

export function isComponentInstance(instance: any): boolean {
  return instance && instance.constructor && instance.constructor.ɵcmp;
}

export function isDirectiveInstance(instance: any): boolean {
  return instance && instance.constructor && instance.constructor.ɵdir;
}

/**
 * Locates the element within the given LView and returns the matching index
 */
function findViaNativeElement(lView: LView, target: RElement): number {
  const tView = lView[TVIEW];
  for (let i = HEADER_OFFSET; i < tView.bindingStartIndex; i++) {
    if (unwrapRNode(lView[i]) === target) {
      return i;
    }
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
  } else {
    // Let's take the following template: <div><span>text</span></div><component/>
    // After checking the text node, we need to find the next parent that has a "next" TNode,
    // in this case the parent `div`, so that we can find the component.
    while (tNode.parent && !tNode.parent.next) {
      tNode = tNode.parent;
    }
    return tNode.parent && tNode.parent.next;
  }
}

/**
 * Locates the component within the given LView and returns the matching index
 */
function findViaComponent(lView: LView, componentInstance: {}): number {
  const componentIndices = lView[TVIEW].components;
  if (componentIndices) {
    for (let i = 0; i < componentIndices.length; i++) {
      const elementComponentIndex = componentIndices[i];
      const componentView = getComponentLViewByIndex(elementComponentIndex, lView);
      if (componentView[CONTEXT] === componentInstance) {
        return elementComponentIndex;
      }
    }
  } else {
    const rootComponentView = getComponentLViewByIndex(HEADER_OFFSET, lView);
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
 * Locates the directive within the given LView and returns the matching index
 */
function findViaDirective(lView: LView, directiveInstance: {}): number {
  // if a directive is monkey patched then it will (by default)
  // have a reference to the LView of the current view. The
  // element bound to the directive being search lives somewhere
  // in the view data. We loop through the nodes and check their
  // list of directives for the instance.
  let tNode = lView[TVIEW].firstChild;
  while (tNode) {
    const directiveIndexStart = tNode.directiveStart;
    const directiveIndexEnd = tNode.directiveEnd;
    for (let i = directiveIndexStart; i < directiveIndexEnd; i++) {
      if (lView[i] === directiveInstance) {
        return tNode.index;
      }
    }
    tNode = traverseNextElement(tNode);
  }
  return -1;
}

/**
 * Returns a list of directives extracted from the given view based on the
 * provided list of directive index values.
 *
 * @param nodeIndex The node index
 * @param lView The target view data
 * @param includeComponents Whether or not to include components in returned directives
 */
export function getDirectivesAtNodeIndex(
    nodeIndex: number, lView: LView, includeComponents: boolean): any[]|null {
  const tNode = lView[TVIEW].data[nodeIndex] as TNode;
  let directiveStartIndex = tNode.directiveStart;
  if (directiveStartIndex == 0) return EMPTY_ARRAY;
  const directiveEndIndex = tNode.directiveEnd;
  if (!includeComponents && tNode.flags & TNodeFlags.isComponentHost) directiveStartIndex++;
  return lView.slice(directiveStartIndex, directiveEndIndex);
}

export function getComponentAtNodeIndex(nodeIndex: number, lView: LView): {}|null {
  const tNode = lView[TVIEW].data[nodeIndex] as TNode;
  let directiveStartIndex = tNode.directiveStart;
  return tNode.flags & TNodeFlags.isComponentHost ? lView[directiveStartIndex] : null;
}

/**
 * Returns a map of local references (local reference name => element or directive instance) that
 * exist on a given element.
 */
export function discoverLocalRefs(lView: LView, nodeIndex: number): {[key: string]: any}|null {
  const tNode = lView[TVIEW].data[nodeIndex] as TNode;
  if (tNode && tNode.localNames) {
    const result: {[key: string]: any} = {};
    let localIndex = tNode.index + 1;
    for (let i = 0; i < tNode.localNames.length; i += 2) {
      result[tNode.localNames[i]] = lView[localIndex];
      localIndex++;
    }
    return result;
  }

  return null;
}
