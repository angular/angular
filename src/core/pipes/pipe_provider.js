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
//# sourceMappingURL=pipe_provider.js.map