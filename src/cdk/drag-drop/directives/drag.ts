/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {DOCUMENT} from '@angular/common';
import {
  AfterViewInit,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  InjectionToken,
  Input,
  NgZone,
  OnDestroy,
  Optional,
  Output,
  QueryList,
  SkipSelf,
  ViewContainerRef,
} from '@angular/core';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {Observable, Subscription, Observer} from 'rxjs';
import {startWith, take, map} from 'rxjs/operators';
import {DragDropRegistry} from '../drag-drop-registry';
import {
  CdkDragDrop,
  CdkDragEnd,
  CdkDragEnter,
  CdkDragExit,
  CdkDragMove,
  CdkDragStart,
} from '../drag-events';
import {CdkDragHandle} from './drag-handle';
import {CdkDragPlaceholder} from './drag-placeholder';
import {CdkDragPreview} from './drag-preview';
import {CDK_DROP_LIST} from '../drop-list-container';
import {CDK_DRAG_PARENT} from '../drag-parent';
import {DragRef, DragRefConfig} from '../drag-ref';
import {DropListRef} from '../drop-list-ref';
import {CdkDropListInternal as CdkDropList} from './drop-list';

/** Injection token that can be used to configure the behavior of `CdkDrag`. */
export const CDK_DRAG_CONFIG = new InjectionToken<DragRefConfig>('CDK_DRAG_CONFIG', {
  providedIn: 'root',
  factory: CDK_DRAG_CONFIG_FACTORY
});

/** @docs-private */
export function CDK_DRAG_CONFIG_FACTORY(): DragRefConfig {
  return {dragStartThreshold: 5, pointerDirectionChangeThreshold: 5};
}

/** Element that can be moved inside a CdkDropList container. */
@Directive({
  selector: '[cdkDrag]',
  exportAs: 'cdkDrag',
  host: {
    'class': 'cdk-drag',
    '[class.cdk-drag-dragging]': '_dragRef.isDragging()',
  },
  providers: [{provide: CDK_DRAG_PARENT, useExisting: CdkDrag}]
})
export class CdkDrag<T = any> implements AfterViewInit, OnDestroy {
  /** Subscription to the stream that initializes the root element. */
  private _rootElementInitSubscription = Subscription.EMPTY;

  /** Reference to the underlying drag instance. */
  _dragRef: DragRef<CdkDrag<T>>;

  /** Elements that can be used to drag the draggable item. */
  @ContentChildren(CdkDragHandle, {descendants: true}) _handles: QueryList<CdkDragHandle>;

  /** Element that will be used as a template to create the draggable item's preview. */
  @ContentChild(CdkDragPreview) _previewTemplate: CdkDragPreview;

  /** Template for placeholder element rendered to show where a draggable would be dropped. */
  @ContentChild(CdkDragPlaceholder) _placeholderTemplate: CdkDragPlaceholder;

  /** Arbitrary data to attach to this drag instance. */
  @Input('cdkDragData') data: T;

  /** Locks the position of the dragged element along the specified axis. */
  @Input('cdkDragLockAxis') lockAxis: 'x' | 'y';

  /**
   * Selector that will be used to determine the root draggable element, starting from
   * the `cdkDrag` element and going up the DOM. Passing an alternate root element is useful
   * when trying to enable dragging on an element that you might not have access to.
   */
  @Input('cdkDragRootElement') rootElementSelector: string;

  /**
   * Selector that will be used to determine the element to which the draggable's position will
   * be constrained. Matching starts from the element's parent and goes up the DOM until a matching
   * element has been found.
   */
  @Input('cdkDragBoundary') boundaryElementSelector: string;

  /** Whether starting to drag this element is disabled. */
  @Input('cdkDragDisabled')
  get disabled(): boolean {
    return this._disabled || (this.dropContainer && this.dropContainer.disabled);
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled = false;

  /** Emits when the user starts dragging the item. */
  @Output('cdkDragStarted') started: EventEmitter<CdkDragStart> = new EventEmitter<CdkDragStart>();

  /** Emits when the user stops dragging an item in the container. */
  @Output('cdkDragEnded') ended: EventEmitter<CdkDragEnd> = new EventEmitter<CdkDragEnd>();

  /** Emits when the user has moved the item into a new container. */
  @Output('cdkDragEntered') entered: EventEmitter<CdkDragEnter<any>> =
      new EventEmitter<CdkDragEnter<any>>();

  /** Emits when the user removes the item its container by dragging it into another container. */
  @Output('cdkDragExited') exited: EventEmitter<CdkDragExit<any>> =
      new EventEmitter<CdkDragExit<any>>();

  /** Emits when the user drops the item inside a container. */
  @Output('cdkDragDropped') dropped: EventEmitter<CdkDragDrop<any>> =
      new EventEmitter<CdkDragDrop<any>>();

  /**
   * Emits as the user is dragging the item. Use with caution,
   * because this event will fire for every pixel that the user has dragged.
   */
  @Output('cdkDragMoved') moved: Observable<CdkDragMove<T>> =
      Observable.create((observer: Observer<CdkDragMove<T>>) => {
        const subscription = this._dragRef.moved.pipe(map(movedEvent => ({
          source: this,
          pointerPosition: movedEvent.pointerPosition,
          event: movedEvent.event,
          delta: movedEvent.delta
        }))).subscribe(observer);

        return () => {
          subscription.unsubscribe();
        };
      });

  constructor(
    /** Element that the draggable is attached to. */
    public element: ElementRef<HTMLElement>,
    /** Droppable container that the draggable is a part of. */
    @Inject(CDK_DROP_LIST) @Optional() @SkipSelf()
    public dropContainer: CdkDropList,
    @Inject(DOCUMENT) private _document: any,
    private _ngZone: NgZone,
    private _viewContainerRef: ViewContainerRef,
    private _viewportRuler: ViewportRuler,
    private _dragDropRegistry: DragDropRegistry<DragRef, DropListRef>,
    @Inject(CDK_DRAG_CONFIG) private _config: DragRefConfig,
    @Optional() private _dir: Directionality) {

    const ref = this._dragRef = new DragRef(element, this._document, this._ngZone,
      this._viewContainerRef, this._viewportRuler, this._dragDropRegistry,
      this._config, this.dropContainer ? this.dropContainer._dropListRef : undefined,
      this._dir);
    ref.data = this;
    ref.beforeStarted.subscribe(() => {
      if (!ref.isDragging()) {
        ref.disabled = this.disabled;
        ref.lockAxis = this.lockAxis;
        ref.withBoundaryElement(this._getBoundaryElement());
      }
    });
    this._proxyEvents(ref);
  }

  /**
   * Returns the element that is being used as a placeholder
   * while the current element is being dragged.
   */
  getPlaceholderElement(): HTMLElement {
    return this._dragRef.getPlaceholderElement();
  }

  /** Returns the root draggable element. */
  getRootElement(): HTMLElement {
    return this._dragRef.getRootElement();
  }

  /** Resets a standalone drag item to its initial position. */
  reset(): void {
    this._dragRef.reset();
  }

  ngAfterViewInit() {
    // We need to wait for the zone to stabilize, in order for the reference
    // element to be in the proper place in the DOM. This is mostly relevant
    // for draggable elements inside portals since they get stamped out in
    // their original DOM position and then they get transferred to the portal.
    this._rootElementInitSubscription = this._ngZone.onStable.asObservable()
      .pipe(take(1))
      .subscribe(() => {
        const rootElement = this._getRootElement();

        if (rootElement.nodeType !== this._document.ELEMENT_NODE) {
          throw Error(`cdkDrag must be attached to an element node. ` +
                      `Currently attached to "${rootElement.nodeName}".`);
        }

        this._dragRef
          .withRootElement(rootElement)
          .withPlaceholderTemplate(this._placeholderTemplate)
          .withPreviewTemplate(this._previewTemplate);

        this._handles.changes
          .pipe(startWith(this._handles))
          .subscribe((handleList: QueryList<CdkDragHandle>) => {
            this._dragRef.withHandles(handleList.filter(handle => handle._parentDrag === this));
          });
      });
  }

  ngOnDestroy() {
    this._rootElementInitSubscription.unsubscribe();
    this._dragRef.dispose();
  }

  /** Gets the root draggable element, based on the `rootElementSelector`. */
  private _getRootElement(): HTMLElement {
    const element = this.element.nativeElement;
    const rootElement = this.rootElementSelector ?
        getClosestMatchingAncestor(element, this.rootElementSelector) : null;

    return rootElement || element;
  }

  /** Gets the boundary element, based on the `boundaryElementSelector`. */
  private _getBoundaryElement() {
    const selector = this.boundaryElementSelector;
    return selector ? getClosestMatchingAncestor(this.element.nativeElement, selector) : null;
  }

  /**
   * Proxies the events from a DragRef to events that
   * match the interfaces of the CdkDrag outputs.
   */
  private _proxyEvents(ref: DragRef<CdkDrag<T>>) {
    ref.started.subscribe(() => {
      this.started.emit({source: this});
    });

    ref.ended.subscribe(() => {
      this.ended.emit({source: this});
    });

    ref.entered.subscribe(event => {
      this.entered.emit({
        container: event.container.data,
        item: this
      });
    });

    ref.exited.subscribe(event => {
      this.exited.emit({
        container: event.container.data,
        item: this
      });
    });

    ref.dropped.subscribe(event => {
      this.dropped.emit({
        previousIndex: event.previousIndex,
        currentIndex: event.currentIndex,
        previousContainer: event.previousContainer.data,
        container: event.container.data,
        isPointerOverContainer: event.isPointerOverContainer,
        item: this
      });
    });
  }
}

/** Gets the closest ancestor of an element that matches a selector. */
function getClosestMatchingAncestor(element: HTMLElement, selector: string) {
  let currentElement = element.parentElement as HTMLElement | null;

  while (currentElement) {
    // IE doesn't support `matches` so we have to fall back to `msMatchesSelector`.
    if (currentElement.matches ? currentElement.matches(selector) :
        (currentElement as any).msMatchesSelector(selector)) {
      return currentElement;
    }

    currentElement = currentElement.parentElement;
  }

  return null;
}

