/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NotificationType, NotificationType0} from 'vscode-jsonrpc';

export const ProjectLoadingStart = new NotificationType0('angular/projectLoadingStart');
export const ProjectLoadingFinish = new NotificationType0('angular/projectLoadingFinish');

export interface ProjectLanguageServiceParams {
  projectName: string;
  languageServiceEnabled: boolean;
}

export const ProjectLanguageService = new NotificationType<ProjectLanguageServiceParams>(
  'angular/projectLanguageService',
);

export interface SuggestStrictModeParams {
  configFilePath: string;
  message: string;
}

export const SuggestStrictMode = new NotificationType<SuggestStrictModeParams>(
  'angular/suggestStrictMode',
);

export const OpenOutputChannel = new NotificationType('angular/OpenOutputChannel');
