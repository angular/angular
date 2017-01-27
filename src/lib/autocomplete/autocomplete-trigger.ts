import {
    AfterContentInit, Directive, ElementRef, Input, ViewContainerRef, Optional, OnDestroy
} from '@angular/core';
import {NgControl} from '@angular/forms';
import {Overlay, OverlayRef, OverlayState, TemplatePortal} from '../core';
import {MdAutocomplete} from './autocomplete';
import {PositionStrategy} from '../core/overlay/position/position-strategy';
import {ConnectedPositionStrategy} from '../core/overlay/position/connected-position-strategy';
import {Observable} from 'rxjs/Observable';
import {MdOptionSelectEvent, MdOption} from '../core/option/option';
import {ActiveDescendantKeyManager} from '../core/a11y/activedescendant-key-manager';
import {ENTER, UP_ARROW, DOWN_ARROW} from '../core/keyboard/keycodes';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/observable/merge';
import {Dir} from '../core/rtl/dir';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/switchMap';

/**
 * The following style constants are necessary to save here in order
 * to properly calculate the scrollTop of the panel. Because we are not
 * actually focusing the active item, scroll must be handled manually.
 */

/** The height of each autocomplete option. */
export const AUTOCOMPLETE_OPTION_HEIGHT = 48;

/** The total height of the autocomplete panel. */
export const AUTOCOMPLETE_PANEL_HEIGHT = 256;

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
    '(keydown)': '_handleKeydown($event)',
  }
})
export class MdAutocompleteTrigger implements AfterContentInit, OnDestroy {
  private _overlayRef: OverlayRef;
  private _portal: TemplatePortal;
  private _panelOpen: boolean = false;

  /** The subscription to positioning changes in the autocomplete panel. */
  private _panelPositionSubscription: Subscription;

  /** Manages active item in option list based on key events. */
  private _keyManager: ActiveDescendantKeyManager;
  private _positionStrategy: ConnectedPositionStrategy;

  /* The autocomplete panel to be attached to this trigger. */
  @Input('mdAutocomplete') autocomplete: MdAutocomplete;

  constructor(private _element: ElementRef, private _overlay: Overlay,
              private _viewContainerRef: ViewContainerRef,
              @Optional() private _controlDir: NgControl, @Optional() private _dir: Dir) {}

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
  }

  /** Closes the autocomplete suggestion panel. */
  closePanel(): void {
    if (this._overlayRef && this._overlayRef.hasAttached()) {
      this._overlayRef.detach();
    }

    this._panelOpen = false;
  }

  /**
   * A stream of actions that should close the autocomplete panel, including
   * when an option is selected and when the backdrop is clicked.
   */
  get panelClosingActions(): Observable<any> {
    return Observable.merge(
        ...this.optionSelections,
        this._overlayRef.backdropClick(),
        this._keyManager.tabOut
    );
  }

  /** Stream of autocomplete option selections. */
  get optionSelections(): Observable<any>[] {
    return this.autocomplete.options.map(option => option.onSelect);
  }

  /** The currently active option, coerced to MdOption type. */
  get activeOption(): MdOption {
    return this._keyManager.activeItem as MdOption;
  }

  _handleKeydown(event: KeyboardEvent): void {
    if (this.activeOption && event.keyCode === ENTER) {
      this.activeOption._selectViaInteraction();
    } else {
      this.openPanel();
      this._keyManager.onKeydown(event);
      if (event.keyCode === UP_ARROW || event.keyCode === DOWN_ARROW) {
        this._scrollToOption();
      }
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
    // Every time the option list changes...
    this.autocomplete.options.changes
    // and also at initialization, before there are any option changes...
        .startWith(null)
        // create a new stream of panelClosingActions, replacing any previous streams
        // that were created, and flatten it so our stream only emits closing events...
        .switchMap(() => {
          this._resetPanel();
          return this.panelClosingActions;
        })
        // when the first closing event occurs...
        .first()
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

   /**
   * This method closes the panel, and if a value is specified, also sets the associated
   * control to that value. It will also mark the control as dirty if this interaction
   * stemmed from the user.
   */
  private _setValueAndClose(event: MdOptionSelectEvent | null): void {
    if (event) {
      this._controlDir.control.setValue(event.source.value);
      if (event.isUserInput) {
        this._controlDir.control.markAsDirty();
      }
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
    overlayState.hasBackdrop = true;
    overlayState.backdropClass = 'md-overlay-transparent-backdrop';
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

