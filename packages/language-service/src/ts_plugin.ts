/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript/lib/tsserverlibrary';

import {GetComponentLocationsForTemplateResponse, GetTcbResponse, GetTemplateLocationForComponentResponse, NgLanguageService} from '../api';

import {LanguageService} from './language_service';

export function create(info: ts.server.PluginCreateInfo): NgLanguageService {
  const {project, languageService: tsLS, config} = info;
  const angularOnly = config?.angularOnly === true;

  const ngLS = new LanguageService(project, tsLS, config);

  function getSemanticDiagnostics(fileName: string): ts.Diagnostic[] {
    const diagnostics: ts.Diagnostic[] = [];
    if (!angularOnly) {
      diagnostics.push(...tsLS.getSemanticDiagnostics(fileName));
    }
    diagnostics.push(...ngLS.getSemanticDiagnostics(fileName));
    return diagnostics;
  }

  function getQuickInfoAtPosition(fileName: string, position: number): ts.QuickInfo|undefined {
    if (angularOnly) {
      return ngLS.getQuickInfoAtPosition(fileName, position);
    } else {
      // If TS could answer the query, then return that result. Otherwise, return from Angular LS.
      return tsLS.getQuickInfoAtPosition(fileName, position) ??
          ngLS.getQuickInfoAtPosition(fileName, position);
    }
  }

  function getTypeDefinitionAtPosition(
      fileName: string, position: number): readonly ts.DefinitionInfo[]|undefined {
    if (angularOnly) {
      return ngLS.getTypeDefinitionAtPosition(fileName, position);
    } else {
      // If TS could answer the query, then return that result. Otherwise, return from Angular LS.
      return tsLS.getTypeDefinitionAtPosition(fileName, position) ??
          ngLS.getTypeDefinitionAtPosition(fileName, position);
    }
  }

  function getDefinitionAndBoundSpan(
      fileName: string, position: number): ts.DefinitionInfoAndBoundSpan|undefined {
    if (angularOnly) {
      return ngLS.getDefinitionAndBoundSpan(fileName, position);
    } else {
      // If TS could answer the query, then return that result. Otherwise, return from Angular LS.
      return tsLS.getDefinitionAndBoundSpan(fileName, position) ??
          ngLS.getDefinitionAndBoundSpan(fileName, position);
    }
  }

  function getReferencesAtPosition(fileName: string, position: number): ts.ReferenceEntry[]|
      undefined {
    return ngLS.getReferencesAtPosition(fileName, position);
  }

  function findRenameLocations(
      fileName: string, position: number, findInStrings: boolean, findInComments: boolean,
      providePrefixAndSuffixTextForRename?: boolean): readonly ts.RenameLocation[]|undefined {
    // Most operations combine results from all extensions. However, rename locations are exclusive
    // (results from only one extension are used) so our rename locations are a superset of the TS
    // rename locations. As a result, we do not check the `angularOnly` flag here because we always
    // want to include results at TS locations as well as locations in templates.
    return ngLS.findRenameLocations(fileName, position);
  }

  function getRenameInfo(fileName: string, position: number): ts.RenameInfo {
    // See the comment in `findRenameLocations` explaining why we don't check the `angularOnly`
    // flag.
    return ngLS.getRenameInfo(fileName, position);
  }

  function getCompletionsAtPosition(
      fileName: string, position: number,
      options: ts.GetCompletionsAtPositionOptions): ts.WithMetadata<ts.CompletionInfo>|undefined {
    if (angularOnly) {
      return ngLS.getCompletionsAtPosition(fileName, position, options);
    } else {
      // If TS could answer the query, then return that result. Otherwise, return from Angular LS.
      return tsLS.getCompletionsAtPosition(fileName, position, options) ??
          ngLS.getCompletionsAtPosition(fileName, position, options);
    }
  }

  function getCompletionEntryDetails(
      fileName: string, position: number, entryName: string,
      formatOptions: ts.FormatCodeOptions|ts.FormatCodeSettings|undefined, source: string|undefined,
      preferences: ts.UserPreferences|undefined,
      data: ts.CompletionEntryData|undefined): ts.CompletionEntryDetails|undefined {
    if (angularOnly) {
      return ngLS.getCompletionEntryDetails(
          fileName, position, entryName, formatOptions, preferences, data);
    } else {
      // If TS could answer the query, then return that result. Otherwise, return from Angular LS.
      return tsLS.getCompletionEntryDetails(
                 fileName, position, entryName, formatOptions, source, preferences, data) ??
          ngLS.getCompletionEntryDetails(
              fileName, position, entryName, formatOptions, preferences, data);
    }
  }

  function getCompletionEntrySymbol(
      fileName: string, position: number, name: string, source: string|undefined): ts.Symbol|
      undefined {
    if (angularOnly) {
      return ngLS.getCompletionEntrySymbol(fileName, position, name);
    } else {
      // If TS could answer the query, then return that result. Otherwise, return from Angular LS.
      return tsLS.getCompletionEntrySymbol(fileName, position, name, source) ??
          ngLS.getCompletionEntrySymbol(fileName, position, name);
    }
  }
  /**
   * Gets global diagnostics related to the program configuration and compiler options.
   */
  function getCompilerOptionsDiagnostics(): ts.Diagnostic[] {
    const diagnostics: ts.Diagnostic[] = [];
    if (!angularOnly) {
      diagnostics.push(...tsLS.getCompilerOptionsDiagnostics());
    }
    diagnostics.push(...ngLS.getCompilerOptionsDiagnostics());
    return diagnostics;
  }

  function getSignatureHelpItems(
      fileName: string, position: number,
      options: ts.SignatureHelpItemsOptions): ts.SignatureHelpItems|undefined {
    if (angularOnly) {
      return ngLS.getSignatureHelpItems(fileName, position, options);
    } else {
      return tsLS.getSignatureHelpItems(fileName, position, options) ??
          ngLS.getSignatureHelpItems(fileName, position, options);
    }
  }

  function getTcb(fileName: string, position: number): GetTcbResponse|undefined {
    return ngLS.getTcb(fileName, position);
  }

  /**
   * Given an external template, finds the associated components that use it as a `templateUrl`.
   */
  function getComponentLocationsForTemplate(fileName: string):
      GetComponentLocationsForTemplateResponse {
    return ngLS.getComponentLocationsForTemplate(fileName);
  }

  /**
   * Given a location inside a component, finds the location of the inline template or the file for
   * the `templateUrl`.
   */
  function getTemplateLocationForComponent(
      fileName: string, position: number): GetTemplateLocationForComponentResponse {
    return ngLS.getTemplateLocationForComponent(fileName, position);
  }

  function getCodeFixesAtPosition(
      fileName: string, start: number, end: number, errorCodes: readonly number[],
      formatOptions: ts.FormatCodeSettings,
      preferences: ts.UserPreferences): readonly ts.CodeFixAction[] {
    if (angularOnly) {
      return ngLS.getCodeFixesAtPosition(
          fileName, start, end, errorCodes, formatOptions, preferences);
    } else {
      const tsLsCodeFixes =
          tsLS.getCodeFixesAtPosition(fileName, start, end, errorCodes, formatOptions, preferences);
      // If TS could answer the query, then return that result. Otherwise, return from Angular LS.
      return tsLsCodeFixes.length > 0 ?
          tsLsCodeFixes :
          ngLS.getCodeFixesAtPosition(fileName, start, end, errorCodes, formatOptions, preferences);
    }
  }

  function getCombinedCodeFix(
      scope: ts.CombinedCodeFixScope, fixId: string, formatOptions: ts.FormatCodeSettings,
      preferences: ts.UserPreferences): ts.CombinedCodeActions {
    if (angularOnly) {
      return ngLS.getCombinedCodeFix(scope, fixId, formatOptions, preferences);
    } else {
      const tsLsCombinedCodeFix = tsLS.getCombinedCodeFix(scope, fixId, formatOptions, preferences);
      // If TS could answer the query, then return that result. Otherwise, return from Angular LS.
      return tsLsCombinedCodeFix.changes.length > 0 ?
          tsLsCombinedCodeFix :
          ngLS.getCombinedCodeFix(scope, fixId, formatOptions, preferences);
    }
  }


  return {
    ...tsLS,
    getSemanticDiagnostics,
    getTypeDefinitionAtPosition,
    getQuickInfoAtPosition,
    getDefinitionAndBoundSpan,
    getReferencesAtPosition,
    findRenameLocations,
    getRenameInfo,
    getCompletionsAtPosition,
    getCompletionEntryDetails,
    getCompletionEntrySymbol,
    getTcb,
    getCompilerOptionsDiagnostics,
    getComponentLocationsForTemplate,
    getSignatureHelpItems,
    getTemplateLocationForComponent,
    getCodeFixesAtPosition,
    getCombinedCodeFix,
  };
}

export function getExternalFiles(project: ts.server.Project): string[] {
  if (!project.hasRoots()) {
    return [];  // project has not been initialized
  }
  const typecheckFiles: string[] = [];
  const resourceFiles: string[] = [];
  for (const scriptInfo of project.getScriptInfos()) {
    if (scriptInfo.scriptKind === ts.ScriptKind.External) {
      // script info for typecheck file is marked as external, see
      // getOrCreateTypeCheckScriptInfo() in
      // packages/language-service/src/language_service.ts
      typecheckFiles.push(scriptInfo.fileName);
    }
    if (scriptInfo.scriptKind === ts.ScriptKind.Unknown) {
      // script info for resource file is marked as unknown.
      // Including these as external files is necessary because otherwise they will get removed from
      // the project when `updateNonInferredProjectFiles` is called as part of the
      // `updateProjectIfDirty` cycle.
      // https://sourcegraph.com/github.com/microsoft/TypeScript@c300fea3250abd7f75920d95a58d9e742ac730ee/-/blob/src/server/editorServices.ts?L2363
      resourceFiles.push(scriptInfo.fileName);
    }
  }
  return [...typecheckFiles, ...resourceFiles];
}
