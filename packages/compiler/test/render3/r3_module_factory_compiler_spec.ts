/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MockDirectory, emitLibrary, mergeMaps, setup} from '../aot/test_util';
import {createFactories, expectEmit} from './mock_compile';

describe('r3_factory_compiler', () => {
  const angularFiles = setup({
    compileAngular: true,
    compileAnimations: false,
    compileCommon: true,
  });

  it('should generate factories for all modules', () => {
    const libraries = {
      lib1: {
        src: {
          'component.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'lib1-cmp',
              template: '<h1> Hello, {{name}}!</h1>'
            })
            export class Lib1Component {
              name: string;
            }
          `,
          'directive.ts': `
            import {Directive, HostBinding} from '@angular/core';

            @Directive({selector: '[lib1-dir]'})
            export class Lib1Directive {
              @HostBinding('id') dirId = 'some id';
            }
          `,
          'service.ts': `
            import {Injectable} from '@angular/core';

            @Injectable()
            export class Lib1Service {
              getSomeInfo() { return 'some info'; }
            }
          `,
          'module.ts': `
            import {NgModule} from '@angular/core';

            import {Lib1Component} from './component';
            import {Lib1Directive} from './directive';
            import {Lib1Service} from './service';

            @NgModule({
              exports: [Lib1Component, Lib1Directive],
              declarations: [Lib1Component, Lib1Directive],
              providers: [Lib1Service]
            })
            export class Lib1Module {}
          `
        }
      },
      lib2: {
        src: {
          'component.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'lib2-cmp',
              template: '<h1> Hello, {{name}}!</h1>'
            })
            export class Lib2Component {
              name: string;
            }
          `,
          'directive.ts': `
            import {Directive, HostBinding} from '@angular/core';

            @Directive({selector: '[lib2-dir]'})
            export class Lib2Directive {
              @HostBinding('id') dirId = 'some id';
            }
          `,
          'service.ts': `
            import {Injectable} from '@angular/core';

            @Injectable()
            export class Lib2Service {
              getSomeInfo() { return 'some info'; }
            }
          `,
          'module.ts': `
            import {NgModule} from '@angular/core';

            import {Lib1Module} from '../../lib1/src/module';
            import {Lib2Component} from './component';
            import {Lib2Directive} from './directive';
            import {Lib2Service} from './service';

            @NgModule({
              imports: [Lib1Module],
              exports: [Lib2Component, Lib2Directive],
              declarations: [Lib2Component, Lib2Directive],
              providers: [Lib2Service]
            })
            export class Lib2Module {}
          `
        },
      }
    };

    const app = {
      app: {
        src: {
          'app.component.ts': `
            import {Component} from '@angular/core';
            import {Lib1Service} from '../../lib1/src/service';
            import {Lib2Service} from '../../lib2/src/service';

            @Component({
              selector: 'app-cmp',
              template: \`
                <lib1-cmp lib2-dir></lib1-cmp>
                <lib2-cmp lib1-dir></lib2-cmp>
              \`
            })
            export class AppComponent {
              constructor(public lib1s: Lib1Service, public lib2s: Lib2Service) {}
            }
          `,
          'app.module.ts': `
            import {NgModule} from '@angular/core';
            import {Lib1Module} from '../../lib1/src/module';
            import {Lib2Module} from '../../lib2/src/module';

            import {AppComponent} from './app.component';

            @NgModule({
              imports: [Lib1Module, Lib2Module],
              declarations: [AppComponent],
              bootstrap: [AppComponent]
            })
            export class AppModule {
            }
          `
        }
      }
    };


    const lib1_module_factory = `
      export const Lib1ModuleNgFactory: $any$ = {
        moduleType: $i1$.Lib1Module,
        create: function Lib1ModuleNgFactory_Create(parentInjector: $any$) {
          if ((this.patchedDeps !== true)) {
            this.patchedDeps = true;
            ngBackPatch__lib1_src_module_Lib1Module();
          }
          …
        }
      };
    `;

    const lib2_module_factory = `
      export const Lib2ModuleNgFactory: $any$ = {
        moduleType: $i2$.Lib2Module,
        create: function Lib2ModuleNgFactory_Create(parentInjector: $any$) {
          if ((this.patchedDeps !== true)) {
            this.patchedDeps = true;
            ngBackPatch__lib2_src_module_Lib2Module();
          }
          …
        }
      };
    `;

    // TODO(chuckj): What should we do with the bootstrap components?
    const app_module_factory = `
      export const AppModuleNgFactory: $any$ = {
        moduleType: AppModule,
        create: function AppModuleNgFactory_Create(parentInjector: $any$) {
          if ((this.patchedDeps !== true)) {
            this.patchedDeps = true;
            ngBackPatch__app_src_app_AppModule();
          }
          …
        }
      };
    `;

    const context = mergeMaps(emitLibrary(angularFiles, libraries), angularFiles);

    const result = createFactories(app, context);

    expectEmit(result.source, lib1_module_factory, 'Invalid module factory for lib1');
    expectEmit(result.source, lib2_module_factory, 'Invalid module factory for lib2');
    expectEmit(result.source, app_module_factory, 'Invalid module factory for app');
  });
});