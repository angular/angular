import {Component, QueryList, ElementRef, ViewChildren, AfterViewInit} from '@angular/core';
import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {createMouseEvent, dispatchEvent} from '@angular/cdk/testing/private';
import {Observable} from 'rxjs';
import {FocusableElement, PointerFocusTracker} from './pointer-focus-tracker';

describe('FocusMouseManger', () => {
  let fixture: ComponentFixture<MultiElementWithConditionalComponent>;
  let entered: Observable<MockWrapper>;
  let exited: Observable<MockWrapper>;
  let mockElements: MockWrapper[];

  /** Get the components under test from the fixture. */
  function getComponentsForTesting() {
    entered = fixture.componentInstance.focusTracker.entered;
    exited = fixture.componentInstance.focusTracker.exited;
    mockElements = fixture.componentInstance._allItems.toArray();
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MultiElementWithConditionalComponent, MockWrapper],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiElementWithConditionalComponent);
    fixture.detectChanges();

    getComponentsForTesting();
  });

  it('should emit on mouseEnter observable when mouse enters a tracked element', () => {
    const spy = jasmine.createSpy('mouse enter spy');
    entered.subscribe(spy);

    const event = createMouseEvent('mouseenter');
    dispatchEvent(mockElements[0]._elementRef.nativeElement, event);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(mockElements[0]);
  });

  it('should emit on mouseExit observable when mouse exits a tracked element', () => {
    const spy = jasmine.createSpy('mouse exit spy');
    exited.subscribe(spy);

    dispatchEvent(mockElements[0]._elementRef.nativeElement, createMouseEvent('mouseenter'));
    dispatchEvent(mockElements[0]._elementRef.nativeElement, createMouseEvent('mouseout'));
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(mockElements[0]);
  });

  it('should be aware of newly created/added components and track them', () => {
    const spy = jasmine.createSpy('mouse enter spy');
    entered.subscribe(spy);

    expect(mockElements.length).toBe(2);
    fixture.componentInstance.showThird = true;
    fixture.detectChanges();
    getComponentsForTesting();

    const mouseEnter = createMouseEvent('mouseenter');
    dispatchEvent(mockElements[2]._elementRef.nativeElement, mouseEnter);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(mockElements[2]);
  });

  it('should toggle focused items when hovering from one to another', () => {
    const spy = jasmine.createSpy('focus toggle spy');
    entered.subscribe(spy);

    const mouseEnter = createMouseEvent('mouseenter');
    dispatchEvent(mockElements[0]._elementRef.nativeElement, mouseEnter);
    dispatchEvent(mockElements[1]._elementRef.nativeElement, mouseEnter);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)[0]).toEqual(mockElements[0]);
    expect(spy.calls.argsFor(1)[0]).toEqual(mockElements[1]);
  });

  it('should toggle active and previous items when hovering from one to another', () => {
    const mouseEnter = createMouseEvent('mouseenter');
    const mouseOut = createMouseEvent('mouseout');
    dispatchEvent(mockElements[0]._elementRef.nativeElement, mouseEnter);
    dispatchEvent(mockElements[0]._elementRef.nativeElement, mouseOut);
    dispatchEvent(mockElements[1]._elementRef.nativeElement, mouseEnter);

    expect(fixture.componentInstance.focusTracker.activeElement).toEqual(mockElements[1]);
    expect(fixture.componentInstance.focusTracker.previousElement).toEqual(mockElements[0]);
  });
});

@Component({
  selector: 'wrapper',
  template: `<ng-content></ng-content>`,
})
class MockWrapper implements FocusableElement {
  constructor(readonly _elementRef: ElementRef<HTMLElement>) {}
}

@Component({
  template: `
    <div>
      <wrapper>First</wrapper>
      <wrapper>Second</wrapper>
      <wrapper *ngIf="showThird">Third</wrapper>
    </div>
  `,
})
class MultiElementWithConditionalComponent implements AfterViewInit {
  /** Whether the third element should be displayed. */
  showThird = false;

  /** All mock elements. */
  @ViewChildren(MockWrapper) readonly _allItems: QueryList<MockWrapper>;

  /** Manages elements under mouse focus. */
  focusTracker: PointerFocusTracker<MockWrapper>;

  ngAfterViewInit() {
    this.focusTracker = new PointerFocusTracker(this._allItems);
  }
}
