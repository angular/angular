/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { MissingTranslationStrategy } from '../core';
import * as html from '../ml_parser/ast';
import { Console } from '../util';
import * as i18n from './i18n_ast';
import { PlaceholderMapper, Serializer } from './serializers/serializer';
/**
 * A container for translated messages
 */
export declare class TranslationBundle {
    private _i18nNodesByMsgId;
    digest: (m: i18n.Message) => string;
    mapperFactory?: ((m: i18n.Message) => PlaceholderMapper) | undefined;
    private _i18nToHtml;
    constructor(_i18nNodesByMsgId: {
        [msgId: string]: i18n.Node[];
    } | undefined, locale: string | null, digest: (m: i18n.Message) => string, mapperFactory?: ((m: i18n.Message) => PlaceholderMapper) | undefined, missingTranslationStrategy?: MissingTranslationStrategy, console?: Console);
    static load(content: string, url: string, serializer: Serializer, missingTranslationStrategy: MissingTranslationStrategy, console?: Console): TranslationBundle;
    get(srcMsg: i18n.Message): html.Node[];
    has(srcMsg: i18n.Message): boolean;
}
