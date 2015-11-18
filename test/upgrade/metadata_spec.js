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
var angular2_1 = require('angular2/angular2');
var metadata_1 = require('angular2/src/upgrade/metadata');
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
function main() {
    if (!dom_adapter_1.DOM.supportsDOMEvents())
        return;
    testing_internal_1.describe('upgrade metadata', function () {
        testing_internal_1.it('should extract component selector', function () {
            testing_internal_1.expect(metadata_1.getComponentInfo(ElementNameComponent).selector).toEqual('elementNameDashed');
        });
        testing_internal_1.describe('errors', function () {
            testing_internal_1.it('should throw on missing selector', function () {
                testing_internal_1.expect(function () { return metadata_1.getComponentInfo(AttributeNameComponent); })
                    .toThrowErrorWith("Only selectors matching element names are supported, got: [attr-name]");
            });
            testing_internal_1.it('should throw on non element names', function () {
                testing_internal_1.expect(function () { return metadata_1.getComponentInfo(NoAnnotationComponent); })
                    .toThrowErrorWith("No Directive annotation found on NoAnnotationComponent");
            });
        });
        testing_internal_1.describe('parseFields', function () {
            testing_internal_1.it('should process nulls', function () { testing_internal_1.expect(metadata_1.parseFields(null)).toEqual([]); });
            testing_internal_1.it('should process values', function () {
                testing_internal_1.expect(metadata_1.parseFields([' name ', ' prop :  attr ']))
                    .toEqual([
                    {
                        prop: 'name',
                        attr: 'name',
                        bracketAttr: '[name]',
                        parenAttr: '(name)',
                        bracketParenAttr: '[(name)]',
                        onAttr: 'onName',
                        bindAttr: 'bindName',
                        bindonAttr: 'bindonName'
                    },
                    {
                        prop: 'prop',
                        attr: 'attr',
                        bracketAttr: '[attr]',
                        parenAttr: '(attr)',
                        bracketParenAttr: '[(attr)]',
                        onAttr: 'onAttr',
                        bindAttr: 'bindAttr',
                        bindonAttr: 'bindonAttr'
                    }
                ]);
            });
        });
    });
}
exports.main = main;
var ElementNameComponent = (function () {
    function ElementNameComponent() {
    }
    ElementNameComponent = __decorate([
        angular2_1.Component({ selector: 'element-name-dashed' }),
        angular2_1.View({ template: "" }), 
        __metadata('design:paramtypes', [])
    ], ElementNameComponent);
    return ElementNameComponent;
})();
var AttributeNameComponent = (function () {
    function AttributeNameComponent() {
    }
    AttributeNameComponent = __decorate([
        angular2_1.Component({ selector: '[attr-name]' }),
        angular2_1.View({ template: "" }), 
        __metadata('design:paramtypes', [])
    ], AttributeNameComponent);
    return AttributeNameComponent;
})();
var NoAnnotationComponent = (function () {
    function NoAnnotationComponent() {
    }
    return NoAnnotationComponent;
})();
//# sourceMappingURL=metadata_spec.js.map