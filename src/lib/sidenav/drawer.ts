/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationEvent} from '@angular/animations';
import {FocusTrap, FocusTrapFactory, FocusMonitor, FocusOrigin} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ESCAPE} from '@angular/cdk/keycodes';
import {Platform} from '@angular/cdk/platform';
import {
  AfterContentChecked,
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
  ViewEncapsulation,
  InjectionToken,
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {merge} from 'rxjs/observable/merge';
import {filter} from 'rxjs/operators/filter';
import {take} from 'rxjs/operators/take';
import {startWith} from 'rxjs/operators/startWith';
import {takeUntil} from 'rxjs/operators/takeUntil';
import {debounceTime} from 'rxjs/operators/debounceTime';
import {map} from 'rxjs/operators/map';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {matDrawerAnimations} from './drawer-animations';


/** Throws an exception when two MatDrawer are matching the same position. */
export function throwMatDuplicatedDrawerError(position: string) {
  throw Error(`A drawer was already declared for 'position="${position}"'`);
}


/**
 * Drawer toggle promise result.
 * @deprecated
 */
export class MatDrawerToggleResult {
  constructor(
    /** Whether the drawer is opened or closed. */
    public type: 'open' | 'close',
    /** Whether the drawer animation is finished. */
    public animationFinished: boolean) {}
}

/** Configures whether drawers should use auto sizing by default. */
export const MAT_DRAWER_DEFAULT_AUTOSIZE =
    new InjectionToken<boolean>('MAT_DRAWER_DEFAULT_AUTOSIZE');

@Component({
  moduleId: module.id,
  selector: 'mat-drawer-content',
  template: '<ng-content></ng-content>',
  host: {
    'class': 'mat-drawer-content',
    '[style.margin-left.px]': '_margins.left',
    '[style.margin-right.px]': '_margins.right',
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
  _margins: {left: number|null, right: number|null} = {left: null, right: null};

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
  animations: [matDrawerAnimations.transformDrawer],
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
export class MatDrawer implements AfterContentInit, AfterContentChecked, OnDestroy {
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

  /** How the sidenav was opened (keypress, mouse click etc.) */
  private _openedVia: FocusOrigin | null;

  /** Emits whenever the drawer has started animating. */
  _animationStarted = new EventEmitter<AnimationEvent>();

  /** Current state of the sidenav animation. */
  _animationState: 'open-instant' | 'open' | 'void' = 'void';

  /** Event emitted when the drawer open state is changed. */
  @Output() openedChange: EventEmitter<boolean> =
      // Note this has to be async in order to avoid some issues with two-bindings (see #8872).
      new EventEmitter<boolean>(/* isAsync */true);

  /** Event emitted when the drawer has been opened. */
  @Output('opened')
  get _openedStream(): Observable<void> {
    return this.openedChange.pipe(filter(o => o), map(() => {}));
  }

  /** Event emitted when the drawer has started opening. */
  @Output()
  get openedStart(): Observable<void> {
    return this._animationStarted.pipe(
      filter(e => e.fromState !== e.toState && e.toState.indexOf('open') === 0),
      map(() => {})
    );
  }

  /** Event emitted when the drawer has been closed. */
  @Output('closed')
  get _closedStream(): Observable<void> {
    return this.openedChange.pipe(filter(o => !o), map(() => {}));
  }

  /** Event emitted when the drawer has started closing. */
  @Output()
  get closedStart(): Observable<void> {
    return this._animationStarted.pipe(
      filter(e => e.fromState !== e.toState && e.toState === 'void'),
      map(() => {})
    );
  }

  /**
   * Event emitted when the drawer is fully opened.
   * @deprecated Use `opened` instead.
   */
  @Output('open') onOpen = this._openedStream;

  /**
   * Event emitted when the drawer is fully closed.
   * @deprecated Use `closed` instead.
   */
  @Output('close') onClose = this._closedStream;

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
              private _focusMonitor: FocusMonitor,
              private _platform: Platform,
              @Optional() @Inject(DOCUMENT) private _doc: any) {

    this.openedChange.subscribe((opened: boolean) => {
      if (opened) {
        if (this._doc) {
          this._elementFocusedBeforeDrawerWasOpened = this._doc.activeElement as HTMLElement;
        }

        if (this._isFocusTrapEnabled && this._focusTrap) {
          this._trapFocus();
        }
      } else {
        this._restoreFocus();
      }
    });
  }

  /** Traps focus inside the drawer. */
  private _trapFocus() {
    this._focusTrap.focusInitialElementWhenReady().then(hasMovedFocus => {
      // If there were no focusable elements, focus the sidenav itself so the keyboard navigation
      // still works. We need to check that `focus` is a function due to Universal.
      if (!hasMovedFocus && typeof this._elementRef.nativeElement.focus === 'function') {
        this._elementRef.nativeElement.focus();
      }
    });
  }

  /**
   * If focus is currently inside the drawer, restores it to where it was before the drawer
   * opened.
   */
  private _restoreFocus() {
    const activeEl = this._doc && this._doc.activeElement;

    if (activeEl && this._elementRef.nativeElement.contains(activeEl)) {
      if (this._elementFocusedBeforeDrawerWasOpened instanceof HTMLElement) {
        this._focusMonitor.focusVia(this._elementFocusedBeforeDrawerWasOpened, this._openedVia);
      } else {
        this._elementRef.nativeElement.blur();
      }
    }

    this._elementFocusedBeforeDrawerWasOpened = null;
    this._openedVia = null;
  }

  ngAfterContentInit() {
    this._focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement);
    this._focusTrap.enabled = this._isFocusTrapEnabled;
  }

  ngAfterContentChecked() {
    // Enable the animations after the lifecycle hooks have run, in order to avoid animating
    // drawers that are open by default. When we're on the server, we shouldn't enable the
    // animations, because we don't want the drawer to animate the first time the user sees
    // the page.
    if (this._platform.isBrowser) {
      this._enableAnimations = true;
    }
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

  /**
   * Open the drawer.
   * @param openedVia Whether the drawer was opened by a key press, mouse click or programmatically.
   * Used for focus management after the sidenav is closed.
   */
  open(openedVia?: FocusOrigin): Promise<void> {
    return this.toggle(true, openedVia);
  }

  /** Close the drawer. */
  close(): Promise<void> {
    return this.toggle(false);
  }

  /**
   * Toggle this drawer.
   * @param isOpen Whether the drawer should be open.
   * @param openedVia Whether the drawer was opened by a key press, mouse click or programmatically.
   * Used for focus management after the sidenav is closed.
   */
  toggle(isOpen: boolean = !this.opened, openedVia: FocusOrigin = 'program'):
    Promise<void> {

    this._opened = isOpen;

    if (isOpen) {
      this._animationState = this._enableAnimations ? 'open' : 'open-instant';
      this._openedVia = openedVia;
    } else {
      this._animationState = 'void';
      this._restoreFocus();
    }

    if (this._focusTrap) {
      this._focusTrap.enabled = this._isFocusTrapEnabled;
    }

    // TODO(crisbeto): This promise is here for backwards-compatibility.
    // It should be removed next time we do breaking changes in the drawer.
    return new Promise<any>(resolve => {
      this.openedChange.pipe(take(1)).subscribe(open => {
        resolve(new MatDrawerToggleResult(open ? 'open' : 'close', true));
      });
    });
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
    this._animationStarted.emit(event);
  }

  _onAnimationEnd(event: AnimationEvent) {
    const {fromState, toState} = event;

    if ((toState.indexOf('open') === 0 && fromState === 'void') ||
        (toState === 'void' && fromState.indexOf('open') === 0)) {
      this.openedChange.emit(this._opened);
    }
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

  /**
   * Whether to automatically resize the container whenever
   * the size of any of its drawers changes.
   *
   * **Use at your own risk!** Enabling this option can cause layout thrashing by measuring
   * the drawers on every change detection cycle. Can be configured globally via the
   * `MAT_DRAWER_DEFAULT_AUTOSIZE` token.
   */
  @Input()
  get autosize(): boolean { return this._autosize; }
  set autosize(value: boolean) { this._autosize = coerceBooleanProperty(value); }
  private _autosize: boolean;

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

  /** Emits on every ngDoCheck. Used for debouncing reflows. */
  private _doCheckSubject = new Subject<void>();

  _contentMargins = new Subject<{left: number|null, right: number|null}>();

  constructor(@Optional() private _dir: Directionality,
              private _element: ElementRef,
              private _ngZone: NgZone,
              private _changeDetectorRef: ChangeDetectorRef,
              @Inject(MAT_DRAWER_DEFAULT_AUTOSIZE) defaultAutosize = false) {

    // If a `Dir` directive exists up the tree, listen direction changes
    // and update the left/right properties to point to the proper start/end.
    if (_dir) {
      _dir.change.pipe(takeUntil(this._destroyed)).subscribe(() => {
        this._validateDrawers();
        this._updateContentMargins();
      });
    }

    this._autosize = defaultAutosize;
  }

  ngAfterContentInit() {
    this._drawers.changes.pipe(startWith(null)).subscribe(() => {
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

    this._doCheckSubject.pipe(
      debounceTime(10), // Arbitrary debounce time, less than a frame at 60fps
      takeUntil(this._destroyed)
    ).subscribe(() => this._updateContentMargins());
  }

  ngOnDestroy() {
    this._doCheckSubject.complete();
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

  ngDoCheck() {
    // If users opted into autosizing, do a check every change detection cycle.
    if (this._autosize && this._isPushed()) {
      // Run outside the NgZone, otherwise the debouncer will throw us into an infinite loop.
      this._ngZone.runOutsideAngular(() => this._doCheckSubject.next());
    }
  }

  /**
   * Subscribes to drawer events in order to set a class on the main container element when the
   * drawer is open and the backdrop is visible. This ensures any overflow on the container element
   * is properly hidden.
   */
  private _watchDrawerToggle(drawer: MatDrawer): void {
    drawer._animationStarted.pipe(
      takeUntil(this._drawers.changes),
      filter((event: AnimationEvent) => event.fromState !== event.toState)
    )
    .subscribe((event: AnimationEvent) => {
      // Set the transition class on the container so that the animations occur. This should not
      // be set initially because animations should only be triggered via a change in state.
      if (event.toState !== 'open-instant') {
        this._element.nativeElement.classList.add('mat-drawer-transition');
      }

      this._updateContentMargins();
      this._changeDetectorRef.markForCheck();
    });

    if (drawer.mode !== 'side') {
      drawer.openedChange.pipe(takeUntil(this._drawers.changes)).subscribe(() =>
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
    drawer.onPositionChanged.pipe(takeUntil(this._drawers.changes)).subscribe(() => {
      this._ngZone.onMicrotaskEmpty.asObservable().pipe(take(1)).subscribe(() => {
        this._validateDrawers();
      });
    });
  }

  /** Subscribes to changes in drawer mode so we can run change detection. */
  private _watchDrawerMode(drawer: MatDrawer): void {
    if (drawer) {
      drawer._modeChanged.pipe(takeUntil(merge(this._drawers.changes, this._destroyed)))
        .subscribe(() => {
          this._updateContentMargins();
          this._changeDetectorRef.markForCheck();
        });
    }
  }

  /** Toggles the 'mat-drawer-opened' class on the main 'mat-drawer-container' element. */
  private _setContainerClass(isAdd: boolean): void {
    if (isAdd) {
      this._element.nativeElement.classList.add('mat-drawer-opened');
    } else {
      this._element.nativeElement.classList.remove('mat-drawer-opened');
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
    if (!this._dir || this._dir.value == 'ltr') {
      this._left = this._start;
      this._right = this._end;
    } else {
      this._left = this._end;
      this._right = this._start;
    }
  }

  /** Whether the container is being pushed to the side by one of the drawers. */
  private _isPushed() {
    return (this._isDrawerOpen(this._start) && this._start!.mode != 'over') ||
           (this._isDrawerOpen(this._end) && this._end!.mode != 'over');
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

    // Pull back into the NgZone since in some cases we could be outside.
    this._ngZone.run(() => this._contentMargins.next({left, right}));
  }
}
