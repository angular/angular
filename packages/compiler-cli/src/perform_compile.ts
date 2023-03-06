/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {absoluteFrom, AbsoluteFsPath, FileSystem, getFileSystem, ReadonlyFileSystem, relative, resolve} from '../src/ngtsc/file_system';

import {NgCompilerOptions} from './ngtsc/core/api';
import {replaceTsWithNgInErrors} from './ngtsc/diagnostics';
import * as api from './transformers/api';
import * as ng from './transformers/entry_points';
import {createMessageDiagnostic} from './transformers/util';

const defaultFormatHost: ts.FormatDiagnosticsHost = {
  getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
  getCanonicalFileName: fileName => fileName,
  getNewLine: () => ts.sys.newLine
};

export function formatDiagnostics(
    diags: ReadonlyArray<ts.Diagnostic>,
    host: ts.FormatDiagnosticsHost = defaultFormatHost): string {
  if (diags && diags.length) {
    return diags
        .map(
            diagnostic => replaceTsWithNgInErrors(
                ts.formatDiagnosticsWithColorAndContext([diagnostic], host)))
        .join('');
  } else {
    return '';
  }
}

/** Used to read configuration files. */
export type ConfigurationHost = Pick<
    ReadonlyFileSystem, 'readFile'|'exists'|'lstat'|'resolve'|'join'|'dirname'|'extname'|'pwd'>;

export interface ParsedConfiguration {
  project: string;
  options: api.CompilerOptions;
  rootNames: string[];
  projectReferences?: readonly ts.ProjectReference[]|undefined;
  emitFlags: api.EmitFlags;
  errors: ts.Diagnostic[];
}

export function calcProjectFileAndBasePath(
    project: string, host: ConfigurationHost = getFileSystem()):
    {projectFile: AbsoluteFsPath, basePath: AbsoluteFsPath} {
  const absProject = host.resolve(project);
  const projectIsDir = host.lstat(absProject).isDirectory();
  const projectFile = projectIsDir ? host.join(absProject, 'tsconfig.json') : absProject;
  const projectDir = projectIsDir ? absProject : host.dirname(absProject);
  const basePath = host.resolve(projectDir);

  return {projectFile, basePath};
}

export function readConfiguration(
    project: string, existingOptions?: api.CompilerOptions,
    host: ConfigurationHost = getFileSystem()): ParsedConfiguration {
  try {
    const fs = getFileSystem();

    const readConfigFile = (configFile: string) =>
        ts.readConfigFile(configFile, file => host.readFile(host.resolve(file)));
    const readAngularCompilerOptions =
        (configFile: string, parentOptions: NgCompilerOptions = {}): NgCompilerOptions => {
          const {config, error} = readConfigFile(configFile);

          if (error) {
            // Errors are handled later on by 'parseJsonConfigFileContent'
            return parentOptions;
          }

          // we are only interested into merging 'angularCompilerOptions' as
          // other options like 'compilerOptions' are merged by TS
          let existingNgCompilerOptions = {...config.angularCompilerOptions, ...parentOptions};
          if (!config.extends) {
            return existingNgCompilerOptions;
          }

          const extendsPaths: string[] =
              typeof config.extends === 'string' ? [config.extends] : config.extends;

          // Call readAngularCompilerOptions recursively to merge NG Compiler options
          // Reverse the array so the overrides happen from right to left.
          return [...extendsPaths].reverse().reduce((prevOptions, extendsPath) => {
            const extendedConfigPath = getExtendedConfigPath(
                configFile,
                extendsPath,
                host,
                fs,
            );

            return extendedConfigPath === null ?
                prevOptions :
                readAngularCompilerOptions(extendedConfigPath, prevOptions);
          }, existingNgCompilerOptions);
        };

    const {projectFile, basePath} = calcProjectFileAndBasePath(project, host);
    const configFileName = host.resolve(host.pwd(), projectFile);
    const {config, error} = readConfigFile(projectFile);

    if (error) {
      return {
        project,
        errors: [error],
        rootNames: [],
        options: {},
        emitFlags: api.EmitFlags.Default
      };
    }

    const existingCompilerOptions: api.CompilerOptions = {
      genDir: basePath,
      basePath,
      ...readAngularCompilerOptions(configFileName),
      ...existingOptions,
    };

    const parseConfigHost = createParseConfigHost(host, fs);
    const {options, errors, fileNames: rootNames, projectReferences} =
        ts.parseJsonConfigFileContent(
            config, parseConfigHost, basePath, existingCompilerOptions, configFileName);

    let emitFlags = api.EmitFlags.Default;
    if (!(options.skipMetadataEmit || options.flatModuleOutFile)) {
      emitFlags |= api.EmitFlags.Metadata;
    }
    if (options.skipTemplateCodegen) {
      emitFlags = emitFlags & ~api.EmitFlags.Codegen;
    }
    return {project: projectFile, rootNames, projectReferences, options, errors, emitFlags};
  } catch (e) {
    const errors: ts.Diagnostic[] = [{
      category: ts.DiagnosticCategory.Error,
      messageText: (e as Error).stack ?? (e as Error).message,
      file: undefined,
      start: undefined,
      length: undefined,
      source: 'angular',
      code: api.UNKNOWN_ERROR_CODE,
    }];
    return {project: '', errors, rootNames: [], options: {}, emitFlags: api.EmitFlags.Default};
  }
}

function createParseConfigHost(host: ConfigurationHost, fs = getFileSystem()): ts.ParseConfigHost {
  return {
    fileExists: host.exists.bind(host),
    readDirectory: ts.sys.readDirectory,
    readFile: host.readFile.bind(host),
    useCaseSensitiveFileNames: fs.isCaseSensitive(),
  };
}

function getExtendedConfigPath(
    configFile: string, extendsValue: string, host: ConfigurationHost,
    fs: FileSystem): AbsoluteFsPath|null {
  const result = getExtendedConfigPathWorker(configFile, extendsValue, host, fs);
  if (result !== null) {
    return result;
  }

  // Try to resolve the paths with a json extension append a json extension to the file in case if
  // it is missing and the resolution failed. This is to replicate TypeScript behaviour, see:
  // https://github.com/microsoft/TypeScript/blob/294a5a7d784a5a95a8048ee990400979a6bc3a1c/src/compiler/commandLineParser.ts#L2806
  return getExtendedConfigPathWorker(configFile, `${extendsValue}.json`, host, fs);
}

function getExtendedConfigPathWorker(
    configFile: string, extendsValue: string, host: ConfigurationHost,
    fs: FileSystem): AbsoluteFsPath|null {
  if (extendsValue.startsWith('.') || fs.isRooted(extendsValue)) {
    const extendedConfigPath = host.resolve(host.dirname(configFile), extendsValue);
    if (host.exists(extendedConfigPath)) {
      return extendedConfigPath;
    }
  } else {
    const parseConfigHost = createParseConfigHost(host, fs);

    // Path isn't a rooted or relative path, resolve like a module.
    const {
      resolvedModule,
    } =
        ts.nodeModuleNameResolver(
            extendsValue, configFile,
            // TODO(crisbeto): the `moduleResolution` should be ts.ModuleResolutionKind.Node10, but
            // it is temporarily hardcoded to the raw value while we're on TS 4.9 internally where
            // the key is called `NodeJs`. The hardcoded value should be removed once the internal
            // monorepo is on TS 5.0.
            {moduleResolution: 2, resolveJsonModule: true}, parseConfigHost);
    if (resolvedModule) {
      return absoluteFrom(resolvedModule.resolvedFileName);
    }
  }

  return null;
}

export interface PerformCompilationResult {
  diagnostics: ReadonlyArray<ts.Diagnostic>;
  program?: api.Program;
  emitResult?: ts.EmitResult;
}

export function exitCodeFromResult(diags: ReadonlyArray<ts.Diagnostic>|undefined): number {
  if (!diags) return 0;
  if (diags.every((diag) => diag.category !== ts.DiagnosticCategory.Error)) {
    // If we have a result and didn't get any errors, we succeeded.
    return 0;
  }

  // Return 2 if any of the errors were unknown.
  return diags.some(d => d.source === 'angular' && d.code === api.UNKNOWN_ERROR_CODE) ? 2 : 1;
}

export function performCompilation<CbEmitRes extends ts.EmitResult = ts.EmitResult>({
  rootNames,
  options,
  host,
  oldProgram,
  emitCallback,
  mergeEmitResultsCallback,
  gatherDiagnostics = defaultGatherDiagnostics,
  customTransformers,
  emitFlags = api.EmitFlags.Default,
  forceEmit = false,
  modifiedResourceFiles = null
}: {
  rootNames: string[],
  options: api.CompilerOptions,
  host?: api.CompilerHost,
  oldProgram?: api.Program,
  emitCallback?: api.TsEmitCallback<CbEmitRes>,
  mergeEmitResultsCallback?: api.TsMergeEmitResultsCallback<CbEmitRes>,
  gatherDiagnostics?: (program: api.Program) => ReadonlyArray<ts.Diagnostic>,
  customTransformers?: api.CustomTransformers,
  emitFlags?: api.EmitFlags,
  forceEmit?: boolean,
  modifiedResourceFiles?: Set<string>| null,
}): PerformCompilationResult {
  let program: api.Program|undefined;
  let emitResult: ts.EmitResult|undefined;
  let allDiagnostics: Array<ts.Diagnostic> = [];
  try {
    if (!host) {
      host = ng.createCompilerHost({options});
    }
    if (modifiedResourceFiles) {
      host.getModifiedResourceFiles = () => modifiedResourceFiles;
    }

    program = ng.createProgram({rootNames, host, options, oldProgram});

    const beforeDiags = Date.now();
    allDiagnostics.push(...gatherDiagnostics(program!));
    if (options.diagnostics) {
      const afterDiags = Date.now();
      allDiagnostics.push(
          createMessageDiagnostic(`Time for diagnostics: ${afterDiags - beforeDiags}ms.`));
    }

    if (!hasErrors(allDiagnostics)) {
      emitResult = program!.emit(
          {emitCallback, mergeEmitResultsCallback, customTransformers, emitFlags, forceEmit});
      allDiagnostics.push(...emitResult.diagnostics);
      return {diagnostics: allDiagnostics, program, emitResult};
    }
    return {diagnostics: allDiagnostics, program};
  } catch (e) {
    // We might have a program with unknown state, discard it.
    program = undefined;
    allDiagnostics.push({
      category: ts.DiagnosticCategory.Error,
      messageText: (e as Error).stack ?? (e as Error).message,
      code: api.UNKNOWN_ERROR_CODE,
      file: undefined,
      start: undefined,
      length: undefined,
    });
    return {diagnostics: allDiagnostics, program};
  }
}
export function defaultGatherDiagnostics(program: api.Program): ReadonlyArray<ts.Diagnostic> {
  const allDiagnostics: Array<ts.Diagnostic> = [];

  function checkDiagnostics(diags: ReadonlyArray<ts.Diagnostic>|undefined) {
    if (diags) {
      allDiagnostics.push(...diags);
      return !hasErrors(diags);
    }
    return true;
  }

  let checkOtherDiagnostics = true;
  // Check parameter diagnostics
  checkOtherDiagnostics = checkOtherDiagnostics &&
      checkDiagnostics([...program.getTsOptionDiagnostics(), ...program.getNgOptionDiagnostics()]);

  // Check syntactic diagnostics
  checkOtherDiagnostics =
      checkOtherDiagnostics && checkDiagnostics(program.getTsSyntacticDiagnostics());

  // Check TypeScript semantic and Angular structure diagnostics
  checkOtherDiagnostics =
      checkOtherDiagnostics &&
      checkDiagnostics(
          [...program.getTsSemanticDiagnostics(), ...program.getNgStructuralDiagnostics()]);

  // Check Angular semantic diagnostics
  checkOtherDiagnostics =
      checkOtherDiagnostics && checkDiagnostics(program.getNgSemanticDiagnostics());

  return allDiagnostics;
}

function hasErrors(diags: ReadonlyArray<ts.Diagnostic>) {
  return diags.some(d => d.category === ts.DiagnosticCategory.Error);
}
