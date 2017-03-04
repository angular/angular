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
  Renderer,
  ViewEncapsulation,
  NgZone,
  OnDestroy,
} from '@angular/core';
import {Dir, MdError, coerceBooleanProperty} from '../core';
import {FocusTrapFactory, FocusTrap} from '../core/a11y/focus-trap';
import {ESCAPE} from '../core/keyboard/keycodes';
import 'rxjs/add/operator/first';


/** Exception thrown when two MdSidenav are matching the same side. */
export class MdDuplicatedSidenavError extends MdError {
  constructor(align: string) {
    super(`A sidenav was already declared for 'align="${align}"'`);
  }
}


/** Sidenav toggle promise result. */
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
  // TODO(mmalerba): move template to separate file.
  templateUrl: 'sidenav.html',
  host: {
    '[class.mat-sidenav]': 'true',
    '(transitionend)': '_onTransitionEnd($event)',
    '(keydown)': 'handleKeydown($event)',
    // must prevent the browser from aligning text based on value
    '[attr.align]': 'null',
    '[class.mat-sidenav-closed]': '_isClosed',
    '[class.mat-sidenav-closing]': '_isClosing',
    '[class.mat-sidenav-end]': '_isEnd',
    '[class.mat-sidenav-opened]': '_isOpened',
    '[class.mat-sidenav-opening]': '_isOpening',
    '[class.mat-sidenav-over]': '_modeOver',
    '[class.mat-sidenav-push]': '_modePush',
    '[class.mat-sidenav-side]': '_modeSide',
    'tabIndex': '-1'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MdSidenav implements AfterContentInit, OnDestroy {
  private _focusTrap: FocusTrap;

  /** Alignment of the sidenav (direction neutral); whether 'start' or 'end'. */
  private _align: 'start' | 'end' = 'start';

  /** Direction which the sidenav is aligned in. */
  @Input()
  get align() { return this._align; }
  set align(value) {
    // Make sure we have a valid value.
    value = (value == 'end') ? 'end' : 'start';
    if (value != this._align) {
      this._align = value;
      this.onAlignChanged.emit();
    }
  }

  /** Mode of the sidenav; whether 'over' or 'side'. */
  @Input() mode: 'over' | 'push' | 'side' = 'over';

  /** Whether the sidenav can be closed with the escape key or not. */
  @Input()
  get disableClose(): boolean { return this._disableClose; }
  set disableClose(value: boolean) { this._disableClose = coerceBooleanProperty(value); }
  private _disableClose: boolean = false;

  /** Whether the sidenav is opened. */
  _opened: boolean = false;

  /** Event emitted when the sidenav is being opened. Use this to synchronize animations. */
  @Output('open-start') onOpenStart = new EventEmitter<void>();

  /** Event emitted when the sidenav is fully opened. */
  @Output('open') onOpen = new EventEmitter<void>();

  /** Event emitted when the sidenav is being closed. Use this to synchronize animations. */
  @Output('close-start') onCloseStart = new EventEmitter<void>();

  /** Event emitted when the sidenav is fully closed. */
  @Output('close') onClose = new EventEmitter<void>();

  /** Event emitted when the sidenav alignment changes. */
  @Output('align-changed') onAlignChanged = new EventEmitter<void>();

  /** The current toggle animation promise. `null` if no animation is in progress. */
  private _toggleAnimationPromise: Promise<MdSidenavToggleResult> = null;

  /**
   * The current toggle animation promise resolution function.
   * `null` if no animation is in progress.
   */
  private _resolveToggleAnimationPromise: (animationFinished: boolean) => void = null;

  get isFocusTrapEnabled() {
    // The focus trap is only enabled when the sidenav is open in any mode other than side.
    return this.opened && this.mode !== 'side';
  }

  /**
   * @param _elementRef The DOM element reference. Used for transition and width calculation.
   *     If not available we do not hook on transitions.
   */
  constructor(
    private _elementRef: ElementRef,
    private _renderer: Renderer,
    private _focusTrapFactory: FocusTrapFactory) {

    this.onOpen.subscribe(() => {
      this._elementFocusedBeforeSidenavWasOpened = document.activeElement as HTMLElement;

      if (this.isFocusTrapEnabled && this._focusTrap) {
        this._focusTrap.focusFirstTabbableElementWhenReady();
      }
    });

    this.onClose.subscribe(() => {
      if (this._elementFocusedBeforeSidenavWasOpened instanceof HTMLElement) {
        this._renderer.invokeElementMethod(this._elementFocusedBeforeSidenavWasOpened, 'focus');
      } else {
        this._renderer.invokeElementMethod(this._elementRef.nativeElement, 'blur');
      }

      this._elementFocusedBeforeSidenavWasOpened = null;
    });
  }

  ngAfterContentInit() {
    this._focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement);
    this._focusTrap.enabled = this.isFocusTrapEnabled;

    // This can happen when the sidenav is set to opened in
    // the template and the transition hasn't ended.
    if (this._toggleAnimationPromise) {
      this._resolveToggleAnimationPromise(true);
      this._toggleAnimationPromise = this._resolveToggleAnimationPromise = null;
    }
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


  /** Open this sidenav, and return a Promise that will resolve when it's fully opened (or get
   * rejected if it didn't). */
  open(): Promise<MdSidenavToggleResult> {
    return this.toggle(true);
  }

  /**
   * Close this sidenav, and return a Promise that will resolve when it's fully closed (or get
   * rejected if it didn't).
   */
  close(): Promise<MdSidenavToggleResult> {
    return this.toggle(false);
  }

  /**
   * Toggle this sidenav. This is equivalent to calling open() when it's already opened, or
   * close() when it's closed.
   * @param isOpen Whether the sidenav should be open.
   * @returns Resolves with the result of whether the sidenav was opened or closed.
   */
  toggle(isOpen: boolean = !this.opened): Promise<MdSidenavToggleResult> {
    // Shortcut it if we're already opened.
    if (isOpen === this.opened) {
      return this._toggleAnimationPromise ||
          Promise.resolve(new MdSidenavToggleResult(isOpen ? 'open' : 'close', true));
    }

    this._opened = isOpen;

    if (this._focusTrap) {
      this._focusTrap.enabled = this.isFocusTrapEnabled;
    }

    if (isOpen) {
      this.onOpenStart.emit();
    } else {
      this.onCloseStart.emit();
    }

    if (this._toggleAnimationPromise) {
      this._resolveToggleAnimationPromise(false);
    }
    this._toggleAnimationPromise = new Promise<MdSidenavToggleResult>(resolve => {
      this._resolveToggleAnimationPromise = animationFinished =>
          resolve(new MdSidenavToggleResult(isOpen ? 'open' : 'close', animationFinished));
    });
    return this._toggleAnimationPromise;
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
   * When transition has finished, set the internal state for classes and emit the proper event.
   * The event passed is actually of type TransitionEvent, but that type is not available in
   * Android so we use any.
   */
  _onTransitionEnd(transitionEvent: TransitionEvent) {
    if (transitionEvent.target == this._elementRef.nativeElement
        // Simpler version to check for prefixes.
        && transitionEvent.propertyName.endsWith('transform')) {
      if (this._opened) {
        this.onOpen.emit();
      } else {
        this.onClose.emit();
      }

      if (this._toggleAnimationPromise) {
        this._resolveToggleAnimationPromise(true);
        this._toggleAnimationPromise = this._resolveToggleAnimationPromise = null;
      }
    }
  }

  get _isClosing() {
    return !this._opened && !!this._toggleAnimationPromise;
  }
  get _isOpening() {
    return this._opened && !!this._toggleAnimationPromise;
  }
  get _isClosed() {
    return !this._opened && !this._toggleAnimationPromise;
  }
  get _isOpened() {
    return this._opened && !this._toggleAnimationPromise;
  }
  get _isEnd() {
    return this.align == 'end';
  }
  get _modeSide() {
    return this.mode == 'side';
  }
  get _modeOver() {
    return this.mode == 'over';
  }
  get _modePush() {
    return this.mode == 'push';
  }

  get _width() {
    if (this._elementRef.nativeElement) {
      return this._elementRef.nativeElement.offsetWidth;
    }
    return 0;
  }

  private _elementFocusedBeforeSidenavWasOpened: HTMLElement = null;
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
  // Do not use ChangeDetectionStrategy.OnPush. It does not work for this component because
  // technically it is a sibling of MdSidenav (on the content tree) and isn't updated when MdSidenav
  // changes its state.
  templateUrl: 'sidenav-container.html',
  styleUrls: [
    'sidenav.css',
    'sidenav-transitions.css',
  ],
  host: {
    '[class.mat-sidenav-container]': 'true',
    '[class.mat-sidenav-transition]': '_enableTransitions',
  },
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
  private _start: MdSidenav;
  private _end: MdSidenav;

  /**
   * The sidenav at the left/right. When direction changes, these will change as well.
   * They're used as aliases for the above to set the left/right style properly.
   * In LTR, _left == _start and _right == _end.
   * In RTL, _left == _end and _right == _start.
   */
  private _left: MdSidenav;
  private _right: MdSidenav;

  /** Whether to enable open/close trantions. */
  _enableTransitions = false;

  constructor(@Optional() private _dir: Dir, private _element: ElementRef,
              private _renderer: Renderer, private _ngZone: NgZone) {
    // If a `Dir` directive exists up the tree, listen direction changes and update the left/right
    // properties to point to the proper start/end.
    if (_dir != null) {
      _dir.dirChange.subscribe(() => this._validateDrawers());
    }
  }

  ngAfterContentInit() {
    // On changes, assert on consistency.
    this._sidenavs.changes.subscribe(() => this._validateDrawers());
    this._sidenavs.forEach((sidenav: MdSidenav) => {
      this._watchSidenavToggle(sidenav);
      this._watchSidenavAlign(sidenav);
    });
    this._validateDrawers();

    // Give the view a chance to render the initial state, then enable transitions.
    this._ngZone.onMicrotaskEmpty.first().subscribe(() => this._enableTransitions = true);
  }

  /**
   * Subscribes to sidenav events in order to set a class on the main container element when the
   * sidenav is open and the backdrop is visible. This ensures any overflow on the container element
   * is properly hidden.
   */
  private _watchSidenavToggle(sidenav: MdSidenav): void {
    if (!sidenav || sidenav.mode === 'side') { return; }
    sidenav.onOpen.subscribe(() => this._setContainerClass(sidenav, true));
    sidenav.onClose.subscribe(() => this._setContainerClass(sidenav, false));
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
    sidenav.onAlignChanged.subscribe(() =>
        this._ngZone.onMicrotaskEmpty.first().subscribe(() => this._validateDrawers()));
  }

  /** Toggles the 'mat-sidenav-opened' class on the main 'md-sidenav-container' element. */
  private _setContainerClass(sidenav: MdSidenav, bool: boolean): void {
    this._renderer.setElementClass(this._element.nativeElement, 'mat-sidenav-opened', bool);
  }

  /** Validate the state of the sidenav children components. */
  private _validateDrawers() {
    this._start = this._end = null;

    // Ensure that we have at most one start and one end sidenav.
    // NOTE: We must call toArray on _sidenavs even though it's iterable
    // (see https://github.com/Microsoft/TypeScript/issues/3164).
    for (let sidenav of this._sidenavs.toArray()) {
      if (sidenav.align == 'end') {
        if (this._end != null) {
          throw new MdDuplicatedSidenavError('end');
        }
        this._end = sidenav;
      } else {
        if (this._start != null) {
          throw new MdDuplicatedSidenavError('start');
        }
        this._start = sidenav;
      }
    }

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
      .forEach(sidenav => sidenav.close());
  }

  _isShowingBackdrop(): boolean {
    return (this._isSidenavOpen(this._start) && this._start.mode != 'side')
        || (this._isSidenavOpen(this._end) && this._end.mode != 'side');
  }

  private _isSidenavOpen(side: MdSidenav): boolean {
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

  _getMarginLeft() {
    return this._getSidenavEffectiveWidth(this._left, 'side');
  }

  _getMarginRight() {
    return this._getSidenavEffectiveWidth(this._right, 'side');
  }

  _getPositionLeft() {
    return this._getSidenavEffectiveWidth(this._left, 'push');
  }

  _getPositionRight() {
    return this._getSidenavEffectiveWidth(this._right, 'push');
  }

  /**
   * Returns the horizontal offset for the content area.  There should never be a value for both
   * left and right, so by subtracting the right value from the left value, we should always get
   * the appropriate offset.
   */
  _getPositionOffset() {
    return this._getPositionLeft() - this._getPositionRight();
  }

  /**
   * This is using [ngStyle] rather than separate [style...] properties because [style.transform]
   * doesn't seem to work right now.
   */
  _getStyles() {
    return {
      marginLeft: `${this._getMarginLeft()}px`,
      marginRight: `${this._getMarginRight()}px`,
      transform: `translate3d(${this._getPositionOffset()}px, 0, 0)`
    };
  }
}
