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
import {ModelOutputMigration} from './migration';

describe('ModelOutput migration', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  it('should migrate model() to input() + linkedSignal() when there is a conflicting output', async () => {
    const {fs} = await runTsurgeMigration(new ModelOutputMigration(), [
      {
        name: absoluteFrom('/index.ts'),
        isProgramRootFile: true,
        contents: `
          import { Component, model, output } from '@angular/core';

          @Component({
            selector: 'my-comp',
            template: ''
          })
          export class MyComp {
            foo = model(0);
            fooChange = output<number>();
          }
        `,
      },
    ]);

    const content = fs.readFile(absoluteFrom('/index.ts'));
    expect(content).toContain("fooInput = input(0, {alias: 'foo'});");
    expect(content).toContain('foo = linkedSignal(this.fooInput);');
    expect(content).toContain('fooChange = output<number>();');
    expect(content).toContain(
      "import { Component, model, output, input, linkedSignal } from '@angular/core';",
    );
  });

  it('should handle generic types', async () => {
    const {fs} = await runTsurgeMigration(new ModelOutputMigration(), [
      {
        name: absoluteFrom('/index.ts'),
        isProgramRootFile: true,
        contents: `
          import { Component, model, output } from '@angular/core';

          @Component({
            selector: 'my-comp',
            template: ''
          })
          export class MyComp {
            bar = model<string>('initial');
            barChange = output<string>();
          }
        `,
      },
    ]);

    const content = fs.readFile(absoluteFrom('/index.ts'));
    expect(content).toContain("barInput = input<string>('initial', {alias: 'bar'});");
    expect(content).toContain('bar = linkedSignal(this.barInput);');
  });

  it('should preserve modifiers', async () => {
    const {fs} = await runTsurgeMigration(new ModelOutputMigration(), [
      {
        name: absoluteFrom('/index.ts'),
        isProgramRootFile: true,
        contents: `
          import { Component, model, output } from '@angular/core';

          @Component({
            selector: 'my-comp',
            template: ''
          })
          export class MyComp {
            public val = model(123);
            public valChange = output<number>();
          }
        `,
      },
    ]);

    const content = fs.readFile(absoluteFrom('/index.ts'));
    expect(content).toContain("public valInput = input(123, {alias: 'val'});");
    expect(content).toContain('public val = linkedSignal(this.valInput);');
  });

  it('should handle model.required()', async () => {
    const {fs} = await runTsurgeMigration(new ModelOutputMigration(), [
      {
        name: absoluteFrom('/index.ts'),
        isProgramRootFile: true,
        contents: `
          import { Component, model, output } from '@angular/core';

          @Component({
            selector: 'my-comp',
            template: ''
          })
          export class MyComp {
            foo = model.required<number>();
            fooChange = output<number>();
          }
        `,
      },
    ]);

    const content = fs.readFile(absoluteFrom('/index.ts'));
    expect(content).toContain("fooInput = input.required<number>({alias: 'foo'});");
    expect(content).toContain('foo = linkedSignal(this.fooInput);');
  });

  it('should handle @Output() decorator as conflict', async () => {
    const {fs} = await runTsurgeMigration(new ModelOutputMigration(), [
      {
        name: absoluteFrom('/index.ts'),
        isProgramRootFile: true,
        contents: `
          import { Component, model, Output, EventEmitter } from '@angular/core';

          @Component({
            selector: 'my-comp',
            template: ''
          })
          export class MyComp {
            baz = model(true);
            @Output() bazChange = new EventEmitter<boolean>();
          }
        `,
      },
    ]);

    const content = fs.readFile(absoluteFrom('/index.ts'));
    expect(content).toContain("bazInput = input(true, {alias: 'baz'});");
    expect(content).toContain('baz = linkedSignal(this.bazInput);');
  });

  it('should NOT migrate model() if there is no conflicting output', async () => {
    const originalContent = `
          import { Component, model } from '@angular/core';

          @Component({
            selector: 'my-comp',
            template: ''
          })
          export class MyComp {
            foo = model(0);
          }
        `;
    const {fs} = await runTsurgeMigration(new ModelOutputMigration(), [
      {
        name: absoluteFrom('/index.ts'),
        isProgramRootFile: true,
        contents: originalContent,
      },
    ]);

    const content = fs.readFile(absoluteFrom('/index.ts'));
    // It might normalize some spaces or imports, so check the core logic
    expect(content).not.toContain('input(');
    expect(content).not.toContain('linkedSignal(');
  });

  it('should merge existing options in model()', async () => {
    const {fs} = await runTsurgeMigration(new ModelOutputMigration(), [
      {
        name: absoluteFrom('/index.ts'),
        isProgramRootFile: true,
        contents: `
          import { Component, model, output } from '@angular/core';

          @Component({
            selector: 'my-comp',
            template: ''
          })
          export class MyComp {
            foo = model(0, {debugName: 'my-foo'});
            fooChange = output<number>();
          }
        `,
      },
    ]);

    const content = fs.readFile(absoluteFrom('/index.ts'));
    expect(content).toContain("fooInput = input(0, {alias: 'foo', debugName: 'my-foo'});");
  });
});
