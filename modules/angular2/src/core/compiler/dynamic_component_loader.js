import {Key, Injector, Injectable, ResolvedBinding, Binding, bind} from 'angular2/di'
import {Compiler} from './compiler';
import {Type, BaseException, stringify, isPresent} from 'angular2/src/facade/lang';
import {Promise} from 'angular2/src/facade/async';
import {AppViewManager, ComponentCreateResult} from 'angular2/src/core/compiler/view_manager';
import {ElementRef} from './element_ref';

/**
 * @exportedAs angular2/view
 */
export class ComponentRef {
  location:ElementRef;
  instance:any;
  _dispose:Function;

  constructor(location:ElementRef, instance:any, dispose:Function) {
    this.location = location;
    this.instance = instance;
    this._dispose = dispose;
  }

  get hostView() {
    return this.location.parentView;
  }

  dispose() {
    this._dispose();
  }
}

/**
 * Service for dynamically loading a Component into an arbitrary position in the internal Angular
 * application tree.
 *
 * @exportedAs angular2/view
 */
@Injectable()
export class DynamicComponentLoader {
  _compiler:Compiler;
  _viewManager:AppViewManager;

  constructor(compiler:Compiler,
              viewManager: AppViewManager) {
    this._compiler = compiler;
    this._viewManager = viewManager;
  }

  /**
   * Loads a component into the location given by the provided ElementRef. The loaded component
   * receives injection as if it in the place of the provided ElementRef.
   */
  loadIntoExistingLocation(typeOrBinding, location:ElementRef, injector:Injector = null):Promise<ComponentRef> {
    var binding = this._getBinding(typeOrBinding);
    return this._compiler.compile(binding.token).then(componentProtoViewRef => {
      this._viewManager.createDynamicComponentView(
        location, componentProtoViewRef, binding, injector);
      var component = this._viewManager.getComponent(location);
      var dispose = () => {throw new BaseException("Not implemented");};
      return new ComponentRef(location, component, dispose);
    });
  }

  /**
   * Loads a component in the element specified by elementOrSelector. The loaded component receives
   * injection normally as a hosted view.
   */
  loadIntoNewLocation(typeOrBinding, parentComponentLocation:ElementRef, elementOrSelector:any,
                      injector:Injector = null):Promise<ComponentRef> {
    return  this._compiler.compileInHost(this._getBinding(typeOrBinding)).then(hostProtoViewRef => {
      var hostViewRef = this._viewManager.createInPlaceHostView(
        parentComponentLocation, elementOrSelector, hostProtoViewRef, injector);
      var newLocation = new ElementRef(hostViewRef, 0);
      var component = this._viewManager.getComponent(newLocation);

      var dispose = () => {
        this._viewManager.destroyInPlaceHostView(parentComponentLocation, hostViewRef);
      };
      return new ComponentRef(newLocation, component, dispose);
    });
  }

  /**
   * Loads a component next to the provided ElementRef. The loaded component receives
   * injection normally as a hosted view.
   */
  loadNextToExistingLocation(typeOrBinding, location:ElementRef, injector:Injector = null):Promise<ComponentRef> {
    var binding = this._getBinding(typeOrBinding);
    return this._compiler.compileInHost(binding).then(hostProtoViewRef => {
      var viewContainer = this._viewManager.getViewContainer(location);
      var hostViewRef = viewContainer.create(hostProtoViewRef, viewContainer.length, injector);
      var newLocation = new ElementRef(hostViewRef, 0);
      var component = this._viewManager.getComponent(newLocation);

      var dispose = () => {
        var index = viewContainer.indexOf(hostViewRef);
        viewContainer.remove(index);
      };
      return new ComponentRef(newLocation, component, dispose);
    });
  }

  _getBinding(typeOrBinding) {
    var binding;
    if (typeOrBinding instanceof Binding) {
      binding = typeOrBinding;
    } else {
      binding = bind(typeOrBinding).toClass(typeOrBinding);
    }
    return binding;
  }

}
