/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {USE_TEMPLATE_PIPELINE} from '@angular/compiler/src/template/pipeline/switch/index';
import {Component, Directive, input, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';

import {Input} from '../../../src/metadata';


if (!USE_TEMPLATE_PIPELINE) {
  console.error(
      'ERROR: Cannot run this test target without: --//packages/compiler:use_template_pipeline');
  process.exit(1);
}

describe('Signal component inputs', () => {
  describe('input bindings from signal based components', () => {
    describe('to signal based components', () => {
      @Component({
        selector: 'print',
        signals: true,
        template: `{{num()}}`,
        standalone: true,
      })
      class Print {
        @Input() num = input(0);
      }

      it('should bind literal values', () => {
        @Component({
          signals: true,
          // TODO: why aren't we failing for the unclosed <print> tag?
          template: `<print [num]="3">`,
          imports: [Print],
          standalone: true,
        })
        class App {
        }

        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toBe('3');
      });


      it('should bind signal values', () => {
        @Component({
          signals: true,
          template: `<print [num]="num()">`,
          imports: [Print],
          standalone: true,
        })
        class App {
          num = signal(3);
        }

        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toBe('3');

        fixture.componentInstance.num.set(4);
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toBe('4');
      });

      it('should bind to multiple directives matching on the same node', () => {
        @Directive({
          selector: '[dir1]',
          standalone: true,
          signals: true,
        })
        class Dir1 {
          @Input() testInput = input('');
        }

        @Directive({
          selector: '[dir2]',
          standalone: true,
          signals: true,
        })
        class Dir2 {
          @Input() testInput = input('');
        }

        @Component({
          signals: true,
          template: `<div dir1 dir2 [testInput]="name()"></div>`,
          imports: [Dir1, Dir2],
          standalone: true,
        })
        class App {
          name = signal('Angular');
        }

        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        const dir1Instance = fixture.debugElement.children[0].injector.get(Dir1);
        const dir2Instance = fixture.debugElement.children[0].injector.get(Dir2);

        expect(dir1Instance.testInput()).toBe('Angular');
        expect(dir2Instance.testInput()).toBe('Angular');

        fixture.componentInstance.name.set('Reactive Angular');
        expect(dir1Instance.testInput()).toBe('Reactive Angular');
        expect(dir2Instance.testInput()).toBe('Reactive Angular');
      });

      it('should bind inputs when a target shows up multiple times in a template', () => {
        @Component({
          signals: true,
          template: `<print [num]="num()"></print>:<print [num]="num() * 2"></print>
          `,
          imports: [Print],
          standalone: true,
        })
        class App {
          num = signal(3);
        }

        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toBe('3:6');

        fixture.componentInstance.num.set(4);
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toBe('4:8');
      });

      it('should support usage of the same input in different views', () => {
        @Component({
          signals: true,
          selector: 'uses-print',
          template: `<print [num]="num()"></print>`,
          imports: [Print],
          standalone: true,
        })
        class UsesPrint {
          num = signal(3);
        }

        @Component({
          signals: true,
          template: `<uses-print/>:<uses-print/>`,
          imports: [UsesPrint],
          standalone: true,
        })
        class App {
        }

        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toBe('3:3');
      });

      xit('should reveal dragon no 1: shared expression value for non-primitive literals', () => {
        @Directive({
          selector: '[dir1]',
          standalone: true,
          signals: true,
        })
        class Dir1 {
          @Input() testInput = input<string[]>({initialValue: []});
        }

        @Directive({
          selector: '[dir2]',
          standalone: true,
          signals: true,
        })
        class Dir2 {
          @Input() testInput = input<string[]>({initialValue: []});
        }

        @Component({
          signals: true,
          template: `<div dir1 dir2 [testInput]="['foo', 'bar']"></div>`,
          imports: [Dir1, Dir2],
          standalone: true,
        })
        class App {
        }

        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        const dir1Instance = fixture.debugElement.children[0].injector.get(Dir1);
        const dir2Instance = fixture.debugElement.children[0].injector.get(Dir2);

        expect(dir1Instance.testInput()).toEqual(['foo', 'bar']);
        expect(dir2Instance.testInput()).toEqual(['foo', 'bar']);
        expect(dir1Instance.testInput()).toBe(dir2Instance.testInput());
      });

      /*

Error: AssertionError: unresolved LexicalRead of i


 cannot bind to lexical read, implicit receiver read without function
 call expression.

      */
      xit('should be able to bind to local refs in expressions', () => {
        @Component({
          standalone: true,
          signals: true,
          template: '{{elementBinding() !== undefined}}',
          selector: 'whatever',
        })
        class Whatever {
          @Input() elementBinding = input<HTMLElement>({required: true});
        }

        @Component({
          template: `
            <whatever [elementBinding]="varx">
          `,
          signals: true,
          standalone: true,
          imports: [Whatever],
        })
        class App {
          varx = () => (true);
        }

        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toBe('true');
      });
    });

    // TODO:
    // - binding of regular variables?
  });
});
