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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19saXN0ZW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X2xpc3RlbmVyLnRzIl0sIm5hbWVzIjpbIkFwcFZpZXdMaXN0ZW5lciIsIkFwcFZpZXdMaXN0ZW5lci5vblZpZXdDcmVhdGVkIiwiQXBwVmlld0xpc3RlbmVyLm9uVmlld0Rlc3Ryb3llZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtBQUcvQzs7R0FFRztBQUNIO0lBRUVBLGFBQWFBLENBQUNBLElBQXdCQSxJQUFHQyxDQUFDQTtJQUMxQ0QsZUFBZUEsQ0FBQ0EsSUFBd0JBLElBQUdFLENBQUNBO0FBQzlDRixDQUFDQTtBQUpEO0lBQUMsVUFBVSxFQUFFOztvQkFJWjtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQgKiBhcyB2aWV3TW9kdWxlIGZyb20gJy4vdmlldyc7XG5cbi8qKlxuICogTGlzdGVuZXIgZm9yIHZpZXcgY3JlYXRpb24gLyBkZXN0cnVjdGlvbi5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFwcFZpZXdMaXN0ZW5lciB7XG4gIG9uVmlld0NyZWF0ZWQodmlldzogdmlld01vZHVsZS5BcHBWaWV3KSB7fVxuICBvblZpZXdEZXN0cm95ZWQodmlldzogdmlld01vZHVsZS5BcHBWaWV3KSB7fVxufVxuIl19