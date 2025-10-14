/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {
  ChangeDetectorRef,
  Directive,
  EventEmitter,
  inject,
  Injectable,
  InjectionToken,
  Input,
  input,
  Output,
  reflectComponentType,
  ɵRuntimeError as RuntimeError,
  ViewContainerRef,
} from '@angular/core';
import {combineLatest, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {ChildrenOutletContexts} from '../router_outlet_context';
import {ActivatedRoute} from '../router_state';
import {PRIMARY_OUTLET} from '../shared';
/**
 * An `InjectionToken` provided by the `RouterOutlet` and can be set using the `routerOutletData`
 * input.
 *
 * When unset, this value is `null` by default.
 *
 * @usageNotes
 *
 * To set the data from the template of the component with `router-outlet`:
 * ```html
 * <router-outlet [routerOutletData]="{name: 'Angular'}" />
 * ```
 *
 * To read the data in the routed component:
 * ```ts
 * data = inject(ROUTER_OUTLET_DATA) as Signal<{name: string}>;
 * ```
 *
 * @publicApi
 */
export const ROUTER_OUTLET_DATA = new InjectionToken(
  typeof ngDevMode !== undefined && ngDevMode ? 'RouterOutlet data' : '',
);
/**
 * @description
 *
 * Acts as a placeholder that Angular dynamically fills based on the current router state.
 *
 * Each outlet can have a unique name, determined by the optional `name` attribute.
 * The name cannot be set or changed dynamically. If not set, default value is "primary".
 *
 * ```html
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
 * ```html
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
let RouterOutlet = (() => {
  let _classDecorators = [
    Directive({
      selector: 'router-outlet',
      exportAs: 'outlet',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _name_decorators;
  let _name_initializers = [];
  let _name_extraInitializers = [];
  let _activateEvents_decorators;
  let _activateEvents_initializers = [];
  let _activateEvents_extraInitializers = [];
  let _deactivateEvents_decorators;
  let _deactivateEvents_initializers = [];
  let _deactivateEvents_extraInitializers = [];
  let _attachEvents_decorators;
  let _attachEvents_initializers = [];
  let _attachEvents_extraInitializers = [];
  let _detachEvents_decorators;
  let _detachEvents_initializers = [];
  let _detachEvents_extraInitializers = [];
  var RouterOutlet = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      _name_decorators = [Input()];
      _activateEvents_decorators = [Output('activate')];
      _deactivateEvents_decorators = [Output('deactivate')];
      _attachEvents_decorators = [Output('attach')];
      _detachEvents_decorators = [Output('detach')];
      __esDecorate(
        null,
        null,
        _name_decorators,
        {
          kind: 'field',
          name: 'name',
          static: false,
          private: false,
          access: {
            has: (obj) => 'name' in obj,
            get: (obj) => obj.name,
            set: (obj, value) => {
              obj.name = value;
            },
          },
          metadata: _metadata,
        },
        _name_initializers,
        _name_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _activateEvents_decorators,
        {
          kind: 'field',
          name: 'activateEvents',
          static: false,
          private: false,
          access: {
            has: (obj) => 'activateEvents' in obj,
            get: (obj) => obj.activateEvents,
            set: (obj, value) => {
              obj.activateEvents = value;
            },
          },
          metadata: _metadata,
        },
        _activateEvents_initializers,
        _activateEvents_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _deactivateEvents_decorators,
        {
          kind: 'field',
          name: 'deactivateEvents',
          static: false,
          private: false,
          access: {
            has: (obj) => 'deactivateEvents' in obj,
            get: (obj) => obj.deactivateEvents,
            set: (obj, value) => {
              obj.deactivateEvents = value;
            },
          },
          metadata: _metadata,
        },
        _deactivateEvents_initializers,
        _deactivateEvents_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _attachEvents_decorators,
        {
          kind: 'field',
          name: 'attachEvents',
          static: false,
          private: false,
          access: {
            has: (obj) => 'attachEvents' in obj,
            get: (obj) => obj.attachEvents,
            set: (obj, value) => {
              obj.attachEvents = value;
            },
          },
          metadata: _metadata,
        },
        _attachEvents_initializers,
        _attachEvents_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _detachEvents_decorators,
        {
          kind: 'field',
          name: 'detachEvents',
          static: false,
          private: false,
          access: {
            has: (obj) => 'detachEvents' in obj,
            get: (obj) => obj.detachEvents,
            set: (obj, value) => {
              obj.detachEvents = value;
            },
          },
          metadata: _metadata,
        },
        _detachEvents_initializers,
        _detachEvents_extraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      RouterOutlet = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    activated = null;
    /** @internal */
    get activatedComponentRef() {
      return this.activated;
    }
    _activatedRoute = null;
    /**
     * The name of the outlet
     *
     */
    name = __runInitializers(this, _name_initializers, PRIMARY_OUTLET);
    activateEvents =
      (__runInitializers(this, _name_extraInitializers),
      __runInitializers(this, _activateEvents_initializers, new EventEmitter()));
    deactivateEvents =
      (__runInitializers(this, _activateEvents_extraInitializers),
      __runInitializers(this, _deactivateEvents_initializers, new EventEmitter()));
    /**
     * Emits an attached component instance when the `RouteReuseStrategy` instructs to re-attach a
     * previously detached subtree.
     **/
    attachEvents =
      (__runInitializers(this, _deactivateEvents_extraInitializers),
      __runInitializers(this, _attachEvents_initializers, new EventEmitter()));
    /**
     * Emits a detached component instance when the `RouteReuseStrategy` instructs to detach the
     * subtree.
     */
    detachEvents =
      (__runInitializers(this, _attachEvents_extraInitializers),
      __runInitializers(this, _detachEvents_initializers, new EventEmitter()));
    /**
     * Data that will be provided to the child injector through the `ROUTER_OUTLET_DATA` token.
     *
     * When unset, the value of the token is `undefined` by default.
     */
    routerOutletData = (__runInitializers(this, _detachEvents_extraInitializers), input(undefined));
    parentContexts = inject(ChildrenOutletContexts);
    location = inject(ViewContainerRef);
    changeDetector = inject(ChangeDetectorRef);
    inputBinder = inject(INPUT_BINDER, {optional: true});
    /** @docs-private */
    supportsBindingToComponentInputs = true;
    /** @docs-private */
    ngOnChanges(changes) {
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
    /** @docs-private */
    ngOnDestroy() {
      // Ensure that the registered outlet is this one before removing it on the context.
      if (this.isTrackedInParentContexts(this.name)) {
        this.parentContexts.onChildOutletDestroyed(this.name);
      }
      this.inputBinder?.unsubscribeFromRouteData(this);
    }
    isTrackedInParentContexts(outletName) {
      return this.parentContexts.getContext(outletName)?.outlet === this;
    }
    /** @docs-private */
    ngOnInit() {
      this.initializeOutletWithName();
    }
    initializeOutletWithName() {
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
    get isActivated() {
      return !!this.activated;
    }
    /**
     * @returns The currently activated component instance.
     * @throws An error if the outlet is not activated.
     */
    get component() {
      if (!this.activated)
        throw new RuntimeError(
          4012 /* RuntimeErrorCode.OUTLET_NOT_ACTIVATED */,
          (typeof ngDevMode === 'undefined' || ngDevMode) && 'Outlet is not activated',
        );
      return this.activated.instance;
    }
    get activatedRoute() {
      if (!this.activated)
        throw new RuntimeError(
          4012 /* RuntimeErrorCode.OUTLET_NOT_ACTIVATED */,
          (typeof ngDevMode === 'undefined' || ngDevMode) && 'Outlet is not activated',
        );
      return this._activatedRoute;
    }
    get activatedRouteData() {
      if (this._activatedRoute) {
        return this._activatedRoute.snapshot.data;
      }
      return {};
    }
    /**
     * Called when the `RouteReuseStrategy` instructs to detach the subtree
     */
    detach() {
      if (!this.activated)
        throw new RuntimeError(
          4012 /* RuntimeErrorCode.OUTLET_NOT_ACTIVATED */,
          (typeof ngDevMode === 'undefined' || ngDevMode) && 'Outlet is not activated',
        );
      this.location.detach();
      const cmp = this.activated;
      this.activated = null;
      this._activatedRoute = null;
      this.detachEvents.emit(cmp.instance);
      return cmp;
    }
    /**
     * Called when the `RouteReuseStrategy` instructs to re-attach a previously detached subtree
     */
    attach(ref, activatedRoute) {
      this.activated = ref;
      this._activatedRoute = activatedRoute;
      this.location.insert(ref.hostView);
      this.inputBinder?.bindActivatedRouteToOutletComponent(this);
      this.attachEvents.emit(ref.instance);
    }
    deactivate() {
      if (this.activated) {
        const c = this.component;
        this.activated.destroy();
        this.activated = null;
        this._activatedRoute = null;
        this.deactivateEvents.emit(c);
      }
    }
    activateWith(activatedRoute, environmentInjector) {
      if (this.isActivated) {
        throw new RuntimeError(
          4013 /* RuntimeErrorCode.OUTLET_ALREADY_ACTIVATED */,
          (typeof ngDevMode === 'undefined' || ngDevMode) &&
            'Cannot activate an already activated outlet',
        );
      }
      this._activatedRoute = activatedRoute;
      const location = this.location;
      const snapshot = activatedRoute.snapshot;
      const component = snapshot.component;
      const childContexts = this.parentContexts.getOrCreateContext(this.name).children;
      const injector = new OutletInjector(
        activatedRoute,
        childContexts,
        location.injector,
        this.routerOutletData,
      );
      this.activated = location.createComponent(component, {
        index: location.length,
        injector,
        environmentInjector: environmentInjector,
      });
      // Calling `markForCheck` to make sure we will run the change detection when the
      // `RouterOutlet` is inside a `ChangeDetectionStrategy.OnPush` component.
      this.changeDetector.markForCheck();
      this.inputBinder?.bindActivatedRouteToOutletComponent(this);
      this.activateEvents.emit(this.activated.instance);
    }
  };
  return (RouterOutlet = _classThis);
})();
export {RouterOutlet};
class OutletInjector {
  route;
  childContexts;
  parent;
  outletData;
  constructor(route, childContexts, parent, outletData) {
    this.route = route;
    this.childContexts = childContexts;
    this.parent = parent;
    this.outletData = outletData;
  }
  get(token, notFoundValue) {
    if (token === ActivatedRoute) {
      return this.route;
    }
    if (token === ChildrenOutletContexts) {
      return this.childContexts;
    }
    if (token === ROUTER_OUTLET_DATA) {
      return this.outletData;
    }
    return this.parent.get(token, notFoundValue);
  }
}
export const INPUT_BINDER = new InjectionToken('');
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
let RoutedComponentInputBinder = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var RoutedComponentInputBinder = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      RoutedComponentInputBinder = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    outletDataSubscriptions = new Map();
    bindActivatedRouteToOutletComponent(outlet) {
      this.unsubscribeFromRouteData(outlet);
      this.subscribeToRouteData(outlet);
    }
    unsubscribeFromRouteData(outlet) {
      this.outletDataSubscriptions.get(outlet)?.unsubscribe();
      this.outletDataSubscriptions.delete(outlet);
    }
    subscribeToRouteData(outlet) {
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
  };
  return (RoutedComponentInputBinder = _classThis);
})();
export {RoutedComponentInputBinder};
//# sourceMappingURL=router_outlet.js.map
