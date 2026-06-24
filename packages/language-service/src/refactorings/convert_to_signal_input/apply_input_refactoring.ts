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
import {
  getMessageForClassIncompatibility,
  getMessageForFieldIncompatibility,
  FieldIncompatibilityReason,
  KnownInputInfo,
  MigrationConfig,
  nonIgnorableFieldIncompatibilities,
  SignalInputMigration,
} from '@angular/core/schematics/migrations/signal-migration/src';
import {groupReplacementsByFile} from '@angular/core/schematics/utils/tsurge/helpers/group_replacements';
import {getProgramInfoFromBaseInfo} from '@angular/core/schematics/utils/tsurge';
import {ApplyRefactoringProgressFn, ApplyRefactoringResult} from '../../../api';

export async function applySignalInputRefactoring(
  compiler: NgCompiler,
  compilerOptions: CompilerOptions,
  config: MigrationConfig,
  project: ts.server.Project,
  reportProgress: ApplyRefactoringProgressFn,
  shouldMigrateInput: (input: KnownInputInfo) => boolean,
  multiMode: boolean,
): Promise<ApplyRefactoringResult> {
  reportProgress(0, 'Starting input migration. Analyzing..');

  const fs = getFileSystem();
  const migration = new SignalInputMigration({
    ...config,
    upgradeAnalysisPhaseToAvoidBatch: true,
    reportProgressFn: reportProgress,
    shouldMigrateInput: shouldMigrateInput,
  });

  await migration.analyze(
    getProgramInfoFromBaseInfo({
      ngCompiler: compiler,
      program: compiler.getCurrentProgram(),
      userOptions: compilerOptions,
      host: {
        getCanonicalFileName: (file) => project.projectService.toCanonicalFileName(file),
        getCurrentDirectory: () => project.getCurrentDirectory(),
      },
      __programAbsoluteRootFileNames: [],
    }),
  );

  if (migration.upgradedAnalysisPhaseResults === null) {
    return {
      edits: [],
      errorMessage: 'Unexpected error. No analysis result is available.',
    };
  }

  const {knownInputs, replacements, projectRoot} = migration.upgradedAnalysisPhaseResults;
  const targetInputs = Array.from(knownInputs.knownInputIds.values()).filter(shouldMigrateInput);

  if (targetInputs.length === 0) {
    return {
      edits: [],
      errorMessage: 'Unexpected error. Could not find target inputs in registry.',
    };
  }

  const incompatibilityMessages = new Map<string, string>();
  const incompatibilityReasons = new Set<FieldIncompatibilityReason>();

  for (const incompatibleInput of targetInputs.filter((i) => i.isIncompatible())) {
    const {container, descriptor} = incompatibleInput;
    const memberIncompatibility = container.memberIncompatibility.get(descriptor.key);
    const classIncompatibility = container.incompatible;

    if (memberIncompatibility !== undefined) {
      const {short, extra} = getMessageForFieldIncompatibility(memberIncompatibility.reason, {
        single: 'input',
        plural: 'inputs',
      });
      incompatibilityMessages.set(descriptor.node.name.text, `${short}\n${extra}`);
      incompatibilityReasons.add(memberIncompatibility.reason);
      continue;
    }

    if (classIncompatibility !== null) {
      const {short, extra} = getMessageForClassIncompatibility(classIncompatibility, {
        single: 'input',
        plural: 'inputs',
      });
      incompatibilityMessages.set(descriptor.node.name.text, `${short}\n${extra}`);
      continue;
    }

    return {
      edits: [],
      errorMessage:
        'Inputs could not be migrated, but no reasons were found. ' +
        'Consider reporting a bug to the Angular team.',
    };
  }

  let message: string | undefined = undefined;

  if (!multiMode && incompatibilityMessages.size === 1) {
    const [inputName, reason] = incompatibilityMessages.entries().next().value!;
    message = `Input field "${inputName}" could not be migrated. ${reason}\n`;
  } else if (incompatibilityMessages.size > 0) {
    const inputPlural = incompatibilityMessages.size === 1 ? 'input' : `inputs`;
    message = `${incompatibilityMessages.size} ${inputPlural} could not be migrated.\n`;
    message += `For more details, click on the skipped inputs and try to migrate individually.\n`;
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
      fileName: fs.join(projectRoot, relativePath),
      textChanges: changes.map((c) => ({
        newText: c.data.toInsert,
        span: {
          start: c.data.position,
          length: c.data.end - c.data.position,
        },
      })),
    };
  });

  const allInputsIncompatible = incompatibilityMessages.size === targetInputs.length;

  // Depending on whether all inputs were incompatible, the message is either
  // an error, or just a warning (in case of partial migration still succeeding).
  const errorMessage = allInputsIncompatible ? message : undefined;
  const warningMessage = allInputsIncompatible ? undefined : message;

  return {edits, warningMessage, errorMessage};
}
