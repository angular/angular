/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConstantPool} from '@angular/compiler';
import * as ts from 'typescript';

import {FatalDiagnosticError} from '../../diagnostics';
import {Decorator, ReflectionHost} from '../../host';
import {reflectNameOfDeclaration} from '../../metadata/src/reflector';
import {TypeCheckContext} from '../../typecheck';

import {AnalysisOutput, CompileResult, DecoratorHandler} from './api';
import {DtsFileTransformer} from './declaration';


/**
 * Record of an adapter which decided to emit a static field, and the analysis it performed to
 * prepare for that operation.
 */
interface EmitFieldOperation<A, M> {
  adapter: DecoratorHandler<A, M>;
  analysis: AnalysisOutput<A>;
  metadata: M;
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
  private analysis = new Map<ts.Declaration, EmitFieldOperation<any, any>>();
  private typeCheckMap = new Map<ts.Declaration, DecoratorHandler<any, any>>();

  /**
   * Tracks factory information which needs to be generated.
   */

  /**
   * Tracks the `DtsFileTransformer`s for each TS file that needs .d.ts transformations.
   */
  private dtsMap = new Map<string, DtsFileTransformer>();
  private _diagnostics: ts.Diagnostic[] = [];


  /**
   * @param handlers array of `DecoratorHandler`s which will be executed against each class in the
   * program
   * @param checker TypeScript `TypeChecker` instance for the program
   * @param reflector `ReflectionHost` through which all reflection operations will be performed
   * @param coreImportsFrom a TypeScript `SourceFile` which exports symbols needed for Ivy imports
   * when compiling @angular/core, or `null` if the current program is not @angular/core. This is
   * `null` in most cases.
   */
  constructor(
      private handlers: DecoratorHandler<any, any>[], private checker: ts.TypeChecker,
      private reflector: ReflectionHost, private coreImportsFrom: ts.SourceFile|null,
      private sourceToFactorySymbols: Map<string, Set<string>>|null) {}


  analyzeSync(sf: ts.SourceFile): void { return this.analyze(sf, false); }

  analyzeAsync(sf: ts.SourceFile): Promise<void>|undefined { return this.analyze(sf, true); }

  /**
   * Analyze a source file and produce diagnostics for it (if any).
   */
  private analyze(sf: ts.SourceFile, preanalyze: false): undefined;
  private analyze(sf: ts.SourceFile, preanalyze: true): Promise<void>|undefined;
  private analyze(sf: ts.SourceFile, preanalyze: boolean): Promise<void>|undefined {
    const promises: Promise<void>[] = [];

    const analyzeClass = (node: ts.Declaration): void => {
      // The first step is to reflect the decorators.
      const classDecorators = this.reflector.getDecoratorsOfDeclaration(node);

      // Look through the DecoratorHandlers to see if any are relevant.
      this.handlers.forEach(adapter => {

        // An adapter is relevant if it matches one of the decorators on the class.
        const metadata = adapter.detect(node, classDecorators);
        if (metadata === undefined) {
          return;
        }

        const completeAnalysis = () => {
          // Check for multiple decorators on the same node. Technically speaking this
          // could be supported, but right now it's an error.
          if (this.analysis.has(node)) {
            throw new Error('TODO.Diagnostic: Class has multiple Angular decorators.');
          }

          // Run analysis on the metadata. This will produce either diagnostics, an
          // analysis result, or both.
          try {
            const analysis = adapter.analyze(node, metadata);
            if (analysis.analysis !== undefined) {
              this.analysis.set(node, {
                adapter,
                analysis: analysis.analysis,
                metadata: metadata,
              });
              if (!!analysis.typeCheck) {
                this.typeCheckMap.set(node, adapter);
              }
            }

            if (analysis.diagnostics !== undefined) {
              this._diagnostics.push(...analysis.diagnostics);
            }

            if (analysis.factorySymbolName !== undefined && this.sourceToFactorySymbols !== null &&
                this.sourceToFactorySymbols.has(sf.fileName)) {
              this.sourceToFactorySymbols.get(sf.fileName) !.add(analysis.factorySymbolName);
            }
          } catch (err) {
            if (err instanceof FatalDiagnosticError) {
              this._diagnostics.push(err.toDiagnostic());
            } else {
              throw err;
            }
          }
        };

        if (preanalyze && adapter.preanalyze !== undefined) {
          const preanalysis = adapter.preanalyze(node, metadata);
          if (preanalysis !== undefined) {
            promises.push(preanalysis.then(() => completeAnalysis()));
          } else {
            completeAnalysis();
          }
        } else {
          completeAnalysis();
        }
      });
    };

    const visit = (node: ts.Node): void => {
      // Process nodes recursively, and look for class declarations with decorators.
      if (ts.isClassDeclaration(node)) {
        analyzeClass(node);
      }
      ts.forEachChild(node, visit);
    };

    visit(sf);

    if (preanalyze && promises.length > 0) {
      return Promise.all(promises).then(() => undefined);
    } else {
      return undefined;
    }
  }

  typeCheck(context: TypeCheckContext): void {
    this.typeCheckMap.forEach((handler, node) => {
      if (handler.typeCheck !== undefined) {
        handler.typeCheck(context, node, this.analysis.get(node) !.analysis);
      }
    });
  }

  /**
   * Perform a compilation operation on the given class declaration and return instructions to an
   * AST transformer if any are available.
   */
  compileIvyFieldFor(node: ts.Declaration, constantPool: ConstantPool): CompileResult[]|undefined {
    // Look to see whether the original node was analyzed. If not, there's nothing to do.
    const original = ts.getOriginalNode(node) as ts.Declaration;
    if (!this.analysis.has(original)) {
      return undefined;
    }
    const op = this.analysis.get(original) !;

    // Run the actual compilation, which generates an Expression for the Ivy field.
    let res: CompileResult|CompileResult[] = op.adapter.compile(node, op.analysis, constantPool);
    if (!Array.isArray(res)) {
      res = [res];
    }

    // Look up the .d.ts transformer for the input file and record that a field was generated,
    // which will allow the .d.ts to be transformed later.
    const fileName = original.getSourceFile().fileName;
    const dtsTransformer = this.getDtsTransformer(fileName);
    dtsTransformer.recordStaticField(reflectNameOfDeclaration(node) !, res);

    // Return the instruction to the transformer so the field will be added.
    return res;
  }

  /**
   * Lookup the `ts.Decorator` which triggered transformation of a particular class declaration.
   */
  ivyDecoratorFor(node: ts.Declaration): Decorator|undefined {
    const original = ts.getOriginalNode(node) as ts.Declaration;
    if (!this.analysis.has(original)) {
      return undefined;
    }

    return this.analysis.get(original) !.metadata;
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
    return this.dtsMap.get(tsFileName) !.transform(dtsOriginalSource, tsFileName);
  }

  get diagnostics(): ReadonlyArray<ts.Diagnostic> { return this._diagnostics; }

  private getDtsTransformer(tsFileName: string): DtsFileTransformer {
    if (!this.dtsMap.has(tsFileName)) {
      this.dtsMap.set(tsFileName, new DtsFileTransformer(this.coreImportsFrom));
    }
    return this.dtsMap.get(tsFileName) !;
  }
}
