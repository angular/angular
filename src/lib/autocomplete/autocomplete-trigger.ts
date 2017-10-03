/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {DOWN_ARROW, ENTER, ESCAPE, UP_ARROW, TAB} from '@angular/cdk/keycodes';
import {
  ConnectedPositionStrategy,
  Overlay,
  OverlayRef,
  OverlayConfig,
  PositionStrategy,
  RepositionScrollStrategy,
  ScrollStrategy,
} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {filter, first, RxChain, switchMap, doOperator, delay} from '@angular/cdk/rxjs';
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
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {MatOption, MatOptionSelectionChange} from '@angular/material/core';
import {MatFormField} from '@angular/material/form-field';
import {DOCUMENT} from '@angular/platform-browser';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {fromEvent} from 'rxjs/observable/fromEvent';
import {merge} from 'rxjs/observable/merge';
import {of as observableOf} from 'rxjs/observable/of';
import {Subscription} from 'rxjs/Subscription';
import {MatAutocomplete} from './autocomplete';


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
export function MAT_AUTOCOMPLETE_SCROLL_STRATEGY_PROVIDER_FACTORY(overlay: Overlay):
    () => RepositionScrollStrategy {
  return () => overlay.scrollStrategies.reposition();
}

/** @docs-private */
export const MAT_AUTOCOMPLETE_SCROLL_STRATEGY_PROVIDER = {
  provide: MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
  deps: [Overlay],
  useFactory: MAT_AUTOCOMPLETE_SCROLL_STRATEGY_PROVIDER_FACTORY,
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
 */
export function getMatAutocompleteMissingPanelError(): Error {
  return Error('Attempting to open an undefined instance of `mat-autocomplete`. ' +
               'Make sure that the id passed to the `matAutocomplete` is correct and that ' +
               'you\'re attempting to open it after the ngAfterContentInit hook.');
}

@Directive({
  selector: `input[matAutocomplete], textarea[matAutocomplete]`,
  host: {
    'role': 'combobox',
    'autocomplete': 'off',
    'aria-autocomplete': 'list',
    '[attr.aria-activedescendant]': 'activeOption?.id',
    '[attr.aria-expanded]': 'panelOpen.toString()',
    '[attr.aria-owns]': 'autocomplete?.id',
    // Note: we use `focusin`, as opposed to `focus`, in order to open the panel
    // a little earlier. This avoids issues where IE delays the focusing of the input.
    '(focusin)': '_handleFocus()',
    '(blur)': '_onTouched()',
    '(input)': '_handleInput($event)',
    '(keydown)': '_handleKeydown($event)',
  },
  providers: [MAT_AUTOCOMPLETE_VALUE_ACCESSOR]
})
export class MatAutocompleteTrigger implements ControlValueAccessor, OnDestroy {
  private _overlayRef: OverlayRef | null;
  private _portal: TemplatePortal<any>;
  private _panelOpen: boolean = false;

  /** Strategy that is used to position the panel. */
  private _positionStrategy: ConnectedPositionStrategy;

  /** Whether or not the placeholder state is being overridden. */
  private _manuallyFloatingPlaceholder = false;

  /** The subscription for closing actions (some are bound to document). */
  private _closingActionsSubscription: Subscription;

  /** Stream of escape keyboard events. */
  private _escapeEventStream = new Subject<void>();

  /** View -> model callback called when value changes */
  _onChange: (value: any) => void = () => {};

  /** View -> model callback called when autocomplete has been touched */
  _onTouched = () => {};

  /* The autocomplete panel to be attached to this trigger. */
  @Input('matAutocomplete') autocomplete: MatAutocomplete;

  constructor(private _element: ElementRef, private _overlay: Overlay,
              private _viewContainerRef: ViewContainerRef,
              private _zone: NgZone,
              private _changeDetectorRef: ChangeDetectorRef,
              @Inject(MAT_AUTOCOMPLETE_SCROLL_STRATEGY) private _scrollStrategy,
              @Optional() private _dir: Directionality,
              @Optional() @Host() private _formField: MatFormField,
              @Optional() @Inject(DOCUMENT) private _document: any) {}

  ngOnDestroy() {
    this._destroyPanel();
    this._escapeEventStream.complete();
  }

  /* Whether or not the autocomplete panel is open. */
  get panelOpen(): boolean {
    return this._panelOpen && this.autocomplete.showPanel;
  }

  /** Opens the autocomplete suggestion panel. */
  openPanel(): void {
    this._attachOverlay();
    this._floatPlaceholder();
  }

  /** Closes the autocomplete suggestion panel. */
  closePanel(): void {
    if (this._overlayRef && this._overlayRef.hasAttached()) {
      this._overlayRef.detach();
      this._closingActionsSubscription.unsubscribe();
    }

    this._resetPlaceholder();

    if (this._panelOpen) {
      this.autocomplete._isOpen = this._panelOpen = false;

      // We need to trigger change detection manually, because
      // `fromEvent` doesn't seem to do it at the proper time.
      // This ensures that the placeholder is reset when the
      // user clicks outside.
      this._changeDetectorRef.detectChanges();
    }
  }

  /**
   * A stream of actions that should close the autocomplete panel, including
   * when an option is selected, on blur, and when TAB is pressed.
   */
  get panelClosingActions(): Observable<MatOptionSelectionChange> {
    return merge(
      this.optionSelections,
      this.autocomplete._keyManager.tabOut,
      this._escapeEventStream,
      this._outsideClickStream
    );
  }

  /** Stream of autocomplete option selections. */
  get optionSelections(): Observable<MatOptionSelectionChange> {
    return merge(...this.autocomplete.options.map(option => option.onSelectionChange));
  }

  /** The currently active option, coerced to MatOption type. */
  get activeOption(): MatOption | null {
    if (this.autocomplete && this.autocomplete._keyManager) {
      return this.autocomplete._keyManager.activeItem;
    }

    return null;
  }

  /** Stream of clicks outside of the autocomplete panel. */
  private get _outsideClickStream(): Observable<any> {
    if (!this._document) {
      return observableOf(null);
    }

    return RxChain.from(merge(
      fromEvent(this._document, 'click'),
      fromEvent(this._document, 'touchend')
    )).call(filter, (event: MouseEvent | TouchEvent) => {
      const clickTarget = event.target as HTMLElement;
      const formField = this._formField ?
          this._formField._elementRef.nativeElement : null;

      return this._panelOpen &&
             clickTarget !== this._element.nativeElement &&
             (!formField || !formField.contains(clickTarget)) &&
             (!!this._overlayRef && !this._overlayRef.overlayElement.contains(clickTarget));
    }).result();
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
    const keyCode = event.keyCode;

    if (keyCode === ESCAPE && this.panelOpen) {
      this._resetActiveItem();
      this._escapeEventStream.next();
      event.stopPropagation();
    } else if (this.activeOption && keyCode === ENTER && this.panelOpen) {
      this.activeOption._selectViaInteraction();
      this._resetActiveItem();
      event.preventDefault();
    } else {
      const prevActiveItem = this.autocomplete._keyManager.activeItem;
      const isArrowKey = keyCode === UP_ARROW || keyCode === DOWN_ARROW;

      if (this.panelOpen || keyCode === TAB) {
        this.autocomplete._keyManager.onKeydown(event);
      } else if (isArrowKey) {
        this.openPanel();
      }

      if (isArrowKey || this.autocomplete._keyManager.activeItem !== prevActiveItem) {
        this._scrollToOption();
      }
    }
  }

  _handleInput(event: KeyboardEvent): void {
    // We need to ensure that the input is focused, because IE will fire the `input`
    // event on focus/blur/load if the input has a placeholder. See:
    // https://connect.microsoft.com/IE/feedback/details/885747/
    if (document.activeElement === event.target) {
      this._onChange((event.target as HTMLInputElement).value);
      this.openPanel();
    }
  }

  _handleFocus(): void {
    if (!this._element.nativeElement.readOnly) {
      this._attachOverlay();
      this._floatPlaceholder(true);
    }
  }

  /**
   * In "auto" mode, the placeholder will animate down as soon as focus is lost.
   * This causes the value to jump when selecting an option with the mouse.
   * This method manually floats the placeholder until the panel can be closed.
   * @param shouldAnimate Whether the placeholder should be animated when it is floated.
   */
  private _floatPlaceholder(shouldAnimate = false): void {
    if (this._formField && this._formField.floatPlaceholder === 'auto') {
      if (shouldAnimate) {
        this._formField._animateAndLockPlaceholder();
      } else {
        this._formField.floatPlaceholder = 'always';
      }

      this._manuallyFloatingPlaceholder = true;
    }
  }

  /** If the placeholder has been manually elevated, return it to its normal state. */
  private _resetPlaceholder(): void  {
    if (this._manuallyFloatingPlaceholder) {
      this._formField.floatPlaceholder = 'auto';
      this._manuallyFloatingPlaceholder = false;
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
    const activeOptionIndex = this.autocomplete._keyManager.activeItemIndex || 0;
    const labelCount = MatOption.countGroupLabelsBeforeOption(activeOptionIndex,
        this.autocomplete.options, this.autocomplete.optionGroups);
    const optionOffset = (activeOptionIndex + labelCount) * AUTOCOMPLETE_OPTION_HEIGHT;
    const panelTop = this.autocomplete._getScrollTop();

    if (optionOffset < panelTop) {
      // Scroll up to reveal selected option scrolled above the panel top
      this.autocomplete._setScrollTop(optionOffset);
    } else if (optionOffset + AUTOCOMPLETE_OPTION_HEIGHT > panelTop + AUTOCOMPLETE_PANEL_HEIGHT) {
      // Scroll down to reveal selected option scrolled below the panel bottom
      const newScrollTop = optionOffset - AUTOCOMPLETE_PANEL_HEIGHT + AUTOCOMPLETE_OPTION_HEIGHT;
      this.autocomplete._setScrollTop(Math.max(0, newScrollTop));
    }
  }

  /**
   * This method listens to a stream of panel closing actions and resets the
   * stream every time the option list changes.
   */
  private _subscribeToClosingActions(): Subscription {
    const firstStable = first.call(this._zone.onStable.asObservable());
    const optionChanges = RxChain.from(this.autocomplete.options.changes)
      .call(doOperator, () => this._positionStrategy.recalculateLastPosition())
      // Defer emitting to the stream until the next tick, because changing
      // bindings in here will cause "changed after checked" errors.
      .call(delay, 0)
      .result();

    // When the zone is stable initially, and when the option list changes...
    return RxChain.from(merge(firstStable, optionChanges))
      // create a new stream of panelClosingActions, replacing any previous streams
      // that were created, and flatten it so our stream only emits closing events...
      .call(switchMap, () => {
        this._resetActiveItem();
        this.autocomplete._setVisibility();
        return this.panelClosingActions;
      })
      // when the first closing event occurs...
      .call(first)
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

    if (!this._overlayRef) {
      this._portal = new TemplatePortal(this.autocomplete.template, this._viewContainerRef);
      this._overlayRef = this._overlay.create(this._getOverlayConfig());
    } else {
      /** Update the panel width, in case the host width has changed */
      this._overlayRef.getConfig().width = this._getHostWidth();
      this._overlayRef.updateSize();
    }

    if (this._overlayRef && !this._overlayRef.hasAttached()) {
      this._overlayRef.attach(this._portal);
      this._closingActionsSubscription = this._subscribeToClosingActions();
    }

    this.autocomplete._setVisibility();
    this.autocomplete._isOpen = this._panelOpen = true;
  }

  private _getOverlayConfig(): OverlayConfig {
    return new OverlayConfig({
      positionStrategy: this._getOverlayPosition(),
      scrollStrategy: this._scrollStrategy(),
      width: this._getHostWidth(),
      direction: this._dir ? this._dir.value : 'ltr'
    });
  }

  private _getOverlayPosition(): PositionStrategy {
    this._positionStrategy =  this._overlay.position().connectedTo(
        this._getConnectedElement(),
        {originX: 'start', originY: 'bottom'}, {overlayX: 'start', overlayY: 'top'})
        .withFallbackPosition(
            {originX: 'start', originY: 'top'}, {overlayX: 'start', overlayY: 'bottom'}
        );
    return this._positionStrategy;
  }

  private _getConnectedElement(): ElementRef {
    return this._formField ? this._formField._connectionContainerRef : this._element;
  }

  /** Returns the width of the input element, so the panel width can match it. */
  private _getHostWidth(): number {
    return this._getConnectedElement().nativeElement.getBoundingClientRect().width;
  }

  /** Reset active item to -1 so arrow events will activate the correct options.*/
  private _resetActiveItem(): void {
    this.autocomplete._keyManager.setActiveItem(-1);
  }

}
