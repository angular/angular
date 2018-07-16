/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {NgccReflectionHost} from '../host/ngcc_host';

import {FileParser} from './file_parser';
import {ParsedClass} from './parsed_class';
import {ParsedFile} from './parsed_file';


/**
 * Parses ESM5 package files for decoratrs classes.
 * ESM5 "classes" are actually functions wrapped by and returned
 * from an IFEE.
 */
export class Esm5FileParser implements FileParser {
  checker = this.program.getTypeChecker();

  constructor(protected program: ts.Program, protected host: NgccReflectionHost) {}

  parseFile(file: ts.SourceFile): ParsedFile[] {
    const moduleSymbol = this.checker.getSymbolAtLocation(file);
    const map = new Map<ts.SourceFile, ParsedFile>();
    const getOriginalSymbol = (symbol: ts.Symbol) =>
        ts.SymbolFlags.Alias & symbol.flags ? this.checker.getAliasedSymbol(symbol) : symbol;
    const getParsedClass = (declaration: ts.VariableDeclaration) => {
      const decorators = this.host.getDecoratorsOfDeclaration(declaration);
      if (decorators) {
        return new ParsedClass(declaration.name.getText(), declaration, decorators);
      }
    };

    if (moduleSymbol) {
      const classDeclarations = this.checker.getExportsOfModule(moduleSymbol)
                                    .map(getOriginalSymbol)
                                    .map(exportSymbol => exportSymbol.valueDeclaration)
                                    .filter(isVariableDeclaration);

      const decoratedClasses = classDeclarations.map(getParsedClass).filter(isDefined);

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

function isVariableDeclaration(declaration: ts.Declaration | undefined):
    declaration is ts.VariableDeclaration {
  return !!declaration && ts.isVariableDeclaration(declaration);
}

function isDefined<T>(value: T | undefined): value is T {
  return !!value;
}
