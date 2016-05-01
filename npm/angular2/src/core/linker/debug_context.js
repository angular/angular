'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var view_type_1 = require('./view_type');
/* @ts2dart_const */
var StaticNodeDebugInfo = (function () {
    function StaticNodeDebugInfo(providerTokens, componentToken, refTokens) {
        this.providerTokens = providerTokens;
        this.componentToken = componentToken;
        this.refTokens = refTokens;
    }
    return StaticNodeDebugInfo;
}());
exports.StaticNodeDebugInfo = StaticNodeDebugInfo;
var DebugContext = (function () {
    function DebugContext(_view, _nodeIndex, _tplRow, _tplCol) {
        this._view = _view;
        this._nodeIndex = _nodeIndex;
        this._tplRow = _tplRow;
        this._tplCol = _tplCol;
    }
    Object.defineProperty(DebugContext.prototype, "_staticNodeInfo", {
        get: function () {
            return lang_1.isPresent(this._nodeIndex) ? this._view.staticNodeDebugInfos[this._nodeIndex] : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugContext.prototype, "context", {
        get: function () { return this._view.context; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugContext.prototype, "component", {
        get: function () {
            var staticNodeInfo = this._staticNodeInfo;
            if (lang_1.isPresent(staticNodeInfo) && lang_1.isPresent(staticNodeInfo.componentToken)) {
                return this.injector.get(staticNodeInfo.componentToken);
            }
            return null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugContext.prototype, "componentRenderElement", {
        get: function () {
            var componentView = this._view;
            while (lang_1.isPresent(componentView.declarationAppElement) &&
                componentView.type !== view_type_1.ViewType.COMPONENT) {
                componentView = componentView.declarationAppElement.parentView;
            }
            return lang_1.isPresent(componentView.declarationAppElement) ?
                componentView.declarationAppElement.nativeElement :
                null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugContext.prototype, "injector", {
        get: function () { return this._view.injector(this._nodeIndex); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugContext.prototype, "renderNode", {
        get: function () {
            if (lang_1.isPresent(this._nodeIndex) && lang_1.isPresent(this._view.allNodes)) {
                return this._view.allNodes[this._nodeIndex];
            }
            else {
                return null;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugContext.prototype, "providerTokens", {
        get: function () {
            var staticNodeInfo = this._staticNodeInfo;
            return lang_1.isPresent(staticNodeInfo) ? staticNodeInfo.providerTokens : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugContext.prototype, "source", {
        get: function () {
            return this._view.componentType.templateUrl + ":" + this._tplRow + ":" + this._tplCol;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugContext.prototype, "references", {
        get: function () {
            var _this = this;
            var varValues = {};
            var staticNodeInfo = this._staticNodeInfo;
            if (lang_1.isPresent(staticNodeInfo)) {
                var refs = staticNodeInfo.refTokens;
                collection_1.StringMapWrapper.forEach(refs, function (refToken, refName) {
                    var varValue;
                    if (lang_1.isBlank(refToken)) {
                        varValue = lang_1.isPresent(_this._view.allNodes) ? _this._view.allNodes[_this._nodeIndex] : null;
                    }
                    else {
                        varValue = _this._view.injectorGet(refToken, _this._nodeIndex, null);
                    }
                    varValues[refName] = varValue;
                });
            }
            return varValues;
        },
        enumerable: true,
        configurable: true
    });
    return DebugContext;
}());
exports.DebugContext = DebugContext;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdfY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9kZWJ1Z19jb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxxQkFBaUMsMEJBQTBCLENBQUMsQ0FBQTtBQUM1RCwyQkFBNEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUk3RSwwQkFBdUIsYUFBYSxDQUFDLENBQUE7QUFFckMsb0JBQW9CO0FBQ3BCO0lBQ0UsNkJBQW1CLGNBQXFCLEVBQVMsY0FBbUIsRUFDakQsU0FBK0I7UUFEL0IsbUJBQWMsR0FBZCxjQUFjLENBQU87UUFBUyxtQkFBYyxHQUFkLGNBQWMsQ0FBSztRQUNqRCxjQUFTLEdBQVQsU0FBUyxDQUFzQjtJQUFHLENBQUM7SUFDeEQsMEJBQUM7QUFBRCxDQUFDLEFBSEQsSUFHQztBQUhZLDJCQUFtQixzQkFHL0IsQ0FBQTtBQUVEO0lBQ0Usc0JBQW9CLEtBQXdCLEVBQVUsVUFBa0IsRUFBVSxPQUFlLEVBQzdFLE9BQWU7UUFEZixVQUFLLEdBQUwsS0FBSyxDQUFtQjtRQUFVLGVBQVUsR0FBVixVQUFVLENBQVE7UUFBVSxZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQzdFLFlBQU8sR0FBUCxPQUFPLENBQVE7SUFBRyxDQUFDO0lBRXZDLHNCQUFZLHlDQUFlO2FBQTNCO1lBQ0UsTUFBTSxDQUFDLGdCQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUM5RixDQUFDOzs7T0FBQTtJQUVELHNCQUFJLGlDQUFPO2FBQVgsY0FBZ0IsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFDNUMsc0JBQUks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d0JBQ04sUUFBUSxHQUFHLEtBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxLQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUNyRSxDQUFDO29CQUNELFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxRQUFRLENBQUM7Z0JBQ2hDLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztZQUNELE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDbkIsQ0FBQzs7O09BQUE7SUFDSCxtQkFBQztBQUFELENBQUMsQUExREQsSUEwREM7QUExRFksb0JBQVksZUEwRHhCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzUHJlc2VudCwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0luamVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1JlbmRlckRlYnVnSW5mb30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVuZGVyL2FwaSc7XG5pbXBvcnQge0RlYnVnQXBwVmlld30gZnJvbSAnLi92aWV3JztcbmltcG9ydCB7Vmlld1R5cGV9IGZyb20gJy4vdmlld190eXBlJztcblxuLyogQHRzMmRhcnRfY29uc3QgKi9cbmV4cG9ydCBjbGFzcyBTdGF0aWNOb2RlRGVidWdJbmZvIHtcbiAgY29uc3RydWN0b3IocHVibGljIHByb3ZpZGVyVG9rZW5zOiBhbnlbXSwgcHVibGljIGNvbXBvbmVudFRva2VuOiBhbnksXG4gICAgICAgICAgICAgIHB1YmxpYyByZWZUb2tlbnM6IHtba2V5OiBzdHJpbmddOiBhbnl9KSB7fVxufVxuXG5leHBvcnQgY2xhc3MgRGVidWdDb250ZXh0IGltcGxlbWVudHMgUmVuZGVyRGVidWdJbmZvIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdmlldzogRGVidWdBcHBWaWV3PGFueT4sIHByaXZhdGUgX25vZGVJbmRleDogbnVtYmVyLCBwcml2YXRlIF90cGxSb3c6IG51bWJlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfdHBsQ29sOiBudW1iZXIpIHt9XG5cbiAgcHJpdmF0ZSBnZXQgX3N0YXRpY05vZGVJbmZvKCk6IFN0YXRpY05vZGVEZWJ1Z0luZm8ge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5fbm9kZUluZGV4KSA/IHRoaXMuX3ZpZXcuc3RhdGljTm9kZURlYnVnSW5mb3NbdGhpcy5fbm9kZUluZGV4XSA6IG51bGw7XG4gIH1cblxuICBnZXQgY29udGV4dCgpIHsgcmV0dXJuIHRoaXMuX3ZpZXcuY29udGV4dDsgfVxuICBnZXQgY29tcG9uZW50KCkge1xuICAgIHZhciBzdGF0aWNOb2RlSW5mbyA9IHRoaXMuX3N0YXRpY05vZGVJbmZvO1xuICAgIGlmIChpc1ByZXNlbnQoc3RhdGljTm9kZUluZm8pICYmIGlzUHJlc2VudChzdGF0aWNOb2RlSW5mby5jb21wb25lbnRUb2tlbikpIHtcbiAgICAgIHJldHVybiB0aGlzLmluamVjdG9yLmdldChzdGF0aWNOb2RlSW5mby5jb21wb25lbnRUb2tlbik7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGdldCBjb21wb25lbnRSZW5kZXJFbGVtZW50KCkge1xuICAgIHZhciBjb21wb25lbnRWaWV3ID0gdGhpcy5fdmlldztcbiAgICB3aGlsZSAoaXNQcmVzZW50KGNvbXBvbmVudFZpZXcuZGVjbGFyYXRpb25BcHBFbGVtZW50KSAmJlxuICAgICAgICAgICBjb21wb25lbnRWaWV3LnR5cGUgIT09IFZpZXdUeXBlLkNPTVBPTkVOVCkge1xuICAgICAgY29tcG9uZW50VmlldyA9IDxEZWJ1Z0FwcFZpZXc8YW55Pj5jb21wb25lbnRWaWV3LmRlY2xhcmF0aW9uQXBwRWxlbWVudC5wYXJlbnRWaWV3O1xuICAgIH1cbiAgICByZXR1cm4gaXNQcmVzZW50KGNvbXBvbmVudFZpZXcuZGVjbGFyYXRpb25BcHBFbGVtZW50KSA/XG4gICAgICAgICAgICAgICBjb21wb25lbnRWaWV3LmRlY2xhcmF0aW9uQXBwRWxlbWVudC5uYXRpdmVFbGVtZW50IDpcbiAgICAgICAgICAgICAgIG51bGw7XG4gIH1cbiAgZ2V0IGluamVjdG9yKCk6IEluamVjdG9yIHsgcmV0dXJuIHRoaXMuX3ZpZXcuaW5qZWN0b3IodGhpcy5fbm9kZUluZGV4KTsgfVxuICBnZXQgcmVuZGVyTm9kZSgpOiBhbnkge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fbm9kZUluZGV4KSAmJiBpc1ByZXNlbnQodGhpcy5fdmlldy5hbGxOb2RlcykpIHtcbiAgICAgIHJldHVybiB0aGlzLl92aWV3LmFsbE5vZGVzW3RoaXMuX25vZGVJbmRleF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuICBnZXQgcHJvdmlkZXJUb2tlbnMoKTogYW55W10ge1xuICAgIHZhciBzdGF0aWNOb2RlSW5mbyA9IHRoaXMuX3N0YXRpY05vZGVJbmZvO1xuICAgIHJldHVybiBpc1ByZXNlbnQoc3RhdGljTm9kZUluZm8pID8gc3RhdGljTm9kZUluZm8ucHJvdmlkZXJUb2tlbnMgOiBudWxsO1xuICB9XG4gIGdldCBzb3VyY2UoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dGhpcy5fdmlldy5jb21wb25lbnRUeXBlLnRlbXBsYXRlVXJsfToke3RoaXMuX3RwbFJvd306JHt0aGlzLl90cGxDb2x9YDtcbiAgfVxuICBnZXQgcmVmZXJlbmNlcygpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgdmFyIHZhclZhbHVlczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICB2YXIgc3RhdGljTm9kZUluZm8gPSB0aGlzLl9zdGF0aWNOb2RlSW5mbztcbiAgICBpZiAoaXNQcmVzZW50KHN0YXRpY05vZGVJbmZvKSkge1xuICAgICAgdmFyIHJlZnMgPSBzdGF0aWNOb2RlSW5mby5yZWZUb2tlbnM7XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2gocmVmcywgKHJlZlRva2VuLCByZWZOYW1lKSA9PiB7XG4gICAgICAgIHZhciB2YXJWYWx1ZTtcbiAgICAgICAgaWYgKGlzQmxhbmsocmVmVG9rZW4pKSB7XG4gICAgICAgICAgdmFyVmFsdWUgPSBpc1ByZXNlbnQodGhpcy5fdmlldy5hbGxOb2RlcykgPyB0aGlzLl92aWV3LmFsbE5vZGVzW3RoaXMuX25vZGVJbmRleF0gOiBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhclZhbHVlID0gdGhpcy5fdmlldy5pbmplY3RvckdldChyZWZUb2tlbiwgdGhpcy5fbm9kZUluZGV4LCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICB2YXJWYWx1ZXNbcmVmTmFtZV0gPSB2YXJWYWx1ZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdmFyVmFsdWVzO1xuICB9XG59XG4iXX0=