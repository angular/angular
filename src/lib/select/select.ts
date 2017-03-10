import {
  AfterContentInit,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Optional,
  Output,
  QueryList,
  Renderer,
  Self,
  ViewEncapsulation,
  ViewChild,
  ChangeDetectorRef,
  Attribute,
} from '@angular/core';
import {MdOption, MdOptionSelectionChange} from '../core/option/option';
import {ENTER, SPACE} from '../core/keyboard/keycodes';
import {FocusKeyManager} from '../core/a11y/focus-key-manager';
import {Dir} from '../core/rtl/dir';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {transformPlaceholder, transformPanel, fadeInContent} from './select-animations';
import {ControlValueAccessor, NgControl} from '@angular/forms';
import {coerceBooleanProperty} from '../core/coercion/boolean-property';
import {ConnectedOverlayDirective} from '../core/overlay/overlay-directives';
import {ViewportRuler} from '../core/overlay/position/viewport-ruler';
import {SelectionModel} from '../core/selection/selection';
import {MdSelectDynamicMultipleError, MdSelectNonArrayValueError} from './select-errors';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/startWith';


/**
 * The following style constants are necessary to save here in order
 * to properly calculate the alignment of the selected option over
 * the trigger element.
 */

/** The fixed height of every option element. */
export const SELECT_OPTION_HEIGHT = 48;

/** The max height of the select's overlay panel */
export const SELECT_PANEL_MAX_HEIGHT = 256;

/** The max number of options visible at once in the select panel. */
export const SELECT_MAX_OPTIONS_DISPLAYED = 5;

/** The fixed height of the select's trigger element. */
export const SELECT_TRIGGER_HEIGHT = 30;

/**
 * Must adjust for the difference in height between the option and the trigger,
 * so the text will align on the y axis.
 * (SELECT_OPTION_HEIGHT (48) - SELECT_TRIGGER_HEIGHT (30)) / 2 = 9
 */
export const SELECT_OPTION_HEIGHT_ADJUSTMENT = 9;

/** The panel's padding on the x-axis */
export const SELECT_PANEL_PADDING_X = 16;

/**
 * Distance between the panel edge and the option text in
 * multi-selection mode.
 *
 * (SELECT_PADDING * 1.75) + 20 = 48
 * The padding is multiplied by 1.75 because the checkbox's margin is half the padding, and
 * the browser adds ~4px, because we're using inline elements.
 * The checkbox width is 20px.
 */
export const SELECT_MULTIPLE_PANEL_PADDING_X = SELECT_PANEL_PADDING_X * 1.75 + 20;

/**
 * The panel's padding on the y-axis. This padding indicates there are more
 * options available if you scroll.
 */
export const SELECT_PANEL_PADDING_Y = 16;

/**
 * The select panel will only "fit" inside the viewport if it is positioned at
 * this value or more away from the viewport boundary.
 */
export const SELECT_PANEL_VIEWPORT_PADDING = 8;

/** Change event object that is emitted when the select value has changed. */
export class MdSelectChange {
  constructor(public source: MdSelect, public value: any) { }
}

/** Allowed values for the floatPlaceholder option. */
export type MdSelectFloatPlaceholderType = 'always' | 'never' | 'auto';

@Component({
  moduleId: module.id,
  selector: 'md-select, mat-select',
  templateUrl: 'select.html',
  styleUrls: ['select.css'],
  encapsulation: ViewEncapsulation.None,
  host: {
    'role': 'listbox',
    '[attr.tabindex]': 'tabIndex',
    '[attr.aria-label]': 'placeholder',
    '[attr.aria-required]': 'required.toString()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-invalid]': '_control?.invalid || "false"',
    '[attr.aria-owns]': '_optionIds',
    '[class.mat-select-disabled]': 'disabled',
    '[class.mat-select]': 'true',
    '(keydown)': '_handleKeydown($event)',
    '(blur)': '_onBlur()'
  },
  animations: [
    transformPlaceholder,
    transformPanel,
    fadeInContent
  ],
  exportAs: 'mdSelect',
})
export class MdSelect implements AfterContentInit, ControlValueAccessor, OnDestroy {
  /** Whether or not the overlay panel is open. */
  private _panelOpen = false;

  /** Subscriptions to option events. */
  private _optionSubscription: Subscription;

  /** Subscription to changes in the option list. */
  private _changeSubscription: Subscription;

  /** Subscription to tab events while overlay is focused. */
  private _tabSubscription: Subscription;

  /** Whether filling out the select is required in the form.  */
  private _required: boolean = false;

  /** Whether the select is disabled.  */
  private _disabled: boolean = false;

  /** The scroll position of the overlay panel, calculated to center the selected option. */
  private _scrollTop = 0;

  /** The placeholder displayed in the trigger of the select. */
  private _placeholder: string;

  /** Whether the component is in multiple selection mode. */
  private _multiple: boolean = false;

  /** Deals with the selection logic. */
  _selectionModel: SelectionModel<MdOption>;

  /** The animation state of the placeholder. */
  private _placeholderState = '';

  /** Tab index for the element. */
  private _tabIndex: number;

  /**
   * The width of the trigger. Must be saved to set the min width of the overlay panel
   * and the width of the selected value.
   */
  _triggerWidth: number;

  /**
   * The width of the selected option's value. Must be set programmatically
   * to ensure its overflow is clipped, as it's absolutely positioned.
   */
  _selectedValueWidth: number;

  /** Manages keyboard events for options in the panel. */
  _keyManager: FocusKeyManager;

  /** View -> model callback called when value changes */
  _onChange = (value: any) => {};

  /** View -> model callback called when select has been touched */
  _onTouched = () => {};

  /** The IDs of child options to be passed to the aria-owns attribute. */
  _optionIds: string = '';

  /** The value of the select panel's transform-origin property. */
  _transformOrigin: string = 'top';

  /** Whether the panel's animation is done. */
  _panelDoneAnimating: boolean = false;

  /**
   * The x-offset of the overlay panel in relation to the trigger's top start corner.
   * This must be adjusted to align the selected option text over the trigger text when
   * the panel opens. Will change based on LTR or RTL text direction.
   */
  _offsetX = 0;

  /**
   * The y-offset of the overlay panel in relation to the trigger's top start corner.
   * This must be adjusted to align the selected option text over the trigger text.
   * when the panel opens. Will change based on the y-position of the selected option.
   */
  _offsetY = 0;

  /**
   * This position config ensures that the top "start" corner of the overlay
   * is aligned with with the top "start" of the origin by default (overlapping
   * the trigger completely). If the panel cannot fit below the trigger, it
   * will fall back to a position above the trigger.
   */
  _positions = [
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'top',
    },
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'bottom',
    },
  ];

  /** Trigger that opens the select. */
  @ViewChild('trigger') trigger: ElementRef;

  /** Overlay pane containing the options. */
  @ViewChild(ConnectedOverlayDirective) overlayDir: ConnectedOverlayDirective;

  /** All of the defined select options. */
  @ContentChildren(MdOption) options: QueryList<MdOption>;

  /** Placeholder to be shown if no value has been selected. */
  @Input()
  get placeholder() { return this._placeholder; }
  set placeholder(value: string) {
    this._placeholder = value;

    // Must wait to record the trigger width to ensure placeholder width is included.
    Promise.resolve(null).then(() => this._triggerWidth = this._getWidth());
  }

  /** Whether the component is disabled. */
  @Input()
  get disabled() { return this._disabled; }
  set disabled(value: any) {
    this._disabled = coerceBooleanProperty(value);
  }

  /** Whether the component is required. */
  @Input()
  get required() { return this._required; }
  set required(value: any) { this._required = coerceBooleanProperty(value); }

  /** Whether the user should be allowed to select multiple options. */
  @Input()
  get multiple(): boolean { return this._multiple; }
  set multiple(value: boolean) {
    if (this._selectionModel) {
      throw new MdSelectDynamicMultipleError();
    }

    this._multiple = coerceBooleanProperty(value);
  }

  /** Whether to float the placeholder text. */
  @Input()
  get floatPlaceholder(): MdSelectFloatPlaceholderType { return this._floatPlaceholder; }
  set floatPlaceholder(value: MdSelectFloatPlaceholderType) {
    this._floatPlaceholder = value || 'auto';
  }
  private _floatPlaceholder: MdSelectFloatPlaceholderType = 'auto';

  /** Tab index for the select element. */
  @Input()
  get tabIndex(): number { return this._disabled ? -1 : this._tabIndex; }
  set tabIndex(value: number) {
    if (typeof value !== 'undefined') {
      this._tabIndex = value;
    }
  }

  /** Combined stream of all of the child options' change events. */
  get optionSelectionChanges(): Observable<MdOptionSelectionChange> {
    return Observable.merge(...this.options.map(option => option.onSelectionChange));
  }

  /** Event emitted when the select has been opened. */
  @Output() onOpen: EventEmitter<void> = new EventEmitter<void>();

  /** Event emitted when the select has been closed. */
  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();

  /** Event emitted when the selected value has been changed by the user. */
  @Output() change: EventEmitter<MdSelectChange> = new EventEmitter<MdSelectChange>();

  constructor(private _element: ElementRef, private _renderer: Renderer,
              private _viewportRuler: ViewportRuler, private _changeDetectorRef: ChangeDetectorRef,
              @Optional() private _dir: Dir, @Self() @Optional() public _control: NgControl,
              @Attribute('tabindex') tabIndex: string) {
    if (this._control) {
      this._control.valueAccessor = this;
    }

    this._tabIndex = parseInt(tabIndex) || 0;
  }

  ngAfterContentInit() {
    this._selectionModel = new SelectionModel<MdOption>(this.multiple, null, false);
    this._initKeyManager();

    this._changeSubscription = this.options.changes.startWith(null).subscribe(() => {
      this._resetOptions();

      if (this._control) {
        // Defer setting the value in order to avoid the "Expression
        // has changed after it was checked" errors from Angular.
        Promise.resolve(null).then(() => this._setSelectionByValue(this._control.value));
      }
    });
  }

  ngOnDestroy() {
    this._dropSubscriptions();

    if (this._changeSubscription) {
      this._changeSubscription.unsubscribe();
    }

    if (this._tabSubscription) {
      this._tabSubscription.unsubscribe();
    }
  }

  /** Toggles the overlay panel open or closed. */
  toggle(): void {
    this.panelOpen ? this.close() : this.open();
  }

  /** Opens the overlay panel. */
  open(): void {
    if (this.disabled || !this.options.length) {
      return;
    }
    this._calculateOverlayPosition();
    this._placeholderState = this._floatPlaceholderState();
    this._panelOpen = true;
  }

  /** Closes the overlay panel and focuses the host element. */
  close(): void {
    if (this._panelOpen) {
      this._panelOpen = false;
      if (this._selectionModel.isEmpty()) {
        this._placeholderState = '';
      }
      this._focusHost();
    }
  }

  /**
   * Sets the select's value. Part of the ControlValueAccessor interface
   * required to integrate with Angular's core forms API.
   *
   * @param value New value to be written to the model.
   */
  writeValue(value: any): void {
    if (this.options) {
      this._setSelectionByValue(value);
    }
  }

  /**
   * Saves a callback function to be invoked when the select's value
   * changes from user input. Part of the ControlValueAccessor interface
   * required to integrate with Angular's core forms API.
   *
   * @param fn Callback to be triggered when the value changes.
   */
  registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }

  /**
   * Saves a callback function to be invoked when the select is blurred
   * by the user. Part of the ControlValueAccessor interface required
   * to integrate with Angular's core forms API.
   *
   * @param fn Callback to be triggered when the component has been touched.
   */
  registerOnTouched(fn: () => {}): void {
    this._onTouched = fn;
  }

  /**
   * Disables the select. Part of the ControlValueAccessor interface required
   * to integrate with Angular's core forms API.
   *
   * @param isDisabled Sets whether the component is disabled.
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /** Whether or not the overlay panel is open. */
  get panelOpen(): boolean {
    return this._panelOpen;
  }

  /** The currently selected option. */
  get selected(): MdOption | MdOption[] {
    return this.multiple ? this._selectionModel.selected : this._selectionModel.selected[0];
  }

  /** The value displayed in the trigger. */
  get triggerValue(): string {
    return this.multiple ?
      this._selectionModel.selected.map(option => option.viewValue).join(', ') :
      this._selectionModel.selected[0].viewValue;
  }

  /** Whether the element is in RTL mode. */
  _isRtl(): boolean {
    return this._dir ? this._dir.value === 'rtl' : false;
  }

  /** The width of the trigger element. This is necessary to match
   * the overlay width to the trigger width.
   */
  _getWidth(): number {
    return this._getTriggerRect().width;
  }

  /** Ensures the panel opens if activated by the keyboard. */
  _handleKeydown(event: KeyboardEvent): void {
    if (event.keyCode === ENTER || event.keyCode === SPACE) {
      this.open();
    }
  }

  /**
   * When the panel element is finished transforming in (though not fading in), it
   * emits an event and focuses an option if the panel is open.
   */
  _onPanelDone(): void {
    if (this.panelOpen) {
      this._focusCorrectOption();
      this.onOpen.emit();
    } else {
      this.onClose.emit();
    }
  }

  /**
   * When the panel content is done fading in, the _panelDoneAnimating property is
   * set so the proper class can be added to the panel.
   */
  _onFadeInDone(): void {
    this._panelDoneAnimating = this.panelOpen;
  }

  /**
   * Calls the touched callback only if the panel is closed. Otherwise, the trigger will
   * "blur" to the panel when it opens, causing a false positive.
   */
  _onBlur() {
    if (!this.panelOpen) {
      this._onTouched();
    }
  }

  /**
   * Sets the scroll position of the scroll container. This must be called after
   * the overlay pane is attached or the scroll container element will not yet be
   * present in the DOM.
   */
  _setScrollTop(): void {
    const scrollContainer =
        this.overlayDir.overlayRef.overlayElement.querySelector('.mat-select-panel');
    scrollContainer.scrollTop = this._scrollTop;
  }

  /**
   * Sets the selected option based on a value. If no option can be
   * found with the designated value, the select trigger is cleared.
   */
  private _setSelectionByValue(value: any | any[]): void {
    const isArray = Array.isArray(value);

    if (this.multiple && value && !isArray) {
      throw new MdSelectNonArrayValueError();
    }

    if (isArray) {
      this._clearSelection();
      value.forEach((currentValue: any) => this._selectValue(currentValue));
      this._sortValues();
    } else if (!this._selectValue(value)) {
      this._clearSelection();
    }

    this._setValueWidth();

    if (this._selectionModel.isEmpty()) {
      this._placeholderState = '';
    }

    this._changeDetectorRef.markForCheck();
  }

  /**
   * Finds and selects and option based on its value.
   * @returns Option that has the corresponding value.
   */
  private _selectValue(value: any): MdOption {
    let correspondingOption = this.options.find(option => option.value === value);

    if (correspondingOption) {
      correspondingOption.select();
      this._selectionModel.select(correspondingOption);
    }

    return correspondingOption;
  }

  /**
   * Clears the select trigger and deselects every option in the list.
   * @param skip Option that should not be deselected.
   */
  private _clearSelection(skip?: MdOption): void {
    this._selectionModel.clear();
    this.options.forEach(option => {
      if (option !== skip) {
        option.deselect();
      }
    });
  }

  private _getTriggerRect(): ClientRect {
    return this.trigger.nativeElement.getBoundingClientRect();
  }

  /** Sets up a key manager to listen to keyboard events on the overlay panel. */
  private _initKeyManager() {
    this._keyManager = new FocusKeyManager(this.options);
    this._tabSubscription = this._keyManager.tabOut.subscribe(() => this.close());
  }

  /** Drops current option subscriptions and IDs and resets from scratch. */
  private _resetOptions(): void {
    this._dropSubscriptions();
    this._listenToOptions();
    this._setOptionIds();
    this._setOptionMultiple();
  }

  /** Listens to user-generated selection events on each option. */
  private _listenToOptions(): void {
    this._optionSubscription = this.optionSelectionChanges
      .filter(event => event.isUserInput)
      .subscribe(event => {
        this._onSelect(event.source);
        this._setValueWidth();

        if (!this.multiple) {
          this.close();
        }
      });
  }

  /** Invoked when an option is clicked. */
  private _onSelect(option: MdOption): void {
    const wasSelected = this._selectionModel.isSelected(option);

    if (this.multiple) {
      this._selectionModel.toggle(option);
      wasSelected ? option.deselect() : option.select();
      this._sortValues();
    } else {
      this._clearSelection(option);
      this._selectionModel.select(option);
    }

    if (wasSelected !== this._selectionModel.isSelected(option)) {
      this._propagateChanges();
    }
  }

  /**
   * Sorts the model values, ensuring that they keep the same
   * order that they have in the panel.
   */
  private _sortValues(): void {
    if (this._multiple) {
      this._selectionModel.clear();

      this.options.forEach(option => {
        if (option.selected) {
          this._selectionModel.select(option);
        }
      });
    }
  }

  /** Unsubscribes from all option subscriptions. */
  private _dropSubscriptions(): void {
    if (this._optionSubscription) {
      this._optionSubscription.unsubscribe();
      this._optionSubscription = null;
    }
  }

  /** Emits change event to set the model value. */
  private _propagateChanges(): void {
    let valueToEmit = Array.isArray(this.selected) ?
      this.selected.map(option => option.value) :
      this.selected.value;

    this._onChange(valueToEmit);
    this.change.emit(new MdSelectChange(this, valueToEmit));
  }

  /** Records option IDs to pass to the aria-owns property. */
  private _setOptionIds() {
    this._optionIds = this.options.map(option => option.id).join(' ');
  }

  /**
   * Sets the `multiple` property on each option. The promise is necessary
   * in order to avoid Angular errors when modifying the property after init.
   * TODO: there should be a better way of doing this.
   */
  private _setOptionMultiple() {
    if (this.multiple) {
      Promise.resolve(null).then(() => {
        this.options.forEach(option => option.multiple = this.multiple);
      });
    }
  }

  /**
   * Must set the width of the selected option's value programmatically
   * because it is absolutely positioned and otherwise will not clip
   * overflow. The selection arrow is 9px wide, add 4px of padding = 13
   */
  private _setValueWidth() {
    this._selectedValueWidth =  this._triggerWidth - 13;
  }

  /**
   * Focuses the selected item. If no option is selected, it will focus
   * the first item instead.
   */
  private _focusCorrectOption(): void {
    if (this._selectionModel.isEmpty()) {
      this._keyManager.setFirstItemActive();
    } else {
      this._keyManager.setActiveItem(this._getOptionIndex(this._selectionModel.selected[0]));
    }
  }

  /** Focuses the host element when the panel closes. */
  private _focusHost(): void {
    this._renderer.invokeElementMethod(this._element.nativeElement, 'focus');
  }

  /** Gets the index of the provided option in the option list. */
  private _getOptionIndex(option: MdOption): number {
    return this.options.reduce((result: number, current: MdOption, index: number) => {
      return result === undefined ? (option === current ? index : undefined) : result;
    }, undefined);
  }

  /** Calculates the scroll position and x- and y-offsets of the overlay panel. */
  private _calculateOverlayPosition(): void {
    this._offsetX = this.multiple ? SELECT_MULTIPLE_PANEL_PADDING_X : SELECT_PANEL_PADDING_X;

    if (!this._isRtl()) {
      this._offsetX *= -1;
    }

    const panelHeight =
        Math.min(this.options.length * SELECT_OPTION_HEIGHT, SELECT_PANEL_MAX_HEIGHT);
    const scrollContainerHeight = this.options.length * SELECT_OPTION_HEIGHT;

    // The farthest the panel can be scrolled before it hits the bottom
    const maxScroll = scrollContainerHeight - panelHeight;

    if (this._selectionModel.hasValue()) {
      const selectedIndex = this._getOptionIndex(this._selectionModel.selected[0]);
      // We must maintain a scroll buffer so the selected option will be scrolled to the
      // center of the overlay panel rather than the top.
      const scrollBuffer = panelHeight / 2;
      this._scrollTop = this._calculateOverlayScroll(selectedIndex, scrollBuffer, maxScroll);
      this._offsetY = this._calculateOverlayOffset(selectedIndex, scrollBuffer, maxScroll);
    } else {
      // If no option is selected, the panel centers on the first option. In this case,
      // we must only adjust for the height difference between the option element
      // and the trigger element, then multiply it by -1 to ensure the panel moves
      // in the correct direction up the page.
      this._offsetY = (SELECT_OPTION_HEIGHT - SELECT_TRIGGER_HEIGHT) / 2 * -1;
    }

    this._checkOverlayWithinViewport(maxScroll);
  }

  /**
   * Calculates the scroll position of the select's overlay panel.
   *
   * Attempts to center the selected option in the panel. If the option is
   * too high or too low in the panel to be scrolled to the center, it clamps the
   * scroll position to the min or max scroll positions respectively.
   */
  _calculateOverlayScroll(selectedIndex: number, scrollBuffer: number,
                          maxScroll: number): number {
    const optionOffsetFromScrollTop = SELECT_OPTION_HEIGHT * selectedIndex;
    const halfOptionHeight = SELECT_OPTION_HEIGHT / 2;

    // Starts at the optionOffsetFromScrollTop, which scrolls the option to the top of the
    // scroll container, then subtracts the scroll buffer to scroll the option down to
    // the center of the overlay panel. Half the option height must be re-added to the
    // scrollTop so the option is centered based on its middle, not its top edge.
    const optimalScrollPosition = optionOffsetFromScrollTop - scrollBuffer + halfOptionHeight;
    return clampValue(0, optimalScrollPosition, maxScroll);
  }

  /**
   * Figures out the appropriate animation state for the placeholder.
   */
  _getPlaceholderAnimationState(): string {
    if (this.floatPlaceholder === 'never') {
      return '';
    }

    if (this.floatPlaceholder === 'always') {
      return this._floatPlaceholderState();
    }

    return this._placeholderState;
  }

  /**
   * Determines the CSS `visibility` of the placeholder element.
   */
  _getPlaceholderVisibility(): 'visible'|'hidden' {
    return (this.floatPlaceholder !== 'never' || this._selectionModel.isEmpty()) ?
        'visible' : 'hidden';
  }

  /**
   * Calculates the y-offset of the select's overlay panel in relation to the
   * top start corner of the trigger. It has to be adjusted in order for the
   * selected option to be aligned over the trigger when the panel opens.
   */
  private _calculateOverlayOffset(selectedIndex: number, scrollBuffer: number,
                                  maxScroll: number): number {
    let optionOffsetFromPanelTop: number;

    if (this._scrollTop === 0) {
      optionOffsetFromPanelTop = selectedIndex * SELECT_OPTION_HEIGHT;
    } else if (this._scrollTop === maxScroll) {
      const firstDisplayedIndex = this.options.length - SELECT_MAX_OPTIONS_DISPLAYED;
      const selectedDisplayIndex = selectedIndex - firstDisplayedIndex;

      // Because the panel height is longer than the height of the options alone,
      // there is always extra padding at the top or bottom of the panel. When
      // scrolled to the very bottom, this padding is at the top of the panel and
      // must be added to the offset.
      optionOffsetFromPanelTop =
          selectedDisplayIndex * SELECT_OPTION_HEIGHT + SELECT_PANEL_PADDING_Y;
    } else {
      // If the option was scrolled to the middle of the panel using a scroll buffer,
      // its offset will be the scroll buffer minus the half height that was added to
      // center it.
      optionOffsetFromPanelTop = scrollBuffer - SELECT_OPTION_HEIGHT / 2;
    }

    // The final offset is the option's offset from the top, adjusted for the height
    // difference, multiplied by -1 to ensure that the overlay moves in the correct
    // direction up the page.
    return optionOffsetFromPanelTop * -1 - SELECT_OPTION_HEIGHT_ADJUSTMENT;
  }

  /**
   * Checks that the attempted overlay position will fit within the viewport.
   * If it will not fit, tries to adjust the scroll position and the associated
   * y-offset so the panel can open fully on-screen. If it still won't fit,
   * sets the offset back to 0 to allow the fallback position to take over.
   */
  private _checkOverlayWithinViewport(maxScroll: number): void {
    const viewportRect = this._viewportRuler.getViewportRect();
    const triggerRect = this._getTriggerRect();

    const topSpaceAvailable = triggerRect.top - SELECT_PANEL_VIEWPORT_PADDING;
    const bottomSpaceAvailable =
        viewportRect.height - triggerRect.bottom - SELECT_PANEL_VIEWPORT_PADDING;

    const panelHeightTop = Math.abs(this._offsetY);
    const totalPanelHeight =
        Math.min(this.options.length * SELECT_OPTION_HEIGHT, SELECT_PANEL_MAX_HEIGHT);
    const panelHeightBottom = totalPanelHeight - panelHeightTop - triggerRect.height;

    if (panelHeightBottom > bottomSpaceAvailable) {
      this._adjustPanelUp(panelHeightBottom, bottomSpaceAvailable);
    } else if (panelHeightTop > topSpaceAvailable) {
     this._adjustPanelDown(panelHeightTop, topSpaceAvailable, maxScroll);
    } else {
      this._transformOrigin = this._getOriginBasedOnOption();
    }
  }

  /** Adjusts the overlay panel up to fit in the viewport. */
  private _adjustPanelUp(panelHeightBottom: number, bottomSpaceAvailable: number) {
    const distanceBelowViewport = panelHeightBottom - bottomSpaceAvailable;

    // Scrolls the panel up by the distance it was extending past the boundary, then
    // adjusts the offset by that amount to move the panel up into the viewport.
    this._scrollTop -= distanceBelowViewport;
    this._offsetY -= distanceBelowViewport;
    this._transformOrigin = this._getOriginBasedOnOption();

    // If the panel is scrolled to the very top, it won't be able to fit the panel
    // by scrolling, so set the offset to 0 to allow the fallback position to take
    // effect.
    if (this._scrollTop <= 0) {
      this._scrollTop = 0;
      this._offsetY = 0;
      this._transformOrigin = `50% bottom 0px`;
    }
  }

  /** Adjusts the overlay panel down to fit in the viewport. */
  private _adjustPanelDown(panelHeightTop: number, topSpaceAvailable: number,
                           maxScroll: number) {
    const distanceAboveViewport = panelHeightTop - topSpaceAvailable;

    // Scrolls the panel down by the distance it was extending past the boundary, then
    // adjusts the offset by that amount to move the panel down into the viewport.
    this._scrollTop += distanceAboveViewport;
    this._offsetY += distanceAboveViewport;
    this._transformOrigin = this._getOriginBasedOnOption();

    // If the panel is scrolled to the very bottom, it won't be able to fit the
    // panel by scrolling, so set the offset to 0 to allow the fallback position
    // to take effect.
    if (this._scrollTop >= maxScroll) {
      this._scrollTop = maxScroll;
      this._offsetY = 0;
      this._transformOrigin = `50% top 0px`;
      return;
    }
  }

  /** Sets the transform origin point based on the selected option. */
  private _getOriginBasedOnOption(): string {
    const originY =
        Math.abs(this._offsetY) - SELECT_OPTION_HEIGHT_ADJUSTMENT + SELECT_OPTION_HEIGHT / 2;
    return `50% ${originY}px 0px`;
  }

  /** Figures out the floating placeholder state value. */
  private _floatPlaceholderState(): string {
    return this._isRtl() ? 'floating-rtl' : 'floating-ltr';
  }
}

/** Clamps a value n between min and max values. */
function clampValue(min: number, n: number, max: number): number {
  return Math.min(Math.max(min, n), max);
}
