/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, inject, Injectable, InjectionToken, NgZone, OnDestroy} from '@angular/core';
import {fromEvent, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {FocusableElement, PointerFocusTracker} from './pointer-focus-tracker';
import {Menu} from './menu-interface';
import {throwMissingMenuReference, throwMissingPointerFocusTracker} from './menu-errors';

/**
 * MenuAim is responsible for determining if a sibling menuitem's menu should be closed when a
 * Toggler item is hovered into. It is up to the hovered in item to call the MenuAim service in
 * order to determine if it may perform its close actions.
 */
export interface MenuAim {
  /**
   * Set the Menu and its PointerFocusTracker.
   * @param menu The menu that this menu aim service controls.
   * @param pointerTracker The `PointerFocusTracker` for the given menu.
   */
  initialize(menu: Menu, pointerTracker: PointerFocusTracker<FocusableElement & Toggler>): void;

  /**
   * Calls the `doToggle` callback when it is deemed that the user is not moving towards
   * the submenu.
   * @param doToggle the function called when the user is not moving towards the submenu.
   */
  toggle(doToggle: () => void): void;
}

/** Injection token used for an implementation of MenuAim. */
export const MENU_AIM = new InjectionToken<MenuAim>('cdk-menu-aim');

/** Capture every nth mouse move event. */
const MOUSE_MOVE_SAMPLE_FREQUENCY = 3;

/** The number of mouse move events to track. */
const NUM_POINTS = 5;

/**
 * How long to wait before closing a sibling menu if a user stops short of the submenu they were
 * predicted to go into.
 */
const CLOSE_DELAY = 300;

/** An element which when hovered over may open or close a menu. */
export interface Toggler {
  /** Gets the open menu, or undefined if no menu is open. */
  getMenu(): Menu | undefined;
}

/** Calculate the slope between point a and b. */
function getSlope(a: Point, b: Point) {
  return (b.y - a.y) / (b.x - a.x);
}

/** Calculate the y intercept for the given point and slope. */
function getYIntercept(point: Point, slope: number) {
  return point.y - slope * point.x;
}

/** Represents a coordinate of mouse travel. */
type Point = {x: number; y: number};

/**
 * Whether the given mouse trajectory line defined by the slope and y intercept falls within the
 * submenu as defined by `submenuPoints`
 * @param submenuPoints the submenu DOMRect points.
 * @param m the slope of the trajectory line.
 * @param b the y intercept of the trajectory line.
 * @return true if any point on the line falls within the submenu.
 */
function isWithinSubmenu(submenuPoints: DOMRect, m: number, b: number) {
  const {left, right, top, bottom} = submenuPoints;

  // Check for intersection with each edge of the submenu (left, right, top, bottom)
  // by fixing one coordinate to that edge's coordinate (either x or y) and checking if the
  // other coordinate is within bounds.
  return (
    (m * left + b >= top && m * left + b <= bottom) ||
    (m * right + b >= top && m * right + b <= bottom) ||
    ((top - b) / m >= left && (top - b) / m <= right) ||
    ((bottom - b) / m >= left && (bottom - b) / m <= right)
  );
}

/**
 * TargetMenuAim predicts if a user is moving into a submenu. It calculates the
 * trajectory of the user's mouse movement in the current menu to determine if the
 * mouse is moving towards an open submenu.
 *
 * The determination is made by calculating the slope of the users last NUM_POINTS moves where each
 * pair of points determines if the trajectory line points into the submenu. It uses consensus
 * approach by checking if at least NUM_POINTS / 2 pairs determine that the user is moving towards
 * to submenu.
 */
@Injectable()
export class TargetMenuAim implements MenuAim, OnDestroy {
  /** The Angular zone. */
  private readonly _ngZone = inject(NgZone);

  /** The last NUM_POINTS mouse move events. */
  private readonly _points: Point[] = [];

  /** Reference to the root menu in which we are tracking mouse moves. */
  private _menu: Menu;

  /** Reference to the root menu's mouse manager. */
  private _pointerTracker: PointerFocusTracker<Toggler & FocusableElement>;

  /** The id associated with the current timeout call waiting to resolve. */
  private _timeoutId: number | null;

  /** Emits when this service is destroyed. */
  private readonly _destroyed: Subject<void> = new Subject();

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  /**
   * Set the Menu and its PointerFocusTracker.
   * @param menu The menu that this menu aim service controls.
   * @param pointerTracker The `PointerFocusTracker` for the given menu.
   */
  initialize(menu: Menu, pointerTracker: PointerFocusTracker<FocusableElement & Toggler>) {
    this._menu = menu;
    this._pointerTracker = pointerTracker;
    this._subscribeToMouseMoves();
  }

  /**
   * Calls the `doToggle` callback when it is deemed that the user is not moving towards
   * the submenu.
   * @param doToggle the function called when the user is not moving towards the submenu.
   */
  toggle(doToggle: () => void) {
    // If the menu is horizontal the sub-menus open below and there is no risk of premature
    // closing of any sub-menus therefore we automatically resolve the callback.
    if (this._menu.orientation === 'horizontal') {
      doToggle();
    }

    this._checkConfigured();

    const siblingItemIsWaiting = !!this._timeoutId;
    const hasPoints = this._points.length > 1;

    if (hasPoints && !siblingItemIsWaiting) {
      if (this._isMovingToSubmenu()) {
        this._startTimeout(doToggle);
      } else {
        doToggle();
      }
    } else if (!siblingItemIsWaiting) {
      doToggle();
    }
  }

  /**
   * Start the delayed toggle handler if one isn't running already.
   *
   * The delayed toggle handler executes the `doToggle` callback after some period of time iff the
   * users mouse is on an item in the current menu.
   *
   * @param doToggle the function called when the user is not moving towards the submenu.
   */
  private _startTimeout(doToggle: () => void) {
    // If the users mouse is moving towards a submenu we don't want to immediately resolve.
    // Wait for some period of time before determining if the previous menu should close in
    // cases where the user may have moved towards the submenu but stopped on a sibling menu
    // item intentionally.
    const timeoutId = setTimeout(() => {
      // Resolve if the user is currently moused over some element in the root menu
      if (this._pointerTracker!.activeElement && timeoutId === this._timeoutId) {
        doToggle();
      }
      this._timeoutId = null;
    }, CLOSE_DELAY) as any as number;

    this._timeoutId = timeoutId;
  }

  /** Whether the user is heading towards the open submenu. */
  private _isMovingToSubmenu() {
    const submenuPoints = this._getSubmenuBounds();
    if (!submenuPoints) {
      return false;
    }

    let numMoving = 0;
    const currPoint = this._points[this._points.length - 1];
    // start from the second last point and calculate the slope between each point and the last
    // point.
    for (let i = this._points.length - 2; i >= 0; i--) {
      const previous = this._points[i];
      const slope = getSlope(currPoint, previous);
      if (isWithinSubmenu(submenuPoints, slope, getYIntercept(currPoint, slope))) {
        numMoving++;
      }
    }
    return numMoving >= Math.floor(NUM_POINTS / 2);
  }

  /** Get the bounding DOMRect for the open submenu. */
  private _getSubmenuBounds(): DOMRect | undefined {
    return this._pointerTracker?.previousElement?.getMenu()?.nativeElement.getBoundingClientRect();
  }

  /**
   * Check if a reference to the PointerFocusTracker and menu element is provided.
   * @throws an error if neither reference is provided.
   */
  private _checkConfigured() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (!this._pointerTracker) {
        throwMissingPointerFocusTracker();
      }
      if (!this._menu) {
        throwMissingMenuReference();
      }
    }
  }

  /** Subscribe to the root menus mouse move events and update the tracked mouse points. */
  private _subscribeToMouseMoves() {
    this._ngZone.runOutsideAngular(() => {
      fromEvent<MouseEvent>(this._menu.nativeElement, 'mousemove')
        .pipe(
          filter((_: MouseEvent, index: number) => index % MOUSE_MOVE_SAMPLE_FREQUENCY === 0),
          takeUntil(this._destroyed),
        )
        .subscribe((event: MouseEvent) => {
          this._points.push({x: event.clientX, y: event.clientY});
          if (this._points.length > NUM_POINTS) {
            this._points.shift();
          }
        });
    });
  }
}

/**
 * CdkTargetMenuAim is a provider for the TargetMenuAim service. It can be added to an
 * element with either the `cdkMenu` or `cdkMenuBar` directive and child menu items.
 */
@Directive({
  selector: '[cdkTargetMenuAim]',
  exportAs: 'cdkTargetMenuAim',
  providers: [{provide: MENU_AIM, useClass: TargetMenuAim}],
})
export class CdkTargetMenuAim {}
