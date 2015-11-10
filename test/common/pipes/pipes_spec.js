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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var testing_internal_1 = require('angular2/testing_internal');
var core_1 = require('angular2/core');
var pipes_1 = require('angular2/src/core/pipes/pipes');
var pipe_provider_1 = require('angular2/src/core/pipes/pipe_provider');
var PipeA = (function () {
    function PipeA() {
    }
    PipeA.prototype.transform = function (a, b) { };
    PipeA.prototype.onDestroy = function () { };
    return PipeA;
})();
var PipeB = (function () {
    function PipeB(dep) {
        this.dep = dep;
    }
    PipeB.prototype.transform = function (a, b) { };
    PipeB.prototype.onDestroy = function () { };
    PipeB = __decorate([
        __param(0, core_1.Inject("dep")), 
        __metadata('design:paramtypes', [Object])
    ], PipeB);
    return PipeB;
})();
function main() {
    testing_internal_1.describe("Pipes", function () {
        var injector;
        testing_internal_1.beforeEach(function () {
            injector = core_1.Injector.resolveAndCreate([core_1.provide('dep', { useValue: 'dependency' })]);
        });
        testing_internal_1.it('should instantiate a pipe', function () {
            var proto = pipes_1.ProtoPipes.fromProviders([pipe_provider_1.PipeProvider.createFromType(PipeA, new core_1.Pipe({ name: 'a' }))]);
            var pipes = new pipes_1.Pipes(proto, injector);
            testing_internal_1.expect(pipes.get("a").pipe).toBeAnInstanceOf(PipeA);
        });
        testing_internal_1.it('should throw when no pipe found', function () {
            var proto = pipes_1.ProtoPipes.fromProviders([]);
            var pipes = new pipes_1.Pipes(proto, injector);
            testing_internal_1.expect(function () { return pipes.get("invalid"); }).toThrowErrorWith("Cannot find pipe 'invalid'");
        });
        testing_internal_1.it('should inject dependencies from the provided injector', function () {
            var proto = pipes_1.ProtoPipes.fromProviders([pipe_provider_1.PipeProvider.createFromType(PipeB, new core_1.Pipe({ name: 'b' }))]);
            var pipes = new pipes_1.Pipes(proto, injector);
            testing_internal_1.expect(pipes.get("b").pipe.dep).toEqual("dependency");
        });
        testing_internal_1.it('should cache pure pipes', function () {
            var proto = pipes_1.ProtoPipes.fromProviders([pipe_provider_1.PipeProvider.createFromType(PipeA, new core_1.Pipe({ name: 'a', pure: true }))]);
            var pipes = new pipes_1.Pipes(proto, injector);
            testing_internal_1.expect(pipes.get("a").pure).toEqual(true);
            testing_internal_1.expect(pipes.get("a")).toBe(pipes.get("a"));
        });
        testing_internal_1.it('should NOT cache impure pipes', function () {
            var proto = pipes_1.ProtoPipes.fromProviders([pipe_provider_1.PipeProvider.createFromType(PipeA, new core_1.Pipe({ name: 'a', pure: false }))]);
            var pipes = new pipes_1.Pipes(proto, injector);
            testing_internal_1.expect(pipes.get("a").pure).toEqual(false);
            testing_internal_1.expect(pipes.get("a")).not.toBe(pipes.get("a"));
        });
    });
}
exports.main = main;
//# sourceMappingURL=pipes_spec.js.map