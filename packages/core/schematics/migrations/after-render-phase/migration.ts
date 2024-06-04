/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {ChangeTracker} from '../../utils/change_tracker';
import {getImportOfIdentifier, getImportSpecifier} from '../../utils/typescript/imports';

const CORE = '@angular/core';
const AFTER_RENDER_PHASE_ENUM = 'AfterRenderPhase';
const AFTER_RENDER_FNS = new Set(['afterRender', 'afterNextRender']);

type RewriteFn = (startPos: number, width: number, text: string) => void;

export function migrateFile(
  sourceFile: ts.SourceFile,
  typeChecker: ts.TypeChecker,
  rewriteFn: RewriteFn,
) {
  const changeTracker = new ChangeTracker(ts.createPrinter());
  const phaseEnum = getImportSpecifier(sourceFile, CORE, AFTER_RENDER_PHASE_ENUM);

  // Check if there are any imports of the `AfterRenderPhase` enum.
  if (phaseEnum) {
    // Remove the `AfterRenderPhase` enum import.
    changeTracker.removeNode(phaseEnum);
    ts.forEachChild(sourceFile, function visit(node: ts.Node) {
      ts.forEachChild(node, visit);

      // Check if this is a function call of `afterRender` or `afterNextRender`.
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        AFTER_RENDER_FNS.has(getImportOfIdentifier(typeChecker, node.expression)?.name || '')
      ) {
        let phase: string | undefined;
        const [callback, options] = node.arguments;
        // Check if any `AfterRenderOptions` options were specified.
        if (ts.isObjectLiteralExpression(options)) {
          const phaseProp = options.properties.find((p) => p.name?.getText() === 'phase');
          // Check if the `phase` options is set.
          if (
            phaseProp &&
            ts.isPropertyAssignment(phaseProp) &&
            ts.isPropertyAccessExpression(phaseProp.initializer) &&
            phaseProp.initializer.expression.getText() === AFTER_RENDER_PHASE_ENUM
          ) {
            phaseProp.initializer.expression;
            phase = phaseProp.initializer.name.getText();
            // Remove the `phase` option.
            if (options.properties.length === 1) {
              changeTracker.removeNode(options);
            } else {
              const newOptions = ts.factory.createObjectLiteralExpression(
                options.properties.filter((p) => p !== phaseProp),
              );
              changeTracker.replaceNode(options, newOptions);
            }
          }
        }
        // If we found a phase, update the callback.
        if (phase) {
          phase = phase.substring(0, 1).toLocaleLowerCase() + phase.substring(1);
          const spec = ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment(ts.factory.createIdentifier(phase), callback),
          ]);
          changeTracker.replaceNode(callback, spec);
        }
      }
    });
  }

  // Write the changes.
  for (const changesInFile of changeTracker.recordChanges().values()) {
    for (const change of changesInFile) {
      rewriteFn(change.start, change.removeLength ?? 0, change.text);
    }
  }
}
