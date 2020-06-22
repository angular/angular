/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BoundTarget, ParseSourceFile, SchemaMetadata} from '@angular/compiler';
import * as ts from 'typescript';

import {absoluteFromSourceFile, AbsoluteFsPath} from '../../file_system';
import {NoopImportRewriter, Reference, ReferenceEmitter} from '../../imports';
import {ClassDeclaration, ReflectionHost} from '../../reflection';
import {ImportManager} from '../../translator';

import {TemplateId, TemplateSourceMapping, TypeCheckableDirectiveMeta, TypeCheckBlockMetadata, TypeCheckingConfig, TypeCtorMetadata} from './api';
import {TemplateSourceResolver} from './diagnostics';
import {DomSchemaChecker, RegistryDomSchemaChecker} from './dom';
import {Environment} from './environment';
import {OutOfBandDiagnosticRecorder, OutOfBandDiagnosticRecorderImpl} from './oob';
import {TemplateSourceManager} from './source';
import {generateTypeCheckBlock, requiresInlineTypeCheckBlock} from './type_check_block';
import {TypeCheckFile} from './type_check_file';
import {generateInlineTypeCtor, requiresInlineTypeCtor} from './type_constructor';

/**
 * Complete type-checking code generated for the user's program, ready for input into the
 * type-checking engine.
 */
export interface TypeCheckRequest {
  /**
   * Map of source filenames to new contents for those files.
   *
   * This includes both contents of type-checking shim files, as well as changes to any user files
   * which needed to be made to support template type-checking.
   */
  updates: Map<AbsoluteFsPath, string>;

  /**
   * Map containing additional data for each type-checking shim that is required to support
   * generation of diagnostics.
   */
  perFileData: Map<AbsoluteFsPath, FileTypeCheckingData>;
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
  sourceResolver: TemplateSourceResolver;

  /**
   * Data for each shim generated from this input file.
   *
   * A single input file will generate one or more shim files that actually contain template
   * type-checking code.
   */
  shimData: Map<AbsoluteFsPath, ShimTypeCheckingData>;
}

/**
 * Data specific to a single shim generated from an input file.
 */
export interface ShimTypeCheckingData {
  /**
   * Path to the shim file.
   */
  path: AbsoluteFsPath;

  /**
   * Any `ts.Diagnostic`s which were produced during the generation of this shim.
   *
   * Some diagnostics are produced during creation time and are tracked here.
   */
  genesisDiagnostics: ts.Diagnostic[];
}

/**
 * Data for an input file which is still in the process of template type-checking code generation.
 */
export interface PendingFileTypeCheckingData {
  /**
   * Whether any inline code has been required by the shim yet.
   */
  hasInlines: boolean;

  /**
   * Source mapping information for mapping diagnostics from inlined type check blocks back to the
   * original template.
   */
  sourceManager: TemplateSourceManager;

  /**
   * Map of in-progress shim data for shims generated from this input file.
   */
  shimData: Map<AbsoluteFsPath, PendingShimData>;
}

export interface PendingShimData {
  /**
   * Recorder for out-of-band diagnostics which are raised during generation.
   */
  oobRecorder: OutOfBandDiagnosticRecorder;

  /**
   * The `DomSchemaChecker` in use for this template, which records any schema-related diagnostics.
   */
  domSchemaChecker: DomSchemaChecker;

  /**
   * Shim file in the process of being generated.
   */
  file: TypeCheckFile;
}

/**
 * Abstracts the operation of determining which shim file will host a particular component's
 * template type-checking code.
 *
 * Different consumers of the type checking infrastructure may choose different approaches to
 * optimize for their specific use case (for example, the command-line compiler optimizes for
 * efficient `ts.Program` reuse in watch mode).
 */
export interface ComponentToShimMappingStrategy {
  /**
   * Given a component, determine a path to the shim file into which that component's type checking
   * code will be generated.
   *
   * A major constraint is that components in different input files must not share the same shim
   * file. The behavior of the template type-checking system is undefined if this is violated.
   */
  shimPathForComponent(node: ts.ClassDeclaration): AbsoluteFsPath;
}

/**
 * A template type checking context for a program.
 *
 * The `TypeCheckContext` allows registration of components and their templates which need to be
 * type checked.
 */
export class TypeCheckContext {
  private fileMap = new Map<AbsoluteFsPath, PendingFileTypeCheckingData>();

  constructor(
      private config: TypeCheckingConfig,
      private compilerHost: Pick<ts.CompilerHost, 'getCanonicalFileName'>,
      private componentMappingStrategy: ComponentToShimMappingStrategy,
      private refEmitter: ReferenceEmitter, private reflector: ReflectionHost) {}

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
   * Map of data for file paths which was adopted from a prior compilation.
   *
   * This data allows the `TypeCheckContext` to generate a `TypeCheckRequest` which can interpret
   * diagnostics from type-checking shims included in the prior compilation.
   */
  private adoptedFiles = new Map<AbsoluteFsPath, FileTypeCheckingData>();

  /**
   * Record the `FileTypeCheckingData` from a previous program that's associated with a particular
   * source file.
   */
  adoptPriorResults(sf: ts.SourceFile, data: FileTypeCheckingData): void {
    this.adoptedFiles.set(absoluteFromSourceFile(sf), data);
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
    const fileData = this.dataForFile(ref.node.getSourceFile());
    const shimData = this.pendingShimForComponent(ref.node);
    // Get all of the directives used in the template and record type constructors for all of them.
    for (const dir of boundTarget.getUsedDirectives()) {
      const dirRef = dir.ref as Reference<ClassDeclaration<ts.ClassDeclaration>>;
      const dirNode = dirRef.node;
      if (requiresInlineTypeCtor(dirNode, this.reflector)) {
        // Add a type constructor operation for the directive.
        this.addInlineTypeCtor(fileData, dirNode.getSourceFile(), dirRef, {
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
      }
    }

    const meta = {
      id: fileData.sourceManager.captureSource(ref.node, sourceMapping, file),
      boundTarget,
      pipes,
      schemas,
    };
    if (requiresInlineTypeCheckBlock(ref.node)) {
      // This class didn't meet the requirements for external type checking, so generate an inline
      // TCB for the class.
      this.addInlineTypeCheckBlock(fileData, shimData, ref, meta);
    } else {
      // The class can be type-checked externally as normal.
      shimData.file.addTypeCheckBlock(ref, meta, shimData.domSchemaChecker, shimData.oobRecorder);
    }
  }

  /**
   * Record a type constructor for the given `node` with the given `ctorMetadata`.
   */
  addInlineTypeCtor(
      fileData: PendingFileTypeCheckingData, sf: ts.SourceFile,
      ref: Reference<ClassDeclaration<ts.ClassDeclaration>>, ctorMeta: TypeCtorMetadata): void {
    if (this.typeCtorPending.has(ref.node)) {
      return;
    }
    this.typeCtorPending.add(ref.node);

    // Lazily construct the operation map.
    if (!this.opMap.has(sf)) {
      this.opMap.set(sf, []);
    }
    const ops = this.opMap.get(sf)!;

    // Push a `TypeCtorOp` into the operation queue for the source file.
    ops.push(new TypeCtorOp(ref, ctorMeta));
    fileData.hasInlines = true;
  }

  /**
   * Transform a `ts.SourceFile` into a version that includes type checking code.
   *
   * If this particular `ts.SourceFile` requires changes, the text representing its new contents
   * will be returned. Otherwise, a `null` return indicates no changes were necessary.
   */
  transform(sf: ts.SourceFile): string|null {
    // If there are no operations pending for this particular file, return `null` to indicate no
    // changes.
    if (!this.opMap.has(sf)) {
      return null;
    }

    // Imports may need to be added to the file to support type-checking of directives used in the
    // template within it.
    const importManager = new ImportManager(new NoopImportRewriter(), '_i');

    // Each Op has a splitPoint index into the text where it needs to be inserted. Split the
    // original source text into chunks at these split points, where code will be inserted between
    // the chunks.
    const ops = this.opMap.get(sf)!.sort(orderOps);
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

    return code;
  }

  finalize(): TypeCheckRequest {
    // First, build the map of updates to source files.
    const updates = new Map<AbsoluteFsPath, string>();
    for (const originalSf of this.opMap.keys()) {
      const newText = this.transform(originalSf);
      if (newText !== null) {
        updates.set(absoluteFromSourceFile(originalSf), newText);
      }
    }

    const results: TypeCheckRequest = {
      updates: updates,
      perFileData: new Map<AbsoluteFsPath, FileTypeCheckingData>(),
    };

    // Then go through each input file that has pending code generation operations.
    for (const [sfPath, pendingFileData] of this.fileMap) {
      const fileData: FileTypeCheckingData = {
        hasInlines: pendingFileData.hasInlines,
        shimData: new Map(),
        sourceResolver: pendingFileData.sourceManager,
      };

      // For each input file, consider generation operations for each of its shims.
      for (const [shimPath, pendingShimData] of pendingFileData.shimData) {
        updates.set(pendingShimData.file.fileName, pendingShimData.file.render());
        fileData.shimData.set(shimPath, {
          genesisDiagnostics: [
            ...pendingShimData.domSchemaChecker.diagnostics,
            ...pendingShimData.oobRecorder.diagnostics,
          ],
          path: pendingShimData.file.fileName,
        });
      }

      results.perFileData.set(sfPath, fileData);
    }

    for (const [sfPath, fileData] of this.adoptedFiles.entries()) {
      results.perFileData.set(sfPath, fileData);
    }

    return results;
  }

  private addInlineTypeCheckBlock(
      fileData: PendingFileTypeCheckingData, shimData: PendingShimData,
      ref: Reference<ClassDeclaration<ts.ClassDeclaration>>,
      tcbMeta: TypeCheckBlockMetadata): void {
    const sf = ref.node.getSourceFile();
    if (!this.opMap.has(sf)) {
      this.opMap.set(sf, []);
    }
    const ops = this.opMap.get(sf)!;
    ops.push(new TcbOp(
        ref, tcbMeta, this.config, this.reflector, shimData.domSchemaChecker,
        shimData.oobRecorder));
    fileData.hasInlines = true;
  }

  private pendingShimForComponent(node: ts.ClassDeclaration): PendingShimData {
    const fileData = this.dataForFile(node.getSourceFile());
    const shimPath = this.componentMappingStrategy.shimPathForComponent(node);
    if (!fileData.shimData.has(shimPath)) {
      fileData.shimData.set(shimPath, {
        domSchemaChecker: new RegistryDomSchemaChecker(fileData.sourceManager),
        oobRecorder: new OutOfBandDiagnosticRecorderImpl(fileData.sourceManager),
        file: new TypeCheckFile(
            shimPath, this.config, this.refEmitter, this.reflector, this.compilerHost),
      });
    }
    return fileData.shimData.get(shimPath)!;
  }

  private dataForFile(sf: ts.SourceFile): PendingFileTypeCheckingData {
    const sfPath = absoluteFromSourceFile(sf);

    const sourceManager = new TemplateSourceManager();

    if (!this.fileMap.has(sfPath)) {
      const data: PendingFileTypeCheckingData = {
        hasInlines: false,
        sourceManager,
        shimData: new Map(),
      };
      this.fileMap.set(sfPath, data);
    }

    return this.fileMap.get(sfPath)!;
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
  get splitPoint(): number {
    return this.ref.node.end + 1;
  }

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
  get splitPoint(): number {
    return this.ref.node.end - 1;
  }

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
