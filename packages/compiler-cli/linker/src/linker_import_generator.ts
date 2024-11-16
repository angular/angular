/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {AstFactory, ImportGenerator, ImportRequest} from '../../src/ngtsc/translator';

import {FatalLinkerError} from './fatal_linker_error';

/**
 * A class that is used to generate imports when translating from Angular Output AST to an AST to
 * render, such as Babel.
 *
 * Note that, in the linker, there can only be imports from `@angular/core` and that these imports
 * must be achieved by property access on an `ng` namespace identifier, which is passed in via the
 * constructor.
 */
export class LinkerImportGenerator<TStatement, TExpression>
  implements ImportGenerator<null, TExpression>
{
  constructor(
    private factory: AstFactory<TStatement, TExpression>,
    private ngImport: TExpression,
  ) {}

  addImport(request: ImportRequest<null>): TExpression {
    this.assertModuleName(request.exportModuleSpecifier);

    if (request.exportSymbolName === null) {
      return this.ngImport;
    }

    return this.factory.createPropertyAccess(this.ngImport, request.exportSymbolName);
  }

  private assertModuleName(moduleName: string): void {
    if (moduleName !== '@angular/core') {
      throw new FatalLinkerError(
        this.ngImport,
        `Unable to import from anything other than '@angular/core'`,
      );
    }
  }
}
