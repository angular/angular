'use strict';var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var cd = require('angular2/src/core/change_detection/pipes');
var ProtoPipes = (function () {
    function ProtoPipes(
        /**
        * Map of {@link PipeMetadata} names to {@link PipeMetadata} implementations.
        */
        config) {
        this.config = config;
        this.config = config;
    }
    ProtoPipes.fromProviders = function (providers) {
        var config = {};
        providers.forEach(function (b) { return config[b.name] = b; });
        return new ProtoPipes(config);
    };
    ProtoPipes.prototype.get = function (name) {
        var provider = this.config[name];
        if (lang_1.isBlank(provider))
            throw new exceptions_1.BaseException("Cannot find pipe '" + name + "'.");
        return provider;
    };
    return ProtoPipes;
})();
exports.ProtoPipes = ProtoPipes;
var Pipes = (function () {
    function Pipes(proto, injector) {
        this.proto = proto;
        this.injector = injector;
        /** @internal */
        this._config = {};
    }
    Pipes.prototype.get = function (name) {
        var cached = collection_1.StringMapWrapper.get(this._config, name);
        if (lang_1.isPresent(cached))
            return cached;
        var p = this.proto.get(name);
        var transform = this.injector.instantiateResolved(p);
        var res = new cd.SelectedPipe(transform, p.pure);
        if (p.pure) {
            collection_1.StringMapWrapper.set(this._config, name, res);
        }
        return res;
    };
    return Pipes;
})();
exports.Pipes = Pipes;
//# sourceMappingURL=pipes.js.map