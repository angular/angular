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
 * Specifies app root url for the application.
 *
 * Used by the {@link Compiler} when resolving HTML and CSS template URLs.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
export let AppRootUrl = class {
    constructor(value) {
        this.value = value;
    }
};
AppRootUrl = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [String])
], AppRootUrl);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwX3Jvb3RfdXJsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2FwcF9yb290X3VybC50cyJdLCJuYW1lcyI6WyJBcHBSb290VXJsIiwiQXBwUm9vdFVybC5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7QUFHL0M7Ozs7Ozs7O0dBUUc7QUFDSDtJQUVFQSxZQUFtQkEsS0FBYUE7UUFBYkMsVUFBS0EsR0FBTEEsS0FBS0EsQ0FBUUE7SUFBR0EsQ0FBQ0E7QUFDdENELENBQUNBO0FBSEQ7SUFBQyxVQUFVLEVBQUU7O2VBR1o7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG4vKipcbiAqIFNwZWNpZmllcyBhcHAgcm9vdCB1cmwgZm9yIHRoZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiBVc2VkIGJ5IHRoZSB7QGxpbmsgQ29tcGlsZXJ9IHdoZW4gcmVzb2x2aW5nIEhUTUwgYW5kIENTUyB0ZW1wbGF0ZSBVUkxzLlxuICpcbiAqIFRoaXMgaW50ZXJmYWNlIGNhbiBiZSBvdmVycmlkZGVuIGJ5IHRoZSBhcHBsaWNhdGlvbiBkZXZlbG9wZXIgdG8gY3JlYXRlIGN1c3RvbSBiZWhhdmlvci5cbiAqXG4gKiBTZWUge0BsaW5rIENvbXBpbGVyfVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQXBwUm9vdFVybCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2YWx1ZTogc3RyaW5nKSB7fVxufVxuIl19