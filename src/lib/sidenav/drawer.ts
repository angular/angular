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
import {Subscription} from 'rxjs/Subscription';


/** Throws an exception when two MdDrawer are matching the same position. */
export function throwMdDuplicatedDrawerError(position: string) {
  throw Error(`A drawer was already declared for 'position="${position}"'`);
}


/**
 * Drawer toggle promise result.
 * @deprecated
 */
export class MdDrawerToggleResult {
  constructor(public type: 'open' | 'close', public animationFinished: boolean) {}
}

/**
 * <md-drawer> component.
 *
 * This component corresponds to a drawer that can be opened on the drawer container.
 *
 * Please refer to README.md for examples on how to use it.
 */
@Component({
  moduleId: module.id,
  selector: 'md-drawer, mat-drawer',
  templateUrl: 'drawer.html',
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
      transition('void <=> open, open-instant => void',
          animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)'))
    ])
  ],
  host: {
    'class': 'mat-drawer',
    '[@transform]': '_animationState',
    '(@transform.start)': '_onAnimationStart()',
    '(@transform.done)': '_onAnimationEnd($event)',
    '(keydown)': 'handleKeydown($event)',
    // must prevent the browser from aligning text based on value
    '[attr.align]': 'null',
    '[class.mat-drawer-end]': 'position === "end"',
    '[class.mat-drawer-over]': 'mode === "over"',
    '[class.mat-drawer-push]': 'mode === "push"',
    '[class.mat-drawer-side]': 'mode === "side"',
    'tabIndex': '-1',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MdDrawer implements AfterContentInit, OnDestroy {
  private _focusTrap: FocusTrap;
  private _elementFocusedBeforeDrawerWasOpened: HTMLElement | null = null;

  /** Whether the drawer is initialized. Used for disabling the initial animation. */
  private _enableAnimations = false;

  /** The side that the drawer is attached to. */
  @Input()
  get position() { return this._position; }
  set position(value) {
    // Make sure we have a valid value.
    value = value === 'end' ? 'end' : 'start';
    if (value != this._position) {
      this._position = value;
      this.onAlignChanged.emit();
      this.onPositionChanged.emit();
    }
  }
  private _position: 'start' | 'end' = 'start';

  /** @deprecated */
  @Input()
  get align() { return this.position; }
  set align(value) { this.position = value; }

  /** Mode of the drawer; one of 'over', 'push' or 'side'. */
  @Input() mode: 'over' | 'push' | 'side' = 'over';

  /** Whether the drawer can be closed with the escape key or by clicking on the backdrop. */
  @Input()
  get disableClose(): boolean { return this._disableClose; }
  set disableClose(value: boolean) { this._disableClose = coerceBooleanProperty(value); }
  private _disableClose: boolean = false;

  /** Whether the drawer is opened. */
  private _opened: boolean = false;

  /** Emits whenever the drawer has started animating. */
  _animationStarted = new EventEmitter<void>();

  /** Whether the drawer is animating. Used to prevent overlapping animations. */
  _isAnimating = false;

  /** Current state of the sidenav animation. */
  _animationState: 'open-instant' | 'open' | 'void' = 'void';

  /**
   * Promise that resolves when the open/close animation completes. It is here for backwards
   * compatibility and should be removed next time we do drawer breaking changes.
   * @deprecated
   */
  private _currentTogglePromise: Promise<MdDrawerToggleResult> | null;

  /** Event emitted when the drawer is fully opened. */
  @Output('open') onOpen = new EventEmitter<MdDrawerToggleResult | void>();

  /** Event emitted when the drawer is fully closed. */
  @Output('close') onClose = new EventEmitter<MdDrawerToggleResult | void>();

  /** Event emitted when the drawer's position changes. */
  @Output('positionChanged') onPositionChanged = new EventEmitter<void>();

  /** @deprecated */
  @Output('align-changed') onAlignChanged = new EventEmitter<void>();

  get isFocusTrapEnabled() {
    // The focus trap is only enabled when the drawer is open in any mode other than side.
    return this.opened && this.mode !== 'side';
  }

  constructor(private _elementRef: ElementRef,
              private _focusTrapFactory: FocusTrapFactory,
              @Optional() @Inject(DOCUMENT) private _doc: any) {
    this.onOpen.subscribe(() => {
      if (this._doc) {
        this._elementFocusedBeforeDrawerWasOpened = this._doc.activeElement as HTMLElement;
      }

      if (this.isFocusTrapEnabled && this._focusTrap) {
        this._focusTrap.focusInitialElementWhenReady();
      }
    });

    this.onClose.subscribe(() => this._restoreFocus());
  }

  /**
   * If focus is currently inside the drawer, restores it to where it was before the drawer
   * opened.
   */
  private _restoreFocus() {
    let activeEl = this._doc && this._doc.activeElement;
    if (activeEl && this._elementRef.nativeElement.contains(activeEl)) {
      if (this._elementFocusedBeforeDrawerWasOpened instanceof HTMLElement) {
        this._elementFocusedBeforeDrawerWasOpened.focus();
      } else {
        this._elementRef.nativeElement.blur();
      }
    }

    this._elementFocusedBeforeDrawerWasOpened = null;
  }

  ngAfterContentInit() {
    this._focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement);
    this._focusTrap.enabled = this.isFocusTrapEnabled;
    this._enableAnimations = true;
  }

  ngOnDestroy() {
    if (this._focusTrap) {
      this._focusTrap.destroy();
    }
  }

  /**
   * Whether the drawer is opened. We overload this because we trigger an event when it
   * starts or end.
   */
  @Input()
  get opened(): boolean { return this._opened; }
  set opened(v: boolean) {
    this.toggle(coerceBooleanProperty(v));
  }


  /** Open the drawer. */
  open(): Promise<MdDrawerToggleResult> {
    return this.toggle(true);
  }

  /** Close the drawer. */
  close(): Promise<MdDrawerToggleResult> {
    return this.toggle(false);
  }

  /**
   * Toggle this drawer.
   * @param isOpen Whether the drawer should be open.
   */
  toggle(isOpen: boolean = !this.opened): Promise<MdDrawerToggleResult> {
    if (!this._isAnimating) {
      this._opened = isOpen;

      if (isOpen) {
        this._animationState = this._enableAnimations ? 'open' : 'open-instant';
      } else {
        this._animationState = 'void';
      }

      this._currentTogglePromise = new Promise(resolve => {
        first.call(isOpen ? this.onOpen : this.onClose).subscribe(resolve);
      });

      if (this._focusTrap) {
        this._focusTrap.enabled = this.isFocusTrapEnabled;
      }
    }

    // TODO(crisbeto): This promise is here for backwards-compatibility.
    // It should be removed next time we do breaking changes in the drawer.
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

  _onAnimationStart() {
    this._isAnimating = true;
    this._animationStarted.emit();
  }

  _onAnimationEnd(event: AnimationEvent) {
    const {fromState, toState} = event;

    if (toState === 'open' && fromState === 'void') {
      this.onOpen.emit(new MdDrawerToggleResult('open', true));
    } else if (toState === 'void' && fromState === 'open') {
      this.onClose.emit(new MdDrawerToggleResult('close', true));
    }

    // Note: as of Angular 4.3, the animations module seems to fire the `start` callback before
    // the end if animations are disabled. Make this call async to ensure that it still fires
    // at the appropriate time.
    Promise.resolve().then(() => {
      this._isAnimating = false;
      this._currentTogglePromise = null;
    });
  }

  get _width() {
    return this._elementRef.nativeElement ? (this._elementRef.nativeElement.offsetWidth || 0) : 0;
  }
}

/**
 * <md-drawer-container> component.
 *
 * This is the parent component to one or two <md-drawer>s that validates the state internally
 * and coordinates the backdrop and content styling.
 */
@Component({
  moduleId: module.id,
  selector: 'md-drawer-container, mat-drawer-container',
  templateUrl: 'drawer-container.html',
  styleUrls: [
    'drawer.css',
    'drawer-transitions.css',
  ],
  host: {
    'class': 'mat-drawer-container',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MdDrawerContainer implements AfterContentInit, OnDestroy {
  @ContentChildren(MdDrawer) _drawers: QueryList<MdDrawer>;

  /** The drawer child with the `start` position. */
  get start() { return this._start; }

  /** The drawer child with the `end` position. */
  get end() { return this._end; }

  /** Event emitted when the drawer backdrop is clicked. */
  @Output() backdropClick = new EventEmitter<void>();

  /** The drawer at the start/end position, independent of direction. */
  private _start: MdDrawer | null;
  private _end: MdDrawer | null;

  /**
   * The drawer at the left/right. When direction changes, these will change as well.
   * They're used as aliases for the above to set the left/right style properly.
   * In LTR, _left == _start and _right == _end.
   * In RTL, _left == _end and _right == _start.
   */
  private _left: MdDrawer | null;
  private _right: MdDrawer | null;

  /** Subscription to the Directionality change EventEmitter. */
  private _dirChangeSubscription = Subscription.EMPTY;

  /** Inline styles to be applied to the container. */
  _styles: { marginLeft: string; marginRight: string; transform: string; };

  constructor(@Optional() private _dir: Directionality, private _element: ElementRef,
              private _renderer: Renderer2, private _ngZone: NgZone,
              private _changeDetectorRef: ChangeDetectorRef) {
    // If a `Dir` directive exists up the tree, listen direction changes and update the left/right
    // properties to point to the proper start/end.
    if (_dir != null) {
      this._dirChangeSubscription = _dir.change.subscribe(() => this._validateDrawers());
    }
  }

  ngAfterContentInit() {
    startWith.call(this._drawers.changes, null).subscribe(() => {
      this._validateDrawers();
      this._drawers.forEach((drawer: MdDrawer) => {
        this._watchDrawerToggle(drawer);
        this._watchDrawerPosition(drawer);
      });
    });
  }

  ngOnDestroy() {
    this._dirChangeSubscription.unsubscribe();
  }

  /** Calls `open` of both start and end drawers */
  open(): void {
    this._drawers.forEach(drawer => drawer.open());
  }

  /** Calls `close` of both start and end drawers */
  close(): void {
    this._drawers.forEach(drawer => drawer.close());
  }

  /**
   * Subscribes to drawer events in order to set a class on the main container element when the
   * drawer is open and the backdrop is visible. This ensures any overflow on the container element
   * is properly hidden.
   */
  private _watchDrawerToggle(drawer: MdDrawer): void {
    takeUntil.call(drawer._animationStarted, this._drawers.changes).subscribe(() => {
      // Set the transition class on the container so that the animations occur. This should not
      // be set initially because animations should only be triggered via a change in state.
      this._renderer.addClass(this._element.nativeElement, 'mat-drawer-transition');
      this._updateStyles();
      this._changeDetectorRef.markForCheck();
    });

    if (drawer.mode !== 'side') {
      takeUntil.call(merge(drawer.onOpen, drawer.onClose), this._drawers.changes).subscribe(() =>
          this._setContainerClass(drawer.opened));
    }
  }

  /**
   * Subscribes to drawer onPositionChanged event in order to re-validate drawers when the position
   * changes.
   */
  private _watchDrawerPosition(drawer: MdDrawer): void {
    if (!drawer) {
      return;
    }
    // NOTE: We need to wait for the microtask queue to be empty before validating,
    // since both drawers may be swapping positions at the same time.
    takeUntil.call(drawer.onPositionChanged, this._drawers.changes).subscribe(() => {
      first.call(this._ngZone.onMicrotaskEmpty.asObservable()).subscribe(() => {
        this._validateDrawers();
      });
    });
  }

  /** Toggles the 'mat-drawer-opened' class on the main 'md-drawer-container' element. */
  private _setContainerClass(isAdd: boolean): void {
    if (isAdd) {
      this._renderer.addClass(this._element.nativeElement, 'mat-drawer-opened');
    } else {
      this._renderer.removeClass(this._element.nativeElement, 'mat-drawer-opened');
    }
  }

  /** Validate the state of the drawer children components. */
  private _validateDrawers() {
    this._start = this._end = null;

    // Ensure that we have at most one start and one end drawer.
    this._drawers.forEach(drawer => {
      if (drawer.position == 'end') {
        if (this._end != null) {
          throwMdDuplicatedDrawerError('end');
        }
        this._end = drawer;
      } else {
        if (this._start != null) {
          throwMdDuplicatedDrawerError('start');
        }
        this._start = drawer;
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
    this._closeModalDrawer();
  }

  _closeModalDrawer() {
    // Close all open drawers where closing is not disabled and the mode is not `side`.
    [this._start, this._end]
      .filter(drawer => drawer && !drawer.disableClose && drawer.mode !== 'side')
      .forEach(drawer => drawer!.close());
  }

  _isShowingBackdrop(): boolean {
    return (this._isDrawerOpen(this._start) && this._start!.mode != 'side')
        || (this._isDrawerOpen(this._end) && this._end!.mode != 'side');
  }

  private _isDrawerOpen(drawer: MdDrawer | null): boolean {
    return drawer != null && drawer.opened;
  }

  /**
   * Return the width of the drawer, if it's in the proper mode and opened.
   * This may relayout the view, so do not call this often.
   * @param drawer
   * @param mode
   */
  private _getDrawerEffectiveWidth(drawer: MdDrawer, mode: string): number {
    return (this._isDrawerOpen(drawer) && drawer.mode == mode) ? drawer._width : 0;
  }

  /**
   * Recalculates and updates the inline styles. Note that this
   * should be used sparingly, because it causes a reflow.
   */
  private _updateStyles() {
    const marginLeft = this._left ? this._getDrawerEffectiveWidth(this._left, 'side') : 0;
    const marginRight = this._right ? this._getDrawerEffectiveWidth(this._right, 'side') : 0;
    const leftWidth = this._left ? this._getDrawerEffectiveWidth(this._left, 'push') : 0;
    const rightWidth = this._right ? this._getDrawerEffectiveWidth(this._right, 'push') : 0;

    this._styles = {
      marginLeft: `${marginLeft}px`,
      marginRight: `${marginRight}px`,
      transform: `translate3d(${leftWidth - rightWidth}px, 0, 0)`
    };
  }
}
