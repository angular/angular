import {Injectable} from 'angular2/di';
import {
  isBlank,
  isPresent,
  BaseException,
  stringify,
  isPromise,
  StringWrapper
} from 'angular2/src/facade/lang';
import {Map, MapWrapper, ListWrapper, List} from 'angular2/src/facade/collection';
import {PromiseWrapper, Promise} from 'angular2/src/facade/async';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {XHR} from 'angular2/src/render/xhr';

import {ViewDefinition} from '../../api';

import {StyleInliner} from './style_inliner';
import {StyleUrlResolver} from './style_url_resolver';

/**
 * Strategy to load component views.
 * TODO: Make public API once we are more confident in this approach.
 */
@Injectable()
export class ViewLoader {
  _cache: Map<string, Promise<string>> = new Map();

  constructor(private _xhr: XHR, private _styleInliner: StyleInliner,
              private _styleUrlResolver: StyleUrlResolver) {}

  load(view: ViewDefinition): Promise</*element*/ any> {
    let tplElAndStyles: List<string | Promise<string>> = [this._loadHtml(view)];

    if (isPresent(view.styles)) {
      view.styles.forEach((cssText: string) => {
        let textOrPromise = this._resolveAndInlineCssText(cssText, view.templateAbsUrl);
        tplElAndStyles.push(textOrPromise);
      });
    }

    if (isPresent(view.styleAbsUrls)) {
      view.styleAbsUrls.forEach(url => {
        let promise = this._loadText(url).then(
            cssText => this._resolveAndInlineCssText(cssText, view.templateAbsUrl));
        tplElAndStyles.push(promise);
      });
    }

    // Inline the styles from the @View annotation and return a template element
    return PromiseWrapper.all(tplElAndStyles)
        .then((res: List<string>) => {
          let tplEl = res[0];
          let cssTexts = ListWrapper.slice(res, 1);

          _insertCssTexts(DOM.content(tplEl), cssTexts);

          return tplEl;
        });
  }

  private _loadText(url: string): Promise<string> {
    var response = this._cache.get(url);

    if (isBlank(response)) {
      // TODO(vicb): change error when TS gets fixed
      // https://github.com/angular/angular/issues/2280
      // throw new BaseException(`Failed to fetch url "${url}"`);
      response = PromiseWrapper.catchError(
          this._xhr.get(url),
          _ => PromiseWrapper.reject(new BaseException(`Failed to fetch url "${url}"`), null));

      this._cache.set(url, response);
    }

    return response;
  }

  // Load the html and inline any style tags
  private _loadHtml(view: ViewDefinition): Promise<any /* element */> {
    let html;

    // Load the HTML
    if (isPresent(view.template)) {
      html = PromiseWrapper.resolve(view.template);
    } else if (isPresent(view.templateAbsUrl)) {
      html = this._loadText(view.templateAbsUrl);
    } else {
      throw new BaseException('View should have either the templateUrl or template property set');
    }

    return html.then(html => {
      var tplEl = DOM.createTemplate(html);

      // Replace $baseUrl with the base url for the template
      let templateAbsUrl = view.templateAbsUrl;
      if (isPresent(templateAbsUrl) && templateAbsUrl.indexOf("/") >= 0) {
        let baseUrl = templateAbsUrl.substring(0, templateAbsUrl.lastIndexOf("/"));
        this._substituteBaseUrl(DOM.content(tplEl), baseUrl);
      }

      // Inline the style tags from the html
      let styleEls = DOM.querySelectorAll(DOM.content(tplEl), 'STYLE');

      let promises: List<Promise<string>> = [];
      for (let i = 0; i < styleEls.length; i++) {
        let promise = this._resolveAndInlineElement(styleEls[i], view.templateAbsUrl);
        if (isPromise(promise)) {
          promises.push(promise);
        }
      }

      return promises.length > 0 ? PromiseWrapper.all(promises).then(_ => tplEl) : tplEl;
    });
  }

  /**
   * Replace all occurrences of $baseUrl in the attributes of an element and its
   * children with the base URL of the template.
   *
   * @param element The element to process
   * @param baseUrl The base URL of the template.
   * @private
   */
  private _substituteBaseUrl(element, baseUrl: string): void {
    if (DOM.isElementNode(element)) {
      var attrs = DOM.attributeMap(element);
      MapWrapper.forEach(attrs, (v, k) => {
        if (isPresent(v) && v.indexOf('$baseUrl') >= 0) {
          DOM.setAttribute(element, k, StringWrapper.replaceAll(v, /\$baseUrl/g, baseUrl));
        }
      });
    }
    let children = DOM.childNodes(element);
    for (let i = 0; i < children.length; i++) {
      if (DOM.isElementNode(children[i])) {
        this._substituteBaseUrl(children[i], baseUrl);
      }
    }
  }

  /**
   * Inlines a style element.
   *
   * @param styleEl The style element
   * @param baseUrl The base url
   * @returns {Promise<any>} null when no @import rule exist in the css or a Promise
   * @private
   */
  private _resolveAndInlineElement(styleEl, baseUrl: string): Promise<any> {
    let textOrPromise = this._resolveAndInlineCssText(DOM.getText(styleEl), baseUrl);

    if (isPromise(textOrPromise)) {
      return (<Promise<string>>textOrPromise).then(css => { DOM.setText(styleEl, css); });
    } else {
      DOM.setText(styleEl, <string>textOrPromise);
      return null;
    }
  }

  private _resolveAndInlineCssText(cssText: string, baseUrl: string): string | Promise<string> {
    cssText = this._styleUrlResolver.resolveUrls(cssText, baseUrl);
    return this._styleInliner.inlineImports(cssText, baseUrl);
  }
}

function _insertCssTexts(element, cssTexts: List<string>): void {
  if (cssTexts.length == 0) return;

  let insertBefore = DOM.firstChild(element);

  for (let i = cssTexts.length - 1; i >= 0; i--) {
    let styleEl = DOM.createStyleElement(cssTexts[i]);
    if (isPresent(insertBefore)) {
      DOM.insertBefore(insertBefore, styleEl);
    } else {
      DOM.appendChild(element, styleEl);
    }
    insertBefore = styleEl;
  }
}
