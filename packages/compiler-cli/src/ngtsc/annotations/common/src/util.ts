/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Expression,
  ExternalExpr,
  FactoryTarget,
  ParseLocation,
  ParseSourceFile,
  ParseSourceSpan,
  R3CompiledExpression,
  R3FactoryMetadata,
  R3Reference,
  ReadPropExpr,
  Statement,
  WrappedNodeExpr,
} from '@angular/compiler';
import ts from 'typescript';

import {
  assertSuccessfulReferenceEmit,
  ImportedFile,
  ImportFlags,
  ModuleResolver,
  Reference,
  ReferenceEmitter,
} from '../../../imports';
import {attachDefaultImportDeclaration} from '../../../imports/src/default';
import {ForeignFunctionResolver, PartialEvaluator} from '../../../partial_evaluator';
import {
  ClassDeclaration,
  Decorator,
  Import,
  ImportedTypeValueReference,
  LocalTypeValueReference,
  ReflectionHost,
  TypeValueReference,
  TypeValueReferenceKind,
} from '../../../reflection';
import {CompileResult} from '../../../transform';

/** Module name of the framework core. */
export const CORE_MODULE = '@angular/core';

/**
 * Convert a `TypeValueReference` to an `Expression` which refers to the type as a value.
 *
 * Local references are converted to a `WrappedNodeExpr` of the TypeScript expression, and non-local
 * references are converted to an `ExternalExpr`. Note that this is only valid in the context of the
 * file in which the `TypeValueReference` originated.
 */
export function valueReferenceToExpression(
  valueRef: LocalTypeValueReference | ImportedTypeValueReference,
): Expression;
export function valueReferenceToExpression(valueRef: TypeValueReference): Expression | null;
export function valueReferenceToExpression(valueRef: TypeValueReference): Expression | null {
  if (valueRef.kind === TypeValueReferenceKind.UNAVAILABLE) {
    return null;
  } else if (valueRef.kind === TypeValueReferenceKind.LOCAL) {
    const expr = new WrappedNodeExpr(valueRef.expression);
    if (valueRef.defaultImportStatement !== null) {
      attachDefaultImportDeclaration(expr, valueRef.defaultImportStatement);
    }
    return expr;
  } else {
    let importExpr: Expression = new ExternalExpr({
      moduleName: valueRef.moduleName,
      name: valueRef.importedName,
    });
    if (valueRef.nestedPath !== null) {
      for (const property of valueRef.nestedPath) {
        importExpr = new ReadPropExpr(importExpr, property);
      }
    }
    return importExpr;
  }
}

export function toR3Reference(
  origin: ts.Node,
  ref: Reference,
  context: ts.SourceFile,
  refEmitter: ReferenceEmitter,
): R3Reference {
  const emittedValueRef = refEmitter.emit(ref, context);
  assertSuccessfulReferenceEmit(emittedValueRef, origin, 'class');

  const emittedTypeRef = refEmitter.emit(
    ref,
    context,
    ImportFlags.ForceNewImport | ImportFlags.AllowTypeImports,
  );
  assertSuccessfulReferenceEmit(emittedTypeRef, origin, 'class');

  return {
    value: emittedValueRef.expression,
    type: emittedTypeRef.expression,
  };
}

export function isAngularCore(decorator: Decorator): decorator is Decorator & {import: Import} {
  return decorator.import !== null && decorator.import.from === CORE_MODULE;
}

/**
 * This function is used for verifying that a given reference is declared
 * inside `@angular/core` and corresponds to the given symbol name.
 *
 * In some cases, due to the compiler face duplicating many symbols as
 * an independent bridge between core and the compiler, the dts bundler may
 * decide to alias declarations in the `.d.ts`, to avoid conflicts.
 *
 * e.g.
 *
 * ```
 * declare enum ViewEncapsulation {} // from the facade
 * declare enum ViewEncapsulation$1 {} // the real one exported to users.
 * ```
 *
 * This function accounts for such potential re-namings.
 */
export function isAngularCoreReferenceWithPotentialAliasing(
  reference: Reference,
  symbolName: string,
  isCore: boolean,
): boolean {
  return (
    (reference.ownedByModuleGuess === CORE_MODULE || isCore) &&
    reference.debugName?.replace(/\$\d+$/, '') === symbolName
  );
}

export function findAngularDecorator(
  decorators: Decorator[],
  name: string,
  isCore: boolean,
): Decorator | undefined {
  return decorators.find((decorator) => isAngularDecorator(decorator, name, isCore));
}

export function isAngularDecorator(decorator: Decorator, name: string, isCore: boolean): boolean {
  if (isCore) {
    return decorator.name === name;
  } else if (isAngularCore(decorator)) {
    return decorator.import.name === name;
  }
  return false;
}

export function getAngularDecorators(
  decorators: Decorator[],
  names: readonly string[],
  isCore: boolean,
) {
  return decorators.filter((decorator) => {
    const name = isCore ? decorator.name : decorator.import?.name;
    if (name === undefined || !names.includes(name)) {
      return false;
    }
    return isCore || isAngularCore(decorator);
  });
}

/**
 * Unwrap a `ts.Expression`, removing outer type-casts or parentheses until the expression is in its
 * lowest level form.
 *
 * For example, the expression "(foo as Type)" unwraps to "foo".
 */
export function unwrapExpression(node: ts.Expression): ts.Expression {
  while (ts.isAsExpression(node) || ts.isParenthesizedExpression(node)) {
    node = node.expression;
  }
  return node;
}

function expandForwardRef(arg: ts.Expression): ts.Expression | null {
  arg = unwrapExpression(arg);
  if (!ts.isArrowFunction(arg) && !ts.isFunctionExpression(arg)) {
    return null;
  }

  const body = arg.body;
  // Either the body is a ts.Expression directly, or a block with a single return statement.
  if (ts.isBlock(body)) {
    // Block body - look for a single return statement.
    if (body.statements.length !== 1) {
      return null;
    }
    const stmt = body.statements[0];
    if (!ts.isReturnStatement(stmt) || stmt.expression === undefined) {
      return null;
    }
    return stmt.expression;
  } else {
    // Shorthand body - return as an expression.
    return body;
  }
}

/**
 * If the given `node` is a forwardRef() expression then resolve its inner value, otherwise return
 * `null`.
 *
 * @param node the forwardRef() expression to resolve
 * @param reflector a ReflectionHost
 * @returns the resolved expression, if the original expression was a forwardRef(), or `null`
 *     otherwise.
 */
export function tryUnwrapForwardRef(
  node: ts.Expression,
  reflector: ReflectionHost,
): ts.Expression | null {
  node = unwrapExpression(node);
  if (!ts.isCallExpression(node) || node.arguments.length !== 1) {
    return null;
  }

  const fn = ts.isPropertyAccessExpression(node.expression)
    ? node.expression.name
    : node.expression;
  if (!ts.isIdentifier(fn)) {
    return null;
  }

  const expr = expandForwardRef(node.arguments[0]);
  if (expr === null) {
    return null;
  }

  const imp = reflector.getImportOfIdentifier(fn);
  if (imp === null || imp.from !== '@angular/core' || imp.name !== 'forwardRef') {
    return null;
  }

  return expr;
}

/**
 * A foreign function resolver for `staticallyResolve` which unwraps forwardRef() expressions.
 *
 * @param ref a Reference to the declaration of the function being called (which might be
 * forwardRef)
 * @param args the arguments to the invocation of the forwardRef expression
 * @returns an unwrapped argument if `ref` pointed to forwardRef, or null otherwise
 */
export function createForwardRefResolver(isCore: boolean): ForeignFunctionResolver {
  return (fn, callExpr, resolve, unresolvable) => {
    if (
      !isAngularCoreReferenceWithPotentialAliasing(fn, 'forwardRef', isCore) ||
      callExpr.arguments.length !== 1
    ) {
      return unresolvable;
    }
    const expanded = expandForwardRef(callExpr.arguments[0]);
    if (expanded !== null) {
      return resolve(expanded);
    } else {
      return unresolvable;
    }
  };
}

/**
 * Combines an array of resolver functions into a one.
 * @param resolvers Resolvers to be combined.
 */
export function combineResolvers(resolvers: ForeignFunctionResolver[]): ForeignFunctionResolver {
  return (fn, callExpr, resolve, unresolvable) => {
    for (const resolver of resolvers) {
      const resolved = resolver(fn, callExpr, resolve, unresolvable);
      if (resolved !== unresolvable) {
        return resolved;
      }
    }
    return unresolvable;
  };
}

export function isExpressionForwardReference(
  expr: Expression,
  context: ts.Node,
  contextSource: ts.SourceFile,
): boolean {
  if (isWrappedTsNodeExpr(expr)) {
    const node = ts.getOriginalNode(expr.node);
    return node.getSourceFile() === contextSource && context.pos < node.pos;
  } else {
    return false;
  }
}

export function isWrappedTsNodeExpr(expr: Expression): expr is WrappedNodeExpr<ts.Node> {
  return expr instanceof WrappedNodeExpr;
}

export function readBaseClass(
  node: ClassDeclaration,
  reflector: ReflectionHost,
  evaluator: PartialEvaluator,
): Reference<ClassDeclaration> | 'dynamic' | null {
  const baseExpression = reflector.getBaseClassExpression(node);
  if (baseExpression !== null) {
    const baseClass = evaluator.evaluate(baseExpression);
    if (baseClass instanceof Reference && reflector.isClass(baseClass.node)) {
      return baseClass as Reference<ClassDeclaration>;
    } else {
      return 'dynamic';
    }
  }

  return null;
}

const parensWrapperTransformerFactory: ts.TransformerFactory<ts.Expression> = (
  context: ts.TransformationContext,
) => {
  const visitor: ts.Visitor = (node: ts.Node): ts.Node => {
    const visited = ts.visitEachChild(node, visitor, context);
    if (ts.isArrowFunction(visited) || ts.isFunctionExpression(visited)) {
      return ts.factory.createParenthesizedExpression(visited);
    }
    return visited;
  };
  return (node: ts.Expression) => ts.visitEachChild(node, visitor, context);
};

/**
 * Wraps all functions in a given expression in parentheses. This is needed to avoid problems
 * where Tsickle annotations added between analyse and transform phases in Angular may trigger
 * automatic semicolon insertion, e.g. if a function is the expression in a `return` statement.
 * More
 * info can be found in Tsickle source code here:
 * https://github.com/angular/tsickle/blob/d7974262571c8a17d684e5ba07680e1b1993afdd/src/jsdoc_transformer.ts#L1021
 *
 * @param expression Expression where functions should be wrapped in parentheses
 */
export function wrapFunctionExpressionsInParens(expression: ts.Expression): ts.Expression {
  return ts.transform(expression, [parensWrapperTransformerFactory]).transformed[0];
}

/**
 * Resolves the given `rawProviders` into `ClassDeclarations` and returns
 * a set containing those that are known to require a factory definition.
 * @param rawProviders Expression that declared the providers array in the source.
 */
export function resolveProvidersRequiringFactory(
  rawProviders: ts.Expression,
  reflector: ReflectionHost,
  evaluator: PartialEvaluator,
): Set<Reference<ClassDeclaration>> {
  const providers = new Set<Reference<ClassDeclaration>>();
  const resolvedProviders = evaluator.evaluate(rawProviders);

  if (!Array.isArray(resolvedProviders)) {
    return providers;
  }

  resolvedProviders.forEach(function processProviders(provider) {
    let tokenClass: Reference | null = null;

    if (Array.isArray(provider)) {
      // If we ran into an array, recurse into it until we've resolve all the classes.
      provider.forEach(processProviders);
    } else if (provider instanceof Reference) {
      tokenClass = provider;
    } else if (provider instanceof Map && provider.has('useClass') && !provider.has('deps')) {
      const useExisting = provider.get('useClass')!;
      if (useExisting instanceof Reference) {
        tokenClass = useExisting;
      }
    }

    // TODO(alxhub): there was a bug where `getConstructorParameters` would return `null` for a
    // class in a .d.ts file, always, even if the class had a constructor. This was fixed for
    // `getConstructorParameters`, but that fix causes more classes to be recognized here as needing
    // provider checks, which is a breaking change in g3. Avoid this breakage for now by skipping
    // classes from .d.ts files here directly, until g3 can be cleaned up.
    if (
      tokenClass !== null &&
      !tokenClass.node.getSourceFile().isDeclarationFile &&
      reflector.isClass(tokenClass.node)
    ) {
      const constructorParameters = reflector.getConstructorParameters(tokenClass.node);

      // Note that we only want to capture providers with a non-trivial constructor,
      // because they're the ones that might be using DI and need to be decorated.
      if (constructorParameters !== null && constructorParameters.length > 0) {
        providers.add(tokenClass as Reference<ClassDeclaration>);
      }
    }
  });

  return providers;
}

/**
 * Create an R3Reference for a class.
 *
 * The `value` is the exported declaration of the class from its source file.
 * The `type` is an expression that would be used in the typings (.d.ts) files.
 */
export function wrapTypeReference(reflector: ReflectionHost, clazz: ClassDeclaration): R3Reference {
  const value = new WrappedNodeExpr(clazz.name);
  const type = value;
  return {value, type};
}

/** Creates a ParseSourceSpan for a TypeScript node. */
export function createSourceSpan(node: ts.Node): ParseSourceSpan {
  const sf = node.getSourceFile();
  const [startOffset, endOffset] = [node.getStart(), node.getEnd()];
  const {line: startLine, character: startCol} = sf.getLineAndCharacterOfPosition(startOffset);
  const {line: endLine, character: endCol} = sf.getLineAndCharacterOfPosition(endOffset);
  const parseSf = new ParseSourceFile(sf.getFullText(), sf.fileName);

  // +1 because values are zero-indexed.
  return new ParseSourceSpan(
    new ParseLocation(parseSf, startOffset, startLine + 1, startCol + 1),
    new ParseLocation(parseSf, endOffset, endLine + 1, endCol + 1),
  );
}

/**
 * Collate the factory and definition compiled results into an array of CompileResult objects.
 */
export function compileResults(
  fac: CompileResult,
  def: R3CompiledExpression,
  metadataStmt: Statement | null,
  propName: string,
  additionalFields: CompileResult[] | null,
  deferrableImports: Set<ts.ImportDeclaration> | null,
  debugInfo: Statement | null = null,
  hmrInitializer: Statement | null = null,
): CompileResult[] {
  const statements = def.statements;

  if (metadataStmt !== null) {
    statements.push(metadataStmt);
  }

  if (debugInfo !== null) {
    statements.push(debugInfo);
  }

  if (hmrInitializer !== null) {
    statements.push(hmrInitializer);
  }

  const results = [
    fac,
    {
      name: propName,
      initializer: def.expression,
      statements: def.statements,
      type: def.type,
      deferrableImports,
    },
  ];

  if (additionalFields !== null) {
    results.push(...additionalFields);
  }

  return results;
}

export function toFactoryMetadata(
  meta: Omit<R3FactoryMetadata, 'target'>,
  target: FactoryTarget,
): R3FactoryMetadata {
  return {
    name: meta.name,
    type: meta.type,
    typeArgumentCount: meta.typeArgumentCount,
    deps: meta.deps,
    target,
  };
}

export function resolveImportedFile(
  moduleResolver: ModuleResolver,
  importedFile: ImportedFile,
  expr: Expression,
  origin: ts.SourceFile,
): ts.SourceFile | null {
  // If `importedFile` is not 'unknown' then it accurately reflects the source file that is
  // being imported.
  if (importedFile !== 'unknown') {
    return importedFile;
  }

  // Otherwise `expr` has to be inspected to determine the file that is being imported. If `expr`
  // is not an `ExternalExpr` then it does not correspond with an import, so return null in that
  // case.
  if (!(expr instanceof ExternalExpr)) {
    return null;
  }

  // Figure out what file is being imported.
  return moduleResolver.resolveModule(expr.value.moduleName!, origin.fileName);
}

/**
 * Determines the most appropriate expression for diagnostic reporting purposes. If `expr` is
 * contained within `container` then `expr` is used as origin node, otherwise `container` itself is
 * used.
 */
export function getOriginNodeForDiagnostics(
  expr: ts.Expression,
  container: ts.Expression,
): ts.Expression {
  const nodeSf = expr.getSourceFile();
  const exprSf = container.getSourceFile();

  if (nodeSf === exprSf && expr.pos >= container.pos && expr.end <= container.end) {
    // `expr` occurs within the same source file as `container` and is contained within it, so
    // `expr` is appropriate to use as origin node for diagnostics.
    return expr;
  } else {
    return container;
  }
}

export function isAbstractClassDeclaration(clazz: ClassDeclaration): boolean {
  return ts.canHaveModifiers(clazz) && clazz.modifiers !== undefined
    ? clazz.modifiers.some((mod) => mod.kind === ts.SyntaxKind.AbstractKeyword)
    : false;
}
