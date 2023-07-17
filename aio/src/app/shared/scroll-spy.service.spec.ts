import { Injector } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';

import { ScrollService } from 'app/shared/scroll.service';
import {
  ScrollItem,
  ScrollSpiedElement,
  ScrollSpiedElementGroup,
  ScrollSpyService,
} from 'app/shared/scroll-spy.service';


describe('ScrollSpiedElement', () => {
  it('should expose the spied element and index', () => {
    const elem = {} as Element;
    const spiedElem = new ScrollSpiedElement(elem, 42);

    expect(spiedElem.element).toBe(elem);
    expect(spiedElem.index).toBe(42);
  });

  describe('#calculateTop()', () => {
    it('should calculate the `top` value', () => {
      const elem = {getBoundingClientRect: () => ({top: 100})} as Element;
      const spiedElem = new ScrollSpiedElement(elem, 42);

      spiedElem.calculateTop(0, 0);
      expect(spiedElem.top).toBe(100);

      spiedElem.calculateTop(20, 0);
      expect(spiedElem.top).toBe(120);

      spiedElem.calculateTop(0, 10);
      expect(spiedElem.top).toBe(90);

      spiedElem.calculateTop(20, 10);
      expect(spiedElem.top).toBe(110);
    });
  });
});


describe('ScrollSpiedElementGroup', () => {
  describe('#calibrate()', () => {
    it('should calculate `top` for all spied elements', () => {
      const spy = spyOn(ScrollSpiedElement.prototype, 'calculateTop');
      const elems = [{}, {}, {}] as Element[];
      const group = new ScrollSpiedElementGroup(elems);

      expect(spy).not.toHaveBeenCalled();

      group.calibrate(20, 10);
      const callInfo = spy.calls.all();

      expect(spy).toHaveBeenCalledTimes(3);
      expect((callInfo[0].object as ScrollSpiedElement).index).toBe(0);
      expect((callInfo[1].object as ScrollSpiedElement).index).toBe(1);
      expect((callInfo[2].object as ScrollSpiedElement).index).toBe(2);
      expect(callInfo[0].args).toEqual([20, 10]);
      expect(callInfo[1].args).toEqual([20, 10]);
      expect(callInfo[2].args).toEqual([20, 10]);
    });
  });

  describe('#onScroll()', () => {
    let group: ScrollSpiedElementGroup;
    let activeItems: (ScrollItem|null)[];

    const activeIndices = () => activeItems.map(x => x && x.index);

    beforeEach(() => {
      const tops = [50, 150, 100];

      spyOn(ScrollSpiedElement.prototype, 'calculateTop').and.callFake(
        function(this: ScrollSpiedElement) {
        this.top = tops[this.index];
      });

      activeItems = [];
      group = new ScrollSpiedElementGroup([{}, {}, {}] as Element[]);
      group.activeScrollItem.subscribe(item => activeItems.push(item));
      group.calibrate(20, 10);
    });


    it('should emit a `ScrollItem` on `activeScrollItem`', () => {
      expect(activeItems.length).toBe(0);

      group.onScroll(20, 140);
      expect(activeItems.length).toBe(1);

      group.onScroll(20, 140);
      expect(activeItems.length).toBe(2);
    });

    it('should emit the lower-most element that is above `scrollTop`', () => {
      group.onScroll(45, 200);
      group.onScroll(55, 200);
      expect(activeIndices()).toEqual([null, 0]);

      activeItems.length = 0;
      group.onScroll(95, 200);
      group.onScroll(105, 200);
      expect(activeIndices()).toEqual([0, 2]);

      activeItems.length = 0;
      group.onScroll(145, 200);
      group.onScroll(155, 200);
      expect(activeIndices()).toEqual([2, 1]);

      activeItems.length = 0;
      group.onScroll(75, 200);
      group.onScroll(175, 200);
      group.onScroll(125, 200);
      group.onScroll(25, 200);
      expect(activeIndices()).toEqual([0, 1, 2, null]);
    });

    it('should always emit the lower-most element if scrolled to the bottom', () => {
      group.onScroll(140, 140);
      group.onScroll(145, 140);
      group.onScroll(138.5, 140);
      group.onScroll(139.5, 140);

      expect(activeIndices()).toEqual([1, 1, 2, 1]);
    });

    it('should emit null if all elements are below `scrollTop`', () => {
      group.onScroll(0, 140);
      expect(activeItems).toEqual([null]);

      group.onScroll(49, 140);
      expect(activeItems).toEqual([null, null]);
    });

    it('should emit null if there are no spied elements (even if scrolled to the bottom)', () => {
      group = new ScrollSpiedElementGroup([]);
      group.activeScrollItem.subscribe(item => activeItems.push(item));

      group.onScroll(20, 140);
      expect(activeItems).toEqual([null]);

      group.onScroll(140, 140);
      expect(activeItems).toEqual([null, null]);

      group.onScroll(145, 140);
      expect(activeItems).toEqual([null, null, null]);
    });
  });
});


describe('ScrollSpyService', () => {
  let injector: Injector;
  let scrollSpyService: ScrollSpyService;

  beforeEach(() => {
    injector = Injector.create({providers: [
      { provide: DOCUMENT, useValue: { body: {} } },
      { provide: ScrollService, useValue: { topOffset: 50 } },
      { provide: ScrollSpyService, deps: [DOCUMENT, ScrollService] }
    ]});

    scrollSpyService = injector.get(ScrollSpyService);
  });


  describe('#spyOn()', () => {
    let getSpiedElemGroups: () => ScrollSpiedElementGroup[];

    beforeEach(() => {
      getSpiedElemGroups = () => (scrollSpyService as any).spiedElementGroups;
    });


    it('should create a `ScrollSpiedElementGroup` when called', () => {
      expect(getSpiedElemGroups().length).toBe(0);

      scrollSpyService.spyOn([]);
      expect(getSpiedElemGroups().length).toBe(1);
    });

    it('should initialize the newly created `ScrollSpiedElementGroup`', () => {
      const calibrateSpy = spyOn(ScrollSpiedElementGroup.prototype, 'calibrate');
      const onScrollSpy = spyOn(ScrollSpiedElementGroup.prototype, 'onScroll');

      scrollSpyService.spyOn([]);
      expect(calibrateSpy).toHaveBeenCalledTimes(1);
      expect(onScrollSpy).toHaveBeenCalledTimes(1);

      scrollSpyService.spyOn([]);
      expect(calibrateSpy).toHaveBeenCalledTimes(2);
      expect(onScrollSpy).toHaveBeenCalledTimes(2);
    });

    it('should call `onResize()` if it is the first `ScrollSpiedElementGroup`', () => {
      const actions: string[] = [];

      const onResizeSpy = spyOn(ScrollSpyService.prototype as any, 'onResize')
                          .and.callFake(() => actions.push('onResize'));
      const calibrateSpy = spyOn(ScrollSpiedElementGroup.prototype, 'calibrate')
                           .and.callFake(() => actions.push('calibrate'));

      expect(onResizeSpy).not.toHaveBeenCalled();
      expect(calibrateSpy).not.toHaveBeenCalled();

      scrollSpyService.spyOn([]);
      expect(actions).toEqual(['onResize', 'calibrate']);

      scrollSpyService.spyOn([]);
      expect(actions).toEqual(['onResize', 'calibrate', 'calibrate']);
    });

    it('should forward `ScrollSpiedElementGroup#activeScrollItem` as `active`', () => {
      const activeIndices1: (number | null)[] = [];
      const activeIndices2: (number | null)[] = [];

      const info1 = scrollSpyService.spyOn([]);
      const info2 = scrollSpyService.spyOn([]);
      const spiedElemGroups = getSpiedElemGroups();

      info1.active.subscribe(item => activeIndices1.push(item && item.index));
      info2.active.subscribe(item => activeIndices2.push(item && item.index));
      activeIndices1.length = 0;
      activeIndices2.length = 0;

      spiedElemGroups[0].activeScrollItem.next({index: 1} as ScrollItem);
      spiedElemGroups[0].activeScrollItem.next({index: 2} as ScrollItem);
      spiedElemGroups[1].activeScrollItem.next({index: 3} as ScrollItem);
      spiedElemGroups[0].activeScrollItem.next(null);
      spiedElemGroups[1].activeScrollItem.next({index: 4} as ScrollItem);
      spiedElemGroups[1].activeScrollItem.next(null);
      spiedElemGroups[0].activeScrollItem.next({index: 5} as ScrollItem);
      spiedElemGroups[1].activeScrollItem.next({index: 6} as ScrollItem);

      expect(activeIndices1).toEqual([1, 2, null, 5]);
      expect(activeIndices2).toEqual([3, 4, null, 6]);
    });

    it('should remember and emit the last active item to new subscribers', () => {
      const items = [{index: 1}, {index: 2}, {index: 3}] as ScrollItem[];
      let lastActiveItem = null as unknown as ScrollItem|null;

      const info = scrollSpyService.spyOn([]);
      const spiedElemGroup = getSpiedElemGroups()[0];

      spiedElemGroup.activeScrollItem.next(items[0]);
      spiedElemGroup.activeScrollItem.next(items[1]);
      spiedElemGroup.activeScrollItem.next(items[2]);
      spiedElemGroup.activeScrollItem.next(null);
      spiedElemGroup.activeScrollItem.next(items[1]);
      info.active.subscribe(item => lastActiveItem = item);

      expect(lastActiveItem).toBe(items[1]);

      spiedElemGroup.activeScrollItem.next(null);
      info.active.subscribe(item => lastActiveItem = item);

      expect(lastActiveItem).toBeNull();
    });

    it('should only emit distinct values on `active`', () => {
      const items = [{index: 1}, {index: 2}] as ScrollItem[];
      const activeIndices: (number | null)[] = [];

      const info = scrollSpyService.spyOn([]);
      const spiedElemGroup = getSpiedElemGroups()[0];

      info.active.subscribe(item => activeIndices.push(item && item.index));
      activeIndices.length = 0;

      spiedElemGroup.activeScrollItem.next(items[0]);
      spiedElemGroup.activeScrollItem.next(items[0]);
      spiedElemGroup.activeScrollItem.next(items[1]);
      spiedElemGroup.activeScrollItem.next(items[1]);
      spiedElemGroup.activeScrollItem.next(null);
      spiedElemGroup.activeScrollItem.next(null);
      spiedElemGroup.activeScrollItem.next(items[0]);
      spiedElemGroup.activeScrollItem.next(items[1]);
      spiedElemGroup.activeScrollItem.next(null);

      expect(activeIndices).toEqual([1, 2, null, 1, 2, null]);
    });

    it('should remove the corresponding `ScrollSpiedElementGroup` when calling `unspy()`', () => {
      const info1 = scrollSpyService.spyOn([]);
      const info2 = scrollSpyService.spyOn([]);
      const info3 = scrollSpyService.spyOn([]);
      const groups = getSpiedElemGroups().slice();

      expect(getSpiedElemGroups()).toEqual(groups);

      info2.unspy();
      expect(getSpiedElemGroups()).toEqual([groups[0], groups[2]]);

      info1.unspy();
      expect(getSpiedElemGroups()).toEqual([groups[2]]);

      info3.unspy();
      expect(getSpiedElemGroups()).toEqual([]);
    });
  });

  describe('window resize events', () => {
    const RESIZE_EVENT_DELAY = 300;
    let onResizeSpy: jasmine.Spy;

    beforeEach(() => {
      onResizeSpy = spyOn(ScrollSpyService.prototype as any, 'onResize');
    });


    it('should be subscribed to when the first group of elements is spied on', fakeAsync(() => {
      window.dispatchEvent(new Event('resize'));
      expect(onResizeSpy).not.toHaveBeenCalled();

      scrollSpyService.spyOn([]);
      onResizeSpy.calls.reset();

      window.dispatchEvent(new Event('resize'));
      expect(onResizeSpy).not.toHaveBeenCalled();

      tick(RESIZE_EVENT_DELAY);
      expect(onResizeSpy).toHaveBeenCalled();
    }));

    it('should be unsubscribed from when the last group of elements is removed', fakeAsync(() => {
      const info1 = scrollSpyService.spyOn([]);
      const info2 = scrollSpyService.spyOn([]);
      onResizeSpy.calls.reset();

      window.dispatchEvent(new Event('resize'));
      tick(RESIZE_EVENT_DELAY);
      expect(onResizeSpy).toHaveBeenCalled();

      info1.unspy();
      onResizeSpy.calls.reset();

      window.dispatchEvent(new Event('resize'));
      tick(RESIZE_EVENT_DELAY);
      expect(onResizeSpy).toHaveBeenCalled();

      info2.unspy();
      onResizeSpy.calls.reset();

      window.dispatchEvent(new Event('resize'));
      tick(RESIZE_EVENT_DELAY);
      expect(onResizeSpy).not.toHaveBeenCalled();
    }));

    it(`should only fire every ${RESIZE_EVENT_DELAY}ms`, fakeAsync(() => {
      scrollSpyService.spyOn([]);
      onResizeSpy.calls.reset();

      window.dispatchEvent(new Event('resize'));
      tick(RESIZE_EVENT_DELAY - 2);
      expect(onResizeSpy).not.toHaveBeenCalled();

      window.dispatchEvent(new Event('resize'));
      tick(1);
      expect(onResizeSpy).not.toHaveBeenCalled();

      window.dispatchEvent(new Event('resize'));
      tick(1);
      expect(onResizeSpy).toHaveBeenCalledTimes(1);

      onResizeSpy.calls.reset();
      tick(RESIZE_EVENT_DELAY / 2);

      window.dispatchEvent(new Event('resize'));
      tick(RESIZE_EVENT_DELAY - 2);
      expect(onResizeSpy).not.toHaveBeenCalled();

      window.dispatchEvent(new Event('resize'));
      tick(1);
      expect(onResizeSpy).not.toHaveBeenCalled();

      window.dispatchEvent(new Event('resize'));
      tick(1);
      expect(onResizeSpy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('window scroll events', () => {
    const SCROLL_EVENT_DELAY = 10;
    let onScrollSpy: jasmine.Spy;

    beforeEach(() => {
      onScrollSpy = spyOn(ScrollSpyService.prototype as any, 'onScroll');
    });


    it('should be subscribed to when the first group of elements is spied on', fakeAsync(() => {
      window.dispatchEvent(new Event('scroll'));
      expect(onScrollSpy).not.toHaveBeenCalled();

      scrollSpyService.spyOn([]);

      window.dispatchEvent(new Event('scroll'));
      expect(onScrollSpy).not.toHaveBeenCalled();

      tick(SCROLL_EVENT_DELAY);
      expect(onScrollSpy).toHaveBeenCalled();
    }));

    it('should be unsubscribed from when the last group of elements is removed', fakeAsync(() => {
      const info1 = scrollSpyService.spyOn([]);
      const info2 = scrollSpyService.spyOn([]);

      window.dispatchEvent(new Event('scroll'));
      tick(SCROLL_EVENT_DELAY);
      expect(onScrollSpy).toHaveBeenCalled();

      info1.unspy();
      onScrollSpy.calls.reset();

      window.dispatchEvent(new Event('scroll'));
      tick(SCROLL_EVENT_DELAY);
      expect(onScrollSpy).toHaveBeenCalled();

      info2.unspy();
      onScrollSpy.calls.reset();

      window.dispatchEvent(new Event('scroll'));
      tick(SCROLL_EVENT_DELAY);
      expect(onScrollSpy).not.toHaveBeenCalled();
    }));

    it(`should only fire every ${SCROLL_EVENT_DELAY}ms`, fakeAsync(() => {
      scrollSpyService.spyOn([]);

      window.dispatchEvent(new Event('scroll'));
      tick(SCROLL_EVENT_DELAY - 2);
      expect(onScrollSpy).not.toHaveBeenCalled();

      window.dispatchEvent(new Event('scroll'));
      tick(1);
      expect(onScrollSpy).not.toHaveBeenCalled();

      window.dispatchEvent(new Event('scroll'));
      tick(1);
      expect(onScrollSpy).toHaveBeenCalledTimes(1);

      onScrollSpy.calls.reset();
      tick(SCROLL_EVENT_DELAY / 2);

      window.dispatchEvent(new Event('scroll'));
      tick(SCROLL_EVENT_DELAY - 2);
      expect(onScrollSpy).not.toHaveBeenCalled();

      window.dispatchEvent(new Event('scroll'));
      tick(1);
      expect(onScrollSpy).not.toHaveBeenCalled();

      window.dispatchEvent(new Event('scroll'));
      tick(1);
      expect(onScrollSpy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('#onResize()', () => {
    it('should re-calibrate each `ScrollSpiedElementGroup`', () => {
      scrollSpyService.spyOn([]);
      scrollSpyService.spyOn([]);
      scrollSpyService.spyOn([]);

      const spiedElemGroups: ScrollSpiedElementGroup[] = (scrollSpyService as any).spiedElementGroups;
      const calibrateSpies = spiedElemGroups.map(group => spyOn(group, 'calibrate'));

      calibrateSpies.forEach(spy => expect(spy).not.toHaveBeenCalled());

      (scrollSpyService as any).onResize();
      calibrateSpies.forEach(spy => expect(spy).toHaveBeenCalled());
    });
  });

  describe('#onScroll()', () => {
    it('should propagate to each `ScrollSpiedElementGroup`', () => {
      scrollSpyService.spyOn([]);
      scrollSpyService.spyOn([]);
      scrollSpyService.spyOn([]);

      const spiedElemGroups: ScrollSpiedElementGroup[] = (scrollSpyService as any).spiedElementGroups;
      const onScrollSpies = spiedElemGroups.map(group => spyOn(group, 'onScroll'));

      onScrollSpies.forEach(spy => expect(spy).not.toHaveBeenCalled());

      (scrollSpyService as any).onScroll();
      onScrollSpies.forEach(spy => expect(spy).toHaveBeenCalled());
    });

    it('should first re-calibrate if the content height has changed', () => {
      const body = injector.get(DOCUMENT).body as any;

      scrollSpyService.spyOn([]);
      scrollSpyService.spyOn([]);
      scrollSpyService.spyOn([]);

      const spiedElemGroups: ScrollSpiedElementGroup[] = (scrollSpyService as any).spiedElementGroups;
      const onScrollSpies = spiedElemGroups.map(group => spyOn(group, 'onScroll'));
      const calibrateSpies = spiedElemGroups.map((group, i) => spyOn(group, 'calibrate')
                .and.callFake(() => expect(onScrollSpies[i]).not.toHaveBeenCalled()));

      calibrateSpies.forEach(spy => expect(spy).not.toHaveBeenCalled());
      onScrollSpies.forEach(spy => expect(spy).not.toHaveBeenCalled());

      // No content height change...
      (scrollSpyService as any).onScroll();
      calibrateSpies.forEach(spy => expect(spy).not.toHaveBeenCalled());
      onScrollSpies.forEach(spy => expect(spy).toHaveBeenCalled());

      onScrollSpies.forEach(spy => spy.calls.reset());
      body.scrollHeight = 100;

      // Viewport changed...
      (scrollSpyService as any).onScroll();
      calibrateSpies.forEach(spy => expect(spy).toHaveBeenCalled());
      onScrollSpies.forEach(spy => expect(spy).toHaveBeenCalled());
    });
  });
});
