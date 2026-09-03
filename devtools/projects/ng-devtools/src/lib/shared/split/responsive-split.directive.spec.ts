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

import {
  RESIZE_DEBOUNCE,
  ResponsiveSplitConfig,
  ResponsiveSplitDirective,
} from './responsive-split.directive';
import {WINDOW} from '../../application-providers/window_provider';
import {SplitComponent} from './split.component';
import {SplitAreaDirective} from './splitArea.directive';

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

  config!: ResponsiveSplitConfig;
}

async function initTestComponent(
  config: ResponsiveSplitConfig,
  width: number,
  height: number,
): Promise<{host: DebugElement; split: SplitComponent}> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [{provide: WINDOW, useValue: {...window, ResizeObserver: ResizeObserverMockImpl}}],
  });
  const fixture = TestBed.createComponent(TestComponent);
  fixture.componentInstance.config = config;
  await fixture.whenStable();

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

  describe('aspectRatioBreakpoint', () => {
    const config: ResponsiveSplitConfig = {
      defaultDirection: 'horizontal',
      aspectRatioBreakpoint: '>=1.5',
      breakpointDirection: 'vertical',
    };

    it('should use horizontal direction (ratio == 1)', async () => {
      const {split} = await initTestComponent(config, 200, 200);

      expect(split.direction()).toEqual('horizontal');
    });

    it('should use horizontal direction (ratio == 1.49)', async () => {
      const {split} = await initTestComponent(config, 299, 200);

      expect(split.direction()).toEqual('horizontal');
    });

    it('should use vertical direction (ratio == 1.5)', async () => {
      const {split} = await initTestComponent(config, 350, 200);

      expect(split.direction()).toEqual('vertical');
    });

    it('should use vertical direction (ratio == 2)', async () => {
      const {split} = await initTestComponent(config, 400, 200);

      expect(split.direction()).toEqual('vertical');
    });
  });

  describe('widthBreakpoint', () => {
    const config: ResponsiveSplitConfig = {
      defaultDirection: 'horizontal',
      widthBreakpoint: '<500px',
      breakpointDirection: 'vertical',
    };

    it('should use horizontal direction (width == 600)', async () => {
      const {split} = await initTestComponent(config, 600, 200);

      expect(split.direction()).toEqual('horizontal');
    });

    it('should use horizontal direction (width == 500)', async () => {
      const {split} = await initTestComponent(config, 500, 200);

      expect(split.direction()).toEqual('horizontal');
    });

    it('should use vertical direction (width == 499)', async () => {
      const {split} = await initTestComponent(config, 499, 200);

      expect(split.direction()).toEqual('vertical');
    });

    it('should use vertical direction (width == 300)', async () => {
      const {split} = await initTestComponent(config, 300, 200);

      expect(split.direction()).toEqual('vertical');
    });
  });

  describe('Breakpoint operators', () => {
    it('should support the `>` operator (aspect ratio)', async () => {
      const config: ResponsiveSplitConfig = {
        defaultDirection: 'horizontal',
        aspectRatioBreakpoint: '>2',
        breakpointDirection: 'vertical',
      };

      const atBoundary = await initTestComponent(config, 400, 200); // ratio == 2
      expect(atBoundary.split.direction()).toEqual('horizontal');

      const pastBoundary = await initTestComponent(config, 420, 200); // ratio == 2.1
      expect(pastBoundary.split.direction()).toEqual('vertical');
    });

    it('should support the `<=` operator (width)', async () => {
      const config: ResponsiveSplitConfig = {
        defaultDirection: 'horizontal',
        widthBreakpoint: '<=300',
        breakpointDirection: 'vertical',
      };

      const atBoundary = await initTestComponent(config, 300, 200);
      expect(atBoundary.split.direction()).toEqual('vertical');

      const pastBoundary = await initTestComponent(config, 301, 200);
      expect(pastBoundary.split.direction()).toEqual('horizontal');
    });
  });
});
