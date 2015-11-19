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
var lang_1 = require('angular2/src/facade/lang');
var core_1 = require('angular2/core');
/**
 * Transforms any input value using `JSON.stringify`. Useful for debugging.
 *
 * ### Example
 * {@example core/pipes/ts/json_pipe/json_pipe_example.ts region='JsonPipe'}
 */
var JsonPipe = (function () {
    function JsonPipe() {
    }
    JsonPipe.prototype.transform = function (value, args) {
        if (args === void 0) { args = null; }
        return lang_1.Json.stringify(value);
    };
    JsonPipe = __decorate([
        lang_1.CONST(),
        core_1.Pipe({ name: 'json', pure: false }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], JsonPipe);
    return JsonPipe;
})();
exports.JsonPipe = JsonPipe;
//# sourceMappingURL=json_pipe.js.map