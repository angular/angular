/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom} from '@angular/compiler-cli/src/ngtsc/file_system';
import {TestFile} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {LanguageServiceTestEnv} from './env';
import {Project, ProjectFiles} from './project';

/**
 * Given a text snippet which contains exactly one cursor symbol ('¦'), extract both the offset of
 * that cursor within the text as well as the text snippet without the cursor.
 */
export function extractCursorInfo(textWithCursor: string): {cursor: number, text: string} {
  const cursor = textWithCursor.indexOf('¦');
  if (cursor === -1 || textWithCursor.indexOf('¦', cursor + 1) !== -1) {
    throw new Error(`Expected to find exactly one cursor symbol '¦'`);
  }

  return {
    cursor,
    text: textWithCursor.substr(0, cursor) + textWithCursor.substr(cursor + 1),
  };
}

function last<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error(`last() called on empty array`);
  }
  return array[array.length - 1];
}

/**
 * Expect that a list of objects with a `fileName` property matches a set of expected files by only
 * comparing the file names and not any path prefixes.
 *
 * This assertion is independent of the order of either list.
 */
export function assertFileNames(refs: Array<{fileName: string}>, expectedFileNames: string[]) {
  const actualPaths = refs.map(r => r.fileName);
  const actualFileNames = actualPaths.map(p => last(p.split('/')));
  expect(new Set(actualFileNames)).toEqual(new Set(expectedFileNames));
}

/**
 * Returns whether the given `ts.Diagnostic` is of a type only produced by the Angular compiler (as
 * opposed to being an upstream TypeScript diagnostic).
 *
 * Template type-checking diagnostics are not "ng-specific" in this sense, since they are plain
 * TypeScript diagnostics that are produced from expressions in the template by way of a TCB.
 */
export function isNgSpecificDiagnostic(diag: ts.Diagnostic): boolean {
  // Angular-specific diagnostics use a negative code space.
  return diag.code < 0;
}

function getFirstClassDeclaration(declaration: string) {
  const matches = declaration.match(/(?:export class )(\w+)(?:\s|\{)/);
  if (matches === null || matches.length !== 2) {
    throw new Error(`Did not find exactly one exported class in: ${declaration}`);
  }
  return matches[1].trim();
}

export function createModuleAndProjectWithDeclarations(
    env: LanguageServiceTestEnv, projectName: string, projectFiles: ProjectFiles,
    options: any = {}): Project {
  const externalClasses: string[] = [];
  const externalImports: string[] = [];
  for (const [fileName, fileContents] of Object.entries(projectFiles)) {
    if (!fileName.endsWith('.ts')) {
      continue;
    }
    const className = getFirstClassDeclaration(fileContents);
    externalClasses.push(className);
    externalImports.push(`import {${className}} from './${fileName.replace('.ts', '')}';`);
  }
  const moduleContents = `
        import {NgModule} from '@angular/core';
        import {CommonModule} from '@angular/common';
        ${externalImports.join('\n')}

        @NgModule({
          declarations: [${externalClasses.join(',')}],
          imports: [CommonModule],
        })
        export class AppModule {}
      `;
  projectFiles['app-module.ts'] = moduleContents;
  return env.addProject(projectName, projectFiles);
}