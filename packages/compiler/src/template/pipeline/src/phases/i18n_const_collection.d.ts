/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../../../../output/output_ast';
import { ComponentCompilationJob } from '../compilation';
/** Prefix of ICU expressions for post processing */
export declare const I18N_ICU_MAPPING_PREFIX = "I18N_EXP_";
/**
 * Generates a prefix for translation const name.
 *
 * @param extra Additional local prefix that should be injected into translation var name
 * @returns Complete translation const prefix
 */
export declare function getTranslationConstPrefix(extra: string): string;
/**
 * Generate AST to declare a variable. E.g. `var I18N_1;`.
 * @param variable the name of the variable to declare.
 */
export declare function declareI18nVariable(variable: o.ReadVarExpr): o.Statement;
/**
 * Lifts i18n properties into the consts array.
 * TODO: Can we use `ConstCollectedExpr`?
 * TODO: The way the various attributes are linked together is very complex. Perhaps we could
 * simplify the process, maybe by combining the context and message ops?
 */
export declare function collectI18nConsts(job: ComponentCompilationJob): void;
