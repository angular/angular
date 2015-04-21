import {isPresent, isBlank, BaseException, assertionsEnabled, RegExpWrapper, StringWrapper} from 'angular2/src/facade/lang';
import {List, MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {Parser} from 'angular2/change_detection';

import {SelectorMatcher, CssSelector} from 'angular2/src/render/dom/compiler/selector';

import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

import {DirectiveMetadata} from '../../api';
import {dashCaseToCamelCase, camelCaseToDashCase, EVENT_TARGET_SEPARATOR} from '../util';

/**
 * Parses the directives on a single element. Assumes ViewSplitter has already created
 * <template> elements for template directives.
 */
export class DirectiveParser extends CompileStep {
  _selectorMatcher:SelectorMatcher;
  _directives:List<DirectiveMetadata>;
  _parser:Parser;

  constructor(parser: Parser, directives:List<DirectiveMetadata>) {
    super();
    this._parser = parser;
    this._selectorMatcher = new SelectorMatcher();
    this._directives = directives;
    for (var i=0; i<directives.length; i++) {
      var selector = CssSelector.parse(directives[i].selector);
      this._selectorMatcher.addSelectables(selector, i);
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

    var viewportDirective;
    var componentDirective;
    // Note: We assume that the ViewSplitter already did its work, i.e. template directive should
    // only be present on <template> elements!
    var isTemplateElement = DOM.isTemplateElement(current.element);

    this._selectorMatcher.match(cssSelector, (selector, directiveIndex) => {
      var elementBinder = current.bindElement();
      var directive = this._directives[directiveIndex];
      var directiveBinderBuilder = elementBinder.bindDirective(directiveIndex);
      current.compileChildren = current.compileChildren && directive.compileChildren;
      if (isPresent(directive.properties)) {
        MapWrapper.forEach(directive.properties, (bindConfig, dirProperty) => {
          this._bindDirectiveProperty(dirProperty, bindConfig, current, directiveBinderBuilder);
        });
      }
      if (isPresent(directive.hostListeners)) {
        MapWrapper.forEach(directive.hostListeners, (action, eventName) => {
          this._bindDirectiveEvent(eventName, action, current, directiveBinderBuilder);
        });
      }
      if (isPresent(directive.hostProperties)) {
        MapWrapper.forEach(directive.hostProperties, (hostPropertyName, directivePropertyName) => {
          this._bindHostProperty(hostPropertyName, directivePropertyName, current, directiveBinderBuilder);
        });
      }
      if (isPresent(directive.readAttributes)) {
        ListWrapper.forEach(directive.readAttributes, (attrName) => {
          elementBinder.readAttribute(attrName);
        });
      }
      if (directive.type === DirectiveMetadata.VIEWPORT_TYPE) {
        if (!isTemplateElement) {
          throw new BaseException(`Viewport directives need to be placed on <template> elements or elements ` +
            `with template attribute - check ${current.elementDescription}`);
        }
        if (isPresent(viewportDirective)) {
          throw new BaseException(`Only one viewport directive is allowed per element - check ${current.elementDescription}`);
        }
        viewportDirective = directive;
      } else {
        if (isTemplateElement) {
          throw new BaseException(`Only template directives are allowed on template elements - check ${current.elementDescription}`);
        }
        if (directive.type === DirectiveMetadata.COMPONENT_TYPE) {
          if (isPresent(componentDirective)) {
            throw new BaseException(`Only one component directive is allowed per element - check ${current.elementDescription}`);
          }
          componentDirective = directive;
          elementBinder.setComponentId(directive.id);
        }
      }
    });
  }

  _bindDirectiveProperty(dirProperty, bindConfig, compileElement, directiveBinderBuilder) {
    var pipes = this._splitBindConfig(bindConfig);
    var elProp = ListWrapper.removeAt(pipes, 0);

    var bindingAst = MapWrapper.get(
      compileElement.bindElement().propertyBindings,
      dashCaseToCamelCase(elProp)
    );

    if (isBlank(bindingAst)) {
      var attributeValue = MapWrapper.get(compileElement.attrs(), camelCaseToDashCase(elProp));
      if (isPresent(attributeValue)) {
        bindingAst = this._parser.wrapLiteralPrimitive(
          attributeValue,
          compileElement.elementDescription
        );
      }
    }

    // Bindings are optional, so this binding only needs to be set up if an expression is given.
    if (isPresent(bindingAst)) {
      var fullExpAstWithBindPipes = this._parser.addPipes(bindingAst, pipes);
      directiveBinderBuilder.bindProperty(
        dirProperty, fullExpAstWithBindPipes
      );
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

  _bindHostProperty(hostPropertyName, directivePropertyName, compileElement, directiveBinderBuilder) {
    var ast = this._parser.parseBinding(directivePropertyName,
      `hostProperties of ${compileElement.elementDescription}`);
    directiveBinderBuilder.bindHostProperty(hostPropertyName, ast);
  }

  _splitBindConfig(bindConfig:string) {
    return ListWrapper.map(bindConfig.split('|'), (s) => s.trim());
  }
}

