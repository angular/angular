import { isPresent } from 'angular2/src/facade/lang';
export class AsyncRouteHandler {
    constructor(_loader, data) {
        this._loader = _loader;
        this.data = data;
        /** @internal */
        this._resolvedComponent = null;
    }
    resolveComponentType() {
        if (isPresent(this._resolvedComponent)) {
            return this._resolvedComponent;
        }
        return this._resolvedComponent = this._loader().then((componentType) => {
            this.componentType = componentType;
            return componentType;
        });
    }
}
//# sourceMappingURL=async_route_handler.js.map