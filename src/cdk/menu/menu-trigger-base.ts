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
  inject,
  InjectionToken,
  Injector,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import {Menu} from './menu-interface';
import {MENU_STACK, MenuStack} from './menu-stack';
import {ConnectedPosition, OverlayRef} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {merge, Subject} from 'rxjs';

/** Injection token used for an implementation of MenuStack. */
export const MENU_TRIGGER = new InjectionToken<CdkMenuTriggerBase>('cdk-menu-trigger');

/**
 * Abstract directive that implements shared logic common to all menu triggers.
 * This class can be extended to create custom menu trigger types.
 */
@Directive({
  host: {
    '[attr.aria-controls]': 'childMenu?.id',
    '[attr.data-cdk-menu-stack-id]': 'menuStack.id',
  },
})
export abstract class CdkMenuTriggerBase implements OnDestroy {
  /** The DI injector for this component. */
  readonly injector = inject(Injector);

  /** The view container ref for this component */
  protected readonly viewContainerRef = inject(ViewContainerRef);

  /** The menu stack in which this menu resides. */
  protected readonly menuStack: MenuStack = inject(MENU_STACK);

  /**
   * A list of preferred menu positions to be used when constructing the
   * `FlexibleConnectedPositionStrategy` for this trigger's menu.
   */
  menuPosition: ConnectedPosition[];

  /** Emits when the attached menu is requested to open */
  readonly opened: EventEmitter<void> = new EventEmitter();

  /** Emits when the attached menu is requested to close */
  readonly closed: EventEmitter<void> = new EventEmitter();

  /** Template reference variable to the menu this trigger opens */
  menuTemplateRef: TemplateRef<unknown>;

  /** A reference to the overlay which manages the triggered menu */
  protected overlayRef: OverlayRef | null = null;

  /** Emits when this trigger is destroyed. */
  protected readonly destroyed: Subject<void> = new Subject();

  /** Emits when the outside pointer events listener on the overlay should be stopped. */
  protected readonly stopOutsideClicksListener = merge(this.closed, this.destroyed);

  /** The child menu opened by this trigger. */
  protected childMenu?: Menu;

  /** The content of the menu panel opened by this trigger. */
  private _menuPortal: TemplatePortal;

  /** The injector to use for the child menu opened by this trigger. */
  private _childMenuInjector?: Injector;

  ngOnDestroy() {
    this._destroyOverlay();

    this.destroyed.next();
    this.destroyed.complete();
  }

  /** Whether the attached menu is open. */
  isOpen() {
    return !!this.overlayRef?.hasAttached();
  }

  /** Registers a child menu as having been opened by this trigger. */
  registerChildMenu(child: Menu) {
    this.childMenu = child;
  }

  /**
   * Get the portal to be attached to the overlay which contains the menu. Allows for the menu
   * content to change dynamically and be reflected in the application.
   */
  protected getMenuContentPortal() {
    const hasMenuContentChanged = this.menuTemplateRef !== this._menuPortal?.templateRef;
    if (this.menuTemplateRef && (!this._menuPortal || hasMenuContentChanged)) {
      this._menuPortal = new TemplatePortal(
        this.menuTemplateRef,
        this.viewContainerRef,
        undefined,
        this._getChildMenuInjector(),
      );
    }

    return this._menuPortal;
  }

  /**
   * Whether the given element is inside the scope of this trigger's menu stack.
   * @param element The element to check.
   * @return Whether the element is inside the scope of this trigger's menu stack.
   */
  protected isElementInsideMenuStack(element: Element) {
    for (let el: Element | null = element; el; el = el?.parentElement ?? null) {
      if (el.getAttribute('data-cdk-menu-stack-id') === this.menuStack.id) {
        return true;
      }
    }
    return false;
  }

  /** Destroy and unset the overlay reference it if exists */
  private _destroyOverlay() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  /** Gets the injector to use when creating a child menu. */
  private _getChildMenuInjector() {
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
}
