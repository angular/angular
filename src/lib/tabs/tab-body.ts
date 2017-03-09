import {
  ViewChild,
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  trigger,
  state,
  style,
  animate,
  transition,
  AnimationTransitionEvent,
  ElementRef,
  Optional,
  ChangeDetectorRef,
  AfterViewChecked,
  AfterContentChecked,
} from '@angular/core';
import {TemplatePortal, PortalHostDirective, Dir, LayoutDirection} from '../core';
import 'rxjs/add/operator/map';

/**
 * These position states are used internally as animation states for the tab body. Setting the
 * position state to left, right, or center will transition the tab body from its current
 * position to its respective state. If there is not current position (void, in the case of a new
 * tab body), then there will be no transition animation to its state.
 *
 * In the case of a new tab body that should immediately be centered with an animating transition,
 * then left-origin-center or right-origin-center can be used, which will use left or right as its
 * psuedo-prior state.
 */
export type MdTabBodyPositionState =
    'left' | 'center' | 'right' | 'left-origin-center' | 'right-origin-center';

/**
 * The origin state is an internally used state that is set on a new tab body indicating if it
 * began to the left or right of the prior selected index. For example, if the selected index was
 * set to 1, and a new tab is created and selected at index 2, then the tab body would have an
 * origin of right because its index was greater than the prior selected index.
 */
export type MdTabBodyOriginState = 'left' | 'right';

/**
 * Wrapper for the contents of a tab.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'md-tab-body, mat-tab-body',
  templateUrl: 'tab-body.html',
  styleUrls: ['tab-body.css'],
  host: {
    '[class.mat-tab-body]': 'true',
  },
  animations: [
    trigger('translateTab', [
      state('left', style({transform: 'translate3d(-100%, 0, 0)'})),
      state('left-origin-center', style({transform: 'translate3d(0, 0, 0)'})),
      state('right-origin-center', style({transform: 'translate3d(0, 0, 0)'})),
      state('center', style({transform: 'translate3d(0, 0, 0)'})),
      state('right', style({transform: 'translate3d(100%, 0, 0)'})),
      transition('* => left, * => right, left => center, right => center',
          animate('500ms cubic-bezier(0.35, 0, 0.25, 1)')),
      transition('void => left-origin-center', [
        style({transform: 'translate3d(-100%, 0, 0)'}),
        animate('500ms cubic-bezier(0.35, 0, 0.25, 1)')
      ]),
      transition('void => right-origin-center', [
        style({transform: 'translate3d(100%, 0, 0)'}),
        animate('500ms cubic-bezier(0.35, 0, 0.25, 1)')
      ])
    ])
  ]
})
export class MdTabBody implements OnInit, AfterViewChecked, AfterContentChecked {
  /** The portal host inside of this container into which the tab body content will be loaded. */
  @ViewChild(PortalHostDirective) _portalHost: PortalHostDirective;

  /** Event emitted when the tab begins to animate towards the center as the active tab. */
  @Output()
  onCentering: EventEmitter<number> = new EventEmitter<number>();

  /** Event emitted when the tab completes its animation towards the center. */
  @Output()
  onCentered: EventEmitter<void> = new EventEmitter<void>(true);

  /** The tab body content to display. */
  @Input('content') _content: TemplatePortal;

  /** The shifted index position of the tab body, where zero represents the active center tab. */
  _position: MdTabBodyPositionState;
  @Input('position') set position(position: number) {
    if (position < 0) {
      this._position = this._getLayoutDirection() == 'ltr' ? 'left' : 'right';
    } else if (position > 0) {
      this._position = this._getLayoutDirection() == 'ltr' ? 'right' : 'left';
    } else {
      this._position = 'center';
    }
  }

  /** Whether the element is allowed to be animated. */
  _canBeAnimated: boolean = false;

  /** The origin position from which this tab should appear when it is centered into view. */
  _origin: MdTabBodyOriginState;

  /** The origin position from which this tab should appear when it is centered into view. */
  @Input('origin') set origin(origin: number) {
    if (origin == null) { return; }

    const dir = this._getLayoutDirection();
    if ((dir == 'ltr' && origin <= 0) || (dir == 'rtl' && origin > 0)) {
      this._origin = 'left';
    } else {
      this._origin = 'right';
    }
  }

  constructor(
    @Optional() private _dir: Dir,
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef) { }

  /**
   * After initialized, check if the content is centered and has an origin. If so, set the
   * special position states that transition the tab from the left or right before centering.
   */
  ngOnInit() {
    if (this._position == 'center' && this._origin) {
      this._position = this._origin == 'left' ? 'left-origin-center' : 'right-origin-center';
    }
  }

  /**
   * After the view has been set, check if the tab content is set to the center and attach the
   * content if it is not already attached.
   */
  ngAfterViewChecked() {
    if (this._isCenterPosition(this._position) && !this._portalHost.hasAttached()) {
      this._portalHost.attach(this._content);
    }
  }

  /**
   * After the content has been checked, determines whether the element should be allowed to
   * animate. This has to be limited, because under a specific set of circumstances (see #2151),
   * the animations can be triggered too early, which either crashes Chrome by putting it into an
   * infinite loop (with Angular < 2.3.0) or throws an error because the element doesn't have a
   * computed style (with Angular > 2.3.0). This can alternatively be determined by checking the
   * transform: canBeAnimated = getComputedStyle(element) !== '', however document.contains should
   * be faster since it doesn't cause a reflow.
   *
   * TODO: This can safely be removed after we stop supporting Angular < 2.4.2. The fix landed via
   * https://github.com/angular/angular/commit/21030e9a1cf30e8101399d8535ed72d847a23ba6
   */
  ngAfterContentChecked() {
    if (!this._canBeAnimated) {
      this._canBeAnimated = document.body.contains(this._elementRef.nativeElement);

      if (this._canBeAnimated) {
        this._changeDetectorRef.markForCheck();
      }
    }
  }

  _onTranslateTabStarted(e: AnimationTransitionEvent) {
    if (this._isCenterPosition(e.toState)) {
      this.onCentering.emit(this._elementRef.nativeElement.clientHeight);
    }
  }

  _onTranslateTabComplete(e: AnimationTransitionEvent) {
    // If the end state is that the tab is not centered, then detach the content.
    if (!this._isCenterPosition(e.toState) && !this._isCenterPosition(this._position)) {
      this._portalHost.detach();
    }

    // If the transition to the center is complete, emit an event.
    if (this._isCenterPosition(e.toState) && this._isCenterPosition(this._position)) {
      this.onCentered.emit();
    }
  }

  /** The text direction of the containing app. */
  _getLayoutDirection(): LayoutDirection {
    return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
  }

  /** Whether the provided position state is considered center, regardless of origin. */
  private _isCenterPosition(position: MdTabBodyPositionState|string): boolean {
    return position == 'center' ||
        position == 'left-origin-center' ||
        position == 'right-origin-center';
  }
}
