/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  EventEmitter,
  Inject,
  InjectionToken,
  Input,
  NgZone,
  OnDestroy,
  Optional,
  Output,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';
import {first} from '@angular/cdk/rxjs';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {
  Overlay,
  OverlayRef,
  OverlayState,
  PositionStrategy,
  RepositionScrollStrategy,
  // This import is only used to define a generic type. The current TypeScript version incorrectly
  // considers such imports as unused (https://github.com/Microsoft/TypeScript/issues/14953)
  // tslint:disable-next-line:no-unused-variable
  ScrollStrategy,
} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {Directionality} from '@angular/cdk/bidi';
import {ESCAPE} from '@angular/cdk/keycodes';
import {MdDialog} from '../dialog/dialog';
import {MdDialogRef} from '../dialog/dialog-ref';
import {MdDatepickerInput} from './datepicker-input';
import {Subscription} from 'rxjs/Subscription';
import {Subject} from 'rxjs/Subject';
import {DateAdapter} from '../core/datetime/index';
import {createMissingDateImplError} from './datepicker-errors';
import {MdCalendar} from './calendar';


/** Used to generate a unique ID for each datepicker instance. */
let datepickerUid = 0;

/** Injection token that determines the scroll handling while the calendar is open. */
export const MD_DATEPICKER_SCROLL_STRATEGY =
    new InjectionToken<() => ScrollStrategy>('md-datepicker-scroll-strategy');

/** @docs-private */
export function MD_DATEPICKER_SCROLL_STRATEGY_PROVIDER_FACTORY(overlay: Overlay):
    () => RepositionScrollStrategy {
  return () => overlay.scrollStrategies.reposition();
}

/** @docs-private */
export const MD_DATEPICKER_SCROLL_STRATEGY_PROVIDER = {
  provide: MD_DATEPICKER_SCROLL_STRATEGY,
  deps: [Overlay],
  useFactory: MD_DATEPICKER_SCROLL_STRATEGY_PROVIDER_FACTORY,
};


/**
 * Component used as the content for the datepicker dialog and popup. We use this instead of using
 * MdCalendar directly as the content so we can control the initial focus. This also gives us a
 * place to put additional features of the popup that are not part of the calendar itself in the
 * future. (e.g. confirmation buttons).
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'md-datepicker-content, mat-datepicker-content',
  templateUrl: 'datepicker-content.html',
  styleUrls: ['datepicker-content.css'],
  host: {
    'class': 'mat-datepicker-content',
    '[class.mat-datepicker-content-touch]': 'datepicker.touchUi',
    '(keydown)': '_handleKeydown($event)',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdDatepickerContent<D> implements AfterContentInit {
  datepicker: MdDatepicker<D>;

  @ViewChild(MdCalendar) _calendar: MdCalendar<D>;

  ngAfterContentInit() {
    this._calendar._focusActiveCell();
  }

  /**
   * Handles keydown event on datepicker content.
   * @param event The event.
   */
  _handleKeydown(event: KeyboardEvent): void {
    if (event.keyCode === ESCAPE) {
      this.datepicker.close();
      event.preventDefault();
      event.stopPropagation();
    }
  }
}


// TODO(mmalerba): We use a component instead of a directive here so the user can use implicit
// template reference variables (e.g. #d vs #d="mdDatepicker"). We can change this to a directive if
// angular adds support for `exportAs: '$implicit'` on directives.
/** Component responsible for managing the datepicker popup/dialog. */
@Component({
  moduleId: module.id,
  selector: 'md-datepicker, mat-datepicker',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MdDatepicker<D> implements OnDestroy {
  /** The date to open the calendar to initially. */
  @Input()
  get startAt(): D | null {
    // If an explicit startAt is set we start there, otherwise we start at whatever the currently
    // selected value is.
    return this._startAt || (this._datepickerInput ? this._datepickerInput.value : null);
  }
  set startAt(date: D | null) { this._startAt = date; }
  private _startAt: D | null;

  /** The view that the calendar should start in. */
  @Input() startView: 'month' | 'year' = 'month';

  /**
   * Whether the calendar UI is in touch mode. In touch mode the calendar opens in a dialog rather
   * than a popup and elements have more padding to allow for bigger touch targets.
   */
  @Input() touchUi = false;

  /** Whether the datepicker pop-up should be disabled. */
  @Input()
  get disabled() {
    return this._disabled === undefined ? this._datepickerInput.disabled : this._disabled;
  }
  set disabled(value: any) {
    const newValue = coerceBooleanProperty(value);

    if (newValue !== this._disabled) {
      this._disabled = newValue;
      this._disabledChange.next(newValue);
    }
  }
  private _disabled: boolean;

  /**
   * Emits new selected date when selected date changes.
   * @deprecated Switch to the `dateChange` and `dateInput` binding on the input element.
   */
  @Output() selectedChanged = new EventEmitter<D>();

  /** Whether the calendar is open. */
  opened = false;

  /** The id for the datepicker calendar. */
  id = `md-datepicker-${datepickerUid++}`;

  /** The currently selected date. */
  get _selected(): D | null { return this._validSelected; }
  set _selected(value: D | null) { this._validSelected = value; }
  private _validSelected: D | null = null;

  /** The minimum selectable date. */
  get _minDate(): D | null {
    return this._datepickerInput && this._datepickerInput.min;
  }

  /** The maximum selectable date. */
  get _maxDate(): D | null {
    return this._datepickerInput && this._datepickerInput.max;
  }

  get _dateFilter(): (date: D | null) => boolean {
    return this._datepickerInput && this._datepickerInput._dateFilter;
  }

  /** A reference to the overlay when the calendar is opened as a popup. */
  private _popupRef: OverlayRef;

  /** A reference to the dialog when the calendar is opened as a dialog. */
  private _dialogRef: MdDialogRef<any> | null;

  /** A portal containing the calendar for this datepicker. */
  private _calendarPortal: ComponentPortal<MdDatepickerContent<D>>;

  /** The element that was focused before the datepicker was opened. */
  private _focusedElementBeforeOpen: HTMLElement | null = null;

  private _inputSubscription = Subscription.EMPTY;

  /** The input element this datepicker is associated with. */
  _datepickerInput: MdDatepickerInput<D>;

  /** Emits when the datepicker is disabled. */
  _disabledChange = new Subject<boolean>();

  constructor(private _dialog: MdDialog,
              private _overlay: Overlay,
              private _ngZone: NgZone,
              private _viewContainerRef: ViewContainerRef,
              @Inject(MD_DATEPICKER_SCROLL_STRATEGY) private _scrollStrategy,
              @Optional() private _dateAdapter: DateAdapter<D>,
              @Optional() private _dir: Directionality,
              @Optional() @Inject(DOCUMENT) private _document: any) {
    if (!this._dateAdapter) {
      throw createMissingDateImplError('DateAdapter');
    }
  }

  ngOnDestroy() {
    this.close();
    this._inputSubscription.unsubscribe();
    this._disabledChange.complete();

    if (this._popupRef) {
      this._popupRef.dispose();
    }
  }

  /** Selects the given date */
  _select(date: D): void {
    let oldValue = this._selected;
    this._selected = date;
    if (!this._dateAdapter.sameDate(oldValue, this._selected)) {
      this.selectedChanged.emit(date);
    }
  }

  /**
   * Register an input with this datepicker.
   * @param input The datepicker input to register with this datepicker.
   */
  _registerInput(input: MdDatepickerInput<D>): void {
    if (this._datepickerInput) {
      throw Error('An MdDatepicker can only be associated with a single input.');
    }
    this._datepickerInput = input;
    this._inputSubscription =
        this._datepickerInput._valueChange.subscribe((value: D | null) => this._selected = value);
  }

  /** Open the calendar. */
  open(): void {
    if (this.opened || this.disabled) {
      return;
    }
    if (!this._datepickerInput) {
      throw Error('Attempted to open an MdDatepicker with no associated input.');
    }
    if (this._document) {
      this._focusedElementBeforeOpen = this._document.activeElement;
    }

    this.touchUi ? this._openAsDialog() : this._openAsPopup();
    this.opened = true;
  }

  /** Close the calendar. */
  close(): void {
    if (!this.opened) {
      return;
    }
    if (this._popupRef && this._popupRef.hasAttached()) {
      this._popupRef.detach();
    }
    if (this._dialogRef) {
      this._dialogRef.close();
      this._dialogRef = null;
    }
    if (this._calendarPortal && this._calendarPortal.isAttached) {
      this._calendarPortal.detach();
    }
    if (this._focusedElementBeforeOpen &&
      typeof this._focusedElementBeforeOpen.focus === 'function') {

      this._focusedElementBeforeOpen.focus();
      this._focusedElementBeforeOpen = null;
    }

    this.opened = false;
  }

  /** Open the calendar as a dialog. */
  private _openAsDialog(): void {
    this._dialogRef = this._dialog.open(MdDatepickerContent, {
      direction: this._dir ? this._dir.value : 'ltr',
      viewContainerRef: this._viewContainerRef,
    });
    this._dialogRef.afterClosed().subscribe(() => this.close());
    this._dialogRef.componentInstance.datepicker = this;
  }

  /** Open the calendar as a popup. */
  private _openAsPopup(): void {
    if (!this._calendarPortal) {
      this._calendarPortal = new ComponentPortal(MdDatepickerContent, this._viewContainerRef);
    }

    if (!this._popupRef) {
      this._createPopup();
    }

    if (!this._popupRef.hasAttached()) {
      let componentRef: ComponentRef<MdDatepickerContent<D>> =
          this._popupRef.attach(this._calendarPortal);
      componentRef.instance.datepicker = this;

      // Update the position once the calendar has rendered.
      first.call(this._ngZone.onStable.asObservable()).subscribe(() => {
        this._popupRef.updatePosition();
      });
    }

    this._popupRef.backdropClick().subscribe(() => this.close());
  }

  /** Create the popup. */
  private _createPopup(): void {
    const overlayState = new OverlayState({
      positionStrategy: this._createPopupPositionStrategy(),
      hasBackdrop: true,
      backdropClass: 'md-overlay-transparent-backdrop',
      direction: this._dir ? this._dir.value : 'ltr',
      scrollStrategy: this._scrollStrategy()
    });

    this._popupRef = this._overlay.create(overlayState);
  }

  /** Create the popup PositionStrategy. */
  private _createPopupPositionStrategy(): PositionStrategy {
    return this._overlay.position()
      .connectedTo(this._datepickerInput.getPopupConnectionElementRef(),
        {originX: 'start', originY: 'bottom'},
        {overlayX: 'start', overlayY: 'top'}
      )
      .withFallbackPosition(
        { originX: 'start', originY: 'top' },
        { overlayX: 'start', overlayY: 'bottom' }
      )
      .withFallbackPosition(
        {originX: 'end', originY: 'bottom'},
        {overlayX: 'end', overlayY: 'top'}
      )
      .withFallbackPosition(
        { originX: 'end', originY: 'top' },
        { overlayX: 'end', overlayY: 'bottom' }
      );
  }
}
