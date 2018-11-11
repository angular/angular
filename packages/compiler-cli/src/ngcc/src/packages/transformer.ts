/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {dirname, resolve} from 'canonical-path';
import {existsSync, lstatSync, readdirSync, writeFileSync} from 'fs';
import {mkdir, mv} from 'shelljs';
import * as ts from 'typescript';

import {DecorationAnalyzer} from '../analysis/decoration_analyzer';
import {SwitchMarkerAnalyzer} from '../analysis/switch_marker_analyzer';
import {Esm2015ReflectionHost} from '../host/esm2015_host';
import {Esm5ReflectionHost} from '../host/esm5_host';
import {NgccReflectionHost} from '../host/ngcc_host';
import {Esm5Renderer} from '../rendering/esm5_renderer';
import {EsmRenderer} from '../rendering/esm_renderer';
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

  transform(entryPoint: EntryPoint, format: EntryPointFormat, transformDts: boolean): void {
    if (checkMarkerFile(entryPoint, format)) {
      console.warn(`Skipping ${entryPoint.name} : ${format} (already built).`);
      return;
    }

    const entryPointFilePath = entryPoint[format];
    if (!entryPointFilePath) {
      console.warn(
          `Skipping ${entryPoint.name} : ${format} (no entry point file for this format).`);
      return;
    }

    console.warn(`Compiling ${entryPoint.name} - ${format}`);

    const options: ts.CompilerOptions = {
      allowJs: true,
      maxNodeModuleJsDepth: Infinity,
      rootDir: entryPoint.path,
    };

    // Create the TS program and necessary helpers.
    // TODO : create a custom compiler host that reads from .bak files if available.
    const host = ts.createCompilerHost(options);
    const rootDirs = this.getRootDirs(host, options);
    const isCore = entryPoint.name === '@angular/core';
    const r3SymbolsPath = isCore ? this.findR3SymbolsPath(dirname(entryPointFilePath)) : null;
    const rootPaths = r3SymbolsPath ? [entryPointFilePath, r3SymbolsPath] : [entryPointFilePath];
    const packageProgram = ts.createProgram(rootPaths, options, host);
    console.time(entryPoint.name + '(dtsmappper creation)');
    const dtsFilePath = entryPoint.typings;
    const dtsProgram = transformDts ? ts.createProgram([entryPoint.typings], options, host) : null;
    console.timeEnd(entryPoint.name + '(dtsmappper creation)');
    const reflectionHost = this.getHost(isCore, format, packageProgram, dtsFilePath, dtsProgram);
    const r3SymbolsFile = r3SymbolsPath && packageProgram.getSourceFile(r3SymbolsPath) || null;

    // Parse and analyze the files.
    const {decorationAnalyses, switchMarkerAnalyses} =
        this.analyzeProgram(packageProgram, reflectionHost, rootDirs, isCore);

    console.time(entryPoint.name + '(rendering)');
    // Transform the source files and source maps.
    const renderer = this.getRenderer(
        format, packageProgram, reflectionHost, isCore, r3SymbolsFile, transformDts);
    const renderedFiles =
        renderer.renderProgram(packageProgram, decorationAnalyses, switchMarkerAnalyses);
    console.timeEnd(entryPoint.name + '(rendering)');

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

  getHost(
      isCore: boolean, format: string, program: ts.Program, dtsFilePath: string,
      dtsProgram: ts.Program|null): NgccReflectionHost {
    switch (format) {
      case 'esm2015':
      case 'fesm2015':
        return new Esm2015ReflectionHost(isCore, program.getTypeChecker(), dtsFilePath, dtsProgram);
      case 'esm5':
      case 'fesm5':
        return new Esm5ReflectionHost(isCore, program.getTypeChecker());
      default:
        throw new Error(`Relection host for "${format}" not yet implemented.`);
    }
  }

  getRenderer(
      format: string, program: ts.Program, host: NgccReflectionHost, isCore: boolean,
      rewriteCoreImportsTo: ts.SourceFile|null, transformDts: boolean): Renderer {
    switch (format) {
      case 'esm2015':
      case 'fesm2015':
        return new EsmRenderer(
            host, isCore, rewriteCoreImportsTo, this.sourcePath, this.targetPath, transformDts);
      case 'esm5':
      case 'fesm5':
        return new Esm5Renderer(
            host, isCore, rewriteCoreImportsTo, this.sourcePath, this.targetPath, transformDts);
      default:
        throw new Error(`Renderer for "${format}" not yet implemented.`);
    }
  }

  analyzeProgram(
      program: ts.Program, reflectionHost: NgccReflectionHost, rootDirs: string[],
      isCore: boolean) {
    const decorationAnalyzer =
        new DecorationAnalyzer(program.getTypeChecker(), reflectionHost, rootDirs, isCore);
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

  findR3SymbolsPath(directory: string): string|null {
    const r3SymbolsFilePath = resolve(directory, 'r3_symbols.js');
    if (existsSync(r3SymbolsFilePath)) {
      return r3SymbolsFilePath;
    }

    const subDirectories =
        readdirSync(directory)
            // Not interested in hidden files
            .filter(p => !p.startsWith('.'))
            // Ignore node_modules
            .filter(p => p !== 'node_modules')
            // Only interested in directories (and only those that are not symlinks)
            .filter(p => {
              const stat = lstatSync(resolve(directory, p));
              return stat.isDirectory() && !stat.isSymbolicLink();
            });

    for (const subDirectory of subDirectories) {
      const r3SymbolsFilePath = this.findR3SymbolsPath(resolve(directory, subDirectory));
      if (r3SymbolsFilePath) {
        return r3SymbolsFilePath;
      }
    }

    return null;
  }
}
