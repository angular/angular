/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';
import {
  absoluteFrom,
  createFileSystemTsReadDirectoryFn,
  getFileSystem,
} from '../src/ngtsc/file_system';
import {replaceTsWithNgInErrors} from './ngtsc/diagnostics';
import * as api from './transformers/api';
import * as ng from './transformers/entry_points';
import {createMessageDiagnostic} from './transformers/util';
const defaultFormatHost = {
  getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
  getCanonicalFileName: (fileName) => fileName,
  getNewLine: () => ts.sys.newLine,
};
export function formatDiagnostics(diags, host = defaultFormatHost) {
  if (diags && diags.length) {
    return diags
      .map((diagnostic) =>
        replaceTsWithNgInErrors(ts.formatDiagnosticsWithColorAndContext([diagnostic], host)),
      )
      .join('');
  } else {
    return '';
  }
}
export function calcProjectFileAndBasePath(project, host = getFileSystem()) {
  const absProject = host.resolve(project);
  const projectIsDir = host.lstat(absProject).isDirectory();
  const projectFile = projectIsDir ? host.join(absProject, 'tsconfig.json') : absProject;
  const projectDir = projectIsDir ? absProject : host.dirname(absProject);
  const basePath = host.resolve(projectDir);
  return {projectFile, basePath};
}
export function readConfiguration(project, existingOptions, host = getFileSystem()) {
  try {
    const fs = getFileSystem();
    const readConfigFile = (configFile) =>
      ts.readConfigFile(configFile, (file) => host.readFile(host.resolve(file)));
    const readAngularCompilerOptions = (configFile, parentOptions = {}) => {
      const {config, error} = readConfigFile(configFile);
      if (error) {
        // Errors are handled later on by 'parseJsonConfigFileContent'
        return parentOptions;
      }
      // Note: In Google, `angularCompilerOptions` are stored in `bazelOptions`.
      // This function typically doesn't run for actual Angular compilations, but
      // tooling like Tsurge, or schematics may leverage this helper, so we account
      // for this here.
      const angularCompilerOptions =
        config.angularCompilerOptions ?? config.bazelOptions?.angularCompilerOptions;
      // we are only interested into merging 'angularCompilerOptions' as
      // other options like 'compilerOptions' are merged by TS
      let existingNgCompilerOptions = {...angularCompilerOptions, ...parentOptions};
      if (!config.extends) {
        return existingNgCompilerOptions;
      }
      const extendsPaths = typeof config.extends === 'string' ? [config.extends] : config.extends;
      // Call readAngularCompilerOptions recursively to merge NG Compiler options
      // Reverse the array so the overrides happen from right to left.
      return [...extendsPaths].reverse().reduce((prevOptions, extendsPath) => {
        const extendedConfigPath = getExtendedConfigPath(configFile, extendsPath, host, fs);
        return extendedConfigPath === null
          ? prevOptions
          : readAngularCompilerOptions(extendedConfigPath, prevOptions);
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
        emitFlags: api.EmitFlags.Default,
      };
    }
    const existingCompilerOptions = {
      genDir: basePath,
      basePath,
      ...readAngularCompilerOptions(configFileName),
      ...existingOptions,
    };
    const parseConfigHost = createParseConfigHost(host, fs);
    const {
      options,
      errors,
      fileNames: rootNames,
      projectReferences,
    } = ts.parseJsonConfigFileContent(
      config,
      parseConfigHost,
      basePath,
      existingCompilerOptions,
      configFileName,
    );
    let emitFlags = api.EmitFlags.Default;
    if (!(options['skipMetadataEmit'] || options['flatModuleOutFile'])) {
      emitFlags |= api.EmitFlags.Metadata;
    }
    if (options['skipTemplateCodegen']) {
      emitFlags = emitFlags & ~api.EmitFlags.Codegen;
    }
    return {project: projectFile, rootNames, projectReferences, options, errors, emitFlags};
  } catch (e) {
    const errors = [
      {
        category: ts.DiagnosticCategory.Error,
        messageText: e.stack ?? e.message,
        file: undefined,
        start: undefined,
        length: undefined,
        source: 'angular',
        code: api.UNKNOWN_ERROR_CODE,
      },
    ];
    return {project: '', errors, rootNames: [], options: {}, emitFlags: api.EmitFlags.Default};
  }
}
function createParseConfigHost(host, fs = getFileSystem()) {
  return {
    fileExists: host.exists.bind(host),
    readDirectory: createFileSystemTsReadDirectoryFn(fs),
    readFile: host.readFile.bind(host),
    useCaseSensitiveFileNames: fs.isCaseSensitive(),
  };
}
function getExtendedConfigPath(configFile, extendsValue, host, fs) {
  const result = getExtendedConfigPathWorker(configFile, extendsValue, host, fs);
  if (result !== null) {
    return result;
  }
  // Try to resolve the paths with a json extension append a json extension to the file in case if
  // it is missing and the resolution failed. This is to replicate TypeScript behaviour, see:
  // https://github.com/microsoft/TypeScript/blob/294a5a7d784a5a95a8048ee990400979a6bc3a1c/src/compiler/commandLineParser.ts#L2806
  return getExtendedConfigPathWorker(configFile, `${extendsValue}.json`, host, fs);
}
function getExtendedConfigPathWorker(configFile, extendsValue, host, fs) {
  if (extendsValue.startsWith('.') || fs.isRooted(extendsValue)) {
    const extendedConfigPath = host.resolve(host.dirname(configFile), extendsValue);
    if (host.exists(extendedConfigPath)) {
      return extendedConfigPath;
    }
  } else {
    const parseConfigHost = createParseConfigHost(host, fs);
    // Path isn't a rooted or relative path, resolve like a module.
    const {resolvedModule} = ts.nodeModuleNameResolver(
      extendsValue,
      configFile,
      {moduleResolution: ts.ModuleResolutionKind.Node10, resolveJsonModule: true},
      parseConfigHost,
    );
    if (resolvedModule) {
      return absoluteFrom(resolvedModule.resolvedFileName);
    }
  }
  return null;
}
export function exitCodeFromResult(diags) {
  if (!diags) return 0;
  if (diags.every((diag) => diag.category !== ts.DiagnosticCategory.Error)) {
    // If we have a result and didn't get any errors, we succeeded.
    return 0;
  }
  // Return 2 if any of the errors were unknown.
  return diags.some((d) => d.source === 'angular' && d.code === api.UNKNOWN_ERROR_CODE) ? 2 : 1;
}
export function performCompilation({
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
  modifiedResourceFiles = null,
}) {
  let program;
  let emitResult;
  let allDiagnostics = [];
  try {
    if (!host) {
      host = ng.createCompilerHost({options});
    }
    if (modifiedResourceFiles) {
      host.getModifiedResourceFiles = () => modifiedResourceFiles;
    }
    program = ng.createProgram({rootNames, host, options, oldProgram});
    const beforeDiags = Date.now();
    allDiagnostics.push(...gatherDiagnostics(program));
    if (options.diagnostics) {
      const afterDiags = Date.now();
      allDiagnostics.push(
        createMessageDiagnostic(`Time for diagnostics: ${afterDiags - beforeDiags}ms.`),
      );
    }
    if (!hasErrors(allDiagnostics)) {
      emitResult = program.emit({
        emitCallback,
        mergeEmitResultsCallback,
        customTransformers,
        emitFlags,
        forceEmit,
      });
      allDiagnostics.push(...emitResult.diagnostics);
      return {diagnostics: allDiagnostics, program, emitResult};
    }
    return {diagnostics: allDiagnostics, program};
  } catch (e) {
    // We might have a program with unknown state, discard it.
    program = undefined;
    allDiagnostics.push({
      category: ts.DiagnosticCategory.Error,
      messageText: e.stack ?? e.message,
      code: api.UNKNOWN_ERROR_CODE,
      file: undefined,
      start: undefined,
      length: undefined,
    });
    return {diagnostics: allDiagnostics, program};
  }
}
export function defaultGatherDiagnostics(program) {
  const allDiagnostics = [];
  function checkDiagnostics(diags) {
    if (diags) {
      allDiagnostics.push(...diags);
      return !hasErrors(diags);
    }
    return true;
  }
  let checkOtherDiagnostics = true;
  // Check parameter diagnostics
  checkOtherDiagnostics =
    checkOtherDiagnostics &&
    checkDiagnostics([...program.getTsOptionDiagnostics(), ...program.getNgOptionDiagnostics()]);
  // Check syntactic diagnostics
  checkOtherDiagnostics =
    checkOtherDiagnostics && checkDiagnostics(program.getTsSyntacticDiagnostics());
  // Check TypeScript semantic and Angular structure diagnostics
  checkOtherDiagnostics =
    checkOtherDiagnostics &&
    checkDiagnostics([
      ...program.getTsSemanticDiagnostics(),
      ...program.getNgStructuralDiagnostics(),
    ]);
  // Check Angular semantic diagnostics
  checkOtherDiagnostics =
    checkOtherDiagnostics && checkDiagnostics(program.getNgSemanticDiagnostics());
  return allDiagnostics;
}
function hasErrors(diags) {
  return diags.some((d) => d.category === ts.DiagnosticCategory.Error);
}
//# sourceMappingURL=perform_compile.js.map
