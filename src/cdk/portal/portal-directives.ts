/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
    NgModule,
    ComponentRef,
    Directive,
    EmbeddedViewRef,
    TemplateRef,
    ComponentFactoryResolver,
    ViewContainerRef,
    OnDestroy,
    Input,
} from '@angular/core';
import {Portal, TemplatePortal, ComponentPortal, BasePortalOutlet} from './portal';


/**
 * Directive version of a `TemplatePortal`. Because the directive *is* a TemplatePortal,
 * the directive instance itself can be attached to a host, enabling declarative use of portals.
 */
@Directive({
  selector: '[cdk-portal], [cdkPortal], [portal]',
  exportAs: 'cdkPortal',
})
export class CdkPortal extends TemplatePortal<any> {
  constructor(templateRef: TemplateRef<any>, viewContainerRef: ViewContainerRef) {
    super(templateRef, viewContainerRef);
  }
}


/**
 * Directive version of a PortalOutlet. Because the directive *is* a PortalOutlet, portals can be
 * directly attached to it, enabling declarative use.
 *
 * Usage:
 * <ng-template [cdkPortalOutlet]="greeting"></ng-template>
 */
@Directive({
  selector: '[cdkPortalOutlet], [cdkPortalHost], [portalHost]',
  exportAs: 'cdkPortalOutlet, cdkPortalHost',
  inputs: ['portal: cdkPortalOutlet']
})
export class CdkPortalOutlet extends BasePortalOutlet implements OnDestroy {
  /** The attached portal. */
  private _portal: Portal<any> | null = null;

  constructor(
      private _componentFactoryResolver: ComponentFactoryResolver,
      private _viewContainerRef: ViewContainerRef) {
    super();
  }

  /** @deprecated */
  @Input('portalHost')
  get _deprecatedPortal() { return this.portal; }
  set _deprecatedPortal(v) { this.portal = v; }

  /** @deprecated */
  @Input('cdkPortalHost')
  get _deprecatedPortalHost() { return this.portal; }
  set _deprecatedPortalHost(v) { this.portal = v; }

  /** Portal associated with the Portal outlet. */
  get portal(): Portal<any> | null {
    return this._portal;
  }

  set portal(portal: Portal<any> | null) {
    if (this.hasAttached()) {
      super.detach();
    }

    if (portal) {
      super.attach(portal);
    }

    this._portal = portal;
  }

  ngOnDestroy() {
    super.dispose();
    this._portal = null;
  }

  /**
   * Attach the given ComponentPortal to this PortalOutlet using the ComponentFactoryResolver.
   *
   * @param portal Portal to be attached to the portal outlet.
   * @returns Reference to the created component.
   */
  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    portal.setAttachedHost(this);

    // If the portal specifies an origin, use that as the logical location of the component
    // in the application tree. Otherwise use the location of this PortalOutlet.
    let viewContainerRef = portal.viewContainerRef != null ?
        portal.viewContainerRef :
        this._viewContainerRef;

    let componentFactory =
        this._componentFactoryResolver.resolveComponentFactory(portal.component);
    let ref = viewContainerRef.createComponent(
        componentFactory, viewContainerRef.length,
        portal.injector || viewContainerRef.parentInjector);

    super.setDisposeFn(() => ref.destroy());
    this._portal = portal;

    return ref;
  }

  /**
   * Attach the given TemplatePortal to this PortlHost as an embedded View.
   * @param portal Portal to be attached.
   * @returns Reference to the created embedded view.
   */
  attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
    portal.setAttachedHost(this);
    const viewRef = this._viewContainerRef.createEmbeddedView(portal.templateRef, portal.context);
    super.setDisposeFn(() => this._viewContainerRef.clear());

    this._portal = portal;

    return viewRef;
  }
}


@NgModule({
  exports: [CdkPortal, CdkPortalOutlet],
  declarations: [CdkPortal, CdkPortalOutlet],
})
export class PortalModule {}
