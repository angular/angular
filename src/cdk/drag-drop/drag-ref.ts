/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EmbeddedViewRef, ElementRef, NgZone, ViewContainerRef, TemplateRef} from '@angular/core';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {Direction} from '@angular/cdk/bidi';
import {normalizePassiveListenerOptions} from '@angular/cdk/platform';
import {coerceBooleanProperty, coerceElement} from '@angular/cdk/coercion';
import {Subscription, Subject, Observable, Observer} from 'rxjs';
import {DropListRefInternal as DropListRef} from './drop-list-ref';
import {DragDropRegistry} from './drag-drop-registry';
import {extendStyles, toggleNativeDragInteractions} from './drag-styling';
import {getTransformTransitionDurationInMs} from './transition-duration';

/** Object that can be used to configure the behavior of DragRef. */
export interface DragRefConfig {
  /**
   * Minimum amount of pixels that the user should
   * drag, before the CDK initiates a drag sequence.
   */
  dragStartThreshold: number;

  /**
   * Amount the pixels the user should drag before the CDK
   * considers them to have changed the drag direction.
   */
  pointerDirectionChangeThreshold: number;
}

/** Options that can be used to bind a passive event listener. */
const passiveEventListenerOptions = normalizePassiveListenerOptions({passive: true});

/** Options that can be used to bind an active event listener. */
const activeEventListenerOptions = normalizePassiveListenerOptions({passive: false});

/**
 * Time in milliseconds for which to ignore mouse events, after
 * receiving a touch event. Used to avoid doing double work for
 * touch devices where the browser fires fake mouse events, in
 * addition to touch events.
 */
const MOUSE_EVENT_IGNORE_TIME = 800;

// TODO(crisbeto): add auto-scrolling functionality.
// TODO(crisbeto): add an API for moving a draggable up/down the
// list programmatically. Useful for keyboard controls.

/**
 * Internal compile-time-only representation of a `DragRef`.
 * Used to avoid circular import issues between the `DragRef` and the `DropListRef`.
 * @docs-private
 */
export interface DragRefInternal extends DragRef {}

/** Template that can be used to create a drag helper element (e.g. a preview or a placeholder). */
interface DragHelperTemplate<T = any> {
  template: TemplateRef<T> | null;
  viewContainer: ViewContainerRef;
  context: T;
}

/**
 * Reference to a draggable item. Used to manipulate or dispose of the item.
 * @docs-private
 */
export class DragRef<T = any> {
  /** Element displayed next to the user's pointer while the element is dragged. */
  private _preview: HTMLElement;

  /** Reference to the view of the preview element. */
  private _previewRef: EmbeddedViewRef<any> | null;

  /** Reference to the view of the placeholder element. */
  private _placeholderRef: EmbeddedViewRef<any> | null;

  /** Element that is rendered instead of the draggable item while it is being sorted. */
  private _placeholder: HTMLElement;

  /** Coordinates within the element at which the user picked up the element. */
  private _pickupPositionInElement: Point;

  /** Coordinates on the page at which the user picked up the element. */
  private _pickupPositionOnPage: Point;

  /**
   * Reference to the element that comes after the draggable in the DOM, at the time
   * it was picked up. Used for restoring its initial position when it's dropped.
   */
  private _nextSibling: Node | null;

  /**
   * CSS `transform` applied to the element when it isn't being dragged. We need a
   * passive transform in order for the dragged element to retain its new position
   * after the user has stopped dragging and because we need to know the relative
   * position in case they start dragging again. This corresponds to `element.style.transform`.
   */
  private _passiveTransform: Point = {x: 0, y: 0};

  /** CSS `transform` that is applied to the element while it's being dragged. */
  private _activeTransform: Point = {x: 0, y: 0};

  /** Inline `transform` value that the element had before the first dragging sequence. */
  private _initialTransform?: string;

  /**
   * Whether the dragging sequence has been started. Doesn't
   * necessarily mean that the element has been moved.
   */
  private _hasStartedDragging: boolean;

  /** Whether the element has moved since the user started dragging it. */
  private _hasMoved: boolean;

  /** Drop container in which the DragRef resided when dragging began. */
  private _initialContainer: DropListRef;

  /** Cached scroll position on the page when the element was picked up. */
  private _scrollPosition: {top: number, left: number};

  /** Emits when the item is being moved. */
  private _moveEvents = new Subject<{
    source: DragRef;
    pointerPosition: {x: number, y: number};
    event: MouseEvent | TouchEvent;
    delta: {x: -1 | 0 | 1, y: -1 | 0 | 1};
  }>();

  /**
   * Amount of subscriptions to the move event. Used to avoid
   * hitting the zone if the consumer didn't subscribe to it.
   */
  private _moveEventSubscriptions = 0;

  /** Keeps track of the direction in which the user is dragging along each axis. */
  private _pointerDirectionDelta: {x: -1 | 0 | 1, y: -1 | 0 | 1};

  /** Pointer position at which the last change in the delta occurred. */
  private _pointerPositionAtLastDirectionChange: Point;

  /**
   * Root DOM node of the drag instance. This is the element that will
   * be moved around as the user is dragging.
   */
  private _rootElement: HTMLElement;

  /**
   * Inline style value of `-webkit-tap-highlight-color` at the time the
   * dragging was started. Used to restore the value once we're done dragging.
   */
  private _rootElementTapHighlight: string | null;

  /** Subscription to pointer movement events. */
  private _pointerMoveSubscription = Subscription.EMPTY;

  /** Subscription to the event that is dispatched when the user lifts their pointer. */
  private _pointerUpSubscription = Subscription.EMPTY;

  /**
   * Time at which the last touch event occurred. Used to avoid firing the same
   * events multiple times on touch devices where the browser will fire a fake
   * mouse event for each touch event, after a certain time.
   */
  private _lastTouchEventTime: number;

  /** Time at which the last dragging sequence was started. */
  private _dragStartTime: number;

  /** Cached reference to the boundary element. */
  private _boundaryElement: HTMLElement | null = null;

  /** Whether the native dragging interactions have been enabled on the root element. */
  private _nativeInteractionsEnabled = true;

  /** Cached dimensions of the preview element. */
  private _previewRect?: ClientRect;

  /** Cached dimensions of the boundary element. */
  private _boundaryRect?: ClientRect;

  /** Element that will be used as a template to create the draggable item's preview. */
  private _previewTemplate?: DragHelperTemplate | null;

  /** Template for placeholder element rendered to show where a draggable would be dropped. */
  private _placeholderTemplate?: DragHelperTemplate | null;

  /** Elements that can be used to drag the draggable item. */
  private _handles: HTMLElement[] = [];

  /** Registered handles that are currently disabled. */
  private _disabledHandles = new Set<HTMLElement>();

  /** Droppable container that the draggable is a part of. */
  private _dropContainer?: DropListRef;

  /** Layout direction of the item. */
  private _direction: Direction = 'ltr';

  /** Axis along which dragging is locked. */
  lockAxis: 'x' | 'y';

  /**
   * Amount of milliseconds to wait after the user has put their
   * pointer down before starting to drag the element.
   */
  dragStartDelay: number = 0;

  /** Whether starting to drag this element is disabled. */
  get disabled(): boolean {
    return this._disabled || !!(this._dropContainer && this._dropContainer.disabled);
  }
  set disabled(value: boolean) {
    const newValue = coerceBooleanProperty(value);

    if (newValue !== this._disabled) {
      this._disabled = newValue;
      this._toggleNativeDragInteractions();
    }
  }
  private _disabled = false;

  /** Emits as the drag sequence is being prepared. */
  beforeStarted = new Subject<void>();

  /** Emits when the user starts dragging the item. */
  started = new Subject<{source: DragRef}>();

  /** Emits when the user has released a drag item, before any animations have started. */
  released = new Subject<{source: DragRef}>();

  /** Emits when the user stops dragging an item in the container. */
  ended = new Subject<{source: DragRef}>();

  /** Emits when the user has moved the item into a new container. */
  entered = new Subject<{container: DropListRef, item: DragRef}>();

  /** Emits when the user removes the item its container by dragging it into another container. */
  exited = new Subject<{container: DropListRef, item: DragRef}>();

  /** Emits when the user drops the item inside a container. */
  dropped = new Subject<{
    previousIndex: number;
    currentIndex: number;
    item: DragRef;
    container: DropListRef;
    previousContainer: DropListRef;
    isPointerOverContainer: boolean;
  }>();

  /**
   * Emits as the user is dragging the item. Use with caution,
   * because this event will fire for every pixel that the user has dragged.
   */
  moved: Observable<{
    source: DragRef;
    pointerPosition: {x: number, y: number};
    event: MouseEvent | TouchEvent;
    delta: {x: -1 | 0 | 1, y: -1 | 0 | 1};
  }> = new Observable((observer: Observer<any>) => {
    const subscription = this._moveEvents.subscribe(observer);
    this._moveEventSubscriptions++;

    return () => {
      subscription.unsubscribe();
      this._moveEventSubscriptions--;
    };
  });

  /** Arbitrary data that can be attached to the drag item. */
  data: T;

  /**
   * Function that can be used to customize the logic of how the position of the drag item
   * is limited while it's being dragged. Gets called with a point containing the current position
   * of the user's pointer on the page and should return a point describing where the item should
   * be rendered.
   */
  constrainPosition?: (point: Point) => Point;

  constructor(
    element: ElementRef<HTMLElement> | HTMLElement,
    private _config: DragRefConfig,
    private _document: Document,
    private _ngZone: NgZone,
    private _viewportRuler: ViewportRuler,
    private _dragDropRegistry: DragDropRegistry<DragRef, DropListRef>) {

    this.withRootElement(element);
    _dragDropRegistry.registerDragItem(this);
  }

  /**
   * Returns the element that is being used as a placeholder
   * while the current element is being dragged.
   */
  getPlaceholderElement(): HTMLElement {
    return this._placeholder;
  }

  /** Returns the root draggable element. */
  getRootElement(): HTMLElement {
    return this._rootElement;
  }

  /** Registers the handles that can be used to drag the element. */
  withHandles(handles: (HTMLElement | ElementRef<HTMLElement>)[]): this {
    this._handles = handles.map(handle => coerceElement(handle));
    this._handles.forEach(handle => toggleNativeDragInteractions(handle, false));
    this._toggleNativeDragInteractions();
    return this;
  }

  /**
   * Registers the template that should be used for the drag preview.
   * @param template Template that from which to stamp out the preview.
   */
  withPreviewTemplate(template: DragHelperTemplate | null): this {
    this._previewTemplate = template;
    return this;
  }

  /**
   * Registers the template that should be used for the drag placeholder.
   * @param template Template that from which to stamp out the placeholder.
   */
  withPlaceholderTemplate(template: DragHelperTemplate | null): this {
    this._placeholderTemplate = template;
    return this;
  }

  /**
   * Sets an alternate drag root element. The root element is the element that will be moved as
   * the user is dragging. Passing an alternate root element is useful when trying to enable
   * dragging on an element that you might not have access to.
   */
  withRootElement(rootElement: ElementRef<HTMLElement> | HTMLElement): this {
    const element = coerceElement(rootElement);

    if (element !== this._rootElement) {
      if (this._rootElement) {
        this._removeRootElementListeners(this._rootElement);
      }

      element.addEventListener('mousedown', this._pointerDown, activeEventListenerOptions);
      element.addEventListener('touchstart', this._pointerDown, passiveEventListenerOptions);
      this._initialTransform = undefined;
      this._rootElement = element;
    }

    return this;
  }

  /**
   * Element to which the draggable's position will be constrained.
   */
  withBoundaryElement(boundaryElement: ElementRef<HTMLElement> | HTMLElement | null): this {
    this._boundaryElement = boundaryElement ? coerceElement(boundaryElement) : null;
    return this;
  }

  /** Removes the dragging functionality from the DOM element. */
  dispose() {
    this._removeRootElementListeners(this._rootElement);

    // Do this check before removing from the registry since it'll
    // stop being considered as dragged once it is removed.
    if (this.isDragging()) {
      // Since we move out the element to the end of the body while it's being
      // dragged, we have to make sure that it's removed if it gets destroyed.
      removeElement(this._rootElement);
    }

    this._destroyPreview();
    this._destroyPlaceholder();
    this._dragDropRegistry.removeDragItem(this);
    this._removeSubscriptions();
    this.beforeStarted.complete();
    this.started.complete();
    this.released.complete();
    this.ended.complete();
    this.entered.complete();
    this.exited.complete();
    this.dropped.complete();
    this._moveEvents.complete();
    this._handles = [];
    this._disabledHandles.clear();
    this._dropContainer = undefined;
    this._boundaryElement = this._rootElement = this._placeholderTemplate =
        this._previewTemplate = this._nextSibling = null!;
  }

  /** Checks whether the element is currently being dragged. */
  isDragging(): boolean {
    return this._hasStartedDragging && this._dragDropRegistry.isDragging(this);
  }

  /** Resets a standalone drag item to its initial position. */
  reset(): void {
    this._rootElement.style.transform = this._initialTransform || '';
    this._activeTransform = {x: 0, y: 0};
    this._passiveTransform = {x: 0, y: 0};
  }

  /**
   * Sets a handle as disabled. While a handle is disabled, it'll capture and interrupt dragging.
   * @param handle Handle element that should be disabled.
   */
  disableHandle(handle: HTMLElement) {
    if (this._handles.indexOf(handle) > -1) {
      this._disabledHandles.add(handle);
    }
  }

  /**
   * Enables a handle, if it has been disabled.
   * @param handle Handle element to be enabled.
   */
  enableHandle(handle: HTMLElement) {
    this._disabledHandles.delete(handle);
  }

  /** Sets the layout direction of the draggable item. */
  withDirection(direction: Direction): this {
    this._direction = direction;
    return this;
  }

  /** Sets the container that the item is part of. */
  _withDropContainer(container: DropListRef) {
    this._dropContainer = container;
  }

  /** Unsubscribes from the global subscriptions. */
  private _removeSubscriptions() {
    this._pointerMoveSubscription.unsubscribe();
    this._pointerUpSubscription.unsubscribe();
  }

  /** Destroys the preview element and its ViewRef. */
  private _destroyPreview() {
    if (this._preview) {
      removeElement(this._preview);
    }

    if (this._previewRef) {
      this._previewRef.destroy();
    }

    this._preview = this._previewRef = null!;
  }

  /** Destroys the placeholder element and its ViewRef. */
  private _destroyPlaceholder() {
    if (this._placeholder) {
      removeElement(this._placeholder);
    }

    if (this._placeholderRef) {
      this._placeholderRef.destroy();
    }

    this._placeholder = this._placeholderRef = null!;
  }

  /** Handler for the `mousedown`/`touchstart` events. */
  private _pointerDown = (event: MouseEvent | TouchEvent) => {
    this.beforeStarted.next();

    // Delegate the event based on whether it started from a handle or the element itself.
    if (this._handles.length) {
      const targetHandle = this._handles.find(handle => {
        const target = event.target;
        return !!target && (target === handle || handle.contains(target as HTMLElement));
      });

      if (targetHandle && !this._disabledHandles.has(targetHandle) && !this.disabled) {
        this._initializeDragSequence(targetHandle, event);
      }
    } else if (!this.disabled) {
      this._initializeDragSequence(this._rootElement, event);
    }
  }

  /** Handler that is invoked when the user moves their pointer after they've initiated a drag. */
  private _pointerMove = (event: MouseEvent | TouchEvent) => {
    if (!this._hasStartedDragging) {
      const pointerPosition = this._getPointerPositionOnPage(event);
      const distanceX = Math.abs(pointerPosition.x - this._pickupPositionOnPage.x);
      const distanceY = Math.abs(pointerPosition.y - this._pickupPositionOnPage.y);
      const isOverThreshold = distanceX + distanceY >= this._config.dragStartThreshold;

      // Only start dragging after the user has moved more than the minimum distance in either
      // direction. Note that this is preferrable over doing something like `skip(minimumDistance)`
      // in the `pointerMove` subscription, because we're not guaranteed to have one move event
      // per pixel of movement (e.g. if the user moves their pointer quickly).
      if (isOverThreshold && (Date.now() >= this._dragStartTime + (this.dragStartDelay || 0))) {
        this._hasStartedDragging = true;
        this._ngZone.run(() => this._startDragSequence(event));
      }

      return;
    }

    // We only need the preview dimensions if we have a boundary element.
    if (this._boundaryElement) {
      // Cache the preview element rect if we haven't cached it already or if
      // we cached it too early before the element dimensions were computed.
      if (!this._previewRect || (!this._previewRect.width && !this._previewRect.height)) {
        this._previewRect = (this._preview || this._rootElement).getBoundingClientRect();
      }
    }

    const constrainedPointerPosition = this._getConstrainedPointerPosition(event);
    this._hasMoved = true;
    event.preventDefault();
    this._updatePointerDirectionDelta(constrainedPointerPosition);

    if (this._dropContainer) {
      this._updateActiveDropContainer(constrainedPointerPosition);
    } else {
      const activeTransform = this._activeTransform;
      activeTransform.x =
          constrainedPointerPosition.x - this._pickupPositionOnPage.x + this._passiveTransform.x;
      activeTransform.y =
          constrainedPointerPosition.y - this._pickupPositionOnPage.y + this._passiveTransform.y;
      const transform = getTransform(activeTransform.x, activeTransform.y);

      // Preserve the previous `transform` value, if there was one. Note that we apply our own
      // transform before the user's, because things like rotation can affect which direction
      // the element will be translated towards.
      this._rootElement.style.transform = this._initialTransform ?
          transform + ' ' + this._initialTransform  : transform;

      // Apply transform as attribute if dragging and svg element to work for IE
      if (typeof SVGElement !== 'undefined' && this._rootElement instanceof SVGElement) {
        const appliedTransform = `translate(${activeTransform.x} ${activeTransform.y})`;
        this._rootElement.setAttribute('transform', appliedTransform);
      }
    }

    // Since this event gets fired for every pixel while dragging, we only
    // want to fire it if the consumer opted into it. Also we have to
    // re-enter the zone because we run all of the events on the outside.
    if (this._moveEventSubscriptions > 0) {
      this._ngZone.run(() => {
        this._moveEvents.next({
          source: this,
          pointerPosition: constrainedPointerPosition,
          event,
          delta: this._pointerDirectionDelta
        });
      });
    }
  }

  /** Handler that is invoked when the user lifts their pointer up, after initiating a drag. */
  private _pointerUp = (event: MouseEvent | TouchEvent) => {
    // Note that here we use `isDragging` from the service, rather than from `this`.
    // The difference is that the one from the service reflects whether a dragging sequence
    // has been initiated, whereas the one on `this` includes whether the user has passed
    // the minimum dragging threshold.
    if (!this._dragDropRegistry.isDragging(this)) {
      return;
    }

    this._removeSubscriptions();
    this._dragDropRegistry.stopDragging(this);

    if (this._handles) {
      this._rootElement.style.webkitTapHighlightColor = this._rootElementTapHighlight;
    }

    if (!this._hasStartedDragging) {
      return;
    }

    this.released.next({source: this});

    if (!this._dropContainer) {
      // Convert the active transform into a passive one. This means that next time
      // the user starts dragging the item, its position will be calculated relatively
      // to the new passive transform.
      this._passiveTransform.x = this._activeTransform.x;
      this._passiveTransform.y = this._activeTransform.y;
      this._ngZone.run(() => this.ended.next({source: this}));
      this._dragDropRegistry.stopDragging(this);
      return;
    }

    this._animatePreviewToPlaceholder().then(() => {
      this._cleanupDragArtifacts(event);
      this._dragDropRegistry.stopDragging(this);
    });
  }

  /** Starts the dragging sequence. */
  private _startDragSequence(event: MouseEvent | TouchEvent) {
    // Emit the event on the item before the one on the container.
    this.started.next({source: this});

    if (isTouchEvent(event)) {
      this._lastTouchEventTime = Date.now();
    }

    if (this._dropContainer) {
      const element = this._rootElement;

      // Grab the `nextSibling` before the preview and placeholder
      // have been created so we don't get the preview by accident.
      this._nextSibling = element.nextSibling;

      const preview = this._preview = this._createPreviewElement();
      const placeholder = this._placeholder = this._createPlaceholderElement();

      // We move the element out at the end of the body and we make it hidden, because keeping it in
      // place will throw off the consumer's `:last-child` selectors. We can't remove the element
      // from the DOM completely, because iOS will stop firing all subsequent events in the chain.
      element.style.display = 'none';
      this._document.body.appendChild(element.parentNode!.replaceChild(placeholder, element));
      getPreviewInsertionPoint(this._document).appendChild(preview);
      this._dropContainer.start();
    }
  }

  /**
   * Sets up the different variables and subscriptions
   * that will be necessary for the dragging sequence.
   * @param referenceElement Element that started the drag sequence.
   * @param event Browser event object that started the sequence.
   */
  private _initializeDragSequence(referenceElement: HTMLElement, event: MouseEvent | TouchEvent) {
    // Always stop propagation for the event that initializes
    // the dragging sequence, in order to prevent it from potentially
    // starting another sequence for a draggable parent somewhere up the DOM tree.
    event.stopPropagation();

    const isDragging = this.isDragging();
    const isTouchSequence = isTouchEvent(event);
    const isAuxiliaryMouseButton = !isTouchSequence && (event as MouseEvent).button !== 0;
    const rootElement = this._rootElement;
    const isSyntheticEvent = !isTouchSequence && this._lastTouchEventTime &&
      this._lastTouchEventTime + MOUSE_EVENT_IGNORE_TIME > Date.now();

    // If the event started from an element with the native HTML drag&drop, it'll interfere
    // with our own dragging (e.g. `img` tags do it by default). Prevent the default action
    // to stop it from happening. Note that preventing on `dragstart` also seems to work, but
    // it's flaky and it fails if the user drags it away quickly. Also note that we only want
    // to do this for `mousedown` since doing the same for `touchstart` will stop any `click`
    // events from firing on touch devices.
    if (event.target && (event.target as HTMLElement).draggable && event.type === 'mousedown') {
      event.preventDefault();
    }

    // Abort if the user is already dragging or is using a mouse button other than the primary one.
    if (isDragging || isAuxiliaryMouseButton || isSyntheticEvent) {
      return;
    }

    // Cache the previous transform amount only after the first drag sequence, because
    // we don't want our own transforms to stack on top of each other.
    if (this._initialTransform == null) {
      this._initialTransform = this._rootElement.style.transform || '';
    }

    // If we've got handles, we need to disable the tap highlight on the entire root element,
    // otherwise iOS will still add it, even though all the drag interactions on the handle
    // are disabled.
    if (this._handles.length) {
      this._rootElementTapHighlight = rootElement.style.webkitTapHighlightColor;
      rootElement.style.webkitTapHighlightColor = 'transparent';
    }

    this._toggleNativeDragInteractions();
    this._hasStartedDragging = this._hasMoved = false;
    this._initialContainer = this._dropContainer!;
    this._pointerMoveSubscription = this._dragDropRegistry.pointerMove.subscribe(this._pointerMove);
    this._pointerUpSubscription = this._dragDropRegistry.pointerUp.subscribe(this._pointerUp);
    this._scrollPosition = this._viewportRuler.getViewportScrollPosition();

    if (this._boundaryElement) {
      this._boundaryRect = this._boundaryElement.getBoundingClientRect();
    }

    // If we have a custom preview template, the element won't be visible anyway so we avoid the
    // extra `getBoundingClientRect` calls and just move the preview next to the cursor.
    this._pickupPositionInElement = this._previewTemplate && this._previewTemplate.template ?
      {x: 0, y: 0} :
      this._getPointerPositionInElement(referenceElement, event);
    const pointerPosition = this._pickupPositionOnPage = this._getPointerPositionOnPage(event);
    this._pointerDirectionDelta = {x: 0, y: 0};
    this._pointerPositionAtLastDirectionChange = {x: pointerPosition.x, y: pointerPosition.y};
    this._dragStartTime = Date.now();
    this._dragDropRegistry.startDragging(this, event);
  }

  /** Cleans up the DOM artifacts that were added to facilitate the element being dragged. */
  private _cleanupDragArtifacts(event: MouseEvent | TouchEvent) {
    // Restore the element's visibility and insert it at its old position in the DOM.
    // It's important that we maintain the position, because moving the element around in the DOM
    // can throw off `NgFor` which does smart diffing and re-creates elements only when necessary,
    // while moving the existing elements in all other cases.
    this._rootElement.style.display = '';

    if (this._nextSibling) {
      this._nextSibling.parentNode!.insertBefore(this._rootElement, this._nextSibling);
    } else {
      this._initialContainer.element.appendChild(this._rootElement);
    }

    this._destroyPreview();
    this._destroyPlaceholder();
    this._boundaryRect = this._previewRect = undefined;

    // Re-enter the NgZone since we bound `document` events on the outside.
    this._ngZone.run(() => {
      const container = this._dropContainer!;
      const currentIndex = container.getItemIndex(this);
      const {x, y} = this._getPointerPositionOnPage(event);
      const isPointerOverContainer = container._isOverContainer(x, y);

      this.ended.next({source: this});
      this.dropped.next({
        item: this,
        currentIndex,
        previousIndex: this._initialContainer.getItemIndex(this),
        container: container,
        previousContainer: this._initialContainer,
        isPointerOverContainer
      });
      container.drop(this, currentIndex, this._initialContainer, isPointerOverContainer);
      this._dropContainer = this._initialContainer;
    });
  }

  /**
   * Updates the item's position in its drop container, or moves it
   * into a new one, depending on its current drag position.
   */
  private _updateActiveDropContainer({x, y}: Point) {
    // Drop container that draggable has been moved into.
    let newContainer = this._dropContainer!._getSiblingContainerFromPosition(this, x, y) ||
        this._initialContainer._getSiblingContainerFromPosition(this, x, y);

    // If we couldn't find a new container to move the item into, and the item has left it's
    // initial container, check whether the it's over the initial container. This handles the
    // case where two containers are connected one way and the user tries to undo dragging an
    // item into a new container.
    if (!newContainer && this._dropContainer !== this._initialContainer &&
        this._initialContainer._isOverContainer(x, y)) {
      newContainer = this._initialContainer;
    }

    if (newContainer && newContainer !== this._dropContainer) {
      this._ngZone.run(() => {
        // Notify the old container that the item has left.
        this.exited.next({item: this, container: this._dropContainer!});
        this._dropContainer!.exit(this);
        // Notify the new container that the item has entered.
        this.entered.next({item: this, container: newContainer!});
        this._dropContainer = newContainer!;
        this._dropContainer.enter(this, x, y);
      });
    }

    this._dropContainer!._sortItem(this, x, y, this._pointerDirectionDelta);
    this._preview.style.transform =
        getTransform(x - this._pickupPositionInElement.x, y - this._pickupPositionInElement.y);
  }

  /**
   * Creates the element that will be rendered next to the user's pointer
   * and will be used as a preview of the element that is being dragged.
   */
  private _createPreviewElement(): HTMLElement {
    const previewConfig = this._previewTemplate;
    const previewTemplate = previewConfig ? previewConfig.template : null;
    let preview: HTMLElement;

    if (previewTemplate) {
      const viewRef = previewConfig!.viewContainer.createEmbeddedView(previewTemplate,
                                                                      previewConfig!.context);
      preview = viewRef.rootNodes[0];
      this._previewRef = viewRef;
      preview.style.transform =
          getTransform(this._pickupPositionOnPage.x, this._pickupPositionOnPage.y);
    } else {
      const element = this._rootElement;
      const elementRect = element.getBoundingClientRect();

      preview = deepCloneNode(element);
      preview.style.width = `${elementRect.width}px`;
      preview.style.height = `${elementRect.height}px`;
      preview.style.transform = getTransform(elementRect.left, elementRect.top);
    }

    extendStyles(preview.style, {
      // It's important that we disable the pointer events on the preview, because
      // it can throw off the `document.elementFromPoint` calls in the `CdkDropList`.
      pointerEvents: 'none',
      position: 'fixed',
      top: '0',
      left: '0',
      zIndex: '1000'
    });

    toggleNativeDragInteractions(preview, false);

    preview.classList.add('cdk-drag-preview');
    preview.setAttribute('dir', this._direction);

    return preview;
  }

  /**
   * Animates the preview element from its current position to the location of the drop placeholder.
   * @returns Promise that resolves when the animation completes.
   */
  private _animatePreviewToPlaceholder(): Promise<void> {
    // If the user hasn't moved yet, the transitionend event won't fire.
    if (!this._hasMoved) {
      return Promise.resolve();
    }

    const placeholderRect = this._placeholder.getBoundingClientRect();

    // Apply the class that adds a transition to the preview.
    this._preview.classList.add('cdk-drag-animating');

    // Move the preview to the placeholder position.
    this._preview.style.transform = getTransform(placeholderRect.left, placeholderRect.top);

    // If the element doesn't have a `transition`, the `transitionend` event won't fire. Since
    // we need to trigger a style recalculation in order for the `cdk-drag-animating` class to
    // apply its style, we take advantage of the available info to figure out whether we need to
    // bind the event in the first place.
    const duration = getTransformTransitionDurationInMs(this._preview);

    if (duration === 0) {
      return Promise.resolve();
    }

    return this._ngZone.runOutsideAngular(() => {
      return new Promise(resolve => {
        const handler = ((event: TransitionEvent) => {
          if (!event || (event.target === this._preview && event.propertyName === 'transform')) {
            this._preview.removeEventListener('transitionend', handler);
            resolve();
            clearTimeout(timeout);
          }
        }) as EventListenerOrEventListenerObject;

        // If a transition is short enough, the browser might not fire the `transitionend` event.
        // Since we know how long it's supposed to take, add a timeout with a 50% buffer that'll
        // fire if the transition hasn't completed when it was supposed to.
        const timeout = setTimeout(handler as Function, duration * 1.5);
        this._preview.addEventListener('transitionend', handler);
      });
    });
  }

  /** Creates an element that will be shown instead of the current element while dragging. */
  private _createPlaceholderElement(): HTMLElement {
    const placeholderConfig = this._placeholderTemplate;
    const placeholderTemplate = placeholderConfig ? placeholderConfig.template : null;
    let placeholder: HTMLElement;

    if (placeholderTemplate) {
      this._placeholderRef = placeholderConfig!.viewContainer.createEmbeddedView(
        placeholderTemplate,
        placeholderConfig!.context
      );
      placeholder = this._placeholderRef.rootNodes[0];
    } else {
      placeholder = deepCloneNode(this._rootElement);
    }

    placeholder.classList.add('cdk-drag-placeholder');
    return placeholder;
  }

  /**
   * Figures out the coordinates at which an element was picked up.
   * @param referenceElement Element that initiated the dragging.
   * @param event Event that initiated the dragging.
   */
  private _getPointerPositionInElement(referenceElement: HTMLElement,
                                       event: MouseEvent | TouchEvent): Point {
    const elementRect = this._rootElement.getBoundingClientRect();
    const handleElement = referenceElement === this._rootElement ? null : referenceElement;
    const referenceRect = handleElement ? handleElement.getBoundingClientRect() : elementRect;
    const point = isTouchEvent(event) ? event.targetTouches[0] : event;
    const x = point.pageX - referenceRect.left - this._scrollPosition.left;
    const y = point.pageY - referenceRect.top - this._scrollPosition.top;

    return {
      x: referenceRect.left - elementRect.left + x,
      y: referenceRect.top - elementRect.top + y
    };
  }

  /** Determines the point of the page that was touched by the user. */
  private _getPointerPositionOnPage(event: MouseEvent | TouchEvent): Point {
    // `touches` will be empty for start/end events so we have to fall back to `changedTouches`.
    const point = isTouchEvent(event) ? (event.touches[0] || event.changedTouches[0]) : event;

    return {
      x: point.pageX - this._scrollPosition.left,
      y: point.pageY - this._scrollPosition.top
    };
  }


  /** Gets the pointer position on the page, accounting for any position constraints. */
  private _getConstrainedPointerPosition(event: MouseEvent | TouchEvent): Point {
    const point = this._getPointerPositionOnPage(event);
    const constrainedPoint = this.constrainPosition ? this.constrainPosition(point) : point;
    const dropContainerLock = this._dropContainer ? this._dropContainer.lockAxis : null;

    if (this.lockAxis === 'x' || dropContainerLock === 'x') {
      constrainedPoint.y = this._pickupPositionOnPage.y;
    } else if (this.lockAxis === 'y' || dropContainerLock === 'y') {
      constrainedPoint.x = this._pickupPositionOnPage.x;
    }

    if (this._boundaryRect) {
      const {x: pickupX, y: pickupY} = this._pickupPositionInElement;
      const boundaryRect = this._boundaryRect;
      const previewRect = this._previewRect!;
      const minY = boundaryRect.top + pickupY;
      const maxY = boundaryRect.bottom - (previewRect.height - pickupY);
      const minX = boundaryRect.left + pickupX;
      const maxX = boundaryRect.right - (previewRect.width - pickupX);

      constrainedPoint.x = clamp(constrainedPoint.x, minX, maxX);
      constrainedPoint.y = clamp(constrainedPoint.y, minY, maxY);
    }

    return constrainedPoint;
  }


  /** Updates the current drag delta, based on the user's current pointer position on the page. */
  private _updatePointerDirectionDelta(pointerPositionOnPage: Point) {
    const {x, y} = pointerPositionOnPage;
    const delta = this._pointerDirectionDelta;
    const positionSinceLastChange = this._pointerPositionAtLastDirectionChange;

    // Amount of pixels the user has dragged since the last time the direction changed.
    const changeX = Math.abs(x - positionSinceLastChange.x);
    const changeY = Math.abs(y - positionSinceLastChange.y);

    // Because we handle pointer events on a per-pixel basis, we don't want the delta
    // to change for every pixel, otherwise anything that depends on it can look erratic.
    // To make the delta more consistent, we track how much the user has moved since the last
    // delta change and we only update it after it has reached a certain threshold.
    if (changeX > this._config.pointerDirectionChangeThreshold) {
      delta.x = x > positionSinceLastChange.x ? 1 : -1;
      positionSinceLastChange.x = x;
    }

    if (changeY > this._config.pointerDirectionChangeThreshold) {
      delta.y = y > positionSinceLastChange.y ? 1 : -1;
      positionSinceLastChange.y = y;
    }

    return delta;
  }

  /** Toggles the native drag interactions, based on how many handles are registered. */
  private _toggleNativeDragInteractions() {
    if (!this._rootElement || !this._handles) {
      return;
    }

    const shouldEnable = this.disabled || this._handles.length > 0;

    if (shouldEnable !== this._nativeInteractionsEnabled) {
      this._nativeInteractionsEnabled = shouldEnable;
      toggleNativeDragInteractions(this._rootElement, shouldEnable);
    }
  }

  /** Removes the manually-added event listeners from the root element. */
  private _removeRootElementListeners(element: HTMLElement) {
    element.removeEventListener('mousedown', this._pointerDown, activeEventListenerOptions);
    element.removeEventListener('touchstart', this._pointerDown, passiveEventListenerOptions);
  }

}

/** Point on the page or within an element. */
export interface Point {
  x: number;
  y: number;
}

/**
 * Gets a 3d `transform` that can be applied to an element.
 * @param x Desired position of the element along the X axis.
 * @param y Desired position of the element along the Y axis.
 */
function getTransform(x: number, y: number): string {
  // Round the transforms since some browsers will
  // blur the elements for sub-pixel transforms.
  return `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
}

/** Creates a deep clone of an element. */
function deepCloneNode(node: HTMLElement): HTMLElement {
  const clone = node.cloneNode(true) as HTMLElement;
  const descendantsWithId = clone.querySelectorAll('[id]');

  // Remove the `id` to avoid having multiple elements with the same id on the page.
  clone.removeAttribute('id');

  for (let i = 0; i < descendantsWithId.length; i++) {
    descendantsWithId[i].removeAttribute('id');
  }

  return clone;
}

/** Clamps a value between a minimum and a maximum. */
function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Helper to remove an element from the DOM and to do all the necessary null checks.
 * @param element Element to be removed.
 */
function removeElement(element: HTMLElement | null) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

/** Determines whether an event is a touch event. */
function isTouchEvent(event: MouseEvent | TouchEvent): event is TouchEvent {
  return event.type.startsWith('touch');
}

/** Gets the element into which the drag preview should be inserted. */
function getPreviewInsertionPoint(documentRef: any): HTMLElement {
  // We can't use the body if the user is in fullscreen mode,
  // because the preview will render under the fullscreen element.
  // TODO(crisbeto): dedupe this with the `FullscreenOverlayContainer` eventually.
  return documentRef.fullscreenElement ||
         documentRef.webkitFullscreenElement ||
         documentRef.mozFullScreenElement ||
         documentRef.msFullscreenElement ||
         documentRef.body;
}
