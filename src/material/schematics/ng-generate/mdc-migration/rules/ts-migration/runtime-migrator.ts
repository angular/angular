/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {ImportReplacement, REPLACEMENTS} from './import-replacements';

export class RuntimeMigrator {
  oldImportModule: string;
  newImportModule: string;
  importSpecifierReplacements: {old: string; new: string}[];

  constructor(component: string) {
    const replacements = REPLACEMENTS[component];
    this.oldImportModule = replacements.old;
    this.newImportModule = replacements.new;

    this.importSpecifierReplacements = this.getReplacementsFromComponentName(component);

    replacements.additionalMatModuleNamePrefixes?.forEach(prefix => {
      this.importSpecifierReplacements = this.importSpecifierReplacements.concat(
        this.getReplacementsFromComponentName(prefix),
      );
    });

    replacements.customReplacements?.forEach(replacement => {
      this.importSpecifierReplacements = this.importSpecifierReplacements.concat(replacement);
    });

    console.log(this.importSpecifierReplacements);
  }

  getReplacementsFromComponentName(componentName: string): ImportReplacement[] {
    const words = componentName.split('-');

    let firstLetterCapitalizedComponent = '';
    let capitalizedComponent = '';
    words.forEach(word => {
      firstLetterCapitalizedComponent += word[0].toUpperCase() + word.slice(1);
      capitalizedComponent += word.toUpperCase() + '_';
    });

    // Remove trailing underscore at the end
    capitalizedComponent = capitalizedComponent.slice(0, -1);

    const specifierReplacements = [
      {
        old: 'MatLegacy' + firstLetterCapitalizedComponent,
        new: 'Mat' + firstLetterCapitalizedComponent,
      },
      {
        old: 'MAT_LEGACY_' + capitalizedComponent,
        new: 'MAT_' + capitalizedComponent,
      },
    ];

    return specifierReplacements;
  }

  updateImportOrExportSpecifier(specifier: ts.Identifier): ts.Identifier | null {
    const newSpecifier = this._getNewSpecifier(specifier);
    if (!newSpecifier) {
      // Did not find any specifier that should be replaced
      return null;
    }

    return ts.factory.createIdentifier(newSpecifier);
  }

  updateImportSpecifierWithPossibleAlias(
    importSpecifier: ts.ImportSpecifier,
  ): ts.ImportSpecifier | null {
    // If the import specifier has an alias, there is a property name. For the
    // example 'MatLegacyButtonModule as MatButtonModule', the property name is
    // MatLegacyButtonModule and the name is MatButtonModule. Although for an
    // example with no alias, 'MatLegacyButtonModule', the name is
    // MatLegacyButtonModule and there is no property name. Since we are
    // updating the value with the legacy prefix, we have to handle that it can
    // be in either the name or property name field for the node.
    const newImport = this._getNewSpecifier(importSpecifier.propertyName ?? importSpecifier.name);

    if (!newImport) {
      // Did not find any specifier that should be replaced
      return null;
    }

    let newPropertyName;
    let newName;
    // If this import specifier has an alias, only handle it specially if the
    // alias isn't the new import since we can remove the alias now. In the
    // example of 'MatLegacyButtonModule as MatButtonModule', it would become
    // 'MatButtonModule'.
    if (importSpecifier.propertyName && importSpecifier.name.text !== newImport) {
      newPropertyName = ts.factory.createIdentifier(newImport);
      newName = importSpecifier.name;
    } else {
      newPropertyName = undefined;
      newName = ts.factory.createIdentifier(newImport);
    }

    return ts.factory.createImportSpecifier(false, newPropertyName, newName);
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

  private _getNewSpecifier(node: ts.Identifier): string | null {
    let newImport = null;

    this.importSpecifierReplacements.forEach(replacement => {
      if (node.text?.match(replacement.old)) {
        newImport = node.text.replace(replacement.old, replacement.new);
      }
    });

    return newImport;
  }

  private _isSingleQuoteLiteral(literal: ts.StringLiteralLike): boolean {
    // Note: We prefer single-quote for no-substitution literals as well.
    return literal.getText()[0] !== `"`;
  }
}
