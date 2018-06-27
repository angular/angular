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
import {DecoratedClass, getEntryPoints} from './parser/parser';
import {Esm2015PackageParser} from './parser/esm2015_parser';
import {Esm2015ReflectionHost} from './host/esm2015_host';
import {ComponentDecoratorHandler, DirectiveDecoratorHandler, InjectableDecoratorHandler, NgModuleDecoratorHandler, SelectorScopeRegistry} from '../../ngtsc/annotations';
import {AnalyzedClass, Analyzer} from './analyzer';

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

    const decoratedClasses = parser.getDecoratedExportedClasses(entryPointFile);
    dumpDecoratedClasses(decoratedClasses);

    const scopeRegistry = new SelectorScopeRegistry(typeChecker, reflectionHost);
    const handlers = [
      new ComponentDecoratorHandler(typeChecker, reflectionHost, scopeRegistry),
      new DirectiveDecoratorHandler(typeChecker, reflectionHost, scopeRegistry),
      new InjectableDecoratorHandler(reflectionHost),
      new NgModuleDecoratorHandler(typeChecker, scopeRegistry),
    ];
    const analyzer = new Analyzer(handlers);
    const analyzedClasses = decoratedClasses
      .map(decoratedClass => analyzer.analyze(decoratedClass))
      .filter(analysis => !!analysis) as AnalyzedClass[];

    dumpAnalysis(analyzedClasses);
  });

  return 0;
}

function dumpDecoratedClasses(decoratedClasses: DecoratedClass[]) {
  console.log('Decorated classes');
  decoratedClasses.forEach(decoratedClass => {
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

function dumpAnalysis(analyzedClasses: AnalyzedClass[]) {
  console.log('Analyzed classes');
  analyzedClasses.forEach(analyzedClass => {
    console.log(`- ${analyzedClass.clazz.name}`);
    console.log(inspect(analyzedClass, false, 1, true).split('\n').map(line => `    ${line}`).join('\n'));
  });
}