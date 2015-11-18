var testing_internal_1 = require('angular2/testing_internal');
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
var shared_styles_host_1 = require('angular2/src/platform/dom/shared_styles_host');
function main() {
    testing_internal_1.describe('DomSharedStylesHost', function () {
        var doc;
        var ssh;
        var someHost;
        testing_internal_1.beforeEach(function () {
            doc = dom_adapter_1.DOM.createHtmlDocument();
            doc.title = '';
            ssh = new shared_styles_host_1.DomSharedStylesHost(doc);
            someHost = dom_adapter_1.DOM.createElement('div');
        });
        testing_internal_1.it('should add existing styles to new hosts', function () {
            ssh.addStyles(['a {};']);
            ssh.addHost(someHost);
            testing_internal_1.expect(dom_adapter_1.DOM.getInnerHTML(someHost)).toEqual('<style>a {};</style>');
        });
        testing_internal_1.it('should add new styles to hosts', function () {
            ssh.addHost(someHost);
            ssh.addStyles(['a {};']);
            testing_internal_1.expect(dom_adapter_1.DOM.getInnerHTML(someHost)).toEqual('<style>a {};</style>');
        });
        testing_internal_1.it('should add styles only once to hosts', function () {
            ssh.addStyles(['a {};']);
            ssh.addHost(someHost);
            ssh.addStyles(['a {};']);
            testing_internal_1.expect(dom_adapter_1.DOM.getInnerHTML(someHost)).toEqual('<style>a {};</style>');
        });
        testing_internal_1.it('should use the document head as default host', function () {
            ssh.addStyles(['a {};', 'b {};']);
            testing_internal_1.expect(doc.head).toHaveText('a {};b {};');
        });
    });
}
exports.main = main;
//# sourceMappingURL=shared_styles_host_spec.js.map