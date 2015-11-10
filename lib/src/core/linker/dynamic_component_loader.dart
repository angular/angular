library angular2.src.core.linker.dynamic_component_loader;

import "package:angular2/src/core/di.dart"
    show Key, Injector, ResolvedProvider, Provider, provide, Injectable;
import "compiler.dart" show Compiler;
import "package:angular2/src/facade/lang.dart"
    show isType, Type, stringify, isPresent;
import "package:angular2/src/facade/async.dart" show Future;
import "package:angular2/src/core/linker/view_manager.dart" show AppViewManager;
import "element_ref.dart" show ElementRef;
import "view_ref.dart" show ViewRef, HostViewRef;

/**
 * Represents an instance of a Component created via [DynamicComponentLoader].
 *
 * `ComponentRef` provides access to the Component Instance as well other objects related to this
 * Component Instance and allows you to destroy the Component Instance via the [#dispose]
 * method.
 */
abstract class ComponentRef {
  /**
   * The injector provided [DynamicComponentLoader#loadAsRoot].
   *
   * TODO(i): this api is useless and should be replaced by an injector retrieved from
   *     the HostElementRef, which is currently not possible.
   */
  Injector injector;
  /**
   * Location of the Host Element of this Component Instance.
   */
  ElementRef location;
  /**
   * The instance of the Component.
   */
  dynamic instance;
  /**
   * The user defined component type, represented via the constructor function.
   *
   * <!-- TODO: customize wording for Dart docs -->
   */
  Type componentType;
  /**
   * The [ViewRef] of the Host View of this Component instance.
   */
  HostViewRef get hostView {
    return this.location.parentView;
  }

  /**
   * @internal
   *
   * The instance of the component.
   *
   * TODO(i): this api should be removed
   */
  dynamic get hostComponent {
    return this.instance;
  }

  /**
   * Destroys the component instance and all of the data structures associated with it.
   *
   * TODO(i): rename to destroy to be consistent with AppViewManager and ViewContainerRef
   */
  dispose();
}

class ComponentRef_ extends ComponentRef {
  dynamic /* () => void */ _dispose;
  /**
   * TODO(i): refactor into public/private fields
   */
  ComponentRef_(ElementRef location, dynamic instance, Type componentType,
      Injector injector, this._dispose)
      : super() {
    /* super call moved to initializer */;
    this.location = location;
    this.instance = instance;
    this.componentType = componentType;
    this.injector = injector;
  }
  /**
   * @internal
   *
   * Returns the type of this Component instance.
   *
   * TODO(i): this api should be removed
   */
  Type get hostComponentType {
    return this.componentType;
  }

  dispose() {
    this._dispose();
  }
}

/**
 * Service for instantiating a Component and attaching it to a View at a specified location.
 */
abstract class DynamicComponentLoader {
  /**
   * Creates an instance of a Component `type` and attaches it to the first element in the
   * platform-specific global view that matches the component's selector.
   *
   * In a browser the platform-specific global view is the main DOM Document.
   *
   * If needed, the component's selector can be overridden via `overrideSelector`.
   *
   * You can optionally provide `injector` and this [Injector] will be used to instantiate the
   * Component.
   *
   * To be notified when this Component instance is destroyed, you can also optionally provide
   * `onDispose` callback.
   *
   * Returns a promise for the [ComponentRef] representing the newly created Component.
   *
   * ### Example
   *
   * ```
   * @Component({
   *   selector: 'child-component',
   *   template: 'Child'
   * })
   * class ChildComponent {
   * }
   *
   * @Component({
   *   selector: 'my-app',
   *   template: 'Parent (<child id="child"></child>)'
   * })
   * class MyApp {
   *   constructor(dcl: DynamicComponentLoader, injector: Injector) {
   *     dcl.loadAsRoot(ChildComponent, '#child', injector);
   *   }
   * }
   *
   * bootstrap(MyApp);
   * ```
   *
   * Resulting DOM:
   *
   * ```
   * <my-app>
   *   Parent (
   *     <child id="child">Child</child>
   *   )
   * </my-app>
   * ```
   */
  Future<ComponentRef> loadAsRoot(
      Type type, String overrideSelector, Injector injector,
      [dynamic /* () => void */ onDispose]);
  /**
   * Creates an instance of a Component and attaches it to a View Container located inside of the
   * Component View of another Component instance.
   *
   * The targeted Component Instance is specified via its `hostLocation` [ElementRef]. The
   * location within the Component View of this Component Instance is specified via `anchorName`
   * Template Variable Name.
   *
   * You can optionally provide `providers` to configure the [Injector] provisioned for this
   * Component Instance.
   *
   * Returns a promise for the [ComponentRef] representing the newly created Component.
   *
   * ### Example
   *
   * ```
   * @Component({
   *   selector: 'child-component',
   *   template: 'Child'
   * })
   * class ChildComponent {
   * }
   *
   * @Component({
   *   selector: 'my-app',
   *   template: 'Parent (<div #child></div>)'
   * })
   * class MyApp {
   *   constructor(dcl: DynamicComponentLoader, elementRef: ElementRef) {
   *     dcl.loadIntoLocation(ChildComponent, elementRef, 'child');
   *   }
   * }
   *
   * bootstrap(MyApp);
   * ```
   *
   * Resulting DOM:
   *
   * ```
   * <my-app>
   *    Parent (
   *      <div #child="" class="ng-binding"></div>
   *      <child-component class="ng-binding">Child</child-component>
   *    )
   * </my-app>
   * ```
   */
  Future<ComponentRef> loadIntoLocation(
      Type type, ElementRef hostLocation, String anchorName,
      [List<ResolvedProvider> providers]);
  /**
   * Creates an instance of a Component and attaches it to the View Container found at the
   * `location` specified as [ElementRef].
   *
   * You can optionally provide `providers` to configure the [Injector] provisioned for this
   * Component Instance.
   *
   * Returns a promise for the [ComponentRef] representing the newly created Component.
   *
   *
   * ### Example
   *
   * ```
   * @Component({
   *   selector: 'child-component',
   *   template: 'Child'
   * })
   * class ChildComponent {
   * }
   *
   * @Component({
   *   selector: 'my-app',
   *   template: 'Parent'
   * })
   * class MyApp {
   *   constructor(dcl: DynamicComponentLoader, elementRef: ElementRef) {
   *     dcl.loadNextToLocation(ChildComponent, elementRef);
   *   }
   * }
   *
   * bootstrap(MyApp);
   * ```
   *
   * Resulting DOM:
   *
   * ```
   * <my-app>Parent</my-app>
   * <child-component>Child</child-component>
   * ```
   */
  Future<ComponentRef> loadNextToLocation(Type type, ElementRef location,
      [List<ResolvedProvider> providers]);
}

@Injectable()
class DynamicComponentLoader_ extends DynamicComponentLoader {
  Compiler _compiler;
  AppViewManager _viewManager;
  DynamicComponentLoader_(this._compiler, this._viewManager) : super() {
    /* super call moved to initializer */;
  }
  Future<ComponentRef> loadAsRoot(
      Type type, String overrideSelector, Injector injector,
      [dynamic /* () => void */ onDispose]) {
    return this._compiler.compileInHost(type).then((hostProtoViewRef) {
      var hostViewRef = this
          ._viewManager
          .createRootHostView(hostProtoViewRef, overrideSelector, injector);
      var newLocation = this._viewManager.getHostElement(hostViewRef);
      var component = this._viewManager.getComponent(newLocation);
      var dispose = () {
        this._viewManager.destroyRootHostView(hostViewRef);
        if (isPresent(onDispose)) {
          onDispose();
        }
      };
      return new ComponentRef_(newLocation, component, type, injector, dispose);
    });
  }

  Future<ComponentRef> loadIntoLocation(
      Type type, ElementRef hostLocation, String anchorName,
      [List<ResolvedProvider> providers = null]) {
    return this.loadNextToLocation(
        type,
        this
            ._viewManager
            .getNamedElementInComponentView(hostLocation, anchorName),
        providers);
  }

  Future<ComponentRef> loadNextToLocation(Type type, ElementRef location,
      [List<ResolvedProvider> providers = null]) {
    return this._compiler.compileInHost(type).then((hostProtoViewRef) {
      var viewContainer = this._viewManager.getViewContainer(location);
      var hostViewRef = viewContainer.createHostView(
          hostProtoViewRef, viewContainer.length, providers);
      var newLocation = this._viewManager.getHostElement(hostViewRef);
      var component = this._viewManager.getComponent(newLocation);
      var dispose = () {
        var index = viewContainer.indexOf((hostViewRef as ViewRef));
        if (!identical(index, -1)) {
          viewContainer.remove(index);
        }
      };
      return new ComponentRef_(newLocation, component, type, null, dispose);
    });
  }
}
