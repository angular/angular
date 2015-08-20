import {ComponentRef} from 'angular2/src/core/compiler/dynamic_component_loader';
import {Injector} from 'angular2/di';
import {Type} from 'angular2/src/core/facade/lang';
/**
 * Represents a Angular's representation of an Application.
 *
 * `ApplicationRef` represents a running application instance. Use it to retrieve the host
 * component, injector,
 * or dispose of an application.
 */
export class ApplicationRef {
  _hostComponent: ComponentRef;
  _injector: Injector;
  _hostComponentType: Type;

  /**
   * @private
   */
  constructor(hostComponent: ComponentRef, hostComponentType: Type, injector: Injector) {
    this._hostComponent = hostComponent;
    this._injector = injector;
    this._hostComponentType = hostComponentType;
  }

  /**
   * Returns the current {@link ComponentMetadata} type.
   */
  get hostComponentType(): Type { return this._hostComponentType; }

  /**
   * Returns the current {@link ComponentMetadata} instance.
   */
  get hostComponent(): any { return this._hostComponent.instance; }

  /**
   * Dispose (un-load) the application.
   */
  dispose(): void {
    // TODO: We also need to clean up the Zone, ... here!
    this._hostComponent.dispose();
  }

  /**
   * Returns the root application {@link Injector}.
   */
  get injector(): Injector { return this._injector; }
}
