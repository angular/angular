import {DynamicComponentLoader, AppViewManager, ComponentRef} from 'angular2/core';
import {BasePortalHost, ComponentPortal, TemplatePortal} from './portal';
import {MdComponentPortalAttachedToDomWithoutOriginException} from './portal-exceptions';


/**
 * A PortalHost for attaching portals to an arbitrary DOM element outside of the Angular
 * application context.
 *
 * This is the only part of the portal core that directly touches the DOM.
 */
export class DomPortalHost extends BasePortalHost {
  constructor(
      private _hostDomElement: Element,
      private _componentLoader: DynamicComponentLoader,
      private _viewManager: AppViewManager) {
    super();
  }

  /** Attach the given ComponentPortal to DOM element using the DynamicComponentLoader. */
  attachComponentPortal(portal: ComponentPortal): Promise<ComponentRef> {
    if (portal.origin == null) {
      throw new MdComponentPortalAttachedToDomWithoutOriginException();
    }

    return this._componentLoader.loadNextToLocation(portal.component, portal.origin).then(ref => {
      this._hostDomElement.appendChild(ref.hostView.rootNodes[0]);
      this.setDisposeFn(() => ref.dispose());
      return ref;
    });
  }

  attachTemplatePortal(portal: TemplatePortal): Promise<Map<string, any>> {
    let viewContainer = this._viewManager.getViewContainer(portal.templateRef.elementRef);
    let viewRef = viewContainer.createEmbeddedView(portal.templateRef);
    // TODO(jelbourn): locals don't currently work with DomPortalHost; investigate whether there
    // is a bug in Angular.
    portal.locals.forEach((v, k) => viewRef.setLocal(k, v));

    viewRef.rootNodes.forEach(rootNode => {
      this._hostDomElement.appendChild(rootNode);
    });

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
