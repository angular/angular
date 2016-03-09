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
  private _portal: Portal<any>;

  constructor(
      private _dynamicComponentLoader: DynamicComponentLoader,
      private _elementRef: ElementRef,
      private _viewContainerRef: ViewContainerRef) {
    super();
  }

  get portal(): Portal<any> {
    return this._portal;
  }

  set portal(p: Portal<any>) {
    this._replaceAttachedPortal(p);
  }

  /** Attach the given ComponentPortal to this PortlHost using the DynamicComponentLoader. */
  attachComponentPortal(portal: ComponentPortal): Promise<ComponentRef> {
    portal.setAttachedHost(this);

    // If the portal specifies an origin, use that as the logical location of the component
    // in the application tree. Otherwise use the location of this PortalHost.
    let elementRef = portal.origin != null ? portal.origin : this._elementRef;

    // Typecast is necessary for Dart transpilation.
    return <Promise<ComponentRef>>
        this._dynamicComponentLoader.loadNextToLocation(portal.component, elementRef)
        .then(ref => {
          this.setDisposeFn(() => ref.dispose());
          return ref;
        });
  }

  /** Attach the given TemplatePortal to this PortlHost as an embedded View. */
  attachTemplatePortal(portal: TemplatePortal): Promise<Map<string, any>> {
    portal.setAttachedHost(this);

    let viewRef = this._viewContainerRef.createEmbeddedView(portal.templateRef);
    portal.locals.forEach((v, k) => viewRef.setLocal(k, v));
    this.setDisposeFn(() => this._viewContainerRef.clear());

    // TODO(jelbourn): return locals from view
    // Typecast is necessary for Dart transpilation.
    return <Promise<Map<string, any>>> Promise.resolve(new Map<string, any>());
  }

  /** Detatches the currently attached Portal (if there is one) and attaches the given Portal. */
  private _replaceAttachedPortal(p: Portal<any>): void {
    let maybeDetach = this.hasAttached() ? this.detach() : Promise.resolve(null);

    maybeDetach.then(_ => {
      if (p != null) {
        this.attach(p);
        this._portal = p;
      }
    });
  }
}
