import {ComponentResolver, ComponentRef, EmbeddedViewRef} from '@angular/core';
import {BasePortalHost, ComponentPortal, TemplatePortal} from './portal';
import {MdComponentPortalAttachedToDomWithoutOriginError} from './portal-errors';


/**
 * A PortalHost for attaching portals to an arbitrary DOM element outside of the Angular
 * application context.
 *
 * This is the only part of the portal core that directly touches the DOM.
 */
export class DomPortalHost extends BasePortalHost {
  constructor(
      private _hostDomElement: Element,
      private _componentResolver: ComponentResolver) {
    super();
  }

  /** Attach the given ComponentPortal to DOM element using the ComponentResolver. */
  attachComponentPortal(portal: ComponentPortal): Promise<ComponentRef<any>> {
    if (portal.viewContainerRef == null) {
      throw new MdComponentPortalAttachedToDomWithoutOriginError();
    }

    return this._componentResolver.resolveComponent(portal.component).then(componentFactory => {
      let ref = portal.viewContainerRef.createComponent(
          componentFactory, portal.viewContainerRef.length, portal.viewContainerRef.parentInjector);

      let hostView = <EmbeddedViewRef<any>> ref.hostView;
      this._hostDomElement.appendChild(hostView.rootNodes[0]);
      this.setDisposeFn(() => ref.destroy());
      return ref;
    });
  }

  attachTemplatePortal(portal: TemplatePortal): Promise<Map<string, any>> {
    let viewContainer = portal.viewContainerRef;
    let viewRef = viewContainer.createEmbeddedView(portal.templateRef);

    viewRef.rootNodes.forEach(rootNode => this._hostDomElement.appendChild(rootNode));

    this.setDisposeFn((() => {
      let index = viewContainer.indexOf(viewRef);
      if (index != -1) {
        viewContainer.remove(index);
      }
    }));

    // TODO(jelbourn): Return locals from view.
    return Promise.resolve(new Map<string, any>());
  }

  dispose(): void {
    super.dispose();
    if (this._hostDomElement.parentNode != null) {
      this._hostDomElement.parentNode.removeChild(this._hostDomElement);
    }
  }
}
