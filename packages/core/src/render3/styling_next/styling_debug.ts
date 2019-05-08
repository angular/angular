/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {RElement} from '../interfaces/renderer';
import {attachDebugObject} from '../util/debug_utils';

import {BIT_MASK_APPLY_ALL, DEFAULT_BINDING_INDEX_VALUE, applyStyling} from './bindings';
import {StylingBindingData, TStylingContext, TStylingContextIndex} from './interfaces';
import {getDefaultValue, getGuardMask, getProp, getValuesCount, isContextLocked} from './util';


/**
 * A debug/testing-oriented summary of a styling entry.
 *
 * A value such as this is generated as an artifact of the `DebugStyling`
 * summary.
 */
export interface StylingSummary {
  /** The style/class property that the summary is attached to */
  prop: string;

  /** The last applied value for the style/class property */
  value: string|null;

  /** The binding index of the last applied style/class property */
  bindingIndex: number|null;

  /** Every binding source that is writing the style/class property represented in this tuple */
  sourceValues: {value: string | number | null, bindingIndex: number|null}[];
}

/**
 * A debug/testing-oriented summary of all styling entries for a `DebugNode` instance.
 */
export interface DebugStyling {
  /** The associated TStylingContext instance */
  context: TStylingContext;

  /**
   * A summarization of each style/class property
   * present in the context.
   */
  summary: {[key: string]: StylingSummary}|null;

  /**
   * A key/value map of all styling properties and their
   * runtime values.
   */
  values: {[key: string]: string | number | null | boolean};
}

/**
 * A debug/testing-oriented summary of all styling entries within a `TStylingContext`.
 */
export interface TStylingTupleSummary {
  /** The property (style or class property) that this tuple represents */
  prop: string;

  /** The total amount of styling entries apart of this tuple */
  valuesCount: number;

  /**
   * The bit guard mask that is used to compare and protect against
   * styling changes when and styling bindings update
   */
  guardMask: number;

  /**
   * The default value that will be applied if any bindings are falsy.
   */
  defaultValue: string|boolean|null;

  /**
   * All bindingIndex sources that have been registered for this style.
   */
  sources: (number|null|string)[];
}

/**
 * Instantiates and attaches an instance of `TStylingContextDebug` to the provided context.
 */
export function attachStylingDebugObject(context: TStylingContext) {
  const debug = new TStylingContextDebug(context);
  attachDebugObject(context, debug);
  return debug;
}

/**
 * A human-readable debug summary of the styling data present within `TStylingContext`.
 *
 * This class is designed to be used within testing code or when an
 * application has `ngDevMode` activated.
 */
class TStylingContextDebug {
  constructor(public readonly context: TStylingContext) {}

  get isLocked() { return isContextLocked(this.context); }

  /**
   * Returns a detailed summary of each styling entry in the context.
   *
   * See `TStylingTupleSummary`.
   */
  get entries(): {[prop: string]: TStylingTupleSummary} {
    const context = this.context;
    const entries: {[prop: string]: TStylingTupleSummary} = {};
    const start = TStylingContextIndex.ValuesStartPosition;
    let i = start;
    while (i < context.length) {
      const prop = getProp(context, i);
      const guardMask = getGuardMask(context, i);
      const valuesCount = getValuesCount(context, i);
      const defaultValue = getDefaultValue(context, i);

      const bindingsStartPosition = i + TStylingContextIndex.BindingsStartOffset;
      const sources: (number | string | null)[] = [];

      for (let j = 0; j < valuesCount; j++) {
        sources.push(context[bindingsStartPosition + j] as number | string | null);
      }

      entries[prop] = {prop, guardMask, valuesCount, defaultValue, sources};

      i += TStylingContextIndex.BindingsStartOffset + valuesCount;
    }
    return entries;
  }
}

/**
 * A human-readable debug summary of the styling data present for a `DebugNode` instance.
 *
 * This class is designed to be used within testing code or when an
 * application has `ngDevMode` activated.
 */
export class NodeStylingDebug implements DebugStyling {
  private _contextDebug: TStylingContextDebug;

  constructor(public context: TStylingContext, private _data: StylingBindingData) {
    this._contextDebug = (this.context as any).debug as any;
  }

  /**
   * Returns a detailed summary of each styling entry in the context and
   * what their runtime representation is.
   *
   * See `StylingSummary`.
   */
  get summary(): {[key: string]: StylingSummary} {
    const contextEntries = this._contextDebug.entries;
    const finalValues: {[key: string]: {value: string, bindingIndex: number}} = {};
    this._mapValues((prop: string, value: any, bindingIndex: number) => {
      finalValues[prop] = {value, bindingIndex};
    });

    const entries: {[key: string]: StylingSummary} = {};
    const values = this.values;
    const props = Object.keys(values);
    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      const contextEntry = contextEntries[prop];
      const sourceValues = contextEntry.sources.map(v => {
        let value: string|number|null;
        let bindingIndex: number|null;
        if (typeof v === 'number') {
          value = this._data[v];
          bindingIndex = v;
        } else {
          value = v;
          bindingIndex = null;
        }
        return {bindingIndex, value};
      });

      const finalValue = finalValues[prop] !;
      let bindingIndex: number|null = finalValue.bindingIndex;
      bindingIndex = bindingIndex === DEFAULT_BINDING_INDEX_VALUE ? null : bindingIndex;

      entries[prop] = {prop, value: finalValue.value, bindingIndex, sourceValues};
    }

    return entries;
  }

  /**
   * Returns a key/value map of all the styles/classes that were last applied to the element.
   */
  get values(): {[key: string]: any} {
    const entries: {[key: string]: any} = {};
    this._mapValues((prop: string, value: any) => { entries[prop] = value; });
    return entries;
  }

  private _mapValues(fn: (prop: string, value: any, bindingIndex: number) => any) {
    // there is no need to store/track an element instance. The
    // element is only used when the styling algorithm attempts to
    // style the value (and we mock out the stylingApplyFn anyway).
    const mockElement = {} as any;

    const mapFn =
        (renderer: any, element: RElement, prop: string, value: any, bindingIndex: number) => {
          fn(prop, value, bindingIndex);
        };
    applyStyling(this.context, null, mockElement, this._data, BIT_MASK_APPLY_ALL, mapFn);
  }
}
