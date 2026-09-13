/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {provideZonelessChangeDetection, signal} from '../../src/core';
import {
  RenderFlags,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵdefineComponent,
  ɵɵisolatedCreate,
  ɵɵtext,
  ɵɵtextInterpolate,
} from '../../src/render3';
import {TestBed} from '../../testing';

describe('isolated reactive embedded views', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideZonelessChangeDetection()]});
  });

  it('refreshes an isolated view without executing its parent template', async () => {
    const value = signal('initial');
    let parentRefreshes = 0;
    let isolatedRefreshes = 0;

    class TestComponent {
      value = value;

      static ɵfac = () => new TestComponent();
      static ɵcmp = ɵɵdefineComponent({
        type: TestComponent,
        selectors: [['test-component']],
        decls: 1,
        vars: 1,
        template: (rf: RenderFlags, ctx: TestComponent) => {
          if (rf & RenderFlags.Create) {
            ɵɵisolatedCreate(0, isolatedTemplate, 1, 1);
          }
          if (rf & RenderFlags.Update) {
            parentRefreshes++;
            ɵɵconditional(0, ctx);
          }
        },
      });
    }

    function isolatedTemplate(rf: RenderFlags, ctx: TestComponent) {
      if (rf & RenderFlags.Create) {
        ɵɵtext(0);
      }
      if (rf & RenderFlags.Update) {
        isolatedRefreshes++;
        ɵɵtextInterpolate(ctx.value());
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('initial');
    expect(parentRefreshes).toBe(1);
    expect(isolatedRefreshes).toBe(1);

    value.set('updated');
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('updated');
    expect(parentRefreshes).toBe(1);
    expect(isolatedRefreshes).toBe(2);
  });

  it('refreshes sibling isolated views independently', async () => {
    const first = signal('first');
    const second = signal('second');
    let parentRefreshes = 0;
    let firstRefreshes = 0;
    let secondRefreshes = 0;

    class TestComponent {
      first = first;
      second = second;

      static ɵfac = () => new TestComponent();
      static ɵcmp = ɵɵdefineComponent({
        type: TestComponent,
        selectors: [['test-component']],
        decls: 2,
        vars: 2,
        template: (rf: RenderFlags, ctx: TestComponent) => {
          if (rf & RenderFlags.Create) {
            ɵɵisolatedCreate(0, firstTemplate, 1, 1);
            ɵɵisolatedCreate(1, secondTemplate, 1, 1);
          }
          if (rf & RenderFlags.Update) {
            parentRefreshes++;
            ɵɵconditional(0, ctx);
            ɵɵconditional(1, ctx);
          }
        },
      });
    }

    function firstTemplate(rf: RenderFlags, ctx: TestComponent) {
      if (rf & RenderFlags.Create) {
        ɵɵtext(0);
      }
      if (rf & RenderFlags.Update) {
        firstRefreshes++;
        ɵɵtextInterpolate(ctx.first());
      }
    }

    function secondTemplate(rf: RenderFlags, ctx: TestComponent) {
      if (rf & RenderFlags.Create) {
        ɵɵtext(0);
      }
      if (rf & RenderFlags.Update) {
        secondRefreshes++;
        ɵɵtextInterpolate(ctx.second());
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('firstsecond');

    first.set('updated');
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('updatedsecond');
    expect(parentRefreshes).toBe(1);
    expect(firstRefreshes).toBe(2);
    expect(secondRefreshes).toBe(1);
  });

  it('tracks signals in nested embedded views with the nearest isolated consumer', async () => {
    const value = signal('initial');
    let parentRefreshes = 0;
    let isolatedRefreshes = 0;
    let nestedRefreshes = 0;

    class TestComponent {
      value = value;

      static ɵfac = () => new TestComponent();
      static ɵcmp = ɵɵdefineComponent({
        type: TestComponent,
        selectors: [['test-component']],
        decls: 1,
        vars: 1,
        template: (rf: RenderFlags, ctx: TestComponent) => {
          if (rf & RenderFlags.Create) {
            ɵɵisolatedCreate(0, isolatedTemplate, 1, 1);
          }
          if (rf & RenderFlags.Update) {
            parentRefreshes++;
            ɵɵconditional(0, ctx);
          }
        },
      });
    }

    function isolatedTemplate(rf: RenderFlags, ctx: TestComponent) {
      if (rf & RenderFlags.Create) {
        ɵɵconditionalCreate(0, nestedTemplate, 1, 1);
      }
      if (rf & RenderFlags.Update) {
        isolatedRefreshes++;
        ɵɵconditional(0, ctx);
      }
    }

    function nestedTemplate(rf: RenderFlags, ctx: TestComponent) {
      if (rf & RenderFlags.Create) {
        ɵɵtext(0);
      }
      if (rf & RenderFlags.Update) {
        nestedRefreshes++;
        ɵɵtextInterpolate(ctx.value());
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    await fixture.whenStable();

    value.set('updated');
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('updated');
    expect(parentRefreshes).toBe(1);
    expect(isolatedRefreshes).toBe(2);
    expect(nestedRefreshes).toBe(2);
  });

  it('still refreshes an isolated CheckAlways view during a parent global pass', async () => {
    const parentTrigger = signal(0);
    let isolatedValue = 'initial';
    let parentRefreshes = 0;
    let isolatedRefreshes = 0;

    class TestComponent {
      static ɵfac = () => new TestComponent();
      static ɵcmp = ɵɵdefineComponent({
        type: TestComponent,
        selectors: [['test-component']],
        decls: 1,
        vars: 1,
        template: (rf: RenderFlags, ctx: TestComponent) => {
          if (rf & RenderFlags.Create) {
            ɵɵisolatedCreate(0, isolatedTemplate, 1, 1);
          }
          if (rf & RenderFlags.Update) {
            parentRefreshes++;
            parentTrigger();
            ɵɵconditional(0, ctx);
          }
        },
      });
    }

    function isolatedTemplate(rf: RenderFlags) {
      if (rf & RenderFlags.Create) {
        ɵɵtext(0);
      }
      if (rf & RenderFlags.Update) {
        isolatedRefreshes++;
        ɵɵtextInterpolate(isolatedValue);
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    await fixture.whenStable();

    isolatedValue = 'updated';
    parentTrigger.update((value) => value + 1);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('updated');
    expect(parentRefreshes).toBe(2);
    expect(isolatedRefreshes).toBe(2);
  });
});
