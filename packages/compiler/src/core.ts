/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Attention:
// This file duplicates types and values from @angular/core
// so that we are able to make @angular/compiler independent of @angular/core.
// This is important to prevent a build cycle, as @angular/core needs to
// be compiled with the compiler.

import {CssSelector} from './selector';

// Stores the default value of `emitDistinctChangesOnly` when the `emitDistinctChangesOnly` is not
// explicitly set.
export const emitDistinctChangesOnlyDefaultValue = true;

export enum ViewEncapsulation {
  Emulated = 0,
  // Historically the 1 value was for `Native` encapsulation which has been removed as of v11.
  None = 2,
  ShadowDom = 3
}

export enum ChangeDetectionStrategy {
  OnPush = 0,
  Default = 1
}

export interface Input {
  alias?: string;
  required?: boolean;
}

export interface Output {
  alias?: string;
}

export interface HostBinding {
  hostPropertyName?: string;
}

export interface HostListener {
  eventName?: string;
  args?: string[];
}

export interface SchemaMetadata {
  name: string;
}

export const CUSTOM_ELEMENTS_SCHEMA: SchemaMetadata = {
  name: 'custom-elements'
};

export const NO_ERRORS_SCHEMA: SchemaMetadata = {
  name: 'no-errors-schema'
};

export interface Type extends Function {
  new(...args: any[]): any;
}
export const Type = Function;

export enum SecurityContext {
  NONE = 0,
  HTML = 1,
  STYLE = 2,
  SCRIPT = 3,
  URL = 4,
  RESOURCE_URL = 5,
}

/**
 * Injection flags for DI.
 */
export const enum InjectFlags {
  Default = 0,

  /**
   * Specifies that an injector should retrieve a dependency from any injector until reaching the
   * host element of the current component. (Only used with Element Injector)
   */
  Host = 1 << 0,
  /** Don't descend into ancestors of the node requesting injection. */
  Self = 1 << 1,
  /** Skip the node that is requesting injection. */
  SkipSelf = 1 << 2,
  /** Inject `defaultValue` instead if token not found. */
  Optional = 1 << 3,
  /**
   * This token is being injected into a pipe.
   * @internal
   */
  ForPipe = 1 << 4,
}

export enum MissingTranslationStrategy {
  Error = 0,
  Warning = 1,
  Ignore = 2,
}

/**
 * Flags used to generate R3-style CSS Selectors. They are pasted from
 * core/src/render3/projection.ts because they cannot be referenced directly.
 */
export const enum SelectorFlags {
  /** Indicates this is the beginning of a new negative selector */
  NOT = 0b0001,

  /** Mode for matching attributes */
  ATTRIBUTE = 0b0010,

  /** Mode for matching tag names */
  ELEMENT = 0b0100,

  /** Mode for matching class names */
  CLASS = 0b1000,
}

// These are a copy the CSS types from core/src/render3/interfaces/projection.ts
// They are duplicated here as they cannot be directly referenced from core.
export type R3CssSelector = (string|SelectorFlags)[];
export type R3CssSelectorList = R3CssSelector[];

function parserSelectorToSimpleSelector(selector: CssSelector): R3CssSelector {
  const classes = selector.classNames && selector.classNames.length ?
      [SelectorFlags.CLASS, ...selector.classNames] :
      [];
  const elementName = selector.element && selector.element !== '*' ? selector.element : '';
  return [elementName, ...selector.attrs, ...classes];
}

function parserSelectorToNegativeSelector(selector: CssSelector): R3CssSelector {
  const classes = selector.classNames && selector.classNames.length ?
      [SelectorFlags.CLASS, ...selector.classNames] :
      [];

  if (selector.element) {
    return [
      SelectorFlags.NOT | SelectorFlags.ELEMENT, selector.element, ...selector.attrs, ...classes
    ];
  } else if (selector.attrs.length) {
    return [SelectorFlags.NOT | SelectorFlags.ATTRIBUTE, ...selector.attrs, ...classes];
  } else {
    return selector.classNames && selector.classNames.length ?
        [SelectorFlags.NOT | SelectorFlags.CLASS, ...selector.classNames] :
        [];
  }
}

function parserSelectorToR3Selector(selector: CssSelector): R3CssSelector {
  const positive = parserSelectorToSimpleSelector(selector);

  const negative: R3CssSelectorList = selector.notSelectors && selector.notSelectors.length ?
      selector.notSelectors.map(notSelector => parserSelectorToNegativeSelector(notSelector)) :
      [];

  return positive.concat(...negative);
}

export function parseSelectorToR3Selector(selector: string|null): R3CssSelectorList {
  return selector ? CssSelector.parse(selector).map(parserSelectorToR3Selector) : [];
}

// Pasted from render3/interfaces/definition since it cannot be referenced directly
/**
 * Flags passed into template functions to determine which blocks (i.e. creation, update)
 * should be executed.
 *
 * Typically, a template runs both the creation block and the update block on initialization and
 * subsequent runs only execute the update block. However, dynamically created views require that
 * the creation block be executed separately from the update block (for backwards compat).
 */
export const enum RenderFlags {
  /* Whether to run the creation block (e.g. create elements and directives) */
  Create = 0b01,

  /* Whether to run the update block (e.g. refresh bindings) */
  Update = 0b10
}

// Pasted from render3/interfaces/node.ts
/**
 * A set of marker values to be used in the attributes arrays. These markers indicate that some
 * items are not regular attributes and the processing should be adapted accordingly.
 */
export const enum AttributeMarker {
  /**
   * Marker indicates that the following 3 values in the attributes array are:
   * namespaceUri, attributeName, attributeValue
   * in that order.
   */
  NamespaceURI = 0,

  /**
   * Signals class declaration.
   *
   * Each value following `Classes` designates a class name to include on the element.
   * ## Example:
   *
   * Given:
   * ```
   * <div class="foo bar baz">...<d/vi>
   * ```
   *
   * the generated code is:
   * ```
   * var _c1 = [AttributeMarker.Classes, 'foo', 'bar', 'baz'];
   * ```
   */
  Classes = 1,

  /**
   * Signals style declaration.
   *
   * Each pair of values following `Styles` designates a style name and value to include on the
   * element.
   * ## Example:
   *
   * Given:
   * ```
   * <div style="width:100px; height:200px; color:red">...</div>
   * ```
   *
   * the generated code is:
   * ```
   * var _c1 = [AttributeMarker.Styles, 'width', '100px', 'height'. '200px', 'color', 'red'];
   * ```
   */
  Styles = 2,

  /**
   * Signals that the following attribute names were extracted from input or output bindings.
   *
   * For example, given the following HTML:
   *
   * ```
   * <div moo="car" [foo]="exp" (bar)="doSth()">
   * ```
   *
   * the generated code is:
   *
   * ```
   * var _c1 = ['moo', 'car', AttributeMarker.Bindings, 'foo', 'bar'];
   * ```
   */
  Bindings = 3,

  /**
   * Signals that the following attribute names were hoisted from an inline-template declaration.
   *
   * For example, given the following HTML:
   *
   * ```
   * <div *ngFor="let value of values; trackBy:trackBy" dirA [dirB]="value">
   * ```
   *
   * the generated code for the `template()` instruction would include:
   *
   * ```
   * ['dirA', '', AttributeMarker.Bindings, 'dirB', AttributeMarker.Template, 'ngFor', 'ngForOf',
   * 'ngForTrackBy', 'let-value']
   * ```
   *
   * while the generated code for the `element()` instruction inside the template function would
   * include:
   *
   * ```
   * ['dirA', '', AttributeMarker.Bindings, 'dirB']
   * ```
   */
  Template = 4,

  /**
   * Signals that the following attribute is `ngProjectAs` and its value is a parsed `CssSelector`.
   *
   * For example, given the following HTML:
   *
   * ```
   * <h1 attr="value" ngProjectAs="[title]">
   * ```
   *
   * the generated code for the `element()` instruction would include:
   *
   * ```
   * ['attr', 'value', AttributeMarker.ProjectAs, ['', 'title', '']]
   * ```
   */
  ProjectAs = 5,

  /**
   * Signals that the following attribute will be translated by runtime i18n
   *
   * For example, given the following HTML:
   *
   * ```
   * <div moo="car" foo="value" i18n-foo [bar]="binding" i18n-bar>
   * ```
   *
   * the generated code is:
   *
   * ```
   * var _c1 = ['moo', 'car', AttributeMarker.I18n, 'foo', 'bar'];
   */
  I18n = 6,
}
