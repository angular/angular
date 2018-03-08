
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MockDirectory, emitLibrary, mergeMaps, setup} from '../aot/test_util';

import {backPatch, expectEmit} from './mock_compile';

describe('r3_back_patch_compiler', () => {
  const angularFiles = setup({
    compileAngular: true,
    compileAnimations: false,
    compileCommon: true,
  });

  it('should back-patch a component in a library', () => {
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
          'pipe.ts': `
            import {Pipe} from '@angular/core';

            @Pipe({name: 'lib1Pipe', pure: true})
            export class Lib1Pipe {
              transform(v: any) { return v; }
            }
          `,
          'module.ts': `
            import {NgModule} from '@angular/core';

            import {Lib1Component} from './component';
            import {Lib1Directive} from './directive';
            import {Lib1Service} from './service';
            import {Lib1Pipe} from './pipe';

            @NgModule({
              exports: [Lib1Component, Lib1Directive, Lib1Pipe],
              declarations: [Lib1Component, Lib1Directive, Lib1Pipe],
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
          'pipe.ts': `
            import {Pipe} from '@angular/core';

            @Pipe({name: 'lib2Pipe', pure: true})
            export class Lib2Pipe {
              transform(v: any) { return v; }
            }
          `,
          'module.ts': `
            import {NgModule} from '@angular/core';

            import {Lib1Module} from '../../lib1/src/module';
            import {Lib2Component} from './component';
            import {Lib2Directive} from './directive';
            import {Lib2Service} from './service';
            import {Lib2Pipe} from './pipe';

            @NgModule({
              imports: [Lib1Module],
              exports: [Lib2Component, Lib2Directive, Lib2Pipe],
              declarations: [Lib2Component, Lib2Directive, Lib2Pipe],
              providers: [Lib2Service]
            })
            export class Lib2Module {}
          `
        }
      },
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
                <lib1-cmp lib2-dir>{{'v' | lib1Pipe | lib2Pipe}}</lib1-cmp>
                <lib2-cmp lib1-dir>{{'v' | lib2Pipe | lib2Pipe}}</lib2-cmp>
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
              declarations: [AppComponent]
            })
            export class AppModule {
            }
          `
        }
      }
    };

    const lib1_module_back_patch = `
      export function ngBackPatch__lib1_src_module_Lib1Module() {
        // @__BUILD_OPTIMIZER_COLOCATE__
        $lib1_c$.Lib1Component.ngComponentDef = $r3$.ɵdefineComponent(…);

        // @__BUILD_OPTIMIZER_COLOCATE__
        $lib1_d$.Lib1Directive.ngDirectiveDef = $r3$.ɵdefineDirective(…);

        // @__BUILD_OPTIMIZER_COLOCATE__
        $lib1_p$.Lib1Pipe.ngPipeDef = $r3$.ɵdefinePipe(…);
      }
    `;

    const lib2_module_back_patch = `
      export function ngBackPatch__lib2_src_module_Lib2Module() {
        // @__BUILD_OPTIMIZER_REMOVE__
        ngBackPatch__lib1_src_module_Lib1Module();

        // @__BUILD_OPTIMIZER_COLOCATE__
        $lib2_c$.Lib2Component.ngComponentDef = $r3$.ɵdefineComponent(…);

        // @__BUILD_OPTIMIZER_COLOCATE__
        $lib2_d$.Lib2Directive.ngDirectiveDef = $r3$.ɵdefineDirective(…);

        // @__BUILD_OPTIMIZER_COLOCATE__
        $lib1_p$.Lib2Pipe.ngPipeDef = $r3$.ɵdefinePipe(…);
      }
    `;

    const app_module_back_patch = `
      export function ngBackPatch__app_src_app_AppModule() {
        // @__BUILD_OPTIMIZER_REMOVE__
        ngBackPatch__lib1_src_module_Lib1Module();
        // @__BUILD_OPTIMIZER_REMOVE__
        ngBackPatch__lib2_src_module_Lib2Module();
      }
    `;

    const context = mergeMaps(emitLibrary(angularFiles, libraries), angularFiles);

    const result = backPatch(app, context);

    expectEmit(result.source, lib1_module_back_patch, 'Invalid lib1 back-patch');
    expectEmit(result.source, lib2_module_back_patch, 'Invalid lib2 back-patch');
    expectEmit(result.source, app_module_back_patch, 'Invalid app module back-patch');
  });

});
