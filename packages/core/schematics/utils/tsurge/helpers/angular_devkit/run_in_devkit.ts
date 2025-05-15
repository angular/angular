/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FileSystem, setFileSystem} from '@angular/compiler-cli';
import {SchematicsException, Tree} from '@angular-devkit/schematics';
import {DevkitMigrationFilesystem} from './devkit_filesystem';
import {groupReplacementsByFile} from '../group_replacements';
import {synchronouslyCombineUnitData} from '../combine_units';
import {TsurgeFunnelMigration, TsurgeMigration} from '../../migration';
import {Replacement, TextUpdate} from '../../replacement';
import {ProjectRootRelativePath} from '../../project_paths';
import {ProgramInfo} from '../../program_info';
import {getProjectTsConfigPaths} from '../../../../utils/project_tsconfig_paths';
import ts from 'typescript';

export enum MigrationStage {
  /** The migration is analyzing an entrypoint */
  Analysis,

  /** The migration is about to migrate an entrypoint */
  Migrate,
}

/** Information necessary to run a Tsurge migration in the devkit. */
export interface TsurgeDevkitMigration {
  /** Instantiates the migration. */
  getMigration: (fs: FileSystem) => TsurgeMigration<unknown, unknown>;

  /** File tree of the schematic. */
  tree: Tree;

  /** Called before a program is created. Useful to notify the user before processing starts. */
  beforeProgramCreation?: (tsconfigPath: string, stage: MigrationStage) => void;

  /**
   * Called after a program is created. Useful when the
   * structure needs to be modified (e.g. filtering files).
   */
  afterProgramCreation?: (info: ProgramInfo, fileSystem: FileSystem, stage: MigrationStage) => void;

  /** Called before a unit is analyzed. Useful for logging. */
  beforeUnitAnalysis?: (tsconfigPath: string) => void;

  /** Called after all units are analyzed. Useful for logging. */
  afterAllAnalyzed?: () => void;

  /** Called if analysis has failed. Useful for logging. */
  afterAnalysisFailure?: () => void;

  /** Called when the migration is done running and stats are available. Useful for logging. */
  whenDone?: (stats: MigrationStats) => void;
}

/** Runs a Tsurge within an Angular Devkit context. */
export async function runMigrationInDevkit(config: TsurgeDevkitMigration): Promise<void> {
  const {buildPaths, testPaths} = await getProjectTsConfigPaths(config.tree);

  if (!buildPaths.length && !testPaths.length) {
    throw new SchematicsException('Could not find any tsconfig file. Cannot run the migration.');
  }
  const tsconfigPaths = [...buildPaths, ...testPaths];

  const fs = new DevkitMigrationFilesystem(config.tree);
  setFileSystem(fs);

  const migration = config.getMigration(fs);
  const unitResults: unknown[] = [];

  const isFunnelMigration = migration instanceof TsurgeFunnelMigration;
  const compilationUnitAssignments = new Map<string, string>();

  for (const tsconfigPath of tsconfigPaths) {
    config.beforeProgramCreation?.(tsconfigPath, MigrationStage.Analysis);
    const info = migration.createProgram(tsconfigPath, fs);

    modifyProgramInfoToEnsureNonOverlappingFiles(tsconfigPath, info, compilationUnitAssignments);

    config.afterProgramCreation?.(info, fs, MigrationStage.Analysis);
    config.beforeUnitAnalysis?.(tsconfigPath);

    unitResults.push(await migration.analyze(info));
  }

  config.afterAllAnalyzed?.();

  const combined = await synchronouslyCombineUnitData(migration, unitResults);
  if (combined === null) {
    config.afterAnalysisFailure?.();
    return;
  }

  const globalMeta = await migration.globalMeta(combined);
  let replacements: Replacement[];

  if (isFunnelMigration) {
    replacements = (await migration.migrate(globalMeta)).replacements;
  } else {
    replacements = [];

    for (const tsconfigPath of tsconfigPaths) {
      config.beforeProgramCreation?.(tsconfigPath, MigrationStage.Migrate);
      const info = migration.createProgram(tsconfigPath, fs);
      modifyProgramInfoToEnsureNonOverlappingFiles(tsconfigPath, info, compilationUnitAssignments);

      config.afterProgramCreation?.(info, fs, MigrationStage.Migrate);

      const result = await migration.migrate(globalMeta, info);
      replacements.push(...result.replacements);
    }
  }

  const replacementsPerFile: Map<ProjectRootRelativePath, TextUpdate[]> = new Map();
  const changesPerFile = groupReplacementsByFile(replacements);

  for (const [file, changes] of changesPerFile) {
    if (!replacementsPerFile.has(file)) {
      replacementsPerFile.set(file, changes);
    }
  }

  for (const [file, changes] of replacementsPerFile) {
    const recorder = config.tree.beginUpdate(file);
    for (const c of changes) {
      recorder
        .remove(c.data.position, c.data.end - c.data.position)
        .insertRight(c.data.position, c.data.toInsert);
    }
    config.tree.commitUpdate(recorder);
  }

  config.whenDone?.(await migration.stats(globalMeta));
}

/**
 * Special logic for devkit migrations. In the Angular CLI, or in 3P precisely,
 * projects can have tsconfigs with overlapping source files. i.e. two tsconfigs
 * like e.g. build or test include the same `ts.SourceFile` (`.ts`). Migrations
 * should never have 2+ compilation units with overlapping source files as this
 * can result in duplicated replacements or analysis— hence we only ever assign a
 * source file to a compilation unit *once*.
 *
 * Note that this is fine as we expect Tsurge migrations to work together as
 * isolated compilation units— so it shouldn't matter if worst case a `.ts`
 * file ends up in the e.g. test program.
 */
function modifyProgramInfoToEnsureNonOverlappingFiles(
  tsconfigPath: string,
  info: ProgramInfo,
  compilationUnitAssignments: Map<string, string>,
) {
  const sourceFiles: ts.SourceFile[] = [];

  for (const sf of info.sourceFiles) {
    const assignment = compilationUnitAssignments.get(sf.fileName);

    // File is already assigned to a different compilation unit.
    if (assignment !== undefined && assignment !== tsconfigPath) {
      continue;
    }

    compilationUnitAssignments.set(sf.fileName, tsconfigPath);
    sourceFiles.push(sf);
  }

  info.sourceFiles = sourceFiles;
}
