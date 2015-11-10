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
var lang_1 = require('angular2/src/facade/lang');
var view_resolver_mock_1 = require('angular2/src/mock/view_resolver_mock');
var metadata_1 = require('angular2/src/core/metadata');
var lang_2 = require('angular2/src/facade/lang');
function main() {
    testing_internal_1.describe('MockViewResolver', function () {
        var viewResolver;
        testing_internal_1.beforeEach(function () { viewResolver = new view_resolver_mock_1.MockViewResolver(); });
        testing_internal_1.describe('View overriding', function () {
            testing_internal_1.it('should fallback to the default ViewResolver when templates are not overridden', function () {
                var view = viewResolver.resolve(SomeComponent);
                testing_internal_1.expect(view.template).toEqual('template');
                testing_internal_1.expect(view.directives).toEqual([SomeDirective]);
            });
            testing_internal_1.it('should allow overriding the @View', function () {
                viewResolver.setView(SomeComponent, new metadata_1.ViewMetadata({ template: 'overridden template' }));
                var view = viewResolver.resolve(SomeComponent);
                testing_internal_1.expect(view.template).toEqual('overridden template');
                testing_internal_1.expect(lang_2.isBlank(view.directives)).toBe(true);
            });
            testing_internal_1.it('should not allow overriding a view after it has been resolved', function () {
                viewResolver.resolve(SomeComponent);
                testing_internal_1.expect(function () {
                    viewResolver.setView(SomeComponent, new metadata_1.ViewMetadata({ template: 'overridden template' }));
                })
                    .toThrowError("The component " + lang_1.stringify(SomeComponent) + " has already been compiled, its configuration can not be changed");
            });
        });
        testing_internal_1.describe('inline template definition overriding', function () {
            testing_internal_1.it('should allow overriding the default template', function () {
                viewResolver.setInlineTemplate(SomeComponent, 'overridden template');
                var view = viewResolver.resolve(SomeComponent);
                testing_internal_1.expect(view.template).toEqual('overridden template');
                testing_internal_1.expect(view.directives).toEqual([SomeDirective]);
            });
            testing_internal_1.it('should allow overriding an overriden @View', function () {
                viewResolver.setView(SomeComponent, new metadata_1.ViewMetadata({ template: 'overridden template' }));
                viewResolver.setInlineTemplate(SomeComponent, 'overridden template x 2');
                var view = viewResolver.resolve(SomeComponent);
                testing_internal_1.expect(view.template).toEqual('overridden template x 2');
            });
            testing_internal_1.it('should not allow overriding a view after it has been resolved', function () {
                viewResolver.resolve(SomeComponent);
                testing_internal_1.expect(function () { viewResolver.setInlineTemplate(SomeComponent, 'overridden template'); })
                    .toThrowError("The component " + lang_1.stringify(SomeComponent) + " has already been compiled, its configuration can not be changed");
            });
        });
        testing_internal_1.describe('Directive overriding', function () {
            testing_internal_1.it('should allow overriding a directive from the default view', function () {
                viewResolver.overrideViewDirective(SomeComponent, SomeDirective, SomeOtherDirective);
                var view = viewResolver.resolve(SomeComponent);
                testing_internal_1.expect(view.directives.length).toEqual(1);
                testing_internal_1.expect(view.directives[0]).toBe(SomeOtherDirective);
            });
            testing_internal_1.it('should allow overriding a directive from an overriden @View', function () {
                viewResolver.setView(SomeComponent, new metadata_1.ViewMetadata({ directives: [SomeOtherDirective] }));
                viewResolver.overrideViewDirective(SomeComponent, SomeOtherDirective, SomeComponent);
                var view = viewResolver.resolve(SomeComponent);
                testing_internal_1.expect(view.directives.length).toEqual(1);
                testing_internal_1.expect(view.directives[0]).toBe(SomeComponent);
            });
            testing_internal_1.it('should throw when the overridden directive is not present', function () {
                viewResolver.overrideViewDirective(SomeComponent, SomeOtherDirective, SomeDirective);
                testing_internal_1.expect(function () { viewResolver.resolve(SomeComponent); })
                    .toThrowError("Overriden directive " + lang_1.stringify(SomeOtherDirective) + " not found in the template of " + lang_1.stringify(SomeComponent));
            });
            testing_internal_1.it('should not allow overriding a directive after its view has been resolved', function () {
                viewResolver.resolve(SomeComponent);
                testing_internal_1.expect(function () {
                    viewResolver.overrideViewDirective(SomeComponent, SomeDirective, SomeOtherDirective);
                })
                    .toThrowError("The component " + lang_1.stringify(SomeComponent) + " has already been compiled, its configuration can not be changed");
            });
        });
    });
}
exports.main = main;
var SomeDirective = (function () {
    function SomeDirective() {
    }
    return SomeDirective;
})();
var SomeComponent = (function () {
    function SomeComponent() {
    }
    SomeComponent = __decorate([
        metadata_1.Component({ selector: 'cmp' }),
        metadata_1.View({
            template: 'template',
            directives: [SomeDirective],
        }), 
        __metadata('design:paramtypes', [])
    ], SomeComponent);
    return SomeComponent;
})();
var SomeOtherDirective = (function () {
    function SomeOtherDirective() {
    }
    return SomeOtherDirective;
})();
//# sourceMappingURL=view_resolver_mock_spec.js.map