/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, DebugElement, ElementRef, viewChild} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {SplitAreaDirective, SplitComponent} from '../../vendor/angular-split/public_api';
import {
  RESIZE_DEBOUNCE,
  ResponsiveSplitConfig,
  ResponsiveSplitDirective,
} from './responsive-split.directive';
import {WINDOW} from '../../application-providers/window_provider';

//
// `ResizeObserver` mock.
//

interface ResizeObserverMock extends ResizeObserver {
  trigger: (width: number, height: number) => void;
}

let observerInstance: ResizeObserverMock | undefined;

function getResizeObserver() {
  if (!observerInstance) {
    throw new Error('The ResizeObserver mock is not instantiated.');
  }
  return observerInstance;
}

class ResizeObserverMockImpl implements ResizeObserverMock {
  constructor(private readonly cb: (e: Partial<ResizeObserverEntry>[]) => void) {
    observerInstance = this;
  }

  trigger(width: number, height: number) {
    this.cb([{contentBoxSize: [{inlineSize: width, blockSize: height}]}]);
  }

  disconnect() {}
  observe() {}
  unobserve() {}
}

// Test component
@Component({
  selector: 'ng-test-cmp',
  imports: [SplitComponent, SplitAreaDirective, ResponsiveSplitDirective],
  template: `
    <as-split #host [ngResponsiveSplit]="config">
      <as-split-area>
        <p>Foo</p>
      </as-split-area>
      <as-split-area>
        <p>Bar</p>
      </as-split-area>
    </as-split>
  `,
})
class TestComponent {
  readonly split = viewChild.required(SplitComponent);
  readonly host = viewChild.required<ElementRef>('host');

  readonly config: ResponsiveSplitConfig = {
    defaultDirection: 'horizontal',
    aspectRatioBreakpoint: 1.5,
    breakpointDirection: 'vertical',
  };
}

function initTestComponent(
  width: number,
  height: number,
): {host: DebugElement; split: SplitComponent} {
  TestBed.configureTestingModule({
    imports: [TestComponent, SplitComponent, SplitAreaDirective, ResponsiveSplitDirective],
    providers: [{provide: WINDOW, useValue: {...window, ResizeObserver: ResizeObserverMockImpl}}],
  });
  const fixture = TestBed.createComponent(TestComponent);
  fixture.detectChanges();

  const host = fixture.debugElement.query(By.css('as-split'));
  const split = host.componentInstance;

  getResizeObserver().trigger(width, height);

  // Should be equal or greater than the resize debounce.
  jasmine.clock().tick(RESIZE_DEBOUNCE + 10);

  return {
    host,
    split,
  };
}

//
// Tests
//

describe('responsive-split', () => {
  beforeEach(() => {
    jasmine.clock().uninstall();
    jasmine.clock().install();
  });

  it('should use horizontal direction (ratio == 1)', () => {
    const {split} = initTestComponent(200, 200);

    expect(split.direction).toEqual('horizontal');
  });

  it('should use horizontal direction (ratio == 1.49)', () => {
    const {split} = initTestComponent(299, 200);

    expect(split.direction).toEqual('horizontal');
  });

  it('should use vertical direction (ratio == 1.5)', () => {
    const {split} = initTestComponent(350, 200);

    expect(split.direction).toEqual('vertical');
  });

  it('should use vertical direction (ratio == 2)', () => {
    const {split} = initTestComponent(400, 200);

    expect(split.direction).toEqual('vertical');
  });
});
