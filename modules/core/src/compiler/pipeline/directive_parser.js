import {isPresent, BaseException} from 'facade/lang';
import {List, MapWrapper} from 'facade/collection';
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
 * Parses the directives on a single element.
 *
 * Fills:
 * - CompileElement#decoratorDirectives
 * - CompileElement#templateDirecitve
 * - CompileElement#componentDirective.
 *
 * Reads:
 * - CompileElement#propertyBindings (to find directives contained
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
    // Allow to find directives even though the attribute is bound
    if (isPresent(current.propertyBindings)) {
      MapWrapper.forEach(current.propertyBindings, (expression, boundProp) => {
        cssSelector.addAttribute(boundProp, expression);
      });
    }
    this._selectorMatcher.match(cssSelector, (directive) => {
      if (isPresent(current.templateDirective) && (directive.annotation instanceof Template)) {
        throw new BaseException('Only one template directive per element is allowed!');
      }
      if (isPresent(current.componentDirective) && (directive.annotation instanceof Component)) {
        throw new BaseException('Only one component directive per element is allowed!');
      }
      current.addDirective(directive);
    });
  }
}
