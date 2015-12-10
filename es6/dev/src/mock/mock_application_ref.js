var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApplicationRef } from 'angular2/src/core/application_ref';
import { Injectable } from 'angular2/src/core/di';
export let MockApplicationRef = class extends ApplicationRef {
    registerBootstrapListener(listener) { }
    registerDisposeListener(dispose) { }
    bootstrap(componentType, bindings) {
        return null;
    }
    get injector() { return null; }
    ;
    get zone() { return null; }
    ;
    dispose() { }
    tick() { }
    get componentTypes() { return null; }
    ;
};
MockApplicationRef = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], MockApplicationRef);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19hcHBsaWNhdGlvbl9yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvbW9jay9tb2NrX2FwcGxpY2F0aW9uX3JlZi50cyJdLCJuYW1lcyI6WyJNb2NrQXBwbGljYXRpb25SZWYiLCJNb2NrQXBwbGljYXRpb25SZWYucmVnaXN0ZXJCb290c3RyYXBMaXN0ZW5lciIsIk1vY2tBcHBsaWNhdGlvblJlZi5yZWdpc3RlckRpc3Bvc2VMaXN0ZW5lciIsIk1vY2tBcHBsaWNhdGlvblJlZi5ib290c3RyYXAiLCJNb2NrQXBwbGljYXRpb25SZWYuaW5qZWN0b3IiLCJNb2NrQXBwbGljYXRpb25SZWYuem9uZSIsIk1vY2tBcHBsaWNhdGlvblJlZi5kaXNwb3NlIiwiTW9ja0FwcGxpY2F0aW9uUmVmLnRpY2siLCJNb2NrQXBwbGljYXRpb25SZWYuY29tcG9uZW50VHlwZXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUNBQW1DO09BQ3pELEVBQUMsVUFBVSxFQUFDLE1BQU0sc0JBQXNCO0FBTy9DLDhDQUN3QyxjQUFjO0lBQ3BEQSx5QkFBeUJBLENBQUNBLFFBQXFDQSxJQUFTQyxDQUFDQTtJQUV6RUQsdUJBQXVCQSxDQUFDQSxPQUFtQkEsSUFBU0UsQ0FBQ0E7SUFFckRGLFNBQVNBLENBQUNBLGFBQW1CQSxFQUFFQSxRQUF5Q0E7UUFDdEVHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2RBLENBQUNBO0lBRURILElBQUlBLFFBQVFBLEtBQWVJLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBOztJQUV6Q0osSUFBSUEsSUFBSUEsS0FBYUssTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7O0lBRW5DTCxPQUFPQSxLQUFVTSxDQUFDQTtJQUVsQk4sSUFBSUEsS0FBVU8sQ0FBQ0E7SUFFZlAsSUFBSUEsY0FBY0EsS0FBYVEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7O0FBQy9DUixDQUFDQTtBQW5CRDtJQUFDLFVBQVUsRUFBRTs7dUJBbUJaO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FwcGxpY2F0aW9uUmVmfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9hcHBsaWNhdGlvbl9yZWYnO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1R5cGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0NvbXBvbmVudFJlZn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2R5bmFtaWNfY29tcG9uZW50X2xvYWRlcic7XG5pbXBvcnQge1Byb3ZpZGVyLCBJbmplY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtOZ1pvbmV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3pvbmUvbmdfem9uZSc7XG5pbXBvcnQge1Byb21pc2V9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTW9ja0FwcGxpY2F0aW9uUmVmIGV4dGVuZHMgQXBwbGljYXRpb25SZWYge1xuICByZWdpc3RlckJvb3RzdHJhcExpc3RlbmVyKGxpc3RlbmVyOiAocmVmOiBDb21wb25lbnRSZWYpID0+IHZvaWQpOiB2b2lkIHt9XG5cbiAgcmVnaXN0ZXJEaXNwb3NlTGlzdGVuZXIoZGlzcG9zZTogKCkgPT4gdm9pZCk6IHZvaWQge31cblxuICBib290c3RyYXAoY29tcG9uZW50VHlwZTogVHlwZSwgYmluZGluZ3M/OiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBQcm9taXNlPENvbXBvbmVudFJlZj4ge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZ2V0IGluamVjdG9yKCk6IEluamVjdG9yIHsgcmV0dXJuIG51bGw7IH07XG5cbiAgZ2V0IHpvbmUoKTogTmdab25lIHsgcmV0dXJuIG51bGw7IH07XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHt9XG5cbiAgdGljaygpOiB2b2lkIHt9XG5cbiAgZ2V0IGNvbXBvbmVudFR5cGVzKCk6IFR5cGVbXSB7IHJldHVybiBudWxsOyB9O1xufVxuIl19