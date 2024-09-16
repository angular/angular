/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
import {InheritanceGraph} from './utils/inheritance_graph';
import {executeMigrationPhase} from './phase_migrate';
import {filterIncompatibilitiesForBestEffortMode} from './best_effort_mode';
import {createNgtscProgram} from '../../../utils/tsurge/helpers/ngtsc_program';
import assert from 'assert';
import {InputIncompatibilityReason} from './input_detection/incompatibility';
import {isInputDescriptor} from './utils/input_id';
import {MigrationConfig} from './migration_config';
import {ClassFieldUniqueKey} from './passes/reference_resolution/known_fields';

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

  // Extend the program info with the analysis information we need in every phase.
  prepareAnalysisDeps(info: ProgramInfo): AnalysisProgramInfo {
    assert(info.ngCompiler !== null, 'Expected `NgCompiler` to be configured.');
    const analysisInfo = {
      ...info,
      ...prepareAnalysisInfo(info.program, info.ngCompiler, info.programAbsoluteRootFileNames),
    };

    // Optional filter for testing. Allows for simulation of parallel execution
    // even if some tsconfig's have overlap due to sharing of TS sources.
    // (this is commonly not the case in g3 where deps are `.d.ts` files).
    const limitToRootNamesOnly = process.env['LIMIT_TO_ROOT_NAMES_ONLY'] === '1';
    analysisInfo.sourceFiles = analysisInfo.sourceFiles.filter(
      (f) =>
        // Optional replacement filter. Allows parallel execution in case
        // some tsconfig's have overlap due to sharing of TS sources.
        // (this is commonly not the case in g3 where deps are `.d.ts` files).
        !limitToRootNamesOnly || info.programAbsoluteRootFileNames!.includes(f.fileName),
    );

    return analysisInfo;
  }

  override async analyze(info: ProgramInfo) {
    const analysisDeps = this.prepareAnalysisDeps(info);
    const {metaRegistry} = analysisDeps;
    const knownInputs = new KnownInputs(info, this.config);
    const result = new MigrationResult();
    const host = createMigrationHost(info, this.config);

    this.config.reportProgressFn?.(10, 'Analyzing project (input usages)..');
    const {inheritanceGraph} = executeAnalysisPhase(host, knownInputs, result, analysisDeps);

    filterInputsViaConfig(result, knownInputs, this.config);

    this.config.reportProgressFn?.(40, 'Checking inheritance..');
    pass4__checkInheritanceOfInputs(inheritanceGraph, metaRegistry, knownInputs);
    if (this.config.bestEffortMode) {
      filterIncompatibilitiesForBestEffortMode(knownInputs);
    }

    const unitData = getCompilationUnitMetadata(knownInputs, result);

    // Non-batch mode!
    if (this.config.upgradeAnalysisPhaseToAvoidBatch) {
      const merged = await this.merge([unitData]);

      this.config.reportProgressFn?.(60, 'Collecting migration changes..');
      const replacements = await this.migrate(merged, info, {
        knownInputs,
        result,
        host,
        inheritanceGraph,
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
      inheritanceGraph: InheritanceGraph;
      analysisDeps: AnalysisProgramInfo;
    },
  ): Promise<Replacement[]> {
    const knownInputs = nonBatchData?.knownInputs ?? new KnownInputs(info, this.config);
    const result = nonBatchData?.result ?? new MigrationResult();
    const host = nonBatchData?.host ?? createMigrationHost(info, this.config);
    const analysisDeps = nonBatchData?.analysisDeps ?? this.prepareAnalysisDeps(info);
    let inheritanceGraph: InheritanceGraph;

    // Can't re-use analysis structures, so re-build them.
    if (nonBatchData === undefined) {
      const analysisRes = executeAnalysisPhase(host, knownInputs, result, analysisDeps);
      inheritanceGraph = analysisRes.inheritanceGraph;
      populateKnownInputsFromGlobalData(knownInputs, globalMetadata);

      filterInputsViaConfig(result, knownInputs, this.config);
      pass4__checkInheritanceOfInputs(inheritanceGraph, analysisDeps.metaRegistry, knownInputs);
      if (this.config.bestEffortMode) {
        filterIncompatibilitiesForBestEffortMode(knownInputs);
      }
    }

    executeMigrationPhase(host, knownInputs, result, analysisDeps);

    return result.replacements;
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
