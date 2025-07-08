/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgIf} from '@angular/common';
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

describe('control flow - for', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZoneChangeDetection()],
    });
  });
  it('should create, remove and move views corresponding to items in a collection', () => {
    @Component({
      template: '@for ((item of items); track item; let idx = $index) {{{item}}({{idx}})|}',
      standalone: false,
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

  it('should loop over iterators that can be iterated over only once', () => {
    @Component({
      template: '@for ((item of items.keys()); track $index) {{{item}}|}',
      standalone: false,
    })
    class TestComponent {
      items = new Map([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ]);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('a|b|c|');
  });

  it('should work correctly with trackBy index', () => {
    @Component({
      template: '@for ((item of items); track idx; let idx = $index) {{{item}}({{idx}})|}',
      standalone: false,
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
      standalone: false,
    })
    class TestComponent {
      items: number[] | null | undefined = [1, 2, 3];
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

  it('should be able to use pipes injecting ChangeDetectorRef in for loop blocks', () => {
    @Pipe({name: 'test'})
    class TestPipe implements PipeTransform {
      changeDetectorRef = inject(ChangeDetectorRef);

      transform(value: any) {
        return value;
      }
    }

    @Component({
      template: '@for (item of items | test; track item;) {{{item}}|}',
      imports: [TestPipe],
    })
    class TestComponent {
      items = [1, 2, 3];
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('1|2|3|');
  });

  it('should be able to access a directive property that is reassigned in a lifecycle hook', () => {
    @Directive({
      selector: '[dir]',
      exportAs: 'dir',
    })
    class Dir {
      data = [1];

      ngDoCheck() {
        this.data = [2];
      }
    }

    @Component({
      selector: 'app-root',
      imports: [Dir],
      template: `
        <div [dir] #dir="dir"></div>

        @for (x of dir.data; track $index) {
          {{x}}
        }
      `,
    })
    class TestComponent {}

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('2');
  });

  it('should expose variables both under their real names and aliases', () => {
    @Component({
      template:
        '@for ((item of items); track item; let idx = $index) {{{item}}({{$index}}/{{idx}})|}',
      standalone: false,
    })
    class TestComponent {
      items = [1, 2, 3];
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('1(0/0)|2(1/1)|3(2/2)|');

    fixture.componentInstance.items.splice(1, 1);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('1(0/0)|3(1/1)|');
  });

  describe('trackBy', () => {
    it('should have access to the host context in the track function', () => {
      let offsetReads = 0;

      @Component({
        template: '@for ((item of items); track $index + offset) {{{item}}}',
        standalone: false,
      })
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

    it('should be able to access component properties in the tracking function from a loop at the root of the template', () => {
      const calls = new Set();

      @Component({
        template: `@for ((item of items); track trackingFn(item, compProp)) {{{item}}}`,
        standalone: false,
      })
      class TestComponent {
        items = ['a', 'b'];
        compProp = 'hello';

        trackingFn(item: string, message: string) {
          calls.add(`${item}:${message}`);
          return item;
        }
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect([...calls].sort()).toEqual(['a:hello', 'b:hello']);
    });

    it('should be able to access component properties in the tracking function from a nested template', () => {
      const calls = new Set();

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
        standalone: false,
      })
      class TestComponent {
        items = ['a', 'b'];
        compProp = 'hello';

        trackingFn(item: string, message: string) {
          calls.add(`${item}:${message}`);
          return item;
        }
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect([...calls].sort()).toEqual(['a:hello', 'b:hello']);
    });

    it('should invoke method tracking function with the correct context', () => {
      let context = null as TestComponent | null;

      @Component({
        template: `@for (item of items; track trackingFn($index, item)) {{{item}}}`,
        standalone: false,
      })
      class TestComponent {
        items = ['a', 'b'];

        trackingFn(_index: number, item: string) {
          context = this;
          return item;
        }
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(context).toBe(fixture.componentInstance);
    });

    it('should warn about duplicated keys when using arrays', () => {
      @Component({
        template: `@for (item of items; track item) {{{item}}}`,
        standalone: false,
      })
      class TestComponent {
        items = ['a', 'b', 'a', 'c', 'a'];
      }

      spyOn(console, 'warn');

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('abaca');
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        jasmine.stringContaining(
          `NG0955: The provided track expression resulted in duplicated keys for a given collection.`,
        ),
      );
      expect(console.warn).toHaveBeenCalledWith(
        jasmine.stringContaining(
          `Adjust the tracking expression such that it uniquely identifies all the items in the collection. `,
        ),
      );
      expect(console.warn).toHaveBeenCalledWith(
        jasmine.stringContaining(`key "a" at index "0" and "2"`),
      );
      expect(console.warn).toHaveBeenCalledWith(
        jasmine.stringContaining(`key "a" at index "2" and "4"`),
      );
    });

    it('should warn about duplicated keys when using iterables', () => {
      @Component({
        template: `@for (item of items.values(); track item) {{{item}}}`,
        standalone: false,
      })
      class TestComponent {
        items = new Map([
          [1, 'a'],
          [2, 'b'],
          [3, 'a'],
          [4, 'c'],
          [5, 'a'],
        ]);
      }

      spyOn(console, 'warn');

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('abaca');
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        jasmine.stringContaining(
          `NG0955: The provided track expression resulted in duplicated keys for a given collection.`,
        ),
      );
      expect(console.warn).toHaveBeenCalledWith(
        jasmine.stringContaining(
          `Adjust the tracking expression such that it uniquely identifies all the items in the collection. `,
        ),
      );
      expect(console.warn).toHaveBeenCalledWith(
        jasmine.stringContaining(`key "a" at index "0" and "2"`),
      );
      expect(console.warn).toHaveBeenCalledWith(
        jasmine.stringContaining(`key "a" at index "2" and "4"`),
      );
    });

    it('should warn about duplicate keys when keys are expressed as symbols', () => {
      const value = Symbol('a');

      @Component({
        template: `@for (item of items.values(); track item) {}`,
        standalone: false,
      })
      class TestComponent {
        items = new Map([
          [1, value],
          [2, value],
        ]);
      }

      spyOn(console, 'warn');

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(console.warn).toHaveBeenCalledWith(
        jasmine.stringContaining(`Symbol(a)" at index "0" and "1".`),
      );
    });

    it('should not warn about duplicate keys iterating over the new collection only', () => {
      @Component({
        template: `@for (item of items; track item) {}`,
        standalone: false,
      })
      class TestComponent {
        items = [1, 2, 3];
      }

      spyOn(console, 'warn');

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(console.warn).not.toHaveBeenCalled();

      fixture.componentInstance.items = [4, 5, 6];
      fixture.detectChanges();
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should warn about collection re-creation due to identity tracking', () => {
      @Component({
        template: `@for (item of items; track item) {(<span>{{item.value}}</span>)}`,
        standalone: false,
      })
      class TestComponent {
        items = [{value: 0}, {value: 1}];
      }

      spyOn(console, 'warn');

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('(0)(1)');
      expect(console.warn).not.toHaveBeenCalled();

      fixture.componentInstance.items = fixture.componentInstance.items.map((item) => ({
        value: item.value + 1,
      }));
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('(1)(2)');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should NOT warn about collection re-creation when a view is not considered expensive', () => {
      @Component({
        template: `@for (item of items; track item) {({{item.value}})}`,
        standalone: false,
      })
      class TestComponent {
        items = [{value: 0}, {value: 1}];
      }

      spyOn(console, 'warn');

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('(0)(1)');
      expect(console.warn).not.toHaveBeenCalled();

      fixture.componentInstance.items = fixture.componentInstance.items.map((item) => ({
        value: item.value + 1,
      }));
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('(1)(2)');
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should NOT warn about collection re-creation when a trackBy function is not identity', () => {
      @Component({
        template: `@for (item of items; track item.value) {({{item.value}})}`,
        standalone: false,
      })
      class TestComponent {
        items = [{value: 0}, {value: 1}];
      }

      spyOn(console, 'warn');

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('(0)(1)');
      expect(console.warn).not.toHaveBeenCalled();

      fixture.componentInstance.items = fixture.componentInstance.items.map((item) => ({
        value: item.value + 1,
      }));
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('(1)(2)');
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('list diffing and view operations', () => {
    it('should delete views in the middle', () => {
      @Component({
        template: '@for (item of items; track item; let idx = $index) {{{item}}({{idx}})|}',
        standalone: false,
      })
      class TestComponent {
        items = [1, 2, 3];
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('1(0)|2(1)|3(2)|');

      // delete in the middle
      fixture.componentInstance.items.splice(1, 1);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('1(0)|3(1)|');
    });

    it('should insert views in the middle', () => {
      @Component({
        template: '@for (item of items; track item; let idx = $index) {{{item}}({{idx}})|}',
        standalone: false,
      })
      class TestComponent {
        items = [1, 3];
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('1(0)|3(1)|');

      // add in the middle
      fixture.componentInstance.items.splice(1, 0, 2);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('1(0)|2(1)|3(2)|');
    });

    it('should replace different items', () => {
      @Component({
        template: '@for (item of items; track item; let idx = $index) {{{item}}({{idx}})|}',
        standalone: false,
      })
      class TestComponent {
        items = [1, 2, 3];
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('1(0)|2(1)|3(2)|');

      // an item in the middle stays the same, the rest gets replaced
      fixture.componentInstance.items = [5, 2, 7];
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('5(0)|2(1)|7(2)|');
    });

    it('should move and delete items', () => {
      @Component({
        template: '@for (item of items; track item; let idx = $index) {{{item}}({{idx}})|}',
        standalone: false,
      })
      class TestComponent {
        items = [1, 2, 3, 4, 5, 6];
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges(false);
      expect(fixture.nativeElement.textContent).toBe('1(0)|2(1)|3(2)|4(3)|5(4)|6(5)|');

      // move 5 and do some other delete other operations
      fixture.componentInstance.items = [5, 3, 7];
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('5(0)|3(1)|7(2)|');
    });

    it('should correctly attach and detach views with duplicated keys', () => {
      const BEFORE = [
        {'name': 'Task 14', 'id': 14},
        {'name': 'Task 14', 'id': 14},
        {'name': 'Task 70', 'id': 70},
        {'name': 'Task 34', 'id': 34},
      ];

      const AFTER = [
        {'name': 'Task 70', 'id': 70},
        {'name': 'Task 14', 'id': 14},
        {'name': 'Task 28', 'id': 28},
      ];

      @Component({
        template: ``,
        selector: 'child-cmp',
      })
      class ChildCmp {}

      @Component({
        imports: [ChildCmp],
        template: `
          @for(task of tasks; track task.id) {
            <child-cmp/>
          }
        `,
      })
      class TestComponent {
        tasks = BEFORE;
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const cmp = fixture.componentInstance;
      const nativeElement = fixture.debugElement.nativeElement;
      cmp.tasks = AFTER;
      fixture.detectChanges();
      expect(nativeElement.querySelectorAll('child-cmp').length).toBe(3);
    });
  });

  describe('content projection', () => {
    it('should project an @for with a single root node into the root node slot', () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
        <test>Before @for (item of items; track $index) {
          <span foo>{{item}}</span>
        } After</test>
      `,
      })
      class App {
        items = [1, 2, 3];
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('Main: Before  After Slot: 123');
    });

    it('should project an @empty block with a single root node into the root node slot', () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
        <test>Before @for (item of items; track $index) {} @empty {
          <span foo>Empty</span>
        } After</test>
      `,
      })
      class App {
        items = [];
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('Main: Before  After Slot: Empty');
    });

    it('should allow @for and @empty blocks to be projected into different slots', () => {
      @Component({
        selector: 'test',
        template:
          'Main: <ng-content/> Loop slot: <ng-content select="[loop]"/> Empty slot: <ng-content select="[empty]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
        <test>Before @for (item of items; track $index) {
          <span loop>{{item}}</span>
        } @empty {
          <span empty>Empty</span>
        } After</test>
      `,
      })
      class App {
        items = [1, 2, 3];
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe(
        'Main: Before  After Loop slot: 123 Empty slot: ',
      );

      fixture.componentInstance.items = [];
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe(
        'Main: Before  After Loop slot:  Empty slot: Empty',
      );
    });

    it('should project an @for with multiple root nodes into the catch-all slot', () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
        <test>Before @for (item of items; track $index) {
          <span foo>one{{item}}</span>
          <div foo>two{{item}}</div>
        } After</test>
      `,
      })
      class App {
        items = [1, 2];
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('Main: Before one1two1one2two2 After Slot: ');
    });

    it('should project an @for with a single root node with a data binding', () => {
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
        <test>Before @for (item of items; track $index) {
          <span [foo]="item">{{item}}</span>
        } After</test>
      `,
      })
      class App {
        items = [1, 2, 3];
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('Main: Before  After Slot: 123');
      expect(directiveCount).toBe(3);
    });

    it('should project an @for with an ng-container root node', () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
        <test>Before @for (item of items; track $index) {
          <ng-container foo>
            <span>{{item}}</span>
            <span>|</span>
          </ng-container>
        } After</test>
      `,
      })
      class App {
        items = [1, 2, 3];
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('Main: Before  After Slot: 1|2|3|');
    });

    // Right now the template compiler doesn't collect comment nodes.
    // This test is to ensure that we don't regress if it happens in the future.
    it('should project an @for with single root node and comments into the root node slot', () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
        <test>Before @for (item of items; track $index) {
          <!-- before -->
          <span foo>{{item}}</span>
          <!-- after -->
        } After</test>
      `,
      })
      class App {
        items = [1, 2, 3];
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('Main: Before  After Slot: 123');
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
        // Note the whitespace due to the indentation inside @for.
        template:
          '<test>Before @for (item of items; track $index) {<span foo>{{item}}</span>} After</test>',
      })
      class App {
        items = [1, 2, 3];
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('Main: Before  After Slot: 123');
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
        // Note the whitespace due to the indentation inside @for.
        template: `
              <test>Before @for (item of items; track $index) {
                <span foo>{{item}}</span>
              } After</test>
            `,
      })
      class App {
        items = [1, 2, 3];
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toMatch(/Main: Before\s+1\s+2\s+3\s+After Slot:/);
    });

    it('should not project the root node across multiple layers of @for', () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
        <test>Before @for (item of items; track $index) {
          @for (item of items; track $index) {
            <span foo>{{item}}</span>
          }
        } After</test>
      `,
      })
      class App {
        items = [1, 2];
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('Main: Before 1212 After Slot: ');
    });

    it('should project an @for with a single root template node into the root node slot', () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent, NgIf],
        template: `<test>Before @for (item of items; track $index) {
        <span *ngIf="true" foo>{{item}}</span>
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

    it('should invoke a projected attribute directive at the root of an @for once', () => {
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
        template: `<test>Before @for (item of items; track $index) {
        <span foo>{{item}}</span>
      } After</test>
      `,
      })
      class App {
        items = [1];
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(directiveCount).toBe(1);
      expect(fixture.nativeElement.textContent).toBe('Main: Before  After Slot: 1');
    });

    it('should invoke a projected template directive at the root of an @for once', () => {
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
        template: `<test>Before @for (item of items; track $index) {
        <span *templateDir foo>{{item}}</span>
      } After</test>
      `,
      })
      class App {
        items = [1];
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(directiveCount).toBe(1);
      expect(fixture.nativeElement.textContent).toBe('Main: Before  After Slot: 1');
    });

    it('should invoke a directive on a projected ng-template at the root of an @for once', () => {
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
        template: `<test>Before @for (item of items; track $index) {
        <ng-template templateDir foo>{{item}}</ng-template>
      } After</test>
      `,
      })
      class App {
        items = [1];
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(directiveCount).toBe(1);
      expect(fixture.nativeElement.textContent).toBe('Main: Before  After Slot: 1');
    });

    it('should not project an @for that has text followed by one element node at the root', () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
          <test>
            @for (item of items; track $index) {Hello <span foo>{{item}}</span>}
          </test>
        `,
      })
      class App {
        items = [1];
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('Main: Hello 1 Slot: ');
    });

    it('should project an @for with a single root node and @let declarations into the root node slot', () => {
      @Component({
        selector: 'test',
        template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
      })
      class TestComponent {}

      @Component({
        imports: [TestComponent],
        template: `
        <test>Before @for (item of items; track $index) {
          @let a = item + 1;
          @let b = a + 1;
          <span foo>{{b}}</span>
        } After</test>
      `,
      })
      class App {
        items = [1];
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('Main: Before  After Slot: 3');
    });
  });
});
