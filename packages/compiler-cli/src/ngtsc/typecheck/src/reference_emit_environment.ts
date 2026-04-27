/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ExpressionType, TransplantedType} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, FatalDiagnosticError, makeDiagnosticChain} from '../../diagnostics';
import {
  assertSuccessfulReferenceEmit,
  ImportFlags,
  Reference,
  ReferenceEmitKind,
  ReferenceEmitter,
} from '../../imports';

import {ImportManager, translateType} from '../../translator';
import {TcbReferenceMetadata} from '../api';
import {TcbExpr} from './ops/codegen';

/**
 * An environment for a given source file that can be used to emit references.
 *
 * This can be used by the type-checking block, or constructor logic to generate
 * references to directives or other symbols or types.
 */
export class ReferenceEmitEnvironment {
  constructor(
    readonly importManager: ImportManager,
    public refEmitter: ReferenceEmitter,
    public contextFile: ts.SourceFile,
  ) {}

  canReferenceType(
    ref: Reference,
    flags: ImportFlags = ImportFlags.NoAliasing |
      ImportFlags.AllowTypeImports |
      ImportFlags.AllowRelativeDtsImports,
  ): boolean {
    const result = this.refEmitter.emit(ref, this.contextFile, flags);
    return result.kind === ReferenceEmitKind.Success;
  }

  /**
   * Generates a `TcbExpr` from a `TcbReferenceMetadata` object.
   */
  referenceTcbValue(ref: TcbReferenceMetadata): TcbExpr {
    if (ref.unexportedDiagnostic !== null || ref.isLocal || ref.moduleName === null) {
      if (ref.unexportedDiagnostic !== null) {
        throw new FatalDiagnosticError(
          ErrorCode.IMPORT_GENERATION_FAILURE,
          this.contextFile,
          makeDiagnosticChain(`Unable to import symbol ${ref.name}.`, [
            makeDiagnosticChain(ref.unexportedDiagnostic),
          ]),
        );
      }
      return new TcbExpr(ref.name);
    }
    return this.referenceExternalSymbol(ref.moduleName, ref.name);
  }

  referenceExternalSymbol(moduleName: string, name: string): TcbExpr {
    const importResult = this.importManager.addImport({
      exportModuleSpecifier: moduleName,
      exportSymbolName: name,
      requestedFile: this.contextFile,
    });

    if (ts.isIdentifier(importResult)) {
      return new TcbExpr(importResult.text);
    } else if (ts.isIdentifier(importResult.expression)) {
      return new TcbExpr(`${importResult.expression.text}.${importResult.name.text}`);
    }

    throw new Error('Unexpected value returned by import manager');
  }
}
