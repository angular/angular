/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DomPortalOutlet, TemplatePortal} from '@angular/cdk/portal';
import {DOCUMENT} from '@angular/common';
import {
  ApplicationRef,
  ChangeDetectorRef,
  ComponentFactoryResolver,
  Directive,
  Inject,
  InjectionToken,
  Injector,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import {Subject} from 'rxjs';

/**
 * Injection token that can be used to reference instances of `MatMenuContent`. It serves
 * as alternative token to the actual `MatMenuContent` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const MAT_MENU_CONTENT = new InjectionToken<MatMenuContent>('MatMenuContent');

@Directive()
export abstract class _MatMenuContentBase implements OnDestroy {
  private _portal: TemplatePortal<any>;
  private _outlet: DomPortalOutlet;

  /** Emits when the menu content has been attached. */
  readonly _attached = new Subject<void>();

  constructor(
    template: TemplateRef<any>,
    componentFactoryResolver: ComponentFactoryResolver,
    appRef: ApplicationRef,
    injector: Injector,
    viewContainerRef: ViewContainerRef,
    document: any,
    changeDetectorRef: ChangeDetectorRef,
  );

  /**
   * @deprecated `changeDetectorRef` is now a required parameter.
   * @breaking-change 9.0.0
   */
  constructor(
    template: TemplateRef<any>,
    componentFactoryResolver: ComponentFactoryResolver,
    appRef: ApplicationRef,
    injector: Injector,
    viewContainerRef: ViewContainerRef,
    document: any,
    changeDetectorRef?: ChangeDetectorRef,
  );

  constructor(
    private _template: TemplateRef<any>,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _appRef: ApplicationRef,
    private _injector: Injector,
    private _viewContainerRef: ViewContainerRef,
    @Inject(DOCUMENT) private _document: any,
    private _changeDetectorRef?: ChangeDetectorRef,
  ) {}

  /**
   * Attaches the content with a particular context.
   * @docs-private
   */
  attach(context: any = {}) {
    if (!this._portal) {
      this._portal = new TemplatePortal(this._template, this._viewContainerRef);
    }

    this.detach();

    if (!this._outlet) {
      this._outlet = new DomPortalOutlet(
        this._document.createElement('div'),
        this._componentFactoryResolver,
        this._appRef,
        this._injector,
      );
    }

    const element: HTMLElement = this._template.elementRef.nativeElement;

    // Because we support opening the same menu from different triggers (which in turn have their
    // own `OverlayRef` panel), we have to re-insert the host element every time, otherwise we
    // risk it staying attached to a pane that's no longer in the DOM.
    element.parentNode!.insertBefore(this._outlet.outletElement, element);

    // When `MatMenuContent` is used in an `OnPush` component, the insertion of the menu
    // content via `createEmbeddedView` does not cause the content to be seen as "dirty"
    // by Angular. This causes the `@ContentChildren` for menu items within the menu to
    // not be updated by Angular. By explicitly marking for check here, we tell Angular that
    // it needs to check for new menu items and update the `@ContentChild` in `MatMenu`.
    // @breaking-change 9.0.0 Make change detector ref required
    this._changeDetectorRef?.markForCheck();
    this._portal.attach(this._outlet, context);
    this._attached.next();
  }

  /**
   * Detaches the content.
   * @docs-private
   */
  detach() {
    if (this._portal.isAttached) {
      this._portal.detach();
    }
  }

  ngOnDestroy() {
    if (this._outlet) {
      this._outlet.dispose();
    }
  }
}

/** Menu content that will be rendered lazily once the menu is opened. */
@Directive({
  selector: 'ng-template[matMenuContent]',
  providers: [{provide: MAT_MENU_CONTENT, useExisting: MatMenuContent}],
})
export class MatMenuContent extends _MatMenuContentBase {}
