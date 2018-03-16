/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MockDirectory, setup} from '../aot/test_util';
import {compile, expectEmit} from './mock_compile';

describe('r3_module_compiler', () => {
  const angularFiles = setup({
    compileAngular: true,
    compileAnimations: false,
    compileCommon: true,
  });

  it('should be able to produce the module for hello world', () => {
    const files: MockDirectory = {
      app: {
        'hello.ts': `
         import {Component, NgModule} from '@angular/core';

         @Component({
           selector: 'hello-world',
           template: 'Hello, world!'
         })
         export class HelloWorldComponent {

         }

         @NgModule({
           declarations: [HelloWorldComponent]
         })
         export class HelloWorldModule {}
      `
      }
    };
    const result = compile(files, angularFiles);

    const module_declaration = `
      static ngInjectorDef = $r3$.ɵdefineInjector({
        factory: function HelloWorldModule_Factory():void{
          return new HelloWorldModule();
        },
        providers: … undefined …,
        imports: []
      });
      …
      static ngModuleScope =  … [] …;`;
    expectEmit(result.source, module_declaration, 'Incorrect module declaration');
  });

  it('should be able to produce a mdoule with a class provider', () => {
    const files: MockDirectory = {
      app: {
        'server.ts': `
         import {Injectable, NgModule} from '@angular/core';

         @Injectable()
         export class Server { }

         @NgModule({ providers: [Server]})
         export class ServerModule {}
      `
      }
    };
    const result = compile(files, angularFiles);

    const module_declaration = `
      static ngInjectorDef = $r3$.ɵdefineInjector({
        factory: function ServerModule_Factory():void{
          return new ServerModule();
        },
        providers: [Server],
        imports: …
      });`;

    expectEmit(result.source, module_declaration, 'Incorrect provider module');
  });

  it('should be able to produce a list of exports', () => {
    const files: MockDirectory = {
      app: {
        'server.ts': `
         import {Component, Directive, Pipe, NgModule} from '@angular/core';

         @Component({selector: 'comp', template: ''})
         export class SomeComponent {}

         @Directive({selector: '[sel]'})
         export class SomeDirective {}

         @Pipe({name: 'somePipe'})
         export class SomePipe {}

         @NgModule({
           declarations: [SomeComponent, SomeDirective, SomePipe],
           exports: [SomeComponent, [SomeDirective], SomePipe]
         })
         export class SomeModule {}
      `
      }
    };
    const result = compile(files, angularFiles);

    const module_scope = `
      static ngModuleScope = [
        { type: SomeComponent, selector: 'comp' },
        { type: SomeDirective, selector: '[sel]' },
        { type: SomePipe, name: 'somePipe', isPipe: true }
      ];`;

    expectEmit(result.source, module_scope, 'Incorrect module scope');
  });
});
