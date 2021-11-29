/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {FileSystem} from '../file-system';
import {createFormatDiagnosticHost} from './virtual-host';

/** Formats the specified diagnostics with respect to the given file system. */
export function formatDiagnostics(diagnostics: ts.Diagnostic[], fileSystem: FileSystem): string {
  const formatHost = createFormatDiagnosticHost(fileSystem);
  return ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost);
}
