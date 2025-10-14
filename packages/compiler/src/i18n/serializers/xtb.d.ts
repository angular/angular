/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as i18n from '../i18n_ast';
import { PlaceholderMapper, Serializer } from './serializer';
export declare class Xtb extends Serializer {
    write(messages: i18n.Message[], locale: string | null): string;
    load(content: string, url: string): {
        locale: string;
        i18nNodesByMsgId: {
            [msgId: string]: i18n.Node[];
        };
    };
    digest(message: i18n.Message): string;
    createNameMapper(message: i18n.Message): PlaceholderMapper;
}
