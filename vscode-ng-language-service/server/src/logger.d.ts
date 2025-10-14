/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript/lib/tsserverlibrary';
export interface LoggerOptions {
    logFile?: string;
    logVerbosity?: string;
}
/**
 * Create a logger instance to write to file.
 * @param options Logging options.
 */
export declare function createLogger(options: LoggerOptions): ts.server.Logger;
