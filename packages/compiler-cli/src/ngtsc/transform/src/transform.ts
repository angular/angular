/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ConstantPool} from '@angular/compiler';
import ts from 'typescript';

import {
  DefaultImportTracker,
  ImportRewriter,
  LocalCompilationExtraImportsTracker,
} from '../../imports';
import {getDefaultImportDeclaration} from '../../imports/src/default';
import {PerfPhase, PerfRecorder} from '../../perf';
import {Decorator, ReflectionHost} from '../../reflection';
import {
  ImportManager,
  presetImportManagerForceNamespaceImports,
  RecordWrappedNodeFn,
  translateExpression,
  translateStatement,
  TranslatorOptions,
} from '../../translator';
import {visit, VisitListEntryResult, Visitor} from '../../util/src/visitor';

import {CompileResult} from './api';
import {TraitCompiler} from './compilation';

const NO_DECORATORS = new Set<ts.Decorator>();

const CLOSURE_FILE_OVERVIEW_REGEXP = /\s+@fileoverview\s+/i;

/**
 * Metadata to support @fileoverview blocks (Closure annotations) extracting/restoring.
 */
interface FileOverviewMeta {
  comments: ts.SynthesizedComment[];
  host: ts.Statement;
  trailing: boolean;
}

export function ivyTransformFactory(
  compilation: TraitCompiler,
  reflector: ReflectionHost,
  importRewriter: ImportRewriter,
  defaultImportTracker: DefaultImportTracker,
  localCompilationExtraImportsTracker: LocalCompilationExtraImportsTracker | null,
  perf: PerfRecorder,
  isCore: boolean,
  isClosureCompilerEnabled: boolean,
  emitDeclarationOnly: boolean,
): ts.TransformerFactory<ts.SourceFile> {
  const recordWrappedNode = createRecorderFn(defaultImportTracker);
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (file: ts.SourceFile): ts.SourceFile => {
      return perf.inPhase(PerfPhase.Compile, () =>
        transformIvySourceFile(
          compilation,
          context,
          reflector,
          importRewriter,
          localCompilationExtraImportsTracker,
          file,
          isCore,
          isClosureCompilerEnabled,
          emitDeclarationOnly,
          recordWrappedNode,
        ),
      );
    };
  };
}

/**
 * Visits all classes, performs Ivy compilation where Angular decorators are present and collects
 * result in a Map that associates a ts.ClassDeclaration with Ivy compilation results. This visitor
 * does NOT perform any TS transformations.
 */
class IvyCompilationVisitor extends Visitor {
  public classCompilationMap = new Map<ts.ClassDeclaration, CompileResult[]>();
  public deferrableImports = new Set<ts.ImportDeclaration>();

  constructor(
    private compilation: TraitCompiler,
    private constantPool: ConstantPool,
  ) {
    super();
  }

  override visitClassDeclaration(
    node: ts.ClassDeclaration,
  ): VisitListEntryResult<ts.Statement, ts.ClassDeclaration> {
    // Determine if this class has an Ivy field that needs to be added, and compile the field
    // to an expression if so.
    const result = this.compilation.compile(node, this.constantPool);
    if (result !== null) {
      this.classCompilationMap.set(node, result);

      // Collect all deferrable imports declarations into a single set,
      // so that we can pass it to the transform visitor that will drop
      // corresponding regular import declarations.
      for (const classResult of result) {
        if (classResult.deferrableImports !== null && classResult.deferrableImports.size > 0) {
          classResult.deferrableImports.forEach((importDecl) =>
            this.deferrableImports.add(importDecl),
          );
        }
      }
    }
    return {node};
  }
}

/**
 * Visits all classes and performs transformation of corresponding TS nodes based on the Ivy
 * compilation results (provided as an argument).
 */
class IvyTransformationVisitor extends Visitor {
  constructor(
    private compilation: TraitCompiler,
    private classCompilationMap: Map<ts.ClassDeclaration, CompileResult[]>,
    private reflector: ReflectionHost,
    private importManager: ImportManager,
    private recordWrappedNodeExpr: RecordWrappedNodeFn<ts.Expression>,
    private isClosureCompilerEnabled: boolean,
    private isCore: boolean,
    private deferrableImports: Set<ts.ImportDeclaration>,
  ) {
    super();
  }

  override visitClassDeclaration(
    node: ts.ClassDeclaration,
  ): VisitListEntryResult<ts.Statement, ts.ClassDeclaration> {
    // If this class is not registered in the map, it means that it doesn't have Angular decorators,
    // thus no further processing is required.
    if (!this.classCompilationMap.has(node)) {
      return {node};
    }

    const translateOptions: TranslatorOptions<ts.Expression> = {
      recordWrappedNode: this.recordWrappedNodeExpr,
      annotateForClosureCompiler: this.isClosureCompilerEnabled,
    };

    // There is at least one field to add.
    const statements: ts.Statement[] = [];
    const members = [...node.members];

    // Note: Class may be already transformed by e.g. Tsickle and
    // not have a direct reference to the source file.
    const sourceFile = ts.getOriginalNode(node).getSourceFile();

    for (const field of this.classCompilationMap.get(node)!) {
      // Type-only member.
      if (field.initializer === null) {
        continue;
      }

      // Translate the initializer for the field into TS nodes.
      const exprNode = translateExpression(
        sourceFile,
        field.initializer,
        this.importManager,
        translateOptions,
      );

      // Create a static property declaration for the new field.
      const property = ts.factory.createPropertyDeclaration(
        [ts.factory.createToken(ts.SyntaxKind.StaticKeyword)],
        field.name,
        undefined,
        undefined,
        exprNode,
      );

      if (this.isClosureCompilerEnabled) {
        // Closure compiler transforms the form `Service.ɵprov = X` into `Service$ɵprov = X`. To
        // prevent this transformation, such assignments need to be annotated with @nocollapse.
        // Note that tsickle is typically responsible for adding such annotations, however it
        // doesn't yet handle synthetic fields added during other transformations.
        ts.addSyntheticLeadingComment(
          property,
          ts.SyntaxKind.MultiLineCommentTrivia,
          '* @nocollapse ',
          /* hasTrailingNewLine */ false,
        );
      }

      field.statements
        .map((stmt) => translateStatement(sourceFile, stmt, this.importManager, translateOptions))
        .forEach((stmt) => statements.push(stmt));

      members.push(property);
    }

    const filteredDecorators =
      // Remove the decorator which triggered this compilation, leaving the others alone.
      maybeFilterDecorator(ts.getDecorators(node), this.compilation.decoratorsFor(node));

    const nodeModifiers = ts.getModifiers(node);
    let updatedModifiers: ts.ModifierLike[] | undefined;

    if (filteredDecorators?.length || nodeModifiers?.length) {
      updatedModifiers = [...(filteredDecorators || []), ...(nodeModifiers || [])];
    }

    // Replace the class declaration with an updated version.
    node = ts.factory.updateClassDeclaration(
      node,
      updatedModifiers,
      node.name,
      node.typeParameters,
      node.heritageClauses || [],
      // Map over the class members and remove any Angular decorators from them.
      members.map((member) => this._stripAngularDecorators(member)),
    );
    return {node, after: statements};
  }

  override visitOtherNode<T extends ts.Node>(node: T): T {
    if (ts.isImportDeclaration(node) && this.deferrableImports.has(node)) {
      // Return `null` as an indication that this node should not be present
      // in the final AST. Symbols from this import would be imported via
      // dynamic imports.
      return null!;
    }
    return node;
  }

  /**
   * Return all decorators on a `Declaration` which are from @angular/core, or an empty set if none
   * are.
   */
  private _angularCoreDecorators(decl: ts.Declaration): Set<ts.Decorator> {
    const decorators = this.reflector.getDecoratorsOfDeclaration(decl);
    if (decorators === null) {
      return NO_DECORATORS;
    }
    const coreDecorators = decorators
      .filter((dec) => this.isCore || isFromAngularCore(dec))
      .map((dec) => dec.node as ts.Decorator);
    if (coreDecorators.length > 0) {
      return new Set<ts.Decorator>(coreDecorators);
    } else {
      return NO_DECORATORS;
    }
  }

  private _nonCoreDecoratorsOnly(node: ts.HasDecorators): ts.NodeArray<ts.Decorator> | undefined {
    const decorators = ts.getDecorators(node);

    // Shortcut if the node has no decorators.
    if (decorators === undefined) {
      return undefined;
    }
    // Build a Set of the decorators on this node from @angular/core.
    const coreDecorators = this._angularCoreDecorators(node);

    if (coreDecorators.size === decorators.length) {
      // If all decorators are to be removed, return `undefined`.
      return undefined;
    } else if (coreDecorators.size === 0) {
      // If no decorators need to be removed, return the original decorators array.
      return nodeArrayFromDecoratorsArray(decorators);
    }

    // Filter out the core decorators.
    const filtered = decorators.filter((dec) => !coreDecorators.has(dec));

    // If no decorators survive, return `undefined`. This can only happen if a core decorator is
    // repeated on the node.
    if (filtered.length === 0) {
      return undefined;
    }

    // Create a new `NodeArray` with the filtered decorators that sourcemaps back to the original.
    return nodeArrayFromDecoratorsArray(filtered);
  }

  /**
   * Remove Angular decorators from a `ts.Node` in a shallow manner.
   *
   * This will remove decorators from class elements (getters, setters, properties, methods) as well
   * as parameters of constructors.
   */
  private _stripAngularDecorators<T extends ts.Node>(node: T): T {
    const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
    const nonCoreDecorators = ts.canHaveDecorators(node)
      ? this._nonCoreDecoratorsOnly(node)
      : undefined;
    const combinedModifiers = [...(nonCoreDecorators || []), ...(modifiers || [])];

    if (ts.isParameter(node)) {
      // Strip decorators from parameters (probably of the constructor).
      node = ts.factory.updateParameterDeclaration(
        node,
        combinedModifiers,
        node.dotDotDotToken,
        node.name,
        node.questionToken,
        node.type,
        node.initializer,
      ) as T & ts.ParameterDeclaration;
    } else if (ts.isMethodDeclaration(node)) {
      // Strip decorators of methods.
      node = ts.factory.updateMethodDeclaration(
        node,
        combinedModifiers,
        node.asteriskToken,
        node.name,
        node.questionToken,
        node.typeParameters,
        node.parameters,
        node.type,
        node.body,
      ) as T & ts.MethodDeclaration;
    } else if (ts.isPropertyDeclaration(node)) {
      // Strip decorators of properties.
      node = ts.factory.updatePropertyDeclaration(
        node,
        combinedModifiers,
        node.name,
        node.questionToken,
        node.type,
        node.initializer,
      ) as T & ts.PropertyDeclaration;
    } else if (ts.isGetAccessor(node)) {
      // Strip decorators of getters.
      node = ts.factory.updateGetAccessorDeclaration(
        node,
        combinedModifiers,
        node.name,
        node.parameters,
        node.type,
        node.body,
      ) as T & ts.GetAccessorDeclaration;
    } else if (ts.isSetAccessor(node)) {
      // Strip decorators of setters.
      node = ts.factory.updateSetAccessorDeclaration(
        node,
        combinedModifiers,
        node.name,
        node.parameters,
        node.body,
      ) as T & ts.SetAccessorDeclaration;
    } else if (ts.isConstructorDeclaration(node)) {
      // For constructors, strip decorators of the parameters.
      const parameters = node.parameters.map((param) => this._stripAngularDecorators(param));
      node = ts.factory.updateConstructorDeclaration(node, modifiers, parameters, node.body) as T &
        ts.ConstructorDeclaration;
    }
    return node;
  }
}

/**
 * A transformer which operates on ts.SourceFiles and applies changes from an `IvyCompilation`.
 */
function transformIvySourceFile(
  compilation: TraitCompiler,
  context: ts.TransformationContext,
  reflector: ReflectionHost,
  importRewriter: ImportRewriter,
  localCompilationExtraImportsTracker: LocalCompilationExtraImportsTracker | null,
  file: ts.SourceFile,
  isCore: boolean,
  isClosureCompilerEnabled: boolean,
  emitDeclarationOnly: boolean,
  recordWrappedNode: RecordWrappedNodeFn<ts.Expression>,
): ts.SourceFile {
  const constantPool = new ConstantPool(isClosureCompilerEnabled);
  const importManager = new ImportManager({
    ...presetImportManagerForceNamespaceImports,
    rewriter: importRewriter,
  });

  // The transformation process consists of 2 steps:
  //
  //  1. Visit all classes, perform compilation and collect the results.
  //  2. Perform actual transformation of required TS nodes using compilation results from the first
  //     step.
  //
  // This is needed to have all `o.Expression`s generated before any TS transforms happen. This
  // allows `ConstantPool` to properly identify expressions that can be shared across multiple
  // components declared in the same file.

  // Step 1. Go though all classes in AST, perform compilation and collect the results.
  const compilationVisitor = new IvyCompilationVisitor(compilation, constantPool);
  visit(file, compilationVisitor, context);

  // If we are emitting declarations only, we can skip the script transforms.
  if (emitDeclarationOnly) {
    return file;
  }

  // Step 2. Scan through the AST again and perform transformations based on Ivy compilation
  // results obtained at Step 1.
  const transformationVisitor = new IvyTransformationVisitor(
    compilation,
    compilationVisitor.classCompilationMap,
    reflector,
    importManager,
    recordWrappedNode,
    isClosureCompilerEnabled,
    isCore,
    compilationVisitor.deferrableImports,
  );
  let sf = visit(file, transformationVisitor, context);

  // Generate the constant statements first, as they may involve adding additional imports
  // to the ImportManager.
  const downlevelTranslatedCode = getLocalizeCompileTarget(context) < ts.ScriptTarget.ES2015;
  const constants = constantPool.statements.map((stmt) =>
    translateStatement(file, stmt, importManager, {
      recordWrappedNode,
      downlevelTaggedTemplates: downlevelTranslatedCode,
      downlevelVariableDeclarations: downlevelTranslatedCode,
      annotateForClosureCompiler: isClosureCompilerEnabled,
    }),
  );

  // Preserve @fileoverview comments required by Closure, since the location might change as a
  // result of adding extra imports and constant pool statements.
  const fileOverviewMeta = isClosureCompilerEnabled ? getFileOverviewComment(sf.statements) : null;

  // Add extra imports.
  if (localCompilationExtraImportsTracker !== null) {
    for (const moduleName of localCompilationExtraImportsTracker.getImportsForFile(sf)) {
      importManager.addSideEffectImport(sf, moduleName);
    }
  }

  // Add new imports for this file.
  sf = importManager.transformTsFile(context, sf, constants);

  if (fileOverviewMeta !== null) {
    sf = insertFileOverviewComment(sf, fileOverviewMeta);
  }

  return sf;
}

/**
 * Compute the correct target output for `$localize` messages generated by Angular
 *
 * In some versions of TypeScript, the transformation of synthetic `$localize` tagged template
 * literals is broken. See https://github.com/microsoft/TypeScript/issues/38485
 *
 * Here we compute what the expected final output target of the compilation will
 * be so that we can generate ES5 compliant `$localize` calls instead of relying upon TS to do the
 * downleveling for us.
 */
function getLocalizeCompileTarget(
  context: ts.TransformationContext,
): Exclude<ts.ScriptTarget, ts.ScriptTarget.JSON> {
  const target = context.getCompilerOptions().target || ts.ScriptTarget.ES2015;
  return target !== ts.ScriptTarget.JSON ? target : ts.ScriptTarget.ES2015;
}

function getFileOverviewComment(statements: ts.NodeArray<ts.Statement>): FileOverviewMeta | null {
  if (statements.length > 0) {
    const host = statements[0];
    let trailing = false;
    let comments = ts.getSyntheticLeadingComments(host);
    // If @fileoverview tag is not found in source file, tsickle produces fake node with trailing
    // comment and inject it at the very beginning of the generated file. So we need to check for
    // leading as well as trailing comments.
    if (!comments || comments.length === 0) {
      trailing = true;
      comments = ts.getSyntheticTrailingComments(host);
    }
    if (comments && comments.length > 0 && CLOSURE_FILE_OVERVIEW_REGEXP.test(comments[0].text)) {
      return {comments, host, trailing};
    }
  }
  return null;
}

function insertFileOverviewComment(
  sf: ts.SourceFile,
  fileoverview: FileOverviewMeta,
): ts.SourceFile {
  const {comments, host, trailing} = fileoverview;
  // If host statement is no longer the first one, it means that extra statements were added at the
  // very beginning, so we need to relocate @fileoverview comment and cleanup the original statement
  // that hosted it.
  if (sf.statements.length > 0 && host !== sf.statements[0]) {
    if (trailing) {
      ts.setSyntheticTrailingComments(host, undefined);
    } else {
      ts.setSyntheticLeadingComments(host, undefined);
    }

    // Note: Do not use the first statement as it may be elided at runtime.
    // E.g. an import declaration that is type only.
    const commentNode = ts.factory.createNotEmittedStatement(sf);
    ts.setSyntheticLeadingComments(commentNode, comments);

    return ts.factory.updateSourceFile(
      sf,
      [commentNode, ...sf.statements],
      sf.isDeclarationFile,
      sf.referencedFiles,
      sf.typeReferenceDirectives,
      sf.hasNoDefaultLib,
      sf.libReferenceDirectives,
    );
  }
  return sf;
}

function maybeFilterDecorator(
  decorators: readonly ts.Decorator[] | undefined,
  toRemove: ts.Decorator[],
): ts.NodeArray<ts.Decorator> | undefined {
  if (decorators === undefined) {
    return undefined;
  }
  const filtered = decorators.filter(
    (dec) => toRemove.find((decToRemove) => ts.getOriginalNode(dec) === decToRemove) === undefined,
  );
  if (filtered.length === 0) {
    return undefined;
  }
  return ts.factory.createNodeArray(filtered);
}

function isFromAngularCore(decorator: Decorator): boolean {
  return decorator.import !== null && decorator.import.from === '@angular/core';
}

function createRecorderFn(
  defaultImportTracker: DefaultImportTracker,
): RecordWrappedNodeFn<ts.Expression> {
  return (node) => {
    const importDecl = getDefaultImportDeclaration(node);
    if (importDecl !== null) {
      defaultImportTracker.recordUsedImport(importDecl);
    }
  };
}

/** Creates a `NodeArray` with the correct offsets from an array of decorators. */
function nodeArrayFromDecoratorsArray(
  decorators: readonly ts.Decorator[],
): ts.NodeArray<ts.Decorator> {
  const array = ts.factory.createNodeArray(decorators);

  if (array.length > 0) {
    (array.pos as number) = decorators[0].pos;
    (array.end as number) = decorators[decorators.length - 1].end;
  }

  return array;
}
