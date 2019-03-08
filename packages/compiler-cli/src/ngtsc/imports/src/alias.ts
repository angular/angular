/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Expression, ExternalExpr} from '@angular/compiler';
import * as ts from 'typescript';

import {FileToModuleHost, ReferenceEmitStrategy} from './emitter';
import {ImportMode, Reference} from './references';

// Escape anything that isn't alphanumeric, '/' or '_'.
const CHARS_TO_ESCAPE = /[^a-zA-Z0-9/_]/g;

export class AliasGenerator {
  constructor(private fileToModuleHost: FileToModuleHost) {}

  aliasSymbolName(decl: ts.Declaration, context: ts.SourceFile): string {
    if (!ts.isClassDeclaration(decl)) {
      throw new Error(`Attempt to write an alias to something which isn't a class`);
    }

    // The declared module is used to get the name of the alias.
    const declModule =
        this.fileToModuleHost.fileNameToModuleName(decl.getSourceFile().fileName, context.fileName);

    const replaced = declModule.replace(CHARS_TO_ESCAPE, '_').replace(/\//g, '$');
    return 'ɵng$' + replaced + '$$' + decl.name !.text;
  }

  aliasTo(decl: ts.Declaration, via: ts.SourceFile): Expression {
    const name = this.aliasSymbolName(decl, via);
    // viaModule is the module it'll actually be imported from.
    const moduleName = this.fileToModuleHost.fileNameToModuleName(via.fileName, via.fileName);
    return new ExternalExpr({moduleName, name});
  }
}

export class AliasStrategy implements ReferenceEmitStrategy {
  emit(ref: Reference<ts.Node>, context: ts.SourceFile, importMode: ImportMode): Expression|null {
    return ref.alias;
  }
}
