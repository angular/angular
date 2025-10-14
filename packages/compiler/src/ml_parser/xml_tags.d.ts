/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { TagContentType, TagDefinition } from './tags';
export declare class XmlTagDefinition implements TagDefinition {
    closedByParent: boolean;
    implicitNamespacePrefix: string | null;
    isVoid: boolean;
    ignoreFirstLf: boolean;
    canSelfClose: boolean;
    preventNamespaceInheritance: boolean;
    requireExtraParent(currentParent: string): boolean;
    isClosedByChild(name: string): boolean;
    getContentType(): TagContentType;
}
export declare function getXmlTagDefinition(tagName: string): XmlTagDefinition;
