/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fs from 'fs';
import {readFile, writeFile} from 'fs/promises';
import {join, relative} from 'path';
import ts from 'typescript';

const [examplesDir, templateFilePath, outputFilePath] = process.argv.slice(2);

const TYPESCRIPT_EXTENSION = '.ts';
const SKIP_FILES_WITH_EXTENSIONS = ['.e2e-spec.ts', '.spec.ts', '.po.ts'];
const EXAMPLES_PATH = `../../content/examples`;

interface File {
  path: string;
  content: string;
}

interface AnalyzedFiles {
  path: string;
  componentNames: string[];
}

main();

async function main() {
  const files = await retrieveAllTypescriptFiles(
    examplesDir,
    (path) => !SKIP_FILES_WITH_EXTENSIONS.some((extensionToSkip) => path.endsWith(extensionToSkip)),
  );

  const filesWithComponent = files
    .map((file) => ({
      componentNames: analyzeFile(file),
      path: file.path,
    }))
    .filter((result) => result.componentNames.length > 0);

  const previewsComponentMap = generatePreviewsComponentMap(filesWithComponent);

  await writeFile(outputFilePath, previewsComponentMap);
}

/** Recursively search the provided directory for all typescript files and asynchronously load them. */
function retrieveAllTypescriptFiles(
  baseDir: string,
  predicateFn: (path: string) => boolean,
): Promise<File[]> {
  const typescriptFiles: Promise<File>[] = [];

  const checkFilesInDirectory = (dir: string) => {
    const files = fs.readdirSync(dir, {withFileTypes: true});
    for (const file of files) {
      const fullPathToFile = join(dir, file.name);
      const relativeFilePath = relative(baseDir, fullPathToFile);

      if (
        file.isFile() &&
        file.name.endsWith(TYPESCRIPT_EXTENSION) &&
        predicateFn(relativeFilePath)
      ) {
        typescriptFiles.push(
          readFile(fullPathToFile, {encoding: 'utf-8'}).then((fileContent) => {
            return {
              path: relativeFilePath,
              content: fileContent,
            };
          }),
        );
      } else if (file.isDirectory()) {
        checkFilesInDirectory(fullPathToFile);
      }
    }
  };

  checkFilesInDirectory(baseDir);

  return Promise.all(typescriptFiles);
}

/** Returns list of the `Standalone` @Component class names for given file */
function analyzeFile(file: File): string[] {
  const componentClassNames: string[] = [];
  const sourceFile = ts.createSourceFile(file.path, file.content, ts.ScriptTarget.Latest, false);

  const visitNode = (node: ts.Node): void => {
    if (ts.isClassDeclaration(node)) {
      const decorators = ts.getDecorators(node);
      const componentName = node.name ? node.name.text : null;

      if (decorators && decorators.length) {
        for (const decorator of decorators) {
          const call = decorator.expression;

          if (
            ts.isCallExpression(call) &&
            ts.isIdentifier(call.expression) &&
            call.expression.text === 'Component' &&
            call.arguments.length > 0 &&
            ts.isObjectLiteralExpression(call.arguments[0])
          ) {
            const standaloneProperty = call.arguments[0].properties.find(
              (property) =>
                property.name &&
                ts.isIdentifier(property.name) &&
                property.name.text === 'standalone',
            );

            const isStandalone =
              !standaloneProperty ||
              (ts.isPropertyAssignment(standaloneProperty) &&
                standaloneProperty.initializer.kind === ts.SyntaxKind.TrueKeyword);

            if (isStandalone && componentName) {
              componentClassNames.push(componentName);
            }
          }
        }
      }
    }

    ts.forEachChild(node, visitNode);
  };

  visitNode(sourceFile);

  return componentClassNames;
}

function generatePreviewsComponentMap(data: AnalyzedFiles[]): string {
  let result = '';
  for (const fileData of data) {
    for (const componentName of fileData.componentNames) {
      const key = `adev/src/content/examples/${fileData.path}${
        fileData.componentNames.length > 1 ? '_' + componentName : ''
      }`.replace(/\\/g, '/');
      result += `['${key}']: () => import('${EXAMPLES_PATH}/${fileData.path
        .replace(/\\/g, '/')
        .replace('.ts', '')}').then(c => c.${componentName}),\n`;
    }
  }
  return fs.readFileSync(templateFilePath, 'utf8').replace(/\${previewsComponents}/g, result);
}
