'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
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
}());
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
}(SharedStylesHost));
exports.DomSharedStylesHost = DomSharedStylesHost;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkX3N0eWxlc19ob3N0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yNVBySks5aC50bXAvYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9zaGFyZWRfc3R5bGVzX2hvc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNEJBQWtCLHVDQUF1QyxDQUFDLENBQUE7QUFDMUQsbUJBQWlDLHNCQUFzQixDQUFDLENBQUE7QUFDeEQsMkJBQXlCLGdDQUFnQyxDQUFDLENBQUE7QUFDMUQsMkJBQXVCLGNBQWMsQ0FBQyxDQUFBO0FBR3RDO0lBTUU7UUFMQSxnQkFBZ0I7UUFDaEIsWUFBTyxHQUFhLEVBQUUsQ0FBQztRQUN2QixnQkFBZ0I7UUFDaEIsZUFBVSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7SUFFaEIsQ0FBQztJQUVoQixvQ0FBUyxHQUFULFVBQVUsTUFBZ0I7UUFBMUIsaUJBVUM7UUFUQyxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDbkIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUs7WUFDbEIsRUFBRSxDQUFDLENBQUMsQ0FBQyx1QkFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUMsS0FBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzNCLEtBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN6QixTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVELHdDQUFhLEdBQWIsVUFBYyxTQUFtQixJQUFHLENBQUM7SUFFckMsdUNBQVksR0FBWixjQUEyQixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUF2Qm5EO1FBQUMsZUFBVSxFQUFFOzt3QkFBQTtJQXdCYix1QkFBQztBQUFELENBQUMsQUF2QkQsSUF1QkM7QUF2Qlksd0JBQWdCLG1CQXVCNUIsQ0FBQTtBQUdEO0lBQXlDLHVDQUFnQjtJQUV2RCw2QkFBOEIsR0FBUTtRQUNwQyxpQkFBTyxDQUFDO1FBRkYsZUFBVSxHQUFHLElBQUksR0FBRyxFQUFRLENBQUM7UUFHbkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFDRCxnQkFBZ0I7SUFDaEIsOENBQWdCLEdBQWhCLFVBQWlCLE1BQWdCLEVBQUUsSUFBVTtRQUMzQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN2QyxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsaUJBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLGlCQUFHLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN2RCxDQUFDO0lBQ0gsQ0FBQztJQUNELHFDQUFPLEdBQVAsVUFBUSxRQUFjO1FBQ3BCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFDRCx3Q0FBVSxHQUFWLFVBQVcsUUFBYyxJQUFJLHVCQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTVFLDJDQUFhLEdBQWIsVUFBYyxTQUFtQjtRQUFqQyxpQkFFQztRQURDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUMsUUFBUSxJQUFPLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6RixDQUFDO0lBdEJIO1FBQUMsZUFBVSxFQUFFO21CQUdFLFdBQU0sQ0FBQyxxQkFBUSxDQUFDOzsyQkFIbEI7SUF1QmIsMEJBQUM7QUFBRCxDQUFDLEFBdEJELENBQXlDLGdCQUFnQixHQXNCeEQ7QUF0QlksMkJBQW1CLHNCQXNCL0IsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RE9NfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyJztcbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1NldFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICcuL2RvbV90b2tlbnMnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgU2hhcmVkU3R5bGVzSG9zdCB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N0eWxlczogc3RyaW5nW10gPSBbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3R5bGVzU2V0ID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIGFkZFN0eWxlcyhzdHlsZXM6IHN0cmluZ1tdKSB7XG4gICAgdmFyIGFkZGl0aW9ucyA9IFtdO1xuICAgIHN0eWxlcy5mb3JFYWNoKHN0eWxlID0+IHtcbiAgICAgIGlmICghU2V0V3JhcHBlci5oYXModGhpcy5fc3R5bGVzU2V0LCBzdHlsZSkpIHtcbiAgICAgICAgdGhpcy5fc3R5bGVzU2V0LmFkZChzdHlsZSk7XG4gICAgICAgIHRoaXMuX3N0eWxlcy5wdXNoKHN0eWxlKTtcbiAgICAgICAgYWRkaXRpb25zLnB1c2goc3R5bGUpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMub25TdHlsZXNBZGRlZChhZGRpdGlvbnMpO1xuICB9XG5cbiAgb25TdHlsZXNBZGRlZChhZGRpdGlvbnM6IHN0cmluZ1tdKSB7fVxuXG4gIGdldEFsbFN0eWxlcygpOiBzdHJpbmdbXSB7IHJldHVybiB0aGlzLl9zdHlsZXM7IH1cbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIERvbVNoYXJlZFN0eWxlc0hvc3QgZXh0ZW5kcyBTaGFyZWRTdHlsZXNIb3N0IHtcbiAgcHJpdmF0ZSBfaG9zdE5vZGVzID0gbmV3IFNldDxOb2RlPigpO1xuICBjb25zdHJ1Y3RvcihASW5qZWN0KERPQ1VNRU5UKSBkb2M6IGFueSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5faG9zdE5vZGVzLmFkZChkb2MuaGVhZCk7XG4gIH1cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYWRkU3R5bGVzVG9Ib3N0KHN0eWxlczogc3RyaW5nW10sIGhvc3Q6IE5vZGUpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHN0eWxlID0gc3R5bGVzW2ldO1xuICAgICAgRE9NLmFwcGVuZENoaWxkKGhvc3QsIERPTS5jcmVhdGVTdHlsZUVsZW1lbnQoc3R5bGUpKTtcbiAgICB9XG4gIH1cbiAgYWRkSG9zdChob3N0Tm9kZTogTm9kZSkge1xuICAgIHRoaXMuX2FkZFN0eWxlc1RvSG9zdCh0aGlzLl9zdHlsZXMsIGhvc3ROb2RlKTtcbiAgICB0aGlzLl9ob3N0Tm9kZXMuYWRkKGhvc3ROb2RlKTtcbiAgfVxuICByZW1vdmVIb3N0KGhvc3ROb2RlOiBOb2RlKSB7IFNldFdyYXBwZXIuZGVsZXRlKHRoaXMuX2hvc3ROb2RlcywgaG9zdE5vZGUpOyB9XG5cbiAgb25TdHlsZXNBZGRlZChhZGRpdGlvbnM6IHN0cmluZ1tdKSB7XG4gICAgdGhpcy5faG9zdE5vZGVzLmZvckVhY2goKGhvc3ROb2RlKSA9PiB7IHRoaXMuX2FkZFN0eWxlc1RvSG9zdChhZGRpdGlvbnMsIGhvc3ROb2RlKTsgfSk7XG4gIH1cbn1cbiJdfQ==