import {
  isPresent,
  isBlank,
  BaseException,
  assertionsEnabled,
  RegExpWrapper,
  StringWrapper
} from 'angular2/src/facade/lang';
import {List, MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {Parser} from 'angular2/change_detection';

import {SelectorMatcher, CssSelector} from 'angular2/src/render/dom/compiler/selector';

import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

import {DirectiveMetadata} from '../../api';
import {dashCaseToCamelCase, camelCaseToDashCase, EVENT_TARGET_SEPARATOR} from '../util';
import {DirectiveBuilder} from '../view/proto_view_builder';

/**
 * Parses the directives on a single element. Assumes ViewSplitter has already created
 * <template> elements for template directives.
 */
export class DirectiveParser implements CompileStep {
  _selectorMatcher: SelectorMatcher = new SelectorMatcher();

  constructor(public _parser: Parser, public _directives: List<DirectiveMetadata>) {
    for (var i = 0; i < _directives.length; i++) {
      var directive = _directives[i];
      var selector = CssSelector.parse(directive.selector);
      this._ensureComponentOnlyHasElementSelector(selector, directive);
      this._selectorMatcher.addSelectables(selector, i);
    }
  }

  _ensureComponentOnlyHasElementSelector(selector, directive) {
    var isElementSelector = selector.length === 1 && selector[0].isElementSelector();
    if (!isElementSelector && directive.type === DirectiveMetadata.COMPONENT_TYPE) {
      throw new BaseException(
          `Component '${directive.id}' can only have an element selector, but had '${directive.selector}'`);
    }
  }

  process(parent: CompileElement, current: CompileElement, control: CompileControl) {
    var attrs = current.attrs();
    var classList = current.classList();

    var cssSelector = new CssSelector();
    var nodeName = DOM.nodeName(current.element);
    cssSelector.setElement(nodeName);
    for (var i = 0; i < classList.length; i++) {
      cssSelector.addClassName(classList[i]);
    }

    MapWrapper.forEach(attrs,
                       (attrValue, attrName) => { cssSelector.addAttribute(attrName, attrValue); });

    var componentDirective;
    var foundDirectiveIndices = [];
    var elementBinder = null;
    this._selectorMatcher.match(cssSelector, (selector, directiveIndex) => {
      elementBinder = current.bindElement();
      var directive = this._directives[directiveIndex];
      if (directive.type === DirectiveMetadata.COMPONENT_TYPE) {
        // components need to go first, so it is easier to locate them in the result.
        ListWrapper.insert(foundDirectiveIndices, 0, directiveIndex);
        if (isPresent(componentDirective)) {
          throw new BaseException(
              `Only one component directive is allowed per element - check ${current.elementDescription}`);
        }
        componentDirective = directive;
        elementBinder.setComponentId(directive.id);
      } else {
        ListWrapper.push(foundDirectiveIndices, directiveIndex);
      }
    });
    ListWrapper.forEach(foundDirectiveIndices, (directiveIndex) => {
      var dirMetadata = this._directives[directiveIndex];
      var directiveBinderBuilder = elementBinder.bindDirective(directiveIndex);
      current.compileChildren = current.compileChildren && dirMetadata.compileChildren;
      if (isPresent(dirMetadata.properties)) {
        ListWrapper.forEach(dirMetadata.properties, (bindConfig) => {
          this._bindDirectiveProperty(bindConfig, current, directiveBinderBuilder);
        });
      }
      if (isPresent(dirMetadata.hostListeners)) {
        MapWrapper.forEach(dirMetadata.hostListeners, (action, eventName) => {
          this._bindDirectiveEvent(eventName, action, current, directiveBinderBuilder);
        });
      }
      if (isPresent(dirMetadata.hostActions)) {
        MapWrapper.forEach(dirMetadata.hostActions, (action, actionName) => {
          this._bindHostAction(actionName, action, current, directiveBinderBuilder);
        });
      }
      if (isPresent(dirMetadata.hostProperties)) {
        MapWrapper.forEach(dirMetadata.hostProperties, (expression, hostPropertyName) => {
          this._bindHostProperty(hostPropertyName, expression, current, directiveBinderBuilder);
        });
      }
      if (isPresent(dirMetadata.hostAttributes)) {
        MapWrapper.forEach(dirMetadata.hostAttributes, (hostAttrValue, hostAttrName) => {
          this._addHostAttribute(hostAttrName, hostAttrValue, current);
        });
      }
      if (isPresent(dirMetadata.readAttributes)) {
        ListWrapper.forEach(dirMetadata.readAttributes,
                            (attrName) => { elementBinder.readAttribute(attrName); });
      }
    });
  }

  _bindDirectiveProperty(bindConfig: string, compileElement: CompileElement,
                         directiveBinderBuilder: DirectiveBuilder) {
    // Name of the property on the directive
    let dirProperty: string;
    // Name of the property on the element
    let elProp: string;
    let pipes: List<string>;
    let assignIndex: number = bindConfig.indexOf(':');

    if (assignIndex > -1) {
      // canonical syntax: `dirProp: elProp | pipe0 | ... | pipeN`
      dirProperty = StringWrapper.substring(bindConfig, 0, assignIndex).trim();
      pipes = this._splitBindConfig(StringWrapper.substring(bindConfig, assignIndex + 1));
      elProp = ListWrapper.removeAt(pipes, 0);
    } else {
      // shorthand syntax when the name of the property on the directive and on the element is the
      // same, ie `property`
      dirProperty = bindConfig;
      elProp = bindConfig;
      pipes = [];
    }

    var bindingAst =
        MapWrapper.get(compileElement.bindElement().propertyBindings, dashCaseToCamelCase(elProp));

    if (isBlank(bindingAst)) {
      var attributeValue = MapWrapper.get(compileElement.attrs(), camelCaseToDashCase(elProp));
      if (isPresent(attributeValue)) {
        bindingAst =
            this._parser.wrapLiteralPrimitive(attributeValue, compileElement.elementDescription);
      }
    }

    // Bindings are optional, so this binding only needs to be set up if an expression is given.
    if (isPresent(bindingAst)) {
      var fullExpAstWithBindPipes = this._parser.addPipes(bindingAst, pipes);
      directiveBinderBuilder.bindProperty(dirProperty, fullExpAstWithBindPipes);
    }
  }

  _bindDirectiveEvent(eventName, action, compileElement, directiveBinderBuilder) {
    var ast = this._parser.parseAction(action, compileElement.elementDescription);
    if (StringWrapper.contains(eventName, EVENT_TARGET_SEPARATOR)) {
      var parts = eventName.split(EVENT_TARGET_SEPARATOR);
      directiveBinderBuilder.bindEvent(parts[1], ast, parts[0]);
    } else {
      directiveBinderBuilder.bindEvent(eventName, ast);
    }
  }

  _bindHostAction(actionName, actionExpression, compileElement, directiveBinderBuilder) {
    var ast = this._parser.parseAction(actionExpression, compileElement.elementDescription);
    directiveBinderBuilder.bindHostAction(actionName, actionExpression, ast);
  }

  _bindHostProperty(hostPropertyName, expression, compileElement, directiveBinderBuilder) {
    var ast = this._parser.parseBinding(expression,
                                        `hostProperties of ${compileElement.elementDescription}`);
    directiveBinderBuilder.bindHostProperty(hostPropertyName, ast);
  }

  _addHostAttribute(attrName, attrValue, compileElement) {
    if (StringWrapper.equals(attrName, 'class')) {
      ListWrapper.forEach(attrValue.split(' '),
                          (className) => { DOM.addClass(compileElement.element, className); });
    } else if (!DOM.hasAttribute(compileElement.element, attrName)) {
      DOM.setAttribute(compileElement.element, attrName, attrValue);
    }
  }

  _splitBindConfig(bindConfig: string) {
    return ListWrapper.map(bindConfig.split('|'), (s) => s.trim());
  }
}
