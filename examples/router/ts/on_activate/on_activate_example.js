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
var angular2_1 = require('angular2/angular2');
var router_1 = require('angular2/router');
// #docregion onActivate
var MyCmp = (function () {
    function MyCmp() {
        this.log = '';
    }
    MyCmp.prototype.onActivate = function (next, prev) {
        this.log = "Finished navigating from \"" + (prev ? prev.urlPath : 'null') + "\" to \"" + next.urlPath + "\"";
    };
    MyCmp = __decorate([
        angular2_1.Component({ selector: 'my-cmp', template: "<div>onActivate: {{log}}</div>" }), 
        __metadata('design:paramtypes', [])
    ], MyCmp);
    return MyCmp;
})();
// #enddocregion
var AppCmp = (function () {
    function AppCmp() {
    }
    AppCmp = __decorate([
        angular2_1.Component({
            selector: 'example-app',
            template: "\n    <h1>My App</h1>\n    <nav>\n      <a [router-link]=\"['/HomeCmp']\" id=\"home-link\">Navigate Home</a> |\n      <a [router-link]=\"['/ParamCmp', {param: 1}]\" id=\"param-link\">Navigate with a Param</a>\n    </nav>\n    <router-outlet></router-outlet>\n  ",
            directives: [router_1.ROUTER_DIRECTIVES]
        }),
        router_1.RouteConfig([
            { path: '/', component: MyCmp, name: 'HomeCmp' },
            { path: '/:param', component: MyCmp, name: 'ParamCmp' }
        ]), 
        __metadata('design:paramtypes', [])
    ], AppCmp);
    return AppCmp;
})();
function main() {
    return angular2_1.bootstrap(AppCmp, [angular2_1.provide(router_1.APP_BASE_HREF, { useValue: '/angular2/examples/router/ts/on_activate' })]);
}
exports.main = main;
//# sourceMappingURL=on_activate_example.js.map