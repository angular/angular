/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CompilerOptions} from '@angular/compiler-cli';
import {getFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import ts from 'typescript';
import {groupReplacementsByFile} from '@angular/core/schematics/utils/tsurge/helpers/group_replacements';
import {ApplyRefactoringProgressFn, ApplyRefactoringResult} from '../../../api';
import {
  MigrationConfig,
  SignalQueriesMigration,
} from '@angular/core/schematics/migrations/signal-queries-migration';
import assert from 'assert';
import {projectFile, getProgramInfoFromBaseInfo} from '../../../../core/schematics/utils/tsurge';
import {FieldIncompatibilityReason} from '../../../../core/schematics/migrations/signal-migration/src';
import {
  isFieldIncompatibility,
  nonIgnorableFieldIncompatibilities,
} from '../../../../core/schematics/migrations/signal-migration/src/passes/problematic_patterns/incompatibility';

export async function applySignalQueriesRefactoring(
  compiler: NgCompiler,
  compilerOptions: CompilerOptions,
  config: MigrationConfig,
  project: ts.server.Project,
  reportProgress: ApplyRefactoringProgressFn,
  shouldMigrateQuery: NonNullable<MigrationConfig['shouldMigrateQuery']>,
  multiMode: boolean,
): Promise<ApplyRefactoringResult> {
  reportProgress(0, 'Starting queries migration. Analyzing..');

  const fs = getFileSystem();
  const migration = new SignalQueriesMigration({
    ...config,
    assumeNonBatch: true,
    reportProgressFn: reportProgress,
    shouldMigrateQuery,
  });

  const programInfo = getProgramInfoFromBaseInfo({
    ngCompiler: compiler,
    program: compiler.getCurrentProgram(),
    userOptions: compilerOptions,
    host: {
      getCanonicalFileName: (file) => project.projectService.toCanonicalFileName(file),
      getCurrentDirectory: () => project.getCurrentDirectory(),
    },
    __programAbsoluteRootFileNames: [],
  });

  const unitData = await migration.analyze(programInfo);
  const globalMeta = await migration.globalMeta(unitData);
  const {replacements, knownQueries} = await migration.migrate(globalMeta, programInfo);

  const targetQueries = Array.from(knownQueries.knownQueryIDs.values()).filter((descriptor) =>
    shouldMigrateQuery(descriptor, projectFile(descriptor.node.getSourceFile(), programInfo)),
  );

  if (targetQueries.length === 0) {
    return {
      edits: [],
      errorMessage: 'Unexpected error. Could not find target queries in registry.',
    };
  }

  const incompatibilityMessages = new Map<string, string>();
  const incompatibilityReasons = new Set<FieldIncompatibilityReason>();

  for (const query of targetQueries.filter((i) => knownQueries.isFieldIncompatible(i))) {
    // TODO: Improve type safety around this.
    assert(
      query.node.name !== undefined && ts.isIdentifier(query.node.name),
      'Expected query to have an analyzable field name.',
    );

    const incompatibility = knownQueries.getIncompatibilityForField(query);
    const text = knownQueries.getIncompatibilityTextForField(query);
    if (incompatibility === null || text === null) {
      return {
        edits: [],
        errorMessage:
          'Queries could not be migrated, but no reasons were found. ' +
          'Consider reporting a bug to the Angular team.',
      };
    }

    incompatibilityMessages.set(query.node.name.text, `${text.short}\n${text.extra}`);

    // Track field incompatibilities as those may be "ignored" via best effort mode.
    if (isFieldIncompatibility(incompatibility)) {
      incompatibilityReasons.add(incompatibility.reason);
    }
  }

  let message: string | undefined = undefined;

  if (!multiMode && incompatibilityMessages.size === 1) {
    const [fieldName, reason] = incompatibilityMessages.entries().next().value!;
    message = `Query field "${fieldName}" could not be migrated. ${reason}\n`;
  } else if (incompatibilityMessages.size > 0) {
    const queryPlural = incompatibilityMessages.size === 1 ? 'query' : `queries`;
    message = `${incompatibilityMessages.size} ${queryPlural} could not be migrated.\n`;
    message += `For more details, click on the skipped queries and try to migrate individually.\n`;
  }

  // Only suggest the "force ignoring" option if there are actually
  // ignorable incompatibilities.
  const canBeForciblyIgnored = Array.from(incompatibilityReasons).some(
    (r) => !nonIgnorableFieldIncompatibilities.includes(r),
  );
  if (!config.bestEffortMode && canBeForciblyIgnored) {
    message += `Use the "(forcibly, ignoring errors)" action to forcibly convert.\n`;
  }

  // In multi mode, partial migration is allowed.
  if (!multiMode && incompatibilityMessages.size > 0) {
    return {
      edits: [],
      errorMessage: message,
    };
  }

  const fileUpdates = Array.from(groupReplacementsByFile(replacements).entries());
  const edits: ts.FileTextChanges[] = fileUpdates.map(([relativePath, changes]) => {
    return {
      fileName: fs.join(programInfo.projectRoot, relativePath),
      textChanges: changes.map((c) => ({
        newText: c.data.toInsert,
        span: {
          start: c.data.position,
          length: c.data.end - c.data.position,
        },
      })),
    };
  });

  const allQueriesIncompatible = incompatibilityMessages.size === targetQueries.length;

  // Depending on whether all queries were incompatible, the message is either
  // an error, or just a warning (in case of partial migration still succeeding).
  const errorMessage = allQueriesIncompatible ? message : undefined;
  const warningMessage = allQueriesIncompatible ? undefined : message;

  return {edits, warningMessage, errorMessage};
}
