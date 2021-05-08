/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />
import {inspect} from 'util';

import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';

import {NgtscTestEnvironment} from './env';
import {getMappedSegments, SegmentMapping} from './sourcemap_utils';

const testFiles = loadStandardTestFiles();

runInEachFileSystem((os) => {
  describe('template source-mapping', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig({sourceMap: true, target: 'es2015', enableI18nLegacyMessageIdFormat: false});
    });

    describe('Inline templates', () => {
      describe('(element creation)', () => {
        it('should map simple element with content', () => {
          const mappings = compileAndMap('<h1>Heading 1</h1>');
          expectMapping(
              mappings,
              {source: '<h1>', generated: 'i0.ɵɵelementStart(0, "h1")', sourceUrl: '../test.ts'});
          expectMapping(mappings, {
            source: 'Heading 1',
            generated: 'i0.ɵɵtext(1, "Heading 1")',
            sourceUrl: '../test.ts'
          });
          expectMapping(
              mappings, {source: '</h1>', generated: 'i0.ɵɵelementEnd()', sourceUrl: '../test.ts'});
        });

        it('should map void element', () => {
          const mappings = compileAndMap('<hr>');
          expectMapping(
              mappings,
              {source: '<hr>', generated: 'i0.ɵɵelement(0, "hr")', sourceUrl: '../test.ts'});
        });
      });

      describe('(interpolations)', () => {
        it('should map a mix of interpolated and static content', () => {
          const mappings = compileAndMap('<h3>Hello {{ name }}</h3>');
          expectMapping(
              mappings,
              {source: '<h3>', generated: 'i0.ɵɵelementStart(0, "h3")', sourceUrl: '../test.ts'});
          expectMapping(mappings, {
            source: 'Hello {{ name }}',
            generated: 'i0.ɵɵtextInterpolate1("Hello ", ctx.name, "")',
            sourceUrl: '../test.ts'
          });
          expectMapping(
              mappings, {source: '</h3>', generated: 'i0.ɵɵelementEnd()', sourceUrl: '../test.ts'});
        });

        it('should map a complex interpolated expression', () => {
          const mappings = compileAndMap('<h2>{{ greeting + " " + name }}</h2>');
          expectMapping(
              mappings,
              {source: '<h2>', generated: 'i0.ɵɵelementStart(0, "h2")', sourceUrl: '../test.ts'});
          expectMapping(mappings, {
            source: '{{ greeting + " " + name }}',
            generated: 'i0.ɵɵtextInterpolate(ctx.greeting + " " + ctx.name)',
            sourceUrl: '../test.ts'
          });
          expectMapping(
              mappings, {source: '</h2>', generated: 'i0.ɵɵelementEnd()', sourceUrl: '../test.ts'});
        });

        it('should map interpolated properties', () => {
          const mappings = compileAndMap('<div id="{{name}}"></div>');
          expectMapping(mappings, {
            source: '<div id="{{name}}"></div>',
            generated: 'i0.ɵɵelement(0, "div", 0)',
            sourceUrl: '../test.ts'
          });
          expectMapping(mappings, {
            source: 'id="{{name}}"',
            generated: 'i0.ɵɵpropertyInterpolate("id", ctx.name)',
            sourceUrl: '../test.ts'
          });
        });

        it('should map interpolation with pipe', () => {
          const mappings = compileAndMap('<div>{{200.3 | percent : 2 }}</div>');
          expectMapping(
              mappings,
              {source: '<div>', generated: 'i0.ɵɵelementStart(0, "div")', sourceUrl: '../test.ts'});
          expectMapping(mappings, {
            source: '{{200.3 | percent : 2 }}',
            generated: 'i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, 200.3, 2))',
            sourceUrl: '../test.ts'
          });
          expectMapping(
              mappings,
              {source: '</div>', generated: 'i0.ɵɵelementEnd()', sourceUrl: '../test.ts'});
        });
      });

      describe('(property bindings)', () => {
        it('should map a simple input binding expression', () => {
          const mappings = compileAndMap('<div [attr]="name"></div>');
          expectMapping(mappings, {
            source: '<div [attr]="name"></div>',
            generated: 'i0.ɵɵelement(0, "div", 0)',
            sourceUrl: '../test.ts'
          });
          expectMapping(mappings, {
            source: '[attr]="name"',
            generated: 'i0.ɵɵproperty("attr", ctx.name)',
            sourceUrl: '../test.ts'
          });
        });

        it('should map a complex input binding expression', () => {
          const mappings = compileAndMap('<div [attr]="greeting + name"></div>');

          expectMapping(mappings, {
            source: '<div [attr]="greeting + name"></div>',
            generated: 'i0.ɵɵelement(0, "div", 0)',
            sourceUrl: '../test.ts'
          });
          expectMapping(mappings, {
            source: '[attr]="greeting + name"',
            generated: 'i0.ɵɵproperty("attr", ctx.greeting + ctx.name)',
            sourceUrl: '../test.ts'
          });
        });

        it('should map a longhand input binding expression', () => {
          const mappings = compileAndMap('<div bind-attr="name"></div>');
          expectMapping(mappings, {
            source: '<div bind-attr="name"></div>',
            generated: 'i0.ɵɵelement(0, "div", 0)',
            sourceUrl: '../test.ts'
          });
          expectMapping(mappings, {
            source: 'bind-attr="name"',
            generated: 'i0.ɵɵproperty("attr", ctx.name)',
            sourceUrl: '../test.ts'
          });
        });

        it('should map a simple output binding expression', () => {
          const mappings = compileAndMap('<button (click)="doSomething()">Do it</button>');
          expectMapping(mappings, {
            source: '<button (click)="doSomething()">',
            generated: 'i0.ɵɵelementStart(0, "button", 0)',
            sourceUrl: '../test.ts'
          });
          expectMapping(
              mappings,
              {source: 'Do it', generated: 'i0.ɵɵtext(1, "Do it")', sourceUrl: '../test.ts'});
          expectMapping(
              mappings,
              {source: 'doSomething()', generated: 'ctx.doSomething()', sourceUrl: '../test.ts'});
          expectMapping(
              mappings,
              {source: '</button>', generated: 'i0.ɵɵelementEnd()', sourceUrl: '../test.ts'});
        });

        it('should map a complex output binding expression', () => {
          const mappings = compileAndMap(
              `<button (click)="items.push('item' + items.length)">Add Item</button>`);
          expectMapping(mappings, {
            source: `<button (click)="items.push('item' + items.length)">`,
            generated: 'i0.ɵɵelementStart(0, "button", 0)',
            sourceUrl: '../test.ts'
          });
          expectMapping(
              mappings,
              {source: 'Add Item', generated: 'i0.ɵɵtext(1, "Add Item")', sourceUrl: '../test.ts'});
          expectMapping(
              mappings,
              {source: 'items.push(', generated: 'ctx.items.push(', sourceUrl: '../test.ts'});
          expectMapping(mappings, {source: `'item'`, generated: `"item"`, sourceUrl: '../test.ts'});
          expectMapping(mappings, {
            source: ' + items.length)',
            generated: ' + ctx.items.length)',
            sourceUrl: '../test.ts'
          });
          expectMapping(
              mappings,
              {source: '</button>', generated: 'i0.ɵɵelementEnd()', sourceUrl: '../test.ts'});
        });

        it('should map a longhand output binding expression', () => {
          const mappings = compileAndMap('<button on-click="doSomething()">Do it</button>');
          expectMapping(mappings, {
            source: '<button on-click="doSomething()">',
            generated: 'i0.ɵɵelementStart(0, "button", 0)',
            sourceUrl: '../test.ts'
          });
          expectMapping(
              mappings,
              {source: 'Do it', generated: 'i0.ɵɵtext(1, "Do it")', sourceUrl: '../test.ts'});
          expectMapping(
              mappings,
              {source: 'doSomething()', generated: 'ctx.doSomething()', sourceUrl: '../test.ts'});
          expectMapping(
              mappings,
              {source: '</button>', generated: 'i0.ɵɵelementEnd()', sourceUrl: '../test.ts'});
        });

        it('should map a two-way binding expression', () => {
          const mappings = compileAndMap('Name: <input [(ngModel)]="name">');
          expectMapping(mappings, {
            source: '<input [(ngModel)]="name">',
            generated: 'i0.ɵɵelementStart(1, "input", 0)',
            sourceUrl: '../test.ts'
          });
          // TODO: improve mappings here
          expectMapping(mappings, {
            source: '[(ngModel)]="name"',
            generated:
                'i0.ɵɵlistener("ngModelChange", function TestCmp_Template_input_ngModelChange_1_listener($event) { return ctx.name = $event; })',
            sourceUrl: '../test.ts'
          });
          expectMapping(mappings, {
            source: '<input [(ngModel)]="name">',
            generated: 'i0.ɵɵelementEnd()',
            sourceUrl: '../test.ts'
          });
        });

        it('should map a longhand two-way binding expression', () => {
          const mappings = compileAndMap('Name: <input bindon-ngModel="name">');
          expectMapping(mappings, {
            source: '<input bindon-ngModel="name">',
            generated: 'i0.ɵɵelementStart(1, "input", 0)',
            sourceUrl: '../test.ts'
          });
          // TODO: improve mappings here
          expectMapping(mappings, {
            source: 'bindon-ngModel="name"',
            generated:
                'i0.ɵɵlistener("ngModelChange", function TestCmp_Template_input_ngModelChange_1_listener($event) { return ctx.name = $event; })',
            sourceUrl: '../test.ts'
          });
          expectMapping(mappings, {
            source: '<input bindon-ngModel="name">',
            generated: 'i0.ɵɵelementEnd()',
            sourceUrl: '../test.ts'
          });
        });

        it('should map a class input binding', () => {
          const mappings = compileAndMap('<div [class.initial]="isInitial">Message</div>');
          expectMapping(mappings, {
            source: '<div [class.initial]="isInitial">',
            generated: 'i0.ɵɵelementStart(0, "div")',
            sourceUrl: '../test.ts'
          });

          // TODO: Add better mappings for binding

          expectMapping(
              mappings,
              {source: 'Message', generated: 'i0.ɵɵtext(1, "Message")', sourceUrl: '../test.ts'});

          expectMapping(
              mappings,
              {source: '</div>', generated: 'i0.ɵɵelementEnd()', sourceUrl: '../test.ts'});
        });
      });

      describe('(structural directives)', () => {
        it('should map *ngIf scenario', () => {
          const mappings = compileAndMap('<div *ngIf="showMessage()">{{ name }}</div>');

          expectMapping(mappings, {
            source: '<div *ngIf="showMessage()">',
            generated: 'i0.ɵɵelementStart(0, "div")',
            sourceUrl: '../test.ts'
          });

          // TODO - map the bindings better

          expectMapping(
              mappings,
              {source: '</div>', generated: 'i0.ɵɵelementEnd()', sourceUrl: '../test.ts'});

          // TODO: the `ctx_r...` appears to be dependent upon previous tests!!!

          // expectMapping(mappings, {
          //   source: '{{ name }}',
          //   generated: 'i0.ɵɵtextInterpolate(ctx_r0.name)',
          //   sourceUrl: '../test.ts'
          // });
        });

        it('should map ng-template [ngIf] scenario', () => {
          const mappings = compileAndMap(
              `<ng-template [ngIf]="showMessage()">\n` +
              `  <div>{{ name }}</div>\n` +
              `  <hr>\n` +
              `</ng-template>`);

          expectMapping(
              mappings,
              {source: '<div>', generated: 'i0.ɵɵelementStart(0, "div")', sourceUrl: '../test.ts'});

          // TODO - map the bindings better

          expectMapping(
              mappings,
              {source: '</div>', generated: 'i0.ɵɵelementEnd()', sourceUrl: '../test.ts'});

          // TODO: the `ctx_r...` appears to be dependent upon previous tests!!!

          // expectMapping(mappings, {
          //   source: '{{ name }}',
          //   generated: 'i0.ɵɵtextInterpolate(ctx_r0.name)',
          //   sourceUrl: '../test.ts'
          // });
        });

        it('should map *ngFor scenario', () => {
          const mappings = compileAndMap(
              '<div *ngFor="let item of items; index as i; trackBy: trackByFn">{{ item }}</div>');

          expectMapping(mappings, {
            source: '<div *ngFor="let item of items; index as i; trackBy: trackByFn">',
            generated: 'i0.ɵɵelementStart(0, "div")',
            sourceUrl: '../test.ts'
          });

          // TODO - map the bindings better

          expectMapping(
              mappings,
              {source: '</div>', generated: 'i0.ɵɵelementEnd()', sourceUrl: '../test.ts'});
        });

        it('should map ng-template [ngFor] scenario', () => {
          const mappings = compileAndMap(
              `<ng-template ngFor [ngForOf]="items" let-item>{{ item }}</ng-template>`);

          // TODO - map the bindings better
        });
      });

      describe('(content projection)', () => {
        it('should map default and selected projection', () => {
          const mappings = compileAndMap(
              `<h3><ng-content select="title"></ng-content></h3>\n` +
              `<div><ng-content></ng-content></div>`);

          expectMapping(
              mappings,
              {source: '<h3>', generated: 'i0.ɵɵelementStart(0, "h3")', sourceUrl: '../test.ts'});
          expectMapping(mappings, {
            source: '<ng-content select="title"></ng-content>',
            generated: 'i0.ɵɵprojection(1)',
            sourceUrl: '../test.ts'
          });
          expectMapping(
              mappings, {source: '</h3>', generated: 'i0.ɵɵelementEnd()', sourceUrl: '../test.ts'});
          expectMapping(
              mappings,
              {source: '<div>', generated: 'i0.ɵɵelementStart(2, "div")', sourceUrl: '../test.ts'});
          expectMapping(mappings, {
            source: '<ng-content></ng-content>',
            generated: 'i0.ɵɵprojection(3, 1)',
            sourceUrl: '../test.ts'
          });
          expectMapping(
              mappings,
              {source: '</div>', generated: 'i0.ɵɵelementEnd()', sourceUrl: '../test.ts'});
        });
      });

      describe('$localize', () => {
        it('should create simple i18n message source-mapping', () => {
          const mappings = compileAndMap(`<div i18n>Hello, World!</div>`);
          expectMapping(mappings, {
            source: '<div i18n>',
            generated: 'i0.ɵɵelementStart(0, "div")',
            sourceUrl: '../test.ts',
          });
          expectMapping(mappings, {
            source: 'Hello, World!',
            generated: '`Hello, World!`',
            sourceUrl: '../test.ts',
          });
        });

        it('should create placeholder source-mappings', () => {
          const mappings = compileAndMap(`<div i18n>Hello, {{name}}!</div>`);
          expectMapping(mappings, {
            source: '<div i18n>',
            generated: 'i0.ɵɵelementStart(0, "div")',
            sourceUrl: '../test.ts',
          });
          expectMapping(mappings, {
            source: '</div>',
            generated: 'i0.ɵɵelementEnd()',
            sourceUrl: '../test.ts',
          });
          expectMapping(mappings, {
            source: 'Hello, ',
            generated: '`Hello, ${',
            sourceUrl: '../test.ts',
          });
          expectMapping(mappings, {
            source: '{{name}}',
            generated: '"\\uFFFD0\\uFFFD"',
            sourceUrl: '../test.ts',
          });
          expectMapping(mappings, {
            source: '!',
            generated: '}:INTERPOLATION:!`',
            sourceUrl: '../test.ts',
          });
        });

        it('should correctly handle collapsed whitespace in interpolation placeholder source-mappings',
           () => {
             const mappings = compileAndMap(
                 `<div i18n title="  pre-title {{name}}  post-title" i18n-title>  pre-body {{greeting}}  post-body</div>`);
             expectMapping(mappings, {
               source: '<div i18n title="  pre-title {{name}}  post-title" i18n-title>',
               generated: 'i0.ɵɵelementStart(0, "div", 0)',
               sourceUrl: '../test.ts',
             });
             expectMapping(mappings, {
               source: '</div>',
               generated: 'i0.ɵɵelementEnd()',
               sourceUrl: '../test.ts',
             });
             expectMapping(mappings, {
               source: '  pre-body ',
               generated: '` pre-body ${',
               sourceUrl: '../test.ts',
             });
             expectMapping(mappings, {
               source: '{{greeting}}',
               generated: '"\\uFFFD0\\uFFFD"',
               sourceUrl: '../test.ts',
             });
             expectMapping(mappings, {
               source: '  post-body',
               generated: '}:INTERPOLATION: post-body`',
               sourceUrl: '../test.ts',
             });
           });

        it('should correctly handle collapsed whitespace in element placeholder source-mappings',
           () => {
             const mappings =
                 compileAndMap(`<div i18n>\n  pre-p\n  <p>\n    in-p\n  </p>\n  post-p\n</div>`);
             // $localize expressions
             expectMapping(mappings, {
               sourceUrl: '../test.ts',
               source: 'pre-p\n  ',
               generated: '` pre-p ${',
             });
             expectMapping(mappings, {
               sourceUrl: '../test.ts',
               source: '<p>\n    ',
               generated: '"\\uFFFD#2\\uFFFD"',
             });
             expectMapping(mappings, {
               sourceUrl: '../test.ts',
               source: 'in-p\n  ',
               generated: '}:START_PARAGRAPH: in-p ${',
             });
             expectMapping(mappings, {
               sourceUrl: '../test.ts',
               source: '</p>\n  ',
               generated: '"\\uFFFD/#2\\uFFFD"',
             });
             expectMapping(mappings, {
               sourceUrl: '../test.ts',
               source: 'post-p\n',
               generated: '}:CLOSE_PARAGRAPH: post-p\n`',
             });
             // ivy instructions
             expectMapping(mappings, {
               sourceUrl: '../test.ts',
               source: '<div i18n>',
               generated: 'i0.ɵɵelementStart(0, "div")',
             });
             expectMapping(mappings, {
               sourceUrl: '../test.ts',
               source: '<div i18n>',
               generated: 'i0.ɵɵi18nStart(1, 0)',
             });
             expectMapping(mappings, {
               sourceUrl: '../test.ts',
               source: '<p>\n    in-p\n  </p>',
               generated: 'i0.ɵɵelement(2, "p")',
             });
             expectMapping(mappings, {
               sourceUrl: '../test.ts',
               source: '</div>',
               generated: 'i0.ɵɵi18nEnd()',
             });
             expectMapping(mappings, {
               sourceUrl: '../test.ts',
               source: '</div>',
               generated: 'i0.ɵɵelementEnd()',
             });
           });

        it('should create tag (container) placeholder source-mappings', () => {
          const mappings = compileAndMap(`<div i18n>Hello, <b>World</b>!</div>`);
          expectMapping(mappings, {
            source: '<div i18n>',
            generated: 'i0.ɵɵelementStart(0, "div")',
            sourceUrl: '../test.ts',
          });
          expectMapping(mappings, {
            source: '</div>',
            generated: 'i0.ɵɵelementEnd()',
            sourceUrl: '../test.ts',
          });
          expectMapping(mappings, {
            source: 'Hello, ',
            generated: '`Hello, ${',
            sourceUrl: '../test.ts',
          });
          expectMapping(mappings, {
            source: '<b>',
            generated: '"\\uFFFD#2\\uFFFD"',
            sourceUrl: '../test.ts',
          });
          expectMapping(mappings, {
            source: 'World',
            generated: '}:START_BOLD_TEXT:World${',
            sourceUrl: '../test.ts',
          });
          expectMapping(mappings, {
            source: '</b>',
            generated: '"\\uFFFD/#2\\uFFFD"',
            sourceUrl: '../test.ts',
          });
          expectMapping(mappings, {
            source: '!',
            generated: '}:CLOSE_BOLD_TEXT:!`',
            sourceUrl: '../test.ts',
          });
        });
      });

      it('should create (simple string) inline template source-mapping', () => {
        const mappings = compileAndMap('<div>this is a test</div><div>{{ 1 + 2 }}</div>');

        // Creation mode
        expectMapping(
            mappings,
            {generated: 'i0.ɵɵelementStart(0, "div")', source: '<div>', sourceUrl: '../test.ts'});
        expectMapping(mappings, {
          generated: 'i0.ɵɵtext(1, "this is a test")',
          source: 'this is a test',
          sourceUrl: '../test.ts'
        });
        expectMapping(
            mappings, {generated: 'i0.ɵɵelementEnd()', source: '</div>', sourceUrl: '../test.ts'});
        expectMapping(
            mappings,
            {generated: 'i0.ɵɵelementStart(2, "div")', source: '<div>', sourceUrl: '../test.ts'});
        expectMapping(
            mappings, {generated: 'i0.ɵɵtext(3)', source: '{{ 1 + 2 }}', sourceUrl: '../test.ts'});
        expectMapping(
            mappings, {generated: 'i0.ɵɵelementEnd()', source: '</div>', sourceUrl: '../test.ts'});

        // Update mode
        expectMapping(mappings, {
          generated: 'i0.ɵɵtextInterpolate(1 + 2)',
          source: '{{ 1 + 2 }}',
          sourceUrl: '../test.ts'
        });
      });

      it('should create correct inline template source-mapping when the source contains escape sequences',
         () => {
           // Note that the escaped double quotes, which need un-escaping to be parsed correctly.
           const mappings = compileAndMap('<div class=\\"some-class\\">this is a test</div>');

           expectMapping(mappings, {
             generated: 'i0.ɵɵelementStart(0, "div", 0)',
             source: '<div class=\\"some-class\\">',
             sourceUrl: '../test.ts'
           });

           const attrsMapping =
               mappings.find(mapping => /consts: \[\[1, "some-class"\]\]/.test(mapping.generated));
           expect(attrsMapping).toBeDefined();
         });
    });

    describe('External templates (where TS supports source-mapping)', () => {
      it('should create external template source-mapping', () => {
        const mappings =
            compileAndMap('<div>this is a test</div><div>{{ 1 + 2 }}</div>', './dir/test.html');

        // Creation mode
        expectMapping(mappings, {
          generated: 'i0.ɵɵelementStart(0, "div")',
          source: '<div>',
          sourceUrl: '../dir/test.html'
        });
        expectMapping(mappings, {
          generated: 'i0.ɵɵtext(1, "this is a test")',
          source: 'this is a test',
          sourceUrl: '../dir/test.html'
        });
        expectMapping(
            mappings,
            {generated: 'i0.ɵɵelementEnd()', source: '</div>', sourceUrl: '../dir/test.html'});
        expectMapping(mappings, {
          generated: 'i0.ɵɵelementStart(2, "div")',
          source: '<div>',
          sourceUrl: '../dir/test.html'
        });
        expectMapping(
            mappings,
            {generated: 'i0.ɵɵtext(3)', source: '{{ 1 + 2 }}', sourceUrl: '../dir/test.html'});
        expectMapping(
            mappings,
            {generated: 'i0.ɵɵelementEnd()', source: '</div>', sourceUrl: '../dir/test.html'});

        // Update mode
        expectMapping(mappings, {
          generated: 'i0.ɵɵtextInterpolate(1 + 2)',
          source: '{{ 1 + 2 }}',
          sourceUrl: '../dir/test.html'
        });
      });

      it('should create correct mappings when templateUrl is in a different rootDir', () => {
        const mappings = compileAndMap(
            '<div>this is a test</div><div>{{ 1 + 2 }}</div>', 'extraRootDir/test.html');

        // Creation mode
        expectMapping(mappings, {
          generated: 'i0.ɵɵelementStart(0, "div")',
          source: '<div>',
          sourceUrl: '../extraRootDir/test.html'
        });
        expectMapping(mappings, {
          generated: 'i0.ɵɵtext(1, "this is a test")',
          source: 'this is a test',
          sourceUrl: '../extraRootDir/test.html'
        });
        expectMapping(mappings, {
          generated: 'i0.ɵɵelementEnd()',
          source: '</div>',
          sourceUrl: '../extraRootDir/test.html'
        });
        expectMapping(mappings, {
          generated: 'i0.ɵɵelementStart(2, "div")',
          source: '<div>',
          sourceUrl: '../extraRootDir/test.html'
        });
        expectMapping(mappings, {
          generated: 'i0.ɵɵtext(3)',
          source: '{{ 1 + 2 }}',
          sourceUrl: '../extraRootDir/test.html'
        });
        expectMapping(mappings, {
          generated: 'i0.ɵɵelementEnd()',
          source: '</div>',
          sourceUrl: '../extraRootDir/test.html'
        });

        // Update mode
        expectMapping(mappings, {
          generated: 'i0.ɵɵtextInterpolate(1 + 2)',
          source: '{{ 1 + 2 }}',
          sourceUrl: '../extraRootDir/test.html'
        });
      });
    });


    function compileAndMap(template: string, templateUrl: string|null = null) {
      const templateConfig = templateUrl ? `templateUrl: '${templateUrl}'` :
                                           ('template: `' + template.replace(/`/g, '\\`') + '`');
      env.write('test.ts', `
        import {Component, Directive, Input, Output, EventEmitter, Pipe, NgModule} from '@angular/core';

        @Directive({
          selector: '[ngModel],[attr],[ngModelChange]'
        })
        export class AllDirective {
          @Input() ngModel!: any;
          @Output() ngModelChange = new EventEmitter<any>();
          @Input() attr!: any;
        }

        @Pipe({name: 'percent'})
        export class PercentPipe {
          transform(v: any) {}
        }

        @Component({
          selector: 'test-cmp',
          ${templateConfig}
        })
        export class TestCmp {
          name = '';
          isInitial = false;
          doSomething() {}
          items: any[] = [];
          greeting = '';
        }

        @NgModule({
          declarations: [TestCmp, AllDirective, PercentPipe],
        })
        export class Module {}
    `);
      if (templateUrl) {
        env.write(templateUrl, template);
      }
      env.driveMain();
      return getMappedSegments(env, 'test.js');
    }

    /**
     * Helper function for debugging failed mappings.
     * This lays out the segment mappings in the console to make it easier to compare.
     */
    function dumpMappings(mappings: SegmentMapping[]) {
      mappings.forEach(map => {
        // tslint:disable-next-line:no-console
        console.log(
            padValue(map.sourceUrl, 20, 0) + ' : ' + padValue(inspect(map.source), 100, 23) +
            ' : ' + inspect(map.generated));
      });
      function padValue(value: string, max: number, start: number) {
        const padding = value.length > max ? ('\n' +
                                              ' '.repeat(max + start)) :
                                             ' '.repeat(max - value.length);
        return value + padding;
      }
    }

    function expectMapping(mappings: SegmentMapping[], expected: SegmentMapping): void {
      if (mappings.some(
              m => m.generated === expected.generated && m.source === expected.source &&
                  m.sourceUrl === expected.sourceUrl)) {
        return;
      }
      const matchingGenerated = mappings.filter(m => m.generated === expected.generated);
      const matchingSource = mappings.filter(m => m.source === expected.source);

      const message = [
        'Expected mappings to contain the following mapping',
        prettyPrintMapping(expected),
      ];
      if (matchingGenerated.length > 0) {
        message.push('');
        message.push('There are the following mappings that match the generated text:');
        matchingGenerated.forEach(m => message.push(prettyPrintMapping(m)));
      }
      if (matchingSource.length > 0) {
        message.push('');
        message.push('There are the following mappings that match the source text:');
        matchingSource.forEach(m => message.push(prettyPrintMapping(m)));
      }

      fail(message.join('\n'));
    }

    function prettyPrintMapping(mapping: SegmentMapping): string {
      return [
        '{',
        `  generated: ${JSON.stringify(mapping.generated)}`,
        `  source:    ${JSON.stringify(mapping.source)}`,
        `  sourceUrl: ${JSON.stringify(mapping.sourceUrl)}`,
        '}',
      ].join('\n');
    }
  });
});
