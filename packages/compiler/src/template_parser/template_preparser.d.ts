/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as html from '../ml_parser/ast';
export declare function preparseElement(ast: html.Element): PreparsedElement;
export declare enum PreparsedElementType {
    NG_CONTENT = 0,
    STYLE = 1,
    STYLESHEET = 2,
    SCRIPT = 3,
    OTHER = 4
}
export declare class PreparsedElement {
    type: PreparsedElementType;
    selectAttr: string;
    hrefAttr: string | null;
    nonBindable: boolean;
    projectAs: string;
    constructor(type: PreparsedElementType, selectAttr: string, hrefAttr: string | null, nonBindable: boolean, projectAs: string);
}
