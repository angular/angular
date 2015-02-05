import {Promise, PromiseWrapper} from 'facade/src/async';
import {isBlank, isPresent, BaseException, stringify} from 'facade/src/lang';
import {TemplateElement, DOM} from 'facade/src/dom';
import {StringMapWrapper} from 'facade/src/collection';

import {TemplateConfig} from 'core/src/annotations/template_config';
import {Component} from 'core/src/annotations/annotations';

import {DirectiveMetadata} from './directive_metadata';
import {XHR} from './xhr/xhr';

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

  load(cmpMetadata: DirectiveMetadata):Promise<Element> {
    var annotation:Component = cmpMetadata.annotation;
    var tplConfig:TemplateConfig = annotation.template;

    if (isPresent(tplConfig.inline)) {
      var template = DOM.createTemplate(tplConfig.inline);
      return PromiseWrapper.resolve(template);
    }

    if (isPresent(tplConfig.url)) {
      var url = tplConfig.url;
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

    throw new BaseException(`No template configured for component ${stringify(cmpMetadata.type)}`);
  }
}
