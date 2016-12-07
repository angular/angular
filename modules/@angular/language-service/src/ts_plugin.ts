/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {createLanguageService} from './language_service';
import {LanguageService, LanguageServiceHost} from './types';
import {TypeScriptServiceHost} from './typescript_host';


/** A plugin to TypeScript's langauge service that provide language services for
 * templates in string literals.
 *
 * @experimental
 */
export class LanguageServicePlugin {
  private serviceHost: TypeScriptServiceHost;
  private service: LanguageService;
  private host: ts.LanguageServiceHost;

  static 'extension-kind' = 'language-service';

  constructor(config: {
    host: ts.LanguageServiceHost; service: ts.LanguageService;
    registry?: ts.DocumentRegistry, args?: any
  }) {
    this.host = config.host;
    this.serviceHost = new TypeScriptServiceHost(config.host, config.service);
    this.service = createLanguageService(this.serviceHost);
    this.serviceHost.setSite(this.service);
  }

  /**
   * Augment the diagnostics reported by TypeScript with errors from the templates in string
   * literals.
   */
  getSemanticDiagnosticsFilter(fileName: string, previous: ts.Diagnostic[]): ts.Diagnostic[] {
    let errors = this.service.getDiagnostics(fileName);
    if (errors && errors.length) {
      let file = this.serviceHost.getSourceFile(fileName);
      for (const error of errors) {
        previous.push({
          file,
          start: error.span.start,
          length: error.span.end - error.span.start,
          messageText: error.message,
          category: ts.DiagnosticCategory.Error,
          code: 0
        });
      }
    }
    return previous;
  }

  /**
   * Get completions for angular templates if one is at the given position.
   */
  getCompletionsAtPosition(fileName: string, position: number): ts.CompletionInfo {
    let result = this.service.getCompletionsAt(fileName, position);
    if (result) {
      return {
        isMemberCompletion: false,
        isNewIdentifierLocation: false,
        entries: result.map<ts.CompletionEntry>(
            entry =>
                ({name: entry.name, kind: entry.kind, kindModifiers: '', sortText: entry.sort}))
      };
    }
  }
}