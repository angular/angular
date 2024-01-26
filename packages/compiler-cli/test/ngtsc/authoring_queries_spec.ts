/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('signal-based queries', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig({strictTemplates: true});
    });

    it('should handle a basic viewChild', () => {
      env.write('test.ts', `
        import {Component, viewChild} from '@angular/core';

        @Component({selector: 'test', template: ''})
        export class TestDir {
          el = viewChild('myLocator');
        }
      `);
      env.driveMain();

      const js = env.getContents('test.js');
      expect(js).toContain(`i0.ɵɵviewQuerySignal(ctx.el, _c0, 5);`);
      expect(js).toContain(`i0.ɵɵqueryAdvance();`);
    });

    it('should handle a basic viewChildren', () => {
      env.write('test.ts', `
        import {Component, viewChildren} from '@angular/core';

        @Component({selector: 'test', template: ''})
        export class TestDir {
          el = viewChildren('myLocator');
        }
      `);
      env.driveMain();

      const js = env.getContents('test.js');
      expect(js).toContain(`i0.ɵɵviewQuerySignal(ctx.el, _c0, 5);`);
      expect(js).toContain(`i0.ɵɵqueryAdvance();`);
    });

    it('should handle a basic contentChild', () => {
      env.write('test.ts', `
        import {Component, contentChild} from '@angular/core';

        @Component({selector: 'test', template: ''})
        export class TestDir {
          el = contentChild('myLocator');
        }
      `);
      env.driveMain();

      const js = env.getContents('test.js');
      expect(js).toContain(`i0.ɵɵcontentQuerySignal(dirIndex, ctx.el, _c0, 5);`);
      expect(js).toContain(`i0.ɵɵqueryAdvance();`);
    });

    it('should handle a basic contentChildren', () => {
      env.write('test.ts', `
        import {Component, contentChildren} from '@angular/core';

        @Component({selector: 'test', template: ''})
        export class TestDir {
          el = contentChildren('myLocator');
        }
      `);
      env.driveMain();

      const js = env.getContents('test.js');
      expect(js).toContain(`i0.ɵɵcontentQuerySignal(dirIndex, ctx.el, _c0, 4);`);
      expect(js).toContain(`i0.ɵɵqueryAdvance();`);
    });

    describe('diagnostics', () => {
      it('should report an error when used with query decorator', () => {
        env.write('test.ts', `
        import {Component, viewChild, ViewChild} from '@angular/core';

        @Component({selector: 'test', template: ''})
        export class TestDir {
          @ViewChild('myLocator') el = viewChild('myLocator');
        }
      `);
        const diagnostics = env.driveDiagnostics();
        expect(diagnostics.length).toBe(1);
        expect(diagnostics).toEqual([jasmine.objectContaining({
          messageText: `Using @ViewChild with a signal-based query is not allowed.`,
        })]);
      });

      it('should report an error when used on a static field', () => {
        env.write('test.ts', `
        import {Component, viewChild} from '@angular/core';

        @Component({selector: 'test', template: ''})
        export class TestDir {
          static el = viewChild('myLocator');
        }
      `);
        const diagnostics = env.driveDiagnostics();
        expect(diagnostics.length).toBe(1);
        expect(diagnostics).toEqual([jasmine.objectContaining({
          messageText: `Query is incorrectly declared on a static class member.`,
        })]);
      });

      it('should report an error when declared in @Directive metadata', () => {
        env.write('test.ts', `
        import {Directive, ViewChild, viewChild} from '@angular/core';

        @Directive({
          selector: 'test',
          queries: {
            el: new ViewChild('myLocator'),
          },
        })
        export class TestDir {
          el = viewChild('myLocator');
        }
      `);
        const diagnostics = env.driveDiagnostics();
        expect(diagnostics.length).toBe(1);
        expect(diagnostics).toEqual([jasmine.objectContaining({
          messageText:
              `Query is declared multiple times. "@Directive" declares a query for the same property.`,
        })]);
      });

      it('should report an error when declared in @Component metadata', () => {
        env.write('test.ts', `
        import {Component, ViewChild, viewChild} from '@angular/core';

        @Component({
          selector: 'test',
          template: '',
          queries: {
            el: new ViewChild('myLocator'),
          },
        })
        export class TestComp {
          el = viewChild('myLocator');
        }
      `);
        const diagnostics = env.driveDiagnostics();
        expect(diagnostics.length).toBe(1);
        expect(diagnostics).toEqual([jasmine.objectContaining({
          messageText:
              `Query is declared multiple times. "@Component" declares a query for the same property.`,
        })]);
      });

      it('should report an error when a signal-based query function is used in metadata', () => {
        env.write('test.ts', `
          import {Component, viewChild} from '@angular/core';

          @Component({
            selector: 'test',
            template: '',
            queries: {
              el: new viewChild('myLocator'),
            },
          })
          export class TestComp {}
        `);

        const diagnostics = env.driveDiagnostics();
        expect(diagnostics.length).toBe(1);
        expect(diagnostics).toEqual([jasmine.objectContaining({
          messageText: `Decorator query metadata must be an instance of a query type`,
        })]);
      });
    });
  });
});
