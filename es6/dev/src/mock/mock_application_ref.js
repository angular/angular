var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19hcHBsaWNhdGlvbl9yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvbW9jay9tb2NrX2FwcGxpY2F0aW9uX3JlZi50cyJdLCJuYW1lcyI6WyJNb2NrQXBwbGljYXRpb25SZWYiLCJNb2NrQXBwbGljYXRpb25SZWYucmVnaXN0ZXJCb290c3RyYXBMaXN0ZW5lciIsIk1vY2tBcHBsaWNhdGlvblJlZi5yZWdpc3RlckRpc3Bvc2VMaXN0ZW5lciIsIk1vY2tBcHBsaWNhdGlvblJlZi5ib290c3RyYXAiLCJNb2NrQXBwbGljYXRpb25SZWYuaW5qZWN0b3IiLCJNb2NrQXBwbGljYXRpb25SZWYuem9uZSIsIk1vY2tBcHBsaWNhdGlvblJlZi5kaXNwb3NlIiwiTW9ja0FwcGxpY2F0aW9uUmVmLnRpY2siLCJNb2NrQXBwbGljYXRpb25SZWYuY29tcG9uZW50VHlwZXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQ0FBbUM7T0FDekQsRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7QUFPL0MsOENBQ3dDLGNBQWM7SUFDcERBLHlCQUF5QkEsQ0FBQ0EsUUFBcUNBLElBQVNDLENBQUNBO0lBRXpFRCx1QkFBdUJBLENBQUNBLE9BQW1CQSxJQUFTRSxDQUFDQTtJQUVyREYsU0FBU0EsQ0FBQ0EsYUFBbUJBLEVBQUVBLFFBQXlDQTtRQUN0RUcsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDZEEsQ0FBQ0E7SUFFREgsSUFBSUEsUUFBUUEsS0FBZUksTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7O0lBRXpDSixJQUFJQSxJQUFJQSxLQUFhSyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTs7SUFFbkNMLE9BQU9BLEtBQVVNLENBQUNBO0lBRWxCTixJQUFJQSxLQUFVTyxDQUFDQTtJQUVmUCxJQUFJQSxjQUFjQSxLQUFhUSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTs7QUFDL0NSLENBQUNBO0FBbkJEO0lBQUMsVUFBVSxFQUFFOzt1QkFtQlo7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QXBwbGljYXRpb25SZWZ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2FwcGxpY2F0aW9uX3JlZic7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7VHlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7Q29tcG9uZW50UmVmfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvZHluYW1pY19jb21wb25lbnRfbG9hZGVyJztcbmltcG9ydCB7UHJvdmlkZXIsIEluamVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge05nWm9uZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvem9uZS9uZ196b25lJztcbmltcG9ydCB7UHJvbWlzZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNb2NrQXBwbGljYXRpb25SZWYgZXh0ZW5kcyBBcHBsaWNhdGlvblJlZiB7XG4gIHJlZ2lzdGVyQm9vdHN0cmFwTGlzdGVuZXIobGlzdGVuZXI6IChyZWY6IENvbXBvbmVudFJlZikgPT4gdm9pZCk6IHZvaWQge31cblxuICByZWdpc3RlckRpc3Bvc2VMaXN0ZW5lcihkaXNwb3NlOiAoKSA9PiB2b2lkKTogdm9pZCB7fVxuXG4gIGJvb3RzdHJhcChjb21wb25lbnRUeXBlOiBUeXBlLCBiaW5kaW5ncz86IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPik6IFByb21pc2U8Q29tcG9uZW50UmVmPiB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBnZXQgaW5qZWN0b3IoKTogSW5qZWN0b3IgeyByZXR1cm4gbnVsbDsgfTtcblxuICBnZXQgem9uZSgpOiBOZ1pvbmUgeyByZXR1cm4gbnVsbDsgfTtcblxuICBkaXNwb3NlKCk6IHZvaWQge31cblxuICB0aWNrKCk6IHZvaWQge31cblxuICBnZXQgY29tcG9uZW50VHlwZXMoKTogVHlwZVtdIHsgcmV0dXJuIG51bGw7IH07XG59XG4iXX0=