import {Injectable} from 'angular2/di';
import {isBlank, isPresent, BaseException, stringify} from 'angular2/src/facade/lang';
import {Map, MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {PromiseWrapper, Promise} from 'angular2/src/facade/async';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {XHR} from 'angular2/src/render/xhr';

import {ViewDefinition} from '../../api';
import {UrlResolver} from 'angular2/src/services/url_resolver';

/**
 * Strategy to load component templates.
 * TODO: Make public API once we are more confident in this approach.
 */
@Injectable()
export class TemplateLoader {
  _cache: Map<string, Promise<string>> = MapWrapper.create();

  constructor(private _xhr: XHR, urlResolver: UrlResolver) {}

  load(view: ViewDefinition): Promise</*element*/ any> {
    let html;
    let fetchedStyles;

    // Load the HTML
    if (isPresent(view.template)) {
      html = PromiseWrapper.resolve(view.template);
    } else if (isPresent(view.templateAbsUrl)) {
      html = this._loadText(view.templateAbsUrl);
    } else {
      throw new BaseException('View should have either the templateUrl or template property set');
    }

    // Load the styles
    if (isPresent(view.styleAbsUrls) && view.styleAbsUrls.length > 0) {
      fetchedStyles = ListWrapper.map(view.styleAbsUrls, url => this._loadText(url));
    } else {
      fetchedStyles = [];
    }

    // Inline the styles and return a template element
    return PromiseWrapper.all(ListWrapper.concat([html], fetchedStyles))
        .then((res: List<string>) => {
          let html = res[0];
          let fetchedStyles = ListWrapper.slice(res, 1);

          html = _createStyleTags(view.styles) + _createStyleTags(fetchedStyles) + html;

          return DOM.createTemplate(html);
        });
  }

  private _loadText(url: string): Promise<string> {
    var response = MapWrapper.get(this._cache, url);

    if (isBlank(response)) {
      // TODO(vicb): change error when TS gets fixed
      // https://github.com/angular/angular/issues/2280
      // throw new BaseException(`Failed to fetch url "${url}"`);
      response = PromiseWrapper.catchError(
          this._xhr.get(url),
          _ => PromiseWrapper.reject(new BaseException(`Failed to fetch url "${url}"`), null));

      MapWrapper.set(this._cache, url, response);
    }

    return response;
  }
}

function _createStyleTags(styles?: List<string>): string {
  return isBlank(styles) ?
             '' :
             ListWrapper.map(styles, css => `<style type='text/css'>${css}</style>`).join('');
}
