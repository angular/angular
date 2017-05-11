/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {Subscription} from 'rxjs/Subscription';
import {merge} from 'rxjs/observable/merge';
import {share} from 'rxjs/operator/share';

import {ErrorHandler} from '../src/error_handler';
import {scheduleMicroTask, stringify} from '../src/util';
import {isPromise} from '../src/util/lang';

import {ApplicationInitStatus} from './application_init';
import {APP_BOOTSTRAP_LISTENER, PLATFORM_INITIALIZER} from './application_tokens';
import {Console} from './console';
import {Injectable, InjectionToken, Injector, Provider, ReflectiveInjector} from './di';
import {CompilerFactory, CompilerOptions} from './linker/compiler';
import {ComponentFactory, ComponentRef} from './linker/component_factory';
import {ComponentFactoryBoundToModule, ComponentFactoryResolver} from './linker/component_factory_resolver';
import {InternalNgModuleRef, NgModuleFactory, NgModuleRef} from './linker/ng_module_factory';
import {InternalViewRef, ViewRef} from './linker/view_ref';
import {WtfScopeFn, wtfCreateScope, wtfLeave} from './profile/profile';
import {Testability, TestabilityRegistry} from './testability/testability';
import {Type} from './type';
import {NgZone} from './zone/ng_zone';

let _devMode: boolean = true;
let _runModeLocked: boolean = false;
let _platform: PlatformRef;

export const ALLOW_MULTIPLE_PLATFORMS = new InjectionToken<boolean>('AllowMultipleToken');

/**
 * Disable Angular's development mode, which turns off assertions and other
 * checks within the framework.
 *
 * One important assertion this disables verifies that a change detection pass
 * does not result in additional changes to any bindings (also known as
 * unidirectional data flow).
 *
 * @stable
 */
export function enableProdMode(): void {
  if (_runModeLocked) {
    throw new Error('Cannot enable prod mode after platform setup.');
  }
  _devMode = false;
}

/**
 * Returns whether Angular is in development mode. After called once,
 * the value is locked and won't change any more.
 *
 * By default, this is true, unless a user calls `enableProdMode` before calling this.
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export function isDevMode(): boolean {
  _runModeLocked = true;
  return _devMode;
}

/**
 * A token for third-party components that can register themselves with NgProbe.
 *
 * @experimental
 */
export class NgProbeToken {
  constructor(public name: string, public token: any) {}
}

/**
 * Creates a platform.
 * Platforms have to be eagerly created via this function.
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export function createPlatform(injector: Injector): PlatformRef {
  if (_platform && !_platform.destroyed &&
      !_platform.injector.get(ALLOW_MULTIPLE_PLATFORMS, false)) {
    throw new Error(
        'There can be only one platform. Destroy the previous one to create a new one.');
  }
  _platform = injector.get(PlatformRef);
  const inits = injector.get(PLATFORM_INITIALIZER, null);
  if (inits) inits.forEach((init: any) => init());
  return _platform;
}

/**
 * Creates a factory for a platform
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export function createPlatformFactory(
    parentPlatformFactory: ((extraProviders?: Provider[]) => PlatformRef) | null, name: string,
    providers: Provider[] = []): (extraProviders?: Provider[]) => PlatformRef {
  const marker = new InjectionToken(`Platform: ${name}`);
  return (extraProviders: Provider[] = []) => {
    let platform = getPlatform();
    if (!platform || platform.injector.get(ALLOW_MULTIPLE_PLATFORMS, false)) {
      if (parentPlatformFactory) {
        parentPlatformFactory(
            providers.concat(extraProviders).concat({provide: marker, useValue: true}));
      } else {
        createPlatform(ReflectiveInjector.resolveAndCreate(
            providers.concat(extraProviders).concat({provide: marker, useValue: true})));
      }
    }
    return assertPlatform(marker);
  };
}

/**
 * Checks that there currently is a platform which contains the given token as a provider.
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export function assertPlatform(requiredToken: any): PlatformRef {
  const platform = getPlatform();

  if (!platform) {
    throw new Error('No platform exists!');
  }

  if (!platform.injector.get(requiredToken, null)) {
    throw new Error(
        'A platform with a different configuration has been created. Please destroy it first.');
  }

  return platform;
}

/**
 * Destroy the existing platform.
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export function destroyPlatform(): void {
  if (_platform && !_platform.destroyed) {
    _platform.destroy();
  }
}

/**
 * Returns the current platform.
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export function getPlatform(): PlatformRef|null {
  return _platform && !_platform.destroyed ? _platform : null;
}

/**
 * The Angular platform is the entry point for Angular on a web page. Each page
 * has exactly one platform, and services (such as reflection) which are common
 * to every Angular application running on the page are bound in its scope.
 *
 * A page's platform is initialized implicitly when a platform is created via a platform factory
 * (e.g. {@link platformBrowser}), or explicitly by calling the {@link createPlatform} function.
 *
 * @stable
 */
export abstract class PlatformRef {
  /**
   * Creates an instance of an `@NgModule` for the given platform
   * for offline compilation.
   *
   * ## Simple Example
   *
   * ```typescript
   * my_module.ts:
   *
   * @NgModule({
   *   imports: [BrowserModule]
   * })
   * class MyModule {}
   *
   * main.ts:
   * import {MyModuleNgFactory} from './my_module.ngfactory';
   * import {platformBrowser} from '@angular/platform-browser';
   *
   * let moduleRef = platformBrowser().bootstrapModuleFactory(MyModuleNgFactory);
   * ```
   *
   * @experimental APIs related to application bootstrap are currently under review.
   */
  abstract bootstrapModuleFactory<M>(moduleFactory: NgModuleFactory<M>): Promise<NgModuleRef<M>>;

  /**
   * Creates an instance of an `@NgModule` for a given platform using the given runtime compiler.
   *
   * ## Simple Example
   *
   * ```typescript
   * @NgModule({
   *   imports: [BrowserModule]
   * })
   * class MyModule {}
   *
   * let moduleRef = platformBrowser().bootstrapModule(MyModule);
   * ```
   * @stable
   */
  abstract bootstrapModule<M>(
      moduleType: Type<M>,
      compilerOptions?: CompilerOptions|CompilerOptions[]): Promise<NgModuleRef<M>>;

  /**
   * Register a listener to be called when the platform is disposed.
   */
  abstract onDestroy(callback: () => void): void;

  /**
   * Retrieve the platform {@link Injector}, which is the parent injector for
   * every Angular application on the page and provides singleton providers.
   */
  abstract get injector(): Injector;

  /**
   * Destroy the Angular platform and all Angular applications on the page.
   */
  abstract destroy(): void;

  abstract get destroyed(): boolean;
}

function _callAndReportToErrorHandler(errorHandler: ErrorHandler, callback: () => any): any {
  try {
    const result = callback();
    if (isPromise(result)) {
      return result.catch((e: any) => {
        errorHandler.handleError(e);
        // rethrow as the exception handler might not do it
        throw e;
      });
    }

    return result;
  } catch (e) {
    errorHandler.handleError(e);
    // rethrow as the exception handler might not do it
    throw e;
  }
}

/**
 * workaround https://github.com/angular/tsickle/issues/350
 * @suppress {checkTypes}
 */
@Injectable()
export class PlatformRef_ extends PlatformRef {
  private _modules: NgModuleRef<any>[] = [];
  private _destroyListeners: Function[] = [];
  private _destroyed: boolean = false;

  constructor(private _injector: Injector) { super(); }

  onDestroy(callback: () => void): void { this._destroyListeners.push(callback); }

  get injector(): Injector { return this._injector; }

  get destroyed() { return this._destroyed; }

  destroy() {
    if (this._destroyed) {
      throw new Error('The platform has already been destroyed!');
    }
    this._modules.slice().forEach(module => module.destroy());
    this._destroyListeners.forEach(listener => listener());
    this._destroyed = true;
  }

  bootstrapModuleFactory<M>(moduleFactory: NgModuleFactory<M>): Promise<NgModuleRef<M>> {
    return this._bootstrapModuleFactoryWithZone(moduleFactory);
  }

  private _bootstrapModuleFactoryWithZone<M>(moduleFactory: NgModuleFactory<M>, ngZone?: NgZone):
      Promise<NgModuleRef<M>> {
    // Note: We need to create the NgZone _before_ we instantiate the module,
    // as instantiating the module creates some providers eagerly.
    // So we create a mini parent injector that just contains the new NgZone and
    // pass that as parent to the NgModuleFactory.
    if (!ngZone) ngZone = new NgZone({enableLongStackTrace: isDevMode()});
    // Attention: Don't use ApplicationRef.run here,
    // as we want to be sure that all possible constructor calls are inside `ngZone.run`!
    return ngZone.run(() => {
      const ngZoneInjector =
          ReflectiveInjector.resolveAndCreate([{provide: NgZone, useValue: ngZone}], this.injector);
      const moduleRef = <InternalNgModuleRef<M>>moduleFactory.create(ngZoneInjector);
      const exceptionHandler: ErrorHandler = moduleRef.injector.get(ErrorHandler, null);
      if (!exceptionHandler) {
        throw new Error('No ErrorHandler. Is platform module (BrowserModule) included?');
      }
      moduleRef.onDestroy(() => remove(this._modules, moduleRef));
      ngZone !.onError.subscribe({next: (error: any) => { exceptionHandler.handleError(error); }});
      return _callAndReportToErrorHandler(exceptionHandler, () => {
        const initStatus: ApplicationInitStatus = moduleRef.injector.get(ApplicationInitStatus);
        return initStatus.donePromise.then(() => {
          this._moduleDoBootstrap(moduleRef);
          return moduleRef;
        });
      });
    });
  }

  bootstrapModule<M>(moduleType: Type<M>, compilerOptions: CompilerOptions|CompilerOptions[] = []):
      Promise<NgModuleRef<M>> {
    return this._bootstrapModuleWithZone(moduleType, compilerOptions);
  }

  private _bootstrapModuleWithZone<M>(
      moduleType: Type<M>, compilerOptions: CompilerOptions|CompilerOptions[] = [],
      ngZone?: NgZone): Promise<NgModuleRef<M>> {
    const compilerFactory: CompilerFactory = this.injector.get(CompilerFactory);
    const compiler = compilerFactory.createCompiler(
        Array.isArray(compilerOptions) ? compilerOptions : [compilerOptions]);

    return compiler.compileModuleAsync(moduleType)
        .then((moduleFactory) => this._bootstrapModuleFactoryWithZone(moduleFactory, ngZone));
  }

  private _moduleDoBootstrap(moduleRef: InternalNgModuleRef<any>): void {
    const appRef = moduleRef.injector.get(ApplicationRef) as ApplicationRef;
    if (moduleRef._bootstrapComponents.length > 0) {
      moduleRef._bootstrapComponents.forEach(f => appRef.bootstrap(f));
    } else if (moduleRef.instance.ngDoBootstrap) {
      moduleRef.instance.ngDoBootstrap(appRef);
    } else {
      throw new Error(
          `The module ${stringify(moduleRef.instance.constructor)} was bootstrapped, but it does not declare "@NgModule.bootstrap" components nor a "ngDoBootstrap" method. ` +
          `Please define one of these.`);
    }
    this._modules.push(moduleRef);
  }
}

/**
 * A reference to an Angular application running on a page.
 *
 * @stable
 */
export abstract class ApplicationRef {
  /**
   * Bootstrap a new component at the root level of the application.
   *
   * ### Bootstrap process
   *
   * When bootstrapping a new root component into an application, Angular mounts the
   * specified application component onto DOM elements identified by the [componentType]'s
   * selector and kicks off automatic change detection to finish initializing the component.
   *
   * Optionally, a component can be mounted onto a DOM element that does not match the
   * [componentType]'s selector.
   *
   * ### Example
   * {@example core/ts/platform/platform.ts region='longform'}
   */
  abstract bootstrap<C>(
      componentFactory: ComponentFactory<C>|Type<C>,
      rootSelectorOrNode?: string|any): ComponentRef<C>;

  /**
   * Invoke this method to explicitly process change detection and its side-effects.
   *
   * In development mode, `tick()` also performs a second change detection cycle to ensure that no
   * further changes are detected. If additional changes are picked up during this second cycle,
   * bindings in the app have side-effects that cannot be resolved in a single change detection
   * pass.
   * In this case, Angular throws an error, since an Angular application can only have one change
   * detection pass during which all change detection must complete.
   */
  abstract tick(): void;

  /**
   * Get a list of component types registered to this application.
   * This list is populated even before the component is created.
   */
  abstract get componentTypes(): Type<any>[];

  /**
   * Get a list of components registered to this application.
   */
  abstract get components(): ComponentRef<any>[];

  /**
   * Attaches a view so that it will be dirty checked.
   * The view will be automatically detached when it is destroyed.
   * This will throw if the view is already attached to a ViewContainer.
   */
  abstract attachView(view: ViewRef): void;

  /**
   * Detaches a view from dirty checking again.
   */
  abstract detachView(view: ViewRef): void;

  /**
   * Returns the number of attached views.
   */
  abstract get viewCount(): number;

  /**
   * Returns an Observable that indicates when the application is stable or unstable.
   */
  abstract get isStable(): Observable<boolean>;
}

/**
 * workaround https://github.com/angular/tsickle/issues/350
 * @suppress {checkTypes}
 */
@Injectable()
export class ApplicationRef_ extends ApplicationRef {
  /** @internal */
  static _tickScope: WtfScopeFn = wtfCreateScope('ApplicationRef#tick()');

  private _bootstrapListeners: ((compRef: ComponentRef<any>) => void)[] = [];
  private _rootComponents: ComponentRef<any>[] = [];
  private _rootComponentTypes: Type<any>[] = [];
  private _views: InternalViewRef[] = [];
  private _runningTick: boolean = false;
  private _enforceNoNewChanges: boolean = false;
  private _isStable: Observable<boolean>;
  private _stable = true;

  constructor(
      private _zone: NgZone, private _console: Console, private _injector: Injector,
      private _exceptionHandler: ErrorHandler,
      private _componentFactoryResolver: ComponentFactoryResolver,
      private _initStatus: ApplicationInitStatus) {
    super();
    this._enforceNoNewChanges = isDevMode();

    this._zone.onMicrotaskEmpty.subscribe(
        {next: () => { this._zone.run(() => { this.tick(); }); }});

    const isCurrentlyStable = new Observable<boolean>((observer: Observer<boolean>) => {
      this._stable = this._zone.isStable && !this._zone.hasPendingMacrotasks &&
          !this._zone.hasPendingMicrotasks;
      this._zone.runOutsideAngular(() => {
        observer.next(this._stable);
        observer.complete();
      });
    });

    const isStable = new Observable<boolean>((observer: Observer<boolean>) => {
      const stableSub: Subscription = this._zone.onStable.subscribe(() => {
        NgZone.assertNotInAngularZone();

        // Check whether there are no pending macro/micro tasks in the next tick
        // to allow for NgZone to update the state.
        scheduleMicroTask(() => {
          if (!this._stable && !this._zone.hasPendingMacrotasks &&
              !this._zone.hasPendingMicrotasks) {
            this._stable = true;
            observer.next(true);
          }
        });
      });

      const unstableSub: Subscription = this._zone.onUnstable.subscribe(() => {
        NgZone.assertInAngularZone();
        if (this._stable) {
          this._stable = false;
          this._zone.runOutsideAngular(() => { observer.next(false); });
        }
      });

      return () => {
        stableSub.unsubscribe();
        unstableSub.unsubscribe();
      };
    });

    this._isStable = merge(isCurrentlyStable, share.call(isStable));
  }

  attachView(viewRef: ViewRef): void {
    const view = (viewRef as InternalViewRef);
    this._views.push(view);
    view.attachToAppRef(this);
  }

  detachView(viewRef: ViewRef): void {
    const view = (viewRef as InternalViewRef);
    remove(this._views, view);
    view.detachFromAppRef();
  }

  bootstrap<C>(componentOrFactory: ComponentFactory<C>|Type<C>, rootSelectorOrNode?: string|any):
      ComponentRef<C> {
    if (!this._initStatus.done) {
      throw new Error(
          'Cannot bootstrap as there are still asynchronous initializers running. Bootstrap components in the `ngDoBootstrap` method of the root module.');
    }
    let componentFactory: ComponentFactory<C>;
    if (componentOrFactory instanceof ComponentFactory) {
      componentFactory = componentOrFactory;
    } else {
      componentFactory =
          this._componentFactoryResolver.resolveComponentFactory(componentOrFactory) !;
    }
    this._rootComponentTypes.push(componentFactory.componentType);

    // Create a factory associated with the current module if it's not bound to some other
    const ngModule = componentFactory instanceof ComponentFactoryBoundToModule ?
        null :
        this._injector.get(NgModuleRef);
    const selectorOrNode = rootSelectorOrNode || componentFactory.selector;
    const compRef = componentFactory.create(Injector.NULL, [], selectorOrNode, ngModule);

    compRef.onDestroy(() => { this._unloadComponent(compRef); });
    const testability = compRef.injector.get(Testability, null);
    if (testability) {
      compRef.injector.get(TestabilityRegistry)
          .registerApplication(compRef.location.nativeElement, testability);
    }

    this._loadComponent(compRef);
    if (isDevMode()) {
      this._console.log(
          `Angular is running in the development mode. Call enableProdMode() to enable the production mode.`);
    }
    return compRef;
  }

  private _loadComponent(componentRef: ComponentRef<any>): void {
    this.attachView(componentRef.hostView);
    this.tick();
    this._rootComponents.push(componentRef);
    // Get the listeners lazily to prevent DI cycles.
    const listeners =
        this._injector.get(APP_BOOTSTRAP_LISTENER, []).concat(this._bootstrapListeners);
    listeners.forEach((listener) => listener(componentRef));
  }

  private _unloadComponent(componentRef: ComponentRef<any>): void {
    this.detachView(componentRef.hostView);
    remove(this._rootComponents, componentRef);
  }

  tick(): void {
    if (this._runningTick) {
      throw new Error('ApplicationRef.tick is called recursively');
    }

    const scope = ApplicationRef_._tickScope();
    try {
      this._runningTick = true;
      this._views.forEach((view) => view.detectChanges());
      if (this._enforceNoNewChanges) {
        this._views.forEach((view) => view.checkNoChanges());
      }
    } catch (e) {
      // Attention: Don't rethrow as it could cancel subscriptions to Observables!
      this._exceptionHandler.handleError(e);
    } finally {
      this._runningTick = false;
      wtfLeave(scope);
    }
  }

  ngOnDestroy() {
    // TODO(alxhub): Dispose of the NgZone.
    this._views.slice().forEach((view) => view.destroy());
  }

  get viewCount() { return this._views.length; }

  get componentTypes(): Type<any>[] { return this._rootComponentTypes; }

  get components(): ComponentRef<any>[] { return this._rootComponents; }

  get isStable(): Observable<boolean> { return this._isStable; }
}

function remove<T>(list: T[], el: T): void {
  const index = list.indexOf(el);
  if (index > -1) {
    list.splice(index, 1);
  }
}
