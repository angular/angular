import {
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  ApplicationRef,
  Injector,
} from '@angular/core';
import {BasePortalHost, ComponentPortal, TemplatePortal} from './portal';


/**
 * A PortalHost for attaching portals to an arbitrary DOM element outside of the Angular
 * application context.
 *
 * This is the only part of the portal core that directly touches the DOM.
 */
export class DomPortalHost extends BasePortalHost {
  constructor(
      private _hostDomElement: Element,
      private _componentFactoryResolver: ComponentFactoryResolver,
      private _appRef: ApplicationRef,
      private _defaultInjector: Injector) {
    super();
  }

  /** Attach the given ComponentPortal to DOM element using the ComponentFactoryResolver. */
  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    let componentFactory = this._componentFactoryResolver.resolveComponentFactory(portal.component);
    let componentRef: ComponentRef<T>;

    // If the portal specifies a ViewContainerRef, we will use that as the attachment point
    // for the component (in terms of Angular's component tree, not rendering).
    // When the ViewContainerRef is missing, we use the factory to create the component directly
    // and then manually attach the ChangeDetector for that component to the application (which
    // happens automatically when using a ViewContainer).
    if (portal.viewContainerRef) {
      componentRef = portal.viewContainerRef.createComponent(
          componentFactory,
          portal.viewContainerRef.length,
          portal.injector || portal.viewContainerRef.parentInjector);

      this.setDisposeFn(() => componentRef.destroy());
    } else {
      componentRef = componentFactory.create(portal.injector || this._defaultInjector);

      // ApplicationRef's attachView and detachView methods are in Angular ^2.2.1 but not before.
      // The `else` clause here can be removed once 2.2.1 is released.
      if ((this._appRef as any)['attachView']) {
        (this._appRef as any).attachView(componentRef.hostView);

        this.setDisposeFn(() => {
          (this._appRef as any).detachView(componentRef.hostView);
          componentRef.destroy();
        });
      } else {
        // When creating a component outside of a ViewContainer, we need to manually register
        // its ChangeDetector with the application. This API is unfortunately not published
        // in Angular <= 2.2.0. The change detector must also be deregistered when the component
        // is destroyed to prevent memory leaks.
        let changeDetectorRef = componentRef.changeDetectorRef;
        (this._appRef as any).registerChangeDetector(changeDetectorRef);

        this.setDisposeFn(() => {
          (this._appRef as any).unregisterChangeDetector(changeDetectorRef);

          // Normally the ViewContainer will remove the component's nodes from the DOM.
          // Without a ViewContainer, we need to manually remove the nodes.
          let componentRootNode = this._getComponentRootNode(componentRef);
          if (componentRootNode.parentNode) {
            componentRootNode.parentNode.removeChild(componentRootNode);
          }

          componentRef.destroy();
        });
      }
    }

    // At this point the component has been instantiated, so we move it to the location in the DOM
    // where we want it to be rendered.
    this._hostDomElement.appendChild(this._getComponentRootNode(componentRef));

    return componentRef;
  }

  attachTemplatePortal(portal: TemplatePortal): Map<string, any> {
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
    return new Map<string, any>();
  }

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
