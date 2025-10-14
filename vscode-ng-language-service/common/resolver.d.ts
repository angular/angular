/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Represents a valid node module that has been successfully resolved.
 */
export interface NodeModule {
    name: string;
    resolvedPath: string;
    version: Version;
}
export declare function resolve(packageName: string, location: string, rootPackage?: string): NodeModule | undefined;
export declare class Version {
    private readonly versionStr;
    readonly major: number;
    readonly minor: number;
    readonly patch: number;
    constructor(versionStr: string);
    greaterThanOrEqual(other: Version, compare?: 'patch' | 'minor' | 'major'): boolean;
    isVersionZero(): boolean;
    toString(): string;
    /**
     * Converts the specified `versionStr` to its number constituents. Invalid
     * number value is represented as negative number.
     * @param versionStr
     */
    static parseVersionStr(versionStr: string): [number, number, number];
}
