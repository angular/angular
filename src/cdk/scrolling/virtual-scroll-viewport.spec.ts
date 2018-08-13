import {ArrayDataSource} from '@angular/cdk/collections';
import {CdkVirtualForOf, CdkVirtualScrollViewport, ScrollingModule} from '@angular/cdk/scrolling';
import {dispatchFakeEvent} from '@angular/cdk/testing';
import {Component, Input, ViewChild, ViewContainerRef, ViewEncapsulation} from '@angular/core';
import {ComponentFixture, fakeAsync, flush, TestBed} from '@angular/core/testing';
import {animationFrameScheduler, Subject} from 'rxjs';


describe('CdkVirtualScrollViewport', () => {
  describe ('with FixedSizeVirtualScrollStrategy', () => {
    let fixture: ComponentFixture<FixedSizeVirtualScroll>;
    let testComponent: FixedSizeVirtualScroll;
    let viewport: CdkVirtualScrollViewport;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [ScrollingModule],
        declarations: [FixedSizeVirtualScroll],
      }).compileComponents();

      fixture = TestBed.createComponent(FixedSizeVirtualScroll);
      testComponent = fixture.componentInstance;
      viewport = testComponent.viewport;
    });

    it('should render initial state', fakeAsync(() => {
      finishInit(fixture);

      const contentWrapper =
          viewport.elementRef.nativeElement.querySelector('.cdk-virtual-scroll-content-wrapper')!;
      expect(contentWrapper.children.length)
          .toBe(4, 'should render 4 50px items to fill 200px space');
    }));

    it('should get the data length', fakeAsync(() => {
      finishInit(fixture);

      expect(viewport.getDataLength()).toBe(testComponent.items.length);
    }));

    it('should get the viewport size', fakeAsync(() => {
      finishInit(fixture);

      expect(viewport.getViewportSize()).toBe(testComponent.viewportSize);
    }));

    it('should update viewport size', fakeAsync(() => {
      testComponent.viewportSize = 300;
      fixture.detectChanges();
      flush();
      viewport.checkViewportSize();
      expect(viewport.getViewportSize()).toBe(300);

      testComponent.viewportSize = 500;
      fixture.detectChanges();
      flush();
      viewport.checkViewportSize();
      expect(viewport.getViewportSize()).toBe(500);
    }));

    it('should get the rendered range', fakeAsync(() => {
      finishInit(fixture);

      expect(viewport.getRenderedRange())
          .toEqual({start: 0, end: 4}, 'should render the first 4 50px items to fill 200px space');
    }));

    it('should get the rendered content offset', fakeAsync(() => {
      finishInit(fixture);
      triggerScroll(viewport, testComponent.itemSize + 5);
      fixture.detectChanges();
      flush();

      expect(viewport.getOffsetToRenderedContentStart()).toBe(testComponent.itemSize,
          'should have 50px offset since first 50px item is not rendered');
    }));

    it('should get the scroll offset', fakeAsync(() => {
      finishInit(fixture);
      triggerScroll(viewport, testComponent.itemSize + 5);
      fixture.detectChanges();
      flush();

      expect(viewport.measureScrollOffset()).toBe(testComponent.itemSize + 5);
    }));

    it('should get the rendered content size', fakeAsync(() => {
      finishInit(fixture);

      expect(viewport.measureRenderedContentSize())
          .toBe(testComponent.viewportSize,
              'should render 4 50px items with combined size of 200px to fill 200px space');
    }));

    it('should measure range size', fakeAsync(() => {
      finishInit(fixture);

      expect(viewport.measureRangeSize({start: 1, end: 3}))
          .toBe(testComponent.itemSize * 2, 'combined size of 2 50px items should be 100px');
    }));

    it('should set total content size', fakeAsync(() => {
      finishInit(fixture);

      viewport.setTotalContentSize(10000);
      flush();
      fixture.detectChanges();

      expect(viewport.elementRef.nativeElement.scrollHeight).toBe(10000);
    }));

    it('should set rendered range', fakeAsync(() => {
      finishInit(fixture);
      viewport.setRenderedRange({start: 2, end: 3});
      fixture.detectChanges();
      flush();

      const items = fixture.elementRef.nativeElement.querySelectorAll('.item');
      expect(items.length).toBe(1, 'Expected 1 item to be rendered');
      expect(items[0].innerText.trim()).toBe('2 - 2', 'Expected item with index 2 to be rendered');
    }));

    it('should set content offset to top of content', fakeAsync(() => {
      finishInit(fixture);
      viewport.setRenderedContentOffset(10, 'to-start');
      fixture.detectChanges();
      flush();

      expect(viewport.getOffsetToRenderedContentStart()).toBe(10);
    }));

    it('should set content offset to bottom of content', fakeAsync(() => {
      finishInit(fixture);
      const contentSize = viewport.measureRenderedContentSize();

      expect(contentSize).toBeGreaterThan(0);

      viewport.setRenderedContentOffset(contentSize + 10, 'to-end');
      fixture.detectChanges();
      flush();

      expect(viewport.getOffsetToRenderedContentStart()).toBe(10);
    }));

    it('should set scroll offset', fakeAsync(() => {
      finishInit(fixture);
      viewport.setScrollOffset(testComponent.itemSize * 2);
      fixture.detectChanges();
      flush();

      triggerScroll(viewport);
      fixture.detectChanges();
      flush();

      expect(viewport.elementRef.nativeElement.scrollTop).toBe(testComponent.itemSize * 2);
      expect(viewport.getRenderedRange()).toEqual({start: 2, end: 6});
    }));

    it('should scroll to offset', fakeAsync(() => {
      finishInit(fixture);
      viewport.scrollToOffset(testComponent.itemSize * 2);

      triggerScroll(viewport);
      fixture.detectChanges();
      flush();

      expect(viewport.elementRef.nativeElement.scrollTop).toBe(testComponent.itemSize * 2);
      expect(viewport.getRenderedRange()).toEqual({start: 2, end: 6});
    }));

    it('should scroll to index', fakeAsync(() => {
      finishInit(fixture);
      viewport.scrollToIndex(2);

      triggerScroll(viewport);
      fixture.detectChanges();
      flush();

      expect(viewport.elementRef.nativeElement.scrollTop).toBe(testComponent.itemSize * 2);
      expect(viewport.getRenderedRange()).toEqual({start: 2, end: 6});
    }));

    it('should scroll to offset in horizontal mode', fakeAsync(() => {
      testComponent.orientation = 'horizontal';
      finishInit(fixture);
      viewport.scrollToOffset(testComponent.itemSize * 2);

      triggerScroll(viewport);
      fixture.detectChanges();
      flush();

      expect(viewport.elementRef.nativeElement.scrollLeft).toBe(testComponent.itemSize * 2);
      expect(viewport.getRenderedRange()).toEqual({start: 2, end: 6});
    }));

    it('should scroll to index in horizontal mode', fakeAsync(() => {
      testComponent.orientation = 'horizontal';
      finishInit(fixture);
      viewport.scrollToIndex(2);

      triggerScroll(viewport);
      fixture.detectChanges();
      flush();

      expect(viewport.elementRef.nativeElement.scrollLeft).toBe(testComponent.itemSize * 2);
      expect(viewport.getRenderedRange()).toEqual({start: 2, end: 6});
    }));

    it('should output scrolled index', fakeAsync(() => {
      finishInit(fixture);
      triggerScroll(viewport, testComponent.itemSize * 2 - 1);
      fixture.detectChanges();
      flush();

      expect(testComponent.scrolledToIndex).toBe(1);

      triggerScroll(viewport, testComponent.itemSize * 2);
      fixture.detectChanges();
      flush();

      expect(testComponent.scrolledToIndex).toBe(2);
    }));

    it('should update viewport as user scrolls down', fakeAsync(() => {
      finishInit(fixture);

      const maxOffset =
          testComponent.itemSize * testComponent.items.length - testComponent.viewportSize;
      for (let offset = 1; offset <= maxOffset; offset += 10) {
        triggerScroll(viewport, offset);
        fixture.detectChanges();
        flush();

        const expectedRange = {
          start: Math.floor(offset / testComponent.itemSize),
          end: Math.ceil((offset + testComponent.viewportSize) / testComponent.itemSize)
        };
        expect(viewport.getRenderedRange())
            .toEqual(expectedRange,
                `rendered range should match expected value at scroll offset ${offset}`);
        expect(viewport.getOffsetToRenderedContentStart())
            .toBe(expectedRange.start * testComponent.itemSize,
                `rendered content offset should match expected value at scroll offset ${offset}`);
        expect(viewport.measureRenderedContentSize())
            .toBe((expectedRange.end - expectedRange.start) * testComponent.itemSize,
                `rendered content size should match expected value at offset ${offset}`);
      }
    }));

    it('should update viewport as user scrolls up', fakeAsync(() => {
      finishInit(fixture);

      const maxOffset =
          testComponent.itemSize * testComponent.items.length - testComponent.viewportSize;
      for (let offset = maxOffset - 1; offset >= 0; offset -= 10) {
        triggerScroll(viewport, offset);
        fixture.detectChanges();
        flush();

        const expectedRange = {
          start: Math.floor(offset / testComponent.itemSize),
          end: Math.ceil((offset + testComponent.viewportSize) / testComponent.itemSize)
        };
        expect(viewport.getRenderedRange())
            .toEqual(expectedRange,
                `rendered range should match expected value at scroll offset ${offset}`);
        expect(viewport.getOffsetToRenderedContentStart())
            .toBe(expectedRange.start * testComponent.itemSize,
                `rendered content offset should match expected value at scroll offset ${offset}`);
        expect(viewport.measureRenderedContentSize())
            .toBe((expectedRange.end - expectedRange.start) * testComponent.itemSize,
                `rendered content size should match expected value at offset ${offset}`);
      }
    }));

    it('should render buffer element at the end when scrolled to the top', fakeAsync(() => {
      testComponent.minBufferPx = testComponent.itemSize;
      testComponent.maxBufferPx = testComponent.itemSize;
      finishInit(fixture);

      expect(viewport.getRenderedRange()).toEqual({start: 0, end: 5},
          'should render the first 5 50px items to fill 200px space, plus one buffer element at' +
          ' the end');
    }));

    it('should render buffer element at the start and end when scrolled to the middle',
        fakeAsync(() => {
          testComponent.minBufferPx = testComponent.itemSize;
          testComponent.maxBufferPx = testComponent.itemSize;
          finishInit(fixture);
          triggerScroll(viewport, testComponent.itemSize * 2);
          fixture.detectChanges();
          flush();

          expect(viewport.getRenderedRange()).toEqual({start: 1, end: 7},
              'should render 6 50px items to fill 200px space, plus one buffer element at the' +
              ' start and end');
        }));

    it('should render buffer element at the start when scrolled to the bottom', fakeAsync(() => {
      testComponent.minBufferPx = testComponent.itemSize;
      testComponent.maxBufferPx = testComponent.itemSize;
      finishInit(fixture);
      triggerScroll(viewport, testComponent.itemSize * 6);
      fixture.detectChanges();
      flush();

      expect(viewport.getRenderedRange()).toEqual({start: 5, end: 10},
          'should render the last 5 50px items to fill 200px space, plus one buffer element at' +
          ' the start');
    }));

    it('should handle dynamic item size', fakeAsync(() => {
      finishInit(fixture);
      triggerScroll(viewport, testComponent.itemSize * 2);
      fixture.detectChanges();
      flush();

      expect(viewport.getRenderedRange())
          .toEqual({start: 2, end: 6}, 'should render 4 50px items to fill 200px space');

      testComponent.itemSize *= 2;
      fixture.detectChanges();
      flush();

      expect(viewport.getRenderedRange())
          .toEqual({start: 1, end: 3}, 'should render 2 100px items to fill 200px space');
    }));

    it('should handle dynamic buffer size', fakeAsync(() => {
      finishInit(fixture);
      triggerScroll(viewport, testComponent.itemSize * 2);
      fixture.detectChanges();
      flush();

      expect(viewport.getRenderedRange())
          .toEqual({start: 2, end: 6}, 'should render 4 50px items to fill 200px space');

      testComponent.minBufferPx = testComponent.itemSize;
      testComponent.maxBufferPx = testComponent.itemSize;
      fixture.detectChanges();
      flush();

      expect(viewport.getRenderedRange())
          .toEqual({start: 1, end: 7}, 'should expand to 1 buffer element on each side');
    }));

    it('should handle dynamic item array', fakeAsync(() => {
      finishInit(fixture);
      triggerScroll(viewport, testComponent.itemSize * 6);
      fixture.detectChanges();
      flush();

      expect(viewport.getOffsetToRenderedContentStart())
          .toBe(testComponent.itemSize * 6, 'should be scrolled to bottom of 10 item list');

      testComponent.items = Array(5).fill(0);
      fixture.detectChanges();
      flush();

      triggerScroll(viewport);
      fixture.detectChanges();
      flush();

      expect(viewport.getOffsetToRenderedContentStart())
          .toBe(testComponent.itemSize, 'should be scrolled to bottom of 5 item list');
    }));

    it('should update viewport as user scrolls right in horizontal mode', fakeAsync(() => {
      testComponent.orientation = 'horizontal';
      finishInit(fixture);

      const maxOffset =
          testComponent.itemSize * testComponent.items.length - testComponent.viewportSize;
      for (let offset = 1; offset <= maxOffset; offset += 10) {
        triggerScroll(viewport, offset);
        fixture.detectChanges();
        flush();

        const expectedRange = {
          start: Math.floor(offset / testComponent.itemSize),
          end: Math.ceil((offset + testComponent.viewportSize) / testComponent.itemSize)
        };
        expect(viewport.getRenderedRange())
            .toEqual(expectedRange,
                `rendered range should match expected value at scroll offset ${offset}`);
        expect(viewport.getOffsetToRenderedContentStart())
            .toBe(expectedRange.start * testComponent.itemSize,
                `rendered content offset should match expected value at scroll offset ${offset}`);
        expect(viewport.measureRenderedContentSize())
            .toBe((expectedRange.end - expectedRange.start) * testComponent.itemSize,
                `rendered content size should match expected value at offset ${offset}`);
      }
    }));

    it('should update viewport as user scrolls left in horizontal mode', fakeAsync(() => {
      testComponent.orientation = 'horizontal';
      finishInit(fixture);

      const maxOffset =
          testComponent.itemSize * testComponent.items.length - testComponent.viewportSize;
      for (let offset = maxOffset - 1; offset >= 0; offset -= 10) {
        triggerScroll(viewport, offset);
        fixture.detectChanges();
        flush();

        const expectedRange = {
          start: Math.floor(offset / testComponent.itemSize),
          end: Math.ceil((offset + testComponent.viewportSize) / testComponent.itemSize)
        };
        expect(viewport.getRenderedRange())
            .toEqual(expectedRange,
                `rendered range should match expected value at scroll offset ${offset}`);
        expect(viewport.getOffsetToRenderedContentStart())
            .toBe(expectedRange.start * testComponent.itemSize,
                `rendered content offset should match expected value at scroll offset ${offset}`);
        expect(viewport.measureRenderedContentSize())
            .toBe((expectedRange.end - expectedRange.start) * testComponent.itemSize,
                `rendered content size should match expected value at offset ${offset}`);
      }
    }));

    it('should work with an Observable', fakeAsync(() => {
      const data = new Subject<number[]>();
      testComponent.items = data as any;
      finishInit(fixture);

      expect(viewport.getRenderedRange())
          .toEqual({start: 0, end: 0}, 'no items should be rendered');

      data.next([1, 2, 3]);
      fixture.detectChanges();
      flush();

      expect(viewport.getRenderedRange())
          .toEqual({start: 0, end: 3}, 'newly emitted items should be rendered');
    }));

    it('should work with a DataSource', fakeAsync(() => {
      const data = new Subject<number[]>();
      testComponent.items = new ArrayDataSource(data) as any;
      finishInit(fixture);

      expect(viewport.getRenderedRange())
          .toEqual({start: 0, end: 0}, 'no items should be rendered');

      data.next([1, 2, 3]);
      fixture.detectChanges();
      flush();

      expect(viewport.getRenderedRange())
          .toEqual({start: 0, end: 3}, 'newly emitted items should be rendered');
    }));

    it('should trackBy value by default', fakeAsync(() => {
      testComponent.items = [];
      spyOn(testComponent.virtualForViewContainer, 'detach').and.callThrough();
      finishInit(fixture);

      testComponent.items = [0];
      fixture.detectChanges();
      flush();

      expect(testComponent.virtualForViewContainer.detach).not.toHaveBeenCalled();

      testComponent.items = [1];
      fixture.detectChanges();
      flush();

      expect(testComponent.virtualForViewContainer.detach).toHaveBeenCalled();
    }));

    it('should trackBy index when specified', fakeAsync(() => {
      testComponent.trackBy = i => i;
      testComponent.items = [];
      spyOn(testComponent.virtualForViewContainer, 'detach').and.callThrough();
      finishInit(fixture);

      testComponent.items = [0];
      fixture.detectChanges();
      flush();

      expect(testComponent.virtualForViewContainer.detach).not.toHaveBeenCalled();

      testComponent.items = [1];
      fixture.detectChanges();
      flush();

      expect(testComponent.virtualForViewContainer.detach).not.toHaveBeenCalled();
    }));

    it('should recycle views when template cache is large enough to accommodate', fakeAsync(() => {
      testComponent.trackBy = i => i;
      const spy =
          spyOn(testComponent.virtualForViewContainer, 'createEmbeddedView').and.callThrough();
      finishInit(fixture);

      // Should create views for the initial rendered items.
      expect(testComponent.virtualForViewContainer.createEmbeddedView).toHaveBeenCalledTimes(4);

      spy.calls.reset();
      triggerScroll(viewport, 10);
      fixture.detectChanges();
      flush();

      // As we first start to scroll we need to create one more item. This is because the first item
      // is still partially on screen and therefore can't be removed yet. At the same time a new
      // item is now partially on the screen at the bottom and so a new view is needed.
      expect(testComponent.virtualForViewContainer.createEmbeddedView).toHaveBeenCalledTimes(1);

      spy.calls.reset();
      const maxOffset =
          testComponent.itemSize * testComponent.items.length - testComponent.viewportSize;
      for (let offset = 10; offset <= maxOffset; offset += 10) {
        triggerScroll(viewport, offset);
        fixture.detectChanges();
        flush();
      }

      // As we scroll through the rest of the items, no new views should be created, our existing 5
      // can just be recycled as appropriate.
      expect(testComponent.virtualForViewContainer.createEmbeddedView).not.toHaveBeenCalled();
    }));

    it('should not recycle views when template cache is full', fakeAsync(() => {
      testComponent.trackBy = i => i;
      testComponent.templateCacheSize = 0;
      const spy =
          spyOn(testComponent.virtualForViewContainer, 'createEmbeddedView').and.callThrough();
      finishInit(fixture);

      // Should create views for the initial rendered items.
      expect(testComponent.virtualForViewContainer.createEmbeddedView).toHaveBeenCalledTimes(4);

      spy.calls.reset();
      triggerScroll(viewport, 10);
      fixture.detectChanges();
      flush();

      // As we first start to scroll we need to create one more item. This is because the first item
      // is still partially on screen and therefore can't be removed yet. At the same time a new
      // item is now partially on the screen at the bottom and so a new view is needed.
      expect(testComponent.virtualForViewContainer.createEmbeddedView).toHaveBeenCalledTimes(1);

      spy.calls.reset();
      const maxOffset =
          testComponent.itemSize * testComponent.items.length - testComponent.viewportSize;
      for (let offset = 10; offset <= maxOffset; offset += 10) {
        triggerScroll(viewport, offset);
        fixture.detectChanges();
        flush();
      }

      // Since our template cache size is 0, as we scroll through the rest of the items, we need to
      // create a new view for each one.
      expect(testComponent.virtualForViewContainer.createEmbeddedView).toHaveBeenCalledTimes(5);
    }));

    it('should render up to maxBufferPx when buffer dips below minBufferPx', fakeAsync(() => {
      testComponent.minBufferPx = testComponent.itemSize;
      testComponent.maxBufferPx = testComponent.itemSize * 2;
      finishInit(fixture);

      expect(viewport.getRenderedRange())
          .toEqual({start: 0, end: 6}, 'should have 2 buffer items initially');

      triggerScroll(viewport, 50);
      fixture.detectChanges();
      flush();

      expect(viewport.getRenderedRange())
          .toEqual({start: 0, end: 6}, 'should not render additional buffer yet');

      triggerScroll(viewport, 51);
      fixture.detectChanges();
      flush();

      expect(viewport.getRenderedRange())
          .toEqual({start: 0, end: 8}, 'should render 2 more buffer items');
    }));

    it('should throw if maxBufferPx is less than minBufferPx', fakeAsync(() => {
      testComponent.minBufferPx = 100;
      testComponent.maxBufferPx = 99;
      expect(() => finishInit(fixture)).toThrow();
    }));
  });
});


/** Finish initializing the virtual scroll component at the beginning of a test. */
function finishInit(fixture: ComponentFixture<any>) {
  // On the first cycle we render and measure the viewport.
  fixture.detectChanges();
  flush();

  // On the second cycle we render the items.
  fixture.detectChanges();
  flush();
}

/** Trigger a scroll event on the viewport (optionally setting a new scroll offset). */
function triggerScroll(viewport: CdkVirtualScrollViewport, offset?: number) {
  if (offset !== undefined) {
    if (viewport.orientation == 'horizontal') {
      viewport.elementRef.nativeElement.scrollLeft = offset;
    } else {
      viewport.elementRef.nativeElement.scrollTop = offset;
    }
  }
  dispatchFakeEvent(viewport.elementRef.nativeElement, 'scroll');
  animationFrameScheduler.flush();
}


@Component({
  template: `
    <cdk-virtual-scroll-viewport
        [itemSize]="itemSize" [minBufferPx]="minBufferPx" [maxBufferPx]="maxBufferPx"
        [orientation]="orientation" [style.height.px]="viewportHeight"
        [style.width.px]="viewportWidth" (scrolledIndexChange)="scrolledToIndex = $event">
      <div class="item"
           *cdkVirtualFor="let item of items; let i = index; trackBy: trackBy; \
                           templateCacheSize: templateCacheSize"
           [style.height.px]="itemSize" [style.width.px]="itemSize">
        {{i}} - {{item}}
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  styles: [`
    .cdk-virtual-scroll-content-wrapper {
      display: flex;
      flex-direction: column;
    }

    .cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper {
      flex-direction: row;
    }
  `],
  encapsulation: ViewEncapsulation.None,
})
class FixedSizeVirtualScroll {
  @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport;
  @ViewChild(CdkVirtualForOf, {read: ViewContainerRef}) virtualForViewContainer: ViewContainerRef;

  @Input() orientation = 'vertical';
  @Input() viewportSize = 200;
  @Input() viewportCrossSize = 100;
  @Input() itemSize = 50;
  @Input() minBufferPx = 0;
  @Input() maxBufferPx = 0;
  @Input() items = Array(10).fill(0).map((_, i) => i);
  @Input() trackBy;
  @Input() templateCacheSize = 20;

  scrolledToIndex = 0;

  get viewportWidth() {
    return this.orientation == 'horizontal' ? this.viewportSize : this.viewportCrossSize;
  }

  get viewportHeight() {
    return this.orientation == 'horizontal' ? this.viewportCrossSize : this.viewportSize;
  }
}
