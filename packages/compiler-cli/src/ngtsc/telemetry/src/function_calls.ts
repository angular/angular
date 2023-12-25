/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ReflectionHost} from '../../reflection';

import {TelemetryScope} from './api';

interface FunctionCall {
  moduleSpecifier: string;
  record: (telemetry: TelemetryScope) => void;
}

function functionCall(
    moduleSpecifier: string, record: (telemetry: TelemetryScope) => void): FunctionCall {
  return {moduleSpecifier, record};
}

const functionCalls: Record<string, FunctionCall> = {
  'inject': functionCall('@angular/core', (telemetry) => telemetry.inject++),
  'signal': functionCall('@angular/core', (telemetry) => telemetry.signal++),
  'computed': functionCall('@angular/core', (telemetry) => telemetry.computed++),
  'effect': functionCall('@angular/core', (telemetry) => telemetry.effect++),
};

export function recordFunctionCallTelemetry(
    node: ts.CallExpression, acquireTelemetryScope: () => TelemetryScope,
    reflector: ReflectionHost): void {
  // Quickly scan the receiver to check if it may correspond with a known symbol to record,
  // based on the identifier's name. This yields false negatives when symbols are imported
  // under a different name (for example `import {signal as s} from ...;`) or
  // aliased (`const s = signal;`), but avoids the overhead of symbol lookups for most
  // function calls in the program. For telemetry purposes this is deemed sufficient.
  const receiver = getReceiverId(node.expression);
  if (receiver === null || !functionCalls.hasOwnProperty(receiver.text)) {
    return;
  }

  const imp = reflector.getImportOfIdentifier(receiver);
  if (imp === null) {
    return;
  }

  const call = functionCalls[receiver.text];
  if (imp.from !== call.moduleSpecifier) {
    return;
  }

  call.record(acquireTelemetryScope());
}

function getReceiverId(receiver: ts.Expression): ts.Identifier|null {
  let property = receiver;
  if (ts.isPropertyAccessExpression(receiver)) {
    if (!ts.isIdentifier(receiver.expression)) {
      return null;
    }
    property = receiver.name;
  }
  return ts.isIdentifier(property) ? property : null;
}
