/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export declare class TooltipDirective {
    visible: boolean;
    nested: {
        child: {
            grandchild: {
                prop: number;
            };
        };
    };
    constructor();
    handleClick(): void;
}
