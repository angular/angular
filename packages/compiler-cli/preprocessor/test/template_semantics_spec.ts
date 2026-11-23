/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runPipeline, TestFile} from './utils.js';

const TSCONFIG: TestFile = {
  path: '/tsconfig.json',
  content: JSON.stringify({compilerOptions: {strict: true}, files: ['app.component.ts']}),
};

/** Each diagnostic the pipeline reported, as its code, message and the source text it underlines. */
async function diagnose(source: string): Promise<{code: number; message: string; text: string}[]> {
  const outputs = await runPipeline([TSCONFIG, {path: '/app.component.ts', content: source}], {
    optimize: true,
  });
  const report = outputs.find((o) => o.path.endsWith('.ngdiag.json'));
  if (!report) {
    return [];
  }
  type Reported = {code: number; messageText: string; span: {start: number; end: number}};
  return JSON.parse(report.content).diagnostics.map((d: Reported) => ({
    code: d.code,
    message: d.messageText,
    text: source.slice(d.span.start, d.span.end),
  }));
}

describe('template semantics diagnostics', () => {
  it('reports a write to a template variable in an event binding', async () => {
    const diagnostics = await diagnose(`
      import {Component} from '@angular/core';

      @Component({
        selector: 'app-comp',
        template: '@for (item of items; track item) { <button (click)="$index = 1"></button> }',
      })
      export class AppComponent {
        items: string[] = [];
      }
    `);

    expect(diagnostics).toEqual([
      {
        code: 8005,
        message:
          `Cannot use variable '$index' as the left-hand side of an assignment expression. ` +
          `Template variables are read-only.`,
        text: '$index = 1',
      },
    ]);
  });

  it('reports writes through update operators, including nested ones', async () => {
    const diagnostics = await diagnose(`
      import {Component} from '@angular/core';

      @Component({
        selector: 'app-comp',
        template: \`
          @if (value; as alias) {
            <button (click)="alias++"></button>
            <button (click)="prop = --alias"></button>
          }
        \`,
      })
      export class AppComponent {
        value = 1;
        prop = 0;
      }
    `);

    expect(diagnostics.map((d) => [d.code, d.text])).toEqual([
      [8005, 'alias++'],
      [8005, 'prop = --alias'],
    ]);
  });

  it('does not report writes to component properties or through other receivers', async () => {
    const diagnostics = await diagnose(`
      import {Component} from '@angular/core';

      @Component({
        selector: 'app-comp',
        template: \`
          @for (item of items; track item) {
            <button (click)="prop = $index; item.name = 'x'"></button>
          }
        \`,
      })
      export class AppComponent {
        items: {name: string}[] = [];
        prop = 0;
      }
    `);

    expect(diagnostics).toEqual([]);
  });
});
