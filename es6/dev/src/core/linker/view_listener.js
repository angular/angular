var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/src/core/di';
/**
 * Listener for view creation / destruction.
 */
export let AppViewListener = class {
    onViewCreated(view) { }
    onViewDestroyed(view) { }
};
AppViewListener = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], AppViewListener);
/**
 * Proxy that allows to intercept component view factories.
 * This also works for precompiled templates, if they were
 * generated in development mode.
 */
export let ViewFactoryProxy = class {
    getComponentViewFactory(component, originalViewFactory) {
        return originalViewFactory;
    }
};
ViewFactoryProxy = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], ViewFactoryProxy);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19saXN0ZW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X2xpc3RlbmVyLnRzIl0sIm5hbWVzIjpbIkFwcFZpZXdMaXN0ZW5lciIsIkFwcFZpZXdMaXN0ZW5lci5vblZpZXdDcmVhdGVkIiwiQXBwVmlld0xpc3RlbmVyLm9uVmlld0Rlc3Ryb3llZCIsIlZpZXdGYWN0b3J5UHJveHkiLCJWaWV3RmFjdG9yeVByb3h5LmdldENvbXBvbmVudFZpZXdGYWN0b3J5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtBQUkvQzs7R0FFRztBQUNIO0lBRUVBLGFBQWFBLENBQUNBLElBQXdCQSxJQUFHQyxDQUFDQTtJQUMxQ0QsZUFBZUEsQ0FBQ0EsSUFBd0JBLElBQUdFLENBQUNBO0FBQzlDRixDQUFDQTtBQUpEO0lBQUMsVUFBVSxFQUFFOztvQkFJWjtBQUVEOzs7O0dBSUc7QUFDSDtJQUVFRyx1QkFBdUJBLENBQUNBLFNBQWVBLEVBQUVBLG1CQUE2QkE7UUFDcEVDLE1BQU1BLENBQUNBLG1CQUFtQkEsQ0FBQ0E7SUFDN0JBLENBQUNBO0FBQ0hELENBQUNBO0FBTEQ7SUFBQyxVQUFVLEVBQUU7O3FCQUtaO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7VHlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCAqIGFzIHZpZXdNb2R1bGUgZnJvbSAnLi92aWV3JztcblxuLyoqXG4gKiBMaXN0ZW5lciBmb3IgdmlldyBjcmVhdGlvbiAvIGRlc3RydWN0aW9uLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQXBwVmlld0xpc3RlbmVyIHtcbiAgb25WaWV3Q3JlYXRlZCh2aWV3OiB2aWV3TW9kdWxlLkFwcFZpZXcpIHt9XG4gIG9uVmlld0Rlc3Ryb3llZCh2aWV3OiB2aWV3TW9kdWxlLkFwcFZpZXcpIHt9XG59XG5cbi8qKlxuICogUHJveHkgdGhhdCBhbGxvd3MgdG8gaW50ZXJjZXB0IGNvbXBvbmVudCB2aWV3IGZhY3Rvcmllcy5cbiAqIFRoaXMgYWxzbyB3b3JrcyBmb3IgcHJlY29tcGlsZWQgdGVtcGxhdGVzLCBpZiB0aGV5IHdlcmVcbiAqIGdlbmVyYXRlZCBpbiBkZXZlbG9wbWVudCBtb2RlLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVmlld0ZhY3RvcnlQcm94eSB7XG4gIGdldENvbXBvbmVudFZpZXdGYWN0b3J5KGNvbXBvbmVudDogVHlwZSwgb3JpZ2luYWxWaWV3RmFjdG9yeTogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgcmV0dXJuIG9yaWdpbmFsVmlld0ZhY3Rvcnk7XG4gIH1cbn1cbiJdfQ==