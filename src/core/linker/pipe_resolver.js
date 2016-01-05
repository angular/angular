'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var metadata_1 = require('angular2/src/core/metadata');
var reflection_1 = require('angular2/src/core/reflection/reflection');
function _isPipeMetadata(type) {
    return type instanceof metadata_1.PipeMetadata;
}
/**
 * Resolve a `Type` for {@link PipeMetadata}.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
var PipeResolver = (function () {
    function PipeResolver() {
    }
    /**
     * Return {@link PipeMetadata} for a given `Type`.
     */
    PipeResolver.prototype.resolve = function (type) {
        var metas = reflection_1.reflector.annotations(di_1.resolveForwardRef(type));
        if (lang_1.isPresent(metas)) {
            var annotation = metas.find(_isPipeMetadata);
            if (lang_1.isPresent(annotation)) {
                return annotation;
            }
        }
        throw new exceptions_1.BaseException("No Pipe decorator found on " + lang_1.stringify(type));
    };
    PipeResolver = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], PipeResolver);
    return PipeResolver;
})();
exports.PipeResolver = PipeResolver;
exports.CODEGEN_PIPE_RESOLVER = new PipeResolver();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZV9yZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9waXBlX3Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbIl9pc1BpcGVNZXRhZGF0YSIsIlBpcGVSZXNvbHZlciIsIlBpcGVSZXNvbHZlci5jb25zdHJ1Y3RvciIsIlBpcGVSZXNvbHZlci5yZXNvbHZlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxtQkFBNEMsc0JBQXNCLENBQUMsQ0FBQTtBQUNuRSxxQkFBeUMsMEJBQTBCLENBQUMsQ0FBQTtBQUNwRSwyQkFBNEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RCx5QkFBMkIsNEJBQTRCLENBQUMsQ0FBQTtBQUN4RCwyQkFBd0IseUNBQXlDLENBQUMsQ0FBQTtBQUVsRSx5QkFBeUIsSUFBUztJQUNoQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsWUFBWUEsdUJBQVlBLENBQUNBO0FBQ3RDQSxDQUFDQTtBQUVEOzs7Ozs7R0FNRztBQUNIO0lBQUFDO0lBZUFDLENBQUNBO0lBYkNEOztPQUVHQTtJQUNIQSw4QkFBT0EsR0FBUEEsVUFBUUEsSUFBVUE7UUFDaEJFLElBQUlBLEtBQUtBLEdBQUdBLHNCQUFTQSxDQUFDQSxXQUFXQSxDQUFDQSxzQkFBaUJBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1FBQzNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDckJBLElBQUlBLFVBQVVBLEdBQUdBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBO1lBQzdDQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzFCQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQTtZQUNwQkEsQ0FBQ0E7UUFDSEEsQ0FBQ0E7UUFDREEsTUFBTUEsSUFBSUEsMEJBQWFBLENBQUNBLGdDQUE4QkEsZ0JBQVNBLENBQUNBLElBQUlBLENBQUdBLENBQUNBLENBQUNBO0lBQzNFQSxDQUFDQTtJQWRIRjtRQUFDQSxlQUFVQSxFQUFFQTs7cUJBZVpBO0lBQURBLG1CQUFDQTtBQUFEQSxDQUFDQSxBQWZELElBZUM7QUFkWSxvQkFBWSxlQWN4QixDQUFBO0FBRVUsNkJBQXFCLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7cmVzb2x2ZUZvcndhcmRSZWYsIEluamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7VHlwZSwgaXNQcmVzZW50LCBzdHJpbmdpZnl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1BpcGVNZXRhZGF0YX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEnO1xuaW1wb3J0IHtyZWZsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdGlvbic7XG5cbmZ1bmN0aW9uIF9pc1BpcGVNZXRhZGF0YSh0eXBlOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGUgaW5zdGFuY2VvZiBQaXBlTWV0YWRhdGE7XG59XG5cbi8qKlxuICogUmVzb2x2ZSBhIGBUeXBlYCBmb3Ige0BsaW5rIFBpcGVNZXRhZGF0YX0uXG4gKlxuICogVGhpcyBpbnRlcmZhY2UgY2FuIGJlIG92ZXJyaWRkZW4gYnkgdGhlIGFwcGxpY2F0aW9uIGRldmVsb3BlciB0byBjcmVhdGUgY3VzdG9tIGJlaGF2aW9yLlxuICpcbiAqIFNlZSB7QGxpbmsgQ29tcGlsZXJ9XG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBQaXBlUmVzb2x2ZXIge1xuICAvKipcbiAgICogUmV0dXJuIHtAbGluayBQaXBlTWV0YWRhdGF9IGZvciBhIGdpdmVuIGBUeXBlYC5cbiAgICovXG4gIHJlc29sdmUodHlwZTogVHlwZSk6IFBpcGVNZXRhZGF0YSB7XG4gICAgdmFyIG1ldGFzID0gcmVmbGVjdG9yLmFubm90YXRpb25zKHJlc29sdmVGb3J3YXJkUmVmKHR5cGUpKTtcbiAgICBpZiAoaXNQcmVzZW50KG1ldGFzKSkge1xuICAgICAgdmFyIGFubm90YXRpb24gPSBtZXRhcy5maW5kKF9pc1BpcGVNZXRhZGF0YSk7XG4gICAgICBpZiAoaXNQcmVzZW50KGFubm90YXRpb24pKSB7XG4gICAgICAgIHJldHVybiBhbm5vdGF0aW9uO1xuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgTm8gUGlwZSBkZWNvcmF0b3IgZm91bmQgb24gJHtzdHJpbmdpZnkodHlwZSl9YCk7XG4gIH1cbn1cblxuZXhwb3J0IHZhciBDT0RFR0VOX1BJUEVfUkVTT0xWRVIgPSBuZXcgUGlwZVJlc29sdmVyKCk7XG4iXX0=