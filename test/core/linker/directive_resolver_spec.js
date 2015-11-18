var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
var testing_internal_1 = require('angular2/testing_internal');
var directive_resolver_1 = require('angular2/src/core/linker/directive_resolver');
var metadata_1 = require('angular2/src/core/metadata');
var SomeDirective = (function () {
    function SomeDirective() {
    }
    SomeDirective = __decorate([
        metadata_1.Directive({ selector: 'someDirective' }), 
        __metadata('design:paramtypes', [])
    ], SomeDirective);
    return SomeDirective;
})();
var SomeChildDirective = (function (_super) {
    __extends(SomeChildDirective, _super);
    function SomeChildDirective() {
        _super.apply(this, arguments);
    }
    SomeChildDirective = __decorate([
        metadata_1.Directive({ selector: 'someChildDirective' }), 
        __metadata('design:paramtypes', [])
    ], SomeChildDirective);
    return SomeChildDirective;
})(SomeDirective);
var SomeDirectiveWithInputs = (function () {
    function SomeDirectiveWithInputs() {
    }
    __decorate([
        metadata_1.Input(), 
        __metadata('design:type', Object)
    ], SomeDirectiveWithInputs.prototype, "a");
    __decorate([
        metadata_1.Input("renamed"), 
        __metadata('design:type', Object)
    ], SomeDirectiveWithInputs.prototype, "b");
    SomeDirectiveWithInputs = __decorate([
        metadata_1.Directive({ selector: 'someDirective', inputs: ['c'] }), 
        __metadata('design:paramtypes', [])
    ], SomeDirectiveWithInputs);
    return SomeDirectiveWithInputs;
})();
var SomeDirectiveWithOutputs = (function () {
    function SomeDirectiveWithOutputs() {
    }
    __decorate([
        metadata_1.Output(), 
        __metadata('design:type', Object)
    ], SomeDirectiveWithOutputs.prototype, "a");
    __decorate([
        metadata_1.Output("renamed"), 
        __metadata('design:type', Object)
    ], SomeDirectiveWithOutputs.prototype, "b");
    SomeDirectiveWithOutputs = __decorate([
        metadata_1.Directive({ selector: 'someDirective', outputs: ['c'] }), 
        __metadata('design:paramtypes', [])
    ], SomeDirectiveWithOutputs);
    return SomeDirectiveWithOutputs;
})();
var SomeDirectiveWithProperties = (function () {
    function SomeDirectiveWithProperties() {
    }
    SomeDirectiveWithProperties = __decorate([
        metadata_1.Directive({ selector: 'someDirective', properties: ['a'] }), 
        __metadata('design:paramtypes', [])
    ], SomeDirectiveWithProperties);
    return SomeDirectiveWithProperties;
})();
var SomeDirectiveWithEvents = (function () {
    function SomeDirectiveWithEvents() {
    }
    SomeDirectiveWithEvents = __decorate([
        metadata_1.Directive({ selector: 'someDirective', events: ['a'] }), 
        __metadata('design:paramtypes', [])
    ], SomeDirectiveWithEvents);
    return SomeDirectiveWithEvents;
})();
var SomeDirectiveWithSetterProps = (function () {
    function SomeDirectiveWithSetterProps() {
    }
    Object.defineProperty(SomeDirectiveWithSetterProps.prototype, "a", {
        set: function (value) {
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SomeDirectiveWithSetterProps.prototype, "a",
        __decorate([
            metadata_1.Input("renamed"), 
            __metadata('design:type', Object), 
            __metadata('design:paramtypes', [Object])
        ], SomeDirectiveWithSetterProps.prototype, "a", Object.getOwnPropertyDescriptor(SomeDirectiveWithSetterProps.prototype, "a")));
    SomeDirectiveWithSetterProps = __decorate([
        metadata_1.Directive({ selector: 'someDirective' }), 
        __metadata('design:paramtypes', [])
    ], SomeDirectiveWithSetterProps);
    return SomeDirectiveWithSetterProps;
})();
var SomeDirectiveWithGetterOutputs = (function () {
    function SomeDirectiveWithGetterOutputs() {
    }
    Object.defineProperty(SomeDirectiveWithGetterOutputs.prototype, "a", {
        get: function () {
            return null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SomeDirectiveWithGetterOutputs.prototype, "a",
        __decorate([
            metadata_1.Output("renamed"), 
            __metadata('design:type', Object)
        ], SomeDirectiveWithGetterOutputs.prototype, "a", Object.getOwnPropertyDescriptor(SomeDirectiveWithGetterOutputs.prototype, "a")));
    SomeDirectiveWithGetterOutputs = __decorate([
        metadata_1.Directive({ selector: 'someDirective' }), 
        __metadata('design:paramtypes', [])
    ], SomeDirectiveWithGetterOutputs);
    return SomeDirectiveWithGetterOutputs;
})();
var SomeDirectiveWithHostBindings = (function () {
    function SomeDirectiveWithHostBindings() {
    }
    __decorate([
        metadata_1.HostBinding(), 
        __metadata('design:type', Object)
    ], SomeDirectiveWithHostBindings.prototype, "a");
    __decorate([
        metadata_1.HostBinding("renamed"), 
        __metadata('design:type', Object)
    ], SomeDirectiveWithHostBindings.prototype, "b");
    SomeDirectiveWithHostBindings = __decorate([
        metadata_1.Directive({ selector: 'someDirective', host: { '[c]': 'c' } }), 
        __metadata('design:paramtypes', [])
    ], SomeDirectiveWithHostBindings);
    return SomeDirectiveWithHostBindings;
})();
var SomeDirectiveWithHostListeners = (function () {
    function SomeDirectiveWithHostListeners() {
    }
    SomeDirectiveWithHostListeners.prototype.onA = function () {
    };
    SomeDirectiveWithHostListeners.prototype.onB = function (value) {
    };
    Object.defineProperty(SomeDirectiveWithHostListeners.prototype, "onA",
        __decorate([
            metadata_1.HostListener('a'), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', []), 
            __metadata('design:returntype', void 0)
        ], SomeDirectiveWithHostListeners.prototype, "onA", Object.getOwnPropertyDescriptor(SomeDirectiveWithHostListeners.prototype, "onA")));
    Object.defineProperty(SomeDirectiveWithHostListeners.prototype, "onB",
        __decorate([
            metadata_1.HostListener('b', ['$event.value']), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', [Object]), 
            __metadata('design:returntype', void 0)
        ], SomeDirectiveWithHostListeners.prototype, "onB", Object.getOwnPropertyDescriptor(SomeDirectiveWithHostListeners.prototype, "onB")));
    SomeDirectiveWithHostListeners = __decorate([
        metadata_1.Directive({ selector: 'someDirective', host: { '(c)': 'onC()' } }), 
        __metadata('design:paramtypes', [])
    ], SomeDirectiveWithHostListeners);
    return SomeDirectiveWithHostListeners;
})();
var SomeDirectiveWithContentChildren = (function () {
    function SomeDirectiveWithContentChildren() {
    }
    __decorate([
        metadata_1.ContentChildren("a"), 
        __metadata('design:type', Object)
    ], SomeDirectiveWithContentChildren.prototype, "as");
    SomeDirectiveWithContentChildren = __decorate([
        metadata_1.Directive({ selector: 'someDirective', queries: { "cs": new metadata_1.ContentChildren("c") } }), 
        __metadata('design:paramtypes', [])
    ], SomeDirectiveWithContentChildren);
    return SomeDirectiveWithContentChildren;
})();
var SomeDirectiveWithViewChildren = (function () {
    function SomeDirectiveWithViewChildren() {
    }
    __decorate([
        metadata_1.ViewChildren("a"), 
        __metadata('design:type', Object)
    ], SomeDirectiveWithViewChildren.prototype, "as");
    SomeDirectiveWithViewChildren = __decorate([
        metadata_1.Directive({ selector: 'someDirective', queries: { "cs": new metadata_1.ViewChildren("c") } }), 
        __metadata('design:paramtypes', [])
    ], SomeDirectiveWithViewChildren);
    return SomeDirectiveWithViewChildren;
})();
var SomeDirectiveWithContentChild = (function () {
    function SomeDirectiveWithContentChild() {
    }
    __decorate([
        metadata_1.ContentChild("a"), 
        __metadata('design:type', Object)
    ], SomeDirectiveWithContentChild.prototype, "a");
    SomeDirectiveWithContentChild = __decorate([
        metadata_1.Directive({ selector: 'someDirective', queries: { "c": new metadata_1.ContentChild("c") } }), 
        __metadata('design:paramtypes', [])
    ], SomeDirectiveWithContentChild);
    return SomeDirectiveWithContentChild;
})();
var SomeDirectiveWithViewChild = (function () {
    function SomeDirectiveWithViewChild() {
    }
    __decorate([
        metadata_1.ViewChild("a"), 
        __metadata('design:type', Object)
    ], SomeDirectiveWithViewChild.prototype, "a");
    SomeDirectiveWithViewChild = __decorate([
        metadata_1.Directive({ selector: 'someDirective', queries: { "c": new metadata_1.ViewChild("c") } }), 
        __metadata('design:paramtypes', [])
    ], SomeDirectiveWithViewChild);
    return SomeDirectiveWithViewChild;
})();
var SomeDirectiveWithoutMetadata = (function () {
    function SomeDirectiveWithoutMetadata() {
    }
    return SomeDirectiveWithoutMetadata;
})();
function main() {
    testing_internal_1.describe("DirectiveResolver", function () {
        var resolver;
        testing_internal_1.beforeEach(function () { resolver = new directive_resolver_1.DirectiveResolver(); });
        testing_internal_1.it('should read out the Directive metadata', function () {
            var directiveMetadata = resolver.resolve(SomeDirective);
            testing_internal_1.expect(directiveMetadata)
                .toEqual(new metadata_1.DirectiveMetadata({ selector: 'someDirective', inputs: [], outputs: [], host: {}, queries: {} }));
        });
        testing_internal_1.it('should throw if not matching metadata is found', function () {
            testing_internal_1.expect(function () { resolver.resolve(SomeDirectiveWithoutMetadata); })
                .toThrowError('No Directive annotation found on SomeDirectiveWithoutMetadata');
        });
        testing_internal_1.it('should not read parent class Directive metadata', function () {
            var directiveMetadata = resolver.resolve(SomeChildDirective);
            testing_internal_1.expect(directiveMetadata)
                .toEqual(new metadata_1.DirectiveMetadata({ selector: 'someChildDirective', inputs: [], outputs: [], host: {}, queries: {} }));
        });
        testing_internal_1.describe('inputs', function () {
            testing_internal_1.it('should append directive inputs', function () {
                var directiveMetadata = resolver.resolve(SomeDirectiveWithInputs);
                testing_internal_1.expect(directiveMetadata.inputs).toEqual(['c', 'a', 'b: renamed']);
            });
            testing_internal_1.it('should work with getters and setters', function () {
                var directiveMetadata = resolver.resolve(SomeDirectiveWithSetterProps);
                testing_internal_1.expect(directiveMetadata.inputs).toEqual(['a: renamed']);
            });
        });
        testing_internal_1.describe('outputs', function () {
            testing_internal_1.it('should append directive outputs', function () {
                var directiveMetadata = resolver.resolve(SomeDirectiveWithOutputs);
                testing_internal_1.expect(directiveMetadata.outputs).toEqual(['c', 'a', 'b: renamed']);
            });
            testing_internal_1.it('should work with getters and setters', function () {
                var directiveMetadata = resolver.resolve(SomeDirectiveWithGetterOutputs);
                testing_internal_1.expect(directiveMetadata.outputs).toEqual(['a: renamed']);
            });
        });
        testing_internal_1.describe('host', function () {
            testing_internal_1.it('should append host bindings', function () {
                var directiveMetadata = resolver.resolve(SomeDirectiveWithHostBindings);
                testing_internal_1.expect(directiveMetadata.host).toEqual({ '[c]': 'c', '[a]': 'a', '[renamed]': 'b' });
            });
            testing_internal_1.it('should append host listeners', function () {
                var directiveMetadata = resolver.resolve(SomeDirectiveWithHostListeners);
                testing_internal_1.expect(directiveMetadata.host)
                    .toEqual({ '(c)': 'onC()', '(a)': 'onA()', '(b)': 'onB($event.value)' });
            });
        });
        testing_internal_1.describe('queries', function () {
            testing_internal_1.it('should append ContentChildren', function () {
                var directiveMetadata = resolver.resolve(SomeDirectiveWithContentChildren);
                testing_internal_1.expect(directiveMetadata.queries)
                    .toEqual({ "cs": new metadata_1.ContentChildren("c"), "as": new metadata_1.ContentChildren("a") });
            });
            testing_internal_1.it('should append ViewChildren', function () {
                var directiveMetadata = resolver.resolve(SomeDirectiveWithViewChildren);
                testing_internal_1.expect(directiveMetadata.queries)
                    .toEqual({ "cs": new metadata_1.ViewChildren("c"), "as": new metadata_1.ViewChildren("a") });
            });
            testing_internal_1.it('should append ContentChild', function () {
                var directiveMetadata = resolver.resolve(SomeDirectiveWithContentChild);
                testing_internal_1.expect(directiveMetadata.queries)
                    .toEqual({ "c": new metadata_1.ContentChild("c"), "a": new metadata_1.ContentChild("a") });
            });
            testing_internal_1.it('should append ViewChild', function () {
                var directiveMetadata = resolver.resolve(SomeDirectiveWithViewChild);
                testing_internal_1.expect(directiveMetadata.queries)
                    .toEqual({ "c": new metadata_1.ViewChild("c"), "a": new metadata_1.ViewChild("a") });
            });
        });
    });
}
exports.main = main;
//# sourceMappingURL=directive_resolver_spec.js.map