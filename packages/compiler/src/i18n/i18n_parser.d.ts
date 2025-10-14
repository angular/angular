/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as html from '../ml_parser/ast';
import { InterpolationConfig } from '../ml_parser/defaults';
import * as i18n from './i18n_ast';
export type VisitNodeFn = (html: html.Node, i18n: i18n.Node) => i18n.Node;
export interface I18nMessageFactory {
    (nodes: html.Node[], meaning: string | undefined, description: string | undefined, customId: string | undefined, visitNodeFn?: VisitNodeFn): i18n.Message;
}
/**
 * Returns a function converting html nodes to an i18n Message given an interpolationConfig
 */
export declare function createI18nMessageFactory(interpolationConfig: InterpolationConfig, containerBlocks: Set<string>, retainEmptyTokens: boolean, preserveExpressionWhitespace: boolean): I18nMessageFactory;
