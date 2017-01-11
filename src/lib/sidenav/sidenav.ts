import {
  NgModule,
  ModuleWithProviders,
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
  ViewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Dir, MdError, coerceBooleanProperty, DefaultStyleCompatibilityModeModule} from '../core';
import {A11yModule} from '../core/a11y/index';
import {FocusTrap} from '../core/a11y/focus-trap';
import {ESCAPE} from '../core/keyboard/keycodes';
import {OverlayModule} from '../core/overlay/overlay-directives';


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
    '(transitionend)': '_onTransitionEnd($event)',
    '(keydown)': 'handleKeydown($event)',
    // must prevent the browser from aligning text based on value
    '[attr.align]': 'null',
    '[class.md-sidenav-closed]': '_isClosed',
    '[class.md-sidenav-closing]': '_isClosing',
    '[class.md-sidenav-end]': '_isEnd',
    '[class.md-sidenav-opened]': '_isOpened',
    '[class.md-sidenav-opening]': '_isOpening',
    '[class.md-sidenav-over]': '_modeOver',
    '[class.md-sidenav-push]': '_modePush',
    '[class.md-sidenav-side]': '_modeSide',
    '[class.md-sidenav-invalid]': '!valid',
    'tabIndex': '-1'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MdSidenav implements AfterContentInit {
  @ViewChild(FocusTrap) _focusTrap: FocusTrap;

  /** Alignment of the sidenav (direction neutral); whether 'start' or 'end'. */
  private _align: 'start' | 'end' = 'start';

  /** Whether this md-sidenav is part of a valid md-sidenav-container configuration. */
  get valid() { return this._valid; }
  set valid(value) {
    value = coerceBooleanProperty(value);
    // When the drawers are not in a valid configuration we close them all until they are in a valid
    // configuration again.
    if (!value) {
      this.close();
    }
    this._valid = value;
  }
  private _valid = true;

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

  get isFocusTrapDisabled() {
    // The focus trap is only enabled when the sidenav is open in any mode other than side.
    return !this.opened || this.mode == 'side';
  }

  /**
   * @param _elementRef The DOM element reference. Used for transition and width calculation.
   *     If not available we do not hook on transitions.
   */
  constructor(private _elementRef: ElementRef, private _renderer: Renderer) {
    this.onOpen.subscribe(() => {
      this._elementFocusedBeforeSidenavWasOpened = document.activeElement as HTMLElement;

      if (!this.isFocusTrapDisabled) {
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
    // This can happen when the sidenav is set to opened in the template and the transition
    // isn't ended.
    if (this._toggleAnimationPromise) {
      this._resolveToggleAnimationPromise(true);
      this._toggleAnimationPromise = this._resolveToggleAnimationPromise = null;
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
    if (!this.valid) {
      return Promise.resolve(new MdSidenavToggleResult(isOpen ? 'open' : 'close', true));
    }

    // Shortcut it if we're already opened.
    if (isOpen === this.opened) {
      return this._toggleAnimationPromise ||
          Promise.resolve(new MdSidenavToggleResult(isOpen ? 'open' : 'close', true));
    }

    this._opened = isOpen;

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
    if (event.keyCode === ESCAPE) {
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
  selector: 'md-sidenav-container, mat-sidenav-container, md-sidenav-layout, mat-sidenav-layout',
  // Do not use ChangeDetectionStrategy.OnPush. It does not work for this component because
  // technically it is a sibling of MdSidenav (on the content tree) and isn't updated when MdSidenav
  // changes its state.
  templateUrl: 'sidenav-container.html',
  styleUrls: [
    'sidenav.css',
    'sidenav-transitions.css',
  ],
  host: {
    'class': 'md-sidenav-container',
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
  @Output('backdrop-clicked') onBackdropClicked = new EventEmitter<void>();

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

  constructor(@Optional() private _dir: Dir, private _element: ElementRef,
              private _renderer: Renderer) {
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
    if (!sidenav) { return; }
    sidenav.onAlignChanged.subscribe(() => this._validateDrawers());
  }

  /** Toggles the 'md-sidenav-opened' class on the main 'md-sidenav-container' element. */
  private _setContainerClass(sidenav: MdSidenav, bool: boolean): void {
    this._renderer.setElementClass(this._element.nativeElement, 'md-sidenav-opened', bool);
  }

  /** Sets the valid state of the drawers. */
  private _setDrawersValid(valid: boolean) {
    this._sidenavs.forEach((sidenav) => {
      sidenav.valid = valid;
    });
    if (!valid) {
      this._start = this._end = this._left = this._right = null;
    }
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
          this._setDrawersValid(false);
          return;
        }
        this._end = sidenav;
      } else {
        if (this._start != null) {
          this._setDrawersValid(false);
          return;
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

    this._setDrawersValid(true);
  }

  _onBackdropClicked() {
    this.onBackdropClicked.emit();
    this._closeModalSidenav();
  }

  _closeModalSidenav() {
    if (this._start != null && this._start.mode != 'side') {
      this._start.close();
    }
    if (this._end != null && this._end.mode != 'side') {
      this._end.close();
    }
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


@NgModule({
  imports: [CommonModule, DefaultStyleCompatibilityModeModule, A11yModule, OverlayModule],
  exports: [MdSidenavContainer, MdSidenav, DefaultStyleCompatibilityModeModule],
  declarations: [MdSidenavContainer, MdSidenav],
})
export class MdSidenavModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdSidenavModule,
      providers: []
    };
  }
}
