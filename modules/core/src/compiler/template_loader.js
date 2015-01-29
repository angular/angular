import {Promise, PromiseWrapper} from 'facade/async';
import {isBlank, isPresent, BaseException} from 'facade/lang';
import {StyleElement, TemplateElement, DOM} from 'facade/dom';
import {List, ListWrapper} from 'facade/collection';
import {TemplateConfig} from 'core/annotations/template_config';
import {Component} from 'core/annotations/annotations';
import {DirectiveMetadata} from './directive_metadata';
import {ShadowDomEmulated, ShadowDomNative} from './shadow_dom';

/**
 * Strategy to load component templates.
 */
export class TemplateLoader {
  // Returns a template element
  loadTemplate(cmpMetadata: DirectiveMetadata):Promise<TemplateElement> {
    var annotation:Component = cmpMetadata.annotation;
    var tplConfig:TemplateConfig = annotation.template;
    var tplPromise: Promise;

    if (isPresent(tplConfig.inline)) {
      var tplEl = DOM.createTemplate(tplConfig.inline);
      return PromiseWrapper.resolve(tplEl);
    }

    // todo(vicb) if (isPresent(template.url)) -> fetch template
    // TODO: read out the cache if templateRoot = null. Could contain:
    // - templateRoot string
    // - precompiled template
    // - ProtoView

    throw new BaseException(`No template configured for component ${cmpMetadata.type}`);
  }

  loadStyles(cmpMetadata: DirectiveMetadata):Promise<List> {
    var annotation:Component = cmpMetadata.annotation;
    var tplConfig:TemplateConfig = annotation.template;
    var cssUrls = tplConfig.cssUrls;

    if (isBlank(cssUrls)) {
      return PromiseWrapper.resolve([]);
    }

    // todo(vicb): fetch from http
    var styles = ListWrapper.create();
    for (var i = 0; i < cssUrls.length; i++) {
      var style = DOM.createStyleElement(cssUrls[i]);
      ListWrapper.push(styles, style);
    }

    return PromiseWrapper.resolve(styles);
  }
}
