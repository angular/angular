/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {absoluteFrom as _} from '@angular/compiler-cli/src/ngtsc/file_system';
import {TestFile} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {LanguageServiceTestEnvironment} from '@angular/language-service/ivy/test/env';

export function getText(contents: string, textSpan: ts.TextSpan) {
  return contents.substr(textSpan.start, textSpan.length);
}

function last<T>(array: T[]): T {
  return array[array.length - 1];
}

function getFirstClassDeclaration(declaration: string) {
  const matches = declaration.match(/(?:export class )(\w+)(?:\s|\{)/);
  if (matches === null || matches.length !== 2) {
    throw new Error(`Did not find exactly one exported class in: ${declaration}`);
  }
  return matches[1].trim();
}

export function createModuleWithDeclarations(
    filesWithClassDeclarations: TestFile[],
    externalResourceFiles: TestFile[] = []): LanguageServiceTestEnvironment {
  const externalClasses =
      filesWithClassDeclarations.map(file => getFirstClassDeclaration(file.contents));
  const externalImports = filesWithClassDeclarations.map(file => {
    const className = getFirstClassDeclaration(file.contents);
    const fileName = last(file.name.split('/')).replace('.ts', '');
    return `import {${className}} from './${fileName}';`;
  });
  const contents = `
        import {NgModule} from '@angular/core';
        import {CommonModule} from '@angular/common';
        ${externalImports.join('\n')}

        @NgModule({
          declarations: [${externalClasses.join(',')}],
          imports: [CommonModule],
        })
        export class AppModule {}
      `;
  const moduleFile = {name: _('/app-module.ts'), contents, isRoot: true};
  return LanguageServiceTestEnvironment.setup(
      [moduleFile, ...filesWithClassDeclarations, ...externalResourceFiles]);
}
