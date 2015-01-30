import {Promise, PromiseWrapper} from 'facade/src/async';
import {isBlank, isPresent, BaseException} from 'facade/src/lang';
import {TemplateElement, DOM} from 'facade/src/dom';

import {TemplateConfig} from 'core/src/annotations/template_config';
import {Component} from 'core/src/annotations/annotations';

import {DirectiveMetadata} from './directive_metadata';

/**
 * Strategy to load component templates.
 */
export class TemplateLoader {
  // todo(vicb): was Promise<Document>
  load(cmpMetadata: DirectiveMetadata):Promise<TemplateElement> {
    var annotation:Component = cmpMetadata.annotation;
    var tplConfig:TemplateConfig = annotation.template;

    if (isPresent(tplConfig.inline)) {
      var template = DOM.createTemplate(tplConfig.inline);
      return PromiseWrapper.resolve(template);
    }

    // todo(vicb) load cmp via html import

    throw new BaseException(`No template configured for component ${cmpMetadata.type}`);

  }
}
