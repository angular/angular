/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import ts from 'typescript';

import {InlayHint, PluginConfig} from '../api';

export function getAngularInlayHints(
  compiler: NgCompiler,
  fileName: string,
  span: ts.TextSpan,
  config: Omit<PluginConfig, 'angularOnly'> | undefined,
): InlayHint[] {
  // TODO: Implement Angular-specific inlay hints
  // For now, return empty array
  return [];
}
