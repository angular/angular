/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, InjectionToken, Injector} from '@angular/core';
import {Menu} from './menu-interface';
import {MENU_STACK, MenuStack} from './menu-stack';

/** Injection token used for an implementation of MenuStack. */
export const MENU_TRIGGER = new InjectionToken<MenuTrigger>('cdk-menu-trigger');

@Injectable()
export class MenuTrigger {
  private _childMenuInjector?: Injector;

  protected childMenu?: Menu;

  constructor(protected injector: Injector, @Inject(MENU_STACK) protected menuStack: MenuStack) {}

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

  registerChildMenu(child: Menu) {
    this.childMenu = child;
  }
}
