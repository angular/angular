/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

 /* tslint:disable:no-console */

import {relative, resolve} from 'path';
import {inspect} from 'util';
import * as ts from 'typescript';

import {AnalyzedFile, Analyzer} from './analyzer';
import {Esm2015ReflectionHost} from './host/esm2015_host';
import {Esm2015PackageParser} from './parser/esm2015_parser';
import {Esm2015Renderer} from './rendering/esm2015_renderer';
import {getEntryPoints, ParsedFile} from './parser/parser';

export function mainNgcc(args: string[]): number {
  const packagePath = resolve(args[0]);
  const entryPointPaths = getEntryPoints(packagePath, 'fesm2015');

  console.log('Entry points', entryPointPaths);
  entryPointPaths.forEach(entryPointPath => {

    console.log('Processing', relative(packagePath, entryPointPath));
    const options: ts.CompilerOptions = { allowJs: true, rootDir: entryPointPath };
    const host = ts.createCompilerHost(options);
    const packageProgram = ts.createProgram([entryPointPath], options, host);
    const entryPointFile = packageProgram.getSourceFile(entryPointPath)!;
    const typeChecker = packageProgram.getTypeChecker();

    const reflectionHost = new Esm2015ReflectionHost(typeChecker);
    const parser = new Esm2015PackageParser(packageProgram, reflectionHost);

    const parsedFiles = parser.parseEntryPoint(entryPointFile);
    parsedFiles.forEach(parsedFile => {

      dumpParsedFile(parsedFile);

      const analyzer = new Analyzer(typeChecker, reflectionHost);
      const analyzedFile = analyzer.analyzeFile(parsedFile);

      dumpAnalysis(analyzedFile);

      console.log('Conmpiled definitions');
      console.log(analyzedFile.imports);
      console.log(analyzedFile.analyzedClasses.map(c => c.renderedDefinition));

      const renderer = new Esm2015Renderer();
      const output = renderer.renderFile(analyzedFile);

      // Dump the output for the `testing.js` files as an example
      if (analyzedFile.sourceFile.fileName.endsWith('testing.js')) {
        console.log(output.content);
        console.log(output.map);
      }
    });
  });
  return 0;
}

function dumpParsedFile(parsedFile: ParsedFile) {
  console.log('==================================================================');
  console.log(parsedFile.sourceFile.fileName);
  console.log('***** Decorated classes: *****');
  parsedFile.decoratedClasses.forEach(decoratedClass => {
    let output = `- ${decoratedClass.name} `;
    decoratedClass.decorators.forEach(decorator => {
      output += `[${decorator.name}`;
      if (decorator.args) {
        output += ' ' + decorator.args.map(arg => `${arg.getText()}`).join(', ');
      }
      output += ']';
    });
    console.log(output);
  });
}

function dumpAnalysis(file: AnalyzedFile) {
  console.log('==================================================================');
  console.log(file.sourceFile.fileName);
  console.log('***** Analyzed classes: *****');
  file.analyzedClasses.forEach(analyzedClass => {
    console.log(`- ${analyzedClass.clazz.name}`);
    console.log(inspect(analyzedClass, false, 1, true).split('\n').map(line => `    ${line}`).join('\n'));
  });
}
