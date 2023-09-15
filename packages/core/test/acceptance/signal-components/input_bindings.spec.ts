/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {USE_TEMPLATE_PIPELINE} from '@angular/compiler/src/template/pipeline/switch/index';
import {Component, Directive, input, Input, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';

if (!USE_TEMPLATE_PIPELINE) {
  console.error(
      'ERROR: Cannot run this test target without: --//packages/compiler:use_template_pipeline');
  process.exit(1);
}

describe('Signal component inputs', () => {
  describe('input bindings from signal-based components', () => {
    describe('to signal-based targets', () => {
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

      it('should evaluate expression only once when binding to multiple inputs with the same name',
         () => {
           @Directive({
             selector: '[dir1]',
             standalone: true,
             signals: true,
           })
           class Dir1 {
             @Input() testInputArr = input<string[]>({initialValue: []});
             @Input()
             testInputObj =
                 input<{foo: string, bar: string}>({initialValue: {foo: 'before', bar: 'before'}});
           }

           @Directive({
             selector: '[dir2]',
             standalone: true,
             signals: true,
           })
           class Dir2 {
             @Input() testInputArr = input<string[]>({initialValue: []});
             @Input()
             testInputObj =
                 input<{foo: string, bar: string}>({initialValue: {foo: 'before', bar: 'before'}});
           }

           @Component({
             signals: true,
             template: `
            <div dir1 dir2
              [testInputArr]="['foo', 'bar']"
              [testInputObj]="{foo: 'foo', bar: 'bar'}"
            ></div>`,
             imports: [Dir1, Dir2],
             standalone: true,
           })
           class App {
           }

           const fixture = TestBed.createComponent(App);
           fixture.detectChanges();

           const dir1Instance = fixture.debugElement.children[0].injector.get(Dir1);
           const dir2Instance = fixture.debugElement.children[0].injector.get(Dir2);

           expect(dir1Instance.testInputArr()).toEqual(['foo', 'bar']);
           expect(dir2Instance.testInputArr()).toEqual(['foo', 'bar']);
           expect(dir1Instance.testInputArr()).toBe(dir2Instance.testInputArr());

           expect(dir1Instance.testInputObj()).toEqual({foo: 'foo', bar: 'bar'});
           expect(dir2Instance.testInputObj()).toEqual({foo: 'foo', bar: 'bar'});
           expect(dir1Instance.testInputObj()).toBe(dir2Instance.testInputObj());
         });

      it('should be able to bind a variable', () => {
        @Component({
          template: `
            <print [num]="varFromCtx" />|<print [num]="varFromCtx2()" />
          `,
          signals: true,
          standalone: true,
          imports: [Print],
        })
        class App {
          varFromCtx = 1;
          varFromCtx2 = signal(3);
        }

        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toBe('1|3');

        fixture.componentInstance.varFromCtx2.set(4);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toBe('1|4');
      });

      it('should not evaluate expression if no signal is consumed', () => {
        @Component({
          template: `
            <print [num]="varFromCtx" />|<print [num]="varFromCtx2()" />
          `,
          signals: true,
          standalone: true,
          imports: [Print],
        })
        class App {
          varFromCtx = 1;
          varFromCtx2 = signal(3);
        }

        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toBe('1|3');

        // Even though we change the value here, the `Print#num`
        // binding is not refreshed because no signal was consumed.
        fixture.componentInstance.varFromCtx = 2;
        fixture.componentInstance.varFromCtx2.set(4);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toBe('1|4');
      });
    });

    it('should be able to pass local refs as inputs in expressions', () => {
      @Component({
        standalone: true,
        signals: true,
        template: '{{testInput() != null}}',
        selector: 'test-cmp',
      })
      class TestComponent {
        @Input() testInput = input<HTMLElement>({required: true});
      }

      @Component({
        template: `
            <div #d></div>
            <test-cmp [testInput]="d" />
          `,
        signals: true,
        standalone: true,
        imports: [TestComponent],
      })
      class App {
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('true');
    });

    it('should be able to pass forward local refs as inputs in expressions', () => {
      @Component({
        standalone: true,
        signals: true,
        template: '{{testInput() != null}}',
        selector: 'test-cmp',
      })
      class TestComponent {
        @Input() testInput = input<HTMLElement>({required: true});
      }

      @Component({
        template: `
            <test-cmp [testInput]="d" />
            <div #d></div>
          `,
        signals: true,
        standalone: true,
        imports: [TestComponent],
      })
      class App {
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('true');
    });
  });

  describe('to zone-based targets', () => {
    it('should work if there are preceding elements and no `advance` call', () => {
      @Directive({
        selector: '[dirZone]',
        standalone: true,
        signals: false,
      })
      class DirZone {
        @Input() works = false;
      }

      @Component({
        signals: true,
        template: `
          <div></div>
          <div dirZone [works]="true"></div>`,
        imports: [DirZone],
        standalone: true,
      })
      class App {
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const dirZoneInstance = fixture.debugElement.children[1].injector.get(DirZone);
      expect(dirZoneInstance.works).toBe(true);
    });
  });

  describe('to a mix of zone-based and signal-based targets', () => {
    it('should evaluate expression only once when binding to multiple inputs with the same name',
       () => {
         @Directive({
           selector: '[dirZone]',
           standalone: true,
           signals: false,
         })
         class DirZone {
           @Input() testInputArr: string[] = [];
           @Input() testInputObj = {foo: 'before', bar: 'before'};
         }

         @Directive({
           selector: '[dirSignal]',
           standalone: true,
           signals: true,
         })
         class DirSignal {
           @Input() testInputArr = input<string[]>({initialValue: []});
           @Input()
           testInputObj =
               input<{foo: string, bar: string}>({initialValue: {foo: 'before', bar: 'before'}});
         }

         @Component({
           signals: true,
           template: `
          <div dirZone dirSignal
            [testInputArr]="['foo', 'bar']"
            [testInputObj]="{foo: 'foo', bar: 'bar'}"
          ></div>`,
           imports: [DirZone, DirSignal],
           standalone: true,
         })
         class App {
         }

         const fixture = TestBed.createComponent(App);
         fixture.detectChanges();

         const dirZoneInstance = fixture.debugElement.children[0].injector.get(DirZone);
         const dirSignalInstance = fixture.debugElement.children[0].injector.get(DirSignal);

         expect(dirZoneInstance.testInputArr).toEqual(['foo', 'bar']);
         expect(dirSignalInstance.testInputArr()).toEqual(['foo', 'bar']);
         expect(dirZoneInstance.testInputArr).toBe(dirSignalInstance.testInputArr());

         expect(dirZoneInstance.testInputObj).toEqual({foo: 'foo', bar: 'bar'});
         expect(dirSignalInstance.testInputObj()).toEqual({foo: 'foo', bar: 'bar'});
         expect(dirZoneInstance.testInputObj).toBe(dirSignalInstance.testInputObj());
       });
  });
});
