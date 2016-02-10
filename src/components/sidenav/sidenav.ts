import {
  AfterContentInit,
  Component,
  ContentChildren,
  ElementRef,
  Host,
  HostBinding,
  HostListener,
  Input,
  Optional,
  Output,
  QueryList,
  Type,
  ChangeDetectionStrategy
} from 'angular2/core';
import {PromiseWrapper, ObservableWrapper, EventEmitter} from 'angular2/src/facade/async';
import {iterateListLike} from 'angular2/src/facade/collection';
import {BaseException} from 'angular2/src/facade/exceptions';
import {CONST_EXPR, isPresent} from 'angular2/src/facade/lang';
import {Dir} from '../../directives/dir/dir';
import {OneOf} from '../../core/annotations/one-of';


/**
 * Exception thrown when a MdSidenavLayout is missing both sidenavs.
 */
export class MdMissingSidenavException extends BaseException {}

/**
 * Exception thrown when two MdSidenav are matching the same side.
 */
export class MdDuplicatedSidenavException extends BaseException {
  constructor(align: string) {
    super(`A sidenav was already declared for 'align="${align}"'`);
  }
}


/**
 * <md-sidenav> component.
 *
 * This component corresponds to the drawer of the sidenav.
 *
 * Please refer to README.md for examples on how to use it.
 */
@Component({
  selector: 'md-sidenav',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdSidenav {
  /** Alignment of the sidenav (direction neutral); whether 'start' or 'end'. */
  @Input() @OneOf(['start', 'end']) align: string = 'start';

  /** Mode of the sidenav; whether 'over' or 'side'. */
  @Input() @OneOf(['over', 'push', 'side']) mode: string = 'over';

  /** Whether the sidenav is opened. */
  @Input('opened') private opened_: boolean;

  /** Event emitted when the sidenav is being opened. Use this to synchronize animations. */
  @Output('open-start') onOpenStart = new EventEmitter<Object>();

  /** Event emitted when the sidenav is fully opened. */
  @Output('open') onOpen = new EventEmitter<Object>();

  /** Event emitted when the sidenav is being closed. Use this to synchronize animations. */
  @Output('close-start') onCloseStart = new EventEmitter<Object>();

  /** Event emitted when the sidenav is fully closed. */
  @Output('close') onClose = new EventEmitter<Object>();


  /**
   * @param elementRef_ The DOM element reference. Used for transition and width calculation.
   *     If not available we do not hook on transitions.
   */
  constructor(private elementRef_: ElementRef) {}

  /**
   * Whether the sidenav is opened. We overload this because we trigger an event when it
   * starts or end.
   */
  get opened(): boolean { return this.opened_; }
  set opened(v: boolean) {
    this.toggle(v);
  }


  /** Open this sidenav, and return a Promise that will resolve when it's fully opened (or get
   * rejected if it didn't). */
  open(): Promise<void> {
    return this.toggle(true);
  }

  /**
   * Close this sidenav, and return a Promise that will resolve when it's fully closed (or get
   * rejected if it didn't).
   */
  close(): Promise<void> {
    return this.toggle(false);
  }

  /**
   * Toggle this sidenav. This is equivalent to calling open() when it's already opened, or
   * close() when it's closed.
   * @param isOpen
   */
  toggle(isOpen?: boolean): Promise<void> {
    if (!isPresent(isOpen)) {
      isOpen = !this.opened;
    }
    // Shortcut it if we're already opened.
    if (isOpen === this.opened) {
      if (!this.transition_) {
        return PromiseWrapper.resolve(null);
      } else {
        return isOpen ? this.openPromise_ : this.closePromise_;
      }
    }

    this.opened_ = isOpen;
    this.transition_ = true;

    if (isOpen) {
      this.onOpenStart.emit(null);
    } else {
      this.onCloseStart.emit(null);
    }

    if (isOpen) {
      if (this.openPromise_ == null) {
        let completer = PromiseWrapper.completer();
        this.openPromise_ = completer.promise;
        this.openPromiseReject_ = completer.reject;
        this.openPromiseResolve_ = completer.resolve;
      }
      return this.openPromise_;
    } else {
      if (this.closePromise_ == null) {
        let completer = PromiseWrapper.completer();
        this.closePromise_ = completer.promise;
        this.closePromiseReject_ = completer.reject;
        this.closePromiseResolve_ = completer.resolve;
      }
      return this.closePromise_;
    }
  }


  /**
   * When transition has finished, set the internal state for classes and emit the proper event.
   * The event passed is actually of type TransitionEvent, but that type is not available in
   * Android so we use any.
   * @param e The event.
   * @private
   */
  @HostListener('transitionend', ['$event']) private onTransitionEnd_(e: any) {
    if (e.target == this.elementRef_.nativeElement
        // Simpler version to check for prefixes.
        && e.propertyName.endsWith('transform')) {
      this.transition_ = false;
      if (this.opened_) {
        if (this.openPromise_ != null) {
          this.openPromiseResolve_();
        }
        if (this.closePromise_ != null) {
          this.closePromiseReject_();
        }

        this.onOpen.emit(null);
      } else {
        if (this.closePromise_ != null) {
          this.closePromiseResolve_();
        }
        if (this.openPromise_ != null) {
          this.openPromiseReject_();
        }

        this.onClose.emit(null);
      }

      this.openPromise_ = null;
      this.closePromise_ = null;
    }
  }

  @HostBinding('class.md-sidenav-closing') private get isClosing_() {
    return !this.opened_ && this.transition_;
  }
  @HostBinding('class.md-sidenav-opening') private get isOpening_() {
    return this.opened_ && this.transition_;
  }
  @HostBinding('class.md-sidenav-closed') private get isClosed_() {
    return !this.opened_ && !this.transition_;
  }
  @HostBinding('class.md-sidenav-opened') private get isOpened_() {
    return this.opened_ && !this.transition_;
  }
  @HostBinding('class.md-sidenav-end') private get isEnd_() {
    return this.align == 'end';
  }
  @HostBinding('class.md-sidenav-side') private get modeSide_() {
    return this.mode == 'side';
  }
  @HostBinding('class.md-sidenav-over') private get modeOver_() {
    return this.mode == 'over';
  }
  @HostBinding('class.md-sidenav-push') private get modePush_() {
    return this.mode == 'push';
  }

  /**
   * This is public because we need it from MdSidenavLayout, but it's undocumented and should
   * not be used outside.
   * @private
   */
  public get width_() {
    if (this.elementRef_.nativeElement) {
      return this.elementRef_.nativeElement.offsetWidth;
    }
    return 0;
  }

  private transition_: boolean = false;
  private openPromise_: Promise<void>;
  private openPromiseResolve_: () => void;
  private openPromiseReject_: () => void;
  private closePromise_: Promise<void>;
  private closePromiseResolve_: () => void;
  private closePromiseReject_: () => void;
}



/**
 * <md-sidenav-layout> component.
 *
 * This is the parent component to one or two <md-sidenav>s that validates the state internally
 * and coordinate the backdrop and content styling.
 */
@Component({
  selector: 'md-sidenav-layout',
  directives: [MdSidenav],
  templateUrl: './components/sidenav/sidenav.html',
  styleUrls: ['./components/sidenav/sidenav.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdSidenavLayout implements AfterContentInit {
  @ContentChildren(MdSidenav) private sidenavs_: QueryList<MdSidenav>;

  get start() { return this.start_; }
  get end() { return this.end_; }

  constructor(@Optional() @Host() private dir_: Dir) {
    // If a `Dir` directive exists up the tree, listen direction changes and update the left/right
    // properties to point to the proper start/end.
    if (dir_ != null) {
      dir_.dirChange.add(() => this.validateDrawers_());
    }
  }

  ngAfterContentInit() {
    // On changes, assert on consistency.
    ObservableWrapper.subscribe(this.sidenavs_.changes, () => this.validateDrawers_());
    this.validateDrawers_();
  }



  /** The sidenav at the start/end alignment, independent of direction. */
  private start_: MdSidenav;
  private end_: MdSidenav;
  /**
   * The sidenav at the left/right. When direction changes, these will change as well.
   * They're used as aliases for the above to set the left/right style properly.
   * In LTR, left_ == start_ and right_ == end_.
   * In RTL, left_ == end_ and right_ == start_.
   */
  private left_: MdSidenav;
  private right_: MdSidenav;

  /**
   * Validate the state of the sidenav children components.
   * @private
   */
  private validateDrawers_() {
    this.start_ = this.end_ = null;
    if (this.sidenavs_.length === 0) {
      throw new MdMissingSidenavException();
    }

    // Ensure that we have at most one start and one end sidenav.
    iterateListLike(this.sidenavs_, (sidenav: any) => {
      if (sidenav.align == 'end') {
        if (this.end_ != null) {
          throw new MdDuplicatedSidenavException('end');
        }
        this.end_ = sidenav;
      } else {
        if (this.start_ != null) {
          throw new MdDuplicatedSidenavException('start');
        }
        this.start_ = sidenav;
      }
    });

    this.right_ = this.left_ = null;

    // Detect if we're LTR or RTL.
    if (this.dir_ == null || this.dir_.value == 'ltr') {
      this.left_ = this.start_;
      this.right_ = this.end_;
    } else {
      this.left_ = this.end_;
      this.right_ = this.start_;
    }
  }

  private closeModalSidenav_() {
    if (this.start_ != null && this.start_.mode != 'side') {
      this.start_.close();
    }
    if (this.end_ != null && this.end_.mode != 'side') {
      this.end_.close();
    }
  }

  private isShowingBackdrop_() {
    return (this.start_ != null && this.start_.mode != 'side' && this.start_.opened)
        || (this.end_ != null && this.end_.mode != 'side' && this.end_.opened);
  }

  /**
   * Return the width of the sidenav, if it's in the proper mode and opened.
   * This may relayout the view, so do not call this often.
   * @param MdSidenav
   * @private
   */
  private getSidenavEffectiveWidth_(sidenav: MdSidenav, mode: string): number {
    if (sidenav != null && sidenav.mode == mode && sidenav.opened) {
      return sidenav.width_;
    }
    return 0;
  }

  private getMarginLeft_() {
    return this.getSidenavEffectiveWidth_(this.left_, 'side');
  }

  private getMarginRight_() {
    return this.getSidenavEffectiveWidth_(this.right_, 'side');
  }

  private getPositionLeft_() {
    return this.getSidenavEffectiveWidth_(this.left_, 'push');
  }

  private getPositionRight_() {
    return this.getSidenavEffectiveWidth_(this.right_, 'push');
  }
}


export const MD_SIDENAV_DIRECTIVES: Type[] = CONST_EXPR([MdSidenavLayout, MdSidenav]);
