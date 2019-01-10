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

import {CompiledFile, DecorationAnalyzer} from '../analysis/decoration_analyzer';
import {ModuleWithProvidersAnalyses, ModuleWithProvidersAnalyzer} from '../analysis/module_with_providers_analyzer';
import {NgccReferencesRegistry} from '../analysis/ngcc_references_registry';
import {ExportInfo, PrivateDeclarationsAnalyzer} from '../analysis/private_declarations_analyzer';
import {SwitchMarkerAnalyses, SwitchMarkerAnalyzer} from '../analysis/switch_marker_analyzer';
import {Esm2015ReflectionHost} from '../host/esm2015_host';
import {Esm5ReflectionHost} from '../host/esm5_host';
import {NgccReflectionHost} from '../host/ngcc_host';
import {Esm5Renderer} from '../rendering/esm5_renderer';
import {EsmRenderer} from '../rendering/esm_renderer';
import {FileInfo, Renderer} from '../rendering/renderer';

import {EntryPoint} from './entry_point';
import {EntryPointBundle} from './entry_point_bundle';



/**
 * A Package is stored in a directory on disk and that directory can contain one or more package
 * formats - e.g. fesm2015, UMD, etc. Additionally, each package provides typings (`.d.ts` files).
 *
 * Each of these formats exposes one or more entry points, which are source files that need to be
 * parsed to identify the decorated exported classes that need to be analyzed and compiled by one or
 * more `DecoratorHandler` objects.
 *
 * Each entry point to a package is identified by a `package.json` which contains properties that
 * indicate what formatted bundles are accessible via this end-point.
 *
 * Each bundle is identified by a root `SourceFile` that can be parsed and analyzed to
 * identify classes that need to be transformed; and then finally rendered and written to disk.
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

  /**
   * Transform the source (and typings) files of a bundle.
   * @param bundle the bundle to transform.
   */
  transform(entryPoint: EntryPoint, isCore: boolean, bundle: EntryPointBundle): void {
    console.warn(`Compiling ${entryPoint.name} - ${bundle.format}`);

    const reflectionHost = this.getHost(isCore, bundle);

    // Parse and analyze the files.
    const {decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses,
           moduleWithProvidersAnalyses} = this.analyzeProgram(reflectionHost, isCore, bundle);

    // Transform the source files and source maps.
    const renderer = this.getRenderer(reflectionHost, isCore, bundle);
    const renderedFiles = renderer.renderProgram(
        decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses,
        moduleWithProvidersAnalyses);

    // Write out all the transformed files.
    renderedFiles.forEach(file => this.writeFile(file));
  }

  getHost(isCore: boolean, bundle: EntryPointBundle): NgccReflectionHost {
    const typeChecker = bundle.src.program.getTypeChecker();
    switch (bundle.format) {
      case 'esm2015':
      case 'fesm2015':
        return new Esm2015ReflectionHost(isCore, typeChecker, bundle.dts);
      case 'esm5':
      case 'fesm5':
        return new Esm5ReflectionHost(isCore, typeChecker);
      default:
        throw new Error(`Reflection host for "${bundle.format}" not yet implemented.`);
    }
  }

  getRenderer(host: NgccReflectionHost, isCore: boolean, bundle: EntryPointBundle): Renderer {
    switch (bundle.format) {
      case 'esm2015':
      case 'fesm2015':
        return new EsmRenderer(host, isCore, bundle, this.sourcePath, this.targetPath);
      case 'esm5':
      case 'fesm5':
        return new Esm5Renderer(host, isCore, bundle, this.sourcePath, this.targetPath);
      default:
        throw new Error(`Renderer for "${bundle.format}" not yet implemented.`);
    }
  }

  analyzeProgram(reflectionHost: NgccReflectionHost, isCore: boolean, bundle: EntryPointBundle):
      ProgramAnalyses {
    const typeChecker = bundle.src.program.getTypeChecker();
    const referencesRegistry = new NgccReferencesRegistry(reflectionHost);

    const switchMarkerAnalyzer = new SwitchMarkerAnalyzer(reflectionHost);
    const switchMarkerAnalyses = switchMarkerAnalyzer.analyzeProgram(bundle.src.program);

    const decorationAnalyzer = new DecorationAnalyzer(
        bundle.src.program, bundle.src.options, bundle.src.host, typeChecker, reflectionHost,
        referencesRegistry, bundle.rootDirs, isCore);
    const decorationAnalyses = decorationAnalyzer.analyzeProgram();

    const moduleWithProvidersAnalyzer =
        bundle.dts && new ModuleWithProvidersAnalyzer(reflectionHost, referencesRegistry);
    const moduleWithProvidersAnalyses = moduleWithProvidersAnalyzer &&
        moduleWithProvidersAnalyzer.analyzeProgram(bundle.src.program);

    const privateDeclarationsAnalyzer =
        new PrivateDeclarationsAnalyzer(reflectionHost, referencesRegistry);
    const privateDeclarationsAnalyses =
        privateDeclarationsAnalyzer.analyzeProgram(bundle.src.program);

    return {decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses,
            moduleWithProvidersAnalyses};
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


interface ProgramAnalyses {
  decorationAnalyses: Map<ts.SourceFile, CompiledFile>;
  switchMarkerAnalyses: SwitchMarkerAnalyses;
  privateDeclarationsAnalyses: ExportInfo[];
  moduleWithProvidersAnalyses: ModuleWithProvidersAnalyses|null;
}
