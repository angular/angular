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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19saXN0ZW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X2xpc3RlbmVyLnRzIl0sIm5hbWVzIjpbIkFwcFZpZXdMaXN0ZW5lciIsIkFwcFZpZXdMaXN0ZW5lci5vblZpZXdDcmVhdGVkIiwiQXBwVmlld0xpc3RlbmVyLm9uVmlld0Rlc3Ryb3llZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7QUFHL0M7O0dBRUc7QUFDSDtJQUVFQSxhQUFhQSxDQUFDQSxJQUF3QkEsSUFBR0MsQ0FBQ0E7SUFDMUNELGVBQWVBLENBQUNBLElBQXdCQSxJQUFHRSxDQUFDQTtBQUM5Q0YsQ0FBQ0E7QUFKRDtJQUFDLFVBQVUsRUFBRTs7b0JBSVo7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0ICogYXMgdmlld01vZHVsZSBmcm9tICcuL3ZpZXcnO1xuXG4vKipcbiAqIExpc3RlbmVyIGZvciB2aWV3IGNyZWF0aW9uIC8gZGVzdHJ1Y3Rpb24uXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBBcHBWaWV3TGlzdGVuZXIge1xuICBvblZpZXdDcmVhdGVkKHZpZXc6IHZpZXdNb2R1bGUuQXBwVmlldykge31cbiAgb25WaWV3RGVzdHJveWVkKHZpZXc6IHZpZXdNb2R1bGUuQXBwVmlldykge31cbn1cbiJdfQ==