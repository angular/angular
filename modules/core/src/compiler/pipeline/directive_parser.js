import {isPresent, BaseException} from 'facade/lang';
import {List, MapWrapper} from 'facade/collection';
import {TemplateElement} from 'facade/dom';
import {SelectorMatcher} from '../selector';
import {CssSelector} from '../selector';

import {AnnotatedType} from '../annotated_type';
import {Template} from '../../annotations/template';
import {Component} from '../../annotations/component';
import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';
import {Reflector} from '../reflector';

/**
 * Parses the directives on a single element. Assumes ViewSplitter has already created
 * <template> elements for template directives.
 *
 * Fills:
 * - CompileElement#decoratorDirectives
 * - CompileElement#templateDirecitve
 * - CompileElement#componentDirective.
 *
 * Reads:
 * - CompileElement#propertyBindings (to find directives contained
 *   in the property bindings)
 * - CompileElement#variableBindings (to find directives contained
 *   in the property bindings)
 */
export class DirectiveParser extends CompileStep {
  constructor(directives:List<AnnotatedType>) {
    this._selectorMatcher = new SelectorMatcher();
    for (var i=0; i<directives.length; i++) {
      var annotatedType = directives[i];
      this._selectorMatcher.addSelectable(
        CssSelector.parse(annotatedType.annotation.selector),
        annotatedType
      );
    }
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    var attrs = current.attrs();
    var classList = current.classList();

    var cssSelector = new CssSelector();
    cssSelector.setElement(current.element.nodeName);
    for (var i=0; i < classList.length; i++) {
      cssSelector.addClassName(classList[i]);
    }
    MapWrapper.forEach(attrs, (attrValue, attrName) => {
      cssSelector.addAttribute(attrName, attrValue);
    });
    if (isPresent(current.propertyBindings)) {
      MapWrapper.forEach(current.propertyBindings, (expression, prop) => {
        cssSelector.addAttribute(prop, expression.source);
      });
    }
    if (isPresent(current.variableBindings)) {
      MapWrapper.forEach(current.variableBindings, (value, name) => {
        cssSelector.addAttribute(name, value);
      });
    }
    // Note: We assume that the ViewSplitter already did its work, i.e. template directive should
    // only be present on <template> elements any more!
    var isTemplateElement = current.element instanceof TemplateElement;
    this._selectorMatcher.match(cssSelector, (directive) => {
      if (directive.annotation instanceof Template) {
        if (!isTemplateElement) {
          throw new BaseException('Template directives need to be placed on <template> elements or elements with template attribute!');
        } else if (isPresent(current.templateDirective)) {
          throw new BaseException('Only one template directive per element is allowed!');
        }
      } else if (isTemplateElement) {
        throw new BaseException('Only template directives are allowed on <template> elements!');
      } else if ((directive.annotation instanceof Component) && isPresent(current.componentDirective)) {
        throw new BaseException('Only one component directive per element is allowed!');
      }
      current.addDirective(directive);
    });
  }
}
