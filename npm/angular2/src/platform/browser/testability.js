'use strict';"use strict";
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
var core_1 = require('angular2/core');
var PublicTestability = (function () {
    function PublicTestability(testability) {
        this._testability = testability;
    }
    PublicTestability.prototype.isStable = function () { return this._testability.isStable(); };
    PublicTestability.prototype.whenStable = function (callback) { this._testability.whenStable(callback); };
    PublicTestability.prototype.findBindings = function (using, provider, exactMatch) {
        return this.findProviders(using, provider, exactMatch);
    };
    PublicTestability.prototype.findProviders = function (using, provider, exactMatch) {
        return this._testability.findBindings(using, provider, exactMatch);
    };
    return PublicTestability;
}());
var BrowserGetTestability = (function () {
    function BrowserGetTestability() {
    }
    BrowserGetTestability.init = function () { core_1.setTestabilityGetter(new BrowserGetTestability()); };
    BrowserGetTestability.prototype.addToWindow = function (registry) {
        lang_1.global.getAngularTestability = function (elem, findInAncestors) {
            if (findInAncestors === void 0) { findInAncestors = true; }
            var testability = registry.findTestabilityInTree(elem, findInAncestors);
            if (testability == null) {
                throw new Error('Could not find testability for element.');
            }
            return new PublicTestability(testability);
        };
        lang_1.global.getAllAngularTestabilities = function () {
            var testabilities = registry.getAllTestabilities();
            return testabilities.map(function (testability) { return new PublicTestability(testability); });
        };
        lang_1.global.getAllAngularRootElements = function () { return registry.getAllRootElements(); };
        var whenAllStable = function (callback) {
            var testabilities = lang_1.global.getAllAngularTestabilities();
            var count = testabilities.length;
            var didWork = false;
            var decrement = function (didWork_) {
                didWork = didWork || didWork_;
                count--;
                if (count == 0) {
                    callback(didWork);
                }
            };
            testabilities.forEach(function (testability) { testability.whenStable(decrement); });
        };
        if (!lang_1.global.frameworkStabilizers) {
            lang_1.global.frameworkStabilizers = collection_1.ListWrapper.createGrowableSize(0);
        }
        lang_1.global.frameworkStabilizers.push(whenAllStable);
    };
    BrowserGetTestability.prototype.findTestabilityInTree = function (registry, elem, findInAncestors) {
        if (elem == null) {
            return null;
        }
        var t = registry.getTestability(elem);
        if (lang_1.isPresent(t)) {
            return t;
        }
        else if (!findInAncestors) {
            return null;
        }
        if (dom_adapter_1.DOM.isShadowRoot(elem)) {
            return this.findTestabilityInTree(registry, dom_adapter_1.DOM.getHost(elem), true);
        }
        return this.findTestabilityInTree(registry, dom_adapter_1.DOM.parentElement(elem), true);
    };
    return BrowserGetTestability;
}());
exports.BrowserGetTestability = BrowserGetTestability;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGFiaWxpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvcGxhdGZvcm0vYnJvd3Nlci90ZXN0YWJpbGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsMkJBQTJDLGdDQUFnQyxDQUFDLENBQUE7QUFDNUUscUJBQWdDLDBCQUEwQixDQUFDLENBQUE7QUFJM0QsNEJBQWtCLHVDQUF1QyxDQUFDLENBQUE7QUFFMUQscUJBTU8sZUFBZSxDQUFDLENBQUE7QUFFdkI7SUFJRSwyQkFBWSxXQUF3QjtRQUFJLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO0lBQUMsQ0FBQztJQUUxRSxvQ0FBUSxHQUFSLGNBQXNCLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUU1RCxzQ0FBVSxHQUFWLFVBQVcsUUFBa0IsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFMUUsd0NBQVksR0FBWixVQUFhLEtBQVUsRUFBRSxRQUFnQixFQUFFLFVBQW1CO1FBQzVELE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVELHlDQUFhLEdBQWIsVUFBYyxLQUFVLEVBQUUsUUFBZ0IsRUFBRSxVQUFtQjtRQUM3RCxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBQ0gsd0JBQUM7QUFBRCxDQUFDLEFBakJELElBaUJDO0FBRUQ7SUFBQTtJQXVEQSxDQUFDO0lBdERRLDBCQUFJLEdBQVgsY0FBZ0IsMkJBQW9CLENBQUMsSUFBSSxx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LGlCQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxpQkFBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBQ0gsNEJBQUM7QUFBRCxDQUFDLEFBdkRELElBdURDO0FBdkRZLDZCQUFxQix3QkF1RGpDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge01hcCwgTWFwV3JhcHBlciwgTGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2dsb2JhbCwgaXNQcmVzZW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtQcm9taXNlV3JhcHBlciwgT2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuXG5pbXBvcnQge0RPTX0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlcic7XG5cbmltcG9ydCB7XG4gIEluamVjdGFibGUsXG4gIFRlc3RhYmlsaXR5UmVnaXN0cnksXG4gIFRlc3RhYmlsaXR5LFxuICBHZXRUZXN0YWJpbGl0eSxcbiAgc2V0VGVzdGFiaWxpdHlHZXR0ZXJcbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cbmNsYXNzIFB1YmxpY1Rlc3RhYmlsaXR5IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdGVzdGFiaWxpdHk6IFRlc3RhYmlsaXR5O1xuXG4gIGNvbnN0cnVjdG9yKHRlc3RhYmlsaXR5OiBUZXN0YWJpbGl0eSkgeyB0aGlzLl90ZXN0YWJpbGl0eSA9IHRlc3RhYmlsaXR5OyB9XG5cbiAgaXNTdGFibGUoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl90ZXN0YWJpbGl0eS5pc1N0YWJsZSgpOyB9XG5cbiAgd2hlblN0YWJsZShjYWxsYmFjazogRnVuY3Rpb24pIHsgdGhpcy5fdGVzdGFiaWxpdHkud2hlblN0YWJsZShjYWxsYmFjayk7IH1cblxuICBmaW5kQmluZGluZ3ModXNpbmc6IGFueSwgcHJvdmlkZXI6IHN0cmluZywgZXhhY3RNYXRjaDogYm9vbGVhbik6IGFueVtdIHtcbiAgICByZXR1cm4gdGhpcy5maW5kUHJvdmlkZXJzKHVzaW5nLCBwcm92aWRlciwgZXhhY3RNYXRjaCk7XG4gIH1cblxuICBmaW5kUHJvdmlkZXJzKHVzaW5nOiBhbnksIHByb3ZpZGVyOiBzdHJpbmcsIGV4YWN0TWF0Y2g6IGJvb2xlYW4pOiBhbnlbXSB7XG4gICAgcmV0dXJuIHRoaXMuX3Rlc3RhYmlsaXR5LmZpbmRCaW5kaW5ncyh1c2luZywgcHJvdmlkZXIsIGV4YWN0TWF0Y2gpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCcm93c2VyR2V0VGVzdGFiaWxpdHkgaW1wbGVtZW50cyBHZXRUZXN0YWJpbGl0eSB7XG4gIHN0YXRpYyBpbml0KCkgeyBzZXRUZXN0YWJpbGl0eUdldHRlcihuZXcgQnJvd3NlckdldFRlc3RhYmlsaXR5KCkpOyB9XG5cbiAgYWRkVG9XaW5kb3cocmVnaXN0cnk6IFRlc3RhYmlsaXR5UmVnaXN0cnkpOiB2b2lkIHtcbiAgICBnbG9iYWwuZ2V0QW5ndWxhclRlc3RhYmlsaXR5ID0gKGVsZW06IGFueSwgZmluZEluQW5jZXN0b3JzOiBib29sZWFuID0gdHJ1ZSkgPT4ge1xuICAgICAgdmFyIHRlc3RhYmlsaXR5ID0gcmVnaXN0cnkuZmluZFRlc3RhYmlsaXR5SW5UcmVlKGVsZW0sIGZpbmRJbkFuY2VzdG9ycyk7XG4gICAgICBpZiAodGVzdGFiaWxpdHkgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBmaW5kIHRlc3RhYmlsaXR5IGZvciBlbGVtZW50LicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBQdWJsaWNUZXN0YWJpbGl0eSh0ZXN0YWJpbGl0eSk7XG4gICAgfTtcblxuICAgIGdsb2JhbC5nZXRBbGxBbmd1bGFyVGVzdGFiaWxpdGllcyA9ICgpID0+IHtcbiAgICAgIHZhciB0ZXN0YWJpbGl0aWVzID0gcmVnaXN0cnkuZ2V0QWxsVGVzdGFiaWxpdGllcygpO1xuICAgICAgcmV0dXJuIHRlc3RhYmlsaXRpZXMubWFwKCh0ZXN0YWJpbGl0eSkgPT4geyByZXR1cm4gbmV3IFB1YmxpY1Rlc3RhYmlsaXR5KHRlc3RhYmlsaXR5KTsgfSk7XG4gICAgfTtcblxuICAgIGdsb2JhbC5nZXRBbGxBbmd1bGFyUm9vdEVsZW1lbnRzID0gKCkgPT4gcmVnaXN0cnkuZ2V0QWxsUm9vdEVsZW1lbnRzKCk7XG5cbiAgICB2YXIgd2hlbkFsbFN0YWJsZSA9IChjYWxsYmFjaykgPT4ge1xuICAgICAgdmFyIHRlc3RhYmlsaXRpZXMgPSBnbG9iYWwuZ2V0QWxsQW5ndWxhclRlc3RhYmlsaXRpZXMoKTtcbiAgICAgIHZhciBjb3VudCA9IHRlc3RhYmlsaXRpZXMubGVuZ3RoO1xuICAgICAgdmFyIGRpZFdvcmsgPSBmYWxzZTtcbiAgICAgIHZhciBkZWNyZW1lbnQgPSBmdW5jdGlvbihkaWRXb3JrXykge1xuICAgICAgICBkaWRXb3JrID0gZGlkV29yayB8fCBkaWRXb3JrXztcbiAgICAgICAgY291bnQtLTtcbiAgICAgICAgaWYgKGNvdW50ID09IDApIHtcbiAgICAgICAgICBjYWxsYmFjayhkaWRXb3JrKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHRlc3RhYmlsaXRpZXMuZm9yRWFjaChmdW5jdGlvbih0ZXN0YWJpbGl0eSkgeyB0ZXN0YWJpbGl0eS53aGVuU3RhYmxlKGRlY3JlbWVudCk7IH0pO1xuICAgIH07XG5cbiAgICBpZiAoIWdsb2JhbC5mcmFtZXdvcmtTdGFiaWxpemVycykge1xuICAgICAgZ2xvYmFsLmZyYW1ld29ya1N0YWJpbGl6ZXJzID0gTGlzdFdyYXBwZXIuY3JlYXRlR3Jvd2FibGVTaXplKDApO1xuICAgIH1cbiAgICBnbG9iYWwuZnJhbWV3b3JrU3RhYmlsaXplcnMucHVzaCh3aGVuQWxsU3RhYmxlKTtcbiAgfVxuXG4gIGZpbmRUZXN0YWJpbGl0eUluVHJlZShyZWdpc3RyeTogVGVzdGFiaWxpdHlSZWdpc3RyeSwgZWxlbTogYW55LFxuICAgICAgICAgICAgICAgICAgICAgICAgZmluZEluQW5jZXN0b3JzOiBib29sZWFuKTogVGVzdGFiaWxpdHkge1xuICAgIGlmIChlbGVtID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB2YXIgdCA9IHJlZ2lzdHJ5LmdldFRlc3RhYmlsaXR5KGVsZW0pO1xuICAgIGlmIChpc1ByZXNlbnQodCkpIHtcbiAgICAgIHJldHVybiB0O1xuICAgIH0gZWxzZSBpZiAoIWZpbmRJbkFuY2VzdG9ycykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmIChET00uaXNTaGFkb3dSb290KGVsZW0pKSB7XG4gICAgICByZXR1cm4gdGhpcy5maW5kVGVzdGFiaWxpdHlJblRyZWUocmVnaXN0cnksIERPTS5nZXRIb3N0KGVsZW0pLCB0cnVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZmluZFRlc3RhYmlsaXR5SW5UcmVlKHJlZ2lzdHJ5LCBET00ucGFyZW50RWxlbWVudChlbGVtKSwgdHJ1ZSk7XG4gIH1cbn1cbiJdfQ==