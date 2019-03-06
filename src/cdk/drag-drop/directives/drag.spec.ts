import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  Provider,
  QueryList,
  Type,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from '@angular/core';
import {TestBed, ComponentFixture, fakeAsync, flush, tick} from '@angular/core/testing';
import {DOCUMENT} from '@angular/common';
import {DragDropModule} from '../drag-drop-module';
import {
  createMouseEvent,
  dispatchEvent,
  dispatchMouseEvent,
  dispatchTouchEvent,
  createTouchEvent,
} from '@angular/cdk/testing';
import {Directionality} from '@angular/cdk/bidi';
import {of as observableOf} from 'rxjs';
import {CdkDrag, CDK_DRAG_CONFIG} from './drag';
import {CdkDragDrop} from '../drag-events';
import {moveItemInArray} from '../drag-utils';
import {CdkDropList} from './drop-list';
import {CdkDragHandle} from './drag-handle';
import {CdkDropListGroup} from './drop-list-group';
import {extendStyles} from '../drag-styling';
import {DragRefConfig, Point} from '../drag-ref';

const ITEM_HEIGHT = 25;
const ITEM_WIDTH = 75;

describe('CdkDrag', () => {
  function createComponent<T>(componentType: Type<T>, providers: Provider[] = [], dragDistance = 0):
    ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [DragDropModule],
      declarations: [componentType, PassthroughComponent],
      providers: [
        {
          provide: CDK_DRAG_CONFIG,
          useValue: {
            // We default the `dragDistance` to zero, because the majority of the tests
            // don't care about it and drags are a lot easier to simulate when we don't
            // have to deal with thresholds.
            dragStartThreshold: dragDistance,
            pointerDirectionChangeThreshold: 5
          } as DragRefConfig
        },
        ...providers
      ],
    }).compileComponents();

    return TestBed.createComponent<T>(componentType);
  }

  describe('standalone draggable', () => {
    describe('mouse dragging', () => {
      it('should drag an element freely to a particular position', fakeAsync(() => {
        const fixture = createComponent(StandaloneDraggable);
        fixture.detectChanges();
        const dragElement = fixture.componentInstance.dragElement.nativeElement;

        expect(dragElement.style.transform).toBeFalsy();
        dragElementViaMouse(fixture, dragElement, 50, 100);
        expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');
      }));

      it('should drag an SVG element freely to a particular position', fakeAsync(() => {
        const fixture = createComponent(StandaloneDraggableSvg);
        fixture.detectChanges();
        const dragElement = fixture.componentInstance.dragElement.nativeElement;

        expect(dragElement.getAttribute('transform')).toBeFalsy();
        dragElementViaMouse(fixture, dragElement, 50, 100);
        expect(dragElement.getAttribute('transform')).toBe('translate(50 100)');
      }));

      it('should drag an element freely to a particular position when the page is scrolled',
        fakeAsync(() => {
          const fixture = createComponent(StandaloneDraggable);
          fixture.detectChanges();

          const cleanup = makePageScrollable();
          const dragElement = fixture.componentInstance.dragElement.nativeElement;

          scrollTo(0, 500);
          expect(dragElement.style.transform).toBeFalsy();
          dragElementViaMouse(fixture, dragElement, 50, 100);
          expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');
          cleanup();
        }));

      it('should continue dragging the element from where it was left off', fakeAsync(() => {
        const fixture = createComponent(StandaloneDraggable);
        fixture.detectChanges();
        const dragElement = fixture.componentInstance.dragElement.nativeElement;

        expect(dragElement.style.transform).toBeFalsy();

        dragElementViaMouse(fixture, dragElement, 50, 100);
        expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');

        dragElementViaMouse(fixture, dragElement, 100, 200);
        expect(dragElement.style.transform).toBe('translate3d(150px, 300px, 0px)');
      }));

      it('should continue dragging from where it was left off when the page is scrolled',
        fakeAsync(() => {
          const fixture = createComponent(StandaloneDraggable);
          fixture.detectChanges();

          const dragElement = fixture.componentInstance.dragElement.nativeElement;
          const cleanup = makePageScrollable();

          scrollTo(0, 500);
          expect(dragElement.style.transform).toBeFalsy();

          dragElementViaMouse(fixture, dragElement, 50, 100);
          expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');

          dragElementViaMouse(fixture, dragElement, 100, 200);
          expect(dragElement.style.transform).toBe('translate3d(150px, 300px, 0px)');

          cleanup();
        }));

      it('should not drag an element with the right mouse button', fakeAsync(() => {
        const fixture = createComponent(StandaloneDraggable);
        fixture.detectChanges();
        const dragElement = fixture.componentInstance.dragElement.nativeElement;
        const event = createMouseEvent('mousedown', 50, 100, 2);

        expect(dragElement.style.transform).toBeFalsy();

        dispatchEvent(dragElement, event);
        fixture.detectChanges();

        dispatchMouseEvent(document, 'mousemove', 50, 100);
        fixture.detectChanges();

        dispatchMouseEvent(document, 'mouseup');
        fixture.detectChanges();

        expect(dragElement.style.transform).toBeFalsy();
      }));

      it('should not drag the element if it was not moved more than the minimum distance',
        fakeAsync(() => {
          const fixture = createComponent(StandaloneDraggable, [], 5);
          fixture.detectChanges();
          const dragElement = fixture.componentInstance.dragElement.nativeElement;

          expect(dragElement.style.transform).toBeFalsy();
          dragElementViaMouse(fixture, dragElement, 2, 2);
          expect(dragElement.style.transform).toBeFalsy();
        }));

      it('should be able to stop dragging after a double click', fakeAsync(() => {
        const fixture = createComponent(StandaloneDraggable, [], 5);
        fixture.detectChanges();
        const dragElement = fixture.componentInstance.dragElement.nativeElement;

        expect(dragElement.style.transform).toBeFalsy();

        dispatchMouseEvent(dragElement, 'mousedown');
        fixture.detectChanges();
        dispatchMouseEvent(document, 'mouseup');
        fixture.detectChanges();
        dispatchMouseEvent(dragElement, 'mousedown');
        fixture.detectChanges();
        dispatchMouseEvent(document, 'mouseup');
        fixture.detectChanges();

        dragElementViaMouse(fixture, dragElement, 50, 50);
        dispatchMouseEvent(document, 'mousemove', 100, 100);
        fixture.detectChanges();

        expect(dragElement.style.transform).toBeFalsy();
      }));

      it('should preserve the previous `transform` value', fakeAsync(() => {
        const fixture = createComponent(StandaloneDraggable);
        fixture.detectChanges();
        const dragElement = fixture.componentInstance.dragElement.nativeElement;

        dragElement.style.transform = 'translateX(-50%)';
        dragElementViaMouse(fixture, dragElement, 50, 100);
        expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px) translateX(-50%)');
      }));

      it('should not generate multiple own `translate3d` values', fakeAsync(() => {
        const fixture = createComponent(StandaloneDraggable);
        fixture.detectChanges();
        const dragElement = fixture.componentInstance.dragElement.nativeElement;

        dragElement.style.transform = 'translateY(-50%)';

        dragElementViaMouse(fixture, dragElement, 50, 100);
        expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px) translateY(-50%)');

        dragElementViaMouse(fixture, dragElement, 100, 200);
        expect(dragElement.style.transform).toBe('translate3d(150px, 300px, 0px) translateY(-50%)');
      }));

      it('should prevent the `mousedown` action for native draggable elements', fakeAsync(() => {
        const fixture = createComponent(StandaloneDraggable);
        fixture.detectChanges();
        const dragElement = fixture.componentInstance.dragElement.nativeElement;

        dragElement.draggable = true;

        const mousedownEvent = createMouseEvent('mousedown', 50, 50);
        Object.defineProperty(mousedownEvent, 'target', {get: () => dragElement});
        spyOn(mousedownEvent, 'preventDefault').and.callThrough();
        dispatchEvent(dragElement, mousedownEvent);
        fixture.detectChanges();

        dispatchMouseEvent(document, 'mousemove', 50, 50);
        fixture.detectChanges();

        expect(mousedownEvent.preventDefault).toHaveBeenCalled();
      }));

    });

    describe('touch dragging', () => {
      it('should drag an element freely to a particular position', fakeAsync(() => {
        const fixture = createComponent(StandaloneDraggable);
        fixture.detectChanges();
        const dragElement = fixture.componentInstance.dragElement.nativeElement;

        expect(dragElement.style.transform).toBeFalsy();
        dragElementViaTouch(fixture, dragElement, 50, 100);
        expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');
      }));

      it('should drag an element freely to a particular position when the page is scrolled',
        fakeAsync(() => {
          const fixture = createComponent(StandaloneDraggable);
          fixture.detectChanges();

          const dragElement = fixture.componentInstance.dragElement.nativeElement;
          const cleanup = makePageScrollable();

          scrollTo(0, 500);
          expect(dragElement.style.transform).toBeFalsy();
          dragElementViaTouch(fixture, dragElement, 50, 100);
          expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');
          cleanup();
        }));

      it('should continue dragging the element from where it was left off', fakeAsync(() => {
        const fixture = createComponent(StandaloneDraggable);
        fixture.detectChanges();
        const dragElement = fixture.componentInstance.dragElement.nativeElement;

        expect(dragElement.style.transform).toBeFalsy();

        dragElementViaTouch(fixture, dragElement, 50, 100);
        expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');

        dragElementViaTouch(fixture, dragElement, 100, 200);
        expect(dragElement.style.transform).toBe('translate3d(150px, 300px, 0px)');
      }));

      it('should continue dragging from where it was left off when the page is scrolled',
        fakeAsync(() => {
          const fixture = createComponent(StandaloneDraggable);
          fixture.detectChanges();

          const dragElement = fixture.componentInstance.dragElement.nativeElement;
          const cleanup = makePageScrollable();

          scrollTo(0, 500);
          expect(dragElement.style.transform).toBeFalsy();

          dragElementViaTouch(fixture, dragElement, 50, 100);
          expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');

          dragElementViaTouch(fixture, dragElement, 100, 200);
          expect(dragElement.style.transform).toBe('translate3d(150px, 300px, 0px)');

          cleanup();
        }));

      it('should prevent the default `touchmove` action on the page while dragging',
        fakeAsync(() => {
          const fixture = createComponent(StandaloneDraggable);
          fixture.detectChanges();

          dispatchTouchEvent(fixture.componentInstance.dragElement.nativeElement, 'touchstart');
          fixture.detectChanges();

          expect(dispatchTouchEvent(document, 'touchmove').defaultPrevented).toBe(true);

          dispatchTouchEvent(document, 'touchend');
          fixture.detectChanges();
        }));

      it('should not prevent `touchstart` action for native draggable elements', fakeAsync(() => {
        const fixture = createComponent(StandaloneDraggable);
        fixture.detectChanges();
        const dragElement = fixture.componentInstance.dragElement.nativeElement;

        dragElement.draggable = true;

        const touchstartEvent = createTouchEvent('touchstart', 50, 50);
        Object.defineProperty(touchstartEvent, 'target', {get: () => dragElement});
        spyOn(touchstartEvent, 'preventDefault').and.callThrough();
        dispatchEvent(dragElement, touchstartEvent);
        fixture.detectChanges();

        dispatchTouchEvent(document, 'touchmove');
        fixture.detectChanges();

        expect(touchstartEvent.preventDefault).not.toHaveBeenCalled();
      }));
    });

    it('should dispatch an event when the user has started dragging', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();

      startDraggingViaMouse(fixture, fixture.componentInstance.dragElement.nativeElement);

      expect(fixture.componentInstance.startedSpy).toHaveBeenCalled();

      const event = fixture.componentInstance.startedSpy.calls.mostRecent().args[0];

      // Assert the event like this, rather than `toHaveBeenCalledWith`, because Jasmine will
      // go into an infinite loop trying to stringify the event, if the test fails.
      expect(event).toEqual({source: fixture.componentInstance.dragInstance});
    }));

    it('should dispatch an event when the user has stopped dragging', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();

      dragElementViaMouse(fixture, fixture.componentInstance.dragElement.nativeElement, 5, 10);

      expect(fixture.componentInstance.endedSpy).toHaveBeenCalled();

      const event = fixture.componentInstance.endedSpy.calls.mostRecent().args[0];

      // Assert the event like this, rather than `toHaveBeenCalledWith`, because Jasmine will
      // go into an infinite loop trying to stringify the event, if the test fails.
      expect(event).toEqual({source: fixture.componentInstance.dragInstance});
    }));

    it('should emit when the user is moving the drag element', () => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();

      const spy = jasmine.createSpy('move spy');
      const subscription = fixture.componentInstance.dragInstance.moved.subscribe(spy);

      dragElementViaMouse(fixture, fixture.componentInstance.dragElement.nativeElement, 5, 10);
      expect(spy).toHaveBeenCalledTimes(1);

      dragElementViaMouse(fixture, fixture.componentInstance.dragElement.nativeElement, 10, 20);
      expect(spy).toHaveBeenCalledTimes(2);

      subscription.unsubscribe();
    });

    it('should not emit events if it was not moved more than the minimum distance', () => {
      const fixture = createComponent(StandaloneDraggable, [], 5);
      fixture.detectChanges();

      const moveSpy = jasmine.createSpy('move spy');
      const subscription = fixture.componentInstance.dragInstance.moved.subscribe(moveSpy);

      dragElementViaMouse(fixture, fixture.componentInstance.dragElement.nativeElement, 2, 2);

      expect(fixture.componentInstance.startedSpy).not.toHaveBeenCalled();
      expect(fixture.componentInstance.releasedSpy).not.toHaveBeenCalled();
      expect(fixture.componentInstance.endedSpy).not.toHaveBeenCalled();
      expect(moveSpy).not.toHaveBeenCalled();
      subscription.unsubscribe();
    });

    it('should emit to `moved` inside the NgZone', () => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();

      const spy = jasmine.createSpy('move spy');
      const subscription = fixture.componentInstance.dragInstance.moved
          .subscribe(() => spy(NgZone.isInAngularZone()));

      dragElementViaMouse(fixture, fixture.componentInstance.dragElement.nativeElement, 10, 20);
      expect(spy).toHaveBeenCalledWith(true);

      subscription.unsubscribe();
    });

    it('should complete the `moved` stream on destroy', () => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();

      const spy = jasmine.createSpy('move spy');
      const subscription = fixture.componentInstance.dragInstance.moved
          .subscribe(undefined, undefined, spy);

      fixture.destroy();
      expect(spy).toHaveBeenCalled();
      subscription.unsubscribe();
    });

    it('should be able to lock dragging along the x axis', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();
      fixture.componentInstance.dragInstance.lockAxis = 'x';

      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      expect(dragElement.style.transform).toBeFalsy();

      dragElementViaMouse(fixture, dragElement, 50, 100);
      expect(dragElement.style.transform).toBe('translate3d(50px, 0px, 0px)');

      dragElementViaMouse(fixture, dragElement, 100, 200);
      expect(dragElement.style.transform).toBe('translate3d(150px, 0px, 0px)');
    }));

    it('should be able to lock dragging along the y axis', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();
      fixture.componentInstance.dragInstance.lockAxis = 'y';

      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      expect(dragElement.style.transform).toBeFalsy();

      dragElementViaMouse(fixture, dragElement, 50, 100);
      expect(dragElement.style.transform).toBe('translate3d(0px, 100px, 0px)');

      dragElementViaMouse(fixture, dragElement, 100, 200);
      expect(dragElement.style.transform).toBe('translate3d(0px, 300px, 0px)');
    }));

    it('should add a class while an element is being dragged', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();

      const element = fixture.componentInstance.dragElement.nativeElement;

      expect(element.classList).not.toContain('cdk-drag-dragging');

      startDraggingViaMouse(fixture, element);

      expect(element.classList).toContain('cdk-drag-dragging');

      dispatchMouseEvent(document, 'mouseup');
      fixture.detectChanges();

      expect(element.classList).not.toContain('cdk-drag-dragging');
    }));

    it('should add a class while an element is being dragged with OnPush change detection',
      fakeAsync(() => {
        const fixture = createComponent(StandaloneDraggableWithOnPush);
        fixture.detectChanges();

        const element = fixture.componentInstance.dragElement.nativeElement;

        expect(element.classList).not.toContain('cdk-drag-dragging');

        startDraggingViaMouse(fixture, element);

        expect(element.classList).toContain('cdk-drag-dragging');

        dispatchMouseEvent(document, 'mouseup');
        fixture.detectChanges();

        expect(element.classList).not.toContain('cdk-drag-dragging');
      }));

    it('should not add a class if item was not dragged more than the threshold', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable, [], 5);
      fixture.detectChanges();

      const element = fixture.componentInstance.dragElement.nativeElement;

      expect(element.classList).not.toContain('cdk-drag-dragging');

      startDraggingViaMouse(fixture, element);

      expect(element.classList).not.toContain('cdk-drag-dragging');
    }));

    it('should be able to set an alternate drag root element', fakeAsync(() => {
      const fixture = createComponent(DraggableWithAlternateRoot);
      fixture.componentInstance.rootElementSelector = '.alternate-root';
      fixture.detectChanges();

      const dragRoot = fixture.componentInstance.dragRoot.nativeElement;
      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      expect(dragRoot.style.transform).toBeFalsy();
      expect(dragElement.style.transform).toBeFalsy();

      dragElementViaMouse(fixture, dragRoot, 50, 100);

      expect(dragRoot.style.transform).toBe('translate3d(50px, 100px, 0px)');
      expect(dragElement.style.transform).toBeFalsy();
    }));

    it('should preserve the initial transform if the root element changes', fakeAsync(() => {
      const fixture = createComponent(DraggableWithAlternateRoot);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      const alternateRoot = fixture.componentInstance.dragRoot.nativeElement;

      dragElement.style.transform = 'translateX(-50%)';
      dragElementViaMouse(fixture, dragElement, 50, 100);
      expect(dragElement.style.transform).toContain('translateX(-50%)');

      alternateRoot.style.transform = 'scale(2)';
      fixture.componentInstance.rootElementSelector = '.alternate-root';
      fixture.detectChanges();

      dragElementViaMouse(fixture, alternateRoot, 50, 100);

      expect(alternateRoot.style.transform).not.toContain('translateX(-50%)');
      expect(alternateRoot.style.transform).toContain('scale(2)');
    }));

    it('should handle the root element selector changing after init', fakeAsync(() => {
      const fixture = createComponent(DraggableWithAlternateRoot);
      fixture.detectChanges();
      tick();

      fixture.componentInstance.rootElementSelector = '.alternate-root';
      fixture.detectChanges();

      const dragRoot = fixture.componentInstance.dragRoot.nativeElement;
      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      expect(dragRoot.style.transform).toBeFalsy();
      expect(dragElement.style.transform).toBeFalsy();

      dragElementViaMouse(fixture, dragRoot, 50, 100);

      expect(dragRoot.style.transform).toBe('translate3d(50px, 100px, 0px)');
      expect(dragElement.style.transform).toBeFalsy();
    }));

    it('should not be able to drag the element if dragging is disabled', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      expect(dragElement.classList).not.toContain('cdk-drag-disabled');

      fixture.componentInstance.dragInstance.disabled = true;
      fixture.detectChanges();

      expect(dragElement.classList).toContain('cdk-drag-disabled');
      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaMouse(fixture, dragElement, 50, 100);
      expect(dragElement.style.transform).toBeFalsy();
    }));

    it('should enable native drag interactions if dragging is disabled', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      const styles = dragElement.style;

      expect(styles.touchAction || (styles as any).webkitUserDrag).toBe('none');

      fixture.componentInstance.dragInstance.disabled = true;
      fixture.detectChanges();

      expect(styles.touchAction || (styles as any).webkitUserDrag).toBeFalsy();
    }));

    it('should stop propagation for the drag sequence start event', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      const event = createMouseEvent('mousedown');
      spyOn(event, 'stopPropagation').and.callThrough();

      dispatchEvent(dragElement, event);
      fixture.detectChanges();

      expect(event.stopPropagation).toHaveBeenCalled();
    }));

    it('should not throw if destroyed before the first change detection run', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);

      expect(() => {
        fixture.destroy();
      }).not.toThrow();
    }));

    it('should enable native drag interactions when there is a drag handle', () => {
      const fixture = createComponent(StandaloneDraggableWithHandle);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      expect(dragElement.style.touchAction).not.toBe('none');
    });

    it('should be able to reset a freely-dragged item to its initial position', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaMouse(fixture, dragElement, 50, 100);
      expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');

      fixture.componentInstance.dragInstance.reset();
      expect(dragElement.style.transform).toBeFalsy();
    }));

    it('should preserve initial transform after resetting', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      dragElement.style.transform = 'scale(2)';

      dragElementViaMouse(fixture, dragElement, 50, 100);
      expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px) scale(2)');

      fixture.componentInstance.dragInstance.reset();
      expect(dragElement.style.transform).toBe('scale(2)');
    }));

    it('should start dragging an item from its initial position after a reset', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaMouse(fixture, dragElement, 50, 100);
      expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');
      fixture.componentInstance.dragInstance.reset();

      dragElementViaMouse(fixture, dragElement, 25, 50);
      expect(dragElement.style.transform).toBe('translate3d(25px, 50px, 0px)');
    }));

    it('should not dispatch multiple events for a mouse event right after a touch event',
      fakeAsync(() => {
        const fixture = createComponent(StandaloneDraggable);
        fixture.detectChanges();

        const dragElement = fixture.componentInstance.dragElement.nativeElement;

        // Dispatch a touch sequence.
        dispatchTouchEvent(dragElement, 'touchstart');
        fixture.detectChanges();
        dispatchTouchEvent(dragElement, 'touchend');
        fixture.detectChanges();
        tick();

        // Immediately dispatch a mouse sequence to simulate a fake event.
        startDraggingViaMouse(fixture, dragElement);
        fixture.detectChanges();
        dispatchMouseEvent(dragElement, 'mouseup');
        fixture.detectChanges();
        tick();

        expect(fixture.componentInstance.startedSpy).toHaveBeenCalledTimes(1);
        expect(fixture.componentInstance.endedSpy).toHaveBeenCalledTimes(1);
      }));

    it('should round the transform value', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaMouse(fixture, dragElement, 13.37, 37);
      expect(dragElement.style.transform).toBe('translate3d(13px, 37px, 0px)');
    }));

    it('should allow for dragging to be constrained to an element', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.componentInstance.boundarySelector = '.wrapper';
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaMouse(fixture, dragElement, 300, 300);
      expect(dragElement.style.transform).toBe('translate3d(100px, 100px, 0px)');
    }));

    it('should allow for the position constrain logic to be customized', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      const spy = jasmine.createSpy('constrain position spy').and.returnValue({
        x: 50,
        y: 50
      } as Point);

      fixture.componentInstance.constrainPosition = spy;
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaMouse(fixture, dragElement, 300, 300);

      expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({x: 300, y: 300}));
      expect(dragElement.style.transform).toBe('translate3d(50px, 50px, 0px)');
    }));

    it('should throw if attached to an ng-container', fakeAsync(() => {
      expect(() => {
        createComponent(DraggableOnNgContainer).detectChanges();
        flush();
      }).toThrowError(/^cdkDrag must be attached to an element node/);
    }));

    it('should allow for the dragging sequence to be delayed', fakeAsync(() => {
      // We can't use Jasmine's `clock` because Zone.js interferes with it.
      spyOn(Date, 'now').and.callFake(() => currentTime);
      let currentTime = 0;

      const fixture = createComponent(StandaloneDraggable);
      fixture.componentInstance.dragStartDelay = 1000;
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      expect(dragElement.style.transform).toBeFalsy('Expected element not to be moved by default.');

      startDraggingViaMouse(fixture, dragElement);
      currentTime += 750;
      dispatchMouseEvent(document, 'mousemove', 50, 100);
      fixture.detectChanges();

      expect(dragElement.style.transform)
          .toBeFalsy('Expected element not to be moved if the drag timeout has not passed.');

      // The first `mousemove` here starts the sequence and the second one moves the element.
      currentTime += 500;
      dispatchMouseEvent(document, 'mousemove', 50, 100);
      dispatchMouseEvent(document, 'mousemove', 50, 100);
      fixture.detectChanges();

      expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)',
          'Expected element to be dragged after all the time has passed.');
    }));

  });

  describe('draggable with a handle', () => {
    it('should not be able to drag the entire element if it has a handle', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggableWithHandle);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;

      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaMouse(fixture, dragElement, 50, 100);
      expect(dragElement.style.transform).toBeFalsy();
    }));

    it('should be able to drag an element using its handle', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggableWithHandle);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      const handle = fixture.componentInstance.handleElement.nativeElement;

      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaMouse(fixture, handle, 50, 100);
      expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');
    }));

    it('should not be able to drag the element if the handle is disabled', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggableWithHandle);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      const handle = fixture.componentInstance.handleElement.nativeElement;

      fixture.componentInstance.handleInstance.disabled = true;

      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaMouse(fixture, handle, 50, 100);
      expect(dragElement.style.transform).toBeFalsy();
    }));

    it('should not be able to drag using the handle if the element is disabled', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggableWithHandle);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      const handle = fixture.componentInstance.handleElement.nativeElement;

      fixture.componentInstance.dragInstance.disabled = true;

      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaMouse(fixture, handle, 50, 100);
      expect(dragElement.style.transform).toBeFalsy();
    }));

    it('should be able to use a handle that was added after init', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggableWithDelayedHandle);

      fixture.detectChanges();
      fixture.componentInstance.showHandle = true;
      fixture.detectChanges();

      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      const handle = fixture.componentInstance.handleElement.nativeElement;

      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaMouse(fixture, handle, 50, 100);
      expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');
    }));

    it('should be able to use more than one handle to drag the element', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggableWithMultipleHandles);
      fixture.detectChanges();

      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      const handles = fixture.componentInstance.handles.map(handle => handle.element.nativeElement);

      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaMouse(fixture, handles[1], 50, 100);
      expect(dragElement.style.transform).toBe('translate3d(50px, 100px, 0px)');

      dragElementViaMouse(fixture, handles[0], 100, 200);
      expect(dragElement.style.transform).toBe('translate3d(150px, 300px, 0px)');
    }));

    it('should be able to drag with a handle that is not a direct descendant', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggableWithIndirectHandle);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      const handle = fixture.componentInstance.handleElement.nativeElement;

      expect(dragElement.style.transform).toBeFalsy();
      dragElementViaMouse(fixture, dragElement, 50, 100);

      expect(dragElement.style.transform)
          .toBeFalsy('Expected not to be able to drag the element by itself.');

      dragElementViaMouse(fixture, handle, 50, 100);
      expect(dragElement.style.transform)
          .toBe('translate3d(50px, 100px, 0px)', 'Expected to drag the element by its handle.');
    }));

    it('should disable the tap highlight while dragging via the handle', fakeAsync(() => {
      // This test is irrelevant if the browser doesn't support styling the tap highlight color.
      if (!('webkitTapHighlightColor' in document.body.style)) {
        return;
      }

      const fixture = createComponent(StandaloneDraggableWithHandle);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      const handle = fixture.componentInstance.handleElement.nativeElement;

      expect(dragElement.style.webkitTapHighlightColor).toBeFalsy();

      startDraggingViaMouse(fixture, handle);

      expect(dragElement.style.webkitTapHighlightColor).toBe('transparent');

      dispatchMouseEvent(document, 'mousemove', 50, 100);
      fixture.detectChanges();

      dispatchMouseEvent(document, 'mouseup', 50, 100);
      fixture.detectChanges();

      expect(dragElement.style.webkitTapHighlightColor).toBeFalsy();
    }));

    it('should preserve any existing `webkitTapHighlightColor`', fakeAsync(() => {
      // This test is irrelevant if the browser doesn't support styling the tap highlight color.
      if (!('webkitTapHighlightColor' in document.body.style)) {
        return;
      }

      const fixture = createComponent(StandaloneDraggableWithHandle);
      fixture.detectChanges();
      const dragElement = fixture.componentInstance.dragElement.nativeElement;
      const handle = fixture.componentInstance.handleElement.nativeElement;

      dragElement.style.webkitTapHighlightColor = 'purple';

      startDraggingViaMouse(fixture, handle);

      expect(dragElement.style.webkitTapHighlightColor).toBe('transparent');

      dispatchMouseEvent(document, 'mousemove', 50, 100);
      fixture.detectChanges();

      dispatchMouseEvent(document, 'mouseup', 50, 100);
      fixture.detectChanges();

      expect(dragElement.style.webkitTapHighlightColor).toBe('purple');
    }));

  });

  describe('in a drop container', () => {
    it('should be able to attach data to the drop container', () => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();

      expect(fixture.componentInstance.dropInstance.data).toBe(fixture.componentInstance.items);
    });

    it('should sync the drop list inputs with the drop list ref', () => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();

      const dropInstance = fixture.componentInstance.dropInstance;
      const dropListRef = dropInstance._dropListRef;

      expect(dropListRef.lockAxis).toBeFalsy();
      expect(dropListRef.disabled).toBe(false);

      dropInstance.lockAxis = 'x';
      dropInstance.disabled = true;

      dropListRef.beforeStarted.next();

      expect(dropListRef.lockAxis).toBe('x');
      expect(dropListRef.disabled).toBe(true);
    });

    it('should be able to attach data to a drag item', () => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();

      expect(fixture.componentInstance.dragItems.first.data)
          .toBe(fixture.componentInstance.items[0]);
    });

    it('should be able to overwrite the drop zone id', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);

      fixture.componentInstance.dropZoneId = 'custom-id';
      fixture.detectChanges();

      const drop = fixture.componentInstance.dropInstance;

      expect(drop.id).toBe('custom-id');
      expect(drop.element.nativeElement.getAttribute('id')).toBe('custom-id');
    }));

    it('should toggle a class when the user starts dragging an item', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();
      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;
      const dropZone = fixture.componentInstance.dropInstance;

      expect(dropZone.element.nativeElement.classList).not.toContain('cdk-drop-list-dragging');

      startDraggingViaMouse(fixture, item);

      expect(dropZone.element.nativeElement.classList).toContain('cdk-drop-list-dragging');

      dispatchMouseEvent(document, 'mouseup');
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      expect(dropZone.element.nativeElement.classList).not.toContain('cdk-drop-dragging');
    }));

    it('should toggle the drop dragging classes if there is nothing to trigger change detection',
      fakeAsync(() => {
        const fixture = createComponent(DraggableInDropZoneWithoutEvents);
        fixture.detectChanges();
        const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;
        const dropZone = fixture.componentInstance.dropInstance;

        expect(dropZone.element.nativeElement.classList).not.toContain('cdk-drop-list-dragging');
        expect(item.classList).not.toContain('cdk-drag-dragging');

        startDraggingViaMouse(fixture, item);

        expect(dropZone.element.nativeElement.classList).toContain('cdk-drop-list-dragging');
        expect(item.classList).toContain('cdk-drag-dragging');

        dispatchMouseEvent(document, 'mouseup');
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(dropZone.element.nativeElement.classList).not.toContain('cdk-drop-dragging');
        expect(item.classList).not.toContain('cdk-drag-dragging');
      }));

    it('should toggle a class when the user starts dragging an item with OnPush change detection',
      fakeAsync(() => {
        const fixture = createComponent(DraggableInOnPushDropZone);
        fixture.detectChanges();
        const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;
        const dropZone = fixture.componentInstance.dropInstance;

        expect(dropZone.element.nativeElement.classList).not.toContain('cdk-drop-list-dragging');

        startDraggingViaMouse(fixture, item);

        expect(dropZone.element.nativeElement.classList).toContain('cdk-drop-list-dragging');

        dispatchMouseEvent(document, 'mouseup');
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(dropZone.element.nativeElement.classList).not.toContain('cdk-drop-dragging');
      }));

    it('should not toggle dragging class if the element was not dragged more than the threshold',
      fakeAsync(() => {
        const fixture = createComponent(DraggableInDropZone, [], 5);
        fixture.detectChanges();
        const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;
        const dropZone = fixture.componentInstance.dropInstance;

        expect(dropZone.element.nativeElement.classList).not.toContain('cdk-drop-dragging');

        startDraggingViaMouse(fixture, item);

        expect(dropZone.element.nativeElement.classList).not.toContain('cdk-drop-dragging');
      }));

    it('should dispatch the `dropped` event when an item has been dropped', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();
      const dragItems = fixture.componentInstance.dragItems;

      expect(dragItems.map(drag => drag.element.nativeElement.textContent!.trim()))
          .toEqual(['Zero', 'One', 'Two', 'Three']);

      const firstItem = dragItems.first;
      const thirdItemRect = dragItems.toArray()[2].element.nativeElement.getBoundingClientRect();

      dragElementViaMouse(fixture, firstItem.element.nativeElement,
          thirdItemRect.left + 1, thirdItemRect.top + 1);
      flush();
      fixture.detectChanges();

      expect(fixture.componentInstance.droppedSpy).toHaveBeenCalledTimes(1);

      const event = fixture.componentInstance.droppedSpy.calls.mostRecent().args[0];

      // Assert the event like this, rather than `toHaveBeenCalledWith`, because Jasmine will
      // go into an infinite loop trying to stringify the event, if the test fails.
      expect(event).toEqual({
        previousIndex: 0,
        currentIndex: 2,
        item: firstItem,
        container: fixture.componentInstance.dropInstance,
        previousContainer: fixture.componentInstance.dropInstance,
        isPointerOverContainer: true
      });

      expect(dragItems.map(drag => drag.element.nativeElement.textContent!.trim()))
          .toEqual(['One', 'Two', 'Zero', 'Three']);
    }));

    it('should expose whether an item was dropped over a container', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();
      const dragItems = fixture.componentInstance.dragItems;
      const firstItem = dragItems.first;
      const thirdItemRect = dragItems.toArray()[2].element.nativeElement.getBoundingClientRect();

      dragElementViaMouse(fixture, firstItem.element.nativeElement,
          thirdItemRect.left + 1, thirdItemRect.top + 1);
      flush();
      fixture.detectChanges();

      expect(fixture.componentInstance.droppedSpy).toHaveBeenCalledTimes(1);

      const event: CdkDragDrop<any> =
          fixture.componentInstance.droppedSpy.calls.mostRecent().args[0];

      expect(event.isPointerOverContainer).toBe(true);
    }));

    it('should expose whether an item was dropped outside of a container', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();
      const dragItems = fixture.componentInstance.dragItems;
      const firstItem = dragItems.first;
      const containerRect = fixture.componentInstance.dropInstance.element
          .nativeElement.getBoundingClientRect();

      dragElementViaMouse(fixture, firstItem.element.nativeElement,
          containerRect.right + 10, containerRect.bottom + 10);
      flush();
      fixture.detectChanges();

      expect(fixture.componentInstance.droppedSpy).toHaveBeenCalledTimes(1);

      const event: CdkDragDrop<any> =
          fixture.componentInstance.droppedSpy.calls.mostRecent().args[0];

      expect(event.isPointerOverContainer).toBe(false);
    }));

    it('should dispatch the `sorted` event as an item is being sorted', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();

      const items = fixture.componentInstance.dragItems.map(item => item.element.nativeElement);
      const draggedItem = items[0];
      const {top, left} = draggedItem.getBoundingClientRect();

      startDraggingViaMouse(fixture, draggedItem, left, top);

      // Drag over each item one-by-one going downwards.
      for (let i = 1; i < items.length; i++) {
        const elementRect = items[i].getBoundingClientRect();

        dispatchMouseEvent(document, 'mousemove', elementRect.left, elementRect.top + 5);
        fixture.detectChanges();

        expect(fixture.componentInstance.sortedSpy.calls.mostRecent().args[0]).toEqual({
          previousIndex: i - 1,
          currentIndex: i,
          item: fixture.componentInstance.dragItems.first,
          container: fixture.componentInstance.dropInstance
        });
      }

      dispatchMouseEvent(document, 'mouseup');
      fixture.detectChanges();
      flush();
    }));

    it('should not move items in a vertical list if the pointer is too far away', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();
      const dragItems = fixture.componentInstance.dragItems;

      expect(dragItems.map(drag => drag.element.nativeElement.textContent!.trim()))
          .toEqual(['Zero', 'One', 'Two', 'Three']);

      const firstItem = dragItems.first;
      const thirdItemRect = dragItems.toArray()[2].element.nativeElement.getBoundingClientRect();

      // Move the cursor all the way to the right so it doesn't intersect along the x axis.
      dragElementViaMouse(fixture, firstItem.element.nativeElement,
          thirdItemRect.right + 1000, thirdItemRect.top + 1);
      flush();
      fixture.detectChanges();

      expect(fixture.componentInstance.droppedSpy).toHaveBeenCalledTimes(1);

      const event = fixture.componentInstance.droppedSpy.calls.mostRecent().args[0];

      // Assert the event like this, rather than `toHaveBeenCalledWith`, because Jasmine will
      // go into an infinite loop trying to stringify the event, if the test fails.
      expect(event).toEqual({
        previousIndex: 0,
        currentIndex: 0,
        item: firstItem,
        container: fixture.componentInstance.dropInstance,
        previousContainer: fixture.componentInstance.dropInstance,
        isPointerOverContainer: false
      });

      expect(dragItems.map(drag => drag.element.nativeElement.textContent!.trim()))
          .toEqual(['Zero', 'One', 'Two', 'Three']);
    }));

    it('should not move the original element from its initial DOM position', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();
      const root = fixture.nativeElement as HTMLElement;
      let dragElements = Array.from(root.querySelectorAll('.cdk-drag'));

      expect(dragElements.map(el => el.textContent)).toEqual(['Zero', 'One', 'Two', 'Three']);

      // Stub out the original call so the list doesn't get re-rendered.
      // We're testing the DOM order explicitly.
      fixture.componentInstance.droppedSpy.and.callFake(() => {});

      const thirdItemRect = dragElements[2].getBoundingClientRect();

      dragElementViaMouse(fixture, fixture.componentInstance.dragItems.first.element.nativeElement,
          thirdItemRect.left + 1, thirdItemRect.top + 1);
      flush();
      fixture.detectChanges();

      dragElements = Array.from(root.querySelectorAll('.cdk-drag'));
      expect(dragElements.map(el => el.textContent)).toEqual(['Zero', 'One', 'Two', 'Three']);
    }));

    it('should dispatch the `dropped` event in a horizontal drop zone', fakeAsync(() => {
      const fixture = createComponent(DraggableInHorizontalDropZone);
      fixture.detectChanges();
      const dragItems = fixture.componentInstance.dragItems;

      expect(dragItems.map(drag => drag.element.nativeElement.textContent!.trim()))
          .toEqual(['Zero', 'One', 'Two', 'Three']);

      const firstItem = dragItems.first;
      const thirdItemRect = dragItems.toArray()[2].element.nativeElement.getBoundingClientRect();

      dragElementViaMouse(fixture, firstItem.element.nativeElement,
          thirdItemRect.left + 1, thirdItemRect.top + 1);
      flush();
      fixture.detectChanges();

      expect(fixture.componentInstance.droppedSpy).toHaveBeenCalledTimes(1);

      const event = fixture.componentInstance.droppedSpy.calls.mostRecent().args[0];

      // Assert the event like this, rather than `toHaveBeenCalledWith`, because Jasmine will
      // go into an infinite loop trying to stringify the event, if the test fails.
      expect(event).toEqual({
        previousIndex: 0,
        currentIndex: 2,
        item: firstItem,
        container: fixture.componentInstance.dropInstance,
        previousContainer: fixture.componentInstance.dropInstance,
        isPointerOverContainer: true
      });

      expect(dragItems.map(drag => drag.element.nativeElement.textContent!.trim()))
          .toEqual(['One', 'Two', 'Zero', 'Three']);
    }));

    it('should dispatch the correct `dropped` event in RTL horizontal drop zone', fakeAsync(() => {
      const fixture = createComponent(DraggableInHorizontalDropZone, [{
        provide: Directionality,
        useValue: ({value: 'rtl', change: observableOf()})
      }]);

      fixture.nativeElement.setAttribute('dir', 'rtl');
      fixture.detectChanges();
      const dragItems = fixture.componentInstance.dragItems;

      expect(dragItems.map(drag => drag.element.nativeElement.textContent!.trim()))
          .toEqual(['Zero', 'One', 'Two', 'Three']);

      const firstItem = dragItems.first;
      const thirdItemRect = dragItems.toArray()[2].element.nativeElement.getBoundingClientRect();

      dragElementViaMouse(fixture, firstItem.element.nativeElement,
          thirdItemRect.right - 1, thirdItemRect.top + 1);
      flush();
      fixture.detectChanges();

      expect(fixture.componentInstance.droppedSpy).toHaveBeenCalledTimes(1);

      const event = fixture.componentInstance.droppedSpy.calls.mostRecent().args[0];

      // Assert the event like this, rather than `toHaveBeenCalledWith`, because Jasmine will
      // go into an infinite loop trying to stringify the event, if the test fails.
      expect(event).toEqual({
        previousIndex: 0,
        currentIndex: 2,
        item: firstItem,
        container: fixture.componentInstance.dropInstance,
        previousContainer: fixture.componentInstance.dropInstance,
        isPointerOverContainer: true
      });

      expect(dragItems.map(drag => drag.element.nativeElement.textContent!.trim()))
          .toEqual(['One', 'Two', 'Zero', 'Three']);
    }));

    it('should not move items in a horizontal list if pointer is too far away', fakeAsync(() => {
      const fixture = createComponent(DraggableInHorizontalDropZone);
      fixture.detectChanges();
      const dragItems = fixture.componentInstance.dragItems;

      expect(dragItems.map(drag => drag.element.nativeElement.textContent!.trim()))
          .toEqual(['Zero', 'One', 'Two', 'Three']);

      const firstItem = dragItems.first;
      const thirdItemRect = dragItems.toArray()[2].element.nativeElement.getBoundingClientRect();

      // Move the cursor all the way to the bottom so it doesn't intersect along the y axis.
      dragElementViaMouse(fixture, firstItem.element.nativeElement,
          thirdItemRect.left + 1, thirdItemRect.bottom + 1000);
      flush();
      fixture.detectChanges();

      expect(fixture.componentInstance.droppedSpy).toHaveBeenCalledTimes(1);

      const event = fixture.componentInstance.droppedSpy.calls.mostRecent().args[0];

      // Assert the event like this, rather than `toHaveBeenCalledWith`, because Jasmine will
      // go into an infinite loop trying to stringify the event, if the test fails.
      expect(event).toEqual({
        previousIndex: 0,
        currentIndex: 0,
        item: firstItem,
        container: fixture.componentInstance.dropInstance,
        previousContainer: fixture.componentInstance.dropInstance,
        isPointerOverContainer: false
      });

      expect(dragItems.map(drag => drag.element.nativeElement.textContent!.trim()))
          .toEqual(['Zero', 'One', 'Two', 'Three']);
    }));

    it('should create a preview element while the item is dragged', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();
      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;
      const itemRect = item.getBoundingClientRect();
      const initialParent = item.parentNode;

      startDraggingViaMouse(fixture, item);

      const preview = document.querySelector('.cdk-drag-preview')! as HTMLElement;
      const previewRect = preview.getBoundingClientRect();

      expect(item.parentNode).toBe(document.body, 'Expected element to be moved out into the body');
      expect(item.style.display).toBe('none', 'Expected element to be hidden');
      expect(preview).toBeTruthy('Expected preview to be in the DOM');
      expect(preview.textContent!.trim())
          .toContain('One', 'Expected preview content to match element');
      expect(preview.getAttribute('dir'))
          .toBe('ltr', 'Expected preview element to inherit the directionality.');
      expect(previewRect.width).toBe(itemRect.width, 'Expected preview width to match element');
      expect(previewRect.height).toBe(itemRect.height, 'Expected preview height to match element');
      expect(preview.style.pointerEvents)
          .toBe('none', 'Expected pointer events to be disabled on the preview');

      dispatchMouseEvent(document, 'mouseup');
      fixture.detectChanges();
      flush();

      expect(item.parentNode)
          .toBe(initialParent, 'Expected element to be moved back into its old parent');
      expect(item.style.display).toBeFalsy('Expected element to be visible');
      expect(preview.parentNode).toBeFalsy('Expected preview to be removed from the DOM');
    }));

    it('should create the preview inside the fullscreen element when in fullscreen mode',
      fakeAsync(() => {
        // Provide a limited stub of the document since we can't trigger fullscreen
        // mode in unit tests and there are some issues with doing it in e2e tests.
        const fakeDocument = {
          body: document.body,
          fullscreenElement: document.createElement('div'),
          ELEMENT_NODE: Node.ELEMENT_NODE,
          querySelectorAll: function() {
            return document.querySelectorAll.apply(document, arguments);
          },
          addEventListener: function() {
            document.addEventListener.apply(document, arguments);
          },
          removeEventListener: function() {
            document.addEventListener.apply(document, arguments);
          }
        };
        const fixture = createComponent(DraggableInDropZone, [{
          provide: DOCUMENT,
          useFactory: () => fakeDocument
        }]);
        fixture.detectChanges();
        const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;

        document.body.appendChild(fakeDocument.fullscreenElement);
        startDraggingViaMouse(fixture, item);
        flush();

        const preview = document.querySelector('.cdk-drag-preview')! as HTMLElement;

        expect(preview.parentNode).toBe(fakeDocument.fullscreenElement);
        fakeDocument.fullscreenElement.parentNode!.removeChild(fakeDocument.fullscreenElement);
      }));

    it('should be able to constrain the preview position', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.componentInstance.boundarySelector = '.cdk-drop-list';
      fixture.detectChanges();
      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;
      const listRect =
          fixture.componentInstance.dropInstance.element.nativeElement.getBoundingClientRect();

      startDraggingViaMouse(fixture, item);

      const preview = document.querySelector('.cdk-drag-preview')! as HTMLElement;

      startDraggingViaMouse(fixture, item, listRect.right + 50, listRect.bottom + 50);
      flush();
      dispatchMouseEvent(document, 'mousemove', listRect.right + 50, listRect.bottom + 50);
      fixture.detectChanges();

      const previewRect = preview.getBoundingClientRect();

      expect(Math.floor(previewRect.bottom)).toBe(Math.floor(listRect.bottom));
      expect(Math.floor(previewRect.right)).toBe(Math.floor(listRect.right));
    }));

    it('should clear the id from the preview', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();
      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;
      item.id = 'custom-id';

      startDraggingViaMouse(fixture, item);

      const preview = document.querySelector('.cdk-drag-preview')! as HTMLElement;

      expect(preview.getAttribute('id')).toBeFalsy();
    }));

    it('should clear the ids from descendants of the preview', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();
      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;
      const extraChild = document.createElement('div');
      extraChild.id = 'child-id';
      extraChild.classList.add('preview-child');
      item.appendChild(extraChild);

      startDraggingViaMouse(fixture, item);

      expect(document.querySelectorAll('.preview-child').length).toBeGreaterThan(1);
      expect(document.querySelectorAll('[id="child-id"]').length).toBe(1);
    }));

    it('should not create a preview if the element was not dragged far enough', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone, [], 5);
      fixture.detectChanges();
      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;

      startDraggingViaMouse(fixture, item);

      expect(document.querySelector('.cdk-drag-preview')).toBeFalsy();
    }));

    it('should pass the proper direction to the preview in rtl', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone, [{
        provide: Directionality,
        useValue: ({value: 'rtl', change: observableOf()})
      }]);

      fixture.detectChanges();

      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;
      startDraggingViaMouse(fixture, item);

      expect(document.querySelector('.cdk-drag-preview')!.getAttribute('dir'))
          .toBe('rtl', 'Expected preview element to inherit the directionality.');
    }));

    it('should remove the preview if its `transitionend` event timed out', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();
      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;

      startDraggingViaMouse(fixture, item);

      const preview = document.querySelector('.cdk-drag-preview')! as HTMLElement;

      // Add a duration since the tests won't include one.
      preview.style.transitionDuration = '500ms';

      // Move somewhere so the draggable doesn't exit immediately.
      dispatchMouseEvent(document, 'mousemove', 50, 50);
      fixture.detectChanges();

      dispatchMouseEvent(document, 'mouseup');
      fixture.detectChanges();
      tick(250);

      expect(preview.parentNode)
          .toBeTruthy('Expected preview to be in the DOM mid-way through the transition');

      tick(500);

      expect(preview.parentNode)
          .toBeFalsy('Expected preview to be removed from the DOM if the transition timed out');
    }));

    it('should emit the released event as soon as the item is released', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();
      const item = fixture.componentInstance.dragItems.toArray()[1];
      const endedSpy = jasmine.createSpy('ended spy');
      const releasedSpy = jasmine.createSpy('released spy');
      const endedSubscription = item.ended.subscribe(endedSpy);
      const releasedSubscription = item.released.subscribe(releasedSpy);

      startDraggingViaMouse(fixture, item.element.nativeElement);

      const preview = document.querySelector('.cdk-drag-preview')! as HTMLElement;

      // Add a duration since the tests won't include one.
      preview.style.transitionDuration = '500ms';

      // Move somewhere so the draggable doesn't exit immediately.
      dispatchMouseEvent(document, 'mousemove', 50, 50);
      fixture.detectChanges();

      dispatchMouseEvent(document, 'mouseup');
      fixture.detectChanges();

      // Expected the released event to fire immediately upon release.
      expect(releasedSpy).toHaveBeenCalled();
      tick(1000);

      // Expected the ended event to fire once the entire sequence is done.
      expect(endedSpy).toHaveBeenCalled();

      endedSubscription.unsubscribe();
      releasedSubscription.unsubscribe();
    }));

    it('should reset immediately when failed drag happens after a successful one', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();

      const itemInstance = fixture.componentInstance.dragItems.toArray()[1];
      const item = itemInstance.element.nativeElement;
      const spy = jasmine.createSpy('dropped spy');
      const subscription = itemInstance.dropped.asObservable().subscribe(spy);

      // Do an initial drag and drop sequence.
      dragElementViaMouse(fixture, item, 50, 50);
      tick(0); // Important to tick with 0 since we don't want to flush any pending timeouts.

      expect(spy).toHaveBeenCalledTimes(1);

      // Start another drag.
      startDraggingViaMouse(fixture, item);

      // Add a duration since the tests won't include one.
      const preview = document.querySelector('.cdk-drag-preview')! as HTMLElement;
      preview.style.transitionDuration = '500ms';

      // Dispatch the mouseup immediately to simulate the user not moving the element.
      dispatchMouseEvent(document, 'mouseup');
      fixture.detectChanges();
      tick(0); // Important to tick with 0 since we don't want to flush any pending timeouts.

      expect(spy).toHaveBeenCalledTimes(2);

      subscription.unsubscribe();
    }));

    it('should not wait for transition that are not on the `transform` property', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();
      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;

      startDraggingViaMouse(fixture, item);

      const preview = document.querySelector('.cdk-drag-preview')! as HTMLElement;
      preview.style.transition = 'opacity 500ms ease';

      dispatchMouseEvent(document, 'mousemove', 50, 50);
      fixture.detectChanges();

      dispatchMouseEvent(document, 'mouseup');
      fixture.detectChanges();
      tick(0);

      expect(preview.parentNode)
          .toBeFalsy('Expected preview to be removed from the DOM immediately');
    }));

    it('should pick out the `transform` duration if multiple properties are being transitioned',
      fakeAsync(() => {
        const fixture = createComponent(DraggableInDropZone);
        fixture.detectChanges();
        const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;

        startDraggingViaMouse(fixture, item);

        const preview = document.querySelector('.cdk-drag-preview')! as HTMLElement;
        preview.style.transition = 'opacity 500ms ease, transform 1000ms ease';

        dispatchMouseEvent(document, 'mousemove', 50, 50);
        fixture.detectChanges();

        dispatchMouseEvent(document, 'mouseup');
        fixture.detectChanges();
        tick(500);

        expect(preview.parentNode)
            .toBeTruthy('Expected preview to be in the DOM at the end of the opacity transition');

        tick(1000);

        expect(preview.parentNode).toBeFalsy(
            'Expected preview to be removed from the DOM at the end of the transform transition');
      }));

    it('should create a placeholder element while the item is dragged', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();
      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;
      const initialParent = item.parentNode;

      startDraggingViaMouse(fixture, item);

      const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;

      expect(placeholder).toBeTruthy('Expected placeholder to be in the DOM');
      expect(placeholder.parentNode)
          .toBe(initialParent, 'Expected placeholder to be inserted into the same parent');
      expect(placeholder.textContent!.trim())
          .toContain('One', 'Expected placeholder content to match element');

      dispatchMouseEvent(document, 'mouseup');
      fixture.detectChanges();
      flush();

      expect(placeholder.parentNode).toBeFalsy('Expected placeholder to be removed from the DOM');
    }));

    it('should remove the id from the placeholder', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();
      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;

      item.id = 'custom-id';

      startDraggingViaMouse(fixture, item);

      const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;

      expect(placeholder.getAttribute('id')).toBeFalsy();
    }));

    it('should clear the ids from descendants of the placeholder', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();
      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;
      const extraChild = document.createElement('div');
      extraChild.id = 'child-id';
      extraChild.classList.add('placeholder-child');
      item.appendChild(extraChild);

      startDraggingViaMouse(fixture, item);

      expect(document.querySelectorAll('.placeholder-child').length).toBeGreaterThan(1);
      expect(document.querySelectorAll('[id="child-id"]').length).toBe(1);
    }));

    it('should not create placeholder if the element was not dragged far enough', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone, [], 5);
      fixture.detectChanges();
      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;

      startDraggingViaMouse(fixture, item);

      expect(document.querySelector('.cdk-drag-placeholder')).toBeFalsy();
    }));

    it('should move the placeholder as an item is being sorted down', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();
      assertDownwardSorting(fixture, fixture.componentInstance.dragItems.map(item => {
        return item.element.nativeElement;
      }));
    }));

    it('should move the placeholder as an item is being sorted down on a scrolled page',
      fakeAsync(() => {
        const fixture = createComponent(DraggableInDropZone);
        fixture.detectChanges();
        const cleanup = makePageScrollable();

        scrollTo(0, 500);
        assertDownwardSorting(fixture, fixture.componentInstance.dragItems.map(item => {
          return item.element.nativeElement;
        }));
        cleanup();
      }));

    it('should move the placeholder as an item is being sorted up', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();
      assertUpwardSorting(fixture, fixture.componentInstance.dragItems.map(item => {
        return item.element.nativeElement;
      }));
    }));

    it('should move the placeholder as an item is being sorted up on a scrolled page',
      fakeAsync(() => {
        const fixture = createComponent(DraggableInDropZone);
        fixture.detectChanges();
        const cleanup = makePageScrollable();

        scrollTo(0, 500);
        assertUpwardSorting(fixture, fixture.componentInstance.dragItems.map(item => {
          return item.element.nativeElement;
        }));
        cleanup();
      }));

    it('should move the placeholder as an item is being sorted to the right', fakeAsync(() => {
      const fixture = createComponent(DraggableInHorizontalDropZone);
      fixture.detectChanges();

      const items = fixture.componentInstance.dragItems.toArray();
      const draggedItem = items[0].element.nativeElement;
      const {top, left} = draggedItem.getBoundingClientRect();

      startDraggingViaMouse(fixture, draggedItem, left, top);

      const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;

      // Drag over each item one-by-one going to the right.
      for (let i = 0; i < items.length; i++) {
        const elementRect = items[i].element.nativeElement.getBoundingClientRect();

        // Add a few pixels to the left offset so we get some overlap.
        dispatchMouseEvent(document, 'mousemove', elementRect.left + 5, elementRect.top);
        fixture.detectChanges();
        expect(getElementIndexByPosition(placeholder, 'left')).toBe(i);
      }

      dispatchMouseEvent(document, 'mouseup');
      fixture.detectChanges();
      flush();
    }));

    it('should move the placeholder as an item is being sorted to the left', fakeAsync(() => {
      const fixture = createComponent(DraggableInHorizontalDropZone);
      fixture.detectChanges();

      const items = fixture.componentInstance.dragItems.toArray();
      const draggedItem = items[items.length - 1].element.nativeElement;
      const {top, left} = draggedItem.getBoundingClientRect();

      startDraggingViaMouse(fixture, draggedItem, left, top);

      const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;

      // Drag over each item one-by-one going to the left.
      for (let i = items.length - 1; i > -1; i--) {
        const elementRect = items[i].element.nativeElement.getBoundingClientRect();

        // Remove a few pixels from the right offset so we get some overlap.
        dispatchMouseEvent(document, 'mousemove', elementRect.right - 5, elementRect.top);
        fixture.detectChanges();
        expect(getElementIndexByPosition(placeholder, 'left')).toBe(i);
      }

      dispatchMouseEvent(document, 'mouseup');
      fixture.detectChanges();
      flush();
    }));

    it('should lay out the elements correctly, if an element skips multiple positions when ' +
      'sorting vertically', fakeAsync(() => {
        const fixture = createComponent(DraggableInDropZone);
        fixture.detectChanges();

        const items = fixture.componentInstance.dragItems.map(i => i.element.nativeElement);
        const draggedItem = items[0];
        const {top, left} = draggedItem.getBoundingClientRect();

        startDraggingViaMouse(fixture, draggedItem, left, top);

        const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;
        const targetRect = items[items.length - 1].getBoundingClientRect();

        // Add a few pixels to the top offset so we get some overlap.
        dispatchMouseEvent(document, 'mousemove', targetRect.left, targetRect.top + 5);
        fixture.detectChanges();

        expect(getElementSibligsByPosition(placeholder, 'top').map(e => e.textContent!.trim()))
            .toEqual(['One', 'Two', 'Three', 'Zero']);

        dispatchMouseEvent(document, 'mouseup');
        fixture.detectChanges();
        flush();
      }));

    it('should lay out the elements correctly, when swapping down with a taller element',
      fakeAsync(() => {
        const fixture = createComponent(DraggableInDropZone);
        fixture.detectChanges();

        const items = fixture.componentInstance.dragItems.map(i => i.element.nativeElement);
        const {top, left} = items[0].getBoundingClientRect();

        fixture.componentInstance.items[0].height = ITEM_HEIGHT * 2;
        fixture.detectChanges();

        startDraggingViaMouse(fixture, items[0], left, top);

        const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;
        const target = items[1];
        const targetRect = target.getBoundingClientRect();

        // Add a few pixels to the top offset so we get some overlap.
        dispatchMouseEvent(document, 'mousemove', targetRect.left, targetRect.top + 5);
        fixture.detectChanges();

        expect(placeholder.style.transform).toBe(`translate3d(0px, ${ITEM_HEIGHT}px, 0px)`);
        expect(target.style.transform).toBe(`translate3d(0px, ${-ITEM_HEIGHT * 2}px, 0px)`);

        dispatchMouseEvent(document, 'mouseup');
        fixture.detectChanges();
        flush();
      }));

    it('should lay out the elements correctly, when swapping up with a taller element',
      fakeAsync(() => {
        const fixture = createComponent(DraggableInDropZone);
        fixture.detectChanges();

        const items = fixture.componentInstance.dragItems.map(i => i.element.nativeElement);
        const {top, left} = items[1].getBoundingClientRect();

        fixture.componentInstance.items[1].height = ITEM_HEIGHT * 2;
        fixture.detectChanges();

        startDraggingViaMouse(fixture, items[1], left, top);

        const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;
        const target = items[0];
        const targetRect = target.getBoundingClientRect();

        // Add a few pixels to the top offset so we get some overlap.
        dispatchMouseEvent(document, 'mousemove', targetRect.left, targetRect.bottom - 5);
        fixture.detectChanges();

        expect(placeholder.style.transform).toBe(`translate3d(0px, ${-ITEM_HEIGHT}px, 0px)`);
        expect(target.style.transform).toBe(`translate3d(0px, ${ITEM_HEIGHT * 2}px, 0px)`);

        dispatchMouseEvent(document, 'mouseup');
        fixture.detectChanges();
        flush();
      }));

    it('should lay out elements correctly, when swapping an item with margin', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();

      const items = fixture.componentInstance.dragItems.map(i => i.element.nativeElement);
      const {top, left} = items[0].getBoundingClientRect();

      fixture.componentInstance.items[0].margin = 12;
      fixture.detectChanges();

      startDraggingViaMouse(fixture, items[0], left, top);

      const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;
      const target = items[1];
      const targetRect = target.getBoundingClientRect();

      // Add a few pixels to the top offset so we get some overlap.
      dispatchMouseEvent(document, 'mousemove', targetRect.left, targetRect.top + 5);
      fixture.detectChanges();

      expect(placeholder.style.transform).toBe(`translate3d(0px, ${ITEM_HEIGHT + 12}px, 0px)`);
      expect(target.style.transform).toBe(`translate3d(0px, ${-ITEM_HEIGHT - 12}px, 0px)`);

      dispatchMouseEvent(document, 'mouseup');
      fixture.detectChanges();
      flush();
    }));

    it('should lay out the elements correctly, if an element skips multiple positions when ' +
      'sorting horizontally', fakeAsync(() => {
        const fixture = createComponent(DraggableInHorizontalDropZone);
        fixture.detectChanges();

        const items = fixture.componentInstance.dragItems.map(i => i.element.nativeElement);
        const draggedItem = items[0];
        const {top, left} = draggedItem.getBoundingClientRect();

        startDraggingViaMouse(fixture, draggedItem, left, top);

        const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;
        const targetRect = items[items.length - 1].getBoundingClientRect();

        // Add a few pixels to the left offset so we get some overlap.
        dispatchMouseEvent(document, 'mousemove', targetRect.right - 5, targetRect.top);
        fixture.detectChanges();

        expect(getElementSibligsByPosition(placeholder, 'left').map(e => e.textContent!.trim()))
            .toEqual(['One', 'Two', 'Three', 'Zero']);

        dispatchMouseEvent(document, 'mouseup');
        fixture.detectChanges();
        flush();
      }));

    it('should lay out the elements correctly, when swapping to the right with a wider element',
      fakeAsync(() => {
        const fixture = createComponent(DraggableInHorizontalDropZone);
        fixture.detectChanges();

        const items = fixture.componentInstance.dragItems.map(i => i.element.nativeElement);

        fixture.componentInstance.items[0].width = ITEM_WIDTH * 2;
        fixture.detectChanges();

        const {top, left} = items[0].getBoundingClientRect();
        startDraggingViaMouse(fixture, items[0], left, top);

        const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;
        const target = items[1];
        const targetRect = target.getBoundingClientRect();

        dispatchMouseEvent(document, 'mousemove', targetRect.right - 5, targetRect.top);
        fixture.detectChanges();

        expect(placeholder.style.transform).toBe(`translate3d(${ITEM_WIDTH}px, 0px, 0px)`);
        expect(target.style.transform).toBe(`translate3d(${-ITEM_WIDTH * 2}px, 0px, 0px)`);

        dispatchMouseEvent(document, 'mouseup');
        fixture.detectChanges();
        flush();
      }));

    it('should lay out the elements correctly, when swapping left with a wider element',
      fakeAsync(() => {
        const fixture = createComponent(DraggableInHorizontalDropZone);
        fixture.detectChanges();

        const items = fixture.componentInstance.dragItems.map(i => i.element.nativeElement);
        const {top, left} = items[1].getBoundingClientRect();

        fixture.componentInstance.items[1].width = ITEM_WIDTH * 2;
        fixture.detectChanges();

        startDraggingViaMouse(fixture, items[1], left, top);

        const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;
        const target = items[0];
        const targetRect = target.getBoundingClientRect();

        dispatchMouseEvent(document, 'mousemove', targetRect.right - 5, targetRect.top);
        fixture.detectChanges();

        expect(placeholder.style.transform).toBe(`translate3d(${-ITEM_WIDTH}px, 0px, 0px)`);
        expect(target.style.transform).toBe(`translate3d(${ITEM_WIDTH * 2}px, 0px, 0px)`);

        dispatchMouseEvent(document, 'mouseup');
        fixture.detectChanges();
        flush();
      }));

    it('should lay out elements correctly, when horizontally swapping an item with margin',
      fakeAsync(() => {
        const fixture = createComponent(DraggableInHorizontalDropZone);
        fixture.detectChanges();

        const items = fixture.componentInstance.dragItems.map(i => i.element.nativeElement);
        const {top, left} = items[0].getBoundingClientRect();

        fixture.componentInstance.items[0].margin = 12;
        fixture.detectChanges();

        startDraggingViaMouse(fixture, items[0], left, top);

        const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;
        const target = items[1];
        const targetRect = target.getBoundingClientRect();

        dispatchMouseEvent(document, 'mousemove', targetRect.right - 5, targetRect.top);
        fixture.detectChanges();

        expect(placeholder.style.transform).toBe(`translate3d(${ITEM_WIDTH + 12}px, 0px, 0px)`);
        expect(target.style.transform).toBe(`translate3d(${-ITEM_WIDTH - 12}px, 0px, 0px)`);

        dispatchMouseEvent(document, 'mouseup');
        fixture.detectChanges();
        flush();
      }));

    it('should not swap position for tiny pointer movements', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();

      const items = fixture.componentInstance.dragItems.map(i => i.element.nativeElement);
      const draggedItem = items[0];
      const target = items[1];
      const {top, left} = draggedItem.getBoundingClientRect();

      // Bump the height so the pointer doesn't leave after swapping.
      target.style.height = `${ITEM_HEIGHT * 3}px`;

      startDraggingViaMouse(fixture, draggedItem, left, top);

      const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;

      expect(getElementSibligsByPosition(placeholder, 'top').map(e => e.textContent!.trim()))
          .toEqual(['Zero', 'One', 'Two', 'Three']);

      const targetRect = target.getBoundingClientRect();
      const pointerTop = targetRect.top + 20;

      // Move over the target so there's a 20px overlap.
      dispatchMouseEvent(document, 'mousemove', targetRect.left, pointerTop);
      fixture.detectChanges();
      expect(getElementSibligsByPosition(placeholder, 'top').map(e => e.textContent!.trim()))
          .toEqual(['One', 'Zero', 'Two', 'Three'], 'Expected position to swap.');

      // Move down a further 1px.
      dispatchMouseEvent(document, 'mousemove', targetRect.left, pointerTop + 1);
      fixture.detectChanges();
      expect(getElementSibligsByPosition(placeholder, 'top').map(e => e.textContent!.trim()))
          .toEqual(['One', 'Zero', 'Two', 'Three'], 'Expected positions not to swap.');

      dispatchMouseEvent(document, 'mouseup');
      fixture.detectChanges();
      flush();
    }));

    it('should swap position for pointer movements in the opposite direction', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();

      const items = fixture.componentInstance.dragItems.map(i => i.element.nativeElement);
      const draggedItem = items[0];
      const target = items[1];
      const {top, left} = draggedItem.getBoundingClientRect();

      // Bump the height so the pointer doesn't leave after swapping.
      target.style.height = `${ITEM_HEIGHT * 3}px`;

      startDraggingViaMouse(fixture, draggedItem, left, top);

      const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;

      expect(getElementSibligsByPosition(placeholder, 'top').map(e => e.textContent!.trim()))
          .toEqual(['Zero', 'One', 'Two', 'Three']);

      const targetRect = target.getBoundingClientRect();
      const pointerTop = targetRect.top + 20;

      // Move over the target so there's a 20px overlap.
      dispatchMouseEvent(document, 'mousemove', targetRect.left, pointerTop);
      fixture.detectChanges();
      expect(getElementSibligsByPosition(placeholder, 'top').map(e => e.textContent!.trim()))
          .toEqual(['One', 'Zero', 'Two', 'Three'], 'Expected position to swap.');

      // Move up 10px.
      dispatchMouseEvent(document, 'mousemove', targetRect.left, pointerTop - 10);
      fixture.detectChanges();
      expect(getElementSibligsByPosition(placeholder, 'top').map(e => e.textContent!.trim()))
          .toEqual(['Zero', 'One', 'Two', 'Three'], 'Expected positions to swap again.');

      dispatchMouseEvent(document, 'mouseup');
      fixture.detectChanges();
      flush();
    }));

    it('should clean up the preview element if the item is destroyed mid-drag', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();
      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;

      startDraggingViaMouse(fixture, item);

      const preview = document.querySelector('.cdk-drag-preview')! as HTMLElement;

      expect(preview.parentNode).toBeTruthy('Expected preview to be in the DOM');
      expect(item.parentNode).toBeTruthy('Expected drag item to be in the DOM');

      fixture.destroy();

      expect(preview.parentNode).toBeFalsy('Expected preview to be removed from the DOM');
      expect(item.parentNode).toBeFalsy('Expected drag item to be removed from the DOM');
    }));

    it('should be able to customize the preview element', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZoneWithCustomPreview);
      fixture.detectChanges();
      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;

      startDraggingViaMouse(fixture, item);

      const preview = document.querySelector('.cdk-drag-preview')! as HTMLElement;

      expect(preview).toBeTruthy();
      expect(preview.classList).toContain('custom-preview');
      expect(preview.textContent!.trim()).toContain('Custom preview');
    }));

    it('should handle the custom preview being removed', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZoneWithCustomPreview);
      fixture.detectChanges();
      flush();
      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;

      fixture.componentInstance.renderCustomPreview = false;
      fixture.detectChanges();
      startDraggingViaMouse(fixture, item);

      const preview = document.querySelector('.cdk-drag-preview')! as HTMLElement;

      expect(preview).toBeTruthy();
      expect(preview.classList).not.toContain('custom-preview');
      expect(preview.textContent!.trim()).not.toContain('Custom preview');
    }));

    it('should be able to constrain the position of a custom preview', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZoneWithCustomPreview);
      fixture.componentInstance.boundarySelector = '.cdk-drop-list';
      fixture.detectChanges();
      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;
      const listRect =
          fixture.componentInstance.dropInstance.element.nativeElement.getBoundingClientRect();

      startDraggingViaMouse(fixture, item);

      const preview = document.querySelector('.cdk-drag-preview')! as HTMLElement;

      startDraggingViaMouse(fixture, item, listRect.right + 50, listRect.bottom + 50);
      flush();
      dispatchMouseEvent(document, 'mousemove', listRect.right + 50, listRect.bottom + 50);
      fixture.detectChanges();

      const previewRect = preview.getBoundingClientRect();

      expect(Math.floor(previewRect.bottom)).toBe(Math.floor(listRect.bottom));
      expect(Math.floor(previewRect.right)).toBe(Math.floor(listRect.right));
    }));

    it('should be able to constrain the preview position with a custom function', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZoneWithCustomPreview);
      const spy = jasmine.createSpy('constrain position spy').and.returnValue({
        x: 50,
        y: 50
      } as Point);

      fixture.componentInstance.constrainPosition = spy;
      fixture.detectChanges();
      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;

      startDraggingViaMouse(fixture, item);

      const preview = document.querySelector('.cdk-drag-preview')! as HTMLElement;

      startDraggingViaMouse(fixture, item, 200, 200);
      flush();
      dispatchMouseEvent(document, 'mousemove', 200, 200);
      fixture.detectChanges();

      const previewRect = preview.getBoundingClientRect();

      expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({x: 200, y: 200}));
      expect(Math.floor(previewRect.top)).toBe(50);
      expect(Math.floor(previewRect.left)).toBe(50);
    }));

    it('should revert the element back to its parent after dragging with a custom ' +
      'preview has stopped', fakeAsync(() => {
        const fixture = createComponent(DraggableInDropZoneWithCustomPreview);
        fixture.detectChanges();

        const dragContainer = fixture.componentInstance.dropInstance.element.nativeElement;
        const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;

        expect(dragContainer.contains(item)).toBe(true, 'Expected item to be in container.');

        // The coordinates don't matter.
        dragElementViaMouse(fixture, item, 10, 10);
        flush();
        fixture.detectChanges();

        expect(dragContainer.contains(item))
            .toBe(true, 'Expected item to be returned to container.');
      }));

    it('should position custom previews next to the pointer', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZoneWithCustomPreview);
      fixture.detectChanges();
      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;

      startDraggingViaMouse(fixture, item, 50, 50);

      const preview = document.querySelector('.cdk-drag-preview')! as HTMLElement;

      expect(preview.style.transform).toBe('translate3d(50px, 50px, 0px)');
    }));

    it('should lock position inside a drop container along the x axis', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZoneWithCustomPreview);
      fixture.detectChanges();

      const item = fixture.componentInstance.dragItems.toArray()[1];
      const element = item.element.nativeElement;

      item.lockAxis = 'x';

      startDraggingViaMouse(fixture, element, 50, 50);

      dispatchMouseEvent(element, 'mousemove', 100, 100);
      fixture.detectChanges();

      const preview = document.querySelector('.cdk-drag-preview')! as HTMLElement;

      expect(preview.style.transform).toBe('translate3d(100px, 50px, 0px)');
    }));

    it('should lock position inside a drop container along the y axis', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZoneWithCustomPreview);
      fixture.detectChanges();

      const item = fixture.componentInstance.dragItems.toArray()[1];
      const element = item.element.nativeElement;

      item.lockAxis = 'y';

      startDraggingViaMouse(fixture, element, 50, 50);

      dispatchMouseEvent(element, 'mousemove', 100, 100);
      fixture.detectChanges();

      const preview = document.querySelector('.cdk-drag-preview')! as HTMLElement;

      expect(preview.style.transform).toBe('translate3d(50px, 100px, 0px)');
    }));

    it('should inherit the position locking from the drop container', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZoneWithCustomPreview);
      fixture.detectChanges();

      const element = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;

      fixture.componentInstance.dropInstance.lockAxis = 'x';

      startDraggingViaMouse(fixture, element, 50, 50);

      dispatchMouseEvent(element, 'mousemove', 100, 100);
      fixture.detectChanges();

      const preview = document.querySelector('.cdk-drag-preview')! as HTMLElement;

      expect(preview.style.transform).toBe('translate3d(100px, 50px, 0px)');
    }));

    it('should be able to customize the placeholder', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZoneWithCustomPlaceholder);
      fixture.detectChanges();
      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;

      startDraggingViaMouse(fixture, item);

      const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;

      expect(placeholder).toBeTruthy();
      expect(placeholder.classList).toContain('custom-placeholder');
      expect(placeholder.textContent!.trim()).toContain('Custom placeholder');
    }));

    it('should handle the custom placeholder being removed', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZoneWithCustomPlaceholder);
      fixture.detectChanges();
      flush();

      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;

      fixture.componentInstance.renderPlaceholder = false;
      fixture.detectChanges();

      startDraggingViaMouse(fixture, item);

      const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;

      expect(placeholder).toBeTruthy();
      expect(placeholder.classList).not.toContain('custom-placeholder');
      expect(placeholder.textContent!.trim()).not.toContain('Custom placeholder');
    }));

    it('should clear the `transform` value from siblings when item is dropped`', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();

      const dragItems = fixture.componentInstance.dragItems;
      const firstItem = dragItems.first;
      const thirdItem = dragItems.toArray()[2].element.nativeElement;
      const thirdItemRect = thirdItem.getBoundingClientRect();

      startDraggingViaMouse(fixture, firstItem.element.nativeElement);

      dispatchMouseEvent(document, 'mousemove', thirdItemRect.left + 1, thirdItemRect.top + 1);
      fixture.detectChanges();

      expect(thirdItem.style.transform).toBeTruthy();

      dispatchMouseEvent(document, 'mouseup');
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      expect(thirdItem.style.transform).toBeFalsy();
    }));

    it('should not move the item if the list is disabled', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();
      const dragItems = fixture.componentInstance.dragItems;
      const dropElement = fixture.componentInstance.dropInstance.element.nativeElement;

      expect(dropElement.classList).not.toContain('cdk-drop-list-disabled');

      fixture.componentInstance.dropInstance.disabled = true;
      fixture.detectChanges();

      expect(dropElement.classList).toContain('cdk-drop-list-disabled');
      expect(dragItems.map(drag => drag.element.nativeElement.textContent!.trim()))
          .toEqual(['Zero', 'One', 'Two', 'Three']);

      const firstItem = dragItems.first;
      const thirdItemRect = dragItems.toArray()[2].element.nativeElement.getBoundingClientRect();

      dragElementViaMouse(fixture, firstItem.element.nativeElement,
          thirdItemRect.right + 1, thirdItemRect.top + 1);
      flush();
      fixture.detectChanges();

      expect(fixture.componentInstance.droppedSpy).not.toHaveBeenCalled();

      expect(dragItems.map(drag => drag.element.nativeElement.textContent!.trim()))
          .toEqual(['Zero', 'One', 'Two', 'Three']);
    }));

    it('should not throw if the `touches` array is empty', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();
      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;

      dispatchTouchEvent(item, 'touchstart');
      fixture.detectChanges();

      dispatchTouchEvent(document, 'touchmove');
      fixture.detectChanges();

      dispatchTouchEvent(document, 'touchmove', 50, 50);
      fixture.detectChanges();

      expect(() => {
        const endEvent = createTouchEvent('touchend', 50, 50);
        Object.defineProperty(endEvent, 'touches', {get: () => []});

        dispatchEvent(document, endEvent);
        fixture.detectChanges();
      }).not.toThrow();
    }));

    it('should not move the item if the group is disabled', fakeAsync(() => {
      const fixture = createComponent(ConnectedDropZonesViaGroupDirective);
      fixture.detectChanges();
      const dragItems = fixture.componentInstance.groupedDragItems[0];

      fixture.componentInstance.groupDisabled = true;
      fixture.detectChanges();

      expect(dragItems.map(drag => drag.element.nativeElement.textContent!.trim()))
          .toEqual(['Zero', 'One', 'Two', 'Three']);

      const firstItem = dragItems[0];
      const thirdItemRect = dragItems[2].element.nativeElement.getBoundingClientRect();

      dragElementViaMouse(fixture, firstItem.element.nativeElement,
          thirdItemRect.right + 1, thirdItemRect.top + 1);
      flush();
      fixture.detectChanges();

      expect(fixture.componentInstance.droppedSpy).not.toHaveBeenCalled();

      expect(dragItems.map(drag => drag.element.nativeElement.textContent!.trim()))
          .toEqual(['Zero', 'One', 'Two', 'Three']);
    }));

    it('should not sort an item if sorting the list is disabled', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();

      const dropInstance = fixture.componentInstance.dropInstance;
      const dragItems = fixture.componentInstance.dragItems;

      dropInstance.sortingDisabled = true;

      expect(dragItems.map(drag => drag.element.nativeElement.textContent!.trim()))
          .toEqual(['Zero', 'One', 'Two', 'Three']);

      const firstItem = dragItems.first;
      const thirdItemRect = dragItems.toArray()[2].element.nativeElement.getBoundingClientRect();
      const targetX = thirdItemRect.left + 1;
      const targetY = thirdItemRect.top + 1;

      startDraggingViaMouse(fixture, firstItem.element.nativeElement);

      const placeholder = document.querySelector('.cdk-drag-placeholder') as HTMLElement;

      dispatchMouseEvent(document, 'mousemove', targetX, targetY);
      fixture.detectChanges();

      expect(getElementIndexByPosition(placeholder, 'top'))
          .toBe(0, 'Expected placeholder to stay in place.');

      dispatchMouseEvent(document, 'mouseup', targetX, targetY);
      fixture.detectChanges();

      flush();
      fixture.detectChanges();

      expect(fixture.componentInstance.droppedSpy).toHaveBeenCalledTimes(1);

      const event = fixture.componentInstance.droppedSpy.calls.mostRecent().args[0];

      // Assert the event like this, rather than `toHaveBeenCalledWith`, because Jasmine will
      // go into an infinite loop trying to stringify the event, if the test fails.
      expect(event).toEqual({
        previousIndex: 0,
        currentIndex: 0,
        item: firstItem,
        container: dropInstance,
        previousContainer: dropInstance,
        isPointerOverContainer: true
      });

      expect(dragItems.map(drag => drag.element.nativeElement.textContent!.trim()))
          .toEqual(['Zero', 'One', 'Two', 'Three']);
    }));


  });

  describe('in a connected drop container', () => {
    it('should dispatch the `dropped` event when an item has been dropped into a new container',
      fakeAsync(() => {
        const fixture = createComponent(ConnectedDropZones);
        fixture.detectChanges();

        const groups = fixture.componentInstance.groupedDragItems;
        const item = groups[0][1];
        const targetRect = groups[1][2].element.nativeElement.getBoundingClientRect();

        dragElementViaMouse(fixture, item.element.nativeElement,
            targetRect.left + 1, targetRect.top + 1);
        flush();
        fixture.detectChanges();

        expect(fixture.componentInstance.droppedSpy).toHaveBeenCalledTimes(1);

        const event = fixture.componentInstance.droppedSpy.calls.mostRecent().args[0];

        expect(event).toEqual({
          previousIndex: 1,
          currentIndex: 3,
          item,
          container: fixture.componentInstance.dropInstances.toArray()[1],
          previousContainer: fixture.componentInstance.dropInstances.first,
          isPointerOverContainer: true
        });
      }));

    it('should be able to move the element over a new container and return it', fakeAsync(() => {
      const fixture = createComponent(ConnectedDropZones);
      fixture.detectChanges();

      const groups = fixture.componentInstance.groupedDragItems;
      const dropZones = fixture.componentInstance.dropInstances.map(d => d.element.nativeElement);
      const item = groups[0][1];
      const initialRect = item.element.nativeElement.getBoundingClientRect();
      const targetRect = groups[1][2].element.nativeElement.getBoundingClientRect();

      startDraggingViaMouse(fixture, item.element.nativeElement);

      const placeholder = dropZones[0].querySelector('.cdk-drag-placeholder')!;

      expect(placeholder).toBeTruthy();
      expect(dropZones[0].contains(placeholder))
          .toBe(true, 'Expected placeholder to be inside the first container.');

      dispatchMouseEvent(document, 'mousemove', targetRect.left + 1, targetRect.top + 1);
      fixture.detectChanges();

      expect(dropZones[1].contains(placeholder))
          .toBe(true, 'Expected placeholder to be inside second container.');

      dispatchMouseEvent(document, 'mousemove', initialRect.left + 1, initialRect.top + 1);
      fixture.detectChanges();

      expect(dropZones[0].contains(placeholder))
          .toBe(true, 'Expected placeholder to be back inside first container.');

      dispatchMouseEvent(document, 'mouseup');
      fixture.detectChanges();

      expect(fixture.componentInstance.droppedSpy).not.toHaveBeenCalled();
    }));

    it('should be able to move the element over a new container and return it to the initial ' +
      'one, even if it no longer matches the enterPredicate', fakeAsync(() => {
        const fixture = createComponent(ConnectedDropZones);
        fixture.detectChanges();

        const groups = fixture.componentInstance.groupedDragItems;
        const dropZones = fixture.componentInstance.dropInstances.map(d => d.element.nativeElement);
        const item = groups[0][1];
        const initialRect = item.element.nativeElement.getBoundingClientRect();
        const targetRect = groups[1][2].element.nativeElement.getBoundingClientRect();

        fixture.componentInstance.dropInstances.first.enterPredicate = () => false;
        fixture.detectChanges();

        startDraggingViaMouse(fixture, item.element.nativeElement);

        const placeholder = dropZones[0].querySelector('.cdk-drag-placeholder')!;

        expect(placeholder).toBeTruthy();
        expect(dropZones[0].contains(placeholder))
            .toBe(true, 'Expected placeholder to be inside the first container.');

        dispatchMouseEvent(document, 'mousemove', targetRect.left + 1, targetRect.top + 1);
        fixture.detectChanges();

        expect(dropZones[1].contains(placeholder))
            .toBe(true, 'Expected placeholder to be inside second container.');

        dispatchMouseEvent(document, 'mousemove', initialRect.left + 1, initialRect.top + 1);
        fixture.detectChanges();

        expect(dropZones[0].contains(placeholder))
            .toBe(true, 'Expected placeholder to be back inside first container.');

        dispatchMouseEvent(document, 'mouseup');
        fixture.detectChanges();

        expect(fixture.componentInstance.droppedSpy).not.toHaveBeenCalled();
      }));

    it('should transfer the DOM element from one drop zone to another', fakeAsync(() => {
      const fixture = createComponent(ConnectedDropZones);
      fixture.detectChanges();

      const groups = fixture.componentInstance.groupedDragItems.slice();
      const element = groups[0][1].element.nativeElement;
      const dropInstances = fixture.componentInstance.dropInstances.toArray();
      const targetRect = groups[1][2].element.nativeElement.getBoundingClientRect();

      dragElementViaMouse(fixture, element, targetRect.left + 1, targetRect.top + 1);
      flush();
      fixture.detectChanges();

      const event = fixture.componentInstance.droppedSpy.calls.mostRecent().args[0];

      expect(event).toBeTruthy();
      expect(event).toEqual({
        previousIndex: 1,
        currentIndex: 3,
        item: groups[0][1],
        container: dropInstances[1],
        previousContainer: dropInstances[0],
        isPointerOverContainer: true
      });
    }));

    it('should not be able to transfer an item into a container that is not in `connectedTo`',
      fakeAsync(() => {
        const fixture = createComponent(ConnectedDropZones);

        fixture.detectChanges();
        fixture.componentInstance.dropInstances.forEach(d => d.connectedTo = []);
        fixture.detectChanges();

        const groups = fixture.componentInstance.groupedDragItems.slice();
        const element = groups[0][1].element.nativeElement;
        const dropInstances = fixture.componentInstance.dropInstances.toArray();
        const targetRect = groups[1][2].element.nativeElement.getBoundingClientRect();

        dragElementViaMouse(fixture, element, targetRect.left + 1, targetRect.top + 1);
        flush();
        fixture.detectChanges();

        const event = fixture.componentInstance.droppedSpy.calls.mostRecent().args[0];

        expect(event).toBeTruthy();
        expect(event).toEqual({
          previousIndex: 1,
          currentIndex: 1,
          item: groups[0][1],
          container: dropInstances[0],
          previousContainer: dropInstances[0],
          isPointerOverContainer: false
        });
      }));

    it('should not be able to transfer an item that does not match the `enterPredicate`',
      fakeAsync(() => {
        const fixture = createComponent(ConnectedDropZones);

        fixture.detectChanges();
        fixture.componentInstance.dropInstances.forEach(d => d.enterPredicate = () => false);
        fixture.detectChanges();

        const groups = fixture.componentInstance.groupedDragItems.slice();
        const element = groups[0][1].element.nativeElement;
        const dropInstances = fixture.componentInstance.dropInstances.toArray();
        const targetRect = groups[1][2].element.nativeElement.getBoundingClientRect();

        dragElementViaMouse(fixture, element, targetRect.left + 1, targetRect.top + 1);
        flush();
        fixture.detectChanges();

        const event = fixture.componentInstance.droppedSpy.calls.mostRecent().args[0];

        expect(event).toBeTruthy();
        expect(event).toEqual({
          previousIndex: 1,
          currentIndex: 1,
          item: groups[0][1],
          container: dropInstances[0],
          previousContainer: dropInstances[0],
          isPointerOverContainer: false
        });
      }));

    it('should call the `enterPredicate` with the item and the container it is entering',
      fakeAsync(() => {
        const fixture = createComponent(ConnectedDropZones);
        fixture.detectChanges();

        const dropInstances = fixture.componentInstance.dropInstances.toArray();
        const spy = jasmine.createSpy('enterPredicate spy').and.returnValue(true);
        const groups = fixture.componentInstance.groupedDragItems.slice();
        const dragItem = groups[0][1];
        const targetRect = groups[1][2].element.nativeElement.getBoundingClientRect();

        dropInstances[1].enterPredicate = spy;
        fixture.detectChanges();

        dragElementViaMouse(fixture, dragItem.element.nativeElement,
              targetRect.left + 1, targetRect.top + 1);
        flush();
        fixture.detectChanges();

        expect(spy).toHaveBeenCalledWith(dragItem, dropInstances[1]);
      }));

    it('should be able to start dragging after an item has been transferred', fakeAsync(() => {
      const fixture = createComponent(ConnectedDropZones);
      fixture.detectChanges();

      const groups = fixture.componentInstance.groupedDragItems;
      const element = groups[0][1].element.nativeElement;
      const dropZone = fixture.componentInstance.dropInstances.toArray()[1].element.nativeElement;
      const targetRect = dropZone.getBoundingClientRect();

      // Drag the element into the drop zone and move it to the top.
      [1, -1].forEach(offset => {
        dragElementViaMouse(fixture, element, targetRect.left + offset, targetRect.top + offset);
        flush();
        fixture.detectChanges();
      });

      assertDownwardSorting(fixture, Array.from(dropZone.querySelectorAll('.cdk-drag')));
    }));

    it('should be able to return the last item inside its initial container', fakeAsync(() => {
      const fixture = createComponent(ConnectedDropZones);

      // Make sure there's only one item in the first list.
      fixture.componentInstance.todo = ['things'];
      fixture.detectChanges();

      const groups = fixture.componentInstance.groupedDragItems;
      const dropZones = fixture.componentInstance.dropInstances.map(d => d.element.nativeElement);
      const item = groups[0][0];
      const initialRect = item.element.nativeElement.getBoundingClientRect();
      const targetRect = groups[1][0].element.nativeElement.getBoundingClientRect();

      startDraggingViaMouse(fixture, item.element.nativeElement);

      const placeholder = dropZones[0].querySelector('.cdk-drag-placeholder')!;

      expect(placeholder).toBeTruthy();

      expect(dropZones[0].contains(placeholder))
          .toBe(true, 'Expected placeholder to be inside the first container.');

      dispatchMouseEvent(document, 'mousemove', targetRect.left + 1, targetRect.top + 1);
      fixture.detectChanges();

      expect(dropZones[1].contains(placeholder))
          .toBe(true, 'Expected placeholder to be inside second container.');

      dispatchMouseEvent(document, 'mousemove', initialRect.left + 1, initialRect.top + 1);
      fixture.detectChanges();

      expect(dropZones[0].contains(placeholder))
          .toBe(true, 'Expected placeholder to be back inside first container.');

      dispatchMouseEvent(document, 'mouseup');
      fixture.detectChanges();

      expect(fixture.componentInstance.droppedSpy).not.toHaveBeenCalled();
    }));

    it('should assign a default id on each drop zone', fakeAsync(() => {
      const fixture = createComponent(ConnectedDropZones);
      fixture.detectChanges();

      expect(fixture.componentInstance.dropInstances.toArray().every(dropZone => {
        return !!dropZone.id && !!dropZone.element.nativeElement.getAttribute('id');
      })).toBe(true);
    }));

    it('should be able to connect two drop zones by id', fakeAsync(() => {
      const fixture = createComponent(ConnectedDropZones);
      fixture.detectChanges();

      const dropInstances = fixture.componentInstance.dropInstances.toArray();

      dropInstances[0].id = 'todo';
      dropInstances[1].id = 'done';
      dropInstances[0].connectedTo = ['done'];
      dropInstances[1].connectedTo = ['todo'];
      fixture.detectChanges();

      const groups = fixture.componentInstance.groupedDragItems;
      const element = groups[0][1].element.nativeElement;
      const targetRect = groups[1][2].element.nativeElement.getBoundingClientRect();

      dragElementViaMouse(fixture, element, targetRect.left + 1, targetRect.top + 1);
      flush();
      fixture.detectChanges();

      const event = fixture.componentInstance.droppedSpy.calls.mostRecent().args[0];

      expect(event).toBeTruthy();
      expect(event).toEqual({
        previousIndex: 1,
        currentIndex: 3,
        item: groups[0][1],
        container: dropInstances[1],
        previousContainer: dropInstances[0],
        isPointerOverContainer: true
      });
    }));

    it('should be able to connect two drop zones using the drop list group', fakeAsync(() => {
      const fixture = createComponent(ConnectedDropZonesViaGroupDirective);
      fixture.detectChanges();

      const dropInstances = fixture.componentInstance.dropInstances.toArray();
      const groups = fixture.componentInstance.groupedDragItems;
      const element = groups[0][1].element.nativeElement;
      const targetRect = groups[1][2].element.nativeElement.getBoundingClientRect();

      dragElementViaMouse(fixture, element, targetRect.left + 1, targetRect.top + 1);
      flush();
      fixture.detectChanges();

      const event = fixture.componentInstance.droppedSpy.calls.mostRecent().args[0];

      expect(event).toBeTruthy();
      expect(event).toEqual({
        previousIndex: 1,
        currentIndex: 3,
        item: groups[0][1],
        container: dropInstances[1],
        previousContainer: dropInstances[0],
        isPointerOverContainer: true
      });
    }));

    it('should be able to pass a single id to `connectedTo`', fakeAsync(() => {
      const fixture = createComponent(ConnectedDropZones);
      fixture.detectChanges();

      const dropInstances = fixture.componentInstance.dropInstances.toArray();

      dropInstances[1].id = 'done';
      dropInstances[0].connectedTo = ['done'];
      fixture.detectChanges();

      const groups = fixture.componentInstance.groupedDragItems;
      const element = groups[0][1].element.nativeElement;
      const targetRect = groups[1][2].element.nativeElement.getBoundingClientRect();

      dragElementViaMouse(fixture, element, targetRect.left + 1, targetRect.top + 1);
      flush();
      fixture.detectChanges();

      const event = fixture.componentInstance.droppedSpy.calls.mostRecent().args[0];

      expect(event).toBeTruthy();
      expect(event).toEqual({
        previousIndex: 1,
        currentIndex: 3,
        item: groups[0][1],
        container: dropInstances[1],
        previousContainer: dropInstances[0],
        isPointerOverContainer: true
      });
    }));

    it('should return DOM element to its initial container after it is dropped, in a container ' +
      'with one draggable item', fakeAsync(() => {
      const fixture = createComponent(ConnectedDropZonesWithSingleItems);
      fixture.detectChanges();

      const items = fixture.componentInstance.dragItems.toArray();
      const item = items[0];
      const targetRect = items[1].element.nativeElement.getBoundingClientRect();
      const dropContainers = fixture.componentInstance.dropInstances
          .map(drop => drop.element.nativeElement);

      expect(dropContainers[0].contains(item.element.nativeElement)).toBe(true,
          'Expected DOM element to be in first container');
      expect(item.dropContainer).toBe(fixture.componentInstance.dropInstances.first,
          'Expected CdkDrag to be in first container in memory');

      dragElementViaMouse(fixture, item.element.nativeElement,
          targetRect.left + 1, targetRect.top + 1);
      flush();
      fixture.detectChanges();

      expect(fixture.componentInstance.droppedSpy).toHaveBeenCalledTimes(1);

      const event = fixture.componentInstance.droppedSpy.calls.mostRecent().args[0];

      expect(event).toEqual({
        previousIndex: 0,
        currentIndex: 0,
        item,
        container: fixture.componentInstance.dropInstances.toArray()[1],
        previousContainer: fixture.componentInstance.dropInstances.first,
        isPointerOverContainer: true
      });

      expect(dropContainers[0].contains(item.element.nativeElement)).toBe(true,
          'Expected DOM element to be returned to first container');
      expect(item.dropContainer).toBe(fixture.componentInstance.dropInstances.first,
          'Expected CdkDrag to be returned to first container in memory');
    }));

    it('should be able to return an element to its initial container in the same sequence, ' +
      'even if it is not connected to the current container', fakeAsync(() => {
        const fixture = createComponent(ConnectedDropZones);
        fixture.detectChanges();

        const groups = fixture.componentInstance.groupedDragItems;
        const dropInstances = fixture.componentInstance.dropInstances.toArray();
        const dropZones = dropInstances.map(d => d.element.nativeElement);
        const item = groups[0][1];
        const initialRect = item.element.nativeElement.getBoundingClientRect();
        const targetRect = groups[1][2].element.nativeElement.getBoundingClientRect();

        // Change the `connectedTo` so the containers are only connected one-way.
        dropInstances[0].connectedTo = dropInstances[1];
        dropInstances[1].connectedTo = [];

        startDraggingViaMouse(fixture, item.element.nativeElement);
        fixture.detectChanges();

        const placeholder = dropZones[0].querySelector('.cdk-drag-placeholder')!;

        expect(placeholder).toBeTruthy();
        expect(dropZones[0].contains(placeholder))
            .toBe(true, 'Expected placeholder to be inside the first container.');

        dispatchMouseEvent(document, 'mousemove', targetRect.left + 1, targetRect.top + 1);
        fixture.detectChanges();

        expect(dropZones[1].contains(placeholder))
            .toBe(true, 'Expected placeholder to be inside second container.');

        dispatchMouseEvent(document, 'mousemove', initialRect.left + 1, initialRect.top + 1);
        fixture.detectChanges();

        expect(dropZones[0].contains(placeholder))
            .toBe(true, 'Expected placeholder to be back inside first container.');

        dispatchMouseEvent(document, 'mouseup');
        fixture.detectChanges();

        expect(fixture.componentInstance.droppedSpy).not.toHaveBeenCalled();
    }));

    it('should not add child drop lists to the same group as their parents', fakeAsync(() => {
      const fixture = createComponent(NestedDropListGroups);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      expect(Array.from(component.group._items)).toEqual([component.listOne, component.listTwo]);
    }));

    it('should not be able to drop an element into a container that is under another element',
      fakeAsync(() => {
        const fixture = createComponent(ConnectedDropZones);
        fixture.detectChanges();

        const groups = fixture.componentInstance.groupedDragItems.slice();
        const element = groups[0][1].element.nativeElement;
        const dropInstances = fixture.componentInstance.dropInstances.toArray();
        const targetRect = groups[1][2].element.nativeElement.getBoundingClientRect();
        const coverElement = document.createElement('div');
        const targetGroupRect = dropInstances[1].element.nativeElement.getBoundingClientRect();

        // Add an extra element that covers the target container.
        fixture.nativeElement.appendChild(coverElement);
        extendStyles(coverElement.style, {
          position: 'fixed',
          top: targetGroupRect.top + 'px',
          left: targetGroupRect.left + 'px',
          bottom: targetGroupRect.bottom + 'px',
          right: targetGroupRect.right + 'px',
          background: 'orange'
        });

        dragElementViaMouse(fixture, element, targetRect.left + 1, targetRect.top + 1);
        flush();
        fixture.detectChanges();

        const event = fixture.componentInstance.droppedSpy.calls.mostRecent().args[0];

        expect(event).toBeTruthy();
        expect(event).toEqual({
          previousIndex: 1,
          currentIndex: 1,
          item: groups[0][1],
          container: dropInstances[0],
          previousContainer: dropInstances[0],
          isPointerOverContainer: false
        });
      }));

      it('should set a class when a container can receive an item', fakeAsync(() => {
        const fixture = createComponent(ConnectedDropZones);
        fixture.detectChanges();

        const dropZones = fixture.componentInstance.dropInstances.map(d => d.element.nativeElement);
        const item = fixture.componentInstance.groupedDragItems[0][1];

        expect(dropZones.every(c => !c.classList.contains('cdk-drop-list-receiving')))
            .toBe(true, 'Expected neither of the containers to have the class.');

        startDraggingViaMouse(fixture, item.element.nativeElement);
        fixture.detectChanges();

        expect(dropZones[0].classList).not.toContain('cdk-drop-list-receiving',
            'Expected source container not to have the receiving class.');

        expect(dropZones[1].classList).toContain('cdk-drop-list-receiving',
            'Expected target container to have the receiving class.');
      }));

      it('should toggle the `receiving` class when the item enters a new list', fakeAsync(() => {
        const fixture = createComponent(ConnectedDropZones);
        fixture.detectChanges();

        const groups = fixture.componentInstance.groupedDragItems;
        const dropZones = fixture.componentInstance.dropInstances.map(d => d.element.nativeElement);
        const item = groups[0][1];
        const targetRect = groups[1][2].element.nativeElement.getBoundingClientRect();

        expect(dropZones.every(c => !c.classList.contains('cdk-drop-list-receiving')))
            .toBe(true, 'Expected neither of the containers to have the class.');

        startDraggingViaMouse(fixture, item.element.nativeElement);

        expect(dropZones[0].classList).not.toContain('cdk-drop-list-receiving',
            'Expected source container not to have the receiving class.');

        expect(dropZones[1].classList).toContain('cdk-drop-list-receiving',
            'Expected target container to have the receiving class.');

        dispatchMouseEvent(document, 'mousemove', targetRect.left + 1, targetRect.top + 1);
        fixture.detectChanges();

        expect(dropZones[0].classList).toContain('cdk-drop-list-receiving',
            'Expected old container not to have the receiving class after exiting.');

        expect(dropZones[1].classList).not.toContain('cdk-drop-list-receiving',
            'Expected new container not to have the receiving class after entering.');
      }));

    it('should be able to move the item over an intermediate container before ' +
      'dropping it into the final one', fakeAsync(() => {
        const fixture = createComponent(ConnectedDropZones);
        fixture.detectChanges();

        const dropInstances = fixture.componentInstance.dropInstances.toArray();
        dropInstances[0].connectedTo = [dropInstances[1], dropInstances[2]];
        dropInstances[1].connectedTo = [];
        dropInstances[2].connectedTo = [];
        fixture.detectChanges();

        const groups = fixture.componentInstance.groupedDragItems;
        const dropZones = dropInstances.map(d => d.element.nativeElement);
        const item = groups[0][1];
        const intermediateRect = dropZones[1].getBoundingClientRect();
        const finalRect = dropZones[2].getBoundingClientRect();

        startDraggingViaMouse(fixture, item.element.nativeElement);

        const placeholder = dropZones[0].querySelector('.cdk-drag-placeholder')!;

        expect(placeholder).toBeTruthy();
        expect(dropZones[0].contains(placeholder))
            .toBe(true, 'Expected placeholder to be inside the first container.');

        dispatchMouseEvent(document, 'mousemove',
            intermediateRect.left + 1, intermediateRect.top + 1);
        fixture.detectChanges();

        expect(dropZones[1].contains(placeholder))
            .toBe(true, 'Expected placeholder to be inside second container.');

        dispatchMouseEvent(document, 'mousemove', finalRect.left + 1, finalRect.top + 1);
        fixture.detectChanges();

        expect(dropZones[2].contains(placeholder))
            .toBe(true, 'Expected placeholder to be inside third container.');

        dispatchMouseEvent(document, 'mouseup');
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        const event = fixture.componentInstance.droppedSpy.calls.mostRecent().args[0];

        expect(event).toBeTruthy();
        expect(event).toEqual(jasmine.objectContaining({
          previousIndex: 1,
          currentIndex: 0,
          item: groups[0][1],
          container: dropInstances[2],
          previousContainer: dropInstances[0],
          isPointerOverContainer: false
        }));

      }));

    it('should return the item to its initial position, if sorting in the source container ' +
      'was disabled', fakeAsync(() => {
        const fixture = createComponent(ConnectedDropZones);
        fixture.detectChanges();

        const groups = fixture.componentInstance.groupedDragItems;
        const dropZones = fixture.componentInstance.dropInstances.map(d => d.element.nativeElement);
        const item = groups[0][1];
        const targetRect = groups[1][2].element.nativeElement.getBoundingClientRect();

        fixture.componentInstance.dropInstances.first.sortingDisabled = true;
        startDraggingViaMouse(fixture, item.element.nativeElement);

        const placeholder = dropZones[0].querySelector('.cdk-drag-placeholder')!;

        expect(placeholder).toBeTruthy();
        expect(dropZones[0].contains(placeholder))
            .toBe(true, 'Expected placeholder to be inside the first container.');
        expect(getElementIndexByPosition(placeholder, 'top'))
            .toBe(1, 'Expected placeholder to be at item index.');

        dispatchMouseEvent(document, 'mousemove', targetRect.left + 1, targetRect.top + 1);
        fixture.detectChanges();

        expect(dropZones[1].contains(placeholder))
            .toBe(true, 'Expected placeholder to be inside second container.');
        expect(getElementIndexByPosition(placeholder, 'top'))
            .toBe(3, 'Expected placeholder to be at the target index.');

        const firstInitialSiblingRect = groups[0][0].element
            .nativeElement.getBoundingClientRect();

        // Return the item to an index that is different from the initial one.
        dispatchMouseEvent(document, 'mousemove', firstInitialSiblingRect.left + 1,
            firstInitialSiblingRect.top + 1);
        fixture.detectChanges();

        expect(dropZones[0].contains(placeholder))
            .toBe(true, 'Expected placeholder to be back inside first container.');
        expect(getElementIndexByPosition(placeholder, 'top'))
            .toBe(1, 'Expected placeholder to be back at the initial index.');

        dispatchMouseEvent(document, 'mouseup');
        fixture.detectChanges();

        expect(fixture.componentInstance.droppedSpy).not.toHaveBeenCalled();
      }));

  });

});

@Component({
  template: `
    <div class="wrapper" style="width: 200px; height: 200px; background: green;">
      <div
        cdkDrag
        [cdkDragBoundary]="boundarySelector"
        [cdkDragStartDelay]="dragStartDelay"
        [cdkDragConstrainPosition]="constrainPosition"
        (cdkDragStarted)="startedSpy($event)"
        (cdkDragReleased)="releasedSpy($event)"
        (cdkDragEnded)="endedSpy($event)"
        #dragElement
        style="width: 100px; height: 100px; background: red;"></div>
    </div>
  `
})
class StandaloneDraggable {
  @ViewChild('dragElement') dragElement: ElementRef<HTMLElement>;
  @ViewChild(CdkDrag) dragInstance: CdkDrag;
  startedSpy = jasmine.createSpy('started spy');
  endedSpy = jasmine.createSpy('ended spy');
  releasedSpy = jasmine.createSpy('released spy');
  boundarySelector: string;
  dragStartDelay: number;
  constrainPosition: (point: Point) => Point;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div cdkDrag #dragElement style="width: 100px; height: 100px; background: red;"></div>
  `
})
class StandaloneDraggableWithOnPush {
  @ViewChild('dragElement') dragElement: ElementRef<HTMLElement>;
  @ViewChild(CdkDrag) dragInstance: CdkDrag;
}

@Component({
  template: `
    <svg><g
      cdkDrag
      #dragElement>
      <circle fill="red" r="50" cx="50" cy="50"/>
    </g></svg>
  `
})
class StandaloneDraggableSvg {
  @ViewChild('dragElement') dragElement: ElementRef<SVGElement>;
}

@Component({
  template: `
    <div #dragElement cdkDrag
      style="width: 100px; height: 100px; background: red; position: relative">
      <div #handleElement cdkDragHandle style="width: 10px; height: 10px; background: green;"></div>
    </div>
  `
})
class StandaloneDraggableWithHandle {
  @ViewChild('dragElement') dragElement: ElementRef<HTMLElement>;
  @ViewChild('handleElement') handleElement: ElementRef<HTMLElement>;
  @ViewChild(CdkDrag) dragInstance: CdkDrag;
  @ViewChild(CdkDragHandle) handleInstance: CdkDragHandle;
}

@Component({
  template: `
    <div #dragElement cdkDrag
      style="width: 100px; height: 100px; background: red; position: relative">
      <div
        #handleElement
        *ngIf="showHandle"
        cdkDragHandle style="width: 10px; height: 10px; background: green;"></div>
    </div>
  `
})
class StandaloneDraggableWithDelayedHandle {
  @ViewChild('dragElement') dragElement: ElementRef<HTMLElement>;
  @ViewChild('handleElement') handleElement: ElementRef<HTMLElement>;
  showHandle = false;
}

@Component({
  template: `
    <div #dragElement cdkDrag
      style="width: 100px; height: 100px; background: red; position: relative">

      <passthrough-component>
        <div
          #handleElement
          cdkDragHandle
          style="width: 10px; height: 10px; background: green;"></div>
      </passthrough-component>
    </div>
  `
})
class StandaloneDraggableWithIndirectHandle {
  @ViewChild('dragElement') dragElement: ElementRef<HTMLElement>;
  @ViewChild('handleElement') handleElement: ElementRef<HTMLElement>;
}


@Component({
  encapsulation: ViewEncapsulation.None,
  styles: [`
    .cdk-drag-handle {
      position: absolute;
      top: 0;
      background: green;
      width: 10px;
      height: 10px;
    }
  `],
  template: `
    <div #dragElement cdkDrag
      style="width: 100px; height: 100px; background: red; position: relative">
      <div cdkDragHandle style="left: 0;"></div>
      <div cdkDragHandle style="right: 0;"></div>
    </div>
  `
})
class StandaloneDraggableWithMultipleHandles {
  @ViewChild('dragElement') dragElement: ElementRef<HTMLElement>;
  @ViewChildren(CdkDragHandle) handles: QueryList<CdkDragHandle>;
}

const DROP_ZONE_FIXTURE_TEMPLATE = `
  <div
    cdkDropList
    style="width: 100px; background: pink;"
    [id]="dropZoneId"
    [cdkDropListData]="items"
    (cdkDropListSorted)="sortedSpy($event)"
    (cdkDropListDropped)="droppedSpy($event)">
    <div
      *ngFor="let item of items"
      cdkDrag
      [cdkDragData]="item"
      [cdkDragBoundary]="boundarySelector"
      [style.height.px]="item.height"
      [style.margin-bottom.px]="item.margin"
      style="width: 100%; background: red;">{{item.value}}</div>
  </div>
`;

@Component({template: DROP_ZONE_FIXTURE_TEMPLATE})
class DraggableInDropZone {
  @ViewChildren(CdkDrag) dragItems: QueryList<CdkDrag>;
  @ViewChild(CdkDropList) dropInstance: CdkDropList;
  items = [
    {value: 'Zero', height: ITEM_HEIGHT, margin: 0},
    {value: 'One', height: ITEM_HEIGHT, margin: 0},
    {value: 'Two', height: ITEM_HEIGHT, margin: 0},
    {value: 'Three', height: ITEM_HEIGHT, margin: 0}
  ];
  dropZoneId = 'items';
  boundarySelector: string;
  sortedSpy = jasmine.createSpy('sorted spy');
  droppedSpy = jasmine.createSpy('dropped spy').and.callFake((event: CdkDragDrop<string[]>) => {
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
  });
}

@Component({
  template: DROP_ZONE_FIXTURE_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DraggableInOnPushDropZone extends DraggableInDropZone {}


@Component({
  encapsulation: ViewEncapsulation.None,
  styles: [
  // Use inline blocks here to avoid flexbox issues and not to have to flip floats in rtl.
  `
    .cdk-drop-list {
      display: block;
      width: 500px;
      background: pink;
      font-size: 0;
    }

    .cdk-drag {
      height: ${ITEM_HEIGHT}px;
      background: red;
      display: inline-block;
    }
  `],
  template: `
    <div
      cdkDropList
      cdkDropListOrientation="horizontal"
      [cdkDropListData]="items"
      (cdkDropListDropped)="droppedSpy($event)">
      <div
        *ngFor="let item of items"
        [style.width.px]="item.width"
        [style.margin-right.px]="item.margin"
        cdkDrag>{{item.value}}</div>
    </div>
  `
})
class DraggableInHorizontalDropZone {
  @ViewChildren(CdkDrag) dragItems: QueryList<CdkDrag>;
  @ViewChild(CdkDropList) dropInstance: CdkDropList;
  items = [
    {value: 'Zero', width: ITEM_WIDTH, margin: 0},
    {value: 'One', width: ITEM_WIDTH, margin: 0},
    {value: 'Two', width: ITEM_WIDTH, margin: 0},
    {value: 'Three', width: ITEM_WIDTH, margin: 0}
  ];
  droppedSpy = jasmine.createSpy('dropped spy').and.callFake((event: CdkDragDrop<string[]>) => {
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
  });
}

@Component({
  template: `
    <div cdkDropList style="width: 100px; background: pink;">
      <div
        *ngFor="let item of items"
        cdkDrag
        [cdkDragConstrainPosition]="constrainPosition"
        [cdkDragBoundary]="boundarySelector"
        style="width: 100%; height: ${ITEM_HEIGHT}px; background: red;">
          {{item}}

          <ng-container *ngIf="renderCustomPreview">
            <div
              class="custom-preview"
              style="width: 50px; height: 50px; background: purple;"
              *cdkDragPreview>Custom preview</div>
          </ng-container>
      </div>
    </div>
  `
})
class DraggableInDropZoneWithCustomPreview {
  @ViewChild(CdkDropList) dropInstance: CdkDropList;
  @ViewChildren(CdkDrag) dragItems: QueryList<CdkDrag>;
  items = ['Zero', 'One', 'Two', 'Three'];
  boundarySelector: string;
  renderCustomPreview = true;
  constrainPosition: (point: Point) => Point;
}


@Component({
  template: `
    <div cdkDropList style="width: 100px; background: pink;">
      <div *ngFor="let item of items" cdkDrag
        style="width: 100%; height: ${ITEM_HEIGHT}px; background: red;">
          {{item}}
          <ng-container *ngIf="renderPlaceholder">
            <div class="custom-placeholder" *cdkDragPlaceholder>Custom placeholder</div>
          </ng-container>
      </div>
    </div>
  `
})
class DraggableInDropZoneWithCustomPlaceholder {
  @ViewChildren(CdkDrag) dragItems: QueryList<CdkDrag>;
  items = ['Zero', 'One', 'Two', 'Three'];
  renderPlaceholder = true;
}


@Component({
  encapsulation: ViewEncapsulation.None,
  styles: [`
    .cdk-drop-list {
      display: block;
      width: 100px;
      min-height: ${ITEM_HEIGHT}px;
      background: hotpink;
    }

    .cdk-drag {
      display: block;
      height: ${ITEM_HEIGHT}px;
      background: red;
    }
  `],
  template: `
    <div
      cdkDropList
      #todoZone="cdkDropList"
      [cdkDropListData]="todo"
      [cdkDropListConnectedTo]="[doneZone]"
      (cdkDropListDropped)="droppedSpy($event)">
      <div [cdkDragData]="item" *ngFor="let item of todo" cdkDrag>{{item}}</div>
    </div>

    <div
      cdkDropList
      #doneZone="cdkDropList"
      [cdkDropListData]="done"
      [cdkDropListConnectedTo]="[todoZone]"
      (cdkDropListDropped)="droppedSpy($event)">
      <div [cdkDragData]="item" *ngFor="let item of done" cdkDrag>{{item}}</div>
    </div>

    <div
      cdkDropList
      #extraZone="cdkDropList"
      [cdkDropListData]="extra"
      (cdkDropListDropped)="droppedSpy($event)">
      <div [cdkDragData]="item" *ngFor="let item of extra" cdkDrag>{{item}}</div>
    </div>
  `
})
class ConnectedDropZones implements AfterViewInit {
  @ViewChildren(CdkDrag) rawDragItems: QueryList<CdkDrag>;
  @ViewChildren(CdkDropList) dropInstances: QueryList<CdkDropList>;

  groupedDragItems: CdkDrag[][] = [];
  todo = ['Zero', 'One', 'Two', 'Three'];
  done = ['Four', 'Five', 'Six'];
  extra = [];
  droppedSpy = jasmine.createSpy('dropped spy');

  ngAfterViewInit() {
    this.dropInstances.forEach((dropZone, index) => {
      if (!this.groupedDragItems[index]) {
        this.groupedDragItems.push([]);
      }

      this.groupedDragItems[index].push(...dropZone._draggables.toArray());
    });
  }
}

@Component({
  encapsulation: ViewEncapsulation.None,
  styles: [`
    .cdk-drop-list {
      display: block;
      width: 100px;
      min-height: ${ITEM_HEIGHT}px;
      background: hotpink;
    }

    .cdk-drag {
      display: block;
      height: ${ITEM_HEIGHT}px;
      background: red;
    }
  `],
  template: `
    <div cdkDropListGroup [cdkDropListGroupDisabled]="groupDisabled">
      <div
        cdkDropList
        [cdkDropListData]="todo"
        (cdkDropListDropped)="droppedSpy($event)">
        <div [cdkDragData]="item" *ngFor="let item of todo" cdkDrag>{{item}}</div>
      </div>

      <div
        cdkDropList
        [cdkDropListData]="done"
        (cdkDropListDropped)="droppedSpy($event)">
        <div [cdkDragData]="item" *ngFor="let item of done" cdkDrag>{{item}}</div>
      </div>
    </div>
  `
})
class ConnectedDropZonesViaGroupDirective extends ConnectedDropZones {
  groupDisabled = false;
}


@Component({
  template: `
    <div #dragRoot class="alternate-root" style="width: 200px; height: 200px; background: hotpink">
      <div
        cdkDrag
        [cdkDragRootElement]="rootElementSelector"
        #dragElement
        style="width: 100px; height: 100px; background: red;"></div>
    </div>
  `
})
class DraggableWithAlternateRoot {
  @ViewChild('dragElement') dragElement: ElementRef<HTMLElement>;
  @ViewChild('dragRoot') dragRoot: ElementRef<HTMLElement>;
  @ViewChild(CdkDrag) dragInstance: CdkDrag;
  rootElementSelector: string;
}


@Component({
  encapsulation: ViewEncapsulation.None,
  styles: [`
    .cdk-drop-list {
      display: block;
      width: 100px;
      min-height: ${ITEM_HEIGHT}px;
      background: hotpink;
    }

    .cdk-drag {
      display: block;
      height: ${ITEM_HEIGHT}px;
      background: red;
    }
  `],
  template: `
    <div
      cdkDropList
      #todoZone="cdkDropList"
      [cdkDropListConnectedTo]="[doneZone]"
      (cdkDropListDropped)="droppedSpy($event)">
      <div cdkDrag>One</div>
    </div>

    <div
      cdkDropList
      #doneZone="cdkDropList"
      [cdkDropListConnectedTo]="[todoZone]"
      (cdkDropListDropped)="droppedSpy($event)">
      <div cdkDrag>Two</div>
    </div>
  `
})
class ConnectedDropZonesWithSingleItems {
  @ViewChildren(CdkDrag) dragItems: QueryList<CdkDrag>;
  @ViewChildren(CdkDropList) dropInstances: QueryList<CdkDropList>;

  droppedSpy = jasmine.createSpy('dropped spy');
}

@Component({
  template: `
    <div cdkDropListGroup #group="cdkDropListGroup">
      <div cdkDropList #listOne="cdkDropList">
        <div cdkDropList #listThree="cdkDropList"></div>
        <div cdkDropList #listFour="cdkDropList"></div>
      </div>

      <div cdkDropList #listTwo="cdkDropList"></div>
    </div>
  `
})
class NestedDropListGroups {
  @ViewChild('group') group: CdkDropListGroup<CdkDropList>;
  @ViewChild('listOne') listOne: CdkDropList;
  @ViewChild('listTwo') listTwo: CdkDropList;
}


@Component({
  template: `
    <ng-container cdkDrag></ng-container>
  `
})
class DraggableOnNgContainer {}


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div cdkDropList style="width: 100px; background: pink;">
      <div *ngFor="let item of items"
        cdkDrag
        [style.height.px]="item.height"
        style="width: 100%; background: red;">{{item.value}}</div>
    </div>
  `
})
class DraggableInDropZoneWithoutEvents {
  @ViewChildren(CdkDrag) dragItems: QueryList<CdkDrag>;
  @ViewChild(CdkDropList) dropInstance: CdkDropList;
  items = [
    {value: 'Zero', height: ITEM_HEIGHT},
    {value: 'One', height: ITEM_HEIGHT},
    {value: 'Two', height: ITEM_HEIGHT},
    {value: 'Three', height: ITEM_HEIGHT}
  ];
}

/**
 * Component that passes through whatever content is projected into it.
 * Used to test having drag elements being projected into a component.
 */
@Component({
  selector: 'passthrough-component',
  template: '<ng-content></ng-content>'
})
class PassthroughComponent {}

/**
 * Drags an element to a position on the page using the mouse.
 * @param fixture Fixture on which to run change detection.
 * @param element Element which is being dragged.
 * @param x Position along the x axis to which to drag the element.
 * @param y Position along the y axis to which to drag the element.
 */
function dragElementViaMouse(fixture: ComponentFixture<any>,
    element: Element, x: number, y: number) {

  startDraggingViaMouse(fixture, element);

  dispatchMouseEvent(document, 'mousemove', x, y);
  fixture.detectChanges();

  dispatchMouseEvent(document, 'mouseup', x, y);
  fixture.detectChanges();
}

/**
 * Dispatches the events for starting a drag sequence.
 * @param fixture Fixture on which to run change detection.
 * @param element Element on which to dispatch the events.
 * @param x Position along the x axis to which to drag the element.
 * @param y Position along the y axis to which to drag the element.
 */
function startDraggingViaMouse(fixture: ComponentFixture<any>,
  element: Element, x?: number, y?: number) {
  dispatchMouseEvent(element, 'mousedown', x, y);
  fixture.detectChanges();

  dispatchMouseEvent(document, 'mousemove', x, y);
  fixture.detectChanges();
}

/**
 * Drags an element to a position on the page using a touch device.
 * @param fixture Fixture on which to run change detection.
 * @param element Element which is being dragged.
 * @param x Position along the x axis to which to drag the element.
 * @param y Position along the y axis to which to drag the element.
 */
function dragElementViaTouch(fixture: ComponentFixture<any>,
    element: Element, x: number, y: number) {

  dispatchTouchEvent(element, 'touchstart');
  fixture.detectChanges();

  dispatchTouchEvent(document, 'touchmove');
  fixture.detectChanges();

  dispatchTouchEvent(document, 'touchmove', x, y);
  fixture.detectChanges();

  dispatchTouchEvent(document, 'touchend', x, y);
  fixture.detectChanges();
}

/** Gets the index of an element among its siblings, based on their position on the page. */
function getElementIndexByPosition(element: Element, direction: 'top' | 'left') {
  return getElementSibligsByPosition(element, direction).indexOf(element);
}

/** Gets the siblings of an element, sorted by their position on the page. */
function getElementSibligsByPosition(element: Element, direction: 'top' | 'left') {
  return element.parentElement ? Array.from(element.parentElement.children).sort((a, b) => {
    return a.getBoundingClientRect()[direction] - b.getBoundingClientRect()[direction];
  }) : [];
}

/**
 * Adds a large element to the page in order to make it scrollable.
 * @returns Function that should be used to clean up after the test is done.
 */
function makePageScrollable() {
  const veryTallElement = document.createElement('div');
  veryTallElement.style.width = '100%';
  veryTallElement.style.height = '2000px';
  document.body.appendChild(veryTallElement);

  return () => {
    scrollTo(0, 0);
    veryTallElement.parentNode!.removeChild(veryTallElement);
  };
}

/**
 * Asserts that sorting an element down works correctly.
 * @param fixture Fixture against which to run the assertions.
 * @param items Array of items against which to test sorting.
 */
function assertDownwardSorting(fixture: ComponentFixture<any>, items: Element[]) {
  const draggedItem = items[0];
  const {top, left} = draggedItem.getBoundingClientRect();

  startDraggingViaMouse(fixture, draggedItem, left, top);

  const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;

  // Drag over each item one-by-one going downwards.
  for (let i = 0; i < items.length; i++) {
    const elementRect = items[i].getBoundingClientRect();

    // Add a few pixels to the top offset so we get some overlap.
    dispatchMouseEvent(document, 'mousemove', elementRect.left, elementRect.top + 5);
    fixture.detectChanges();
    expect(getElementIndexByPosition(placeholder, 'top')).toBe(i);
  }

  dispatchMouseEvent(document, 'mouseup');
  fixture.detectChanges();
  flush();
}

/**
 * Asserts that sorting an element up works correctly.
 * @param fixture Fixture against which to run the assertions.
 * @param items Array of items against which to test sorting.
 */
function assertUpwardSorting(fixture: ComponentFixture<any>, items: Element[]) {
  const draggedItem = items[items.length - 1];
  const {top, left} = draggedItem.getBoundingClientRect();

  startDraggingViaMouse(fixture, draggedItem, left, top);

  const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;

  // Drag over each item one-by-one going upwards.
  for (let i = items.length - 1; i > -1; i--) {
    const elementRect = items[i].getBoundingClientRect();

    // Remove a few pixels from the bottom offset so we get some overlap.
    dispatchMouseEvent(document, 'mousemove', elementRect.left, elementRect.bottom - 5);
    fixture.detectChanges();
    expect(getElementIndexByPosition(placeholder, 'top')).toBe(i);
  }

  dispatchMouseEvent(document, 'mouseup');
  fixture.detectChanges();
  flush();
}
