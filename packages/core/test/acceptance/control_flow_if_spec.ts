/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgFor} from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Directive,
  inject,
  Input,
  OnInit,
  Pipe,
  PipeTransform,
  provideZoneChangeDetection,
  TemplateRef,
  ViewContainerRef,
} from '../../src/core';
import {TestBed} from '../../testing';

// Basic shared pipe used during testing.
@Pipe({name: 'multiply', pure: true})
class MultiplyPipe implements PipeTransform {
  transform(value: number, amount: number) {
    return value * amount;
  }
}

describe('control flow - if', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZoneChangeDetection()],
    });
  });
  it('should add and remove views based on conditions change', () => {
    @Component({template: '@if (show) {Something} @else {Nothing}'})
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
    const buttons = Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'));
    buttons.forEach((button) => button.click());
    fixture.detectChanges();

    expect(logs).toEqual([
      ['Root', 1, 2],
      ['Inner', 1, 2, 3],
      ['Innermost', 1, 2, 3, 4],
    ]);

    logs = [];
    fixture.componentInstance.value = 2;
    fixture.detectChanges();

    buttons.forEach((button) => button.click());
    fixture.detectChanges();
    expect(logs).toEqual([
      ['Root', 2, 4],
      ['Inner', 2, 4, 6],
      ['Innermost', 2, 4, 6, 8],
    ]);
  });

  it('should expose expression value passed through a pipe in context', () => {
    @Component({
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

  it('should destroy all views if there is nothing to display', () => {
    @Component({
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

  it('should be able to use pipes injecting ChangeDetectorRef in if blocks', () => {
    @Pipe({name: 'test'})
    class TestPipe implements PipeTransform {
      changeDetectorRef = inject(ChangeDetectorRef);

      transform(value: any) {
        return value;
      }
    }

    @Component({
      template: '@if (show | test) {Something}',
      imports: [TestPipe],
    })
    class TestComponent {
      show = true;
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('Something');
  });

  it('should support a condition with the a typeof expression', () => {
    @Component({
      template: `
          @if (typeof value === 'string') {
            {{value.length}}
          } @else {
            {{value}}
          }
        `,
    })
    class TestComponent {
      value: string | number = 'string';
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('6');

    fixture.componentInstance.value = 42;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('42');
  });

  it('should support a condition with the a binary expression with the in keyword', () => {
    @Component({
      standalone: true,
      template: `
          @if (key in {foo: 'bar'}) {
            has {{key}}
          } @else {
            no {{key}}
          }
        `,
    })
    class TestComponent {
      key: string | number = 'foo';
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('has foo');

    fixture.componentInstance.key = 42;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('no 42');
  });

  it('should expose expression value through alias on @else if', () => {
    @Component({
      template: `
        @if (value === 0; as alias) {
          Zero evaluates to {{alias}}
        } @else if (value | multiply: 2; as alias) {
          {{value}} aliased to {{alias}}
        }
      `,
      imports: [MultiplyPipe],
    })
    class TestComponent {
      value = 0;
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('Zero evaluates to true');

    fixture.componentInstance.value = 4;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('4 aliased to 8');
  });

  describe('content projection', () => {
    it('should project an @if with a single root node into the root node slot', () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
        <test>Before @if (true) {
          <span foo>foo</span>
        } After</test>
      `,
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('Main: Before  After Slot: foo');
    });

    it('should project an @if with a single root node with a data binding', () => {
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
        <test>Before @if (true) {
          <span [foo]="value">foo</span>
        } After</test>
      `,
      })
      class App {
        value = 1;
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('Main: Before  After Slot: foo');
      expect(directiveCount).toBe(1);
    });

    it('should project an @if with multiple root nodes into the catch-all slot', () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
        <test>Before @if (true) {
          <span foo>one</span>
          <div foo>two</div>
        } After</test>
      `,
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('Main: Before onetwo After Slot: ');
    });

    it('should project an @if with an ng-container root node', () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
        <test>Before @if (true) {
          <ng-container foo>
            <span>foo</span>
            <span>bar</span>
          </ng-container>
        } After</test>
      `,
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('Main: Before  After Slot: foobar');
    });

    // Right now the template compiler doesn't collect comment nodes.
    // This test is to ensure that we don't regress if it happens in the future.
    it('should project an @if with a single root node and comments into the root node slot', () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
        <test>Before @if (true) {
          <!-- before -->
          <span foo>foo</span>
          <!-- after -->
        } After</test>
      `,
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('Main: Before  After Slot: foo');
    });

    it('should project @if an @else content into separate slots', () => {
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
          @if (value) {
            <span if_case>if content</span>
          } @else {
            <span else_case>else content</span>
          }
        </test>
      `,
      })
      class App {
        value = true;
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('if: (if content), else: ()');

      fixture.componentInstance.value = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('if: (), else: (else content)');

      fixture.componentInstance.value = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('if: (if content), else: ()');
    });

    it('should project @if an @else content into separate slots when if has default content', () => {
      @Component({
        selector: 'test',
        template: 'if: (<ng-content />),  else: (<ng-content select="[else_case]"/>)',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
              <test>
                @if (value) {
                  <span>if content</span>
                } @else {
                  <span else_case>else content</span>
                }
              </test>
            `,
      })
      class App {
        value = true;
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('if: (if content), else: ()');

      fixture.componentInstance.value = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('if: (), else: (else content)');

      fixture.componentInstance.value = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('if: (if content), else: ()');
    });

    it('should project @if an @else content into separate slots when else has default content', () => {
      @Component({
        selector: 'test',
        template: 'if: (<ng-content select="[if_case]"/>),  else: (<ng-content/>)',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
        <test>
          @if (value) {
            <span if_case>if content</span>
          } @else {
            <span>else content</span>
          }
        </test>
      `,
      })
      class App {
        value = true;
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('if: (if content), else: ()');

      fixture.componentInstance.value = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('if: (), else: (else content)');

      fixture.componentInstance.value = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('if: (if content), else: ()');
    });

    it('should project the root node when preserveWhitespaces is enabled and there are no whitespace nodes', () => {
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

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('Main: Before  After Slot: one');
    });

    it('should not project the root node when preserveWhitespaces is enabled and there are whitespace nodes', () => {
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
            <test>Before @if (true) {
              <span foo>one</span>
            } After</test>
          `,
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toMatch(/Main: Before\s+one\s+After Slot:/);
    });

    it('should not project the root node across multiple layers of @if', () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
        <test>Before @if (true) {
          @if (true) {
            <span foo>one</span>
          }
        } After</test>
      `,
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toMatch(/Main: Before\s+one\s+After Slot:/);
    });

    it('should project an @if with a single root template node into the root node slot', () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent, NgFor],
        template: `<test>Before @if (true) {
        <span *ngFor="let item of items" foo>{{item}}</span>
      } After</test>`,
      })
      class App {
        items = [1, 2];
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('Main: Before  After Slot: 12');

      fixture.componentInstance.items.push(3);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('Main: Before  After Slot: 123');
    });

    it('should invoke a projected attribute directive at the root of an @if once', () => {
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
        template: `<test>Before @if (true) {
        <span foo>foo</span>
      } After</test>
      `,
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(directiveCount).toBe(1);
      expect(fixture.nativeElement.textContent).toBe('Main: Before  After Slot: foo');
    });

    it('should invoke a projected template directive at the root of an @if once', () => {
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
        template: `<test>Before @if (true) {
        <span *templateDir foo>foo</span>
      } After</test>
      `,
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(directiveCount).toBe(1);
      expect(fixture.nativeElement.textContent).toBe('Main: Before  After Slot: foo');
    });

    it('should invoke a directive on a projected ng-template at the root of an @if once', () => {
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
        template: `<test>Before @if (true) {
          <ng-template templateDir foo>foo</ng-template>
      } After</test>
      `,
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(directiveCount).toBe(1);
      expect(fixture.nativeElement.textContent).toBe('Main: Before  After Slot: foo');
    });

    it('should not match a directive with a class-based selector only meant for content projection', () => {
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
        template: `<test>Before @if (condition) {
          <div class="foo">foo</div>
      } After</test>
      `,
      })
      class App {
        condition = false;
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(directiveCount).toBe(0);
      expect(fixture.nativeElement.textContent).toBe('Main: Before  After Slot: ');

      fixture.componentInstance.condition = true;
      fixture.detectChanges();

      expect(directiveCount).toBe(1);
      expect(fixture.nativeElement.textContent).toBe('Main: Before  After Slot: foo');
    });

    it('should not project an @if that has text followed by one element node at the root', () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
          <test>
            @if (true) {Hello <span foo>world</span>}
          </test>
        `,
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('Main: Hello world Slot: ');
    });

    it('should project an @if with a single root node and @let declarations into the root node slot', () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
        <test>Before @if (true) {
          @let a = 1;
          @let b = a + 1;
          <span foo>{{b}}</span>
        } After</test>
      `,
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('Main: Before  After Slot: 2');
    });
  });
});
