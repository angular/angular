import {ListWrapper, StringMapWrapper} from 'angular2/src/core/facade/collection';
import {isPresent, isFunction, StringWrapper} from 'angular2/src/core/facade/lang';
import {DomAdapter} from './dom_adapter';

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
            this._animationPrefix = '-' + StringWrapper.toLowerCase(domPrefixes[i]) + '-';
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
  getDistributedNodes(el: HTMLElement): Node[] { return (<any>el).getDistributedNodes(); }
  resolveAndSetHref(el: HTMLAnchorElement, baseUrl: string, href: string) {
    el.href = href == null ? baseUrl : baseUrl + '/../' + href;
  }
  cssToRules(css: string): any[] {
    var style = this.createStyleElement(css);
    this.appendChild(this.defaultDoc().head, style);
    var rules = [];
    if (isPresent(style.sheet)) {
      // TODO(sorvell): Firefox throws when accessing the rules of a stylesheet
      // with an @import
      // https://bugzilla.mozilla.org/show_bug.cgi?id=625013
      try {
        var rawRules = (<any>style.sheet).cssRules;
        rules = ListWrapper.createFixedSize(rawRules.length);
        for (var i = 0; i < rawRules.length; i++) {
          rules[i] = rawRules[i];
        }
      } catch (e) {
        //
      }
    } else {
      // console.warn('sheet not found', style);
    }
    this.remove(style);
    return rules;
  }
  supportsDOMEvents(): boolean { return true; }
  supportsNativeShadowDOM(): boolean {
    return isFunction((<any>this.defaultDoc().body).createShadowRoot);
  }
  supportsUnprefixedCssAnimation(): boolean {
    return isPresent(this.defaultDoc().body.style) &&
           isPresent(this.defaultDoc().body.style.animationName);
  }
  getAnimationPrefix(): string {
    return isPresent(this._animationPrefix) ? this._animationPrefix : "";
  }
  getTransitionEnd(): string { return isPresent(this._transitionEnd) ? this._transitionEnd : ""; }
  supportsAnimation(): boolean {
    return isPresent(this._animationPrefix) && isPresent(this._transitionEnd);
  }
}
