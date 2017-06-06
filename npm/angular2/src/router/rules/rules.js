'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var promise_1 = require('angular2/src/facade/promise');
var collection_1 = require('angular2/src/facade/collection');
var url_parser_1 = require('../url_parser');
var instruction_1 = require('../instruction');
// RouteMatch objects hold information about a match between a rule and a URL
var RouteMatch = (function () {
    function RouteMatch() {
    }
    return RouteMatch;
}());
exports.RouteMatch = RouteMatch;
var PathMatch = (function (_super) {
    __extends(PathMatch, _super);
    function PathMatch(instruction, remaining, remainingAux) {
        _super.call(this);
        this.instruction = instruction;
        this.remaining = remaining;
        this.remainingAux = remainingAux;
    }
    return PathMatch;
}(RouteMatch));
exports.PathMatch = PathMatch;
var RedirectMatch = (function (_super) {
    __extends(RedirectMatch, _super);
    function RedirectMatch(redirectTo, specificity) {
        _super.call(this);
        this.redirectTo = redirectTo;
        this.specificity = specificity;
    }
    return RedirectMatch;
}(RouteMatch));
exports.RedirectMatch = RedirectMatch;
var RedirectRule = (function () {
    function RedirectRule(_pathRecognizer, redirectTo) {
        this._pathRecognizer = _pathRecognizer;
        this.redirectTo = redirectTo;
        this.hash = this._pathRecognizer.hash;
    }
    Object.defineProperty(RedirectRule.prototype, "path", {
        get: function () { return this._pathRecognizer.toString(); },
        set: function (val) { throw new exceptions_1.BaseException('you cannot set the path of a RedirectRule directly'); },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns `null` or a `ParsedUrl` representing the new path to match
     */
    RedirectRule.prototype.recognize = function (beginningSegment) {
        var match = null;
        if (lang_1.isPresent(this._pathRecognizer.matchUrl(beginningSegment))) {
            match = new RedirectMatch(this.redirectTo, this._pathRecognizer.specificity);
        }
        return promise_1.PromiseWrapper.resolve(match);
    };
    RedirectRule.prototype.generate = function (params) {
        throw new exceptions_1.BaseException("Tried to generate a redirect.");
    };
    return RedirectRule;
}());
exports.RedirectRule = RedirectRule;
// represents something like '/foo/:bar'
var RouteRule = (function () {
    // TODO: cache component instruction instances by params and by ParsedUrl instance
    function RouteRule(_routePath, handler, _routeName) {
        this._routePath = _routePath;
        this.handler = handler;
        this._routeName = _routeName;
        this._cache = new collection_1.Map();
        this.specificity = this._routePath.specificity;
        this.hash = this._routePath.hash;
        this.terminal = this._routePath.terminal;
    }
    Object.defineProperty(RouteRule.prototype, "path", {
        get: function () { return this._routePath.toString(); },
        set: function (val) { throw new exceptions_1.BaseException('you cannot set the path of a RouteRule directly'); },
        enumerable: true,
        configurable: true
    });
    RouteRule.prototype.recognize = function (beginningSegment) {
        var _this = this;
        var res = this._routePath.matchUrl(beginningSegment);
        if (lang_1.isBlank(res)) {
            return null;
        }
        return this.handler.resolveComponentType().then(function (_) {
            var componentInstruction = _this._getInstruction(res.urlPath, res.urlParams, res.allParams);
            return new PathMatch(componentInstruction, res.rest, res.auxiliary);
        });
    };
    RouteRule.prototype.generate = function (params) {
        var generated = this._routePath.generateUrl(params);
        var urlPath = generated.urlPath;
        var urlParams = generated.urlParams;
        return this._getInstruction(urlPath, url_parser_1.convertUrlParamsToArray(urlParams), params);
    };
    RouteRule.prototype.generateComponentPathValues = function (params) {
        return this._routePath.generateUrl(params);
    };
    RouteRule.prototype._getInstruction = function (urlPath, urlParams, params) {
        if (lang_1.isBlank(this.handler.componentType)) {
            throw new exceptions_1.BaseException("Tried to get instruction before the type was loaded.");
        }
        var hashKey = urlPath + '?' + urlParams.join('&');
        if (this._cache.has(hashKey)) {
            return this._cache.get(hashKey);
        }
        var instruction = new instruction_1.ComponentInstruction(urlPath, urlParams, this.handler.data, this.handler.componentType, this.terminal, this.specificity, params, this._routeName);
        this._cache.set(hashKey, instruction);
        return instruction;
    };
    return RouteRule;
}());
exports.RouteRule = RouteRule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVsZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvcm91dGVyL3J1bGVzL3J1bGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHFCQUFpQywwQkFBMEIsQ0FBQyxDQUFBO0FBQzVELDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdELHdCQUE2Qiw2QkFBNkIsQ0FBQyxDQUFBO0FBQzNELDJCQUFrQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBR25ELDJCQUEyQyxlQUFlLENBQUMsQ0FBQTtBQUMzRCw0QkFBbUMsZ0JBQWdCLENBQUMsQ0FBQTtBQUlwRCw2RUFBNkU7QUFDN0U7SUFBQTtJQUFrQyxDQUFDO0lBQUQsaUJBQUM7QUFBRCxDQUFDLEFBQW5DLElBQW1DO0FBQWIsa0JBQVUsYUFBRyxDQUFBO0FBRW5DO0lBQStCLDZCQUFVO0lBQ3ZDLG1CQUFtQixXQUFpQyxFQUFTLFNBQWMsRUFDeEQsWUFBbUI7UUFDcEMsaUJBQU8sQ0FBQztRQUZTLGdCQUFXLEdBQVgsV0FBVyxDQUFzQjtRQUFTLGNBQVMsR0FBVCxTQUFTLENBQUs7UUFDeEQsaUJBQVksR0FBWixZQUFZLENBQU87SUFFdEMsQ0FBQztJQUNILGdCQUFDO0FBQUQsQ0FBQyxBQUxELENBQStCLFVBQVUsR0FLeEM7QUFMWSxpQkFBUyxZQUtyQixDQUFBO0FBRUQ7SUFBbUMsaUNBQVU7SUFDM0MsdUJBQW1CLFVBQWlCLEVBQVMsV0FBVztRQUFJLGlCQUFPLENBQUM7UUFBakQsZUFBVSxHQUFWLFVBQVUsQ0FBTztRQUFTLGdCQUFXLEdBQVgsV0FBVyxDQUFBO0lBQWEsQ0FBQztJQUN4RSxvQkFBQztBQUFELENBQUMsQUFGRCxDQUFtQyxVQUFVLEdBRTVDO0FBRlkscUJBQWEsZ0JBRXpCLENBQUE7QUFVRDtJQUdFLHNCQUFvQixlQUEwQixFQUFTLFVBQWlCO1FBQXBE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TUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN2RixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFdEMsTUFBTSxDQUFDLFdBQVcsQ0FBQztJQUNyQixDQUFDO0lBQ0gsZ0JBQUM7QUFBRCxDQUFDLEFBMURELElBMERDO0FBMURZLGlCQUFTLFlBMERyQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc1ByZXNlbnQsIGlzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1Byb21pc2VXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL3Byb21pc2UnO1xuaW1wb3J0IHtNYXB9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmltcG9ydCB7Um91dGVIYW5kbGVyfSBmcm9tICcuL3JvdXRlX2hhbmRsZXJzL3JvdXRlX2hhbmRsZXInO1xuaW1wb3J0IHtVcmwsIGNvbnZlcnRVcmxQYXJhbXNUb0FycmF5fSBmcm9tICcuLi91cmxfcGFyc2VyJztcbmltcG9ydCB7Q29tcG9uZW50SW5zdHJ1Y3Rpb259IGZyb20gJy4uL2luc3RydWN0aW9uJztcbmltcG9ydCB7Um91dGVQYXRoLCBHZW5lcmF0ZWRVcmx9IGZyb20gJy4vcm91dGVfcGF0aHMvcm91dGVfcGF0aCc7XG5cblxuLy8gUm91dGVNYXRjaCBvYmplY3RzIGhvbGQgaW5mb3JtYXRpb24gYWJvdXQgYSBtYXRjaCBiZXR3ZWVuIGEgcnVsZSBhbmQgYSBVUkxcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBSb3V0ZU1hdGNoIHt9XG5cbmV4cG9ydCBjbGFzcyBQYXRoTWF0Y2ggZXh0ZW5kcyBSb3V0ZU1hdGNoIHtcbiAgY29uc3RydWN0b3IocHVibGljIGluc3RydWN0aW9uOiBDb21wb25lbnRJbnN0cnVjdGlvbiwgcHVibGljIHJlbWFpbmluZzogVXJsLFxuICAgICAgICAgICAgICBwdWJsaWMgcmVtYWluaW5nQXV4OiBVcmxbXSkge1xuICAgIHN1cGVyKCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlZGlyZWN0TWF0Y2ggZXh0ZW5kcyBSb3V0ZU1hdGNoIHtcbiAgY29uc3RydWN0b3IocHVibGljIHJlZGlyZWN0VG86IGFueVtdLCBwdWJsaWMgc3BlY2lmaWNpdHkpIHsgc3VwZXIoKTsgfVxufVxuXG4vLyBSdWxlcyBhcmUgcmVzcG9uc2libGUgZm9yIHJlY29nbml6aW5nIFVSTCBzZWdtZW50cyBhbmQgZ2VuZXJhdGluZyBpbnN0cnVjdGlvbnNcbmV4cG9ydCBpbnRlcmZhY2UgQWJzdHJhY3RSdWxlIHtcbiAgaGFzaDogc3RyaW5nO1xuICBwYXRoOiBzdHJpbmc7XG4gIHJlY29nbml6ZShiZWdpbm5pbmdTZWdtZW50OiBVcmwpOiBQcm9taXNlPFJvdXRlTWF0Y2g+O1xuICBnZW5lcmF0ZShwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ29tcG9uZW50SW5zdHJ1Y3Rpb247XG59XG5cbmV4cG9ydCBjbGFzcyBSZWRpcmVjdFJ1bGUgaW1wbGVtZW50cyBBYnN0cmFjdFJ1bGUge1xuICBwdWJsaWMgaGFzaDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3BhdGhSZWNvZ25pemVyOiBSb3V0ZVBhdGgsIHB1YmxpYyByZWRpcmVjdFRvOiBhbnlbXSkge1xuICAgIHRoaXMuaGFzaCA9IHRoaXMuX3BhdGhSZWNvZ25pemVyLmhhc2g7XG4gIH1cblxuICBnZXQgcGF0aCgpIHsgcmV0dXJuIHRoaXMuX3BhdGhSZWNvZ25pemVyLnRvU3RyaW5nKCk7IH1cbiAgc2V0IHBhdGgodmFsKSB7IHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCd5b3UgY2Fubm90IHNldCB0aGUgcGF0aCBvZiBhIFJlZGlyZWN0UnVsZSBkaXJlY3RseScpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYG51bGxgIG9yIGEgYFBhcnNlZFVybGAgcmVwcmVzZW50aW5nIHRoZSBuZXcgcGF0aCB0byBtYXRjaFxuICAgKi9cbiAgcmVjb2duaXplKGJlZ2lubmluZ1NlZ21lbnQ6IFVybCk6IFByb21pc2U8Um91dGVNYXRjaD4ge1xuICAgIHZhciBtYXRjaCA9IG51bGw7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9wYXRoUmVjb2duaXplci5tYXRjaFVybChiZWdpbm5pbmdTZWdtZW50KSkpIHtcbiAgICAgIG1hdGNoID0gbmV3IFJlZGlyZWN0TWF0Y2godGhpcy5yZWRpcmVjdFRvLCB0aGlzLl9wYXRoUmVjb2duaXplci5zcGVjaWZpY2l0eSk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5yZXNvbHZlKG1hdGNoKTtcbiAgfVxuXG4gIGdlbmVyYXRlKHBhcmFtczoge1trZXk6IHN0cmluZ106IGFueX0pOiBDb21wb25lbnRJbnN0cnVjdGlvbiB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYFRyaWVkIHRvIGdlbmVyYXRlIGEgcmVkaXJlY3QuYCk7XG4gIH1cbn1cblxuXG4vLyByZXByZXNlbnRzIHNvbWV0aGluZyBsaWtlICcvZm9vLzpiYXInXG5leHBvcnQgY2xhc3MgUm91dGVSdWxlIGltcGxlbWVudHMgQWJzdHJhY3RSdWxlIHtcbiAgc3BlY2lmaWNpdHk6IHN0cmluZztcbiAgdGVybWluYWw6IGJvb2xlYW47XG4gIGhhc2g6IHN0cmluZztcblxuICBwcml2YXRlIF9jYWNoZTogTWFwPHN0cmluZywgQ29tcG9uZW50SW5zdHJ1Y3Rpb24+ID0gbmV3IE1hcDxzdHJpbmcsIENvbXBvbmVudEluc3RydWN0aW9uPigpO1xuXG4gIC8vIFRPRE86IGNhY2hlIGNvbXBvbmVudCBpbnN0cnVjdGlvbiBpbnN0YW5jZXMgYnkgcGFyYW1zIGFuZCBieSBQYXJzZWRVcmwgaW5zdGFuY2VcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9yb3V0ZVBhdGg6IFJvdXRlUGF0aCwgcHVibGljIGhhbmRsZXI6IFJvdXRlSGFuZGxlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfcm91dGVOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLnNwZWNpZmljaXR5ID0gdGhpcy5fcm91dGVQYXRoLnNwZWNpZmljaXR5O1xuICAgIHRoaXMuaGFzaCA9IHRoaXMuX3JvdXRlUGF0aC5oYXNoO1xuICAgIHRoaXMudGVybWluYWwgPSB0aGlzLl9yb3V0ZVBhdGgudGVybWluYWw7XG4gIH1cblxuICBnZXQgcGF0aCgpIHsgcmV0dXJuIHRoaXMuX3JvdXRlUGF0aC50b1N0cmluZygpOyB9XG4gIHNldCBwYXRoKHZhbCkgeyB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbigneW91IGNhbm5vdCBzZXQgdGhlIHBhdGggb2YgYSBSb3V0ZVJ1bGUgZGlyZWN0bHknKTsgfVxuXG4gIHJlY29nbml6ZShiZWdpbm5pbmdTZWdtZW50OiBVcmwpOiBQcm9taXNlPFJvdXRlTWF0Y2g+IHtcbiAgICB2YXIgcmVzID0gdGhpcy5fcm91dGVQYXRoLm1hdGNoVXJsKGJlZ2lubmluZ1NlZ21lbnQpO1xuICAgIGlmIChpc0JsYW5rKHJlcykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmhhbmRsZXIucmVzb2x2ZUNvbXBvbmVudFR5cGUoKS50aGVuKChfKSA9PiB7XG4gICAgICB2YXIgY29tcG9uZW50SW5zdHJ1Y3Rpb24gPSB0aGlzLl9nZXRJbnN0cnVjdGlvbihyZXMudXJsUGF0aCwgcmVzLnVybFBhcmFtcywgcmVzLmFsbFBhcmFtcyk7XG4gICAgICByZXR1cm4gbmV3IFBhdGhNYXRjaChjb21wb25lbnRJbnN0cnVjdGlvbiwgcmVzLnJlc3QsIHJlcy5hdXhpbGlhcnkpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2VuZXJhdGUocGFyYW1zOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENvbXBvbmVudEluc3RydWN0aW9uIHtcbiAgICB2YXIgZ2VuZXJhdGVkID0gdGhpcy5fcm91dGVQYXRoLmdlbmVyYXRlVXJsKHBhcmFtcyk7XG4gICAgdmFyIHVybFBhdGggPSBnZW5lcmF0ZWQudXJsUGF0aDtcbiAgICB2YXIgdXJsUGFyYW1zID0gZ2VuZXJhdGVkLnVybFBhcmFtcztcbiAgICByZXR1cm4gdGhpcy5fZ2V0SW5zdHJ1Y3Rpb24odXJsUGF0aCwgY29udmVydFVybFBhcmFtc1RvQXJyYXkodXJsUGFyYW1zKSwgcGFyYW1zKTtcbiAgfVxuXG4gIGdlbmVyYXRlQ29tcG9uZW50UGF0aFZhbHVlcyhwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogR2VuZXJhdGVkVXJsIHtcbiAgICByZXR1cm4gdGhpcy5fcm91dGVQYXRoLmdlbmVyYXRlVXJsKHBhcmFtcyk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRJbnN0cnVjdGlvbih1cmxQYXRoOiBzdHJpbmcsIHVybFBhcmFtczogc3RyaW5nW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczoge1trZXk6IHN0cmluZ106IGFueX0pOiBDb21wb25lbnRJbnN0cnVjdGlvbiB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5oYW5kbGVyLmNvbXBvbmVudFR5cGUpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgVHJpZWQgdG8gZ2V0IGluc3RydWN0aW9uIGJlZm9yZSB0aGUgdHlwZSB3YXMgbG9hZGVkLmApO1xuICAgIH1cbiAgICB2YXIgaGFzaEtleSA9IHVybFBhdGggKyAnPycgKyB1cmxQYXJhbXMuam9pbignJicpO1xuICAgIGlmICh0aGlzLl9jYWNoZS5oYXMoaGFzaEtleSkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jYWNoZS5nZXQoaGFzaEtleSk7XG4gICAgfVxuICAgIHZhciBpbnN0cnVjdGlvbiA9XG4gICAgICAgIG5ldyBDb21wb25lbnRJbnN0cnVjdGlvbih1cmxQYXRoLCB1cmxQYXJhbXMsIHRoaXMuaGFuZGxlci5kYXRhLCB0aGlzLmhhbmRsZXIuY29tcG9uZW50VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGVybWluYWwsIHRoaXMuc3BlY2lmaWNpdHksIHBhcmFtcywgdGhpcy5fcm91dGVOYW1lKTtcbiAgICB0aGlzLl9jYWNoZS5zZXQoaGFzaEtleSwgaW5zdHJ1Y3Rpb24pO1xuXG4gICAgcmV0dXJuIGluc3RydWN0aW9uO1xuICB9XG59XG4iXX0=