/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {
  confirmAsSerializable,
  MigrationStats,
  ProgramInfo,
  projectFile,
  ProjectFile,
  ProjectFileID,
  Replacement,
  Serializable,
  TsurgeFunnelMigration,
} from '../../utils/tsurge';

import {DtsMetadataReader} from '../../../../compiler-cli/src/ngtsc/metadata';
import {TypeScriptReflectionHost} from '../../../../compiler-cli/src/ngtsc/reflection';
import {
  OutputID,
  getUniqueIdForProperty,
  isTargetOutputDeclaration,
  extractSourceOutputDefinition,
  isPotentialCompleteCallUsage,
  isPotentialNextCallUsage,
  isPotentialPipeCallUsage,
  isTestRunnerImport,
} from './output_helpers';
import {
  calculateImportReplacements,
  calculateDeclarationReplacement,
  calculateNextFnReplacement,
  calculateCompleteCallReplacement,
  calculatePipeCallReplacement,
} from './output-replacements';

interface OutputMigrationData {
  file: ProjectFile;
  replacements: Replacement[];
}

interface CompilationUnitData {
  outputFields: Record<OutputID, OutputMigrationData>;
  problematicUsages: Record<OutputID, true>;
  importReplacements: Record<ProjectFileID, {add: Replacement[]; addAndRemove: Replacement[]}>;
}

export class OutputMigration extends TsurgeFunnelMigration<
  CompilationUnitData,
  CompilationUnitData
> {
  override async analyze(info: ProgramInfo): Promise<Serializable<CompilationUnitData>> {
    const {sourceFiles, program} = info;
    const outputFieldReplacements: Record<OutputID, OutputMigrationData> = {};
    const problematicUsages: Record<OutputID, true> = {};

    const filesWithOutputDeclarations = new Set<ts.SourceFile>();

    const checker = program.getTypeChecker();
    const reflector = new TypeScriptReflectionHost(checker);
    const dtsReader = new DtsMetadataReader(checker, reflector);

    let isTestFile = false;

    const outputMigrationVisitor = (node: ts.Node) => {
      // detect output declarations
      if (ts.isPropertyDeclaration(node)) {
        const outputDef = extractSourceOutputDefinition(node, reflector, info);
        if (outputDef !== null) {
          const outputFile = projectFile(node.getSourceFile(), info);

          filesWithOutputDeclarations.add(node.getSourceFile());
          addOutputReplacement(
            outputFieldReplacements,
            outputDef.id,
            outputFile,
            calculateDeclarationReplacement(info, node, outputDef.aliasParam),
          );
        }
      }

      // detect .next usages that should be migrated to .emit
      if (isPotentialNextCallUsage(node) && ts.isPropertyAccessExpression(node.expression)) {
        const propertyDeclaration = isTargetOutputDeclaration(
          node.expression.expression,
          checker,
          reflector,
          dtsReader,
        );
        if (propertyDeclaration !== null) {
          const id = getUniqueIdForProperty(info, propertyDeclaration);
          const outputFile = projectFile(node.getSourceFile(), info);
          addOutputReplacement(
            outputFieldReplacements,
            id,
            outputFile,
            calculateNextFnReplacement(info, node.expression.name),
          );
        }
      }

      // detect .complete usages that should be removed
      if (isPotentialCompleteCallUsage(node) && ts.isPropertyAccessExpression(node.expression)) {
        const propertyDeclaration = isTargetOutputDeclaration(
          node.expression.expression,
          checker,
          reflector,
          dtsReader,
        );
        if (propertyDeclaration !== null) {
          const id = getUniqueIdForProperty(info, propertyDeclaration);
          const outputFile = projectFile(node.getSourceFile(), info);
          if (ts.isExpressionStatement(node.parent)) {
            addOutputReplacement(
              outputFieldReplacements,
              id,
              outputFile,
              calculateCompleteCallReplacement(info, node.parent),
            );
          } else {
            problematicUsages[id] = true;
          }
        }
      }

      // detect imports of test runners
      if (isTestRunnerImport(node)) {
        isTestFile = true;
      }

      // detect unsafe access of the output property
      if (isPotentialPipeCallUsage(node) && ts.isPropertyAccessExpression(node.expression)) {
        const propertyDeclaration = isTargetOutputDeclaration(
          node.expression.expression,
          checker,
          reflector,
          dtsReader,
        );
        if (propertyDeclaration !== null) {
          const id = getUniqueIdForProperty(info, propertyDeclaration);
          if (isTestFile) {
            const outputFile = projectFile(node.getSourceFile(), info);
            addOutputReplacement(
              outputFieldReplacements,
              id,
              outputFile,
              ...calculatePipeCallReplacement(info, node),
            );
          } else {
            problematicUsages[id] = true;
          }
        }
      }

      ts.forEachChild(node, outputMigrationVisitor);
    };

    // calculate output migration replacements
    for (const sf of sourceFiles) {
      isTestFile = false;
      ts.forEachChild(sf, outputMigrationVisitor);
    }

    // calculate import replacements but do so only for files that have output declarations
    const importReplacements = calculateImportReplacements(info, filesWithOutputDeclarations);

    return confirmAsSerializable({
      outputFields: outputFieldReplacements,
      importReplacements,
      problematicUsages,
    });
  }

  override async merge(units: CompilationUnitData[]): Promise<Serializable<CompilationUnitData>> {
    const outputFields: Record<OutputID, OutputMigrationData> = {};
    const importReplacements: Record<
      ProjectFileID,
      {add: Replacement[]; addAndRemove: Replacement[]}
    > = {};
    const problematicUsages: Record<OutputID, true> = {};

    for (const unit of units) {
      for (const declIdStr of Object.keys(unit.outputFields)) {
        const declId = declIdStr as OutputID;
        // THINK: detect clash? Should we have an utility to merge data based on unique IDs?
        outputFields[declId] = unit.outputFields[declId];
      }

      for (const fileIDStr of Object.keys(unit.importReplacements)) {
        const fileID = fileIDStr as ProjectFileID;
        importReplacements[fileID] = unit.importReplacements[fileID];
      }

      for (const declIdStr of Object.keys(unit.problematicUsages)) {
        const declId = declIdStr as OutputID;
        problematicUsages[declId] = unit.problematicUsages[declId];
      }
    }

    return confirmAsSerializable({
      outputFields,
      importReplacements,
      problematicUsages,
    });
  }

  override async stats(globalMetadata: CompilationUnitData): Promise<MigrationStats> {
    // TODO: Add statistics.
    return {counters: {}};
  }

  override async migrate(globalData: CompilationUnitData) {
    const migratedFiles = new Set<ProjectFileID>();
    const problematicFiles = new Set<ProjectFileID>();

    const replacements: Replacement[] = [];
    for (const declIdStr of Object.keys(globalData.outputFields)) {
      const declId = declIdStr as OutputID;
      const outputField = globalData.outputFields[declId];

      if (!globalData.problematicUsages[declId]) {
        replacements.push(...outputField.replacements);
        migratedFiles.add(outputField.file.id);
      } else {
        problematicFiles.add(outputField.file.id);
      }
    }

    for (const fileIDStr of Object.keys(globalData.importReplacements)) {
      const fileID = fileIDStr as ProjectFileID;
      if (migratedFiles.has(fileID)) {
        const importReplacements = globalData.importReplacements[fileID];
        if (problematicFiles.has(fileID)) {
          replacements.push(...importReplacements.add);
        } else {
          replacements.push(...importReplacements.addAndRemove);
        }
      }
    }

    return {replacements};
  }
}

function addOutputReplacement(
  outputFieldReplacements: Record<OutputID, OutputMigrationData>,
  outputId: OutputID,
  file: ProjectFile,
  ...replacements: Replacement[]
): void {
  let existingReplacements = outputFieldReplacements[outputId];
  if (existingReplacements === undefined) {
    outputFieldReplacements[outputId] = existingReplacements = {
      file: file,
      replacements: [],
    };
  }
  existingReplacements.replacements.push(...replacements);
}
