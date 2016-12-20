import {inject, TestBed, async, ComponentFixture} from '@angular/core/testing';
import {NgModule, Component, ViewChild, ElementRef} from '@angular/core';
import {ScrollDispatcher} from './scroll-dispatcher';
import {OverlayModule} from '../overlay-directives';
import {Scrollable} from './scrollable';

describe('Scroll Dispatcher', () => {
  let scroll: ScrollDispatcher;
  let fixture: ComponentFixture<ScrollingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule.forRoot(), ScrollTestModule],
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([ScrollDispatcher], (s: ScrollDispatcher) => {
    scroll = s;

    fixture = TestBed.createComponent(ScrollingComponent);
    fixture.detectChanges();
  }));

  it('should be registered with the scrollable directive with the scroll service', () => {
    const componentScrollable = fixture.componentInstance.scrollable;
    expect(scroll.scrollableReferences.has(componentScrollable)).toBe(true);
  });

  it('should have the scrollable directive deregistered when the component is destroyed', () => {
    const componentScrollable = fixture.componentInstance.scrollable;
    expect(scroll.scrollableReferences.has(componentScrollable)).toBe(true);

    fixture.destroy();
    expect(scroll.scrollableReferences.has(componentScrollable)).toBe(false);
  });

  it('should notify through the directive and service that a scroll event occurred', () => {
    let hasDirectiveScrollNotified = false;
    // Listen for notifications from scroll directive
    let scrollable = fixture.componentInstance.scrollable;
    scrollable.elementScrolled().subscribe(() => { hasDirectiveScrollNotified = true; });

    // Listen for notifications from scroll service
    let hasServiceScrollNotified = false;
    scroll.scrolled().subscribe(() => { hasServiceScrollNotified = true; });

    // Emit a scroll event from the scrolling element in our component.
    // This event should be picked up by the scrollable directive and notify.
    // The notification should be picked up by the service.
    const scrollEvent = document.createEvent('UIEvents');
    scrollEvent.initUIEvent('scroll', true, true, window, 0);
    fixture.componentInstance.scrollingElement.nativeElement.dispatchEvent(scrollEvent);

    expect(hasDirectiveScrollNotified).toBe(true);
    expect(hasServiceScrollNotified).toBe(true);
  });
});


/** Simple component that contains a large div and can be scrolled. */
@Component({
  template: `<div #scrollingElement cdk-scrollable style="height: 9999px"></div>`
})
class ScrollingComponent {
  @ViewChild(Scrollable) scrollable: Scrollable;
  @ViewChild('scrollingElement') scrollingElement: ElementRef;
}

const TEST_COMPONENTS = [ScrollingComponent];
@NgModule({
  imports: [OverlayModule],
  providers: [ScrollDispatcher],
  exports: TEST_COMPONENTS,
  declarations: TEST_COMPONENTS,
  entryComponents: TEST_COMPONENTS,
})
class ScrollTestModule { }
