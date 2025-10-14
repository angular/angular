/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as i18n from '../../../i18n/i18n_ast';
import * as o from '../../../output/output_ast';
export declare function createLocalizeStatements(variable: o.ReadVarExpr, message: i18n.Message, params: {
    [name: string]: o.Expression;
}): o.Statement[];
/**
 * Serialize an i18n message into two arrays: messageParts and placeholders.
 *
 * These arrays will be used to generate `$localize` tagged template literals.
 *
 * @param message The message to be serialized.
 * @returns an object containing the messageParts and placeholders.
 */
export declare function serializeI18nMessageForLocalize(message: i18n.Message): {
    messageParts: o.LiteralPiece[];
    placeHolders: o.PlaceholderPiece[];
};
