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
} from '@angular/core';
import {TestBed, ComponentFixture, fakeAsync, flush, tick} from '@angular/core/testing';
import {DragDropModule} from './drag-drop-module';
import {dispatchMouseEvent, dispatchTouchEvent} from '@angular/cdk/testing';
import {Directionality} from '@angular/cdk/bidi';
import {CdkDrag} from './drag';
import {CdkDragDrop} from './drag-events';
import {moveItemInArray} from './drag-utils';
import {CdkDrop} from './drop';
import {CdkDragHandle} from './drag-handle';

const ITEM_HEIGHT = 25;
const ITEM_WIDTH = 75;

describe('CdkDrag', () => {
  function createComponent<T>(componentType: Type<T>, providers: Provider[] = []):
    ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [DragDropModule],
      declarations: [componentType],
      providers,
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
    });

    it('should dispatch an event when the user has started dragging', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();

      dispatchMouseEvent(fixture.componentInstance.dragElement.nativeElement, 'mousedown');
      fixture.detectChanges();

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

  });

  describe('in a drop container', () => {
    it('should be able to attach data to the drop container', () => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();

      expect(fixture.componentInstance.dropInstance.data).toBe(fixture.componentInstance.items);
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

      expect(dropZone.element.nativeElement.classList).not.toContain('cdk-drop-dragging');

      dispatchMouseEvent(item, 'mousedown');
      fixture.detectChanges();

      expect(dropZone.element.nativeElement.classList).toContain('cdk-drop-dragging');

      dispatchMouseEvent(document, 'mouseup');
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

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
        previousContainer: fixture.componentInstance.dropInstance
      });

      expect(dragItems.map(drag => drag.element.nativeElement.textContent!.trim()))
          .toEqual(['One', 'Two', 'Zero', 'Three']);
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
        previousContainer: fixture.componentInstance.dropInstance
      });

      expect(dragItems.map(drag => drag.element.nativeElement.textContent!.trim()))
          .toEqual(['One', 'Two', 'Zero', 'Three']);
    }));

    it('should create a preview element while the item is dragged', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();
      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;
      const itemRect = item.getBoundingClientRect();
      const initialParent = item.parentNode;

      dispatchMouseEvent(item, 'mousedown');
      fixture.detectChanges();

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

      dispatchMouseEvent(document, 'mouseup');
      fixture.detectChanges();
      flush();

      expect(item.parentNode)
          .toBe(initialParent, 'Expected element to be moved back into its old parent');
      expect(item.style.display).toBeFalsy('Expected element to be visible');
      expect(preview.parentNode).toBeFalsy('Expected preview to be removed from the DOM');
    }));

    it('should pass the proper direction to the preview in rtl', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone, [{
        provide: Directionality,
        useValue: ({value: 'rtl'})
      }]);

      fixture.detectChanges();

      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;
      dispatchMouseEvent(item, 'mousedown');
      fixture.detectChanges();

      expect(document.querySelector('.cdk-drag-preview')!.getAttribute('dir'))
          .toBe('rtl', 'Expected preview element to inherit the directionality.');
    }));

    it('should remove the preview if its `transitionend` event timed out', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();
      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;

      dispatchMouseEvent(item, 'mousedown');
      fixture.detectChanges();

      const preview = document.querySelector('.cdk-drag-preview')! as HTMLElement;

      // Add a duration since the tests won't include one.
      preview.style.transitionDuration = '500ms';

      // Move somewhere so the draggable doesn't exit immediately.
      dispatchTouchEvent(document, 'mousemove', 50, 50);
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

    it('should create a placeholder element while the item is dragged', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();
      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;
      const initialParent = item.parentNode;

      dispatchMouseEvent(item, 'mousedown');
      fixture.detectChanges();

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

      dispatchMouseEvent(draggedItem, 'mousedown', left, top);
      fixture.detectChanges();

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

      dispatchMouseEvent(draggedItem, 'mousedown', left, top);
      fixture.detectChanges();

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

    it('should clean up the preview element if the item is destroyed mid-drag', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();
      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;

      dispatchMouseEvent(item, 'mousedown');
      fixture.detectChanges();

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

      dispatchMouseEvent(item, 'mousedown');
      fixture.detectChanges();

      const preview = document.querySelector('.cdk-drag-preview')! as HTMLElement;

      expect(preview).toBeTruthy();
      expect(preview.classList).toContain('custom-preview');
      expect(preview.textContent!.trim()).toContain('Custom preview');
    }));

    it('should position custom previews next to the pointer', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZoneWithCustomPreview);
      fixture.detectChanges();
      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;

      dispatchMouseEvent(item, 'mousedown', 50, 50);
      fixture.detectChanges();

      const preview = document.querySelector('.cdk-drag-preview')! as HTMLElement;

      expect(preview.style.transform).toBe('translate3d(50px, 50px, 0px)');
    }));

    it('should be able to customize the placeholder', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZoneWithCustomPlaceholder);
      fixture.detectChanges();
      const item = fixture.componentInstance.dragItems.toArray()[1].element.nativeElement;

      dispatchMouseEvent(item, 'mousedown');
      fixture.detectChanges();

      const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;

      expect(placeholder).toBeTruthy();
      expect(placeholder.classList).toContain('custom-placeholder');
      expect(placeholder.textContent!.trim()).toContain('Custom placeholder');
    }));

    it('should clear the `transform` value from siblings when item is dropped`', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();

      const dragItems = fixture.componentInstance.dragItems;
      const firstItem = dragItems.first;
      const thirdItem = dragItems.toArray()[2].element.nativeElement;
      const thirdItemRect = thirdItem.getBoundingClientRect();

      dispatchMouseEvent(firstItem.element.nativeElement, 'mousedown');
      fixture.detectChanges();

      dispatchMouseEvent(document, 'mousemove', thirdItemRect.left + 1, thirdItemRect.top + 1);
      fixture.detectChanges();

      expect(thirdItem.style.transform).toBeTruthy();

      dispatchMouseEvent(document, 'mouseup');
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      expect(thirdItem.style.transform).toBeFalsy();
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
          previousContainer: fixture.componentInstance.dropInstances.first
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

      dispatchMouseEvent(item.element.nativeElement, 'mousedown');
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
        previousContainer: dropInstances[0]
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
          previousContainer: dropInstances[0]
        });
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

      dispatchMouseEvent(item.element.nativeElement, 'mousedown');
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
        previousContainer: dropInstances[0]
      });
    }));

  });

});

@Component({
  template: `
    <div
      cdkDrag
      (cdkDragStarted)="startedSpy($event)"
      (cdkDragEnded)="endedSpy($event)"
      #dragElement
      style="width: 100px; height: 100px; background: red;"></div>
  `
})
export class StandaloneDraggable {
  @ViewChild('dragElement') dragElement: ElementRef<HTMLElement>;
  @ViewChild(CdkDrag) dragInstance: CdkDrag;
  startedSpy = jasmine.createSpy('started spy');
  endedSpy = jasmine.createSpy('ended spy');
}

@Component({
  template: `
    <div #dragElement cdkDrag
      style="width: 100px; height: 100px; background: red; position: relative">
      <div #handleElement cdkDragHandle style="width: 10px; height: 10px; background: green;"></div>
    </div>
  `
})
export class StandaloneDraggableWithHandle {
  @ViewChild('dragElement') dragElement: ElementRef<HTMLElement>;
  @ViewChild('handleElement') handleElement: ElementRef<HTMLElement>;
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
export class StandaloneDraggableWithDelayedHandle {
  @ViewChild('dragElement') dragElement: ElementRef<HTMLElement>;
  @ViewChild('handleElement') handleElement: ElementRef<HTMLElement>;
  showHandle = false;
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
export class StandaloneDraggableWithMultipleHandles {
  @ViewChild('dragElement') dragElement: ElementRef<HTMLElement>;
  @ViewChildren(CdkDragHandle) handles: QueryList<CdkDragHandle>;
}

@Component({
  template: `
    <cdk-drop
      style="display: block; width: 100px; background: pink;"
      [id]="dropZoneId"
      [data]="items"
      (dropped)="droppedSpy($event)">
      <div
        *ngFor="let item of items"
        cdkDrag
        [data]="item"
        style="width: 100%; height: ${ITEM_HEIGHT}px; background: red;">{{item}}</div>
    </cdk-drop>
  `
})
export class DraggableInDropZone {
  @ViewChildren(CdkDrag) dragItems: QueryList<CdkDrag>;
  @ViewChild(CdkDrop) dropInstance: CdkDrop;
  items = ['Zero', 'One', 'Two', 'Three'];
  dropZoneId = 'items';
  droppedSpy = jasmine.createSpy('dropped spy').and.callFake((event: CdkDragDrop<string[]>) => {
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
  });
}


@Component({
  encapsulation: ViewEncapsulation.None,
  styles: [
  // Use inline blocks here to avoid flexbox issues and not to have to flip floats in rtl.
  `
    .cdk-drop {
      display: block;
      width: 300px;
      background: pink;
      font-size: 0;
    }

    .cdk-drag {
      width: ${ITEM_WIDTH}px;
      height: ${ITEM_HEIGHT}px;
      background: red;
      display: inline-block;
    }
  `],
  template: `
    <cdk-drop
      orientation="horizontal"
      [data]="items"
      (dropped)="droppedSpy($event)">
      <div *ngFor="let item of items" cdkDrag>{{item}}</div>
    </cdk-drop>
  `
})
export class DraggableInHorizontalDropZone {
  @ViewChildren(CdkDrag) dragItems: QueryList<CdkDrag>;
  @ViewChild(CdkDrop) dropInstance: CdkDrop;
  items = ['Zero', 'One', 'Two', 'Three'];
  droppedSpy = jasmine.createSpy('dropped spy').and.callFake((event: CdkDragDrop<string[]>) => {
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
  });
}

@Component({
  template: `
    <cdk-drop style="display: block; width: 100px; background: pink;">
      <div *ngFor="let item of items" cdkDrag
        style="width: 100%; height: ${ITEM_HEIGHT}px; background: red;">
          {{item}}
          <div class="custom-preview" *cdkDragPreview>Custom preview</div>
      </div>
    </cdk-drop>
  `
})
export class DraggableInDropZoneWithCustomPreview {
  @ViewChildren(CdkDrag) dragItems: QueryList<CdkDrag>;
  items = ['Zero', 'One', 'Two', 'Three'];
}


@Component({
  template: `
    <cdk-drop style="display: block; width: 100px; background: pink;">
      <div *ngFor="let item of items" cdkDrag
        style="width: 100%; height: ${ITEM_HEIGHT}px; background: red;">
          {{item}}
          <div class="custom-placeholder" *cdkDragPlaceholder>Custom placeholder</div>
      </div>
    </cdk-drop>
  `
})
export class DraggableInDropZoneWithCustomPlaceholder {
  @ViewChildren(CdkDrag) dragItems: QueryList<CdkDrag>;
  items = ['Zero', 'One', 'Two', 'Three'];
}


@Component({
  encapsulation: ViewEncapsulation.None,
  styles: [`
    .cdk-drop {
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
    <cdk-drop
      #todoZone
      [data]="todo"
      [connectedTo]="[doneZone]"
      (dropped)="droppedSpy($event)">
      <div *ngFor="let item of todo" cdkDrag>{{item}}</div>
    </cdk-drop>

    <cdk-drop
      #doneZone
      [data]="done"
      [connectedTo]="[todoZone]"
      (dropped)="droppedSpy($event)">
      <div *ngFor="let item of done" cdkDrag>{{item}}</div>
    </cdk-drop>
  `
})
export class ConnectedDropZones implements AfterViewInit {
  @ViewChildren(CdkDrag) rawDragItems: QueryList<CdkDrag>;
  @ViewChildren(CdkDrop) dropInstances: QueryList<CdkDrop>;

  groupedDragItems: CdkDrag[][] = [];
  todo = ['Zero', 'One', 'Two', 'Three'];
  done = ['Four', 'Five', 'Six'];
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



/**
 * Drags an element to a position on the page using the mouse.
 * @param fixture Fixture on which to run change detection.
 * @param element Element which is being dragged.
 * @param x Position along the x axis to which to drag the element.
 * @param y Position along the y axis to which to drag the element.
 */
function dragElementViaMouse(fixture: ComponentFixture<any>,
    element: HTMLElement, x: number, y: number) {

  dispatchMouseEvent(element, 'mousedown');
  fixture.detectChanges();

  dispatchMouseEvent(document, 'mousemove', x, y);
  fixture.detectChanges();

  dispatchMouseEvent(document, 'mouseup');
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
    element: HTMLElement, x: number, y: number) {

  dispatchTouchEvent(element, 'touchstart');
  fixture.detectChanges();

  dispatchTouchEvent(document, 'touchmove', x, y);
  fixture.detectChanges();

  dispatchTouchEvent(document, 'touchend');
  fixture.detectChanges();
}

/** Gets the index of an element among its siblings, based on their position on the page. */
function getElementIndexByPosition(element: HTMLElement, direction: 'top' | 'left') {
  if (!element.parentElement) {
    return -1;
  }

  return Array.from(element.parentElement.children)
      .sort((a, b) => a.getBoundingClientRect()[direction] - b.getBoundingClientRect()[direction])
      .indexOf(element);
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

  dispatchMouseEvent(draggedItem, 'mousedown', left, top);
  fixture.detectChanges();

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

  dispatchMouseEvent(draggedItem, 'mousedown', left, top);
  fixture.detectChanges();

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
