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
}

export interface GlobalUnitData {
  knownQueryFields: Record<ClassFieldUniqueKey, {fieldName: string; isMulti: boolean}>;
  problematicQueries: Record<ClassFieldUniqueKey, true>;
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
    // TODO: This stage for this migration doesn't necessarily need a full
    // compilation unit program.

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
    };
    const groupedAstVisitor = new GroupedTsAstVisitor(sourceFiles);
    const referenceResult: ReferenceResult<ClassFieldDescriptor> = {references: []};

    const findQueryDefinitionsVisitor = (node: ts.Node) => {
      const extractedQuery = extractSourceQueryDefinition(node, reflector, evaluator, info);
      if (extractedQuery !== null) {
        res.knownQueryFields[extractedQuery.id] = {
          fieldName: extractedQuery.queryInfo.propertyName,
          isMulti: extractedQuery.queryInfo.first === false,
        };
      }
    };

    groupedAstVisitor.register(findQueryDefinitionsVisitor);
    groupedAstVisitor.register(
      createFindAllSourceFileReferencesVisitor(
        info,
        checker,
        reflector,
        info.ngCompiler['resourceManager'],
        evaluator,
        templateTypeChecker,
        // Eager, rather expensive tracking of all references.
        // We don't know yet if something refers to a different query or not, so we
        // eagerly detect such and later filter those problematic references that
        // turned out to refer to queries.
        // TODO: Consider skipping this extra work when running in non-batch mode.
        // TODO: Also consider skipping if we know this query cannot be part.
        {
          shouldTrackClassReference: (_class) => false,
          attemptRetrieveDescriptorFromSymbol: (s) => getClassFieldDescriptorForSymbol(s, info),
        },
        null,
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

    return confirmAsSerializable(res);
  }

  override async merge(units: CompilationUnitData[]): Promise<Serializable<GlobalUnitData>> {
    const merged: GlobalUnitData = {
      knownQueryFields: {},
      problematicQueries: {},
    };
    for (const unit of units) {
      for (const [id, value] of Object.entries(unit.knownQueryFields)) {
        merged.knownQueryFields[id as ClassFieldUniqueKey] = value;
      }
      for (const id of Object.keys(unit.potentialProblematicQueries)) {
        merged.problematicQueries[id as ClassFieldUniqueKey] = true;
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

  override async migrate(
    globalMetadata: GlobalUnitData,
    info: ProgramInfo,
  ): Promise<Replacement[]> {
    assert(info.ngCompiler !== null, 'Expected queries migration to have an Angular program.');

    // Pre-Analyze the program and get access to the template type checker.
    const {templateTypeChecker, metaReader} = await info.ngCompiler['ensureAnalyzed']();
    const {program, sourceFiles} = info;
    const checker = program.getTypeChecker();
    const reflector = new TypeScriptReflectionHost(checker);
    const evaluator = new PartialEvaluator(reflector, checker, null);
    const replacements: Replacement[] = [];
    const importManager = new ImportManager();
    const printer = ts.createPrinter();

    const filesWithMigratedQueries = new Map<ts.SourceFile, Set<QueryFunctionName>>();
    const filesWithIncompleteMigration = new Map<ts.SourceFile, Set<QueryFunctionName>>();
    const filesWithUnrelatedQueryListImports = new WeakSet<ts.SourceFile>();

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
        filesWithUnrelatedQueryListImports.add(node.getSourceFile());
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

    const inheritanceGraph = new InheritanceGraph(checker).expensivePopulate(info.sourceFiles);
    checkIncompatiblePatterns(inheritanceGraph, checker, groupedAstVisitor, knownQueries, () =>
      knownQueries.getAllClassesWithQueries(),
    );
    groupedAstVisitor.execute();

    // Check inheritance.
    checkInheritanceOfKnownFields(inheritanceGraph, metaReader, knownQueries, {
      getFieldsForClass: (n) => knownQueries.getQueryFieldsOfClass(n) ?? [],
      isClassWithKnownFields: (clazz) => knownQueries.getQueryFieldsOfClass(clazz) !== undefined,
    });

    // Migrate declarations.
    for (const extractedQuery of sourceQueries) {
      const node = extractedQuery.node;
      const sf = node.getSourceFile();
      const descriptor = {key: extractedQuery.id, node: extractedQuery.node};

      if (!isMigratedQuery(descriptor)) {
        updateFileState(filesWithIncompleteMigration, sf, extractedQuery.kind);
        continue;
      }
      updateFileState(filesWithMigratedQueries, sf, extractedQuery.kind);

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
    for (const [file, types] of filesWithMigratedQueries) {
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

      if (!seenIncompatibleMultiQuery && !filesWithUnrelatedQueryListImports.has(file)) {
        importManager.removeImport(file, 'QueryList', '@angular/core');
      }
    }

    applyImportManagerChanges(importManager, replacements, sourceFiles, info);

    return replacements;
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
