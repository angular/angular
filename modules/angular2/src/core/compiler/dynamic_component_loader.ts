import {Key, Injector, ResolvedBinding, Binding, bind, Injectable} from 'angular2/di';
import {Compiler} from './compiler';
import {Type, BaseException, stringify, isPresent} from 'angular2/src/facade/lang';
import {Promise} from 'angular2/src/facade/async';
import {AppViewManager} from 'angular2/src/core/compiler/view_manager';
import {ElementRef} from './element_ref';
import {ViewRef} from './view_ref';

export class ComponentRef {
  constructor(public location: ElementRef, public instance: any, public dispose: Function) {}

  get hostView(): ViewRef { return this.location.parentView; }
}

/**
 * Service for dynamically loading a Component into an arbitrary position in the internal Angular
 * application tree.
 */
@Injectable()
export class DynamicComponentLoader {
  constructor(private _compiler: Compiler, private _viewManager: AppViewManager) {}

  /**
   * Loads a root component that is placed at the first element that matches the component's
   * selector.
   *
   * The loaded component receives injection normally as a hosted view.
   */
  loadAsRoot(typeOrBinding: Type | Binding, overrideSelector: string,
             injector: Injector): Promise<ComponentRef> {
    return this._compiler.compileInHost(typeOrBinding)
        .then(hostProtoViewRef => {
          var hostViewRef =
              this._viewManager.createRootHostView(hostProtoViewRef, overrideSelector, injector);
          var newLocation = this._viewManager.getHostElement(hostViewRef);
          var component = this._viewManager.getComponent(newLocation);

          var dispose = () => { this._viewManager.destroyRootHostView(hostViewRef); };
          return new ComponentRef(newLocation, component, dispose);
        });
  }

  /**
   * Loads a component into the component view of the provided ElementRef
   * next to the element with the given name
   * The loaded component receives
   * injection normally as a hosted view.
   */
  loadIntoLocation(typeOrBinding: Type | Binding, hostLocation: ElementRef, anchorName: string,
                   bindings: ResolvedBinding[] = null): Promise<ComponentRef> {
    return this.loadNextToLocation(
        typeOrBinding, this._viewManager.getNamedElementInComponentView(hostLocation, anchorName),
        bindings);
  }

  /**
   * Loads a component next to the provided ElementRef. The loaded component receives
   * injection normally as a hosted view.
   */
  loadNextToLocation(typeOrBinding: Type | Binding, location: ElementRef,
                     bindings: ResolvedBinding[] = null): Promise<ComponentRef> {
    return this._compiler.compileInHost(typeOrBinding)
        .then(hostProtoViewRef => {
          var viewContainer = this._viewManager.getViewContainer(location);
          var hostViewRef =
              viewContainer.createHostView(hostProtoViewRef, viewContainer.length, bindings);
          var newLocation = this._viewManager.getHostElement(hostViewRef);
          var component = this._viewManager.getComponent(newLocation);

          var dispose = () => {
            var index = viewContainer.indexOf(hostViewRef);
            if (index !== -1) {
              viewContainer.remove(index);
            }
          };
          return new ComponentRef(newLocation, component, dispose);
        });
  }
}
