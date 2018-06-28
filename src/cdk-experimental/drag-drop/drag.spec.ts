import {
  Component,
  Type,
  ViewChild,
  ElementRef,
  ViewChildren,
  QueryList,
  AfterViewInit,
} from '@angular/core';
import {TestBed, ComponentFixture, fakeAsync, flush} from '@angular/core/testing';
import {DragDropModule} from './drag-drop-module';
import {dispatchMouseEvent, dispatchTouchEvent} from '@angular/cdk/testing';
import {CdkDrag} from './drag';
import {CdkDragDrop} from './drag-events';
import {moveItemInArray, transferArrayItem} from './drag-utils';
import {CdkDrop} from './drop';

const ITEM_HEIGHT = 25;

describe('CdkDrag', () => {
  function createComponent<T>(componentType: Type<T>): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [DragDropModule],
      declarations: [componentType],
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

      expect(fixture.componentInstance.startedSpy).toHaveBeenCalledWith(jasmine.objectContaining({
        source: fixture.componentInstance.dragInstance
      }));
    }));

    it('should dispatch an event when the user has stopped dragging', fakeAsync(() => {
      const fixture = createComponent(StandaloneDraggable);
      fixture.detectChanges();

      dragElementViaMouse(fixture, fixture.componentInstance.dragElement.nativeElement, 5, 10);

      expect(fixture.componentInstance.endedSpy).toHaveBeenCalledWith(jasmine.objectContaining({
        source: fixture.componentInstance.dragInstance
      }));
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
  });

  describe('in a drop container', () => {
    it('should be able to attach data to the drop container', () => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();

      expect(fixture.componentInstance.dropInstance.data).toBe(fixture.componentInstance.items);
    });

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
      expect(fixture.componentInstance.droppedSpy).toHaveBeenCalledWith(jasmine.objectContaining({
        previousIndex: 0,
        currentIndex: 2,
        item: firstItem,
        container: fixture.componentInstance.dropInstance,
        previousContainer: fixture.componentInstance.dropInstance
      }));

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

      const items = fixture.componentInstance.dragItems.toArray();
      const draggedItem = items[0].element.nativeElement;
      const {top, left} = draggedItem.getBoundingClientRect();

      dispatchMouseEvent(draggedItem, 'mousedown', left, top);
      fixture.detectChanges();

      const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;

      // Drag over each item one-by-one going downwards.
      for (let i = 0; i < items.length; i++) {
        const elementRect = items[i].element.nativeElement.getBoundingClientRect();

        // Add a few pixels to the top offset so we get some overlap.
        dispatchMouseEvent(document, 'mousemove', elementRect.left, elementRect.top + 5);
        fixture.detectChanges();
        expect(getElementIndex(placeholder)).toBe(i);
      }

      dispatchMouseEvent(document, 'mouseup');
      fixture.detectChanges();
      flush();
    }));

    it('should move the placeholder as an item is being sorted up', fakeAsync(() => {
      const fixture = createComponent(DraggableInDropZone);
      fixture.detectChanges();

      const items = fixture.componentInstance.dragItems.toArray();
      const draggedItem = items[items.length - 1].element.nativeElement;
      const {top, left} = draggedItem.getBoundingClientRect();

      dispatchMouseEvent(draggedItem, 'mousedown', left, top);
      fixture.detectChanges();

      const placeholder = document.querySelector('.cdk-drag-placeholder')! as HTMLElement;

      // Drag over each item one-by-one going upwards.
      for (let i = items.length - 1; i > -1; i--) {
        const elementRect = items[i].element.nativeElement.getBoundingClientRect();

        // Remove a few pixels from the bottom offset so we get some overlap.
        dispatchMouseEvent(document, 'mousemove', elementRect.left, elementRect.bottom - 5);
        fixture.detectChanges();
        expect(getElementIndex(placeholder)).toBe(Math.min(i + 1, items.length - 1));
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

  });

  describe('in a connected drop container', () => {
    it('should dispatch the `dropped` event when an item has been dropped into a new container',
      fakeAsync(() => {
        const fixture = createComponent(ConnectedDropZones);
        fixture.detectChanges();

        // TODO
        // console.log(fixture.componentInstance.groupedDragItems.map(d => d.length));
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
  @ViewChild(CdkDrag) dragInstance: CdkDrag;
}


@Component({
  template: `
    <cdk-drop
      style="display: block; width: 100px; background: pink;"
      [data]="items"
      (dropped)="droppedSpy($event)">
      <div
        *ngFor="let item of items"
        cdkDrag
        style="width: 100%; height: ${ITEM_HEIGHT}px; background: red;">{{item}}</div>
    </cdk-drop>
  `
})
export class DraggableInDropZone {
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
  template: `
    <cdk-drop
      #todoZone
      style="display: block; width: 100px; background: pink;"
      [data]="todo"
      [connectedTo]="[doneZone]"
      (dropped)="droppedSpy($event)">
      <div
        *ngFor="let item of todo"
        cdkDrag
        style="width: 100%; height: ${ITEM_HEIGHT}px; background: red;">{{item}}</div>
    </cdk-drop>

    <cdk-drop
      #doneZone
      style="display: block; width: 100px; background: purple;"
      [data]="done"
      [connectedTo]="[todoZone]"
      (dropped)="droppedSpy($event)">
      <div
        *ngFor="let item of done"
        cdkDrag
        style="width: 100%; height: ${ITEM_HEIGHT}px; background: green;">{{item}}</div>
    </cdk-drop>
  `
})
export class ConnectedDropZones implements AfterViewInit {
  @ViewChildren(CdkDrag) rawDragItems: QueryList<CdkDrag>;
  @ViewChildren(CdkDrop) dropInstances: QueryList<CdkDrop>;

  groupedDragItems: CdkDrag[][] = [];

  todo = ['Zero', 'One', 'Two', 'Three'];
  done = ['Four', 'Five', 'Six'];

  droppedSpy = jasmine.createSpy('dropped spy').and.callFake((event: CdkDragDrop<string[]>) => {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
  });

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

/** Gets the index of a DOM element inside its parent. */
function getElementIndex(element: HTMLElement) {
  return element.parentElement ? Array.from(element.parentElement.children).indexOf(element) : -1;
}
