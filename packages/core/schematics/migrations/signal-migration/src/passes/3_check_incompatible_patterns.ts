/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import assert from 'assert';
import ts from 'typescript';
import {unwrapExpression} from '../../../../../../compiler-cli/src/ngtsc/annotations/common';
import {ClassIncompatibilityReason} from '../input_detection/incompatibility';
import {KnownInputs} from '../input_detection/known_inputs';
import {getMemberName} from '../utils/class_member_names';
import {InheritanceGraph} from '../utils/inheritance_graph';
import {SpyOnInputPattern} from '../pattern_advisors/spy_on_pattern';
import {MigrationHost} from '../migration_host';

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
export function pass3__checkIncompatiblePatterns(
  host: MigrationHost,
  files: readonly ts.SourceFile[],
  inheritanceGraph: InheritanceGraph,
  checker: ts.TypeChecker,
  knownInputs: KnownInputs,
) {
  const inputClassSymbolsToClass = new Map<ts.Symbol, ts.ClassDeclaration>();

  for (const input of knownInputs.getAllInputContainingClasses()) {
    const classSymbol = checker.getTypeAtLocation(input).symbol;

    assert(classSymbol != null, 'Expected a symbol to exist for the container of input.');
    assert(classSymbol.valueDeclaration !== undefined, 'Expected declaration to exist for input.');
    assert(
      ts.isClassDeclaration(classSymbol.valueDeclaration),
      'Expected declaration to be a class.',
    );

    // track class symbol for derived class checks.
    inputClassSymbolsToClass.set(classSymbol, classSymbol.valueDeclaration);
  }

  const incompatibilityPatterns = [new SpyOnInputPattern(host, checker, knownInputs)];

  let insidePropertyDeclaration: ts.PropertyDeclaration | null = null;
  const visitor = (node: ts.Node) => {
    // Check for manual class instantiations.
    if (ts.isNewExpression(node) && ts.isIdentifier(unwrapExpression(node.expression))) {
      let newTarget = checker.getSymbolAtLocation(unwrapExpression(node.expression));
      // Plain identifier references can point to alias symbols (e.g. imports).
      if (newTarget !== undefined && newTarget.flags & ts.SymbolFlags.Alias) {
        newTarget = checker.getAliasedSymbol(newTarget);
      }
      if (newTarget && inputClassSymbolsToClass.has(newTarget)) {
        knownInputs.markDirectiveAsIncompatible(
          inputClassSymbolsToClass.get(newTarget)!,
          ClassIncompatibilityReason.ClassManuallyInstantiated,
        );
      }
    }

    // Detect possible problematic patterns.
    incompatibilityPatterns.forEach((p) => p.detect(node));

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

        knownInputs.markDirectiveAsIncompatible(
          inputClassSymbolsToClass.get(newTarget)!,
          ClassIncompatibilityReason.ClassReferencedInPotentiallyBadLocation,
        );
      }
    }

    if (ts.isPropertyDeclaration(node)) {
      const oldPropertyDeclaration = insidePropertyDeclaration;
      insidePropertyDeclaration = node;
      ts.forEachChild(node, visitor);
      insidePropertyDeclaration = oldPropertyDeclaration;
    } else {
      ts.forEachChild(node, visitor);
    }
  };

  files.forEach((f) => ts.forEachChild(f, visitor));
}
