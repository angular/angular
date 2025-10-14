/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Marks that the next string is an element name.
 *
 * See `I18nMutateOpCodes` documentation.
 */
export const ELEMENT_MARKER = {
  marker: 'element',
};
/**
 * Marks that the next string is comment text need for ICU.
 *
 * See `I18nMutateOpCodes` documentation.
 */
export const ICU_MARKER = {
  marker: 'ICU',
};
/**
 * See `I18nCreateOpCodes`
 */
export var I18nCreateOpCode;
(function (I18nCreateOpCode) {
  /* tslint:disable:no-duplicate-enum-values */
  /**
   * Number of bits to shift index so that it can be combined with the `APPEND_EAGERLY` and
   * `COMMENT`.
   */
  I18nCreateOpCode[(I18nCreateOpCode['SHIFT'] = 2)] = 'SHIFT';
  /**
   * Should the node be appended to parent immediately after creation.
   */
  I18nCreateOpCode[(I18nCreateOpCode['APPEND_EAGERLY'] = 1)] = 'APPEND_EAGERLY';
  /**
   * If set the node should be comment (rather than a text) node.
   */
  I18nCreateOpCode[(I18nCreateOpCode['COMMENT'] = 2)] = 'COMMENT';
  /* tslint:enable:no-duplicate-enum-values */
})(I18nCreateOpCode || (I18nCreateOpCode = {}));
//# sourceMappingURL=i18n.js.map
