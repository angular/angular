/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as tss from 'typescript/lib/tsserverlibrary';

import {isAstResult} from './common';
import {getTemplateCompletions} from './completions';
import {getDefinitionAndBoundSpan, getTsDefinitionAndBoundSpan} from './definitions';
import {getDeclarationDiagnostics, getTemplateDiagnostics, ngDiagnosticToTsDiagnostic, uniqueBySpan} from './diagnostics';
import {getHover, getTsHover} from './hover';
import {Diagnostic, LanguageService} from './types';
import {TypeScriptServiceHost} from './typescript_host';

/**
 * Create an instance of an Angular `LanguageService`.
 *
 * @publicApi
 */
export function createLanguageService(host: TypeScriptServiceHost): LanguageService {
  return new LanguageServiceImpl(host);
}

class LanguageServiceImpl implements LanguageService {
  constructor(private readonly host: TypeScriptServiceHost) {}

  getTemplateReferences(): string[] {
    this.host.getAnalyzedModules();  // same role as 'synchronizeHostData'
    return this.host.getTemplateReferences();
  }

  getDiagnostics(fileName: string): tss.Diagnostic[] {
    const analyzedModules = this.host.getAnalyzedModules();  // same role as 'synchronizeHostData'
    const results: Diagnostic[] = [];
    const templates = this.host.getTemplates(fileName);

    for (const template of templates) {
      const astOrDiagnostic = this.host.getTemplateAst(template);
      if (isAstResult(astOrDiagnostic)) {
        results.push(...getTemplateDiagnostics(astOrDiagnostic));
      } else {
        results.push(astOrDiagnostic);
      }
    }

    const declarations = this.host.getDeclarations(fileName);
    if (declarations && declarations.length) {
      results.push(...getDeclarationDiagnostics(declarations, analyzedModules, this.host));
    }

    const sourceFile = fileName.endsWith('.ts') ? this.host.getSourceFile(fileName) : undefined;
    return uniqueBySpan(results).map(d => ngDiagnosticToTsDiagnostic(d, sourceFile));
  }

  getCompletionsAt(fileName: string, position: number): tss.CompletionInfo|undefined {
    this.host.getAnalyzedModules();  // same role as 'synchronizeHostData'
    const ast = this.host.getTemplateAstAtPosition(fileName, position);
    if (!ast) {
      return;
    }
    const results = getTemplateCompletions(ast, position);
    if (!results || !results.length) {
      return;
    }
    return {
      isGlobalCompletion: false,
      isMemberCompletion: false,
      isNewIdentifierLocation: false,
      entries: results,
    };
  }

  getDefinitionAt(fileName: string, position: number): tss.DefinitionInfoAndBoundSpan|undefined {
    this.host.getAnalyzedModules();  // same role as 'synchronizeHostData'
    const templateInfo = this.host.getTemplateAstAtPosition(fileName, position);
    if (templateInfo) {
      return getDefinitionAndBoundSpan(templateInfo, position);
    }

    // Attempt to get Angular-specific definitions in a TypeScript file, like templates defined
    // in a `templateUrl` property.
    if (fileName.endsWith('.ts')) {
      const sf = this.host.getSourceFile(fileName);
      if (sf) {
        return getTsDefinitionAndBoundSpan(sf, position, this.host.tsLsHost);
      }
    }
  }

  getHoverAt(fileName: string, position: number): tss.QuickInfo|undefined {
    this.host.getAnalyzedModules();  // same role as 'synchronizeHostData'
    const templateInfo = this.host.getTemplateAstAtPosition(fileName, position);
    if (templateInfo) {
      return getHover(templateInfo, position);
    }

    // Attempt to get Angular-specific hover information in a TypeScript file, the NgModule a
    // directive belongs to.
    if (fileName.endsWith('.ts')) {
      const sf = this.host.getSourceFile(fileName);
      if (sf) {
        return getTsHover(sf, position, this.host);
      }
    }
  }
}
