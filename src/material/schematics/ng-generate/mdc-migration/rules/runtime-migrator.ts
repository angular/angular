/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

export abstract class RuntimeMigrator {
  abstract oldImportModule: string;
  abstract newImportModule: string;

  updateModuleSpecifier(specifier: ts.StringLiteralLike): ts.StringLiteral | null {
    if (specifier.text !== this.oldImportModule) {
      return null;
    }

    return ts.factory.createStringLiteral(
      this.newImportModule,
      this._isSingleQuoteLiteral(specifier),
    );
  }

  private _isSingleQuoteLiteral(literal: ts.StringLiteralLike): boolean {
    // Note: We prefer single-quote for no-substitution literals as well.
    return literal.getText()[0] !== `"`;
  }
}
