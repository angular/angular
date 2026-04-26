/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule} from '@angular/common';
import {
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  Input,
  provideZonelessChangeDetection,
  QueryList,
  signal,
  Type,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

import {ComponentFixture, TestBed} from '../../testing';

describe('control flow - repeat', () => {
  async function createFixture<T>(type: Type<T>): Promise<ComponentFixture<T>> {
    const fixture = TestBed.createComponent(type);
    await fixture.whenStable();
    return fixture;
  }

  function textContent(element: Element): string {
    return element.textContent!.replace(/\s+/g, ' ').trim();
  }

  function queryTexts(element: Element, selector: string): string[] {
    return Array.from(element.querySelectorAll(selector), (node) => node.textContent!.trim());
  }

  function nativeElement<T extends Element>(value: ElementRef<T> | T): T {
    return value instanceof ElementRef ? value.nativeElement : value;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should render static counts with contextual variables', async () => {
    @Component({
      standalone: true,
      template: `
        @repeat (2; let index = $index) {
          <div [attr.id]="index">
            {{ $index }}/{{ $count }}/{{ $first }}/{{ $last }}/{{ $even }}/{{ $odd }}
          </div>
        }
      `,
    })
    class TestComponent {}

    const fixture = await createFixture(TestComponent);
    const divs = Array.from(fixture.nativeElement.querySelectorAll('div')) as Element[];

    expect(divs.map((div) => div.getAttribute('id'))).toEqual(['0', '1']);
    expect(fixture.nativeElement.textContent).toContain('0/2/true/false/true/false');
    expect(fixture.nativeElement.textContent).toContain('1/2/false/true/false/true');
  });

  it('should make $index and other context variables available without a let alias', async () => {
    @Component({
      standalone: true,
      template: `
        @repeat (3) {
          <span>{{ $index }}/{{ $count }}/{{ $first }}/{{ $last }}/{{ $even }}/{{ $odd }}</span>
        }
      `,
    })
    class TestComponent {}

    const fixture = await createFixture(TestComponent);
    const spans = Array.from(fixture.nativeElement.querySelectorAll('span')) as Element[];

    expect(spans.length).toBe(3);
    expect(spans[0].textContent!.trim()).toBe('0/3/true/false/true/false');
    expect(spans[1].textContent!.trim()).toBe('1/3/false/false/false/true');
    expect(spans[2].textContent!.trim()).toBe('2/3/false/true/true/false');
  });

  it('should expose $count, $first, $last, $even, $odd context variables', async () => {
    @Component({
      standalone: true,
      template: `
        @repeat (4; let i = $index) {
          <span
            [attr.data-index]="i"
            [attr.data-count]="$count"
            [attr.data-first]="$first"
            [attr.data-last]="$last"
            [attr.data-even]="$even"
            [attr.data-odd]="$odd"
          ></span>
        }
      `,
    })
    class TestComponent {}

    const fixture = await createFixture(TestComponent);
    const spans = Array.from(fixture.nativeElement.querySelectorAll('span')) as HTMLSpanElement[];

    expect(spans.length).toBe(4);

    const attr = (span: HTMLSpanElement, name: string) => span.getAttribute(name);

    expect(spans.map((s) => attr(s, 'data-count'))).toEqual(['4', '4', '4', '4']);
    expect(spans.map((s) => attr(s, 'data-first'))).toEqual(['true', 'false', 'false', 'false']);
    expect(spans.map((s) => attr(s, 'data-last'))).toEqual(['false', 'false', 'false', 'true']);
    expect(spans.map((s) => attr(s, 'data-even'))).toEqual(['true', 'false', 'true', 'false']);
    expect(spans.map((s) => attr(s, 'data-odd'))).toEqual(['false', 'true', 'false', 'true']);
  });

  it('should update when a signal count changes', async () => {
    @Component({
      standalone: true,
      template: `
        @repeat (columns(); let col = $index) {
          <div class="skeleton-cell" [style.grid-column]="col + 1"></div>
        }
      `,
    })
    class TestComponent {
      columns = signal(2);
    }

    const fixture = await createFixture(TestComponent);
    expect(fixture.nativeElement.querySelectorAll('.skeleton-cell').length).toBe(2);

    fixture.componentInstance.columns.set(4);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.skeleton-cell').length).toBe(4);

    fixture.componentInstance.columns.set(0);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.skeleton-cell').length).toBe(0);
  });

  it('should update when an async pipe count changes', async () => {
    @Component({
      standalone: true,
      imports: [CommonModule],
      template: `
        @repeat (count$ | async; let index = $index) {
          <span>{{ index }}</span>
        }
      `,
    })
    class TestComponent {
      count$ = new BehaviorSubject<number | null>(2);
    }

    const fixture = await createFixture(TestComponent);
    expect(queryTexts(fixture.nativeElement, 'span')).toEqual(['0', '1']);

    fixture.componentInstance.count$.next(4);
    await fixture.whenStable();
    expect(queryTexts(fixture.nativeElement, 'span')).toEqual(['0', '1', '2', '3']);

    fixture.componentInstance.count$.next(null);
    await fixture.whenStable();
    expect(textContent(fixture.nativeElement)).toBe('');
  });

  it('should support nested repeat blocks and shadow inner contextual variables', async () => {
    @Component({
      standalone: true,
      template: `
        @repeat (2; let outerIndex = $index) {
          @repeat (3; let innerIndex = $index) {
            <button [attr.id]="outerIndex + '-' + innerIndex">{{ $index }}</button>
          }
        }
      `,
    })
    class TestComponent {}

    const fixture = await createFixture(TestComponent);
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];

    expect(buttons.map((button) => button.id)).toEqual(['0-0', '0-1', '0-2', '1-0', '1-1', '1-2']);
    expect(buttons.map((button) => button.textContent?.trim())).toEqual([
      '0',
      '1',
      '2',
      '0',
      '1',
      '2',
    ]);
  });

  it('should render nothing for null and zero counts', async () => {
    @Component({
      standalone: true,
      template: `
        @repeat (count()) {
          <span></span>
        }
      `,
    })
    class TestComponent {
      count = signal<number | null>(null);
    }

    const fixture = await createFixture(TestComponent);
    expect(fixture.nativeElement.querySelectorAll('span').length).toBe(0);

    fixture.componentInstance.count.set(0);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('span').length).toBe(0);
  });

  it('should truncate non-integer counts like String.prototype.repeat', async () => {
    @Component({
      standalone: true,
      template: `
        @repeat (count()) {
          <span></span>
        }
      `,
    })
    class TestComponent {
      count = signal(2.5);
    }

    const fixture = await createFixture(TestComponent);
    expect(fixture.nativeElement.querySelectorAll('span').length).toBe(2);

    fixture.componentInstance.count.set(3.9);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('span').length).toBe(3);
  });

  it('should throw a RangeError for negative counts', async () => {
    @Component({
      standalone: true,
      template: `
        @repeat (count()) {
          <span></span>
        }
      `,
    })
    class TestComponent {
      count = signal(-1);
    }

    await expectAsync(createFixture(TestComponent)).toBeRejectedWithError(
      /The `@repeat` count must be a non-negative finite number/,
    );
  });

  it('should throw a RangeError for Infinity', async () => {
    @Component({
      standalone: true,
      template: `
        @repeat (count()) {
          <span></span>
        }
      `,
    })
    class TestComponent {
      count = signal(Infinity);
    }

    await expectAsync(createFixture(TestComponent)).toBeRejectedWithError(
      /The `@repeat` count must be a non-negative finite number/,
    );
  });

  it('should render nothing for NaN counts like String.prototype.repeat', async () => {
    @Component({
      standalone: true,
      template: `
        @repeat (count()) {
          <span></span>
        }
      `,
    })
    class TestComponent {
      count = signal<number>(NaN);
    }

    const fixture = await createFixture(TestComponent);
    expect(fixture.nativeElement.querySelectorAll('span').length).toBe(0);
  });

  it('should project repeated content into ng-content slots', async () => {
    @Component({
      standalone: true,
      selector: 'repeat-projection-target',
      template: 'Main: <ng-content/> Slot: <ng-content select="[slot]"/>',
    })
    class ProjectionTarget {}

    @Component({
      standalone: true,
      imports: [ProjectionTarget],
      template: `
        <repeat-projection-target>
          Before
          @repeat (count(); let index = $index) {
            <span slot>{{ index }}</span>
          }
          After
        </repeat-projection-target>
      `,
    })
    class TestComponent {
      count = signal(2);
    }

    const fixture = await createFixture(TestComponent);
    expect(textContent(fixture.nativeElement)).toBe('Main: Before After Slot: 01');

    fixture.componentInstance.count.set(0);
    await fixture.whenStable();
    expect(textContent(fixture.nativeElement)).toBe('Main: Before After Slot:');
  });

  it('should render templates from NgTemplateOutlet inside repeat blocks', async () => {
    @Component({
      standalone: true,
      imports: [CommonModule],
      template: `
        <ng-template #template let-index="index">
          <span class="outlet">{{ index }}</span>
        </ng-template>

        @repeat (count(); let index = $index) {
          <ng-container *ngTemplateOutlet="template; context: {index: index}"></ng-container>
        }
      `,
    })
    class TestComponent {
      count = signal(3);
    }

    const fixture = await createFixture(TestComponent);
    expect(queryTexts(fixture.nativeElement, '.outlet')).toEqual(['0', '1', '2']);

    fixture.componentInstance.count.set(1);
    await fixture.whenStable();
    expect(queryTexts(fixture.nativeElement, '.outlet')).toEqual(['0']);
  });

  it('should update decorator view queries inside repeat blocks', async () => {
    @Component({
      standalone: true,
      template: `
        @repeat (count(); let index = $index) {
          <button #button [attr.data-index]="index">Button {{ index }}</button>
        }
      `,
    })
    class TestComponent {
      count = signal(2);

      @ViewChild('button') firstButton?: ElementRef<HTMLButtonElement> | HTMLButtonElement;
      @ViewChildren('button') buttons!: QueryList<
        ElementRef<HTMLButtonElement> | HTMLButtonElement
      >;
    }

    const fixture = await createFixture(TestComponent);
    expect(nativeElement(fixture.componentInstance.firstButton!).getAttribute('data-index')).toBe(
      '0',
    );
    expect(fixture.componentInstance.buttons.length).toBe(2);

    fixture.componentInstance.count.set(0);
    await fixture.whenStable();
    expect(fixture.componentInstance.firstButton).toBeUndefined();
    expect(fixture.componentInstance.buttons.length).toBe(0);

    fixture.componentInstance.count.set(3);
    await fixture.whenStable();
    expect(nativeElement(fixture.componentInstance.firstButton!).getAttribute('data-index')).toBe(
      '0',
    );
    expect(
      fixture.componentInstance.buttons.map((button) =>
        nativeElement(button).getAttribute('data-index'),
      ),
    ).toEqual(['0', '1', '2']);
  });

  it('should update decorator content queries for projected repeat blocks', async () => {
    @Directive({
      standalone: true,
      selector: '[repeatQueryItem]',
    })
    class RepeatQueryItem {
      @Input() index = -1;
    }

    @Component({
      standalone: true,
      selector: 'repeat-decorator-content-query-target',
      template: '<ng-content/>',
    })
    class ContentQueryTarget {
      @ContentChild(RepeatQueryItem) firstItem?: RepeatQueryItem;
      @ContentChildren(RepeatQueryItem) items!: QueryList<RepeatQueryItem>;
    }

    @Component({
      standalone: true,
      imports: [ContentQueryTarget, RepeatQueryItem],
      template: `
        <repeat-decorator-content-query-target>
          @repeat (itemCount(); let index = $index) {
            <div repeatQueryItem [index]="index"></div>
          }
        </repeat-decorator-content-query-target>
      `,
    })
    class TestComponent {
      itemCount = signal(2);

      @ViewChild(ContentQueryTarget) target!: ContentQueryTarget;
    }

    const fixture = await createFixture(TestComponent);
    const target = fixture.componentInstance.target;
    expect(target.firstItem?.index).toBe(0);
    expect(target.items.map((item) => item.index)).toEqual([0, 1]);

    fixture.componentInstance.itemCount.set(0);
    await fixture.whenStable();
    expect(target.firstItem).toBeUndefined();
    expect(target.items.length).toBe(0);

    fixture.componentInstance.itemCount.set(3);
    await fixture.whenStable();
    expect(target.firstItem?.index).toBe(0);
    expect(target.items.map((item) => item.index)).toEqual([0, 1, 2]);
  });

  it('should support nested if and for blocks inside repeat blocks', async () => {
    @Component({
      standalone: true,
      selector: 'even-row',
      template: 'even',
    })
    class EvenRow {}

    @Component({
      standalone: true,
      selector: 'odd-row',
      template: 'odd',
    })
    class OddRow {}

    @Component({
      standalone: true,
      imports: [EvenRow, OddRow],
      template: `
        @repeat (count(); let index = $index) {
          @if (index % 2 === 0) {
            <even-row />
          } @else {
            <odd-row />
          }

          @for (item of items(); track item.id) {
            <button>{{ index }}:{{ item.label }}</button>
          }
        }
      `,
    })
    class TestComponent {
      count = signal(3);
      items = signal([
        {id: 1, label: 'A'},
        {id: 2, label: 'B'},
      ]);
    }

    const fixture = await createFixture(TestComponent);
    expect(fixture.nativeElement.querySelectorAll('even-row').length).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('odd-row').length).toBe(1);
    expect(queryTexts(fixture.nativeElement, 'button')).toEqual([
      '0:A',
      '0:B',
      '1:A',
      '1:B',
      '2:A',
      '2:B',
    ]);

    fixture.componentInstance.count.set(2);
    fixture.componentInstance.items.set([{id: 1, label: 'A'}]);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('even-row').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('odd-row').length).toBe(1);
    expect(queryTexts(fixture.nativeElement, 'button')).toEqual(['0:A', '1:A']);
  });

  it('should support nested repeat grids', async () => {
    @Component({
      standalone: true,
      selector: 'cell-component',
      template: '{{ row }}:{{ col }}',
    })
    class CellComponent {
      @Input() row = -1;
      @Input() col = -1;
    }

    @Component({
      standalone: true,
      imports: [CellComponent],
      template: `
        @repeat (rows(); let row = $index) {
          @repeat (columns(); let col = $index) {
            <cell-component [row]="row" [col]="col" />
          }
        }
      `,
    })
    class TestComponent {
      rows = signal(2);
      columns = signal(3);
    }

    const fixture = await createFixture(TestComponent);
    expect(queryTexts(fixture.nativeElement, 'cell-component')).toEqual([
      '0:0',
      '0:1',
      '0:2',
      '1:0',
      '1:1',
      '1:2',
    ]);

    fixture.componentInstance.rows.set(1);
    fixture.componentInstance.columns.set(2);
    await fixture.whenStable();
    expect(queryTexts(fixture.nativeElement, 'cell-component')).toEqual(['0:0', '0:1']);
  });
});
