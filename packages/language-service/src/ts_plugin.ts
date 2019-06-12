/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript'; // used as value, passed in by tsserver at runtime
import * as tss from 'typescript/lib/tsserverlibrary'; // used as type only

import {createLanguageService} from './language_service';
import {Completion, Location} from './types';
import {TypeScriptServiceHost} from './typescript_host';
import {diagnosticToDiagnostic} from './utils';

const projectHostMap = new WeakMap<tss.server.Project, TypeScriptServiceHost>();

export function getExternalFiles(project: tss.server.Project): string[]|undefined {
  const host = projectHostMap.get(project);
  if (host) {
    const externalFiles = host.getTemplateReferences();
    return externalFiles;
  }
}

export function create(info: tss.server.PluginCreateInfo): ts.LanguageService {
  const oldLS: ts.LanguageService = info.languageService;
  const logger = info.project.projectService.logger;
  const serviceHost = new TypeScriptServiceHost(info.languageServiceHost, oldLS);
  const ls = createLanguageService(serviceHost);
  serviceHost.setSite(ls);
  projectHostMap.set(info.project, serviceHost);

  function getCompletionsAtPosition(
      fileName: string, position: number,
      options?: ts.GetCompletionsAtPositionOptions): ts.WithMetadata<ts.CompletionInfo>|undefined {
    let base = oldLS.getCompletionsAtPosition(fileName, position, options) || {
      isGlobalCompletion: false,
      isMemberCompletion: false,
      isNewIdentifierLocation: false,
      entries: []
    };

    const results = ls.getCompletionsAt(fileName, position);
    if (results) {
      base.entries.push(...results.map((entry: Completion) => {
        return {
          name: entry.name,
          kind: ts.ScriptElementKind.unknown,
          kindModifiers: ts.ScriptElementKindModifier.none,
          sortText: entry.sort,
        };
      }));
    }

    return base;
  };

  function getQuickInfoAtPosition(fileName: string, position: number): ts.QuickInfo|undefined {
    const base = oldLS.getQuickInfoAtPosition(fileName, position);
    const ours = ls.getHoverAt(fileName, position);
    if (!ours) {
      return base;
    }
    const result: ts.QuickInfo = {
      kind: ts.ScriptElementKind.unknown,
      kindModifiers: ts.ScriptElementKindModifier.none,
      textSpan: {
        start: ours.span.start,
        length: ours.span.end - ours.span.start,
      },
      displayParts: ours.text.map(part => {
        return {
          text: part.text,
          kind: part.language || 'angular',
        };
      }),
      documentation: [],
    };
    if (base && base.tags) {
      result.tags = base.tags;
    }
    return result;
  };

  function getSemanticDiagnostics(fileName: string) {
    logger.info(`Computing Angular semantic diagnostics...`);
    const base = oldLS.getSemanticDiagnostics(fileName) || [];
    const ours = ls.getDiagnostics(fileName);
    if (ours && ours.length) {
      const file = oldLS.getProgram() !.getSourceFile(fileName);
      if (file) {
        base.push(...ours.map(d => diagnosticToDiagnostic(d, file)));
      }
    }

    return base;
  };

  function getDefinitionAtPosition(
      fileName: string, position: number): ReadonlyArray<ts.DefinitionInfo>|undefined {
    const base = oldLS.getDefinitionAtPosition(fileName, position);
    if (base && base.length) {
      return base;
    }
    const ours = ls.getDefinitionAt(fileName, position);
    if (ours && ours.length) {
      return ours.map((loc: Location) => {
        return {
          fileName: loc.fileName,
          textSpan: {
            start: loc.span.start,
            length: loc.span.end - loc.span.start,
          },
          name: '',
          kind: ts.ScriptElementKind.unknown,
          containerName: loc.fileName,
          containerKind: ts.ScriptElementKind.unknown,
        };
      });
    }
  };

  function getDefinitionAndBoundSpan(
      fileName: string, position: number): ts.DefinitionInfoAndBoundSpan|undefined {
    const base = oldLS.getDefinitionAndBoundSpan(fileName, position);
    if (base && base.definitions && base.definitions.length) {
      return base;
    }
    const ours = ls.getDefinitionAt(fileName, position);
    if (ours && ours.length) {
      return {
        definitions: ours.map((loc: Location) => {
          return {
            fileName: loc.fileName,
            textSpan: {
              start: loc.span.start,
              length: loc.span.end - loc.span.start,
            },
            name: '',
            kind: ts.ScriptElementKind.unknown,
            containerName: loc.fileName,
            containerKind: ts.ScriptElementKind.unknown,
          };
        }),
        textSpan: {
          start: ours[0].span.start,
          length: ours[0].span.end - ours[0].span.start,
        },
      };
    }
  };

  const proxy: ts.LanguageService = Object.assign(
      {}, oldLS, {
                     getCompletionsAtPosition, getQuickInfoAtPosition, getSemanticDiagnostics,
                     getDefinitionAtPosition, getDefinitionAndBoundSpan,
                 });
  return proxy;
}
