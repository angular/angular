var testing_internal_1 = require('angular2/testing_internal');
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
var browser_1 = require('angular2/platform/browser');
function main() {
    testing_internal_1.describe('title service', function () {
        var initialTitle = dom_adapter_1.DOM.getTitle();
        var titleService = new browser_1.Title();
        testing_internal_1.afterEach(function () { dom_adapter_1.DOM.setTitle(initialTitle); });
        testing_internal_1.it('should allow reading initial title', function () { testing_internal_1.expect(titleService.getTitle()).toEqual(initialTitle); });
        testing_internal_1.it('should set a title on the injected document', function () {
            titleService.setTitle('test title');
            testing_internal_1.expect(dom_adapter_1.DOM.getTitle()).toEqual('test title');
            testing_internal_1.expect(titleService.getTitle()).toEqual('test title');
        });
        testing_internal_1.it('should reset title to empty string if title not provided', function () {
            titleService.setTitle(null);
            testing_internal_1.expect(dom_adapter_1.DOM.getTitle()).toEqual('');
        });
    });
}
exports.main = main;
//# sourceMappingURL=title_spec.js.map