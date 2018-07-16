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
      factory: function MyComponent_Factory(t) {
        return new (t || MyComponent)(
          $r3$.ɵinjectAttribute('name'),
          $r3$.ɵdirectiveInject(MyService), 
          $r3$.ɵdirectiveInject(MyService, 1),
          $r3$.ɵdirectiveInject(MyService, 2),
          $r3$.ɵdirectiveInject(MyService, 4),
          $r3$.ɵdirectiveInject(MyService, 8),
          $r3$.ɵdirectiveInject(MyService, 10)
        );
      }`;


    const result = compile(files, angularFiles);

    expectEmit(result.source, factory, 'Incorrect factory');
  });

});
