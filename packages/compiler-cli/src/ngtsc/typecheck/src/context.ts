/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  BoundTarget,
  DirectiveMeta,
  DomSchemaChecker,
  generateTypeCheckBlock,
  OutOfBandDiagnosticRecorder,
  ParseError,
  ParseSourceFile,
  R3TargetBinder,
  SchemaMetadata,
  TcbGenericContextBehavior,
  TmplAstHostElement,
  TmplAstNode,
  TypeCheckId,
  TypeCheckingConfig,
  TypeCtorMetadata,
} from '@angular/compiler';
import MagicString from 'magic-string';
import ts from 'typescript';

import {ErrorCode, makeDiagnostic, ngErrorCode} from '../../../../src/ngtsc/diagnostics';
import {absoluteFromSourceFile, AbsoluteFsPath} from '../../file_system';
import {Reference, ReferenceEmitter} from '../../imports';
import {PerfEvent, PerfRecorder} from '../../perf';
import {FileUpdate, InliningMode} from '../../program_driver';
import {ClassDeclaration, ReflectionHost} from '../../reflection';
import {ImportManager} from '../../translator';
import {
  HostBindingsContext,
  TemplateDiagnostic,
  SourceMapping,
  TypeCheckableDirectiveMeta,
  TypeCheckBlockMetadata,
  TypeCheckContext,
  TemplateContext,
} from '../api';
import {makeTemplateDiagnostic} from '../diagnostics';

import {adaptTypeCheckBlockMetadata} from './tcb_adapter';
import {RegistryDomSchemaChecker} from './dom';
import {Environment} from './environment';
import {OutOfBandDiagnosticRecorderImpl} from './oob';
import {ReferenceEmitEnvironment} from './reference_emit_environment';
import {TypeCheckShimGenerator} from './shim';
import {DirectiveSourceManager} from './source';
import {requiresInlineTypeCheckBlock, TcbInliningRequirement} from './tcb_util';
import {TCB_FUNCTION_PREFIX, TypeCheckFile} from './type_check_file';
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
   * Map of `TypeCheckId` to information collected about the template during the template
   * type-checking process.
   */
  data: Map<TypeCheckId, TypeCheckData>;
}

/**
 * Data tracked for each class processed by the type-checking system.
 */
export interface TypeCheckData<D extends DirectiveMeta = TypeCheckableDirectiveMeta> {
  /**
   * Template nodes for which the TCB was generated.
   */
  template: TmplAstNode[] | null;

  /**
   * `BoundTarget` which was used to generate the TCB, and contains bindings for the associated
   * template nodes.
   */
  boundTarget: BoundTarget<D>;

  /**
   * Errors found while parsing the template, which have been converted to diagnostics.
   */
  templateParsingDiagnostics: TemplateDiagnostic[];

  /**
   * Element representing the host bindings of a directive.
   */
  hostElement: TmplAstHostElement | null;
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
  sourceManager: DirectiveSourceManager;

  /**
   * Map of in-progress shim data for shims generated from this input file.
   */
  shimData: Map<AbsoluteFsPath, PendingShimData>;

  /**
   * The original source file.
   */
  sourceFile?: ts.SourceFile;
}

export interface PendingShimData {
  /**
   * Recorder for out-of-band diagnostics which are raised during generation.
   */
  oobRecorder: OutOfBandDiagnosticRecorder<TemplateDiagnostic>;

  /**
   * The `DomSchemaChecker` in use for this template, which records any schema-related diagnostics.
   */
  domSchemaChecker: DomSchemaChecker<TemplateDiagnostic>;

  /**
   * Shim file in the process of being generated.
   */
  file: TypeCheckFile;

  /**
   * Map of `TypeCheckId` to information collected about the template as it's ingested.
   */
  data: Map<TypeCheckId, TypeCheckData>;

  /**
   * Diagnostics produced during shim creation.
   */
  shimDiagnostics: TemplateDiagnostic[] | null;
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
   * Retrieve the `DirectiveSourceManager` responsible for directives in the given input file path.
   */
  getSourceManager(sfPath: AbsoluteFsPath): DirectiveSourceManager;

  /**
   * Whether a particular class should be included in the current type-checking pass.
   *
   * Not all classes offered to the `TypeCheckContext` for checking may require processing. For
   * example, the directive may have results already available from a prior pass or from a previous
   * program.
   */
  shouldCheckClass(node: ts.ClassDeclaration): boolean;

  /**
   * Report data from a shim generated from the given input file path.
   */
  recordShimData(sfPath: AbsoluteFsPath, data: ShimTypeCheckingData): void;

  /**
   * Record that all of the classes within the given input file path had code generated - that
   * is, coverage for the file can be considered complete.
   */
  recordComplete(sfPath: AbsoluteFsPath): void;
}

/**
 * A template type checking context for a program.
 *
 * The `TypeCheckContext` allows registration of directives to be type checked.
 */
export class TypeCheckContextImpl implements TypeCheckContext {
  private fileMap = new Map<AbsoluteFsPath, PendingFileTypeCheckingData>();

  constructor(
    private config: TypeCheckingConfig,
    private compilerHost: Pick<ts.CompilerHost, 'getCanonicalFileName' | 'getSourceFile'>,
    private refEmitter: ReferenceEmitter,
    private reflector: ReflectionHost,
    private host: TypeCheckingHost,
    private inlining: InliningMode,
    private perf: PerfRecorder,
  ) {
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
  addDirective(
    ref: Reference<ClassDeclaration<ts.ClassDeclaration>>,
    binder: R3TargetBinder<TypeCheckableDirectiveMeta>,
    schemas: SchemaMetadata[],
    templateContext: TemplateContext | null,
    hostBindingContext: HostBindingsContext | null,
    isStandalone: boolean,
  ): void {
    if (!this.host.shouldCheckClass(ref.node)) {
      return;
    }

    const sourceFile = ref.node.getSourceFile();
    const fileData = this.dataForFile(sourceFile);
    const shimData = this.pendingShimForClass(ref.node);
    const id = fileData.sourceManager.getTypeCheckId(ref.node);
    const templateParsingDiagnostics: TemplateDiagnostic[] = [];

    if (templateContext !== null && templateContext.parseErrors !== null) {
      templateParsingDiagnostics.push(
        ...getTemplateDiagnostics(templateContext.parseErrors, id, templateContext.sourceMapping),
      );
    }

    const boundTarget = binder.bind({
      template: templateContext?.nodes,
      host:
        hostBindingContext === null
          ? undefined
          : {
              node: hostBindingContext.node,
              directives: hostBindingContext.directives,
            },
    });

    if (this.inlining === InliningMode.InlineOps) {
      // Get all of the directives used in the template and record inline type constructors when
      // required.
      for (const dir of boundTarget.getUsedDirectives()) {
        const dirRef = dir.ref as Reference<ClassDeclaration<ts.ClassDeclaration>>;
        const dirNode = dirRef.node;

        if (
          !dir.isGeneric ||
          !requiresInlineTypeCtor(dirNode, this.reflector, (r) => shimData.file.canReferenceType(r))
        ) {
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
            inputs: dir.inputs,
            // TODO(alxhub): support queries
          },
          coercedInputFields: dir.coercedInputFields,
        });
      }
    }

    shimData.data.set(id, {
      template: templateContext?.nodes || null,
      boundTarget,
      templateParsingDiagnostics,
      hostElement: hostBindingContext?.node ?? null,
    });

    const usedPipes: Reference<ClassDeclaration<ts.ClassDeclaration>>[] = [];

    if (templateContext !== null) {
      for (const name of boundTarget.getUsedPipes()) {
        if (templateContext.pipes.has(name)) {
          usedPipes.push(
            templateContext.pipes.get(name)!.ref as Reference<
              ClassDeclaration<ts.ClassDeclaration>
            >,
          );
        }
      }
    }

    const inliningRequirement = requiresInlineTypeCheckBlock(
      ref,
      shimData.file,
      usedPipes,
      this.reflector,
    );

    // If inlining is not supported, but is required for either the TCB or one of its directive
    // dependencies, then exit here with an error.
    if (
      this.inlining === InliningMode.Error &&
      inliningRequirement === TcbInliningRequirement.MustInline
    ) {
      // This template cannot be supported because the underlying strategy does not support inlining
      // and inlining would be required.

      // Record diagnostics to indicate the issues with this template.
      shimData.shimDiagnostics ??= [];
      shimData.shimDiagnostics.push({
        ...makeDiagnostic(
          ErrorCode.INLINE_TCB_REQUIRED,
          ref.node.name,
          `This component requires inline template type-checking, which is not supported by the current environment.`,
        ),
        sourceFile: ref.node.getSourceFile(),
        typeCheckId: id,
      });

      // Checking this template would be unsupported, so don't try.
      this.perf.eventCount(PerfEvent.SkipGenerateTcbNoInline);
      return;
    }

    if (templateContext !== null) {
      fileData.sourceManager.captureTemplateSource(
        id,
        templateContext.sourceMapping,
        templateContext.file,
      );
    }

    if (hostBindingContext !== null) {
      fileData.sourceManager.captureHostBindingsMapping(
        id,
        hostBindingContext.sourceMapping,
        // We only support host bindings in the same file as the directive
        // so we can get the source file from here.
        new ParseSourceFile(sourceFile.text, sourceFile.fileName),
      );
    }

    const meta = {
      id,
      boundTarget,
      pipes: templateContext?.pipes || null,
      schemas,
      isStandalone,
      preserveWhitespaces: templateContext?.preserveWhitespaces ?? false,
    };
    this.perf.eventCount(PerfEvent.GenerateTcb);
    if (
      inliningRequirement !== TcbInliningRequirement.None &&
      (this.inlining === InliningMode.InlineOps || this.inlining === InliningMode.CopySourceToTcb)
    ) {
      // Queue operations for both inline and copy strategy!
      // The decision on where to apply them will be made in finalize().
      this.addInlineTypeCheckBlock(fileData, shimData, ref, meta);

      if (this.inlining === InliningMode.CopySourceToTcb) {
        // Still set the original file path to force local references for symbols from this file.
        shimData.file.copiedSourceOriginPath = absoluteFromSourceFile(sourceFile);
      }
    } else if (
      inliningRequirement === TcbInliningRequirement.ShouldInlineForGenericBounds &&
      this.inlining === InliningMode.Error
    ) {
      // It's suggested that this TCB should be generated inline due to the class' generic
      // bounds, but inlining is not supported by the current environment. Use a non-inline type
      // check block, but fall back to `any` generic parameters since the generic bounds can't be
      // referenced in that context. This will infer a less useful type for the class, but allow
      // for type-checking it in an environment where that would not be possible otherwise.
      shimData.file.addTypeCheckBlock(
        ref,
        meta,
        shimData.domSchemaChecker,
        shimData.oobRecorder,
        TcbGenericContextBehavior.FallbackToAny,
        this.reflector,
      );
    } else {
      shimData.file.addTypeCheckBlock(
        ref,
        meta,
        shimData.domSchemaChecker,
        shimData.oobRecorder,
        TcbGenericContextBehavior.UseEmitter,
        this.reflector,
      );
    }
  }

  /**
   * Record a type constructor for the given `node` with the given `ctorMetadata`.
   */
  addInlineTypeCtor(
    fileData: PendingFileTypeCheckingData,
    sf: ts.SourceFile,
    ref: Reference<ClassDeclaration<ts.ClassDeclaration>>,
    ctorMeta: TypeCtorMetadata,
  ): void {
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
    ops.push(new TypeCtorOp(ref, this.reflector, ctorMeta));
    fileData.hasInlines = true;
  }

  /**
   * Applies operations to a file.
   */
  private executeOperations(targetSf: ts.SourceFile, opsSourceSf: ts.SourceFile): string {
    // Use a `ts.Printer` to generate source code.
    const printer = ts.createPrinter({omitTrailingSemicolon: true});

    // Imports may need to be added to the file to support type-checking of directives
    // used in the template within it.
    const importManager = new ImportManager({
      // This minimizes noticeable changes with older versions of `ImportManager`.
      forceGenerateNamespacesForNewImports: true,
      // Type check block code affects code completion and fix suggestions.
      // We want to encourage single quotes for now, like we always did.
      shouldUseSingleQuotes: () => true,
    });

    // Execute ops.
    // Each Op has a splitPoint index into the text where it needs to be inserted.
    const updates: {pos: number; deletePos?: number; text: string}[] = this.opMap
      .get(opsSourceSf)!
      .map((op) => {
        return {
          pos: op.splitPoint,
          text: op.execute(importManager, targetSf, this.refEmitter),
        };
      });

    const {newImports, updatedImports} = importManager.finalize();

    // Capture new imports
    if (newImports.has(targetSf.fileName)) {
      newImports.get(targetSf.fileName)!.forEach((newImport) => {
        updates.push({
          pos: 0,
          text: printer.printNode(ts.EmitHint.Unspecified, newImport, targetSf),
        });
      });
    }

    // Capture updated imports
    for (const [oldBindings, newBindings] of updatedImports.entries()) {
      if (oldBindings.getSourceFile() !== targetSf) {
        throw new Error('Unexpected updates to unrelated source files.');
      }
      updates.push({
        pos: oldBindings.getStart(),
        deletePos: oldBindings.getEnd(),
        text: printer.printNode(ts.EmitHint.Unspecified, newBindings, targetSf),
      });
    }

    // TODO: Consider generating a sourcemap here via `result.generateMap()`.
    // This could be used in `CopySourceToTcb` mode to map positions in the shim file
    // back to the original source file, helping with language features like "Go to Definition"
    // and diagnostic translation.
    const result = new MagicString(targetSf.text, {filename: targetSf.fileName});
    for (const update of updates) {
      if (update.deletePos !== undefined) {
        result.remove(update.pos, update.deletePos);
      }
      result.appendLeft(update.pos, update.text);
    }
    return result.toString();
  }

  /**
   * Generates the transformed text for an original source file.
   */
  private generateTransformedOriginalFile(sf: ts.SourceFile): string | null {
    if (this.inlining !== InliningMode.InlineOps || !this.opMap.has(sf)) {
      return null;
    }
    return this.executeOperations(sf, sf);
  }

  /**
   * Generates the content for a shim file that copies the source of the original file.
   */
  private generateCopiedShimContent(
    originalSf: ts.SourceFile,
    shimFileName: string,
  ): string | null {
    if (this.inlining !== InliningMode.CopySourceToTcb || !this.opMap.has(originalSf)) {
      return null;
    }
    const fakeSf = ts.createSourceFile(shimFileName, originalSf.text, ts.ScriptTarget.Latest, true);
    return this.executeOperations(fakeSf, originalSf);
  }

  finalize(): Map<AbsoluteFsPath, FileUpdate> {
    // First, build the map of updates to source files.
    const updates = new Map<AbsoluteFsPath, FileUpdate>();
    for (const originalSf of this.opMap.keys()) {
      const newText = this.generateTransformedOriginalFile(originalSf);
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
        const genesisDiagnostics = [
          ...pendingShimData.domSchemaChecker.diagnostics,
          ...pendingShimData.oobRecorder.diagnostics,
        ];

        if (pendingShimData.shimDiagnostics !== null) {
          genesisDiagnostics.unshift(...pendingShimData.shimDiagnostics);
        }

        this.host.recordShimData(sfPath, {
          genesisDiagnostics,
          hasInlines: pendingFileData.hasInlines,
          path: pendingShimData.file.fileName,
          data: pendingShimData.data,
        });

        // Set the source content on the shim file before rendering!
        const originalSf = pendingFileData.sourceFile;
        if (originalSf !== undefined) {
          const transformedText = this.generateCopiedShimContent(
            originalSf,
            pendingShimData.file.fileName,
          );
          if (transformedText !== null) {
            pendingShimData.file.setSourceContent(transformedText);
          }
        }

        const sfText = pendingShimData.file.render();
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
    fileData: PendingFileTypeCheckingData,
    shimData: PendingShimData,
    ref: Reference<ClassDeclaration<ts.ClassDeclaration>>,
    tcbMeta: TypeCheckBlockMetadata,
  ): void {
    const sf = ref.node.getSourceFile();
    if (!this.opMap.has(sf)) {
      this.opMap.set(sf, []);
    }
    const ops = this.opMap.get(sf)!;
    ops.push(
      new InlineTcbOp(
        ref,
        tcbMeta,
        this.config,
        this.reflector,
        shimData.domSchemaChecker,
        shimData.oobRecorder,
      ),
    );

    fileData.hasInlines = true;
  }

  private pendingShimForClass(node: ts.ClassDeclaration): PendingShimData {
    const fileData = this.dataForFile(node.getSourceFile());
    const shimPath = TypeCheckShimGenerator.shimFor(absoluteFromSourceFile(node.getSourceFile()));
    if (!fileData.shimData.has(shimPath)) {
      fileData.shimData.set(shimPath, {
        domSchemaChecker: new RegistryDomSchemaChecker(fileData.sourceManager),
        oobRecorder: new OutOfBandDiagnosticRecorderImpl(fileData.sourceManager, (name) =>
          this.compilerHost.getSourceFile(name, ts.ScriptTarget.Latest),
        ),
        file: new TypeCheckFile(shimPath, this.config, this.refEmitter, this.compilerHost),
        data: new Map<TypeCheckId, TypeCheckData>(),
        shimDiagnostics: null,
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
        sourceFile: sf,
      };
      this.fileMap.set(sfPath, data);
    }

    return this.fileMap.get(sfPath)!;
  }
}

export function getTemplateDiagnostics(
  parseErrors: ParseError[],
  templateId: TypeCheckId,
  sourceMapping: SourceMapping,
): TemplateDiagnostic[] {
  return parseErrors.map((error) => {
    const span = error.span;

    if (span.start.offset === span.end.offset) {
      // Template errors can contain zero-length spans, if the error occurs at a single point.
      // However, TypeScript does not handle displaying a zero-length diagnostic very well, so
      // increase the ending offset by 1 for such errors, to ensure the position is shown in the
      // diagnostic.
      span.end.offset++;
    }

    return makeTemplateDiagnostic(
      templateId,
      sourceMapping,
      span,
      ts.DiagnosticCategory.Error,
      ngErrorCode(ErrorCode.TEMPLATE_PARSE_ERROR),
      error.msg,
    );
  });
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
  execute(im: ImportManager, sf: ts.SourceFile, refEmitter: ReferenceEmitter): string;
}

/**
 * A type check block operation which produces inline type check code for a particular directive.
 */
class InlineTcbOp implements Op {
  constructor(
    readonly ref: Reference<ClassDeclaration<ts.ClassDeclaration>>,
    readonly meta: TypeCheckBlockMetadata,
    readonly config: TypeCheckingConfig,
    readonly reflector: ReflectionHost,
    readonly domSchemaChecker: DomSchemaChecker<unknown>,
    readonly oobRecorder: OutOfBandDiagnosticRecorder<unknown>,
  ) {}

  /**
   * Type check blocks are inserted immediately after the end of the directve class.
   */
  get splitPoint(): number {
    return this.ref.node.end + 1;
  }

  execute(im: ImportManager, tcbSf: ts.SourceFile, refEmitter: ReferenceEmitter): string {
    const env = new Environment(this.config, im, refEmitter, tcbSf);
    const originalSf = this.ref.node.getSourceFile();
    if (tcbSf !== originalSf) {
      env.copiedSourceOriginPath = absoluteFromSourceFile(originalSf);
    }
    const fnName = `${TCB_FUNCTION_PREFIX}_${this.ref.node.pos}`;

    const {tcbMeta, component} = adaptTypeCheckBlockMetadata(
      this.ref,
      this.meta,
      env,
      this.reflector,
      TcbGenericContextBehavior.CopyClassNodes,
    );

    // Inline TCBs should copy any generic type parameter nodes directly, as the TCB code is
    // inlined into the class in a context where that will always be legal.
    const fn = generateTypeCheckBlock(
      env,
      component,
      fnName,
      tcbMeta,
      this.domSchemaChecker,
      this.oobRecorder,
    );

    // A leading newline is required so that the generated TCB isn't accidentally
    // appended as part of a trailing single-line comment (e.g. `// comment`).
    return `\n${fn}`;
  }
}

/**
 * A type constructor operation which produces type constructor code for a particular directive.
 */
class TypeCtorOp implements Op {
  constructor(
    readonly ref: Reference<ClassDeclaration<ts.ClassDeclaration>>,
    readonly reflector: ReflectionHost,
    readonly meta: TypeCtorMetadata,
  ) {}

  /**
   * Type constructor operations are inserted immediately before the end of the directive class.
   */
  get splitPoint(): number {
    return this.ref.node.end - 1;
  }

  execute(im: ImportManager, sf: ts.SourceFile, refEmitter: ReferenceEmitter): string {
    const emitEnv = new ReferenceEmitEnvironment(im, refEmitter, sf);
    return generateInlineTypeCtor(emitEnv, this.ref.node, this.meta);
  }
}
