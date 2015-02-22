import {isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';
import {List, MapWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/facade/dom';
import {SelectorMatcher} from '../selector';
import {CssSelector} from '../selector';

import {DirectiveMetadata} from '../directive_metadata';
import {Component, Viewport} from '../../annotations/annotations';
import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

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
 *   in the variable bindings)
 */
export class DirectiveParser extends CompileStep {
  _selectorMatcher:SelectorMatcher;
  constructor(directives:List<DirectiveMetadata>) {
    super();
    this._selectorMatcher = new SelectorMatcher();
    for (var i=0; i<directives.length; i++) {
      var directiveMetadata = directives[i];
      this._selectorMatcher.addSelectable(
        CssSelector.parse(directiveMetadata.annotation.selector),
        directiveMetadata
      );
    }
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    var attrs = current.attrs();
    var classList = current.classList();

    var cssSelector = new CssSelector();
    cssSelector.setElement(DOM.nodeName(current.element));
    for (var i=0; i < classList.length; i++) {
      cssSelector.addClassName(classList[i]);
    }
    MapWrapper.forEach(attrs, (attrValue, attrName) => {
      if (isBlank(current.propertyBindings) ||
        isPresent(current.propertyBindings) && !MapWrapper.contains(current.propertyBindings, attrName)) {
        cssSelector.addAttribute(attrName, attrValue);
      }
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
    var isTemplateElement = DOM.isTemplateElement(current.element);
    this._selectorMatcher.match(cssSelector, (directive) => {
      if (directive.annotation instanceof Viewport) {
        if (!isTemplateElement) {
          throw new BaseException('Viewport directives need to be placed on <template> elements or elements with template attribute!');
        } else if (isPresent(current.viewportDirective)) {
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
