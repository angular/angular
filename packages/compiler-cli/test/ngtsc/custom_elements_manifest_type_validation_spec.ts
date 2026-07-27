/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ErrorCode, ngErrorCode} from '../../src/ngtsc/diagnostics';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';
import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles({fakeCommon: true});

runInEachFileSystem(() => {
  describe('Custom Elements Manifest type validation', () => {
    let env: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig({strictTemplates: true, customElementsManifests: ['./custom-elements.json']});
      env.write('node_modules/types-library/package.json', JSON.stringify({types: 'index.d.ts'}));
      env.write(
        'node_modules/types-library/index.d.ts',
        `
        export type Box<T extends string> = {value: T};
        export type Choice = Uppercase<'a' | 'b'>;
      `,
      );
    });

    function writeType(text: string): void {
      const name = text.startsWith('Box') ? 'Box' : text === 'Choice' ? 'Choice' : null;
      const type = {
        text,
        references:
          name === null ? [] : [{name, package: 'types-library', start: 0, end: name.length}],
      };
      env.write(
        'custom-elements.json',
        JSON.stringify({
          schemaVersion: '2.0.0',
          modules: [
            {
              kind: 'javascript-module',
              path: 'element.js',
              declarations: [
                {
                  kind: 'class',
                  name: 'TestElement',
                  customElement: true,
                  tagName: 'test-element',
                  members: [
                    {kind: 'field', name: 'value', type},
                    {kind: 'field', name: 'count', type: {text: 'number'}},
                  ],
                  attributes: [{name: 'value', type}],
                  events: [{name: 'change', type}],
                },
              ],
              exports: [
                {
                  kind: 'custom-element-definition',
                  name: 'test-element',
                  declaration: {name: 'TestElement'},
                },
              ],
            },
          ],
        }),
      );
    }

    function writeTemplate(template: string): void {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';
        @Component({templateUrl: './test.html'})
        export class TestComponent {value = {value: 'a'};}
      `,
      );
      env.write('test.html', template);
    }

    for (const type of [
      'readonly string',
      '[string?, number]',
      'Box',
      'Box<string, string>',
      'Box<number>',
    ]) {
      it(`should warn and retain unrelated checks for unusable type ${type}`, () => {
        writeType(type);
        writeTemplate(
          `<test-element [value]="value" [count]="'wrong'" (change)="$event.type"></test-element>`,
        );
        const diagnostics = env.driveDiagnostics();
        expect(diagnostics.length).toBe(2);
        expect(diagnostics[0].code).toBe(
          ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNUSABLE_TYPE),
        );
        expect(diagnostics[1].messageText).toContain(
          "Type 'string' is not assignable to type 'number'",
        );
      });
    }

    it('should retain valid generic checks', () => {
      writeType('Box<string>');
      writeTemplate('<test-element [value]="value"></test-element>');
      expect(env.driveDiagnostics()).toEqual([]);
      writeTemplate('<test-element [value]="1"></test-element>');
      const diagnostics = env.driveDiagnostics();
      expect(diagnostics.length).toBe(1);
      expect(diagnostics[0].messageText).toContain('not assignable');
    });

    it('should check static values of aliases using standard library utilities', () => {
      writeType('Choice');
      writeTemplate('<test-element value="invalid"></test-element>');
      const diagnostics = env.driveDiagnostics();
      expect(diagnostics.length).toBe(1);
      expect(diagnostics[0].messageText).toContain('not assignable');
      writeTemplate('<test-element value="A"></test-element>');
      expect(env.driveDiagnostics()).toEqual([]);
    });
  });
});
