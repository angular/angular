/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import './ng_dev_mode';

import {assertEqual} from './assert';
import {LElementNode, TNodeFlags} from './interfaces/node';
import {RElement} from './interfaces/renderer';
import {CONTEXT, DIRECTIVES, HEADER_OFFSET, LViewData} from './interfaces/view';
import {StylingIndex} from './styling';

export const MONKEY_PATCH_KEY_NAME = '__ngContext__';

/**
 * The internal view context which is specific to a given DOM element, directive or
 * component instance
 */
export interface Context {
  /** The component\'s view data */
  lViewData: LViewData;

  /** * The index of the LElementNode within the view data array */
  index: number;

  /** The instance of the DOM node */
  native: RElement;
}

/** Returns the matching `Context` data for a given DOM node, directive or component instance.
 *
 * This function will examine the provided DOM element's monkey-patched property to figure out the
 * associated index and view data (`LViewData`).
 *
 * If the monkey-patched value is the `LViewData` instance then the context value for that
 * target will be created and the monkey-patch reference will be updated. Therefore when this
 * function is called it may mutate the provided element\'s or component\'s monkey-patch value.
 *
 * If the monkey-patch value is not detected then the code will walk up the DOM until an element
 * is found which contains a monkey-patch reference. When that occurs then the provided element
 * will be updated with a new context (which is then returned). If the monkey-patch value is not
 * detected for a component/directive instance then it will throw an error (every component
 * should be automatically monkey-patched).
 */
export function getContext(target: any): Context|null {
  let context = target[MONKEY_PATCH_KEY_NAME] as Context | LViewData | null;
  if (context) {
    // only when its an array is it considered a lViewData instance
    // ... otherwise it's an already constructed Context instance
    if (Array.isArray(context)) {
      let lViewData: LViewData|null = context !;
      let element: RElement;
      let elementNode: LElementNode;
      let index: number;
      let isCompOrDir = false;
      if (isComponentInstance(target)) {
        index = findViaComponent(lViewData, target);
        if (index == -1) {
          throw new Error('The provided component was not found in the application');
        }
        elementNode = lViewData[index] as LElementNode;
        element = elementNode.native;
        isCompOrDir = true;
      } else if (isDirectiveInstance(target)) {
        index = findViaDirective(lViewData, target);
        if (index == -1) {
          throw new Error('The provided directive was not found in the application');
        }
        elementNode = lViewData[index] as LElementNode;
        element = elementNode.native;
        isCompOrDir = true;
      } else {
        element = target as RElement;
        index = findViaElement(lViewData, element);
        if (index == -1) {
          return null;
        }
      }
      context = <Context>{index, native: element, lViewData};
      attchContextDataToTarget(element, context);
      if (isCompOrDir) {
        attchContextDataToTarget(target, context);
      }
    }
  } else {
    const element = target as RElement;
    ngDevMode && assertDomElement(element);

    // if the context is not found then we need to traverse upwards up the DOM
    // to find the nearest element that has already been monkey patched with data
    let parent = element as any;
    while (parent = parent.parentNode) {
      const parentContext = (parent as any)[MONKEY_PATCH_KEY_NAME] as Context | LViewData | null;
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

        const index = findViaElement(lViewData !, element);
        if (index >= 0) {
          context = {index, native: element, lViewData};
          attchContextDataToTarget(element, context);
          break;
        }
      }
    }
  }
  return (context as Context) || null;
}

/**
 * A utility function for retrieving the matching lElementNode
 * from a given DOM element, component or directive.
 */
export function getLElementNode(target: any): LElementNode|null {
  const context = getContext(target);
  if (context && context.index >= 0) {
    return context.lViewData[context.index] as LElementNode;
  }
  return null;
}

/** Assigns the given data to a DOM element using monkey-patching */
export function attchContextDataToTarget(target: any, data: LViewData | Context) {
  target[MONKEY_PATCH_KEY_NAME] = data;
}

export function isComponentInstance(instance: any): boolean {
  return instance && instance.constructor && instance.constructor.ngComponentDef;
}

export function isDirectiveInstance(instance: any): boolean {
  return instance && instance.constructor && instance.constructor.ngDirectiveDef;
}

/** Locates the element within the given LViewData and returns the matching index */
function findViaElement(lViewData: LViewData, element: RElement): number {
  for (let i = HEADER_OFFSET; i < lViewData.length; i++) {
    const result = lViewData[i];
    if (result && unwrapLNode(result).native === element) {
      return i;
    }
  }
  return -1;
}

/** Locates the component within the given LViewData and returns the matching index */
function findViaComponent(viewData: LViewData, component: any): number {
  // if a component is monkey patched then it will (by default)
  // have a referene to the lViewData of the parent view. The
  // element of the component (the host element of that component)
  // lives somewhere in the view data and the loop below will
  // find it by comparing the component instance against each
  // of the lElementNode instances that live in the lViewData
  for (let i = HEADER_OFFSET; i < viewData.length; i++) {
    const entry = viewData[i];
    if (entry && entry.data && entry.data[CONTEXT] == component) {
      return i;
    }
  }
  return -1;
}

/** Locates the directive within the given LViewData and returns the matching index */
function findViaDirective(viewData: LViewData, directive: any): number {
  // if a directive is monkey patched then it will (by default)
  // have a referene to the lViewData of the current view. The
  // element bound to the directive being search lives somewhere
  // in the view data. By first checking to see if the instance
  // is actually present we can narrow down to which lElementNode
  // contains the instance of the directive and then return the index
  const directivesAcrossView = viewData[DIRECTIVES];
  if (directivesAcrossView && directivesAcrossView.length) {
    const directiveIndex = directivesAcrossView.indexOf(directive);
    if (directiveIndex >= 0) {
      for (let i = HEADER_OFFSET; i < viewData.length; i++) {
        const lNode = viewData[i] as LElementNode;
        if (lNode && lNode.tNode) {
          // tNode instances store a flag value which then has a pointer
          // which tells the starting index of where all the active
          // directives are in the master directive array
          const directiveIndexStart = lNode.tNode.flags >> TNodeFlags.DirectiveStartingIndexShift;

          const nextIndex = i + 1;
          let nextNode = nextIndex < viewData.length ? viewData[nextIndex] : null;
          nextNode = nextNode && nextNode.tNode ? nextNode : null;
          const directiveIndexEnd = nextNode ?
              (nextNode.tNode.flags >> TNodeFlags.DirectiveStartingIndexShift) :
              directivesAcrossView.length;

          // all that we care about is if the directive is in the list of
          // directives assigned to the this element.
          if (directiveIndex >= directiveIndexStart && directiveIndex < directiveIndexEnd) {
            return i;
          }
        }
      }
    }
  }
  return -1;
}

function assertDomElement(element: any) {
  assertEqual(element.nodeType, 1, 'The provided value must be an instance of a HTMLElement');
}

function unwrapLNode(value: any) {
  // special case for styling since when [class] and [style] bindings
  // are used they will wrap the element into a StylingContext array
  return Array.isArray(value) ? value[StylingIndex.ElementPosition] : value;
}
