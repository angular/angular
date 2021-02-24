/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {ParsedConfiguration} from '../../..';
import {ReadonlyFileSystem} from '../../../src/ngtsc/file_system';
import {Logger} from '../../../src/ngtsc/logging';
import {TypeScriptReflectionHost} from '../../../src/ngtsc/reflection';
import {DecorationAnalyzer} from '../analysis/decoration_analyzer';
import {ModuleWithProvidersAnalyses, ModuleWithProvidersAnalyzer} from '../analysis/module_with_providers_analyzer';
import {NgccReferencesRegistry} from '../analysis/ngcc_references_registry';
import {ExportInfo, PrivateDeclarationsAnalyzer} from '../analysis/private_declarations_analyzer';
import {SwitchMarkerAnalyses, SwitchMarkerAnalyzer} from '../analysis/switch_marker_analyzer';
import {CompiledFile} from '../analysis/types';
import {DtsProcessing} from '../execution/tasks/api';
import {CommonJsReflectionHost} from '../host/commonjs_host';
import {DelegatingReflectionHost} from '../host/delegating_host';
import {Esm2015ReflectionHost} from '../host/esm2015_host';
import {Esm5ReflectionHost} from '../host/esm5_host';
import {NgccReflectionHost} from '../host/ngcc_host';
import {UmdReflectionHost} from '../host/umd_host';
import {CommonJsRenderingFormatter} from '../rendering/commonjs_rendering_formatter';
import {DtsRenderer} from '../rendering/dts_renderer';
import {Esm5RenderingFormatter} from '../rendering/esm5_rendering_formatter';
import {EsmRenderingFormatter} from '../rendering/esm_rendering_formatter';
import {Renderer} from '../rendering/renderer';
import {RenderingFormatter} from '../rendering/rendering_formatter';
import {UmdRenderingFormatter} from '../rendering/umd_rendering_formatter';
import {FileToWrite} from '../rendering/utils';

import {EntryPointBundle} from './entry_point_bundle';

export type TransformResult = {
  success: true; diagnostics: ts.Diagnostic[]; transformedFiles: FileToWrite[];
}|{
  success: false;
  diagnostics: ts.Diagnostic[];
};

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
  constructor(
      private fs: ReadonlyFileSystem, private logger: Logger,
      private tsConfig: ParsedConfiguration|null = null) {}

  /**
   * Transform the source (and typings) files of a bundle.
   * @param bundle the bundle to transform.
   * @returns information about the files that were transformed.
   */
  transform(bundle: EntryPointBundle): TransformResult {
    const ngccReflectionHost = this.getHost(bundle);
    const tsReflectionHost = new TypeScriptReflectionHost(bundle.src.program.getTypeChecker());
    const reflectionHost = new DelegatingReflectionHost(tsReflectionHost, ngccReflectionHost);

    // Parse and analyze the files.
    const {
      decorationAnalyses,
      switchMarkerAnalyses,
      privateDeclarationsAnalyses,
      moduleWithProvidersAnalyses,
      diagnostics
    } = this.analyzeProgram(reflectionHost, bundle);

    // Bail if the analysis produced any errors.
    if (hasErrors(diagnostics)) {
      return {success: false, diagnostics};
    }

    // Transform the source files and source maps.
    let renderedFiles: FileToWrite[] = [];

    if (bundle.dtsProcessing !== DtsProcessing.Only) {
      // Render the transformed JavaScript files only if we are not doing "typings-only" processing.
      const srcFormatter = this.getRenderingFormatter(ngccReflectionHost, bundle);
      const renderer =
          new Renderer(reflectionHost, srcFormatter, this.fs, this.logger, bundle, this.tsConfig);
      renderedFiles = renderer.renderProgram(
          decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses);
    }

    if (bundle.dts) {
      const dtsFormatter = new EsmRenderingFormatter(this.fs, reflectionHost, bundle.isCore);
      const dtsRenderer =
          new DtsRenderer(dtsFormatter, this.fs, this.logger, reflectionHost, bundle);
      const renderedDtsFiles = dtsRenderer.renderProgram(
          decorationAnalyses, privateDeclarationsAnalyses, moduleWithProvidersAnalyses);
      renderedFiles = renderedFiles.concat(renderedDtsFiles);
    }

    return {success: true, diagnostics, transformedFiles: renderedFiles};
  }

  getHost(bundle: EntryPointBundle): NgccReflectionHost {
    switch (bundle.format) {
      case 'esm2015':
        return new Esm2015ReflectionHost(this.logger, bundle.isCore, bundle.src, bundle.dts);
      case 'esm5':
        return new Esm5ReflectionHost(this.logger, bundle.isCore, bundle.src, bundle.dts);
      case 'umd':
        return new UmdReflectionHost(this.logger, bundle.isCore, bundle.src, bundle.dts);
      case 'commonjs':
        return new CommonJsReflectionHost(this.logger, bundle.isCore, bundle.src, bundle.dts);
      default:
        throw new Error(`Reflection host for "${bundle.format}" not yet implemented.`);
    }
  }

  getRenderingFormatter(host: NgccReflectionHost, bundle: EntryPointBundle): RenderingFormatter {
    switch (bundle.format) {
      case 'esm2015':
        return new EsmRenderingFormatter(this.fs, host, bundle.isCore);
      case 'esm5':
        return new Esm5RenderingFormatter(this.fs, host, bundle.isCore);
      case 'umd':
        if (!(host instanceof UmdReflectionHost)) {
          throw new Error('UmdRenderer requires a UmdReflectionHost');
        }
        return new UmdRenderingFormatter(this.fs, host, bundle.isCore);
      case 'commonjs':
        return new CommonJsRenderingFormatter(this.fs, host, bundle.isCore);
      default:
        throw new Error(`Renderer for "${bundle.format}" not yet implemented.`);
    }
  }

  analyzeProgram(reflectionHost: NgccReflectionHost, bundle: EntryPointBundle): ProgramAnalyses {
    const referencesRegistry = new NgccReferencesRegistry(reflectionHost);

    const switchMarkerAnalyzer =
        new SwitchMarkerAnalyzer(reflectionHost, bundle.entryPoint.packagePath);
    const switchMarkerAnalyses = switchMarkerAnalyzer.analyzeProgram(bundle.src.program);

    const diagnostics: ts.Diagnostic[] = [];
    const decorationAnalyzer = new DecorationAnalyzer(
        this.fs, bundle, reflectionHost, referencesRegistry,
        diagnostic => diagnostics.push(diagnostic), this.tsConfig);
    const decorationAnalyses = decorationAnalyzer.analyzeProgram();

    const moduleWithProvidersAnalyzer = new ModuleWithProvidersAnalyzer(
        reflectionHost, bundle.src.program.getTypeChecker(), referencesRegistry,
        bundle.dts !== null);
    const moduleWithProvidersAnalyses = moduleWithProvidersAnalyzer &&
        moduleWithProvidersAnalyzer.analyzeProgram(bundle.src.program);

    const privateDeclarationsAnalyzer =
        new PrivateDeclarationsAnalyzer(reflectionHost, referencesRegistry);
    const privateDeclarationsAnalyses =
        privateDeclarationsAnalyzer.analyzeProgram(bundle.src.program);

    return {
      decorationAnalyses,
      switchMarkerAnalyses,
      privateDeclarationsAnalyses,
      moduleWithProvidersAnalyses,
      diagnostics
    };
  }
}

export function hasErrors(diagnostics: ts.Diagnostic[]) {
  return diagnostics.some(d => d.category === ts.DiagnosticCategory.Error);
}

interface ProgramAnalyses {
  decorationAnalyses: Map<ts.SourceFile, CompiledFile>;
  switchMarkerAnalyses: SwitchMarkerAnalyses;
  privateDeclarationsAnalyses: ExportInfo[];
  moduleWithProvidersAnalyses: ModuleWithProvidersAnalyses|null;
  diagnostics: ts.Diagnostic[];
}
