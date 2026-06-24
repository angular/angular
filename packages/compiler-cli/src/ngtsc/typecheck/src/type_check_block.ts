/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {Reference} from '../../imports';
import {ClassDeclaration} from '../../reflection';
import {TypeCheckBlockMetadata} from '../api';

import {addTypeCheckId} from './diagnostics';
import {DomSchemaChecker} from './dom';
import {Environment} from './environment';
import {OutOfBandDiagnosticRecorder} from './oob';
import {TypeParameterEmitter} from './type_parameter_emitter';
import {createHostBindingsBlockGuard} from './host_bindings';
import {Context, TcbGenericContextBehavior} from './ops/context';
import {Scope} from './ops/scope';

/**
 * Given a `ts.ClassDeclaration` for a component, and metadata regarding that component, compose a
 * "type check block" function.
 *
 * When passed through TypeScript's TypeChecker, type errors that arise within the type check block
 * function indicate issues in the template itself.
 *
 * As a side effect of generating a TCB for the component, `ts.Diagnostic`s may also be produced
 * directly for issues within the template which are identified during generation. These issues are
 * recorded in either the `domSchemaChecker` (which checks usage of DOM elements and bindings) as
 * well as the `oobRecorder` (which records errors when the type-checking code generator is unable
 * to sufficiently understand a template).
 *
 * @param env an `Environment` into which type-checking code will be generated.
 * @param ref a `Reference` to the component class which should be type-checked.
 * @param name a `ts.Identifier` to use for the generated `ts.FunctionDeclaration`.
 * @param meta metadata about the component's template and the function being generated.
 * @param domSchemaChecker used to check and record errors regarding improper usage of DOM elements
 * and bindings.
 * @param oobRecorder used to record errors regarding template elements which could not be correctly
 * translated into types during TCB generation.
 * @param genericContextBehavior controls how generic parameters (especially parameters with generic
 * bounds) will be referenced from the generated TCB code.
 */
export function generateTypeCheckBlock(
  env: Environment,
  ref: Reference<ClassDeclaration<ts.ClassDeclaration>>,
  name: ts.Identifier,
  meta: TypeCheckBlockMetadata,
  domSchemaChecker: DomSchemaChecker,
  oobRecorder: OutOfBandDiagnosticRecorder,
  genericContextBehavior: TcbGenericContextBehavior,
): ts.FunctionDeclaration {
  const tcb = new Context(
    env,
    domSchemaChecker,
    oobRecorder,
    meta.id,
    meta.boundTarget,
    meta.pipes,
    meta.schemas,
    meta.isStandalone,
    meta.preserveWhitespaces,
  );
  const ctxRawType = env.referenceType(ref);
  if (!ts.isTypeReferenceNode(ctxRawType)) {
    throw new Error(
      `Expected TypeReferenceNode when referencing the ctx param for ${ref.debugName}`,
    );
  }

  let typeParameters: ts.TypeParameterDeclaration[] | undefined = undefined;
  let typeArguments: ts.TypeNode[] | undefined = undefined;

  if (ref.node.typeParameters !== undefined) {
    if (!env.config.useContextGenericType) {
      genericContextBehavior = TcbGenericContextBehavior.FallbackToAny;
    }

    switch (genericContextBehavior) {
      case TcbGenericContextBehavior.UseEmitter:
        // Guaranteed to emit type parameters since we checked that the class has them above.
        typeParameters = new TypeParameterEmitter(ref.node.typeParameters, env.reflector).emit(
          (typeRef) => env.referenceType(typeRef),
        )!;
        typeArguments = typeParameters.map((param) =>
          ts.factory.createTypeReferenceNode(param.name),
        );
        break;
      case TcbGenericContextBehavior.CopyClassNodes:
        typeParameters = [...ref.node.typeParameters];
        typeArguments = typeParameters.map((param) =>
          ts.factory.createTypeReferenceNode(param.name),
        );
        break;
      case TcbGenericContextBehavior.FallbackToAny:
        typeArguments = ref.node.typeParameters.map(() =>
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
        );
        break;
    }
  }

  const paramList = [tcbThisParam(ctxRawType.typeName, typeArguments)];
  const statements: ts.Statement[] = [];

  // Add the template type checking code.
  if (tcb.boundTarget.target.template !== undefined) {
    const templateScope = Scope.forNodes(
      tcb,
      null,
      null,
      tcb.boundTarget.target.template,
      /* guard */ null,
    );

    statements.push(renderBlockStatements(env, templateScope, ts.factory.createTrue()));
  }

  // Add the host bindings type checking code.
  if (tcb.boundTarget.target.host !== undefined) {
    const hostScope = Scope.forNodes(tcb, null, tcb.boundTarget.target.host.node, null, null);
    statements.push(renderBlockStatements(env, hostScope, createHostBindingsBlockGuard()));
  }

  const body = ts.factory.createBlock(statements);
  const fnDecl = ts.factory.createFunctionDeclaration(
    /* modifiers */ undefined,
    /* asteriskToken */ undefined,
    /* name */ name,
    /* typeParameters */ env.config.useContextGenericType ? typeParameters : undefined,
    /* parameters */ paramList,
    /* type */ undefined,
    /* body */ body,
  );
  addTypeCheckId(fnDecl, meta.id);
  return fnDecl;
}

function renderBlockStatements(
  env: Environment,
  scope: Scope,
  wrapperExpression: ts.Expression,
): ts.Statement {
  const scopeStatements = scope.render();
  const innerBody = ts.factory.createBlock([...env.getPreludeStatements(), ...scopeStatements]);

  // Wrap the body in an if statement. This serves two purposes:
  // 1. It allows us to distinguish between the sections of the block (e.g. host or template).
  // 2. It allows the `ts.Printer` to produce better-looking output.
  return ts.factory.createIfStatement(wrapperExpression, innerBody);
}

/**
 * Create the `this` parameter to the top-level TCB function, with the given generic type
 * arguments.
 */
function tcbThisParam(
  name: ts.EntityName,
  typeArguments: ts.TypeNode[] | undefined,
): ts.ParameterDeclaration {
  return ts.factory.createParameterDeclaration(
    /* modifiers */ undefined,
    /* dotDotDotToken */ undefined,
    /* name */ 'this',
    /* questionToken */ undefined,
    /* type */ ts.factory.createTypeReferenceNode(name, typeArguments),
    /* initializer */ undefined,
  );
}
