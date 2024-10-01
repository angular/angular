/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AbsoluteFsPath, FileSystem} from '@angular/compiler-cli/src/ngtsc/file_system';
import {confirmAsSerializable, Serializable} from '../../../utils/tsurge/helpers/serializable';
import {BaseProgramInfo, ProgramInfo} from '../../../utils/tsurge/program_info';
import {TsurgeComplexMigration} from '../../../utils/tsurge/migration';
import {CompilationUnitData} from './batch/unit_data';
import {KnownInputs} from './input_detection/known_inputs';
import {AnalysisProgramInfo, prepareAnalysisInfo} from './analysis_deps';
import {MigrationResult} from './result';
import {MigrationHost} from './migration_host';
import {executeAnalysisPhase} from './phase_analysis';
import {pass4__checkInheritanceOfInputs} from './passes/4_check_inheritance';
import {getCompilationUnitMetadata} from './batch/extract';
import {mergeCompilationUnitData} from './batch/merge_unit_data';
import {Replacement} from '../../../utils/tsurge/replacement';
import {populateKnownInputsFromGlobalData} from './batch/populate_global_data';
import {executeMigrationPhase} from './phase_migrate';
import {filterIncompatibilitiesForBestEffortMode} from './best_effort_mode';
import assert from 'assert';
import {
  ClassIncompatibilityReason,
  InputIncompatibilityReason,
} from './input_detection/incompatibility';
import {isInputDescriptor} from './utils/input_id';
import {MigrationConfig} from './migration_config';
import {ClassFieldUniqueKey} from './passes/reference_resolution/known_fields';
import {MigrationStats} from '../../../utils/tsurge';
import {createNgtscProgram} from '../../../utils/tsurge/helpers/ngtsc_program';

/**
 * Tsurge migration for migrating Angular `@Input()` declarations to
 * signal inputs, with support for batch execution.
 */
export class SignalInputMigration extends TsurgeComplexMigration<
  CompilationUnitData,
  CompilationUnitData
> {
  upgradedAnalysisPhaseResults: {
    replacements: Replacement[];
    projectRoot: AbsoluteFsPath;
    knownInputs: KnownInputs;
  } | null = null;

  constructor(private readonly config: MigrationConfig = {}) {
    super();
  }

  // Override the default ngtsc program creation, to add extra flags.
  override createProgram(tsconfigAbsPath: string, fs?: FileSystem): BaseProgramInfo {
    return createNgtscProgram(tsconfigAbsPath, fs, {
      _compilePoisonedComponents: true,
      // We want to migrate non-exported classes too.
      compileNonExportedClasses: true,
      // Always generate as much TCB code as possible.
      // This allows us to check references in templates as much as possible.
      // Note that this may yield more diagnostics, but we are not collecting these anyway.
      strictTemplates: true,
    });
  }

  override prepareProgram(baseInfo: BaseProgramInfo): ProgramInfo {
    const info = super.prepareProgram(baseInfo);
    // Optional filter for testing. Allows for simulation of parallel execution
    // even if some tsconfig's have overlap due to sharing of TS sources.
    // (this is commonly not the case in g3 where deps are `.d.ts` files).
    const limitToRootNamesOnly = process.env['LIMIT_TO_ROOT_NAMES_ONLY'] === '1';
    const filteredSourceFiles = info.sourceFiles.filter(
      (f) =>
        // Optional replacement filter. Allows parallel execution in case
        // some tsconfig's have overlap due to sharing of TS sources.
        // (this is commonly not the case in g3 where deps are `.d.ts` files).
        !limitToRootNamesOnly || info.programAbsoluteRootFileNames!.includes(f.fileName),
    );

    return {
      ...info,
      sourceFiles: filteredSourceFiles,
    };
  }

  // Extend the program info with the analysis information we need in every phase.
  prepareAnalysisDeps(info: ProgramInfo): AnalysisProgramInfo {
    assert(info.ngCompiler !== null, 'Expected `NgCompiler` to be configured.');
    const analysisInfo = {
      ...info,
      ...prepareAnalysisInfo(info.program, info.ngCompiler, info.programAbsoluteRootFileNames),
    };
    return analysisInfo;
  }

  override async analyze(info: ProgramInfo) {
    const analysisDeps = this.prepareAnalysisDeps(info);
    const knownInputs = new KnownInputs(info, this.config);
    const result = new MigrationResult();
    const host = createMigrationHost(info, this.config);

    this.config.reportProgressFn?.(10, 'Analyzing project (input usages)..');
    const {inheritanceGraph} = executeAnalysisPhase(host, knownInputs, result, analysisDeps);

    // Mark filtered inputs before checking inheritance. This ensures filtered
    // inputs properly influence e.g. inherited or derived inputs that now wouldn't
    // be safe either (BUT can still be skipped via best effort mode later).
    filterInputsViaConfig(result, knownInputs, this.config);

    // Analyze inheritance, track edges etc. and later propagate incompatibilities in
    // the merge stage.
    this.config.reportProgressFn?.(40, 'Checking inheritance..');
    pass4__checkInheritanceOfInputs(inheritanceGraph, analysisDeps.metaRegistry, knownInputs);

    // Filter best effort incompatibilities, so that the new filtered ones can
    // be accordingly respected in the merge phase.
    if (this.config.bestEffortMode) {
      filterIncompatibilitiesForBestEffortMode(knownInputs);
    }

    const unitData = getCompilationUnitMetadata(knownInputs);

    // Non-batch mode!
    if (this.config.upgradeAnalysisPhaseToAvoidBatch) {
      const merged = await this.merge([unitData]);
      const replacements = await this.migrate(merged, info, {
        knownInputs,
        result,
        host,
        analysisDeps,
      });
      this.config.reportProgressFn?.(100, 'Completed migration.');

      // Expose the upgraded analysis stage results.
      this.upgradedAnalysisPhaseResults = {
        replacements,
        projectRoot: info.projectRoot,
        knownInputs,
      };
    }
    return confirmAsSerializable(unitData);
  }

  override async merge(units: CompilationUnitData[]): Promise<Serializable<CompilationUnitData>> {
    return confirmAsSerializable(mergeCompilationUnitData(units));
  }

  override async migrate(
    globalMetadata: CompilationUnitData,
    info: ProgramInfo,
    nonBatchData?: {
      knownInputs: KnownInputs;
      result: MigrationResult;
      host: MigrationHost;
      analysisDeps: AnalysisProgramInfo;
    },
  ): Promise<Replacement[]> {
    const knownInputs = nonBatchData?.knownInputs ?? new KnownInputs(info, this.config);
    const result = nonBatchData?.result ?? new MigrationResult();
    const host = nonBatchData?.host ?? createMigrationHost(info, this.config);
    const analysisDeps = nonBatchData?.analysisDeps ?? this.prepareAnalysisDeps(info);

    // Can't re-use analysis structures, so re-build them.
    if (nonBatchData === undefined) {
      executeAnalysisPhase(host, knownInputs, result, analysisDeps);
    }

    // Incorporate global metadata into known inputs.
    populateKnownInputsFromGlobalData(knownInputs, globalMetadata);

    if (this.config.bestEffortMode) {
      filterIncompatibilitiesForBestEffortMode(knownInputs);
    }

    this.config.reportProgressFn?.(60, 'Collecting migration changes..');
    executeMigrationPhase(host, knownInputs, result, analysisDeps);

    return result.replacements;
  }

  override async stats(globalMetadata: CompilationUnitData) {
    let fullCompilationInputs = 0;
    let sourceInputs = 0;
    let incompatibleInputs = 0;
    const fieldIncompatibleCounts: Partial<
      Record<`input-field-incompatibility-${string}`, number>
    > = {};
    const classIncompatibleCounts: Partial<
      Record<`input-owning-class-incompatibility-${string}`, number>
    > = {};

    for (const [id, input] of Object.entries(globalMetadata.knownInputs)) {
      fullCompilationInputs++;
      if (input.seenAsSourceInput) {
        sourceInputs++;
      }
      if (input.memberIncompatibility !== null || input.owningClassIncompatibility !== null) {
        incompatibleInputs++;
      }
      if (input.memberIncompatibility !== null) {
        const reasonName = InputIncompatibilityReason[input.memberIncompatibility];
        const key = `input-field-incompatibility-${reasonName}` as const;
        fieldIncompatibleCounts[key] ??= 0;
        fieldIncompatibleCounts[key]++;
      }
      if (input.owningClassIncompatibility !== null) {
        const reasonName = ClassIncompatibilityReason[input.owningClassIncompatibility];
        const key = `input-owning-class-incompatibility-${reasonName}` as const;
        classIncompatibleCounts[key] ??= 0;
        classIncompatibleCounts[key]++;
      }
    }

    return {
      counters: {
        fullCompilationInputs,
        sourceInputs,
        incompatibleInputs,
        ...fieldIncompatibleCounts,
        ...classIncompatibleCounts,
      },
    };
  }
}

/**
 * Updates the migration state to filter inputs based on a filter
 * method defined in the migration config.
 */
function filterInputsViaConfig(
  result: MigrationResult,
  knownInputs: KnownInputs,
  config: MigrationConfig,
) {
  if (config.shouldMigrateInput === undefined) {
    return;
  }

  const skippedInputs = new Set<ClassFieldUniqueKey>();

  // Mark all skipped inputs as incompatible for migration.
  for (const input of knownInputs.knownInputIds.values()) {
    if (!config.shouldMigrateInput(input)) {
      skippedInputs.add(input.descriptor.key);
      knownInputs.markFieldIncompatible(input.descriptor, {
        context: null,
        reason: InputIncompatibilityReason.SkippedViaConfigFilter,
      });
    }
  }

  result.references = result.references.filter((reference) => {
    if (isInputDescriptor(reference.target)) {
      // Only migrate the reference if the target is NOT skipped.
      return !skippedInputs.has(reference.target.key);
    }
    // Class references may be migrated. This is up to the logic handling
    // the class reference. E.g. it may not migrate if any member is incompatible.
    return true;
  });
}

function createMigrationHost(info: ProgramInfo, config: MigrationConfig): MigrationHost {
  return new MigrationHost(/* isMigratingCore */ false, info, config, info.sourceFiles);
}
