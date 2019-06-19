/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵɵComponentDefWithMeta, ɵɵPipeDefWithMeta as PipeDefWithMeta} from '@angular/core';

declare class SuperComponent {
  static ngComponentDef: ɵɵComponentDefWithMeta<SuperComponent, '[super]', never, {}, {}, never>;
}

declare class SubComponent extends SuperComponent {
  // Declaring a field in the subtype makes its structure incompatible with that of the
  // supertype. Special care needs to be taken in Ivy's definition types, or TypeScript
  // would produce type errors when the "strictFunctionTypes" option is enabled.
  onlyInSubtype: string;

  static ngComponentDef: ɵɵComponentDefWithMeta<SubComponent, '[sub]', never, {}, {}, never>;
}

declare class SuperPipe { static ngPipeDef: PipeDefWithMeta<SuperPipe, 'super'>; }

declare class SubPipe extends SuperPipe {
  onlyInSubtype: string;

  static ngPipeDef: PipeDefWithMeta<SubPipe, 'sub'>;
}

describe('inheritance strict type checking', () => {
  // Verify that Ivy definition fields in declaration files conform to TypeScript's strict
  // type checking constraints in the case of inheritance across directives/components/pipes.
  // https://github.com/angular/angular/issues/28079
  it('should compile without errors', () => {});
});
