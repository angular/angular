/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Expression, Type} from '@angular/compiler';
import * as ts from 'typescript';

import {Decorator, reflectDecorator} from '../../metadata';

import {AddStaticFieldInstruction, AnalysisOutput, CompilerAdapter} from './api';
import {DtsFileTransformer} from './declaration';
import {ImportManager, translateType} from './translator';


/**
 * Record of an adapter which decided to emit a static field, and the analysis it performed to
 * prepare for that operation.
 */
interface EmitFieldOperation<T> {
  adapter: CompilerAdapter<T>;
  analysis: AnalysisOutput<T>;
  decorator: ts.Decorator;
}

/**
 * Manages a compilation of Ivy decorators into static fields across an entire ts.Program.
 *
 * The compilation is stateful - source files are analyzed and records of the operations that need
 * to be performed during the transform/emit process are maintained internally.
 */
export class IvyCompilation {
  /**
   * Tracks classes which have been analyzed and found to have an Ivy decorator, and the
   * information recorded about them for later compilation.
   */
  private analysis = new Map<ts.ClassDeclaration, EmitFieldOperation<any>>();

  /**
   * Tracks the `DtsFileTransformer`s for each TS file that needs .d.ts transformations.
   */
  private dtsMap = new Map<string, DtsFileTransformer>();

  constructor(private adapters: CompilerAdapter<any>[], private checker: ts.TypeChecker) {}

  /**
   * Analyze a source file and produce diagnostics for it (if any).
   */
  analyze(sf: ts.SourceFile): ts.Diagnostic[] {
    const diagnostics: ts.Diagnostic[] = [];
    const visit = (node: ts.Node) => {
      // Process nodes recursively, and look for class declarations with decorators.
      if (ts.isClassDeclaration(node) && node.decorators !== undefined) {
        // The first step is to reflect the decorators, which will identify decorators
        // that are imported from another module.
        const decorators =
            node.decorators.map(decorator => reflectDecorator(decorator, this.checker))
                .filter(decorator => decorator !== null) as Decorator[];

        // Look through the CompilerAdapters to see if any are relevant.
        this.adapters.forEach(adapter => {
          // An adapter is relevant if it matches one of the decorators on the class.
          const decorator = adapter.detect(decorators);
          if (decorator === undefined) {
            return;
          }

          // Check for multiple decorators on the same node. Technically speaking this
          // could be supported, but right now it's an error.
          if (this.analysis.has(node)) {
            throw new Error('TODO.Diagnostic: Class has multiple Angular decorators.');
          }

          // Run analysis on the decorator. This will produce either diagnostics, an
          // analysis result, or both.
          const analysis = adapter.analyze(node, decorator);
          if (analysis.diagnostics !== undefined) {
            diagnostics.push(...analysis.diagnostics);
          }
          if (analysis.analysis !== undefined) {
            this.analysis.set(node, {
              adapter,
              analysis: analysis.analysis,
              decorator: decorator.node,
            });
          }
        });
      }

      ts.forEachChild(node, visit);
    };

    visit(sf);
    return diagnostics;
  }

  /**
   * Perform a compilation operation on the given class declaration and return instructions to an
   * AST transformer if any are available.
   */
  compileIvyFieldFor(node: ts.ClassDeclaration): AddStaticFieldInstruction|undefined {
    // Look to see whether the original node was analyzed. If not, there's nothing to do.
    const original = ts.getOriginalNode(node) as ts.ClassDeclaration;
    if (!this.analysis.has(original)) {
      return undefined;
    }
    const op = this.analysis.get(original) !;

    // Run the actual compilation, which generates an Expression for the Ivy field.
    const res = op.adapter.compile(node, op.analysis);

    // Look up the .d.ts transformer for the input file and record that a field was generated,
    // which will allow the .d.ts to be transformed later.
    const fileName = node.getSourceFile().fileName;
    const dtsTransformer = this.getDtsTransformer(fileName);
    dtsTransformer.recordStaticField(node.name !.text, res);

    // Return the instruction to the transformer so the field will be added.
    return res;
  }

  /**
   * Lookup the `ts.Decorator` which triggered transformation of a particular class declaration.
   */
  ivyDecoratorFor(node: ts.ClassDeclaration): ts.Decorator|undefined {
    const original = ts.getOriginalNode(node) as ts.ClassDeclaration;
    if (!this.analysis.has(original)) {
      return undefined;
    }

    return this.analysis.get(original) !.decorator;
  }

  /**
   * Process a .d.ts source string and return a transformed version that incorporates the changes
   * made to the source file.
   */
  transformedDtsFor(tsFileName: string, dtsOriginalSource: string): string {
    // No need to transform if no changes have been requested to the input file.
    if (!this.dtsMap.has(tsFileName)) {
      return dtsOriginalSource;
    }

    // Return the transformed .d.ts source.
    return this.dtsMap.get(tsFileName) !.transform(dtsOriginalSource);
  }

  private getDtsTransformer(tsFileName: string): DtsFileTransformer {
    if (!this.dtsMap.has(tsFileName)) {
      this.dtsMap.set(tsFileName, new DtsFileTransformer());
    }
    return this.dtsMap.get(tsFileName) !;
  }
}
