/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {setup} from '@angular/compiler/test/aot/test_util';
import {compile, expectEmit} from './mock_compile';

describe('compiler compliance: providers', () => {
  const angularFiles = setup({
    compileAngular: false,
    compileFakeCore: true,
    compileAnimations: false,
  });

  it('should emit the ProvidersFeature feature when providers and viewProviders', () => {
    const files = {
      app: {
        'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              abstract class Greeter { abstract greet(): string; }

              class GreeterEN implements Greeter {
                greet() { return 'Hi'; }
              }

              @Component({
                selector: 'my-component',
                template: '<div></div>',
                providers: [GreeterEN, {provide: Greeter, useClass: GreeterEN}],
                viewProviders: [GreeterEN]
              })
              export class MyComponent {
              }

              @NgModule({declarations: [MyComponent]})
              export class MyModule {}
          `
      }
    };

    const result = compile(files, angularFiles);
    expectEmit(
        result.source,
        'features: [i0.ɵProvidersFeature([GreeterEN, {provide: Greeter, useClass: GreeterEN}], [GreeterEN])],',
        'Incorrect features');
  });

  it('should emit the ProvidersFeature feature when providers only', () => {
    const files = {
      app: {
        'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              abstract class Greeter { abstract greet(): string; }

              class GreeterEN implements Greeter {
                greet() { return 'Hi'; }
              }

              @Component({
                selector: 'my-component',
                template: '<div></div>',
                providers: [GreeterEN, {provide: Greeter, useClass: GreeterEN}]
              })
              export class MyComponent {
              }

              @NgModule({declarations: [MyComponent]})
              export class MyModule {}
          `
      }
    };

    const result = compile(files, angularFiles);
    expectEmit(
        result.source,
        'features: [i0.ɵProvidersFeature([GreeterEN, {provide: Greeter, useClass: GreeterEN}])],',
        'Incorrect features');
  });

  it('should emit the ProvidersFeature feature when viewProviders only', () => {
    const files = {
      app: {
        'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              abstract class Greeter { abstract greet(): string; }

              class GreeterEN implements Greeter {
                greet() { return 'Hi'; }
              }

              @Component({
                selector: 'my-component',
                template: '<div></div>',
                viewProviders: [GreeterEN]
              })
              export class MyComponent {
              }

              @NgModule({declarations: [MyComponent]})
              export class MyModule {}
          `
      }
    };

    const result = compile(files, angularFiles);
    expectEmit(
        result.source, 'features: [i0.ɵProvidersFeature([], [GreeterEN])],', 'Incorrect features');
  });

  it('should not emit the ProvidersFeature feature when no providers', () => {
    const files = {
      app: {
        'spec.ts': `
              import {Component, NgModule} from '@angular/core';

              abstract class Greeter { abstract greet(): string; }

              class GreeterEN implements Greeter {
                greet() { return 'Hi'; }
              }

              @Component({
                selector: 'my-component',
                template: '<div></div>'
              })
              export class MyComponent {
              }

              @NgModule({declarations: [MyComponent]})
              export class MyModule {}
          `
      }
    };

    const result = compile(files, angularFiles);
    expectEmit(
        result.source, `
    export class MyComponent {
    }
    MyComponent.ngComponentDef = i0.ÉµdefineComponent({ type: MyComponent, selectors: [["my-component"]], factory: function MyComponent_Factory(t) { return new (t || MyComponent)(); }, consts: 1, vars: 0, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
            i0.Éµelement(0, "div");
        } } });`,
        'Incorrect features');
  });
});
