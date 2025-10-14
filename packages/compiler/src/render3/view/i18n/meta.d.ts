/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as i18n from '../../../i18n/i18n_ast';
import * as html from '../../../ml_parser/ast';
import { InterpolationConfig } from '../../../ml_parser/defaults';
import { ParseTreeResult } from '../../../ml_parser/parser';
import * as o from '../../../output/output_ast';
export type I18nMeta = {
    id?: string;
    customId?: string;
    legacyIds?: string[];
    description?: string;
    meaning?: string;
};
/**
 * This visitor walks over HTML parse tree and converts information stored in
 * i18n-related attributes ("i18n" and "i18n-*") into i18n meta object that is
 * stored with other element's and attribute's information.
 */
export declare class I18nMetaVisitor implements html.Visitor {
    private interpolationConfig;
    private keepI18nAttrs;
    private enableI18nLegacyMessageIdFormat;
    private containerBlocks;
    private readonly preserveSignificantWhitespace;
    private readonly retainEmptyTokens;
    hasI18nMeta: boolean;
    private _errors;
    constructor(interpolationConfig?: InterpolationConfig, keepI18nAttrs?: boolean, enableI18nLegacyMessageIdFormat?: boolean, containerBlocks?: Set<string>, preserveSignificantWhitespace?: boolean, retainEmptyTokens?: boolean);
    private _generateI18nMessage;
    visitAllWithErrors(nodes: html.Node[]): ParseTreeResult;
    visitElement(element: html.Element): any;
    visitComponent(component: html.Component, context: any): html.Component;
    visitExpansion(expansion: html.Expansion, currentMessage: i18n.Message | null): any;
    visitText(text: html.Text): any;
    visitAttribute(attribute: html.Attribute): any;
    visitComment(comment: html.Comment): any;
    visitExpansionCase(expansionCase: html.ExpansionCase): any;
    visitBlock(block: html.Block, context: any): html.Block;
    visitBlockParameter(parameter: html.BlockParameter, context: any): html.BlockParameter;
    visitLetDeclaration(decl: html.LetDeclaration, context: any): html.LetDeclaration;
    visitDirective(directive: html.Directive, context: any): html.Directive;
    private _visitElementLike;
    /**
     * Parse the general form `meta` passed into extract the explicit metadata needed to create a
     * `Message`.
     *
     * There are three possibilities for the `meta` variable
     * 1) a string from an `i18n` template attribute: parse it to extract the metadata values.
     * 2) a `Message` from a previous processing pass: reuse the metadata values in the message.
     * 4) other: ignore this and just process the message metadata as normal
     *
     * @param meta the bucket that holds information about the message
     * @returns the parsed metadata.
     */
    private _parseMetadata;
    /**
     * Generate (or restore) message id if not specified already.
     */
    private _setMessageId;
    /**
     * Update the `message` with a `legacyId` if necessary.
     *
     * @param message the message whose legacy id should be set
     * @param meta information about the message being processed
     */
    private _setLegacyIds;
    private _reportError;
}
/**
 * Parses i18n metas like:
 *  - "@@id",
 *  - "description[@@id]",
 *  - "meaning|description[@@id]"
 * and returns an object with parsed output.
 *
 * @param meta String that represents i18n meta
 * @returns Object with id, meaning and description fields
 */
export declare function parseI18nMeta(meta?: string): I18nMeta;
export declare function i18nMetaToJSDoc(meta: I18nMeta): o.JSDocComment;
