/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ComponentTreeNode } from '../interfaces';
type LView = Array<any>;
export declare const isLContainer: (value: unknown) => boolean;
export declare const METADATA_PROPERTY_NAME = "__ngContext__";
export declare function getLViewFromDirectiveOrElementInstance(dir: any): null | LView;
export declare const getDirectiveHostElement: (dir: any) => any;
export declare class LTreeStrategy {
    supports(element: Element): boolean;
    private _getNode;
    private _extract;
    build(element: Element, _: number): ComponentTreeNode[];
}
export {};
