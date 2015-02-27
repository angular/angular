import {isPresent, isBlank, BaseException, assertionsEnabled, RegExpWrapper} from 'angular2/src/facade/lang';
import {List, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {SelectorMatcher} from '../selector';
import {CssSelector} from '../selector';

import {DirectiveMetadata} from '../directive_metadata';
import {Component, Viewport} from '../../annotations/annotations';
import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

import {isSpecialProperty} from './element_binder_builder';;

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
      selector=CssSelector.parse(directiveMetadata.annotation.selector);
      this._selectorMatcher.addSelectable(selector, directiveMetadata);
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
    var matchedProperties; // StringMap - used in dev mode to store all properties that have been matched
    
    this._selectorMatcher.match(cssSelector, (selector, directive) => {
      matchedProperties = updateMatchedProperties(matchedProperties, selector, directive);
      checkDirectiveValidity(directive, current, isTemplateElement);
      current.addDirective(directive);
    });

    // raise error if some directives are missing
    checkMissingDirectives(current, matchedProperties, isTemplateElement);
  }
}

// calculate all the properties that are used or interpreted by all directives
// those properties correspond to the directive selectors and the directive bindings
function updateMatchedProperties(matchedProperties, selector, directive) {
  if (assertionsEnabled()) {
    var attrs = selector.attrs;
    if (!isPresent(matchedProperties)) {
      matchedProperties = StringMapWrapper.create();
    }
    if (isPresent(attrs)) {
      for (var idx = 0; idx<attrs.length; idx+=2) {
        // attribute name is stored on even indexes
        StringMapWrapper.set(matchedProperties, attrs[idx], true);
      }
    }
    // some properties can be used by the directive, so we need to register them
    if (isPresent(directive.annotation) && isPresent(directive.annotation.bind)) {
      var bindMap = directive.annotation.bind;
      StringMapWrapper.forEach(bindMap, (value, key) => {
        // value is the name of the property that is intepreted
        // e.g. 'myprop' or 'myprop | double' when a pipe is used to transform the property

        // keep the property name and remove the pipe
        var bindProp = RegExpWrapper.firstMatch(PROPERTY_BINDING_REGEXP, value);
        if (isPresent(bindProp) && isPresent(bindProp[1])) {
          StringMapWrapper.set(matchedProperties, bindProp[1], true);
        }
      });
    }
  }
  return matchedProperties;
}

// check if the directive is compatible with the current element
function checkDirectiveValidity(directive, current, isTemplateElement) {
  if (directive.annotation instanceof Viewport) {
    if (!isTemplateElement) {
      throw new BaseException(`Viewport directives need to be placed on <template> elements or elements ` +
         `with template attribute - check ${current.elementDescription}`);
    } else if (isPresent(current.viewportDirective)) {
      throw new BaseException(`Only one viewport directive can be used per element - check ${current.elementDescription}`);
    }
  } else if (isTemplateElement) {
    throw new BaseException(`Only template directives are allowed on template elements - check ${current.elementDescription}`);
  } else if ((directive.annotation instanceof Component) && isPresent(current.componentDirective)) {
    throw new BaseException(`Multiple component directives not allowed on the same element - check ${current.elementDescription}`);
  }
}

// validates that there is no missing directive - dev mode only
function checkMissingDirectives(current, matchedProperties, isTemplateElement) {
  if (assertionsEnabled()) {
    var ppBindings=current.propertyBindings;
    if (isPresent(ppBindings)) {
      // check that each property corresponds to a real property or has been matched by a directive
      MapWrapper.forEach(ppBindings, (expression, prop) => {
        if (!DOM.hasProperty(current.element, prop) && !isSpecialProperty(prop)) {
          if (!isPresent(matchedProperties) || !isPresent(StringMapWrapper.get(matchedProperties, prop))) {
            throw new BaseException(`Missing directive to handle '${prop}' in ${current.elementDescription}`);
          } 
        }
      });
    }
    // template only store directives as attribute when they are not bound to expressions
    // so we have to validate the expression case too (e.g. !if="condition")
    if (isTemplateElement && !current.isViewRoot && !isPresent(current.viewportDirective)) {
      throw new BaseException(`Missing directive to handle: ${current.elementDescription}`);
    }
  }
}
