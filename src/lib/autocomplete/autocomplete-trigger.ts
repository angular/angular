import {
    AfterContentInit,
    Directive,
    ElementRef,
    forwardRef,
    Host,
    Input,
    NgZone,
    Optional,
    OnDestroy,
    QueryList,
    ViewContainerRef,
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {Overlay, OverlayRef, OverlayState, TemplatePortal} from '../core';
import {MdAutocomplete} from './autocomplete';
import {PositionStrategy} from '../core/overlay/position/position-strategy';
import {ConnectedPositionStrategy} from '../core/overlay/position/connected-position-strategy';
import {Observable} from 'rxjs/Observable';
import {MdOptionSelectEvent, MdOption} from '../core/option/option';
import {ActiveDescendantKeyManager} from '../core/a11y/activedescendant-key-manager';
import {ENTER, UP_ARROW, DOWN_ARROW} from '../core/keyboard/keycodes';
import {Dir} from '../core/rtl/dir';
import {Subscription} from 'rxjs/Subscription';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/switchMap';
import {MdInputContainer, FloatPlaceholderType} from '../input/input-container';

/**
 * The following style constants are necessary to save here in order
 * to properly calculate the scrollTop of the panel. Because we are not
 * actually focusing the active item, scroll must be handled manually.
 */

/** The height of each autocomplete option. */
export const AUTOCOMPLETE_OPTION_HEIGHT = 48;

/** The total height of the autocomplete panel. */
export const AUTOCOMPLETE_PANEL_HEIGHT = 256;

/**
 * Provider that allows the autocomplete to register as a ControlValueAccessor.
 * @docs-private
 */
export const MD_AUTOCOMPLETE_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MdAutocompleteTrigger),
  multi: true
};

@Directive({
  selector: 'input[mdAutocomplete], input[matAutocomplete]',
  host: {
    'role': 'combobox',
    'autocomplete': 'off',
    'aria-autocomplete': 'list',
    'aria-multiline': 'false',
    '[attr.aria-activedescendant]': 'activeOption?.id',
    '[attr.aria-expanded]': 'panelOpen.toString()',
    '[attr.aria-owns]': 'autocomplete?.id',
    '(focus)': 'openPanel()',
    '(blur)': '_handleBlur($event.relatedTarget?.tagName)',
    '(input)': '_handleInput($event.target.value)',
    '(keydown)': '_handleKeydown($event)',
  },
  providers: [MD_AUTOCOMPLETE_VALUE_ACCESSOR]
})
export class MdAutocompleteTrigger implements AfterContentInit, ControlValueAccessor, OnDestroy {
  private _overlayRef: OverlayRef;
  private _portal: TemplatePortal;
  private _panelOpen: boolean = false;

  /** The subscription to positioning changes in the autocomplete panel. */
  private _panelPositionSubscription: Subscription;

  /** Manages active item in option list based on key events. */
  private _keyManager: ActiveDescendantKeyManager;
  private _positionStrategy: ConnectedPositionStrategy;

  /** Stream of blur events that should close the panel. */
  private _blurStream = new Subject<any>();

  /** View -> model callback called when value changes */
  _onChange: (value: any) => {};

  /** View -> model callback called when autocomplete has been touched */
  _onTouched = () => {};

  /* The autocomplete panel to be attached to this trigger. */
  @Input('mdAutocomplete') autocomplete: MdAutocomplete;

  constructor(private _element: ElementRef, private _overlay: Overlay,
              private _viewContainerRef: ViewContainerRef,
              @Optional() private _dir: Dir, private _zone: NgZone,
              @Optional() @Host() private _inputContainer: MdInputContainer) {}

  ngAfterContentInit() {
    this._keyManager = new ActiveDescendantKeyManager(this.autocomplete.options).withWrap();
  }

  ngOnDestroy() {
    if (this._panelPositionSubscription) {
      this._panelPositionSubscription.unsubscribe();
    }

    this._destroyPanel();
  }

  /* Whether or not the autocomplete panel is open. */
  get panelOpen(): boolean {
    return this._panelOpen;
  }

  /** Opens the autocomplete suggestion panel. */
  openPanel(): void {
    if (!this._overlayRef) {
      this._createOverlay();
    }

    if (!this._overlayRef.hasAttached()) {
      this._overlayRef.attach(this._portal);
      this._subscribeToClosingActions();
    }

    this._panelOpen = true;
    this._floatPlaceholder('always');
  }

  /** Closes the autocomplete suggestion panel. */
  closePanel(): void {
    if (this._overlayRef && this._overlayRef.hasAttached()) {
      this._overlayRef.detach();
    }

    this._panelOpen = false;
    this._floatPlaceholder('auto');
  }

  /**
   * A stream of actions that should close the autocomplete panel, including
   * when an option is selected, on blur, and when TAB is pressed.
   */
  get panelClosingActions(): Observable<MdOptionSelectEvent> {
    return Observable.merge(
        ...this.optionSelections,
        this._blurStream.asObservable(),
        this._keyManager.tabOut
    );
  }

  /** Stream of autocomplete option selections. */
  get optionSelections(): Observable<MdOptionSelectEvent>[] {
    return this.autocomplete.options.map(option => option.onSelect);
  }

  /** The currently active option, coerced to MdOption type. */
  get activeOption(): MdOption {
    return this._keyManager.activeItem as MdOption;
  }

  /**
   * Sets the autocomplete's value. Part of the ControlValueAccessor interface
   * required to integrate with Angular's core forms API.
   *
   * @param value New value to be written to the model.
   */
  writeValue(value: any): void {
    Promise.resolve(null).then(() => this._setTriggerValue(value));
  }

  /**
   * Saves a callback function to be invoked when the autocomplete's value
   * changes from user input. Part of the ControlValueAccessor interface
   * required to integrate with Angular's core forms API.
   *
   * @param fn Callback to be triggered when the value changes.
   */
  registerOnChange(fn: (value: any) => {}): void {
    this._onChange = fn;
  }

  /**
   * Saves a callback function to be invoked when the autocomplete is blurred
   * by the user. Part of the ControlValueAccessor interface required
   * to integrate with Angular's core forms API.
   *
   * @param fn Callback to be triggered when the component has been touched.
   */
  registerOnTouched(fn: () => {}) {
    this._onTouched = fn;
  }

  _handleKeydown(event: KeyboardEvent): void {
    if (this.activeOption && event.keyCode === ENTER) {
      this.activeOption._selectViaInteraction();
    } else {
      this._keyManager.onKeydown(event);
      if (event.keyCode === UP_ARROW || event.keyCode === DOWN_ARROW) {
        this.openPanel();
        this._scrollToOption();
      }
    }
  }

  _handleInput(value: string): void {
    this._onChange(value);
    this.openPanel();
  }

  _handleBlur(newlyFocusedTag: string): void {
    this._onTouched();

    // Only emit blur event if the new focus is *not* on an option.
    if (newlyFocusedTag !== 'MD-OPTION') {
      this._blurStream.next(null);
    }
  }

  /**
   * In "auto" mode, the placeholder will animate down as soon as focus is lost.
   * This causes the value to jump when selecting an option with the mouse.
   * This method manually floats the placeholder until the panel can be closed.
   */
  private _floatPlaceholder(state: FloatPlaceholderType): void {
    if (this._inputContainer) {
      this._inputContainer.floatPlaceholder = state;
    }
  }

  /**
   * Given that we are not actually focusing active options, we must manually adjust scroll
   * to reveal options below the fold. First, we find the offset of the option from the top
   * of the panel. The new scrollTop will be that offset - the panel height + the option
   * height, so the active option will be just visible at the bottom of the panel.
   */
  private _scrollToOption(): void {
    const optionOffset = this._keyManager.activeItemIndex * AUTOCOMPLETE_OPTION_HEIGHT;
    const newScrollTop =
        Math.max(0, optionOffset - AUTOCOMPLETE_PANEL_HEIGHT + AUTOCOMPLETE_OPTION_HEIGHT);
    this.autocomplete._setScrollTop(newScrollTop);
  }

  /**
   * This method listens to a stream of panel closing actions and resets the
   * stream every time the option list changes.
   */
  private _subscribeToClosingActions(): void {
    const initialOptions = this._getStableOptions();

    // When the zone is stable initially, and when the option list changes...
    Observable.merge(initialOptions, this.autocomplete.options.changes)
        // create a new stream of panelClosingActions, replacing any previous streams
        // that were created, and flatten it so our stream only emits closing events...
        .switchMap(options => {
          this._resetPanel();
          // If the options list is empty, emit close event immediately.
          // Otherwise, listen for panel closing actions...
          return options.length ? this.panelClosingActions : Observable.of(null);
        })
        // when the first closing event occurs...
        .first()
        // set the value, close the panel, and complete.
        .subscribe(event => this._setValueAndClose(event));
  }

  /**
   * Retrieves the option list once the zone stabilizes. It's important to wait until
   * stable so that change detection can run first and update the query list
   * with the options available under the current filter.
   */
  private _getStableOptions(): Observable<QueryList<MdOption>> {
    return this._zone.onStable.first().map(() => this.autocomplete.options);
  }

  /** Destroys the autocomplete suggestion panel. */
  private _destroyPanel(): void {
    if (this._overlayRef) {
      this.closePanel();
      this._overlayRef.dispose();
      this._overlayRef = null;
    }
  }

  private _setTriggerValue(value: any): void {
    this._element.nativeElement.value =
        this.autocomplete.displayWith ? this.autocomplete.displayWith(value) : value;
  }

   /**
   * This method closes the panel, and if a value is specified, also sets the associated
   * control to that value. It will also mark the control as dirty if this interaction
   * stemmed from the user.
   */
  private _setValueAndClose(event: MdOptionSelectEvent | null): void {
    if (event) {
      this._setTriggerValue(event.source.value);
      this._onChange(event.source.value);
    }

    this.closePanel();
  }

  private _createOverlay(): void {
    this._portal = new TemplatePortal(this.autocomplete.template, this._viewContainerRef);
    this._overlayRef = this._overlay.create(this._getOverlayConfig());
  }

  private _getOverlayConfig(): OverlayState {
    const overlayState = new OverlayState();
    overlayState.positionStrategy = this._getOverlayPosition();
    overlayState.width = this._getHostWidth();
    overlayState.direction = this._dir ? this._dir.value : 'ltr';
    return overlayState;
  }

  private _getOverlayPosition(): PositionStrategy {
    this._positionStrategy =  this._overlay.position().connectedTo(
        this._element,
        {originX: 'start', originY: 'bottom'}, {overlayX: 'start', overlayY: 'top'})
        .withFallbackPosition(
            {originX: 'start', originY: 'top'}, {overlayX: 'start', overlayY: 'bottom'}
        );
    this._subscribeToPositionChanges(this._positionStrategy);
    return this._positionStrategy;
  }

  /**
   * This method subscribes to position changes in the autocomplete panel, so the panel's
   * y-offset can be adjusted to match the new position.
   */
  private _subscribeToPositionChanges(strategy: ConnectedPositionStrategy) {
    this._panelPositionSubscription = strategy.onPositionChange.subscribe(change => {
      this.autocomplete.positionY = change.connectionPair.originY === 'top' ? 'above' : 'below';
    });
  }

  /** Returns the width of the input element, so the panel width can match it. */
  private _getHostWidth(): number {
    return this._element.nativeElement.getBoundingClientRect().width;
  }

  /** Reset active item to null so arrow events will activate the correct options.*/
  private _resetActiveItem(): void {
    this._keyManager.setActiveItem(null);
  }

  /**
   * Resets the active item and re-calculates alignment of the panel in case its size
   * has changed due to fewer or greater number of options.
   */
  private _resetPanel() {
    this._resetActiveItem();
    this._positionStrategy.recalculateLastPosition();
  }

}

