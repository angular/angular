/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BoundTarget} from '@angular/compiler';
import * as ts from 'typescript';

import {AbsoluteFsPath} from '../../file_system';
import {NoopImportRewriter, Reference, ReferenceEmitter} from '../../imports';
import {ClassDeclaration} from '../../reflection';
import {ImportManager} from '../../translator';

import {TypeCheckBlockMetadata, TypeCheckableDirectiveMeta, TypeCheckingConfig, TypeCtorMetadata} from './api';
import {Environment} from './environment';
import {TypeCheckProgramHost} from './host';
import {generateTypeCheckBlock, requiresInlineTypeCheckBlock} from './type_check_block';
import {TypeCheckFile, typeCheckFilePath} from './type_check_file';
import {generateInlineTypeCtor, requiresInlineTypeCtor} from './type_constructor';



/**
 * A template type checking context for a program.
 *
 * The `TypeCheckContext` allows registration of components and their templates which need to be
 * type checked. It also allows generation of modified `ts.SourceFile`s which contain the type
 * checking code.
 */
export class TypeCheckContext {
  private typeCheckFile: TypeCheckFile;

  constructor(
      private config: TypeCheckingConfig, private refEmitter: ReferenceEmitter,
      typeCheckFilePath: AbsoluteFsPath) {
    this.typeCheckFile = new TypeCheckFile(typeCheckFilePath, this.config, this.refEmitter);
  }

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
      pipes: Map<string, Reference<ClassDeclaration<ts.ClassDeclaration>>>): void {
    // Get all of the directives used in the template and record type constructors for all of them.
    for (const dir of boundTarget.getUsedDirectives()) {
      const dirRef = dir.ref as Reference<ClassDeclaration<ts.ClassDeclaration>>;
      const dirNode = dirRef.node;
      if (requiresInlineTypeCtor(dirNode)) {
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
        });
      }
    }

    if (requiresInlineTypeCheckBlock(ref.node)) {
      // This class didn't meet the requirements for external type checking, so generate an inline
      // TCB for the class.
      this.addInlineTypeCheckBlock(ref, {boundTarget, pipes});
    } else {
      // The class can be type-checked externally as normal.
      this.typeCheckFile.addTypeCheckBlock(ref, {boundTarget, pipes});
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
    ops.push(new TypeCtorOp(ref, ctorMeta, this.config));
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
      code += text + textParts[idx + 1];
    });

    // Write out the imports that need to be added to the beginning of the file.
    let imports = importManager.getAllImports(sf.fileName)
                      .map(i => `import * as ${i.qualifier} from '${i.specifier}';`)
                      .join('\n');
    code = imports + '\n' + code;

    // Parse the new source file and return it.
    return ts.createSourceFile(sf.fileName, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  }

  renderTypeCheckFile(): ts.SourceFile { return this.typeCheckFile.render(); }

  calculateTemplateDiagnostics(
      originalProgram: ts.Program, originalHost: ts.CompilerHost,
      originalOptions: ts.CompilerOptions): {
    diagnostics: ts.Diagnostic[],
    program: ts.Program,
  } {
    const typeCheckSf = this.renderTypeCheckFile();
    // First, build the map of original source files.
    const sfMap = new Map<string, ts.SourceFile>();
    const interestingFiles: ts.SourceFile[] = [typeCheckSf];
    for (const originalSf of originalProgram.getSourceFiles()) {
      const sf = this.transform(originalSf);
      sfMap.set(sf.fileName, sf);
      if (!sf.isDeclarationFile && this.opMap.has(originalSf)) {
        interestingFiles.push(sf);
      }
    }

    sfMap.set(typeCheckSf.fileName, typeCheckSf);

    const typeCheckProgram = ts.createProgram({
      host: new TypeCheckProgramHost(sfMap, originalHost),
      options: originalOptions,
      oldProgram: originalProgram,
      rootNames: originalProgram.getRootFileNames(),
    });

    return {
      diagnostics: this.readTemplateDiagnostics(typeCheckProgram, interestingFiles),
      program: typeCheckProgram,
    };
  }

  readTemplateDiagnostics(typeCheckProgram: ts.Program, interestingFiles: ts.SourceFile[]):
      ts.Diagnostic[] {
    const diagnostics: ts.Diagnostic[] = [];
    for (const sf of interestingFiles) {
      diagnostics.push(...typeCheckProgram.getSemanticDiagnostics(sf));
    }

    return diagnostics.filter((diag: ts.Diagnostic): boolean => {
      if (diag.code === 6133 /* $var is declared but its value is never read. */) {
        return false;
      } else if (diag.code === 6199 /* All variables are unused. */) {
        return false;
      } else if (
          diag.code === 2695 /* Left side of comma operator is unused and has no side effects. */) {
        return false;
      }
      return true;
    });
  }

  private addInlineTypeCheckBlock(
      ref: Reference<ClassDeclaration<ts.ClassDeclaration>>,
      tcbMeta: TypeCheckBlockMetadata): void {
    const sf = ref.node.getSourceFile();
    if (!this.opMap.has(sf)) {
      this.opMap.set(sf, []);
    }
    const ops = this.opMap.get(sf) !;
    ops.push(new TcbOp(ref, tcbMeta, this.config));
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
      readonly meta: TypeCheckBlockMetadata, readonly config: TypeCheckingConfig) {}

  /**
   * Type check blocks are inserted immediately after the end of the component class.
   */
  get splitPoint(): number { return this.ref.node.end + 1; }

  execute(im: ImportManager, sf: ts.SourceFile, refEmitter: ReferenceEmitter, printer: ts.Printer):
      string {
    const env = new Environment(this.config, im, refEmitter, sf);
    const fnName = ts.createIdentifier(`_tcb_${this.ref.node.pos}`);
    const fn = generateTypeCheckBlock(env, this.ref, fnName, this.meta);
    return printer.printNode(ts.EmitHint.Unspecified, fn, sf);
  }
}

/**
 * A type constructor operation which produces type constructor code for a particular directive.
 */
class TypeCtorOp implements Op {
  constructor(
      readonly ref: Reference<ClassDeclaration<ts.ClassDeclaration>>,
      readonly meta: TypeCtorMetadata, private config: TypeCheckingConfig) {}

  /**
   * Type constructor operations are inserted immediately before the end of the directive class.
   */
  get splitPoint(): number { return this.ref.node.end - 1; }

  execute(im: ImportManager, sf: ts.SourceFile, refEmitter: ReferenceEmitter, printer: ts.Printer):
      string {
    const tcb = generateInlineTypeCtor(this.ref.node, this.meta, this.config);
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
