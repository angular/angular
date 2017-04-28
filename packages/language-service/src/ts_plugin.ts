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

const projectHostMap = new WeakMap<any, TypeScriptServiceHost>();

export function getExternalFiles(project: any): string[]|undefined {
  const host = projectHostMap.get(project);
  if (host) {
    return host.getTemplateReferences();
  }
}

const angularOnlyResults = process.argv.indexOf('--angularOnlyResults') >= 0;

function angularOnlyFilter(ls: ts.LanguageService): ts.LanguageService {
  return {
    cleanupSemanticCache: () => ls.cleanupSemanticCache(),
    getSyntacticDiagnostics: fileName => <ts.Diagnostic[]>[],
    getSemanticDiagnostics: fileName => <ts.Diagnostic[]>[],
    getCompilerOptionsDiagnostics: () => <ts.Diagnostic[]>[],
    getSyntacticClassifications: (fileName, span) => [],
    getSemanticClassifications: (fileName, span) => [],
    getEncodedSyntacticClassifications: (fileName, span) => <ts.Classifications><any>{undefined},
    getEncodedSemanticClassifications: (fileName, span) => <ts.Classifications><any>undefined,
    getCompletionsAtPosition: (fileName, position) => <ts.CompletionInfo><any>undefined,
    getCompletionEntryDetails: (fileName, position, entryName) =>
                                   <ts.CompletionEntryDetails><any>undefined,
    getCompletionEntrySymbol: (fileName, position, entryName) => <ts.Symbol><any>undefined,
    getQuickInfoAtPosition: (fileName, position) => <ts.QuickInfo><any>undefined,
    getNameOrDottedNameSpan: (fileName, startPos, endPos) => <ts.TextSpan><any>undefined,
    getBreakpointStatementAtPosition: (fileName, position) => <ts.TextSpan><any>undefined,
    getSignatureHelpItems: (fileName, position) => <ts.SignatureHelpItems><any>undefined,
    getRenameInfo: (fileName, position) => <ts.RenameInfo><any>undefined,
    findRenameLocations: (fileName, position, findInStrings, findInComments) =>
                             <ts.RenameLocation[]>[],
    getDefinitionAtPosition: (fileName, position) => <ts.DefinitionInfo[]>[],
    getTypeDefinitionAtPosition: (fileName, position) => <ts.DefinitionInfo[]>[],
    getImplementationAtPosition: (fileName, position) => <ts.ImplementationLocation[]>[],
    getReferencesAtPosition: (fileName: string, position: number) => <ts.ReferenceEntry[]>[],
    findReferences: (fileName: string, position: number) => <ts.ReferencedSymbol[]>[],
    getDocumentHighlights: (fileName, position, filesToSearch) => <ts.DocumentHighlights[]>[],
    /** @deprecated */
    getOccurrencesAtPosition: (fileName, position) => <ts.ReferenceEntry[]>[],
    getNavigateToItems: searchValue => <ts.NavigateToItem[]>[],
    getNavigationBarItems: fileName => <ts.NavigationBarItem[]>[],
    getNavigationTree: fileName => <ts.NavigationTree><any>undefined,
    getOutliningSpans: fileName => <ts.OutliningSpan[]>[],
    getTodoComments: (fileName, descriptors) => <ts.TodoComment[]>[],
    getBraceMatchingAtPosition: (fileName, position) => <ts.TextSpan[]>[],
    getIndentationAtPosition: (fileName, position, options) => <number><any>undefined,
    getFormattingEditsForRange: (fileName, start, end, options) => <ts.TextChange[]>[],
    getFormattingEditsForDocument: (fileName, options) => <ts.TextChange[]>[],
    getFormattingEditsAfterKeystroke: (fileName, position, key, options) => <ts.TextChange[]>[],
    getDocCommentTemplateAtPosition: (fileName, position) => <ts.TextInsertion><any>undefined,
    isValidBraceCompletionAtPosition: (fileName, position, openingBrace) => <boolean><any>undefined,
    getCodeFixesAtPosition: (fileName, start, end, errorCodes) => <ts.CodeAction[]>[],
    getEmitOutput: fileName => <ts.EmitOutput><any>undefined,
    getProgram: () => ls.getProgram(),
    dispose: () => ls.dispose()
  };
}

export function create(info: any /* ts.server.PluginCreateInfo */): ts.LanguageService {
  // Create the proxy
  const proxy: ts.LanguageService = Object.create(null);
  let oldLS: ts.LanguageService = info.languageService;

  if (angularOnlyResults) {
    oldLS = angularOnlyFilter(oldLS);
  }

  function tryCall<T>(fileName: string | undefined, callback: () => T): T {
    if (fileName && !oldLS.getProgram().getSourceFile(fileName)) {
      return undefined as any as T;
    }
    try {
      return callback();
    } catch (e) {
      return undefined as any as T;
    }
  }

  function tryFilenameCall<T>(m: (fileName: string) => T): (fileName: string) => T {
    return fileName => tryCall(fileName, () => <T>(m.call(ls, fileName)));
  }

  function tryFilenameOneCall<T, P>(m: (fileName: string, p: P) => T): (filename: string, p: P) =>
      T {
    return (fileName, p) => tryCall(fileName, () => <T>(m.call(ls, fileName, p)));
  }

  function tryFilenameTwoCall<T, P1, P2>(m: (fileName: string, p1: P1, p2: P2) => T): (
      filename: string, p1: P1, p2: P2) => T {
    return (fileName, p1, p2) => tryCall(fileName, () => <T>(m.call(ls, fileName, p1, p2)));
  }

  function tryFilenameThreeCall<T, P1, P2, P3>(m: (fileName: string, p1: P1, p2: P2, p3: P3) => T):
      (filename: string, p1: P1, p2: P2, p3: P3) => T {
    return (fileName, p1, p2, p3) => tryCall(fileName, () => <T>(m.call(ls, fileName, p1, p2, p3)));
  }

  function typescriptOnly(ls: ts.LanguageService): ts.LanguageService {
    return {
      cleanupSemanticCache: () => ls.cleanupSemanticCache(),
      getSyntacticDiagnostics: tryFilenameCall(ls.getSyntacticDiagnostics),
      getSemanticDiagnostics: tryFilenameCall(ls.getSemanticDiagnostics),
      getCompilerOptionsDiagnostics: () => ls.getCompilerOptionsDiagnostics(),
      getSyntacticClassifications: tryFilenameOneCall(ls.getSemanticClassifications),
      getSemanticClassifications: tryFilenameOneCall(ls.getSemanticClassifications),
      getEncodedSyntacticClassifications: tryFilenameOneCall(ls.getEncodedSyntacticClassifications),
      getEncodedSemanticClassifications: tryFilenameOneCall(ls.getEncodedSemanticClassifications),
      getCompletionsAtPosition: tryFilenameOneCall(ls.getCompletionsAtPosition),
      getCompletionEntryDetails: tryFilenameTwoCall(ls.getCompletionEntryDetails),
      getCompletionEntrySymbol: tryFilenameTwoCall(ls.getCompletionEntrySymbol),
      getQuickInfoAtPosition: tryFilenameOneCall(ls.getQuickInfoAtPosition),
      getNameOrDottedNameSpan: tryFilenameTwoCall(ls.getNameOrDottedNameSpan),
      getBreakpointStatementAtPosition: tryFilenameOneCall(ls.getBreakpointStatementAtPosition),
      getSignatureHelpItems: tryFilenameOneCall(ls.getSignatureHelpItems),
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
      getCodeFixesAtPosition: tryFilenameThreeCall(ls.getCodeFixesAtPosition),
      getEmitOutput: tryFilenameCall(ls.getEmitOutput),
      getProgram: () => ls.getProgram(),
      dispose: () => ls.dispose()
    };
  }

  oldLS = typescriptOnly(oldLS);

  for (const k in oldLS) {
    (<any>proxy)[k] = function() { return (oldLS as any)[k].apply(oldLS, arguments); };
  }

  function completionToEntry(c: Completion): ts.CompletionEntry {
    return {kind: c.kind, name: c.name, sortText: c.sort, kindModifiers: ''};
  }

  function diagnosticToDiagnostic(d: Diagnostic, file: ts.SourceFile): ts.Diagnostic {
    const result = {
      file,
      start: d.span.start,
      length: d.span.end - d.span.start,
      messageText: d.message,
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

  proxy.getCompletionsAtPosition = function(fileName: string, position: number) {
    let base = oldLS.getCompletionsAtPosition(fileName, position) || {
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

  proxy.getQuickInfoAtPosition = function(fileName: string, position: number): ts.QuickInfo {
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

    return tryOperation('get definition', () => {
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
             return base;
           }) || [];
  };

  return proxy;
}
