/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {absoluteFrom} from '@angular/compiler-cli/src/ngtsc/file_system';
import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {runTsurgeMigration} from '../../../utils/tsurge/testing';
import {SignalInputMigration} from '../src/migration';

describe('signal input migration', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  it(
    'should properly handle declarations with loose property initialization ' +
      'and strict null checks enabled',
    async () => {
      const fs = await runTsurgeMigration(
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

      expect(fs.readFile(absoluteFrom('/app.component.ts'))).toContain(
        'readonly name = input<string>(undefined!);',
      );
      expect(fs.readFile(absoluteFrom('/app.component.ts'))).toContain('this.name().charAt(0);');
    },
  );

  it(
    'should properly handle declarations with loose property initialization ' +
      'and strict null checks disabled',
    async () => {
      const fs = await runTsurgeMigration(
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
