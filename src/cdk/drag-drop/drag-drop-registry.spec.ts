import {QueryList, ViewChildren, Component} from '@angular/core';
import {fakeAsync, TestBed, ComponentFixture, inject} from '@angular/core/testing';
import {
  createMouseEvent,
  dispatchMouseEvent,
  createTouchEvent,
  dispatchTouchEvent,
} from '@angular/cdk/testing';
import {DragDropRegistry} from './drag-drop-registry';
import {DragDropModule} from './drag-drop-module';
import {CdkDrag} from './drag';
import {CdkDrop} from './drop';

describe('DragDropRegistry', () => {
  let fixture: ComponentFixture<SimpleDropZone>;
  let testComponent: SimpleDropZone;
  let registry: DragDropRegistry<CdkDrag, CdkDrop>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [DragDropModule],
      declarations: [SimpleDropZone],
    }).compileComponents();

    fixture = TestBed.createComponent(SimpleDropZone);
    testComponent = fixture.componentInstance;
    fixture.detectChanges();

    inject([DragDropRegistry], (c: DragDropRegistry<CdkDrag, CdkDrop>) => {
      registry = c;
    })();
  }));

  afterEach(() => {
    registry.ngOnDestroy();
  });

  it('should be able to start dragging an item', () => {
    const firstItem = testComponent.dragItems.first;

    expect(registry.isDragging(firstItem)).toBe(false);
    registry.startDragging(firstItem, createMouseEvent('mousedown'));
    expect(registry.isDragging(firstItem)).toBe(true);
  });

  it('should be able to stop dragging an item', () => {
    const firstItem = testComponent.dragItems.first;

    registry.startDragging(firstItem, createMouseEvent('mousedown'));
    expect(registry.isDragging(firstItem)).toBe(true);

    registry.stopDragging(firstItem);
    expect(registry.isDragging(firstItem)).toBe(false);
  });

  it('should stop dragging an item if it is removed', () => {
    const firstItem = testComponent.dragItems.first;

    registry.startDragging(firstItem, createMouseEvent('mousedown'));
    expect(registry.isDragging(firstItem)).toBe(true);

    registry.removeDragItem(firstItem);
    expect(registry.isDragging(firstItem)).toBe(false);
  });

  it('should dispatch `mousemove` events after starting to drag via the mouse', () => {
    const spy = jasmine.createSpy('pointerMove spy');
    const subscription = registry.pointerMove.subscribe(spy);

    registry.startDragging(testComponent.dragItems.first, createMouseEvent('mousedown'));
    dispatchMouseEvent(document, 'mousemove');

    expect(spy).toHaveBeenCalled();

    subscription.unsubscribe();
  });

  it('should dispatch `touchmove` events after starting to drag via touch', () => {
    const spy = jasmine.createSpy('pointerMove spy');
    const subscription = registry.pointerMove.subscribe(spy);

    registry.startDragging(testComponent.dragItems.first,
        createTouchEvent('touchstart') as TouchEvent);
    dispatchTouchEvent(document, 'touchmove');

    expect(spy).toHaveBeenCalled();

    subscription.unsubscribe();
  });

  it('should dispatch `mouseup` events after ending the drag via the mouse', () => {
    const spy = jasmine.createSpy('pointerUp spy');
    const subscription = registry.pointerUp.subscribe(spy);

    registry.startDragging(testComponent.dragItems.first, createMouseEvent('mousedown'));
    dispatchMouseEvent(document, 'mouseup');

    expect(spy).toHaveBeenCalled();

    subscription.unsubscribe();
  });

  it('should dispatch `touchend` events after ending the drag via touch', () => {
    const spy = jasmine.createSpy('pointerUp spy');
    const subscription = registry.pointerUp.subscribe(spy);

    registry.startDragging(testComponent.dragItems.first,
        createTouchEvent('touchstart') as TouchEvent);
    dispatchTouchEvent(document, 'touchend');

    expect(spy).toHaveBeenCalled();

    subscription.unsubscribe();
  });

  it('should complete the pointer event streams on destroy', () => {
    const pointerUpSpy = jasmine.createSpy('pointerUp complete spy');
    const pointerMoveSpy = jasmine.createSpy('pointerMove complete spy');
    const pointerUpSubscription = registry.pointerUp.subscribe(undefined, undefined, pointerUpSpy);
    const pointerMoveSubscription =
        registry.pointerMove.subscribe(undefined, undefined, pointerMoveSpy);

    registry.ngOnDestroy();

    expect(pointerUpSpy).toHaveBeenCalled();
    expect(pointerMoveSpy).toHaveBeenCalled();

    pointerUpSubscription.unsubscribe();
    pointerMoveSubscription.unsubscribe();
  });

  it('should not throw when trying to register the same container again', () => {
    expect(() => registry.registerDropContainer(testComponent.dropInstances.first)).not.toThrow();
  });

  it('should throw when trying to register a different container with the same id', () => {
    expect(() => {
      testComponent.showDuplicateContainer = true;
      fixture.detectChanges();
    }).toThrowError(/Drop instance with id \"items\" has already been registered/);
  });

  it('should be able to get a drop container by its id', () => {
    expect(registry.getDropContainer('items')).toBe(testComponent.dropInstances.first);
    expect(registry.getDropContainer('does-not-exist')).toBeFalsy();
  });

  it('should not prevent the default `touchmove` actions when nothing is being dragged', () => {
    expect(dispatchTouchEvent(document, 'touchmove').defaultPrevented).toBe(false);
  });

  it('should prevent the default `touchmove` action when an item is being dragged', () => {
    registry.startDragging(testComponent.dragItems.first,
      createTouchEvent('touchstart') as TouchEvent);
    expect(dispatchTouchEvent(document, 'touchmove').defaultPrevented).toBe(true);
  });

});

@Component({
  template: `
    <cdk-drop id="items" [data]="items">
      <div *ngFor="let item of items" cdkDrag>{{item}}</div>
    </cdk-drop>

    <cdk-drop id="items" *ngIf="showDuplicateContainer"></cdk-drop>
  `
})
class SimpleDropZone {
  @ViewChildren(CdkDrag) dragItems: QueryList<CdkDrag>;
  @ViewChildren(CdkDrop) dropInstances: QueryList<CdkDrop>;
  items = ['Zero', 'One', 'Two', 'Three'];
  showDuplicateContainer = false;
}
