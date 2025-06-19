/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {absoluteFrom, initMockFileSystem} from '@angular/compiler-cli';
import {runTsurgeMigration} from '../testing';
import {OutputMigration} from './output_migration';

describe('output migration', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  it('should work', async () => {
    const migration = new OutputMigration();
    const {fs} = await runTsurgeMigration(migration, [
      {
        name: absoluteFrom('/app.component.ts'),
        isProgramRootFile: true,
        contents: `
          import {Output, Component, EventEmitter} from '@angular/core';

          @Component()
          class AppComponent {
            @Output() clicked = new EventEmitter<void>();
          }
        `,
      },
    ]);

    expect(fs.readFile(absoluteFrom('/app.component.ts'))).toContain(
      '// TODO: Actual migration logic',
    );
  });

  it('should not migrate if there is a problematic usage', async () => {
    const migration = new OutputMigration();
    const {fs} = await runTsurgeMigration(migration, [
      {
        name: absoluteFrom('/app.component.ts'),
        isProgramRootFile: true,
        contents: `
          import {Output, Component, EventEmitter} from '@angular/core';

          @Component()
          export class AppComponent {
            @Output() clicked = new EventEmitter<void>();
          }
        `,
      },
      {
        name: absoluteFrom('/other.component.ts'),
        isProgramRootFile: true,
        contents: `
          import {AppComponent} from './app.component';

          const cmp: AppComponent = null!;
          cmp.clicked.pipe().subscribe();
        `,
      },
    ]);

    expect(fs.readFile(absoluteFrom('/app.component.ts'))).not.toContain('TODO');
  });

  it('should compute statistics', async () => {
    const migration = new OutputMigration();
    const {getStatistics} = await runTsurgeMigration(migration, [
      {
        name: absoluteFrom('/app.component.ts'),
        isProgramRootFile: true,
        contents: `
          import {Output, Component, EventEmitter} from '@angular/core';

          @Component()
          export class AppComponent {
            @Output() clicked = new EventEmitter<void>();
            @Output() canBeMigrated = new EventEmitter<void>();
          }
        `,
      },
      {
        name: absoluteFrom('/other.component.ts'),
        isProgramRootFile: true,
        contents: `
          import {AppComponent} from './app.component';

          const cmp: AppComponent = null!;
          cmp.clicked.pipe().subscribe();
        `,
      },
    ]);

    expect(await getStatistics()).toEqual({
      allOutputs: 2,
      migratedOutputs: 1,
    });
  });
});
