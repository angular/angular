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
import {fromEvent, merge, ReplaySubject} from 'rxjs';
import {debounceTime, filter, map, mapTo, startWith, takeUntil} from 'rxjs/operators';

import {CELL_SELECTOR, EDIT_PANE_CLASS, EDIT_PANE_SELECTOR, ROW_SELECTOR} from './constants';
import {EditEventDispatcher} from './edit-event-dispatcher';
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

/**
 * The delay between the mouse entering a row and the mouse stopping its movement before
 * showing on-hover content.
 */
const DEFAULT_MOUSE_MOVE_DELAY_MS = 30;

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
          debounceTime(DEFAULT_MOUSE_MOVE_DELAY_MS),
          toClosest(ROW_SELECTOR),
          ).subscribe(this.editEventDispatcher.mouseMove);

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
          this.services.ngZone.run(() => {
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
    this.focusTrap!.focusInitialElementWhenReady();

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
 * it is hovered.
 *
 * Note that the contents of this directive are invisible to screen readers.
 * Typically this is used to show a button that launches the edit popup, which
 * is ok because screen reader users can trigger edit by pressing Enter on a focused
 * table cell.
 *
 * If this directive contains buttons for functionality other than opening edit then
 * care should be taken to make sure that this functionality is also exposed in
 * an accessible way.
 */
@Directive({
  selector: '[cdkRowHoverContent]',
})
export class CdkRowHoverContent implements AfterViewInit, OnDestroy {
  protected readonly destroyed = new ReplaySubject<void>();
  protected viewRef: EmbeddedViewRef<any>|null = null;

  constructor(
      protected readonly services: EditServices, protected readonly elementRef: ElementRef,
      protected readonly templateRef: TemplateRef<any>,
      protected readonly viewContainerRef: ViewContainerRef) {}

  ngAfterViewInit(): void {
    this._listenForHoverEvents();
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();

    if (this.viewRef) {
      this.viewRef.destroy();
    }
  }

  protected initElement(element: HTMLElement): void;
  protected initElement(): void {
  }

  protected prepareElement(element: HTMLElement): void;
  protected prepareElement(): void {
  }

  private _listenForHoverEvents(): void {
    this.services.editEventDispatcher.hoveringOnRow(this.elementRef.nativeElement!)
        .pipe(takeUntil(this.destroyed))
        .subscribe(isHovering => {
          this.services.ngZone.run(() => {
            if (isHovering) {
              if (!this.viewRef) {
                // Not doing any positioning in CDK version. Material version
                // will absolutely position on right edge of cell.
                this.viewRef = this.viewContainerRef.createEmbeddedView(this.templateRef, {});
                this.initElement(this.viewRef.rootNodes[0] as HTMLElement);
              } else {
                this.viewContainerRef.insert(this.viewRef);
              }
              this.prepareElement(this.viewRef.rootNodes[0] as HTMLElement);
            } else if (this.viewRef) {
              this.viewContainerRef.detach(this.viewContainerRef.indexOf(this.viewRef));
            }
          });
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
