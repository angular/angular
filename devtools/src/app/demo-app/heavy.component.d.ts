/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export declare class HeavyComponent {
    readonly foo: import("@angular/core").InputSignal<unknown>;
    state: {
        nested: {
            [x: symbol]: () => number;
            props: {
                foo: number;
                bar: number;
            };
            readonly foo: number;
        };
    };
    calculate(): number;
}
