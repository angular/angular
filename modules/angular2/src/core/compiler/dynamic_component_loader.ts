import {Key, Injector, ResolvedBinding, Binding, bind, Injectable} from 'angular2/di';
import {Compiler} from './compiler';
import {Type, BaseException, stringify, isPresent} from 'angular2/src/facade/lang';
import {Promise} from 'angular2/src/facade/async';
import {AppViewManager} from 'angular2/src/core/compiler/view_manager';
import {ElementRef} from './element_ref';
import {ViewRef} from './view_ref';

/**
 * @exportedAs angular2/view
 */
export class ComponentRef {
  constructor(public location: ElementRef, public instance: any, public dispose: Function) {}

  get hostView(): ViewRef { return this.location.parentView; }
}

/**
 * Service for dynamically loading a Component into an arbitrary position in the internal Angular
 * application tree.
 *
 * @exportedAs angular2/view
 */
@Injectable()
export class DynamicComponentLoader {
  constructor(private _compiler: Compiler, private _viewManager: AppViewManager) {}

  /**
   * Loads a component into the location given by the provided ElementRef. The loaded component
   * receives injection as if it in the place of the provided ElementRef.
   */
  loadIntoExistingLocation(typeOrBinding, location: ElementRef,
                           injector: Injector = null): Promise<ComponentRef> {
    var binding = this._getBinding(typeOrBinding);
    return this._compiler.compile(binding.token)
        .then(componentProtoViewRef => {
          this._viewManager.createDynamicComponentView(location, componentProtoViewRef, binding,
                                                       injector);
          var component = this._viewManager.getComponent(location);
          var dispose = () => { this._viewManager.destroyDynamicComponent(location); };
          return new ComponentRef(location, component, dispose);
        });
  }

  /**
   * Loads a root component that is placed at the first element that matches the
   * component's selector.
   * The loaded component receives injection normally as a hosted view.
   */
  loadAsRoot(typeOrBinding, overrideSelector: string = null,
             injector: Injector = null): Promise<ComponentRef> {
    return this._compiler.compileInHost(this._getBinding(typeOrBinding))
        .then(hostProtoViewRef => {
          var hostViewRef =
              this._viewManager.createRootHostView(hostProtoViewRef, overrideSelector, injector);
          var newLocation = new ElementRef(hostViewRef, 0);
          var component = this._viewManager.getComponent(newLocation);

          var dispose = () => { this._viewManager.destroyRootHostView(hostViewRef); };
          return new ComponentRef(newLocation, component, dispose);
        });
  }

  /**
   * Loads a component into a free host view that is not yet attached to
   * a parent on the render side, although it is attached to a parent in the injector hierarchy.
   * The loaded component receives injection normally as a hosted view.
   */
  loadIntoNewLocation(typeOrBinding, parentComponentLocation: ElementRef,
                      injector: Injector = null): Promise<ComponentRef> {
    return this._compiler.compileInHost(this._getBinding(typeOrBinding))
        .then(hostProtoViewRef => {
          var hostViewRef = this._viewManager.createFreeHostView(parentComponentLocation,
                                                                 hostProtoViewRef, injector);
          var newLocation = new ElementRef(hostViewRef, 0);
          var component = this._viewManager.getComponent(newLocation);

          var dispose = () => {
            this._viewManager.destroyFreeHostView(parentComponentLocation, hostViewRef);
          };
          return new ComponentRef(newLocation, component, dispose);
        });
  }

  /**
   * Loads a component next to the provided ElementRef. The loaded component receives
   * injection normally as a hosted view.
   */
  loadNextToExistingLocation(typeOrBinding, location: ElementRef,
                             injector: Injector = null): Promise<ComponentRef> {
    var binding = this._getBinding(typeOrBinding);
    return this._compiler.compileInHost(binding).then(hostProtoViewRef => {
      var viewContainer = this._viewManager.getViewContainer(location);
      var hostViewRef =
          viewContainer.create(hostProtoViewRef, viewContainer.length, null, injector);
      var newLocation = new ElementRef(hostViewRef, 0);
      var component = this._viewManager.getComponent(newLocation);

      var dispose = () => {
        var index = viewContainer.indexOf(hostViewRef);
        viewContainer.remove(index);
      };
      return new ComponentRef(newLocation, component, dispose);
    });
  }

  private _getBinding(typeOrBinding): Binding {
    var binding;
    if (typeOrBinding instanceof Binding) {
      binding = typeOrBinding;
    } else {
      binding = bind(typeOrBinding).toClass(typeOrBinding);
    }
    return binding;
  }
}
