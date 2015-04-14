import {Key, Injector, Injectable, ResolvedBinding} from 'angular2/di'
import {Compiler} from './compiler';
import {DirectiveMetadataReader} from './directive_metadata_reader';
import {Type, BaseException, stringify, isPresent} from 'angular2/src/facade/lang';
import {List} from 'angular2/src/facade/collection';
import {Promise} from 'angular2/src/facade/async';
import {Component} from 'angular2/src/core/annotations/annotations';
import {ViewFactory} from 'angular2/src/core/compiler/view_factory';
import {Renderer} from 'angular2/src/render/api';
import {ElementRef} from './element_injector';
import {AppView} from './view';

/**
 * @exportedAs angular2/view
 */
export class ComponentRef {
  location:ElementRef;
  instance:any;
  componentView:AppView;

  constructor(location:ElementRef, instance:any, componentView:AppView){
    this.location = location;
    this.instance = instance;
    this.componentView = componentView;
  }

  get injector() {
    return this.location.injector;
  }

  get hostView() {
    return this.location.hostView;
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
  _viewFactory:ViewFactory;
  _renderer:Renderer;
  _directiveMetadataReader:DirectiveMetadataReader;

  constructor(compiler:Compiler, directiveMetadataReader:DirectiveMetadataReader,
              renderer:Renderer, viewFactory:ViewFactory) {
    this._compiler = compiler;
    this._directiveMetadataReader = directiveMetadataReader;
    this._renderer = renderer;
    this._viewFactory = viewFactory
  }

  /**
   * Loads a component into the location given by the provided ElementRef. The loaded component
   * receives injection as if it in the place of the provided ElementRef.
   */
  loadIntoExistingLocation(type:Type, location:ElementRef, injector:Injector = null):Promise<ComponentRef> {
    this._assertTypeIsComponent(type);

    var directiveMetadata = this._directiveMetadataReader.read(type);

    var inj = this._componentAppInjector(location, injector, directiveMetadata.resolvedInjectables);

    var hostEi = location.elementInjector;
    var hostView = location.hostView;

    return this._compiler.compile(type).then(componentProtoView => {
      var component = hostEi.dynamicallyCreateComponent(type, directiveMetadata.annotation, inj);
      var componentView = this._instantiateAndHydrateView(componentProtoView, injector, hostEi, component);

      //TODO(vsavkin): do not use component child views as we need to clear the dynamically created views
      //same problem exists on the render side
      hostView.addComponentChildView(componentView);

      this._renderer.setDynamicComponentView(hostView.render, location.boundElementIndex, componentView.render);

      // TODO(vsavkin): return a component ref that dehydrates the component view and removes it
      // from the component child views
      return new ComponentRef(location, component, componentView);
    });
  }

  /**
   * Loads a component as a child of the View given by the provided ElementRef. The loaded
   * component receives injection normally as a hosted view.
   *
   * TODO(vsavkin, jelbourn): remove protoViewFactory after render layer exists.
   */
  loadIntoNewLocation(elementOrSelector:any, type:Type, location:ElementRef,
                      injector:Injector = null):Promise<ComponentRef> {
    this._assertTypeIsComponent(type);

    var inj = this._componentAppInjector(location, injector, null);

    //TODO(tbosch) this should always be a selector
    return  this._compiler.compileRoot(elementOrSelector, type).then(pv => {
      var hostView = this._instantiateAndHydrateView(pv, inj, null, new Object());

      // TODO(vsavkin): return a component ref that dehydrates the host view
      var newLocation = new ElementRef(hostView.elementInjectors[0]);
      var component = hostView.elementInjectors[0].getComponent();
      return new ComponentRef(newLocation, component, hostView.componentChildViews[0]);
    });
  }

  _componentAppInjector(location, injector:Injector, resolvedBindings:List<ResolvedBinding>) {
    var inj = isPresent(injector) ? injector : location.injector;
    return isPresent(resolvedBindings) ? inj.createChildFromResolved(resolvedBindings) : inj;
  }

  _instantiateAndHydrateView(protoView, injector, hostElementInjector, context) {
    var componentView = this._viewFactory.getView(protoView);
    componentView.hydrate(injector, hostElementInjector, context, null);
    return componentView;
  }

  /** Asserts that the type being dynamically instantiated is a Component. */
  _assertTypeIsComponent(type:Type) {
    var annotation = this._directiveMetadataReader.read(type).annotation;
    if (!(annotation instanceof Component)) {
      throw new BaseException(`Could not load '${stringify(type)}' because it is not a component.`);
    }
  }
}
