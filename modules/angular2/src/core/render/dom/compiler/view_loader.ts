import {Injectable} from 'angular2/di';
import {
  isBlank,
  isPresent,
  BaseException,
  stringify,
  isPromise,
  StringWrapper
} from 'angular2/src/core/facade/lang';
import {Map, MapWrapper, ListWrapper} from 'angular2/src/core/facade/collection';
import {PromiseWrapper, Promise} from 'angular2/src/core/facade/async';
import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {ViewDefinition} from '../../api';

import {XHR} from 'angular2/src/core/render/xhr';

import {StyleInliner} from './style_inliner';
import {StyleUrlResolver} from './style_url_resolver';
import {wtfStartTimeRange, wtfEndTimeRange} from '../../../profile/profile';

export class TemplateAndStyles {
  constructor(public template: string, public styles: string[]) {}
}

/**
 * Strategy to load component views.
 * TODO: Make public API once we are more confident in this approach.
 */
@Injectable()
export class ViewLoader {
  _cache: Map<string, Promise<string>> = new Map();

  constructor(private _xhr: XHR, private _styleInliner: StyleInliner,
              private _styleUrlResolver: StyleUrlResolver) {}

  load(viewDef: ViewDefinition): Promise<TemplateAndStyles> {
    var r = wtfStartTimeRange('ViewLoader#load()', stringify(viewDef.componentId));
    let tplAndStyles: Array<Promise<TemplateAndStyles>| Promise<string>| string> =
        [this._loadHtml(viewDef.template, viewDef.templateAbsUrl, viewDef.componentId)];
    if (isPresent(viewDef.styles)) {
      viewDef.styles.forEach((cssText: string) => {
        let textOrPromise = this._resolveAndInlineCssText(cssText, viewDef.templateAbsUrl);
        tplAndStyles.push(textOrPromise);
      });
    }

    if (isPresent(viewDef.styleAbsUrls)) {
      viewDef.styleAbsUrls.forEach(url => {
        let promise = this._loadText(url).then(
            cssText => this._resolveAndInlineCssText(cssText, viewDef.templateAbsUrl));
        tplAndStyles.push(promise);
      });
    }

    // Inline the styles from the @View annotation
    return PromiseWrapper.all(tplAndStyles)
        .then((res: Array<TemplateAndStyles | string>) => {
          let loadedTplAndStyles = <TemplateAndStyles>res[0];
          let styles = <string[]>ListWrapper.slice(res, 1);

          var templateAndStyles = new TemplateAndStyles(loadedTplAndStyles.template,
                                                        loadedTplAndStyles.styles.concat(styles));
          wtfEndTimeRange(r);
          return templateAndStyles;
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
  private _loadHtml(template: string, templateAbsUrl: string,
                    componentId: string): Promise<TemplateAndStyles> {
    let html;

    // Load the HTML
    if (isPresent(template)) {
      html = PromiseWrapper.resolve(template);
    } else if (isPresent(templateAbsUrl)) {
      html = this._loadText(templateAbsUrl);
    } else {
      throw new BaseException(
          `View should have either the templateUrl or template property set but none was found for the '${componentId}' component`);
    }

    return html.then(html => {
      var tplEl = DOM.createTemplate(html);
      // Replace $baseUrl with the base url for the template
      if (isPresent(templateAbsUrl) && templateAbsUrl.indexOf("/") >= 0) {
        let baseUrl = templateAbsUrl.substring(0, templateAbsUrl.lastIndexOf("/"));
        this._substituteBaseUrl(DOM.content(tplEl), baseUrl);
      }
      let styleEls = DOM.querySelectorAll(DOM.content(tplEl), 'STYLE');
      let unresolvedStyles: string[] = [];
      for (let i = 0; i < styleEls.length; i++) {
        var styleEl = styleEls[i];
        unresolvedStyles.push(DOM.getText(styleEl));
        DOM.remove(styleEl);
      }

      let syncStyles: string[] = [];
      let asyncStyles: Promise<string>[] = [];

      // Inline the style tags from the html
      for (let i = 0; i < styleEls.length; i++) {
        let styleEl = styleEls[i];
        let resolvedStyled = this._resolveAndInlineCssText(DOM.getText(styleEl), templateAbsUrl);
        if (isPromise(resolvedStyled)) {
          asyncStyles.push(<Promise<string>>resolvedStyled);
        } else {
          syncStyles.push(<string>resolvedStyled);
        }
      }

      if (asyncStyles.length === 0) {
        return PromiseWrapper.resolve(new TemplateAndStyles(DOM.getInnerHTML(tplEl), syncStyles));
      } else {
        return PromiseWrapper.all(asyncStyles)
            .then(loadedStyles => new TemplateAndStyles(DOM.getInnerHTML(tplEl),
                                                        syncStyles.concat(<string[]>loadedStyles)));
      }
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

  private _resolveAndInlineCssText(cssText: string, baseUrl: string): string | Promise<string> {
    cssText = this._styleUrlResolver.resolveUrls(cssText, baseUrl);
    return this._styleInliner.inlineImports(cssText, baseUrl);
  }
}
