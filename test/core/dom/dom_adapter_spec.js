var testing_internal_1 = require('angular2/testing_internal');
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
function main() {
    testing_internal_1.describe('dom adapter', function () {
        testing_internal_1.it('should not coalesque text nodes', function () {
            var el1 = testing_internal_1.el('<div>a</div>');
            var el2 = testing_internal_1.el('<div>b</div>');
            dom_adapter_1.DOM.appendChild(el2, dom_adapter_1.DOM.firstChild(el1));
            testing_internal_1.expect(dom_adapter_1.DOM.childNodes(el2).length).toBe(2);
            var el2Clone = dom_adapter_1.DOM.clone(el2);
            testing_internal_1.expect(dom_adapter_1.DOM.childNodes(el2Clone).length).toBe(2);
        });
        testing_internal_1.it('should clone correctly', function () {
            var el1 = testing_internal_1.el('<div x="y">a<span>b</span></div>');
            var clone = dom_adapter_1.DOM.clone(el1);
            testing_internal_1.expect(clone).not.toBe(el1);
            dom_adapter_1.DOM.setAttribute(clone, 'test', '1');
            testing_internal_1.expect(testing_internal_1.stringifyElement(clone)).toEqual('<div test="1" x="y">a<span>b</span></div>');
            testing_internal_1.expect(dom_adapter_1.DOM.getAttribute(el1, 'test')).toBeFalsy();
            var cNodes = dom_adapter_1.DOM.childNodes(clone);
            var firstChild = cNodes[0];
            var secondChild = cNodes[1];
            testing_internal_1.expect(dom_adapter_1.DOM.parentElement(firstChild)).toBe(clone);
            testing_internal_1.expect(dom_adapter_1.DOM.nextSibling(firstChild)).toBe(secondChild);
            testing_internal_1.expect(dom_adapter_1.DOM.isTextNode(firstChild)).toBe(true);
            testing_internal_1.expect(dom_adapter_1.DOM.parentElement(secondChild)).toBe(clone);
            testing_internal_1.expect(dom_adapter_1.DOM.nextSibling(secondChild)).toBeFalsy();
            testing_internal_1.expect(dom_adapter_1.DOM.isElementNode(secondChild)).toBe(true);
        });
        testing_internal_1.it('should be able to create text nodes and use them with the other APIs', function () {
            var t = dom_adapter_1.DOM.createTextNode('hello');
            testing_internal_1.expect(dom_adapter_1.DOM.isTextNode(t)).toBe(true);
            var d = dom_adapter_1.DOM.createElement('div');
            dom_adapter_1.DOM.appendChild(d, t);
            testing_internal_1.expect(dom_adapter_1.DOM.getInnerHTML(d)).toEqual('hello');
        });
        testing_internal_1.it('should set className via the class attribute', function () {
            var d = dom_adapter_1.DOM.createElement('div');
            dom_adapter_1.DOM.setAttribute(d, 'class', 'class1');
            testing_internal_1.expect(d.className).toEqual('class1');
        });
        testing_internal_1.it('should allow to remove nodes without parents', function () {
            var d = dom_adapter_1.DOM.createElement('div');
            testing_internal_1.expect(function () { return dom_adapter_1.DOM.remove(d); }).not.toThrow();
        });
        if (dom_adapter_1.DOM.supportsDOMEvents()) {
            testing_internal_1.describe('getBaseHref', function () {
                testing_internal_1.beforeEach(function () { return dom_adapter_1.DOM.resetBaseElement(); });
                testing_internal_1.it('should return null if base element is absent', function () { testing_internal_1.expect(dom_adapter_1.DOM.getBaseHref()).toBeNull(); });
                testing_internal_1.it('should return the value of the base element', function () {
                    var baseEl = dom_adapter_1.DOM.createElement('base');
                    dom_adapter_1.DOM.setAttribute(baseEl, 'href', '/drop/bass/connon/');
                    var headEl = dom_adapter_1.DOM.defaultDoc().head;
                    dom_adapter_1.DOM.appendChild(headEl, baseEl);
                    var baseHref = dom_adapter_1.DOM.getBaseHref();
                    dom_adapter_1.DOM.removeChild(headEl, baseEl);
                    dom_adapter_1.DOM.resetBaseElement();
                    testing_internal_1.expect(baseHref).toEqual('/drop/bass/connon/');
                });
                testing_internal_1.it('should return a relative url', function () {
                    var baseEl = dom_adapter_1.DOM.createElement('base');
                    dom_adapter_1.DOM.setAttribute(baseEl, 'href', 'base');
                    var headEl = dom_adapter_1.DOM.defaultDoc().head;
                    dom_adapter_1.DOM.appendChild(headEl, baseEl);
                    var baseHref = dom_adapter_1.DOM.getBaseHref();
                    dom_adapter_1.DOM.removeChild(headEl, baseEl);
                    dom_adapter_1.DOM.resetBaseElement();
                    testing_internal_1.expect(baseHref).toEqual('/base');
                });
            });
        }
    });
}
exports.main = main;
//# sourceMappingURL=dom_adapter_spec.js.map