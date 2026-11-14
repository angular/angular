/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {customElementsManifest} from '../../src/ngtsc/custom_elements_manifest/testing';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';
import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles({fakeCommon: true});

runInEachFileSystem(() => {
  describe('exact property names of Custom Elements Manifest properties', () => {
    let env: NgtscTestEnvironment;

    const myButton = {
      tagName: 'my-button',
      members: [
        {kind: 'field', name: 'label', type: {text: 'string'}},
        {kind: 'field', name: 'readonly', type: {text: 'boolean'}},
      ],
    };
    const manifest = customElementsManifest(myButton);

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig({strictTemplates: true, customElementsManifests: ['./custom-elements.json']});
      env.write('custom-elements.json', JSON.stringify(manifest));
    });

    it('should set a manifest property by its exact name on a tag written in another case', () => {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          @Component({
            selector: 'blah',
            template: '<MY-BUTTON [label]="\\'go\\'" [readonly]="true"></MY-BUTTON>',
          })
          export class FooCmp {}
        `,
      );

      expect(env.driveDiagnostics()).toEqual([]);
      env.driveMain();
      const js = env.getContents('test.js');
      expect(js).toContain('("readonly", true)');
      expect(js).not.toContain('("readOnly", true)');
    });

    it('should update exact property instructions after a manifest-only change', () => {
      env.enableMultipleCompilations();
      const manifestWithTabindex = customElementsManifest({
        ...myButton,
        members: [...myButton.members, {kind: 'field', name: 'tabindex', type: {text: 'number'}}],
      });
      env.write('custom-elements.json', JSON.stringify(manifestWithTabindex));
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          @Component({
            selector: 'blah',
            template: '<my-button [tabindex]="0"></my-button>',
          })
          export class FooCmp {}
        `,
      );

      env.driveMain();
      expect(env.getContents('test.js')).toContain('ɵɵdomProperty("tabindex", 0)');

      env.flushWrittenFileTracking();
      env.write('custom-elements.json', JSON.stringify(manifest));
      env.driveMain();
      const output = env.getContents('test.js');
      expect(output).toContain('ɵɵdomProperty("tabIndex", 0)');
      expect(output).not.toContain('ɵɵdomProperty("tabindex", 0)');
      expect(env.getFilesWrittenSinceLastFlush()).toContain('/test.js');
    });

    it('should update partial exact-property metadata after a manifest-only change', () => {
      env.enableMultipleCompilations();
      env.tsconfig({
        compilationMode: 'partial',
        customElementsManifests: ['./custom-elements.json'],
      });
      const manifestWithTabindex = customElementsManifest({
        ...myButton,
        members: [...myButton.members, {kind: 'field', name: 'tabindex', type: {text: 'number'}}],
      });
      env.write('custom-elements.json', JSON.stringify(manifestWithTabindex));
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          @Component({
            selector: 'blah',
            template: '<my-button [tabindex]="0"></my-button>',
          })
          export class FooCmp {}
        `,
      );

      env.driveMain();
      let output = env.getContents('test.js');
      expect(output).toContain('minVersion: "22.4.0"');
      expect(output).toContain('customElementPropertyNames: { "my-button": ["tabindex"] }');

      env.flushWrittenFileTracking();
      env.write('custom-elements.json', JSON.stringify(manifest));
      env.driveMain();
      output = env.getContents('test.js');
      expect(output).not.toContain('customElementPropertyNames');
      expect(output).not.toContain('minVersion: "22.4.0"');
      expect(env.getFilesWrittenSinceLastFlush()).toContain('/test.js');
    });

    it('should not retain attribute, style, or class bindings as exact manifest properties', () => {
      env.tsconfig({
        compilationMode: 'partial',
        customElementsManifests: ['./custom-elements.json'],
      });
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          @Component({
            selector: 'blah',
            template: '<my-button [attr.readonly]="true" [style.label]="label" [class.label]="true"></my-button>',
          })
          export class FooCmp {
            label = 'wide';
          }
        `,
      );

      env.driveMain();
      const output = env.getContents('test.js');
      expect(output).not.toContain('customElementPropertyNames');
      expect(output).not.toContain('minVersion: "22.4.0"');
    });
  });
});
