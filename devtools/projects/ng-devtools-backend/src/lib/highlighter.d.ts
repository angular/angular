/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { Type } from '@angular/core';
import { HydrationStatus } from '../../../protocol';
export declare function findComponentAndHost(el: Node | undefined): {
    component: any;
    host: HTMLElement | null;
};
export declare function getDirectiveName(dir: Type<unknown> | undefined | null): string;
export declare function highlightSelectedElement(el: Node): void;
export declare function highlightHydrationElement(el: Node, status: HydrationStatus): void;
export declare function unHighlight(): void;
export declare function removeHydrationHighlights(): void;
export declare function inDoc(node: any): boolean;
