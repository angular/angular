/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {UpdateRecorder} from './update_recorder';


export class InitialNavigationTransform {
  private printer = ts.createPrinter();

  constructor(private getUpdateRecorder: (sf: ts.SourceFile) => UpdateRecorder) {}

  /** Migrate the ExtraOptions#InitialNavigation property assignments. */
  migrateInitialNavigationAssignments(literals: ts.PropertyAssignment[]) {
    literals.forEach(l => this.migrateAssignment(l));
  }

  /** Migrate an ExtraOptions#InitialNavigation expression to use the new options format. */
  migrateAssignment(assignment: ts.PropertyAssignment) {
    const newInitializer = getUpdatedInitialNavigationValue(assignment.initializer);
    if (newInitializer) {
      const newAssignment =
          ts.updatePropertyAssignment(assignment, assignment.name, newInitializer);
      this._updateNode(assignment, newAssignment);
    }
  }

  private _updateNode(node: ts.Node, newNode: ts.Node) {
    const newText = this.printer.printNode(ts.EmitHint.Unspecified, newNode, node.getSourceFile());
    const recorder = this.getUpdateRecorder(node.getSourceFile());
    recorder.updateNode(node, newText);
  }
}

/**
 * Updates the deprecated initialNavigation options to their v10 equivalents
 * (or as close as we can get).
 * @param initializer the old initializer to update
 */
function getUpdatedInitialNavigationValue(initializer: ts.Expression): ts.Expression|null {
  const oldText: string|boolean = ts.isStringLiteralLike(initializer) ?
      initializer.text :
      initializer.kind === ts.SyntaxKind.TrueKeyword;
  let newText: string|undefined;
  switch (oldText) {
    case false:
    case 'legacy_disabled':
      newText = 'disabled';
      break;
    case true:
    case 'legacy_enabled':
      newText = 'enabledNonBlocking';
      break;
  }

  return !!newText ? ts.createIdentifier(`'${newText}'`) : null;
}
