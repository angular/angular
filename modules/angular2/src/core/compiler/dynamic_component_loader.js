import {Key, Injector, Injectable, ResolvedBinding, Binding, bind} from 'angular2/di'
import {Compiler} from './compiler';
import {Type, BaseException, stringify, isPresent} from 'angular2/src/facade/lang';
import {Promise} from 'angular2/src/facade/async';
import {AppViewManager} from 'angular2/src/core/compiler/view_manager';
import {ElementRef} from './element_injector';
import {AppView} from './view';

/**
 * @exportedAs angular2/view
 */
export class ComponentRef {
  location:ElementRef;
  instance:any;
  componentView:AppView;
  _dispose:Function;

  constructor(location:ElementRef, instance:any, componentView:AppView, dispose:Function){
    this.location = location;
    this.instance = instance;
    this.componentView = componentView;
    this._dispose = dispose;
  }

  get injector() {
    return this.location.injector;
  }

  get hostView() {
    return this.location.hostView;
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
    return this._compiler.compile(binding.token).then(componentProtoView => {
      var componentView = this._viewManager.createDynamicComponentView(
        location, componentProtoView, binding, injector);

      var dispose = () => {throw new BaseException("Not implemented");};
      return new ComponentRef(location, location.elementInjector.getDynamicallyLoadedComponent(), componentView, dispose);
    });
  }

  /**
   * Loads a component in the element specified by elementOrSelector. The loaded component receives
   * injection normally as a hosted view.
   */
  loadIntoNewLocation(typeOrBinding, parentComponentLocation:ElementRef, elementOrSelector:any,
                      injector:Injector = null):Promise<ComponentRef> {
    return  this._compiler.compileInHost(this._getBinding(typeOrBinding)).then(hostProtoView => {
      var hostView = this._viewManager.createInPlaceHostView(
        parentComponentLocation, elementOrSelector, hostProtoView, injector);

      var newLocation = hostView.elementInjectors[0].getElementRef();
      var component = hostView.elementInjectors[0].getComponent();
      var dispose = () => {
        this._viewManager.destroyInPlaceHostView(parentComponentLocation, hostView);
      };
      return new ComponentRef(newLocation, component, hostView.componentChildViews[0], dispose);
    });
  }

  /**
   * Loads a component next to the provided ElementRef. The loaded component receives
   * injection normally as a hosted view.
   */
  loadNextToExistingLocation(typeOrBinding, location:ElementRef, injector:Injector = null):Promise<ComponentRef> {
    var binding = this._getBinding(typeOrBinding);
    return this._compiler.compileInHost(binding).then(hostProtoView => {
      var hostView = location.viewContainer.create(-1, hostProtoView, injector);

      var newLocation = hostView.elementInjectors[0].getElementRef();
      var component = hostView.elementInjectors[0].getComponent();
      var dispose = () => {
        var index = location.viewContainer.indexOf(hostView);
        location.viewContainer.remove(index);
      };
      return new ComponentRef(newLocation, component, hostView.componentChildViews[0], dispose);
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
