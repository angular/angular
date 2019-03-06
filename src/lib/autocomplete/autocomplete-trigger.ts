/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Directionality} from '@angular/cdk/bidi';
import {DOWN_ARROW, ENTER, ESCAPE, TAB, UP_ARROW} from '@angular/cdk/keycodes';
import {
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayConfig,
  OverlayRef,
  PositionStrategy,
  ScrollStrategy,
} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {DOCUMENT} from '@angular/common';
import {filter, take, switchMap, delay, tap, map} from 'rxjs/operators';
import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  forwardRef,
  Host,
  Inject,
  InjectionToken,
  Input,
  NgZone,
  OnDestroy,
  Optional,
  ViewContainerRef,
} from '@angular/core';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {
  _countGroupLabelsBeforeOption,
  _getOptionScrollPosition,
  MatOption,
  MatOptionSelectionChange,
} from '@angular/material/core';
import {MatFormField} from '@angular/material/form-field';
import {Subscription, defer, fromEvent, merge, of as observableOf, Subject, Observable} from 'rxjs';
import {MatAutocomplete} from './autocomplete';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {MatAutocompleteOrigin} from './autocomplete-origin';


/**
 * The following style constants are necessary to save here in order
 * to properly calculate the scrollTop of the panel. Because we are not
 * actually focusing the active item, scroll must be handled manually.
 */

/** The height of each autocomplete option. */
export const AUTOCOMPLETE_OPTION_HEIGHT = 48;

/** The total height of the autocomplete panel. */
export const AUTOCOMPLETE_PANEL_HEIGHT = 256;

/** Injection token that determines the scroll handling while the autocomplete panel is open. */
export const MAT_AUTOCOMPLETE_SCROLL_STRATEGY =
    new InjectionToken<() => ScrollStrategy>('mat-autocomplete-scroll-strategy');

/** @docs-private */
export function MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy {
  return () => overlay.scrollStrategies.reposition();
}

/** @docs-private */
export const MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER = {
  provide: MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
  deps: [Overlay],
  useFactory: MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY,
};

/**
 * Provider that allows the autocomplete to register as a ControlValueAccessor.
 * @docs-private
 */
export const MAT_AUTOCOMPLETE_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatAutocompleteTrigger),
  multi: true
};

/**
 * Creates an error to be thrown when attempting to use an autocomplete trigger without a panel.
 * @docs-private
 */
export function getMatAutocompleteMissingPanelError(): Error {
  return Error('Attempting to open an undefined instance of `mat-autocomplete`. ' +
               'Make sure that the id passed to the `matAutocomplete` is correct and that ' +
               'you\'re attempting to open it after the ngAfterContentInit hook.');
}


@Directive({
  selector: `input[matAutocomplete], textarea[matAutocomplete]`,
  host: {
    '[attr.autocomplete]': 'autocompleteAttribute',
    '[attr.role]': 'autocompleteDisabled ? null : "combobox"',
    '[attr.aria-autocomplete]': 'autocompleteDisabled ? null : "list"',
    '[attr.aria-activedescendant]': '(panelOpen && activeOption) ? activeOption.id : null',
    '[attr.aria-expanded]': 'autocompleteDisabled ? null : panelOpen.toString()',
    '[attr.aria-owns]': '(autocompleteDisabled || !panelOpen) ? null : autocomplete?.id',
    '[attr.aria-haspopup]': '!autocompleteDisabled',
    // Note: we use `focusin`, as opposed to `focus`, in order to open the panel
    // a little earlier. This avoids issues where IE delays the focusing of the input.
    '(focusin)': '_handleFocus()',
    '(blur)': '_onTouched()',
    '(input)': '_handleInput($event)',
    '(keydown)': '_handleKeydown($event)',
  },
  exportAs: 'matAutocompleteTrigger',
  providers: [MAT_AUTOCOMPLETE_VALUE_ACCESSOR]
})
export class MatAutocompleteTrigger implements ControlValueAccessor, OnDestroy {
  private _overlayRef: OverlayRef | null;
  private _portal: TemplatePortal;
  private _componentDestroyed = false;
  private _autocompleteDisabled = false;
  private _scrollStrategy: () => ScrollStrategy;

  /** Old value of the native input. Used to work around issues with the `input` event on IE. */
  private _previousValue: string | number | null;

  /** Strategy that is used to position the panel. */
  private _positionStrategy: FlexibleConnectedPositionStrategy;

  /** Whether or not the label state is being overridden. */
  private _manuallyFloatingLabel = false;

  /** The subscription for closing actions (some are bound to document). */
  private _closingActionsSubscription: Subscription;

  /** Subscription to viewport size changes. */
  private _viewportSubscription = Subscription.EMPTY;

  /**
   * Whether the autocomplete can open the next time it is focused. Used to prevent a focused,
   * closed autocomplete from being reopened if the user switches to another browser tab and then
   * comes back.
   */
  private _canOpenOnNextFocus = true;

  /** Stream of keyboard events that can close the panel. */
  private readonly _closeKeyEventStream = new Subject<void>();

  /**
   * Event handler for when the window is blurred. Needs to be an
   * arrow function in order to preserve the context.
   */
  private _windowBlurHandler = () => {
    // If the user blurred the window while the autocomplete is focused, it means that it'll be
    // refocused when they come back. In this case we want to skip the first focus event, if the
    // pane was closed, in order to avoid reopening it unintentionally.
    this._canOpenOnNextFocus =
        document.activeElement !== this._element.nativeElement || this.panelOpen;
  }

  /** `View -> model callback called when value changes` */
  _onChange: (value: any) => void = () => {};

  /** `View -> model callback called when autocomplete has been touched` */
  _onTouched = () => {};

  /** The autocomplete panel to be attached to this trigger. */
  @Input('matAutocomplete') autocomplete: MatAutocomplete;

  /**
   * Reference relative to which to position the autocomplete panel.
   * Defaults to the autocomplete trigger element.
   */
  @Input('matAutocompleteConnectedTo') connectedTo: MatAutocompleteOrigin;

  /**
   * `autocomplete` attribute to be set on the input element.
   * @docs-private
   */
  @Input('autocomplete') autocompleteAttribute: string = 'off';

  /**
   * Whether the autocomplete is disabled. When disabled, the element will
   * act as a regular input and the user won't be able to open the panel.
   */
  @Input('matAutocompleteDisabled')
  get autocompleteDisabled(): boolean { return this._autocompleteDisabled; }
  set autocompleteDisabled(value: boolean) {
    this._autocompleteDisabled = coerceBooleanProperty(value);
  }

  constructor(private _element: ElementRef<HTMLInputElement>, private _overlay: Overlay,
              private _viewContainerRef: ViewContainerRef,
              private _zone: NgZone,
              private _changeDetectorRef: ChangeDetectorRef,
              @Inject(MAT_AUTOCOMPLETE_SCROLL_STRATEGY) scrollStrategy: any,
              @Optional() private _dir: Directionality,
              @Optional() @Host() private _formField: MatFormField,
              @Optional() @Inject(DOCUMENT) private _document: any,
              // @breaking-change 8.0.0 Make `_viewportRuler` required.
              private _viewportRuler?: ViewportRuler) {

    if (typeof window !== 'undefined') {
      _zone.runOutsideAngular(() => {
        window.addEventListener('blur', this._windowBlurHandler);
      });
    }

    this._scrollStrategy = scrollStrategy;
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('blur', this._windowBlurHandler);
    }

    this._viewportSubscription.unsubscribe();
    this._componentDestroyed = true;
    this._destroyPanel();
    this._closeKeyEventStream.complete();
  }

  /** Whether or not the autocomplete panel is open. */
  get panelOpen(): boolean {
    return this._overlayAttached && this.autocomplete.showPanel;
  }
  private _overlayAttached: boolean = false;

  /** Opens the autocomplete suggestion panel. */
  openPanel(): void {
    this._attachOverlay();
    this._floatLabel();
  }

  /** Closes the autocomplete suggestion panel. */
  closePanel(): void {
    this._resetLabel();

    if (!this._overlayAttached) {
      return;
    }

    if (this.panelOpen) {
      // Only emit if the panel was visible.
      this.autocomplete.closed.emit();
    }

    this.autocomplete._isOpen = this._overlayAttached = false;

    if (this._overlayRef && this._overlayRef.hasAttached()) {
      this._overlayRef.detach();
      this._closingActionsSubscription.unsubscribe();
    }

    // Note that in some cases this can end up being called after the component is destroyed.
    // Add a check to ensure that we don't try to run change detection on a destroyed view.
    if (!this._componentDestroyed) {
      // We need to trigger change detection manually, because
      // `fromEvent` doesn't seem to do it at the proper time.
      // This ensures that the label is reset when the
      // user clicks outside.
      this._changeDetectorRef.detectChanges();
    }
  }

  /**
   * Updates the position of the autocomplete suggestion panel to ensure that it fits all options
   * within the viewport.
   */
  updatePosition(): void {
    if (this._overlayAttached) {
      this._overlayRef!.updatePosition();
    }
  }

  /**
   * A stream of actions that should close the autocomplete panel, including
   * when an option is selected, on blur, and when TAB is pressed.
   */
  get panelClosingActions(): Observable<MatOptionSelectionChange|null> {
    return merge(
      this.optionSelections,
      this.autocomplete._keyManager.tabOut.pipe(filter(() => this._overlayAttached)),
      this._closeKeyEventStream,
      this._getOutsideClickStream(),
      this._overlayRef ?
          this._overlayRef.detachments().pipe(filter(() => this._overlayAttached)) :
          observableOf()
    ).pipe(
      // Normalize the output so we return a consistent type.
      map(event => event instanceof MatOptionSelectionChange ? event : null)
    );
  }

  /** Stream of autocomplete option selections. */
  readonly optionSelections: Observable<MatOptionSelectionChange> = defer(() => {
    if (this.autocomplete && this.autocomplete.options) {
     return merge(...this.autocomplete.options.map(option => option.onSelectionChange));
    }

    // If there are any subscribers before `ngAfterViewInit`, the `autocomplete` will be undefined.
    // Return a stream that we'll replace with the real one once everything is in place.
    return this._zone.onStable
        .asObservable()
        .pipe(take(1), switchMap(() => this.optionSelections));
  }) as Observable<MatOptionSelectionChange>;

  /** The currently active option, coerced to MatOption type. */
  get activeOption(): MatOption | null {
    if (this.autocomplete && this.autocomplete._keyManager) {
      return this.autocomplete._keyManager.activeItem;
    }

    return null;
  }

  /** Stream of clicks outside of the autocomplete panel. */
  private _getOutsideClickStream(): Observable<any> {
    if (!this._document) {
      return observableOf(null);
    }

    return merge(
      fromEvent<MouseEvent>(this._document, 'click'),
      fromEvent<TouchEvent>(this._document, 'touchend')
    )
    .pipe(filter(event => {
      const clickTarget = event.target as HTMLElement;
      const formField = this._formField ?
          this._formField._elementRef.nativeElement : null;

      return this._overlayAttached &&
              clickTarget !== this._element.nativeElement &&
              (!formField || !formField.contains(clickTarget)) &&
              (!!this._overlayRef && !this._overlayRef.overlayElement.contains(clickTarget));
    }));
  }

  // Implemented as part of ControlValueAccessor.
  writeValue(value: any): void {
    Promise.resolve(null).then(() => this._setTriggerValue(value));
  }

  // Implemented as part of ControlValueAccessor.
  registerOnChange(fn: (value: any) => {}): void {
    this._onChange = fn;
  }

  // Implemented as part of ControlValueAccessor.
  registerOnTouched(fn: () => {}) {
    this._onTouched = fn;
  }

  // Implemented as part of ControlValueAccessor.
  setDisabledState(isDisabled: boolean) {
    this._element.nativeElement.disabled = isDisabled;
  }

  _handleKeydown(event: KeyboardEvent): void {
    const keyCode = event.keyCode;

    // Prevent the default action on all escape key presses. This is here primarily to bring IE
    // in line with other browsers. By default, pressing escape on IE will cause it to revert
    // the input value to the one that it had on focus, however it won't dispatch any events
    // which means that the model value will be out of sync with the view.
    if (keyCode === ESCAPE) {
      event.preventDefault();
    }

    if (this.activeOption && keyCode === ENTER && this.panelOpen) {
      this.activeOption._selectViaInteraction();
      this._resetActiveItem();
      event.preventDefault();
    } else if (this.autocomplete) {
      const prevActiveItem = this.autocomplete._keyManager.activeItem;
      const isArrowKey = keyCode === UP_ARROW || keyCode === DOWN_ARROW;

      if (this.panelOpen || keyCode === TAB) {
        this.autocomplete._keyManager.onKeydown(event);
      } else if (isArrowKey && this._canOpen()) {
        this.openPanel();
      }

      if (isArrowKey || this.autocomplete._keyManager.activeItem !== prevActiveItem) {
        this._scrollToOption();
      }
    }
  }

  _handleInput(event: KeyboardEvent): void {
    let target = event.target as HTMLInputElement;
    let value: number | string | null = target.value;

    // Based on `NumberValueAccessor` from forms.
    if (target.type === 'number') {
      value = value == '' ? null : parseFloat(value);
    }

    // If the input has a placeholder, IE will fire the `input` event on page load,
    // focus and blur, in addition to when the user actually changed the value. To
    // filter out all of the extra events, we save the value on focus and between
    // `input` events, and we check whether it changed.
    // See: https://connect.microsoft.com/IE/feedback/details/885747/
    if (this._previousValue !== value) {
      this._previousValue = value;
      this._onChange(value);

      if (this._canOpen() && document.activeElement === event.target) {
        this.openPanel();
      }
    }
  }

  _handleFocus(): void {
    if (!this._canOpenOnNextFocus) {
      this._canOpenOnNextFocus = true;
    } else if (this._canOpen()) {
      this._previousValue = this._element.nativeElement.value;
      this._attachOverlay();
      this._floatLabel(true);
    }
  }

  /**
   * In "auto" mode, the label will animate down as soon as focus is lost.
   * This causes the value to jump when selecting an option with the mouse.
   * This method manually floats the label until the panel can be closed.
   * @param shouldAnimate Whether the label should be animated when it is floated.
   */
  private _floatLabel(shouldAnimate = false): void {
    if (this._formField && this._formField.floatLabel === 'auto') {
      if (shouldAnimate) {
        this._formField._animateAndLockLabel();
      } else {
        this._formField.floatLabel = 'always';
      }

      this._manuallyFloatingLabel = true;
    }
  }

  /** If the label has been manually elevated, return it to its normal state. */
  private _resetLabel(): void  {
    if (this._manuallyFloatingLabel) {
      this._formField.floatLabel = 'auto';
      this._manuallyFloatingLabel = false;
    }
  }

  /**
   * Given that we are not actually focusing active options, we must manually adjust scroll
   * to reveal options below the fold. First, we find the offset of the option from the top
   * of the panel. If that offset is below the fold, the new scrollTop will be the offset -
   * the panel height + the option height, so the active option will be just visible at the
   * bottom of the panel. If that offset is above the top of the visible panel, the new scrollTop
   * will become the offset. If that offset is visible within the panel already, the scrollTop is
   * not adjusted.
   */
  private _scrollToOption(): void {
    const index = this.autocomplete._keyManager.activeItemIndex || 0;
    const labelCount = _countGroupLabelsBeforeOption(index,
        this.autocomplete.options, this.autocomplete.optionGroups);

    const newScrollPosition = _getOptionScrollPosition(
      index + labelCount,
      AUTOCOMPLETE_OPTION_HEIGHT,
      this.autocomplete._getScrollTop(),
      AUTOCOMPLETE_PANEL_HEIGHT
    );

    this.autocomplete._setScrollTop(newScrollPosition);
  }

  /**
   * This method listens to a stream of panel closing actions and resets the
   * stream every time the option list changes.
   */
  private _subscribeToClosingActions(): Subscription {
    const firstStable = this._zone.onStable.asObservable().pipe(take(1));
    const optionChanges = this.autocomplete.options.changes.pipe(
      tap(() => this._positionStrategy.reapplyLastPosition()),
      // Defer emitting to the stream until the next tick, because changing
      // bindings in here will cause "changed after checked" errors.
      delay(0)
    );

    // When the zone is stable initially, and when the option list changes...
    return merge(firstStable, optionChanges)
      .pipe(
        // create a new stream of panelClosingActions, replacing any previous streams
        // that were created, and flatten it so our stream only emits closing events...
        switchMap(() => {
          this._resetActiveItem();
          this.autocomplete._setVisibility();

          if (this.panelOpen) {
            this._overlayRef!.updatePosition();
          }

          return this.panelClosingActions;
        }),
        // when the first closing event occurs...
        take(1)
      )
      // set the value, close the panel, and complete.
      .subscribe(event => this._setValueAndClose(event));
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
    const toDisplay = this.autocomplete && this.autocomplete.displayWith ?
      this.autocomplete.displayWith(value) :
      value;

    // Simply falling back to an empty string if the display value is falsy does not work properly.
    // The display value can also be the number zero and shouldn't fall back to an empty string.
    const inputValue = toDisplay != null ? toDisplay : '';

    // If it's used within a `MatFormField`, we should set it through the property so it can go
    // through change detection.
    if (this._formField) {
      this._formField._control.value = inputValue;
    } else {
      this._element.nativeElement.value = inputValue;
    }

    this._previousValue = inputValue;
  }

  /**
   * This method closes the panel, and if a value is specified, also sets the associated
   * control to that value. It will also mark the control as dirty if this interaction
   * stemmed from the user.
   */
  private _setValueAndClose(event: MatOptionSelectionChange | null): void {
    if (event && event.source) {
      this._clearPreviousSelectedOption(event.source);
      this._setTriggerValue(event.source.value);
      this._onChange(event.source.value);
      this._element.nativeElement.focus();
      this.autocomplete._emitSelectEvent(event.source);
    }

    this.closePanel();
  }

  /**
   * Clear any previous selected option and emit a selection change event for this option
   */
  private _clearPreviousSelectedOption(skip: MatOption) {
    this.autocomplete.options.forEach(option => {
      if (option != skip && option.selected) {
        option.deselect();
      }
    });
  }

  private _attachOverlay(): void {
    if (!this.autocomplete) {
      throw getMatAutocompleteMissingPanelError();
    }

    let overlayRef = this._overlayRef;

    if (!overlayRef) {
      this._portal = new TemplatePortal(this.autocomplete.template, this._viewContainerRef);
      overlayRef = this._overlay.create(this._getOverlayConfig());
      this._overlayRef = overlayRef;

      // Use the `keydownEvents` in order to take advantage of
      // the overlay event targeting provided by the CDK overlay.
      overlayRef.keydownEvents().subscribe(event => {
        // Close when pressing ESCAPE or ALT + UP_ARROW, based on the a11y guidelines.
        // See: https://www.w3.org/TR/wai-aria-practices-1.1/#textbox-keyboard-interaction
        if (event.keyCode === ESCAPE || (event.keyCode === UP_ARROW && event.altKey)) {
          this._resetActiveItem();
          this._closeKeyEventStream.next();
        }
      });

      if (this._viewportRuler) {
        this._viewportSubscription = this._viewportRuler.change().subscribe(() => {
          if (this.panelOpen && overlayRef) {
            overlayRef.updateSize({width: this._getPanelWidth()});
          }
        });
      }
    } else {
      const position = overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy;

      // Update the trigger, panel width and direction, in case anything has changed.
      position.setOrigin(this._getConnectedElement());
      overlayRef.updateSize({width: this._getPanelWidth()});
    }

    if (overlayRef && !overlayRef.hasAttached()) {
      overlayRef.attach(this._portal);
      this._closingActionsSubscription = this._subscribeToClosingActions();
    }

    const wasOpen = this.panelOpen;

    this.autocomplete._setVisibility();
    this.autocomplete._isOpen = this._overlayAttached = true;

    // We need to do an extra `panelOpen` check in here, because the
    // autocomplete won't be shown if there are no options.
    if (this.panelOpen && wasOpen !== this.panelOpen) {
      this.autocomplete.opened.emit();
    }
  }

  private _getOverlayConfig(): OverlayConfig {
    return new OverlayConfig({
      positionStrategy: this._getOverlayPosition(),
      scrollStrategy: this._scrollStrategy(),
      width: this._getPanelWidth(),
      direction: this._dir
    });
  }

  private _getOverlayPosition(): PositionStrategy {
    this._positionStrategy = this._overlay.position()
      .flexibleConnectedTo(this._getConnectedElement())
      .withFlexibleDimensions(false)
      .withPush(false)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top'
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',

          // The overlay edge connected to the trigger should have squared corners, while
          // the opposite end has rounded corners. We apply a CSS class to swap the
          // border-radius based on the overlay position.
          panelClass: 'mat-autocomplete-panel-above'
        }
      ]);

    return this._positionStrategy;
  }

  private _getConnectedElement(): ElementRef {
    if (this.connectedTo) {
      return this.connectedTo.elementRef;
    }

    return this._formField ? this._formField.getConnectedOverlayOrigin() : this._element;
  }

  private _getPanelWidth(): number | string {
    return this.autocomplete.panelWidth || this._getHostWidth();
  }

  /** Returns the width of the input element, so the panel width can match it. */
  private _getHostWidth(): number {
    return this._getConnectedElement().nativeElement.getBoundingClientRect().width;
  }

  /**
   * Resets the active item to -1 so arrow events will activate the
   * correct options, or to 0 if the consumer opted into it.
   */
  private _resetActiveItem(): void {
    this.autocomplete._keyManager.setActiveItem(this.autocomplete.autoActiveFirstOption ? 0 : -1);
  }

  /** Determines whether the panel can be opened. */
  private _canOpen(): boolean {
    const element = this._element.nativeElement;
    return !element.readOnly && !element.disabled && !this._autocompleteDisabled;
  }
}
