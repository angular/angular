/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NotificationType, NotificationType0 } from 'vscode-jsonrpc';
export declare const ProjectLoadingStart: NotificationType0;
export declare const ProjectLoadingFinish: NotificationType0;
export interface ProjectLanguageServiceParams {
    projectName: string;
    languageServiceEnabled: boolean;
}
export declare const ProjectLanguageService: NotificationType<ProjectLanguageServiceParams>;
export interface SuggestStrictModeParams {
    configFilePath: string;
    message: string;
}
export declare const SuggestStrictMode: NotificationType<SuggestStrictModeParams>;
export declare const OpenOutputChannel: NotificationType<unknown>;
