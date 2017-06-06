'use strict';"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
var reflector_reader_1 = require('angular2/src/core/reflection/reflector_reader');
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
    function PipeResolver(_reflector) {
        if (lang_1.isPresent(_reflector)) {
            this._reflector = _reflector;
        }
        else {
            this._reflector = reflection_1.reflector;
        }
    }
    /**
     * Return {@link PipeMetadata} for a given `Type`.
     */
    PipeResolver.prototype.resolve = function (type) {
        var metas = this._reflector.annotations(di_1.resolveForwardRef(type));
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
        __metadata('design:paramtypes', [reflector_reader_1.ReflectorReader])
    ], PipeResolver);
    return PipeResolver;
}());
exports.PipeResolver = PipeResolver;
exports.CODEGEN_PIPE_RESOLVER = new PipeResolver(reflection_1.reflector);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZV9yZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9waXBlX3Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxtQkFBNEMsc0JBQXNCLENBQUMsQ0FBQTtBQUNuRSxxQkFBeUMsMEJBQTBCLENBQUMsQ0FBQTtBQUNwRSwyQkFBNEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RCx5QkFBMkIsNEJBQTRCLENBQUMsQ0FBQTtBQUN4RCxpQ0FBOEIsK0NBQStDLENBQUMsQ0FBQTtBQUM5RSwyQkFBd0IseUNBQXlDLENBQUMsQ0FBQTtBQUVsRSx5QkFBeUIsSUFBUztJQUNoQyxNQUFNLENBQUMsSUFBSSxZQUFZLHVCQUFZLENBQUM7QUFDdEMsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUVIO0lBRUUsc0JBQVksVUFBNEI7UUFDdEMsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDL0IsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sSUFBSSxDQUFDLFVBQVUsR0FBRyxzQkFBUyxDQUFDO1FBQzlCLENBQUM7SUFDSCxDQUFDO0lBRUQ7O09BRUc7SUFDSCw4QkFBTyxHQUFQLFVBQVEsSUFBVTtRQUNoQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxzQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDN0MsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLE1BQU0sQ0FBQyxVQUFVLENBQUM7WUFDcEIsQ0FBQztRQUNILENBQUM7UUFDRCxNQUFNLElBQUksMEJBQWEsQ0FBQyxnQ0FBOEIsZ0JBQVMsQ0FBQyxJQUFJLENBQUcsQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUF2Qkg7UUFBQyxlQUFVLEVBQUU7O29CQUFBO0lBd0JiLG1CQUFDO0FBQUQsQ0FBQyxBQXZCRCxJQXVCQztBQXZCWSxvQkFBWSxlQXVCeEIsQ0FBQTtBQUVVLDZCQUFxQixHQUFHLElBQUksWUFBWSxDQUFDLHNCQUFTLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7cmVzb2x2ZUZvcndhcmRSZWYsIEluamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7VHlwZSwgaXNQcmVzZW50LCBzdHJpbmdpZnl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1BpcGVNZXRhZGF0YX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEnO1xuaW1wb3J0IHtSZWZsZWN0b3JSZWFkZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdG9yX3JlYWRlcic7XG5pbXBvcnQge3JlZmxlY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVmbGVjdGlvbi9yZWZsZWN0aW9uJztcblxuZnVuY3Rpb24gX2lzUGlwZU1ldGFkYXRhKHR5cGU6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gdHlwZSBpbnN0YW5jZW9mIFBpcGVNZXRhZGF0YTtcbn1cblxuLyoqXG4gKiBSZXNvbHZlIGEgYFR5cGVgIGZvciB7QGxpbmsgUGlwZU1ldGFkYXRhfS5cbiAqXG4gKiBUaGlzIGludGVyZmFjZSBjYW4gYmUgb3ZlcnJpZGRlbiBieSB0aGUgYXBwbGljYXRpb24gZGV2ZWxvcGVyIHRvIGNyZWF0ZSBjdXN0b20gYmVoYXZpb3IuXG4gKlxuICogU2VlIHtAbGluayBDb21waWxlcn1cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFBpcGVSZXNvbHZlciB7XG4gIHByaXZhdGUgX3JlZmxlY3RvcjogUmVmbGVjdG9yUmVhZGVyO1xuICBjb25zdHJ1Y3RvcihfcmVmbGVjdG9yPzogUmVmbGVjdG9yUmVhZGVyKSB7XG4gICAgaWYgKGlzUHJlc2VudChfcmVmbGVjdG9yKSkge1xuICAgICAgdGhpcy5fcmVmbGVjdG9yID0gX3JlZmxlY3RvcjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcmVmbGVjdG9yID0gcmVmbGVjdG9yO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4ge0BsaW5rIFBpcGVNZXRhZGF0YX0gZm9yIGEgZ2l2ZW4gYFR5cGVgLlxuICAgKi9cbiAgcmVzb2x2ZSh0eXBlOiBUeXBlKTogUGlwZU1ldGFkYXRhIHtcbiAgICB2YXIgbWV0YXMgPSB0aGlzLl9yZWZsZWN0b3IuYW5ub3RhdGlvbnMocmVzb2x2ZUZvcndhcmRSZWYodHlwZSkpO1xuICAgIGlmIChpc1ByZXNlbnQobWV0YXMpKSB7XG4gICAgICB2YXIgYW5ub3RhdGlvbiA9IG1ldGFzLmZpbmQoX2lzUGlwZU1ldGFkYXRhKTtcbiAgICAgIGlmIChpc1ByZXNlbnQoYW5ub3RhdGlvbikpIHtcbiAgICAgICAgcmV0dXJuIGFubm90YXRpb247XG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBObyBQaXBlIGRlY29yYXRvciBmb3VuZCBvbiAke3N0cmluZ2lmeSh0eXBlKX1gKTtcbiAgfVxufVxuXG5leHBvcnQgdmFyIENPREVHRU5fUElQRV9SRVNPTFZFUiA9IG5ldyBQaXBlUmVzb2x2ZXIocmVmbGVjdG9yKTtcbiJdfQ==