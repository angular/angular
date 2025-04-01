/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * A set of marker values to be used in the attributes arrays. These markers indicate that some
 * items are not regular attributes and the processing should be adapted accordingly.
 */
export const enum AttributeMarker {
  /**
   * An implicit marker which indicates that the value in the array are of `attributeKey`,
   * `attributeValue` format.
   *
   * NOTE: This is implicit as it is the type when no marker is present in array. We indicate that
   * it should not be present at runtime by the negative number.
   */
  ImplicitAttributes = -1,

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
   * ```html
   * <div class="foo bar baz">...</div>
   * ```
   *
   * the generated code is:
   * ```ts
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
   * ```html
   * <div style="width:100px; height:200px; color:red">...</div>
   * ```
   *
   * the generated code is:
   * ```ts
   * var _c1 = [AttributeMarker.Styles, 'width', '100px', 'height'. '200px', 'color', 'red'];
   * ```
   */
  Styles = 2,

  /**
   * Signals that the following attribute names were extracted from input or output bindings.
   *
   * For example, given the following HTML:
   *
   * ```html
   * <div moo="car" [foo]="exp" (bar)="doSth()">
   * ```
   *
   * the generated code is:
   *
   * ```ts
   * var _c1 = ['moo', 'car', AttributeMarker.Bindings, 'foo', 'bar'];
   * ```
   */
  Bindings = 3,

  /**
   * Signals that the following attribute names were hoisted from an inline-template declaration.
   *
   * For example, given the following HTML:
   *
   * ```html
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
   * Signals that the following attribute is `ngProjectAs` and its value is a parsed
   * `CssSelector`.
   *
   * For example, given the following HTML:
   *
   * ```html
   * <h1 attr="value" ngProjectAs="[title]">
   * ```
   *
   * the generated code for the `element()` instruction would include:
   *
   * ```ts
   * ['attr', 'value', AttributeMarker.ProjectAs, ['', 'title', '']]
   * ```
   */
  ProjectAs = 5,

  /**
   * Signals that the following attribute will be translated by runtime i18n
   *
   * For example, given the following HTML:
   *
   * ```html
   * <div moo="car" foo="value" i18n-foo [bar]="binding" i18n-bar>
   * ```
   *
   * the generated code is:
   *
   * ```ts
   * var _c1 = ['moo', 'car', AttributeMarker.I18n, 'foo', 'bar'];
   * ```
   */
  I18n = 6,
}
