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
import {
  HostViewFactoryRef,
  HostViewFactoryRef_,
  EmbeddedViewRef,
  HostViewRef,
  ViewRef,
  ViewRef_
} from './view_ref';
import {ViewContainerRef, ViewContainerRef_} from './view_container_ref';
import {RootRenderer, RenderComponentType, Renderer} from 'angular2/src/core/render/api';
import {wtfCreateScope, wtfLeave, WtfScopeFn} from '../profile/profile';
import {APP_ID} from 'angular2/src/core/application_tokens';
import {ViewEncapsulation} from 'angular2/src/core/metadata/view';
import {ViewType} from './view_type';

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
   * Returns the {@link ElementRef} that makes up the specified Host View.
   */
  abstract getHostElement(hostViewRef: HostViewRef): ElementRef;

  /**
   * Searches the Component View of the Component specified via `hostLocation` and returns the
   * {@link ElementRef} for the Element identified via a Variable Name `variableName`.
   *
   * Throws an exception if the specified `hostLocation` is not a Host Element of a Component, or if
   * variable `variableName` couldn't be found in the Component View of this Component.
   */
  abstract getNamedElementInComponentView(hostLocation: ElementRef,
                                          variableName: string): ElementRef;

  /**
   * Returns the component instance for the provided Host Element.
   */
  abstract getComponent(hostLocation: ElementRef): any;

  /**
   * Creates an instance of a Component and attaches it to the first element in the global View
   * (usually DOM Document) that matches the component's selector or `overrideSelector`.
   *
   * This as a low-level way to bootstrap an application and upgrade an existing Element to a
   * Host Element. Most applications should use {@link DynamicComponentLoader#loadAsRoot} instead.
   *
   * The Component and its View are created based on the `hostProtoComponentRef` which can be
   * obtained
   * by compiling the component with {@link Compiler#compileInHost}.
   *
   * Use {@link AppViewManager#destroyRootHostView} to destroy the created Component and it's Host
   * View.
   *
   * ### Example
   *
   * ```
   * @ng.Component({
   *   selector: 'child-component'
   * })
   * @ng.View({
   *   template: 'Child'
   * })
   * class ChildComponent {
   *
   * }
   *
   * @ng.Component({
   *   selector: 'my-app'
   * })
   * @ng.View({
   *   template: `
   *     Parent (<some-component></some-component>)
   *   `
   * })
   * class MyApp implements OnDestroy {
   *   viewRef: ng.ViewRef;
   *
   *   constructor(public appViewManager: ng.AppViewManager, compiler: ng.Compiler) {
   *     compiler.compileInHost(ChildComponent).then((protoView: ng.ProtoComponentRef) => {
   *       this.viewRef = appViewManager.createRootHostView(protoView, 'some-component', null);
   *     })
   *   }
   *
   *   ngOnDestroy() {
   *     this.appViewManager.destroyRootHostView(this.viewRef);
   *     this.viewRef = null;
   *   }
   * }
   *
   * ng.bootstrap(MyApp);
   * ```
   */
  abstract createRootHostView(hostViewFactoryRef: HostViewFactoryRef, overrideSelector: string,
                              injector: Injector, projectableNodes?: any[][]): HostViewRef;

  /**
   * Destroys the Host View created via {@link AppViewManager#createRootHostView}.
   *
   * Along with the Host View, the Component Instance as well as all nested View and Components are
   * destroyed as well.
   */
  abstract destroyRootHostView(hostViewRef: HostViewRef);
}

@Injectable()
export class AppViewManager_ extends AppViewManager {
  private _nextCompTypeId: number = 0;

  constructor(private _renderer: RootRenderer, @Inject(APP_ID) private _appId: string) { super(); }

  getViewContainer(location: ElementRef): ViewContainerRef {
    return (<ElementRef_>location).internalElement.vcRef;
  }

  getHostElement(hostViewRef: ViewRef): ElementRef {
    var hostView = (<ViewRef_>hostViewRef).internalView;
    if (hostView.type !== ViewType.HOST) {
      throw new BaseException('This operation is only allowed on host views');
    }
    return hostView.getHostViewElement().ref;
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

  getComponent(hostLocation: ElementRef): any {
    return (<ElementRef_>hostLocation).internalElement.component;
  }

  /** @internal */
  _createRootHostViewScope: WtfScopeFn = wtfCreateScope('AppViewManager#createRootHostView()');

  createRootHostView(hostViewFactoryRef: HostViewFactoryRef, overrideSelector: string,
                     injector: Injector, projectableNodes: any[][] = null): HostViewRef {
    var s = this._createRootHostViewScope();
    var hostViewFactory = (<HostViewFactoryRef_>hostViewFactoryRef).internalHostViewFactory;
    var selector = isPresent(overrideSelector) ? overrideSelector : hostViewFactory.selector;
    var view = hostViewFactory.viewFactory(this, injector, null);
    view.create(projectableNodes, selector);
    return wtfLeave(s, view.ref);
  }

  /** @internal */
  _destroyRootHostViewScope: WtfScopeFn = wtfCreateScope('AppViewManager#destroyRootHostView()');

  destroyRootHostView(hostViewRef: ViewRef) {
    var s = this._destroyRootHostViewScope();
    var hostView = (<ViewRef_>hostViewRef).internalView;
    hostView.renderer.detachView(hostView.flatRootNodes);
    hostView.destroy();
    wtfLeave(s);
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
