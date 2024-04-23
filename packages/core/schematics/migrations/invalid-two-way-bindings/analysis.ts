/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {dirname, join} from 'path';
import ts from 'typescript';

/**
 * Represents a range of text within a file. Omitting the end
 * means that it's until the end of the file.
 */
type Range = [start: number, end?: number];

/** Represents a file that was analyzed by the migration. */
export class AnalyzedFile {
  private ranges: Range[] = [];

  /** Returns the ranges in the order in which they should be migrated. */
  getSortedRanges(): Range[] {
    return this.ranges.slice().sort(([aStart], [bStart]) => bStart - aStart);
  }

  /**
   * Adds a text range to an `AnalyzedFile`.
   * @param path Path of the file.
   * @param analyzedFiles Map keeping track of all the analyzed files.
   * @param range Range to be added.
   */
  static addRange(path: string, analyzedFiles: Map<string, AnalyzedFile>, range: Range): void {
    let analysis = analyzedFiles.get(path);

    if (!analysis) {
      analysis = new AnalyzedFile();
      analyzedFiles.set(path, analysis);
    }

    const duplicate = analysis.ranges.find(
      (current) => current[0] === range[0] && current[1] === range[1],
    );

    if (!duplicate) {
      analysis.ranges.push(range);
    }
  }
}

/**
 * Analyzes a source file to find file that need to be migrated and the text ranges within them.
 * @param sourceFile File to be analyzed.
 * @param analyzedFiles Map in which to store the results.
 */
export function analyze(sourceFile: ts.SourceFile, analyzedFiles: Map<string, AnalyzedFile>) {
  forEachClass(sourceFile, (node) => {
    // Note: we have a utility to resolve the Angular decorators from a class declaration already.
    // We don't use it here, because it requires access to the type checker which makes it more
    // time-consuming to run internally.
    const decorator = ts.getDecorators(node)?.find((dec) => {
      return (
        ts.isCallExpression(dec.expression) &&
        ts.isIdentifier(dec.expression.expression) &&
        dec.expression.expression.text === 'Component'
      );
    }) as (ts.Decorator & {expression: ts.CallExpression}) | undefined;

    const metadata =
      decorator &&
      decorator.expression.arguments.length > 0 &&
      ts.isObjectLiteralExpression(decorator.expression.arguments[0])
        ? decorator.expression.arguments[0]
        : null;

    if (!metadata) {
      return;
    }

    for (const prop of metadata.properties) {
      // All the properties we care about should have static
      // names and be initialized to a static string.
      if (
        !ts.isPropertyAssignment(prop) ||
        !ts.isStringLiteralLike(prop.initializer) ||
        (!ts.isIdentifier(prop.name) && !ts.isStringLiteralLike(prop.name))
      ) {
        continue;
      }

      switch (prop.name.text) {
        case 'template':
          // +1/-1 to exclude the opening/closing characters from the range.
          AnalyzedFile.addRange(sourceFile.fileName, analyzedFiles, [
            prop.initializer.getStart() + 1,
            prop.initializer.getEnd() - 1,
          ]);
          break;

        case 'templateUrl':
          // Leave the end as undefined which means that the range is until the end of the file.
          const path = join(dirname(sourceFile.fileName), prop.initializer.text);
          AnalyzedFile.addRange(path, analyzedFiles, [0]);
          break;
      }
    }
  });
}

/** Executes a callback on each class declaration in a file. */
function forEachClass(sourceFile: ts.SourceFile, callback: (node: ts.ClassDeclaration) => void) {
  sourceFile.forEachChild(function walk(node) {
    if (ts.isClassDeclaration(node)) {
      callback(node);
    }
    node.forEachChild(walk);
  });
}
