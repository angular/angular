/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {absoluteFromSourceFile, AbsoluteFsPath, getSourceFileOrError} from '../../file_system';
import {ReferenceEmitter} from '../../imports';
import {IncrementalBuild} from '../../incremental/api';
import {ReflectionHost} from '../../reflection';
import {isShim} from '../../shims';
import {getSourceFileOrNull} from '../../util/src/typescript';
import {ProgramTypeCheckAdapter, TemplateTypeChecker, TypeCheckingConfig, TypeCheckingProgramStrategy, UpdateMode} from '../api';

import {ShimTypeCheckingData, TypeCheckContextImpl, TypeCheckingHost} from './context';
import {findTypeCheckBlock, shouldReportDiagnostic, TemplateSourceResolver, translateDiagnostic} from './diagnostics';
import {TemplateSourceManager} from './source';

/**
 * Primary template type-checking engine, which performs type-checking using a
 * `TypeCheckingProgramStrategy` for type-checking program maintenance, and the
 * `ProgramTypeCheckAdapter` for generation of template type-checking code.
 */
export class TemplateTypeCheckerImpl implements TemplateTypeChecker {
  private state = new Map<AbsoluteFsPath, FileTypeCheckingData>();
  private isComplete = false;

  constructor(
      private originalProgram: ts.Program,
      readonly typeCheckingStrategy: TypeCheckingProgramStrategy,
      private typeCheckAdapter: ProgramTypeCheckAdapter, private config: TypeCheckingConfig,
      private refEmitter: ReferenceEmitter, private reflector: ReflectionHost,
      private compilerHost: Pick<ts.CompilerHost, 'getCanonicalFileName'>,
      private priorBuild: IncrementalBuild<unknown, FileTypeCheckingData>) {}

  /**
   * Retrieve type-checking diagnostics from the given `ts.SourceFile` using the most recent
   * type-checking program.
   */
  getDiagnosticsForFile(sf: ts.SourceFile): ts.Diagnostic[] {
    this.ensureAllShimsForAllFiles();

    const sfPath = absoluteFromSourceFile(sf);
    const fileRecord = this.state.get(sfPath)!;

    const typeCheckProgram = this.typeCheckingStrategy.getProgram();

    const diagnostics: (ts.Diagnostic|null)[] = [];
    if (fileRecord.hasInlines) {
      const inlineSf = getSourceFileOrError(typeCheckProgram, sfPath);
      diagnostics.push(...typeCheckProgram.getSemanticDiagnostics(inlineSf).map(
          diag => convertDiagnostic(diag, fileRecord.sourceManager)));
    }

    for (const [shimPath, shimRecord] of fileRecord.shimData) {
      const shimSf = getSourceFileOrError(typeCheckProgram, shimPath);
      diagnostics.push(...typeCheckProgram.getSemanticDiagnostics(shimSf).map(
          diag => convertDiagnostic(diag, fileRecord.sourceManager)));
      diagnostics.push(...shimRecord.genesisDiagnostics);
    }


    return diagnostics.filter((diag: ts.Diagnostic|null): diag is ts.Diagnostic => diag !== null);
  }

  getTypeCheckBlock(component: ts.ClassDeclaration): ts.Node|null {
    this.ensureAllShimsForAllFiles();

    const program = this.typeCheckingStrategy.getProgram();
    const filePath = absoluteFromSourceFile(component.getSourceFile());
    const shimPath = this.typeCheckingStrategy.shimPathForComponent(component);

    if (!this.state.has(filePath)) {
      throw new Error(`Error: no data for source file: ${filePath}`);
    }
    const fileRecord = this.state.get(filePath)!;
    const id = fileRecord.sourceManager.getTemplateId(component);

    const shimSf = getSourceFileOrNull(program, shimPath);
    if (shimSf === null) {
      throw new Error(`Error: no shim file in program: ${shimPath}`);
    }

    let node: ts.Node|null = findTypeCheckBlock(shimSf, id);
    if (node === null) {
      // Try for an inline block.
      const inlineSf = getSourceFileOrError(program, filePath);
      node = findTypeCheckBlock(inlineSf, id);
    }

    return node;
  }

  private maybeAdoptPriorResultsForFile(sf: ts.SourceFile): void {
    const sfPath = absoluteFromSourceFile(sf);
    if (this.state.has(sfPath)) {
      const existingResults = this.state.get(sfPath)!;

      if (existingResults.isComplete) {
        // All data for this file has already been generated, so no need to adopt anything.
        return;
      }
    }

    const previousResults = this.priorBuild.priorTypeCheckingResultsFor(sf);
    if (previousResults === null || !previousResults.isComplete) {
      return;
    }

    this.state.set(sfPath, previousResults);
  }

  private ensureAllShimsForAllFiles(): void {
    if (this.isComplete) {
      return;
    }

    const host = new WholeProgramTypeCheckingHost(this);
    const ctx = this.newContext(host);

    for (const sf of this.originalProgram.getSourceFiles()) {
      if (sf.isDeclarationFile || isShim(sf)) {
        continue;
      }

      this.maybeAdoptPriorResultsForFile(sf);

      const sfPath = absoluteFromSourceFile(sf);
      const fileData = this.getFileData(sfPath);
      if (fileData.isComplete) {
        continue;
      }

      this.typeCheckAdapter.typeCheck(sf, ctx);

      fileData.isComplete = true;
    }

    this.updateFromContext(ctx);
    this.isComplete = true;
  }

  private newContext(host: TypeCheckingHost): TypeCheckContextImpl {
    return new TypeCheckContextImpl(
        this.config, this.compilerHost, this.typeCheckingStrategy, this.refEmitter, this.reflector,
        host);
  }

  private updateFromContext(ctx: TypeCheckContextImpl): void {
    const updates = ctx.finalize();
    this.typeCheckingStrategy.updateFiles(updates, UpdateMode.Incremental);
    this.priorBuild.recordSuccessfulTypeCheck(this.state);
  }

  getFileData(path: AbsoluteFsPath): FileTypeCheckingData {
    if (!this.state.has(path)) {
      this.state.set(path, {
        hasInlines: false,
        sourceManager: new TemplateSourceManager(),
        isComplete: false,
        shimData: new Map(),
      });
    }
    return this.state.get(path)!;
  }
}

function convertDiagnostic(
    diag: ts.Diagnostic, sourceResolver: TemplateSourceResolver): ts.Diagnostic|null {
  if (!shouldReportDiagnostic(diag)) {
    return null;
  }
  return translateDiagnostic(diag, sourceResolver);
}

/**
 * Data for template type-checking related to a specific input file in the user's program (which
 * contains components to be checked).
 */
export interface FileTypeCheckingData {
  /**
   * Whether the type-checking shim required any inline changes to the original file, which affects
   * whether the shim can be reused.
   */
  hasInlines: boolean;

  /**
   * Source mapping information for mapping diagnostics from inlined type check blocks back to the
   * original template.
   */
  sourceManager: TemplateSourceManager;

  /**
   * Data for each shim generated from this input file.
   *
   * A single input file will generate one or more shim files that actually contain template
   * type-checking code.
   */
  shimData: Map<AbsoluteFsPath, ShimTypeCheckingData>;

  /**
   * Whether the template type-checker is certain that all components from this input file have had
   * type-checking code generated into shims.
   */
  isComplete: boolean;
}

/**
 * Drives a `TypeCheckContext` to generate type-checking code for every component in the program.
 */
class WholeProgramTypeCheckingHost implements TypeCheckingHost {
  constructor(private impl: TemplateTypeCheckerImpl) {}

  getSourceManager(sfPath: AbsoluteFsPath): TemplateSourceManager {
    return this.impl.getFileData(sfPath).sourceManager;
  }

  shouldCheckComponent(node: ts.ClassDeclaration): boolean {
    const fileData = this.impl.getFileData(absoluteFromSourceFile(node.getSourceFile()));
    const shimPath = this.impl.typeCheckingStrategy.shimPathForComponent(node);
    // The component needs to be checked unless the shim which would contain it already exists.
    return !fileData.shimData.has(shimPath);
  }

  recordShimData(sfPath: AbsoluteFsPath, data: ShimTypeCheckingData): void {
    const fileData = this.impl.getFileData(sfPath);
    fileData.shimData.set(data.path, data);
    if (data.hasInlines) {
      fileData.hasInlines = true;
    }
  }

  recordComplete(sfPath: AbsoluteFsPath): void {
    this.impl.getFileData(sfPath).isComplete = true;
  }
}
