/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BoundTarget, ParseError, ParseSourceFile, R3TargetBinder, SchemaMetadata, TemplateParseError, TmplAstNode} from '@angular/compiler';
import {ErrorCode, ngErrorCode} from '@angular/compiler-cli/src/ngtsc/diagnostics';
import * as ts from 'typescript';

import {absoluteFromSourceFile, AbsoluteFsPath} from '../../file_system';
import {NoopImportRewriter, Reference, ReferenceEmitter} from '../../imports';
import {PerfEvent, PerfRecorder} from '../../perf';
import {FileUpdate} from '../../program_driver';
import {ClassDeclaration, ReflectionHost} from '../../reflection';
import {ImportManager} from '../../translator';
import {TemplateId, TemplateSourceMapping, TypeCheckableDirectiveMeta, TypeCheckBlockMetadata, TypeCheckContext, TypeCheckingConfig, TypeCtorMetadata} from '../api';
import {makeTemplateDiagnostic, TemplateDiagnostic} from '../diagnostics';

import {DomSchemaChecker, RegistryDomSchemaChecker} from './dom';
import {Environment} from './environment';
import {OutOfBandDiagnosticRecorder, OutOfBandDiagnosticRecorderImpl} from './oob';
import {TypeCheckShimGenerator} from './shim';
import {TemplateSourceManager} from './source';
import {requiresInlineTypeCheckBlock, TcbInliningRequirement} from './tcb_util';
import {generateTypeCheckBlock, TcbGenericContextBehavior} from './type_check_block';
import {TypeCheckFile} from './type_check_file';
import {generateInlineTypeCtor, requiresInlineTypeCtor} from './type_constructor';

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
  genesisDiagnostics: TemplateDiagnostic[];

  /**
   * Whether any inline operations for the input file were required to generate this shim.
   */
  hasInlines: boolean;

  /**
   * Map of `TemplateId` to information collected about the template during the template
   * type-checking process.
   */
  templates: Map<TemplateId, TemplateData>;
}

/**
 * Data tracked for each template processed by the template type-checking system.
 */
export interface TemplateData {
  /**
   * Template nodes for which the TCB was generated.
   */
  template: TmplAstNode[];

  /**
   * `BoundTarget` which was used to generate the TCB, and contains bindings for the associated
   * template nodes.
   */
  boundTarget: BoundTarget<TypeCheckableDirectiveMeta>;

  /**
   * Errors found while parsing them template, which have been converted to diagnostics.
   */
  templateDiagnostics: TemplateDiagnostic[];
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


  /**
   * Map of `TemplateId` to information collected about the template as it's ingested.
   */
  templates: Map<TemplateId, TemplateData>;
}

/**
 * Adapts the `TypeCheckContextImpl` to the larger template type-checking system.
 *
 * Through this interface, a single `TypeCheckContextImpl` (which represents one "pass" of template
 * type-checking) requests information about the larger state of type-checking, as well as reports
 * back its results once finalized.
 */
export interface TypeCheckingHost {
  /**
   * Retrieve the `TemplateSourceManager` responsible for components in the given input file path.
   */
  getSourceManager(sfPath: AbsoluteFsPath): TemplateSourceManager;

  /**
   * Whether a particular component class should be included in the current type-checking pass.
   *
   * Not all components offered to the `TypeCheckContext` for checking may require processing. For
   * example, the component may have results already available from a prior pass or from a previous
   * program.
   */
  shouldCheckComponent(node: ts.ClassDeclaration): boolean;

  /**
   * Report data from a shim generated from the given input file path.
   */
  recordShimData(sfPath: AbsoluteFsPath, data: ShimTypeCheckingData): void;

  /**
   * Record that all of the components within the given input file path had code generated - that
   * is, coverage for the file can be considered complete.
   */
  recordComplete(sfPath: AbsoluteFsPath): void;
}

/**
 * How a type-checking context should handle operations which would require inlining.
 */
export enum InliningMode {
  /**
   * Use inlining operations when required.
   */
  InlineOps,

  /**
   * Produce diagnostics if an operation would require inlining.
   */
  Error,
}

/**
 * A template type checking context for a program.
 *
 * The `TypeCheckContext` allows registration of components and their templates which need to be
 * type checked.
 */
export class TypeCheckContextImpl implements TypeCheckContext {
  private fileMap = new Map<AbsoluteFsPath, PendingFileTypeCheckingData>();

  constructor(
      private config: TypeCheckingConfig,
      private compilerHost: Pick<ts.CompilerHost, 'getCanonicalFileName'>,
      private refEmitter: ReferenceEmitter, private reflector: ReflectionHost,
      private host: TypeCheckingHost, private inlining: InliningMode, private perf: PerfRecorder) {
    if (inlining === InliningMode.Error && config.useInlineTypeConstructors) {
      // We cannot use inlining for type checking since this environment does not support it.
      throw new Error(`AssertionError: invalid inlining configuration.`);
    }
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
   * Register a template to potentially be type-checked.
   *
   * Implements `TypeCheckContext.addTemplate`.
   */
  addTemplate(
      ref: Reference<ClassDeclaration<ts.ClassDeclaration>>,
      binder: R3TargetBinder<TypeCheckableDirectiveMeta>, template: TmplAstNode[],
      pipes: Map<string, Reference<ClassDeclaration<ts.ClassDeclaration>>>,
      schemas: SchemaMetadata[], sourceMapping: TemplateSourceMapping, file: ParseSourceFile,
      parseErrors: ParseError[]|null): void {
    if (!this.host.shouldCheckComponent(ref.node)) {
      return;
    }

    const fileData = this.dataForFile(ref.node.getSourceFile());
    const shimData = this.pendingShimForComponent(ref.node);
    const templateId = fileData.sourceManager.getTemplateId(ref.node);

    const templateDiagnostics: TemplateDiagnostic[] = [];

    if (parseErrors !== null) {
      templateDiagnostics.push(
          ...this.getTemplateDiagnostics(parseErrors, templateId, sourceMapping));
    }

    const boundTarget = binder.bind({template});

    if (this.inlining === InliningMode.InlineOps) {
      // Get all of the directives used in the template and record inline type constructors when
      // required.
      for (const dir of boundTarget.getUsedDirectives()) {
        const dirRef = dir.ref as Reference<ClassDeclaration<ts.ClassDeclaration>>;
        const dirNode = dirRef.node;

        if (!dir.isGeneric || !requiresInlineTypeCtor(dirNode, this.reflector)) {
          // inlining not required
          continue;
        }

        // Add an inline type constructor operation for the directive.
        this.addInlineTypeCtor(fileData, dirNode.getSourceFile(), dirRef, {
          fnName: 'ngTypeCtor',
          // The constructor should have a body if the directive comes from a .ts file, but not if
          // it comes from a .d.ts file. .d.ts declarations don't have bodies.
          body: !dirNode.getSourceFile().isDeclarationFile,
          fields: {
            inputs: dir.inputs.classPropertyNames,
            outputs: dir.outputs.classPropertyNames,
            // TODO(alxhub): support queries
            queries: dir.queries,
          },
          coercedInputFields: dir.coercedInputFields,
        });
      }
    }

    shimData.templates.set(templateId, {
      template,
      boundTarget,
      templateDiagnostics,
    });

    const inliningRequirement = requiresInlineTypeCheckBlock(ref.node, pipes, this.reflector);

    // If inlining is not supported, but is required for either the TCB or one of its directive
    // dependencies, then exit here with an error.
    if (this.inlining === InliningMode.Error &&
        inliningRequirement === TcbInliningRequirement.MustInline) {
      // This template cannot be supported because the underlying strategy does not support inlining
      // and inlining would be required.

      // Record diagnostics to indicate the issues with this template.
      shimData.oobRecorder.requiresInlineTcb(templateId, ref.node);

      // Checking this template would be unsupported, so don't try.
      this.perf.eventCount(PerfEvent.SkipGenerateTcbNoInline);
      return;
    }

    const meta = {
      id: fileData.sourceManager.captureSource(ref.node, sourceMapping, file),
      boundTarget,
      pipes,
      schemas,
    };
    this.perf.eventCount(PerfEvent.GenerateTcb);
    if (inliningRequirement !== TcbInliningRequirement.None &&
        this.inlining === InliningMode.InlineOps) {
      // This class didn't meet the requirements for external type checking, so generate an inline
      // TCB for the class.
      this.addInlineTypeCheckBlock(fileData, shimData, ref, meta);
    } else if (
        inliningRequirement === TcbInliningRequirement.ShouldInlineForGenericBounds &&
        this.inlining === InliningMode.Error) {
      // It's suggested that this TCB should be generated inline due to the component's generic
      // bounds, but inlining is not supported by the current environment. Use a non-inline type
      // check block, but fall back to `any` generic parameters since the generic bounds can't be
      // referenced in that context. This will infer a less useful type for the component, but allow
      // for type-checking it in an environment where that would not be possible otherwise.
      shimData.file.addTypeCheckBlock(
          ref, meta, shimData.domSchemaChecker, shimData.oobRecorder,
          TcbGenericContextBehavior.FallbackToAny);
    } else {
      shimData.file.addTypeCheckBlock(
          ref, meta, shimData.domSchemaChecker, shimData.oobRecorder,
          TcbGenericContextBehavior.UseEmitter);
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
                      .map(i => `import * as ${i.qualifier.text} from '${i.specifier}';`)
                      .join('\n');
    code = imports + '\n' + code;

    return code;
  }

  finalize(): Map<AbsoluteFsPath, FileUpdate> {
    // First, build the map of updates to source files.
    const updates = new Map<AbsoluteFsPath, FileUpdate>();
    for (const originalSf of this.opMap.keys()) {
      const newText = this.transform(originalSf);
      if (newText !== null) {
        updates.set(absoluteFromSourceFile(originalSf), {
          newText,
          originalFile: originalSf,
        });
      }
    }

    // Then go through each input file that has pending code generation operations.
    for (const [sfPath, pendingFileData] of this.fileMap) {
      // For each input file, consider generation operations for each of its shims.
      for (const pendingShimData of pendingFileData.shimData.values()) {
        this.host.recordShimData(sfPath, {
          genesisDiagnostics: [
            ...pendingShimData.domSchemaChecker.diagnostics,
            ...pendingShimData.oobRecorder.diagnostics,
          ],
          hasInlines: pendingFileData.hasInlines,
          path: pendingShimData.file.fileName,
          templates: pendingShimData.templates,
        });
        const sfText = pendingShimData.file.render(false /* removeComments */);
        updates.set(pendingShimData.file.fileName, {
          newText: sfText,

          // Shim files do not have an associated original file.
          originalFile: null,
        });
      }
    }

    return updates;
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
    ops.push(new InlineTcbOp(
        ref, tcbMeta, this.config, this.reflector, shimData.domSchemaChecker,
        shimData.oobRecorder));
    fileData.hasInlines = true;
  }

  private pendingShimForComponent(node: ts.ClassDeclaration): PendingShimData {
    const fileData = this.dataForFile(node.getSourceFile());
    const shimPath = TypeCheckShimGenerator.shimFor(absoluteFromSourceFile(node.getSourceFile()));
    if (!fileData.shimData.has(shimPath)) {
      fileData.shimData.set(shimPath, {
        domSchemaChecker: new RegistryDomSchemaChecker(fileData.sourceManager),
        oobRecorder: new OutOfBandDiagnosticRecorderImpl(fileData.sourceManager),
        file: new TypeCheckFile(
            shimPath, this.config, this.refEmitter, this.reflector, this.compilerHost),
        templates: new Map<TemplateId, TemplateData>(),
      });
    }
    return fileData.shimData.get(shimPath)!;
  }

  private dataForFile(sf: ts.SourceFile): PendingFileTypeCheckingData {
    const sfPath = absoluteFromSourceFile(sf);

    if (!this.fileMap.has(sfPath)) {
      const data: PendingFileTypeCheckingData = {
        hasInlines: false,
        sourceManager: this.host.getSourceManager(sfPath),
        shimData: new Map(),
      };
      this.fileMap.set(sfPath, data);
    }

    return this.fileMap.get(sfPath)!;
  }

  private getTemplateDiagnostics(
      parseErrors: ParseError[], templateId: TemplateId,
      sourceMapping: TemplateSourceMapping): TemplateDiagnostic[] {
    return parseErrors.map(error => {
      const span = error.span;

      if (span.start.offset === span.end.offset) {
        // Template errors can contain zero-length spans, if the error occurs at a single point.
        // However, TypeScript does not handle displaying a zero-length diagnostic very well, so
        // increase the ending offset by 1 for such errors, to ensure the position is shown in the
        // diagnostic.
        span.end.offset++;
      }

      return makeTemplateDiagnostic(
          templateId, sourceMapping, span, ts.DiagnosticCategory.Error,
          ngErrorCode(ErrorCode.TEMPLATE_PARSE_ERROR), error.msg);
    });
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
 * A type check block operation which produces inline type check code for a particular component.
 */
class InlineTcbOp implements Op {
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

    // Inline TCBs should copy any generic type parameter nodes directly, as the TCB code is inlined
    // into the class in a context where that will always be legal.
    const fn = generateTypeCheckBlock(
        env, this.ref, fnName, this.meta, this.domSchemaChecker, this.oobRecorder,
        TcbGenericContextBehavior.CopyClassNodes);
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
