/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('suggestion to expose file and global symbols on the class', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig({strictTemplates: true});
      env.write(
        'util.ts',
        `
          export function formatDate(value: number): string {
            return String(value);
          }
          export interface Options {
            verbose: boolean;
          }
        `,
      );
    });

    function writeComponent(template: string, preamble = ''): void {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          ${preamble}

          @Component({
            selector: 'test-cmp',
            template: ${JSON.stringify(template)},
          })
          export class TestCmp {
            value = 1;
          }
        `,
      );
    }

    function messages(diags: ReadonlyArray<ts.Diagnostic>): string[] {
      return diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'));
    }

    it('should suggest exposing a symbol imported in the file', () => {
      writeComponent('{{ formatDate(value) }}', `import {formatDate} from './util';`);
      expect(messages(env.driveDiagnostics())).toEqual([
        `Property 'formatDate' does not exist on type 'TestCmp'. 'formatDate' is imported in ` +
          `this file, but template expressions can only read members of the class. To use it in ` +
          `the template, add it to the class, e.g. 'protected readonly formatDate = formatDate;'.`,
      ]);
    });

    it('should suggest exposing an aliased import by its local name', () => {
      writeComponent('{{ fmt(value) }}', `import {formatDate as fmt} from './util';`);
      const diags = messages(env.driveDiagnostics());
      expect(diags.length).toBe(1);
      expect(diags[0]).toContain(`'protected readonly fmt = fmt;'`);
    });

    it('should suggest exposing a namespace import', () => {
      writeComponent('{{ utils.formatDate(value) }}', `import * as utils from './util';`);
      const diags = messages(env.driveDiagnostics());
      expect(diags.length).toBe(1);
      expect(diags[0]).toContain(`'utils' is imported in this file`);
    });

    it('should suggest exposing a symbol declared in the file', () => {
      writeComponent('{{ PREFIX }}', `const PREFIX = 'prefix:';`);
      const diags = messages(env.driveDiagnostics());
      expect(diags.length).toBe(1);
      expect(diags[0]).toContain(
        `'PREFIX' is declared in this file, but template expressions can only read members of ` +
          `the class. To use it in the template, add it to the class, e.g. ` +
          `'protected readonly PREFIX = PREFIX;'.`,
      );
    });

    it('should suggest exposing a symbol declared after the component', () => {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({selector: 'test-cmp', template: '{{ double(1) }}'})
          export class TestCmp {}

          function double(value: number): number { return value * 2; }
        `,
      );
      const diags = messages(env.driveDiagnostics());
      expect(diags.length).toBe(1);
      expect(diags[0]).toContain(`'double' is declared in this file`);
    });

    it('should suggest exposing an ES global', () => {
      writeComponent('{{ Math.max(value, 1) }}');
      const diags = messages(env.driveDiagnostics());
      expect(diags.length).toBe(1);
      expect(diags[0]).toContain(
        `'Math' is a global, but template expressions can only read members of the class. ` +
          `To use it in the template, add it to the class, e.g. 'protected readonly Math = Math;'.`,
      );
    });

    it('should suggest exposing a symbol used in a host binding', () => {
      env.write(
        'test.ts',
        `
          import {Directive} from '@angular/core';

          const PREFIX = 'prefix:';

          @Directive({selector: '[test-dir]', host: {'[title]': 'PREFIX'}})
          export class TestDir {}
        `,
      );
      const diags = messages(env.driveDiagnostics());
      expect(diags.length).toBe(1);
      expect(diags[0]).toContain(`'protected readonly PREFIX = PREFIX;'`);
    });

    it('should not suggest anything for DOM globals', () => {
      writeComponent('{{ name }}');
      expect(messages(env.driveDiagnostics())).toEqual([
        `Property 'name' does not exist on type 'TestCmp'.`,
      ]);
    });

    it('should not suggest anything for type-only imports', () => {
      writeComponent('{{ formatDate(value) }}', `import type {formatDate} from './util';`);
      expect(messages(env.driveDiagnostics())).toEqual([
        `Property 'formatDate' does not exist on type 'TestCmp'.`,
      ]);
    });

    it('should not suggest anything for imported types', () => {
      writeComponent('{{ Options }}', `import {Options} from './util';`);
      expect(messages(env.driveDiagnostics())).toEqual([
        `Property 'Options' does not exist on type 'TestCmp'.`,
      ]);
    });

    it('should not suggest anything for unknown names', () => {
      writeComponent('{{ doesNotExist }}');
      expect(messages(env.driveDiagnostics())).toEqual([
        `Property 'doesNotExist' does not exist on type 'TestCmp'.`,
      ]);
    });

    it('should not change diagnostics for explicit reads of other objects', () => {
      writeComponent('{{ value.formatDate }}', `import {formatDate} from './util';`);
      expect(messages(env.driveDiagnostics())).toEqual([
        `Property 'formatDate' does not exist on type 'number'.`,
      ]);
    });
  });
});
