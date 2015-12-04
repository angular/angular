'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var provider_1 = require('angular2/src/core/di/provider');
var di_1 = require('angular2/src/core/di');
var PipeProvider = (function (_super) {
    __extends(PipeProvider, _super);
    function PipeProvider(name, pure, key, resolvedFactories, multiBinding) {
        _super.call(this, key, resolvedFactories, multiBinding);
        this.name = name;
        this.pure = pure;
    }
    PipeProvider.createFromType = function (type, metadata) {
        var provider = new di_1.Provider(type, { useClass: type });
        var rb = provider_1.resolveProvider(provider);
        return new PipeProvider(metadata.name, metadata.pure, rb.key, rb.resolvedFactories, rb.multiProvider);
    };
    return PipeProvider;
})(provider_1.ResolvedProvider_);
exports.PipeProvider = PipeProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZV9wcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL3BpcGVzL3BpcGVfcHJvdmlkZXIudHMiXSwibmFtZXMiOlsiUGlwZVByb3ZpZGVyIiwiUGlwZVByb3ZpZGVyLmNvbnN0cnVjdG9yIiwiUGlwZVByb3ZpZGVyLmNyZWF0ZUZyb21UeXBlIl0sIm1hcHBpbmdzIjoiOzs7OztBQUNBLHlCQUFrRSwrQkFBK0IsQ0FBQyxDQUFBO0FBQ2xHLG1CQUE4QyxzQkFBc0IsQ0FBQyxDQUFBO0FBR3JFO0lBQWtDQSxnQ0FBaUJBO0lBQ2pEQSxzQkFBbUJBLElBQVlBLEVBQVNBLElBQWFBLEVBQUVBLEdBQVFBLEVBQ25EQSxpQkFBb0NBLEVBQUVBLFlBQXFCQTtRQUNyRUMsa0JBQU1BLEdBQUdBLEVBQUVBLGlCQUFpQkEsRUFBRUEsWUFBWUEsQ0FBQ0EsQ0FBQ0E7UUFGM0JBLFNBQUlBLEdBQUpBLElBQUlBLENBQVFBO1FBQVNBLFNBQUlBLEdBQUpBLElBQUlBLENBQVNBO0lBR3JEQSxDQUFDQTtJQUVNRCwyQkFBY0EsR0FBckJBLFVBQXNCQSxJQUFVQSxFQUFFQSxRQUFzQkE7UUFDdERFLElBQUlBLFFBQVFBLEdBQUdBLElBQUlBLGFBQVFBLENBQUNBLElBQUlBLEVBQUVBLEVBQUNBLFFBQVFBLEVBQUVBLElBQUlBLEVBQUNBLENBQUNBLENBQUNBO1FBQ3BEQSxJQUFJQSxFQUFFQSxHQUFHQSwwQkFBZUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFDbkNBLE1BQU1BLENBQUNBLElBQUlBLFlBQVlBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLEVBQUVBLFFBQVFBLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLENBQUNBLEdBQUdBLEVBQUVBLEVBQUVBLENBQUNBLGlCQUFpQkEsRUFDMURBLEVBQUVBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBO0lBQzVDQSxDQUFDQTtJQUNIRixtQkFBQ0E7QUFBREEsQ0FBQ0EsQUFaRCxFQUFrQyw0QkFBaUIsRUFZbEQ7QUFaWSxvQkFBWSxlQVl4QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtSZXNvbHZlZEZhY3RvcnksIHJlc29sdmVQcm92aWRlciwgUmVzb2x2ZWRQcm92aWRlcl99IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpL3Byb3ZpZGVyJztcbmltcG9ydCB7S2V5LCBSZXNvbHZlZFByb3ZpZGVyLCBQcm92aWRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtQaXBlTWV0YWRhdGF9IGZyb20gJy4uL21ldGFkYXRhL2RpcmVjdGl2ZXMnO1xuXG5leHBvcnQgY2xhc3MgUGlwZVByb3ZpZGVyIGV4dGVuZHMgUmVzb2x2ZWRQcm92aWRlcl8ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgcHVyZTogYm9vbGVhbiwga2V5OiBLZXksXG4gICAgICAgICAgICAgIHJlc29sdmVkRmFjdG9yaWVzOiBSZXNvbHZlZEZhY3RvcnlbXSwgbXVsdGlCaW5kaW5nOiBib29sZWFuKSB7XG4gICAgc3VwZXIoa2V5LCByZXNvbHZlZEZhY3RvcmllcywgbXVsdGlCaW5kaW5nKTtcbiAgfVxuXG4gIHN0YXRpYyBjcmVhdGVGcm9tVHlwZSh0eXBlOiBUeXBlLCBtZXRhZGF0YTogUGlwZU1ldGFkYXRhKTogUGlwZVByb3ZpZGVyIHtcbiAgICB2YXIgcHJvdmlkZXIgPSBuZXcgUHJvdmlkZXIodHlwZSwge3VzZUNsYXNzOiB0eXBlfSk7XG4gICAgdmFyIHJiID0gcmVzb2x2ZVByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgICByZXR1cm4gbmV3IFBpcGVQcm92aWRlcihtZXRhZGF0YS5uYW1lLCBtZXRhZGF0YS5wdXJlLCByYi5rZXksIHJiLnJlc29sdmVkRmFjdG9yaWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJiLm11bHRpUHJvdmlkZXIpO1xuICB9XG59XG4iXX0=