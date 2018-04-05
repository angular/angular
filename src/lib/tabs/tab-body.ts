/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Component,
  Input,
  Inject,
  Output,
  EventEmitter,
  OnDestroy,
  OnInit,
  ElementRef,
  Directive,
  Optional,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ComponentFactoryResolver,
  ViewContainerRef,
  forwardRef,
  ViewChild,
} from '@angular/core';
import {AnimationEvent} from '@angular/animations';
import {TemplatePortal, CdkPortalOutlet, PortalHostDirective} from '@angular/cdk/portal';
import {Directionality, Direction} from '@angular/cdk/bidi';
import {Subscription} from 'rxjs';
import {matTabsAnimations} from './tabs-animations';
import {startWith} from 'rxjs/operators';

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
export type MatTabBodyPositionState =
    'left' | 'center' | 'right' | 'left-origin-center' | 'right-origin-center';

/**
 * The origin state is an internally used state that is set on a new tab body indicating if it
 * began to the left or right of the prior selected index. For example, if the selected index was
 * set to 1, and a new tab is created and selected at index 2, then the tab body would have an
 * origin of right because its index was greater than the prior selected index.
 */
export type MatTabBodyOriginState = 'left' | 'right';

/**
 * The portal host directive for the contents of the tab.
 * @docs-private
 */
@Directive({
  selector: '[matTabBodyHost]'
})
export class MatTabBodyPortal extends CdkPortalOutlet implements OnInit, OnDestroy {
  /** Subscription to events for when the tab body begins centering. */
  private _centeringSub = Subscription.EMPTY;
  /** Subscription to events for when the tab body finishes leaving from center position. */
  private _leavingSub = Subscription.EMPTY;

  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    viewContainerRef: ViewContainerRef,
    @Inject(forwardRef(() => MatTabBody)) private _host: MatTabBody) {
      super(componentFactoryResolver, viewContainerRef);
  }

  /** Set initial visibility or set up subscription for changing visibility. */
  ngOnInit(): void {
    super.ngOnInit();

    this._centeringSub = this._host._beforeCentering
      .pipe(startWith(this._host._isCenterPosition(this._host._position)))
      .subscribe((isCentering: boolean) => {
        if (isCentering && !this.hasAttached()) {
          this.attach(this._host._content);
        }
      });

    this._leavingSub = this._host._afterLeavingCenter.subscribe(() => {
      this.detach();
    });
  }

  /** Clean up centering subscription. */
  ngOnDestroy(): void {
    super.ngOnDestroy();
    this._centeringSub.unsubscribe();
    this._leavingSub.unsubscribe();
  }
}

/**
 * Wrapper for the contents of a tab.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'mat-tab-body',
  templateUrl: 'tab-body.html',
  styleUrls: ['tab-body.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [matTabsAnimations.translateTab],
  host: {
    'class': 'mat-tab-body',
  },
})
export class MatTabBody implements OnInit {
  /** Event emitted when the tab begins to animate towards the center as the active tab. */
  @Output() readonly _onCentering: EventEmitter<number> = new EventEmitter<number>();

  /** Event emitted before the centering of the tab begins. */
  @Output() readonly _beforeCentering: EventEmitter<boolean> = new EventEmitter<boolean>();

  /** Event emitted before the centering of the tab begins. */
  @Output() readonly _afterLeavingCenter: EventEmitter<boolean> = new EventEmitter<boolean>();

  /** Event emitted when the tab completes its animation towards the center. */
  @Output() readonly _onCentered: EventEmitter<void> = new EventEmitter<void>(true);

   /** The portal host inside of this container into which the tab body content will be loaded. */
  @ViewChild(PortalHostDirective) _portalHost: PortalHostDirective;

  /** The tab body content to display. */
  @Input('content') _content: TemplatePortal;

  /** The shifted index position of the tab body, where zero represents the active center tab. */
  @Input()
  set position(position: number) {
    if (position < 0) {
      this._position = this._getLayoutDirection() == 'ltr' ? 'left' : 'right';
    } else if (position > 0) {
      this._position = this._getLayoutDirection() == 'ltr' ? 'right' : 'left';
    } else {
      this._position = 'center';
    }
  }
  _position: MatTabBodyPositionState;

  /** The origin position from which this tab should appear when it is centered into view. */
  @Input()
  set origin(origin: number) {
    if (origin == null) { return; }

    const dir = this._getLayoutDirection();
    if ((dir == 'ltr' && origin <= 0) || (dir == 'rtl' && origin > 0)) {
      this._origin = 'left';
    } else {
      this._origin = 'right';
    }
  }
  _origin: MatTabBodyOriginState;

  constructor(private _elementRef: ElementRef,
              @Optional() private _dir: Directionality) { }

  /**
   * After initialized, check if the content is centered and has an origin. If so, set the
   * special position states that transition the tab from the left or right before centering.
   */
  ngOnInit() {
    if (this._position == 'center' && this._origin) {
      this._position = this._origin == 'left' ? 'left-origin-center' : 'right-origin-center';
    }
  }

  _onTranslateTabStarted(e: AnimationEvent): void {
    const isCentering = this._isCenterPosition(e.toState);
    this._beforeCentering.emit(isCentering);
    if (isCentering) {
      this._onCentering.emit(this._elementRef.nativeElement.clientHeight);
    }
  }

  _onTranslateTabComplete(e: AnimationEvent): void {
    // If the transition to the center is complete, emit an event.
    if (this._isCenterPosition(e.toState) && this._isCenterPosition(this._position)) {
      this._onCentered.emit();
    }

    if (this._isCenterPosition(e.fromState) && !this._isCenterPosition(this._position)) {
      this._afterLeavingCenter.emit();
    }
  }

  /** The text direction of the containing app. */
  _getLayoutDirection(): Direction {
    return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
  }

  /** Whether the provided position state is considered center, regardless of origin. */
  _isCenterPosition(position: MatTabBodyPositionState|string): boolean {
    return position == 'center' ||
        position == 'left-origin-center' ||
        position == 'right-origin-center';
  }
}
