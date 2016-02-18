import {Portal} from './portal';
import {TemplatePortal} from './portal';
import {ComponentRef} from 'angular2/core';
import {ComponentPortal} from './portal';
import {Directive} from 'angular2/core';
import {TemplateRef} from 'angular2/core';
import {BasePortalHost} from './portal';
import {DynamicComponentLoader} from 'angular2/core';
import {ElementRef} from 'angular2/core';
import {ViewContainerRef} from 'angular2/core';


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
  selector: '[portal]',
  exportAs: 'portal',
})
export class TemplatePortalDirective extends TemplatePortal {
  constructor(templateRef: TemplateRef) {
    super(templateRef);
  }
}


/**
 * Directive version of a PortalHost. Because the directive *is* a PortalHost, portals can be
 * directly attached to it, enabling declarative use.
 *
 * Usage:
 * <template [portalHost]="greeting"></template>
 */
@Directive({
  selector: '[portalHost]',
  inputs: ['portal: portalHost']
})
export class PortalHostDirective extends BasePortalHost {
  /** The attached portal. */
  private portal_: Portal<any>;

  constructor(
      private dynamicComponentLoader_: DynamicComponentLoader,
      private elementRef_: ElementRef,
      private viewContainerRef_: ViewContainerRef) {
    super();
  }

  get portal(): Portal<any> {
    return this.portal_;
  }

  set portal(p: Portal<any>) {
    this.replaceAttachedPortal_(p);
  }

  /** Attach the given ComponentPortal to this PortlHost using the DynamicComponentLoader. */
  attachComponentPortal(portal: ComponentPortal): Promise<ComponentRef> {
    portal.setAttachedHost(this);

    // If the portal specifies an origin, use that as the logical location of the component
    // in the application tree. Otherwise use the location of this PortalHost.
    let elementRef = portal.origin != null ? portal.origin : this.elementRef_;

    // Typecast is necessary for Dart transpilation.
    return <Promise<ComponentRef>>
        this.dynamicComponentLoader_.loadNextToLocation(portal.component, elementRef)
        .then(ref => {
          this.setDisposeFn(() => ref.dispose());
          return ref;
        });
  }

  /** Attach the given TemplatePortal to this PortlHost as an embedded View. */
  attachTemplatePortal(portal: TemplatePortal): Promise<Map<string, any>> {
    portal.setAttachedHost(this);

    let viewRef = this.viewContainerRef_.createEmbeddedView(portal.templateRef);
    portal.locals.forEach((v, k) => viewRef.setLocal(k, v));
    this.setDisposeFn(() => this.viewContainerRef_.clear());

    // TODO(jelbourn): return locals from view
    // Typecast is necessary for Dart transpilation.
    return <Promise<Map<string, any>>> Promise.resolve(new Map<string, any>());
  }

  /** Detatches the currently attached Portal (if there is one) and attaches the given Portal. */
  private replaceAttachedPortal_(p: Portal<any>): void {
    let maybeDetach = this.hasAttached() ? this.detach() : Promise.resolve(null);

    maybeDetach.then(_ => {
      if (p != null) {
        this.attach(p);
        this.portal_ = p;
      }
    });
  }
}
