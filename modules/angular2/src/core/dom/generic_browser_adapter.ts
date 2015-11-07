import {ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {isPresent, isFunction, Type} from 'angular2/src/facade/lang';
import {DomAdapter} from './dom_adapter';
import {XHRImpl} from 'angular2/src/compiler/xhr_impl';


/**
 * Provides DOM operations in any browser environment.
 */
export abstract class GenericBrowserDomAdapter extends DomAdapter {
  private _animationPrefix: string = null;
  private _transitionEnd: string = null;
  constructor() {
    super();
    try {
      var element = this.createElement('div', this.defaultDoc());
      if (isPresent(this.getStyle(element, 'animationName'))) {
        this._animationPrefix = '';
      } else {
        var domPrefixes = ['Webkit', 'Moz', 'O', 'ms'];
        for (var i = 0; i < domPrefixes.length; i++) {
          if (isPresent(this.getStyle(element, domPrefixes[i] + 'AnimationName'))) {
            this._animationPrefix = '-' + domPrefixes[i].toLowerCase() + '-';
            break;
          }
        }
      }
      var transEndEventNames: {[key: string]: string} = {
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
    } catch (e) {
      this._animationPrefix = null;
      this._transitionEnd = null;
    }
  }

  getXHR(): Type { return XHRImpl; }
  getDistributedNodes(el: HTMLElement): Node[] { return (<any>el).getDistributedNodes(); }
  resolveAndSetHref(el: HTMLAnchorElement, baseUrl: string, href: string) {
    el.href = href == null ? baseUrl : baseUrl + '/../' + href;
  }
  supportsDOMEvents(): boolean { return true; }
  supportsNativeShadowDOM(): boolean {
    return isFunction((<any>this.defaultDoc().body).createShadowRoot);
  }
  getAnimationPrefix(): string {
    return isPresent(this._animationPrefix) ? this._animationPrefix : "";
  }
  getTransitionEnd(): string { return isPresent(this._transitionEnd) ? this._transitionEnd : ""; }
  supportsAnimation(): boolean {
    return isPresent(this._animationPrefix) && isPresent(this._transitionEnd);
  }
}
