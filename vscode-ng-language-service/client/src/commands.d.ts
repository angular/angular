/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as vscode from 'vscode';
import { AngularLanguageClient } from './client';
/**
 * Register all supported vscode commands for the Angular extension.
 * @param client language client
 * @param context extension context for adding disposables
 */
export declare function registerCommands(client: AngularLanguageClient, context: vscode.ExtensionContext): void;
