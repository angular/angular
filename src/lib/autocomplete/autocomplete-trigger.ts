import {
  Directive, ElementRef, Input, ViewContainerRef, Optional, OnDestroy
} from '@angular/core';
import {Overlay, OverlayRef, OverlayState, TemplatePortal} from '../core';
import {MdAutocomplete} from './autocomplete';
import {PositionStrategy} from '../core/overlay/position/position-strategy';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/observable/merge';
import {Dir} from '../core/rtl/dir';

/** The panel needs a slight y-offset to ensure the input underline displays. */
export const MD_AUTOCOMPLETE_PANEL_OFFSET = 6;

@Directive({
  selector: 'input[mdAutocomplete], input[matAutocomplete]',
  host: {
    '(focus)': 'openPanel()'
  }
})
export class MdAutocompleteTrigger implements OnDestroy {
  private _overlayRef: OverlayRef;
  private _portal: TemplatePortal;
  private _panelOpen: boolean = false;

  /** The subscription to events that close the autocomplete panel. */
  private _closingActionsSubscription: Subscription;

  /* The autocomplete panel to be attached to this trigger. */
  @Input('mdAutocomplete') autocomplete: MdAutocomplete;

  constructor(private _element: ElementRef, private _overlay: Overlay,
              private _viewContainerRef: ViewContainerRef, @Optional() private _dir: Dir) {}

  ngOnDestroy() { this._destroyPanel(); }

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
      this._closingActionsSubscription =
          this.panelClosingActions.subscribe(() => this.closePanel());
    }

    this._panelOpen = true;
  }

  /** Closes the autocomplete suggestion panel. */
  closePanel(): void {
    if (this._overlayRef && this._overlayRef.hasAttached()) {
      this._overlayRef.detach();
    }

    this._closingActionsSubscription.unsubscribe();
    this._panelOpen = false;
  }

  /**
   * A stream of actions that should close the autocomplete panel, including
   * when an option is selected and when the backdrop is clicked.
   */
  get panelClosingActions(): Observable<any> {
    // TODO(kara): add tab event observable with keyboard event PR
    return Observable.merge(...this.optionSelections, this._overlayRef.backdropClick());
  }

  /** Stream of autocomplete option selections. */
  get optionSelections(): Observable<any>[] {
    return this.autocomplete.options.map(option => option.onSelect);
  }

  /** Destroys the autocomplete suggestion panel. */
  private _destroyPanel(): void {
    if (this._overlayRef) {
      this.closePanel();
      this._overlayRef.dispose();
      this._overlayRef = null;
    }
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
    return this._overlay.position().connectedTo(
        this._element,
        {originX: 'start', originY: 'bottom'}, {overlayX: 'start', overlayY: 'top'})
        .withOffsetY(MD_AUTOCOMPLETE_PANEL_OFFSET);
  }

  /** Returns the width of the input element, so the panel width can match it. */
  private _getHostWidth(): number {
    return this._element.nativeElement.getBoundingClientRect().width;
  }

}

