/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import assert from 'assert';
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
import {PartialEvaluator} from '@angular/compiler-cli/private/migrations';
import {
  getUniqueIdForProperty,
  isTargetOutputDeclaration,
  extractSourceOutputDefinition,
  isPotentialCompleteCallUsage,
  isPotentialNextCallUsage,
  isPotentialPipeCallUsage,
  isTestRunnerImport,
  getTargetPropertyDeclaration,
  checkNonTsReferenceCallsField,
} from './output_helpers';
import {
  calculateImportReplacements,
  calculateDeclarationReplacement,
  calculateNextFnReplacement,
  calculateCompleteCallReplacement,
  calculatePipeCallReplacement,
  calculateNextFnReplacementInTemplate,
  calculateNextFnReplacementInHostBinding,
} from './output-replacements';

import {createFindAllSourceFileReferencesVisitor} from '../signal-migration/src/passes/reference_resolution';
import {
  ClassFieldDescriptor,
  ClassFieldUniqueKey,
  KnownFields,
} from '../signal-migration/src/passes/reference_resolution/known_fields';
import {ReferenceResult} from '../signal-migration/src/passes/reference_resolution/reference_result';
import {ReferenceKind} from '../signal-migration/src/passes/reference_resolution/reference_kinds';

interface OutputMigrationData {
  file: ProjectFile;
  replacements: Replacement[];
}

interface CompilationUnitData {
  outputFields: Record<ClassFieldUniqueKey, OutputMigrationData>;
  problematicUsages: Record<ClassFieldUniqueKey, true>;
  importReplacements: Record<ProjectFileID, {add: Replacement[]; addAndRemove: Replacement[]}>;
}

export class OutputMigration extends TsurgeFunnelMigration<
  CompilationUnitData,
  CompilationUnitData
> {
  override async analyze(info: ProgramInfo): Promise<Serializable<CompilationUnitData>> {
    const {sourceFiles, program} = info;
    const outputFieldReplacements: Record<ClassFieldUniqueKey, OutputMigrationData> = {};
    const problematicUsages: Record<ClassFieldUniqueKey, true> = {};

    const filesWithOutputDeclarations = new Set<ts.SourceFile>();

    const checker = program.getTypeChecker();
    const reflector = new TypeScriptReflectionHost(checker);
    const dtsReader = new DtsMetadataReader(checker, reflector);
    const evaluator = new PartialEvaluator(reflector, checker, null);
    const ngCompiler = info.ngCompiler;
    assert(ngCompiler !== null, 'Requires ngCompiler to run the migration');
    const resourceLoader = ngCompiler['resourceManager'];
    // Pre-Analyze the program and get access to the template type checker.
    const {templateTypeChecker} = ngCompiler['ensureAnalyzed']();
    const knownFields: KnownFields<ClassFieldDescriptor> = {
      // Note: We don't support cross-target migration of `Partial<T>` usages.
      // This is an acceptable limitation for performance reasons.
      shouldTrackClassReference: (node) => false,
      attemptRetrieveDescriptorFromSymbol: (s) => {
        const propDeclaration = getTargetPropertyDeclaration(s);
        if (propDeclaration !== null) {
          const classFieldID = getUniqueIdForProperty(info, propDeclaration);
          if (classFieldID !== null) {
            return {
              node: propDeclaration,
              key: classFieldID,
            };
          }
        }
        return null;
      },
    };

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

    // take care of the references in templates and host bindings
    const referenceResult: ReferenceResult<ClassFieldDescriptor> = {references: []};
    const {visitor: templateHostRefVisitor} = createFindAllSourceFileReferencesVisitor(
      info,
      checker,
      reflector,
      resourceLoader,
      evaluator,
      templateTypeChecker,
      knownFields,
      null, // TODO: capture known output names as an optimization
      referenceResult,
    );

    // calculate template / host binding replacements
    for (const sf of sourceFiles) {
      ts.forEachChild(sf, templateHostRefVisitor);
    }

    for (const ref of referenceResult.references) {
      // detect .next usages that should be migrated to .emit in template and host binding expressions
      if (ref.kind === ReferenceKind.InTemplate) {
        const callExpr = checkNonTsReferenceCallsField(ref, 'next');
        if (callExpr !== null) {
          addOutputReplacement(
            outputFieldReplacements,
            ref.target.key,
            ref.from.templateFile,
            calculateNextFnReplacementInTemplate(ref.from.templateFile, callExpr.nameSpan),
          );
        }
      } else if (ref.kind === ReferenceKind.InHostBinding) {
        const callExpr = checkNonTsReferenceCallsField(ref, 'next');
        if (callExpr !== null) {
          addOutputReplacement(
            outputFieldReplacements,
            ref.target.key,
            ref.from.file,
            calculateNextFnReplacementInHostBinding(
              ref.from.file,
              ref.from.hostPropertyNode.getStart() + 1,
              callExpr.nameSpan,
            ),
          );
        }
      }
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
    const outputFields: Record<ClassFieldUniqueKey, OutputMigrationData> = {};
    const importReplacements: Record<
      ProjectFileID,
      {add: Replacement[]; addAndRemove: Replacement[]}
    > = {};
    const problematicUsages: Record<ClassFieldUniqueKey, true> = {};

    for (const unit of units) {
      for (const declIdStr of Object.keys(unit.outputFields)) {
        const declId = declIdStr as ClassFieldUniqueKey;
        // THINK: detect clash? Should we have an utility to merge data based on unique IDs?
        outputFields[declId] = unit.outputFields[declId];
      }

      for (const fileIDStr of Object.keys(unit.importReplacements)) {
        const fileID = fileIDStr as ProjectFileID;
        importReplacements[fileID] = unit.importReplacements[fileID];
      }

      for (const declIdStr of Object.keys(unit.problematicUsages)) {
        const declId = declIdStr as ClassFieldUniqueKey;
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
      const declId = declIdStr as ClassFieldUniqueKey;
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
  outputFieldReplacements: Record<ClassFieldUniqueKey, OutputMigrationData>,
  outputId: ClassFieldUniqueKey,
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
