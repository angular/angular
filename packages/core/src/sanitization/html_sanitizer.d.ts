/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { TrustedHTML } from '../util/security/trusted_type_defs';
export declare const VALID_ELEMENTS: {
    [k: string]: boolean;
};
export declare const URI_ATTRS: {
    [k: string]: boolean;
};
export declare const VALID_ATTRS: {
    [k: string]: boolean;
};
/** Gets a reasonable nodeName, even for clobbered nodes. */
export declare function getNodeName(node: Node): string;
/**
 * Sanitizes the given unsafe, untrusted HTML fragment, and returns HTML text that is safe to add to
 * the DOM in a browser environment.
 */
export declare function _sanitizeHtml(defaultDoc: any, unsafeHtmlInput: string): TrustedHTML | string;
export declare function getTemplateContent(el: Node): Node | null;
