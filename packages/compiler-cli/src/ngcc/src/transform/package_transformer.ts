/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {writeFileSync} from 'fs';
import {dirname, relative, resolve} from 'path';
import {mkdir} from 'shelljs';
import * as ts from 'typescript';

import {Analyzer} from '../analyzer';
import {Esm2015ReflectionHost} from '../host/esm2015_host';
import {Esm5ReflectionHost} from '../host/esm5_host';
import {NgccReflectionHost} from '../host/ngcc_host';
import {Esm2015FileParser} from '../parsing/esm2015_parser';
import {Esm5FileParser} from '../parsing/esm5_parser';
import {FileParser} from '../parsing/file_parser';
import {getEntryPoints} from '../parsing/utils';
import {Esm2015Renderer} from '../rendering/esm2015_renderer';
import {Esm5Renderer} from '../rendering/esm5_renderer';
import {FileInfo, Renderer} from '../rendering/renderer';


/**
 * A Package is stored in a directory on disk and that directory can contain one or more package
 formats - e.g. fesm2015, UMD, etc.
 *
 * Each of these formats exposes one or more entry points, which are source files that need to be
 * parsed to identify the decorated exported classes that need to be analyzed and compiled by one or
 * more `DecoratorHandler` objects.
 *
 * Each entry point to a package is identified by a `SourceFile` that can be parsed and analyzed
 * to identify classes that need to be transformed; and then finally rendered and written to disk.

 * The actual file which needs to be transformed depends upon the package format.
 *
 * - Flat file packages have all the classes in a single file.
 * - Other packages may re-export classes from other non-entry point files.
 * - Some formats may contain multiple "modules" in a single file.
 */
export class PackageTransformer {
  transform(packagePath: string, format: string): void {
    const sourceNodeModules = this.findNodeModulesPath(packagePath);
    const targetNodeModules = sourceNodeModules.replace(/node_modules$/, 'node_modules_ngtsc');
    const entryPointPaths = getEntryPoints(packagePath, format);
    entryPointPaths.forEach(entryPointPath => {
      const options: ts.CompilerOptions = {
        allowJs: true,
        maxNodeModuleJsDepth: Infinity,
        rootDir: entryPointPath,
      };

      const host = ts.createCompilerHost(options);
      const packageProgram = ts.createProgram([entryPointPath], options, host);
      const entryPointFile = packageProgram.getSourceFile(entryPointPath) !;
      const typeChecker = packageProgram.getTypeChecker();

      const reflectionHost = this.getHost(format, packageProgram);
      const parser = this.getFileParser(format, packageProgram, reflectionHost);
      const analyzer = new Analyzer(typeChecker, reflectionHost);
      const renderer = this.getRenderer(format, packageProgram, reflectionHost);

      const parsedFiles = parser.parseFile(entryPointFile);
      parsedFiles.forEach(parsedFile => {
        const analyzedFile = analyzer.analyzeFile(parsedFile);
        const targetPath = resolve(
            targetNodeModules, relative(sourceNodeModules, analyzedFile.sourceFile.fileName));
        const {source, map} = renderer.renderFile(analyzedFile, targetPath);
        this.writeFile(source);
        if (map) {
          this.writeFile(map);
        }
      });
    });
  }

  getHost(format: string, program: ts.Program): NgccReflectionHost {
    switch (format) {
      case 'esm2015':
      case 'fesm2015':
        return new Esm2015ReflectionHost(program.getTypeChecker());
      case 'fesm5':
        return new Esm5ReflectionHost(program.getTypeChecker());
      default:
        throw new Error(`Relection host for "${format}" not yet implemented.`);
    }
  }

  getFileParser(format: string, program: ts.Program, host: NgccReflectionHost): FileParser {
    switch (format) {
      case 'esm2015':
      case 'fesm2015':
        return new Esm2015FileParser(program, host);
      case 'fesm5':
        return new Esm5FileParser(program, host);
      default:
        throw new Error(`File parser for "${format}" not yet implemented.`);
    }
  }

  getRenderer(format: string, program: ts.Program, host: NgccReflectionHost): Renderer {
    switch (format) {
      case 'esm2015':
      case 'fesm2015':
        return new Esm2015Renderer(host);
      case 'fesm5':
        return new Esm5Renderer(host);
      default:
        throw new Error(`Renderer for "${format}" not yet implemented.`);
    }
  }

  findNodeModulesPath(src: string): string {
    while (src && !/node_modules$/.test(src)) {
      src = dirname(src);
    }
    return src;
  }

  writeFile(file: FileInfo): void {
    mkdir('-p', dirname(file.path));
    writeFileSync(file.path, file.contents, 'utf8');
  }
}
