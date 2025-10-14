/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
// Attention:
// This file duplicates types and values from @angular/core
// so that we are able to make @angular/compiler independent of @angular/core.
// This is important to prevent a build cycle, as @angular/core needs to
// be compiled with the compiler.
import {CssSelector} from './directive_matching';
// Stores the default value of `emitDistinctChangesOnly` when the `emitDistinctChangesOnly` is not
// explicitly set.
export const emitDistinctChangesOnlyDefaultValue = true;
export var ViewEncapsulation;
(function (ViewEncapsulation) {
  ViewEncapsulation[(ViewEncapsulation['Emulated'] = 0)] = 'Emulated';
  // Historically the 1 value was for `Native` encapsulation which has been removed as of v11.
  ViewEncapsulation[(ViewEncapsulation['None'] = 2)] = 'None';
  ViewEncapsulation[(ViewEncapsulation['ShadowDom'] = 3)] = 'ShadowDom';
  ViewEncapsulation[(ViewEncapsulation['IsolatedShadowDom'] = 4)] = 'IsolatedShadowDom';
})(ViewEncapsulation || (ViewEncapsulation = {}));
export var ChangeDetectionStrategy;
(function (ChangeDetectionStrategy) {
  ChangeDetectionStrategy[(ChangeDetectionStrategy['OnPush'] = 0)] = 'OnPush';
  ChangeDetectionStrategy[(ChangeDetectionStrategy['Default'] = 1)] = 'Default';
})(ChangeDetectionStrategy || (ChangeDetectionStrategy = {}));
/** Flags describing an input for a directive. */
export var InputFlags;
(function (InputFlags) {
  InputFlags[(InputFlags['None'] = 0)] = 'None';
  InputFlags[(InputFlags['SignalBased'] = 1)] = 'SignalBased';
  InputFlags[(InputFlags['HasDecoratorInputTransform'] = 2)] = 'HasDecoratorInputTransform';
})(InputFlags || (InputFlags = {}));
export const CUSTOM_ELEMENTS_SCHEMA = {
  name: 'custom-elements',
};
export const NO_ERRORS_SCHEMA = {
  name: 'no-errors-schema',
};
export const Type = Function;
export var SecurityContext;
(function (SecurityContext) {
  SecurityContext[(SecurityContext['NONE'] = 0)] = 'NONE';
  SecurityContext[(SecurityContext['HTML'] = 1)] = 'HTML';
  SecurityContext[(SecurityContext['STYLE'] = 2)] = 'STYLE';
  SecurityContext[(SecurityContext['SCRIPT'] = 3)] = 'SCRIPT';
  SecurityContext[(SecurityContext['URL'] = 4)] = 'URL';
  SecurityContext[(SecurityContext['RESOURCE_URL'] = 5)] = 'RESOURCE_URL';
})(SecurityContext || (SecurityContext = {}));
export var MissingTranslationStrategy;
(function (MissingTranslationStrategy) {
  MissingTranslationStrategy[(MissingTranslationStrategy['Error'] = 0)] = 'Error';
  MissingTranslationStrategy[(MissingTranslationStrategy['Warning'] = 1)] = 'Warning';
  MissingTranslationStrategy[(MissingTranslationStrategy['Ignore'] = 2)] = 'Ignore';
})(MissingTranslationStrategy || (MissingTranslationStrategy = {}));
function parserSelectorToSimpleSelector(selector) {
  const classes =
    selector.classNames && selector.classNames.length
      ? [8 /* SelectorFlags.CLASS */, ...selector.classNames]
      : [];
  const elementName = selector.element && selector.element !== '*' ? selector.element : '';
  return [elementName, ...selector.attrs, ...classes];
}
function parserSelectorToNegativeSelector(selector) {
  const classes =
    selector.classNames && selector.classNames.length
      ? [8 /* SelectorFlags.CLASS */, ...selector.classNames]
      : [];
  if (selector.element) {
    return [
      1 /* SelectorFlags.NOT */ | 4 /* SelectorFlags.ELEMENT */,
      selector.element,
      ...selector.attrs,
      ...classes,
    ];
  } else if (selector.attrs.length) {
    return [
      1 /* SelectorFlags.NOT */ | 2 /* SelectorFlags.ATTRIBUTE */,
      ...selector.attrs,
      ...classes,
    ];
  } else {
    return selector.classNames && selector.classNames.length
      ? [1 /* SelectorFlags.NOT */ | 8 /* SelectorFlags.CLASS */, ...selector.classNames]
      : [];
  }
}
function parserSelectorToR3Selector(selector) {
  const positive = parserSelectorToSimpleSelector(selector);
  const negative =
    selector.notSelectors && selector.notSelectors.length
      ? selector.notSelectors.map((notSelector) => parserSelectorToNegativeSelector(notSelector))
      : [];
  return positive.concat(...negative);
}
export function parseSelectorToR3Selector(selector) {
  return selector ? CssSelector.parse(selector).map(parserSelectorToR3Selector) : [];
}
//# sourceMappingURL=core.js.map
