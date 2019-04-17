/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Replacement, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';

import {DOCUMENT_TOKEN_NAME, DocumentImportVisitor} from '../document_import_visitor';
import {addToImport, removeFromImport} from '../move-import';


/**
 * Rule that moves the DOCUMENT InjectionToken from the deprecation source in
 * angular/platform-browser
 * to the new source in angular/common. The rule also provides TSLint automatic replacements that
 * can
 * be applied in order to automatically migrate to the new source.
 */
export class Rule extends Rules.TypedRule {
  static FAILURE: string =
      `DOCUMENT is no longer exported from @angular/platform-browser in v8. Please 
  import from @angular/common`;

  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    const visitor = new DocumentImportVisitor(program.getTypeChecker());
    const rootSourceFiles = program.getRootFileNames().map(f => program.getSourceFile(f) !);
    const failures: RuleFailure[] = [];

    // Analyze source files by detecting imports and declarations.
    rootSourceFiles.forEach(sourceFile => visitor.visitNode(sourceFile));

    const {importsMap} = visitor;
    const imports = importsMap.get(sourceFile);

    // No DOCUMENT imports from platform-browser detected for the given source file.
    if (!imports) {
      return [];
    }

    const {platformBrowserImport, commonImport, documentElement, replaceText} = imports;

    if (!documentElement || !replaceText || !platformBrowserImport) {
      return [];
    }

    // Replace the imports with the updated sources.
    const platformBrowserDeclaration = platformBrowserImport.parent.parent;
    const newPlatformBrowserText = removeFromImport(platformBrowserImport, DOCUMENT_TOKEN_NAME);
    const newCommonText =
        commonImport ? addToImport(commonImport, DOCUMENT_TOKEN_NAME) : NEW_COMMON_TEXT;
    const fixPlatformBrowser = new Replacement(
        platformBrowserDeclaration.getStart(), platformBrowserDeclaration.getWidth(),
        newPlatformBrowserText);
    const fixCommon = new Replacement(platformBrowserDeclaration.end, 0, newCommonText);
    const fixes: Replacement[] = fixPlatformBrowser.start > fixCommon.start ?
        [fixCommon, fixPlatformBrowser] :
        [fixPlatformBrowser, fixCommon];

    failures.push(new RuleFailure(
        sourceFile, documentElement.getStart(), documentElement.getWidth(), Rule.FAILURE,
        this.ruleName, fixes));

    return failures;
  }
}

const NEW_COMMON_TEXT = `import {DOCUMENT} from '@angular/common';`;
