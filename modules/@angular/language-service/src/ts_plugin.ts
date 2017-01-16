/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {createLanguageService} from './language_service';
import {Completion, Diagnostic, LanguageService, LanguageServiceHost} from './types';
import {TypeScriptServiceHost} from './typescript_host';

export function create(info: any /* ts.server.PluginCreateInfo */): ts.LanguageService {
  // Create the proxy
  const proxy: ts.LanguageService = Object.create(null);
  const oldLS: ts.LanguageService = info.languageService;
  for (const k in oldLS) {
    (<any>proxy)[k] = function() { return (oldLS as any)[k].apply(oldLS, arguments); };
  }

  function completionToEntry(c: Completion): ts.CompletionEntry {
    return {kind: c.kind, name: c.name, sortText: c.sort, kindModifiers: ''};
  }

  function diagnosticToDiagnostic(d: Diagnostic, file: ts.SourceFile): ts.Diagnostic {
    return {
      file,
      start: d.span.start,
      length: d.span.end - d.span.start,
      messageText: d.message,
      category: ts.DiagnosticCategory.Error,
      code: 0
    };
  }

  function tryOperation(attempting: string, callback: () => void) {
    try {
      callback();
    } catch (e) {
      info.project.projectService.logger.info(`Failed to ${attempting}: ${e.toString()}`);
      info.project.projectService.logger.info(`Stack trace: ${e.stack}`);
    }
  }

  const serviceHost = new TypeScriptServiceHost(info.languageServiceHost, info.languageService);
  const ls = createLanguageService(serviceHost);
  serviceHost.setSite(ls);

  proxy.getCompletionsAtPosition = function(fileName: string, position: number) {
    let base = oldLS.getCompletionsAtPosition(fileName, position);
    tryOperation('get completions', () => {
      const results = ls.getCompletionsAt(fileName, position);
      if (results && results.length) {
        if (base === undefined) {
          base = {isMemberCompletion: false, isNewIdentifierLocation: false, entries: []};
        }
        for (const entry of results) {
          base.entries.push(completionToEntry(entry));
        }
      }
    });
    return base;
  };

  proxy.getQuickInfoAtPosition = function(fileName: string, position: number): ts.QuickInfo {
    let base = oldLS.getQuickInfoAtPosition(fileName, position);
    tryOperation('get quick info', () => {
      const ours = ls.getHoverAt(fileName, position);
      if (ours) {
        const displayParts: typeof base.displayParts = [];
        for (const part of ours.text) {
          displayParts.push({kind: part.language, text: part.text});
        }
        base = {
          displayParts,
          documentation: [],
          kind: 'angular',
          kindModifiers: 'what does this do?',
          textSpan: {start: ours.span.start, length: ours.span.end - ours.span.start}
        };
      }
    });

    return base;
  };

  proxy.getSemanticDiagnostics = function(fileName: string) {
    let base = oldLS.getSemanticDiagnostics(fileName);
    if (base === undefined) {
      base = [];
    }
    tryOperation('get diagnostics', () => {
      info.project.projectService.logger.info(`Computing Angular semantic diagnostics...`);
      const ours = ls.getDiagnostics(fileName);
      if (ours && ours.length) {
        const file = oldLS.getProgram().getSourceFile(fileName);
        base.push.apply(base, ours.map(d => diagnosticToDiagnostic(d, file)));
      }
    });

    return base;
  };

  proxy.getDefinitionAtPosition = function(
                                      fileName: string, position: number): ts.DefinitionInfo[] {
    let base = oldLS.getDefinitionAtPosition(fileName, position);
    if (base && base.length) {
      return base;
    }

    tryOperation('get definition', () => {
      const ours = ls.getDefinitionAt(fileName, position);
      if (ours && ours.length) {
        base = base || [];
        for (const loc of ours) {
          base.push({
            fileName: loc.fileName,
            textSpan: {start: loc.span.start, length: loc.span.end - loc.span.start},
            name: '',
            kind: 'definition',
            containerName: loc.fileName,
            containerKind: 'file'
          });
        }
      }
    });
    return base;
  };

  return proxy;
}
