/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../helpers/src/mock_file_loading';

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
      env.write('component1.ts', `
      import {Component} from '@angular/core';

      @Component({selector: 'cmp', templateUrl: './component1.template.html'})
      export class Cmp1 {}
    `);
      env.write('component1.template.html', 'cmp1');
      env.driveMain();

      // Simulate a change to `component1.html`
      env.flushWrittenFileTracking();
      env.invalidateCachedFile('component1.html');
      env.simulateLegacyCLICompilerHost();
      env.driveMain();
    });

    it('should skip unchanged services', () => {
      env.write('service.ts', `
      import {Injectable} from '@angular/core';

      @Injectable()
      export class Service {}
    `);
      env.write('test.ts', `
      import {Component} from '@angular/core';
      import {Service} from './service';

      @Component({selector: 'cmp', template: 'cmp'})
      export class Cmp {
        constructor(service: Service) {}
      }
    `);
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
      env.write('component1.ts', `
      import {Component} from '@angular/core';

      @Component({selector: 'cmp', template: 'cmp'})
      export class Cmp1 {}
    `);
      env.write('component2.ts', `
      import {Component} from '@angular/core';

      @Component({selector: 'cmp2', template: 'cmp'})
      export class Cmp2 {}
    `);
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
      env.write('component1.ts', `
      import {Component} from '@angular/core';

      @Component({selector: 'cmp', templateUrl: './component1.template.html'})
      export class Cmp1 {}
    `);
      env.write('component1.template.html', 'cmp1');
      env.write('component2.ts', `
      import {Component} from '@angular/core';

      @Component({selector: 'cmp2', templateUrl: './component2.template.html'})
      export class Cmp2 {}
    `);
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
      env.write('component1.ts', `
      import {Component} from '@angular/core';

      @Component({selector: 'cmp', template: 'cmp'})
      export class Cmp1 {}
    `);
      env.write('component2.ts', `
      import {Component} from '@angular/core';
      import {SELECTOR} from './constants';

      @Component({selector: SELECTOR, template: 'cmp'})
      export class Cmp2 {}
    `);
      env.write('constants.ts', `
      export const SELECTOR = 'cmp';
    `);
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
      env.invalidateCachedFile('bar_directive.ts');
      env.driveMain();

      let written = env.getFilesWrittenSinceLastFlush();
      expect(written).toContain('/bar_directive.js');
      expect(written).toContain('/bar_component.js');
      expect(written).toContain('/bar_module.js');
      expect(written).toContain('/foo_component.js');
      expect(written).not.toContain('/foo_pipe.js');
      expect(written).not.toContain('/foo_module.js');
    });

    // https://github.com/angular/angular/issues/32416
    it('should rebuild full NgModule scope when a dependency of a declaration has changed', () => {
      env.write('component1.ts', `
        import {Component} from '@angular/core';
        import {SELECTOR} from './dep';
  
        @Component({selector: SELECTOR, template: 'cmp'})
        export class Cmp1 {}
      `);
      env.write('component2.ts', `
        import {Component} from '@angular/core';
  
        @Component({selector: 'cmp2', template: 'cmp2'})
        export class Cmp2 {}
      `);
      env.write('dep.ts', `
        export const SELECTOR = 'cmp';
      `);
      env.write('directive.ts', `
        import {Directive} from '@angular/core';
  
        @Directive({selector: 'dir'})
        export class Dir {}
      `);
      env.write('pipe.ts', `
        import {Pipe} from '@angular/core';
  
        @Pipe({name: 'myPipe'})
        export class MyPipe {}
      `);
      env.write('module.ts', `
        import {NgModule} from '@angular/core';
        import {Cmp1} from './component1';
        import {Cmp2} from './component2';
        import {Dir} from './directive';
        import {MyPipe} from './pipe';
  
        @NgModule({declarations: [Cmp1, Cmp2, Dir, MyPipe]})
        export class Mod {}
      `);
      env.driveMain();

      // Pretend a change was made to 'dep'. Since this may affect the NgModule scope, like it does
      // here if the selector is updated, all components in the module scope need to be recompiled.
      env.flushWrittenFileTracking();
      env.invalidateCachedFile('dep.ts');
      env.driveMain();
      const written = env.getFilesWrittenSinceLastFlush();
      expect(written).not.toContain('/directive.js');
      expect(written).not.toContain('/pipe.js');
      expect(written).toContain('/component1.js');
      expect(written).toContain('/component2.js');
      expect(written).toContain('/dep.js');
      expect(written).toContain('/module.js');
    });

    it('should rebuild components where their NgModule declared dependencies have changed', () => {
      setupFooBarProgram(env);

      // Pretend a change was made to FooPipe.
      env.invalidateCachedFile('foo_pipe.ts');
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

      // Pretend a change was made to FooPipe.
      env.invalidateCachedFile('foo_module.ts');
      env.driveMain();
      const written = env.getFilesWrittenSinceLastFlush();
      expect(written).not.toContain('/bar_directive.js');
      expect(written).not.toContain('/bar_component.js');
      expect(written).not.toContain('/bar_module.js');
      expect(written).toContain('/foo_component.js');
      expect(written).toContain('/foo_pipe.js');
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
      env.write('entry.ts', `
        import {Component, NgModule} from '@angular/core';
        import {MiddleAModule} from './middle-a';

        @Component({
          selector: 'test-cmp',
          template: '<div dir>',
        })
        export class TestCmp {}

        @NgModule({
          declarations: [TestCmp],
          imports: [MiddleAModule],
        })
        export class EntryModule {}
      `);
      env.write('middle-a.ts', `
        import {NgModule} from '@angular/core';
        import {MiddleBModule} from './middle-b';

        @NgModule({
          exports: [MiddleBModule],
        })
        export class MiddleAModule {}
      `);
      env.write('middle-b.ts', `
        import {NgModule} from '@angular/core';

        @NgModule({})
        export class MiddleBModule {}
      `);
      env.write('dir_module.ts', `
        import {NgModule} from '@angular/core';
        import {Dir} from './dir';

        @NgModule({
          declarations: [Dir],
          exports: [Dir],
        })
        export class DirModule {}
      `);
      env.write('dir.ts', `
        import {Directive} from '@angular/core';

        @Directive({
          selector: '[dir]',
        })
        export class Dir {}
      `);

      env.driveMain();
      expect(env.getContents('entry.js')).not.toContain('Dir');

      env.write('middle-b.ts', `
        import {NgModule} from '@angular/core';
        import {DirModule} from './dir_module';

        @NgModule({
          exports: [DirModule],
        })
        export class MiddleBModule {}
      `);

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
      env.write('dep.ts', `
        import {Directive, NgModule} from '@angular/core';

        @Directive({selector: '[dep]'})
        export class DepDir {}

        @NgModule({
          declarations: [DepDir],
          exports: [DepDir],
        })
        export class DepModule {}
      `);

      env.write('cmp.ts', `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: '<div dep></div>',
        })
        export class Cmp {}
      `);

      env.write('module.ts', `
        import {NgModule} from '@angular/core';
        import {Cmp} from './cmp';
        import {DepModule} from './dep';

        @NgModule({
          declarations: [Cmp],
          imports: [DepModule],
        })
        export class Module {}
      `);

      env.driveMain();
      env.flushWrittenFileTracking();

      // Remove the component from the module and recompile.
      env.write('module.ts', `
        import {NgModule} from '@angular/core';
        import {DepModule} from './dep';

        @NgModule({
          declarations: [],
          imports: [DepModule],
        })
        export class Module {}
      `);

      env.driveMain();

      // After removing the component from the module, it should have been re-emitted without DepDir
      // in its scope.
      expect(env.getFilesWrittenSinceLastFlush()).toContain('/cmp.js');
      expect(env.getContents('cmp.js')).not.toContain('DepDir');
    });

    it('should rebuild only a Component (but with the correct CompilationScope) and its module if its template has changed',
       () => {
         setupFooBarProgram(env);

         // Make a change to the template of BarComponent.
         env.write('bar_component.html', '<div bar>changed</div>');

         env.driveMain();
         const written = env.getFilesWrittenSinceLastFlush();
         expect(written).not.toContain('/bar_directive.js');
         expect(written).toContain('/bar_component.js');
         // /bar_module.js should also be re-emitted, because remote scoping of BarComponent might
         // have been affected.
         expect(written).toContain('/bar_module.js');
         expect(written).not.toContain('/foo_component.js');
         expect(written).not.toContain('/foo_pipe.js');
         expect(written).not.toContain('/foo_module.js');
         // Ensure that the used directives are included in the component's generated template.
         expect(env.getContents('/built/bar_component.js')).toMatch(/directives:\s*\[.+\.BarDir\]/);
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

    it('should compile incrementally with template type-checking turned on', () => {
      env.tsconfig({ivyTemplateTypeCheck: true});
      env.write('main.ts', 'export class Foo {}');
      env.driveMain();
      env.invalidateCachedFile('main.ts');
      env.driveMain();
      // If program reuse were configured incorrectly (as was responsible for
      // https://github.com/angular/angular/issues/30079), this would have crashed.
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
      env.write('test.ts', `
        import {ServiceA} from 'a';
        import {ServiceB} from 'b';
      `);
      env.driveMain();
      env.flushWrittenFileTracking();

      // Pretend a change was made to test.ts. If redirect sources were introduced into the new
      // program, this would fail due to an assertion failure in TS.
      env.invalidateCachedFile('test.ts');
      env.driveMain();
    });
  });

  function setupFooBarProgram(env: NgtscTestEnvironment) {
    env.write('foo_component.ts', `
    import {Component} from '@angular/core';
    import {fooSelector} from './foo_selector';

    @Component({selector: fooSelector, template: 'foo'})
    export class FooCmp {}
  `);
    env.write('foo_pipe.ts', `
    import {Pipe} from '@angular/core';

    @Pipe({name: 'foo'})
    export class FooPipe {}
  `);
    env.write('foo_module.ts', `
    import {NgModule} from '@angular/core';
    import {FooCmp} from './foo_component';
    import {FooPipe} from './foo_pipe';
    import {BarModule} from './bar_module';
    @NgModule({
      declarations: [FooCmp, FooPipe],
      imports: [BarModule],
    })
    export class FooModule {}
  `);
    env.write('bar_component.ts', `
    import {Component} from '@angular/core';

    @Component({selector: 'bar', templateUrl: './bar_component.html'})
    export class BarCmp {}
  `);
    env.write('bar_component.html', '<div bar></div>');
    env.write('bar_directive.ts', `
    import {Directive} from '@angular/core';

    @Directive({selector: '[bar]'})
    export class BarDir {}
  `);
    env.write('bar_module.ts', `
    import {NgModule} from '@angular/core';
    import {BarCmp} from './bar_component';
    import {BarDir} from './bar_directive';
    @NgModule({
      declarations: [BarCmp, BarDir],
      exports: [BarCmp],
    })
    export class BarModule {}
  `);
    env.write('foo_selector.d.ts', `
    export const fooSelector = 'foo';
  `);
    env.driveMain();
    env.flushWrittenFileTracking();
  }
});
