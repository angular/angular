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

const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('ngtsc incremental compilation', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.enableMultipleCompilations();
      env.tsconfig();
    });

    it('should not crash if CLI does not provide getModifiedResourceFiles()', () => {
      env.write(
        'component1.ts',
        `
      import {Component} from '@angular/core';

      @Component({selector: 'cmp', templateUrl: './component1.template.html'})
      export class Cmp1 {}
    `,
      );
      env.write('component1.template.html', 'cmp1');
      env.driveMain();

      // Simulate a change to `component1.html`
      env.flushWrittenFileTracking();
      env.invalidateCachedFile('component1.html');
      env.simulateLegacyCLICompilerHost();
      env.driveMain();
    });

    it('should skip unchanged services', () => {
      env.write(
        'service.ts',
        `
      import {Injectable} from '@angular/core';

      @Injectable()
      export class Service {}
    `,
      );
      env.write(
        'test.ts',
        `
      import {Component} from '@angular/core';
      import {Service} from './service';

      @Component({selector: 'cmp', template: 'cmp'})
      export class Cmp {
        constructor(service: Service) {}
      }
    `,
      );
      env.driveMain();
      env.flushWrittenFileTracking();

      // Pretend a change was made to test.ts.
      env.invalidateCachedFile('test.ts');
      env.driveMain();
      const written = env.getFilesWrittenSinceLastFlush();

      // The changed file should be recompiled, but not the service.
      expect(written).toContain('/test.js');
      expect(written).not.toContain('/service.js');
    });

    it('should rebuild components that have changed', () => {
      env.tsconfig({strictTemplates: true});
      env.write(
        'component1.ts',
        `
      import {Component} from '@angular/core';

      @Component({selector: 'cmp', template: 'cmp'})
      export class Cmp1 {}
    `,
      );
      env.write(
        'component2.ts',
        `
      import {Component} from '@angular/core';

      @Component({selector: 'cmp2', template: 'cmp'})
      export class Cmp2 {}
    `,
      );
      env.driveMain();

      // Pretend a change was made to Cmp1
      env.flushWrittenFileTracking();
      env.invalidateCachedFile('component1.ts');
      env.driveMain();
      const written = env.getFilesWrittenSinceLastFlush();
      expect(written).toContain('/component1.js');
      expect(written).not.toContain('/component2.js');
    });

    it('should rebuild components whose templates have changed', () => {
      env.write(
        'component1.ts',
        `
      import {Component} from '@angular/core';

      @Component({selector: 'cmp', templateUrl: './component1.template.html'})
      export class Cmp1 {}
    `,
      );
      env.write('component1.template.html', 'cmp1');
      env.write(
        'component2.ts',
        `
      import {Component} from '@angular/core';

      @Component({selector: 'cmp2', templateUrl: './component2.template.html'})
      export class Cmp2 {}
    `,
      );
      env.write('component2.template.html', 'cmp2');

      env.driveMain();

      // Make a change to Cmp1 template
      env.flushWrittenFileTracking();
      env.write('component1.template.html', 'changed');
      env.driveMain();
      const written = env.getFilesWrittenSinceLastFlush();
      expect(written).toContain('/component1.js');
      expect(written).not.toContain('/component2.js');
    });

    it('should rebuild components whose partial-evaluation dependencies have changed', () => {
      env.write(
        'component1.ts',
        `
      import {Component} from '@angular/core';

      @Component({selector: 'cmp', template: 'cmp'})
      export class Cmp1 {}
    `,
      );
      env.write(
        'component2.ts',
        `
      import {Component} from '@angular/core';
      import {SELECTOR} from './constants';

      @Component({selector: SELECTOR, template: 'cmp'})
      export class Cmp2 {}
    `,
      );
      env.write(
        'constants.ts',
        `
      export const SELECTOR = 'cmp';
    `,
      );
      env.driveMain();

      // Pretend a change was made to SELECTOR
      env.flushWrittenFileTracking();
      env.invalidateCachedFile('constants.ts');
      env.driveMain();
      const written = env.getFilesWrittenSinceLastFlush();
      expect(written).toContain('/constants.js');
      expect(written).not.toContain('/component1.js');
      expect(written).toContain('/component2.js');
    });

    it('should rebuild components whose imported dependencies have changed', () => {
      setupFooBarProgram(env);

      // Pretend a change was made to BarDir.
      env.write(
        'bar_directive.ts',
        `
        import {Directive} from '@angular/core';

        @Directive({
          selector: '[barr]',
          standalone: false,
        })
        export class BarDir {}
      `,
      );
      env.driveMain();

      let written = env.getFilesWrittenSinceLastFlush();
      expect(written).toContain('/bar_directive.js');
      expect(written).toContain('/bar_component.js');
      expect(written).toContain('/bar_module.js');
      expect(written).not.toContain('/foo_component.js'); // BarDir is not exported by BarModule,
      // so upstream NgModule is not affected
      expect(written).not.toContain('/foo_pipe.js');
      expect(written).not.toContain('/foo_module.js');
    });

    // https://github.com/angular/angular/issues/32416
    it('should rebuild full NgModule scope when a dependency of a declaration has changed', () => {
      env.write(
        'component1.ts',
        `
        import {Component} from '@angular/core';
        import {SELECTOR} from './dep';

        @Component({
          selector: SELECTOR, 
          template: 'cmp',
          standalone: false,
        })
        export class Cmp1 {}
      `,
      );
      env.write(
        'component2.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'cmp2', 
          template: '<cmp></cmp>',
          standalone: false,  
        })
        export class Cmp2 {}
      `,
      );
      env.write(
        'dep.ts',
        `
        export const SELECTOR = 'cmp';
      `,
      );
      env.write(
        'directive.ts',
        `
        import {Directive} from '@angular/core';

        @Directive({
          selector: 'dir',
          standalone: false,
        })
        export class Dir {}
      `,
      );
      env.write(
        'pipe.ts',
        `
        import {Pipe} from '@angular/core';

        @Pipe({
          name: 'myPipe',
          standalone: false,
        })
        export class MyPipe {
          transform() {}
        }
      `,
      );
      env.write(
        'module.ts',
        `
        import {NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
        import {Cmp1} from './component1';
        import {Cmp2} from './component2';
        import {Dir} from './directive';
        import {MyPipe} from './pipe';

        @NgModule({declarations: [Cmp1, Cmp2, Dir, MyPipe], schemas: [NO_ERRORS_SCHEMA]})
        export class Mod {}
      `,
      );
      env.driveMain();

      // Pretend a change was made to 'dep'. Since the selector is updated this affects the NgModule
      // scope, so all components in the module scope need to be recompiled.
      env.flushWrittenFileTracking();
      env.write(
        'dep.ts',
        `
        export const SELECTOR = 'cmp_updated';
      `,
      );
      env.driveMain();
      const written = env.getFilesWrittenSinceLastFlush();
      expect(written).not.toContain('/directive.js');
      expect(written).not.toContain('/pipe.js');
      expect(written).not.toContain('/module.js');
      expect(written).toContain('/component1.js');
      expect(written).toContain('/component2.js');
      expect(written).toContain('/dep.js');
    });

    it('should rebuild components where their NgModule declared dependencies have changed', () => {
      setupFooBarProgram(env);

      // Rename the pipe so components that use it need to be recompiled.
      env.write(
        'foo_pipe.ts',
        `
        import {Pipe} from '@angular/core';

        @Pipe({name: 'foo_changed', standalone: false})
        export class FooPipe {
          transform() {}
        }
      `,
      );
      env.driveMain();
      const written = env.getFilesWrittenSinceLastFlush();
      expect(written).not.toContain('/bar_directive.js');
      expect(written).not.toContain('/bar_component.js');
      expect(written).not.toContain('/bar_module.js');
      expect(written).toContain('/foo_component.js');
      expect(written).toContain('/foo_pipe.js');
      expect(written).toContain('/foo_module.js');
    });

    it('should rebuild components where their NgModule has changed', () => {
      setupFooBarProgram(env);

      // Pretend a change was made to FooModule.
      env.write(
        'foo_module.ts',
        `
        import {NgModule} from '@angular/core';
        import {FooCmp} from './foo_component';
        import {FooPipe} from './foo_pipe';
        import {BarModule} from './bar_module';
        @NgModule({
          declarations: [FooCmp], // removed FooPipe
          imports: [BarModule],
        })
        export class FooModule {}
      `,
      );
      env.driveMain();
      const written = env.getFilesWrittenSinceLastFlush();
      expect(written).not.toContain('/bar_directive.js');
      expect(written).not.toContain('/bar_component.js');
      expect(written).not.toContain('/bar_module.js');
      expect(written).not.toContain('/foo_pipe.js');
      expect(written).toContain('/foo_component.js');
      expect(written).toContain('/foo_module.js');
    });

    it('should rebuild a component if one of its deep NgModule dependencies changes', () => {
      // This test constructs a chain of NgModules:
      // - EntryModule imports MiddleAModule
      // - MiddleAModule exports MiddleBModule
      // - MiddleBModule exports DirModule
      // The last link (MiddleBModule exports DirModule) is not present initially, but is added
      // during a recompilation.
      //
      // Since the dependency from EntryModule on the contents of MiddleBModule is not "direct"
      // (meaning MiddleBModule is not discovered during analysis of EntryModule), this test is
      // verifying that NgModule dependency tracking correctly accounts for this situation.
      env.write(
        'entry.ts',
        `
        import {Component, NgModule} from '@angular/core';
        import {MiddleAModule} from './middle-a';

        @Component({
          selector: 'test-cmp',
          template: '<div dir>',
          standalone: false,
        })
        export class TestCmp {}

        @NgModule({
          declarations: [TestCmp],
          imports: [MiddleAModule],
        })
        export class EntryModule {}
      `,
      );
      env.write(
        'middle-a.ts',
        `
        import {NgModule} from '@angular/core';
        import {MiddleBModule} from './middle-b';

        @NgModule({
          exports: [MiddleBModule],
        })
        export class MiddleAModule {}
      `,
      );
      env.write(
        'middle-b.ts',
        `
        import {NgModule} from '@angular/core';

        @NgModule({})
        export class MiddleBModule {}
      `,
      );
      env.write(
        'dir_module.ts',
        `
        import {NgModule} from '@angular/core';
        import {Dir} from './dir';

        @NgModule({
          declarations: [Dir],
          exports: [Dir],
        })
        export class DirModule {}
      `,
      );
      env.write(
        'dir.ts',
        `
        import {Directive} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: false,
        })
        export class Dir {}
      `,
      );

      env.driveMain();
      expect(env.getContents('entry.js')).not.toContain('Dir');

      env.write(
        'middle-b.ts',
        `
        import {NgModule} from '@angular/core';
        import {DirModule} from './dir_module';

        @NgModule({
          exports: [DirModule],
        })
        export class MiddleBModule {}
      `,
      );

      env.driveMain();
      expect(env.getContents('entry.js')).toContain('Dir');
    });

    it('should rebuild a component if removed from an NgModule', () => {
      // This test consists of a component with a dependency (the directive DepDir) provided via an
      // NgModule. Initially this configuration is built, then the component is removed from its
      // module (which removes DepDir from the component's scope) and a rebuild is performed.
      // The compiler should re-emit the component without DepDir in its scope.
      //
      // This is a tricky scenario due to the backwards dependency arrow from a component to its
      // module.
      env.write(
        'dep.ts',
        `
        import {Directive, NgModule} from '@angular/core';

        @Directive({
          selector: '[dep]',
          standalone: false,
        })
        export class DepDir {}

        @NgModule({
          declarations: [DepDir],
          exports: [DepDir],
        })
        export class DepModule {}
      `,
      );

      env.write(
        'cmp.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: '<div dep></div>',
          standalone: false,
        })
        export class Cmp {}
      `,
      );

      env.write(
        'module.ts',
        `
        import {NgModule} from '@angular/core';
        import {Cmp} from './cmp';
        import {DepModule} from './dep';

        @NgModule({
          declarations: [Cmp],
          imports: [DepModule],
        })
        export class Module {}
      `,
      );

      env.driveMain();
      env.flushWrittenFileTracking();

      // Remove the component from the module and recompile.
      env.write(
        'module.ts',
        `
        import {NgModule} from '@angular/core';
        import {DepModule} from './dep';

        @NgModule({
          declarations: [],
          imports: [DepModule],
        })
        export class Module {}
      `,
      );

      env.driveMain();

      // After removing the component from the module, it should have been re-emitted without DepDir
      // in its scope.
      expect(env.getFilesWrittenSinceLastFlush()).toContain('/cmp.js');
      expect(env.getContents('cmp.js')).not.toContain('DepDir');
    });

    it('should rebuild only a Component (but with the correct CompilationScope) if its template has changed', () => {
      setupFooBarProgram(env);

      // Make a change to the template of BarComponent.
      env.write('bar_component.html', '<div bar>changed</div>');

      env.driveMain();
      const written = env.getFilesWrittenSinceLastFlush();
      expect(written).not.toContain('/bar_directive.js');
      expect(written).toContain('/bar_component.js');
      expect(written).not.toContain('/bar_module.js');
      expect(written).not.toContain('/foo_component.js');
      expect(written).not.toContain('/foo_pipe.js');
      expect(written).not.toContain('/foo_module.js');
      // Ensure that the used directives are included in the component's generated template.
      expect(env.getContents('/built/bar_component.js')).toMatch(/dependencies:\s*\[.+\.BarDir\]/);
    });

    it('should rebuild everything if a typings file changes', () => {
      setupFooBarProgram(env);

      // Pretend a change was made to a typings file.
      env.invalidateCachedFile('foo_selector.d.ts');
      env.driveMain();
      const written = env.getFilesWrittenSinceLastFlush();
      expect(written).toContain('/bar_directive.js');
      expect(written).toContain('/bar_component.js');
      expect(written).toContain('/bar_module.js');
      expect(written).toContain('/foo_component.js');
      expect(written).toContain('/foo_pipe.js');
      expect(written).toContain('/foo_module.js');
    });

    it('should re-emit an NgModule when the provider status of its imports changes', () => {
      env.write(
        'provider-dep.ts',
        `
        import {Injectable, NgModule} from '@angular/core';

        @Injectable()
        export class Service {}

        @NgModule({
          providers: [Service],
        })
        export class DepModule {}
      `,
      );
      env.write(
        'standalone-cmp.ts',
        `
        import {Component} from '@angular/core';
        import {DepModule} from './provider-dep';

        @Component({
          standalone: true,
          template: '',
          imports: [DepModule],
        })
        export class Cmp {}
      `,
      );
      env.write(
        'module.ts',
        `
        import {NgModule} from '@angular/core';
        import {Cmp} from './standalone-cmp';

        @NgModule({
          imports: [Cmp],
        })
        export class Module {}
      `,
      );

      env.driveMain();

      env.write(
        'provider-dep.ts',
        `
        import {Injectable, NgModule} from '@angular/core';

        @NgModule({})
        export class DepModule {}
      `,
      );

      env.flushWrittenFileTracking();
      env.driveMain();
      const written = env.getFilesWrittenSinceLastFlush();
      expect(written).toContain('/module.js');
    });

    it('should compile incrementally with template type-checking turned on', () => {
      env.tsconfig({fullTemplateTypeCheck: true});
      env.write(
        'main.ts',
        `
        import {Component} from '@angular/core';

        @Component({template: ''})
        export class MyComponent {}
      `,
      );
      env.driveMain();
      env.invalidateCachedFile('main.ts');
      env.driveMain();
      // If program reuse were configured incorrectly (as was responsible for
      // https://github.com/angular/angular/issues/30079), this would have crashed.
    });

    // https://github.com/angular/angular/issues/38979
    it('should retain ambient types provided by auto-discovered @types', () => {
      // This test verifies that ambient types declared in node_modules/@types are still available
      // in incremental compilations. In the below code, the usage of `require` should be valid
      // in the original program and the incremental program.
      env.tsconfig({fullTemplateTypeCheck: true});
      env.write('node_modules/@types/node/index.d.ts', 'declare var require: any;');
      env.write(
        'main.ts',
        `
        import {Component} from '@angular/core';

        require('path');

        @Component({template: ''})
        export class MyComponent {}
      `,
      );
      env.driveMain();
      env.invalidateCachedFile('main.ts');
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    // https://github.com/angular/angular/pull/26036
    it('should handle redirected source files', () => {
      env.tsconfig({fullTemplateTypeCheck: true});

      // This file structure has an identical version of "a" under the root node_modules and inside
      // of "b". Because their package.json file indicates it is the exact same version of "a",
      // TypeScript will transform the source file of "node_modules/b/node_modules/a/index.d.ts"
      // into a redirect to "node_modules/a/index.d.ts". During incremental compilations, we must
      // assure not to reintroduce "node_modules/b/node_modules/a/index.d.ts" as its redirected
      // source file, but instead use its original file.
      env.write('node_modules/a/index.js', `export class ServiceA {}`);
      env.write('node_modules/a/index.d.ts', `export declare class ServiceA {}`);
      env.write('node_modules/a/package.json', `{"name": "a", "version": "1.0"}`);
      env.write('node_modules/b/node_modules/a/index.js', `export class ServiceA {}`);
      env.write('node_modules/b/node_modules/a/index.d.ts', `export declare class ServiceA {}`);
      env.write('node_modules/b/node_modules/a/package.json', `{"name": "a", "version": "1.0"}`);
      env.write('node_modules/b/index.js', `export {ServiceA as ServiceB} from 'a';`);
      env.write('node_modules/b/index.d.ts', `export {ServiceA as ServiceB} from 'a';`);
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';
        import {ServiceA} from 'a';
        import {ServiceB} from 'b';

        @Component({template: ''})
        export class MyComponent {}
      `,
      );
      env.driveMain();
      env.flushWrittenFileTracking();

      // Pretend a change was made to test.ts. If redirect sources were introduced into the new
      // program, this would fail due to an assertion failure in TS.
      env.invalidateCachedFile('test.ts');
      env.driveMain();
    });

    it('should allow incremental compilation with redirected source files', () => {
      env.tsconfig({fullTemplateTypeCheck: true});

      // This file structure has an identical version of "a" under the root node_modules and inside
      // of "b". Because their package.json file indicates it is the exact same version of "a",
      // TypeScript will transform the source file of "node_modules/b/node_modules/a/index.d.ts"
      // into a redirect to "node_modules/a/index.d.ts". During incremental compilations, the
      // redirected "node_modules/b/node_modules/a/index.d.ts" source file should be considered as
      // its unredirected source file to avoid a change in declaration files.
      env.write('node_modules/a/index.js', `export class ServiceA {}`);
      env.write('node_modules/a/index.d.ts', `export declare class ServiceA {}`);
      env.write('node_modules/a/package.json', `{"name": "a", "version": "1.0"}`);
      env.write('node_modules/b/node_modules/a/index.js', `export class ServiceA {}`);
      env.write('node_modules/b/node_modules/a/index.d.ts', `export declare class ServiceA {}`);
      env.write('node_modules/b/node_modules/a/package.json', `{"name": "a", "version": "1.0"}`);
      env.write('node_modules/b/index.js', `export {ServiceA as ServiceB} from 'a';`);
      env.write('node_modules/b/index.d.ts', `export {ServiceA as ServiceB} from 'a';`);
      env.write(
        'component1.ts',
        `
        import {Component} from '@angular/core';
        import {ServiceA} from 'a';
        import {ServiceB} from 'b';

        @Component({selector: 'cmp', template: 'cmp'})
        export class Cmp1 {}
      `,
      );
      env.write(
        'component2.ts',
        `
        import {Component} from '@angular/core';
        import {ServiceA} from 'a';
        import {ServiceB} from 'b';

        @Component({selector: 'cmp2', template: 'cmp'})
        export class Cmp2 {}
      `,
      );
      env.driveMain();
      env.flushWrittenFileTracking();

      // Now update `component1.ts` and change its imports to avoid complete structure reuse, which
      // forces recreation of source file redirects.
      env.write(
        'component1.ts',
        `
        import {Component} from '@angular/core';
        import {ServiceA} from 'a';

        @Component({selector: 'cmp', template: 'cmp'})
        export class Cmp1 {}
      `,
      );
      env.driveMain();

      const written = env.getFilesWrittenSinceLastFlush();
      expect(written).toContain('/component1.js');
      expect(written).not.toContain('/component2.js');
    });

    describe('template type-checking', () => {
      beforeEach(() => {
        env.tsconfig({strictTemplates: true});
      });

      it('should repeat type errors across rebuilds, even if nothing has changed', () => {
        // This test verifies that when a project is rebuilt multiple times with no changes, all
        // template diagnostics are produced each time. Different types of errors are checked:
        // - a general type error
        // - an unmatched binding
        // - a DOM schema error
        env.write(
          'component.ts',
          `
          import {Component} from '@angular/core';
          @Component({
            selector: 'test-cmp',
            template: \`
              {{notAProperty}}
              <not-a-component></not-a-component>
              <div [notMatched]="1"></div>
            \`,
          })
          export class TestCmp {}
        `,
        );

        let diags = env.driveDiagnostics();
        // Should get a diagnostic for each line in the template.
        expect(diags.length).toBe(3);

        // Now rebuild without any changes, and verify they're still produced.
        diags = env.driveDiagnostics();
        expect(diags.length).toBe(3);

        // If it's worth testing, it's worth overtesting.
        //
        // Actually, the above only tests the transition from "initial" to "incremental"
        // compilation. The next build verifies that an "incremental to incremental" transition
        // preserves the diagnostics as well.
        diags = env.driveDiagnostics();
        expect(diags.length).toBe(3);
      });

      it('should pick up errors caused by changing an unrelated interface', () => {
        // The premise of this test is that `iface.ts` declares an interface which is used to type
        // a property of a component. The interface is then changed in a subsequent compilation in
        // a way that introduces a type error in the template. The test verifies the resulting
        // diagnostic is produced.
        env.write(
          'iface.ts',
          `
          export interface SomeType {
            field: string;
          }
        `,
        );
        env.write(
          'component.ts',
          `
          import {Component} from '@angular/core';
          import {SomeType} from './iface';

          @Component({
            selector: 'test-cmp',
            template: '{{ doSomething(value.field) }}',
          })
          export class TestCmp {
            value!: SomeType;
            // Takes a string value only.
            doSomething(param: string): string {
              return param;
            }
          }
        `,
        );

        expect(env.driveDiagnostics().length).toBe(0);
        env.flushWrittenFileTracking();

        // Change the interface.
        env.write(
          'iface.ts',
          `
          export interface SomeType {
            field: number;
          }
        `,
        );

        expect(env.driveDiagnostics().length).toBe(1);
      });

      it('should retain default imports that have been converted into a value expression', () => {
        // This test defines the component `TestCmp` that has a default-imported class as
        // constructor parameter, and uses `TestDir` in its template. An incremental compilation
        // updates `TestDir` and changes its inputs, thereby triggering re-emit of `TestCmp` without
        // performing re-analysis of `TestCmp`. The output of the re-emitted file for `TestCmp`
        // should continue to have retained the default import.
        env.write(
          'service.ts',
          `
          import {Injectable} from '@angular/core';

          @Injectable({ providedIn: 'root' })
          export default class DefaultService {}
        `,
        );
        env.write(
          'cmp.ts',
          `
          import {Component, Directive} from '@angular/core';
          import DefaultService from './service';

          @Component({
            template: '<div dir></div>',
            standalone: false,
          })
          export class TestCmp {
            constructor(service: DefaultService) {}
          }
        `,
        );
        env.write(
          'dir.ts',
          `
          import {Directive} from '@angular/core';

          @Directive({ 
            selector: '[dir]',
            standalone: false,
          })
          export class TestDir {}
        `,
        );
        env.write(
          'mod.ts',
          `
          import {NgModule} from '@angular/core';
          import {TestDir} from './dir';
          import {TestCmp} from './cmp';

          @NgModule({ declarations: [TestDir, TestCmp] })
          export class TestMod {}
        `,
        );

        env.driveMain();
        env.flushWrittenFileTracking();

        // Update `TestDir` to change its inputs, triggering a re-emit of `TestCmp` that uses
        // `TestDir`.
        env.write(
          'dir.ts',
          `
          import {Directive} from '@angular/core';

          @Directive({ 
            selector: '[dir]', 
            inputs: ['added'],
            standalone: false,
          })
          export class TestDir {}
        `,
        );
        env.driveMain();

        // Verify that `TestCmp` was indeed re-emitted.
        const written = env.getFilesWrittenSinceLastFlush();
        expect(written).toContain('/dir.js');
        expect(written).toContain('/cmp.js');

        // Verify that the default import is still present.
        const content = env.getContents('cmp.js');
        expect(content).toContain(`import DefaultService from './service';`);
      });

      it('should recompile when a remote change happens to a scope', () => {
        // The premise of this test is that the component Cmp has a template error (a binding to an
        // unknown property). Cmp is in ModuleA, which imports ModuleB, which declares Dir that has
        // the property. Because ModuleB doesn't export Dir, it's not visible to Cmp - hence the
        // error.
        // In the test, during the incremental rebuild Dir is exported from ModuleB. This is a
        // change to the scope of ModuleA made by changing ModuleB (hence, a "remote change"). The
        // test verifies that incremental template type-checking.
        env.write(
          'cmp.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '<div dir [someInput]="1"></div>',
            standalone: false,
          })
          export class Cmp {}
        `,
        );
        env.write(
          'module-a.ts',
          `
          import {NgModule} from '@angular/core';
          import {Cmp} from './cmp';
          import {ModuleB} from './module-b';

          @NgModule({
            declarations: [Cmp],
            imports: [ModuleB],
          })
          export class ModuleA {}
        `,
        );

        // Declare ModuleB and a directive Dir, but ModuleB does not yet export Dir.
        env.write(
          'module-b.ts',
          `
          import {NgModule} from '@angular/core';
          import {Dir} from './dir';

          @NgModule({
            declarations: [Dir],
          })
          export class ModuleB {}
        `,
        );
        env.write(
          'dir.ts',
          `
          import {Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dir]',
            standalone: false,
          })
          export class Dir {
            @Input() someInput!: any;
          }
        `,
        );

        let diags = env.driveDiagnostics();
        // Should get a diagnostic about [dir] not being a valid binding.
        expect(diags.length).toBe(1);

        // As a precautionary check, run the build a second time with no changes, to ensure the
        // diagnostic is repeated.
        diags = env.driveDiagnostics();
        // Should get a diagnostic about [dir] not being a valid binding.
        expect(diags.length).toBe(1);

        // Modify ModuleB to now export Dir.
        env.write(
          'module-b.ts',
          `
          import {NgModule} from '@angular/core';
          import {Dir} from './dir';

          @NgModule({
            declarations: [Dir],
            exports: [Dir],
          })
          export class ModuleB {}
        `,
        );

        diags = env.driveDiagnostics();
        // Diagnostic should be gone, as the error has been fixed.
        expect(diags.length).toBe(0);
      });

      describe('inline operations', () => {
        it('should still pick up on errors from inlined type check blocks', () => {
          // In certain cases the template type-checker has to inline type checking blocks into user
          // code, instead of placing it in a parallel template type-checking file. In these cases
          // incremental checking cannot be used, and the type-checking code must be regenerated on
          // each build. This test verifies that the above mechanism works properly, by performing
          // type-checking on an unexported class (not exporting the class forces the inline
          // checking de-optimization).
          env.write(
            'cmp.ts',
            `
            import {Component} from '@angular/core';

            @Component({
              selector: 'test-cmp',
              template: '{{test}}',
            })
            class Cmp {}
          `,
          );

          // On the first compilation, an error should be produced.
          let diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);

          // Next, two more builds are run, one with no changes made to the file, and the other with
          // changes made that should remove the error.

          // The error should still be present when rebuilding.
          diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);

          // Now, correct the error by adding the 'test' property to the component.
          env.write(
            'cmp.ts',
            `
            import {Component} from '@angular/core';

            @Component({
              selector: 'test-cmp',
              template: '{{test}}',
            })
            class Cmp {
              test!: string;
            }
          `,
          );

          env.driveMain();

          // The error should be gone.
          diags = env.driveDiagnostics();
          expect(diags.length).toBe(0);
        });

        it('should still pick up on errors caused by inlined type constructors', () => {
          // In certain cases the template type-checker cannot generate a type constructor for a
          // directive within the template type-checking file which requires it, but must inline the
          // type constructor within its original source file. In these cases, template type
          // checking cannot be performed incrementally. This test verifies that such cases still
          // work correctly, by repeatedly performing diagnostics on a component which depends on a
          // directive with an inlined type constructor.
          env.write(
            'dir.ts',
            `
            import {Directive, Input} from '@angular/core';
            export interface Keys {
              alpha: string;
              beta: string;
            }
            @Directive({
              selector: '[dir]',
              standalone: false,
            })
            export class Dir<T extends keyof Keys> {
              // The use of 'keyof' in the generic bound causes a deopt to an inline type
              // constructor.
              @Input() dir: T;
            }
          `,
          );

          env.write(
            'cmp.ts',
            `
            import {Component, NgModule} from '@angular/core';
            import {Dir} from './dir';
            @Component({
              selector: 'test-cmp',
              template: '<div dir="gamma"></div>',
              standalone: false,
            })
            export class Cmp {}
            @NgModule({
              declarations: [Cmp, Dir],
            })
            export class Module {}
          `,
          );

          let diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(diags[0].messageText).toContain(
            `Type '"gamma"' is not assignable to type 'keyof Keys'.`,
          );

          // On a rebuild, the same errors should be present.
          diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(diags[0].messageText).toContain(
            `Type '"gamma"' is not assignable to type 'keyof Keys'.`,
          );
        });

        it('should not re-emit files that need inline type constructors', () => {
          // Setup a directive that requires an inline type constructor, as it has a generic type
          // parameter that refer an interface that has not been exported. The inline operation
          // causes an updated dir.ts to be used in the type-check program, which should not
          // confuse the incremental engine in undesirably considering dir.ts as affected in
          // incremental rebuilds.
          env.write(
            'dir.ts',
            `
            import {Directive, Input} from '@angular/core';
            interface Keys {
              alpha: string;
              beta: string;
            }
            @Directive({
              selector: '[dir]',
              standalone: false,
            })
            export class Dir<T extends keyof Keys> {
              @Input() dir: T;
            }
          `,
          );

          env.write(
            'cmp.ts',
            `
            import {Component, NgModule} from '@angular/core';
            import {Dir} from './dir';
            @Component({
              selector: 'test-cmp',
              template: '<div dir="alpha"></div>',
              standalone: false,
            })
            export class Cmp {}
            @NgModule({
              declarations: [Cmp, Dir],
            })
            export class Module {}
          `,
          );
          env.driveMain();

          // Trigger a recompile by changing cmp.ts.
          env.invalidateCachedFile('cmp.ts');

          env.flushWrittenFileTracking();
          env.driveMain();

          // Verify that only cmp.ts was emitted, but not dir.ts as it was not affected.
          const written = env.getFilesWrittenSinceLastFlush();
          expect(written).toContain('/cmp.js');
          expect(written).not.toContain('/dir.js');
        });
      });
    });

    describe('missing resource files', () => {
      it('should re-analyze a component if a template file becomes available later', () => {
        env.write(
          'app.ts',
          `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app',
          templateUrl: './some-template.html',
        })
        export class AppComponent {}
      `,
        );

        const firstDiagnostics = env.driveDiagnostics();
        expect(firstDiagnostics.length).toBe(1);
        expect(firstDiagnostics[0].code).toBe(ngErrorCode(ErrorCode.COMPONENT_RESOURCE_NOT_FOUND));

        env.write(
          'some-template.html',
          `
          <span>Test</span>
        `,
        );

        env.driveMain();
      });

      it('should re-analyze if component style file becomes available later', () => {
        env.write(
          'app.ts',
          `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app',
          template: 'Works',
          styleUrls: ['./some-style.css'],
        })
        export class AppComponent {}
      `,
        );

        const firstDiagnostics = env.driveDiagnostics();
        expect(firstDiagnostics.length).toBe(1);
        expect(firstDiagnostics[0].code).toBe(ngErrorCode(ErrorCode.COMPONENT_RESOURCE_NOT_FOUND));

        env.write('some-style.css', `body {}`);
        env.driveMain();
      });
    });
  });

  function setupFooBarProgram(env: NgtscTestEnvironment) {
    env.write(
      'foo_component.ts',
      `
    import {Component} from '@angular/core';
    import {fooSelector} from './foo_selector';

    @Component({
      selector: fooSelector,
      template: '{{ 1 | foo }}',
      standalone: false,
    })
    export class FooCmp {}
  `,
    );
    env.write(
      'foo_pipe.ts',
      `
    import {Pipe} from '@angular/core';

    @Pipe({
      name: 'foo',
      standalone: false,
    })
    export class FooPipe {
      transform() {}
    }
  `,
    );
    env.write(
      'foo_module.ts',
      `
    import {NgModule} from '@angular/core';
    import {FooCmp} from './foo_component';
    import {FooPipe} from './foo_pipe';
    import {BarModule} from './bar_module';
    @NgModule({
      declarations: [FooCmp, FooPipe],
      imports: [BarModule],
    })
    export class FooModule {}
  `,
    );
    env.write(
      'bar_component.ts',
      `
    import {Component} from '@angular/core';

    @Component({
      selector: 'bar', 
      templateUrl: './bar_component.html',
      standalone: false,  
    })
    export class BarCmp {}
  `,
    );
    env.write('bar_component.html', '<div bar></div>');
    env.write(
      'bar_directive.ts',
      `
    import {Directive} from '@angular/core';

    @Directive({
      selector: '[bar]',
      standalone: false,
    })
    export class BarDir {}
  `,
    );
    env.write(
      'bar_pipe.ts',
      `
    import {Pipe} from '@angular/core';

    @Pipe({
      name: 'foo',
      standalone: false,
    })
    export class BarPipe {
      transform() {}
    }
  `,
    );
    env.write(
      'bar_module.ts',
      `
    import {NgModule} from '@angular/core';
    import {BarCmp} from './bar_component';
    import {BarDir} from './bar_directive';
    import {BarPipe} from './bar_pipe';
    @NgModule({
      declarations: [BarCmp, BarDir, BarPipe],
      exports: [BarCmp, BarPipe],
    })
    export class BarModule {}
  `,
    );
    env.write(
      'foo_selector.d.ts',
      `
    export const fooSelector = 'foo';
  `,
    );
    env.driveMain();
    env.flushWrittenFileTracking();
  }
});
