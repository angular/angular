var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var testing_internal_1 = require('angular2/testing_internal');
var core_1 = require('angular2/core');
var dom_events_1 = require('angular2/src/platform/dom/events/dom_events');
var ng_zone_1 = require('angular2/src/core/zone/ng_zone');
var collection_1 = require('angular2/src/facade/collection');
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
function main() {
    var domEventPlugin;
    testing_internal_1.beforeEach(function () { domEventPlugin = new dom_events_1.DomEventsPlugin(); });
    testing_internal_1.describe('EventManager', function () {
        testing_internal_1.it('should delegate event bindings to plugins that are passed in from the most generic one to the most specific one', function () {
            var element = testing_internal_1.el('<div></div>');
            var handler = function (e) { return e; };
            var plugin = new FakeEventManagerPlugin(['click']);
            var manager = new core_1.EventManager([domEventPlugin, plugin], new FakeNgZone());
            manager.addEventListener(element, 'click', handler);
            testing_internal_1.expect(plugin._eventHandler.get('click')).toBe(handler);
        });
        testing_internal_1.it('should delegate event bindings to the first plugin supporting the event', function () {
            var element = testing_internal_1.el('<div></div>');
            var clickHandler = function (e) { return e; };
            var dblClickHandler = function (e) { return e; };
            var plugin1 = new FakeEventManagerPlugin(['dblclick']);
            var plugin2 = new FakeEventManagerPlugin(['click', 'dblclick']);
            var manager = new core_1.EventManager([plugin2, plugin1], new FakeNgZone());
            manager.addEventListener(element, 'click', clickHandler);
            manager.addEventListener(element, 'dblclick', dblClickHandler);
            testing_internal_1.expect(plugin1._eventHandler.has('click')).toBe(false);
            testing_internal_1.expect(plugin2._eventHandler.get('click')).toBe(clickHandler);
            testing_internal_1.expect(plugin2._eventHandler.has('dblclick')).toBe(false);
            testing_internal_1.expect(plugin1._eventHandler.get('dblclick')).toBe(dblClickHandler);
        });
        testing_internal_1.it('should throw when no plugin can handle the event', function () {
            var element = testing_internal_1.el('<div></div>');
            var plugin = new FakeEventManagerPlugin(['dblclick']);
            var manager = new core_1.EventManager([plugin], new FakeNgZone());
            testing_internal_1.expect(function () { return manager.addEventListener(element, 'click', null); })
                .toThrowError('No event manager plugin found for event click');
        });
        testing_internal_1.it('events are caught when fired from a child', function () {
            var element = testing_internal_1.el('<div><div></div></div>');
            // Workaround for https://bugs.webkit.org/show_bug.cgi?id=122755
            dom_adapter_1.DOM.appendChild(dom_adapter_1.DOM.defaultDoc().body, element);
            var child = dom_adapter_1.DOM.firstChild(element);
            var dispatchedEvent = dom_adapter_1.DOM.createMouseEvent('click');
            var receivedEvent = null;
            var handler = function (e) { receivedEvent = e; };
            var manager = new core_1.EventManager([domEventPlugin], new FakeNgZone());
            manager.addEventListener(element, 'click', handler);
            dom_adapter_1.DOM.dispatchEvent(child, dispatchedEvent);
            testing_internal_1.expect(receivedEvent).toBe(dispatchedEvent);
        });
        testing_internal_1.it('should add and remove global event listeners', function () {
            var element = testing_internal_1.el('<div><div></div></div>');
            dom_adapter_1.DOM.appendChild(dom_adapter_1.DOM.defaultDoc().body, element);
            var dispatchedEvent = dom_adapter_1.DOM.createMouseEvent('click');
            var receivedEvent = null;
            var handler = function (e) { receivedEvent = e; };
            var manager = new core_1.EventManager([domEventPlugin], new FakeNgZone());
            var remover = manager.addGlobalEventListener("document", 'click', handler);
            dom_adapter_1.DOM.dispatchEvent(element, dispatchedEvent);
            testing_internal_1.expect(receivedEvent).toBe(dispatchedEvent);
            receivedEvent = null;
            remover();
            dom_adapter_1.DOM.dispatchEvent(element, dispatchedEvent);
            testing_internal_1.expect(receivedEvent).toBe(null);
        });
    });
}
exports.main = main;
var FakeEventManagerPlugin = (function (_super) {
    __extends(FakeEventManagerPlugin, _super);
    function FakeEventManagerPlugin(_supports) {
        _super.call(this);
        this._supports = _supports;
        this._eventHandler = new collection_1.Map();
    }
    FakeEventManagerPlugin.prototype.supports = function (eventName) { return collection_1.ListWrapper.contains(this._supports, eventName); };
    FakeEventManagerPlugin.prototype.addEventListener = function (element, eventName, handler) {
        var _this = this;
        this._eventHandler.set(eventName, handler);
        return function () { _this._eventHandler.delete(eventName); };
    };
    return FakeEventManagerPlugin;
})(core_1.EventManagerPlugin);
var FakeNgZone = (function (_super) {
    __extends(FakeNgZone, _super);
    function FakeNgZone() {
        _super.call(this, { enableLongStackTrace: false });
    }
    FakeNgZone.prototype.run = function (fn) { fn(); };
    FakeNgZone.prototype.runOutsideAngular = function (fn) { return fn(); };
    return FakeNgZone;
})(ng_zone_1.NgZone);
//# sourceMappingURL=event_manager_spec.js.map