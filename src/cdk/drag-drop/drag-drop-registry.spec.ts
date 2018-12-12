import {QueryList, ViewChildren, Component} from '@angular/core';
import {fakeAsync, TestBed, ComponentFixture, inject} from '@angular/core/testing';
import {
  createMouseEvent,
  dispatchMouseEvent,
  createTouchEvent,
  dispatchTouchEvent,
  dispatchFakeEvent,
} from '@angular/cdk/testing';
import {DragDropRegistry} from './drag-drop-registry';
import {DragDropModule} from './drag-drop-module';
import {CdkDrag} from './directives/drag';
import {CdkDropList} from './directives/drop-list';

describe('DragDropRegistry', () => {
  let fixture: ComponentFixture<SimpleDropZone>;
  let testComponent: SimpleDropZone;
  let registry: DragDropRegistry<CdkDrag, CdkDropList>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [DragDropModule],
      declarations: [SimpleDropZone],
    }).compileComponents();

    fixture = TestBed.createComponent(SimpleDropZone);
    testComponent = fixture.componentInstance;
    fixture.detectChanges();

    inject([DragDropRegistry], (c: DragDropRegistry<CdkDrag, CdkDropList>) => {
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

  it('should dispatch pointer move events if event propagation is stopped', () => {
    const spy = jasmine.createSpy('pointerMove spy');
    const subscription = registry.pointerMove.subscribe(spy);

    fixture.nativeElement.addEventListener('mousemove', (e: MouseEvent) => e.stopPropagation());
    registry.startDragging(testComponent.dragItems.first, createMouseEvent('mousedown'));
    dispatchMouseEvent(fixture.nativeElement.querySelector('div'), 'mousemove');

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

  it('should dispatch pointer up events if event propagation is stopped', () => {
    const spy = jasmine.createSpy('pointerUp spy');
    const subscription = registry.pointerUp.subscribe(spy);

    fixture.nativeElement.addEventListener('mouseup', (e: MouseEvent) => e.stopPropagation());
    registry.startDragging(testComponent.dragItems.first, createMouseEvent('mousedown'));
    dispatchMouseEvent(fixture.nativeElement.querySelector('div'), 'mouseup');

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

  it('should not prevent the default `touchmove` actions when nothing is being dragged', () => {
    expect(dispatchTouchEvent(document, 'touchmove').defaultPrevented).toBe(false);
  });

  it('should prevent the default `touchmove` action when an item is being dragged', () => {
    registry.startDragging(testComponent.dragItems.first,
      createTouchEvent('touchstart') as TouchEvent);
    expect(dispatchTouchEvent(document, 'touchmove').defaultPrevented).toBe(true);
  });

  it('should prevent the default `touchmove` if event propagation is stopped', () => {
    registry.startDragging(testComponent.dragItems.first,
      createTouchEvent('touchstart') as TouchEvent);

    fixture.nativeElement.addEventListener('touchmove', (e: TouchEvent) => e.stopPropagation());

    const event = dispatchTouchEvent(fixture.nativeElement.querySelector('div'), 'touchmove');

    expect(event.defaultPrevented).toBe(true);
  });

  it('should not prevent the default `wheel` actions when nothing is being dragged', () => {
    expect(dispatchFakeEvent(document, 'wheel').defaultPrevented).toBe(false);
  });

  it('should prevent the default `wheel` action when an item is being dragged', () => {
    registry.startDragging(testComponent.dragItems.first, createMouseEvent('mousedown'));
    expect(dispatchFakeEvent(document, 'wheel').defaultPrevented).toBe(true);
  });

  it('should not prevent the default `selectstart` actions when nothing is being dragged', () => {
    expect(dispatchFakeEvent(document, 'selectstart').defaultPrevented).toBe(false);
  });

  it('should prevent the default `selectstart` action when an item is being dragged', () => {
    registry.startDragging(testComponent.dragItems.first, createMouseEvent('mousedown'));
    expect(dispatchFakeEvent(document, 'selectstart').defaultPrevented).toBe(true);
  });


});

@Component({
  template: `
    <div cdkDropList id="items" [cdkDropListData]="items">
      <div *ngFor="let item of items" cdkDrag>{{item}}</div>
    </div>

    <div cdkDropList id="items" *ngIf="showDuplicateContainer"></div>
  `
})
class SimpleDropZone {
  @ViewChildren(CdkDrag) dragItems: QueryList<CdkDrag>;
  @ViewChildren(CdkDropList) dropInstances: QueryList<CdkDropList>;
  items = ['Zero', 'One', 'Two', 'Three'];
  showDuplicateContainer = false;
}
