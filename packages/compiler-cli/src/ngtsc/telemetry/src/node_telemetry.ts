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
import {recordFunctionCallTelemetry} from './function_calls';

export function recordNodeTelemetry(
    node: ts.Node, acquireTelemetryScope: () => TelemetryScope, reflector: ReflectionHost): void {
  if (ts.isCallExpression(node)) {
    recordFunctionCallTelemetry(node, acquireTelemetryScope, reflector);
  }
}
