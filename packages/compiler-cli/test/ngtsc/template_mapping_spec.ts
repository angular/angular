/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {inspect} from 'util';

import {tsSourceMapBug29300Fixed} from '../../src/ngtsc/util/src/ts_source_map_bug_29300';

import {NgtscTestEnvironment} from './env';
import {SegmentMapping, getMappedSegments} from './sourcemap_utils';

describe('template source-mapping', () => {
  let env !: NgtscTestEnvironment;

  beforeEach(() => { env = NgtscTestEnvironment.setup(); });

  describe('Inline templates', () => {
    describe('(element creation)', () => {
      it('should map simple element with content', () => {
        const mappings = compileAndMap('<h1>Heading 1</h1>');
        expect(mappings).toContain(
            {source: '<h1>', generated: 'i0.ɵelementStart(0, "h1")', sourceUrl: '../test.ts'});
        expect(mappings).toContain(
            {source: 'Heading 1', generated: 'i0.ɵtext(1, "Heading 1")', sourceUrl: '../test.ts'});
        expect(mappings).toContain(
            {source: '</h1>', generated: 'i0.ɵelementEnd()', sourceUrl: '../test.ts'});
      });

      it('should map void element', () => {
        const mappings = compileAndMap('<hr>');
        expect(mappings).toContain(
            {source: '<hr>', generated: 'i0.ɵelement(0, "hr")', sourceUrl: '../test.ts'});
      });
    });

    describe('(interpolations)', () => {
      it('should map a mix of interpolated and static content', () => {
        const mappings = compileAndMap('<h3>Hello {{ name }}</h3>');
        expect(mappings).toContain(
            {source: '<h3>', generated: 'i0.ɵelementStart(0, "h3")', sourceUrl: '../test.ts'});
        expect(mappings).toContain({
          source: 'Hello {{ name }}',
          generated: 'i0.ɵtextBinding(1, i0.ɵinterpolation1("Hello ", ctx.name, ""))',
          sourceUrl: '../test.ts'
        });
        expect(mappings).toContain(
            {source: '</h3>', generated: 'i0.ɵelementEnd()', sourceUrl: '../test.ts'});
      });

      it('should map a complex interpolated expression', () => {
        const mappings = compileAndMap('<h2>{{ greeting + " " + name }}</h2>');
        expect(mappings).toContain(
            {source: '<h2>', generated: 'i0.ɵelementStart(0, "h2")', sourceUrl: '../test.ts'});
        expect(mappings).toContain({
          source: '{{ greeting + " " + name }}',
          generated:
              'i0.ɵtextBinding(1, i0.ɵinterpolation1("", ((ctx.greeting + " ") + ctx.name), ""))',
          sourceUrl: '../test.ts'
        });
        expect(mappings).toContain(
            {source: '</h2>', generated: 'i0.ɵelementEnd()', sourceUrl: '../test.ts'});
      });

      it('should map interpolated properties', () => {
        const mappings = compileAndMap('<div id="{{name}}"></div>');
        expect(mappings).toContain({
          source: '<div id="{{name}}"></div>',
          generated: 'i0.ɵelement(0, "div", _c0)',
          sourceUrl: '../test.ts'
        });
        expect(mappings).toContain({
          source: 'id="{{name}}"',
          generated: 'i0.ɵelementProperty(0, "id", i0.ɵinterpolation1("", ctx.name, ""))',
          sourceUrl: '../test.ts'
        });
      });

      it('should map interpolation with pipe', () => {
        const mappings = compileAndMap('<div>{{200.3 | percent : 2 }}</div>');
        expect(mappings).toContain(
            {source: '<div>', generated: 'i0.ɵelementStart(0, "div")', sourceUrl: '../test.ts'});
        expect(mappings).toContain({
          source: '{{200.3 | percent : 2 }}',
          generated:
              'i0.ɵtextBinding(1, i0.ɵinterpolation1("", i0.ɵpipeBind2(2, 1, 200.3, 2), ""))',
          sourceUrl: '../test.ts'
        });
        expect(mappings).toContain(
            {source: '</div>', generated: 'i0.ɵelementEnd()', sourceUrl: '../test.ts'});
      });
    });

    describe('(property bindings)', () => {
      it('should map a simple input binding expression', () => {
        const mappings = compileAndMap('<div [attr]="name"></div>');
        expect(mappings).toContain({
          source: '<div [attr]="name"></div>',
          generated: 'i0.ɵelement(0, "div", _c0)',
          sourceUrl: '../test.ts'
        });
        expect(mappings).toContain({
          source: '[attr]="name"',
          generated: 'i0.ɵelementProperty(0, "attr", i0.ɵbind(ctx.name))',
          sourceUrl: '../test.ts'
        });
      });

      it('should map a complex input binding expression', () => {
        const mappings = compileAndMap('<div [attr]="greeting + name"></div>');
        expect(mappings).toContain({
          source: '<div [attr]="greeting + name"></div>',
          generated: 'i0.ɵelement(0, "div", _c0)',
          sourceUrl: '../test.ts'
        });
        expect(mappings).toContain({
          source: '[attr]="greeting + name"',
          generated: 'i0.ɵelementProperty(0, "attr", i0.ɵbind((ctx.greeting + ctx.name)))',
          sourceUrl: '../test.ts'
        });
      });

      it('should map a longhand input binding expression', () => {
        const mappings = compileAndMap('<div bind-attr="name"></div>');
        expect(mappings).toContain({
          source: '<div bind-attr="name"></div>',
          generated: 'i0.ɵelement(0, "div", _c0)',
          sourceUrl: '../test.ts'
        });
        expect(mappings).toContain({
          source: 'bind-attr="name"',
          generated: 'i0.ɵelementProperty(0, "attr", i0.ɵbind(ctx.name))',
          sourceUrl: '../test.ts'
        });
      });

      it('should map a simple output binding expression', () => {
        const mappings = compileAndMap('<button (click)="doSomething()">Do it</button>');
        expect(mappings).toContain({
          source: '<button (click)="doSomething()">',
          generated: 'i0.ɵelementStart(0, "button", _c0)',
          sourceUrl: '../test.ts'
        });
        expect(mappings).toContain(
            {source: 'Do it', generated: 'i0.ɵtext(1, "Do it")', sourceUrl: '../test.ts'});
        expect(mappings).toContain(
            {source: 'doSomething()', generated: 'ctx.doSomething()', sourceUrl: '../test.ts'});
        expect(mappings).toContain(
            {source: '</button>', generated: 'i0.ɵelementEnd()', sourceUrl: '../test.ts'});
      });

      it('should map a complex output binding expression', () => {
        const mappings =
            compileAndMap(`<button (click)="items.push('item' + items.length)">Add Item</button>`);
        expect(mappings).toContain({
          source: `<button (click)="items.push('item' + items.length)">`,
          generated: 'i0.ɵelementStart(0, "button", _c0)',
          sourceUrl: '../test.ts'
        });
        expect(mappings).toContain(
            {source: 'Add Item', generated: 'i0.ɵtext(1, "Add Item")', sourceUrl: '../test.ts'});
        expect(mappings).toContain(
            {source: 'items.push(', generated: 'ctx.items.push((', sourceUrl: '../test.ts'});
        expect(mappings).toContain(
            {source: `'item' `, generated: `"item"`, sourceUrl: '../test.ts'});
        expect(mappings).toContain({
          source: '+ items.length)',
          generated: ' + ctx.items.length))',
          sourceUrl: '../test.ts'
        });
        expect(mappings).toContain(
            {source: '</button>', generated: 'i0.ɵelementEnd()', sourceUrl: '../test.ts'});
      });

      it('should map a longhand output binding expression', () => {
        const mappings = compileAndMap('<button on-click="doSomething()">Do it</button>');
        expect(mappings).toContain({
          source: '<button on-click="doSomething()">',
          generated: 'i0.ɵelementStart(0, "button", _c0)',
          sourceUrl: '../test.ts'
        });
        expect(mappings).toContain(
            {source: 'Do it', generated: 'i0.ɵtext(1, "Do it")', sourceUrl: '../test.ts'});
        expect(mappings).toContain(
            {source: 'doSomething()', generated: 'ctx.doSomething()', sourceUrl: '../test.ts'});
        expect(mappings).toContain(
            {source: '</button>', generated: 'i0.ɵelementEnd()', sourceUrl: '../test.ts'});
      });

      it('should map a two-way binding expression', () => {
        const mappings = compileAndMap('Name: <input [(ngModel)]="name">');
        expect(mappings).toContain({
          source: '<input [(ngModel)]="name">',
          generated: 'i0.ɵelementStart(1, "input", _c0)',
          sourceUrl: '../test.ts'
        });
        // TODO: improve mappings here
        expect(mappings).toContain({
          source: '[(ngModel)]="name"',
          generated:
              'i0.ɵlistener("ngModelChange", function TestCmp_Template_input_ngModelChange_1_listener($event) { return ctx.name = $event; })',
          sourceUrl: '../test.ts'
        });
        expect(mappings).toContain({
          source: '<input [(ngModel)]="name">',
          generated: 'i0.ɵelementEnd()',
          sourceUrl: '../test.ts'
        });
      });

      it('should map a longhand two-way binding expression', () => {
        const mappings = compileAndMap('Name: <input bindon-ngModel="name">');
        expect(mappings).toContain({
          source: '<input bindon-ngModel="name">',
          generated: 'i0.ɵelementStart(1, "input", _c0)',
          sourceUrl: '../test.ts'
        });
        // TODO: improve mappings here
        expect(mappings).toContain({
          source: 'bindon-ngModel="name"',
          generated:
              'i0.ɵlistener("ngModelChange", function TestCmp_Template_input_ngModelChange_1_listener($event) { return ctx.name = $event; })',
          sourceUrl: '../test.ts'
        });
        expect(mappings).toContain({
          source: '<input bindon-ngModel="name">',
          generated: 'i0.ɵelementEnd()',
          sourceUrl: '../test.ts'
        });
      });

      it('should map a class input binding', () => {
        const mappings = compileAndMap('<div [class.initial]="isInitial">Message</div>');
        expect(mappings).toContain({
          source: '<div [class.initial]="isInitial">',
          generated: 'i0.ɵelementStart(0, "div")',
          sourceUrl: '../test.ts'
        });

        // TODO: Add better mappings for binding

        expect(mappings).toContain(
            {source: 'Message', generated: 'i0.ɵtext(1, "Message")', sourceUrl: '../test.ts'});

        expect(mappings).toContain(
            {source: '</div>', generated: 'i0.ɵelementEnd()', sourceUrl: '../test.ts'});
      });
    });

    describe('(structural directives)', () => {
      it('should map *ngIf scenario', () => {
        const mappings = compileAndMap('<div *ngIf="showMessage()">{{ name }}</div>');

        expect(mappings).toContain({
          source: '<div *ngIf="showMessage()">',
          generated: 'i0.ɵelementStart(0, "div")',
          sourceUrl: '../test.ts'
        });

        // TODO - map the bindings better

        expect(mappings).toContain(
            {source: '</div>', generated: 'i0.ɵelementEnd()', sourceUrl: '../test.ts'});

        // TODO: the `ctx_r...` appears to be dependent upon previous tests!!!

        // expect(mappings).toContain({
        //   source: '{{ name }}',
        //   generated: 'i0.ɵtextBinding(1, i0.ɵinterpolation1("", ctx_r0.name, ""))',
        //   sourceUrl: '../test.ts'
        // });
      });

      it('should map ng-template [ngIf] scenario', () => {
        const mappings = compileAndMap(
            `<ng-template [ngIf]="showMessage()">\n` +
            `  <div>{{ name }}</div>\n` +
            `  <hr>\n` +
            `</ng-template>`);

        expect(mappings).toContain(
            {source: '<div>', generated: 'i0.ɵelementStart(0, "div")', sourceUrl: '../test.ts'});

        // TODO - map the bindings better

        expect(mappings).toContain(
            {source: '</div>', generated: 'i0.ɵelementEnd()', sourceUrl: '../test.ts'});

        // TODO: the `ctx_r...` appears to be dependent upon previous tests!!!

        // expect(mappings).toContain({
        //   source: '{{ name }}',
        //   generated: 'i0.ɵtextBinding(1, i0.ɵinterpolation1("", ctx_r0.name, ""))',
        //   sourceUrl: '../test.ts'
        // });
      });

      it('should map *ngFor scenario', () => {
        const mappings = compileAndMap(
            '<div *ngFor="let item of items; index as i; trackBy: trackByFn">{{ item }}</div>');

        expect(mappings).toContain({
          source: '<div *ngFor="let item of items; index as i; trackBy: trackByFn">',
          generated: 'i0.ɵelementStart(0, "div")',
          sourceUrl: '../test.ts'
        });

        // TODO - map the bindings better

        expect(mappings).toContain(
            {source: '</div>', generated: 'i0.ɵelementEnd()', sourceUrl: '../test.ts'});

      });

      it('should map ng-template [ngFor] scenario', () => {
        const mappings =
            compileAndMap(`<ng-template ngFor [ngForOf]="items" let-item>{{ item }}</ng-template>`);

        // TODO - map the bindings better
      });
    });

    describe('(content projection)', () => {
      it('should map default and selected projection', () => {
        const mappings = compileAndMap(
            `<h3><ng-content select="title"></ng-content></h3>\n` +
            `<div><ng-content></ng-content></div>`);

        expect(mappings).toContain(
            {source: '<h3>', generated: 'i0.ɵelementStart(0, "h3")', sourceUrl: '../test.ts'});
        expect(mappings).toContain({
          source: '<ng-content select="title">',
          generated: 'i0.ɵprojection(1, 1)',
          sourceUrl: '../test.ts'
        });
        expect(mappings).toContain(
            {source: '</h3>', generated: 'i0.ɵelementEnd()', sourceUrl: '../test.ts'});
        expect(mappings).toContain(
            {source: '<div>', generated: 'i0.ɵelementStart(2, "div")', sourceUrl: '../test.ts'});
        expect(mappings).toContain(
            {source: '<ng-content>', generated: 'i0.ɵprojection(3)', sourceUrl: '../test.ts'});
        expect(mappings).toContain(
            {source: '</div>', generated: 'i0.ɵelementEnd()', sourceUrl: '../test.ts'});
      });
    });

    it('should create (simple string) inline template source-mapping', () => {
      const mappings = compileAndMap('<div>this is a test</div><div>{{ 1 + 2 }}</div>');

      // Creation mode
      expect(mappings).toContain(
          {generated: 'i0.ɵelementStart(0, "div")', source: '<div>', sourceUrl: '../test.ts'});
      expect(mappings).toContain({
        generated: 'i0.ɵtext(1, "this is a test")',
        source: 'this is a test',
        sourceUrl: '../test.ts'
      });
      expect(mappings).toContain(
          {generated: 'i0.ɵelementEnd()', source: '</div>', sourceUrl: '../test.ts'});
      expect(mappings).toContain(
          {generated: 'i0.ɵelementStart(2, "div")', source: '<div>', sourceUrl: '../test.ts'});
      expect(mappings).toContain(
          {generated: 'i0.ɵtext(3)', source: '{{ 1 + 2 }}', sourceUrl: '../test.ts'});
      expect(mappings).toContain(
          {generated: 'i0.ɵelementEnd()', source: '</div>', sourceUrl: '../test.ts'});

      // Update mode
      expect(mappings).toContain({
        generated: 'i0.ɵtextBinding(3, i0.ɵinterpolation1("", (1 + 2), ""))',
        source: '{{ 1 + 2 }}',
        sourceUrl: '../test.ts'
      });
    });

    it('should create (simple backtick string) inline template source-mapping', () => {
      const mappings = compileAndMap('<div>this is a test</div><div>{{ 1 + 2 }}</div>');

      // Creation mode
      expect(mappings).toContain(
          {generated: 'i0.ɵelementStart(0, "div")', source: '<div>', sourceUrl: '../test.ts'});
      expect(mappings).toContain({
        generated: 'i0.ɵtext(1, "this is a test")',
        source: 'this is a test',
        sourceUrl: '../test.ts'
      });
      expect(mappings).toContain(
          {generated: 'i0.ɵelementEnd()', source: '</div>', sourceUrl: '../test.ts'});
      expect(mappings).toContain(
          {generated: 'i0.ɵelementStart(2, "div")', source: '<div>', sourceUrl: '../test.ts'});
      expect(mappings).toContain(
          {generated: 'i0.ɵtext(3)', source: '{{ 1 + 2 }}', sourceUrl: '../test.ts'});
      expect(mappings).toContain(
          {generated: 'i0.ɵelementEnd()', source: '</div>', sourceUrl: '../test.ts'});

      // Update mode
      expect(mappings).toContain({
        generated: 'i0.ɵtextBinding(3, i0.ɵinterpolation1("", (1 + 2), ""))',
        source: '{{ 1 + 2 }}',
        sourceUrl: '../test.ts'
      });
    });

    it('should create correct inline template source-mapping when the source contains escape sequences',
       () => {
         // Note that the escaped double quotes, which need un-escaping to be parsed correctly.
         const mappings = compileAndMap('<div class=\\"some-class\\">this is a test</div>');

         expect(mappings).toContain({
           generated: 'i0.ɵelementStart(0, "div", _c0)',
           source: '<div class=\\"some-class\\">',
           sourceUrl: '../test.ts'
         });

         const c2Mapping =
             mappings.find(mapping => /var _c0 = \[1, "some-class"\];/.test(mapping.generated));
         expect(c2Mapping).toBeDefined();
       });
  });

  if (tsSourceMapBug29300Fixed()) {
    describe('External templates (where TS supports source-mapping)', () => {
      it('should create external template source-mapping', () => {
        const mappings =
            compileAndMap('<div>this is a test</div><div>{{ 1 + 2 }}</div>', './dir/test.html');

        // Creation mode
        expect(mappings).toContain({
          generated: 'i0.ɵelementStart(0, "div")',
          source: '<div>',
          sourceUrl: '../dir/test.html'
        });
        expect(mappings).toContain({
          generated: 'i0.ɵtext(1, "this is a test")',
          source: 'this is a test',
          sourceUrl: '../dir/test.html'
        });
        expect(mappings).toContain(
            {generated: 'i0.ɵelementEnd()', source: '</div>', sourceUrl: '../dir/test.html'});
        expect(mappings).toContain({
          generated: 'i0.ɵelementStart(2, "div")',
          source: '<div>',
          sourceUrl: '../dir/test.html'
        });
        expect(mappings).toContain(
            {generated: 'i0.ɵtext(3)', source: '{{ 1 + 2 }}', sourceUrl: '../dir/test.html'});
        expect(mappings).toContain(
            {generated: 'i0.ɵelementEnd()', source: '</div>', sourceUrl: '../dir/test.html'});

        // Update mode
        expect(mappings).toContain({
          generated: 'i0.ɵtextBinding(3, i0.ɵinterpolation1("", (1 + 2), ""))',
          source: '{{ 1 + 2 }}',
          sourceUrl: '../dir/test.html'
        });
      });

      it('should create correct mappings when templateUrl is in a different rootDir', () => {
        const mappings = compileAndMap(
            '<div>this is a test</div><div>{{ 1 + 2 }}</div>', 'extraRootDir/test.html');

        // Creation mode
        expect(mappings).toContain({
          generated: 'i0.ɵelementStart(0, "div")',
          source: '<div>',
          sourceUrl: '../extraRootDir/test.html'
        });
        expect(mappings).toContain({
          generated: 'i0.ɵtext(1, "this is a test")',
          source: 'this is a test',
          sourceUrl: '../extraRootDir/test.html'
        });
        expect(mappings).toContain({
          generated: 'i0.ɵelementEnd()',
          source: '</div>',
          sourceUrl: '../extraRootDir/test.html'
        });
        expect(mappings).toContain({
          generated: 'i0.ɵelementStart(2, "div")',
          source: '<div>',
          sourceUrl: '../extraRootDir/test.html'
        });
        expect(mappings).toContain({
          generated: 'i0.ɵtext(3)',
          source: '{{ 1 + 2 }}',
          sourceUrl: '../extraRootDir/test.html'
        });
        expect(mappings).toContain({
          generated: 'i0.ɵelementEnd()',
          source: '</div>',
          sourceUrl: '../extraRootDir/test.html'
        });

        // Update mode
        expect(mappings).toContain({
          generated: 'i0.ɵtextBinding(3, i0.ɵinterpolation1("", (1 + 2), ""))',
          source: '{{ 1 + 2 }}',
          sourceUrl: '../extraRootDir/test.html'
        });
      });
    });
  }

  function compileAndMap(template: string, templateUrl: string | null = null) {
    const templateConfig = templateUrl ? `templateUrl: '${templateUrl}'` :
                                         ('template: `' + template.replace(/`/g, '\\`') + '`');
    env.tsconfig({sourceMap: true});
    env.write('test.ts', `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          ${templateConfig}
        })
        export class TestCmp {}
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
          padValue(map.sourceUrl, 20, 0) + ' : ' + padValue(inspect(map.source), 100, 23) + ' : ' +
          inspect(map.generated));
    });
    function padValue(value: string, max: number, start: number) {
      const padding = value.length > max ? ('\n' +
                                            ' '.repeat(max + start)) :
                                           ' '.repeat(max - value.length);
      return value + padding;
    }
  }
});
