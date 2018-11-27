/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {createLanguageService} from './language_service';
import {Completion, Diagnostic, DiagnosticMessageChain, LanguageService, LanguageServiceHost} from './types';
import {TypeScriptServiceHost} from './typescript_host';

const projectHostMap = new WeakMap<any, TypeScriptServiceHost>();

export function getExternalFiles(project: any): string[]|undefined {
  const host = projectHostMap.get(project);
  if (host) {
    return host.getTemplateReferences();
  }
}

export function create(info: any /* ts.server.PluginCreateInfo */): ts.LanguageService {
  // Create the proxy
  const proxy: ts.LanguageService = Object.create(null);
  let oldLS: ts.LanguageService = info.languageService;

  function tryCall<T>(fileName: string | undefined, callback: () => T): T|undefined {
    if (fileName && !oldLS.getProgram() !.getSourceFile(fileName)) {
      return undefined;
    }
    try {
      return callback();
    } catch {
      return undefined;
    }
  }

  function tryFilenameCall<T>(m: (fileName: string) => T): (fileName: string) => T | undefined {
    return fileName => tryCall(fileName, () => <T>(m.call(ls, fileName)));
  }

  function tryFilenameOneCall<T, P>(m: (fileName: string, p: P) => T): (filename: string, p: P) =>
      T | undefined {
    return (fileName, p) => tryCall(fileName, () => <T>(m.call(ls, fileName, p)));
  }

  function tryFilenameTwoCall<T, P1, P2>(m: (fileName: string, p1: P1, p2: P2) => T): (
      filename: string, p1: P1, p2: P2) => T | undefined {
    return (fileName, p1, p2) => tryCall(fileName, () => <T>(m.call(ls, fileName, p1, p2)));
  }

  function tryFilenameThreeCall<T, P1, P2, P3>(m: (fileName: string, p1: P1, p2: P2, p3: P3) => T):
      (filename: string, p1: P1, p2: P2, p3: P3) => T | undefined {
    return (fileName, p1, p2, p3) => tryCall(fileName, () => <T>(m.call(ls, fileName, p1, p2, p3)));
  }

  function tryFilenameFourCall<T, P1, P2, P3, P4>(
      m: (fileName: string, p1: P1, p2: P2, p3: P3, p4: P4) =>
          T): (fileName: string, p1: P1, p2: P2, p3: P3, p4: P4) => T | undefined {
    return (fileName, p1, p2, p3, p4) =>
               tryCall(fileName, () => <T>(m.call(ls, fileName, p1, p2, p3, p4)));
  }

  function tryFilenameFiveCall<T, P1, P2, P3, P4, P5>(
      m: (fileName: string, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5) =>
          T): (fileName: string, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5) => T | undefined {
    return (fileName, p1, p2, p3, p4, p5) =>
               tryCall(fileName, () => <T>(m.call(ls, fileName, p1, p2, p3, p4, p5)));
  }

  function typescriptOnly(ls: ts.LanguageService): ts.LanguageService {
    const languageService: ts.LanguageService = {
      cleanupSemanticCache: () => ls.cleanupSemanticCache(),
      getSyntacticDiagnostics: tryFilenameCall(ls.getSyntacticDiagnostics),
      getSemanticDiagnostics: tryFilenameCall(ls.getSemanticDiagnostics),
      getCompilerOptionsDiagnostics: () => ls.getCompilerOptionsDiagnostics(),
      getSyntacticClassifications: tryFilenameOneCall(ls.getSemanticClassifications),
      getSemanticClassifications: tryFilenameOneCall(ls.getSemanticClassifications),
      getEncodedSyntacticClassifications: tryFilenameOneCall(ls.getEncodedSyntacticClassifications),
      getEncodedSemanticClassifications: tryFilenameOneCall(ls.getEncodedSemanticClassifications),
      getCompletionsAtPosition: tryFilenameTwoCall(ls.getCompletionsAtPosition),
      getCompletionEntryDetails: tryFilenameFiveCall(ls.getCompletionEntryDetails),
      getCompletionEntrySymbol: tryFilenameThreeCall(ls.getCompletionEntrySymbol),
      getJsxClosingTagAtPosition: tryFilenameOneCall(ls.getJsxClosingTagAtPosition),
      getQuickInfoAtPosition: tryFilenameOneCall(ls.getQuickInfoAtPosition),
      getNameOrDottedNameSpan: tryFilenameTwoCall(ls.getNameOrDottedNameSpan),
      getBreakpointStatementAtPosition: tryFilenameOneCall(ls.getBreakpointStatementAtPosition),
      getSignatureHelpItems: tryFilenameTwoCall(ls.getSignatureHelpItems),
      getRenameInfo: tryFilenameOneCall(ls.getRenameInfo),
      findRenameLocations: tryFilenameThreeCall(ls.findRenameLocations),
      getDefinitionAtPosition: tryFilenameOneCall(ls.getDefinitionAtPosition),
      getTypeDefinitionAtPosition: tryFilenameOneCall(ls.getTypeDefinitionAtPosition),
      getImplementationAtPosition: tryFilenameOneCall(ls.getImplementationAtPosition),
      getReferencesAtPosition: tryFilenameOneCall(ls.getReferencesAtPosition),
      findReferences: tryFilenameOneCall(ls.findReferences),
      getDocumentHighlights: tryFilenameTwoCall(ls.getDocumentHighlights),
      /** @deprecated */
      getOccurrencesAtPosition: tryFilenameOneCall(ls.getOccurrencesAtPosition),
      getNavigateToItems:
          (searchValue, maxResultCount, fileName, excludeDtsFiles) => tryCall(
              fileName,
              () => ls.getNavigateToItems(searchValue, maxResultCount, fileName, excludeDtsFiles)),
      getNavigationBarItems: tryFilenameCall(ls.getNavigationBarItems),
      getNavigationTree: tryFilenameCall(ls.getNavigationTree),
      getOutliningSpans: tryFilenameCall(ls.getOutliningSpans),
      getTodoComments: tryFilenameOneCall(ls.getTodoComments),
      getBraceMatchingAtPosition: tryFilenameOneCall(ls.getBraceMatchingAtPosition),
      getIndentationAtPosition: tryFilenameTwoCall(ls.getIndentationAtPosition),
      getFormattingEditsForRange: tryFilenameThreeCall(ls.getFormattingEditsForRange),
      getFormattingEditsForDocument: tryFilenameOneCall(ls.getFormattingEditsForDocument),
      getFormattingEditsAfterKeystroke: tryFilenameThreeCall(ls.getFormattingEditsAfterKeystroke),
      getDocCommentTemplateAtPosition: tryFilenameOneCall(ls.getDocCommentTemplateAtPosition),
      isValidBraceCompletionAtPosition: tryFilenameTwoCall(ls.isValidBraceCompletionAtPosition),
      getSpanOfEnclosingComment: tryFilenameTwoCall(ls.getSpanOfEnclosingComment),
      getCodeFixesAtPosition: tryFilenameFiveCall(ls.getCodeFixesAtPosition),
      applyCodeActionCommand:
          <any>((action: any) => tryCall(undefined, () => ls.applyCodeActionCommand(action))),
      getEmitOutput: tryFilenameCall(ls.getEmitOutput),
      getProgram: () => ls.getProgram(),
      dispose: () => ls.dispose(),
      getApplicableRefactors: tryFilenameTwoCall(ls.getApplicableRefactors),
      getEditsForRefactor: tryFilenameFiveCall(ls.getEditsForRefactor),
      getDefinitionAndBoundSpan: tryFilenameOneCall(ls.getDefinitionAndBoundSpan),
      getCombinedCodeFix:
          (scope: ts.CombinedCodeFixScope, fixId: {}, formatOptions: ts.FormatCodeSettings,
           preferences: ts.UserPreferences) =>
              tryCall(
                  undefined, () => ls.getCombinedCodeFix(scope, fixId, formatOptions, preferences)),
      // TODO(kyliau): dummy implementation to compile with ts 2.8, create real one
      getSuggestionDiagnostics: (fileName: string) => [],
      // TODO(kyliau): dummy implementation to compile with ts 2.8, create real one
      organizeImports: (scope: ts.CombinedCodeFixScope, formatOptions: ts.FormatCodeSettings) => [],
      // TODO: dummy implementation to compile with ts 2.9, create a real one
      getEditsForFileRename:
          (oldFilePath: string, newFilePath: string, formatOptions: ts.FormatCodeSettings,
           preferences: ts.UserPreferences | undefined) => []
    } as ts.LanguageService;
    return languageService;
  }

  oldLS = typescriptOnly(oldLS);

  for (const k in oldLS) {
    (<any>proxy)[k] = function() { return (oldLS as any)[k].apply(oldLS, arguments); };
  }

  function completionToEntry(c: Completion): ts.CompletionEntry {
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

  function diagnosticMessageToDiagnosticMessageText(message: string | DiagnosticMessageChain):
      string|ts.DiagnosticMessageChain {
    if (typeof message === 'string') {
      return message;
    }
    return diagnosticChainToDiagnosticChain(message);
  }

  function diagnosticToDiagnostic(d: Diagnostic, file: ts.SourceFile): ts.Diagnostic {
    const result = {
      file,
      start: d.span.start,
      length: d.span.end - d.span.start,
      messageText: diagnosticMessageToDiagnosticMessageText(d.message),
      category: ts.DiagnosticCategory.Error,
      code: 0,
      source: 'ng'
    };
    return result;
  }

  function tryOperation<T>(attempting: string, callback: () => T): T|null {
    try {
      return callback();
    } catch (e) {
      info.project.projectService.logger.info(`Failed to ${attempting}: ${e.toString()}`);
      info.project.projectService.logger.info(`Stack trace: ${e.stack}`);
      return null;
    }
  }

  const serviceHost = new TypeScriptServiceHost(info.languageServiceHost, info.languageService);
  const ls = createLanguageService(serviceHost as any);
  serviceHost.setSite(ls);
  projectHostMap.set(info.project, serviceHost);

  proxy.getCompletionsAtPosition = function(
      fileName: string, position: number, options: ts.GetCompletionsAtPositionOptions|undefined) {
    let base = oldLS.getCompletionsAtPosition(fileName, position, options) || {
      isGlobalCompletion: false,
      isMemberCompletion: false,
      isNewIdentifierLocation: false,
      entries: []
    };
    tryOperation('get completions', () => {
      const results = ls.getCompletionsAt(fileName, position);
      if (results && results.length) {
        if (base === undefined) {
          base = {
            isGlobalCompletion: false,
            isMemberCompletion: false,
            isNewIdentifierLocation: false,
            entries: []
          };
        }
        for (const entry of results) {
          base.entries.push(completionToEntry(entry));
        }
      }
    });
    return base;
  };

  proxy.getQuickInfoAtPosition = function(fileName: string, position: number): ts.QuickInfo |
      undefined {
        let base = oldLS.getQuickInfoAtPosition(fileName, position);
        // TODO(vicb): the tags property has been removed in TS 2.2
        tryOperation('get quick info', () => {
          const ours = ls.getHoverAt(fileName, position);
          if (ours) {
            const displayParts: ts.SymbolDisplayPart[] = [];
            for (const part of ours.text) {
              displayParts.push({kind: part.language || 'angular', text: part.text});
            }
            const tags = base && (<any>base).tags;
            base = <any>{
              displayParts,
              documentation: [],
              kind: 'angular',
              kindModifiers: 'what does this do?',
              textSpan: {start: ours.span.start, length: ours.span.end - ours.span.start},
            };
            if (tags) {
              (<any>base).tags = tags;
            }
          }
        });

        return base;
      };

  proxy.getSemanticDiagnostics = function(fileName: string) {
    let result = oldLS.getSemanticDiagnostics(fileName);
    const base = result || [];
    tryOperation('get diagnostics', () => {
      info.project.projectService.logger.info(`Computing Angular semantic diagnostics...`);
      const ours = ls.getDiagnostics(fileName);
      if (ours && ours.length) {
        const file = oldLS.getProgram() !.getSourceFile(fileName);
        if (file) {
          base.push.apply(base, ours.map(d => diagnosticToDiagnostic(d, file)));
        }
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

    return tryOperation('get definition', () => {
             const ours = ls.getDefinitionAt(fileName, position);
             if (ours && ours.length) {
               base = base || [];
               for (const loc of ours) {
                 base.push({
                   fileName: loc.fileName,
                   textSpan: {start: loc.span.start, length: loc.span.end - loc.span.start},
                   name: '',
                   // TODO: remove any and fix type error.
                   kind: 'definition' as any,
                   containerName: loc.fileName,
                   containerKind: 'file' as any,
                 });
               }
             }
             return base;
           }) || [];
  };

  return proxy;
}
