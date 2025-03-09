/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵɵComponentDeclaration, ɵɵPipeDeclaration} from '../../src/core';

declare class SuperComponent {
  static ɵcmp: ɵɵComponentDeclaration<SuperComponent, '[super]', never, {}, {}, never, never>;
}

declare class SubComponent extends SuperComponent {
  // Declaring a field in the subtype makes its structure incompatible with that of the
  // supertype. Special care needs to be taken in Ivy's definition types, or TypeScript
  // would produce type errors when the "strictFunctionTypes" option is enabled.
  onlyInSubtype: string;

  static ɵcmp: ɵɵComponentDeclaration<SubComponent, '[sub]', never, {}, {}, never, never>;
}

declare class SuperPipe {
  static ɵpipe: ɵɵPipeDeclaration<SuperPipe, 'super'>;
}

declare class SubPipe extends SuperPipe {
  onlyInSubtype: string;

  static ɵpipe: ɵɵPipeDeclaration<SubPipe, 'sub'>;
}

describe('inheritance strict type checking', () => {
  // Verify that Ivy definition fields in declaration files conform to TypeScript's strict
  // type checking constraints in the case of inheritance across directives/components/pipes.
  // https://github.com/angular/angular/issues/28079
  it('should compile without errors', () => {});
});
