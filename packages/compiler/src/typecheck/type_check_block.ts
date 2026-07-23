/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TcbComponentMetadata, TcbTypeCheckBlockMetadata, TcbEnvironment} from './api';
import {OutOfBandDiagnosticRecorder} from './oob';
import {DomSchemaChecker} from './schema';
import {Context} from './ops/context';
import {Scope} from './ops/scope';
import {getStatementsBlock} from './ops/codegen';
import {createHostBindingsBlockGuard} from './host_bindings';

/**
 * Given a component and metadata, compose a "type check block" function.
 *
 * @param env an `TcbEnvironment` into which type-checking code will be generated.
 * @param component metadata about the component class.
 * @param name Name of the generated function.
 * @param meta metadata about the component's template and the function being generated.
 * @param domSchemaChecker used to check and record errors regarding improper usage of DOM elements
 * and bindings.
 * @param oobRecorder used to record errors regarding template elements which could not be correctly
 * translated into types during TCB generation.
 */
export function generateTypeCheckBlock(
  env: TcbEnvironment,
  component: TcbComponentMetadata,
  name: string,
  meta: TcbTypeCheckBlockMetadata,
  domSchemaChecker: DomSchemaChecker<unknown>,
  oobRecorder: OutOfBandDiagnosticRecorder<unknown>,
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
  const {typeParameters, typeArguments} = component;

  const typeParamsStr =
    !env.config.useContextGenericType || typeParameters === null || typeParameters.length === 0
      ? ''
      : `<${typeParameters.map((p) => p.representation).join(', ')}>`;
  const typeArgsStr =
    typeArguments === null || typeArguments.length === 0 ? '' : `<${typeArguments.join(', ')}>`;

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
  const funcDeclStr = `function ${name}${typeParamsStr}(${thisParamStr}) ${bodyStr}`;

  return `/*${meta.id}*/\n${funcDeclStr}`;
}

function renderBlockStatements(
  env: TcbEnvironment,
  scope: Scope,
  wrapperExpression: string,
): string {
  // Note: this needs to be called first so that it can populate the prelude statements.
  const scopeStatements = scope.render();
  const statements = getStatementsBlock([...env.getPreludeStatements(), ...scopeStatements]);

  // Wrap the body in an if statement. This serves two purposes:
  // 1. It allows us to distinguish between the sections of the block (e.g. host or template).
  // 2. It allows the `ts.Printer` to produce better-looking output.
  return `if (${wrapperExpression}) {\n${statements}\n}`;
}
