import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {isBlank, isPresent, BaseException, stringify} from 'angular2/src/facade/lang';
import {TemplateElement, DOM, Element} from 'angular2/src/facade/dom';
import {StringMapWrapper} from 'angular2/src/facade/collection';

import {TemplateConfig} from 'angular2/src/core/annotations/template_config';
import {Component} from 'angular2/src/core/annotations/annotations';

import {DirectiveMetadata} from 'angular2/src/core/compiler/directive_metadata';

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

  // TODO(vicb): union type: return an Element or a Promise<Element>
  load(cmpMetadata: DirectiveMetadata) {
    var annotation:Component = cmpMetadata.annotation;
    var tplConfig:TemplateConfig = annotation.template;

    if (isPresent(tplConfig.inline)) {
      return DOM.createTemplate(tplConfig.inline);
    }

    if (isPresent(tplConfig.url) && isPresent(tplConfig.cssUrl)) {
      return Promise.all([
        this.buildUrl(tplConfig.url),
        this.buildUrl(tplConfig.cssUrl)
      ])
      .then((props) => {
        // if I had .spread this would be one line
        var html = props[0];
        var style = props[1];
        return this.createTemplateWithCss(html, style);
      });
    }

    if (isPresent(tplConfig.url)) {
      return this.buildUrl(tplConfig.url).then(DOM.createTemplate);
    }

    if (isPresent(tplConfig.cssUrl)) {
      return this.buildUrl(tplConfig.cssUrl).then(DOM.createStyleElement);
    }

    throw new BaseException(`No template configured for component ${stringify(cmpMetadata.type)}`);
  }
  buildUrl(url):Promise {
    var promise = StringMapWrapper.get(this._cache, url);

    if (isBlank(promise)) {
      promise = this._xhr.get(url)
      StringMapWrapper.set(this._cache, url, promise);
    }

    return promise;
  }
  createTemplateWithCss(html, css) {
    var style = DOM.createStyleElement(css);

    var d = DOM.createElement('div');
    DOM.setInnerHTML(d, html);
    DOM.insertBefore(d.firstChild, style);

    return DOM.createTemplate(d.innerHTML);
  }

}
