import {isPresent, isBlank, BaseException, assertionsEnabled, RegExpWrapper} from 'angular2/src/facade/lang';
import {List, MapWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {SelectorMatcher, CssSelector} from 'angular2/src/render/dom/compiler/selector';

import {DirectiveMetadata} from '../directive_metadata';
import {DynamicComponent, Component, Viewport} from '../../annotations/annotations';
import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

var PROPERTY_BINDING_REGEXP = RegExpWrapper.create('^ *([^\\s\\|]+)');

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
    var selector;

    this._selectorMatcher = new SelectorMatcher();
    for (var i=0; i<directives.length; i++) {
      var directiveMetadata = directives[i];
      selector = CssSelector.parse(directiveMetadata.annotation.selector);
      this._selectorMatcher.addSelectables(selector, directiveMetadata);
    }
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    var attrs = current.attrs();
    var classList = current.classList();

    var cssSelector = new CssSelector();
    var nodeName = DOM.nodeName(current.element);
    cssSelector.setElement(nodeName);
    for (var i=0; i < classList.length; i++) {
      cssSelector.addClassName(classList[i]);
    }

    MapWrapper.forEach(attrs, (attrValue, attrName) => {
      cssSelector.addAttribute(attrName, attrValue);
    });

    // Note: We assume that the ViewSplitter already did its work, i.e. template directive should
    // only be present on <template> elements!
    var isTemplateElement = DOM.isTemplateElement(current.element);

    this._selectorMatcher.match(cssSelector, (selector, directive) => {
      current.addDirective(checkDirectiveValidity(directive, current, isTemplateElement));
    });
  }
}

// check if the directive is compatible with the current element
function checkDirectiveValidity(directive, current, isTemplateElement) {
  var isComponent = directive.annotation instanceof Component || directive.annotation instanceof DynamicComponent;
  var alreadyHasComponent = isPresent(current.componentDirective);

  if (directive.annotation instanceof Viewport) {
    if (!isTemplateElement) {
      throw new BaseException(`Viewport directives need to be placed on <template> elements or elements ` +
         `with template attribute - check ${current.elementDescription}`);
    } else if (isPresent(current.viewportDirective)) {
      throw new BaseException(`Only one viewport directive can be used per element - check ${current.elementDescription}`);
    }
  } else if (isTemplateElement) {
    throw new BaseException(`Only template directives are allowed on template elements - check ${current.elementDescription}`);

  } else if (isComponent && alreadyHasComponent) {
    throw new BaseException(`Multiple component directives not allowed on the same element - check ${current.elementDescription}`);
  }

  return directive;
}
