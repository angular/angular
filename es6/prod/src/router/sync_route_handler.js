import { PromiseWrapper } from 'angular2/src/facade/async';
import { isPresent } from 'angular2/src/facade/lang';
import { RouteData, BLANK_ROUTE_DATA } from './instruction';
export class SyncRouteHandler {
    constructor(componentType, data) {
        this.componentType = componentType;
        /** @internal */
        this._resolvedComponent = null;
        this._resolvedComponent = PromiseWrapper.resolve(componentType);
        this.data = isPresent(data) ? new RouteData(data) : BLANK_ROUTE_DATA;
    }
    resolveComponentType() { return this._resolvedComponent; }
}
