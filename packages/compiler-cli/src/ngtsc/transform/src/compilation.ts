/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConstantPool} from '@angular/compiler';
import * as ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../diagnostics';
import {ImportRewriter} from '../../imports';
import {IncrementalState} from '../../incremental';
import {IndexingContext} from '../../indexer';
import {PerfRecorder} from '../../perf';
import {ClassDeclaration, ReflectionHost, isNamedClassDeclaration, reflectNameOfDeclaration} from '../../reflection';
import {LocalModuleScopeRegistry} from '../../scope';
import {TypeCheckContext} from '../../typecheck';
import {getSourceFile} from '../../util/src/typescript';

import {AnalysisOutput, CompileResult, DecoratorHandler, DetectResult, HandlerPrecedence} from './api';
import {DtsFileTransformer} from './declaration';

const EMPTY_ARRAY: any = [];

/**
 * Record of an adapter which decided to emit a static field, and the analysis it performed to
 * prepare for that operation.
 */
interface MatchedHandler<A, M> {
  handler: DecoratorHandler<A, M>;
  analyzed: AnalysisOutput<A>|null;
  detected: DetectResult<M>;
}

interface IvyClass {
  matchedHandlers: MatchedHandler<any, any>[];

  hasWeakHandlers: boolean;
  hasPrimaryHandler: boolean;
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
  private ivyClasses = new Map<ClassDeclaration, IvyClass>();

  /**
   * Tracks factory information which needs to be generated.
   */

  /**
   * Tracks the `DtsFileTransformer`s for each TS file that needs .d.ts transformations.
   */
  private dtsMap = new Map<string, DtsFileTransformer>();

  private reexportMap = new Map<string, Map<string, [string, string]>>();
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
      private handlers: DecoratorHandler<any, any>[], private reflector: ReflectionHost,
      private importRewriter: ImportRewriter, private incrementalState: IncrementalState,
      private perf: PerfRecorder, private sourceToFactorySymbols: Map<string, Set<string>>|null,
      private scopeRegistry: LocalModuleScopeRegistry) {}


  get exportStatements(): Map<string, Map<string, [string, string]>> { return this.reexportMap; }

  analyzeSync(sf: ts.SourceFile): void { return this.analyze(sf, false); }

  analyzeAsync(sf: ts.SourceFile): Promise<void>|undefined { return this.analyze(sf, true); }

  private detectHandlersForClass(node: ClassDeclaration): IvyClass|null {
    // The first step is to reflect the decorators.
    const classDecorators = this.reflector.getDecoratorsOfDeclaration(node);
    let ivyClass: IvyClass|null = null;

    // Look through the DecoratorHandlers to see if any are relevant.
    for (const handler of this.handlers) {
      // An adapter is relevant if it matches one of the decorators on the class.
      const detected = handler.detect(node, classDecorators);
      if (detected === undefined) {
        // This handler didn't match.
        continue;
      }

      const isPrimaryHandler = handler.precedence === HandlerPrecedence.PRIMARY;
      const isWeakHandler = handler.precedence === HandlerPrecedence.WEAK;
      const match = {
        handler,
        analyzed: null, detected,
      };

      if (ivyClass === null) {
        // This is the first handler to match this class. This path is a fast path through which
        // most classes will flow.
        ivyClass = {
          matchedHandlers: [match],
          hasPrimaryHandler: isPrimaryHandler,
          hasWeakHandlers: isWeakHandler,
        };
        this.ivyClasses.set(node, ivyClass);
      } else {
        // This is at least the second handler to match this class. This is a slower path that some
        // classes will go through, which validates that the set of decorators applied to the class
        // is valid.

        // Validate according to rules as follows:
        //
        // * WEAK handlers are removed if a non-WEAK handler matches.
        // * Only one PRIMARY handler can match at a time. Any other PRIMARY handler matching a
        //   class with an existing PRIMARY handler is an error.

        if (!isWeakHandler && ivyClass.hasWeakHandlers) {
          // The current handler is not a WEAK handler, but the class has other WEAK handlers.
          // Remove them.
          ivyClass.matchedHandlers = ivyClass.matchedHandlers.filter(
              field => field.handler.precedence !== HandlerPrecedence.WEAK);
          ivyClass.hasWeakHandlers = false;
        } else if (isWeakHandler && !ivyClass.hasWeakHandlers) {
          // The current handler is a WEAK handler, but the class has non-WEAK handlers already.
          // Drop the current one.
          continue;
        }

        if (isPrimaryHandler && ivyClass.hasPrimaryHandler) {
          // The class already has a PRIMARY handler, and another one just matched.
          this._diagnostics.push({
            category: ts.DiagnosticCategory.Error,
            code: Number('-99' + ErrorCode.DECORATOR_COLLISION),
            file: getSourceFile(node),
            start: node.getStart(undefined, false),
            length: node.getWidth(),
            messageText: 'Two incompatible decorators on class',
          });
          this.ivyClasses.delete(node);
          return null;
        }

        // Otherwise, it's safe to accept the multiple decorators here. Update some of the metadata
        // regarding this class.
        ivyClass.matchedHandlers.push(match);
        ivyClass.hasPrimaryHandler = ivyClass.hasPrimaryHandler || isPrimaryHandler;
      }
    }

    return ivyClass;
  }

  /**
   * Analyze a source file and produce diagnostics for it (if any).
   */
  private analyze(sf: ts.SourceFile, preanalyze: false): undefined;
  private analyze(sf: ts.SourceFile, preanalyze: true): Promise<void>|undefined;
  private analyze(sf: ts.SourceFile, preanalyze: boolean): Promise<void>|undefined {
    const promises: Promise<void>[] = [];
    if (this.incrementalState.safeToSkip(sf)) {
      return;
    }
    const analyzeClass = (node: ClassDeclaration): void => {
      const ivyClass = this.detectHandlersForClass(node);

      // If the class has no Ivy behavior (or had errors), skip it.
      if (ivyClass === null) {
        return;
      }

      // Loop through each matched handler that needs to be analyzed and analyze it, either
      // synchronously or asynchronously.
      for (const match of ivyClass.matchedHandlers) {
        // The analyze() function will run the analysis phase of the handler.
        const analyze = () => {
          const analyzeClassSpan = this.perf.start('analyzeClass', node);
          try {
            match.analyzed = match.handler.analyze(node, match.detected.metadata);

            if (match.analyzed.diagnostics !== undefined) {
              this._diagnostics.push(...match.analyzed.diagnostics);
            }

            if (match.analyzed.factorySymbolName !== undefined &&
                this.sourceToFactorySymbols !== null &&
                this.sourceToFactorySymbols.has(sf.fileName)) {
              this.sourceToFactorySymbols.get(sf.fileName) !.add(match.analyzed.factorySymbolName);
            }
          } catch (err) {
            if (err instanceof FatalDiagnosticError) {
              this._diagnostics.push(err.toDiagnostic());
            } else {
              throw err;
            }
          } finally {
            this.perf.stop(analyzeClassSpan);
          }
        };

        // If preanalysis was requested and a preanalysis step exists, then run preanalysis.
        // Otherwise, skip directly to analysis.
        if (preanalyze && match.handler.preanalyze !== undefined) {
          // Preanalysis might return a Promise, indicating an async operation was necessary. Or it
          // might return undefined, indicating no async step was needed and analysis can proceed
          // immediately.
          const preanalysis = match.handler.preanalyze(node, match.detected.metadata);
          if (preanalysis !== undefined) {
            // Await the results of preanalysis before running analysis.
            promises.push(preanalysis.then(analyze));
          } else {
            // No async preanalysis needed, skip directly to analysis.
            analyze();
          }
        } else {
          // Not in preanalysis mode or not needed for this handler, skip directly to analysis.
          analyze();
        }
      }
    };

    const visit = (node: ts.Node): void => {
      // Process nodes recursively, and look for class declarations with decorators.
      if (isNamedClassDeclaration(node)) {
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

  /**
   * Feeds components discovered in the compilation to a context for indexing.
   */
  index(context: IndexingContext) {
    this.ivyClasses.forEach((ivyClass, declaration) => {
      for (const match of ivyClass.matchedHandlers) {
        if (match.handler.index !== undefined && match.analyzed !== null &&
            match.analyzed.analysis !== undefined) {
          match.handler.index(context, declaration, match.analyzed.analysis);
        }
      }
    });
  }

  resolve(): void {
    const resolveSpan = this.perf.start('resolve');
    this.ivyClasses.forEach((ivyClass, node) => {
      for (const match of ivyClass.matchedHandlers) {
        if (match.handler.resolve !== undefined && match.analyzed !== null &&
            match.analyzed.analysis !== undefined) {
          const resolveClassSpan = this.perf.start('resolveClass', node);
          try {
            const res = match.handler.resolve(node, match.analyzed.analysis);
            if (res.reexports !== undefined) {
              const fileName = node.getSourceFile().fileName;
              if (!this.reexportMap.has(fileName)) {
                this.reexportMap.set(fileName, new Map<string, [string, string]>());
              }
              const fileReexports = this.reexportMap.get(fileName) !;
              for (const reexport of res.reexports) {
                fileReexports.set(reexport.asAlias, [reexport.fromModule, reexport.symbolName]);
              }
            }
            if (res.diagnostics !== undefined) {
              this._diagnostics.push(...res.diagnostics);
            }
          } catch (err) {
            if (err instanceof FatalDiagnosticError) {
              this._diagnostics.push(err.toDiagnostic());
            } else {
              throw err;
            }
          } finally {
            this.perf.stop(resolveClassSpan);
          }
        }
      }
    });
    this.perf.stop(resolveSpan);
    this.recordNgModuleScopeDependencies();
  }

  private recordNgModuleScopeDependencies() {
    const recordSpan = this.perf.start('recordDependencies');
    this.scopeRegistry !.getCompilationScopes().forEach(scope => {
      const file = scope.declaration.getSourceFile();
      // Register the file containing the NgModule where the declaration is declared.
      this.incrementalState.trackFileDependency(scope.ngModule.getSourceFile(), file);
      scope.directives.forEach(
          directive =>
              this.incrementalState.trackFileDependency(directive.ref.node.getSourceFile(), file));
      scope.pipes.forEach(
          pipe => this.incrementalState.trackFileDependency(pipe.ref.node.getSourceFile(), file));
    });
    this.perf.stop(recordSpan);
  }

  typeCheck(context: TypeCheckContext): void {
    this.ivyClasses.forEach((ivyClass, node) => {
      for (const match of ivyClass.matchedHandlers) {
        if (match.handler.typeCheck !== undefined && match.analyzed !== null &&
            match.analyzed.analysis !== undefined) {
          match.handler.typeCheck(context, node, match.analyzed.analysis);
        }
      }
    });
  }

  /**
   * Perform a compilation operation on the given class declaration and return instructions to an
   * AST transformer if any are available.
   */
  compileIvyFieldFor(node: ts.Declaration, constantPool: ConstantPool): CompileResult[]|undefined {
    // Look to see whether the original node was analyzed. If not, there's nothing to do.
    const original = ts.getOriginalNode(node) as typeof node;
    if (!isNamedClassDeclaration(original) || !this.ivyClasses.has(original)) {
      return undefined;
    }

    const ivyClass = this.ivyClasses.get(original) !;

    let res: CompileResult[] = [];

    for (const match of ivyClass.matchedHandlers) {
      if (match.analyzed === null || match.analyzed.analysis === undefined) {
        continue;
      }

      const compileSpan = this.perf.start('compileClass', original);
      const compileMatchRes =
          match.handler.compile(node as ClassDeclaration, match.analyzed.analysis, constantPool);
      this.perf.stop(compileSpan);
      if (!Array.isArray(compileMatchRes)) {
        res.push(compileMatchRes);
      } else {
        res.push(...compileMatchRes);
      }
    }

    // Look up the .d.ts transformer for the input file and record that at least one field was
    // generated, which will allow the .d.ts to be transformed later.
    const fileName = original.getSourceFile().fileName;
    const dtsTransformer = this.getDtsTransformer(fileName);
    dtsTransformer.recordStaticField(reflectNameOfDeclaration(node) !, res);

    // Return the instruction to the transformer so the fields will be added.
    return res.length > 0 ? res : undefined;
  }

  /**
   * Lookup the `ts.Decorator` which triggered transformation of a particular class declaration.
   */
  ivyDecoratorsFor(node: ts.Declaration): ts.Decorator[] {
    const original = ts.getOriginalNode(node) as typeof node;

    if (!isNamedClassDeclaration(original) || !this.ivyClasses.has(original)) {
      return EMPTY_ARRAY;
    }
    const ivyClass = this.ivyClasses.get(original) !;
    const decorators: ts.Decorator[] = [];

    for (const match of ivyClass.matchedHandlers) {
      if (match.analyzed === null || match.analyzed.analysis === undefined) {
        continue;
      }
      if (match.detected.trigger !== null && ts.isDecorator(match.detected.trigger)) {
        decorators.push(match.detected.trigger);
      }
    }

    return decorators;
  }

  /**
   * Process a declaration file and return a transformed version that incorporates the changes
   * made to the source file.
   */
  transformedDtsFor(file: ts.SourceFile, context: ts.TransformationContext): ts.SourceFile {
    // No need to transform if it's not a declarations file, or if no changes have been requested
    // to the input file.
    // Due to the way TypeScript afterDeclarations transformers work, the SourceFile path is the
    // same as the original .ts.
    // The only way we know it's actually a declaration file is via the isDeclarationFile property.
    if (!file.isDeclarationFile || !this.dtsMap.has(file.fileName)) {
      return file;
    }

    // Return the transformed source.
    return this.dtsMap.get(file.fileName) !.transform(file, context);
  }

  get diagnostics(): ReadonlyArray<ts.Diagnostic> { return this._diagnostics; }

  private getDtsTransformer(tsFileName: string): DtsFileTransformer {
    if (!this.dtsMap.has(tsFileName)) {
      this.dtsMap.set(tsFileName, new DtsFileTransformer(this.importRewriter));
    }
    return this.dtsMap.get(tsFileName) !;
  }
}
