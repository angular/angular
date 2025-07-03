/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgCompilerOptions, UnifiedModulesHost} from '@angular/compiler-cli/src/ngtsc/core/api';
import {
  absoluteFrom,
  FileSystem,
  NgtscCompilerHost,
  setFileSystem,
} from '@angular/compiler-cli/src/ngtsc/file_system';
import {isShim} from '@angular/compiler-cli/src/ngtsc/shims';
import {getRootDirs} from '@angular/compiler-cli/src/ngtsc/util/src/typescript';
import {BaseProgramInfo, ProgramInfo} from '../program_info';
import {google3UsePlainTsProgramIfNoKnownAngularOption, isGoogle3} from './google3/detection';
import {createNgtscProgram} from './ngtsc_program';
import {parseTsconfigOrDie} from './ts_parse_config';
import {createPlainTsProgram} from './ts_program';
import {fileNameToModuleNameFactory} from './google3/unified_module_resolution';

/** Creates the base program info for the given tsconfig path. */
export function createBaseProgramInfo(
  absoluteTsconfigPath: string,
  fs: FileSystem,
  optionOverrides: NgCompilerOptions = {},
): BaseProgramInfo {
  // Make sure the FS becomes globally available. Some code paths
  // of the Angular compiler, or tsconfig parsing aren't leveraging
  // the specified file system.
  setFileSystem(fs);

  const tsconfig = parseTsconfigOrDie(absoluteTsconfigPath, fs);
  const tsHost = new NgtscCompilerHost(fs, tsconfig.options);

  // When enabled, use a plain TS program if we are sure it's not
  // an Angular project based on the `tsconfig.json`.
  if (
    google3UsePlainTsProgramIfNoKnownAngularOption() &&
    tsconfig.options['_useHostForImportGeneration'] === undefined
  ) {
    return createPlainTsProgram(tsHost, tsconfig, optionOverrides);
  }

  // The Angular program may try to emit references during analysis or migration.
  // To replicate the Google3 import emission here, ensure the unified module resolution
  // can be enabled by the compiler.
  if (isGoogle3() && tsconfig.options.rootDirs) {
    (tsHost as Partial<UnifiedModulesHost>).fileNameToModuleName = fileNameToModuleNameFactory(
      tsconfig.options.rootDirs,
      /* workspaceName*/ 'google3',
    );
  }

  return createNgtscProgram(tsHost, tsconfig, optionOverrides);
}

/**
 * Creates the {@link ProgramInfo} from the given base information.
 *
 * This function purely exists to support custom programs that are
 * intended to be injected into Tsurge migrations. e.g. for language
 * service refactorings.
 */
export function getProgramInfoFromBaseInfo(baseInfo: BaseProgramInfo): ProgramInfo {
  const fullProgramSourceFiles = [...baseInfo.program.getSourceFiles()];
  const sourceFiles = fullProgramSourceFiles.filter(
    (f) =>
      !f.isDeclarationFile &&
      // Note `isShim` will work for the initial program, but for TCB programs, the shims are no longer annotated.
      !isShim(f) &&
      !f.fileName.endsWith('.ngtypecheck.ts'),
  );

  // Sort it by length in reverse order (longest first). This speeds up lookups,
  // since there's no need to keep going through the array once a match is found.
  const sortedRootDirs = getRootDirs(baseInfo.host, baseInfo.userOptions).sort(
    (a, b) => b.length - a.length,
  );

  // TODO: Consider also following TS's logic here, finding the common source root.
  // See: Program#getCommonSourceDirectory.
  const primaryRoot = absoluteFrom(
    baseInfo.userOptions.rootDir ?? sortedRootDirs.at(-1) ?? baseInfo.program.getCurrentDirectory(),
  );

  return {
    ...baseInfo,
    sourceFiles,
    fullProgramSourceFiles,
    sortedRootDirs,
    projectRoot: primaryRoot,
  };
}
