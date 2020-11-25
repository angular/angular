/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {absoluteFrom} from '@angular/compiler-cli/src/ngtsc/file_system';
import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';

import {LanguageServiceTestEnvironment} from './env';

describe('language-service/compiler integration', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  it('should show type-checking errors from components with poisoned scopes', () => {
    // Normally, the Angular compiler suppresses errors from components that belong to NgModules
    // which themselves have errors (such scopes are considered "poisoned"), to avoid overwhelming
    // the user with secondary errors that stem from a primary root cause. However, this prevents
    // the generation of type check blocks and other metadata within the compiler which drive the
    // Language Service's understanding of components. Therefore in the Language Service, the
    // compiler is configured to make use of such data even if it's "poisoned". This test verifies
    // that a component declared in an NgModule with a faulty import still generates template
    // diagnostics.

    const file = absoluteFrom('/test.ts');
    const env = LanguageServiceTestEnvironment.setup([{
      name: file,
      contents: `
          import {Component, Directive, Input, NgModule} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '<div [dir]="3"></div>',
          })
          export class Cmp {}

          @Directive({
            selector: '[dir]',
          })
          export class Dir {
            @Input() dir!: string;
          }

          export class NotAModule {}

          @NgModule({
            declarations: [Cmp, Dir],
            imports: [NotAModule],
          })
          export class Mod {}
        `,
      isRoot: true,
    }]);

    const diags = env.ngLS.getSemanticDiagnostics(file);
    expect(diags.map(diag => diag.messageText))
        .toContain(`Type 'number' is not assignable to type 'string'.`);
  });
});
