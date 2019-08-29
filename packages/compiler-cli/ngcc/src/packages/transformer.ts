/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {FileSystem} from '../../../src/ngtsc/file_system';
import {DecorationAnalyzer} from '../analysis/decoration_analyzer';
import {ModuleWithProvidersAnalyses, ModuleWithProvidersAnalyzer} from '../analysis/module_with_providers_analyzer';
import {NgccReferencesRegistry} from '../analysis/ngcc_references_registry';
import {ExportInfo, PrivateDeclarationsAnalyzer} from '../analysis/private_declarations_analyzer';
import {SwitchMarkerAnalyses, SwitchMarkerAnalyzer} from '../analysis/switch_marker_analyzer';
import {CompiledFile} from '../analysis/types';
import {CommonJsReflectionHost} from '../host/commonjs_host';
import {Esm2015ReflectionHost} from '../host/esm2015_host';
import {Esm5ReflectionHost} from '../host/esm5_host';
import {NgccReflectionHost} from '../host/ngcc_host';
import {UmdReflectionHost} from '../host/umd_host';
import {Logger} from '../logging/logger';
import {CommonJsRenderingFormatter} from '../rendering/commonjs_rendering_formatter';
import {DtsRenderer} from '../rendering/dts_renderer';
import {Esm5RenderingFormatter} from '../rendering/esm5_rendering_formatter';
import {EsmRenderingFormatter} from '../rendering/esm_rendering_formatter';
import {Renderer} from '../rendering/renderer';
import {RenderingFormatter} from '../rendering/rendering_formatter';
import {UmdRenderingFormatter} from '../rendering/umd_rendering_formatter';
import {FileToWrite} from '../rendering/utils';
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
  constructor(private fs: FileSystem, private logger: Logger) {}

  /**
   * Transform the source (and typings) files of a bundle.
   * @param bundle the bundle to transform.
   * @returns information about the files that were transformed.
   */
  transform(bundle: EntryPointBundle): FileToWrite[] {
    const reflectionHost = this.getHost(bundle);

    // Parse and analyze the files.
    const {decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses,
           moduleWithProvidersAnalyses} = this.analyzeProgram(reflectionHost, bundle);

    // Transform the source files and source maps.
    const srcFormatter = this.getRenderingFormatter(reflectionHost, bundle);

    const renderer = new Renderer(srcFormatter, this.fs, this.logger, bundle);
    let renderedFiles = renderer.renderProgram(
        decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses);

    if (bundle.dts) {
      const dtsFormatter = new EsmRenderingFormatter(reflectionHost, bundle.isCore);
      const dtsRenderer =
          new DtsRenderer(dtsFormatter, this.fs, this.logger, reflectionHost, bundle);
      const renderedDtsFiles = dtsRenderer.renderProgram(
          decorationAnalyses, privateDeclarationsAnalyses, moduleWithProvidersAnalyses);
      renderedFiles = renderedFiles.concat(renderedDtsFiles);
    }

    return renderedFiles;
  }

  getHost(bundle: EntryPointBundle): NgccReflectionHost {
    const typeChecker = bundle.src.program.getTypeChecker();
    switch (bundle.format) {
      case 'esm2015':
        return new Esm2015ReflectionHost(this.logger, bundle.isCore, typeChecker, bundle.dts);
      case 'esm5':
        return new Esm5ReflectionHost(this.logger, bundle.isCore, typeChecker, bundle.dts);
      case 'umd':
        return new UmdReflectionHost(
            this.logger, bundle.isCore, bundle.src.program, bundle.src.host, bundle.dts);
      case 'commonjs':
        return new CommonJsReflectionHost(
            this.logger, bundle.isCore, bundle.src.program, bundle.src.host, bundle.dts);
      default:
        throw new Error(`Reflection host for "${bundle.format}" not yet implemented.`);
    }
  }

  getRenderingFormatter(host: NgccReflectionHost, bundle: EntryPointBundle): RenderingFormatter {
    switch (bundle.format) {
      case 'esm2015':
        return new EsmRenderingFormatter(host, bundle.isCore);
      case 'esm5':
        return new Esm5RenderingFormatter(host, bundle.isCore);
      case 'umd':
        if (!(host instanceof UmdReflectionHost)) {
          throw new Error('UmdRenderer requires a UmdReflectionHost');
        }
        return new UmdRenderingFormatter(host, bundle.isCore);
      case 'commonjs':
        return new CommonJsRenderingFormatter(host, bundle.isCore);
      default:
        throw new Error(`Renderer for "${bundle.format}" not yet implemented.`);
    }
  }

  analyzeProgram(reflectionHost: NgccReflectionHost, bundle: EntryPointBundle): ProgramAnalyses {
    const referencesRegistry = new NgccReferencesRegistry(reflectionHost);

    const switchMarkerAnalyzer =
        new SwitchMarkerAnalyzer(reflectionHost, bundle.entryPoint.package);
    const switchMarkerAnalyses = switchMarkerAnalyzer.analyzeProgram(bundle.src.program);

    const decorationAnalyzer =
        new DecorationAnalyzer(this.fs, bundle, reflectionHost, referencesRegistry);
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
}


interface ProgramAnalyses {
  decorationAnalyses: Map<ts.SourceFile, CompiledFile>;
  switchMarkerAnalyses: SwitchMarkerAnalyses;
  privateDeclarationsAnalyses: ExportInfo[];
  moduleWithProvidersAnalyses: ModuleWithProvidersAnalyses|null;
}
