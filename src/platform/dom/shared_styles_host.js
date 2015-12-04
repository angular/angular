'use strict';var __extends = (this && this.__extends) || function (d, b) {
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
var di_1 = require('angular2/src/core/di');
var collection_1 = require('angular2/src/facade/collection');
var dom_tokens_1 = require('./dom_tokens');
var SharedStylesHost = (function () {
    function SharedStylesHost() {
        /** @internal */
        this._styles = [];
        /** @internal */
        this._stylesSet = new Set();
    }
    SharedStylesHost.prototype.addStyles = function (styles) {
        var _this = this;
        var additions = [];
        styles.forEach(function (style) {
            if (!collection_1.SetWrapper.has(_this._stylesSet, style)) {
                _this._stylesSet.add(style);
                _this._styles.push(style);
                additions.push(style);
            }
        });
        this.onStylesAdded(additions);
    };
    SharedStylesHost.prototype.onStylesAdded = function (additions) { };
    SharedStylesHost.prototype.getAllStyles = function () { return this._styles; };
    SharedStylesHost = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], SharedStylesHost);
    return SharedStylesHost;
})();
exports.SharedStylesHost = SharedStylesHost;
var DomSharedStylesHost = (function (_super) {
    __extends(DomSharedStylesHost, _super);
    function DomSharedStylesHost(doc) {
        _super.call(this);
        this._hostNodes = new Set();
        this._hostNodes.add(doc.head);
    }
    /** @internal */
    DomSharedStylesHost.prototype._addStylesToHost = function (styles, host) {
        for (var i = 0; i < styles.length; i++) {
            var style = styles[i];
            dom_adapter_1.DOM.appendChild(host, dom_adapter_1.DOM.createStyleElement(style));
        }
    };
    DomSharedStylesHost.prototype.addHost = function (hostNode) {
        this._addStylesToHost(this._styles, hostNode);
        this._hostNodes.add(hostNode);
    };
    DomSharedStylesHost.prototype.removeHost = function (hostNode) { collection_1.SetWrapper.delete(this._hostNodes, hostNode); };
    DomSharedStylesHost.prototype.onStylesAdded = function (additions) {
        var _this = this;
        this._hostNodes.forEach(function (hostNode) { _this._addStylesToHost(additions, hostNode); });
    };
    DomSharedStylesHost = __decorate([
        di_1.Injectable(),
        __param(0, di_1.Inject(dom_tokens_1.DOCUMENT)), 
        __metadata('design:paramtypes', [Object])
    ], DomSharedStylesHost);
    return DomSharedStylesHost;
})(SharedStylesHost);
exports.DomSharedStylesHost = DomSharedStylesHost;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkX3N0eWxlc19ob3N0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9zaGFyZWRfc3R5bGVzX2hvc3QudHMiXSwibmFtZXMiOlsiU2hhcmVkU3R5bGVzSG9zdCIsIlNoYXJlZFN0eWxlc0hvc3QuY29uc3RydWN0b3IiLCJTaGFyZWRTdHlsZXNIb3N0LmFkZFN0eWxlcyIsIlNoYXJlZFN0eWxlc0hvc3Qub25TdHlsZXNBZGRlZCIsIlNoYXJlZFN0eWxlc0hvc3QuZ2V0QWxsU3R5bGVzIiwiRG9tU2hhcmVkU3R5bGVzSG9zdCIsIkRvbVNoYXJlZFN0eWxlc0hvc3QuY29uc3RydWN0b3IiLCJEb21TaGFyZWRTdHlsZXNIb3N0Ll9hZGRTdHlsZXNUb0hvc3QiLCJEb21TaGFyZWRTdHlsZXNIb3N0LmFkZEhvc3QiLCJEb21TaGFyZWRTdHlsZXNIb3N0LnJlbW92ZUhvc3QiLCJEb21TaGFyZWRTdHlsZXNIb3N0Lm9uU3R5bGVzQWRkZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0QkFBa0IsdUNBQXVDLENBQUMsQ0FBQTtBQUMxRCxtQkFBaUMsc0JBQXNCLENBQUMsQ0FBQTtBQUN4RCwyQkFBeUIsZ0NBQWdDLENBQUMsQ0FBQTtBQUMxRCwyQkFBdUIsY0FBYyxDQUFDLENBQUE7QUFFdEM7SUFPRUE7UUFMQUMsZ0JBQWdCQTtRQUNoQkEsWUFBT0EsR0FBYUEsRUFBRUEsQ0FBQ0E7UUFDdkJBLGdCQUFnQkE7UUFDaEJBLGVBQVVBLEdBQUdBLElBQUlBLEdBQUdBLEVBQVVBLENBQUNBO0lBRWhCQSxDQUFDQTtJQUVoQkQsb0NBQVNBLEdBQVRBLFVBQVVBLE1BQWdCQTtRQUExQkUsaUJBVUNBO1FBVENBLElBQUlBLFNBQVNBLEdBQUdBLEVBQUVBLENBQUNBO1FBQ25CQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFBQSxLQUFLQTtZQUNsQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FB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fSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyJztcbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1NldFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICcuL2RvbV90b2tlbnMnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgU2hhcmVkU3R5bGVzSG9zdCB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N0eWxlczogc3RyaW5nW10gPSBbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3R5bGVzU2V0ID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIGFkZFN0eWxlcyhzdHlsZXM6IHN0cmluZ1tdKSB7XG4gICAgdmFyIGFkZGl0aW9ucyA9IFtdO1xuICAgIHN0eWxlcy5mb3JFYWNoKHN0eWxlID0+IHtcbiAgICAgIGlmICghU2V0V3JhcHBlci5oYXModGhpcy5fc3R5bGVzU2V0LCBzdHlsZSkpIHtcbiAgICAgICAgdGhpcy5fc3R5bGVzU2V0LmFkZChzdHlsZSk7XG4gICAgICAgIHRoaXMuX3N0eWxlcy5wdXNoKHN0eWxlKTtcbiAgICAgICAgYWRkaXRpb25zLnB1c2goc3R5bGUpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMub25TdHlsZXNBZGRlZChhZGRpdGlvbnMpO1xuICB9XG5cbiAgb25TdHlsZXNBZGRlZChhZGRpdGlvbnM6IHN0cmluZ1tdKSB7fVxuXG4gIGdldEFsbFN0eWxlcygpOiBzdHJpbmdbXSB7IHJldHVybiB0aGlzLl9zdHlsZXM7IH1cbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIERvbVNoYXJlZFN0eWxlc0hvc3QgZXh0ZW5kcyBTaGFyZWRTdHlsZXNIb3N0IHtcbiAgcHJpdmF0ZSBfaG9zdE5vZGVzID0gbmV3IFNldDxOb2RlPigpO1xuICBjb25zdHJ1Y3RvcihASW5qZWN0KERPQ1VNRU5UKSBkb2M6IGFueSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5faG9zdE5vZGVzLmFkZChkb2MuaGVhZCk7XG4gIH1cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYWRkU3R5bGVzVG9Ib3N0KHN0eWxlczogc3RyaW5nW10sIGhvc3Q6IE5vZGUpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHN0eWxlID0gc3R5bGVzW2ldO1xuICAgICAgRE9NLmFwcGVuZENoaWxkKGhvc3QsIERPTS5jcmVhdGVTdHlsZUVsZW1lbnQoc3R5bGUpKTtcbiAgICB9XG4gIH1cbiAgYWRkSG9zdChob3N0Tm9kZTogTm9kZSkge1xuICAgIHRoaXMuX2FkZFN0eWxlc1RvSG9zdCh0aGlzLl9zdHlsZXMsIGhvc3ROb2RlKTtcbiAgICB0aGlzLl9ob3N0Tm9kZXMuYWRkKGhvc3ROb2RlKTtcbiAgfVxuICByZW1vdmVIb3N0KGhvc3ROb2RlOiBOb2RlKSB7IFNldFdyYXBwZXIuZGVsZXRlKHRoaXMuX2hvc3ROb2RlcywgaG9zdE5vZGUpOyB9XG5cbiAgb25TdHlsZXNBZGRlZChhZGRpdGlvbnM6IHN0cmluZ1tdKSB7XG4gICAgdGhpcy5faG9zdE5vZGVzLmZvckVhY2goKGhvc3ROb2RlKSA9PiB7IHRoaXMuX2FkZFN0eWxlc1RvSG9zdChhZGRpdGlvbnMsIGhvc3ROb2RlKTsgfSk7XG4gIH1cbn1cbiJdfQ==