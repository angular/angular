import {isBlank, isPresent, BaseException, stringify} from 'angular2/src/facade/lang';
import {Map, MapWrapper, StringMapWrapper, StringMap} from 'angular2/src/facade/collection';
import {PromiseWrapper, Promise} from 'angular2/src/facade/async';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {XHR} from 'angular2/src/services/xhr';

import {Template} from '../../api';
import {UrlResolver} from 'angular2/src/services/url_resolver';

/**
 * Strategy to load component templates.
 * @publicModule angular2/angular2
 */
export class TemplateLoader {
  _xhr: XHR;
  _htmlCache: StringMap;

  constructor(xhr: XHR, urlResolver: UrlResolver) {
    this._xhr = xhr;
    this._htmlCache = StringMapWrapper.create();
  }

  load(template: Template):Promise {
    if (isPresent(template.inline)) {
      return PromiseWrapper.resolve(DOM.createTemplate(template.inline));
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

    throw new BaseException('Templates should have either their url or inline property set');
  }
}
