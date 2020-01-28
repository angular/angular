/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BoundTarget, ParseSourceFile, SchemaMetadata} from '@angular/compiler';
import * as ts from 'typescript';

import {absoluteFromSourceFile, getSourceFileOrError} from '../../file_system';
import {NoopImportRewriter, Reference, ReferenceEmitter} from '../../imports';
import {ClassDeclaration, ReflectionHost} from '../../reflection';
import {ImportManager} from '../../translator';

import {TemplateSourceMapping, TypeCheckBlockMetadata, TypeCheckableDirectiveMeta, TypeCheckingConfig, TypeCtorMetadata} from './api';
import {shouldReportDiagnostic, translateDiagnostic} from './diagnostics';
import {DomSchemaChecker, RegistryDomSchemaChecker} from './dom';
import {Environment} from './environment';
import {TypeCheckProgramHost} from './host';
import {OutOfBandDiagnosticRecorder, OutOfBandDiagnosticRecorderImpl} from './oob';
import {TypeCheckShimHost} from './shim';
import {TemplateSourceManager} from './source';
import {generateTypeCheckBlock, requiresInlineTypeCheckBlock} from './type_check_block';
import {TypeCheckFile} from './type_check_file';
import {generateInlineTypeCtor, requiresInlineTypeCtor} from './type_constructor';


/**
 * A template type checking context for a program.
 *
 * The `TypeCheckContext` allows registration of components and their templates which need to be
 * type checked. It also allows generation of modified `ts.SourceFile`s which contain the type
 * checking code.
 */
export class TypeCheckContext {
  private files = new Map<ts.SourceFile, TypeCheckingForFile>();

  constructor(
      private config: TypeCheckingConfig, private refEmitter: ReferenceEmitter,
      private reflector: ReflectionHost, private shimHost: TypeCheckShimHost) {}

  /**
   * A `Map` of `ts.SourceFile`s that the context has seen to the operations (additions of methods
   * or type-check blocks) that need to be eventually performed on that file.
   */
  private opMap = new Map<ts.SourceFile, Op[]>();

  /**
   * Tracks when an a particular class has a pending type constructor patching operation already
   * queued.
   */
  private typeCtorPending = new Set<ts.ClassDeclaration>();

  /**
   * Attempt to reuse results from a particular source file.
   */
  adopt(sf: ts.SourceFile, record: FinalTypeCheckingForFile): void { this.files.set(sf, record); }

  recordFor(sf: ts.SourceFile): FinalTypeCheckingForFile|null {
    if (!this.files.has(sf)) {
      return null;
    }
    const file = this.files.get(sf) !;
    if (file.type !== 'final' || file.hasInlineBlocks) {
      return null;
    }

    return file;
  }

  /**
   * Record a template for the given component `node`, with a `SelectorMatcher` for directive
   * matching.
   *
   * @param node class of the node being recorded.
   * @param template AST nodes of the template being recorded.
   * @param matcher `SelectorMatcher` which tracks directives that are in scope for this template.
   */
  addTemplate(
      ref: Reference<ClassDeclaration<ts.ClassDeclaration>>,
      boundTarget: BoundTarget<TypeCheckableDirectiveMeta>,
      pipes: Map<string, Reference<ClassDeclaration<ts.ClassDeclaration>>>,
      schemas: SchemaMetadata[], sourceMapping: TemplateSourceMapping,
      file: ParseSourceFile): void {
    const sf = ref.node.getSourceFile();
    let record: PendingTypeCheckingForFile;
    if (!this.files.has(sf)) {
      const shimPath = this.shimHost.getShimPathFor(absoluteFromSourceFile(sf));
      if (shimPath === null) {
        throw new Error(`AssertionError: no typechecking shim found for ${sf.fileName}`);
      }
      const sourceManager = new TemplateSourceManager();
      record = {
        type: 'pending',
        sourceManager,
        file: new TypeCheckFile(shimPath, this.config, this.refEmitter, this.reflector),
        hasInlineBlocks: false,
        domSchemaChecker: new RegistryDomSchemaChecker(sourceManager),
        oobDiagnosticRecorder: new OutOfBandDiagnosticRecorderImpl(sourceManager),
      };
      this.files.set(sf, record);
    } else {
      const rec = this.files.get(sf) !;
      if (rec.type === 'final') {
        throw new Error(
            `AssertionError: cannot add type-checking code for template of ${ref.debugName} (${sf.fileName}) to reused type-checking file ${rec.file.fileName}.`);
      }

      record = rec;
    }

    const id = record.sourceManager.captureSource(sourceMapping, file);
    // Get all of the directives used in the template and record type constructors for all of them.
    for (const dir of boundTarget.getUsedDirectives()) {
      const dirRef = dir.ref as Reference<ClassDeclaration<ts.ClassDeclaration>>;
      const dirNode = dirRef.node;
      if (requiresInlineTypeCtor(dirNode, this.reflector)) {
        // Add a type constructor operation for the directive.
        this.addInlineTypeCtor(dirNode.getSourceFile(), dirRef, {
          fnName: 'ngTypeCtor',
          // The constructor should have a body if the directive comes from a .ts file, but not if
          // it comes from a .d.ts file. .d.ts declarations don't have bodies.
          body: !dirNode.getSourceFile().isDeclarationFile,
          fields: {
            inputs: Object.keys(dir.inputs),
            outputs: Object.keys(dir.outputs),
            // TODO(alxhub): support queries
            queries: dir.queries,
          },
          coercedInputFields: dir.coercedInputFields,
        });
        record.hasInlineBlocks = true;
      }
    }

    const tcbMetadata: TypeCheckBlockMetadata = {id, boundTarget, pipes, schemas};
    if (requiresInlineTypeCheckBlock(ref.node)) {
      // This class didn't meet the requirements for external type checking, so generate an inline
      // TCB for the class.
      this.addInlineTypeCheckBlock(
          ref, tcbMetadata, record.domSchemaChecker, record.oobDiagnosticRecorder);
      record.hasInlineBlocks = true;
    } else {
      // The class can be type-checked externally as normal.
      record.file.addTypeCheckBlock(
          ref, tcbMetadata, record.domSchemaChecker, record.oobDiagnosticRecorder);
    }
  }

  /**
   * Record a type constructor for the given `node` with the given `ctorMetadata`.
   */
  addInlineTypeCtor(
      sf: ts.SourceFile, ref: Reference<ClassDeclaration<ts.ClassDeclaration>>,
      ctorMeta: TypeCtorMetadata): void {
    if (this.typeCtorPending.has(ref.node)) {
      return;
    }
    this.typeCtorPending.add(ref.node);

    // Lazily construct the operation map.
    if (!this.opMap.has(sf)) {
      this.opMap.set(sf, []);
    }
    const ops = this.opMap.get(sf) !;

    // Push a `TypeCtorOp` into the operation queue for the source file.
    ops.push(new TypeCtorOp(ref, ctorMeta));
  }

  /**
   * Transform a `ts.SourceFile` into a version that includes type checking code.
   *
   * If this particular source file has no directives that require type constructors, or components
   * that require type check blocks, then it will be returned directly. Otherwise, a new
   * `ts.SourceFile` is parsed from modified text of the original. This is necessary to ensure the
   * added code has correct positional information associated with it.
   */
  transform(sf: ts.SourceFile): ts.SourceFile {
    // If there are no operations pending for this particular file, return it directly.
    if (!this.opMap.has(sf)) {
      return sf;
    }

    // Imports may need to be added to the file to support type-checking of directives used in the
    // template within it.
    const importManager = new ImportManager(new NoopImportRewriter(), '_i');

    // Each Op has a splitPoint index into the text where it needs to be inserted. Split the
    // original source text into chunks at these split points, where code will be inserted between
    // the chunks.
    const ops = this.opMap.get(sf) !.sort(orderOps);
    const textParts = splitStringAtPoints(sf.text, ops.map(op => op.splitPoint));

    // Use a `ts.Printer` to generate source code.
    const printer = ts.createPrinter({omitTrailingSemicolon: true});

    // Begin with the intial section of the code text.
    let code = textParts[0];

    // Process each operation and use the printer to generate source code for it, inserting it into
    // the source code in between the original chunks.
    ops.forEach((op, idx) => {
      const text = op.execute(importManager, sf, this.refEmitter, printer);
      code += '\n\n' + text + textParts[idx + 1];
    });

    // Write out the imports that need to be added to the beginning of the file.
    let imports = importManager.getAllImports(sf.fileName)
                      .map(i => `import * as ${i.qualifier} from '${i.specifier}';`)
                      .join('\n');
    code = imports + '\n' + code;

    // Parse the new source file and return it.
    return ts.createSourceFile(sf.fileName, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  }

  calculateTemplateDiagnostics(
      originalProgram: ts.Program, originalHost: ts.CompilerHost,
      originalOptions: ts.CompilerOptions): {
    diagnostics: ts.Diagnostic[],
    program: ts.Program,
  } {
    // First, build the map of original source files.
    const sfMap = new Map<string, ts.SourceFile>();

    const diagnostics: ts.Diagnostic[] = [];

    for (const originalSf of originalProgram.getSourceFiles()) {
      // Skip template type-checking shims.
      if (this.shimHost.isShim(originalSf)) {
        continue;
      }

      const sf = this.transform(originalSf);
      sfMap.set(sf.fileName, sf);

      if (this.files.has(originalSf)) {
        const record = this.files.get(originalSf) !;
        if (record.type === 'pending') {
          // Finalize the type-checking code for originalSf by producing the type-checking
          // `ts.SourceFile`.
          const ttcSf = record.file.render();
          sfMap.set(ttcSf.fileName, ttcSf);

          this.files.set(originalSf, {
            type: 'final',
            sourceManager: record.sourceManager,
            file: ttcSf,
            diagnostics: [
              ...record.domSchemaChecker.diagnostics, ...record.oobDiagnosticRecorder.diagnostics
            ],
            hasInlineBlocks: record.hasInlineBlocks,
          });
          diagnostics.push(
              ...record.domSchemaChecker.diagnostics, ...record.oobDiagnosticRecorder.diagnostics);
        } else {
          diagnostics.push(...record.diagnostics);
        }
      }
    }


    const typeCheckProgram = ts.createProgram({
      host: new TypeCheckProgramHost(sfMap, originalHost),
      options: originalOptions,
      oldProgram: originalProgram,
      rootNames: originalProgram.getRootFileNames(),
    });

    for (const sf of this.files.keys()) {
      const record = this.files.get(sf) !;
      if (record.type !== 'final') {
        throw new Error(`AssertionError: file ${sf.fileName} does not have finalized TTC`);
      }

      const diags: ts.Diagnostic[] = [];
      diags.push(...typeCheckProgram.getSemanticDiagnostics(record.file));
      if (record.hasInlineBlocks) {
        // `sf` is the user program file, which has been modified to include inline blocks in the
        // `typeCheckProgram`. Get the modified version for diagnostics.
        const ttcSf = getSourceFileOrError(typeCheckProgram, absoluteFromSourceFile(sf));
        diags.push(...typeCheckProgram.getSemanticDiagnostics(ttcSf));
      }

      for (const diagnostic of diags) {
        if (!shouldReportDiagnostic(diagnostic)) {
          continue;
        }

        const translated = translateDiagnostic(diagnostic, record.sourceManager);
        if (translated !== null) {
          diagnostics.push(translated);
        }
      }
    }

    return {
      diagnostics,
      program: typeCheckProgram,
    };
  }

  private addInlineTypeCheckBlock(
      ref: Reference<ClassDeclaration<ts.ClassDeclaration>>, tcbMeta: TypeCheckBlockMetadata,
      domSchemaChecker: DomSchemaChecker,
      oobDiagnosticRecorder: OutOfBandDiagnosticRecorder): void {
    const sf = ref.node.getSourceFile();
    if (!this.opMap.has(sf)) {
      this.opMap.set(sf, []);
    }
    const ops = this.opMap.get(sf) !;
    ops.push(new TcbOp(
        ref, tcbMeta, this.config, this.reflector, domSchemaChecker, oobDiagnosticRecorder));
  }
}

/**
 * A code generation operation that needs to happen within a given source file.
 */
interface Op {
  /**
   * The node in the file which will have code generated for it.
   */
  readonly ref: Reference<ClassDeclaration<ts.ClassDeclaration>>;

  /**
   * Index into the source text where the code generated by the operation should be inserted.
   */
  readonly splitPoint: number;

  /**
   * Execute the operation and return the generated code as text.
   */
  execute(im: ImportManager, sf: ts.SourceFile, refEmitter: ReferenceEmitter, printer: ts.Printer):
      string;
}

/**
 * A type check block operation which produces type check code for a particular component.
 */
class TcbOp implements Op {
  constructor(
      readonly ref: Reference<ClassDeclaration<ts.ClassDeclaration>>,
      readonly meta: TypeCheckBlockMetadata, readonly config: TypeCheckingConfig,
      readonly reflector: ReflectionHost, readonly domSchemaChecker: DomSchemaChecker,
      readonly oobRecorder: OutOfBandDiagnosticRecorder) {}

  /**
   * Type check blocks are inserted immediately after the end of the component class.
   */
  get splitPoint(): number { return this.ref.node.end + 1; }

  execute(im: ImportManager, sf: ts.SourceFile, refEmitter: ReferenceEmitter, printer: ts.Printer):
      string {
    const env = new Environment(this.config, im, refEmitter, this.reflector, sf);
    const fnName = ts.createIdentifier(`_tcb_${this.ref.node.pos}`);
    const fn = generateTypeCheckBlock(
        env, this.ref, fnName, this.meta, this.domSchemaChecker, this.oobRecorder);
    return printer.printNode(ts.EmitHint.Unspecified, fn, sf);
  }
}

/**
 * A type constructor operation which produces type constructor code for a particular directive.
 */
class TypeCtorOp implements Op {
  constructor(
      readonly ref: Reference<ClassDeclaration<ts.ClassDeclaration>>,
      readonly meta: TypeCtorMetadata) {}

  /**
   * Type constructor operations are inserted immediately before the end of the directive class.
   */
  get splitPoint(): number { return this.ref.node.end - 1; }

  execute(im: ImportManager, sf: ts.SourceFile, refEmitter: ReferenceEmitter, printer: ts.Printer):
      string {
    const tcb = generateInlineTypeCtor(this.ref.node, this.meta);
    return printer.printNode(ts.EmitHint.Unspecified, tcb, sf);
  }
}

/**
 * Compare two operations and return their split point ordering.
 */
function orderOps(op1: Op, op2: Op): number {
  return op1.splitPoint - op2.splitPoint;
}

/**
 * Split a string into chunks at any number of split points.
 */
function splitStringAtPoints(str: string, points: number[]): string[] {
  const splits: string[] = [];
  let start = 0;
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    splits.push(str.substring(start, point));
    start = point;
  }
  splits.push(str.substring(start));
  return splits;
}

/**
 * Template type-checking context for a particular input `ts.SourceFile` and all of its components.
 *
 * This can exist in two states: an in-progress context which supports the addition of more
 * templates to check, and a completed context with template type-checking code rendered into a
 * `ts.SourceFile`.
 */
type TypeCheckingForFile = PendingTypeCheckingForFile | FinalTypeCheckingForFile;

interface BaseTypeCheckingForFile {
  type: 'pending'|'final';

  /**
   * Tracks source mappings for type-checking code generates for this particular file.
   */
  sourceManager: TemplateSourceManager;

  /**
   * Whether any of the type-checking code for this file required the use of inline blocks in other
   * files. It's currently not possible to reuse type-checking operations that required inline
   * blocks.
   */
  hasInlineBlocks: boolean;
}

/**
 * Template type-checking context for a particular input `ts.SourceFile` which hasn't yet been
 * rendered into a `ts.SourceFile` to check.
 */
interface PendingTypeCheckingForFile extends BaseTypeCheckingForFile {
  type: 'pending';

  /**
   * `TypeCheckFile` into which type-checking code can be written.
   */
  file: TypeCheckFile;

  /**
   * Schema checker in use during generation of type-checking code.
   *
   * Generation produces DOM schema checking diagnostics as a side-effect, which are recorded here.
   */
  domSchemaChecker: DomSchemaChecker;

  /**
   * Diagnostic recorder in use during generation of type-checking code.
   *
   * Generation produces out-of-band diagnostics as a side-effect, which are recorded here.
   */
  oobDiagnosticRecorder: OutOfBandDiagnosticRecorder;
}

/**
 * Template type-checking context for a particular input `ts.SourceFile` which has been "finalized".
 * Type-checking code for this file has been rendered into a `ts.SourceFile` of its own, and any
 * diagnostics gathered during generation have been recorded.
 *
 * This context can be inherited from a previous compilation into the subsequent incremental
 * compilation, and the type-checking code for a particular file re-used.
 */
export interface FinalTypeCheckingForFile extends BaseTypeCheckingForFile {
  type: 'final';

  /**
   * `ts.SourceFile` which contains code generated to type-check the input file.
   */
  file: ts.SourceFile;

  /**
   * Diagnostics gathered during the generation of type-checking code for the input file.
   *
   * Some diagnostics, like DOM schema errors, are produced during the generation of type-checking
   * code, not when that code is checked by TypeScript afterwards. These diagnostics are recorded
   * here, so that if the generated `ts.SourceFile` is reused in a future compilation, the
   * generation diagnostics can be re-shown as well.
   */
  diagnostics: ReadonlyArray<ts.Diagnostic>;
}
