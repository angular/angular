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
        setupDeepModule(env);
        setupAppModule(env);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('app/cmp-b.ts', `
            import {Component, Input, Output, EventEmitter} from '@angular/core';

            @Component({
              selector: 'app-cmp-b',
              template: '<div dir>{{ 1 | pipe }}</div>',
            })
            export class AppCmpB {
              @Input('app-cmp-b-in') input: string;
              @Output('app-cmp-b-out') output = new EventEmitter<number>(); // <-- changed to number
            }
          `);
        env.driveMain();
        expectToHaveWritten([
          // AppMod is written because it has a direct reference to AppCmpB.
          '/app/mod.js',

          // AppCmpB is written because it was updated.
          '/app/cmp-b.js',

          // Nothing else is written because the public API of AppCmpB was not affected
        ]);
      });

      it('should not recompile components that do not use a changed directive', () => {
        setupDeepModule(env);
        setupAppModule(env);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('app/cmp-b.ts', `
             import {Component, Input, Output, EventEmitter} from '@angular/core';

             @Component({
               selector: 'app-cmp-b',
               template: '<div dir>{{ 1 | pipe }}</div>',
             })
             export class AppCmpB {
               @Input('app-cmp-b-in') input: string;
               @Output('app-cmp-b-out-renamed') output = new EventEmitter<number>(); // <-- renamed
             }
           `);
        env.driveMain();
        expectToHaveWritten([
          // AppMod is written because it has a direct reference to AppCmpB.
          '/app/mod.js',

          // AppCmpB is written because it was updated.
          '/app/cmp-b.js',

          // AppCmpA is written because it uses AppCmpB, for which the public API was affected.
          '/app/cmp-a.js',

          // In particular AppCmpC should not be written because it does not use AppCmpB.
        ]);
      });

      it('should recompile components for which a directive usage is introduced', () => {
        setupDeepModule(env);
        setupAppModule(env);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('app/dir-b.ts', `
             import {Directive} from '@angular/core';

             @Directive({
               selector: '[dir]',
             })
             export class AppDirB {
             }
           `);
        env.write('app/mod.ts', `
             import {NgModule} from '@angular/core';
             import {DeepMod} from '../deep/mod';
             import {AppDir} from './dir';
             import {AppCmpA} from './cmp-a';
             import {AppCmpB} from './cmp-b';
             import {AppCmpC} from './cmp-c';
             import {AppPipe} from './pipe';
             import {AppDirB} from './dir-b';

             @NgModule({
               declarations: [AppDir, AppDirB, AppCmpA, AppCmpB, AppCmpC, AppPipe], // <-- AppDirB added
               imports: [DeepMod],
             })
             export class AppMod {}
           `);
        env.driveMain();
        expectToHaveWritten([
          // AppMod is written because it was updated.
          '/app/mod.js',

          // AppDirB is written because it was added.
          '/app/dir-b.js',

          // AppCmpB and AppCmpB are written because they match the selector of AppDirB.
          '/app/cmp-b.js', '/app/cmp-c.js',

          // In particular AppCmpA should not be written because it does not use AppDirB.
        ]);
      });

      it('should recompile components for which a directive usage is removed', () => {
        setupDeepModule(env);
        setupAppModule(env);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('app/mod.ts', `
             import {NgModule} from '@angular/core';
             import {DeepMod} from '../deep/mod';
             import {AppCmpA} from './cmp-a';
             import {AppCmpB} from './cmp-b';
             import {AppCmpC} from './cmp-c';
             import {AppPipe} from './pipe';

             @NgModule({
               declarations: [AppCmpA, AppCmpB, AppCmpC, AppPipe], // <-- AppDir removed
               imports: [DeepMod],
             })
             export class AppMod {}
           `);
        env.driveMain();
        expectToHaveWritten([
          // AppMod is written because it was updated.
          '/app/mod.js',

          // AppCmpB and AppCmpB are written because they used to match the selector of AppDir, but
          // it was removed.
          '/app/cmp-b.js', '/app/cmp-c.js',

          // In particular AppCmpA should not be written because it did not use AppDir.
        ]);
      });

      it('should recompile dependent components when an input is added', () => {
        setupDeepModule(env);
        setupAppModule(env);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('app/cmp-b.ts', `
             import {Component, Input, Output, EventEmitter} from '@angular/core';

             @Component({
               selector: 'app-cmp-b',
               template: '<div dir>{{ 1 | pipe }}</div>',
             })
             export class AppCmpB {
               @Input('app-cmp-b-in') input: string;
               @Input('app-cmp-b-in-added') added: string; // <-- added
               @Output('app-cmp-b-out') output = new EventEmitter<void>();
             }
           `);
        env.driveMain();
        expectToHaveWritten([
          // AppMod is written because it has a direct reference to AppCmpB, which was updated.
          '/app/mod.js',

          // AppCmpB is written because it was updated.
          '/app/cmp-b.js',

          // AppCmpA is written because it uses AppCmpB for which an input was added.
          '/app/cmp-a.js',

          // In particular AppCmpC should not be written because it did not use AppCmpB.
        ]);
      });

      it('should recompile dependent components when an input is renamed', () => {
        setupDeepModule(env);
        setupAppModule(env);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('app/cmp-b.ts', `
             import {Component, Input, Output, EventEmitter} from '@angular/core';

             @Component({
               selector: 'app-cmp-b',
               template: '<div dir>{{ 1 | pipe }}</div>',
             })
             export class AppCmpB {
               @Input('app-cmp-b-in-renamed') input: string; // <-- renamed
               @Output('app-cmp-b-out') output = new EventEmitter<void>();
             }
           `);
        env.driveMain();
        expectToHaveWritten([
          // AppMod is written because it has a direct reference to AppCmpB, which was updated.
          '/app/mod.js',

          // AppCmpB is written because it was updated.
          '/app/cmp-b.js',

          // AppCmpA is written because it uses AppCmpB for which an input was renamed.
          '/app/cmp-a.js',

          // In particular AppCmpC should not be written because it did not use AppCmpB.
        ]);
      });

      it('should recompile dependent components when an input is removed', () => {
        setupDeepModule(env);
        setupAppModule(env);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('app/cmp-b.ts', `
             import {Component, Input, Output, EventEmitter} from '@angular/core';

             @Component({
               selector: 'app-cmp-b',
               template: '<div dir>{{ 1 | pipe }}</div>',
             })
             export class AppCmpB {
               // @Input('app-cmp-b-in') input: string; // <-- commented out
               @Output('app-cmp-b-out') output = new EventEmitter<void>();
             }
           `);
        env.driveMain();
        expectToHaveWritten([
          // AppMod is written because it has a direct reference to AppCmpB, which was updated.
          '/app/mod.js',

          // AppCmpB is written because it was updated.
          '/app/cmp-b.js',

          // AppCmpA is written because it uses AppCmpB for which an input was removed.
          '/app/cmp-a.js',

          // In particular AppCmpC should not be written because it did not use AppCmpB.
        ]);
      });

      it('should recompile dependent components when an output is added', () => {
        setupDeepModule(env);
        setupAppModule(env);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('app/cmp-b.ts', `
             import {Component, Input, Output, EventEmitter} from '@angular/core';

             @Component({
               selector: 'app-cmp-b',
               template: '<div dir>{{ 1 | pipe }}</div>',
             })
             export class AppCmpB {
               @Input('app-cmp-b-in') input: string;
               @Output('app-cmp-b-out') output = new EventEmitter<void>();
               @Output('app-cmp-b-out-added') added: string; // <-- added
             }
           `);
        env.driveMain();
        expectToHaveWritten([
          // AppMod is written because it has a direct reference to AppCmpB, which was updated.
          '/app/mod.js',

          // AppCmpB is written because it was updated.
          '/app/cmp-b.js',

          // AppCmpA is written because it uses AppCmpB for which an output was added.
          '/app/cmp-a.js',

          // In particular AppCmpC should not be written because it did not use AppCmpB.
        ]);
      });

      it('should recompile dependent components when an output is renamed', () => {
        setupDeepModule(env);
        setupAppModule(env);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('app/cmp-b.ts', `
             import {Component, Input, Output, EventEmitter} from '@angular/core';

             @Component({
               selector: 'app-cmp-b',
               template: '<div dir>{{ 1 | pipe }}</div>',
             })
             export class AppCmpB {
               @Input('app-cmp-b-in') input: string;
               @Output('app-cmp-b-out-renamed') output = new EventEmitter<void>(); // <-- renamed
             }
           `);
        env.driveMain();
        expectToHaveWritten([
          // AppMod is written because it has a direct reference to AppCmpB, which was updated.
          '/app/mod.js',

          // AppCmpB is written because it was updated.
          '/app/cmp-b.js',

          // AppCmpA is written because it uses AppCmpB for which an output was renamed.
          '/app/cmp-a.js',

          // In particular AppCmpC should not be written because it did not use AppCmpB.
        ]);
      });

      it('should recompile dependent components when an output is removed', () => {
        setupDeepModule(env);
        setupAppModule(env);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('app/cmp-b.ts', `
             import {Component, Input, Output, EventEmitter} from '@angular/core';

             @Component({
               selector: 'app-cmp-b',
               template: '<div dir>{{ 1 | pipe }}</div>',
             })
             export class AppCmpB {
               @Input('app-cmp-b-in') input: string;
               // @Output('app-cmp-b-out') output = new EventEmitter<void>(); // <-- commented out
             }
           `);
        env.driveMain();
        expectToHaveWritten([
          // AppMod is written because it has a direct reference to AppCmpB, which was updated.
          '/app/mod.js',

          // AppCmpB is written because it was updated.
          '/app/cmp-b.js',

          // AppCmpA is written because it uses AppCmpB for which an output was removed.
          '/app/cmp-a.js',

          // In particular AppCmpC should not be written because it did not use AppCmpB.
        ]);
      });

      it('should recompile dependent components when exportAs clause changes', () => {
        setupDeepModule(env);
        setupAppModule(env);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('app/dir.ts', `
             import {Directive, Input, Output, EventEmitter} from '@angular/core';

             @Directive({
               selector: '[dir]',
               exportAs: 'dir', // <-- added
             })
             export class AppDir {
               @Input('dir-in') input: string;
               @Output('dir-out') output = new EventEmitter<void>();
             }
           `);
        env.driveMain();
        expectToHaveWritten([
          // AppMod is written because it has a direct reference to AppCmpB, which was updated.
          '/app/mod.js',

          // AppDir is written because it was updated.
          '/app/dir.js',

          // AppCmpB and AppCmpC are written because they use AppDir, which had its exportAs clause
          // changed.
          '/app/cmp-b.js', '/app/cmp-c.js',

          // In particular AppCmpA should not be written because it did not use AppDir.
        ]);
      });

      it('should recompile components when a pipe is newly matched because it was renamed', () => {
        setupDeepModule(env);
        setupAppModule(env);

        env.driveMain();
        env.flushWrittenFileTracking();

        env.write('app/pipe.ts', `
            import {Pipe} from '@angular/core';

            @Pipe({
              name: 'pipe-renamed', // <-- renamed
            })
            export class AppPipe {}
          `);
        env.driveMain();
        expectToHaveWritten([
          // AppMod is written because it has a direct reference to AppPipe, which was updated.
          '/app/mod.js',

          // AppPipe is written because it was updated.
          '/app/pipe.js',

          // AppCmpB and AppCmpC are written because they used AppPipe which no longer matches.
          '/app/cmp-b.js', '/app/cmp-c.js',

          // AppCmpA should not be written because it does not use AppPipe.
        ]);
      });
    });

    describe('external declarations', () => {
      it('should not recompile components that use external declarations that are not changed',
         () => {
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
      it('should recompile components when their exported name changes', () => {
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

          @Component({
            selector: 'cmp-dep',
            template: 'Dep',
          })
          export class CmpDep {}
        `);
        env.write('module.ts', `
          import {NgModule} from '@angular/core';
          import {CmpUser} from './cmp-user';
          import {CmpDep} from './cmp-dep';

          @NgModule({
            declarations: [CmpUser, CmpDep]
          })
          export class Module {}
        `);

        env.driveMain();

        env.write('cmp-dep.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp-dep',
            template: 'Dep',
          })
          export class CmpDep2 {}
        `);
        env.write('module.ts', `
          import {NgModule} from '@angular/core';
          import {CmpUser} from './cmp-user';
          import {CmpDep2} from './cmp-dep';

          @NgModule({
            declarations: [CmpUser, CmpDep2]
          })
          export class Module {}
        `);

        env.flushWrittenFileTracking();
        env.driveMain();

        expectToHaveWritten([
          // CmpDep and its module were directly updated.
          '/cmp-dep.js',
          '/module.js',

          // CmpUser required a re-emit because the exported name of CmpDep changed.
          '/cmp-user.js',
        ]);
      });

      it('should recompile components when the name by which they are exported changes', () => {
        env.write('cmp-user.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp-user',
            template: '<cmp-dep></cmp-dep>',
          })
          class CmpUserInternal {}

          export {CmpUserInternal as CmpUser};
        `);
        env.write('cmp-dep.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp-dep',
            template: 'Dep',
          })
          class CmpDepInternal {}

          export {CmpDepInternal as CmpDep};
        `);
        env.write('module.ts', `
          import {NgModule} from '@angular/core';
          import {CmpUser} from './cmp-user';
          import {CmpDep} from './cmp-dep';

          @NgModule({
            declarations: [CmpUser, CmpDep]
          })
          export class Module {}
        `);

        env.driveMain();

        env.write('cmp-dep.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp-dep',
            template: 'Dep',
          })
          class CmpDepInternal {}

          export {CmpDepInternal as CmpDep2};
        `);
        env.write('module.ts', `
          import {NgModule} from '@angular/core';
          import {CmpUser} from './cmp-user';
          import {CmpDep2} from './cmp-dep';

          @NgModule({
            declarations: [CmpUser, CmpDep2]
          })
          export class Module {}
        `);

        env.flushWrittenFileTracking();
        env.driveMain();

        expectToHaveWritten([
          // CmpDep and its module were directly updated.
          '/cmp-dep.js',
          '/module.js',

          // CmpUser required a re-emit because the exported name of CmpDep changed.
          '/cmp-user.js',
        ]);
      });

      it('should recompile components when a re-export is renamed', () => {
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
          export class CmpDep {}
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
          export class CmpDep {}
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
          export class DepB {}
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
          export class DepA {}

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


      it('should recompile an NgModule when a remotely scoped component\'s scope is changed',
         () => {
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

function setupDeepModule(env: NgtscTestEnvironment) {
  env.write('deep/dir.ts', `
    import {Directive} from '@angular/core';

    @Directive({
      selector: '[dir]',
    })
    export class DeepDir {}
  `);
  env.write('deep/cmp.ts', `
    import {Component} from '@angular/core';

    @Component({
      selector: 'deep-cmp',
      template: ''
    })
    export class DeepCmp {}
  `);
  env.write('deep/pipe.ts', `
    import {Pipe} from '@angular/core';

    @Pipe({
      name: 'pipe',
    })
    export class DeepPipe {}
  `);
  env.write('deep/mod.ts', `
    import {NgModule} from '@angular/core';
    import {DeepDir} from './dir';
    import {DeepCmp} from './cmp';
    import {DeepPipe} from './pipe';

    @NgModule({
      declarations: [DeepDir, DeepCmp, DeepPipe],
      exports: [DeepDir, DeepCmp, DeepPipe],
    })
    export class DeepMod {}
  `);
}

function setupAppModule(env: NgtscTestEnvironment) {
  env.write('app/dir.ts', `
    import {Directive, Input, Output, EventEmitter} from '@angular/core';

    @Directive({
      selector: '[dir]',
    })
    export class AppDir {
      @Input('dir-in') input: string;
      @Output('dir-out') output = new EventEmitter<void>();
    }
  `);
  env.write('app/cmp-a.ts', `
    import {Component} from '@angular/core';

    @Component({
      selector: 'app-cmp-a',
      template: '<app-cmp-b></app-cmp-b>',
    })
    export class AppCmpA {}
  `);
  env.write('app/cmp-b.ts', `
    import {Component, Input, Output, EventEmitter} from '@angular/core';

    @Component({
      selector: 'app-cmp-b',
      template: '<div dir>{{ 1 | pipe }}</div>',
    })
    export class AppCmpB {
      @Input('app-cmp-b-in') input: string;
      @Output('app-cmp-b-out') output = new EventEmitter<void>();
    }
  `);
  env.write('app/cmp-c.ts', `
    import {Component} from '@angular/core';

    @Component({
      selector: 'app-cmp-c',
      template: '<deep-cmp dir>{{ 1 | pipe }}</deep-cmp>',
    })
    export class AppCmpC {}
  `);
  env.write('app/pipe.ts', `
    import {Pipe} from '@angular/core';

    @Pipe({
      name: 'pipe',
    })
    export class AppPipe {}
  `);
  env.write('app/mod.ts', `
    import {NgModule} from '@angular/core';
    import {DeepMod} from '../deep/mod';
    import {AppDir} from './dir';
    import {AppCmpA} from './cmp-a';
    import {AppCmpB} from './cmp-b';
    import {AppCmpC} from './cmp-c';
    import {AppPipe} from './pipe';

    @NgModule({
      declarations: [AppDir, AppCmpA, AppCmpB, AppCmpC, AppPipe],
      imports: [DeepMod],
    })
    export class AppMod {}
  `);
}
