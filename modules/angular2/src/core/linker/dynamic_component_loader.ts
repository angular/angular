import {Key, Injector, ResolvedProvider, Provider, provide, Injectable} from 'angular2/src/core/di';
import {ComponentResolver} from './component_resolver';
import {isType, Type, stringify, isPresent} from 'angular2/src/facade/lang';
import {AppViewManager} from 'angular2/src/core/linker/view_manager';
import {ElementRef, ElementRef_} from './element_ref';
import {ComponentRef} from './component_factory';

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
  abstract loadAsRoot(type: Type, overrideSelectorOrNode: string | any, injector: Injector,
                      onDispose?: () => void, projectableNodes?: any[][]): Promise<ComponentRef>;

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
                            providers?: ResolvedProvider[],
                            projectableNodes?: any[][]): Promise<ComponentRef>;

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
  abstract loadNextToLocation(type: Type, location: ElementRef, providers?: ResolvedProvider[],
                              projectableNodes?: any[][]): Promise<ComponentRef>;
}

@Injectable()
export class DynamicComponentLoader_ extends DynamicComponentLoader {
  constructor(private _compiler: ComponentResolver, private _viewManager: AppViewManager) {
    super();
  }

  loadAsRoot(type: Type, overrideSelectorOrNode: string | any, injector: Injector,
             onDispose?: () => void, projectableNodes?: any[][]): Promise<ComponentRef> {
    return this._compiler.resolveComponent(type).then(componentFactory => {
      var componentRef = componentFactory.create(
          injector, projectableNodes,
          isPresent(overrideSelectorOrNode) ? overrideSelectorOrNode : componentFactory.selector);
      if (isPresent(onDispose)) {
        componentRef.onDestroy(onDispose);
      }
      return componentRef;
    });
  }

  loadIntoLocation(type: Type, hostLocation: ElementRef, anchorName: string,
                   providers: ResolvedProvider[] = null,
                   projectableNodes: any[][] = null): Promise<ComponentRef> {
    return this.loadNextToLocation(
        type, this._viewManager.getNamedElementInComponentView(hostLocation, anchorName), providers,
        projectableNodes);
  }

  loadNextToLocation(type: Type, location: ElementRef, providers: ResolvedProvider[] = null,
                     projectableNodes: any[][] = null): Promise<ComponentRef> {
    return this._compiler.resolveComponent(type).then(componentFactory => {
      var viewContainer = this._viewManager.getViewContainer(location);
      return viewContainer.createComponent(componentFactory, viewContainer.length, providers,
                                           projectableNodes);
    });
  }
}
