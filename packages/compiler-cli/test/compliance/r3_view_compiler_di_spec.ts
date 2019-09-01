/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MockDirectory, setup} from '@angular/compiler/test/aot/test_util';
import {compile, expectEmit} from './mock_compile';

describe('compiler compliance: dependency injection', () => {
  const angularFiles = setup({
    compileAngular: false,
    compileFakeCore: true,
    compileAnimations: false,
  });

  it('should create factory methods', () => {
    const files = {
      app: {
        'spec.ts': `
              import {Component, NgModule, Injectable, Attribute, Host, SkipSelf, Self, Optional} from '@angular/core';

              @Injectable()
              export class MyService {}

              @Component({
                selector: 'my-component',
                template: \`\`
              })
              export class MyComponent {
                constructor(
                  @Attribute('name') name:string,
                  s1: MyService,
                  @Host() s2: MyService,
                  @Self() s4: MyService,
                  @SkipSelf() s3: MyService,
                  @Optional() s5: MyService,
                  @Self() @Optional() s6: MyService,
                ) {}
              }

              @NgModule({declarations: [MyComponent], providers: [MyService]})
              export class MyModule {}
          `
      }
    };

    const factory = `
      MyComponent.ngFactoryDef = function MyComponent_Factory(t) {
        return new (t || MyComponent)(
          $r3$.ɵɵinjectAttribute('name'),
          $r3$.ɵɵdirectiveInject(MyService),
          $r3$.ɵɵdirectiveInject(MyService, 1),
          $r3$.ɵɵdirectiveInject(MyService, 2),
          $r3$.ɵɵdirectiveInject(MyService, 4),
          $r3$.ɵɵdirectiveInject(MyService, 8),
          $r3$.ɵɵdirectiveInject(MyService, 10)
        );
      }`;


    const result = compile(files, angularFiles);

    expectEmit(result.source, factory, 'Incorrect factory');
  });

  it('should create a factory definition for an injectable', () => {
    const files = {
      app: {
        'spec.ts': `
          import {Injectable} from '@angular/core';

          class MyDependency {}

          @Injectable()
          export class MyService {
            constructor(dep: MyDependency) {}
          }
        `
      }
    };

    const factory = `
      MyService.ngFactoryDef = function MyService_Factory(t) {
        return new (t || MyService)($r3$.ɵɵinject(MyDependency));
      }`;

    const def = `
      MyService.ngInjectableDef = $r3$.ɵɵdefineInjectable({
        token: MyService,
        factory: function() {
          return MyService.ngFactoryDef();
        },
        providedIn: null
      });
    `;

    const result = compile(files, angularFiles);
    expectEmit(result.source, factory, 'Incorrect factory definition');
    expectEmit(result.source, def, 'Incorrect injectable definition');
  });

  it('should not reference the ngFactoryDef if the injectable has an alternate factory', () => {
    const files = {
      app: {
        'spec.ts': `
          import {Injectable} from '@angular/core';

          class MyAlternateService {}

          @Injectable({
            useFactory: () => new MyAlternateFactory()
          })
          export class MyService {
          }
        `
      }
    };

    const factory = `
      MyService.ngFactoryDef = function MyService_Factory(t) {
        return new (t || MyService)();
      }`;

    const def = `
      MyService.ngInjectableDef = $r3$.ɵɵdefineInjectable({
        token: MyService,
        factory: function MyService_Factory(t) {
          var r = null;
          if (t) {
            (r = new t());
          } else {
            (r = (() => new MyAlternateFactory())());
          }
          return r;
        },
        providedIn: null
      });
    `;

    const result = compile(files, angularFiles);
    expectEmit(result.source, factory, 'Incorrect factory definition');
    expectEmit(result.source, def, 'Incorrect injectable definition');
  });

  it('should create a single ngFactoryDef if the class has more than one decorator', () => {
    const files = {
      app: {
        'spec.ts': `
          import {Injectable, Pipe} from '@angular/core';

          @Injectable()
          @Pipe({name: 'my-pipe'})
          export class MyPipe {
          }
        `
      }
    };

    const result = compile(files, angularFiles).source;
    const matches = result.match(/MyPipe\.ngFactoryDef = function MyPipe_Factory/g);
    expect(matches ? matches.length : 0).toBe(1);
  });


});
