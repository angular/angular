/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, destroyPlatform, NgModule, Pipe, PipeTransform} from '../../src/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {withBody} from '@angular/private/testing';

describe('NgModule scopes', () => {
  beforeEach(destroyPlatform);
  afterEach(destroyPlatform);

  it(
    'should apply NgModule scope to a component that extends another component class',
    withBody('<my-app></my-app>', async () => {
      // Regression test for https://github.com/angular/angular/issues/37105
      //
      // This test reproduces a scenario that used to fail due to a reentrancy issue in Ivy's JIT
      // compiler. Extending a component from a decorated baseclass would inadvertently compile
      // the subclass twice. NgModule scope information would only be present on the initial
      // compilation, but then overwritten during the second compilation. This meant that the
      // baseclass did not have a NgModule scope, such that declarations are not available.
      //
      // The scenario cannot be tested using TestBed as it influences how NgModule
      // scopes are applied, preventing the issue from occurring.

      @Pipe({
        name: 'multiply',
        standalone: false,
      })
      class MultiplyPipe implements PipeTransform {
        transform(value: number, factor: number): number {
          return value * factor;
        }
      }

      @Component({
        template: '...',
        standalone: false,
      })
      class BaseComponent {}

      @Component({
        selector: 'my-app',
        template: 'App - {{ 3 | multiply:2 }}',
        standalone: false,
      })
      class App extends BaseComponent {}

      @NgModule({
        imports: [BrowserModule],
        declarations: [App, BaseComponent, MultiplyPipe],
        bootstrap: [App],
      })
      class Mod {}

      const ngModuleRef = await platformBrowserDynamic().bootstrapModule(Mod);
      expect(document.body.textContent).toContain('App - 6');
      ngModuleRef.destroy();
    }),
  );
});
