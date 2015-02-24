import {isBlank, isPresent, BaseException, stringify} from 'angular2/src/facade/lang';
import {DOM, Element} from 'angular2/src/facade/dom';
import {Map, MapWrapper, StringMapWrapper, StringMap} from 'angular2/src/facade/collection';

import {XHR} from './xhr/xhr';

import {Template} from 'angular2/src/core/annotations/template';

import {UrlResolver} from './url_resolver';

/**
 * Strategy to load component templates.
 */
export class TemplateLoader {
  _xhr: XHR;
  _htmlCache: StringMap;
  _baseUrls: Map<Type, string>;
  _urlCache: Map<Type, string>;
  _urlResolver: UrlResolver;

  constructor(xhr: XHR, urlResolver: UrlResolver) {
    this._xhr = xhr;
    this._urlResolver = urlResolver;
    this._htmlCache = StringMapWrapper.create();
    this._baseUrls = MapWrapper.create();
    this._urlCache = MapWrapper.create();
  }

  // TODO(vicb): union type: return an Element or a Promise<Element>
  load(template: Template) {
    if (isPresent(template.inline)) {
      return DOM.createTemplate(template.inline);
    }

    if (isPresent(template.url)) {
      var url = this.getTemplateUrl(template);
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

  setBaseUrl(template: Template, baseUrl: string) {
    MapWrapper.set(this._baseUrls, template, baseUrl);
    MapWrapper.delete(this._urlCache, template);
  }

  getTemplateUrl(template: Template) {
    if (!MapWrapper.contains(this._urlCache, template)) {
      var baseUrl = MapWrapper.get(this._baseUrls, template);
      if (isBlank(baseUrl)) {
        throw new BaseException('The template base URL is not set');
      }
      var templateUrl;
      if (isPresent(template.url)) {
        templateUrl = this._urlResolver.resolve(baseUrl, template.url);
      } else {
        templateUrl = baseUrl;
      }
      MapWrapper.set(this._urlCache, template, templateUrl);
    }

    return MapWrapper.get(this._urlCache, template);
  }
}
