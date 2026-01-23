/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../../src/ngtsc/testing';

import {NgtscTestEnvironment} from '../env';

const testFiles = loadStandardTestFiles({fakeCommon: true});

runInEachFileSystem(() => {
  let env!: NgtscTestEnvironment;

  describe('ngtsc function docs extraction', () => {
    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    it('should extract imported symbols from other angular packages', () => {
      env.write(
        'index.ts',
        `
        import {ApplicationRef} from '@angular/core';
        import {FormGroup} from '@angular/forms';

        export function getApp(): ApplicationRef {
        }

        export function getForm(): FormGroup {
        } 
      `,
      );

      const symbols = env.driveDocsExtractionForSymbols('index.ts');

      expect(symbols.size).toBe(2);
      expect(symbols.get('ApplicationRef')).toBe('@angular/core');
      expect(symbols.get('FormGroup')).toBe('@angular/forms');
    });

    it('should not extract imported symbols from non angular packages', () => {
      env.write(
        'index.ts',
        `
          import {ApplicationRef} from '@not-angular/core';
          import {FormGroup} from '@angular/forms';
  
          export function getApp(): ApplicationRef {
          }
  
          export function getForm(): FormGroup {
          } 
        `,
      );

      const symbols = env.driveDocsExtractionForSymbols('index.ts');

      expect(symbols.size).toBe(1);
      expect(symbols.get('FormGroup')).toBe('@angular/forms');
    });

    it('should not extract private symbols', () => {
      env.write(
        'index.ts',
        `
          import {ɵSafeHtml} from '@angular/core';
          import {FormGroup} from '@angular/forms';
  
          export function getApp(): ApplicationRef {
          }
  
          export function getForm(): FormGroup {
          } 
        `,
      );

      const symbols = env.driveDocsExtractionForSymbols('index.ts');

      expect(symbols.size).toBe(1);
      expect(symbols.get('FormGroup')).toBe('@angular/forms');
    });

    it('should not extract symbols from private packages', () => {
      env.write(
        'index.ts',
        `
          import {REACTIVE_NODE} from '@core/primitives/signals';
          import {FormGroup} from '@angular/forms';
  
          export function getApp(): ApplicationRef {
          }
  
          export function getForm(): FormGroup {
          } 
        `,
      );

      const symbols = env.driveDocsExtractionForSymbols('index.ts');

      expect(symbols.size).toBe(1);
      expect(symbols.get('FormGroup')).toBe('@angular/forms');
    });
  });
});
