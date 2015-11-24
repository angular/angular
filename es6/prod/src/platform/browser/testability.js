import { global, isPresent } from 'angular2/src/facade/lang';
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
import { setTestabilityGetter } from 'angular2/core';
class PublicTestability {
    constructor(testability) {
        this._testability = testability;
    }
    isStable() { return this._testability.isStable(); }
    whenStable(callback) { this._testability.whenStable(callback); }
    findBindings(using, provider, exactMatch) {
        return this.findProviders(using, provider, exactMatch);
    }
    findProviders(using, provider, exactMatch) {
        return this._testability.findBindings(using, provider, exactMatch);
    }
}
export class BrowserGetTestability {
    static init() { setTestabilityGetter(new BrowserGetTestability()); }
    addToWindow(registry) {
        global.getAngularTestability = (elem, findInAncestors = true) => {
            var testability = registry.findTestabilityInTree(elem, findInAncestors);
            if (testability == null) {
                throw new Error('Could not find testability for element.');
            }
            return new PublicTestability(testability);
        };
        global.getAllAngularTestabilities = () => {
            var testabilities = registry.getAllTestabilities();
            return testabilities.map((testability) => { return new PublicTestability(testability); });
        };
    }
    findTestabilityInTree(registry, elem, findInAncestors) {
        if (elem == null) {
            return null;
        }
        var t = registry.getTestability(elem);
        if (isPresent(t)) {
            return t;
        }
        else if (!findInAncestors) {
            return null;
        }
        if (DOM.isShadowRoot(elem)) {
            return this.findTestabilityInTree(registry, DOM.getHost(elem), true);
        }
        return this.findTestabilityInTree(registry, DOM.parentElement(elem), true);
    }
}
