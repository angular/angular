import {
    NgModule,
    ModuleWithProviders,
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
 * <template portal #greeting>
 *   <p> Hello {{name}} </p>
 * </template>
 */
@Directive({
  selector: '[cdk-portal], [portal]',
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
 * <template [cdkPortalHost]="greeting"></template>
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

  set portal(p: Portal<any>) {
    if (p) {
      this._replaceAttachedPortal(p);
    }
  }

  ngOnDestroy() {
    this.dispose();
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

    this.setDisposeFn(() => ref.destroy());
    return ref;
  }

  /**
   * Attach the given TemplatePortal to this PortlHost as an embedded View.
   * @param portal Portal to be attached.
   */
  attachTemplatePortal(portal: TemplatePortal): Map<string, any> {
    portal.setAttachedHost(this);

    this._viewContainerRef.createEmbeddedView(portal.templateRef);
    this.setDisposeFn(() => this._viewContainerRef.clear());

    // TODO(jelbourn): return locals from view
    return new Map<string, any>();
  }

  /** Detaches the currently attached Portal (if there is one) and attaches the given Portal. */
  private _replaceAttachedPortal(p: Portal<any>): void {
    if (this.hasAttached()) {
      this.detach();
    }

    if (p) {
      this.attach(p);
      this._portal = p;
    }
  }
}


@NgModule({
  exports: [TemplatePortalDirective, PortalHostDirective],
  declarations: [TemplatePortalDirective, PortalHostDirective],
})
export class PortalModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: PortalModule,
      providers: []
    };
  }
}
