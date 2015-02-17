import {isBlank, isPresent, BaseException, stringify} from 'angular2/src/facade/lang';
import {DOM, Element} from 'angular2/src/facade/dom';
import {StringMapWrapper} from 'angular2/src/facade/collection';

import {XHR} from './xhr/xhr';

import {Template} from 'angular2/src/core/annotations/template';

/**
 * Strategy to load component templates.
 */
export class TemplateLoader {
  _xhr: XHR;
  _cache;

  constructor(xhr: XHR) {
    this._xhr = xhr;
    this._cache = StringMapWrapper.create();
  }

  // TODO(vicb): union type: return an Element or a Promise<Element>
  load(template: Template) {
    if (isPresent(template.inline)) {
      return DOM.createTemplate(template.inline);
    }

    if (isPresent(template.url)) {
      var url = template.url;
      var promise = StringMapWrapper.get(this._cache, url);

      if (isBlank(promise)) {
        promise = this._xhr.get(url).then(function (html) {
          var template = DOM.createTemplate(html);
          return template;
        });
        StringMapWrapper.set(this._cache, url, promise);
      }

      return promise;
    }

    throw new BaseException(`Templates should have either their url or inline property set`);
  }
}
