/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as i18n from '../i18n_ast';
export declare abstract class Serializer {
    abstract write(messages: i18n.Message[], locale: string | null): string;
    abstract load(content: string, url: string): {
        locale: string | null;
        i18nNodesByMsgId: {
            [msgId: string]: i18n.Node[];
        };
    };
    abstract digest(message: i18n.Message): string;
    createNameMapper(message: i18n.Message): PlaceholderMapper | null;
}
/**
 * A `PlaceholderMapper` converts placeholder names from internal to serialized representation and
 * back.
 *
 * It should be used for serialization format that put constraints on the placeholder names.
 */
export interface PlaceholderMapper {
    toPublicName(internalName: string): string | null;
    toInternalName(publicName: string): string | null;
}
/**
 * A simple mapper that take a function to transform an internal name to a public name
 */
export declare class SimplePlaceholderMapper extends i18n.RecurseVisitor implements PlaceholderMapper {
    private mapName;
    private internalToPublic;
    private publicToNextId;
    private publicToInternal;
    constructor(message: i18n.Message, mapName: (name: string) => string);
    toPublicName(internalName: string): string | null;
    toInternalName(publicName: string): string | null;
    visitText(text: i18n.Text, context?: any): any;
    visitTagPlaceholder(ph: i18n.TagPlaceholder, context?: any): any;
    visitPlaceholder(ph: i18n.Placeholder, context?: any): any;
    visitBlockPlaceholder(ph: i18n.BlockPlaceholder, context?: any): any;
    visitIcuPlaceholder(ph: i18n.IcuPlaceholder, context?: any): any;
    private visitPlaceholderName;
}
