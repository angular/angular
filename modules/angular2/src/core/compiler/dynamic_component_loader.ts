import {Key, Injector, ResolvedBinding, Binding, bind, Injectable} from 'angular2/di';
import {Compiler} from './compiler';
import {Type, BaseException, stringify, isPresent} from 'angular2/src/core/facade/lang';
import {Promise} from 'angular2/src/core/facade/async';
import {AppViewManager} from 'angular2/src/core/compiler/view_manager';
import {ElementRef} from './element_ref';
import {ViewRef, HostViewRef} from './view_ref';

/**
 * Angular's reference to a component instance.
 *
 * `ComponentRef` represents a component instance lifecycle and meta information.
 */
export class ComponentRef {
  /**
   * Location of the component host element.
   */
  location: ElementRef;

  /**
   * Instance of component.
   */
  instance: any;

  /**
   * @private
   */
  constructor(location: ElementRef, instance: any, private _dispose: () => void) {
    this.location = location;
    this.instance = instance;
  }

  /**
   * Returns the host {@link ViewRef}.
   */
  get hostView(): HostViewRef { return this.location.parentView; }

  /**
   * Dispose of the component instance.
   */
  dispose() { this._dispose(); }
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
   * - `typeOrBinding` `Type` \ {@link Binding} - representing the component to load.
   * - `overrideSelector` (optional) selector to load the component at (or use
   *   `@Component.selector`) The selector can be anywhere (i.e. outside the current component.)
   * - `injector` {@link Injector} - optional injector to use for the component.
   *
   * The loaded component receives injection normally as a hosted view.
   *
   *
   * ## Example
   *
   * ```
   * @ng.Component({
   *   selector: 'child-component'
   * })
   * @ng.View({
   *   template: 'Child'
   * })
   * class ChildComponent {
   * }
   *
   *
   *
   * @ng.Component({
   *   selector: 'my-app'
   * })
   * @ng.View({
   *   template: `
   *     Parent (<child id="child"></child>)
   *   `
   * })
   * class MyApp {
   *   constructor(dynamicComponentLoader: ng.DynamicComponentLoader, injector: ng.Injector) {
   *     dynamicComponentLoader.loadAsRoot(ChildComponent, '#child', injector);
   *   }
   * }
   *
   * ng.bootstrap(MyApp);
   * ```
   *
   * Resulting DOM:
   *
   * ```
   * <my-app>
   *   Parent (
   *     <child id="child">
   *        Child
   *     </child>
   *   )
   * </my-app>
   * ```
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
   * Loads a component into the component view of the provided ElementRef next to the element
   * with the given name.
   *
   * The loaded component receives injection normally as a hosted view.
   *
   * ## Example
   *
   * ```
   * @ng.Component({
   *   selector: 'child-component'
   * })
   * @ng.View({
   *   template: 'Child'
   * })
   * class ChildComponent {
   * }
   *
   *
   * @ng.Component({
   *   selector: 'my-app'
   * })
   * @ng.View({
   *   template: `
   *     Parent (<div #child></div>)
   *   `
   * })
   * class MyApp {
   *   constructor(dynamicComponentLoader: ng.DynamicComponentLoader, elementRef: ng.ElementRef) {
   *     dynamicComponentLoader.loadIntoLocation(ChildComponent, elementRef, 'child');
   *   }
   * }
   *
   * ng.bootstrap(MyApp);
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
  loadIntoLocation(typeOrBinding: Type | Binding, hostLocation: ElementRef, anchorName: string,
                   bindings: ResolvedBinding[] = null): Promise<ComponentRef> {
    return this.loadNextToLocation(
        typeOrBinding, this._viewManager.getNamedElementInComponentView(hostLocation, anchorName),
        bindings);
  }

  /**
   * Loads a component next to the provided ElementRef.
   *
   * The loaded component receives injection normally as a hosted view.
   *
   *
   * ## Example
   *
   * ```
   * @ng.Component({
   *   selector: 'child-component'
   * })
   * @ng.View({
   *   template: 'Child'
   * })
   * class ChildComponent {
   * }
   *
   *
   * @ng.Component({
   *   selector: 'my-app'
   * })
   * @ng.View({
   *   template: `Parent`
   * })
   * class MyApp {
   *   constructor(dynamicComponentLoader: ng.DynamicComponentLoader, elementRef: ng.ElementRef) {
   *     dynamicComponentLoader.loadIntoLocation(ChildComponent, elementRef, 'child');
   *   }
   * }
   *
   * ng.bootstrap(MyApp);
   * ```
   *
   * Resulting DOM:
   *
   * ```
   * <my-app>Parent</my-app>
   * <child-component>Child</child-component>
   * ```
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
            var index = viewContainer.indexOf(<ViewRef>hostViewRef);
            if (index !== -1) {
              viewContainer.remove(index);
            }
          };
          return new ComponentRef(newLocation, component, dispose);
        });
  }
}
