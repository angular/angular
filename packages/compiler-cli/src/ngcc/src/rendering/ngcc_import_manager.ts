
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ImportManager} from '../../../ngtsc/translator';

export class NgccImportManager extends ImportManager {
  constructor(private isFlat: boolean, isCore: boolean, prefix?: string) { super(isCore, prefix); }

  generateNamedImport(moduleName: string, symbol: string):
      {moduleImport: string | null, symbol: string} {
    if (this.isFlat && this.isCore && moduleName === '@angular/core') {
      return {moduleImport: null, symbol: this.rewriteSymbol(moduleName, symbol)};
    }
    return super.generateNamedImport(moduleName, symbol);
  }
}
