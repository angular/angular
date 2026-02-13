/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {absoluteFrom} from '@angular/compiler-cli';
import {initMockFileSystem} from '@angular/compiler-cli/private/testing';
import {runTsurgeMigration} from '../../utils/tsurge/testing';
import {ChangeDetectionEagerMigration} from './migration';

describe('ChangeDetectionEager migration', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  it('should add ChangeDetectionStrategy.Eager if explicit strategy is missing', async () => {
    const {fs} = await runTsurgeMigration(new ChangeDetectionEagerMigration(), [
      {
        name: absoluteFrom('/index.ts'),
        isProgramRootFile: true,
        contents: `
          import { Component } from '@angular/core';

          @Component({
            selector: 'app-test',
            template: ''
          })
          export class TestComponent {}
        `,
      },
    ]);

    const content = fs.readFile(absoluteFrom('/index.ts'));
    expect(content).toContain('changeDetection: ChangeDetectionStrategy.Eager');
    expect(content).toContain(
      `import { Component, ChangeDetectionStrategy } from '@angular/core';`,
    );
  });

  it('should replace ChangeDetectionStrategy.Default with Eager', async () => {
    const {fs} = await runTsurgeMigration(new ChangeDetectionEagerMigration(), [
      {
        name: absoluteFrom('/index.ts'),
        isProgramRootFile: true,
        contents: `
          import { Component, ChangeDetectionStrategy } from '@angular/core';

          @Component({
            selector: 'app-test',
            changeDetection: ChangeDetectionStrategy.Default,
            template: ''
          })
          export class TestComponent {}
        `,
      },
    ]);

    const content = fs.readFile(absoluteFrom('/index.ts'));
    expect(content).toContain('changeDetection: ChangeDetectionStrategy.Eager');
    expect(content).not.toContain('ChangeDetectionStrategy.Default');
  });

  it('should not change ChangeDetectionStrategy.OnPush', async () => {
    const {fs} = await runTsurgeMigration(new ChangeDetectionEagerMigration(), [
      {
        name: absoluteFrom('/index.ts'),
        isProgramRootFile: true,
        contents: `
          import { Component, ChangeDetectionStrategy } from '@angular/core';

          @Component({
            selector: 'app-test',
            changeDetection: ChangeDetectionStrategy.OnPush,
            template: ''
          })
          export class TestComponent {}
        `,
      },
    ]);

    const content = fs.readFile(absoluteFrom('/index.ts'));
    expect(content).not.toContain('changeDetection: ChangeDetectionStrategy.Eager');
    expect(content).toContain('changeDetection: ChangeDetectionStrategy.OnPush');
  });

  it('should handle existing other properties correctly', async () => {
    const {fs} = await runTsurgeMigration(new ChangeDetectionEagerMigration(), [
      {
        name: absoluteFrom('/index.ts'),
        isProgramRootFile: true,
        contents: `
          import { Component } from '@angular/core';

          @Component({
            selector: 'app-test',
            template: '',
            standalone: true
          })
          export class TestComponent {}
        `,
      },
    ]);

    const content = fs.readFile(absoluteFrom('/index.ts'));
    expect(content).toMatch(
      /standalone: true,\n\s+changeDetection: ChangeDetectionStrategy\.Eager/,
    );
  });

  it('should handle aliased imports', async () => {
    const {fs} = await runTsurgeMigration(new ChangeDetectionEagerMigration(), [
      {
        name: absoluteFrom('/index.ts'),
        isProgramRootFile: true,
        contents: `
          import { Component, ChangeDetectionStrategy as CDS } from '@angular/core';

          @Component({
            selector: 'app-test',
            changeDetection: CDS.Default,
            template: ''
          })
          export class TestComponent {}
        `,
      },
    ]);

    const content = fs.readFile(absoluteFrom('/index.ts'));
    expect(content).toContain('changeDetection: CDS.Eager');
  });

  it('should handle aliased imports when adding property', async () => {
    // This case tests if it reuses existing import even if aliased, or adds new one.
    // ImportManager should handle it.
    const {fs} = await runTsurgeMigration(new ChangeDetectionEagerMigration(), [
      {
        name: absoluteFrom('/index.ts'),
        isProgramRootFile: true,
        contents: `
          import { Component, ChangeDetectionStrategy as CDS } from '@angular/core';

          @Component({
            selector: 'app-test',
            template: ''
          })
          export class TestComponent {}
       `,
      },
    ]);

    const content = fs.readFile(absoluteFrom('/index.ts'));
    // If ImportManager is smart, it reuses CDS.
    // If not, it might add ChangeDetectionStrategy.
    // Our migration uses `importManager.addImport`.
    // Let's see what happens.
    // We expect either `CDS.Eager` or `ChangeDetectionStrategy.Eager` (with new import).
    // Ideally it should reuse `CDS`.
    expect(content).toContain('changeDetection: CDS.Eager');
  });
});
