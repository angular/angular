/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Directive,
  EventEmitter,
  Inject,
  InjectionToken,
  Injector,
  OnDestroy,
  TemplateRef,
} from '@angular/core';
import {Menu} from './menu-interface';
import {MENU_STACK, MenuStack} from './menu-stack';
import {ConnectedPosition, OverlayRef} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {merge, Subject} from 'rxjs';

/** Injection token used for an implementation of MenuStack. */
export const MENU_TRIGGER = new InjectionToken<MenuTrigger>('cdk-menu-trigger');

@Directive()
export abstract class MenuTrigger implements OnDestroy {
  /** A list of preferred menu positions to be used when constructing the `FlexibleConnectedPositionStrategy` for this trigger's menu. */
  menuPosition: ConnectedPosition[];

  /** Emits when the attached menu is requested to open */
  readonly opened: EventEmitter<void> = new EventEmitter();

  /** Emits when the attached menu is requested to close */
  readonly closed: EventEmitter<void> = new EventEmitter();

  /** Template reference variable to the menu this trigger opens */
  protected _menuTemplateRef: TemplateRef<unknown>;

  /** A reference to the overlay which manages the triggered menu */
  protected _overlayRef: OverlayRef | null = null;

  /** The content of the menu panel opened by this trigger. */
  protected _menuPortal: TemplatePortal;

  /** Emits when this trigger is destroyed. */
  protected readonly _destroyed: Subject<void> = new Subject();

  /** Emits when the outside pointer events listener on the overlay should be stopped. */
  protected readonly _stopOutsideClicksListener = merge(this.closed, this._destroyed);

  private _childMenuInjector?: Injector;

  protected childMenu?: Menu;

  protected constructor(
    protected injector: Injector,
    @Inject(MENU_STACK) protected menuStack: MenuStack,
  ) {}

  ngOnDestroy() {
    this._destroyOverlay();

    this._destroyed.next();
    this._destroyed.complete();
  }

  /** Whether the attached menu is open. */
  isOpen() {
    return !!this._overlayRef?.hasAttached();
  }

  registerChildMenu(child: Menu) {
    this.childMenu = child;
  }

  protected getChildMenuInjector() {
    this._childMenuInjector =
      this._childMenuInjector ||
      Injector.create({
        providers: [
          {provide: MENU_TRIGGER, useValue: this},
          {provide: MENU_STACK, useValue: this.menuStack},
        ],
        parent: this.injector,
      });
    return this._childMenuInjector;
  }

  /** Destroy and unset the overlay reference it if exists */
  private _destroyOverlay() {
    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._overlayRef = null;
    }
  }
}
