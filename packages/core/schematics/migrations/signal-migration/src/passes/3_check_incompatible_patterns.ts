/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {KnownInputs} from '../input_detection/known_inputs';
import {MigrationHost} from '../migration_host';
import {GroupedTsAstVisitor} from '../utils/grouped_ts_ast_visitor';
import {InheritanceGraph} from '../utils/inheritance_graph';
import {checkIncompatiblePatterns} from './problematic_patterns/common_incompatible_patterns';
import {getAngularDecorators} from '@angular/compiler-cli/src/ngtsc/annotations';
import {FieldIncompatibilityReason} from './problematic_patterns/incompatibility';

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
  inheritanceGraph: InheritanceGraph,
  checker: ts.TypeChecker,
  groupedTsAstVisitor: GroupedTsAstVisitor,
  knownInputs: KnownInputs,
) {
  checkIncompatiblePatterns(inheritanceGraph, checker, groupedTsAstVisitor, knownInputs, () =>
    knownInputs.getAllInputContainingClasses(),
  );

  for (const input of knownInputs.knownInputIds.values()) {
    const hostBindingDecorators = getAngularDecorators(
      input.metadata.fieldDecorators,
      ['HostBinding'],
      host.isMigratingCore,
    );

    if (hostBindingDecorators.length > 0) {
      knownInputs.markFieldIncompatible(input.descriptor, {
        context: hostBindingDecorators[0].node,
        reason: FieldIncompatibilityReason.SignalIncompatibleWithHostBinding,
      });
    }
  }
}
