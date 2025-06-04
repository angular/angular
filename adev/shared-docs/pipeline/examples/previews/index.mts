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
import {glob} from 'tinyglobby';
import ts from 'typescript';

const [examplesDir, templateFilePath, outputFilePath] = process.argv.slice(2);

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

/**
 * Creates a map of example path to dynamic component import for loading embedded examples.
 *
 * For example, given the following inputs:
 * examplesDir: 'adev/src/content/examples',
 * templateFilePath: 'adev/shared-docs/pipeline/examples/previews/previews.template',
 * outputFilePath: 'bazel-out/k8-fastbuild/bin/adev/src/assets/previews/previews.ts'
 *
 * The script will generate a mapping of all example components under adev/src/content/examples and
 * fill them into the given template file, writing the result to the output file.
 *
 * It will replace the placeholder text `${previewsComponents}` in the template with mappings like:
 * ['adev/src/content/examples/accessibility/src/app/app.component.ts']:
 *   () => import('../../content/examples/accessibility/src/app/app.component').then(c => c.AppComponent),
 * ['adev/src/content/examples/accessibility/src/app/progress-bar.component.ts']:
 *   () => import('../../content/examples/accessibility/src/app/progress-bar.component').then(c => c.ExampleProgressbarComponent),
 * ...
 */
async function main() {
  const files = await glob(join(examplesDir, '**/*.ts'), {
    ignore: ['**/*.e2e-spec.ts', '**/*.spec.ts', '**/*.po.ts'],
  }).then((paths) =>
    Promise.all(
      paths.map((path) =>
        readFile(path, {encoding: 'utf-8'}).then((fileContent) => {
          return {
            path: relative(examplesDir, path),
            content: fileContent,
          };
        }),
      ),
    ),
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
