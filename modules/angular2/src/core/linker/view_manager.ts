import {
  Injector,
  Inject,
  Provider,
  Injectable,
  ResolvedProvider,
  forwardRef
} from 'angular2/src/core/di';
import {isPresent, isBlank, isArray, Type} from 'angular2/src/facade/lang';
import {BaseException} from 'angular2/src/facade/exceptions';
import {ElementRef, ElementRef_} from './element_ref';
import {ViewContainerRef, ViewContainerRef_} from './view_container_ref';
import {RootRenderer, RenderComponentType, Renderer} from 'angular2/src/core/render/api';
import {APP_ID} from 'angular2/src/core/application_tokens';
import {ViewEncapsulation} from 'angular2/src/core/metadata/view';

/**
 * Service exposing low level API for creating, moving and destroying Views.
 *
 * Most applications should use higher-level abstractions like {@link DynamicComponentLoader} and
 * {@link ViewContainerRef} instead.
 */
export abstract class AppViewManager {
  /**
   * Returns a {@link ViewContainerRef} of the View Container at the specified location.
   */
  abstract getViewContainer(location: ElementRef): ViewContainerRef;

  /**
   * Searches the Component View of the Component specified via `hostLocation` and returns the
   * {@link ElementRef} for the Element identified via a Variable Name `variableName`.
   *
   * Throws an exception if the specified `hostLocation` is not a Host Element of a Component, or if
   * variable `variableName` couldn't be found in the Component View of this Component.
   */
  abstract getNamedElementInComponentView(hostLocation: ElementRef,
                                          variableName: string): ElementRef;
}

@Injectable()
export class AppViewManager_ extends AppViewManager {
  private _nextCompTypeId: number = 0;

  constructor(private _renderer: RootRenderer, @Inject(APP_ID) private _appId: string) { super(); }

  getViewContainer(location: ElementRef): ViewContainerRef {
    return (<ElementRef_>location).internalElement.vcRef;
  }

  getNamedElementInComponentView(hostLocation: ElementRef, variableName: string): ElementRef {
    var appEl = (<ElementRef_>hostLocation).internalElement;
    var componentView = appEl.componentView;
    if (isBlank(componentView)) {
      throw new BaseException(`There is no component directive at element ${hostLocation}`);
    }
    var el = componentView.namedAppElements[variableName];
    if (isPresent(el)) {
      return el.ref;
    }
    throw new BaseException(`Could not find variable ${variableName}`);
  }

  /**
   * Used by the generated code
   */
  createRenderComponentType(templateUrl: string, slotCount: number,
                            encapsulation: ViewEncapsulation,
                            styles: Array<string | any[]>): RenderComponentType {
    return new RenderComponentType(`${this._appId}-${this._nextCompTypeId++}`, templateUrl,
                                   slotCount, encapsulation, styles);
  }

  /** @internal */
  renderComponent(renderComponentType: RenderComponentType): Renderer {
    return this._renderer.renderComponent(renderComponentType);
  }
}
