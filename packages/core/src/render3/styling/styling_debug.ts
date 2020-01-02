/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {StyleSanitizeFn} from '../../sanitization/style_sanitizer';
import {TNode, TNodeFlags} from '../interfaces/node';
import {RElement} from '../interfaces/renderer';
import {ApplyStylingFn, LStylingData, TStylingContext, TStylingContextIndex, TStylingNode, TStylingRange, getTStylingRangePrev} from '../interfaces/styling';
import {TData} from '../interfaces/view';
import {getCurrentStyleSanitizer} from '../state';
import {attachDebugObject} from '../util/debug_utils';



/**
 * --------
 *
 * This file contains the core debug functionality for styling in Angular.
 *
 * To learn more about the algorithm see `TStylingContext`.
 *
 * --------
 */

/**
 * A debug-friendly version of `TStylingContext`.
 *
 * An instance of this is attached to `tStylingContext.debug` when `ngDevMode` is active.
 */
export interface DebugStylingContext {
  /** The configuration settings of the associated `TStylingContext` */
  config: DebugStylingConfig;

  /** The associated TStylingContext instance */
  context: TStylingContext;

  /** The associated TStylingContext instance */
  entries: {[prop: string]: DebugStylingContextEntry};

  /** A status report of all the sources within the context */
  printSources(): void;

  /** A status report of all the entire context as a table */
  printTable(): void;
}


/**
 * A debug/testing-oriented summary of all styling information in `TNode.flags`.
 */
export interface DebugStylingConfig {
  hasMapBindings: boolean;       //
  hasPropBindings: boolean;      //
  hasCollisions: boolean;        //
  hasTemplateBindings: boolean;  //
  hasHostBindings: boolean;      //
  allowDirectStyling: boolean;   //
}


/**
 * A debug/testing-oriented summary of all styling entries within a `TStylingContext`.
 */
export interface DebugStylingContextEntry {
  /** The property (style or class property) that this entry represents */
  prop: string;

  /** The total amount of styling entries a part of this entry */
  valuesCount: number;

  /**
   * The bit guard mask that is used to compare and protect against
   * styling changes when any template style/class bindings update
   */
  templateBitMask: number;

  /**
   * The bit guard mask that is used to compare and protect against
   * styling changes when any host style/class bindings update
   */
  hostBindingsBitMask: number;

  /**
   * Whether or not the entry requires sanitization
   */
  sanitizationRequired: boolean;

  /**
   * The default value that will be applied if any bindings are falsy
   */
  defaultValue: string|boolean|null;

  /**
   * All bindingIndex sources that have been registered for this style
   */
  sources: (number|null|string)[];
}


/**
 * A debug/testing-oriented summary of all styling entries for a `DebugNode` instance.
 */
export interface DebugNodeStyling {
  /** The associated debug context of the TStylingContext instance */
  context: DebugStylingContext;

  /**
   * A summarization of each style/class property
   * present in the context
   */
  summary: {[propertyName: string]: DebugNodeStylingEntry};

  /**
   * A key/value map of all styling properties and their
   * runtime values
   */
  values: {[propertyName: string]: string | number | null | boolean};

  /**
   * Overrides the sanitizer used to process styles
   */
  overrideSanitizer(sanitizer: StyleSanitizeFn|null): void;
}


/**
 * A debug/testing-oriented summary of a styling entry.
 *
 * A value such as this is generated as an artifact of the `DebugStyling`
 * summary.
 */
export interface DebugNodeStylingEntry {
  /** The style/class property that the summary is attached to */
  prop: string;

  /** The last applied value for the style/class property */
  value: string|null;

  /** The binding index of the last applied style/class property */
  bindingIndex: number|null;
}


/**
 * Find the head of the styling binding linked list.
 */
export function getStylingBindingHead(tData: TData, tNode: TNode, isClassBinding: boolean): number {
  let index = getTStylingRangePrev(isClassBinding ? tNode.classBindings : tNode.styleBindings);
  while (true) {
    const tStylingRange = tData[index + 1] as TStylingRange;
    const prev = getTStylingRangePrev(tStylingRange);
    if (prev === 0) {
      // found head exit.
      return index;
    } else {
      index = prev;
    }
  }
}