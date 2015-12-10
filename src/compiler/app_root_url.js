'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
var di_1 = require('angular2/src/core/di');
/**
 * Specifies app root url for the application.
 *
 * Used by the {@link Compiler} when resolving HTML and CSS template URLs.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
var AppRootUrl = (function () {
    function AppRootUrl(value) {
        this.value = value;
    }
    AppRootUrl = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [String])
    ], AppRootUrl);
    return AppRootUrl;
})();
exports.AppRootUrl = AppRootUrl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwX3Jvb3RfdXJsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2FwcF9yb290X3VybC50cyJdLCJuYW1lcyI6WyJBcHBSb290VXJsIiwiQXBwUm9vdFVybC5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUdoRDs7Ozs7Ozs7R0FRRztBQUNIO0lBRUVBLG9CQUFtQkEsS0FBYUE7UUFBYkMsVUFBS0EsR0FBTEEsS0FBS0EsQ0FBUUE7SUFBR0EsQ0FBQ0E7SUFGdENEO1FBQUNBLGVBQVVBLEVBQUVBOzttQkFHWkE7SUFBREEsaUJBQUNBO0FBQURBLENBQUNBLEFBSEQsSUFHQztBQUZZLGtCQUFVLGFBRXRCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7aXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuLyoqXG4gKiBTcGVjaWZpZXMgYXBwIHJvb3QgdXJsIGZvciB0aGUgYXBwbGljYXRpb24uXG4gKlxuICogVXNlZCBieSB0aGUge0BsaW5rIENvbXBpbGVyfSB3aGVuIHJlc29sdmluZyBIVE1MIGFuZCBDU1MgdGVtcGxhdGUgVVJMcy5cbiAqXG4gKiBUaGlzIGludGVyZmFjZSBjYW4gYmUgb3ZlcnJpZGRlbiBieSB0aGUgYXBwbGljYXRpb24gZGV2ZWxvcGVyIHRvIGNyZWF0ZSBjdXN0b20gYmVoYXZpb3IuXG4gKlxuICogU2VlIHtAbGluayBDb21waWxlcn1cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFwcFJvb3RVcmwge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdmFsdWU6IHN0cmluZykge31cbn1cbiJdfQ==