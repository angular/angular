/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MockDirectory, setup} from '@angular/compiler/test/aot/test_util';
import {compile, expectEmit} from './mock_compile';

describe('compiler compliance: listen()', () => {
  const angularFiles = setup({
    compileAngular: false,
    compileFakeCore: true,
    compileAnimations: false,
  });

  it('should declare inputs/outputs', () => {
    const files = {
      app: {
        'spec.ts': `
              import {Component, Directive, NgModule, Input, Output} from '@angular/core';

              @Component({
                selector: 'my-component',
                template: \`\`
              })
              export class MyComponent {
                @Input() componentInput;
                @Input('renamedComponentInput') originalComponentInput;

                @Output() componentOutput;
                @Output('renamedComponentOutput') originalComponentOutput;
              }

              @Directive({
                selector: '[my-directive]',
              })
              export class MyDirective {
                @Input() directiveInput;
                @Input('renamedDirectiveInput') originalDirectiveInput;

                @Output() directiveOutput;
                @Output('renamedDirectiveOutput') originalDirectiveOutput;
              }

              @NgModule({declarations: [MyComponent, MyDirective]})
              export class MyModule {}
          `
      }
    };

    const componentDef = `
      MyComponent.ɵcmp = /*@__PURE__*/ IDENT.ɵɵdefineComponent({
          …
          inputs:{
            componentInput: "componentInput",
            originalComponentInput: ["renamedComponentInput", "originalComponentInput"]
          },
          outputs: {
            componentOutput: "componentOutput",
            originalComponentOutput: "renamedComponentOutput"
          }
          …
        });`;

    const directiveDef = `
      MyDirective.ɵdir = /*@__PURE__*/ IDENT.ɵɵdefineDirective({
        …
        inputs:{
          directiveInput: "directiveInput",
          originalDirectiveInput: ["renamedDirectiveInput", "originalDirectiveInput"]
        },
        outputs: {
          directiveOutput: "directiveOutput",
          originalDirectiveOutput: "renamedDirectiveOutput"
        }
        …
      });`;


    const result = compile(files, angularFiles);

    expectEmit(result.source, componentDef, 'Incorrect component definition');
    expectEmit(result.source, directiveDef, 'Incorrect directive definition');
  });
});
