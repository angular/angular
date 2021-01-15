/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom as _} from '@angular/compiler-cli/src/ngtsc/file_system';
import {TestFile} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {LanguageServiceTestEnvironment, TestableOptions} from '@angular/language-service/ivy/test/env';
import * as ts from 'typescript/lib/tsserverlibrary';


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
    filesWithClassDeclarations: TestFile[], externalResourceFiles: TestFile[] = [],
    options: TestableOptions = {}): LanguageServiceTestEnvironment {
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
      [moduleFile, ...filesWithClassDeclarations, ...externalResourceFiles], options);
}

export function humanizeDocumentSpanLike<T extends ts.DocumentSpan>(
    item: T, env: LanguageServiceTestEnvironment, overrides: Map<string, string> = new Map()): T&
    Stringy<ts.DocumentSpan> {
  const fileContents = (overrides.has(item.fileName) ? overrides.get(item.fileName) :
                                                       env.host.readFile(item.fileName)) ??
      '';
  if (!fileContents) {
    throw new Error(`Could not read file ${item.fileName}`);
  }
  return {
    ...item,
    textSpan: getText(fileContents, item.textSpan),
    contextSpan: item.contextSpan ? getText(fileContents, item.contextSpan) : undefined,
    originalTextSpan: item.originalTextSpan ? getText(fileContents, item.originalTextSpan) :
                                              undefined,
    originalContextSpan:
        item.originalContextSpan ? getText(fileContents, item.originalContextSpan) : undefined,
  };
}
type Stringy<T> = {
  [P in keyof T]: string;
};

export function assertFileNames(refs: Array<{fileName: string}>, expectedFileNames: string[]) {
  const actualPaths = refs.map(r => r.fileName);
  const actualFileNames = actualPaths.map(p => last(p.split('/')));
  expect(new Set(actualFileNames)).toEqual(new Set(expectedFileNames));
}

export function assertTextSpans(items: Array<{textSpan: string}>, expectedTextSpans: string[]) {
  const actualSpans = items.map(item => item.textSpan);
  expect(new Set(actualSpans)).toEqual(new Set(expectedTextSpans));
}
