/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectorRef,
  ComponentRef,
  Directive,
  EnvironmentInjector,
  EventEmitter,
  inject,
  Injectable,
  InjectionToken,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  reflectComponentType,
  SimpleChanges,
  ViewContainerRef,
  ɵRuntimeError as RuntimeError,
  Component,
} from '@angular/core';
import {combineLatest, of, Subject, Subscription} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {RuntimeErrorCode} from '../errors';
import {Data, Route} from '../models';
import {ChildrenOutletContexts} from '../router_outlet_context';
import {ActivatedRoute} from '../router_state';
import {PRIMARY_OUTLET} from '../shared';

/**
 * An interface that defines the contract for developing a component outlet for the `Router`.
 *
 * An outlet acts as a placeholder that Angular dynamically fills based on the current router state.
 *
 * A router outlet should register itself with the `Router` via
 * `ChildrenOutletContexts#onChildOutletCreated` and unregister with
 * `ChildrenOutletContexts#onChildOutletDestroyed`. When the `Router` identifies a matched `Route`,
 * it looks for a registered outlet in the `ChildrenOutletContexts` and activates it.
 *
 * @see {@link ChildrenOutletContexts}
 * @publicApi
 */
export interface RouterOutletContract {
  /**
   * Whether the given outlet is activated.
   *
   * An outlet is considered "activated" if it has an active component.
   */
  isActivated: boolean;

  /** The instance of the activated component or `null` if the outlet is not activated. */
  component: Object | null;

  /**
   * The `Data` of the `ActivatedRoute` snapshot.
   */
  activatedRouteData: Data;

  /**
   * The `ActivatedRoute` for the outlet or `null` if the outlet is not activated.
   */
  activatedRoute: ActivatedRoute | null;

  /**
   * Called by the `Router` when the outlet should activate (create a component).
   */
  activateWith(activatedRoute: ActivatedRoute, environmentInjector: EnvironmentInjector): void;

  /**
   * A request to destroy the currently activated component.
   *
   * When a `RouteReuseStrategy` indicates that an `ActivatedRoute` should be removed but stored for
   * later re-use rather than destroyed, the `Router` will call `detach` instead.
   */
  deactivate(): void;

  /**
   * Called when the `RouteReuseStrategy` instructs to detach the subtree.
   *
   * This is similar to `deactivate`, but the activated component should _not_ be destroyed.
   * Instead, it is returned so that it can be reattached later via the `attach` method.
   */
  detach(): ComponentRef<unknown>;

  /**
   * Called when the `RouteReuseStrategy` instructs to re-attach a previously detached subtree.
   */
  attach(ref: ComponentRef<unknown>, activatedRoute: ActivatedRoute): void;

  /**
   * Emits an activate event when a new component is instantiated
   **/
  activateEvents?: EventEmitter<unknown>;

  /**
   * Emits a deactivate event when a component is destroyed.
   */
  deactivateEvents?: EventEmitter<unknown>;

  /**
   * Emits an attached component instance when the `RouteReuseStrategy` instructs to re-attach a
   * previously detached subtree.
   **/
  attachEvents?: EventEmitter<unknown>;

  /**
   * Emits a detached component instance when the `RouteReuseStrategy` instructs to detach the
   * subtree.
   */
  detachEvents?: EventEmitter<unknown>;

  /**
   * Used to indicate that the outlet is able to bind data from the `Router` to the outlet
   * component's inputs.
   *
   * When this is `undefined` or `false` and the developer has opted in to the
   * feature using `withComponentInputBinding`, a warning will be logged in dev mode if this outlet
   * is used in the application.
   */
  readonly supportsBindingToComponentInputs?: true;
}

/**
 * @description
 *
 * Acts as a placeholder that Angular dynamically fills based on the current router state.
 *
 * Each outlet can have a unique name, determined by the optional `name` attribute.
 * The name cannot be set or changed dynamically. If not set, default value is "primary".
 *
 * ```
 * <router-outlet></router-outlet>
 * <router-outlet name='left'></router-outlet>
 * <router-outlet name='right'></router-outlet>
 * ```
 *
 * Named outlets can be the targets of secondary routes.
 * The `Route` object for a secondary route has an `outlet` property to identify the target outlet:
 *
 * `{path: <base-path>, component: <component>, outlet: <target_outlet_name>}`
 *
 * Using named outlets and secondary routes, you can target multiple outlets in
 * the same `RouterLink` directive.
 *
 * The router keeps track of separate branches in a navigation tree for each named outlet and
 * generates a representation of that tree in the URL.
 * The URL for a secondary route uses the following syntax to specify both the primary and secondary
 * routes at the same time:
 *
 * `http://base-path/primary-route-path(outlet-name:route-path)`
 *
 * A router outlet emits an activate event when a new component is instantiated,
 * deactivate event when a component is destroyed.
 * An attached event emits when the `RouteReuseStrategy` instructs the outlet to reattach the
 * subtree, and the detached event emits when the `RouteReuseStrategy` instructs the outlet to
 * detach the subtree.
 *
 * ```
 * <router-outlet
 *   (activate)='onActivate($event)'
 *   (deactivate)='onDeactivate($event)'
 *   (attach)='onAttach($event)'
 *   (detach)='onDetach($event)'></router-outlet>
 * ```
 *
 * @see {@link RouterLink}
 * @see {@link Route}
 * @ngModule RouterModule
 *
 * @publicApi
 */
@Directive({
  selector: 'router-outlet',
  exportAs: 'outlet',
  standalone: true,
})
export class RouterOutlet implements OnDestroy, OnInit, RouterOutletContract {
  private activated: ComponentRef<any> | null = null;
  /** @internal */
  get activatedComponentRef(): ComponentRef<any> | null {
    return this.activated;
  }
  private _activatedRoute: ActivatedRoute | null = null;
  /**
   * The name of the outlet
   *
   */
  @Input() name = PRIMARY_OUTLET;

  @Output('activate') activateEvents = new EventEmitter<any>();
  @Output('deactivate') deactivateEvents = new EventEmitter<any>();
  /**
   * Emits an attached component instance when the `RouteReuseStrategy` instructs to re-attach a
   * previously detached subtree.
   **/
  @Output('attach') attachEvents = new EventEmitter<unknown>();
  /**
   * Emits a detached component instance when the `RouteReuseStrategy` instructs to detach the
   * subtree.
   */
  @Output('detach') detachEvents = new EventEmitter<unknown>();

  private parentContexts = inject(ChildrenOutletContexts);
  private location = inject(ViewContainerRef);
  private changeDetector = inject(ChangeDetectorRef);
  private inputBinder = inject(INPUT_BINDER, {optional: true});
  /** @nodoc */
  readonly supportsBindingToComponentInputs = true;
  private readonly hostEmptyOutlet = inject(EmptyOutletComponent, {host: true, optional: true});

  /** @internal */
  constructor() {
    if (this.hostEmptyOutlet) {
      this.hostEmptyOutlet.outlet = this;
    }
  }

  /** @nodoc */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['name']) {
      const {firstChange, previousValue} = changes['name'];
      if (firstChange) {
        // The first change is handled by ngOnInit. Because ngOnChanges doesn't get called when no
        // input is set at all, we need to centrally handle the first change there.
        return;
      }

      // unregister with the old name
      if (this.isTrackedInParentContexts(previousValue)) {
        this.deactivate();
        this.parentContexts.onChildOutletDestroyed(previousValue);
      }
      // register the new name
      this.initializeOutletWithName();
    }
  }

  /** @nodoc */
  ngOnDestroy(): void {
    // Ensure that the registered outlet is this one before removing it on the context.
    if (this.isTrackedInParentContexts(this.name)) {
      this.parentContexts.onChildOutletDestroyed(this.name);
    }
    this.inputBinder?.unsubscribeFromRouteData(this);
  }

  private isTrackedInParentContexts(outletName: string) {
    return this.parentContexts.getContext(outletName)?.outlet === this;
  }

  /** @nodoc */
  ngOnInit(): void {
    this.initializeOutletWithName();
  }

  private initializeOutletWithName() {
    this.parentContexts.onChildOutletCreated(this.name, this);
    if (this.activated) {
      return;
    }

    // If the outlet was not instantiated at the time the route got activated we need to populate
    // the outlet when it is initialized (ie inside a NgIf)
    const context = this.parentContexts.getContext(this.name);
    if (context?.route) {
      if (context.attachRef) {
        // `attachRef` is populated when there is an existing component to mount
        this.attach(context.attachRef, context.route);
      } else {
        // otherwise the component defined in the configuration is created
        this.activateWith(context.route, context.injector);
      }
    }
  }

  get isActivated(): boolean {
    return !!this.activated;
  }

  /**
   * @returns The currently activated component instance.
   * @throws An error if the outlet is not activated.
   */
  get component(): Object {
    if (!this.activated)
      throw new RuntimeError(
        RuntimeErrorCode.OUTLET_NOT_ACTIVATED,
        (typeof ngDevMode === 'undefined' || ngDevMode) && 'Outlet is not activated',
      );
    const c = this.activated.instance;
    if (c instanceof EmptyOutletComponent) {
      return c.component;
    }
    return c;
  }

  get activatedRoute(): ActivatedRoute {
    if (!this.activated)
      throw new RuntimeError(
        RuntimeErrorCode.OUTLET_NOT_ACTIVATED,
        (typeof ngDevMode === 'undefined' || ngDevMode) && 'Outlet is not activated',
      );
    return this._activatedRoute as ActivatedRoute;
  }

  get activatedRouteData(): Data {
    if (this._activatedRoute) {
      return this._activatedRoute.snapshot.data;
    }
    return {};
  }

  /**
   * Called when the `RouteReuseStrategy` instructs to detach the subtree
   */
  detach(): ComponentRef<any> {
    if (!this.activated)
      throw new RuntimeError(
        RuntimeErrorCode.OUTLET_NOT_ACTIVATED,
        (typeof ngDevMode === 'undefined' || ngDevMode) && 'Outlet is not activated',
      );
    this.location.detach();
    const cmp = this.activated;
    this.activated = null;
    this._activatedRoute = null;
    if (cmp.instance instanceof EmptyOutletComponent) {
      // For the `EmptyOutletComponent` instances, the `detachEvents` are subscribed to and
      // emitted in the `activateWith` function.
      return cmp.instance.outlet?.activated ?? cmp;
    } else {
      this.detachEvents.emit(cmp.instance);
      return cmp;
    }
  }

  /**
   * Called when the `RouteReuseStrategy` instructs to re-attach a previously detached subtree
   */
  attach(ref: ComponentRef<any>, activatedRoute: ActivatedRoute) {
    this.activated = ref;
    this._activatedRoute = activatedRoute;
    this.location.insert(ref.hostView);
    this.inputBinder?.bindActivatedRouteToOutletComponent(this);
    // For the `EmptyOutletComponent` instances, the `attachEvents` are subscribed to and
    // emitted in the `activateWith` function.
    if (!(ref.instance instanceof EmptyOutletComponent)) {
      this.attachEvents.emit(ref.instance);
    }
  }

  deactivate(): void {
    if (this.activated) {
      const c = this.component;
      this.activated.destroy();
      this.activated = null;
      this._activatedRoute = null;
      if (!(c instanceof EmptyOutletComponent)) {
        this.deactivateEvents.emit(c);
      }
    }
  }

  activateWith(activatedRoute: ActivatedRoute, environmentInjector: EnvironmentInjector) {
    if (this.isActivated) {
      throw new RuntimeError(
        RuntimeErrorCode.OUTLET_ALREADY_ACTIVATED,
        (typeof ngDevMode === 'undefined' || ngDevMode) &&
          'Cannot activate an already activated outlet',
      );
    }
    this._activatedRoute = activatedRoute;
    const location = this.location;
    const snapshot = activatedRoute.snapshot;
    const component = snapshot.component!;
    const childContexts = this.parentContexts.getOrCreateContext(this.name).children;
    const injector = new OutletInjector(activatedRoute, childContexts, location.injector);

    this.activated = location.createComponent(component, {
      index: location.length,
      injector,
      environmentInjector: environmentInjector,
    });
    // Calling `markForCheck` to make sure we will run the change detection when the
    // `RouterOutlet` is inside a `ChangeDetectionStrategy.OnPush` component.
    this.changeDetector.markForCheck();
    this.inputBinder?.bindActivatedRouteToOutletComponent(this);
    // If we have an empty outlet component, we want to instead proxy activate/deactivate events
    // from the inner outlet
    const c = this.activated.instance;
    if (c instanceof EmptyOutletComponent) {
      const sink = new Subscription();
      sink.add(c.activateEvents.subscribe((ev: any) => this.activateEvents.emit(ev)));
      sink.add(c.deactivateEvents.subscribe((ev: any) => this.deactivateEvents.emit(ev)));
      sink.add(c.attachEvents.subscribe((ev: any) => this.attachEvents.emit(ev)));
      sink.add(c.detachEvents.subscribe((ev: any) => this.detachEvents.emit(ev)));
      c.destroy$.subscribe(() => sink.unsubscribe());
    } else {
      this.activateEvents.emit(this.activated.instance);
    }
  }
}

class OutletInjector implements Injector {
  /**
   * This injector has a special handing for the `ActivatedRoute` and
   * `ChildrenOutletContexts` tokens: it returns corresponding values for those
   * tokens dynamically. This behavior is different from the regular injector logic,
   * when we initialize and store a value, which is later returned for all inject
   * requests.
   *
   * In some cases (e.g. when using `@defer`), this dynamic behavior requires special
   * handling. This function allows to identify an instance of the `OutletInjector` and
   * create an instance of it without referring to the class itself (so this logic can
   * be invoked from the `core` package). This helps to retain dynamic behavior for the
   * mentioned tokens.
   *
   * Note: it's a temporary solution and we should explore how to support this case better.
   */
  private __ngOutletInjector(parentInjector: Injector) {
    return new OutletInjector(this.route, this.childContexts, parentInjector);
  }

  constructor(
    private route: ActivatedRoute,
    private childContexts: ChildrenOutletContexts,
    private parent: Injector,
  ) {}

  get(token: any, notFoundValue?: any): any {
    if (token === ActivatedRoute) {
      return this.route;
    }

    if (token === ChildrenOutletContexts) {
      return this.childContexts;
    }

    return this.parent.get(token, notFoundValue);
  }
}

export const INPUT_BINDER = new InjectionToken<RoutedComponentInputBinder>('');

/**
 * Injectable used as a tree-shakable provider for opting in to binding router data to component
 * inputs.
 *
 * The RouterOutlet registers itself with this service when an `ActivatedRoute` is attached or
 * activated. When this happens, the service subscribes to the `ActivatedRoute` observables (params,
 * queryParams, data) and sets the inputs of the component using `ComponentRef.setInput`.
 * Importantly, when an input does not have an item in the route data with a matching key, this
 * input is set to `undefined`. If it were not done this way, the previous information would be
 * retained if the data got removed from the route (i.e. if a query parameter is removed).
 *
 * The `RouterOutlet` should unregister itself when destroyed via `unsubscribeFromRouteData` so that
 * the subscriptions are cleaned up.
 */
@Injectable()
export class RoutedComponentInputBinder {
  private outletDataSubscriptions = new Map<RouterOutlet, Subscription>();

  bindActivatedRouteToOutletComponent(outlet: RouterOutlet) {
    this.unsubscribeFromRouteData(outlet);
    this.subscribeToRouteData(outlet);
  }

  unsubscribeFromRouteData(outlet: RouterOutlet) {
    this.outletDataSubscriptions.get(outlet)?.unsubscribe();
    this.outletDataSubscriptions.delete(outlet);
  }

  private subscribeToRouteData(outlet: RouterOutlet) {
    const {activatedRoute} = outlet;
    const dataSubscription = combineLatest([
      activatedRoute.queryParams,
      activatedRoute.params,
      activatedRoute.data,
    ])
      .pipe(
        switchMap(([queryParams, params, data], index) => {
          data = {...queryParams, ...params, ...data};
          // Get the first result from the data subscription synchronously so it's available to
          // the component as soon as possible (and doesn't require a second change detection).
          if (index === 0) {
            return of(data);
          }
          // Promise.resolve is used to avoid synchronously writing the wrong data when
          // two of the Observables in the `combineLatest` stream emit one after
          // another.
          return Promise.resolve(data);
        }),
      )
      .subscribe((data) => {
        // Outlet may have been deactivated or changed names to be associated with a different
        // route
        if (
          !outlet.isActivated ||
          !outlet.activatedComponentRef ||
          outlet.activatedRoute !== activatedRoute ||
          activatedRoute.component === null
        ) {
          this.unsubscribeFromRouteData(outlet);
          return;
        }

        const mirror = reflectComponentType(activatedRoute.component);
        if (!mirror) {
          this.unsubscribeFromRouteData(outlet);
          return;
        }

        for (const {templateName} of mirror.inputs) {
          outlet.activatedComponentRef.setInput(templateName, data[templateName]);
        }
      });

    this.outletDataSubscriptions.set(outlet, dataSubscription);
  }
}
/**
 * This component is used internally within the router to be a placeholder when an empty
 * router-outlet is needed. For example, with a config such as:
 *
 * `{path: 'parent', outlet: 'nav', children: [...]}`
 *
 * In order to render, there needs to be a component on this config, which will default
 * to this `EmptyOutletComponent`.
 *
 * In order to avoid circular references this component was moved from its own file and placed here.
 */
@Component({
  template: `<router-outlet 
    (activate)="activateEvents.emit($event)" 
    (deactivate)="deactivateEvents.emit($event)" 
    (attach)="attachEvents.emit($event)" 
    (detach)="detachEvents.emit($event)" />`,
  standalone: true,
  imports: [RouterOutlet],
})
export class EmptyOutletComponent {
  @Output('activate') activateEvents = new EventEmitter<any>();
  @Output('deactivate') deactivateEvents = new EventEmitter<any>();
  @Output('attach') attachEvents = new EventEmitter<unknown>();
  @Output('detach') detachEvents = new EventEmitter<unknown>();

  outlet?: RouterOutlet;
  destroy$ = new Subject<void>();

  get component(): Object {
    if (!this.outlet) {
      return null as any;
    }
    return this.outlet.component;
  }

  get activatedRoute(): ActivatedRoute {
    if (!this.outlet) {
      return null as any;
    }
    return this.outlet.activatedRoute;
  }

  get activatedRouteData(): Data {
    if (!this.activatedRoute) {
      return {};
    }
    return this.activatedRoute.snapshot.data;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

/**
 * Makes a copy of the config and adds any default required properties.
 */
export function standardizeConfig(r: Route): Route {
  const children = r.children && r.children.map(standardizeConfig);
  const c = children ? {...r, children} : {...r};
  if (
    !c.component &&
    !c.loadComponent &&
    (children || c.loadChildren) &&
    c.outlet &&
    c.outlet !== PRIMARY_OUTLET
  ) {
    c.component = EmptyOutletComponent;
  }
  return c;
}
