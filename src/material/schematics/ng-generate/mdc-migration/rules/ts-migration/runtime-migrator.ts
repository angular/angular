/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {IMPORT_REPLACEMENTS} from './import-replacements';

export class RuntimeMigrator {
  oldImportModule: string;
  newImportModule: string;

  constructor(component: string) {
    const replacements = IMPORT_REPLACEMENTS[component];
    this.oldImportModule = replacements.old;
    this.newImportModule = replacements.new;
  }

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
