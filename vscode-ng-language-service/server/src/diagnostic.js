'use strict';
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', {enumerable: true, value: v});
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', {value: true});
exports.tsDiagnosticToLspDiagnostic = tsDiagnosticToLspDiagnostic;
const ts = __importStar(require('typescript/lib/tsserverlibrary'));
const lsp = __importStar(require('vscode-languageserver'));
const utils_1 = require('./utils');
/**
 * Convert ts.DiagnosticCategory to lsp.DiagnosticSeverity
 * @param category diagnostic category
 */
function tsDiagnosticCategoryToLspDiagnosticSeverity(category) {
  switch (category) {
    case ts.DiagnosticCategory.Warning:
      return lsp.DiagnosticSeverity.Warning;
    case ts.DiagnosticCategory.Error:
      return lsp.DiagnosticSeverity.Error;
    case ts.DiagnosticCategory.Suggestion:
      return lsp.DiagnosticSeverity.Hint;
    case ts.DiagnosticCategory.Message:
    default:
      return lsp.DiagnosticSeverity.Information;
  }
}
/**
 * Convert ts.Diagnostic to lsp.Diagnostic
 * @param tsDiag TS diagnostic
 * @param scriptInfo Used to compute proper offset.
 */
function tsDiagnosticToLspDiagnostic(tsDiag, projectService) {
  const textSpan = {
    start: tsDiag.start || 0,
    length: tsDiag.length || 0,
  };
  const diagScriptInfo =
    tsDiag.file !== undefined ? projectService.getScriptInfo(tsDiag.file.fileName) : undefined;
  const range =
    diagScriptInfo !== undefined
      ? (0, utils_1.tsTextSpanToLspRange)(diagScriptInfo, textSpan)
      : lsp.Range.create(0, 0, 0, 0);
  const diag = lsp.Diagnostic.create(
    range,
    ts.flattenDiagnosticMessageText(tsDiag.messageText, '\n'),
    tsDiagnosticCategoryToLspDiagnosticSeverity(tsDiag.category),
    tsDiag.code,
    tsDiag.source,
    (0, utils_1.tsRelatedInformationToLspRelatedInformation)(
      projectService,
      tsDiag.relatedInformation,
    ),
  );
  diag.tags = tsDiag.reportsDeprecated !== undefined ? [lsp.DiagnosticTag.Deprecated] : undefined;
  return diag;
}
//# sourceMappingURL=diagnostic.js.map
