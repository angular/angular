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
  describe('ngtsc incremental compilation (semantic changes)', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.enableMultipleCompilations();
      env.tsconfig();
    });

    function expectToHaveWritten(files: string[]): void {
      const set = env.getFilesWrittenSinceLastFlush();

      const expectedSet = new Set<string>();
      for (const file of files) {
        expectedSet.add(file);
        expectedSet.add(file.replace(/\.js$/, '.d.ts'));
      }

      expect(set).toEqual(expectedSet);

      // Reset for the next compilation.
      env.flushWrittenFileTracking();
    }

    describe('changes to public api', () => {
      it('should not recompile dependent components when public api is unchanged', () => {
        // Testing setup: ADep is a component with an input and an output, and is consumed by two
        // other components - ACmp within its same NgModule, and BCmp which depends on ADep via an
        // NgModule import.
        //
        // ADep is changed during the test without affecting its public API, and the test asserts
        // that both ACmp and BCmp which consume ADep are not re-emitted.
        env.write('a/dep.ts', `
          import {Component, Input, Output, EventEmitter} from '@angular/core';

          @Component({
            selector: 'a-dep',
            template: 'a-dep',
          })
          export class ADep {
            @Input()
            input!: string;

            @Output()
            output = new EventEmitter<string>();
          }
        `);
        env.write('a/cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'a-cmp',
            template: '<a-dep></a-dep>',
          })
          export class ACmp {}
        `);
        env.write('a/mod.ts', `
          import {NgModule} from '@angular/core';
          import {ADep} from './dep';
          import {ACmp} from './cmp';

          @NgModule({
            declarations: [ADep, ACmp],
            exports: [ADep],
          })
          export class AMod {}
        `);
        env.write('b/cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'b-cmp',
            template: '<a-dep></a-dep>',
          })
          export class BCmp {}
        `);
        env.write('b/mod.ts', `
          import {NgModule} from '@angular/core';
          import {BCmp} from './cmp';
          import {AMod} from '../a/mod';

          @NgModule({
            declarations: [BCmp],
            imports: [AMod],
          })
          export class BMod {}
        `);

        env.driveMain();
        env.flushWrittenFileTracking();

        // Change ADep without affecting its public API.
        env.write('a/dep.ts', `
          import {Component, Input, Output, EventEmitter} from '@angular/core';

          @Component({
            selector: 'a-dep',
            template: 'a-dep',
          })
          export class ADep {
            @Input()
            input!: string;

            @Output()
            output = new EventEmitter<number>(); // changed from string to number
          }
        `);

        env.driveMain();
        expectToHaveWritten([
          // ADep is written because it was updated.
          '/a/dep.js',

          // AMod is written because it has a direct dependency on ADep.
          '/a/mod.js',

          // Nothing else is written because the public API of AppCmpB was not affected
        ]);
      });

      it('should not recompile components that do not use a changed directive', () => {
        // Testing setup: ADep is a directive with an input and output, which is visible to two
        // components which do not use ADep in their templates - ACmp within the same NgModule, and
        // BCmp which has visibility of ADep via an NgModule import.
        //
        // During the test, ADep's public API is changed, and the test verifies that neither ACmp
        // nor BCmp are re-emitted.

        env.write('a/dep.ts', `
          import {Directive, Input, Output, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[a-dep]',
          })
          export class ADep {
            @Input()
            input!: string;

            @Output()
            output = new EventEmitter<string>();
          }
        `);
        env.write('a/cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'a-cmp',
            template: 'Does not use a-dep.',
          })
          export class ACmp {}
        `);
        env.write('a/mod.ts', `
          import {NgModule} from '@angular/core';
          import {ADep} from './dep';
          import {ACmp} from './cmp';

          @NgModule({
            declarations: [ADep, ACmp],
            exports: [ADep],
          })
          export class AMod {}
        `);
        env.write('b/cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'b-cmp',
            template: 'Does not use a-dep.',
          })
          export class BCmp {}
        `);
        env.write('b/mod.ts', `
          import {NgModule} from '@angular/core';
          import {BCmp} from './cmp';
          import {AMod} from '../a/mod';

          @NgModule({
            declarations: [BCmp],
            imports: [AMod],
          })
          export class BMod {}
        `);

        env.driveMain();
        env.flushWrittenFileTracking();

        // Update ADep and change its public API.
        env.write('a/dep.ts', `
          import {Directive, Input, Output, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[a-dep]',
            template: 'a-dep',
          })
          export class ADep {
            @Input()
            input!: string;

            @Output('output-renamed') // public binding name of the @Output is changed.
            output = new EventEmitter<string>();
          }
        `);

        env.driveMain();
        expectToHaveWritten([
          // ADep is written because it was updated.
          '/a/dep.js',

          // AMod is written because it has a direct dependency on ADep.
          '/a/mod.js',

          // Nothing else is written because neither ACmp nor BCmp depend on ADep.
        ]);
      });

      it('should recompile components for which a directive usage is introduced', () => {
        // Testing setup: Cmp is a component with a template that would match a directive with the
        // selector '[dep]' if one existed. Dep is a directive with a different selector initially.
        //
        // During the test, Dep's selector is updated to '[dep]', causing it to begin matching the
        // template of Cmp. The test verifies that Cmp is re-emitted after this change.
        env.write('dep.ts', `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[does-not-match]',
          })
          export class Dep {}
        `);
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp',
            template: '<div dep></div>',
          })
          export class Cmp {}
        `);
        env.write('mod.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {Dep} from './dep';

          @NgModule({
            declarations: [Cmp, Dep],
          })
          export class Mod {}
        `);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('dep.ts', `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[dep]', // selector changed to now match inside Cmp's template
          })
          export class Dep {}
        `);
        env.driveMain();

        expectToHaveWritten([
          // Dep is written because it was directly updated.
          '/dep.js',

          // Mod is written because it has a direct dependency on Dep.
          '/mod.js',

          // Cmp is written because the directives matched in its template have changed.
          '/cmp.js',
        ]);
      });

      it('should recompile components for which a directive usage is removed', () => {
        // Testing setup: Cmp is a component with a template that matches a directive Dep with the
        // initial selector '[dep]'.
        //
        // During the test, Dep's selector is changed, causing it to no longer match the template of
        // Cmp. The test verifies that Cmp is re-emitted after this change.

        env.write('dep.ts', `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[dep]',
          })
          export class Dep {}
        `);
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp',
            template: '<div dep></div>',
          })
          export class Cmp {}
        `);
        env.write('mod.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {Dep} from './dep';

          @NgModule({
            declarations: [Cmp, Dep],
          })
          export class Mod {}
        `);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('dep.ts', `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[does-not-match]', // selector changed to no longer match Cmp's template
          })
          export class Dep {}
        `);
        env.driveMain();

        expectToHaveWritten([
          // Dep is written because it was directly updated.
          '/dep.js',

          // Mod is written because it has a direct dependency on Dep.
          '/mod.js',

          // Cmp is written because the directives matched in its template have changed.
          '/cmp.js',
        ]);
      });

      it('should recompile dependent components when an input is added', () => {
        // Testing setup: Cmp is a component with a template that matches a directive Dep with the
        // initial selector '[dep]'.
        //
        // During the test, an input is added to Dep, and the test verifies that Cmp is re-emitted.

        env.write('dep.ts', `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[dep]',
          })
          export class Dep {}
        `);
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp',
            template: '<div dep></div>',
          })
          export class Cmp {}
        `);
        env.write('mod.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {Dep} from './dep';

          @NgModule({
            declarations: [Cmp, Dep],
          })
          export class Mod {}
        `);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('dep.ts', `
          import {Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dep]',
          })
          export class Dep {
            @Input() input!: string; // adding this changes Dep's public API
          }
        `);
        env.driveMain();

        expectToHaveWritten([
          // Dep is written because it was directly updated.
          '/dep.js',

          // Mod is written because it has a direct dependency on Dep.
          '/mod.js',

          // Cmp is written because it depends on Dep, which has changed in its public API.
          '/cmp.js',
        ]);
      });

      it('should recompile dependent components when an input is renamed', () => {
        // Testing setup: Cmp is a component with a template that matches a directive Dep with the
        // initial selector '[dep]'.
        //
        // During the test, an input of Dep is renamed, and the test verifies that Cmp is
        // re-emitted.

        env.write('dep.ts', `
          import {Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dep]',
          })
          export class Dep {
            @Input() input!: string;
          }
        `);
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp',
            template: '<div dep></div>',
          })
          export class Cmp {}
        `);
        env.write('mod.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {Dep} from './dep';

          @NgModule({
            declarations: [Cmp, Dep],
          })
          export class Mod {}
        `);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('dep.ts', `
          import {Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dep]',
          })
          export class Dep {
            @Input('renamed') input!: string; // renaming this changes Dep's public API
          }
        `);
        env.driveMain();

        expectToHaveWritten([
          // Dep is written because it was directly updated.
          '/dep.js',

          // Mod is written because it has a direct dependency on Dep.
          '/mod.js',

          // Cmp is written because it depends on Dep, which has changed in its public API.
          '/cmp.js',
        ]);
      });

      it('should recompile dependent components when an input is removed', () => {
        // Testing setup: Cmp is a component with a template that matches a directive Dep with the
        // initial selector '[dep]'.
        //
        // During the test, an input of Dep is removed, and the test verifies that Cmp is
        // re-emitted.

        env.write('dep.ts', `
          import {Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dep]',
          })
          export class Dep {
            @Input() input!: string;
          }
        `);
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp',
            template: '<div dep></div>',
          })
          export class Cmp {}
        `);
        env.write('mod.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {Dep} from './dep';

          @NgModule({
            declarations: [Cmp, Dep],
          })
          export class Mod {}
        `);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('dep.ts', `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[dep]',
          })
          export class Dep {
            // Dep's input has been removed, which changes its public API
          }
        `);
        env.driveMain();

        expectToHaveWritten([
          // Dep is written because it was directly updated.
          '/dep.js',

          // Mod is written because it has a direct dependency on Dep.
          '/mod.js',

          // Cmp is written because it depends on Dep, which has changed in its public API.
          '/cmp.js',
        ]);
      });

      it('should recompile dependent components when an output is added', () => {
        // Testing setup: Cmp is a component with a template that matches a directive Dep with the
        // initial selector '[dep]'.
        //
        // During the test, an output of Dep is added, and the test verifies that Cmp is re-emitted.

        env.write('dep.ts', `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[dep]',
          })
          export class Dep {}
        `);
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp',
            template: '<div dep></div>',
          })
          export class Cmp {}
        `);
        env.write('mod.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {Dep} from './dep';

          @NgModule({
            declarations: [Cmp, Dep],
          })
          export class Mod {}
        `);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('dep.ts', `
          import {Directive, Output, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[dep]',
          })
          export class Dep {
            @Output()
            output = new EventEmitter<string>(); // added, which changes Dep's public API
          }
        `);
        env.driveMain();

        expectToHaveWritten([
          // Dep is written because it was directly updated.
          '/dep.js',

          // Mod is written because it has a direct dependency on Dep.
          '/mod.js',

          // Cmp is written because it depends on Dep, which has changed in its public API.
          '/cmp.js',
        ]);
      });

      it('should recompile dependent components when an output is renamed', () => {
        // Testing setup: Cmp is a component with a template that matches a directive Dep with the
        // initial selector '[dep]'.
        //
        // During the test, an output of Dep is renamed, and the test verifies that Cmp is
        // re-emitted.

        env.write('dep.ts', `
          import {Directive, Output, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[dep]',
          })
          export class Dep {
            @Output() output = new EventEmitter<string>();
          }
        `);
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp',
            template: '<div dep></div>',
          })
          export class Cmp {}
        `);
        env.write('mod.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {Dep} from './dep';

          @NgModule({
            declarations: [Cmp, Dep],
          })
          export class Mod {}
        `);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('dep.ts', `
          import {Directive, Output, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[dep]',
          })
          export class Dep {
            @Output('renamed') output = new EventEmitter<string>(); // public API changed
          }
        `);
        env.driveMain();

        expectToHaveWritten([
          // Dep is written because it was directly updated.
          '/dep.js',

          // Mod is written because it has a direct dependency on Dep.
          '/mod.js',

          // Cmp is written because it depends on Dep, which has changed in its public API.
          '/cmp.js',
        ]);
      });

      it('should recompile dependent components when an output is removed', () => {
        // Testing setup: Cmp is a component with a template that matches a directive Dep with the
        // initial selector '[dep]'.
        //
        // During the test, an output of Dep is removed, and the test verifies that Cmp is
        // re-emitted.

        env.write('dep.ts', `
          import {Directive, Output, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[dep]',
          })
          export class Dep {
            @Output() output = new EventEmitter<string>();
          }
        `);
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp',
            template: '<div dep></div>',
          })
          export class Cmp {}
        `);
        env.write('mod.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {Dep} from './dep';

          @NgModule({
            declarations: [Cmp, Dep],
          })
          export class Mod {}
        `);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('dep.ts', `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[dep]',
          })
          export class Dep {
            // Dep's output has been removed, which changes its public API
          }
        `);
        env.driveMain();

        expectToHaveWritten([
          // Dep is written because it was directly updated.
          '/dep.js',

          // Mod is written because it has a direct dependency on Dep.
          '/mod.js',

          // Cmp is written because it depends on Dep, which has changed in its public API.
          '/cmp.js',
        ]);
      });

      it('should recompile dependent components when exportAs clause changes', () => {
        // Testing setup: Cmp is a component with a template that matches a directive Dep with the
        // initial selector '[dep]' and an exportAs clause.
        //
        // During the test, the exportAs clause of Dep is changed, and the test verifies that Cmp is
        // re-emitted.

        env.write('dep.ts', `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[dep]',
            exportAs: 'depExport1',
          })
          export class Dep {}
        `);
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp',
            template: '<div dep></div>',
          })
          export class Cmp {}
        `);
        env.write('mod.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {Dep} from './dep';

          @NgModule({
            declarations: [Cmp, Dep],
          })
          export class Mod {}
        `);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('dep.ts', `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[dep]',
            exportAs: 'depExport2', // changing this changes Dep's public API
          })
          export class Dep {}
        `);
        env.driveMain();

        expectToHaveWritten([
          // Dep is written because it was directly updated.
          '/dep.js',

          // Mod is written because it has a direct dependency on Dep.
          '/mod.js',

          // Cmp is written because it depends on Dep, which has changed in its public API.
          '/cmp.js',
        ]);
      });

      it('should recompile components when a pipe is newly matched because it was renamed', () => {
        // Testing setup: Cmp uses two pipes (PipeA and PipeB) in its template.
        //
        // During the test, the selectors of these pipes are swapped. This ensures that Cmp's
        // template is still valid, since both pipe names continue to be valid within it. However,
        // as the identity of each pipe is now different, the effective public API of those pipe
        // usages has changed. The test then verifies that Cmp is re-emitted.

        env.write('pipes.ts', `
          import {Pipe} from '@angular/core';

          @Pipe({
            name: 'pipeA',
          })
          export class PipeA {
            transform(value: any): any { return value; }
          }

          @Pipe({
            name: 'pipeB',
          })
          export class PipeB {
            transform(value: any): any { return value; }
          }
        `);
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp',
            template: '{{ value | pipeA }} {{ value | pipeB }}',
          })
          export class Cmp {
            value!: string;
          }
        `);
        env.write('mod.ts', `
          import {NgModule} from '@angular/core';
          import {PipeA, PipeB} from './pipes';
          import {Cmp} from './cmp';

          @NgModule({
            declarations: [Cmp, PipeA, PipeB],
          })
          export class Mod {}
        `);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('pipes.ts', `
          import {Pipe} from '@angular/core';

          @Pipe({
            name: 'pipeB', // swapped with PipeB's selector
          })
          export class PipeA {
            transform(value: any): any { return value; }
          }

          @Pipe({
            name: 'pipeA', // swapped with PipeA's selector
          })
          export class PipeB {
            transform(value: any): any { return value; }
          }
        `);

        env.driveMain();
        expectToHaveWritten([
          // PipeA and PipeB have directly changed.
          '/pipes.js',

          // Mod depends directly on PipeA and PipeB.
          '/mod.js',

          // Cmp depends on the public APIs of PipeA and PipeB, which have changed (as they've
          // swapped).
          '/cmp.js',
        ]);
      });

      it('should recompile dependent components when an input becomes required', () => {
        // Testing setup: Cmp is a component with a template that matches a directive Dep with the
        // initial selector '[dep]'.
        //
        // During the test, an input of Dep becomes required, and the test verifies that Cmp is
        // re-emitted.

        env.write('dep.ts', `
          import {Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dep]',
          })
          export class Dep {
            @Input() input!: string;
          }
        `);
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp',
            template: '<div dep input="hello"></div>',
          })
          export class Cmp {}
        `);
        env.write('mod.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {Dep} from './dep';

          @NgModule({
            declarations: [Cmp, Dep],
          })
          export class Mod {}
        `);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('dep.ts', `
          import {Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dep]',
          })
          export class Dep {
            @Input({required: true}) input!: string; // making this required changes the public API
          }
        `);
        env.driveMain();

        expectToHaveWritten([
          // Dep is written because it was directly updated.
          '/dep.js',

          // Dep is written because it was directly updated.
          '/dep.d.ts',

          // Mod is written because it has a direct dependency on Dep.
          '/mod.js',

          // Mod is written because it depends on Dep, which has changed in its public API.
          '/mod.d.ts',
        ]);
      });
    });

    describe('external declarations', () => {
      it('should not recompile components that use external declarations that are not changed',
         () => {
           // Testing setup: Two components (MyCmpA and MyCmpB) both depend on an external directive
           // which matches their templates, via an NgModule import.
           //
           // During the test, MyCmpA is invalidated, and the test verifies that only MyCmpA and not
           // MyCmpB is re-emitted.
           env.write('node_modules/external/index.d.ts', `
             import * as ng from '@angular/core';

             export declare class ExternalDir {
               static ɵdir: ng.ɵɵDirectiveDefWithMeta<ExternalDir, "[external]", never, {}, {}, never>;
             }

             export declare class ExternalMod {
               static ɵmod: ng.ɵɵNgModuleDefWithMeta<ExternalMod, [typeof ExternalDir], never, [typeof ExternalDir]>;
             }
           `);
           env.write('cmp-a.ts', `
             import {Component} from '@angular/core';

             @Component({
               template: '<div external></div>',
             })
             export class MyCmpA {}
           `);
           env.write('cmp-b.ts', `
             import {Component} from '@angular/core';

             @Component({
               template: '<div external></div>',
             })
             export class MyCmpB {}
           `);
           env.write('mod.ts', `
             import {NgModule} from '@angular/core';
             import {ExternalMod} from 'external';
             import {MyCmpA} from './cmp-a';
             import {MyCmpB} from './cmp-b';

             @NgModule({
               declarations: [MyCmpA, MyCmpB],
               imports: [ExternalMod],
             })
             export class MyMod {}
           `);
           env.driveMain();
           env.flushWrittenFileTracking();

           // Invalidate MyCmpA, causing it to be re-emitted.
           env.invalidateCachedFile('cmp-a.ts');

           env.driveMain();
           expectToHaveWritten([
             // MyMod is written because it has a direct reference to MyCmpA, which was invalidated.
             '/mod.js',

             // MyCmpA is written because it was invalidated.
             '/cmp-a.js',

             // MyCmpB should not be written because it is unaffected.
           ]);
         });

      it('should recompile components once an external declaration is changed', () => {
        // Testing setup: Two components (MyCmpA and MyCmpB) both depend on an external directive
        // which matches their templates, via an NgModule import.
        //
        // During the test, the external directive is invalidated, and the test verifies that both
        // components are re-emitted as a result.
        env.write('node_modules/external/index.d.ts', `
          import * as ng from '@angular/core';

          export declare class ExternalDir {
            static ɵdir: ng.ɵɵDirectiveDefWithMeta<ExternalDir, "[external]", never, {}, {}, never>;
          }

          export declare class ExternalMod {
            static ɵmod: ng.ɵɵNgModuleDefWithMeta<ExternalMod, [typeof ExternalDir], never, [typeof ExternalDir]>;
          }
        `);
        env.write('cmp-a.ts', `
          import {Component} from '@angular/core';

          @Component({
            template: '<div external></div>',
          })
          export class MyCmpA {}
        `);
        env.write('cmp-b.ts', `
          import {Component} from '@angular/core';

          @Component({
            template: '<div external></div>',
          })
          export class MyCmpB {}
        `);
        env.write('mod.ts', `
          import {NgModule} from '@angular/core';
          import {ExternalMod} from 'external';
          import {MyCmpA} from './cmp-a';
          import {MyCmpB} from './cmp-b';

          @NgModule({
            declarations: [MyCmpA, MyCmpB],
            imports: [ExternalMod],
          })
          export class MyMod {}
        `);
        env.driveMain();
        env.flushWrittenFileTracking();

        // Invalidate the external file. Only the referential identity of external symbols matters
        // for emit reuse, so invalidating this should cause all dependent components to be
        // re-emitted.
        env.invalidateCachedFile('node_modules/external/index.d.ts');
        env.driveMain();

        expectToHaveWritten([
          // MyMod is written because it has a direct reference to ExternalMod, which was
          // invalidated.
          '/mod.js',

          // MyCmpA is written because it uses ExternalDir, which has not changed public API but has
          // changed identity.
          '/cmp-a.js',

          // MyCmpB is written because it uses ExternalDir, which has not changed public API but has
          // changed identity.
          '/cmp-b.js',
        ]);
      });
    });

    describe('symbol identity', () => {
      it('should recompile components when their declaration name changes', () => {
        // Testing setup: component Cmp depends on component Dep, which is directly exported.
        //
        // During the test, Dep's name is changed while keeping its public API the same. The test
        // verifies that Cmp is re-emitted.
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp',
            template: '<dep></dep>',
          })
          export class Cmp {}
        `);
        env.write('dep.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'dep',
            template: 'Dep',
          })
          export class Dep {}
        `);
        env.write('mod.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {Dep} from './dep';

          @NgModule({
            declarations: [Cmp, Dep]
          })
          export class Mod {}
        `);

        env.driveMain();

        env.write('dep.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'dep',
            template: 'Dep',
          })
          export class ChangedDep {} // Dep renamed to ChangedDep.
        `);
        env.write('mod.ts', `
          import {NgModule} from '@angular/core';

          import {Cmp} from './cmp';
          import {ChangedDep} from './dep';

          @NgModule({
            declarations: [Cmp, ChangedDep]
          })
          export class Mod {}
        `);

        env.flushWrittenFileTracking();
        env.driveMain();

        expectToHaveWritten([
          // Dep and Mod were directly updated.
          '/dep.js',
          '/mod.js',

          // Cmp required a re-emit because the name of Dep changed.
          '/cmp.js',
        ]);
      });

      it('should not recompile components that use a local directive', () => {
        // Testing setup: a single source file 'cmp.ts' declares components `Cmp` and `Dir`, where
        // `Cmp` uses `Dir` in its template. This test verifies that the local reference of `Cmp`
        // that is emitted into `Dir` does not inadvertently cause `cmp.ts` to be emitted even when
        // nothing changed.
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'dep',
            template: 'Dep',
          })
          export class Dep {}

          @Component({
            selector: 'cmp',
            template: '<dep></dep>',
          })
          export class Cmp {}
        `);
        env.write('mod.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp, Dep} from './cmp';

          @NgModule({
            declarations: [Cmp, Dep]
          })
          export class Mod {}
        `);

        env.driveMain();

        env.invalidateCachedFile('mod.ts');

        env.flushWrittenFileTracking();
        env.driveMain();

        expectToHaveWritten([
          // Only `mod.js` should be written because it was invalidated.
          '/mod.js',
        ]);
      });

      it('should recompile components when the name by which they are exported changes', () => {
        // Testing setup: component Cmp depends on component Dep, which is directly exported.
        //
        // During the test, Dep's exported name is changed while keeping its declaration name the
        // same. The test verifies that Cmp is re-emitted.
        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp',
            template: '<dep></dep>',
          })
          export class Cmp {}
        `);
        env.write('dep.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'dep',
            template: 'Dep',
          })
          export class Dep {}
        `);
        env.write('mod.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {Dep} from './dep';

          @NgModule({
            declarations: [Cmp, Dep]
          })
          export class Mod {}
        `);

        env.driveMain();

        env.write('dep.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'dep',
            template: 'Dep',
          })
          class Dep {}
          export {Dep as ChangedDep}; // the export name of Dep is changed.
        `);
        env.write('mod.ts', `
          import {NgModule} from '@angular/core';

          import {Cmp} from './cmp';
          import {ChangedDep} from './dep';

          @NgModule({
            declarations: [Cmp, ChangedDep]
          })
          export class Mod {}
        `);

        env.flushWrittenFileTracking();
        env.driveMain();

        expectToHaveWritten([
          // Dep and Mod were directly updated.
          '/dep.js',
          '/mod.js',

          // Cmp required a re-emit because the exported name of Dep changed.
          '/cmp.js',
        ]);
      });

      it('should recompile components when a re-export is renamed', () => {
        // Testing setup: CmpUser uses CmpDep in its template. CmpDep is both directly and
        // indirectly exported, and the compiler is guided into using the indirect export.
        //
        // During the test, the indirect export name is changed, and the test verifies that CmpUser
        // is re-emitted.

        env.write('cmp-user.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp-user',
            template: '<cmp-dep></cmp-dep>',
          })
          export class CmpUser {}
        `);
        env.write('cmp-dep.ts', `
          import {Component} from '@angular/core';

          export {CmpDep as CmpDepExport};

          @Component({
            selector: 'cmp-dep',
            template: 'Dep',
          })
          class CmpDep {}
        `);
        env.write('module.ts', `
          import {NgModule} from '@angular/core';
          import {CmpUser} from './cmp-user';
          import {CmpDepExport} from './cmp-dep';

          @NgModule({
            declarations: [CmpUser, CmpDepExport]
          })
          export class Module {}
        `);

        env.driveMain();

        // Verify that the reference emitter used the export of `CmpDep` that appeared first in
        // the source, i.e. `CmpDepExport`.
        const userCmpJs = env.getContents('cmp-user.js');
        expect(userCmpJs).toContain('CmpDepExport');

        env.write('cmp-dep.ts', `
          import {Component} from '@angular/core';

          export {CmpDep as CmpDepExport2};

          @Component({
            selector: 'cmp-dep',
            template: 'Dep',
          })
          class CmpDep {}
        `);
        env.write('module.ts', `
          import {NgModule} from '@angular/core';
          import {CmpUser} from './cmp-user';
          import {CmpDepExport2} from './cmp-dep';

          @NgModule({
            declarations: [CmpUser, CmpDepExport2]
          })
          export class Module {}
        `);

        env.flushWrittenFileTracking();
        env.driveMain();

        expectToHaveWritten([
          // CmpDep and its module were directly updated.
          '/cmp-dep.js',
          '/module.js',

          // CmpUser required a re-emit because it was previous emitted as `CmpDepExport`, but
          // that export has since been renamed.
          '/cmp-user.js',
        ]);

        // Verify that `CmpUser` now correctly imports `CmpDep` using its renamed
        // re-export `CmpDepExport2`.
        const userCmp2Js = env.getContents('cmp-user.js');
        expect(userCmp2Js).toContain('CmpDepExport2');
      });


      it('should not recompile components when a directive is changed into a component', () => {
        env.write('cmp-user.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp-user',
            template: '<div dep></div>',
          })
          export class CmpUser {}
        `);
        env.write('dep.ts', `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[dep]',
          })
          export class Dep {}
        `);
        env.write('module.ts', `
          import {NgModule} from '@angular/core';
          import {CmpUser} from './cmp-user';
          import {Dep} from './dep';

          @NgModule({
            declarations: [CmpUser, Dep]
          })
          export class Module {}
        `);

        env.driveMain();
        env.write('dep.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: '[dep]',
            template: 'Dep',
          })
          export class Dep {}
        `);

        env.flushWrittenFileTracking();
        env.driveMain();

        expectToHaveWritten([
          // Dep was directly changed.
          '/dep.js',

          // Module required a re-emit because its direct dependency (Dep) was changed.
          '/module.js',

          // CmpUser did not require a re-emit because its semantic dependencies were not affected.
          // Dep is still matched and still has the same public API.
        ]);
      });

      it('should recompile components when a directive and pipe are swapped', () => {
        // CmpUser uses a directive DepA and a pipe DepB, with the same selector/name 'dep'.
        //
        // During the test, the decorators of DepA and DepB are swapped, effectively changing the
        // SemanticSymbol types for them into different species while ensuring that CmpUser's
        // template is still valid. The test then verifies that CmpUser is re-emitted.

        env.write('cmp-user.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp-user',
            template: '<dep>{{1 | dep}}</dep>',
          })
          export class CmpUser {}
        `);
        env.write('dep.ts', `
          import {Directive, Pipe} from '@angular/core';

          @Directive({
            selector: 'dep',
          })
          export class DepA {}

          @Pipe({
            name: 'dep',
          })
          export class DepB {
            transform() {}
          }
        `);
        env.write('module.ts', `
          import {NgModule} from '@angular/core';
          import {CmpUser} from './cmp-user';
          import {DepA, DepB} from './dep';

          @NgModule({
            declarations: [CmpUser, DepA, DepB],
          })
          export class Module {}
        `);

        env.driveMain();

        // The annotations on DepA and DepB are swapped. This ensures that when we're comparing the
        // public API of these symbols to the prior program, the prior symbols are of a different
        // type (pipe vs directive) than the new symbols, which should lead to a re-emit.
        env.write('dep.ts', `
          import {Directive, Pipe} from '@angular/core';

          @Pipe({
            name: 'dep',
          })
          export class DepA {
            transform() {}
          }

          @Directive({
            selector: 'dep',
          })
          export class DepB {}
        `);

        env.flushWrittenFileTracking();
        env.driveMain();

        expectToHaveWritten([
          // Dep was directly changed.
          '/dep.js',

          // Module required a re-emit because its direct dependency (Dep) was changed.
          '/module.js',

          // CmpUser required a re-emit because the shape of its matched symbols changed.
          '/cmp-user.js',
        ]);
      });

      it('should not recompile components when a component is changed into a directive', () => {
        // Testing setup: CmpUser depends on a component Dep with an attribute selector.
        //
        // During the test, Dep is changed into a directive, and the test verifies that CmpUser is
        // not re-emitted (as the public API of a directive and a component are the same).

        env.write('cmp-user.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp-user',
            template: '<div dep></div>',
          })
          export class CmpUser {}
        `);
        env.write('dep.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: '[dep]',
            template: 'Dep',
          })
          export class Dep {}
        `);
        env.write('module.ts', `
          import {NgModule} from '@angular/core';
          import {CmpUser} from './cmp-user';
          import {Dep} from './dep';

          @NgModule({
            declarations: [CmpUser, Dep]
          })
          export class Module {}
        `);

        env.driveMain();

        env.write('dep.ts', `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[dep]',
          })
          export class Dep {}
        `);

        env.flushWrittenFileTracking();
        env.driveMain();

        expectToHaveWritten([
          // Dep was directly changed.
          '/dep.js',

          // Module required a re-emit because its direct dependency (Dep) was changed.
          '/module.js',

          // CmpUser did not require a re-emit because its semantic dependencies were not affected.
          // Dep is still matched and still has the same public API.
        ]);
      });
    });

    describe('remote scoping', () => {
      it('should not recompile an NgModule nor component when remote scoping is unaffected', () => {
        // Testing setup: MyCmpA and MyCmpB are two components with an indirect import cycle. That
        // is, each component consumes the other in its template. This forces the compiler to use
        // remote scoping to set the directiveDefs of at least one of the components in their
        // NgModule.
        //
        // During the test, an unrelated change is made to the template of MyCmpB, and the test
        // verifies that the NgModule for the components is not re-emitted.

        env.write('cmp-a-template.html', `<cmp-b><cmp-b>`);
        env.write('cmp-a.ts', `
             import {Component} from '@angular/core';

             @Component({
               selector: 'cmp-a',
               templateUrl: './cmp-a-template.html',
             })
             export class MyCmpA {}
           `);
        env.write('cmp-b-template.html', `<cmp-a><cmp-a>`);
        env.write('cmp-b.ts', `
             import {Component} from '@angular/core';

             @Component({
               selector: 'cmp-b',
               templateUrl: './cmp-b-template.html',
             })
             export class MyCmpB {}
           `);
        env.write('mod.ts', `
             import {NgModule} from '@angular/core';
             import {MyCmpA} from './cmp-a';
             import {MyCmpB} from './cmp-b';

             @NgModule({
               declarations: [MyCmpA, MyCmpB],
             })
             export class MyMod {}
           `);
        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('cmp-b-template.html', `<cmp-a>Update</cmp-a>`);
        env.driveMain();
        expectToHaveWritten([
          // MyCmpB is written because its template was updated.
          '/cmp-b.js',

          // MyCmpA should not be written because MyCmpB's public API didn't change.
          // MyMod should not be written because remote scoping didn't change.
        ]);
      });

      it('should recompile an NgModule and component when an import cycle is introduced', () => {
        // Testing setup: MyCmpA and MyCmpB are two components where MyCmpB consumes MyCmpA in its
        // template.
        //
        // During the test, MyCmpA's template is updated to consume MyCmpB, creating an effective
        // import cycle and forcing the compiler to use remote scoping for at least one of the
        // components. The test verifies that the components' NgModule is emitted as a result.

        env.write('cmp-a-template.html', ``);
        env.write('cmp-a.ts', `
             import {Component} from '@angular/core';

             @Component({
               selector: 'cmp-a',
               templateUrl: './cmp-a-template.html',
             })
             export class MyCmpA {}
           `);
        env.write('cmp-b-template.html', `<cmp-a><cmp-a>`);
        env.write('cmp-b.ts', `
             import {Component} from '@angular/core';

             @Component({
               selector: 'cmp-b',
               templateUrl: './cmp-b-template.html',
             })
             export class MyCmpB {}
           `);
        env.write('mod.ts', `
             import {NgModule} from '@angular/core';
             import {MyCmpA} from './cmp-a';
             import {MyCmpB} from './cmp-b';

             @NgModule({
               declarations: [MyCmpA, MyCmpB],
             })
             export class MyMod {}
           `);
        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('cmp-a-template.html', `<cmp-b><cmp-b>`);
        env.driveMain();
        expectToHaveWritten([
          // MyMod is written because its remote scopes have changed.
          '/mod.js',

          // MyCmpA is written because its template was updated.
          '/cmp-a.js',

          // MyCmpB is written because it now requires remote scoping, where previously it did not.
          '/cmp-b.js',
        ]);

        // Validate the correctness of the assumptions made above:
        // * CmpA should not be using remote scoping.
        // * CmpB should be using remote scoping.
        const moduleJs = env.getContents('mod.js');
        expect(moduleJs).not.toContain('setComponentScope(MyCmpA,');
        expect(moduleJs).toContain('setComponentScope(MyCmpB,');
      });

      it('should recompile an NgModule and component when an import cycle is removed', () => {
        // Testing setup: MyCmpA and MyCmpB are two components that each consume the other in their
        // template, forcing the compiler to utilize remote scoping for at least one of them.
        //
        // During the test, MyCmpA's template is updated to no longer consume MyCmpB, breaking the
        // effective import cycle and causing remote scoping to no longer be required. The test
        // verifies that the components' NgModule is emitted as a result.

        env.write('cmp-a-template.html', `<cmp-b><cmp-b>`);
        env.write('cmp-a.ts', `
             import {Component} from '@angular/core';

             @Component({
               selector: 'cmp-a',
               templateUrl: './cmp-a-template.html',
             })
             export class MyCmpA {}
           `);
        env.write('cmp-b-template.html', `<cmp-a><cmp-a>`);
        env.write('cmp-b.ts', `
             import {Component} from '@angular/core';

             @Component({
               selector: 'cmp-b',
               templateUrl: './cmp-b-template.html',
             })
             export class MyCmpB {}
           `);
        env.write('mod.ts', `
             import {NgModule} from '@angular/core';
             import {MyCmpA} from './cmp-a';
             import {MyCmpB} from './cmp-b';

             @NgModule({
               declarations: [MyCmpA, MyCmpB],
             })
             export class MyMod {}
           `);
        env.driveMain();

        // Validate the correctness of the assumption that CmpB will be the remotely scoped
        // component due to the above cycle:
        const moduleJs = env.getContents('mod.js');
        expect(moduleJs).not.toContain('setComponentScope(MyCmpA,');
        expect(moduleJs).toContain('setComponentScope(MyCmpB,');

        env.flushWrittenFileTracking();
        env.write('cmp-a-template.html', ``);

        env.driveMain();
        expectToHaveWritten([
          // MyMod is written because its remote scopes have changed.
          '/mod.js',

          // MyCmpA is written because its template was updated.
          '/cmp-a.js',

          // MyCmpB is written because it no longer needs remote scoping.
          '/cmp-b.js',
        ]);
      });

      it('should recompile an NgModule when a remotely scoped component\'s scope is changed',
         () => {
           // Testing setup: MyCmpA and MyCmpB are two components that each consume the other in
           // their template, forcing the compiler to utilize remote scoping for MyCmpB (which is
           // verified). Dir is a directive which is initially unused by either component.
           //
           // During the test, MyCmpB is updated to additionally consume Dir in its template. This
           // changes the remote scope of MyCmpB, requiring a re-emit of its NgModule which the test
           // verifies.

           env.write('dir.ts', `
               import {Directive} from '@angular/core';

               @Directive({
                 selector: '[dir]',
               })
               export class Dir {}
           `);
           env.write('cmp-a-template.html', `<cmp-b><cmp-b>`);
           env.write('cmp-a.ts', `
               import {Component} from '@angular/core';

               @Component({
                 selector: 'cmp-a',
                 templateUrl: './cmp-a-template.html',
               })
               export class MyCmpA {}
             `);
           env.write('cmp-b-template.html', `<cmp-a><cmp-a>`);
           env.write('cmp-b.ts', `
               import {Component} from '@angular/core';

               @Component({
                 selector: 'cmp-b',
                 templateUrl: './cmp-b-template.html',
               })
               export class MyCmpB {}
             `);
           env.write('mod.ts', `
               import {NgModule} from '@angular/core';
               import {MyCmpA} from './cmp-a';
               import {MyCmpB} from './cmp-b';
               import {Dir} from './dir';

               @NgModule({
                 declarations: [MyCmpA, MyCmpB, Dir],
               })
               export class MyMod {}
             `);
           env.driveMain();
           env.flushWrittenFileTracking();

           // Validate the correctness of the assumption that MyCmpB will be remotely scoped:
           const moduleJs = env.getContents('mod.js');
           expect(moduleJs).not.toContain('setComponentScope(MyCmpA,');
           expect(moduleJs).toContain('setComponentScope(MyCmpB,');

           env.write('cmp-b-template.html', `<cmp-a dir>Update</cmp-a>`);

           env.driveMain();

           expectToHaveWritten([
             // MyCmpB is written because its template was updated.
             '/cmp-b.js',

             // MyMod should be written because one of its remotely scoped components has a changed
             // scope.
             '/mod.js'

             // MyCmpA should not be written because none of its dependencies have changed in their
             // public API.
           ]);
         });


      it('should recompile an NgModule when its set of remotely scoped components changes', () => {
        // Testing setup: three components (MyCmpA, MyCmpB, and MyCmpC) are declared. MyCmpA
        // consumes the other two in its template, and MyCmpB consumes MyCmpA creating an effective
        // import cycle that forces the compiler to use remote scoping for MyCmpB (which is
        // verified).
        //
        // During the test, MyCmpC's template is changed to depend on MyCmpA, forcing remote
        // scoping for it as well. The test verifies that the NgModule is re-emitted as a new
        // component within it now requires remote scoping.

        env.write('cmp-a-template.html', `<cmp-b><cmp-b> <cmp-c></cmp-c>`);
        env.write('cmp-a.ts', `
           import {Component} from '@angular/core';

           @Component({
             selector: 'cmp-a',
             templateUrl: './cmp-a-template.html',
           })
           export class MyCmpA {}
         `);
        env.write('cmp-b-template.html', `<cmp-a><cmp-a>`);
        env.write('cmp-b.ts', `
           import {Component} from '@angular/core';

           @Component({
             selector: 'cmp-b',
             templateUrl: './cmp-b-template.html',
           })
           export class MyCmpB {}
         `);

        env.write('cmp-c-template.html', ``);
        env.write('cmp-c.ts', `
        import {Component} from '@angular/core';

        @Component({
          selector: 'cmp-c',
          templateUrl: './cmp-c-template.html',
        })
        export class MyCmpC {}
      `);
        env.write('mod.ts', `
           import {NgModule} from '@angular/core';
           import {MyCmpA} from './cmp-a';
           import {MyCmpB} from './cmp-b';
           import {MyCmpC} from './cmp-c';

           @NgModule({
             declarations: [MyCmpA, MyCmpB, MyCmpC],
           })
           export class MyMod {}
         `);
        env.driveMain();
        env.flushWrittenFileTracking();

        // Validate the correctness of the assumption that MyCmpB will be the only remotely
        // scoped component due to the MyCmpA <-> MyCmpB cycle:
        const moduleJsBefore = env.getContents('mod.js');
        expect(moduleJsBefore).not.toContain('setComponentScope(MyCmpA,');
        expect(moduleJsBefore).toContain('setComponentScope(MyCmpB,');
        expect(moduleJsBefore).not.toContain('setComponentScope(MyCmpC,');

        env.write('cmp-c-template.html', `<cmp-a>Update</cmp-a>`);
        env.driveMain();

        // Validate the correctness of the assumption that MyCmpB and MyCmpC are now both
        // remotely scoped due to the MyCmpA <-> MyCmpB and MyCmpA <-> MyCmpC cycles:
        const moduleJsAfter = env.getContents('mod.js');
        expect(moduleJsAfter).not.toContain('setComponentScope(MyCmpA,');
        expect(moduleJsAfter).toContain('setComponentScope(MyCmpB,');
        expect(moduleJsAfter).toContain('setComponentScope(MyCmpC,');

        expectToHaveWritten([
          // MyCmpC is written because its template was updated.
          '/cmp-c.js',

          // MyMod should be written because MyCmpC became remotely scoped
          '/mod.js'

          // MyCmpA and MyCmpB should not be written because none of their dependencies have
          // changed in their public API.
        ]);
      });
    });

    describe('NgModule declarations', () => {
      it('should recompile components when a matching directive is added in the direct scope',
         () => {
           // Testing setup: A component Cmp has a template which would match a directive Dir,
           // except Dir is not included in Cmp's NgModule.
           //
           // During the test, Dir is added to the NgModule, causing it to begin matching in Cmp's
           // template. The test verifies that Cmp is re-emitted to account for this.

           env.write('dir.ts', `
             import {Directive} from '@angular/core';

             @Directive({
               selector: '[dir]',
             })
             export class Dir {}
           `);

           env.write('cmp.ts', `
             import {Component} from '@angular/core';

             @Component({
               selector: 'test-cmp',
               template: '<div dir></div>',
             })
             export class Cmp {}
           `);

           env.write('mod.ts', `
             import {NgModule} from '@angular/core';
             import {Cmp} from './cmp';

             @NgModule({
               declarations: [Cmp],
             })
             export class Mod {}
           `);

           env.driveMain();
           env.flushWrittenFileTracking();

           env.write('mod.ts', `
             import {NgModule} from '@angular/core';
             import {Cmp} from './cmp';
             import {Dir} from './dir';

             @NgModule({
               declarations: [Cmp, Dir],
             })
             export class Mod {}
           `);

           env.driveMain();
           expectToHaveWritten([
             // Mod is written as it was directly changed.
             '/mod.js',

             // Cmp is written as a matching directive was added to Mod's scope.
             '/cmp.js',
           ]);
         });

      it('should recompile components when a matching directive is removed from the direct scope',
         () => {
           // Testing setup: Cmp is a component with a template that matches a directive Dir.
           //
           // During the test, Dir is removed from Cmp's NgModule, which causes it to stop matching
           // in Cmp's template. The test verifies that Cmp is re-emitted as a result.

           env.write('dir.ts', `
            import {Directive} from '@angular/core';

            @Directive({
              selector: '[dir]',
            })
            export class Dir {}
          `);

           env.write('cmp.ts', `
            import {Component} from '@angular/core';

            @Component({
              selector: 'test-cmp',
              template: '<div dir></div>',
            })
            export class Cmp {}
          `);

           env.write('mod.ts', `
            import {NgModule} from '@angular/core';
            import {Cmp} from './cmp';
            import {Dir} from './dir';

            @NgModule({
              declarations: [Cmp, Dir],
            })
            export class Mod {}
          `);

           env.driveMain();
           env.flushWrittenFileTracking();

           env.write('mod.ts', `
            import {NgModule} from '@angular/core';
            import {Cmp} from './cmp';

            @NgModule({
              declarations: [Cmp],
            })
            export class Mod {}
          `);

           env.driveMain();
           expectToHaveWritten([
             // Mod is written as it was directly changed.
             '/mod.js',

             // Cmp is written as a matching directive was removed from Mod's scope.
             '/cmp.js',
           ]);
         });

      it('should recompile components when a matching directive is added in the transitive scope',
         () => {
           // Testing setup: A component Cmp has a template which would match a directive Dir,
           // except Dir is not included in Cmp's NgModule.
           //
           // During the test, Dir is added to the NgModule via an import, causing it to begin
           // matching in Cmp's template. The test verifies that Cmp is re-emitted to account for
           // this.

           env.write('dir.ts', `
            import {Directive} from '@angular/core';

            @Directive({
              selector: '[dir]',
            })
            export class Dir {}
          `);

           env.write('cmp.ts', `
            import {Component} from '@angular/core';

            @Component({
              selector: 'test-cmp',
              template: '<div dir></div>',
            })
            export class Cmp {}
          `);

           env.write('deep.ts', `
            import {NgModule} from '@angular/core';

            @NgModule({
              declarations: [],
              exports: [],
            })
            export class Deep {}
          `);

           env.write('mod.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {Deep} from './deep';

          @NgModule({
            declarations: [Cmp],
            imports: [Deep],
          })
          export class Mod {}
        `);

           env.driveMain();
           env.flushWrittenFileTracking();


           env.write('deep.ts', `
            import {NgModule} from '@angular/core';
            import {Dir} from './dir';

            @NgModule({
              declarations: [Dir],
              exports: [Dir],
            })
            export class Deep {}
          `);

           env.driveMain();
           expectToHaveWritten([
             // Mod is written as it was directly changed.
             '/deep.js',

             // Mod is written as its direct dependency (Deep) was changed.
             '/mod.js',

             // Cmp is written as a matching directive was added to Mod's transitive scope.
             '/cmp.js',
           ]);
         });

      it('should recompile components when a matching directive is removed from the transitive scope',
         () => {
           // Testing setup: Cmp is a component with a template that matches a directive Dir, due to
           // Dir's NgModule being imported into Cmp's NgModule.
           //
           // During the test, this import link is removed, which causes Dir to stop matching in
           // Cmp's template. The test verifies that Cmp is re-emitted as a result.

           env.write('dir.ts', `
            import {Directive} from '@angular/core';

            @Directive({
              selector: '[dir]',
            })
            export class Dir {}
          `);

           env.write('cmp.ts', `
            import {Component} from '@angular/core';

            @Component({
              selector: 'test-cmp',
              template: '<div dir></div>',
            })
            export class Cmp {}
          `);

           env.write('deep.ts', `
            import {NgModule} from '@angular/core';
            import {Dir} from './dir';

            @NgModule({
              declarations: [Dir],
              exports: [Dir],
            })
            export class Deep {}
          `);

           env.write('mod.ts', `
            import {NgModule} from '@angular/core';
            import {Cmp} from './cmp';
            import {Deep} from './deep';

            @NgModule({
              declarations: [Cmp],
              imports: [Deep],
            })
            export class Mod {}
          `);

           env.driveMain();
           env.flushWrittenFileTracking();

           env.write('deep.ts', `
            import {NgModule} from '@angular/core';

            @NgModule({
              declarations: [],
              exports: [],
            })
            export class Deep {}
          `);

           env.driveMain();
           expectToHaveWritten([
             // Mod is written as it was directly changed.
             '/deep.js',

             // Mod is written as its direct dependency (Deep) was changed.
             '/mod.js',

             // Cmp is written as a matching directive was removed from Mod's transitive scope.
             '/cmp.js',
           ]);
         });

      it('should not recompile components when a non-matching directive is added in scope', () => {
        // Testing setup: A component Cmp has a template which does not match a directive Dir,
        // and Dir is not included in Cmp's NgModule.
        //
        // During the test, Dir is added to the NgModule, making it visible in Cmp's template.
        // However, Dir still does not match the template. The test verifies that Cmp is not
        // re-emitted.

        env.write('dir.ts', `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[dir]',
          })
          export class Dir {}
        `);

        env.write('cmp.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '<div></div>',
          })
          export class Cmp {}
        `);

        env.write('mod.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';

          @NgModule({
            declarations: [Cmp],
          })
          export class Mod {}
        `);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('mod.ts', `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {Dir} from './dir';

          @NgModule({
            declarations: [Cmp, Dir],
          })
          export class Mod {}
        `);

        env.driveMain();
        expectToHaveWritten([
          // Mod is written as it was directly changed.
          '/mod.js',

          // Cmp is not written as its used directives remains the same, since Dir does not match
          // within its template.
        ]);
      });
    });

    describe('error recovery', () => {
      it('should recompile a component when a matching directive is added that first contains an error',
         () => {
           // Testing setup: Cmp is a component which would match a directive with the selector
           // '[dir]'.
           //
           // During the test, an initial incremental compilation adds an import to a hypothetical
           // directive Dir to the NgModule, and adds Dir as a declaration. However, the import
           // points to a non-existent file.
           //
           // During a second incremental compilation, that missing file is added with a declaration
           // for Dir as a directive with the selector '[dir]', causing it to begin matching in
           // Cmp's template. The test verifies that Cmp is re-emitted once the program is correct.

           env.write('cmp.ts', `
            import {Component} from '@angular/core';

            @Component({
              selector: 'test-cmp',
              template: '<div dir></div>',
            })
            export class Cmp {}
          `);

           env.write('mod.ts', `
            import {NgModule} from '@angular/core';
            import {Cmp} from './cmp';

            @NgModule({
              declarations: [Cmp],
            })
            export class Mod {}
          `);

           env.driveMain();
           env.flushWrittenFileTracking();

           env.write('mod.ts', `
            import {NgModule} from '@angular/core';
            import {Cmp} from './cmp';
            import {Dir} from './dir';

            @NgModule({
              declarations: [Cmp, Dir],
            })
            export class Mod {}
          `);

           expect(env.driveDiagnostics().length).not.toBe(0);

           env.write('dir.ts', `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[dir]',
          })
          export class Dir {}
        `);

           env.flushWrittenFileTracking();
           env.driveMain();

           expectToHaveWritten([
             // Mod is written as it was changed in the first incremental compilation, but had
             // errors and so was not written then.
             '/mod.js',

             // Dir is written as it was added in the second incremental compilation.
             '/dir.js',

             // Cmp is written as the cumulative effect of the two changes was to add Dir to its
             // scope and thus match in Cmp's template.
             '/cmp.js',
           ]);
         });
    });

    it('should correctly emit components when public API changes during a broken program', () => {
      // Testing setup: a component Cmp exists with a template that matches directive Dir. Cmp also
      // references an extra file with a constant declaration.
      //
      // During the test, a first incremental compilation both adds an input to Dir (changing its
      // public API) as well as introducing a compilation error by adding invalid syntax to the
      // extra file.
      //
      // A second incremental compilation then fixes the invalid syntax, and the test verifies that
      // Cmp is re-emitted due to the earlier public API change to Dir.

      env.write('other.ts', `
        export const FOO = true;
      `);
      env.write('dir.ts', `
        import {Directive, Input} from '@angular/core';

        @Directive({
          selector: '[dir]',
        })
        export class Dir {
          @Input()
          dirIn!: string;
        }
      `);
      env.write('cmp.ts', `
        import {Component} from '@angular/core';
        import './other';

        @Component({
          selector: 'test-cmp',
          template: '<div dir></div>',
        })
        export class Cmp {}
      `);

      env.write('mod.ts', `
        import {NgModule} from '@angular/core';
        import {Cmp} from './cmp';
        import {Dir} from './dir';

        @NgModule({
          declarations: [Cmp, Dir],
        })
        export class Mod {}
      `);

      env.driveMain();

      env.flushWrittenFileTracking();
      env.write('dir.ts', `
      import {Directive, Input} from '@angular/core';

      @Directive({
        selector: '[dir]',
      })
      export class Dir {
        @Input()
        dirIn_changed!: string;
      }
    `);

      env.write('other.ts', `
        export const FOO = ;
      `);
      expect(env.driveDiagnostics().length).not.toBe(0);

      env.flushWrittenFileTracking();
      env.write('other.ts', `
        export const FOO = false;
      `);

      env.driveMain();
      expectToHaveWritten([
        // Mod is written as its direct dependency (Dir) was changed.
        '/mod.js',

        // Dir is written as it was directly changed.
        '/dir.js',

        // other.js is written as it was directly changed.
        '/other.js',

        // Cmp is written as Dir's public API has changed.
        '/cmp.js',
      ]);
    });
  });
});
