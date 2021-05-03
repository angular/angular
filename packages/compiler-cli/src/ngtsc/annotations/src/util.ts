/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Expression, ExternalExpr, LiteralExpr, ParseLocation, ParseSourceFile, ParseSourceSpan, R3CompiledExpression, R3DependencyMetadata, R3Reference, ReadPropExpr, Statement, WrappedNodeExpr} from '@angular/compiler';
import {R3FactoryMetadata} from '@angular/compiler/src/compiler';
import {FactoryTarget} from '@angular/compiler/src/render3/partial/api';
import * as ts from 'typescript';

import {ErrorCode, FatalDiagnosticError, makeDiagnostic, makeRelatedInformation} from '../../diagnostics';
import {ImportFlags, Reference, ReferenceEmitter} from '../../imports';
import {attachDefaultImportDeclaration} from '../../imports/src/default';
import {ForeignFunctionResolver, PartialEvaluator} from '../../partial_evaluator';
import {ClassDeclaration, CtorParameter, Decorator, Import, ImportedTypeValueReference, isNamedClassDeclaration, LocalTypeValueReference, ReflectionHost, TypeValueReference, TypeValueReferenceKind, UnavailableValue, ValueUnavailableKind} from '../../reflection';
import {DeclarationData} from '../../scope';
import {CompileResult} from '../../transform';

export type ConstructorDeps = {
  deps: R3DependencyMetadata[];
}|{
  deps: null;
  errors: ConstructorDepError[];
};

export interface ConstructorDepError {
  index: number;
  param: CtorParameter;
  reason: UnavailableValue;
}

export function getConstructorDependencies(
    clazz: ClassDeclaration, reflector: ReflectionHost, isCore: boolean): ConstructorDeps|null {
  const deps: R3DependencyMetadata[] = [];
  const errors: ConstructorDepError[] = [];
  let ctorParams = reflector.getConstructorParameters(clazz);
  if (ctorParams === null) {
    if (reflector.hasBaseClass(clazz)) {
      return null;
    } else {
      ctorParams = [];
    }
  }
  ctorParams.forEach((param, idx) => {
    let token = valueReferenceToExpression(param.typeValueReference);
    let attributeNameType: Expression|null = null;
    let optional = false, self = false, skipSelf = false, host = false;

    (param.decorators || []).filter(dec => isCore || isAngularCore(dec)).forEach(dec => {
      const name = isCore || dec.import === null ? dec.name : dec.import!.name;
      if (name === 'Inject') {
        if (dec.args === null || dec.args.length !== 1) {
          throw new FatalDiagnosticError(
              ErrorCode.DECORATOR_ARITY_WRONG, Decorator.nodeForError(dec),
              `Unexpected number of arguments to @Inject().`);
        }
        token = new WrappedNodeExpr(dec.args[0]);
      } else if (name === 'Optional') {
        optional = true;
      } else if (name === 'SkipSelf') {
        skipSelf = true;
      } else if (name === 'Self') {
        self = true;
      } else if (name === 'Host') {
        host = true;
      } else if (name === 'Attribute') {
        if (dec.args === null || dec.args.length !== 1) {
          throw new FatalDiagnosticError(
              ErrorCode.DECORATOR_ARITY_WRONG, Decorator.nodeForError(dec),
              `Unexpected number of arguments to @Attribute().`);
        }
        const attributeName = dec.args[0];
        token = new WrappedNodeExpr(attributeName);
        if (ts.isStringLiteralLike(attributeName)) {
          attributeNameType = new LiteralExpr(attributeName.text);
        } else {
          attributeNameType =
              new WrappedNodeExpr(ts.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword));
        }
      } else {
        throw new FatalDiagnosticError(
            ErrorCode.DECORATOR_UNEXPECTED, Decorator.nodeForError(dec),
            `Unexpected decorator ${name} on parameter.`);
      }
    });

    if (token === null) {
      if (param.typeValueReference.kind !== TypeValueReferenceKind.UNAVAILABLE) {
        throw new Error(
            'Illegal state: expected value reference to be unavailable if no token is present');
      }
      errors.push({
        index: idx,
        param,
        reason: param.typeValueReference.reason,
      });
    } else {
      deps.push({token, attributeNameType, optional, self, skipSelf, host});
    }
  });
  if (errors.length === 0) {
    return {deps};
  } else {
    return {deps: null, errors};
  }
}

/**
 * Convert a `TypeValueReference` to an `Expression` which refers to the type as a value.
 *
 * Local references are converted to a `WrappedNodeExpr` of the TypeScript expression, and non-local
 * references are converted to an `ExternalExpr`. Note that this is only valid in the context of the
 * file in which the `TypeValueReference` originated.
 */
export function valueReferenceToExpression(valueRef: LocalTypeValueReference|
                                           ImportedTypeValueReference): Expression;
export function valueReferenceToExpression(valueRef: TypeValueReference): Expression|null;
export function valueReferenceToExpression(valueRef: TypeValueReference): Expression|null {
  if (valueRef.kind === TypeValueReferenceKind.UNAVAILABLE) {
    return null;
  } else if (valueRef.kind === TypeValueReferenceKind.LOCAL) {
    const expr = new WrappedNodeExpr(valueRef.expression);
    if (valueRef.defaultImportStatement !== null) {
      attachDefaultImportDeclaration(expr, valueRef.defaultImportStatement);
    }
    return expr;
  } else {
    let importExpr: Expression =
        new ExternalExpr({moduleName: valueRef.moduleName, name: valueRef.importedName});
    if (valueRef.nestedPath !== null) {
      for (const property of valueRef.nestedPath) {
        importExpr = new ReadPropExpr(importExpr, property);
      }
    }
    return importExpr;
  }
}

/**
 * Convert `ConstructorDeps` into the `R3DependencyMetadata` array for those deps if they're valid,
 * or into an `'invalid'` signal if they're not.
 *
 * This is a companion function to `validateConstructorDependencies` which accepts invalid deps.
 */
export function unwrapConstructorDependencies(deps: ConstructorDeps|null): R3DependencyMetadata[]|
    'invalid'|null {
  if (deps === null) {
    return null;
  } else if (deps.deps !== null) {
    // These constructor dependencies are valid.
    return deps.deps;
  } else {
    // These deps are invalid.
    return 'invalid';
  }
}

export function getValidConstructorDependencies(
    clazz: ClassDeclaration, reflector: ReflectionHost, isCore: boolean): R3DependencyMetadata[]|
    null {
  return validateConstructorDependencies(
      clazz, getConstructorDependencies(clazz, reflector, isCore));
}

/**
 * Validate that `ConstructorDeps` does not have any invalid dependencies and convert them into the
 * `R3DependencyMetadata` array if so, or raise a diagnostic if some deps are invalid.
 *
 * This is a companion function to `unwrapConstructorDependencies` which does not accept invalid
 * deps.
 */
export function validateConstructorDependencies(
    clazz: ClassDeclaration, deps: ConstructorDeps|null): R3DependencyMetadata[]|null {
  if (deps === null) {
    return null;
  } else if (deps.deps !== null) {
    return deps.deps;
  } else {
    // TODO(alxhub): this cast is necessary because the g3 typescript version doesn't narrow here.
    // There is at least one error.
    const error = (deps as {errors: ConstructorDepError[]}).errors[0];
    throw createUnsuitableInjectionTokenError(clazz, error);
  }
}

/**
 * Creates a fatal error with diagnostic for an invalid injection token.
 * @param clazz The class for which the injection token was unavailable.
 * @param error The reason why no valid injection token is available.
 */
function createUnsuitableInjectionTokenError(
    clazz: ClassDeclaration, error: ConstructorDepError): FatalDiagnosticError {
  const {param, index, reason} = error;
  let chainMessage: string|undefined = undefined;
  let hints: ts.DiagnosticRelatedInformation[]|undefined = undefined;
  switch (reason.kind) {
    case ValueUnavailableKind.UNSUPPORTED:
      chainMessage = 'Consider using the @Inject decorator to specify an injection token.';
      hints = [
        makeRelatedInformation(reason.typeNode, 'This type is not supported as injection token.'),
      ];
      break;
    case ValueUnavailableKind.NO_VALUE_DECLARATION:
      chainMessage = 'Consider using the @Inject decorator to specify an injection token.';
      hints = [
        makeRelatedInformation(
            reason.typeNode,
            'This type does not have a value, so it cannot be used as injection token.'),
      ];
      if (reason.decl !== null) {
        hints.push(makeRelatedInformation(reason.decl, 'The type is declared here.'));
      }
      break;
    case ValueUnavailableKind.TYPE_ONLY_IMPORT:
      chainMessage =
          'Consider changing the type-only import to a regular import, or use the @Inject decorator to specify an injection token.';
      hints = [
        makeRelatedInformation(
            reason.typeNode,
            'This type is imported using a type-only import, which prevents it from being usable as an injection token.'),
        makeRelatedInformation(reason.importClause, 'The type-only import occurs here.'),
      ];
      break;
    case ValueUnavailableKind.NAMESPACE:
      chainMessage = 'Consider using the @Inject decorator to specify an injection token.';
      hints = [
        makeRelatedInformation(
            reason.typeNode,
            'This type corresponds with a namespace, which cannot be used as injection token.'),
        makeRelatedInformation(reason.importClause, 'The namespace import occurs here.'),
      ];
      break;
    case ValueUnavailableKind.UNKNOWN_REFERENCE:
      chainMessage = 'The type should reference a known declaration.';
      hints = [makeRelatedInformation(reason.typeNode, 'This type could not be resolved.')];
      break;
    case ValueUnavailableKind.MISSING_TYPE:
      chainMessage =
          'Consider adding a type to the parameter or use the @Inject decorator to specify an injection token.';
      break;
  }

  const chain: ts.DiagnosticMessageChain = {
    messageText: `No suitable injection token for parameter '${param.name || index}' of class '${
        clazz.name.text}'.`,
    category: ts.DiagnosticCategory.Error,
    code: 0,
    next: [{
      messageText: chainMessage,
      category: ts.DiagnosticCategory.Message,
      code: 0,
    }],
  };

  return new FatalDiagnosticError(ErrorCode.PARAM_MISSING_TOKEN, param.nameNode, chain, hints);
}

export function toR3Reference(
    valueRef: Reference, typeRef: Reference, valueContext: ts.SourceFile,
    typeContext: ts.SourceFile, refEmitter: ReferenceEmitter): R3Reference {
  return {
    value: refEmitter.emit(valueRef, valueContext).expression,
    type: refEmitter
              .emit(typeRef, typeContext, ImportFlags.ForceNewImport | ImportFlags.AllowTypeImports)
              .expression,
  };
}

export function isAngularCore(decorator: Decorator): decorator is Decorator&{import: Import} {
  return decorator.import !== null && decorator.import.from === '@angular/core';
}

export function isAngularCoreReference(reference: Reference, symbolName: string): boolean {
  return reference.ownedByModuleGuess === '@angular/core' && reference.debugName === symbolName;
}

export function findAngularDecorator(
    decorators: Decorator[], name: string, isCore: boolean): Decorator|undefined {
  return decorators.find(decorator => isAngularDecorator(decorator, name, isCore));
}

export function isAngularDecorator(decorator: Decorator, name: string, isCore: boolean): boolean {
  if (isCore) {
    return decorator.name === name;
  } else if (isAngularCore(decorator)) {
    return decorator.import.name === name;
  }
  return false;
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

function expandForwardRef(arg: ts.Expression): ts.Expression|null {
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
export function tryUnwrapForwardRef(node: ts.Expression, reflector: ReflectionHost): ts.Expression|
    null {
  node = unwrapExpression(node);
  if (!ts.isCallExpression(node) || node.arguments.length !== 1) {
    return null;
  }

  const fn =
      ts.isPropertyAccessExpression(node.expression) ? node.expression.name : node.expression;
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
export function forwardRefResolver(
    ref: Reference<ts.FunctionDeclaration|ts.MethodDeclaration|ts.FunctionExpression>,
    args: ReadonlyArray<ts.Expression>): ts.Expression|null {
  if (!isAngularCoreReference(ref, 'forwardRef') || args.length !== 1) {
    return null;
  }
  return expandForwardRef(args[0]);
}

/**
 * Combines an array of resolver functions into a one.
 * @param resolvers Resolvers to be combined.
 */
export function combineResolvers(resolvers: ForeignFunctionResolver[]): ForeignFunctionResolver {
  return (ref: Reference<ts.FunctionDeclaration|ts.MethodDeclaration|ts.FunctionExpression>,
          args: ReadonlyArray<ts.Expression>): ts.Expression|null => {
    for (const resolver of resolvers) {
      const resolved = resolver(ref, args);
      if (resolved !== null) {
        return resolved;
      }
    }
    return null;
  };
}

export function isExpressionForwardReference(
    expr: Expression, context: ts.Node, contextSource: ts.SourceFile): boolean {
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
    node: ClassDeclaration, reflector: ReflectionHost,
    evaluator: PartialEvaluator): Reference<ClassDeclaration>|'dynamic'|null {
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

const parensWrapperTransformerFactory: ts.TransformerFactory<ts.Expression> =
    (context: ts.TransformationContext) => {
      const visitor: ts.Visitor = (node: ts.Node): ts.Node => {
        const visited = ts.visitEachChild(node, visitor, context);
        if (ts.isArrowFunction(visited) || ts.isFunctionExpression(visited)) {
          return ts.createParen(visited);
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
 * Create a `ts.Diagnostic` which indicates the given class is part of the declarations of two or
 * more NgModules.
 *
 * The resulting `ts.Diagnostic` will have a context entry for each NgModule showing the point where
 * the directive/pipe exists in its `declarations` (if possible).
 */
export function makeDuplicateDeclarationError(
    node: ClassDeclaration, data: DeclarationData[], kind: string): ts.Diagnostic {
  const context: ts.DiagnosticRelatedInformation[] = [];
  for (const decl of data) {
    if (decl.rawDeclarations === null) {
      continue;
    }
    // Try to find the reference to the declaration within the declarations array, to hang the
    // error there. If it can't be found, fall back on using the NgModule's name.
    const contextNode = decl.ref.getOriginForDiagnostics(decl.rawDeclarations, decl.ngModule.name);
    context.push(makeRelatedInformation(
        contextNode,
        `'${node.name.text}' is listed in the declarations of the NgModule '${
            decl.ngModule.name.text}'.`));
  }

  // Finally, produce the diagnostic.
  return makeDiagnostic(
      ErrorCode.NGMODULE_DECLARATION_NOT_UNIQUE, node.name,
      `The ${kind} '${node.name.text}' is declared by more than one NgModule.`, context);
}

/**
 * Resolves the given `rawProviders` into `ClassDeclarations` and returns
 * a set containing those that are known to require a factory definition.
 * @param rawProviders Expression that declared the providers array in the source.
 */
export function resolveProvidersRequiringFactory(
    rawProviders: ts.Expression, reflector: ReflectionHost,
    evaluator: PartialEvaluator): Set<Reference<ClassDeclaration>> {
  const providers = new Set<Reference<ClassDeclaration>>();
  const resolvedProviders = evaluator.evaluate(rawProviders);

  if (!Array.isArray(resolvedProviders)) {
    return providers;
  }

  resolvedProviders.forEach(function processProviders(provider) {
    let tokenClass: Reference|null = null;

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
    if (tokenClass !== null && !tokenClass.node.getSourceFile().isDeclarationFile &&
        reflector.isClass(tokenClass.node)) {
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
 * The `type` is an expression that would be used by ngcc in the typings (.d.ts) files.
 */
export function wrapTypeReference(reflector: ReflectionHost, clazz: ClassDeclaration): R3Reference {
  const dtsClass = reflector.getDtsDeclaration(clazz);
  const value = new WrappedNodeExpr(clazz.name);
  const type = dtsClass !== null && isNamedClassDeclaration(dtsClass) ?
      new WrappedNodeExpr(dtsClass.name) :
      value;
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
      new ParseLocation(parseSf, endOffset, endLine + 1, endCol + 1));
}

/**
 * Collate the factory and definition compiled results into an array of CompileResult objects.
 */
export function compileResults(
    fac: CompileResult, def: R3CompiledExpression, metadataStmt: Statement|null,
    propName: string): CompileResult[] {
  const statements = def.statements;
  if (metadataStmt !== null) {
    statements.push(metadataStmt);
  }
  return [
    fac, {
      name: propName,
      initializer: def.expression,
      statements: def.statements,
      type: def.type,
    }
  ];
}

export function toFactoryMetadata(
    meta: Omit<R3FactoryMetadata, 'target'>, target: FactoryTarget): R3FactoryMetadata {
  return {
    name: meta.name,
    type: meta.type,
    internalType: meta.internalType,
    typeArgumentCount: meta.typeArgumentCount,
    deps: meta.deps,
    target
  };
}
