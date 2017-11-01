import {inject, TestBed, async, fakeAsync, ComponentFixture, tick} from '@angular/core/testing';
import {NgModule, Component, ViewChild, ElementRef} from '@angular/core';
import {CdkScrollable, ScrollDispatcher, ScrollDispatchModule} from './public-api';
import {dispatchFakeEvent} from '@angular/cdk/testing';

describe('Scroll Dispatcher', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ScrollTestModule],
    });

    TestBed.compileComponents();
  }));

  describe('Basic usage', () => {
    let scroll: ScrollDispatcher;
    let fixture: ComponentFixture<ScrollingComponent>;

    beforeEach(inject([ScrollDispatcher], (s: ScrollDispatcher) => {
      scroll = s;

      fixture = TestBed.createComponent(ScrollingComponent);
      fixture.detectChanges();
    }));

    it('should be registered with the scrollable directive with the scroll service', () => {
      const componentScrollable = fixture.componentInstance.scrollable;
      expect(scroll.scrollContainers.has(componentScrollable)).toBe(true);
    });

    it('should have the scrollable directive deregistered when the component is destroyed', () => {
      const componentScrollable = fixture.componentInstance.scrollable;
      expect(scroll.scrollContainers.has(componentScrollable)).toBe(true);

      fixture.destroy();
      expect(scroll.scrollContainers.has(componentScrollable)).toBe(false);
    });

    it('should notify through the directive and service that a scroll event occurred',
        fakeAsync(() => {
      // Listen for notifications from scroll directive
      const scrollable = fixture.componentInstance.scrollable;
      const directiveSpy = jasmine.createSpy('directive scroll callback');
      scrollable.elementScrolled().subscribe(directiveSpy);

      // Listen for notifications from scroll service with a throttle of 100ms
      const throttleTime = 100;
      const serviceSpy = jasmine.createSpy('service scroll callback');
      scroll.scrolled(throttleTime).subscribe(serviceSpy);

      // Emit a scroll event from the scrolling element in our component.
      // This event should be picked up by the scrollable directive and notify.
      // The notification should be picked up by the service.
      dispatchFakeEvent(fixture.componentInstance.scrollingElement.nativeElement, 'scroll', false);

      // The scrollable directive should have notified the service immediately.
      expect(directiveSpy).toHaveBeenCalled();

      // Verify that the throttle is used, the service should wait for the throttle time until
      // sending the notification.
      expect(serviceSpy).not.toHaveBeenCalled();

      // After the throttle time, the notification should be sent.
      tick(throttleTime);
      expect(serviceSpy).toHaveBeenCalled();
    }));

    it('should not execute the global events in the Angular zone', () => {
      scroll.scrolled(0).subscribe(() => {});
      dispatchFakeEvent(document, 'scroll', false);

      expect(fixture.ngZone!.isStable).toBe(true);
    });

    it('should not execute the scrollable events in the Angular zone', () => {
      dispatchFakeEvent(fixture.componentInstance.scrollingElement.nativeElement, 'scroll');
      expect(fixture.ngZone!.isStable).toBe(true);
    });

    it('should be able to unsubscribe from the global scrollable', () => {
      const spy = jasmine.createSpy('global scroll callback');
      const subscription = scroll.scrolled(0).subscribe(spy);

      dispatchFakeEvent(document, 'scroll', false);
      expect(spy).toHaveBeenCalledTimes(1);

      subscription.unsubscribe();
      dispatchFakeEvent(document, 'scroll', false);

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Nested scrollables', () => {
    let scroll: ScrollDispatcher;
    let fixture: ComponentFixture<NestedScrollingComponent>;
    let element: ElementRef;

    beforeEach(inject([ScrollDispatcher], (s: ScrollDispatcher) => {
      scroll = s;

      fixture = TestBed.createComponent(NestedScrollingComponent);
      fixture.detectChanges();
      element = fixture.componentInstance.interestingElement;
    }));

    it('should be able to identify the containing scrollables of an element', () => {
      const scrollContainers = scroll.getAncestorScrollContainers(element);
      const scrollableElementIds =
          scrollContainers.map(scrollable => scrollable.getElementRef().nativeElement.id);

      expect(scrollableElementIds).toEqual(['scrollable-1', 'scrollable-1a']);
    });

    it('should emit when one of the ancestor scrollable containers is scrolled', () => {
      const spy = jasmine.createSpy('scroll spy');
      const subscription = scroll.ancestorScrolled(element, 0).subscribe(spy);
      const grandparent = fixture.debugElement.nativeElement.querySelector('#scrollable-1');

      dispatchFakeEvent(grandparent, 'scroll', false);
      expect(spy).toHaveBeenCalledTimes(1);

      dispatchFakeEvent(window.document, 'scroll', false);
      expect(spy).toHaveBeenCalledTimes(2);

      subscription.unsubscribe();
    });

    it('should not emit when a non-ancestor is scrolled', () => {
      const spy = jasmine.createSpy('scroll spy');
      const subscription = scroll.ancestorScrolled(element, 0).subscribe(spy);
      const stranger = fixture.debugElement.nativeElement.querySelector('#scrollable-2');

      dispatchFakeEvent(stranger, 'scroll', false);
      expect(spy).not.toHaveBeenCalled();

      subscription.unsubscribe();
    });
  });

  describe('lazy subscription', () => {
    let scroll: ScrollDispatcher;

    beforeEach(inject([ScrollDispatcher], (s: ScrollDispatcher) => {
      scroll = s;
    }));

    it('should lazily add global listeners as service subscriptions are added and removed', () => {
      expect(scroll._globalSubscription).toBeNull('Expected no global listeners on init.');

      const subscription = scroll.scrolled(0).subscribe(() => {});

      expect(scroll._globalSubscription).toBeTruthy(
          'Expected global listeners after a subscription has been added.');

      subscription.unsubscribe();

      expect(scroll._globalSubscription).toBeNull(
          'Expected global listeners to have been removed after the subscription has stopped.');
    });

    it('should remove global listeners on unsubscribe, despite any other live scrollables', () => {
      const fixture = TestBed.createComponent(NestedScrollingComponent);
      fixture.detectChanges();

      expect(scroll._globalSubscription).toBeNull('Expected no global listeners on init.');
      expect(scroll.scrollContainers.size).toBe(4, 'Expected multiple scrollables');

      const subscription = scroll.scrolled(0).subscribe(() => {});

      expect(scroll._globalSubscription).toBeTruthy(
          'Expected global listeners after a subscription has been added.');

      subscription.unsubscribe();

      expect(scroll._globalSubscription).toBeNull(
          'Expected global listeners to have been removed after the subscription has stopped.');
      expect(scroll.scrollContainers.size)
          .toBe(4, 'Expected scrollable count to stay the same');
    });

  });
});


/** Simple component that contains a large div and can be scrolled. */
@Component({
  template: `<div #scrollingElement cdk-scrollable style="height: 9999px"></div>`
})
class ScrollingComponent {
  @ViewChild(CdkScrollable) scrollable: CdkScrollable;
  @ViewChild('scrollingElement') scrollingElement: ElementRef;
}


/** Component containing nested scrollables. */
@Component({
  template: `
    <div id="scrollable-1" cdk-scrollable>
      <div id="scrollable-1a" cdk-scrollable>
        <div #interestingElement></div>
      </div>
      <div id="scrollable-1b" cdk-scrollable></div>
    </div>
    <div id="scrollable-2" cdk-scrollable></div>
  `
})
class NestedScrollingComponent {
  @ViewChild('interestingElement') interestingElement: ElementRef;
}

const TEST_COMPONENTS = [ScrollingComponent, NestedScrollingComponent];
@NgModule({
  imports: [ScrollDispatchModule],
  providers: [ScrollDispatcher],
  exports: TEST_COMPONENTS,
  declarations: TEST_COMPONENTS,
  entryComponents: TEST_COMPONENTS,
})
class ScrollTestModule { }
