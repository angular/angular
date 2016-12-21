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
  ViewEncapsulation,
  ViewChild,
} from '@angular/core';
import {MdOption} from './option';
import {ENTER, SPACE} from '../core/keyboard/keycodes';
import {ListKeyManager} from '../core/a11y/list-key-manager';
import {Dir} from '../core/rtl/dir';
import {Subscription} from 'rxjs/Subscription';
import {transformPlaceholder, transformPanel, fadeInContent} from './select-animations';
import {ControlValueAccessor, NgControl} from '@angular/forms';
import {coerceBooleanProperty} from '../core/coercion/boolean-property';
import {ConnectedOverlayDirective} from '../core/overlay/overlay-directives';
import {ViewportRuler} from '../core/overlay/position/viewport-ruler';

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
 * The panel's padding on the y-axis. This padding indicates there are more
 * options available if you scroll.
 */
export const SELECT_PANEL_PADDING_Y = 16;

/**
 * The select panel will only "fit" inside the viewport if it is positioned at
 * this value or more away from the viewport boundary.
 */
export const SELECT_PANEL_VIEWPORT_PADDING = 8;

@Component({
  moduleId: module.id,
  selector: 'md-select, mat-select',
  templateUrl: 'select.html',
  styleUrls: ['select.css'],
  encapsulation: ViewEncapsulation.None,
  host: {
    'role': 'listbox',
    '[attr.tabindex]': '_getTabIndex()',
    '[attr.aria-label]': 'placeholder',
    '[attr.aria-required]': 'required.toString()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-invalid]': '_control?.invalid || "false"',
    '[attr.aria-owns]': '_optionIds',
    '[class.md-select-disabled]': 'disabled',
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

  /** The currently selected option. */
  private _selected: MdOption;

  /** Subscriptions to option events. */
  private _subscriptions: Subscription[] = [];

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

  /** The animation state of the placeholder. */
  _placeholderState = '';

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
  _keyManager: ListKeyManager;

  /** View -> model callback called when value changes */
  _onChange = (value: any) => {};

  /** View -> model callback called when select has been touched */
  _onTouched = () => {};

  /** The IDs of child options to be passed to the aria-owns attribute. */
  _optionIds: string = '';

  /** The value of the select panel's transform-origin property. */
  _transformOrigin: string = 'top';

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

  /** Event emitted when the select has been opened. */
  @Output() onOpen = new EventEmitter();

  /** Event emitted when the select has been closed. */
  @Output() onClose = new EventEmitter();

  constructor(private _element: ElementRef, private _renderer: Renderer,
              private _viewportRuler: ViewportRuler, @Optional() private _dir: Dir,
              @Optional() public _control: NgControl) {
    if (this._control) {
      this._control.valueAccessor = this;
    }
  }

  ngAfterContentInit() {
    this._initKeyManager();
    this._resetOptions();
    this._changeSubscription = this.options.changes.subscribe(() => this._resetOptions());
  }

  ngOnDestroy() {
    this._dropSubscriptions();
    this._changeSubscription.unsubscribe();
    this._tabSubscription.unsubscribe();
  }

  /** Toggles the overlay panel open or closed. */
  toggle(): void {
    this.panelOpen ? this.close() : this.open();
  }

  /** Opens the overlay panel. */
  open(): void {
    if (this.disabled) {
      return;
    }
    this._calculateOverlayPosition();
    this._placeholderState = this._isRtl() ? 'floating-rtl' : 'floating-ltr';
    this._panelOpen = true;
  }

  /** Closes the overlay panel and focuses the host element. */
  close(): void {
    this._panelOpen = false;
    if (!this._selected) {
      this._placeholderState = '';
    }
    this._focusHost();
  }

  /**
   * Sets the select's value. Part of the ControlValueAccessor interface
   * required to integrate with Angular's core forms API.
   *
   * @param value New value to be written to the model.
   */
  writeValue(value: any): void {
    if (!this.options) {
      // In reactive forms, writeValue() will be called synchronously before
      // the select's child options have been created. It's necessary to call
      // writeValue() again after the options have been created to ensure any
      // initial view value is set.
      Promise.resolve(null).then(() => this.writeValue(value));
      return;
    }

    this._setSelectionByValue(value);
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
  get selected(): MdOption {
    return this._selected;
  }

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
   * When the panel is finished animating, emits an event and focuses
   * an option if the panel is open.
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
   * Calls the touched callback only if the panel is closed. Otherwise, the trigger will
   * "blur" to the panel when it opens, causing a false positive.
   */
  _onBlur() {
    if (!this.panelOpen) {
      this._onTouched();
    }
  }

  /** Returns the correct tabindex for the select depending on disabled state. */
  _getTabIndex() {
    return this.disabled ? '-1' : '0';
  }


  /**
   * Sets the scroll position of the scroll container. This must be called after
   * the overlay pane is attached or the scroll container element will not yet be
   * present in the DOM.
   */
  _setScrollTop(): void {
    const scrollContainer =
        this.overlayDir.overlayRef.overlayElement.querySelector('.md-select-panel');
    scrollContainer.scrollTop = this._scrollTop;
  }

  /**
   * Sets the selected option based on a value. If no option can be
   * found with the designated value, the select trigger is cleared.
   */
  private _setSelectionByValue(value: any): void {
    const options = this.options.toArray();

    for (let i = 0; i < this.options.length; i++) {
      if (options[i].value === value) {
        options[i].select();
        return;
      }
    }

    // Clear selection if no item was selected.
    this._clearSelection();
  }

  /** Clears the select trigger and deselects every option in the list. */
  private _clearSelection(): void {
    this._selected = null;
    this._updateOptions();
  }

  private _getTriggerRect(): ClientRect {
    return this.trigger.nativeElement.getBoundingClientRect();
  }

  /** Sets up a key manager to listen to keyboard events on the overlay panel. */
  private _initKeyManager() {
    this._keyManager = new ListKeyManager(this.options);
    this._tabSubscription = this._keyManager.tabOut.subscribe(() => {
      this.close();
    });
  }

  /** Drops current option subscriptions and IDs and resets from scratch. */
  private _resetOptions(): void {
    this._dropSubscriptions();
    this._listenToOptions();
    this._setOptionIds();
  }

  /** Listens to selection events on each option. */
  private _listenToOptions(): void {
    this.options.forEach((option: MdOption) => {
      const sub = option.onSelect.subscribe((isUserInput: boolean) => {
        if (isUserInput) {
          this._onChange(option.value);
        }
        this._onSelect(option);
      });
      this._subscriptions.push(sub);
    });
  }

  /** Unsubscribes from all option subscriptions. */
  private _dropSubscriptions(): void {
    this._subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
    this._subscriptions = [];
  }

  /** Records option IDs to pass to the aria-owns property. */
  private _setOptionIds() {
    this._optionIds = this.options.map(option => option.id).join(' ');
  }

  /** When a new option is selected, deselects the others and closes the panel. */
  private _onSelect(option: MdOption): void {
    this._selected = option;
    this._updateOptions();
    this._setValueWidth();
    this._placeholderState = '';
    if (this.panelOpen) {
      this.close();
    }
  }

  /** Deselect each option that doesn't match the current selection. */
  private _updateOptions(): void {
    this.options.forEach((option: MdOption) => {
      if (option !== this.selected) {
        option.deselect();
      }
    });
  }

  /**
   * Must set the width of the selected option's value programmatically
   * because it is absolutely positioned and otherwise will not clip
   * overflow. The selection arrow is 9px wide, add 4px of padding = 13
   */
  private _setValueWidth() {
    this._selectedValueWidth =  this._triggerWidth - 13;
  }

  /** Focuses the selected item. If no option is selected, it will focus
   * the first item instead.
   */
  private _focusCorrectOption(): void {
    if (this.selected) {
      this._keyManager.setFocus(this._getOptionIndex(this.selected));
    } else {
      this._keyManager.focusFirstItem();
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
    this._offsetX = this._isRtl() ? SELECT_PANEL_PADDING_X : -SELECT_PANEL_PADDING_X;

    const panelHeight =
        Math.min(this.options.length * SELECT_OPTION_HEIGHT, SELECT_PANEL_MAX_HEIGHT);
    const scrollContainerHeight = this.options.length * SELECT_OPTION_HEIGHT;

    // The farthest the panel can be scrolled before it hits the bottom
    const maxScroll = scrollContainerHeight - panelHeight;

    if (this.selected) {
      const selectedIndex = this._getOptionIndex(this.selected);
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
    const panelHeightBottom = totalPanelHeight -  panelHeightTop - triggerRect.height;

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

}

/** Clamps a value n between min and max values. */
function clampValue(min: number, n: number, max: number): number {
  return Math.min(Math.max(min, n), max);
}
