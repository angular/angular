"use strict";
var core_1 = require('@angular/core');
var router_outlet_map_1 = require('./router_outlet_map');
var recognize_1 = require('./recognize');
var resolve_1 = require('./resolve');
var create_router_state_1 = require('./create_router_state');
var url_tree_1 = require('./url_tree');
var shared_1 = require('./shared');
var router_state_1 = require('./router_state');
var create_url_tree_1 = require('./create_url_tree');
var collection_1 = require('./utils/collection');
var Subject_1 = require('rxjs/Subject');
require('rxjs/add/operator/map');
require('rxjs/add/operator/scan');
require('rxjs/add/operator/mergeMap');
require('rxjs/add/operator/concat');
require('rxjs/add/operator/concatMap');
var of_1 = require('rxjs/observable/of');
var forkJoin_1 = require('rxjs/observable/forkJoin');
var NavigationStart = (function () {
    function NavigationStart(id, url) {
        this.id = id;
        this.url = url;
    }
    return NavigationStart;
}());
exports.NavigationStart = NavigationStart;
var NavigationEnd = (function () {
    function NavigationEnd(id, url) {
        this.id = id;
        this.url = url;
    }
    return NavigationEnd;
}());
exports.NavigationEnd = NavigationEnd;
var NavigationCancel = (function () {
    function NavigationCancel(id, url) {
        this.id = id;
        this.url = url;
    }
    return NavigationCancel;
}());
exports.NavigationCancel = NavigationCancel;
var NavigationError = (function () {
    function NavigationError(id, url, error) {
        this.id = id;
        this.url = url;
        this.error = error;
    }
    return NavigationError;
}());
exports.NavigationError = NavigationError;
var Router = (function () {
    function Router(rootComponentType, resolver, urlSerializer, outletMap, location, injector) {
        this.rootComponentType = rootComponentType;
        this.resolver = resolver;
        this.urlSerializer = urlSerializer;
        this.outletMap = outletMap;
        this.location = location;
        this.injector = injector;
        this.navigationId = 0;
        this.routerEvents = new Subject_1.Subject();
        this.currentUrlTree = url_tree_1.createEmptyUrlTree();
        this.currentRouterState = router_state_1.createEmptyState(rootComponentType);
        this.setUpLocationChangeListener();
        this.navigateByUrl(this.location.path());
    }
    Object.defineProperty(Router.prototype, "routerState", {
        get: function () {
            return this.currentRouterState;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Router.prototype, "urlTree", {
        get: function () {
            return this.currentUrlTree;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Router.prototype, "events", {
        get: function () {
            return this.routerEvents;
        },
        enumerable: true,
        configurable: true
    });
    Router.prototype.navigateByUrl = function (url) {
        var urlTree = this.urlSerializer.parse(url);
        return this.scheduleNavigation(urlTree, false);
    };
    Router.prototype.resetConfig = function (config) {
        this.config = config;
    };
    Router.prototype.dispose = function () { this.locationSubscription.unsubscribe(); };
    Router.prototype.createUrlTree = function (commands, _a) {
        var _b = _a === void 0 ? {} : _a, relativeTo = _b.relativeTo, queryParameters = _b.queryParameters, fragment = _b.fragment;
        var a = relativeTo ? relativeTo : this.routerState.root;
        return create_url_tree_1.createUrlTree(a, this.currentUrlTree, commands, queryParameters, fragment);
    };
    Router.prototype.navigate = function (commands, extras) {
        if (extras === void 0) { extras = {}; }
        return this.scheduleNavigation(this.createUrlTree(commands, extras), false);
    };
    Router.prototype.serializeUrl = function (url) { return this.urlSerializer.serialize(url); };
    Router.prototype.parseUrl = function (url) { return this.urlSerializer.parse(url); };
    Router.prototype.scheduleNavigation = function (url, pop) {
        var _this = this;
        var id = ++this.navigationId;
        this.routerEvents.next(new NavigationStart(id, url));
        return Promise.resolve().then(function (_) { return _this.runNavigate(url, false, id); });
    };
    Router.prototype.setUpLocationChangeListener = function () {
        var _this = this;
        this.locationSubscription = this.location.subscribe(function (change) {
            return _this.scheduleNavigation(_this.urlSerializer.parse(change['url']), change['pop']);
        });
    };
    Router.prototype.runNavigate = function (url, pop, id) {
        var _this = this;
        if (id !== this.navigationId) {
            this.routerEvents.next(new NavigationCancel(id, url));
            return Promise.resolve(false);
        }
        return new Promise(function (resolvePromise, rejectPromise) {
            var state;
            recognize_1.recognize(_this.rootComponentType, _this.config, url).mergeMap(function (newRouterStateSnapshot) {
                return resolve_1.resolve(_this.resolver, newRouterStateSnapshot);
            }).map(function (routerStateSnapshot) {
                return create_router_state_1.createRouterState(routerStateSnapshot, _this.currentRouterState);
            }).map(function (newState) {
                state = newState;
            }).mergeMap(function (_) {
                return new GuardChecks(state.snapshot, _this.currentRouterState.snapshot, _this.injector).check(_this.outletMap);
            }).forEach(function (shouldActivate) {
                if (!shouldActivate || id !== _this.navigationId) {
                    _this.routerEvents.next(new NavigationCancel(id, url));
                    return Promise.resolve(false);
                }
                new ActivateRoutes(state, _this.currentRouterState).activate(_this.outletMap);
                _this.currentUrlTree = url;
                _this.currentRouterState = state;
                if (!pop) {
                    _this.location.go(_this.urlSerializer.serialize(url));
                }
            }).then(function () {
                _this.routerEvents.next(new NavigationEnd(id, url));
                resolvePromise(true);
            }, function (e) {
                _this.routerEvents.next(new NavigationError(id, url, e));
                rejectPromise(e);
            });
        });
    };
    return Router;
}());
exports.Router = Router;
var CanActivate = (function () {
    function CanActivate(route) {
        this.route = route;
    }
    return CanActivate;
}());
var CanDeactivate = (function () {
    function CanDeactivate(component, route) {
        this.component = component;
        this.route = route;
    }
    return CanDeactivate;
}());
var GuardChecks = (function () {
    function GuardChecks(future, curr, injector) {
        this.future = future;
        this.curr = curr;
        this.injector = injector;
        this.checks = [];
    }
    GuardChecks.prototype.check = function (parentOutletMap) {
        var _this = this;
        var futureRoot = this.future._root;
        var currRoot = this.curr ? this.curr._root : null;
        this.traverseChildRoutes(futureRoot, currRoot, parentOutletMap);
        if (this.checks.length === 0)
            return of_1.of(true);
        return forkJoin_1.forkJoin(this.checks.map(function (s) {
            if (s instanceof CanActivate) {
                return _this.runCanActivate(s.route);
            }
            else if (s instanceof CanDeactivate) {
                return _this.runCanDeactivate(s.component, s.route);
            }
            else {
                throw new Error("Cannot be reached");
            }
        })).map(collection_1.and);
    };
    GuardChecks.prototype.traverseChildRoutes = function (futureNode, currNode, outletMap) {
        var _this = this;
        var prevChildren = nodeChildrenAsMap(currNode);
        futureNode.children.forEach(function (c) {
            _this.traverseRoutes(c, prevChildren[c.value.outlet], outletMap);
            delete prevChildren[c.value.outlet];
        });
        collection_1.forEach(prevChildren, function (v, k) { return _this.deactivateOutletAndItChildren(v, outletMap._outlets[k]); });
    };
    GuardChecks.prototype.traverseRoutes = function (futureNode, currNode, parentOutletMap) {
        var future = futureNode.value;
        var curr = currNode ? currNode.value : null;
        var outlet = parentOutletMap ? parentOutletMap._outlets[futureNode.value.outlet] : null;
        if (curr && future._routeConfig === curr._routeConfig) {
            if (!collection_1.shallowEqual(future.params, curr.params)) {
                this.checks.push(new CanDeactivate(outlet.component, curr), new CanActivate(future));
            }
            this.traverseChildRoutes(futureNode, currNode, outlet ? outlet.outletMap : null);
        }
        else {
            this.deactivateOutletAndItChildren(curr, outlet);
            this.checks.push(new CanActivate(future));
            this.traverseChildRoutes(futureNode, null, outlet ? outlet.outletMap : null);
        }
    };
    GuardChecks.prototype.deactivateOutletAndItChildren = function (route, outlet) {
        var _this = this;
        if (outlet && outlet.isActivated) {
            collection_1.forEach(outlet.outletMap._outlets, function (v, k) { return _this.deactivateOutletAndItChildren(v, outlet.outletMap._outlets[k]); });
            this.checks.push(new CanDeactivate(outlet.component, route));
        }
    };
    GuardChecks.prototype.runCanActivate = function (future) {
        var _this = this;
        var canActivate = future._routeConfig ? future._routeConfig.canActivate : null;
        if (!canActivate || canActivate.length === 0)
            return of_1.of(true);
        return forkJoin_1.forkJoin(canActivate.map(function (c) {
            var guard = _this.injector.get(c);
            if (guard.canActivate) {
                return of_1.of(guard.canActivate(future, _this.future));
            }
            else {
                return of_1.of(guard(future, _this.future));
            }
        })).map(collection_1.and);
    };
    GuardChecks.prototype.runCanDeactivate = function (component, curr) {
        var _this = this;
        var canDeactivate = curr._routeConfig ? curr._routeConfig.canDeactivate : null;
        if (!canDeactivate || canDeactivate.length === 0)
            return of_1.of(true);
        return forkJoin_1.forkJoin(canDeactivate.map(function (c) {
            var guard = _this.injector.get(c);
            if (guard.canDeactivate) {
                return of_1.of(guard.canDeactivate(component, curr, _this.curr));
            }
            else {
                return of_1.of(guard(component, curr, _this.curr));
            }
        })).map(collection_1.and);
    };
    return GuardChecks;
}());
var ActivateRoutes = (function () {
    function ActivateRoutes(futureState, currState) {
        this.futureState = futureState;
        this.currState = currState;
    }
    ActivateRoutes.prototype.activate = function (parentOutletMap) {
        var futureRoot = this.futureState._root;
        var currRoot = this.currState ? this.currState._root : null;
        pushQueryParamsAndFragment(this.futureState);
        this.activateChildRoutes(futureRoot, currRoot, parentOutletMap);
    };
    ActivateRoutes.prototype.activateChildRoutes = function (futureNode, currNode, outletMap) {
        var _this = this;
        var prevChildren = nodeChildrenAsMap(currNode);
        futureNode.children.forEach(function (c) {
            _this.activateRoutes(c, prevChildren[c.value.outlet], outletMap);
            delete prevChildren[c.value.outlet];
        });
        collection_1.forEach(prevChildren, function (v, k) { return _this.deactivateOutletAndItChildren(outletMap._outlets[k]); });
    };
    ActivateRoutes.prototype.activateRoutes = function (futureNode, currNode, parentOutletMap) {
        var future = futureNode.value;
        var curr = currNode ? currNode.value : null;
        var outlet = getOutlet(parentOutletMap, futureNode.value);
        if (future === curr) {
            router_state_1.advanceActivatedRoute(future);
            this.activateChildRoutes(futureNode, currNode, outlet.outletMap);
        }
        else {
            this.deactivateOutletAndItChildren(outlet);
            var outletMap = new router_outlet_map_1.RouterOutletMap();
            this.activateNewRoutes(outletMap, future, outlet);
            this.activateChildRoutes(futureNode, null, outletMap);
        }
    };
    ActivateRoutes.prototype.activateNewRoutes = function (outletMap, future, outlet) {
        var resolved = core_1.ReflectiveInjector.resolve([
            { provide: router_state_1.ActivatedRoute, useValue: future },
            { provide: router_outlet_map_1.RouterOutletMap, useValue: outletMap }
        ]);
        outlet.activate(future._futureSnapshot._resolvedComponentFactory, resolved, outletMap);
        router_state_1.advanceActivatedRoute(future);
    };
    ActivateRoutes.prototype.deactivateOutletAndItChildren = function (outlet) {
        var _this = this;
        if (outlet && outlet.isActivated) {
            collection_1.forEach(outlet.outletMap._outlets, function (v, k) { return _this.deactivateOutletAndItChildren(v); });
            outlet.deactivate();
        }
    };
    return ActivateRoutes;
}());
function pushQueryParamsAndFragment(state) {
    if (!collection_1.shallowEqual(state.snapshot.queryParams, state.queryParams.value)) {
        state.queryParams.next(state.snapshot.queryParams);
    }
    if (state.snapshot.fragment !== state.fragment.value) {
        state.fragment.next(state.snapshot.fragment);
    }
}
function nodeChildrenAsMap(node) {
    return node ?
        node.children.reduce(function (m, c) {
            m[c.value.outlet] = c;
            return m;
        }, {}) :
        {};
}
function getOutlet(outletMap, route) {
    var outlet = outletMap._outlets[route.outlet];
    if (!outlet) {
        if (route.outlet === shared_1.PRIMARY_OUTLET) {
            throw new Error("Cannot find primary outlet");
        }
        else {
            throw new Error("Cannot find the outlet " + route.outlet);
        }
    }
    return outlet;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3JvdXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEscUJBQXNFLGVBQWUsQ0FBQyxDQUFBO0FBR3RGLGtDQUFnQyxxQkFBcUIsQ0FBQyxDQUFBO0FBQ3RELDBCQUEwQixhQUFhLENBQUMsQ0FBQTtBQUN4Qyx3QkFBd0IsV0FBVyxDQUFDLENBQUE7QUFDcEMsb0NBQWtDLHVCQUF1QixDQUFDLENBQUE7QUFFMUQseUJBQTRDLFlBQVksQ0FBQyxDQUFBO0FBQ3pELHVCQUF1QyxVQUFVLENBQUMsQ0FBQTtBQUNsRCw2QkFBaUksZ0JBQWdCLENBQUMsQ0FBQTtBQUdsSixnQ0FBOEIsbUJBQW1CLENBQUMsQ0FBQTtBQUNsRCwyQkFBMkMsb0JBQW9CLENBQUMsQ0FBQTtBQUdoRSx3QkFBd0IsY0FBYyxDQUFDLENBQUE7QUFDdkMsUUFBTyx1QkFBdUIsQ0FBQyxDQUFBO0FBQy9CLFFBQU8sd0JBQXdCLENBQUMsQ0FBQTtBQUNoQyxRQUFPLDRCQUE0QixDQUFDLENBQUE7QUFDcEMsUUFBTywwQkFBMEIsQ0FBQyxDQUFBO0FBQ2xDLFFBQU8sNkJBQTZCLENBQUMsQ0FBQTtBQUNyQyxtQkFBaUIsb0JBQW9CLENBQUMsQ0FBQTtBQUN0Qyx5QkFBdUIsMEJBQTBCLENBQUMsQ0FBQTtBQU9sRDtJQUErQix5QkFBbUIsRUFBUyxFQUFTLEdBQVc7UUFBN0IsT0FBRSxHQUFGLEVBQUUsQ0FBTztRQUFTLFFBQUcsR0FBSCxHQUFHLENBQVE7SUFBRyxDQUFDO0lBQUMsc0JBQUM7QUFBRCxDQUFDLEFBQXJGLElBQXFGO0FBQXhFLHVCQUFlLGtCQUF5RCxDQUFBO0FBS3JGO0lBQTZCLHVCQUFtQixFQUFTLEVBQVMsR0FBVztRQUE3QixPQUFFLEdBQUYsRUFBRSxDQUFPO1FBQVMsUUFBRyxHQUFILEdBQUcsQ0FBUTtJQUFHLENBQUM7SUFBQyxvQkFBQztBQUFELENBQUMsQUFBbkYsSUFBbUY7QUFBdEUscUJBQWEsZ0JBQXlELENBQUE7QUFLbkY7SUFBZ0MsMEJBQW1CLEVBQVMsRUFBUyxHQUFXO1FBQTdCLE9BQUUsR0FBRixFQUFFLENBQU87UUFBUyxRQUFHLEdBQUgsR0FBRyxDQUFRO0lBQUcsQ0FBQztJQUFDLHVCQUFDO0FBQUQsQ0FBQyxBQUF0RixJQUFzRjtBQUF6RSx3QkFBZ0IsbUJBQXlELENBQUE7QUFLdEY7SUFBK0IseUJBQW1CLEVBQVMsRUFBUyxHQUFXLEVBQVMsS0FBUztRQUEvQyxPQUFFLEdBQUYsRUFBRSxDQUFPO1FBQVMsUUFBRyxHQUFILEdBQUcsQ0FBUTtRQUFTLFVBQUssR0FBTCxLQUFLLENBQUk7SUFBRyxDQUFDO0lBQUMsc0JBQUM7QUFBRCxDQUFDLEFBQXZHLElBQXVHO0FBQTFGLHVCQUFlLGtCQUEyRSxDQUFBO0FBT3ZHO0lBV0UsZ0JBQW9CLGlCQUFzQixFQUFVLFFBQTJCLEVBQVUsYUFBNEIsRUFBVSxTQUEwQixFQUFVLFFBQWtCLEVBQVUsUUFBa0I7UUFBN0wsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFLO1FBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBbUI7UUFBVSxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUFVLGNBQVMsR0FBVCxTQUFTLENBQWlCO1FBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUFVLGFBQVEsR0FBUixRQUFRLENBQVU7UUFMek0saUJBQVksR0FBVyxDQUFDLENBQUM7UUFNL0IsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLGlCQUFPLEVBQVMsQ0FBQztRQUN6QyxJQUFJLENBQUMsY0FBYyxHQUFHLDZCQUFrQixFQUFFLENBQUM7UUFDM0MsSUFBSSxDQUFDLGtCQUFrQixHQUFHLCtCQUFnQixDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDOUQsSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7UUFDbkMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUtELHNCQUFJLCtCQUFXO2FBQWY7WUFDRSxNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDO1FBQ2pDLENBQUM7OztPQUFBO0lBS0Qsc0JBQUksMkJBQU87YUFBWDtZQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDO1FBQzdCLENBQUM7OztPQUFBO0lBS0Qsc0JBQUksMEJBQU07YUFBVjtZQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQzNCLENBQUM7OztPQUFBO0lBZ0JELDhCQUFhLEdBQWIsVUFBYyxHQUFXO1FBQ3ZCLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlDLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFnQkQsNEJBQVcsR0FBWCxVQUFZLE1BQW9CO1FBQzlCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFLRCx3QkFBTyxHQUFQLGNBQWtCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFpQzVELDhCQUFhLEdBQWIsVUFBYyxRQUFlLEVBQUUsRUFBOEQ7WUFBOUQsNEJBQThELEVBQTdELDBCQUFVLEVBQUUsb0NBQWUsRUFBRSxzQkFBUTtRQUNuRSxJQUFNLENBQUMsR0FBRyxVQUFVLEdBQUcsVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO1FBQzFELE1BQU0sQ0FBQywrQkFBYSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDcEYsQ0FBQztJQWtCRCx5QkFBUSxHQUFSLFVBQVMsUUFBZSxFQUFFLE1BQTZCO1FBQTdCLHNCQUE2QixHQUE3QixXQUE2QjtRQUNyRCxNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzlFLENBQUM7SUFLRCw2QkFBWSxHQUFaLFVBQWEsR0FBWSxJQUFZLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFLaEYseUJBQVEsR0FBUixVQUFTLEdBQVcsSUFBYSxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRWhFLG1DQUFrQixHQUExQixVQUEyQixHQUFZLEVBQUUsR0FBWTtRQUFyRCxpQkFJQztRQUhDLElBQU0sRUFBRSxHQUFHLEVBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztRQUNoQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLGVBQWUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNyRCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsRUFBaEMsQ0FBZ0MsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFTyw0Q0FBMkIsR0FBbkM7UUFBQSxpQkFJQztRQUhDLElBQUksQ0FBQyxvQkFBb0IsR0FBUSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxVQUFDLE1BQU07WUFDOUQsTUFBTSxDQUFDLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN6RixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTyw0QkFBVyxHQUFuQixVQUFvQixHQUFZLEVBQUUsR0FBWSxFQUFFLEVBQVU7UUFBMUQsaUJBMENDO1FBekNDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUM3QixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3RELE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hDLENBQUM7UUFFRCxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBQyxjQUFjLEVBQUUsYUFBYTtZQUMvQyxJQUFJLEtBQUssQ0FBQztZQUNWLHFCQUFTLENBQUMsS0FBSSxDQUFDLGlCQUFpQixFQUFFLEtBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQUMsc0JBQXNCO2dCQUNsRixNQUFNLENBQUMsaUJBQU8sQ0FBQyxLQUFJLENBQUMsUUFBUSxFQUFFLHNCQUFzQixDQUFDLENBQUM7WUFFeEQsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUMsbUJBQW1CO2dCQUN6QixNQUFNLENBQUMsdUNBQWlCLENBQUMsbUJBQW1CLEVBQUUsS0FBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFFekUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUMsUUFBb0I7Z0JBQzFCLEtBQUssR0FBRyxRQUFRLENBQUM7WUFFbkIsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQUEsQ0FBQztnQkFDWCxNQUFNLENBQUMsSUFBSSxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxLQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLEtBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRWhILENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLGNBQWM7Z0JBQ3hCLEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxJQUFJLEVBQUUsS0FBSyxLQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztvQkFDaEQsS0FBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDdEQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2hDLENBQUM7Z0JBRUQsSUFBSSxjQUFjLENBQUMsS0FBSyxFQUFFLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRTVFLEtBQUksQ0FBQyxjQUFjLEdBQUcsR0FBRyxDQUFDO2dCQUMxQixLQUFJLENBQUMsa0JBQWtCLEdBQUcsS0FBSyxDQUFDO2dCQUNoQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ1QsS0FBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDdEQsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDTixLQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLGFBQWEsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDbkQsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXZCLENBQUMsRUFBRSxVQUFBLENBQUM7Z0JBQ0YsS0FBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxlQUFlLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4RCxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDSCxhQUFDO0FBQUQsQ0FBQyxBQTNNRCxJQTJNQztBQTNNWSxjQUFNLFNBMk1sQixDQUFBO0FBRUQ7SUFBb0IscUJBQW1CLEtBQTZCO1FBQTdCLFVBQUssR0FBTCxLQUFLLENBQXdCO0lBQUcsQ0FBQztJQUFBLGtCQUFDO0FBQUQsQ0FBQyxBQUF6RSxJQUF5RTtBQUN6RTtJQUFzQix1QkFBbUIsU0FBaUIsRUFBUyxLQUE2QjtRQUF2RCxjQUFTLEdBQVQsU0FBUyxDQUFRO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBd0I7SUFBRyxDQUFDO0lBQUEsb0JBQUM7QUFBRCxDQUFDLEFBQXJHLElBQXFHO0FBRXJHO0lBRUUscUJBQW9CLE1BQTJCLEVBQVUsSUFBeUIsRUFBVSxRQUFrQjtRQUExRixXQUFNLEdBQU4sTUFBTSxDQUFxQjtRQUFVLFNBQUksR0FBSixJQUFJLENBQXFCO1FBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUR0RyxXQUFNLEdBQUcsRUFBRSxDQUFDO0lBQzZGLENBQUM7SUFFbEgsMkJBQUssR0FBTCxVQUFNLGVBQWdDO1FBQXRDLGlCQWNDO1FBYkMsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDckMsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDcEQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDaEUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLE9BQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QyxNQUFNLENBQUMsbUJBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUM7WUFDL0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQzdCLE1BQU0sQ0FBQyxLQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUNyQyxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxhQUFhLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxNQUFNLENBQUMsS0FBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JELENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixNQUFNLElBQUksS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDdkMsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLGdCQUFHLENBQUMsQ0FBQztJQUNmLENBQUM7SUFFTyx5Q0FBbUIsR0FBM0IsVUFBNEIsVUFBNEMsRUFDNUMsUUFBaUQsRUFDakQsU0FBaUM7UUFGN0QsaUJBU0M7UUFOQyxJQUFNLFlBQVksR0FBRyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqRCxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUM7WUFDM0IsS0FBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDaEUsT0FBTyxZQUFZLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0QyxDQUFDLENBQUMsQ0FBQztRQUNILG9CQUFPLENBQUMsWUFBWSxFQUFFLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUE1RCxDQUE0RCxDQUFDLENBQUM7SUFDaEcsQ0FBQztJQUVELG9DQUFjLEdBQWQsVUFBZSxVQUE0QyxFQUFFLFFBQWlELEVBQy9GLGVBQXVDO1FBQ3BELElBQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUM7UUFDaEMsSUFBTSxJQUFJLEdBQUcsUUFBUSxHQUFHLFFBQVEsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQzlDLElBQU0sTUFBTSxHQUFHLGVBQWUsR0FBRyxlQUFlLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBRTFGLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsWUFBWSxLQUFLLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ3RELEVBQUUsQ0FBQyxDQUFDLENBQUMseUJBQVksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksYUFBYSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN2RixDQUFDO1lBQ0QsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsTUFBTSxHQUFHLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDbkYsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sSUFBSSxDQUFDLDZCQUE2QixDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNqRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLE1BQU0sR0FBRyxNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQy9FLENBQUM7SUFDSCxDQUFDO0lBRU8sbURBQTZCLEdBQXJDLFVBQXNDLEtBQTZCLEVBQUUsTUFBb0I7UUFBekYsaUJBS0M7UUFKQyxFQUFFLENBQUMsQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDakMsb0JBQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxLQUFJLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQW5FLENBQW1FLENBQUMsQ0FBQztZQUNsSCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLGFBQWEsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUE7UUFDOUQsQ0FBQztJQUNILENBQUM7SUFFTyxvQ0FBYyxHQUF0QixVQUF1QixNQUE4QjtRQUFyRCxpQkFXQztRQVZDLElBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ2pGLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLE9BQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5RCxNQUFNLENBQUMsbUJBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQztZQUMvQixJQUFNLEtBQUssR0FBRyxLQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztnQkFDdEIsTUFBTSxDQUFDLE9BQUUsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxLQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNwRCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sTUFBTSxDQUFDLE9BQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxnQkFBRyxDQUFDLENBQUM7SUFDZixDQUFDO0lBRU8sc0NBQWdCLEdBQXhCLFVBQXlCLFNBQWlCLEVBQUUsSUFBNEI7UUFBeEUsaUJBV0M7UUFWQyxJQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztRQUNqRixFQUFFLENBQUMsQ0FBQyxDQUFDLGFBQWEsSUFBSSxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxPQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEUsTUFBTSxDQUFDLG1CQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUM7WUFDakMsSUFBTSxLQUFLLEdBQUcsS0FBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLE1BQU0sQ0FBQyxPQUFFLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzdELENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixNQUFNLENBQUMsT0FBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQy9DLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxnQkFBRyxDQUFDLENBQUM7SUFDZixDQUFDO0lBQ0gsa0JBQUM7QUFBRCxDQUFDLEFBakZELElBaUZDO0FBRUQ7SUFDRSx3QkFBb0IsV0FBd0IsRUFBVSxTQUFzQjtRQUF4RCxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUFVLGNBQVMsR0FBVCxTQUFTLENBQWE7SUFBRyxDQUFDO0lBRWhGLGlDQUFRLEdBQVIsVUFBUyxlQUFnQztRQUN2QyxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQztRQUMxQyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUU5RCwwQkFBMEIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVPLDRDQUFtQixHQUEzQixVQUE0QixVQUFvQyxFQUNwQyxRQUF5QyxFQUN6QyxTQUEwQjtRQUZ0RCxpQkFTQztRQU5DLElBQU0sWUFBWSxHQUFHLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2pELFVBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQztZQUMzQixLQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNoRSxPQUFPLFlBQVksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsb0JBQU8sQ0FBQyxZQUFZLEVBQUUsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsS0FBSSxDQUFDLDZCQUE2QixDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBekQsQ0FBeUQsQ0FBQyxDQUFDO0lBQzdGLENBQUM7SUFFRCx1Q0FBYyxHQUFkLFVBQWUsVUFBb0MsRUFBRSxRQUF5QyxFQUMvRSxlQUFnQztRQUM3QyxJQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDO1FBQ2hDLElBQU0sSUFBSSxHQUFHLFFBQVEsR0FBRyxRQUFRLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUM5QyxJQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsZUFBZSxFQUFFLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUU1RCxFQUFFLENBQUMsQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNwQixvQ0FBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sSUFBSSxDQUFDLDZCQUE2QixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNDLElBQU0sU0FBUyxHQUFHLElBQUksbUNBQWUsRUFBRSxDQUFDO1lBQ3hDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2xELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3hELENBQUM7SUFDSCxDQUFDO0lBRU8sMENBQWlCLEdBQXpCLFVBQTBCLFNBQTBCLEVBQUUsTUFBc0IsRUFBRSxNQUFvQjtRQUNoRyxJQUFNLFFBQVEsR0FBRyx5QkFBa0IsQ0FBQyxPQUFPLENBQUM7WUFDMUMsRUFBQyxPQUFPLEVBQUUsNkJBQWMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFDO1lBQzNDLEVBQUMsT0FBTyxFQUFFLG1DQUFlLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBQztTQUNoRCxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMseUJBQXlCLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZGLG9DQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFTyxzREFBNkIsR0FBckMsVUFBc0MsTUFBb0I7UUFBMUQsaUJBS0M7UUFKQyxFQUFFLENBQUMsQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDakMsb0JBQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxLQUFJLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDLEVBQXJDLENBQXFDLENBQUMsQ0FBQztZQUNwRixNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDdEIsQ0FBQztJQUNILENBQUM7SUFDSCxxQkFBQztBQUFELENBQUMsQUF0REQsSUFzREM7QUFFRCxvQ0FBb0MsS0FBa0I7SUFDcEQsRUFBRSxDQUFDLENBQUMsQ0FBQyx5QkFBWSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFRLEtBQUssQ0FBQyxXQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hFLEtBQUssQ0FBQyxXQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxLQUFXLEtBQUssQ0FBQyxRQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN0RCxLQUFLLENBQUMsUUFBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3RELENBQUM7QUFDSCxDQUFDO0FBRUQsMkJBQTJCLElBQXdCO0lBQ2pELE1BQU0sQ0FBQyxJQUFJO1FBQ1QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQ2xCLFVBQUMsQ0FBQyxFQUFFLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEIsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNYLENBQUMsRUFDRCxFQUFFLENBQUM7UUFDUCxFQUFFLENBQUM7QUFDTCxDQUFDO0FBRUQsbUJBQW1CLFNBQTBCLEVBQUUsS0FBcUI7SUFDbEUsSUFBSSxNQUFNLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDOUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ1osRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyx1QkFBYyxDQUFDLENBQUMsQ0FBQztZQUNwQyxNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBMEIsS0FBSyxDQUFDLE1BQVEsQ0FBQyxDQUFDO1FBQzVELENBQUM7SUFDSCxDQUFDO0lBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNoQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50UmVzb2x2ZXIsIFJlZmxlY3RpdmVJbmplY3RvciwgVHlwZSwgSW5qZWN0b3IgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IExvY2F0aW9uIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IFVybFNlcmlhbGl6ZXIgfSBmcm9tICcuL3VybF9zZXJpYWxpemVyJztcbmltcG9ydCB7IFJvdXRlck91dGxldE1hcCB9IGZyb20gJy4vcm91dGVyX291dGxldF9tYXAnO1xuaW1wb3J0IHsgcmVjb2duaXplIH0gZnJvbSAnLi9yZWNvZ25pemUnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJy4vcmVzb2x2ZSc7XG5pbXBvcnQgeyBjcmVhdGVSb3V0ZXJTdGF0ZSB9IGZyb20gJy4vY3JlYXRlX3JvdXRlcl9zdGF0ZSc7XG5pbXBvcnQgeyBUcmVlTm9kZSB9IGZyb20gJy4vdXRpbHMvdHJlZSc7XG5pbXBvcnQgeyBVcmxUcmVlLCBjcmVhdGVFbXB0eVVybFRyZWUgfSBmcm9tICcuL3VybF90cmVlJztcbmltcG9ydCB7IFBSSU1BUllfT1VUTEVULCBQYXJhbXMgfSBmcm9tICcuL3NoYXJlZCc7XG5pbXBvcnQgeyBjcmVhdGVFbXB0eVN0YXRlLCBSb3V0ZXJTdGF0ZSwgUm91dGVyU3RhdGVTbmFwc2hvdCwgQWN0aXZhdGVkUm91dGUsIEFjdGl2YXRlZFJvdXRlU25hcHNob3QsIGFkdmFuY2VBY3RpdmF0ZWRSb3V0ZX0gZnJvbSAnLi9yb3V0ZXJfc3RhdGUnO1xuaW1wb3J0IHsgUm91dGVyQ29uZmlnIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgUm91dGVyT3V0bGV0IH0gZnJvbSAnLi9kaXJlY3RpdmVzL3JvdXRlcl9vdXRsZXQnO1xuaW1wb3J0IHsgY3JlYXRlVXJsVHJlZSB9IGZyb20gJy4vY3JlYXRlX3VybF90cmVlJztcbmltcG9ydCB7IGZvckVhY2gsIGFuZCwgc2hhbGxvd0VxdWFsIH0gZnJvbSAnLi91dGlscy9jb2xsZWN0aW9uJztcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzL09ic2VydmFibGUnO1xuaW1wb3J0IHsgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcy9TdWJzY3JpcHRpb24nO1xuaW1wb3J0IHsgU3ViamVjdCB9IGZyb20gJ3J4anMvU3ViamVjdCc7XG5pbXBvcnQgJ3J4anMvYWRkL29wZXJhdG9yL21hcCc7XG5pbXBvcnQgJ3J4anMvYWRkL29wZXJhdG9yL3NjYW4nO1xuaW1wb3J0ICdyeGpzL2FkZC9vcGVyYXRvci9tZXJnZU1hcCc7XG5pbXBvcnQgJ3J4anMvYWRkL29wZXJhdG9yL2NvbmNhdCc7XG5pbXBvcnQgJ3J4anMvYWRkL29wZXJhdG9yL2NvbmNhdE1hcCc7XG5pbXBvcnQge29mfSBmcm9tICdyeGpzL29ic2VydmFibGUvb2YnO1xuaW1wb3J0IHtmb3JrSm9pbn0gZnJvbSAncnhqcy9vYnNlcnZhYmxlL2ZvcmtKb2luJztcblxuZXhwb3J0IGludGVyZmFjZSBOYXZpZ2F0aW9uRXh0cmFzIHsgcmVsYXRpdmVUbz86IEFjdGl2YXRlZFJvdXRlOyBxdWVyeVBhcmFtZXRlcnM/OiBQYXJhbXM7IGZyYWdtZW50Pzogc3RyaW5nOyB9XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIHdoZW4gYSBuYXZpZ2F0aW9uIHN0YXJ0c1xuICovXG5leHBvcnQgY2xhc3MgTmF2aWdhdGlvblN0YXJ0IHsgY29uc3RydWN0b3IocHVibGljIGlkOm51bWJlciwgcHVibGljIHVybDpVcmxUcmVlKSB7fSB9XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIHdoZW4gYSBuYXZpZ2F0aW9uIGVuZHMgc3VjY2Vzc2Z1bGx5XG4gKi9cbmV4cG9ydCBjbGFzcyBOYXZpZ2F0aW9uRW5kIHsgY29uc3RydWN0b3IocHVibGljIGlkOm51bWJlciwgcHVibGljIHVybDpVcmxUcmVlKSB7fSB9XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIHdoZW4gYSBuYXZpZ2F0aW9uIGlzIGNhbmNlbGVkXG4gKi9cbmV4cG9ydCBjbGFzcyBOYXZpZ2F0aW9uQ2FuY2VsIHsgY29uc3RydWN0b3IocHVibGljIGlkOm51bWJlciwgcHVibGljIHVybDpVcmxUcmVlKSB7fSB9XG5cbi8qKlxuICogQW4gZXZlbnQgdHJpZ2dlcmVkIHdoZW4gYSBuYXZpZ2F0aW9uIGZhaWxzIGR1ZSB0byB1bmV4cGVjdGVkIGVycm9yXG4gKi9cbmV4cG9ydCBjbGFzcyBOYXZpZ2F0aW9uRXJyb3IgeyBjb25zdHJ1Y3RvcihwdWJsaWMgaWQ6bnVtYmVyLCBwdWJsaWMgdXJsOlVybFRyZWUsIHB1YmxpYyBlcnJvcjphbnkpIHt9IH1cblxuZXhwb3J0IHR5cGUgRXZlbnQgPSBOYXZpZ2F0aW9uU3RhcnQgfCBOYXZpZ2F0aW9uRW5kIHwgTmF2aWdhdGlvbkNhbmNlbCB8IE5hdmlnYXRpb25FcnJvcjtcblxuLyoqXG4gKiBUaGUgYFJvdXRlcmAgaXMgcmVzcG9uc2libGUgZm9yIG1hcHBpbmcgVVJMcyB0byBjb21wb25lbnRzLlxuICovXG5leHBvcnQgY2xhc3MgUm91dGVyIHtcbiAgcHJpdmF0ZSBjdXJyZW50VXJsVHJlZTogVXJsVHJlZTtcbiAgcHJpdmF0ZSBjdXJyZW50Um91dGVyU3RhdGU6IFJvdXRlclN0YXRlO1xuICBwcml2YXRlIGNvbmZpZzogUm91dGVyQ29uZmlnO1xuICBwcml2YXRlIGxvY2F0aW9uU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XG4gIHByaXZhdGUgcm91dGVyRXZlbnRzOiBTdWJqZWN0PEV2ZW50PjtcbiAgcHJpdmF0ZSBuYXZpZ2F0aW9uSWQ6IG51bWJlciA9IDA7XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByb290Q29tcG9uZW50VHlwZTpUeXBlLCBwcml2YXRlIHJlc29sdmVyOiBDb21wb25lbnRSZXNvbHZlciwgcHJpdmF0ZSB1cmxTZXJpYWxpemVyOiBVcmxTZXJpYWxpemVyLCBwcml2YXRlIG91dGxldE1hcDogUm91dGVyT3V0bGV0TWFwLCBwcml2YXRlIGxvY2F0aW9uOiBMb2NhdGlvbiwgcHJpdmF0ZSBpbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgICB0aGlzLnJvdXRlckV2ZW50cyA9IG5ldyBTdWJqZWN0PEV2ZW50PigpO1xuICAgIHRoaXMuY3VycmVudFVybFRyZWUgPSBjcmVhdGVFbXB0eVVybFRyZWUoKTtcbiAgICB0aGlzLmN1cnJlbnRSb3V0ZXJTdGF0ZSA9IGNyZWF0ZUVtcHR5U3RhdGUocm9vdENvbXBvbmVudFR5cGUpO1xuICAgIHRoaXMuc2V0VXBMb2NhdGlvbkNoYW5nZUxpc3RlbmVyKCk7XG4gICAgdGhpcy5uYXZpZ2F0ZUJ5VXJsKHRoaXMubG9jYXRpb24ucGF0aCgpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHJvdXRlIHN0YXRlLlxuICAgKi9cbiAgZ2V0IHJvdXRlclN0YXRlKCk6IFJvdXRlclN0YXRlIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50Um91dGVyU3RhdGU7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY3VycmVudCB1cmwgdHJlZS5cbiAgICovXG4gIGdldCB1cmxUcmVlKCk6IFVybFRyZWUge1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnRVcmxUcmVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gb2JzZXJ2YWJsZSBvZiByb3V0ZSBldmVudHNcbiAgICovXG4gIGdldCBldmVudHMoKTogT2JzZXJ2YWJsZTxFdmVudD4ge1xuICAgIHJldHVybiB0aGlzLnJvdXRlckV2ZW50cztcbiAgfVxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZSBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgdXJsLiBUaGlzIG5hdmlnYXRpb24gaXMgYWx3YXlzIGFic29sdXRlLlxuICAgKlxuICAgKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0OlxuICAgKiAtIGlzIHJlc29sdmVkIHdpdGggJ3RydWUnIHdoZW4gbmF2aWdhdGlvbiBzdWNjZWVkc1xuICAgKiAtIGlzIHJlc29sdmVkIHdpdGggJ2ZhbHNlJyB3aGVuIG5hdmlnYXRpb24gZmFpbHNcbiAgICogLSBpcyByZWplY3RlZCB3aGVuIGFuIGVycm9yIGhhcHBlbnNcbiAgICpcbiAgICogIyMjIFVzYWdlXG4gICAqXG4gICAqIGBgYFxuICAgKiByb3V0ZXIubmF2aWdhdGVCeVVybChcIi90ZWFtLzMzL3VzZXIvMTFcIik7XG4gICAqIGBgYFxuICAgKi9cbiAgbmF2aWdhdGVCeVVybCh1cmw6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHVybFRyZWUgPSB0aGlzLnVybFNlcmlhbGl6ZXIucGFyc2UodXJsKTtcbiAgICByZXR1cm4gdGhpcy5zY2hlZHVsZU5hdmlnYXRpb24odXJsVHJlZSwgZmFsc2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0cyB0aGUgY29uZmlndXJhdGlvbiB1c2VkIGZvciBuYXZpZ2F0aW9uIGFuZCBnZW5lcmF0aW5nIGxpbmtzLlxuICAgKlxuICAgKiAjIyMgVXNhZ2VcbiAgICpcbiAgICogYGBgXG4gICAqIHJvdXRlci5yZXNldENvbmZpZyhbXG4gICAqICB7IHBhdGg6ICd0ZWFtLzppZCcsIGNvbXBvbmVudDogVGVhbUNtcCwgY2hpbGRyZW46IFtcbiAgICogICAgeyBwYXRoOiAnc2ltcGxlJywgY29tcG9uZW50OiBTaW1wbGVDbXAgfSxcbiAgICogICAgeyBwYXRoOiAndXNlci86bmFtZScsIGNvbXBvbmVudDogVXNlckNtcCB9XG4gICAqICBdIH1cbiAgICogXSk7XG4gICAqIGBgYFxuICAgKi9cbiAgcmVzZXRDb25maWcoY29uZmlnOiBSb3V0ZXJDb25maWcpOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIGRpc3Bvc2UoKTogdm9pZCB7IHRoaXMubG9jYXRpb25TdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTsgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWVzIGFuIGFycmF5IG9mIGNvbW1hbmRzIHRvIHRoZSBjdXJyZW50IHVybCB0cmVlIGFuZCBjcmVhdGVzXG4gICAqIGEgbmV3IHVybCB0cmVlLlxuICAgKlxuICAgKiBXaGVuIGdpdmVuIGFuIGFjdGl2YXRlIHJvdXRlLCBhcHBsaWVzIHRoZSBnaXZlbiBjb21tYW5kcyBzdGFydGluZyBmcm9tIHRoZSByb3V0ZS5cbiAgICogV2hlbiBub3QgZ2l2ZW4gYSByb3V0ZSwgYXBwbGllcyB0aGUgZ2l2ZW4gY29tbWFuZCBzdGFydGluZyBmcm9tIHRoZSByb290LlxuICAgKlxuICAgKiAjIyMgVXNhZ2VcbiAgICpcbiAgICogYGBgXG4gICAqIC8vIGNyZWF0ZSAvdGVhbS8zMy91c2VyLzExXG4gICAqIHJvdXRlci5jcmVhdGVVcmxUcmVlKFsnL3RlYW0nLCAzMywgJ3VzZXInLCAxMV0pO1xuICAgKlxuICAgKiAvLyBjcmVhdGUgL3RlYW0vMzM7ZXhwYW5kPXRydWUvdXNlci8xMVxuICAgKiByb3V0ZXIuY3JlYXRlVXJsVHJlZShbJy90ZWFtJywgMzMsIHtleHBhbmQ6IHRydWV9LCAndXNlcicsIDExXSk7XG4gICAqXG4gICAqIC8vIHlvdSBjYW4gY29sbGFwc2Ugc3RhdGljIGZyYWdtZW50cyBsaWtlIHRoaXNcbiAgICogcm91dGVyLmNyZWF0ZVVybFRyZWUoWycvdGVhbS8zMy91c2VyJywgdXNlcklkXSk7XG4gICAqXG4gICAqIC8vIGFzc3VtaW5nIHRoZSBjdXJyZW50IHVybCBpcyBgL3RlYW0vMzMvdXNlci8xMWAgYW5kIHRoZSByb3V0ZSBwb2ludHMgdG8gYHVzZXIvMTFgXG4gICAqXG4gICAqIC8vIG5hdmlnYXRlIHRvIC90ZWFtLzMzL3VzZXIvMTEvZGV0YWlsc1xuICAgKiByb3V0ZXIuY3JlYXRlVXJsVHJlZShbJ2RldGFpbHMnXSwge3JlbGF0aXZlVG86IHJvdXRlfSk7XG4gICAqXG4gICAqIC8vIG5hdmlnYXRlIHRvIC90ZWFtLzMzL3VzZXIvMjJcbiAgICogcm91dGVyLmNyZWF0ZVVybFRyZWUoWycuLi8yMiddLCB7cmVsYXRpdmVUbzogcm91dGV9KTtcbiAgICpcbiAgICogLy8gbmF2aWdhdGUgdG8gL3RlYW0vNDQvdXNlci8yMlxuICAgKiByb3V0ZXIuY3JlYXRlVXJsVHJlZShbJy4uLy4uL3RlYW0vNDQvdXNlci8yMiddLCB7cmVsYXRpdmVUbzogcm91dGV9KTtcbiAgICogYGBgXG4gICAqL1xuICBjcmVhdGVVcmxUcmVlKGNvbW1hbmRzOiBhbnlbXSwge3JlbGF0aXZlVG8sIHF1ZXJ5UGFyYW1ldGVycywgZnJhZ21lbnR9OiBOYXZpZ2F0aW9uRXh0cmFzID0ge30pOiBVcmxUcmVlIHtcbiAgICBjb25zdCBhID0gcmVsYXRpdmVUbyA/IHJlbGF0aXZlVG8gOiB0aGlzLnJvdXRlclN0YXRlLnJvb3Q7XG4gICAgcmV0dXJuIGNyZWF0ZVVybFRyZWUoYSwgdGhpcy5jdXJyZW50VXJsVHJlZSwgY29tbWFuZHMsIHF1ZXJ5UGFyYW1ldGVycywgZnJhZ21lbnQpO1xuICB9XG5cblxuICAvKipcbiAgICogTmF2aWdhdGUgYmFzZWQgb24gdGhlIHByb3ZpZGVkIGFycmF5IG9mIGNvbW1hbmRzIGFuZCBhIHN0YXJ0aW5nIHBvaW50LlxuICAgKiBJZiBubyBzdGFydGluZyByb3V0ZSBpcyBwcm92aWRlZCwgdGhlIG5hdmlnYXRpb24gaXMgYWJzb2x1dGUuXG4gICAqXG4gICAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQ6XG4gICAqIC0gaXMgcmVzb2x2ZWQgd2l0aCAndHJ1ZScgd2hlbiBuYXZpZ2F0aW9uIHN1Y2NlZWRzXG4gICAqIC0gaXMgcmVzb2x2ZWQgd2l0aCAnZmFsc2UnIHdoZW4gbmF2aWdhdGlvbiBmYWlsc1xuICAgKiAtIGlzIHJlamVjdGVkIHdoZW4gYW4gZXJyb3IgaGFwcGVuc1xuICAgKlxuICAgKiAjIyMgVXNhZ2VcbiAgICpcbiAgICogYGBgXG4gICAqIHJvdXRlci5uYXZpZ2F0ZShbJ3RlYW0nLCAzMywgJ3RlYW0nLCAnMTFdLCB7cmVsYXRpdmVUbzogcm91dGV9KTtcbiAgICogYGBgXG4gICAqL1xuICBuYXZpZ2F0ZShjb21tYW5kczogYW55W10sIGV4dHJhczogTmF2aWdhdGlvbkV4dHJhcyA9IHt9KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuc2NoZWR1bGVOYXZpZ2F0aW9uKHRoaXMuY3JlYXRlVXJsVHJlZShjb21tYW5kcywgZXh0cmFzKSwgZmFsc2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlcmlhbGl6ZXMgYSB7QGxpbmsgVXJsVHJlZX0gaW50byBhIHN0cmluZy5cbiAgICovXG4gIHNlcmlhbGl6ZVVybCh1cmw6IFVybFRyZWUpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy51cmxTZXJpYWxpemVyLnNlcmlhbGl6ZSh1cmwpOyB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIGEgc3RyaW5nIGludG8gYSB7QGxpbmsgVXJsVHJlZX0uXG4gICAqL1xuICBwYXJzZVVybCh1cmw6IHN0cmluZyk6IFVybFRyZWUgeyByZXR1cm4gdGhpcy51cmxTZXJpYWxpemVyLnBhcnNlKHVybCk7IH1cblxuICBwcml2YXRlIHNjaGVkdWxlTmF2aWdhdGlvbih1cmw6IFVybFRyZWUsIHBvcDogYm9vbGVhbik6UHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgaWQgPSArKyB0aGlzLm5hdmlnYXRpb25JZDtcbiAgICB0aGlzLnJvdXRlckV2ZW50cy5uZXh0KG5ldyBOYXZpZ2F0aW9uU3RhcnQoaWQsIHVybCkpO1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKChfKSA9PiB0aGlzLnJ1bk5hdmlnYXRlKHVybCwgZmFsc2UsIGlkKSk7XG4gIH1cblxuICBwcml2YXRlIHNldFVwTG9jYXRpb25DaGFuZ2VMaXN0ZW5lcigpOiB2b2lkIHtcbiAgICB0aGlzLmxvY2F0aW9uU3Vic2NyaXB0aW9uID0gPGFueT50aGlzLmxvY2F0aW9uLnN1YnNjcmliZSgoY2hhbmdlKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5zY2hlZHVsZU5hdmlnYXRpb24odGhpcy51cmxTZXJpYWxpemVyLnBhcnNlKGNoYW5nZVsndXJsJ10pLCBjaGFuZ2VbJ3BvcCddKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcnVuTmF2aWdhdGUodXJsOiBVcmxUcmVlLCBwb3A6IGJvb2xlYW4sIGlkOiBudW1iZXIpOlByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmIChpZCAhPT0gdGhpcy5uYXZpZ2F0aW9uSWQpIHtcbiAgICAgIHRoaXMucm91dGVyRXZlbnRzLm5leHQobmV3IE5hdmlnYXRpb25DYW5jZWwoaWQsIHVybCkpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlUHJvbWlzZSwgcmVqZWN0UHJvbWlzZSkgPT4ge1xuICAgICAgbGV0IHN0YXRlO1xuICAgICAgcmVjb2duaXplKHRoaXMucm9vdENvbXBvbmVudFR5cGUsIHRoaXMuY29uZmlnLCB1cmwpLm1lcmdlTWFwKChuZXdSb3V0ZXJTdGF0ZVNuYXBzaG90KSA9PiB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKHRoaXMucmVzb2x2ZXIsIG5ld1JvdXRlclN0YXRlU25hcHNob3QpO1xuXG4gICAgICB9KS5tYXAoKHJvdXRlclN0YXRlU25hcHNob3QpID0+IHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVJvdXRlclN0YXRlKHJvdXRlclN0YXRlU25hcHNob3QsIHRoaXMuY3VycmVudFJvdXRlclN0YXRlKTtcblxuICAgICAgfSkubWFwKChuZXdTdGF0ZTpSb3V0ZXJTdGF0ZSkgPT4ge1xuICAgICAgICBzdGF0ZSA9IG5ld1N0YXRlO1xuXG4gICAgICB9KS5tZXJnZU1hcChfID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBHdWFyZENoZWNrcyhzdGF0ZS5zbmFwc2hvdCwgdGhpcy5jdXJyZW50Um91dGVyU3RhdGUuc25hcHNob3QsIHRoaXMuaW5qZWN0b3IpLmNoZWNrKHRoaXMub3V0bGV0TWFwKTtcblxuICAgICAgfSkuZm9yRWFjaCgoc2hvdWxkQWN0aXZhdGUpID0+IHtcbiAgICAgICAgaWYgKCFzaG91bGRBY3RpdmF0ZSB8fCBpZCAhPT0gdGhpcy5uYXZpZ2F0aW9uSWQpIHtcbiAgICAgICAgICB0aGlzLnJvdXRlckV2ZW50cy5uZXh0KG5ldyBOYXZpZ2F0aW9uQ2FuY2VsKGlkLCB1cmwpKTtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5ldyBBY3RpdmF0ZVJvdXRlcyhzdGF0ZSwgdGhpcy5jdXJyZW50Um91dGVyU3RhdGUpLmFjdGl2YXRlKHRoaXMub3V0bGV0TWFwKTtcblxuICAgICAgICB0aGlzLmN1cnJlbnRVcmxUcmVlID0gdXJsO1xuICAgICAgICB0aGlzLmN1cnJlbnRSb3V0ZXJTdGF0ZSA9IHN0YXRlO1xuICAgICAgICBpZiAoIXBvcCkge1xuICAgICAgICAgIHRoaXMubG9jYXRpb24uZ28odGhpcy51cmxTZXJpYWxpemVyLnNlcmlhbGl6ZSh1cmwpKTtcbiAgICAgICAgfVxuICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMucm91dGVyRXZlbnRzLm5leHQobmV3IE5hdmlnYXRpb25FbmQoaWQsIHVybCkpO1xuICAgICAgICByZXNvbHZlUHJvbWlzZSh0cnVlKTtcblxuICAgICAgfSwgZSA9PiB7XG4gICAgICAgIHRoaXMucm91dGVyRXZlbnRzLm5leHQobmV3IE5hdmlnYXRpb25FcnJvcihpZCwgdXJsLCBlKSk7XG4gICAgICAgIHJlamVjdFByb21pc2UoZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuXG5jbGFzcyBDYW5BY3RpdmF0ZSB7IGNvbnN0cnVjdG9yKHB1YmxpYyByb3V0ZTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCkge319XG5jbGFzcyBDYW5EZWFjdGl2YXRlIHsgY29uc3RydWN0b3IocHVibGljIGNvbXBvbmVudDogT2JqZWN0LCBwdWJsaWMgcm91dGU6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QpIHt9fVxuXG5jbGFzcyBHdWFyZENoZWNrcyB7XG4gIHByaXZhdGUgY2hlY2tzID0gW107XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZnV0dXJlOiBSb3V0ZXJTdGF0ZVNuYXBzaG90LCBwcml2YXRlIGN1cnI6IFJvdXRlclN0YXRlU25hcHNob3QsIHByaXZhdGUgaW5qZWN0b3I6IEluamVjdG9yKSB7fVxuXG4gIGNoZWNrKHBhcmVudE91dGxldE1hcDogUm91dGVyT3V0bGV0TWFwKTogT2JzZXJ2YWJsZTxib29sZWFuPiB7XG4gICAgY29uc3QgZnV0dXJlUm9vdCA9IHRoaXMuZnV0dXJlLl9yb290O1xuICAgIGNvbnN0IGN1cnJSb290ID0gdGhpcy5jdXJyID8gdGhpcy5jdXJyLl9yb290IDogbnVsbDtcbiAgICB0aGlzLnRyYXZlcnNlQ2hpbGRSb3V0ZXMoZnV0dXJlUm9vdCwgY3VyclJvb3QsIHBhcmVudE91dGxldE1hcCk7XG4gICAgaWYgKHRoaXMuY2hlY2tzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG9mKHRydWUpO1xuICAgIHJldHVybiBmb3JrSm9pbih0aGlzLmNoZWNrcy5tYXAocyA9PiB7XG4gICAgICBpZiAocyBpbnN0YW5jZW9mIENhbkFjdGl2YXRlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJ1bkNhbkFjdGl2YXRlKHMucm91dGUpXG4gICAgICB9IGVsc2UgaWYgKHMgaW5zdGFuY2VvZiBDYW5EZWFjdGl2YXRlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJ1bkNhbkRlYWN0aXZhdGUocy5jb21wb25lbnQsIHMucm91dGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGJlIHJlYWNoZWRcIik7XG4gICAgICB9XG4gICAgfSkpLm1hcChhbmQpO1xuICB9XG5cbiAgcHJpdmF0ZSB0cmF2ZXJzZUNoaWxkUm91dGVzKGZ1dHVyZU5vZGU6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Vyck5vZGU6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+IHwgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dGxldE1hcDogUm91dGVyT3V0bGV0TWFwIHwgbnVsbCk6IHZvaWQge1xuICAgIGNvbnN0IHByZXZDaGlsZHJlbiA9IG5vZGVDaGlsZHJlbkFzTWFwKGN1cnJOb2RlKTtcbiAgICBmdXR1cmVOb2RlLmNoaWxkcmVuLmZvckVhY2goYyA9PiB7XG4gICAgICB0aGlzLnRyYXZlcnNlUm91dGVzKGMsIHByZXZDaGlsZHJlbltjLnZhbHVlLm91dGxldF0sIG91dGxldE1hcCk7XG4gICAgICBkZWxldGUgcHJldkNoaWxkcmVuW2MudmFsdWUub3V0bGV0XTtcbiAgICB9KTtcbiAgICBmb3JFYWNoKHByZXZDaGlsZHJlbiwgKHYsIGspID0+IHRoaXMuZGVhY3RpdmF0ZU91dGxldEFuZEl0Q2hpbGRyZW4odiwgb3V0bGV0TWFwLl9vdXRsZXRzW2tdKSk7XG4gIH1cblxuICB0cmF2ZXJzZVJvdXRlcyhmdXR1cmVOb2RlOiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PiwgY3Vyck5vZGU6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+IHwgbnVsbCxcbiAgICAgICAgICAgICAgICAgcGFyZW50T3V0bGV0TWFwOiBSb3V0ZXJPdXRsZXRNYXAgfCBudWxsKTogdm9pZCB7XG4gICAgY29uc3QgZnV0dXJlID0gZnV0dXJlTm9kZS52YWx1ZTtcbiAgICBjb25zdCBjdXJyID0gY3Vyck5vZGUgPyBjdXJyTm9kZS52YWx1ZSA6IG51bGw7XG4gICAgY29uc3Qgb3V0bGV0ID0gcGFyZW50T3V0bGV0TWFwID8gcGFyZW50T3V0bGV0TWFwLl9vdXRsZXRzW2Z1dHVyZU5vZGUudmFsdWUub3V0bGV0XSA6IG51bGw7XG5cbiAgICBpZiAoY3VyciAmJiBmdXR1cmUuX3JvdXRlQ29uZmlnID09PSBjdXJyLl9yb3V0ZUNvbmZpZykge1xuICAgICAgaWYgKCFzaGFsbG93RXF1YWwoZnV0dXJlLnBhcmFtcywgY3Vyci5wYXJhbXMpKSB7XG4gICAgICAgIHRoaXMuY2hlY2tzLnB1c2gobmV3IENhbkRlYWN0aXZhdGUob3V0bGV0LmNvbXBvbmVudCwgY3VyciksIG5ldyBDYW5BY3RpdmF0ZShmdXR1cmUpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMudHJhdmVyc2VDaGlsZFJvdXRlcyhmdXR1cmVOb2RlLCBjdXJyTm9kZSwgb3V0bGV0ID8gb3V0bGV0Lm91dGxldE1hcCA6IG51bGwpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRlYWN0aXZhdGVPdXRsZXRBbmRJdENoaWxkcmVuKGN1cnIsIG91dGxldCk7XG4gICAgICB0aGlzLmNoZWNrcy5wdXNoKG5ldyBDYW5BY3RpdmF0ZShmdXR1cmUpKTtcbiAgICAgIHRoaXMudHJhdmVyc2VDaGlsZFJvdXRlcyhmdXR1cmVOb2RlLCBudWxsLCBvdXRsZXQgPyBvdXRsZXQub3V0bGV0TWFwIDogbnVsbCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBkZWFjdGl2YXRlT3V0bGV0QW5kSXRDaGlsZHJlbihyb3V0ZTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCwgb3V0bGV0OiBSb3V0ZXJPdXRsZXQpOiB2b2lkIHtcbiAgICBpZiAob3V0bGV0ICYmIG91dGxldC5pc0FjdGl2YXRlZCkge1xuICAgICAgZm9yRWFjaChvdXRsZXQub3V0bGV0TWFwLl9vdXRsZXRzLCAodiwgaykgPT4gdGhpcy5kZWFjdGl2YXRlT3V0bGV0QW5kSXRDaGlsZHJlbih2LCBvdXRsZXQub3V0bGV0TWFwLl9vdXRsZXRzW2tdKSk7XG4gICAgICB0aGlzLmNoZWNrcy5wdXNoKG5ldyBDYW5EZWFjdGl2YXRlKG91dGxldC5jb21wb25lbnQsIHJvdXRlKSlcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJ1bkNhbkFjdGl2YXRlKGZ1dHVyZTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCk6IE9ic2VydmFibGU8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGNhbkFjdGl2YXRlID0gZnV0dXJlLl9yb3V0ZUNvbmZpZyA/IGZ1dHVyZS5fcm91dGVDb25maWcuY2FuQWN0aXZhdGUgOiBudWxsO1xuICAgIGlmICghY2FuQWN0aXZhdGUgfHwgY2FuQWN0aXZhdGUubGVuZ3RoID09PSAwKSByZXR1cm4gb2YodHJ1ZSk7XG4gICAgcmV0dXJuIGZvcmtKb2luKGNhbkFjdGl2YXRlLm1hcChjID0+IHtcbiAgICAgIGNvbnN0IGd1YXJkID0gdGhpcy5pbmplY3Rvci5nZXQoYyk7XG4gICAgICBpZiAoZ3VhcmQuY2FuQWN0aXZhdGUpIHtcbiAgICAgICAgcmV0dXJuIG9mKGd1YXJkLmNhbkFjdGl2YXRlKGZ1dHVyZSwgdGhpcy5mdXR1cmUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBvZihndWFyZChmdXR1cmUsIHRoaXMuZnV0dXJlKSk7XG4gICAgICB9XG4gICAgfSkpLm1hcChhbmQpO1xuICB9XG5cbiAgcHJpdmF0ZSBydW5DYW5EZWFjdGl2YXRlKGNvbXBvbmVudDogT2JqZWN0LCBjdXJyOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90KTogT2JzZXJ2YWJsZTxib29sZWFuPiB7XG4gICAgY29uc3QgY2FuRGVhY3RpdmF0ZSA9IGN1cnIuX3JvdXRlQ29uZmlnID8gY3Vyci5fcm91dGVDb25maWcuY2FuRGVhY3RpdmF0ZSA6IG51bGw7XG4gICAgaWYgKCFjYW5EZWFjdGl2YXRlIHx8IGNhbkRlYWN0aXZhdGUubGVuZ3RoID09PSAwKSByZXR1cm4gb2YodHJ1ZSk7XG4gICAgcmV0dXJuIGZvcmtKb2luKGNhbkRlYWN0aXZhdGUubWFwKGMgPT4ge1xuICAgICAgY29uc3QgZ3VhcmQgPSB0aGlzLmluamVjdG9yLmdldChjKTtcbiAgICAgIGlmIChndWFyZC5jYW5EZWFjdGl2YXRlKSB7XG4gICAgICAgIHJldHVybiBvZihndWFyZC5jYW5EZWFjdGl2YXRlKGNvbXBvbmVudCwgY3VyciwgdGhpcy5jdXJyKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gb2YoZ3VhcmQoY29tcG9uZW50LCBjdXJyLCB0aGlzLmN1cnIpKTtcbiAgICAgIH1cbiAgICB9KSkubWFwKGFuZCk7XG4gIH1cbn1cblxuY2xhc3MgQWN0aXZhdGVSb3V0ZXMge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGZ1dHVyZVN0YXRlOiBSb3V0ZXJTdGF0ZSwgcHJpdmF0ZSBjdXJyU3RhdGU6IFJvdXRlclN0YXRlKSB7fVxuXG4gIGFjdGl2YXRlKHBhcmVudE91dGxldE1hcDogUm91dGVyT3V0bGV0TWFwKTp2b2lkIHtcbiAgICBjb25zdCBmdXR1cmVSb290ID0gdGhpcy5mdXR1cmVTdGF0ZS5fcm9vdDtcbiAgICBjb25zdCBjdXJyUm9vdCA9IHRoaXMuY3VyclN0YXRlID8gdGhpcy5jdXJyU3RhdGUuX3Jvb3QgOiBudWxsO1xuXG4gICAgcHVzaFF1ZXJ5UGFyYW1zQW5kRnJhZ21lbnQodGhpcy5mdXR1cmVTdGF0ZSk7XG4gICAgdGhpcy5hY3RpdmF0ZUNoaWxkUm91dGVzKGZ1dHVyZVJvb3QsIGN1cnJSb290LCBwYXJlbnRPdXRsZXRNYXApO1xuICB9XG5cbiAgcHJpdmF0ZSBhY3RpdmF0ZUNoaWxkUm91dGVzKGZ1dHVyZU5vZGU6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlPixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJOb2RlOiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZT4gfCBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGV0TWFwOiBSb3V0ZXJPdXRsZXRNYXApOiB2b2lkIHtcbiAgICBjb25zdCBwcmV2Q2hpbGRyZW4gPSBub2RlQ2hpbGRyZW5Bc01hcChjdXJyTm9kZSk7XG4gICAgZnV0dXJlTm9kZS5jaGlsZHJlbi5mb3JFYWNoKGMgPT4ge1xuICAgICAgdGhpcy5hY3RpdmF0ZVJvdXRlcyhjLCBwcmV2Q2hpbGRyZW5bYy52YWx1ZS5vdXRsZXRdLCBvdXRsZXRNYXApO1xuICAgICAgZGVsZXRlIHByZXZDaGlsZHJlbltjLnZhbHVlLm91dGxldF07XG4gICAgfSk7XG4gICAgZm9yRWFjaChwcmV2Q2hpbGRyZW4sICh2LCBrKSA9PiB0aGlzLmRlYWN0aXZhdGVPdXRsZXRBbmRJdENoaWxkcmVuKG91dGxldE1hcC5fb3V0bGV0c1trXSkpO1xuICB9XG5cbiAgYWN0aXZhdGVSb3V0ZXMoZnV0dXJlTm9kZTogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGU+LCBjdXJyTm9kZTogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGU+IHwgbnVsbCxcbiAgICAgICAgICAgICAgICAgcGFyZW50T3V0bGV0TWFwOiBSb3V0ZXJPdXRsZXRNYXApOiB2b2lkIHtcbiAgICBjb25zdCBmdXR1cmUgPSBmdXR1cmVOb2RlLnZhbHVlO1xuICAgIGNvbnN0IGN1cnIgPSBjdXJyTm9kZSA/IGN1cnJOb2RlLnZhbHVlIDogbnVsbDtcbiAgICBjb25zdCBvdXRsZXQgPSBnZXRPdXRsZXQocGFyZW50T3V0bGV0TWFwLCBmdXR1cmVOb2RlLnZhbHVlKTtcblxuICAgIGlmIChmdXR1cmUgPT09IGN1cnIpIHtcbiAgICAgIGFkdmFuY2VBY3RpdmF0ZWRSb3V0ZShmdXR1cmUpO1xuICAgICAgdGhpcy5hY3RpdmF0ZUNoaWxkUm91dGVzKGZ1dHVyZU5vZGUsIGN1cnJOb2RlLCBvdXRsZXQub3V0bGV0TWFwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kZWFjdGl2YXRlT3V0bGV0QW5kSXRDaGlsZHJlbihvdXRsZXQpO1xuICAgICAgY29uc3Qgb3V0bGV0TWFwID0gbmV3IFJvdXRlck91dGxldE1hcCgpO1xuICAgICAgdGhpcy5hY3RpdmF0ZU5ld1JvdXRlcyhvdXRsZXRNYXAsIGZ1dHVyZSwgb3V0bGV0KTtcbiAgICAgIHRoaXMuYWN0aXZhdGVDaGlsZFJvdXRlcyhmdXR1cmVOb2RlLCBudWxsLCBvdXRsZXRNYXApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYWN0aXZhdGVOZXdSb3V0ZXMob3V0bGV0TWFwOiBSb3V0ZXJPdXRsZXRNYXAsIGZ1dHVyZTogQWN0aXZhdGVkUm91dGUsIG91dGxldDogUm91dGVyT3V0bGV0KTogdm9pZCB7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSBSZWZsZWN0aXZlSW5qZWN0b3IucmVzb2x2ZShbXG4gICAgICB7cHJvdmlkZTogQWN0aXZhdGVkUm91dGUsIHVzZVZhbHVlOiBmdXR1cmV9LFxuICAgICAge3Byb3ZpZGU6IFJvdXRlck91dGxldE1hcCwgdXNlVmFsdWU6IG91dGxldE1hcH1cbiAgICBdKTtcbiAgICBvdXRsZXQuYWN0aXZhdGUoZnV0dXJlLl9mdXR1cmVTbmFwc2hvdC5fcmVzb2x2ZWRDb21wb25lbnRGYWN0b3J5LCByZXNvbHZlZCwgb3V0bGV0TWFwKTtcbiAgICBhZHZhbmNlQWN0aXZhdGVkUm91dGUoZnV0dXJlKTtcbiAgfVxuXG4gIHByaXZhdGUgZGVhY3RpdmF0ZU91dGxldEFuZEl0Q2hpbGRyZW4ob3V0bGV0OiBSb3V0ZXJPdXRsZXQpOiB2b2lkIHtcbiAgICBpZiAob3V0bGV0ICYmIG91dGxldC5pc0FjdGl2YXRlZCkge1xuICAgICAgZm9yRWFjaChvdXRsZXQub3V0bGV0TWFwLl9vdXRsZXRzLCAodiwgaykgPT4gdGhpcy5kZWFjdGl2YXRlT3V0bGV0QW5kSXRDaGlsZHJlbih2KSk7XG4gICAgICBvdXRsZXQuZGVhY3RpdmF0ZSgpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBwdXNoUXVlcnlQYXJhbXNBbmRGcmFnbWVudChzdGF0ZTogUm91dGVyU3RhdGUpOiB2b2lkIHtcbiAgaWYgKCFzaGFsbG93RXF1YWwoc3RhdGUuc25hcHNob3QucXVlcnlQYXJhbXMsICg8YW55PnN0YXRlLnF1ZXJ5UGFyYW1zKS52YWx1ZSkpIHtcbiAgICAoPGFueT5zdGF0ZS5xdWVyeVBhcmFtcykubmV4dChzdGF0ZS5zbmFwc2hvdC5xdWVyeVBhcmFtcyk7XG4gIH1cblxuICBpZiAoc3RhdGUuc25hcHNob3QuZnJhZ21lbnQgIT09ICg8YW55PnN0YXRlLmZyYWdtZW50KS52YWx1ZSkge1xuICAgICg8YW55PnN0YXRlLmZyYWdtZW50KS5uZXh0KHN0YXRlLnNuYXBzaG90LmZyYWdtZW50KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBub2RlQ2hpbGRyZW5Bc01hcChub2RlOiBUcmVlTm9kZTxhbnk+fG51bGwpIHtcbiAgcmV0dXJuIG5vZGUgP1xuICAgIG5vZGUuY2hpbGRyZW4ucmVkdWNlKFxuICAgICAgKG0sIGMpID0+IHtcbiAgICAgICAgbVtjLnZhbHVlLm91dGxldF0gPSBjO1xuICAgICAgICByZXR1cm4gbTtcbiAgICAgIH0sXG4gICAgICB7fSkgOlxuICB7fTtcbn1cblxuZnVuY3Rpb24gZ2V0T3V0bGV0KG91dGxldE1hcDogUm91dGVyT3V0bGV0TWFwLCByb3V0ZTogQWN0aXZhdGVkUm91dGUpOiBSb3V0ZXJPdXRsZXQge1xuICBsZXQgb3V0bGV0ID0gb3V0bGV0TWFwLl9vdXRsZXRzW3JvdXRlLm91dGxldF07XG4gIGlmICghb3V0bGV0KSB7XG4gICAgaWYgKHJvdXRlLm91dGxldCA9PT0gUFJJTUFSWV9PVVRMRVQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGZpbmQgcHJpbWFyeSBvdXRsZXRgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgZmluZCB0aGUgb3V0bGV0ICR7cm91dGUub3V0bGV0fWApO1xuICAgIH1cbiAgfVxuICByZXR1cm4gb3V0bGV0O1xufVxuIl19