import {Injectable} from 'angular2/di';
import {isBlank, isPresent, BaseException, stringify} from 'angular2/src/facade/lang';
import {Map, MapWrapper, StringMapWrapper, StringMap} from 'angular2/src/facade/collection';
import {PromiseWrapper, Promise} from 'angular2/src/facade/async';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {XHR} from 'angular2/src/services/xhr';

import {ViewDefinition} from '../../api';
import {UrlResolver} from 'angular2/src/services/url_resolver';

/**
 * Strategy to load component templates.
 * TODO: Make public API once we are more confident in this approach.
 */
@Injectable()
export class TemplateLoader {
  _xhr: XHR;
  _htmlCache: StringMap;

  constructor(xhr: XHR, urlResolver: UrlResolver) {
    this._xhr = xhr;
    this._htmlCache = StringMapWrapper.create();
  }

  load(template: ViewDefinition):Promise {
    if (isPresent(template.template)) {
      return PromiseWrapper.resolve(DOM.createTemplate(template.template));
    }
    var url = template.absUrl;
    if (isPresent(url)) {
      var promise = StringMapWrapper.get(this._htmlCache, url);

      if (isBlank(promise)) {
        promise = this._xhr.get(url).then(function (html) {
          var template = DOM.createTemplate(html);
          return template;
        });
        StringMapWrapper.set(this._htmlCache, url, promise);
      }

      return promise;
    }

    throw new BaseException('View should have either the url or template property set');
  }
}
