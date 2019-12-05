/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {StyleSanitizeFn} from '../../sanitization/style_sanitizer';
import {TNode, TNodeFlags} from '../interfaces/node';
import {LStylingData} from '../interfaces/styling';
import {TData} from '../interfaces/view';
import {getConcatenatedValue, getStylingHead, getStylingTail, hasConfig, isStylingValueDefined} from '../util/styling_utils';

import {processStylingBindingsUpToEnd} from './binding_concatenation';
import {StyleChangesArrayMapEnum, parseKeyValue} from './style_differ';
import {printStylingTable} from './styling_debug_utils';



/**
 * --------
 *
 * This file contains the core debug functionality for styling in Angular.
 *
 * To learn more about the algorithm see `instructions/styling.ts`.
 *
 * --------
 */

/**
 * A debug/testing-oriented summary of all styling entries for a `DebugNode` instance.
 *
 * The debug information outlined here can be obtained for an element by gaining
 * access to it's `DebugNode` instance (see `lview_debug.ts`).
 */
export interface DebugNodeStyling {
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

  /**
   * Prints a detailed breakdown of each style/class binding attached to the node
   */
  print(): void;
}

/**
 * A debug/testing-oriented summary of all styling information in `TNode.flags`.
 */
export interface DebugStylingConfig {
  hasMapBindings: boolean;       //
  hasPropBindings: boolean;      //
  hasTemplateBindings: boolean;  //
  hasHostBindings: boolean;      //
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
  value: string|boolean|null;
}

/**
 * A human-readable debug summary of the styling data present for a `DebugNode` instance.
 *
 * This class is designed to be used within testing code or when an
 * application has `ngDevMode` activated.
 */
export class NodeStylingDebug implements DebugNodeStyling {
  private _sanitizer: StyleSanitizeFn|null = null;

  constructor(
      private _tNode: TNode, private _tData: TData, private _data: LStylingData,
      private _isClassBased: boolean) {}

  /**
   * Overrides the sanitizer used to process styles.
   */
  overrideSanitizer(sanitizer: StyleSanitizeFn|null) { this._sanitizer = sanitizer; }

  /**
   * Returns a detailed summary of each styling entry in the context and
   * what their runtime representation is.
   *
   * See [DebugNodeStylingEntry].
   */
  get summary(): {[key: string]: DebugNodeStylingEntry} { return {}; }

  /**
   * Various configurations that are used by styles or classes on this node.
   *
   * See [DebugStylingConfig].
   */
  get config() { return buildConfig(this._tNode, this._isClassBased); }

  /**
   * Returns a key/value map of all the styles/classes that were last applied to the element
   */
  get values(): {[key: string]: any} {
    const entries: {[key: string]: any} = {};
    const data: LStylingData = this._data.concat([]);  // copy the array
    const tNode = this._tNode;
    const isClassBased = this._isClassBased;

    const tail = getStylingTail(tNode, isClassBased);
    const head = getStylingHead(tNode, isClassBased);
    processStylingBindingsUpToEnd(data, this._tData, tNode, head, isClassBased, this._sanitizer);
    const concatStr = getConcatenatedValue(data, tail);

    if (isClassBased) {
      concatStr.split(/\s+/).forEach(prop => entries[prop] = true);
    } else {
      const map: any[] = [];
      parseKeyValue(concatStr, map as any, true);
      for (let i = 0; i < map.length; i += 4) {
        const prop = map[i + StyleChangesArrayMapEnum.key];
        const value = map[i + StyleChangesArrayMapEnum.newValue];
        entries[prop] = value;
      }
    }

    return entries;
  }

  /**
   * Prints a detailed breakdown of each style/class binding that is apart of the styling
   */
  print(): void { printStylingTable(this._tData, this._tNode, this._data, this._isClassBased); }
}

/**
 * Returns a key/value map of styling configuration flags which are obtained from the provided
 * `tNode`
 */
function buildConfig(tNode: TNode, isClassBased: boolean): DebugStylingConfig {
  const hasMapBindings = hasConfig(
      tNode, isClassBased ? TNodeFlags.hasClassMapBindings : TNodeFlags.hasStyleMapBindings);
  const hasPropBindings = hasConfig(
      tNode, isClassBased ? TNodeFlags.hasClassPropBindings : TNodeFlags.hasStylePropBindings);
  const hasTemplateBindings = hasConfig(
      tNode,
      isClassBased ? TNodeFlags.hasTemplateClassBindings : TNodeFlags.hasTemplateStyleBindings);
  const hasHostBindings = hasConfig(
      tNode, isClassBased ? TNodeFlags.hasHostClassBindings : TNodeFlags.hasHostStyleBindings);
  return {
      hasMapBindings,       //
      hasPropBindings,      //
      hasTemplateBindings,  //
      hasHostBindings,      //
  };
}
