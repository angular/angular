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
import {BasePortalOutlet, ComponentPortal, TemplatePortal, DomPortal} from './portal';


/**
 * A PortalOutlet for attaching portals to an arbitrary DOM element outside of the Angular
 * application context.
 */
export class DomPortalOutlet extends BasePortalOutlet {
  private _document: Document;

  constructor(
      /** Element into which the content is projected. */
      public outletElement: Element,
      private _componentFactoryResolver: ComponentFactoryResolver,
      private _appRef: ApplicationRef,
      private _defaultInjector: Injector,

      /**
       * @deprecated `_document` Parameter to be made required.
       * @breaking-change 10.0.0
       */
      _document?: any) {
    super();
    this._document = _document;
  }

  /**
   * Attach the given ComponentPortal to DOM element using the ComponentFactoryResolver.
   * @param portal Portal to be attached
   * @returns Reference to the created component.
   */
  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    const resolver = portal.componentFactoryResolver || this._componentFactoryResolver;
    const componentFactory = resolver.resolveComponentFactory(portal.component);
    let componentRef: ComponentRef<T>;

    // If the portal specifies a ViewContainerRef, we will use that as the attachment point
    // for the component (in terms of Angular's component tree, not rendering).
    // When the ViewContainerRef is missing, we use the factory to create the component directly
    // and then manually attach the view to the application.
    if (portal.viewContainerRef) {
      componentRef = portal.viewContainerRef.createComponent(
          componentFactory,
          portal.viewContainerRef.length,
          portal.injector || portal.viewContainerRef.injector);

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
    this.outletElement.appendChild(this._getComponentRootNode(componentRef));

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
    viewRef.rootNodes.forEach(rootNode => this.outletElement.appendChild(rootNode));

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
   * Attaches a DOM portal by transferring its content into the outlet.
   * @param portal Portal to be attached.
   * @deprecated To be turned into a method.
   * @breaking-change 10.0.0
   */
  attachDomPortal = (portal: DomPortal) => {
    // @breaking-change 10.0.0 Remove check and error once the
    // `_document` constructor parameter is required.
    if (!this._document) {
      throw Error('Cannot attach DOM portal without _document constructor parameter');
    }

    // Anchor used to save the element's previous position so
    // that we can restore it when the portal is detached.
    let anchorNode = this._document.createComment('dom-portal');
    let element = portal.element;

    element.parentNode!.insertBefore(anchorNode, element);
    this.outletElement.appendChild(element);

    super.setDisposeFn(() => {
      // We can't use `replaceWith` here because IE doesn't support it.
      anchorNode.parentNode!.replaceChild(element, anchorNode);
    });
  }

  /**
   * Clears out a portal from the DOM.
   */
  dispose(): void {
    super.dispose();
    if (this.outletElement.parentNode != null) {
      this.outletElement.parentNode.removeChild(this.outletElement);
    }
  }

  /** Gets the root HTMLElement for an instantiated component. */
  private _getComponentRootNode(componentRef: ComponentRef<any>): HTMLElement {
    return (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
  }
}

/**
 * @deprecated Use `DomPortalOutlet` instead.
 * @breaking-change 9.0.0
 */
export class DomPortalHost extends DomPortalOutlet {}
