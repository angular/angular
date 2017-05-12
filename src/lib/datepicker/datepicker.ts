import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  EventEmitter,
  Input,
  OnDestroy,
  Optional,
  Output,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import {Overlay} from '../core/overlay/overlay';
import {OverlayRef} from '../core/overlay/overlay-ref';
import {ComponentPortal} from '../core/portal/portal';
import {OverlayState} from '../core/overlay/overlay-state';
import {Dir} from '../core/rtl/dir';
import {MdError} from '../core/errors/error';
import {MdDialog} from '../dialog/dialog';
import {MdDialogRef} from '../dialog/dialog-ref';
import {PositionStrategy} from '../core/overlay/position/position-strategy';
import {
  OriginConnectionPosition,
  OverlayConnectionPosition
} from '../core/overlay/position/connected-position';
import {MdDatepickerInput} from './datepicker-input';
import 'rxjs/add/operator/first';
import {Subscription} from 'rxjs/Subscription';
import {MdDialogConfig} from '../dialog/dialog-config';
import {DateAdapter} from '../core/datetime/index';
import {createMissingDateImplError} from './datepicker-errors';
import {ESCAPE} from '../core/keyboard/keycodes';
import {MdCalendar} from './calendar';


/** Used to generate a unique ID for each datepicker instance. */
let datepickerUid = 0;


/**
 * Component used as the content for the datepicker dialog and popup. We use this instead of using
 * MdCalendar directly as the content so we can control the initial focus. This also gives us a
 * place to put additional features of the popup that are not part of the calendar itself in the
 * future. (e.g. confirmation buttons).
 * @docs-internal
 */
@Component({
  moduleId: module.id,
  selector: 'md-datepicker-content',
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
    switch (event.keyCode) {
      case ESCAPE:
        this.datepicker.close();
        break;
      default:
        // Return so that we don't preventDefault on keys that are not explicitly handled.
        return;
    }

    event.preventDefault();
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
})
export class MdDatepicker<D> implements OnDestroy {
  /** The date to open the calendar to initially. */
  @Input()
  get startAt(): D {
    // If an explicit startAt is set we start there, otherwise we start at whatever the currently
    // selected value is.
    return this._startAt || (this._datepickerInput ? this._datepickerInput.value : null);
  }
  set startAt(date: D) { this._startAt = date; }
  private _startAt: D;

  /** The view that the calendar should start in. */
  @Input() startView: 'month' | 'year' = 'month';

  /**
   * Whether the calendar UI is in touch mode. In touch mode the calendar opens in a dialog rather
   * than a popup and elements have more padding to allow for bigger touch targets.
   */
  @Input() touchUi = false;

  /** Emits new selected date when selected date changes. */
  @Output() selectedChanged = new EventEmitter<D>();

  /** Whether the calendar is open. */
  opened = false;

  /** The id for the datepicker calendar. */
  id = `md-datepicker-${datepickerUid++}`;

  /** The currently selected date. */
  _selected: D = null;

  /** The minimum selectable date. */
  get _minDate(): D {
    return this._datepickerInput && this._datepickerInput.min;
  }

  /** The maximum selectable date. */
  get _maxDate(): D {
    return this._datepickerInput && this._datepickerInput.max;
  }

  get _dateFilter(): (date: D | null) => boolean {
    return this._datepickerInput && this._datepickerInput._dateFilter;
  }

  /** A reference to the overlay when the calendar is opened as a popup. */
  private _popupRef: OverlayRef;

  /** A reference to the dialog when the calendar is opened as a dialog. */
  private _dialogRef: MdDialogRef<any>;

  /** A portal containing the calendar for this datepicker. */
  private _calendarPortal: ComponentPortal<MdDatepickerContent<D>>;

  /** The input element this datepicker is associated with. */
  private _datepickerInput: MdDatepickerInput<D>;

  private _inputSubscription: Subscription;

  constructor(private _dialog: MdDialog, private _overlay: Overlay,
              private _viewContainerRef: ViewContainerRef,
              @Optional() private _dateAdapter: DateAdapter<D>,
              @Optional() private _dir: Dir) {
    if (!this._dateAdapter) {
      throw createMissingDateImplError('DateAdapter');
    }

  }

  ngOnDestroy() {
    this.close();
    if (this._popupRef) {
      this._popupRef.dispose();
    }
    if (this._inputSubscription) {
      this._inputSubscription.unsubscribe();
    }
  }

  /** Selects the given date and closes the currently open popup or dialog. */
  _selectAndClose(date: D): void {
    let oldValue = this._selected;
    this._selected = date;
    if (!this._dateAdapter.sameDate(oldValue, this._selected)) {
      this.selectedChanged.emit(date);
    }
    this.close();
  }

  /**
   * Register an input with this datepicker.
   * @param input The datepicker input to register with this datepicker.
   */
  _registerInput(input: MdDatepickerInput<D>): void {
    if (this._datepickerInput) {
      throw new MdError('An MdDatepicker can only be associated with a single input.');
    }
    this._datepickerInput = input;
    this._inputSubscription =
        this._datepickerInput._valueChange.subscribe((value: D) => this._selected = value);
  }

  /** Open the calendar. */
  open(): void {
    if (this.opened) {
      return;
    }
    if (!this._datepickerInput) {
      throw new MdError('Attempted to open an MdDatepicker with no associated input.');
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
    this.opened = false;
  }

  /** Open the calendar as a dialog. */
  private _openAsDialog(): void {
    let config = new MdDialogConfig();
    config.viewContainerRef = this._viewContainerRef;

    this._dialogRef = this._dialog.open(MdDatepickerContent, config);
    this._dialogRef.afterClosed().first().subscribe(() => this.close());
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
    }

    this._popupRef.backdropClick().first().subscribe(() => this.close());
  }

  /** Create the popup. */
  private _createPopup(): void {
    const overlayState = new OverlayState();
    overlayState.positionStrategy = this._createPopupPositionStrategy();
    overlayState.hasBackdrop = true;
    overlayState.backdropClass = 'md-overlay-transparent-backdrop';
    overlayState.direction = this._dir ? this._dir.value : 'ltr';

    this._popupRef = this._overlay.create(overlayState);
  }

  /** Create the popup PositionStrategy. */
  private _createPopupPositionStrategy(): PositionStrategy {
    let origin = {originX: 'start', originY: 'bottom'} as OriginConnectionPosition;
    let overlay = {overlayX: 'start', overlayY: 'top'} as OverlayConnectionPosition;
    return this._overlay.position().connectedTo(
        this._datepickerInput.getPopupConnectionElementRef(), origin, overlay);
  }
}
