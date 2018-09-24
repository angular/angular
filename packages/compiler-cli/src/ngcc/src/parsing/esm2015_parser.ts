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
      const exportedSymbols =
          this.checker.getExportsOfModule(moduleSymbol).map(getOriginalSymbol(this.checker));
      const exportedDeclarations =
          exportedSymbols.map(exportSymbol => exportSymbol.valueDeclaration).filter(isDefined);

      const decoratedClasses =
          exportedDeclarations
              .map(declaration => {
                if (ts.isClassDeclaration(declaration) || ts.isVariableDeclaration(declaration)) {
                  const name = declaration.name && ts.isIdentifier(declaration.name) ?
                      declaration.name.text :
                      undefined;
                  const decorators = this.host.getDecoratorsOfDeclaration(declaration);
                  return decorators && isDefined(name) ?
                      new ParsedClass(name, declaration, decorators) :
                      undefined;
                }
                return undefined;
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
