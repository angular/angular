/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {dirname} from 'canonical-path';
import {existsSync, writeFileSync} from 'fs';
import {mkdir, mv} from 'shelljs';
import * as ts from 'typescript';

import {DecorationAnalyses, DecorationAnalyzer} from '../analysis/decoration_analyzer';
import {SwitchMarkerAnalyses, SwitchMarkerAnalyzer} from '../analysis/switch_marker_analyzer';
import {DtsMapper} from '../host/dts_mapper';
import {Esm2015ReflectionHost} from '../host/esm2015_host';
import {Esm5ReflectionHost} from '../host/esm5_host';
import {Fesm2015ReflectionHost} from '../host/fesm2015_host';
import {NgccReflectionHost} from '../host/ngcc_host';
import {Esm2015Renderer} from '../rendering/esm2015_renderer';
import {Esm5Renderer} from '../rendering/esm5_renderer';
import {Fesm2015Renderer} from '../rendering/fesm2015_renderer';
import {FileInfo, Renderer} from '../rendering/renderer';

import {checkMarkerFile, writeMarkerFile} from './build_marker';
import {EntryPoint, EntryPointFormat} from './entry_point';



/**
 * A Package is stored in a directory on disk and that directory can contain one or more package
 * formats - e.g. fesm2015, UMD, etc. Additionally, each package provides typings (`.d.ts` files).
 *
 * Each of these formats exposes one or more entry points, which are source files that need to be
 * parsed to identify the decorated exported classes that need to be analyzed and compiled by one or
 * more `DecoratorHandler` objects.
 *
 * Each entry point to a package is identified by a `SourceFile` that can be parsed and analyzed to
 * identify classes that need to be transformed; and then finally rendered and written to disk.
 * The actual file which needs to be transformed depends upon the package format.
 *
 * Along with the source files, the corresponding source maps (either inline or external) and
 * `.d.ts` files are transformed accordingly.
 *
 * - Flat file packages have all the classes in a single file.
 * - Other packages may re-export classes from other non-entry point files.
 * - Some formats may contain multiple "modules" in a single file.
 */
export class Transformer {
  constructor(private sourcePath: string, private targetPath: string) {}

  transform(entryPoint: EntryPoint, format: EntryPointFormat): void {
    if (checkMarkerFile(entryPoint, format)) {
      return;
    }

    const options: ts.CompilerOptions = {
      allowJs: true,
      maxNodeModuleJsDepth: Infinity,
      rootDir: entryPoint.path,
    };

    // Create the TS program and necessary helpers.
    // TODO : create a custom compiler host that reads from .bak files if available.
    const host = ts.createCompilerHost(options);
    const rootDirs = this.getRootDirs(host, options);
    const entryPointFilePath = entryPoint[format];
    if (!entryPointFilePath) {
      throw new Error(
          `Missing entry point file for format, ${format}, in package, ${entryPoint.path}.`);
    }
    const packageProgram = ts.createProgram([entryPointFilePath], options, host);
    const dtsMapper = new DtsMapper(dirname(entryPointFilePath), dirname(entryPoint.typings));
    const reflectionHost = this.getHost(entryPoint.name, format, packageProgram, dtsMapper);

    const {decorationAnalyses, switchMarkerAnalyses} =
        this.analyzeProgram(packageProgram, reflectionHost, rootDirs);

    // Transform the source files and source maps.
    const renderer = this.getRenderer(format, reflectionHost, dtsMapper);
    const renderedFiles =
        renderer.renderProgram(packageProgram, decorationAnalyses, switchMarkerAnalyses);

    // Write out all the transformed files.
    renderedFiles.forEach(file => this.writeFile(file));

    // Write the built-with-ngcc marker
    writeMarkerFile(entryPoint, format);
  }

  getRootDirs(host: ts.CompilerHost, options: ts.CompilerOptions) {
    if (options.rootDirs !== undefined) {
      return options.rootDirs;
    } else if (options.rootDir !== undefined) {
      return [options.rootDir];
    } else {
      return [host.getCurrentDirectory()];
    }
  }

  getHost(packageName: string, format: string, program: ts.Program, dtsMapper: DtsMapper):
      NgccReflectionHost {
    switch (format) {
      case 'esm2015':
        return new Esm2015ReflectionHost(packageName, program.getTypeChecker(), dtsMapper);
      case 'fesm2015':
        return new Fesm2015ReflectionHost(packageName, program.getTypeChecker());
      case 'esm5':
      case 'fesm5':
        return new Esm5ReflectionHost(packageName, program.getTypeChecker());
      default:
        throw new Error(`Relection host for "${format}" not yet implemented.`);
    }
  }

  getRenderer(format: string, host: NgccReflectionHost, dtsMapper: DtsMapper): Renderer {
    switch (format) {
      case 'esm2015':
        return new Esm2015Renderer(host, this.sourcePath, this.targetPath, dtsMapper);
      case 'fesm2015':
        return new Fesm2015Renderer(host, this.sourcePath, this.targetPath);
      case 'esm5':
      case 'fesm5':
        return new Esm5Renderer(host, this.sourcePath, this.targetPath);
      default:
        throw new Error(`Renderer for "${format}" not yet implemented.`);
    }
  }

  analyzeProgram(program: ts.Program, reflectionHost: NgccReflectionHost, rootDirs: string[]) {
    const decorationAnalyzer =
        new DecorationAnalyzer(program.getTypeChecker(), reflectionHost, rootDirs);
    const switchMarkerAnalyzer = new SwitchMarkerAnalyzer(reflectionHost);
    return {
      decorationAnalyses: decorationAnalyzer.analyzeProgram(program),
      switchMarkerAnalyses: switchMarkerAnalyzer.analyzeProgram(program),
    };
  }

  writeFile(file: FileInfo): void {
    mkdir('-p', dirname(file.path));
    const backPath = file.path + '.bak';
    if (existsSync(file.path) && !existsSync(backPath)) {
      mv(file.path, backPath);
    }
    writeFileSync(file.path, file.contents, 'utf8');
  }
}
