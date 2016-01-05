'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('../di');
var lang_1 = require('angular2/src/facade/lang');
var element_1 = require('./element');
var directive_resolver_1 = require('./directive_resolver');
var pipe_provider_1 = require('../pipes/pipe_provider');
var pipe_resolver_1 = require('./pipe_resolver');
var ResolvedMetadataCache = (function () {
    function ResolvedMetadataCache(_directiveResolver, _pipeResolver) {
        this._directiveResolver = _directiveResolver;
        this._pipeResolver = _pipeResolver;
        this._directiveCache = new Map();
        this._pipeCache = new Map();
    }
    ResolvedMetadataCache.prototype.getResolvedDirectiveMetadata = function (type) {
        var result = this._directiveCache.get(type);
        if (lang_1.isBlank(result)) {
            result = element_1.DirectiveProvider.createFromType(type, this._directiveResolver.resolve(type));
            this._directiveCache.set(type, result);
        }
        return result;
    };
    ResolvedMetadataCache.prototype.getResolvedPipeMetadata = function (type) {
        var result = this._pipeCache.get(type);
        if (lang_1.isBlank(result)) {
            result = pipe_provider_1.PipeProvider.createFromType(type, this._pipeResolver.resolve(type));
            this._pipeCache.set(type, result);
        }
        return result;
    };
    ResolvedMetadataCache = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [directive_resolver_1.DirectiveResolver, pipe_resolver_1.PipeResolver])
    ], ResolvedMetadataCache);
    return ResolvedMetadataCache;
})();
exports.ResolvedMetadataCache = ResolvedMetadataCache;
exports.CODEGEN_RESOLVED_METADATA_CACHE = new ResolvedMetadataCache(directive_resolver_1.CODEGEN_DIRECTIVE_RESOLVER, pipe_resolver_1.CODEGEN_PIPE_RESOLVER);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZWRfbWV0YWRhdGFfY2FjaGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvcmVzb2x2ZWRfbWV0YWRhdGFfY2FjaGUudHMiXSwibmFtZXMiOlsiUmVzb2x2ZWRNZXRhZGF0YUNhY2hlIiwiUmVzb2x2ZWRNZXRhZGF0YUNhY2hlLmNvbnN0cnVjdG9yIiwiUmVzb2x2ZWRNZXRhZGF0YUNhY2hlLmdldFJlc29sdmVkRGlyZWN0aXZlTWV0YWRhdGEiLCJSZXNvbHZlZE1ldGFkYXRhQ2FjaGUuZ2V0UmVzb2x2ZWRQaXBlTWV0YWRhdGEiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLG1CQUF5QixPQUFPLENBQUMsQ0FBQTtBQUNqQyxxQkFBNEIsMEJBQTBCLENBQUMsQ0FBQTtBQUN2RCx3QkFBZ0MsV0FBVyxDQUFDLENBQUE7QUFDNUMsbUNBQTRELHNCQUFzQixDQUFDLENBQUE7QUFDbkYsOEJBQTJCLHdCQUF3QixDQUFDLENBQUE7QUFDcEQsOEJBQWtELGlCQUFpQixDQUFDLENBQUE7QUFFcEU7SUFLRUEsK0JBQW9CQSxrQkFBcUNBLEVBQVVBLGFBQTJCQTtRQUExRUMsdUJBQWtCQSxHQUFsQkEsa0JBQWtCQSxDQUFtQkE7UUFBVUEsa0JBQWFBLEdBQWJBLGFBQWFBLENBQWNBO1FBSHRGQSxvQkFBZUEsR0FBaUNBLElBQUlBLEdBQUdBLEVBQTJCQSxDQUFDQTtRQUNuRkEsZUFBVUEsR0FBNEJBLElBQUlBLEdBQUdBLEVBQXNCQSxDQUFDQTtJQUVxQkEsQ0FBQ0E7SUFFbEdELDREQUE0QkEsR0FBNUJBLFVBQTZCQSxJQUFVQTtRQUNyQ0UsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDNUNBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3BCQSxNQUFNQSxHQUFHQSwyQkFBaUJBLENBQUNBLGNBQWNBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkZBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO1FBQ3pDQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtJQUNoQkEsQ0FBQ0E7SUFFREYsdURBQXVCQSxHQUF2QkEsVUFBd0JBLElBQVVBO1FBQ2hDRyxJQUFJQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUN2Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcEJBLE1BQU1BLEdBQUdBLDRCQUFZQSxDQUFDQSxjQUFjQSxDQUFDQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM3RUEsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDcENBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO0lBQ2hCQSxDQUFDQTtJQXZCSEg7UUFBQ0EsZUFBVUEsRUFBRUE7OzhCQXdCWkE7SUFBREEsNEJBQUNBO0FBQURBLENBQUNBLEFBeEJELElBd0JDO0FBdkJZLDZCQUFxQix3QkF1QmpDLENBQUE7QUFFVSx1Q0FBK0IsR0FDdEMsSUFBSSxxQkFBcUIsQ0FBQywrQ0FBMEIsRUFBRSxxQ0FBcUIsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICcuLi9kaSc7XG5pbXBvcnQge1R5cGUsIGlzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0RpcmVjdGl2ZVByb3ZpZGVyfSBmcm9tICcuL2VsZW1lbnQnO1xuaW1wb3J0IHtEaXJlY3RpdmVSZXNvbHZlciwgQ09ERUdFTl9ESVJFQ1RJVkVfUkVTT0xWRVJ9IGZyb20gJy4vZGlyZWN0aXZlX3Jlc29sdmVyJztcbmltcG9ydCB7UGlwZVByb3ZpZGVyfSBmcm9tICcuLi9waXBlcy9waXBlX3Byb3ZpZGVyJztcbmltcG9ydCB7UGlwZVJlc29sdmVyLCBDT0RFR0VOX1BJUEVfUkVTT0xWRVJ9IGZyb20gJy4vcGlwZV9yZXNvbHZlcic7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSZXNvbHZlZE1ldGFkYXRhQ2FjaGUge1xuICBwcml2YXRlIF9kaXJlY3RpdmVDYWNoZTogTWFwPFR5cGUsIERpcmVjdGl2ZVByb3ZpZGVyPiA9IG5ldyBNYXA8VHlwZSwgRGlyZWN0aXZlUHJvdmlkZXI+KCk7XG4gIHByaXZhdGUgX3BpcGVDYWNoZTogTWFwPFR5cGUsIFBpcGVQcm92aWRlcj4gPSBuZXcgTWFwPFR5cGUsIFBpcGVQcm92aWRlcj4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9kaXJlY3RpdmVSZXNvbHZlcjogRGlyZWN0aXZlUmVzb2x2ZXIsIHByaXZhdGUgX3BpcGVSZXNvbHZlcjogUGlwZVJlc29sdmVyKSB7fVxuXG4gIGdldFJlc29sdmVkRGlyZWN0aXZlTWV0YWRhdGEodHlwZTogVHlwZSk6IERpcmVjdGl2ZVByb3ZpZGVyIHtcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5fZGlyZWN0aXZlQ2FjaGUuZ2V0KHR5cGUpO1xuICAgIGlmIChpc0JsYW5rKHJlc3VsdCkpIHtcbiAgICAgIHJlc3VsdCA9IERpcmVjdGl2ZVByb3ZpZGVyLmNyZWF0ZUZyb21UeXBlKHR5cGUsIHRoaXMuX2RpcmVjdGl2ZVJlc29sdmVyLnJlc29sdmUodHlwZSkpO1xuICAgICAgdGhpcy5fZGlyZWN0aXZlQ2FjaGUuc2V0KHR5cGUsIHJlc3VsdCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBnZXRSZXNvbHZlZFBpcGVNZXRhZGF0YSh0eXBlOiBUeXBlKTogUGlwZVByb3ZpZGVyIHtcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5fcGlwZUNhY2hlLmdldCh0eXBlKTtcbiAgICBpZiAoaXNCbGFuayhyZXN1bHQpKSB7XG4gICAgICByZXN1bHQgPSBQaXBlUHJvdmlkZXIuY3JlYXRlRnJvbVR5cGUodHlwZSwgdGhpcy5fcGlwZVJlc29sdmVyLnJlc29sdmUodHlwZSkpO1xuICAgICAgdGhpcy5fcGlwZUNhY2hlLnNldCh0eXBlLCByZXN1bHQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59XG5cbmV4cG9ydCB2YXIgQ09ERUdFTl9SRVNPTFZFRF9NRVRBREFUQV9DQUNIRSA9XG4gICAgbmV3IFJlc29sdmVkTWV0YWRhdGFDYWNoZShDT0RFR0VOX0RJUkVDVElWRV9SRVNPTFZFUiwgQ09ERUdFTl9QSVBFX1JFU09MVkVSKTtcbiJdfQ==