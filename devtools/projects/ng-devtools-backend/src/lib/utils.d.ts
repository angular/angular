/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export declare const runOutsideAngular: (f: () => void) => void;
export declare const isCustomElement: (node: Node) => boolean;
export declare function isSignal(prop: unknown): prop is (() => unknown) & {
    set: (value: unknown) => void;
};
export declare function safelyReadSignalValue(signal: any): {
    error?: Error;
    value?: any;
};
export declare function unwrapSignal(s: any): any;
