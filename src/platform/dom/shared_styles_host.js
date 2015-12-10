'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkX3N0eWxlc19ob3N0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9zaGFyZWRfc3R5bGVzX2hvc3QudHMiXSwibmFtZXMiOlsiU2hhcmVkU3R5bGVzSG9zdCIsIlNoYXJlZFN0eWxlc0hvc3QuY29uc3RydWN0b3IiLCJTaGFyZWRTdHlsZXNIb3N0LmFkZFN0eWxlcyIsIlNoYXJlZFN0eWxlc0hvc3Qub25TdHlsZXNBZGRlZCIsIlNoYXJlZFN0eWxlc0hvc3QuZ2V0QWxsU3R5bGVzIiwiRG9tU2hhcmVkU3R5bGVzSG9zdCIsIkRvbVNoYXJlZFN0eWxlc0hvc3QuY29uc3RydWN0b3IiLCJEb21TaGFyZWRTdHlsZXNIb3N0Ll9hZGRTdHlsZXNUb0hvc3QiLCJEb21TaGFyZWRTdHlsZXNIb3N0LmFkZEhvc3QiLCJEb21TaGFyZWRTdHlsZXNIb3N0LnJlbW92ZUhvc3QiLCJEb21TaGFyZWRTdHlsZXNIb3N0Lm9uU3R5bGVzQWRkZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNEJBQWtCLHVDQUF1QyxDQUFDLENBQUE7QUFDMUQsbUJBQWlDLHNCQUFzQixDQUFDLENBQUE7QUFDeEQsMkJBQXlCLGdDQUFnQyxDQUFDLENBQUE7QUFDMUQsMkJBQXVCLGNBQWMsQ0FBQyxDQUFBO0FBRXRDO0lBT0VBO1FBTEFDLGdCQUFnQkE7UUFDaEJBLFlBQU9BLEdBQWFBLEVBQUVBLENBQUNBO1FBQ3ZCQSxnQkFBZ0JBO1FBQ2hCQSxlQUFVQSxHQUFHQSxJQUFJQSxHQUFHQSxFQUFVQSxDQUFDQTtJQUVoQkEsQ0FBQ0E7SUFFaEJELG9DQUFTQSxHQUFUQSxVQUFVQSxNQUFnQkE7UUFBMUJFLGlCQVVDQTtRQVRDQSxJQUFJQSxTQUFTQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUNuQkEsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsVUFBQUEsS0FBS0E7WUFDbEJBLEVBQUVBLENBQUNBLENBQUNBLENBQUNB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ZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlcic7XG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtTZXRXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnLi9kb21fdG9rZW5zJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFNoYXJlZFN0eWxlc0hvc3Qge1xuICAvKiogQGludGVybmFsICovXG4gIF9zdHlsZXM6IHN0cmluZ1tdID0gW107XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N0eWxlc1NldCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gIGNvbnN0cnVjdG9yKCkge31cblxuICBhZGRTdHlsZXMoc3R5bGVzOiBzdHJpbmdbXSkge1xuICAgIHZhciBhZGRpdGlvbnMgPSBbXTtcbiAgICBzdHlsZXMuZm9yRWFjaChzdHlsZSA9PiB7XG4gICAgICBpZiAoIVNldFdyYXBwZXIuaGFzKHRoaXMuX3N0eWxlc1NldCwgc3R5bGUpKSB7XG4gICAgICAgIHRoaXMuX3N0eWxlc1NldC5hZGQoc3R5bGUpO1xuICAgICAgICB0aGlzLl9zdHlsZXMucHVzaChzdHlsZSk7XG4gICAgICAgIGFkZGl0aW9ucy5wdXNoKHN0eWxlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLm9uU3R5bGVzQWRkZWQoYWRkaXRpb25zKTtcbiAgfVxuXG4gIG9uU3R5bGVzQWRkZWQoYWRkaXRpb25zOiBzdHJpbmdbXSkge31cblxuICBnZXRBbGxTdHlsZXMoKTogc3RyaW5nW10geyByZXR1cm4gdGhpcy5fc3R5bGVzOyB9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBEb21TaGFyZWRTdHlsZXNIb3N0IGV4dGVuZHMgU2hhcmVkU3R5bGVzSG9zdCB7XG4gIHByaXZhdGUgX2hvc3ROb2RlcyA9IG5ldyBTZXQ8Tm9kZT4oKTtcbiAgY29uc3RydWN0b3IoQEluamVjdChET0NVTUVOVCkgZG9jOiBhbnkpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX2hvc3ROb2Rlcy5hZGQoZG9jLmhlYWQpO1xuICB9XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2FkZFN0eWxlc1RvSG9zdChzdHlsZXM6IHN0cmluZ1tdLCBob3N0OiBOb2RlKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzdHlsZSA9IHN0eWxlc1tpXTtcbiAgICAgIERPTS5hcHBlbmRDaGlsZChob3N0LCBET00uY3JlYXRlU3R5bGVFbGVtZW50KHN0eWxlKSk7XG4gICAgfVxuICB9XG4gIGFkZEhvc3QoaG9zdE5vZGU6IE5vZGUpIHtcbiAgICB0aGlzLl9hZGRTdHlsZXNUb0hvc3QodGhpcy5fc3R5bGVzLCBob3N0Tm9kZSk7XG4gICAgdGhpcy5faG9zdE5vZGVzLmFkZChob3N0Tm9kZSk7XG4gIH1cbiAgcmVtb3ZlSG9zdChob3N0Tm9kZTogTm9kZSkgeyBTZXRXcmFwcGVyLmRlbGV0ZSh0aGlzLl9ob3N0Tm9kZXMsIGhvc3ROb2RlKTsgfVxuXG4gIG9uU3R5bGVzQWRkZWQoYWRkaXRpb25zOiBzdHJpbmdbXSkge1xuICAgIHRoaXMuX2hvc3ROb2Rlcy5mb3JFYWNoKChob3N0Tm9kZSkgPT4geyB0aGlzLl9hZGRTdHlsZXNUb0hvc3QoYWRkaXRpb25zLCBob3N0Tm9kZSk7IH0pO1xuICB9XG59XG4iXX0=