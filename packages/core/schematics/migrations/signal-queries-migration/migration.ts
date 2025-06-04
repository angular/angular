/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ImportManager, PartialEvaluator} from '@angular/compiler-cli/private/migrations';
import {getAngularDecorators, QueryFunctionName} from '@angular/compiler-cli/src/ngtsc/annotations';
import {TypeScriptReflectionHost} from '@angular/compiler-cli/src/ngtsc/reflection';
import assert from 'assert';
import ts from 'typescript';
import {
  confirmAsSerializable,
  MigrationStats,
  ProgramInfo,
  projectFile,
  Replacement,
  Serializable,
  TsurgeComplexMigration,
} from '../../utils/tsurge';
import {applyImportManagerChanges} from '../../utils/tsurge/helpers/apply_import_manager';
import {
  ClassFieldDescriptor,
  ClassIncompatibilityReason,
  FieldIncompatibilityReason,
  nonIgnorableFieldIncompatibilities,
} from '../signal-migration/src';
import {checkIncompatiblePatterns} from '../signal-migration/src/passes/problematic_patterns/common_incompatible_patterns';
import {migrateHostBindings} from '../signal-migration/src/passes/reference_migration/migrate_host_bindings';
import {migrateTemplateReferences} from '../signal-migration/src/passes/reference_migration/migrate_template_references';
import {migrateTypeScriptReferences} from '../signal-migration/src/passes/reference_migration/migrate_ts_references';
import {migrateTypeScriptTypeReferences} from '../signal-migration/src/passes/reference_migration/migrate_ts_type_references';
import {ReferenceMigrationHost} from '../signal-migration/src/passes/reference_migration/reference_migration_host';
import {createFindAllSourceFileReferencesVisitor} from '../signal-migration/src/passes/reference_resolution';
import {
  ClassFieldUniqueKey,
  KnownFields,
} from '../signal-migration/src/passes/reference_resolution/known_fields';
import {
  isHostBindingReference,
  isTemplateReference,
  isTsReference,
  Reference,
} from '../signal-migration/src/passes/reference_resolution/reference_kinds';
import {ReferenceResult} from '../signal-migration/src/passes/reference_resolution/reference_result';
import {GroupedTsAstVisitor} from '../signal-migration/src/utils/grouped_ts_ast_visitor';
import {InheritanceGraph} from '../signal-migration/src/utils/inheritance_graph';
import {computeReplacementsToMigrateQuery} from './convert_query_property';
import {getClassFieldDescriptorForSymbol, getUniqueIDForClassProperty} from './field_tracking';
import {ExtractedQuery, extractSourceQueryDefinition} from './identify_queries';
import {KnownQueries} from './known_queries';
import {queryFunctionNameToDecorator} from './query_api_names';
import {removeQueryListToArrayCall} from './fn_to_array_removal';
import {replaceQueryListGetCall} from './fn_get_replacement';
import {checkForIncompatibleQueryListAccesses} from './incompatible_query_list_fns';
import {replaceQueryListFirstAndLastReferences} from './fn_first_last_replacement';
import {MigrationConfig} from './migration_config';
import {
  filterBestEffortIncompatibilities,
  markFieldIncompatibleInMetadata,
} from './incompatibility';
import {insertTodoForIncompatibility} from '../signal-migration/src/passes/problematic_patterns/incompatibility_todos';
import {checkInheritanceOfKnownFields} from '../signal-migration/src/passes/problematic_patterns/check_inheritance';

export interface CompilationUnitData {
  knownQueryFields: Record<ClassFieldUniqueKey, {fieldName: string; isMulti: boolean}>;

  // Potential queries problematic. We don't know what fields are queries during
  // analysis, so this is very eagerly tracking all potential problematic "class fields".
  potentialProblematicQueries: GlobalUnitData['problematicQueries'];

  // Potential multi queries problematic. We don't know what fields are queries, or which
  // ones are "multi" queries during analysis, so this is very eagerly tracking all
  // potential problematic "class fields", but noting for later that those only would be
  // problematic if they end up being multi-result queries.
  potentialProblematicReferenceForMultiQueries: Record<ClassFieldUniqueKey, true>;

  // NOTE: Not serializable — ONLY works when we know it's not running in batch mode!
  reusableAnalysisReferences: Reference<ClassFieldDescriptor>[] | null;
}

export interface GlobalUnitData {
  knownQueryFields: Record<ClassFieldUniqueKey, {fieldName: string; isMulti: boolean}>;
  problematicQueries: Record<
    ClassFieldUniqueKey,
    {classReason: ClassIncompatibilityReason | null; fieldReason: FieldIncompatibilityReason | null}
  >;

  // NOTE: Not serializable — ONLY works when we know it's not running in batch mode!
  reusableAnalysisReferences: Reference<ClassFieldDescriptor>[] | null;
}

export class SignalQueriesMigration extends TsurgeComplexMigration<
  CompilationUnitData,
  GlobalUnitData
> {
  constructor(private readonly config: MigrationConfig = {}) {
    super();
  }

  override async analyze(info: ProgramInfo): Promise<Serializable<CompilationUnitData>> {
    // Pre-Analyze the program and get access to the template type checker.
    const {templateTypeChecker} = info.ngCompiler?.['ensureAnalyzed']() ?? {
      templateTypeChecker: null,
    };
    const resourceLoader = info.ngCompiler?.['resourceManager'] ?? null;

    // Generate all type check blocks, if we have Angular template information.
    if (templateTypeChecker !== null) {
      templateTypeChecker.generateAllTypeCheckBlocks();
    }

    const {sourceFiles, program} = info;
    const checker = program.getTypeChecker();
    const reflector = new TypeScriptReflectionHost(checker);
    const evaluator = new PartialEvaluator(reflector, checker, null);
    const res: CompilationUnitData = {
      knownQueryFields: {},
      potentialProblematicQueries: {},
      potentialProblematicReferenceForMultiQueries: {},
      reusableAnalysisReferences: null,
    };
    const groupedAstVisitor = new GroupedTsAstVisitor(sourceFiles);
    const referenceResult: ReferenceResult<ClassFieldDescriptor> = {references: []};
    const classesWithFilteredQueries = new Set<ts.ClassDeclaration>();
    const filteredQueriesForCompilationUnit = new Map<ClassFieldUniqueKey, {fieldName: string}>();

    const findQueryDefinitionsVisitor = (node: ts.Node) => {
      const extractedQuery = extractSourceQueryDefinition(node, reflector, evaluator, info);
      if (extractedQuery !== null) {
        const queryNode = extractedQuery.node;
        const descriptor = {
          key: extractedQuery.id,
          node: queryNode,
        };
        const containingFile = projectFile(queryNode.getSourceFile(), info);

        // If we have a config filter function, use it here for later
        // perf-boosted reference lookups. Useful in non-batch mode.
        if (
          this.config.shouldMigrateQuery === undefined ||
          this.config.shouldMigrateQuery(descriptor, containingFile)
        ) {
          classesWithFilteredQueries.add(queryNode.parent);
          filteredQueriesForCompilationUnit.set(extractedQuery.id, {
            fieldName: extractedQuery.queryInfo.propertyName,
          });
        }

        res.knownQueryFields[extractedQuery.id] = {
          fieldName: extractedQuery.queryInfo.propertyName,
          isMulti: extractedQuery.queryInfo.first === false,
        };

        if (ts.isAccessor(queryNode)) {
          markFieldIncompatibleInMetadata(
            res.potentialProblematicQueries,
            extractedQuery.id,
            FieldIncompatibilityReason.Accessor,
          );
        }

        // Detect queries with union types that are uncommon to be
        // automatically migrate-able. E.g. `refs: ElementRef|null`,
        // or `ElementRef|SomeOtherType`.
        if (
          queryNode.type !== undefined &&
          ts.isUnionTypeNode(queryNode.type) &&
          // Either too large union, or doesn't match `T|undefined`.
          (queryNode.type.types.length > 2 ||
            !queryNode.type.types.some((t) => t.kind === ts.SyntaxKind.UndefinedKeyword))
        ) {
          markFieldIncompatibleInMetadata(
            res.potentialProblematicQueries,
            extractedQuery.id,
            FieldIncompatibilityReason.SignalQueries__IncompatibleMultiUnionType,
          );
        }

        // Migrating fields with `@HostBinding` is incompatible as
        // the host binding decorator does not invoke the signal.
        const hostBindingDecorators = getAngularDecorators(
          extractedQuery.fieldDecorators,
          ['HostBinding'],
          /* isCore */ false,
        );
        if (hostBindingDecorators.length > 0) {
          markFieldIncompatibleInMetadata(
            res.potentialProblematicQueries,
            extractedQuery.id,
            FieldIncompatibilityReason.SignalIncompatibleWithHostBinding,
          );
        }
      }
    };

    this.config.reportProgressFn?.(20, 'Scanning for queries..');
    groupedAstVisitor.register(findQueryDefinitionsVisitor);
    groupedAstVisitor.execute();

    const allFieldsOrKnownQueries: KnownFields<ClassFieldDescriptor> = {
      // Note: We don't support cross-target migration of `Partial<T>` usages.
      // This is an acceptable limitation for performance reasons.
      shouldTrackClassReference: (node) => classesWithFilteredQueries.has(node),
      attemptRetrieveDescriptorFromSymbol: (s) => {
        const descriptor = getClassFieldDescriptorForSymbol(s, info);

        // If we are executing in upgraded analysis phase mode, we know all
        // of the queries since there aren't any other compilation units.
        // Ignore references to non-query class fields.
        if (
          this.config.assumeNonBatch &&
          (descriptor === null || !filteredQueriesForCompilationUnit.has(descriptor.key))
        ) {
          return null;
        }

        // In batch mode, we eagerly, rather expensively, track all references.
        // We don't know yet if something refers to a different query or not, so we
        // eagerly detect such and later filter those problematic references that
        // turned out to refer to queries (once we have the global metadata).

        return descriptor;
      },
    };

    groupedAstVisitor.register(
      createFindAllSourceFileReferencesVisitor(
        info,
        checker,
        reflector,
        resourceLoader,
        evaluator,
        templateTypeChecker,
        allFieldsOrKnownQueries,
        // In non-batch mode, we know what inputs exist and can optimize the reference
        // resolution significantly (for e.g. VSCode integration)— as we know what
        // field names may be used to reference potential queries.
        this.config.assumeNonBatch
          ? new Set(Array.from(filteredQueriesForCompilationUnit.values()).map((f) => f.fieldName))
          : null,
        referenceResult,
      ).visitor,
    );

    const inheritanceGraph = new InheritanceGraph(checker).expensivePopulate(info.sourceFiles);
    checkIncompatiblePatterns(
      inheritanceGraph,
      checker,
      groupedAstVisitor,
      {
        ...allFieldsOrKnownQueries,
        isFieldIncompatible: (f) =>
          res.potentialProblematicQueries[f.key]?.fieldReason !== null ||
          res.potentialProblematicQueries[f.key]?.classReason !== null,
        markClassIncompatible: (clazz, reason) => {
          for (const field of clazz.members) {
            const key = getUniqueIDForClassProperty(field, info);
            if (key !== null) {
              res.potentialProblematicQueries[key] ??= {classReason: null, fieldReason: null};
              res.potentialProblematicQueries[key].classReason = reason;
            }
          }
        },
        markFieldIncompatible: (f, incompatibility) =>
          markFieldIncompatibleInMetadata(
            res.potentialProblematicQueries,
            f.key,
            incompatibility.reason,
          ),
      },
      () => Array.from(classesWithFilteredQueries),
    );

    this.config.reportProgressFn?.(60, 'Scanning for references and problematic patterns..');
    groupedAstVisitor.execute();

    // Determine incompatible queries based on problematic references
    // we saw in TS code, templates or host bindings.
    for (const ref of referenceResult.references) {
      if (isTsReference(ref) && ref.from.isWrite) {
        markFieldIncompatibleInMetadata(
          res.potentialProblematicQueries,
          ref.target.key,
          FieldIncompatibilityReason.WriteAssignment,
        );
      }
      if ((isTemplateReference(ref) || isHostBindingReference(ref)) && ref.from.isWrite) {
        markFieldIncompatibleInMetadata(
          res.potentialProblematicQueries,
          ref.target.key,
          FieldIncompatibilityReason.WriteAssignment,
        );
      }
      // TODO: Remove this when we support signal narrowing in templates.
      // https://github.com/angular/angular/pull/55456.
      if (isTemplateReference(ref) && ref.from.isLikelyPartOfNarrowing) {
        markFieldIncompatibleInMetadata(
          res.potentialProblematicQueries,
          ref.target.key,
          FieldIncompatibilityReason.PotentiallyNarrowedInTemplateButNoSupportYet,
        );
      }

      // Check for other incompatible query list accesses.
      checkForIncompatibleQueryListAccesses(ref, res);
    }

    if (this.config.assumeNonBatch) {
      res.reusableAnalysisReferences = referenceResult.references;
    }

    return confirmAsSerializable(res);
  }

  override async combine(
    unitA: CompilationUnitData,
    unitB: CompilationUnitData,
  ): Promise<Serializable<CompilationUnitData>> {
    const combined: CompilationUnitData = {
      knownQueryFields: {},
      potentialProblematicQueries: {},
      potentialProblematicReferenceForMultiQueries: {},
      reusableAnalysisReferences: null,
    };

    for (const unit of [unitA, unitB]) {
      for (const [id, value] of Object.entries(unit.knownQueryFields)) {
        combined.knownQueryFields[id as ClassFieldUniqueKey] = value;
      }

      for (const [id, info] of Object.entries(unit.potentialProblematicQueries)) {
        if (info.fieldReason !== null) {
          markFieldIncompatibleInMetadata(
            combined.potentialProblematicQueries,
            id as ClassFieldUniqueKey,
            info.fieldReason,
          );
        }
        if (info.classReason !== null) {
          combined.potentialProblematicQueries[id as ClassFieldUniqueKey] ??= {
            classReason: null,
            fieldReason: null,
          };
          combined.potentialProblematicQueries[id as ClassFieldUniqueKey].classReason =
            info.classReason;
        }
      }

      for (const id of Object.keys(unit.potentialProblematicReferenceForMultiQueries)) {
        combined.potentialProblematicReferenceForMultiQueries[id as ClassFieldUniqueKey] = true;
      }

      if (unit.reusableAnalysisReferences !== null) {
        combined.reusableAnalysisReferences = unit.reusableAnalysisReferences;
      }
    }

    for (const unit of [unitA, unitB]) {
      for (const id of Object.keys(unit.potentialProblematicReferenceForMultiQueries)) {
        if (combined.knownQueryFields[id as ClassFieldUniqueKey]?.isMulti) {
          markFieldIncompatibleInMetadata(
            combined.potentialProblematicQueries,
            id as ClassFieldUniqueKey,
            FieldIncompatibilityReason.SignalQueries__QueryListProblematicFieldAccessed,
          );
        }
      }
    }

    return confirmAsSerializable(combined);
  }

  override async globalMeta(
    combinedData: CompilationUnitData,
  ): Promise<Serializable<GlobalUnitData>> {
    const globalUnitData: GlobalUnitData = {
      knownQueryFields: combinedData.knownQueryFields,
      problematicQueries: combinedData.potentialProblematicQueries,
      reusableAnalysisReferences: combinedData.reusableAnalysisReferences,
    };

    for (const id of Object.keys(combinedData.potentialProblematicReferenceForMultiQueries)) {
      if (combinedData.knownQueryFields[id as ClassFieldUniqueKey]?.isMulti) {
        markFieldIncompatibleInMetadata(
          globalUnitData.problematicQueries,
          id as ClassFieldUniqueKey,
          FieldIncompatibilityReason.SignalQueries__QueryListProblematicFieldAccessed,
        );
      }
    }

    return confirmAsSerializable(globalUnitData);
  }

  override async migrate(globalMetadata: GlobalUnitData, info: ProgramInfo) {
    // Pre-Analyze the program and get access to the template type checker.
    const {templateTypeChecker, metaReader} = info.ngCompiler?.['ensureAnalyzed']() ?? {
      templateTypeChecker: null,
      metaReader: null,
    };
    const resourceLoader = info.ngCompiler?.['resourceManager'] ?? null;

    const {program, sourceFiles} = info;
    const checker = program.getTypeChecker();
    const reflector = new TypeScriptReflectionHost(checker);
    const evaluator = new PartialEvaluator(reflector, checker, null);
    const replacements: Replacement[] = [];
    const importManager = new ImportManager();
    const printer = ts.createPrinter();

    const filesWithSourceQueries = new Map<ts.SourceFile, Set<QueryFunctionName>>();
    const filesWithIncompleteMigration = new Map<ts.SourceFile, Set<QueryFunctionName>>();
    const filesWithQueryListOutsideOfDeclarations = new WeakSet<ts.SourceFile>();

    const knownQueries = new KnownQueries(info, this.config, globalMetadata);
    const referenceResult: ReferenceResult<ClassFieldDescriptor> = {references: []};
    const sourceQueries: ExtractedQuery[] = [];

    // Detect all queries in this unit.
    const queryWholeProgramVisitor = (node: ts.Node) => {
      // Detect all SOURCE queries and migrate them, if possible.
      const extractedQuery = extractSourceQueryDefinition(node, reflector, evaluator, info);
      if (extractedQuery !== null) {
        knownQueries.registerQueryField(extractedQuery.node, extractedQuery.id);
        sourceQueries.push(extractedQuery);
        return;
      }

      // Detect OTHER queries, inside `.d.ts`. Needed for reference resolution below.
      if (
        ts.isPropertyDeclaration(node) ||
        (ts.isAccessor(node) && ts.isClassDeclaration(node.parent))
      ) {
        const classFieldID = getUniqueIDForClassProperty(node, info);
        if (classFieldID !== null && globalMetadata.knownQueryFields[classFieldID] !== undefined) {
          knownQueries.registerQueryField(
            node as typeof node & {parent: ts.ClassDeclaration},
            classFieldID,
          );
          return;
        }
      }

      // Detect potential usages of `QueryList` outside of queries or imports.
      // Those prevent us from removing the import later.
      if (
        ts.isIdentifier(node) &&
        node.text === 'QueryList' &&
        ts.findAncestor(node, ts.isImportDeclaration) === undefined
      ) {
        filesWithQueryListOutsideOfDeclarations.add(node.getSourceFile());
      }

      ts.forEachChild(node, queryWholeProgramVisitor);
    };

    for (const sf of info.fullProgramSourceFiles) {
      ts.forEachChild(sf, queryWholeProgramVisitor);
    }

    // Set of all queries in the program. Useful for speeding up reference
    // lookups below.
    const fieldNamesToConsiderForReferenceLookup = new Set(
      Object.values(globalMetadata.knownQueryFields).map((f) => f.fieldName),
    );

    // Find all references.
    const groupedAstVisitor = new GroupedTsAstVisitor(sourceFiles);

    // Re-use previous reference result if available, instead of
    // looking for references which is quite expensive.
    if (globalMetadata.reusableAnalysisReferences !== null) {
      referenceResult.references = globalMetadata.reusableAnalysisReferences;
    } else {
      groupedAstVisitor.register(
        createFindAllSourceFileReferencesVisitor(
          info,
          checker,
          reflector,
          resourceLoader,
          evaluator,
          templateTypeChecker,
          knownQueries,
          fieldNamesToConsiderForReferenceLookup,
          referenceResult,
        ).visitor,
      );
    }

    // Check inheritance.
    // NOTE: Inheritance is only checked in the migrate stage as we cannot reliably
    // check during analyze— where we don't know what fields from foreign `.d.ts`
    // files refer to queries or not.
    const inheritanceGraph = new InheritanceGraph(checker).expensivePopulate(info.sourceFiles);
    checkInheritanceOfKnownFields(inheritanceGraph, metaReader, knownQueries, {
      getFieldsForClass: (n) => knownQueries.getQueryFieldsOfClass(n) ?? [],
      isClassWithKnownFields: (clazz) => knownQueries.getQueryFieldsOfClass(clazz) !== undefined,
    });

    this.config.reportProgressFn?.(80, 'Checking inheritance..');
    groupedAstVisitor.execute();

    if (this.config.bestEffortMode) {
      filterBestEffortIncompatibilities(knownQueries);
    }

    this.config.reportProgressFn?.(90, 'Migrating queries..');

    // Migrate declarations.
    for (const extractedQuery of sourceQueries) {
      const node = extractedQuery.node;
      const sf = node.getSourceFile();
      const descriptor = {key: extractedQuery.id, node: extractedQuery.node};
      const incompatibility = knownQueries.getIncompatibilityForField(descriptor);

      updateFileState(filesWithSourceQueries, sf, extractedQuery.kind);

      if (incompatibility !== null) {
        // Add a TODO for the incompatible query, if desired.
        if (this.config.insertTodosForSkippedFields) {
          replacements.push(
            ...insertTodoForIncompatibility(node, info, incompatibility, {
              single: 'query',
              plural: 'queries',
            }),
          );
        }

        updateFileState(filesWithIncompleteMigration, sf, extractedQuery.kind);
        continue;
      }

      replacements.push(
        ...computeReplacementsToMigrateQuery(
          node as ts.PropertyDeclaration,
          extractedQuery,
          importManager,
          info,
          printer,
          info.userOptions,
          checker,
        ),
      );
    }

    // Migrate references.
    const referenceMigrationHost: ReferenceMigrationHost<ClassFieldDescriptor> = {
      printer,
      replacements,
      shouldMigrateReferencesToField: (field) => !knownQueries.isFieldIncompatible(field),
      shouldMigrateReferencesToClass: (clazz) =>
        !!knownQueries
          .getQueryFieldsOfClass(clazz)
          ?.some((q) => !knownQueries.isFieldIncompatible(q)),
    };
    migrateTypeScriptReferences(referenceMigrationHost, referenceResult.references, checker, info);
    migrateTemplateReferences(referenceMigrationHost, referenceResult.references);
    migrateHostBindings(referenceMigrationHost, referenceResult.references, info);
    migrateTypeScriptTypeReferences(
      referenceMigrationHost,
      referenceResult.references,
      importManager,
      info,
    );

    // Fix problematic calls, like `QueryList#toArray`, or `QueryList#get`.
    for (const ref of referenceResult.references) {
      removeQueryListToArrayCall(ref, info, globalMetadata, knownQueries, replacements);
      replaceQueryListGetCall(ref, info, globalMetadata, knownQueries, replacements);
      replaceQueryListFirstAndLastReferences(ref, info, globalMetadata, knownQueries, replacements);
    }

    // Remove imports if possible.
    for (const [file, types] of filesWithSourceQueries) {
      let seenIncompatibleMultiQuery = false;

      for (const type of types) {
        const incompatibleQueryTypesForFile = filesWithIncompleteMigration.get(file);

        // Query type is fully migrated. No incompatible queries in file.
        if (!incompatibleQueryTypesForFile?.has(type)) {
          importManager.removeImport(file, queryFunctionNameToDecorator(type), '@angular/core');
        } else if (type === 'viewChildren' || type === 'contentChildren') {
          seenIncompatibleMultiQuery = true;
        }
      }

      if (!seenIncompatibleMultiQuery && !filesWithQueryListOutsideOfDeclarations.has(file)) {
        importManager.removeImport(file, 'QueryList', '@angular/core');
      }
    }

    applyImportManagerChanges(importManager, replacements, sourceFiles, info);

    return {replacements, knownQueries};
  }

  override async stats(globalMetadata: GlobalUnitData) {
    let queriesCount = 0;
    let multiQueries = 0;
    let incompatibleQueries = 0;

    const fieldIncompatibleCounts: Partial<Record<`incompat-field-${string}`, number>> = {};
    const classIncompatibleCounts: Partial<Record<`incompat-class-${string}`, number>> = {};

    for (const query of Object.values(globalMetadata.knownQueryFields)) {
      queriesCount++;
      if (query.isMulti) {
        multiQueries++;
      }
    }

    for (const [id, info] of Object.entries(globalMetadata.problematicQueries)) {
      if (globalMetadata.knownQueryFields[id as ClassFieldUniqueKey] === undefined) {
        continue;
      }

      // Do not count queries that were forcibly ignored via best effort mode.
      if (
        this.config.bestEffortMode &&
        (info.fieldReason === null ||
          !nonIgnorableFieldIncompatibilities.includes(info.fieldReason))
      ) {
        continue;
      }

      incompatibleQueries++;

      if (info.classReason !== null) {
        const reasonName = ClassIncompatibilityReason[info.classReason];
        const key = `incompat-class-${reasonName}` as const;
        classIncompatibleCounts[key] ??= 0;
        classIncompatibleCounts[key]++;
      }

      if (info.fieldReason !== null) {
        const reasonName = FieldIncompatibilityReason[info.fieldReason];
        const key = `incompat-field-${reasonName}` as const;
        fieldIncompatibleCounts[key] ??= 0;
        fieldIncompatibleCounts[key]++;
      }
    }

    return confirmAsSerializable({
      queriesCount,
      multiQueries,
      incompatibleQueries,
      ...fieldIncompatibleCounts,
      ...classIncompatibleCounts,
    });
  }
}

/**
 * Updates the given map to capture the given query type.
 * The map may track migrated queries in a file, or query types
 * that couldn't be migrated.
 */
function updateFileState(
  stateMap: Map<ts.SourceFile, Set<string>>,
  node: ts.Node,
  queryType: QueryFunctionName,
): void {
  const file = node.getSourceFile();
  if (!stateMap.has(file)) {
    stateMap.set(file, new Set());
  }
  stateMap.get(file)!.add(queryType);
}
