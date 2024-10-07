/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ImportManager, PartialEvaluator} from '@angular/compiler-cli/private/migrations';
import {QueryFunctionName} from '@angular/compiler-cli/src/ngtsc/annotations';
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
import {ClassFieldDescriptor} from '../signal-migration/src';
import {checkInheritanceOfKnownFields} from '../signal-migration/src/passes/problematic_patterns/check_inheritance';
import {checkIncompatiblePatterns} from '../signal-migration/src/passes/problematic_patterns/common_incompatible_patterns';
import {migrateHostBindings} from '../signal-migration/src/passes/reference_migration/migrate_host_bindings';
import {migrateTemplateReferences} from '../signal-migration/src/passes/reference_migration/migrate_template_references';
import {migrateTypeScriptReferences} from '../signal-migration/src/passes/reference_migration/migrate_ts_references';
import {migrateTypeScriptTypeReferences} from '../signal-migration/src/passes/reference_migration/migrate_ts_type_references';
import {ReferenceMigrationHost} from '../signal-migration/src/passes/reference_migration/reference_migration_host';
import {createFindAllSourceFileReferencesVisitor} from '../signal-migration/src/passes/reference_resolution';
import {ClassFieldUniqueKey} from '../signal-migration/src/passes/reference_resolution/known_fields';
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

export interface CompilationUnitData {
  knownQueryFields: Record<ClassFieldUniqueKey, {fieldName: string; isMulti: boolean}>;

  // Potential queries problematic. We don't know what fields are queries during
  // analysis, so this is very eagerly tracking all potential problematic "class fields".
  potentialProblematicQueries: Record<ClassFieldUniqueKey, true>;

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
  problematicQueries: Record<ClassFieldUniqueKey, true>;

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
    assert(info.ngCompiler !== null, 'Expected queries migration to have an Angular program.');

    // Pre-Analyze the program and get access to the template type checker.
    const {templateTypeChecker} = info.ngCompiler['ensureAnalyzed']();

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
    const classesWithFilteredQueries = new WeakSet<ts.ClassLikeDeclaration>();
    const filteredQueriesForCompilationUnit = new Map<ClassFieldUniqueKey, {fieldName: string}>();

    const findQueryDefinitionsVisitor = (node: ts.Node) => {
      const extractedQuery = extractSourceQueryDefinition(node, reflector, evaluator, info);
      if (extractedQuery !== null) {
        const descriptor = {
          key: extractedQuery.id,
          node: extractedQuery.node,
        };
        const containingFile = projectFile(descriptor.node.getSourceFile(), info);

        if (
          this.config.shouldMigrateQuery === undefined ||
          this.config.shouldMigrateQuery(descriptor, containingFile)
        ) {
          classesWithFilteredQueries.add(extractedQuery.node.parent);
          filteredQueriesForCompilationUnit.set(extractedQuery.id, {
            fieldName: extractedQuery.queryInfo.propertyName,
          });
        }

        res.knownQueryFields[extractedQuery.id] = {
          fieldName: extractedQuery.queryInfo.propertyName,
          isMulti: extractedQuery.queryInfo.first === false,
        };
      }
    };

    groupedAstVisitor.register(findQueryDefinitionsVisitor);
    if (this.config.assumeNonBatch) {
      // In non-batch, we need to find queries before, so we can perform
      // improved reference resolution.
      this.config.reportProgressFn?.(20, 'Scanning for queries..');
      groupedAstVisitor.execute();
      this.config.reportProgressFn?.(30, 'Scanning for references..');
    } else {
      this.config.reportProgressFn?.(20, 'Scanning for queries and references..');
    }

    groupedAstVisitor.register(
      createFindAllSourceFileReferencesVisitor(
        info,
        checker,
        reflector,
        info.ngCompiler['resourceManager'],
        evaluator,
        templateTypeChecker,
        {
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
              descriptor !== null &&
              !filteredQueriesForCompilationUnit.has(descriptor.key)
            ) {
              return null;
            }

            // TODO: Also consider skipping if we know this cannot be a query.
            // e.g. missing class decorators or some other checks.

            // In batch mode, we eagerly, rather expensively, track all references.
            // We don't know yet if something refers to a different query or not, so we
            // eagerly detect such and later filter those problematic references that
            // turned out to refer to queries (once we have the global metadata).

            return descriptor;
          },
        },
        // In non-batch mode, we know what inputs exist and can optimize the reference
        // resolution significantly (for e.g. VSCode integration)— as we know what
        // field names may be used to reference potential queries.
        this.config.assumeNonBatch
          ? new Set(Array.from(filteredQueriesForCompilationUnit.values()).map((f) => f.fieldName))
          : null,
        referenceResult,
      ).visitor,
    );
    groupedAstVisitor.execute();

    // Determine incompatible queries based on problematic references
    // we saw in TS code, templates or host bindings.
    for (const ref of referenceResult.references) {
      if (isTsReference(ref) && ref.from.isWrite) {
        res.potentialProblematicQueries[ref.target.key] = true;
      }
      if ((isTemplateReference(ref) || isHostBindingReference(ref)) && ref.from.isWrite) {
        res.potentialProblematicQueries[ref.target.key] = true;
      }
      // TODO: Remove this when we support signal narrowing in templates.
      // https://github.com/angular/angular/pull/55456.
      if (isTemplateReference(ref) && ref.from.isLikelyPartOfNarrowing) {
        res.potentialProblematicQueries[ref.target.key] = true;
      }

      // Check for other incompatible query list accesses.
      checkForIncompatibleQueryListAccesses(ref, res);
    }

    if (this.config.assumeNonBatch) {
      res.reusableAnalysisReferences = referenceResult.references;
    }

    return confirmAsSerializable(res);
  }

  override async merge(units: CompilationUnitData[]): Promise<Serializable<GlobalUnitData>> {
    const merged: GlobalUnitData = {
      knownQueryFields: {},
      problematicQueries: {},
      reusableAnalysisReferences: null,
    };
    for (const unit of units) {
      for (const [id, value] of Object.entries(unit.knownQueryFields)) {
        merged.knownQueryFields[id as ClassFieldUniqueKey] = value;
      }
      for (const id of Object.keys(unit.potentialProblematicQueries)) {
        merged.problematicQueries[id as ClassFieldUniqueKey] = true;
      }
      if (unit.reusableAnalysisReferences !== null) {
        assert(units.length === 1, 'Expected migration to not run in batch mode');
        merged.reusableAnalysisReferences = unit.reusableAnalysisReferences;
      }
    }

    for (const unit of units) {
      for (const id of Object.keys(unit.potentialProblematicReferenceForMultiQueries)) {
        if (merged.knownQueryFields[id as ClassFieldUniqueKey]?.isMulti) {
          merged.problematicQueries[id as ClassFieldUniqueKey] = true;
        }
      }
    }

    return confirmAsSerializable(merged);
  }

  override async migrate(globalMetadata: GlobalUnitData, info: ProgramInfo) {
    assert(info.ngCompiler !== null, 'Expected queries migration to have an Angular program.');

    // Pre-Analyze the program and get access to the template type checker.
    const {templateTypeChecker, metaReader} = info.ngCompiler['ensureAnalyzed']();
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

    const knownQueries = new KnownQueries(info, globalMetadata);
    const referenceResult: ReferenceResult<ClassFieldDescriptor> = {references: []};
    const sourceQueries: ExtractedQuery[] = [];

    const isMigratedQuery = (descriptor: ClassFieldDescriptor) =>
      globalMetadata.knownQueryFields[descriptor.key] !== undefined &&
      globalMetadata.problematicQueries[descriptor.key] === undefined &&
      (this.config.shouldMigrateQuery === undefined ||
        this.config.shouldMigrateQuery(
          descriptor,
          projectFile(descriptor.node.getSourceFile(), info),
        ));

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
      if (ts.isPropertyDeclaration(node)) {
        const classFieldID = getUniqueIDForClassProperty(node, info);
        if (classFieldID !== null && globalMetadata.knownQueryFields[classFieldID] !== undefined) {
          knownQueries.registerQueryField(node, classFieldID);
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

    this.config.reportProgressFn?.(40, 'Tracking query declarations..');

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
          info.ngCompiler['resourceManager'],
          evaluator,
          templateTypeChecker,
          knownQueries,
          fieldNamesToConsiderForReferenceLookup,
          referenceResult,
        ).visitor,
      );
    }

    const inheritanceGraph = new InheritanceGraph(checker).expensivePopulate(info.sourceFiles);
    checkIncompatiblePatterns(inheritanceGraph, checker, groupedAstVisitor, knownQueries, () =>
      knownQueries.getAllClassesWithQueries(),
    );

    this.config.reportProgressFn?.(60, 'Checking for problematic patterns..');
    groupedAstVisitor.execute();

    // Check inheritance.
    this.config.reportProgressFn?.(70, 'Checking for inheritance patterns..');
    checkInheritanceOfKnownFields(inheritanceGraph, metaReader, knownQueries, {
      getFieldsForClass: (n) => knownQueries.getQueryFieldsOfClass(n) ?? [],
      isClassWithKnownFields: (clazz) => knownQueries.getQueryFieldsOfClass(clazz) !== undefined,
    });

    this.config.reportProgressFn?.(80, 'Migrating queries..');

    // Migrate declarations.
    for (const extractedQuery of sourceQueries) {
      const node = extractedQuery.node;
      const sf = node.getSourceFile();
      const descriptor = {key: extractedQuery.id, node: extractedQuery.node};

      if (!isMigratedQuery(descriptor)) {
        updateFileState(filesWithSourceQueries, sf, extractedQuery.kind);
        updateFileState(filesWithIncompleteMigration, sf, extractedQuery.kind);
        continue;
      }
      updateFileState(filesWithSourceQueries, sf, extractedQuery.kind);

      replacements.push(
        ...computeReplacementsToMigrateQuery(
          node as ts.PropertyDeclaration,
          extractedQuery,
          importManager,
          info,
          printer,
        ),
      );
    }

    // Migrate references.
    const referenceMigrationHost: ReferenceMigrationHost<ClassFieldDescriptor> = {
      printer,
      replacements,
      shouldMigrateReferencesToField: (field) => isMigratedQuery(field),
      shouldMigrateReferencesToClass: (clazz) =>
        !!knownQueries.getQueryFieldsOfClass(clazz)?.some((q) => isMigratedQuery(q)),
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
      removeQueryListToArrayCall(ref, info, globalMetadata, replacements);
      replaceQueryListGetCall(ref, info, globalMetadata, replacements);
      replaceQueryListFirstAndLastReferences(ref, info, globalMetadata, replacements);
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

  override async stats(globalMetadata: GlobalUnitData): Promise<MigrationStats> {
    // TODO: Add statistics.
    return {counters: {}};
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
