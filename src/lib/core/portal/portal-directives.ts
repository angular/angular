import {
    NgModule,
    ComponentRef,
    Directive,
    TemplateRef,
    ComponentFactoryResolver,
    ViewContainerRef,
    OnDestroy,
    Input,
} from '@angular/core';
import {Portal, TemplatePortal, ComponentPortal, BasePortalHost} from './portal';


/**
 * Directive version of a `TemplatePortal`. Because the directive *is* a TemplatePortal,
 * the directive instance itself can be attached to a host, enabling declarative use of portals.
 *
 * Usage:
 * <ng-template portal #greeting>
 *   <p> Hello {{name}} </p>
 * </ng-template>
 */
@Directive({
  selector: '[cdk-portal], [cdkPortal], [portal]',
  exportAs: 'cdkPortal',
})
export class TemplatePortalDirective extends TemplatePortal {
  constructor(templateRef: TemplateRef<any>, viewContainerRef: ViewContainerRef) {
    super(templateRef, viewContainerRef);
  }
}


/**
 * Directive version of a PortalHost. Because the directive *is* a PortalHost, portals can be
 * directly attached to it, enabling declarative use.
 *
 * Usage:
 * <ng-template [cdkPortalHost]="greeting"></ng-template>
 */
@Directive({
  selector: '[cdkPortalHost], [portalHost]',
  inputs: ['portal: cdkPortalHost']
})
export class PortalHostDirective extends BasePortalHost implements OnDestroy {
  /** The attached portal. */
  private _portal: Portal<any>;

  constructor(
      private _componentFactoryResolver: ComponentFactoryResolver,
      private _viewContainerRef: ViewContainerRef) {
    super();
  }

  /** @deprecated */
  @Input('portalHost')
  get _deprecatedPortal() { return this.portal; }
  set _deprecatedPortal(v) { this.portal = v; }

  /** Portal associated with the Portal host. */
  get portal(): Portal<any> {
    return this._portal;
  }

  set portal(portal: Portal<any>) {
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
   * Attach the given ComponentPortal to this PortalHost using the ComponentFactoryResolver.
   *
   * @param portal Portal to be attached to the portal host.
   */
  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    portal.setAttachedHost(this);

    // If the portal specifies an origin, use that as the logical location of the component
    // in the application tree. Otherwise use the location of this PortalHost.
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
   */
  attachTemplatePortal(portal: TemplatePortal): Map<string, any> {
    portal.setAttachedHost(this);

    this._viewContainerRef.createEmbeddedView(portal.templateRef);
    super.setDisposeFn(() => this._viewContainerRef.clear());

    this._portal = portal;

    // TODO(jelbourn): return locals from view
    return new Map<string, any>();
  }
}


@NgModule({
  exports: [TemplatePortalDirective, PortalHostDirective],
  declarations: [TemplatePortalDirective, PortalHostDirective],
})
export class PortalModule {}
