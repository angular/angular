/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {absoluteFrom, initMockFileSystem} from '@angular/compiler-cli';
import {runTsurgeMigration} from '../../../utils/tsurge/testing';
import {setupTsurgeJasmineHelpers} from '../../../utils/tsurge/testing/jasmine';
import {SignalInputMigration} from '../src/migration';

describe('signal input migration', () => {
  beforeEach(() => {
    setupTsurgeJasmineHelpers();
    initMockFileSystem('Native');
  });

  it(
    'should properly handle declarations with loose property initialization ' +
      'and strict null checks enabled',
    async () => {
      const {fs} = await runTsurgeMigration(
        new SignalInputMigration(),
        [
          {
            name: absoluteFrom('/app.component.ts'),
            isProgramRootFile: true,
            contents: `
            import {Component, Input} from '@angular/core';

            @Component({template: ''})
            class AppComponent {
              @Input() name: string;

              doSmth() {
                this.name.charAt(0);
              }
            }
          `,
          },
        ],
        {
          strict: false,
          strictNullChecks: true,
        },
      );

      expect(fs.readFile(absoluteFrom('/app.component.ts'))).toMatchWithDiff(`
        import {Component, input} from '@angular/core';

        @Component({template: ''})
        class AppComponent {
          // TODO: Notes from signal input migration:
          //  Input is initialized to \`undefined\` but type does not allow this value.
          //  This worked with \`@Input\` because your project uses \`--strictPropertyInitialization=false\`.
          readonly name = input<string>(undefined!);

          doSmth() {
            this.name().charAt(0);
          }
        }
        `);
    },
  );

  it(
    'should properly handle declarations with loose property initialization ' +
      'and strict null checks disabled',
    async () => {
      const {fs} = await runTsurgeMigration(
        new SignalInputMigration(),
        [
          {
            name: absoluteFrom('/app.component.ts'),
            isProgramRootFile: true,
            contents: `
            import {Component, Input} from '@angular/core';

            @Component({template: ''})
            class AppComponent {
              @Input() name: string;

              doSmth() {
                this.name.charAt(0);
              }
            }
          `,
          },
        ],
        {
          strict: false,
        },
      );

      expect(fs.readFile(absoluteFrom('/app.component.ts'))).toContain(
        // Shorthand not used here to keep behavior unchanged, and to not
        // risk expanding the type. In practice `string|undefined` would be
        // fine though as long as the consumers also have strict null checks disabled.
        'readonly name = input<string>(undefined);',
      );
      expect(fs.readFile(absoluteFrom('/app.component.ts'))).toContain('this.name().charAt(0);');
    },
  );
});
