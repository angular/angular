/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {FocusTrap} from '@angular/cdk/a11y';
import {OverlayRef, PositionStrategy} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {
  AfterViewInit,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  NgZone,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  HostListener,
} from '@angular/core';
import {fromEvent, fromEventPattern, merge, ReplaySubject} from 'rxjs';
import {
  filter,
  map,
  mapTo,
  share,
  startWith,
  takeUntil,
  throttleTime,
  withLatestFrom,
} from 'rxjs/operators';

import {CELL_SELECTOR, EDIT_PANE_CLASS, EDIT_PANE_SELECTOR, ROW_SELECTOR} from './constants';
import {EditEventDispatcher, HoverContentState} from './edit-event-dispatcher';
import {EditServices} from './edit-services';
import {FocusDispatcher} from './focus-dispatcher';
import {
  FocusEscapeNotifier,
  FocusEscapeNotifierDirection,
  FocusEscapeNotifierFactory
} from './focus-escape-notifier';
import {closest} from './polyfill';

/**
 * Describes the number of columns before and after the originating cell that the
 * edit popup should span. In left to right locales, before means left and after means
 * right. In right to left locales before means right and after means left.
 */
export interface CdkPopoverEditColspan {
  before?: number;
  after?: number;
}

/** Used for rate-limiting mousemove events. */
const MOUSE_MOVE_THROTTLE_TIME_MS = 10;

/**
 * A directive that must be attached to enable editability on a table.
 * It is responsible for setting up delegated event handlers and providing the
 * EditEventDispatcher service for use by the other edit directives.
 */
@Directive({
  selector: 'table[editable], cdk-table[editable], mat-table[editable]',
  providers: [EditEventDispatcher, EditServices],
})
export class CdkEditable implements AfterViewInit, OnDestroy {
  protected readonly destroyed = new ReplaySubject<void>();

  constructor(
      protected readonly elementRef: ElementRef,
      protected readonly editEventDispatcher: EditEventDispatcher,
      protected readonly focusDispatcher: FocusDispatcher, protected readonly ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this._listenForTableEvents();
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private _listenForTableEvents(): void {
    const element = this.elementRef.nativeElement!;

    const toClosest = (selector: string) =>
        map((event: UIEvent) => closest(event.target, selector));

    this.ngZone.runOutsideAngular(() => {
      // Track mouse movement over the table to hide/show hover content.
      fromEvent<MouseEvent>(element, 'mouseover').pipe(
          takeUntil(this.destroyed),
          toClosest(ROW_SELECTOR),
          ).subscribe(this.editEventDispatcher.hovering);
      fromEvent<MouseEvent>(element, 'mouseleave').pipe(
          takeUntil(this.destroyed),
          mapTo(null),
          ).subscribe(this.editEventDispatcher.hovering);
      fromEvent<MouseEvent>(element, 'mousemove').pipe(
          takeUntil(this.destroyed),
          throttleTime(MOUSE_MOVE_THROTTLE_TIME_MS),
          toClosest(ROW_SELECTOR),
          ).subscribe(this.editEventDispatcher.mouseMove);

      // Track focus within the table to hide/show/make focusable hover content.
      fromEventPattern<FocusEvent>(
          (handler) => element.addEventListener('focus', handler, true),
          (handler) => element.removeEventListener('focus', handler, true)
          ).pipe(
              takeUntil(this.destroyed),
              toClosest(ROW_SELECTOR),
              share(),
              ).subscribe(this.editEventDispatcher.focused);
      fromEventPattern<FocusEvent>(
          (handler) => element.addEventListener('blur', handler, true),
          (handler) => element.removeEventListener('blur', handler, true)
          ).pipe(
              takeUntil(this.destroyed),
              mapTo(null),
              share(),
              ).subscribe(this.editEventDispatcher.focused);

      // Keep track of rows within the table. This is used to know which rows with hover content
      // are first or last in the table. They are kept focusable in case focus enters from above
      // or below the table.
      this.ngZone.onStable.pipe(
          takeUntil(this.destroyed),
          // Optimization: ignore dom changes while focus is within the table as we already
          // ensure that rows above and below the focused/active row are tabbable.
          withLatestFrom(this.editEventDispatcher.editingOrFocused),
          filter(([_, activeRow]) => activeRow == null),
          map(() => element.querySelectorAll(ROW_SELECTOR)),
          share(),
          ).subscribe(this.editEventDispatcher.allRows);

      fromEvent<KeyboardEvent>(element, 'keyup').pipe(
          takeUntil(this.destroyed),
          filter(event => event.key === 'Enter'),
          toClosest(CELL_SELECTOR),
          ).subscribe(this.editEventDispatcher.editing);

      // Keydown must be used here or else key autorepeat does not work properly on some platforms.
      fromEvent<KeyboardEvent>(element, 'keydown')
          .pipe(takeUntil(this.destroyed))
          .subscribe(this.focusDispatcher.keyObserver);
    });
  }
}

const POPOVER_EDIT_HOST_BINDINGS = {
  'tabIndex': '0',
  'class': 'cdk-popover-edit-cell',
  '[attr.aria-haspopup]': 'true',
};

const POPOVER_EDIT_INPUTS = [
  'template: cdkPopoverEdit',
  'context: cdkPopoverEditContext',
  'colspan: cdkPopoverEditColspan',
];

/**
 * Attaches an ng-template to a cell and shows it when instructed to by the
 * EditEventDispatcher service.
 * Makes the cell focusable.
 */
@Directive({
  selector: '[cdkPopoverEdit]:not([cdkPopoverEditTabOut])',
  host: POPOVER_EDIT_HOST_BINDINGS,
  inputs: POPOVER_EDIT_INPUTS,
})
export class CdkPopoverEdit<C> implements AfterViewInit, OnDestroy {
  /** The edit lens template shown over the cell on edit. */
  template: TemplateRef<any>|null = null;

  /**
   * Implicit context to pass along to the template. Can be omitted if the template
   * is defined within the cell.
   */
  context?: C;

  /**
   * Specifies that the popup should cover additional table cells before and/or after
   * this one.
   */
  get colspan(): CdkPopoverEditColspan {
    return this._colspan;
  }
  set colspan(value: CdkPopoverEditColspan) {
    this._colspan = value;

    // Recompute positioning when the colspan changes.
    if (this.overlayRef) {
      this.overlayRef.updatePositionStrategy(this._getPositionStrategy());

      if (this.overlayRef.hasAttached()) {
        this._updateOverlaySize();
      }
    }
  }
  private _colspan: CdkPopoverEditColspan = {};

  protected focusTrap?: FocusTrap;
  protected overlayRef?: OverlayRef;
  protected readonly destroyed = new ReplaySubject<void>();

  constructor(
      protected readonly services: EditServices, protected readonly elementRef: ElementRef,
      protected readonly viewContainerRef: ViewContainerRef) {}

  ngAfterViewInit(): void {
    this._startListeningToEditEvents();
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();

    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
  }

  protected initFocusTrap(): void {
    this.focusTrap = this.services.focusTrapFactory.create(this.overlayRef!.overlayElement);
  }

  protected closeEditOverlay(): void {
    this.services.editEventDispatcher.doneEditingCell(this.elementRef.nativeElement!);
  }

  protected panelClass(): string {
    return EDIT_PANE_CLASS;
  }

  private _startListeningToEditEvents(): void {
    this.services.editEventDispatcher.editingCell(this.elementRef.nativeElement!)
        .pipe(takeUntil(this.destroyed))
        .subscribe((open) => {
          if (open && this.template) {
            if (!this.overlayRef) {
              this._createEditOverlay();
            }

            this._showEditOverlay();
          } else if (this.overlayRef) {
            this._maybeReturnFocusToCell();

            this.overlayRef.detach();
          }
        });
  }

  private _createEditOverlay(): void {
    this.overlayRef = this.services.overlay.create({
      disposeOnNavigation: true,
      panelClass: this.panelClass(),
      positionStrategy: this._getPositionStrategy(),
      scrollStrategy: this.services.overlay.scrollStrategies.reposition(),
      direction: this.services.directionality,
    });

    this.initFocusTrap();
    this.overlayRef.overlayElement.setAttribute('aria-role', 'dialog');

    this.overlayRef.detachments().subscribe(() => this.closeEditOverlay());
  }

  private _showEditOverlay(): void {
    this.overlayRef!.attach(new TemplatePortal(
        this.template!,
        this.viewContainerRef,
        {$implicit: this.context}));
    this.focusTrap!.focusInitialElement();

    // Update the size of the popup initially and on subsequent changes to
    // scroll position and viewport size.
    merge(this.services.scrollDispatcher.scrolled(), this.services.viewportRuler.change())
        .pipe(
            startWith(null),
            takeUntil(this.overlayRef!.detachments()),
            takeUntil(this.destroyed),
            )
        .subscribe(() => {
          this._updateOverlaySize();
        });
  }

  private _getOverlayCells(): HTMLElement[] {
    const cell = closest(this.elementRef.nativeElement!, CELL_SELECTOR) as HTMLElement;

    if (!this._colspan.before && !this._colspan.after) {
      return [cell];
    }

    const row = closest(this.elementRef.nativeElement!, ROW_SELECTOR)!;
    const rowCells = Array.from(row.querySelectorAll(CELL_SELECTOR)) as HTMLElement[];
    const ownIndex = rowCells.indexOf(cell);

    return rowCells.slice(
        ownIndex - (this._colspan.before || 0), ownIndex + (this._colspan.after || 0) + 1);
  }

  private _getPositionStrategy(): PositionStrategy {
    return this.services.positionFactory.positionStrategyForCells(this._getOverlayCells());
  }

  private _updateOverlaySize(): void {
    this.overlayRef!.updateSize(
        this.services.positionFactory.sizeConfigForCells(this._getOverlayCells()));
  }

  private _maybeReturnFocusToCell(): void {
    if (closest(document.activeElement, EDIT_PANE_SELECTOR) ===
        this.overlayRef!.overlayElement) {
      this.elementRef.nativeElement!.focus();
    }
  }
}

/**
 * Attaches an ng-template to a cell and shows it when instructed to by the
 * EditEventDispatcher service.
 * Makes the cell focusable.
 */
@Directive({
  selector: '[cdkPopoverEdit][cdkPopoverEditTabOut]',
  host: POPOVER_EDIT_HOST_BINDINGS,
  inputs: POPOVER_EDIT_INPUTS,
})
export class CdkPopoverEditTabOut<C> extends CdkPopoverEdit<C> {
  protected focusTrap?: FocusEscapeNotifier;

  constructor(
      elementRef: ElementRef, viewContainerRef: ViewContainerRef, services: EditServices,
      protected readonly focusEscapeNotifierFactory: FocusEscapeNotifierFactory) {
    super(services, elementRef, viewContainerRef);
  }

  protected initFocusTrap(): void {
    this.focusTrap = this.focusEscapeNotifierFactory.create(this.overlayRef!.overlayElement);

    this.focusTrap.escapes().pipe(takeUntil(this.destroyed)).subscribe(direction => {
      if (this.services.editEventDispatcher.editRef) {
        this.services.editEventDispatcher.editRef.blur();
      }

      this.services.focusDispatcher.moveFocusHorizontally(
          closest(this.elementRef.nativeElement!, CELL_SELECTOR) as HTMLElement,
          direction === FocusEscapeNotifierDirection.START ? -1 : 1);

      this.closeEditOverlay();
    });
  }
}

/**
 * A structural directive that shows its contents when the table row containing
 * it is hovered or when an element in the row has focus.
 */
@Directive({
  selector: '[cdkRowHoverContent]',
})
export class CdkRowHoverContent implements AfterViewInit, OnDestroy {
  protected readonly destroyed = new ReplaySubject<void>();
  protected viewRef: EmbeddedViewRef<any>|null = null;

  private _row?: Element;

  constructor(
      protected readonly services: EditServices, protected readonly elementRef: ElementRef,
      protected readonly templateRef: TemplateRef<any>,
      protected readonly viewContainerRef: ViewContainerRef) {}

  ngAfterViewInit(): void {
    this._row = closest(this.elementRef.nativeElement!, ROW_SELECTOR)!;

    this.services.editEventDispatcher.registerRowWithHoverContent(this._row);
    this._listenForHoverAndFocusEvents();
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();

    if (this.viewRef) {
      this.viewRef.destroy();
    }

    if (this._row) {
      this.services.editEventDispatcher.deregisterRowWithHoverContent(this._row);
    }
  }

  /**
   * Called immediately after the hover content is created and added to the dom.
   * In the CDK version, this is a noop but subclasses such as MatRowHoverContent use this
   * to prepare/style the inserted element.
   */
  protected initElement(_: HTMLElement): void {
  }

  /**
   * Called when the hover content needs to be focusable to preserve a reasonable tab ordering
   * but should not yet be shown.
   */
  protected makeElementHiddenButFocusable(element: HTMLElement): void {
    element.style.opacity = '0';
  }

  /**
   * Called when the hover content needs to be focusable to preserve a reasonable tab ordering
   * but should not yet be shown.
   */
  protected makeElementVisible(element: HTMLElement): void {
    element.style.opacity = '';
  }

  private _listenForHoverAndFocusEvents(): void {
    this.services.editEventDispatcher.hoverOrFocusOnRow(this._row!)
        .pipe(takeUntil(this.destroyed))
        .subscribe(eventState => {
          // When in FOCUSABLE state, add the hover content to the dom but make it transparent so
          // that it is in the tab order relative to the currently focused row.

          if (eventState === HoverContentState.ON || eventState === HoverContentState.FOCUSABLE) {
            if (!this.viewRef) {
              this.viewRef = this.viewContainerRef.createEmbeddedView(this.templateRef, {});
              this.initElement(this.viewRef.rootNodes[0] as HTMLElement);
            } else if (this.viewContainerRef.indexOf(this.viewRef) === -1) {
              this.viewContainerRef.insert(this.viewRef!);
            }

            if (eventState === HoverContentState.ON) {
              this.makeElementVisible(this.viewRef.rootNodes[0] as HTMLElement);
            } else {
              this.makeElementHiddenButFocusable(this.viewRef.rootNodes[0] as HTMLElement);
            }
          } else if (this.viewRef) {
            this.viewContainerRef.detach(this.viewContainerRef.indexOf(this.viewRef));
          }
        });
  }
}

/**
 * Opens the closest edit popover to this element, whether it's associated with this exact
 * element or an ancestor element.
 */
@Directive({
  selector: '[cdkEditOpen]',
})
export class CdkEditOpen {
  constructor(
      protected readonly elementRef: ElementRef<HTMLElement>,
      protected readonly editEventDispatcher: EditEventDispatcher) {

    const nativeElement = elementRef.nativeElement;

    // Prevent accidental form submits.
    if (nativeElement.nodeName === 'BUTTON' && !nativeElement.getAttribute('type')) {
      nativeElement.setAttribute('type', 'button');
    }
  }

  // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
  // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
  // can move this back into `host`.
  // tslint:disable:no-host-decorator-in-concrete
  @HostListener('click', ['$event'])
  openEdit(evt: Event): void {
    this.editEventDispatcher.editing.next(closest(this.elementRef.nativeElement!, CELL_SELECTOR));
    evt.stopPropagation();
  }
}
