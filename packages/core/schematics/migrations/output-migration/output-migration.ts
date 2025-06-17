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
  ProgramInfo,
  projectFile,
  ProjectFile,
  ProjectFileID,
  Replacement,
  Serializable,
  TextUpdate,
  TsurgeFunnelMigration,
} from '../../utils/tsurge';

import {DtsMetadataReader, TypeScriptReflectionHost} from '@angular/compiler-cli';
import {PartialEvaluator} from '@angular/compiler-cli/private/migrations';
import {
  calculateCompleteCallReplacement,
  calculateDeclarationReplacement,
  calculateImportReplacements,
  calculateNextFnReplacement,
  calculateNextFnReplacementInHostBinding,
  calculateNextFnReplacementInTemplate,
  calculatePipeCallReplacement,
} from './output-replacements';
import {
  checkNonTsReferenceCallsField,
  getOutputDecorator,
  getTargetPropertyDeclaration,
  getUniqueIdForProperty,
  isOutputDeclarationEligibleForMigration,
  isPotentialCompleteCallUsage,
  isPotentialNextCallUsage,
  isPotentialPipeCallUsage,
  isTargetOutputDeclaration,
  isTestRunnerImport,
} from './output_helpers';

import {createFindAllSourceFileReferencesVisitor} from '../signal-migration/src/passes/reference_resolution';
import {
  ClassFieldDescriptor,
  ClassFieldUniqueKey,
  KnownFields,
} from '../signal-migration/src/passes/reference_resolution/known_fields';
import {ReferenceKind} from '../signal-migration/src/passes/reference_resolution/reference_kinds';
import {ReferenceResult} from '../signal-migration/src/passes/reference_resolution/reference_result';

export interface MigrationConfig {
  /**
   * Whether the given output definition should be migrated.
   *
   * Treating an output as non-migrated means that no references to it are
   * migrated, nor the actual declaration (if it's part of the sources).
   *
   * If no function is specified here, the migration will migrate all
   * output and references it discovers in compilation units. This is the
   * running assumption for batch mode and LSC mode where the migration
   * assumes all seen output are migrated.
   */
  shouldMigrate?: (definition: ClassFieldDescriptor, containingFile: ProjectFile) => boolean;
}

export interface OutputMigrationData {
  file: ProjectFile;
  replacements: Replacement[];
}

export interface CompilationUnitData {
  problematicDeclarationCount: number;
  outputFields: Record<ClassFieldUniqueKey, OutputMigrationData>;
  problematicUsages: Record<ClassFieldUniqueKey, true>;
  importReplacements: Record<ProjectFileID, {add: Replacement[]; addAndRemove: Replacement[]}>;
}

export class OutputMigration extends TsurgeFunnelMigration<
  CompilationUnitData,
  CompilationUnitData
> {
  constructor(private readonly config: MigrationConfig = {}) {
    super();
  }

  override async analyze(info: ProgramInfo): Promise<Serializable<CompilationUnitData>> {
    const {sourceFiles, program} = info;
    const outputFieldReplacements: Record<ClassFieldUniqueKey, OutputMigrationData> = {};
    const problematicUsages: Record<ClassFieldUniqueKey, true> = {};
    let problematicDeclarationCount = 0;

    const filesWithOutputDeclarations = new Set<ts.SourceFile>();

    const checker = program.getTypeChecker();
    const reflector = new TypeScriptReflectionHost(checker);
    const dtsReader = new DtsMetadataReader(checker, reflector);
    const evaluator = new PartialEvaluator(reflector, checker, null);
    const resourceLoader = info.ngCompiler?.['resourceManager'] ?? null;

    // Pre-analyze the program and get access to the template type checker.
    // If we are processing a non-Angular target, there is no template info.
    const {templateTypeChecker} = info.ngCompiler?.['ensureAnalyzed']() ?? {
      templateTypeChecker: null,
    };

    const knownFields: KnownFields<ClassFieldDescriptor> = {
      // Note: We don't support cross-target migration of `Partial<T>` usages.
      // This is an acceptable limitation for performance reasons.
      shouldTrackClassReference: () => false,
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
        const outputDecorator = getOutputDecorator(node, reflector);
        if (outputDecorator !== null) {
          if (isOutputDeclarationEligibleForMigration(node)) {
            const outputDef = {
              id: getUniqueIdForProperty(info, node),
              aliasParam: outputDecorator.args?.at(0),
            };
            const outputFile = projectFile(node.getSourceFile(), info);
            if (
              this.config.shouldMigrate === undefined ||
              this.config.shouldMigrate(
                {
                  key: outputDef.id,
                  node: node,
                },
                outputFile,
              )
            ) {
              const aliasParam = outputDef.aliasParam;
              const aliasOptionValue = aliasParam ? evaluator.evaluate(aliasParam) : undefined;

              if (aliasOptionValue == undefined || typeof aliasOptionValue === 'string') {
                filesWithOutputDeclarations.add(node.getSourceFile());
                addOutputReplacement(
                  outputFieldReplacements,
                  outputDef.id,
                  outputFile,
                  calculateDeclarationReplacement(info, node, aliasOptionValue?.toString()),
                );
              } else {
                problematicUsages[outputDef.id] = true;
                problematicDeclarationCount++;
              }
            }
          } else {
            problematicDeclarationCount++;
          }
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

      addCommentForEmptyEmit(node, info, checker, reflector, dtsReader, outputFieldReplacements);

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
        // TODO: here and below for host bindings, we should ideally filter in the global meta stage
        // (instead of using the `outputFieldReplacements` map)
        //  as technically, the call expression could refer to an output
        //  from a whole different compilation unit (e.g. tsconfig.json).
        if (callExpr !== null && outputFieldReplacements[ref.target.key] !== undefined) {
          addOutputReplacement(
            outputFieldReplacements,
            ref.target.key,
            ref.from.templateFile,
            calculateNextFnReplacementInTemplate(ref.from.templateFile, callExpr.nameSpan),
          );
        }
      } else if (ref.kind === ReferenceKind.InHostBinding) {
        const callExpr = checkNonTsReferenceCallsField(ref, 'next');
        if (callExpr !== null && outputFieldReplacements[ref.target.key] !== undefined) {
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
      problematicDeclarationCount,
      outputFields: outputFieldReplacements,
      importReplacements,
      problematicUsages,
    });
  }

  override async combine(
    unitA: CompilationUnitData,
    unitB: CompilationUnitData,
  ): Promise<Serializable<CompilationUnitData>> {
    const outputFields: Record<ClassFieldUniqueKey, OutputMigrationData> = {};
    const importReplacements: Record<
      ProjectFileID,
      {add: Replacement[]; addAndRemove: Replacement[]}
    > = {};
    const problematicUsages: Record<ClassFieldUniqueKey, true> = {};
    let problematicDeclarationCount = 0;

    for (const unit of [unitA, unitB]) {
      for (const declIdStr of Object.keys(unit.outputFields)) {
        const declId = declIdStr as ClassFieldUniqueKey;
        // THINK: detect clash? Should we have an utility to merge data based on unique IDs?
        outputFields[declId] = unit.outputFields[declId];
      }

      for (const fileIDStr of Object.keys(unit.importReplacements)) {
        const fileID = fileIDStr as ProjectFileID;
        importReplacements[fileID] = unit.importReplacements[fileID];
      }

      problematicDeclarationCount += unit.problematicDeclarationCount;
    }

    for (const unit of [unitA, unitB]) {
      for (const declIdStr of Object.keys(unit.problematicUsages)) {
        const declId = declIdStr as ClassFieldUniqueKey;
        problematicUsages[declId] = unit.problematicUsages[declId];
      }
    }

    return confirmAsSerializable({
      problematicDeclarationCount,
      outputFields,
      importReplacements,
      problematicUsages,
    });
  }

  override async globalMeta(
    combinedData: CompilationUnitData,
  ): Promise<Serializable<CompilationUnitData>> {
    const globalMeta: CompilationUnitData = {
      importReplacements: combinedData.importReplacements,
      outputFields: combinedData.outputFields,
      problematicDeclarationCount: combinedData.problematicDeclarationCount,
      problematicUsages: {},
    };

    for (const keyStr of Object.keys(combinedData.problematicUsages)) {
      const key = keyStr as ClassFieldUniqueKey;
      // it might happen that a problematic usage is detected but we didn't see the declaration - skipping those
      if (globalMeta.outputFields[key] !== undefined) {
        globalMeta.problematicUsages[key] = true;
      }
    }

    // Noop here as we don't have any form of special global metadata.
    return confirmAsSerializable(combinedData);
  }

  override async stats(globalMetadata: CompilationUnitData) {
    const detectedOutputs =
      new Set(Object.keys(globalMetadata.outputFields)).size +
      globalMetadata.problematicDeclarationCount;

    const problematicOutputs =
      new Set(Object.keys(globalMetadata.problematicUsages)).size +
      globalMetadata.problematicDeclarationCount;
    const successRate =
      detectedOutputs > 0 ? (detectedOutputs - problematicOutputs) / detectedOutputs : 1;

    return confirmAsSerializable({
      detectedOutputs,
      problematicOutputs,
      successRate,
    });
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

function addCommentForEmptyEmit(
  node: ts.Node,
  info: ProgramInfo,
  checker: ts.TypeChecker,
  reflector: TypeScriptReflectionHost,
  dtsReader: DtsMetadataReader,
  outputFieldReplacements: Record<ClassFieldUniqueKey, OutputMigrationData>,
): void {
  if (!isEmptyEmitCall(node)) return;

  const propertyAccess = getPropertyAccess(node);
  if (!propertyAccess) return;

  const symbol = checker.getSymbolAtLocation(propertyAccess.name);
  if (!symbol || !symbol.declarations?.length) return;

  const propertyDeclaration = isTargetOutputDeclaration(
    propertyAccess,
    checker,
    reflector,
    dtsReader,
  );
  if (!propertyDeclaration) return;

  const eventEmitterType = getEventEmitterArgumentType(propertyDeclaration);
  if (!eventEmitterType) return;

  const id = getUniqueIdForProperty(info, propertyDeclaration);
  const file = projectFile(node.getSourceFile(), info);
  const formatter = getFormatterText(node);
  const todoReplacement: TextUpdate = new TextUpdate({
    toInsert: `${formatter.indent}// TODO: The 'emit' function requires a mandatory ${eventEmitterType} argument\n`,
    end: formatter.lineStartPos,
    position: formatter.lineStartPos,
  });

  addOutputReplacement(outputFieldReplacements, id, file, new Replacement(file, todoReplacement));
}

function isEmptyEmitCall(node: ts.Node): node is ts.CallExpression {
  return (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.name.text === 'emit' &&
    node.arguments.length === 0
  );
}

function getPropertyAccess(node: ts.CallExpression): ts.PropertyAccessExpression | null {
  const propertyAccessExpression = (node.expression as ts.PropertyAccessExpression).expression;
  return ts.isPropertyAccessExpression(propertyAccessExpression) ? propertyAccessExpression : null;
}

function getEventEmitterArgumentType(propertyDeclaration: ts.PropertyDeclaration): string | null {
  const initializer = propertyDeclaration.initializer;
  if (!initializer || !ts.isNewExpression(initializer)) return null;

  const isEventEmitter =
    ts.isIdentifier(initializer.expression) && initializer.expression.getText() === 'EventEmitter';

  if (!isEventEmitter) return null;

  const [typeArg] = initializer.typeArguments ?? [];
  return typeArg ? typeArg.getText() : null;
}

function getFormatterText(node: ts.Node): {indent: string; lineStartPos: number} {
  const sourceFile = node.getSourceFile();
  const {line} = sourceFile.getLineAndCharacterOfPosition(node.getStart());
  const lineStartPos = sourceFile.getPositionOfLineAndCharacter(line, 0);
  const indent = sourceFile.text.slice(lineStartPos, node.getStart());
  return {indent, lineStartPos};
}
