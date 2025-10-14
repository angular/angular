/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript/lib/tsserverlibrary';
/**
 * `ServerHost` is a wrapper around `ts.sys` for the Node system. In Node, all
 * optional methods of `ts.System` are implemented.
 * See
 * https://github.com/microsoft/TypeScript/blob/ec39d412876d0dcf704fc886d5036cb625220d2f/src/compiler/sys.ts#L716
 */
export declare class ServerHost implements ts.server.ServerHost {
    readonly isG3: boolean;
    readonly args: string[];
    readonly newLine: string;
    readonly useCaseSensitiveFileNames: boolean;
    constructor(isG3: boolean);
    write(s: string): void;
    writeOutputIsTTY(): boolean;
    readFile(path: string, encoding?: string): string | undefined;
    getFileSize(path: string): number;
    writeFile(path: string, data: string, writeByteOrderMark?: boolean): void;
    /**
     * @pollingInterval - this parameter is used in polling-based watchers and
     * ignored in watchers that use native OS file watching
     */
    watchFile(path: string, callback: ts.FileWatcherCallback, pollingInterval?: number, options?: ts.WatchOptions): ts.FileWatcher;
    watchDirectory(path: string, callback: ts.DirectoryWatcherCallback, recursive?: boolean, options?: ts.WatchOptions): ts.FileWatcher;
    resolvePath(path: string): string;
    fileExists(path: string): boolean;
    directoryExists(path: string): boolean;
    createDirectory(path: string): void;
    getExecutingFilePath(): string;
    getCurrentDirectory(): string;
    getDirectories(path: string): string[];
    readDirectory(path: string, extensions?: ReadonlyArray<string>, exclude?: ReadonlyArray<string>, include?: ReadonlyArray<string>, depth?: number): string[];
    getModifiedTime(path: string): Date | undefined;
    setModifiedTime(path: string, time: Date): void;
    deleteFile(path: string): void;
    /**
     * A good implementation is node.js' `crypto.createHash`.
     * (https://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm)
     */
    createHash(data: string): string;
    /**
     * This must be cryptographically secure. Only implement this method using
     * `crypto.createHash("sha256")`.
     */
    createSHA256Hash(data: string): string;
    getMemoryUsage(): number;
    exit(exitCode?: number): void;
    realpath(path: string): string;
    setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]): any;
    clearTimeout(timeoutId: any): void;
    clearScreen(): void;
    base64decode(input: string): string;
    base64encode(input: string): string;
    setImmediate(callback: (...args: any[]) => void, ...args: any[]): any;
    clearImmediate(timeoutId: any): void;
    require(initialPath: string, moduleName: string): ts.server.RequireResult;
}
