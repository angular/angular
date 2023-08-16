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
  describe('if', () => {
    beforeEach(() => setEnabledBlockTypes(['if']));
    afterEach(() => setEnabledBlockTypes([]));

    // Basic shared pipe used during testing.
    @Pipe({name: 'multiply', pure: true, standalone: true})
    class MultiplyPipe implements PipeTransform {
      transform(value: number, amount: number) {
        return value * amount;
      }
    }

    it('should add and remove views based on conditions change', () => {
      @Component({standalone: true, template: '{#if show}Something{:else}Nothing{/if}'})
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
        template: '{#if show; as alias}{{show}} aliased to {{alias}}{/if}',
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
          {#if value === 1; as alias}
            If: {{value}} as {{alias || 'unavailable'}}
            {:else if value === 2} ElseIf: {{value}} as {{alias || 'unavailable'}}
            {:else} Else: {{value}} as {{alias || 'unavailable'}}
          {/if}
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
          {#if value | multiply:2; as root}
            Root: {{value}}/{{root}}
            {#if value | multiply:3; as inner}
              Inner: {{value}}/{{root}}/{{inner}}
              {#if value | multiply:4; as innermost}
                Innermost: {{value}}/{{root}}/{{inner}}/{{innermost}}
              {/if}
            {/if}
          {/if}
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
          {#if value | multiply:2; as root}
            <button (click)="log(['Root', value, root])"></button>

            {#if value | multiply:3; as inner}
              <button (click)="log(['Inner', value, root, inner])"></button>

              {#if value | multiply:4; as innermost}
                <button (click)="log(['Innermost', value, root, inner, innermost])"></button>
              {/if}
            {/if}
          {/if}
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
        template: '{#if value | multiply:2; as alias}{{value}} aliased to {{alias}}{/if}',
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
        template: '{#if show}Something{/if}',
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
          {#switch case}
            {:case 0}case 0
            {:case 1}case 1
            {:default}default
          {/switch}
        `
      })
      class TestComponent {
        case = 0;
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('case 0 ');

      fixture.componentInstance.case = 1;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('case 1 ');

      fixture.componentInstance.case = 5;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('default ');
    });
  });
});
