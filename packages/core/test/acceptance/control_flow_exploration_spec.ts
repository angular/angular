/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {ɵsetEnabledBlockTypes as setEnabledBlockTypes} from '@angular/compiler/src/jit_compiler_facade';
import {Component, Pipe, PipeTransform} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('control flow', () => {
  // Basic shared pipe used during testing.
  @Pipe({name: 'multiply', pure: true, standalone: true})
  class MultiplyPipe implements PipeTransform {
    transform(value: number, amount: number) {
      return value * amount;
    }
  }

  describe('if', () => {
    beforeEach(() => setEnabledBlockTypes(['if']));
    afterEach(() => setEnabledBlockTypes([]));

    it('should add and remove views based on conditions change', () => {
      @Component({standalone: true, template: '@if (show) {Something} @else {Nothing}'})
      class TestComponent {
        show = true;
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('Something');

      fixture.componentInstance.show = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('Nothing');
    });

    it('should expose expression value in context', () => {
      @Component({
        standalone: true,
        template: '@if (show; as alias) {{{show}} aliased to {{alias}}}',
      })
      class TestComponent {
        show: any = true;
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('true aliased to true');

      fixture.componentInstance.show = 1;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('1 aliased to 1');
    });

    it('should not expose the aliased expression to `if` and `else if` blocks', () => {
      @Component({
        standalone: true,
        template: `
          @if (value === 1; as alias) {
            If: {{value}} as {{alias || 'unavailable'}}
          } @else if (value === 2) {
            ElseIf: {{value}} as {{alias || 'unavailable'}}
          } @else {
            Else: {{value}} as {{alias || 'unavailable'}}
          }
        `,
      })
      class TestComponent {
        value = 1;
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('If: 1 as true');

      fixture.componentInstance.value = 2;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('ElseIf: 2 as unavailable');

      fixture.componentInstance.value = 3;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('Else: 3 as unavailable');
    });

    it('should expose the context to nested conditional blocks', () => {
      @Component({
        standalone: true,
        imports: [MultiplyPipe],
        template: `
          @if (value | multiply:2; as root) {
            Root: {{value}}/{{root}}

            @if (value | multiply:3; as inner) {
              Inner: {{value}}/{{root}}/{{inner}}

              @if (value | multiply:4; as innermost) {
                Innermost: {{value}}/{{root}}/{{inner}}/{{innermost}}
              }
            }
          }
        `,
      })
      class TestComponent {
        value = 1;
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      let content = fixture.nativeElement.textContent;
      expect(content).toContain('Root: 1/2');
      expect(content).toContain('Inner: 1/2/3');
      expect(content).toContain('Innermost: 1/2/3/4');

      fixture.componentInstance.value = 2;
      fixture.detectChanges();
      content = fixture.nativeElement.textContent;
      expect(content).toContain('Root: 2/4');
      expect(content).toContain('Inner: 2/4/6');
      expect(content).toContain('Innermost: 2/4/6/8');
    });

    it('should expose the context to listeners inside nested conditional blocks', () => {
      let logs: any[] = [];

      @Component({
        standalone: true,
        imports: [MultiplyPipe],
        template: `
          @if (value | multiply:2; as root) {
            <button (click)="log(['Root', value, root])"></button>

            @if (value | multiply:3; as inner) {
              <button (click)="log(['Inner', value, root, inner])"></button>

              @if (value | multiply:4; as innermost) {
                <button (click)="log(['Innermost', value, root, inner, innermost])"></button>
              }
            }
          }
        `,
      })
      class TestComponent {
        value = 1;

        log(value: any) {
          logs.push(value);
        }
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      const buttons =
          Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'));
      buttons.forEach(button => button.click());
      fixture.detectChanges();

      expect(logs).toEqual([['Root', 1, 2], ['Inner', 1, 2, 3], ['Innermost', 1, 2, 3, 4]]);

      logs = [];
      fixture.componentInstance.value = 2;
      fixture.detectChanges();

      buttons.forEach(button => button.click());
      fixture.detectChanges();
      expect(logs).toEqual([['Root', 2, 4], ['Inner', 2, 4, 6], ['Innermost', 2, 4, 6, 8]]);
    });

    it('should expose expression value passed through a pipe in context', () => {
      @Component({
        standalone: true,
        template: '@if (value | multiply:2; as alias) {{{value}} aliased to {{alias}}}',
        imports: [MultiplyPipe],
      })
      class TestComponent {
        value = 1;
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('1 aliased to 2');

      fixture.componentInstance.value = 4;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('4 aliased to 8');
    });

    // QUESTION: fundamental mismatch between the "template" and "container" concepts
    // those 2 calls to the ɵɵtemplate instruction will generate comment nodes and LContainer
    it('should destroy all views if there is nothing to display', () => {
      @Component({
        standalone: true,
        template: '@if (show) {Something}',
      })
      class TestComponent {
        show = true;
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('Something');

      fixture.componentInstance.show = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('');
    });

    it('should be able to use pipes in conditional expressions', () => {
      @Component({
        standalone: true,
        imports: [MultiplyPipe],
        template: `
          @if ((value | multiply:2) === 2) {
            one
          } @else if ((value | multiply:2) === 4) {
            two
          } @else {
            nothing
          }
        `,
      })
      class TestComponent {
        value = 0;
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent.trim()).toBe('nothing');

      fixture.componentInstance.value = 2;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('two');

      fixture.componentInstance.value = 1;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('one');
    });
  });

  describe('switch', () => {
    beforeEach(() => setEnabledBlockTypes(['switch']));
    afterEach(() => setEnabledBlockTypes([]));

    // Open question: == vs. === for comparison
    // == is the current Angular implementation
    // === is used by JavaScript semantics
    it('should show a template based on a matching case', () => {
      @Component({
        standalone: true,
        template: `
          @switch (case) {
            @case (0) {case 0}
            @case (1) {case 1}
            @default {default}
          }
        `
      })
      class TestComponent {
        case = 0;
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('case 0');

      fixture.componentInstance.case = 1;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('case 1');

      fixture.componentInstance.case = 5;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('default');
    });

    it('should be able to use a pipe in the switch expression', () => {
      @Component({
        standalone: true,
        imports: [MultiplyPipe],
        template: `
          @switch (case | multiply:2) {
            @case (0) {case 0}
            @case (2) {case 2}
            @default {default}
          }
        `
      })
      class TestComponent {
        case = 0;
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('case 0');

      fixture.componentInstance.case = 1;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('case 2');

      fixture.componentInstance.case = 5;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('default');
    });

    it('should be able to use a pipe in the case expression', () => {
      @Component({
        standalone: true,
        imports: [MultiplyPipe],
        template: `
          @switch (case) {
            @case (1 | multiply:2) {case 2}
            @case (2 | multiply:2) {case 4}
            @default {default}
          }
        `
      })
      class TestComponent {
        case = 0;
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('default');

      fixture.componentInstance.case = 4;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('case 4');

      fixture.componentInstance.case = 2;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('case 2');
    });
  });

  describe('for', () => {
    beforeEach(() => setEnabledBlockTypes(['for', 'if']));
    afterEach(() => setEnabledBlockTypes([]));

    it('should create, remove and move views corresponding to items in a collection', () => {
      @Component({
        template: '@for ((item of items); track item; let idx = $index) {{{item}}({{idx}})|}',
      })
      class TestComponent {
        items = [1, 2, 3];
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('1(0)|2(1)|3(2)|');

      fixture.componentInstance.items.pop();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('1(0)|2(1)|');

      fixture.componentInstance.items.push(3);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('1(0)|2(1)|3(2)|');

      fixture.componentInstance.items[0] = 3;
      fixture.componentInstance.items[2] = 1;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('3(0)|2(1)|1(2)|');
    });

    it('should work correctly with trackBy index', () => {
      @Component({
        template: '@for ((item of items); track idx; let idx = $index) {{{item}}({{idx}})|}',
      })
      class TestComponent {
        items = [1, 2, 3];
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('1(0)|2(1)|3(2)|');

      fixture.componentInstance.items.pop();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('1(0)|2(1)|');

      fixture.componentInstance.items.push(3);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('1(0)|2(1)|3(2)|');

      fixture.componentInstance.items[0] = 3;
      fixture.componentInstance.items[2] = 1;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('3(0)|2(1)|1(2)|');
    });

    it('should support empty blocks', () => {
      @Component({
        template: '@for ((item of items); track idx; let idx = $index) {|} @empty {Empty}',
      })
      class TestComponent {
        items: number[]|null|undefined = [1, 2, 3];
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('|||');

      fixture.componentInstance.items = [];
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('Empty');

      fixture.componentInstance.items = [0, 1];
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('||');

      fixture.componentInstance.items = null;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('Empty');

      fixture.componentInstance.items = [0];
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('|');

      fixture.componentInstance.items = undefined;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('Empty');
    });

    it('should have access to the host context in the track function', () => {
      let offsetReads = 0;

      @Component({template: '@for ((item of items); track $index + offset) {{{item}}}'})
      class TestComponent {
        items = ['a', 'b', 'c'];

        get offset() {
          offsetReads++;
          return 0;
        }
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('abc');
      expect(offsetReads).toBeGreaterThan(0);

      const prevReads = offsetReads;
      // explicitly modify the DOM text node to make sure that the list reconciliation algorithm
      // based on tracking indices overrides it.
      fixture.debugElement.childNodes[1].nativeNode.data = 'x';
      fixture.componentInstance.items.shift();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('bc');
      expect(offsetReads).toBeGreaterThan(prevReads);
    });

    it('should be able to access component properties in the tracking function from a loop at the root of the template',
       () => {
         const calls: string[][] = [];

         @Component({
           template: `@for ((item of items); track trackingFn(item, compProp)) {{{item}}}`,
         })
         class TestComponent {
           items = ['one', 'two', 'three'];
           compProp = 'hello';

           trackingFn(item: string, message: string) {
             calls.push([item, message]);
             return item;
           }
         }

         const fixture = TestBed.createComponent(TestComponent);
         fixture.detectChanges();
         expect(calls).toEqual([
           ['one', 'hello'],
           ['two', 'hello'],
           ['three', 'hello'],
           ['one', 'hello'],
           ['two', 'hello'],
           ['three', 'hello'],
         ]);
       });

    it('should be able to access component properties in the tracking function from a nested template',
       () => {
         const calls: string[][] = [];

         @Component({
           template: `
            @if (true) {
              @if (true) {
                @if (true) {
                  @for ((item of items); track trackingFn(item, compProp)) {{{item}}}
                }
              }
            }
           `,
         })
         class TestComponent {
           items = ['one', 'two', 'three'];
           compProp = 'hello';

           trackingFn(item: string, message: string) {
             calls.push([item, message]);
             return item;
           }
         }

         const fixture = TestBed.createComponent(TestComponent);
         fixture.detectChanges();
         expect(calls).toEqual([
           ['one', 'hello'],
           ['two', 'hello'],
           ['three', 'hello'],
           ['one', 'hello'],
           ['two', 'hello'],
           ['three', 'hello'],
         ]);
       });
  });
});
