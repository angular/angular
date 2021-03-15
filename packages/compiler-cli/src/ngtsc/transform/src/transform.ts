/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConstantPool} from '@angular/compiler';
import * as ts from 'typescript';

import {DefaultImportRecorder, ImportRewriter} from '../../imports';
import {PerfPhase, PerfRecorder} from '../../perf';
import {Decorator, ReflectionHost} from '../../reflection';
import {ImportManager, RecordWrappedNodeExprFn, translateExpression, translateStatement, TranslatorOptions} from '../../translator';
import {visit, VisitListEntryResult, Visitor} from '../../util/src/visitor';

import {CompileResult} from './api';
import {TraitCompiler} from './compilation';
import {addImports} from './utils';

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
    compilation: TraitCompiler, reflector: ReflectionHost, importRewriter: ImportRewriter,
    defaultImportRecorder: DefaultImportRecorder, perf: PerfRecorder, isCore: boolean,
    isClosureCompilerEnabled: boolean): ts.TransformerFactory<ts.SourceFile> {
  const recordWrappedNodeExpr = createRecorderFn(defaultImportRecorder);
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (file: ts.SourceFile): ts.SourceFile => {
      return perf.inPhase(
          PerfPhase.Compile,
          () => transformIvySourceFile(
              compilation, context, reflector, importRewriter, file, isCore,
              isClosureCompilerEnabled, recordWrappedNodeExpr));
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

  constructor(private compilation: TraitCompiler, private constantPool: ConstantPool) {
    super();
  }

  visitClassDeclaration(node: ts.ClassDeclaration):
      VisitListEntryResult<ts.Statement, ts.ClassDeclaration> {
    // Determine if this class has an Ivy field that needs to be added, and compile the field
    // to an expression if so.
    const result = this.compilation.compile(node, this.constantPool);
    if (result !== null) {
      this.classCompilationMap.set(node, result);
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
      private reflector: ReflectionHost, private importManager: ImportManager,
      private recordWrappedNodeExpr: RecordWrappedNodeExprFn<ts.Expression>,
      private isClosureCompilerEnabled: boolean, private isCore: boolean) {
    super();
  }

  visitClassDeclaration(node: ts.ClassDeclaration):
      VisitListEntryResult<ts.Statement, ts.ClassDeclaration> {
    // If this class is not registered in the map, it means that it doesn't have Angular decorators,
    // thus no further processing is required.
    if (!this.classCompilationMap.has(node)) {
      return {node};
    }

    const translateOptions: TranslatorOptions<ts.Expression> = {
      recordWrappedNodeExpr: this.recordWrappedNodeExpr,
      annotateForClosureCompiler: this.isClosureCompilerEnabled,
    };

    // There is at least one field to add.
    const statements: ts.Statement[] = [];
    const members = [...node.members];

    for (const field of this.classCompilationMap.get(node)!) {
      // Translate the initializer for the field into TS nodes.
      const exprNode = translateExpression(field.initializer, this.importManager, translateOptions);

      // Create a static property declaration for the new field.
      const property = ts.createProperty(
          undefined, [ts.createToken(ts.SyntaxKind.StaticKeyword)], field.name, undefined,
          undefined, exprNode);

      if (this.isClosureCompilerEnabled) {
        // Closure compiler transforms the form `Service.ɵprov = X` into `Service$ɵprov = X`. To
        // prevent this transformation, such assignments need to be annotated with @nocollapse.
        // Note that tsickle is typically responsible for adding such annotations, however it
        // doesn't yet handle synthetic fields added during other transformations.
        ts.addSyntheticLeadingComment(
            property, ts.SyntaxKind.MultiLineCommentTrivia, '* @nocollapse ',
            /* hasTrailingNewLine */ false);
      }

      field.statements.map(stmt => translateStatement(stmt, this.importManager, translateOptions))
          .forEach(stmt => statements.push(stmt));

      members.push(property);
    }

    // Replace the class declaration with an updated version.
    node = ts.updateClassDeclaration(
        node,
        // Remove the decorator which triggered this compilation, leaving the others alone.
        maybeFilterDecorator(node.decorators, this.compilation.decoratorsFor(node)), node.modifiers,
        node.name, node.typeParameters, node.heritageClauses || [],
        // Map over the class members and remove any Angular decorators from them.
        members.map(member => this._stripAngularDecorators(member)));
    return {node, after: statements};
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
    const coreDecorators = decorators.filter(dec => this.isCore || isFromAngularCore(dec))
                               .map(dec => dec.node as ts.Decorator);
    if (coreDecorators.length > 0) {
      return new Set<ts.Decorator>(coreDecorators);
    } else {
      return NO_DECORATORS;
    }
  }

  /**
   * Given a `ts.Node`, filter the decorators array and return a version containing only non-Angular
   * decorators.
   *
   * If all decorators are removed (or none existed in the first place), this method returns
   * `undefined`.
   */
  private _nonCoreDecoratorsOnly(node: ts.Declaration): ts.NodeArray<ts.Decorator>|undefined {
    // Shortcut if the node has no decorators.
    if (node.decorators === undefined) {
      return undefined;
    }
    // Build a Set of the decorators on this node from @angular/core.
    const coreDecorators = this._angularCoreDecorators(node);

    if (coreDecorators.size === node.decorators.length) {
      // If all decorators are to be removed, return `undefined`.
      return undefined;
    } else if (coreDecorators.size === 0) {
      // If no decorators need to be removed, return the original decorators array.
      return node.decorators;
    }

    // Filter out the core decorators.
    const filtered = node.decorators.filter(dec => !coreDecorators.has(dec));

    // If no decorators survive, return `undefined`. This can only happen if a core decorator is
    // repeated on the node.
    if (filtered.length === 0) {
      return undefined;
    }

    // Create a new `NodeArray` with the filtered decorators that sourcemaps back to the original.
    const array = ts.createNodeArray(filtered);
    (array.pos as number) = node.decorators.pos;
    (array.end as number) = node.decorators.end;
    return array;
  }

  /**
   * Remove Angular decorators from a `ts.Node` in a shallow manner.
   *
   * This will remove decorators from class elements (getters, setters, properties, methods) as well
   * as parameters of constructors.
   */
  private _stripAngularDecorators<T extends ts.Node>(node: T): T {
    if (ts.isParameter(node)) {
      // Strip decorators from parameters (probably of the constructor).
      node = ts.updateParameter(
                 node, this._nonCoreDecoratorsOnly(node), node.modifiers, node.dotDotDotToken,
                 node.name, node.questionToken, node.type, node.initializer) as T &
          ts.ParameterDeclaration;
    } else if (ts.isMethodDeclaration(node) && node.decorators !== undefined) {
      // Strip decorators of methods.
      node = ts.updateMethod(
                 node, this._nonCoreDecoratorsOnly(node), node.modifiers, node.asteriskToken,
                 node.name, node.questionToken, node.typeParameters, node.parameters, node.type,
                 node.body) as T &
          ts.MethodDeclaration;
    } else if (ts.isPropertyDeclaration(node) && node.decorators !== undefined) {
      // Strip decorators of properties.
      node = ts.updateProperty(
                 node, this._nonCoreDecoratorsOnly(node), node.modifiers, node.name,
                 node.questionToken, node.type, node.initializer) as T &
          ts.PropertyDeclaration;
    } else if (ts.isGetAccessor(node)) {
      // Strip decorators of getters.
      node = ts.updateGetAccessor(
                 node, this._nonCoreDecoratorsOnly(node), node.modifiers, node.name,
                 node.parameters, node.type, node.body) as T &
          ts.GetAccessorDeclaration;
    } else if (ts.isSetAccessor(node)) {
      // Strip decorators of setters.
      node = ts.updateSetAccessor(
                 node, this._nonCoreDecoratorsOnly(node), node.modifiers, node.name,
                 node.parameters, node.body) as T &
          ts.SetAccessorDeclaration;
    } else if (ts.isConstructorDeclaration(node)) {
      // For constructors, strip decorators of the parameters.
      const parameters = node.parameters.map(param => this._stripAngularDecorators(param));
      node =
          ts.updateConstructor(node, node.decorators, node.modifiers, parameters, node.body) as T &
          ts.ConstructorDeclaration;
    }
    return node;
  }
}

/**
 * A transformer which operates on ts.SourceFiles and applies changes from an `IvyCompilation`.
 */
function transformIvySourceFile(
    compilation: TraitCompiler, context: ts.TransformationContext, reflector: ReflectionHost,
    importRewriter: ImportRewriter, file: ts.SourceFile, isCore: boolean,
    isClosureCompilerEnabled: boolean,
    recordWrappedNodeExpr: RecordWrappedNodeExprFn<ts.Expression>): ts.SourceFile {
  const constantPool = new ConstantPool(isClosureCompilerEnabled);
  const importManager = new ImportManager(importRewriter);

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

  // Step 2. Scan through the AST again and perform transformations based on Ivy compilation
  // results obtained at Step 1.
  const transformationVisitor = new IvyTransformationVisitor(
      compilation, compilationVisitor.classCompilationMap, reflector, importManager,
      recordWrappedNodeExpr, isClosureCompilerEnabled, isCore);
  let sf = visit(file, transformationVisitor, context);

  // Generate the constant statements first, as they may involve adding additional imports
  // to the ImportManager.
  const downlevelTranslatedCode = getLocalizeCompileTarget(context) < ts.ScriptTarget.ES2015;
  const constants =
      constantPool.statements.map(stmt => translateStatement(stmt, importManager, {
                                    recordWrappedNodeExpr,
                                    downlevelTaggedTemplates: downlevelTranslatedCode,
                                    downlevelVariableDeclarations: downlevelTranslatedCode,
                                    annotateForClosureCompiler: isClosureCompilerEnabled,
                                  }));

  // Preserve @fileoverview comments required by Closure, since the location might change as a
  // result of adding extra imports and constant pool statements.
  const fileOverviewMeta = isClosureCompilerEnabled ? getFileOverviewComment(sf.statements) : null;

  // Add new imports for this file.
  sf = addImports(importManager, sf, constants);

  if (fileOverviewMeta !== null) {
    setFileOverviewComment(sf, fileOverviewMeta);
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
function getLocalizeCompileTarget(context: ts.TransformationContext):
    Exclude<ts.ScriptTarget, ts.ScriptTarget.JSON> {
  const target = context.getCompilerOptions().target || ts.ScriptTarget.ES2015;
  return target !== ts.ScriptTarget.JSON ? target : ts.ScriptTarget.ES2015;
}

function getFileOverviewComment(statements: ts.NodeArray<ts.Statement>): FileOverviewMeta|null {
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

function setFileOverviewComment(sf: ts.SourceFile, fileoverview: FileOverviewMeta): void {
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
    ts.setSyntheticLeadingComments(sf.statements[0], comments);
  }
}

function maybeFilterDecorator(
    decorators: ts.NodeArray<ts.Decorator>|undefined,
    toRemove: ts.Decorator[]): ts.NodeArray<ts.Decorator>|undefined {
  if (decorators === undefined) {
    return undefined;
  }
  const filtered = decorators.filter(
      dec => toRemove.find(decToRemove => ts.getOriginalNode(dec) === decToRemove) === undefined);
  if (filtered.length === 0) {
    return undefined;
  }
  return ts.createNodeArray(filtered);
}

function isFromAngularCore(decorator: Decorator): boolean {
  return decorator.import !== null && decorator.import.from === '@angular/core';
}

function createRecorderFn(defaultImportRecorder: DefaultImportRecorder):
    RecordWrappedNodeExprFn<ts.Expression> {
  return expr => {
    if (ts.isIdentifier(expr)) {
      defaultImportRecorder.recordUsedIdentifier(expr);
    }
  };
}
