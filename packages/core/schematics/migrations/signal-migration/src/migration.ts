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

/**
 * Tsurge migration for migrating Angular `@Input()` declarations to
 * signal inputs, with support for batch execution.
 */
export class SignalInputMigration extends TsurgeComplexMigration<
  CompilationUnitData,
  CompilationUnitData
> {
  upgradeAnalysisPhaseToAvoidBatch = false;
  upgradedAnalysisPhaseResults: {
    replacements: Replacement[];
    projectAbsDirPath: AbsoluteFsPath;
  } | null = null;

  // Necessary for language service configuration.
  reportProgressFn: ((percentage: number, updateMessage: string) => void) | null = null;
  beforeMigrateHook:
    | ((host: MigrationHost, knownInputs: KnownInputs, result: MigrationResult) => void)
    | null = null;

  bestEffortMode = false;

  // Override the default ngtsc program creation, to add extra flags.
  override createProgram(tsconfigAbsPath: string, fs?: FileSystem): BaseProgramInfo {
    return createNgtscProgram(tsconfigAbsPath, fs, {
      _enableTemplateTypeChecker: true,
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
    return {
      ...info,
      ...prepareAnalysisInfo(info.program, info.ngCompiler, info.programAbsoluteRootPaths),
    };
  }

  override async analyze(info: ProgramInfo) {
    const analysisDeps = this.prepareAnalysisDeps(info);
    const {metaRegistry} = analysisDeps;
    const knownInputs = new KnownInputs();
    const result = new MigrationResult();
    const host = createMigrationHost(info);

    this.reportProgressFn?.(10, 'Analyzing project (input usages)..');
    const {inheritanceGraph} = executeAnalysisPhase(host, knownInputs, result, analysisDeps);

    this.reportProgressFn?.(40, 'Checking inheritance..');
    pass4__checkInheritanceOfInputs(host, inheritanceGraph, metaRegistry, knownInputs);
    if (this.bestEffortMode) {
      filterIncompatibilitiesForBestEffortMode(knownInputs);
    }

    const unitData = getCompilationUnitMetadata(knownInputs, result);

    // Non-batch mode!
    if (this.upgradeAnalysisPhaseToAvoidBatch) {
      const merged = await this.merge([unitData]);

      this.reportProgressFn?.(60, 'Collecting migration changes..');
      const replacements = await this.migrate(merged, info, {
        knownInputs,
        result,
        host,
        inheritanceGraph,
        analysisDeps,
      });
      this.reportProgressFn?.(100, 'Completed migration.');

      // Expose the upgraded analysis stage results.
      this.upgradedAnalysisPhaseResults = {replacements, projectAbsDirPath: info.projectDirAbsPath};
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
    const knownInputs = nonBatchData?.knownInputs ?? new KnownInputs();
    const result = nonBatchData?.result ?? new MigrationResult();
    const host = nonBatchData?.host ?? createMigrationHost(info);
    const analysisDeps = nonBatchData?.analysisDeps ?? this.prepareAnalysisDeps(info);
    let inheritanceGraph: InheritanceGraph;

    // Can't re-use analysis structures, so re-build them.
    if (nonBatchData === undefined) {
      const analysisRes = executeAnalysisPhase(host, knownInputs, result, analysisDeps);
      inheritanceGraph = analysisRes.inheritanceGraph;
      populateKnownInputsFromGlobalData(knownInputs, globalMetadata);

      pass4__checkInheritanceOfInputs(
        host,
        inheritanceGraph,
        analysisDeps.metaRegistry,
        knownInputs,
      );
      if (this.bestEffortMode) {
        filterIncompatibilitiesForBestEffortMode(knownInputs);
      }
    }

    // Optional before migrate hook. Used by the language service.
    this.beforeMigrateHook?.(host, knownInputs, result);

    executeMigrationPhase(host, knownInputs, result, analysisDeps);

    return result.replacements;
  }
}

function createMigrationHost(info: ProgramInfo): MigrationHost {
  return new MigrationHost(
    /* projectDir */ info.projectDirAbsPath,
    /* isMigratingCore */ false,
    info.userOptions,
    info.sourceFiles,
  );
}
