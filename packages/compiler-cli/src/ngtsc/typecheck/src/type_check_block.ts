/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {TcbComponentMetadata, TcbTypeCheckBlockMetadata, TcbTypeParameter} from '../api';
import {DomSchemaChecker} from './dom';
import {Environment} from './environment';
import {OutOfBandDiagnosticRecorder} from './oob';
import {createHostBindingsBlockGuard} from './host_bindings';
import {Context, TcbGenericContextBehavior} from './ops/context';
import {Scope} from './ops/scope';
import {getStatementsBlock} from './ops/codegen';

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
  component: TcbComponentMetadata,
  name: ts.Identifier,
  meta: TcbTypeCheckBlockMetadata,
  domSchemaChecker: DomSchemaChecker,
  oobRecorder: OutOfBandDiagnosticRecorder,
  genericContextBehavior: TcbGenericContextBehavior,
): string {
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
  const ctxRawType = env.referenceTcbValue(component.ref);
  let typeParameters: TcbTypeParameter[] | undefined = undefined;
  let typeArguments: string[] | undefined = undefined;

  if (component.typeParameters !== undefined) {
    if (!env.config.useContextGenericType) {
      genericContextBehavior = TcbGenericContextBehavior.FallbackToAny;
    }

    switch (genericContextBehavior) {
      case TcbGenericContextBehavior.UseEmitter:
        // Guaranteed to emit type parameters since we checked that the class has them above.
        const emittedParams = component.typeParameters || [];
        typeParameters = emittedParams;
        typeArguments = typeParameters!.map((param) => param.name);
        break;
      case TcbGenericContextBehavior.CopyClassNodes:
        const copiedParams = component.typeParameters ? [...component.typeParameters] : [];
        typeParameters = copiedParams;
        typeArguments = typeParameters!.map((param) => param.name);
        break;
      case TcbGenericContextBehavior.FallbackToAny:
        typeArguments = Array.from({length: component.typeParameters?.length ?? 0}).map(
          () => 'any',
        );
        break;
    }
  }

  const typeParamsStr =
    typeParameters === undefined || typeParameters.length === 0
      ? ''
      : `<${typeParameters.map((p) => p.representation).join(', ')}>`;
  const typeArgsStr =
    typeArguments === undefined || typeArguments.length === 0
      ? ''
      : `<${typeArguments.join(', ')}>`;

  const thisParamStr = `this: ${ctxRawType.print()}${typeArgsStr}`;
  const statements: string[] = [];

  // Add the template type checking code.
  if (tcb.boundTarget.target.template !== undefined) {
    const templateScope = Scope.forNodes(
      tcb,
      null,
      null,
      tcb.boundTarget.target.template,
      /* guard */ null,
    );

    statements.push(renderBlockStatements(env, templateScope, 'true'));
  }

  // Add the host bindings type checking code.
  if (tcb.boundTarget.target.host !== undefined) {
    const hostScope = Scope.forNodes(tcb, null, tcb.boundTarget.target.host.node, null, null);
    statements.push(renderBlockStatements(env, hostScope, createHostBindingsBlockGuard()));
  }

  const bodyStr = `{\n${statements.join('\n')}\n}`;
  const funcDeclStr = `function ${name.text}${typeParamsStr}(${thisParamStr}) ${bodyStr}`;

  return `/*${meta.id}*/\n${funcDeclStr}`;
}

function renderBlockStatements(env: Environment, scope: Scope, wrapperExpression: string): string {
  // Note: this needs to be called first so that it can populate the prelude statements.
  const scopeStatements = scope.render();
  const statements = getStatementsBlock([...env.getPreludeStatements(), ...scopeStatements]);

  // Wrap the body in an if statement. This serves two purposes:
  // 1. It allows us to distinguish between the sections of the block (e.g. host or template).
  // 2. It allows the `ts.Printer` to produce better-looking output.
  return `if (${wrapperExpression}) {\n${statements}\n}`;
}
