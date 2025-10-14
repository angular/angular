/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { I18nCreateOpCodes, I18nRemoveOpCodes, I18nUpdateOpCodes, IcuCreateOpCodes } from '../interfaces/i18n';
/**
 * Converts `I18nCreateOpCodes` array into a human readable format.
 *
 * This function is attached to the `I18nCreateOpCodes.debug` property if `ngDevMode` is enabled.
 * This function provides a human readable view of the opcodes. This is useful when debugging the
 * application as well as writing more readable tests.
 *
 * @param this `I18nCreateOpCodes` if attached as a method.
 * @param opcodes `I18nCreateOpCodes` if invoked as a function.
 */
export declare function i18nCreateOpCodesToString(this: I18nCreateOpCodes | void, opcodes?: I18nCreateOpCodes): string[];
/**
 * Converts `I18nUpdateOpCodes` array into a human readable format.
 *
 * This function is attached to the `I18nUpdateOpCodes.debug` property if `ngDevMode` is enabled.
 * This function provides a human readable view of the opcodes. This is useful when debugging the
 * application as well as writing more readable tests.
 *
 * @param this `I18nUpdateOpCodes` if attached as a method.
 * @param opcodes `I18nUpdateOpCodes` if invoked as a function.
 */
export declare function i18nUpdateOpCodesToString(this: I18nUpdateOpCodes | void, opcodes?: I18nUpdateOpCodes): string[];
/**
 * Converts `I18nCreateOpCodes` array into a human readable format.
 *
 * This function is attached to the `I18nCreateOpCodes.debug` if `ngDevMode` is enabled. This
 * function provides a human readable view of the opcodes. This is useful when debugging the
 * application as well as writing more readable tests.
 *
 * @param this `I18nCreateOpCodes` if attached as a method.
 * @param opcodes `I18nCreateOpCodes` if invoked as a function.
 */
export declare function icuCreateOpCodesToString(this: IcuCreateOpCodes | void, opcodes?: IcuCreateOpCodes): string[];
/**
 * Converts `I18nRemoveOpCodes` array into a human readable format.
 *
 * This function is attached to the `I18nRemoveOpCodes.debug` if `ngDevMode` is enabled. This
 * function provides a human readable view of the opcodes. This is useful when debugging the
 * application as well as writing more readable tests.
 *
 * @param this `I18nRemoveOpCodes` if attached as a method.
 * @param opcodes `I18nRemoveOpCodes` if invoked as a function.
 */
export declare function i18nRemoveOpCodesToString(this: I18nRemoveOpCodes | void, opcodes?: I18nRemoveOpCodes): string[];
