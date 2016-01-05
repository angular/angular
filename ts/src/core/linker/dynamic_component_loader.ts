import {Key, Injector, ResolvedProvider, Provider, provide, Injectable} from 'angular2/src/core/di';
import {Compiler} from './compiler';
import {isType, Type, stringify, isPresent} from 'angular2/src/facade/lang';
import {Promise} from 'angular2/src/facade/async';
import {AppViewManager} from 'angular2/src/core/linker/view_manager';
import {ElementRef} from './element_ref';
import {ViewRef, HostViewRef} from './view_ref';

/**
 * Represents an instance of a Component created via {@link DynamicComponentLoader}.
 *
 * `ComponentRef` provides access to the Component Instance as well other objects related to this
 * Component Instance and allows you to destroy the Component Instance via the {@link #dispose}
 * method.
 */
export abstract class ComponentRef {
  /**
   * The injector provided {@link DynamicComponentLoader#loadAsRoot}.
   *
   * TODO(i): this api is useless and should be replaced by an injector retrieved from
   *     the HostElementRef, which is currently not possible.
   */
  injector: Injector;

  /**
   * Location of the Host Element of this Component Instance.
   */
  location: ElementRef;

  /**
   * The instance of the Component.
   */
  instance: any;

  /**
   * The user defined component type, represented via the constructor function.
   *
   * <!-- TODO: customize wording for Dart docs -->
   */
  componentType: Type;

  /**
   * The {@link ViewRef} of the Host View of this Component instance.
   */
  get hostView(): HostViewRef { return this.location.parentView; }

  /**
   * @internal
   *
   * The instance of the component.
   *
   * TODO(i): this api should be removed
   */
  get hostComponent(): any { return this.instance; }

  /**
   * Destroys the component instance and all of the data structures associated with it.
   *
   * TODO(i): rename to destroy to be consistent with AppViewManager and ViewContainerRef
   */
  abstract dispose();
}

export class ComponentRef_ extends ComponentRef {
  /**
   * TODO(i): refactor into public/private fields
   */
  constructor(location: ElementRef, instance: any, componentType: Type, injector: Injector,
              private _dispose: () => void) {
    super();
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
  get hostComponentType(): Type { return this.componentType; }

  dispose() { this._dispose(); }
}

/**
 * Service for instantiating a Component and attaching it to a View at a specified location.
 */
export abstract class DynamicComponentLoader {
  /**
   * Creates an instance of a Component `type` and attaches it to the first element in the
   * platform-specific global view that matches the component's selector.
   *
   * In a browser the platform-specific global view is the main DOM Document.
   *
   * If needed, the component's selector can be overridden via `overrideSelector`.
   *
   * You can optionally provide `injector` and this {@link Injector} will be used to instantiate the
   * Component.
   *
   * To be notified when this Component instance is destroyed, you can also optionally provide
   * `onDispose` callback.
   *
   * Returns a promise for the {@link ComponentRef} representing the newly created Component.
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
  abstract loadAsRoot(type: Type, overrideSelector: string, injector: Injector,
                      onDispose?: () => void): Promise<ComponentRef>;

  /**
   * Creates an instance of a Component and attaches it to a View Container located inside of the
   * Component View of another Component instance.
   *
   * The targeted Component Instance is specified via its `hostLocation` {@link ElementRef}. The
   * location within the Component View of this Component Instance is specified via `anchorName`
   * Template Variable Name.
   *
   * You can optionally provide `providers` to configure the {@link Injector} provisioned for this
   * Component Instance.
   *
   * Returns a promise for the {@link ComponentRef} representing the newly created Component.
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
  abstract loadIntoLocation(type: Type, hostLocation: ElementRef, anchorName: string,
                            providers?: ResolvedProvider[]): Promise<ComponentRef>;

  /**
   * Creates an instance of a Component and attaches it to the View Container found at the
   * `location` specified as {@link ElementRef}.
   *
   * You can optionally provide `providers` to configure the {@link Injector} provisioned for this
   * Component Instance.
   *
   * Returns a promise for the {@link ComponentRef} representing the newly created Component.
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
  abstract loadNextToLocation(type: Type, location: ElementRef,
                              providers?: ResolvedProvider[]): Promise<ComponentRef>;
}

@Injectable()
export class DynamicComponentLoader_ extends DynamicComponentLoader {
  constructor(private _compiler: Compiler, private _viewManager: AppViewManager) { super(); }

  loadAsRoot(type: Type, overrideSelector: string, injector: Injector,
             onDispose?: () => void): Promise<ComponentRef> {
    return this._compiler.compileInHost(type).then(hostProtoViewRef => {
      var hostViewRef =
          this._viewManager.createRootHostView(hostProtoViewRef, overrideSelector, injector);
      var newLocation = this._viewManager.getHostElement(hostViewRef);
      var component = this._viewManager.getComponent(newLocation);

      var dispose = () => {
        if (isPresent(onDispose)) {
          onDispose();
        }
        this._viewManager.destroyRootHostView(hostViewRef);
      };
      return new ComponentRef_(newLocation, component, type, injector, dispose);
    });
  }

  loadIntoLocation(type: Type, hostLocation: ElementRef, anchorName: string,
                   providers: ResolvedProvider[] = null): Promise<ComponentRef> {
    return this.loadNextToLocation(
        type, this._viewManager.getNamedElementInComponentView(hostLocation, anchorName),
        providers);
  }

  loadNextToLocation(type: Type, location: ElementRef,
                     providers: ResolvedProvider[] = null): Promise<ComponentRef> {
    return this._compiler.compileInHost(type).then(hostProtoViewRef => {
      var viewContainer = this._viewManager.getViewContainer(location);
      var hostViewRef =
          viewContainer.createHostView(hostProtoViewRef, viewContainer.length, providers);
      var newLocation = this._viewManager.getHostElement(hostViewRef);
      var component = this._viewManager.getComponent(newLocation);

      var dispose = () => {
        var index = viewContainer.indexOf(<ViewRef>hostViewRef);
        if (index !== -1) {
          viewContainer.remove(index);
        }
      };
      return new ComponentRef_(newLocation, component, type, null, dispose);
    });
  }
}
