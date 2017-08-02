/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterContentInit,
  Component,
  ContentChildren,
  ElementRef,
  Input,
  Optional,
  Output,
  QueryList,
  ChangeDetectionStrategy,
  EventEmitter,
  Renderer2,
  ViewEncapsulation,
  NgZone,
  OnDestroy,
  Inject,
  ChangeDetectorRef,
} from '@angular/core';
import {animate, state, style, transition, trigger, AnimationEvent} from '@angular/animations';
import {Directionality, coerceBooleanProperty} from '../core';
import {FocusTrapFactory, FocusTrap} from '../core/a11y/focus-trap';
import {ESCAPE} from '../core/keyboard/keycodes';
import {first, takeUntil, startWith} from '../core/rxjs/index';
import {DOCUMENT} from '@angular/platform-browser';
import {merge} from 'rxjs/observable/merge';


/** Throws an exception when two MdSidenav are matching the same side. */
export function throwMdDuplicatedSidenavError(align: string) {
  throw Error(`A sidenav was already declared for 'align="${align}"'`);
}


/**
 * Sidenav toggle promise result.
 * @deprecated
 */
export class MdSidenavToggleResult {
  constructor(public type: 'open' | 'close', public animationFinished: boolean) {}
}

/**
 * <md-sidenav> component.
 *
 * This component corresponds to the drawer of the sidenav.
 *
 * Please refer to README.md for examples on how to use it.
 */
@Component({
  moduleId: module.id,
  selector: 'md-sidenav, mat-sidenav',
  templateUrl: 'sidenav.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('transform', [
      state('open, open-instant', style({
        transform: 'translate3d(0, 0, 0)',
        visibility: 'visible',
      })),
      state('void', style({
        visibility: 'hidden',
      })),
      transition('void => open-instant', animate('0ms')),
      transition('void <=> open', animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)'))
    ])
  ],
  host: {
    'class': 'mat-sidenav',
    '[@transform]': '_getAnimationState()',
    '(@transform.start)': '_onAnimationStart()',
    '(@transform.done)': '_onAnimationEnd($event)',
    '(keydown)': 'handleKeydown($event)',
    // must prevent the browser from aligning text based on value
    '[attr.align]': 'null',
    '[class.mat-sidenav-end]': 'align === "end"',
    '[class.mat-sidenav-over]': 'mode === "over"',
    '[class.mat-sidenav-push]': 'mode === "push"',
    '[class.mat-sidenav-side]': 'mode === "side"',
    'tabIndex': '-1'
  },
})
export class MdSidenav implements AfterContentInit, OnDestroy {
  private _focusTrap: FocusTrap;
  private _elementFocusedBeforeSidenavWasOpened: HTMLElement | null = null;

  /** Whether the sidenav is initialized. Used for disabling the initial animation. */
  private _enableAnimations = false;

  /** Alignment of the sidenav (direction neutral); whether 'start' or 'end'. */
  private _align: 'start' | 'end' = 'start';

  /** Direction which the sidenav is aligned in. */
  @Input()
  get align() { return this._align; }
  set align(value) {
    // Make sure we have a valid value.
    value = value === 'end' ? 'end' : 'start';
    if (value != this._align) {
      this._align = value;
      this.onAlignChanged.emit();
    }
  }

  /** Mode of the sidenav; one of 'over', 'push' or 'side'. */
  @Input() mode: 'over' | 'push' | 'side' = 'over';

  /** Whether the sidenav can be closed with the escape key or not. */
  @Input()
  get disableClose(): boolean { return this._disableClose; }
  set disableClose(value: boolean) { this._disableClose = coerceBooleanProperty(value); }
  private _disableClose: boolean = false;

  /** Whether the sidenav is opened. */
  private _opened: boolean = false;

  /** Emits whenever the sidenav has started animating. */
  _animationStarted = new EventEmitter<void>();

  /** Whether the sidenav is animating. Used to prevent overlapping animations. */
  _isAnimating = false;

  /**
   * Promise that resolves when the open/close animation completes. It is here for backwards
   * compatibility and should be removed next time we do sidenav breaking changes.
   * @deprecated
   */
  private _currentTogglePromise: Promise<MdSidenavToggleResult> | null;

  /** Event emitted when the sidenav is fully opened. */
  @Output('open') onOpen = new EventEmitter<MdSidenavToggleResult | void>();

  /** Event emitted when the sidenav is fully closed. */
  @Output('close') onClose = new EventEmitter<MdSidenavToggleResult | void>();

  /** Event emitted when the sidenav alignment changes. */
  @Output('align-changed') onAlignChanged = new EventEmitter<void>();

  get isFocusTrapEnabled() {
    // The focus trap is only enabled when the sidenav is open in any mode other than side.
    return this.opened && this.mode !== 'side';
  }

  constructor(private _elementRef: ElementRef,
              private _focusTrapFactory: FocusTrapFactory,
              @Optional() @Inject(DOCUMENT) private _doc: any) {
    this.onOpen.subscribe(() => {
      if (this._doc) {
        this._elementFocusedBeforeSidenavWasOpened = this._doc.activeElement as HTMLElement;
      }

      if (this.isFocusTrapEnabled && this._focusTrap) {
        this._focusTrap.focusInitialElementWhenReady();
      }
    });

    this.onClose.subscribe(() => this._restoreFocus());
  }

  /**
   * If focus is currently inside the sidenav, restores it to where it was before the sidenav
   * opened.
   */
  private _restoreFocus() {
    let activeEl = this._doc && this._doc.activeElement;
    if (activeEl && this._elementRef.nativeElement.contains(activeEl)) {
      if (this._elementFocusedBeforeSidenavWasOpened instanceof HTMLElement) {
        this._elementFocusedBeforeSidenavWasOpened.focus();
      } else {
        this._elementRef.nativeElement.blur();
      }
    }

    this._elementFocusedBeforeSidenavWasOpened = null;
  }

  ngAfterContentInit() {
    this._focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement);
    this._focusTrap.enabled = this.isFocusTrapEnabled;
    Promise.resolve().then(() => this._enableAnimations = true);
  }

  ngOnDestroy() {
    if (this._focusTrap) {
      this._focusTrap.destroy();
    }
  }

  /**
   * Whether the sidenav is opened. We overload this because we trigger an event when it
   * starts or end.
   */
  @Input()
  get opened(): boolean { return this._opened; }
  set opened(v: boolean) {
    this.toggle(coerceBooleanProperty(v));
  }


  /**  Open the sidenav. */
  open(): Promise<MdSidenavToggleResult> {
    return this.toggle(true);
  }

  /** Close the sidenav. */
  close(): Promise<MdSidenavToggleResult> {
    return this.toggle(false);
  }

  /**
   * Toggle this sidenav.
   * @param isOpen Whether the sidenav should be open.
   */
  toggle(isOpen: boolean = !this.opened): Promise<MdSidenavToggleResult> {
    if (!this._isAnimating) {
      this._opened = isOpen;
      this._currentTogglePromise = new Promise(resolve => {
        first.call(isOpen ? this.onOpen : this.onClose).subscribe(resolve);
      });

      if (this._focusTrap) {
        this._focusTrap.enabled = this.isFocusTrapEnabled;
      }
    }

    // TODO(crisbeto): This promise is here backwards-compatibility.
    // It should be removed next time we do breaking changes in the sidenav.
    return this._currentTogglePromise!;
  }

  /**
   * Handles the keyboard events.
   * @docs-private
   */
  handleKeydown(event: KeyboardEvent) {
    if (event.keyCode === ESCAPE && !this.disableClose) {
      this.close();
      event.stopPropagation();
    }
  }

  /**
   * Figures out the state of the sidenav animation.
   */
  _getAnimationState(): 'open-instant' | 'open' | 'void' {
    if (this.opened) {
      return this._enableAnimations ? 'open' : 'open-instant';
    }

    return 'void';
  }

  _onAnimationStart() {
    this._isAnimating = true;
    this._animationStarted.emit();
  }

  _onAnimationEnd(event: AnimationEvent) {
    const {fromState, toState} = event;

    if (toState === 'open' && fromState === 'void') {
      this.onOpen.emit(new MdSidenavToggleResult('open', true));
    } else if (toState === 'void' && fromState === 'open') {
      this.onClose.emit(new MdSidenavToggleResult('close', true));
    }

    this._isAnimating = false;
    this._currentTogglePromise = null;
  }

  get _width() {
    return this._elementRef.nativeElement ? (this._elementRef.nativeElement.offsetWidth || 0) : 0;
  }
}

/**
 * <md-sidenav-container> component.
 *
 * This is the parent component to one or two <md-sidenav>s that validates the state internally
 * and coordinates the backdrop and content styling.
 */
@Component({
  moduleId: module.id,
  selector: 'md-sidenav-container, mat-sidenav-container',
  templateUrl: 'sidenav-container.html',
  styleUrls: [
    'sidenav.css',
    'sidenav-transitions.css',
  ],
  host: {
    'class': 'mat-sidenav-container',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MdSidenavContainer implements AfterContentInit {
  @ContentChildren(MdSidenav) _sidenavs: QueryList<MdSidenav>;

  /** The sidenav child with the `start` alignment. */
  get start() { return this._start; }

  /** The sidenav child with the `end` alignment. */
  get end() { return this._end; }

  /** Event emitted when the sidenav backdrop is clicked. */
  @Output() backdropClick = new EventEmitter<void>();

  /** The sidenav at the start/end alignment, independent of direction. */
  private _start: MdSidenav | null;
  private _end: MdSidenav | null;

  /**
   * The sidenav at the left/right. When direction changes, these will change as well.
   * They're used as aliases for the above to set the left/right style properly.
   * In LTR, _left == _start and _right == _end.
   * In RTL, _left == _end and _right == _start.
   */
  private _left: MdSidenav | null;
  private _right: MdSidenav | null;

  /** Inline styles to be applied to the container. */
  _styles: { marginLeft: string; marginRight: string; transform: string; };

  constructor(@Optional() private _dir: Directionality, private _element: ElementRef,
              private _renderer: Renderer2, private _ngZone: NgZone,
              private _changeDetectorRef: ChangeDetectorRef) {
    // If a `Dir` directive exists up the tree, listen direction changes and update the left/right
    // properties to point to the proper start/end.
    if (_dir != null) {
      _dir.change.subscribe(() => this._validateDrawers());
    }
  }

  ngAfterContentInit() {
    startWith.call(this._sidenavs.changes, null).subscribe(() => {
      this._validateDrawers();
      this._sidenavs.forEach((sidenav: MdSidenav) => {
        this._watchSidenavToggle(sidenav);
        this._watchSidenavAlign(sidenav);
      });
    });
  }

  /** Calls `open` of both start and end sidenavs */
  open(): void {
    this._sidenavs.forEach(sidenav => sidenav.open());
  }

  /** Calls `close` of both start and end sidenavs */
  close(): void {
    this._sidenavs.forEach(sidenav => sidenav.close());
  }

  /**
   * Subscribes to sidenav events in order to set a class on the main container element when the
   * sidenav is open and the backdrop is visible. This ensures any overflow on the container element
   * is properly hidden.
   */
  private _watchSidenavToggle(sidenav: MdSidenav): void {
    takeUntil.call(sidenav._animationStarted, this._sidenavs.changes).subscribe(() => {
      // Set the transition class on the container so that the animations occur. This should not
      // be set initially because animations should only be triggered via a change in state.
      this._renderer.addClass(this._element.nativeElement, 'mat-sidenav-transition');
      this._updateStyles();
      this._changeDetectorRef.markForCheck();
    });

    if (sidenav.mode !== 'side') {
      takeUntil.call(merge(sidenav.onOpen, sidenav.onClose), this._sidenavs.changes).subscribe(() =>
          this._setContainerClass(sidenav.opened));
    }
  }

  /**
   * Subscribes to sidenav onAlignChanged event in order to re-validate drawers when the align
   * changes.
   */
  private _watchSidenavAlign(sidenav: MdSidenav): void {
    if (!sidenav) {
      return;
    }
    // NOTE: We need to wait for the microtask queue to be empty before validating,
    // since both drawers may be swapping sides at the same time.
    takeUntil.call(sidenav.onAlignChanged, this._sidenavs.changes).subscribe(() =>
        first.call(this._ngZone.onMicrotaskEmpty).subscribe(() => this._validateDrawers()));
  }

  /** Toggles the 'mat-sidenav-opened' class on the main 'md-sidenav-container' element. */
  private _setContainerClass(isAdd: boolean): void {
    if (isAdd) {
      this._renderer.addClass(this._element.nativeElement, 'mat-sidenav-opened');
    } else {
      this._renderer.removeClass(this._element.nativeElement, 'mat-sidenav-opened');
    }
  }

  /** Validate the state of the sidenav children components. */
  private _validateDrawers() {
    this._start = this._end = null;

    // Ensure that we have at most one start and one end sidenav.
    this._sidenavs.forEach(sidenav => {
      if (sidenav.align == 'end') {
        if (this._end != null) {
          throwMdDuplicatedSidenavError('end');
        }
        this._end = sidenav;
      } else {
        if (this._start != null) {
          throwMdDuplicatedSidenavError('start');
        }
        this._start = sidenav;
      }
    });

    this._right = this._left = null;

    // Detect if we're LTR or RTL.
    if (this._dir == null || this._dir.value == 'ltr') {
      this._left = this._start;
      this._right = this._end;
    } else {
      this._left = this._end;
      this._right = this._start;
    }
  }

  _onBackdropClicked() {
    this.backdropClick.emit();
    this._closeModalSidenav();
  }

  _closeModalSidenav() {
    // Close all open sidenav's where closing is not disabled and the mode is not `side`.
    [this._start, this._end]
      .filter(sidenav => sidenav && !sidenav.disableClose && sidenav.mode !== 'side')
      .forEach(sidenav => sidenav!.close());
  }

  _isShowingBackdrop(): boolean {
    return (this._isSidenavOpen(this._start) && this._start!.mode != 'side')
        || (this._isSidenavOpen(this._end) && this._end!.mode != 'side');
  }

  private _isSidenavOpen(side: MdSidenav | null): boolean {
    return side != null && side.opened;
  }

  /**
   * Return the width of the sidenav, if it's in the proper mode and opened.
   * This may relayout the view, so do not call this often.
   * @param sidenav
   * @param mode
   */
  private _getSidenavEffectiveWidth(sidenav: MdSidenav, mode: string): number {
    return (this._isSidenavOpen(sidenav) && sidenav.mode == mode) ? sidenav._width : 0;
  }

  /**
   * Recalculates and updates the inline styles. Note that this
   * should be used sparingly, because it causes a reflow.
   */
  private _updateStyles() {
    const marginLeft = this._left ? this._getSidenavEffectiveWidth(this._left, 'side') : 0;
    const marginRight = this._right ? this._getSidenavEffectiveWidth(this._right, 'side') : 0;
    const leftWidth = this._left ? this._getSidenavEffectiveWidth(this._left, 'push') : 0;
    const rightWidth = this._right ? this._getSidenavEffectiveWidth(this._right, 'push') : 0;

    this._styles = {
      marginLeft: `${marginLeft}px`,
      marginRight: `${marginRight}px`,
      transform: `translate3d(${leftWidth - rightWidth}px, 0, 0)`
    };
  }
}
