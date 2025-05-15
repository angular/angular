/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TsurgeFunnelMigration, TsurgeMigration} from '../migration';
import {MockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {
  absoluteFrom,
  AbsoluteFsPath,
  getFileSystem,
} from '@angular/compiler-cli/src/ngtsc/file_system';
import {groupReplacementsByFile} from '../helpers/group_replacements';
import {applyTextUpdates} from '../replacement';
import ts from 'typescript';
import {TestRun} from './test_run';

/**
 * Runs the given migration against a fake set of files, emulating
 * migration of a real TypeScript Angular project.
 *
 * Note: This helper does not execute the migration in batch mode, where
 * e.g. the migration runs per single file and merges the unit data.
 *
 * TODO: Add helper/solution to test batch execution, like with Tsunami.
 *
 * @returns a mock file system with the applied replacements of the migration.
 */
export async function runTsurgeMigration<UnitData, GlobalData>(
  migration: TsurgeMigration<UnitData, GlobalData>,
  files: {name: AbsoluteFsPath; contents: string; isProgramRootFile?: boolean}[],
  compilerOptions: ts.CompilerOptions = {},
): Promise<TestRun> {
  const mockFs = getFileSystem();
  if (!(mockFs instanceof MockFileSystem)) {
    throw new Error('Expected a mock file system for `runTsurgeMigration`.');
  }

  for (const file of files) {
    mockFs.ensureDir(mockFs.dirname(file.name));
    mockFs.writeFile(file.name, file.contents);
  }

  const rootFiles = files.filter((f) => f.isProgramRootFile).map((f) => f.name);

  mockFs.writeFile(
    absoluteFrom('/tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        strict: true,
        rootDir: '/',
        ...compilerOptions,
      },
      files: rootFiles,
    }),
  );

  const info = migration.createProgram('/tsconfig.json', mockFs);

  const unitData = await migration.analyze(info);
  const globalMeta = await migration.globalMeta(unitData);
  const {replacements} =
    migration instanceof TsurgeFunnelMigration
      ? await migration.migrate(globalMeta)
      : await migration.migrate(globalMeta, info);

  const updates = groupReplacementsByFile(replacements);
  for (const [rootRelativePath, changes] of updates.entries()) {
    const absolutePath = mockFs.join(info.projectRoot, rootRelativePath);
    mockFs.writeFile(absolutePath, applyTextUpdates(mockFs.readFile(absolutePath), changes));
  }

  return {
    fs: mockFs,
    getStatistics: () => migration.stats(globalMeta),
  };
}
