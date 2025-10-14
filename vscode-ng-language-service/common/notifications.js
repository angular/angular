'use strict';
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, '__esModule', {value: true});
exports.OpenOutputChannel =
  exports.SuggestStrictMode =
  exports.ProjectLanguageService =
  exports.ProjectLoadingFinish =
  exports.ProjectLoadingStart =
    void 0;
const vscode_jsonrpc_1 = require('vscode-jsonrpc');
exports.ProjectLoadingStart = new vscode_jsonrpc_1.NotificationType0('angular/projectLoadingStart');
exports.ProjectLoadingFinish = new vscode_jsonrpc_1.NotificationType0(
  'angular/projectLoadingFinish',
);
exports.ProjectLanguageService = new vscode_jsonrpc_1.NotificationType(
  'angular/projectLanguageService',
);
exports.SuggestStrictMode = new vscode_jsonrpc_1.NotificationType('angular/suggestStrictMode');
exports.OpenOutputChannel = new vscode_jsonrpc_1.NotificationType('angular/OpenOutputChannel');
//# sourceMappingURL=notifications.js.map
