import { StringMapWrapper } from 'angular2/src/facade/collection';
import { isPresent, isFunction } from 'angular2/src/facade/lang';
import { DomAdapter } from 'angular2/src/platform/dom/dom_adapter';
import { XHRImpl } from 'angular2/src/platform/browser/xhr_impl';
/**
 * Provides DOM operations in any browser environment.
 */
export class GenericBrowserDomAdapter extends DomAdapter {
    constructor() {
        super();
        this._animationPrefix = null;
        this._transitionEnd = null;
        try {
            var element = this.createElement('div', this.defaultDoc());
            if (isPresent(this.getStyle(element, 'animationName'))) {
                this._animationPrefix = '';
            }
            else {
                var domPrefixes = ['Webkit', 'Moz', 'O', 'ms'];
                for (var i = 0; i < domPrefixes.length; i++) {
                    if (isPresent(this.getStyle(element, domPrefixes[i] + 'AnimationName'))) {
                        this._animationPrefix = '-' + domPrefixes[i].toLowerCase() + '-';
                        break;
                    }
                }
            }
            var transEndEventNames = {
                WebkitTransition: 'webkitTransitionEnd',
                MozTransition: 'transitionend',
                OTransition: 'oTransitionEnd otransitionend',
                transition: 'transitionend'
            };
            StringMapWrapper.forEach(transEndEventNames, (value, key) => {
                if (isPresent(this.getStyle(element, key))) {
                    this._transitionEnd = value;
                }
            });
        }
        catch (e) {
            this._animationPrefix = null;
            this._transitionEnd = null;
        }
    }
    getXHR() { return XHRImpl; }
    getDistributedNodes(el) { return el.getDistributedNodes(); }
    resolveAndSetHref(el, baseUrl, href) {
        el.href = href == null ? baseUrl : baseUrl + '/../' + href;
    }
    supportsDOMEvents() { return true; }
    supportsNativeShadowDOM() {
        return isFunction(this.defaultDoc().body.createShadowRoot);
    }
    getAnimationPrefix() {
        return isPresent(this._animationPrefix) ? this._animationPrefix : "";
    }
    getTransitionEnd() { return isPresent(this._transitionEnd) ? this._transitionEnd : ""; }
    supportsAnimation() {
        return isPresent(this._animationPrefix) && isPresent(this._transitionEnd);
    }
}
