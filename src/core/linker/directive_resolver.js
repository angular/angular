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
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var metadata_1 = require('angular2/src/core/metadata');
var reflection_1 = require('angular2/src/core/reflection/reflection');
function _isDirectiveMetadata(type) {
    return type instanceof metadata_1.DirectiveMetadata;
}
/*
 * Resolve a `Type` for {@link DirectiveMetadata}.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
var DirectiveResolver = (function () {
    function DirectiveResolver() {
    }
    /**
     * Return {@link DirectiveMetadata} for a given `Type`.
     */
    DirectiveResolver.prototype.resolve = function (type) {
        var typeMetadata = reflection_1.reflector.annotations(di_1.resolveForwardRef(type));
        if (lang_1.isPresent(typeMetadata)) {
            var metadata = typeMetadata.find(_isDirectiveMetadata);
            if (lang_1.isPresent(metadata)) {
                var propertyMetadata = reflection_1.reflector.propMetadata(type);
                return this._mergeWithPropertyMetadata(metadata, propertyMetadata);
            }
        }
        throw new exceptions_1.BaseException("No Directive annotation found on " + lang_1.stringify(type));
    };
    DirectiveResolver.prototype._mergeWithPropertyMetadata = function (dm, propertyMetadata) {
        var inputs = [];
        var outputs = [];
        var host = {};
        var queries = {};
        collection_1.StringMapWrapper.forEach(propertyMetadata, function (metadata, propName) {
            metadata.forEach(function (a) {
                if (a instanceof metadata_1.InputMetadata) {
                    if (lang_1.isPresent(a.bindingPropertyName)) {
                        inputs.push(propName + ": " + a.bindingPropertyName);
                    }
                    else {
                        inputs.push(propName);
                    }
                }
                if (a instanceof metadata_1.OutputMetadata) {
                    if (lang_1.isPresent(a.bindingPropertyName)) {
                        outputs.push(propName + ": " + a.bindingPropertyName);
                    }
                    else {
                        outputs.push(propName);
                    }
                }
                if (a instanceof metadata_1.HostBindingMetadata) {
                    if (lang_1.isPresent(a.hostPropertyName)) {
                        host[("[" + a.hostPropertyName + "]")] = propName;
                    }
                    else {
                        host[("[" + propName + "]")] = propName;
                    }
                }
                if (a instanceof metadata_1.HostListenerMetadata) {
                    var args = lang_1.isPresent(a.args) ? a.args.join(', ') : '';
                    host[("(" + a.eventName + ")")] = propName + "(" + args + ")";
                }
                if (a instanceof metadata_1.ContentChildrenMetadata) {
                    queries[propName] = a;
                }
                if (a instanceof metadata_1.ViewChildrenMetadata) {
                    queries[propName] = a;
                }
                if (a instanceof metadata_1.ContentChildMetadata) {
                    queries[propName] = a;
                }
                if (a instanceof metadata_1.ViewChildMetadata) {
                    queries[propName] = a;
                }
            });
        });
        return this._merge(dm, inputs, outputs, host, queries);
    };
    DirectiveResolver.prototype._merge = function (dm, inputs, outputs, host, queries) {
        var mergedInputs = lang_1.isPresent(dm.inputs) ? collection_1.ListWrapper.concat(dm.inputs, inputs) : inputs;
        var mergedOutputs = lang_1.isPresent(dm.outputs) ? collection_1.ListWrapper.concat(dm.outputs, outputs) : outputs;
        var mergedHost = lang_1.isPresent(dm.host) ? collection_1.StringMapWrapper.merge(dm.host, host) : host;
        var mergedQueries = lang_1.isPresent(dm.queries) ? collection_1.StringMapWrapper.merge(dm.queries, queries) : queries;
        if (dm instanceof metadata_1.ComponentMetadata) {
            return new metadata_1.ComponentMetadata({
                selector: dm.selector,
                inputs: mergedInputs,
                outputs: mergedOutputs,
                host: mergedHost,
                exportAs: dm.exportAs,
                moduleId: dm.moduleId,
                queries: mergedQueries,
                changeDetection: dm.changeDetection,
                providers: dm.providers,
                viewProviders: dm.viewProviders
            });
        }
        else {
            return new metadata_1.DirectiveMetadata({
                selector: dm.selector,
                inputs: mergedInputs,
                outputs: mergedOutputs,
                host: mergedHost,
                exportAs: dm.exportAs,
                moduleId: dm.moduleId,
                queries: mergedQueries,
                providers: dm.providers
            });
        }
    };
    DirectiveResolver = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DirectiveResolver);
    return DirectiveResolver;
})();
exports.DirectiveResolver = DirectiveResolver;
//# sourceMappingURL=directive_resolver.js.map