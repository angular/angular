/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {NgccReflectionHost} from '../host/ngcc_host';
import {getNameText, getOriginalSymbol, isDefined} from '../utils';

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
    const getParsedClass = (declaration: ts.VariableDeclaration) => {
      const decorators = this.host.getDecoratorsOfDeclaration(declaration);
      if (decorators) {
        return new ParsedClass(getNameText(declaration.name), declaration, decorators);
      }
    };

    if (moduleSymbol) {
      const classDeclarations = this.checker.getExportsOfModule(moduleSymbol)
                                    .map(getOriginalSymbol(this.checker))
                                    .map(exportSymbol => exportSymbol.valueDeclaration)
                                    .filter(isDefined)
                                    .filter(ts.isVariableDeclaration);

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
