/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {animate, AnimationEvent, state, style, transition, trigger} from '@angular/animations';
import {FocusTrap, FocusTrapFactory} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ESCAPE} from '@angular/cdk/keycodes';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  Optional,
  Output,
  QueryList,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';
import {merge} from 'rxjs/observable/merge';
import {Subject} from 'rxjs/Subject';
import {RxChain, filter, first, startWith, takeUntil} from '@angular/cdk/rxjs';


/** Throws an exception when two MatDrawer are matching the same position. */
export function throwMatDuplicatedDrawerError(position: string) {
  throw Error(`A drawer was already declared for 'position="${position}"'`);
}


/**
 * Drawer toggle promise result.
 * @deprecated
 */
export class MatDrawerToggleResult {
  constructor(public type: 'open' | 'close', public animationFinished: boolean) {}
}


@Component({
  moduleId: module.id,
  selector: 'mat-drawer-content',
  template: '<ng-content></ng-content>',
  host: {
    'class': 'mat-drawer-content',
    '[style.marginLeft.px]': '_margins.left',
    '[style.marginRight.px]': '_margins.right',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class MatDrawerContent implements AfterContentInit {
  /**
   * Margins to be applied to the content. These are used to push / shrink the drawer content when a
   * drawer is open. We use margin rather than transform even for push mode because transform breaks
   * fixed position elements inside of the transformed element.
   */
  _margins: {left: number, right: number} = {left: 0, right: 0};

  constructor(
      private _changeDetectorRef: ChangeDetectorRef,
      @Inject(forwardRef(() => MatDrawerContainer)) private _container: MatDrawerContainer) {
  }

  ngAfterContentInit() {
    this._container._contentMargins.subscribe(margins => {
      this._margins = margins;
      this._changeDetectorRef.markForCheck();
    });
  }
}


/**
 * This component corresponds to a drawer that can be opened on the drawer container.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-drawer',
  exportAs: 'matDrawer',
  template: '<ng-content></ng-content>',
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
    '(@transform.start)': '_onAnimationStart($event)',
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
  preserveWhitespaces: false,
})
export class MatDrawer implements AfterContentInit, OnDestroy {
  private _focusTrap: FocusTrap;
  private _elementFocusedBeforeDrawerWasOpened: HTMLElement | null = null;

  /** Whether the drawer is initialized. Used for disabling the initial animation. */
  private _enableAnimations = false;

  /** The side that the drawer is attached to. */
  @Input()
  get position(): 'start' | 'end' { return this._position; }
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
  get align(): 'start' | 'end' { return this.position; }
  set align(value) { this.position = value; }

  /** Mode of the drawer; one of 'over', 'push' or 'side'. */
  @Input()
  get mode(): 'over' | 'push' | 'side' { return this._mode; }
  set mode(value) {
    this._mode = value;
    this._modeChanged.next();
  }
  private _mode: 'over' | 'push' | 'side' = 'over';

  /** Whether the drawer can be closed with the escape key or by clicking on the backdrop. */
  @Input()
  get disableClose(): boolean { return this._disableClose; }
  set disableClose(value: boolean) { this._disableClose = coerceBooleanProperty(value); }
  private _disableClose: boolean = false;

  /** Whether the drawer is opened. */
  private _opened: boolean = false;

  /** Emits whenever the drawer has started animating. */
  _animationStarted = new EventEmitter<AnimationEvent>();

  /** Whether the drawer is animating. Used to prevent overlapping animations. */
  _isAnimating = false;

  /** Current state of the sidenav animation. */
  _animationState: 'open-instant' | 'open' | 'void' = 'void';

  /**
   * Promise that resolves when the open/close animation completes. It is here for backwards
   * compatibility and should be removed next time we do drawer breaking changes.
   * @deprecated
   */
  private _currentTogglePromise: Promise<MatDrawerToggleResult> | null;

  /** Event emitted when the drawer is fully opened. */
  @Output('open') onOpen = new EventEmitter<MatDrawerToggleResult | void>();

  /** Event emitted when the drawer is fully closed. */
  @Output('close') onClose = new EventEmitter<MatDrawerToggleResult | void>();

  /** Event emitted when the drawer's position changes. */
  @Output('positionChanged') onPositionChanged = new EventEmitter<void>();

  /** @deprecated */
  @Output('align-changed') onAlignChanged = new EventEmitter<void>();

  /**
   * An observable that emits when the drawer mode changes. This is used by the drawer container to
   * to know when to when the mode changes so it can adapt the margins on the content.
   */
  _modeChanged = new Subject();

  get _isFocusTrapEnabled(): boolean {
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

      if (this._isFocusTrapEnabled && this._focusTrap) {
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
    this._focusTrap.enabled = this._isFocusTrapEnabled;
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
  open(): Promise<MatDrawerToggleResult> {
    return this.toggle(true);
  }

  /** Close the drawer. */
  close(): Promise<MatDrawerToggleResult> {
    return this.toggle(false);
  }

  /**
   * Toggle this drawer.
   * @param isOpen Whether the drawer should be open.
   */
  toggle(isOpen: boolean = !this.opened): Promise<MatDrawerToggleResult> {
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
        this._focusTrap.enabled = this._isFocusTrapEnabled;
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

  _onAnimationStart(event: AnimationEvent) {
    this._isAnimating = true;
    this._animationStarted.emit(event);
  }

  _onAnimationEnd(event: AnimationEvent) {
    const {fromState, toState} = event;

    if (toState.indexOf('open') === 0 && fromState === 'void') {
      this.onOpen.emit(new MatDrawerToggleResult('open', true));
    } else if (toState === 'void' && fromState.indexOf('open') === 0) {
      this.onClose.emit(new MatDrawerToggleResult('close', true));
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
 * <mat-drawer-container> component.
 *
 * This is the parent component to one or two <mat-drawer>s that validates the state internally
 * and coordinates the backdrop and content styling.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-drawer-container',
  exportAs: 'matDrawerContainer',
  templateUrl: 'drawer-container.html',
  styleUrls: ['drawer.css'],
  host: {
    'class': 'mat-drawer-container',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class MatDrawerContainer implements AfterContentInit, OnDestroy {
  @ContentChildren(MatDrawer) _drawers: QueryList<MatDrawer>;

  @ContentChild(MatDrawerContent) _content: MatDrawerContent;

  /** The drawer child with the `start` position. */
  get start(): MatDrawer | null { return this._start; }

  /** The drawer child with the `end` position. */
  get end(): MatDrawer | null { return this._end; }

  /** Event emitted when the drawer backdrop is clicked. */
  @Output() backdropClick = new EventEmitter<void>();

  /** The drawer at the start/end position, independent of direction. */
  private _start: MatDrawer | null;
  private _end: MatDrawer | null;

  /**
   * The drawer at the left/right. When direction changes, these will change as well.
   * They're used as aliases for the above to set the left/right style properly.
   * In LTR, _left == _start and _right == _end.
   * In RTL, _left == _end and _right == _start.
   */
  private _left: MatDrawer | null;
  private _right: MatDrawer | null;

  /** Emits when the component is destroyed. */
  private _destroyed = new Subject<void>();

  _contentMargins = new Subject<{left: number, right: number}>();

  constructor(@Optional() private _dir: Directionality, private _element: ElementRef,
              private _renderer: Renderer2, private _ngZone: NgZone,
              private _changeDetectorRef: ChangeDetectorRef) {
    // If a `Dir` directive exists up the tree, listen direction changes and update the left/right
    // properties to point to the proper start/end.
    if (_dir != null) {
      takeUntil.call(_dir.change, this._destroyed).subscribe(() => this._validateDrawers());
    }
  }

  ngAfterContentInit() {
    startWith.call(this._drawers.changes, null).subscribe(() => {
      this._validateDrawers();

      this._drawers.forEach((drawer: MatDrawer) => {
        this._watchDrawerToggle(drawer);
        this._watchDrawerPosition(drawer);
        this._watchDrawerMode(drawer);
      });

      if (!this._drawers.length ||
          this._isDrawerOpen(this._start) ||
          this._isDrawerOpen(this._end)) {
        this._updateContentMargins();
      }

      this._changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
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
  private _watchDrawerToggle(drawer: MatDrawer): void {
    RxChain.from(drawer._animationStarted)
      .call(takeUntil, this._drawers.changes)
      .call(filter, (event: AnimationEvent) => event.fromState !== event.toState)
      .subscribe((event: AnimationEvent) => {
        // Set the transition class on the container so that the animations occur. This should not
        // be set initially because animations should only be triggered via a change in state.
        if (event.toState !== 'open-instant') {
          this._renderer.addClass(this._element.nativeElement, 'mat-drawer-transition');
        }

        this._updateContentMargins();
        this._changeDetectorRef.markForCheck();
      });

    if (drawer.mode !== 'side') {
      takeUntil.call(merge(drawer.onOpen, drawer.onClose), this._drawers.changes).subscribe(() =>
          this._setContainerClass(drawer.opened));
    }
  }

  /**
   * Subscribes to drawer onPositionChanged event in order to
   * re-validate drawers when the position changes.
   */
  private _watchDrawerPosition(drawer: MatDrawer): void {
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

  /** Subscribes to changes in drawer mode so we can run change detection. */
  private _watchDrawerMode(drawer: MatDrawer): void {
    if (drawer) {
      takeUntil.call(drawer._modeChanged, merge(this._drawers.changes, this._destroyed))
        .subscribe(() => {
          this._updateContentMargins();
          this._changeDetectorRef.markForCheck();
        });
    }
  }

  /** Toggles the 'mat-drawer-opened' class on the main 'mat-drawer-container' element. */
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
          throwMatDuplicatedDrawerError('end');
        }
        this._end = drawer;
      } else {
        if (this._start != null) {
          throwMatDuplicatedDrawerError('start');
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

  private _isDrawerOpen(drawer: MatDrawer | null): boolean {
    return drawer != null && drawer.opened;
  }

  /**
   * Recalculates and updates the inline styles for the content. Note that this should be used
   * sparingly, because it causes a reflow.
   */
  private _updateContentMargins() {
    // 1. For drawers in `over` mode, they don't affect the content.
    // 2. For drawers in `side` mode they should shrink the content. We do this by adding to the
    //    left margin (for left drawer) or right margin (for right the drawer).
    // 3. For drawers in `push` mode the should shift the content without resizing it. We do this by
    //    adding to the left or right margin and simultaneously subtracting the same amount of
    //    margin from the other side.

    let left = 0;
    let right = 0;

    if (this._left && this._left.opened) {
      if (this._left.mode == 'side') {
        left += this._left._width;
      } else if (this._left.mode == 'push') {
        let width = this._left._width;
        left += width;
        right -= width;
      }
    }

    if (this._right && this._right.opened) {
      if (this._right.mode == 'side') {
        right += this._right._width;
      } else if (this._right.mode == 'push') {
        let width = this._right._width;
        right += width;
        left -= width;
      }
    }

    this._contentMargins.next({left, right});
  }
}
