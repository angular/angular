/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { TagContentType, TagDefinition } from './tags';
export declare class HtmlTagDefinition implements TagDefinition {
    private closedByChildren;
    private contentType;
    closedByParent: boolean;
    implicitNamespacePrefix: string | null;
    isVoid: boolean;
    ignoreFirstLf: boolean;
    canSelfClose: boolean;
    preventNamespaceInheritance: boolean;
    constructor({ closedByChildren, implicitNamespacePrefix, contentType, closedByParent, isVoid, ignoreFirstLf, preventNamespaceInheritance, canSelfClose, }?: {
        closedByChildren?: string[];
        closedByParent?: boolean;
        implicitNamespacePrefix?: string;
        contentType?: TagContentType | {
            default: TagContentType;
            [namespace: string]: TagContentType;
        };
        isVoid?: boolean;
        ignoreFirstLf?: boolean;
        preventNamespaceInheritance?: boolean;
        canSelfClose?: boolean;
    });
    isClosedByChild(name: string): boolean;
    getContentType(prefix?: string): TagContentType;
}
export declare function getHtmlTagDefinition(tagName: string): HtmlTagDefinition;
