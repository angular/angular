/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgtscProgram} from '../../../../../compiler-cli/src/ngtsc/program';
import {FileSystem} from '../../../../../compiler-cli/src/ngtsc/file_system';
import {confirmAsSerializable, Serializable} from '../../../utils/tsurge/helpers/serializable';
import {BaseProgramInfo, ProgramInfo} from '../../../utils/tsurge/program_info';
import {TsurgeMigration} from '../../../utils/tsurge/migration';
import {CompilationUnitData} from './batch/metadata_file';
import {KnownInputs} from './input_detection/known_inputs';
import {AnalysisProgramInfo, prepareAnalysisInfo} from './analysis_deps';
import {MigrationResult} from './result';
import {MigrationHost} from './migration_host';
import {executeAnalysisPhase} from './phase_analysis';
import {pass4__checkInheritanceOfInputs} from './passes/4_check_inheritance';
import {getCompilationUnitMetadata} from './batch/extract';
import {mergeCompilationUnitData} from './batch/merge_metadata';
import {Replacement} from '../../../utils/tsurge/replacement';
import {populateKnownInputsFromGlobalData} from './batch/migrate_target';
import {InheritanceGraph} from './utils/inheritance_graph';
import {executeMigrationPhase} from './phase_migrate';
import {filterIncompatibilitiesForBestEffortMode} from './best_effort_mode';
import {createNgtscProgram} from '../../../utils/tsurge/helpers/ngtsc_program';

/**
 * Tsurge migration for migrating Angular `@Input()` declarations to
 * signal inputs, with support for batch execution.
 */
export class SignalInputMigration extends TsurgeMigration<
  CompilationUnitData,
  CompilationUnitData,
  NgtscProgram,
  AnalysisProgramInfo
> {
  upgradeAnalysisPhaseToAvoidBatch = false;
  upgradedAnalysisPhaseResults: Replacement[] | null = null;

  bestEffortMode = false;

  // Override the default ngtsc program creation, to add extra flags.
  override createProgram(tsconfigAbsPath: string, fs?: FileSystem): BaseProgramInfo<NgtscProgram> {
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
  override prepareProgram(baseInfo: BaseProgramInfo<NgtscProgram>): AnalysisProgramInfo {
    const info = super.prepareProgram(baseInfo);
    return {
      ...info,
      ...prepareAnalysisInfo(
        info.program.getTsProgram(),
        info.program.compiler,
        info.programAbsoluteRootPaths,
      ),
    };
  }

  override async analyze(analysisDeps: AnalysisProgramInfo) {
    const {metaRegistry} = analysisDeps;
    const knownInputs = new KnownInputs();
    const result = new MigrationResult();
    const host = createMigrationHost(analysisDeps);

    const {inheritanceGraph} = executeAnalysisPhase(host, knownInputs, result, analysisDeps);
    pass4__checkInheritanceOfInputs(host, inheritanceGraph, metaRegistry, knownInputs);
    if (this.bestEffortMode) {
      filterIncompatibilitiesForBestEffortMode(knownInputs);
    }

    const unitData = getCompilationUnitMetadata(knownInputs, result);

    // Non-batch mode!
    if (this.upgradeAnalysisPhaseToAvoidBatch) {
      const merged = await this.merge([unitData]);
      const replacements = await this.migrate(merged, analysisDeps, {
        knownInputs,
        result,
        host,
        inheritanceGraph,
      });

      // Expose the upgraded analysis stage results.
      this.upgradedAnalysisPhaseResults = replacements;
    }

    return confirmAsSerializable(unitData);
  }

  override async merge(units: CompilationUnitData[]): Promise<Serializable<CompilationUnitData>> {
    return confirmAsSerializable(mergeCompilationUnitData(units));
  }

  override async migrate(
    globalMetadata: CompilationUnitData,
    analysisDeps: AnalysisProgramInfo,
    nonBatchData?: {
      knownInputs: KnownInputs;
      result: MigrationResult;
      host: MigrationHost;
      inheritanceGraph: InheritanceGraph;
    },
  ): Promise<Replacement[]> {
    const knownInputs = nonBatchData?.knownInputs ?? new KnownInputs();
    const result = nonBatchData?.result ?? new MigrationResult();
    const host = nonBatchData?.host ?? createMigrationHost(analysisDeps);
    const {metaRegistry} = analysisDeps;
    let inheritanceGraph: InheritanceGraph;

    // Can't re-use analysis structures, so re-build them.
    if (nonBatchData === undefined) {
      const analysisRes = executeAnalysisPhase(host, knownInputs, result, analysisDeps);
      inheritanceGraph = analysisRes.inheritanceGraph;
      populateKnownInputsFromGlobalData(knownInputs, globalMetadata);
    } else {
      inheritanceGraph = nonBatchData.inheritanceGraph;
    }

    pass4__checkInheritanceOfInputs(host, inheritanceGraph, metaRegistry, knownInputs);
    if (this.bestEffortMode) {
      filterIncompatibilitiesForBestEffortMode(knownInputs);
    }

    executeMigrationPhase(host, knownInputs, result, analysisDeps);

    return result.replacements;
  }
}

function createMigrationHost(info: ProgramInfo<NgtscProgram>): MigrationHost {
  return new MigrationHost(
    /* projectDir */ info.projectDirAbsPath,
    /* isMigratingCore */ false,
    info.userOptions,
    info.sourceFiles,
  );
}
