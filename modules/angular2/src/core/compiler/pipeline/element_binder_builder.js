import {int, isPresent, isBlank} from 'angular2/src/facade/lang';
import {ListWrapper, List, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';

import {reflector} from 'angular2/src/reflection/reflection';

import {Parser, ProtoChangeDetector} from 'angular2/change_detection';

import {DirectiveMetadata} from '../directive_metadata';

import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';
import {dashCaseToCamelCase} from '../string_utils';
import {setterFactory} from '../property_setter_factory'

/**
 * Creates the ElementBinders and adds watches to the
 * ProtoChangeDetector.
 *
 * Fills:
 * - CompileElement#inheritedElementBinder
 *
 * Reads:
 * - (in parent) CompileElement#inheritedElementBinder
 * - CompileElement#hasBindings
 * - CompileElement#inheritedProtoView
 * - CompileElement#inheritedProtoElementInjector
 * - CompileElement#textNodeBindings
 * - CompileElement#propertyBindings
 * - CompileElement#eventBindings
 * - CompileElement#decoratorDirectives
 * - CompileElement#componentDirective
 * - CompileElement#viewportDirective
 *
 * Note: This actually only needs the CompileElements with the flags
 * `hasBindings` and `isViewRoot`,
 * and only needs the actual HTMLElement for the ones
 * with the flag `isViewRoot`.
 */
export class ElementBinderBuilder extends CompileStep {
  _parser:Parser;
  constructor(parser:Parser) {
    super();
    this._parser = parser;
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    var elementBinder = null;
    var parentElementBinder = null;
    var distanceToParentBinder = this._getDistanceToParentBinder(parent, current);
    if (isPresent(parent)) {
      parentElementBinder = parent.inheritedElementBinder;
    }
    if (current.hasBindings) {
      var protoView = current.inheritedProtoView;
      var protoInjectorWasBuilt = isBlank(parent) ? true :
          current.inheritedProtoElementInjector !== parent.inheritedProtoElementInjector;

      var currentProtoElementInjector = protoInjectorWasBuilt ?
          current.inheritedProtoElementInjector : null;

      elementBinder = protoView.bindElement(parentElementBinder, distanceToParentBinder,
          currentProtoElementInjector, current.componentDirective, current.viewportDirective);
      current.distanceToParentBinder = 0;

      if (isPresent(current.textNodeBindings)) {
        this._bindTextNodes(protoView, current);
      }
      if (isPresent(current.propertyBindings)) {
        this._bindElementProperties(protoView, current);
      }
      if (isPresent(current.eventBindings)) {
        this._bindEvents(protoView, current);
      }
      if (isPresent(current.contentTagSelector)) {
        elementBinder.contentTagSelector = current.contentTagSelector;
      }
      var directives = current.getAllDirectives();
      this._bindDirectiveProperties(directives, current);
      this._bindDirectiveEvents(directives, current);
    } else if (isPresent(parent)) {
      elementBinder = parentElementBinder;
      current.distanceToParentBinder = distanceToParentBinder;
    }
    current.inheritedElementBinder = elementBinder;
  }

  _getDistanceToParentBinder(parent, current) {
    return isPresent(parent) ? parent.distanceToParentBinder + 1 : 0;
  }

  _bindTextNodes(protoView, compileElement) {
    MapWrapper.forEach(compileElement.textNodeBindings, (expression, indexInParent) => {
      protoView.bindTextNode(indexInParent, expression);
    });
  }

  _bindElementProperties(protoView, compileElement) {
    MapWrapper.forEach(compileElement.propertyBindings, (expression, property) => {
      var setterFn = setterFactory(property);
      protoView.bindElementProperty(expression.ast, property, setterFn);
    });
  }

  _bindEvents(protoView, compileElement) {
    MapWrapper.forEach(compileElement.eventBindings, (expression, eventName) => {
      protoView.bindEvent(eventName,  expression);
    });
  }

  _bindDirectiveEvents(directives: List<DirectiveMetadata>, compileElement: CompileElement) {
    for (var directiveIndex = 0; directiveIndex < directives.length; directiveIndex++) {
      var directive = directives[directiveIndex];
      var annotation = directive.annotation;
      if (isBlank(annotation.events)) continue;
      var protoView = compileElement.inheritedProtoView;
      StringMapWrapper.forEach(annotation.events, (action, eventName) => {
        var expression = this._parser.parseAction(action, compileElement.elementDescription);
        protoView.bindEvent(eventName, expression, directiveIndex);
      });
    }
  }

  _bindDirectiveProperties(directives: List<DirectiveMetadata>,
                           compileElement: CompileElement) {
    var protoView = compileElement.inheritedProtoView;

    for (var directiveIndex = 0; directiveIndex < directives.length; directiveIndex++) {
      var directive = ListWrapper.get(directives, directiveIndex);
      var annotation = directive.annotation;
      if (isBlank(annotation.bind)) continue;
      StringMapWrapper.forEach(annotation.bind, (bindConfig, dirProp) => {
        var pipes = this._splitBindConfig(bindConfig);
        var elProp = ListWrapper.removeAt(pipes, 0);

        var bindingAst = isPresent(compileElement.propertyBindings) ?
          MapWrapper.get(compileElement.propertyBindings, dashCaseToCamelCase(elProp)) :
            null;

        if (isBlank(bindingAst)) {
          var attributeValue = MapWrapper.get(compileElement.attrs(), elProp);
          if (isPresent(attributeValue)) {
            bindingAst = this._parser.wrapLiteralPrimitive(attributeValue, compileElement.elementDescription);
          }
        }

        // Bindings are optional, so this binding only needs to be set up if an expression is given.
        if (isPresent(bindingAst)) {
          var fullExpAstWithBindPipes = this._parser.addPipes(bindingAst, pipes);
          protoView.bindDirectiveProperty(
            directiveIndex,
            fullExpAstWithBindPipes,
            dirProp,
            reflector.setter(dashCaseToCamelCase(dirProp))
          );
        }
      });
    }
  }

  _splitBindConfig(bindConfig:string) {
    return ListWrapper.map(bindConfig.split('|'), (s) => s.trim());
  }
}
