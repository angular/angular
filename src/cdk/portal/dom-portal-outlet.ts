/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  ApplicationRef,
  Injector,
} from '@angular/core';
import {BasePortalOutlet, ComponentPortal, TemplatePortal} from './portal';


/**
 * A PortalOutlet for attaching portals to an arbitrary DOM element outside of the Angular
 * application context.
 */
export class DomPortalOutlet extends BasePortalOutlet {
  constructor(
      private _hostDomElement: Element,
      private _componentFactoryResolver: ComponentFactoryResolver,
      private _appRef: ApplicationRef,
      private _defaultInjector: Injector) {
    super();
  }

  /**
   * Attach the given ComponentPortal to DOM element using the ComponentFactoryResolver.
   * @param portal Portal to be attached
   * @returns Reference to the created component.
   */
  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    let componentFactory = this._componentFactoryResolver.resolveComponentFactory(portal.component);
    let componentRef: ComponentRef<T>;

    // If the portal specifies a ViewContainerRef, we will use that as the attachment point
    // for the component (in terms of Angular's component tree, not rendering).
    // When the ViewContainerRef is missing, we use the factory to create the component directly
    // and then manually attach the view to the application.
    if (portal.viewContainerRef) {
      componentRef = portal.viewContainerRef.createComponent(
          componentFactory,
          portal.viewContainerRef.length,
          portal.injector || portal.viewContainerRef.parentInjector);

      this.setDisposeFn(() => componentRef.destroy());
    } else {
      componentRef = componentFactory.create(portal.injector || this._defaultInjector);
      this._appRef.attachView(componentRef.hostView);
      this.setDisposeFn(() => {
        this._appRef.detachView(componentRef.hostView);
        componentRef.destroy();
      });
    }
    // At this point the component has been instantiated, so we move it to the location in the DOM
    // where we want it to be rendered.
    this._hostDomElement.appendChild(this._getComponentRootNode(componentRef));

    return componentRef;
  }

  /**
   * Attaches a template portal to the DOM as an embedded view.
   * @param portal Portal to be attached.
   * @returns Reference to the created embedded view.
   */
  attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
    let viewContainer = portal.viewContainerRef;
    let viewRef = viewContainer.createEmbeddedView(portal.templateRef, portal.context);
    viewRef.detectChanges();

    // The method `createEmbeddedView` will add the view as a child of the viewContainer.
    // But for the DomPortalOutlet the view can be added everywhere in the DOM
    // (e.g Overlay Container) To move the view to the specified host element. We just
    // re-append the existing root nodes.
    viewRef.rootNodes.forEach(rootNode => this._hostDomElement.appendChild(rootNode));

    this.setDisposeFn((() => {
      let index = viewContainer.indexOf(viewRef);
      if (index !== -1) {
        viewContainer.remove(index);
      }
    }));

    // TODO(jelbourn): Return locals from view.
    return viewRef;
  }

  /**
   * Clears out a portal from the DOM.
   */
  dispose(): void {
    super.dispose();
    if (this._hostDomElement.parentNode != null) {
      this._hostDomElement.parentNode.removeChild(this._hostDomElement);
    }
  }

  /** Gets the root HTMLElement for an instantiated component. */
  private _getComponentRootNode(componentRef: ComponentRef<any>): HTMLElement {
    return (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
  }
}
