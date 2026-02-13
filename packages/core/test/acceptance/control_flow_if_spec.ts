/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgFor} from '@angular/common';
import {expectScreenText} from '@angular/private/testing';

import {
  ChangeDetectorRef,
  Component,
  Directive,
  inject,
  Input,
  OnInit,
  Pipe,
  PipeTransform,
  signal,
  TemplateRef,
  ViewContainerRef,
} from '../../src/core';
import {TestBed} from '../../testing';
import {waitFor} from '@testing-library/dom';

// Basic shared pipe used during testing.
@Pipe({name: 'multiply', pure: true})
class MultiplyPipe implements PipeTransform {
  transform(value: number, amount: number) {
    return value * amount;
  }
}

describe('control flow - if', () => {
  it('should add and remove views based on conditions change', async () => {
    @Component({template: '@if (show()) {Something} @else {Nothing}'})
    class TestComponent {
      show = signal(true);
    }

    const fixture = TestBed.createComponent(TestComponent);
    await expectScreenText('Something');

    fixture.componentInstance.show.set(false);
    await expectScreenText('Nothing');
  });

  it('should expose expression value in context', async () => {
    @Component({
      template: '@if (show(); as alias) {{{show()}} aliased to {{alias}}}',
    })
    class TestComponent {
      show = signal<any>(true);
    }

    const fixture = TestBed.createComponent(TestComponent);
    await expectScreenText('true aliased to true');

    fixture.componentInstance.show.set(1);
    await expectScreenText('1 aliased to 1');
  });

  it('should not expose the aliased expression to `if` and `else if` blocks', async () => {
    @Component({
      template: `
        @if (value() === 1; as alias) {
          If: {{ value() }} as {{ alias || 'unavailable' }}
        } @else if (value() === 2) {
          ElseIf: {{ value() }} as {{ alias || 'unavailable' }}
        } @else {
          Else: {{ value() }} as {{ alias || 'unavailable' }}
        }
      `,
    })
    class TestComponent {
      value = signal(1);
    }

    const fixture = TestBed.createComponent(TestComponent);
    await expectScreenText('If: 1 as true');

    fixture.componentInstance.value.set(2);
    await expectScreenText('ElseIf: 2 as unavailable');

    fixture.componentInstance.value.set(3);
    await expectScreenText('Else: 3 as unavailable');
  });

  it('should expose the context to nested conditional blocks', async () => {
    @Component({
      imports: [MultiplyPipe],
      template: `
        @if (value() | multiply: 2; as root) {
          Root: {{ value() }}/{{ root }}

          @if (value() | multiply: 3; as inner) {
            Inner: {{ value() }}/{{ root }}/{{ inner }}

            @if (value() | multiply: 4; as innermost) {
              Innermost: {{ value() }}/{{ root }}/{{ inner }}/{{ innermost }}
            }
          }
        }
      `,
    })
    class TestComponent {
      value = signal(1);
    }

    const fixture = TestBed.createComponent(TestComponent);
    await expectScreenText('Root: 1/2');
    await expectScreenText('Inner: 1/2/3');
    await expectScreenText('Innermost: 1/2/3/4');

    fixture.componentInstance.value.set(2);
    await expectScreenText('Root: 2/4');
    await expectScreenText('Inner: 2/4/6');
    await expectScreenText('Innermost: 2/4/6/8');
  });

  it('should expose the context to listeners inside nested conditional blocks', async () => {
    let logs: any[] = [];

    @Component({
      imports: [MultiplyPipe],
      template: `
        @if (value() | multiply: 2; as root) {
          <button (click)="log(['Root', value(), root])">Root {{ value() }}</button>

          @if (value() | multiply: 3; as inner) {
            <button (click)="log(['Inner', value(), root, inner])">Inner {{ value() }}</button>

            @if (value() | multiply: 4; as innermost) {
              <button (click)="log(['Innermost', value(), root, inner, innermost])">
                Innermost {{ value() }}
              </button>
            }
          }
        }
      `,
    })
    class TestComponent {
      value = signal(1);

      log(value: any) {
        logs.push(value);
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    await expectScreenText('Root 1');

    let buttons = Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'));
    buttons.forEach((button) => button.click());

    await waitFor(() =>
      throwUnless(logs).toEqual([
        ['Root', 1, 2],
        ['Inner', 1, 2, 3],
        ['Innermost', 1, 2, 3, 4],
      ]),
    );

    logs = [];
    fixture.componentInstance.value.set(2);
    await expectScreenText('Root 2');

    buttons = Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'));
    buttons.forEach((button) => button.click());

    await waitFor(() =>
      throwUnless(logs).toEqual([
        ['Root', 2, 4],
        ['Inner', 2, 4, 6],
        ['Innermost', 2, 4, 6, 8],
      ]),
    );
  });

  it('should expose expression value passed through a pipe in context', async () => {
    @Component({
      template: '@if (value() | multiply:2; as alias) {{{value()}} aliased to {{alias}}}',
      imports: [MultiplyPipe],
    })
    class TestComponent {
      value = signal(1);
    }

    const fixture = TestBed.createComponent(TestComponent);
    await expectScreenText('1 aliased to 2');

    fixture.componentInstance.value.set(4);
    await expectScreenText('4 aliased to 8');
  });

  it('should destroy all views if there is nothing to display', async () => {
    @Component({
      template: '@if (show()) {Something}',
    })
    class TestComponent {
      show = signal(true);
    }

    const fixture = TestBed.createComponent(TestComponent);
    await expectScreenText('Something');

    fixture.componentInstance.show.set(false);
    await waitFor(() => throwUnless(fixture.nativeElement.textContent).toBe(''));
  });

  it('should be able to use pipes in conditional expressions', async () => {
    @Component({
      imports: [MultiplyPipe],
      template: `
        @if ((value() | multiply: 2) === 2) {
          one
        } @else if ((value() | multiply: 2) === 4) {
          two
        } @else {
          nothing
        }
      `,
    })
    class TestComponent {
      value = signal(0);
    }

    const fixture = TestBed.createComponent(TestComponent);
    await expectScreenText('nothing');

    fixture.componentInstance.value.set(2);
    await expectScreenText('two');

    fixture.componentInstance.value.set(1);
    await expectScreenText('one');
  });

  it('should be able to use pipes injecting ChangeDetectorRef in if blocks', async () => {
    @Pipe({name: 'test'})
    class TestPipe implements PipeTransform {
      changeDetectorRef = inject(ChangeDetectorRef);

      transform(value: any) {
        return value;
      }
    }

    @Component({
      template: '@if (show() | test) {Something}',
      imports: [TestPipe],
    })
    class TestComponent {
      show = signal(true);
    }

    TestBed.createComponent(TestComponent);
    await expectScreenText('Something');
  });

  it('should support a condition with the a typeof expression', async () => {
    @Component({
      template: `
        @if (typeof value() === 'string') {
          {{ value().length }}
        } @else {
          {{ value() }}
        }
      `,
    })
    class TestComponent {
      value = signal<string | number>('string');
    }

    const fixture = TestBed.createComponent(TestComponent);
    await expectScreenText('6');

    fixture.componentInstance.value.set(42);
    await expectScreenText('42');
  });

  it('should support a condition with the a binary expression with the in keyword', async () => {
    @Component({
      template: `
        @if (key() in {foo: 'bar'}) {
          has {{ key() }}
        } @else {
          no {{ key() }}
        }
      `,
    })
    class TestComponent {
      key = signal<string | number>('foo');
    }

    const fixture = TestBed.createComponent(TestComponent);
    await expectScreenText('has foo');

    fixture.componentInstance.key.set(42);
    await expectScreenText('no 42');
  });

  it('should support a condition with the instanceof keyword', async () => {
    class Foo {}

    // prettier-ignore
    @Component({
      template: `
        @if (value() instanceof Foo) {
          is Foo
        } @else {
          is not Foo
        }
      `,
    })
    class TestComponent {
      Foo = Foo;
      value = signal<string | Foo>(new Foo());
    }

    const fixture = TestBed.createComponent(TestComponent);
    await expectScreenText('is Foo');

    fixture.componentInstance.value.set('not a Foo');
    await expectScreenText('is not Foo');
  });

  it('should expose expression value through alias on @else if', async () => {
    @Component({
      template: `
        @if (value() === 0; as alias) {
          Zero evaluates to {{ alias }}
        } @else if (value() | multiply: 2; as alias) {
          {{ value() }} aliased to {{ alias }}
        }
      `,
      imports: [MultiplyPipe],
    })
    class TestComponent {
      value = signal(0);
    }

    const fixture = TestBed.createComponent(TestComponent);
    await expectScreenText('Zero evaluates to true');

    fixture.componentInstance.value.set(4);
    await expectScreenText('4 aliased to 8');
  });

  describe('content projection', () => {
    it('should project an @if with a single root node into the root node slot', async () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
          <test
            >Before
            @if (true) {
              <span foo>foo</span>
            }
            After</test
          >
        `,
      })
      class App {}

      TestBed.createComponent(App);
      await expectScreenText('Main: Before  After Slot: foo');
    });

    it('should project an @if with a single root node with a data binding', async () => {
      let directiveCount = 0;

      @Directive({selector: '[foo]'})
      class Foo {
        @Input('foo') value: any;

        constructor() {
          directiveCount++;
        }
      }

      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent, Foo],
        template: `
          <test
            >Before
            @if (true) {
              <span [foo]="value()">foo</span>
            }
            After</test
          >
        `,
      })
      class App {
        value = signal(1);
      }

      TestBed.createComponent(App);
      await expectScreenText('Main: Before  After Slot: foo');
      await waitFor(() => throwUnless(directiveCount).toBe(1));
    });

    it('should project an @if with multiple root nodes into the catch-all slot', async () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
          <test
            >Before
            @if (true) {
              <span foo>one</span>
              <div foo>two</div>
            }
            After</test
          >
        `,
      })
      class App {}

      TestBed.createComponent(App);
      await expectScreenText('Main: Before onetwo After Slot: ');
    });

    it('should project an @if with an ng-container root node', async () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
          <test
            >Before
            @if (true) {
              <ng-container foo>
                <span>foo</span>
                <span>bar</span>
              </ng-container>
            }
            After</test
          >
        `,
      })
      class App {}

      TestBed.createComponent(App);
      await expectScreenText('Main: Before  After Slot: foobar');
    });

    it('should project an @if with a single root node and comments into the root node slot', async () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
          <test
            >Before
            @if (true) {
              <!-- before -->
              <span foo>foo</span>
              <!-- after -->
            }
            After</test
          >
        `,
      })
      class App {}

      TestBed.createComponent(App);
      await expectScreenText('Main: Before  After Slot: foo');
    });

    it('should project @if an @else content into separate slots', async () => {
      @Component({
        selector: 'test',
        template:
          'if: (<ng-content select="[if_case]"/>),  else: (<ng-content select="[else_case]"/>)',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
          <test>
            @if (value()) {
              <span if_case>if content</span>
            } @else {
              <span else_case>else content</span>
            }
          </test>
        `,
      })
      class App {
        value = signal(true);
      }

      const fixture = TestBed.createComponent(App);
      await expectScreenText('if: (if content), else: ()');

      fixture.componentInstance.value.set(false);
      await expectScreenText('if: (), else: (else content)');

      fixture.componentInstance.value.set(true);
      await expectScreenText('if: (if content), else: ()');
    });

    it('should project @if an @else content into separate slots when if has default content', async () => {
      @Component({
        selector: 'test',
        template: 'if: (<ng-content />),  else: (<ng-content select="[else_case]"/>)',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
          <test>
            @if (value()) {
              <span>if content</span>
            } @else {
              <span else_case>else content</span>
            }
          </test>
        `,
      })
      class App {
        value = signal(true);
      }

      const fixture = TestBed.createComponent(App);
      await expectScreenText('if: (if content), else: ()');

      fixture.componentInstance.value.set(false);
      await expectScreenText('if: (), else: (else content)');

      fixture.componentInstance.value.set(true);
      await expectScreenText('if: (if content), else: ()');
    });

    it('should project @if an @else content into separate slots when else has default content', async () => {
      @Component({
        selector: 'test',
        template: 'if: (<ng-content select="[if_case]"/>),  else: (<ng-content/>)',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
          <test>
            @if (value()) {
              <span if_case>if content</span>
            } @else {
              <span>else content</span>
            }
          </test>
        `,
      })
      class App {
        value = signal(true);
      }

      const fixture = TestBed.createComponent(App);
      await expectScreenText('if: (if content), else: ()');

      fixture.componentInstance.value.set(false);
      await expectScreenText('if: (), else: (else content)');

      fixture.componentInstance.value.set(true);
      await expectScreenText('if: (if content), else: ()');
    });

    it('should project the root node when preserveWhitespaces is enabled and there are no whitespace nodes', async () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        preserveWhitespaces: true,
        template: '<test>Before @if (true) {<span foo>one</span>} After</test>',
      })
      class App {}

      TestBed.createComponent(App);
      await expectScreenText('Main: Before  After Slot: one');
    });

    it('should not project the root node when preserveWhitespaces is enabled and there are whitespace nodes', async () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        preserveWhitespaces: true,
        // Note the whitespace due to the indentation inside @if.
        template: `
          <test
            >Before
            @if (true) {
              <span foo>one</span>
            }
            After</test
          >
        `,
      })
      class App {}

      TestBed.createComponent(App);
      await expectScreenText(/Main: Before\s+one\s+After Slot:/);
    });

    it('should not project the root node across multiple layers of @if', async () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
          <test
            >Before
            @if (true) {
              @if (true) {
                <span foo>one</span>
              }
            }
            After</test
          >
        `,
      })
      class App {}

      TestBed.createComponent(App);
      await expectScreenText(/Main: Before\s+one\s+After Slot:/);
    });

    it('should project an @if with a single root template node into the root node slot', async () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent, NgFor],
        template: `<test
          >Before
          @if (true) {
            <span *ngFor="let item of items()" foo>{{ item }}</span>
          }
          After</test
        >`,
      })
      class App {
        items = signal([1, 2]);
      }

      const fixture = TestBed.createComponent(App);
      await expectScreenText('Main: Before  After Slot: 12');

      fixture.componentInstance.items.update((items) => [...items, 3]);
      await expectScreenText('Main: Before  After Slot: 123');
    });

    it('should invoke a projected attribute directive at the root of an @if once', async () => {
      let directiveCount = 0;

      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Directive({
        selector: '[foo]',
      })
      class FooDirective {
        constructor() {
          directiveCount++;
        }
      }

      @Component({
        imports: [TestComponent, FooDirective],
        template: `<test
          >Before
          @if (true) {
            <span foo>foo</span>
          }
          After</test
        > `,
      })
      class App {}

      TestBed.createComponent(App);
      await expectScreenText('Main: Before  After Slot: foo');
      await waitFor(() => throwUnless(directiveCount).toBe(1));
    });

    it('should invoke a projected template directive at the root of an @if once', async () => {
      let directiveCount = 0;

      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Directive({
        selector: '[templateDir]',
      })
      class TemplateDirective implements OnInit {
        constructor(
          private viewContainerRef: ViewContainerRef,
          private templateRef: TemplateRef<any>,
        ) {
          directiveCount++;
        }

        ngOnInit(): void {
          const view = this.viewContainerRef.createEmbeddedView(this.templateRef);
          this.viewContainerRef.insert(view);
        }
      }

      @Component({
        imports: [TestComponent, TemplateDirective],
        template: `<test
          >Before
          @if (true) {
            <span *templateDir foo>foo</span>
          }
          After</test
        > `,
      })
      class App {}

      TestBed.createComponent(App);
      await expectScreenText('Main: Before  After Slot: foo');
      await waitFor(() => throwUnless(directiveCount).toBe(1));
    });

    it('should invoke a directive on a projected ng-template at the root of an @if once', async () => {
      let directiveCount = 0;

      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Directive({
        selector: '[templateDir]',
      })
      class TemplateDirective implements OnInit {
        constructor(
          private viewContainerRef: ViewContainerRef,
          private templateRef: TemplateRef<any>,
        ) {
          directiveCount++;
        }

        ngOnInit(): void {
          const view = this.viewContainerRef.createEmbeddedView(this.templateRef);
          this.viewContainerRef.insert(view);
        }
      }

      @Component({
        imports: [TestComponent, TemplateDirective],
        template: `<test
          >Before
          @if (true) {
            <ng-template templateDir foo>foo</ng-template>
          }
          After</test
        > `,
      })
      class App {}

      TestBed.createComponent(App);
      await expectScreenText('Main: Before  After Slot: foo');
      await waitFor(() => throwUnless(directiveCount).toBe(1));
    });

    it('should not match a directive with a class-based selector only meant for content projection', async () => {
      let directiveCount = 0;

      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select=".foo"/>',
      })
      class TestComponent {}

      @Directive({
        selector: '.foo',
      })
      class TemplateDirective {
        constructor() {
          directiveCount++;
        }
      }

      @Component({
        imports: [TestComponent, TemplateDirective],
        template: `<test
          >Before
          @if (condition()) {
            <div class="foo">foo</div>
          }
          After</test
        > `,
      })
      class App {
        condition = signal(false);
      }

      const fixture = TestBed.createComponent(App);
      await expectScreenText('Main: Before  After Slot: ');
      await waitFor(() => throwUnless(directiveCount).toBe(0));

      fixture.componentInstance.condition.set(true);
      await expectScreenText('Main: Before  After Slot: foo');
      await waitFor(() => throwUnless(directiveCount).toBe(1));
    });

    it('should not project an @if that has text followed by one element node at the root', async () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
          <test>
            @if (true) {
              Hello <span foo>world</span>
            }
          </test>
        `,
      })
      class App {}

      TestBed.createComponent(App);
      await expectScreenText('Main:  Hello world Slot: ');
    });

    it('should project an @if with a single root node and @let declarations into the root node slot', async () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
          <test
            >Before
            @if (true) {
              @let a = 1;
              @let b = a + 1;
              <span foo>{{ b }}</span>
            }
            After</test
          >
        `,
      })
      class App {}

      TestBed.createComponent(App);
      await expectScreenText('Main: Before  After Slot: 2');
    });
  });
});
