/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {NgccReflectionHost} from '../host/ngcc_host';
import {getOriginalSymbol, isDefined} from '../utils';

import {FileParser} from './file_parser';
import {ParsedClass} from './parsed_class';
import {ParsedFile} from './parsed_file';

export class Esm2015FileParser implements FileParser {
  checker = this.program.getTypeChecker();

  constructor(protected program: ts.Program, protected host: NgccReflectionHost) {}

  parseFile(file: ts.SourceFile): ParsedFile[] {
    const moduleSymbol = this.checker.getSymbolAtLocation(file);
    const map = new Map<ts.SourceFile, ParsedFile>();
    if (moduleSymbol) {
      const exportClasses = this.checker.getExportsOfModule(moduleSymbol)
                                .map(getOriginalSymbol(this.checker))
                                .filter(exportSymbol => exportSymbol.flags & ts.SymbolFlags.Class);

      const classDeclarations = exportClasses.map(exportSymbol => exportSymbol.valueDeclaration)
                                    .filter(isDefined)
                                    .filter(ts.isClassDeclaration);

      const decoratedClasses =
          classDeclarations
              .map(declaration => {
                const decorators = this.host.getDecoratorsOfDeclaration(declaration);
                return decorators && declaration.name &&
                    new ParsedClass(declaration.name.text, declaration, decorators);
              })
              .filter(isDefined);

      decoratedClasses.forEach(clazz => {
        const file = clazz.declaration.getSourceFile();
        if (!map.has(file)) {
          map.set(file, new ParsedFile(file));
        }
        map.get(file) !.decoratedClasses.push(clazz);
      });
    }
    return Array.from(map.values());
  }
}
