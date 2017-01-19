import {
  Directive, ElementRef, Input, ViewContainerRef, Optional, OnDestroy
} from '@angular/core';
import {NgControl} from '@angular/forms';
import {Overlay, OverlayRef, OverlayState, TemplatePortal} from '../core';
import {MdAutocomplete} from './autocomplete';
import {PositionStrategy} from '../core/overlay/position/position-strategy';
import {Observable} from 'rxjs/Observable';
import {MdOptionSelectEvent} from '../core/option/option';
import 'rxjs/add/observable/merge';
import {Dir} from '../core/rtl/dir';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/switchMap';


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

  /* The autocomplete panel to be attached to this trigger. */
  @Input('mdAutocomplete') autocomplete: MdAutocomplete;

  constructor(private _element: ElementRef, private _overlay: Overlay,
              private _viewContainerRef: ViewContainerRef,
              @Optional() private _controlDir: NgControl, @Optional() private _dir: Dir) {}

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
    // TODO(kara): add tab event observable with keyboard event PR
    return Observable.merge(...this.optionSelections, this._overlayRef.backdropClick());
  }

  /** Stream of autocomplete option selections. */
  get optionSelections(): Observable<any>[] {
    return this.autocomplete.options.map(option => option.onSelect);
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
        .switchMap(() => this.panelClosingActions)
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

