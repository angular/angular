/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export declare function getUrl(src: string, win: Window): URL;
export declare function isAbsoluteUrl(src: string): boolean;
export declare function extractHostname(url: string): string;
export declare function isValidPath(path: unknown): boolean;
export declare function normalizePath(path: string): string;
export declare function normalizeSrc(src: string): string;
