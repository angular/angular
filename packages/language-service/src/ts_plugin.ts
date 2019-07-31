/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript'; // used as value, passed in by tsserver at runtime
import * as tss from 'typescript/lib/tsserverlibrary'; // used as type only

import {ngLocationToTsDefinitionInfo} from './definitions';
import {createLanguageService} from './language_service';
import {Completion, Diagnostic, DiagnosticMessageChain, Location} from './types';
import {TypeScriptServiceHost} from './typescript_host';

const projectHostMap = new WeakMap<tss.server.Project, TypeScriptServiceHost>();

export function getExternalFiles(project: tss.server.Project): string[]|undefined {
  const host = projectHostMap.get(project);
  if (host) {
    const externalFiles = host.getTemplateReferences();
    return externalFiles;
  }
}

function completionToEntry(c: Completion): tss.CompletionEntry {
  return {
    // TODO: remove any and fix type error.
    kind: c.kind as any,
    name: c.name,
    sortText: c.sort,
    kindModifiers: ''
  };
}

function diagnosticChainToDiagnosticChain(chain: DiagnosticMessageChain):
    ts.DiagnosticMessageChain {
  return {
    messageText: chain.message,
    category: ts.DiagnosticCategory.Error,
    code: 0,
    next: chain.next ? diagnosticChainToDiagnosticChain(chain.next) : undefined
  };
}

function diagnosticMessageToDiagnosticMessageText(message: string | DiagnosticMessageChain): string|
    tss.DiagnosticMessageChain {
  if (typeof message === 'string') {
    return message;
  }
  return diagnosticChainToDiagnosticChain(message);
}

function diagnosticToDiagnostic(d: Diagnostic, file: tss.SourceFile | undefined): tss.Diagnostic {
  return {
    file,
    start: d.span.start,
    length: d.span.end - d.span.start,
    messageText: diagnosticMessageToDiagnosticMessageText(d.message),
    category: ts.DiagnosticCategory.Error,
    code: 0,
    source: 'ng'
  };
}

export function create(info: tss.server.PluginCreateInfo): tss.LanguageService {
  const {project, languageService: tsLS, languageServiceHost: tsLSHost, config} = info;
  // This plugin could operate under two different modes:
  // 1. TS + Angular
  //    Plugin augments TS language service to provide additional Angular
  //    information. This only works with inline templates and is meant to be
  //    used as a local plugin (configured via tsconfig.json)
  // 2. Angular only
  //    Plugin only provides information on Angular templates, no TS info at all.
  //    This effectively disables native TS features and is meant for internal
  //    use only.
  const angularOnly = config ? config.angularOnly === true : false;
  const proxy: tss.LanguageService = Object.assign({}, tsLS);
  const ngLSHost = new TypeScriptServiceHost(tsLSHost, tsLS);
  const ngLS = createLanguageService(ngLSHost);
  projectHostMap.set(project, ngLSHost);

  proxy.getCompletionsAtPosition = function(
      fileName: string, position: number, options: tss.GetCompletionsAtPositionOptions|undefined) {
    if (!angularOnly) {
      const results = tsLS.getCompletionsAtPosition(fileName, position, options);
      if (results && results.entries.length) {
        // If TS could answer the query, then return results immediately.
        return results;
      }
    }
    const results = ngLS.getCompletionsAt(fileName, position);
    if (!results || !results.length) {
      return;
    }
    return {
      isGlobalCompletion: false,
      isMemberCompletion: false,
      isNewIdentifierLocation: false,
      entries: results.map(completionToEntry),
    };
  };

  proxy.getQuickInfoAtPosition = function(fileName: string, position: number): tss.QuickInfo |
      undefined {
        if (!angularOnly) {
          const result = tsLS.getQuickInfoAtPosition(fileName, position);
          if (result) {
            // If TS could answer the query, then return results immediately.
            return result;
          }
        }
        const result = ngLS.getHoverAt(fileName, position);
        if (!result) {
          return;
        }
        return {
          // TODO(kyliau): Provide more useful info for kind and kindModifiers
          kind: ts.ScriptElementKind.unknown,
          kindModifiers: ts.ScriptElementKindModifier.none,
          textSpan: {
            start: result.span.start,
            length: result.span.end - result.span.start,
          },
          displayParts: result.text.map((part) => {
            return {
              text: part.text,
              kind: part.language || 'angular',
            };
          }),
        };
      };

  proxy.getSemanticDiagnostics = function(fileName: string): tss.Diagnostic[] {
    const results: tss.Diagnostic[] = [];
    if (!angularOnly) {
      const tsResults = tsLS.getSemanticDiagnostics(fileName);
      results.push(...tsResults);
    }
    // For semantic diagnostics we need to combine both TS + Angular results
    const ngResults = ngLS.getDiagnostics(fileName);
    if (!ngResults.length) {
      return results;
    }
    const sourceFile = fileName.endsWith('.ts') ? ngLSHost.getSourceFile(fileName) : undefined;
    results.push(...ngResults.map(d => diagnosticToDiagnostic(d, sourceFile)));
    return results;
  };

  proxy.getDefinitionAtPosition = function(fileName: string, position: number):
                                      ReadonlyArray<tss.DefinitionInfo>|
      undefined {
        if (!angularOnly) {
          const results = tsLS.getDefinitionAtPosition(fileName, position);
          if (results) {
            // If TS could answer the query, then return results immediately.
            return results;
          }
        }
        const results = ngLS.getDefinitionAt(fileName, position);
        if (!results) {
          return;
        }
        return results.map(ngLocationToTsDefinitionInfo);
      };

  proxy.getDefinitionAndBoundSpan = function(fileName: string, position: number):
                                        tss.DefinitionInfoAndBoundSpan |
      undefined {
        if (!angularOnly) {
          const result = tsLS.getDefinitionAndBoundSpan(fileName, position);
          if (result) {
            // If TS could answer the query, then return results immediately.
            return result;
          }
        }
        const results = ngLS.getDefinitionAt(fileName, position);
        if (!results || !results.length) {
          return;
        }
        const {span} = results[0];
        return {
          definitions: results.map(ngLocationToTsDefinitionInfo),
          textSpan: {
            start: span.start,
            length: span.end - span.start,
          },
        };
      };

  return proxy;
}
