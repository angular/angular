/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {unwrapExpression} from '@angular/compiler-cli/src/ngtsc/annotations/common';
import assert from 'assert';
import ts from 'typescript';
import {ClassIncompatibilityReason} from './incompatibility';
import {SpyOnFieldPattern} from '../../pattern_advisors/spy_on_pattern';
import {getMemberName} from '../../utils/class_member_names';
import {GroupedTsAstVisitor} from '../../utils/grouped_ts_ast_visitor';
import {InheritanceGraph} from '../../utils/inheritance_graph';
import {ClassFieldDescriptor, KnownFields} from '../reference_resolution/known_fields';
import {ProblematicFieldRegistry} from './problematic_field_registry';

/**
 * Phase where problematic patterns are detected and advise
 * the migration to skip certain inputs.
 *
 * For example, detects classes that are instantiated manually. Those
 * cannot be migrated as `input()` requires an injection context.
 *
 * In addition, spying onto an input may be problematic- so we skip migrating
 * such.
 */
export function checkIncompatiblePatterns<D extends ClassFieldDescriptor>(
  inheritanceGraph: InheritanceGraph,
  checker: ts.TypeChecker,
  groupedTsAstVisitor: GroupedTsAstVisitor,
  fields: KnownFields<D> & ProblematicFieldRegistry<D>,
  getAllClassesWithKnownFields: () => ts.ClassDeclaration[],
) {
  const inputClassSymbolsToClass = new Map<ts.Symbol, ts.ClassDeclaration>();

  for (const knownFieldClass of getAllClassesWithKnownFields()) {
    const classSymbol = checker.getTypeAtLocation(knownFieldClass).symbol;

    assert(
      classSymbol != null,
      'Expected a symbol to exist for the container of known field class.',
    );
    assert(
      classSymbol.valueDeclaration !== undefined,
      'Expected declaration to exist for known field class.',
    );
    assert(
      ts.isClassDeclaration(classSymbol.valueDeclaration),
      'Expected declaration to be a class.',
    );

    // track class symbol for derived class checks.
    inputClassSymbolsToClass.set(classSymbol, classSymbol.valueDeclaration);
  }

  const spyOnPattern = new SpyOnFieldPattern(checker, fields);

  const visitor = (node: ts.Node) => {
    // Check for manual class instantiations.
    if (ts.isNewExpression(node) && ts.isIdentifier(unwrapExpression(node.expression))) {
      let newTarget = checker.getSymbolAtLocation(unwrapExpression(node.expression));
      // Plain identifier references can point to alias symbols (e.g. imports).
      if (newTarget !== undefined && newTarget.flags & ts.SymbolFlags.Alias) {
        newTarget = checker.getAliasedSymbol(newTarget);
      }
      if (newTarget && inputClassSymbolsToClass.has(newTarget)) {
        fields.markClassIncompatible(
          inputClassSymbolsToClass.get(newTarget)!,
          ClassIncompatibilityReason.ClassManuallyInstantiated,
        );
      }
    }

    // Detect `spyOn` problematic usages and record them.
    spyOnPattern.detect(node);

    const insidePropertyDeclaration = groupedTsAstVisitor.state.insidePropertyDeclaration;
    // Check for problematic class references inside property declarations.
    // These are likely problematic, causing type conflicts, if the containing
    // class inherits a non-input member with the same name.
    // Suddenly the derived class changes its signature, but the base class may not.
    problematicReferencesCheck: if (
      insidePropertyDeclaration !== null &&
      ts.isIdentifier(node) &&
      insidePropertyDeclaration.parent.heritageClauses !== undefined
    ) {
      let newTarget = checker.getSymbolAtLocation(unwrapExpression(node));
      // Plain identifier references can point to alias symbols (e.g. imports).
      if (newTarget !== undefined && newTarget.flags & ts.SymbolFlags.Alias) {
        newTarget = checker.getAliasedSymbol(newTarget);
      }
      if (newTarget && inputClassSymbolsToClass.has(newTarget)) {
        const memberName = getMemberName(insidePropertyDeclaration);
        if (memberName === null) {
          break problematicReferencesCheck;
        }
        const {derivedMembers, inherited} = inheritanceGraph.checkOverlappingMembers(
          insidePropertyDeclaration.parent,
          insidePropertyDeclaration,
          memberName,
        );

        // Member is not inherited, or derived.
        // Hence the reference is unproblematic and is expected to not
        // cause any type conflicts.
        if (derivedMembers.length === 0 && inherited === undefined) {
          break problematicReferencesCheck;
        }

        fields.markClassIncompatible(
          inputClassSymbolsToClass.get(newTarget)!,
          ClassIncompatibilityReason.OwningClassReferencedInClassProperty,
        );
      }
    }
  };

  groupedTsAstVisitor.register(visitor);
}
