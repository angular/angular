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
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  ElementRef,
  ChangeDetectionStrategy,
  InjectionToken,
  Inject,
} from '@angular/core';
import {AnimationEvent} from '@angular/animations';
import {MenuPositionX, MenuPositionY} from './menu-positions';
import {throwMdMenuInvalidPositionX, throwMdMenuInvalidPositionY} from './menu-errors';
import {MdMenuItem} from './menu-item';
import {FocusKeyManager} from '@angular/cdk/a11y';
import {MdMenuPanel} from './menu-panel';
import {Subscription} from 'rxjs/Subscription';
import {transformMenu, fadeInItems} from './menu-animations';
import {ESCAPE, LEFT_ARROW, RIGHT_ARROW} from '../core/keyboard/keycodes';
import {merge} from 'rxjs/observable/merge';
import {Observable} from 'rxjs/Observable';
import {Direction} from '@angular/cdk/bidi';
import {RxChain, startWith, switchMap} from '@angular/cdk/rxjs';

/** Default `md-menu` options that can be overridden. */
export interface MdMenuDefaultOptions {
  xPosition: MenuPositionX;
  yPosition: MenuPositionY;
  overlapTrigger: boolean;
}

/** Injection token to be used to override the default options for `md-menu`. */
export const MD_MENU_DEFAULT_OPTIONS =
    new InjectionToken<MdMenuDefaultOptions>('md-menu-default-options');

/**
 * Start elevation for the menu panel.
 * @docs-private
 */
const MD_MENU_BASE_ELEVATION = 2;


@Component({
  moduleId: module.id,
  selector: 'md-menu, mat-menu',
  templateUrl: 'menu.html',
  styleUrls: ['menu.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [
    transformMenu,
    fadeInItems
  ],
  exportAs: 'mdMenu'
})
export class MdMenu implements AfterContentInit, MdMenuPanel, OnDestroy {
  private _keyManager: FocusKeyManager<MdMenuItem>;
  private _xPosition: MenuPositionX = this._defaultOptions.xPosition;
  private _yPosition: MenuPositionY = this._defaultOptions.yPosition;
  private _previousElevation: string;

  /** Subscription to tab events on the menu panel */
  private _tabSubscription = Subscription.EMPTY;

  /** Config object to be passed into the menu's ngClass */
  _classList: any = {};

  /** Current state of the panel animation. */
  _panelAnimationState: 'void' | 'enter-start' | 'enter' = 'void';

  /** Parent menu of the current menu panel. */
  parentMenu: MdMenuPanel | undefined;

  /** Layout direction of the menu. */
  direction: Direction;

  /** Position of the menu in the X axis. */
  @Input()
  get xPosition() { return this._xPosition; }
  set xPosition(value: MenuPositionX) {
    if (value !== 'before' && value !== 'after') {
      throwMdMenuInvalidPositionX();
    }
    this._xPosition = value;
    this.setPositionClasses();
  }

  /** Position of the menu in the Y axis. */
  @Input()
  get yPosition() { return this._yPosition; }
  set yPosition(value: MenuPositionY) {
    if (value !== 'above' && value !== 'below') {
      throwMdMenuInvalidPositionY();
    }
    this._yPosition = value;
    this.setPositionClasses();
  }

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

  /** List of the items inside of a menu. */
  @ContentChildren(MdMenuItem) items: QueryList<MdMenuItem>;

  /** Whether the menu should overlap its trigger. */
  @Input() overlapTrigger = this._defaultOptions.overlapTrigger;

  /**
   * This method takes classes set on the host md-menu element and applies them on the
   * menu template that displays in the overlay container.  Otherwise, it's difficult
   * to style the containing menu from outside the component.
   * @param classes list of class names
   */
  @Input('class')
  set classList(classes: string) {
    if (classes && classes.length) {
      this._classList = classes.split(' ').reduce((obj: any, className: string) => {
        obj[className] = true;
        return obj;
      }, {});

      this._elementRef.nativeElement.className = '';
      this.setPositionClasses();
    }
  }

  /** Event emitted when the menu is closed. */
  @Output() close = new EventEmitter<void | 'click' | 'keydown'>();

  constructor(
    private _elementRef: ElementRef,
    @Inject(MD_MENU_DEFAULT_OPTIONS) private _defaultOptions: MdMenuDefaultOptions) { }

  ngAfterContentInit() {
    this._keyManager = new FocusKeyManager<MdMenuItem>(this.items).withWrap();
    this._tabSubscription = this._keyManager.tabOut.subscribe(() => this.close.emit('keydown'));
  }

  ngOnDestroy() {
    this._tabSubscription.unsubscribe();
    this.close.emit();
    this.close.complete();
  }

  /** Stream that emits whenever the hovered menu item changes. */
  hover(): Observable<MdMenuItem> {
    return RxChain.from(this.items.changes)
      .call(startWith, this.items)
      .call(switchMap, (items: MdMenuItem[]) => merge(...items.map(item => item.hover)))
      .result();
  }

  /** Handle a keyboard event from the menu, delegating to the appropriate action. */
  _handleKeydown(event: KeyboardEvent) {
    switch (event.keyCode) {
      case ESCAPE:
        this.close.emit('keydown');
        event.stopPropagation();
      break;
      case LEFT_ARROW:
        if (this.parentMenu && this.direction === 'ltr') {
          this.close.emit('keydown');
        }
      break;
      case RIGHT_ARROW:
        if (this.parentMenu && this.direction === 'rtl') {
          this.close.emit('keydown');
        }
      break;
      default:
        this._keyManager.onKeydown(event);
    }
  }

  /**
   * Focus the first item in the menu. This method is used by the menu trigger
   * to focus the first item when the menu is opened by the ENTER key.
   */
  focusFirstItem() {
    this._keyManager.setFirstItemActive();
  }

  /**
   * It's necessary to set position-based classes to ensure the menu panel animation
   * folds out from the correct direction.
   */
  setPositionClasses(posX = this.xPosition, posY = this.yPosition): void {
    this._classList['mat-menu-before'] = posX === 'before';
    this._classList['mat-menu-after'] = posX === 'after';
    this._classList['mat-menu-above'] = posY === 'above';
    this._classList['mat-menu-below'] = posY === 'below';
  }

  /**
   * Sets the menu panel elevation.
   * @param depth Number of parent menus that come before the menu.
   */
  setElevation(depth: number): void {
    // The elevation starts at the base and increases by one for each level.
    const newElevation = `mat-elevation-z${MD_MENU_BASE_ELEVATION + depth}`;
    const customElevation = Object.keys(this._classList).find(c => c.startsWith('mat-elevation-z'));

    if (!customElevation || customElevation === this._previousElevation) {
      if (this._previousElevation) {
        this._classList[this._previousElevation] = false;
      }

      this._classList[newElevation] = true;
      this._previousElevation = newElevation;
    }
  }

  /** Starts the enter animation. */
  _startAnimation() {
    this._panelAnimationState = 'enter-start';
  }

  /** Resets the panel animation to its initial state. */
  _resetAnimation() {
    this._panelAnimationState = 'void';
  }

  /** Callback that is invoked when the panel animation completes. */
  _onAnimationDone(event: AnimationEvent) {
    // After the initial expansion is done, trigger the second phase of the enter animation.
    if (event.toState === 'enter-start') {
      this._panelAnimationState = 'enter';
    }
  }
}
