/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgtscTestEnvironment} from './env';

describe('ngtsc incremental compilation', () => {
  let env !: NgtscTestEnvironment;
  beforeEach(() => {
    env = NgtscTestEnvironment.setup();
    env.enableMultipleCompilations();
    env.tsconfig();
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
    expect(written).not.toContain('/foo_component.js');
    expect(written).not.toContain('/foo_pipe.js');
    expect(written).not.toContain('/foo_module.js');
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

    @Component({selector: 'bar', template: 'bar'})
    export class BarCmp {}
  `);
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