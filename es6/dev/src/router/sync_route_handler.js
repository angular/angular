import { PromiseWrapper } from 'angular2/src/facade/async';
export class SyncRouteHandler {
    constructor(componentType, data) {
        this.componentType = componentType;
        this.data = data;
        /** @internal */
        this._resolvedComponent = null;
        this._resolvedComponent = PromiseWrapper.resolve(componentType);
    }
    resolveComponentType() { return this._resolvedComponent; }
}
//# sourceMappingURL=sync_route_handler.js.map